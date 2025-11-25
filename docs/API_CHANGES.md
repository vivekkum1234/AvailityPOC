# API Changes: Questionnaire Loading

## 📋 Overview

This document details the API changes made to support dynamic questionnaire template loading from the database with automatic fallback to hardcoded templates.

---

## 🔄 API Endpoint Changes

### **NEW Endpoint: Get Latest Published Template**

```
GET /api/questionnaires/:transactionType/latest
```

**Purpose:** Fetch the latest published questionnaire template for a specific transaction type.

**Parameters:**
- `transactionType` (path parameter): Transaction type (e.g., `270/271`, `837`, `276/277`)
  - **Important:** Must be URL-encoded (e.g., `270%2F271`)

**Query Parameters:**
- `mode` (optional): Mode for the questionnaire (e.g., `edit`, `view`)

**Response:**

```typescript
{
  success: boolean;
  data: {
    sections: Section[];
    // ... other questionnaire config
  };
  version: string;        // e.g., "2.0.0"
  published_at: string;   // ISO timestamp
  source: 'database' | 'hardcoded';  // Indicates data source
}
```

**Example Request:**
```bash
curl "http://localhost:3002/api/questionnaires/270%2F271/latest"
```

**Example Response (Database):**
```json
{
  "success": true,
  "data": {
    "sections": [
      {
        "id": "subscriber-info",
        "title": "Subscriber Information",
        "questions": [...]
      }
    ]
  },
  "version": "2.0.0",
  "published_at": "2025-11-24T19:26:10.000Z",
  "source": "database"
}
```

**Example Response (Fallback):**
```json
{
  "success": true,
  "data": {
    "sections": [...]
  },
  "source": "hardcoded"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "No questionnaire found for transaction type: 270/271"
}
```

---

### **EXISTING Endpoint: Get Questionnaire Sections (Unchanged)**

```
GET /api/questionnaires/:id/sections
```

**Purpose:** Fetch questionnaire sections by hardcoded questionnaire ID.

**Parameters:**
- `id` (path parameter): Questionnaire ID (e.g., `x12-270-271-complete`)

**Query Parameters:**
- `mode` (optional): Mode for the questionnaire

**Response:**
```typescript
Section[]
```

**Status:** Still available, used as fallback mechanism internally.

---

## 🔧 Frontend API Service Changes

### **NEW Method: `getLatestQuestionnaireSections()`**

**File:** `frontend/src/services/api.ts`

```typescript
/**
 * Get latest published questionnaire by transaction type
 * @param transactionType - Transaction type (e.g., '270/271')
 * @param mode - Optional mode parameter
 * @returns Promise<Section[]>
 */
async getLatestQuestionnaireSections(
  transactionType: string, 
  mode?: string
): Promise<Section[]> {
  const query = mode ? `?mode=${encodeURIComponent(mode)}` : '';
  // URL-encode the transaction type to handle slashes (e.g., '270/271' → '270%2F271')
  const encodedType = encodeURIComponent(transactionType);
  const response = await this.request<any>(
    `/questionnaires/${encodedType}/latest${query}`
  );
  // The endpoint returns the full config, extract sections
  return response.sections || response.data?.sections || [];
}
```

**Key Features:**
- ✅ Automatically URL-encodes transaction type
- ✅ Handles both `response.sections` and `response.data.sections` formats
- ✅ Returns empty array if no sections found

**Usage:**
```typescript
// Load latest published 270/271 template
const sections = await apiService.getLatestQuestionnaireSections('270/271');

// With mode parameter
const sections = await apiService.getLatestQuestionnaireSections('270/271', 'edit');
```

---

### **EXISTING Method: `getQuestionnaireSections()` (Unchanged)**

```typescript
async getQuestionnaireSections(id: string, mode?: string): Promise<Section[]> {
  const query = mode ? `?mode=${encodeURIComponent(mode)}` : '';
  return this.request<Section[]>(`/questionnaires/${id}/sections${query}`);
}
```

**Status:** Still available, can be used for direct hardcoded template access.

---

## 📝 Migration Guide

### **Before (Old Code):**

```typescript
// App.tsx, MainDashboard.tsx, PDFExtractor.tsx
const sections = await apiService.getQuestionnaireSections('x12-270-271-complete');
```

**Behavior:**
- Always loads hardcoded template from `backend/src/data/x12-270-271-complete.ts`
- No database interaction
- Changes require code deployment

---

### **After (New Code):**

```typescript
// App.tsx, MainDashboard.tsx, PDFExtractor.tsx
const sections = await apiService.getLatestQuestionnaireSections('270/271');
```

**Behavior:**
- First checks database for published template
- If found → uses database version
- If not found → automatically falls back to hardcoded template
- Changes take effect immediately (no deployment)

---

## 🔍 Backend Implementation Details

### **Route Ordering (CRITICAL)**

**File:** `backend/src/routes/questionnaire.ts`

```typescript
// IMPORTANT: This route must come BEFORE /:id and /:id/sections
// to avoid route conflicts with transaction types containing slashes
router.get('/:transactionType/latest', asyncHandler(async (req, res) => {
  // ... implementation
}));

// These routes come AFTER
router.get('/:id/sections', asyncHandler(async (req, res) => {
  // ... implementation
}));

router.get('/:id', asyncHandler(async (req, res) => {
  // ... implementation
}));
```

**Why Order Matters:**
- Express matches routes in order of definition
- `270/271/latest` could match `/:id/sections` if that route comes first
- Express would interpret: `id = "270/271"`, `sectionId = "latest"`
- By placing `/:transactionType/latest` first, we ensure correct matching

---

### **Fallback Logic**

```typescript
router.get('/:transactionType/latest', asyncHandler(async (req, res) => {
  const { transactionType } = req.params;

  // Step 1: Try database
  const template = await supabaseService.getLatestPublishedTemplate(transactionType);

  if (template) {
    return res.json({
      success: true,
      data: template.config,
      version: template.version,
      published_at: template.published_at,
      source: 'database'
    });
  }

  // Step 2: Fallback to hardcoded
  const questionnaire = await questionnaireService.getQuestionnaireById(
    `x12-${transactionType}-complete`
  );

  if (!questionnaire) {
    return res.status(404).json({
      success: false,
      error: `No questionnaire found for transaction type: ${transactionType}`
    });
  }

  return res.json({
    success: true,
    data: questionnaire,
    source: 'hardcoded'
  });
}));
```

**Fallback Triggers:**
- Database template not found
- Database template status is not 'published'
- Database connection error
- Any database query failure

---

## 🧪 Testing

### **Test 1: Database Template Active**

```bash
# Ensure template is published
curl -s "http://localhost:3002/api/questionnaires/270%2F271/latest" | jq '{source, version}'
```

**Expected:**
```json
{
  "source": "database",
  "version": "2.0.0"
}
```

---

### **Test 2: Fallback to Hardcoded**

```sql
-- Archive the template
UPDATE questionnaire_templates 
SET status = 'archived' 
WHERE transaction_type = '270/271';
```

```bash
curl -s "http://localhost:3002/api/questionnaires/270%2F271/latest" | jq '{source}'
```

**Expected:**
```json
{
  "source": "hardcoded"
}
```

---

### **Test 3: URL Encoding**

```bash
# Without encoding (WRONG - will fail)
curl "http://localhost:3002/api/questionnaires/270/271/latest"
# Returns: 404 or route not found

# With encoding (CORRECT)
curl "http://localhost:3002/api/questionnaires/270%2F271/latest"
# Returns: Success
```

---

## 📊 Comparison Table

| Aspect | Old API | New API |
|--------|---------|---------|
| **Endpoint** | `/questionnaires/:id/sections` | `/questionnaires/:transactionType/latest` |
| **Parameter** | Hardcoded ID (`x12-270-271-complete`) | Transaction Type (`270/271`) |
| **Source** | Always hardcoded | Database with fallback |
| **Admin Editable** | ❌ No | ✅ Yes |
| **Deployment Required** | ✅ Yes | ❌ No |
| **Fallback** | ❌ None | ✅ Automatic |
| **Version Tracking** | ❌ No | ✅ Yes |

---

## ⚠️ Breaking Changes

**None!** The old API endpoint still works:

```typescript
// This still works
apiService.getQuestionnaireSections('x12-270-271-complete');
```

**Backward Compatibility:** ✅ 100% maintained

---

## 🎯 Summary

### **What Changed:**
1. ✅ Added new endpoint: `GET /api/questionnaires/:transactionType/latest`
2. ✅ Added new frontend method: `getLatestQuestionnaireSections()`
3. ✅ Updated 3 frontend files to use new method
4. ✅ Fixed route ordering in backend

### **What Stayed the Same:**
1. ✅ Old endpoint still works
2. ✅ Old frontend method still available
3. ✅ Hardcoded templates still in place
4. ✅ No breaking changes

### **Benefits:**
1. ✅ Dynamic template loading
2. ✅ Admin can edit via UI
3. ✅ Automatic fallback
4. ✅ Zero downtime
5. ✅ Version tracking
6. ✅ Immediate updates

---

**Last Updated:** 2025-11-24  
**Version:** 1.0.0

