# Admin Template Editing & Publishing System

## 📋 Overview

This document describes the implementation of the Admin Template Editing and Publishing system for X12 questionnaire templates. This feature allows administrators to safely edit questionnaire templates through a UI without requiring code deployments.

---

## 🎯 Key Features

### 1. **Safe Editing Mode**
- Only non-breaking changes are allowed
- Question IDs, types, and option values are locked
- Backend validation prevents unsafe changes
- Detailed error messages guide admins

### 2. **Publish Workflow**
- Draft → Publish workflow with semantic versioning
- Enhanced confirmation modal with impact summary
- Version history tracking
- Changes summary for documentation

### 3. **Dynamic Questionnaire Loading**
- Frontend loads latest published template from database
- Automatic fallback to hardcoded template if database is empty
- Zero downtime during template updates
- Users see changes immediately after publish

---

## 🔄 What Changed: Questionnaire API

### **BEFORE (Old System)**

```typescript
// Frontend
apiService.getQuestionnaireSections('x12-270-271-complete')
         ↓
// Backend
GET /api/questionnaires/x12-270-271-complete/sections
         ↓
// Returns hardcoded template from TypeScript file
backend/src/data/x12-270-271-complete.ts
```

**Characteristics:**
- ✅ Simple and reliable
- ❌ Changes require code deployment
- ❌ No admin editing capability
- ❌ Hardcoded in TypeScript files

---

### **AFTER (New System)**

```typescript
// Frontend
apiService.getLatestQuestionnaireSections('270/271')
         ↓
// Backend
GET /api/questionnaires/270%2F271/latest
         ↓
// 1. Check database for published template
// 2. If found → return database version ✅
// 3. If NOT found → fallback to hardcoded ✅
```

**Characteristics:**
- ✅ Dynamic loading from database
- ✅ Admin can edit via UI
- ✅ Changes take effect immediately
- ✅ **Automatic fallback to hardcoded template**
- ✅ Zero breaking changes
- ✅ Backward compatible

---

## 🛡️ Safety Mechanisms

### **Frontend Restrictions** (`QuestionEditModal.tsx`)

**Locked Fields (Cannot Edit):**
- 🔒 Question ID (preserves data mapping)
- 🔒 Question Type (prevents validation errors)
- 🔒 Option Values (preserves user selections)

**Editable Fields (Safe Changes):**
- ✅ Question titles
- ✅ Question descriptions
- ✅ Help text
- ✅ Option labels (display text only)
- ✅ Validation rules
- ✅ Add new questions
- ✅ Add new options

**Visual Indicators:**
- 🔒 Locked badge with tooltip
- ✓ Safe to edit badge
- ⚠️ Limited editing badge
- Blue safety notice banner

---

### **Backend Validation** (`questionnaireTemplates.ts`)

The `validateSafeChanges()` function checks for:

1. **Removed Questions** ❌
   - Error: "Cannot remove questions: {ids}. This would break voice commands and orphan user data."

2. **Question Type Changes** ❌
   - Error: "Cannot change type of question {id} from {old} to {new}. This would invalidate existing user data."

3. **Removed Options** ❌
   - Error: "Cannot remove options from question {id}: {values}. Users may have selected these options."

4. **Conditional Logic Changes** ❌
   - Error: "Cannot change conditional logic dependency for question {id}. This would break form logic."

**Applied On:**
- PUT `/:id` (Save Draft)
- POST `/:id/publish` (Publish Template)

---

## 📁 Files Changed

### **Backend Files**

1. **`backend/src/routes/questionnaire.ts`**
   - Moved `/:transactionType/latest` route BEFORE `/:id/sections` (route ordering fix)
   - Endpoint returns database template with fallback to hardcoded

2. **`backend/src/routes/admin/questionnaireTemplates.ts`**
   - Added `validateSafeChanges()` function (lines 136-220)
   - Applied validation on PUT and POST endpoints

### **Frontend Files**

1. **`frontend/src/services/api.ts`**
   - Added `getLatestQuestionnaireSections(transactionType, mode?)` method
   - URL-encodes transaction type (e.g., `270/271` → `270%2F271`)

2. **`frontend/src/App.tsx`**
   - Changed from: `getQuestionnaireSections('x12-270-271-complete')`
   - Changed to: `getLatestQuestionnaireSections('270/271')`

3. **`frontend/src/components/MainDashboard.tsx`**
   - Changed from: `getQuestionnaireSections('x12-270-271-complete')`
   - Changed to: `getLatestQuestionnaireSections('270/271')`

4. **`frontend/src/pages/PDFExtractor.tsx`**
   - Changed from: `getQuestionnaireSections('x12-270-271-complete')`
   - Changed to: `getLatestQuestionnaireSections('270/271')`

5. **`frontend/src/pages/TemplateEditor.tsx`**
   - Enhanced publish confirmation modal
   - Added safety validation summary
   - Added impact statement
   - Added version information display

6. **`frontend/src/components/admin/QuestionEditModal.tsx`**
   - Added safety restrictions (locked fields)
   - Added visual indicators (badges, tooltips)
   - Added comprehensive safety notice banner
   - Limited option editing to labels only

---

## 🔄 Reverting to Hardcoded Template

### **YES! You can always revert to the hardcoded template.**

There are **three ways** to revert:

### **Option 1: Archive the Published Template (Recommended)**

This keeps the database template for reference but stops using it:

```sql
-- Connect to Supabase and run:
UPDATE questionnaire_templates
SET status = 'archived'
WHERE transaction_type = '270/271' AND status = 'published';
```

**Result:**
- ✅ Database template archived (not deleted)
- ✅ System automatically falls back to hardcoded template
- ✅ Users see hardcoded version
- ✅ Can restore later by changing status back to 'published'

---

### **Option 2: Delete the Database Template**

```sql
-- Connect to Supabase and run:
DELETE FROM questionnaire_templates
WHERE transaction_type = '270/271';
```

**Result:**
- ✅ Database template completely removed
- ✅ System automatically falls back to hardcoded template
- ✅ Users see hardcoded version
- ❌ Cannot restore (unless you re-seed)

---

### **Option 3: Revert Frontend Code (Temporary)**

If you want to temporarily bypass the database while keeping it intact:

```typescript
// In frontend/src/App.tsx, MainDashboard.tsx, PDFExtractor.tsx
// Change back to:
const questionnaireSections = await apiService.getQuestionnaireSections('x12-270-271-complete');

// Instead of:
const questionnaireSections = await apiService.getLatestQuestionnaireSections('270/271');
```

**Result:**
- ✅ Frontend directly loads hardcoded template
- ✅ Database template untouched
- ✅ Easy to switch back
- ❌ Requires code change and deployment

---

## 🔍 How the Fallback Works

The backend endpoint has **built-in fallback logic**:

```typescript
// backend/src/routes/questionnaire.ts (lines 97-136)

router.get('/:transactionType/latest', async (req, res) => {
  const { transactionType } = req.params;

  // Step 1: Try database first
  const template = await supabaseService.getLatestPublishedTemplate(transactionType);

  if (template) {
    // Database template found - use it
    return res.json({
      success: true,
      data: template.config,
      version: template.version,
      source: 'database'  // ← Indicates database source
    });
  }

  // Step 2: Fallback to hardcoded
  const questionnaire = await questionnaireService.getQuestionnaireById(
    `x12-${transactionType}-complete`
  );

  return res.json({
    success: true,
    data: questionnaire,
    source: 'hardcoded'  // ← Indicates fallback source
  });
});
```

**This means:**
- If database has published template → Use database ✅
- If database is empty/archived → Use hardcoded ✅
- **Zero downtime, automatic failover!**

---

## 📊 Current Database State

To check what's currently in the database:

```bash
cd backend
npx ts-node -e "
import { supabase } from './src/services/supabaseService';

async function checkTemplates() {
  const { data } = await supabase
    .from('questionnaire_templates')
    .select('transaction_type, version, status, published_at')
    .order('created_at', { ascending: false });

  console.log('Current Templates:');
  console.table(data);
}

checkTemplates();
"
```

**Current State:**
```
┌─────────────────┬─────────┬───────────┬─────────────────────┐
│ transaction_type│ version │ status    │ published_at        │
├─────────────────┼─────────┼───────────┼─────────────────────┤
│ 270/271         │ 2.0.0   │ published │ 2025-11-24 19:26:10 │
└─────────────────┴─────────┴───────────┴─────────────────────┘
```

---

## 🧪 Testing the Fallback

### **Test 1: Verify Database Template is Being Used**

```bash
curl -s "http://localhost:3002/api/questionnaires/270%2F271/latest" | jq '.source'
# Expected: "database"
```

### **Test 2: Archive Template and Test Fallback**

```sql
-- Archive the template
UPDATE questionnaire_templates
SET status = 'archived'
WHERE transaction_type = '270/271';
```

```bash
# Test again
curl -s "http://localhost:3002/api/questionnaires/270%2F271/latest" | jq '.source'
# Expected: "hardcoded"
```

### **Test 3: Restore Template**

```sql
-- Restore the template
UPDATE questionnaire_templates
SET status = 'published'
WHERE transaction_type = '270/271';
```

```bash
# Test again
curl -s "http://localhost:3002/api/questionnaires/270%2F271/latest" | jq '.source'
# Expected: "database"
```

---

## 🚀 Admin Workflow

### **Step 1: Access Admin Portal**
- Navigate to `http://localhost:3000/admin`
- View all questionnaire templates

### **Step 2: Edit Template**
- Click on "270/271" template row
- Opens Template Editor
- See safety notice banner (blue)
- Edit questions (safe changes only)

### **Step 3: Save Draft**
- Click "Save Draft" button
- Backend validates changes
- If unsafe changes detected → Error message with details
- If safe → Draft saved successfully

### **Step 4: Publish**
- Click "Publish" button
- Enhanced modal appears showing:
  - ✅ Safety validation passed
  - 📊 Publishing impact
  - 📝 Changes summary field (optional)
  - ⚠️ Warning about irreversibility
- Add changes summary (recommended)
- Click "Publish Template"

### **Step 5: Verify**
- Go to main app (`http://localhost:3000`)
- Start questionnaire
- See your changes immediately! ✨

---

## 🔐 What's Protected

### **Voice Mode** ✅
- Question IDs are locked
- Voice commands use fuzzy matching on `question.id`, `question.title`, `question.description`
- Changing titles/descriptions is safe (fuzzy matching still works)
- Changing IDs would break voice mode → **BLOCKED**

### **PDF Extraction** ✅
- Field mapping uses question IDs
- Question IDs are locked
- PDF extraction continues to work

### **Conditional Logic** ✅
- Dependencies use `conditionalLogic.dependsOn` (question ID)
- Question IDs are locked
- Changing dependencies would break form flow → **BLOCKED**

### **User Responses** ✅
- Saved responses are keyed by question ID
- Question IDs are locked
- Existing user data remains valid

### **Submissions** ✅
- Question types determine validation
- Question types are locked
- Submissions continue to work

---

## 📈 Version History

All changes are tracked in the `questionnaire_versions` table:

```typescript
interface QuestionnaireVersion {
  id: string;
  template_id: string;
  version: string;
  config: any;  // Full questionnaire JSON
  changes_summary: string;
  created_at: string;
  created_by: string;
}
```

**View version history:**
- Admin portal → Click template → Expand arrow (▶)
- Shows all versions with creator and timestamp

---

## ⚠️ Important Notes

### **URL Encoding is Critical**
- Transaction type `270/271` contains a slash
- Must be URL-encoded as `270%2F271`
- Frontend automatically handles this in `apiService.getLatestQuestionnaireSections()`

### **Route Ordering Matters**
- `/:transactionType/latest` must come BEFORE `/:id/sections`
- Otherwise Express matches `270/271/latest` as `/:id/sections` with id=`270/271` and sectionId=`latest`

### **Database Template Structure**
```typescript
interface QuestionnaireTemplate {
  id: string;
  transaction_type: string;  // e.g., "270/271"
  version: string;           // e.g., "2.0.0"
  status: 'draft' | 'published' | 'archived';
  config: {
    sections: Section[];     // Full questionnaire structure
    // ... other metadata
  };
  created_by: string;
  published_by: string;
  published_at: string;
}
```

### **Hardcoded Template Location**
- File: `backend/src/data/x12-270-271-complete.ts`
- Contains: 19 sections, 129 questions
- Used as: Fallback when database is empty/archived

---

## 🎯 Summary

### **What You Get:**
- ✅ Admin can edit templates via UI
- ✅ Changes take effect immediately (no deployment)
- ✅ Only safe changes allowed (breaking changes blocked)
- ✅ Version history tracking
- ✅ Publish workflow with confirmation
- ✅ **Automatic fallback to hardcoded template**
- ✅ **Can always revert by archiving database template**

### **What's Protected:**
- 🛡️ Voice mode (question IDs locked)
- 🛡️ PDF extraction (question IDs locked)
- 🛡️ Conditional logic (dependencies locked)
- 🛡️ User responses (question IDs locked)
- 🛡️ Submissions (question types locked)

### **Revert Options:**
1. **Archive database template** → Automatic fallback ✅ (Recommended)
2. **Delete database template** → Automatic fallback ✅
3. **Revert frontend code** → Direct hardcoded loading ✅

**You're always in control!** 🎉

---

## 📞 Support

For questions or issues:
1. Check this documentation
2. Review the code comments in changed files
3. Test the fallback mechanism
4. Contact the development team

---

**Last Updated:** 2025-11-24
**Version:** 1.0.0
**Status:** Production Ready ✅

