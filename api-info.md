# APOC Questionnaire API Documentation

## Base URL
```
http://localhost:3002/api
```

## Supabase Configuration
- **Project**: APOC (`dmlivulltnjfrpocvysg`)
- **URL**: `https://dmlivulltnjfrpocvysg.supabase.co`
- **Environment**: Development

## API Endpoints

### 1. Submit Completed Questionnaire
**Endpoint**: `POST /submissions/submit`

**Description**: Submit a completed X12 270/271 questionnaire with all responses

**Request Body**:
```json
{
  "organizationInfo": {
    "name": "Acme Healthcare",
    "email": "admin@acme.com",
    "phone": "555-1234",
    "address": "123 Main St, City, State 12345"
  },
  "questionnaireData": {
    "organization-name": "Acme Healthcare",
    "required-return-date": "2024-12-31",
    "implementation-mode-selection": "real_time_b2b",
    "availity-enrollment-required": "yes",
    "trading-partner-technical-name": "John Smith",
    "trading-partner-technical-phone": "555-1234",
    "trading-partner-technical-email": "john@acme.com",
    "isa05-270": "01",
    "isa05-271": "ZZ",
    "uppercase-characters": "yes",
    "x12-basic-character-spaces": "yes",
    "supported-search-options": ["patient_id_dob", "patient_id_first_last_name"],
    // ... all other 147+ questionnaire fields
  },
  "implementationMode": "real_time_b2b",
  "submittedBy": "john.doe@acme.com"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "submissionId": "uuid-here",
    "organizationId": "uuid-here", 
    "status": "submitted",
    "submittedAt": "2025-08-29T01:15:30.123Z",
    "message": "Questionnaire submitted successfully"
  }
}
```

### 2. Get All Submissions
**Endpoint**: `GET /submissions/submissions`

**Query Parameters** (optional):
- `organization_id`: Filter by organization ID
- `status`: Filter by status (draft, in_progress, completed, submitted, archived)
- `implementation_mode`: Filter by mode (real_time_web, real_time_b2b, edi_batch)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "organization_id": "uuid-here",
      "questionnaire_id": "x12-270-271-complete",
      "implementation_mode": "real_time_b2b",
      "status": "submitted",
      "responses": { /* all questionnaire data */ },
      "section_completion": { /* completion status per section */ },
      "created_at": "2025-08-29T01:15:30.123Z",
      "updated_at": "2025-08-29T01:15:30.123Z",
      "submitted_at": "2025-08-29T01:15:30.123Z",
      "submitted_by": "john.doe@acme.com",
      "organizations": {
        "id": "uuid-here",
        "name": "Acme Healthcare",
        "email": "admin@acme.com"
      }
    }
  ],
  "count": 1
}
```

### 3. Get Specific Submission
**Endpoint**: `GET /submissions/submission/:id`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "organization_id": "uuid-here",
    "questionnaire_id": "x12-270-271-complete",
    "implementation_mode": "real_time_b2b",
    "status": "submitted",
    "responses": { /* all questionnaire data */ },
    "section_completion": { /* completion status per section */ },
    "created_at": "2025-08-29T01:15:30.123Z",
    "updated_at": "2025-08-29T01:15:30.123Z", 
    "submitted_at": "2025-08-29T01:15:30.123Z",
    "submitted_by": "john.doe@acme.com",
    "organizations": {
      "id": "uuid-here",
      "name": "Acme Healthcare",
      "email": "admin@acme.com"
    }
  }
}
```

### 4. Save Draft (Auto-save)
**Endpoint**: `POST /submissions/draft`

**Request Body**:
```json
{
  "organizationInfo": {
    "name": "Acme Healthcare",
    "email": "admin@acme.com"
  },
  "questionnaireData": { /* partial questionnaire data */ },
  "implementationMode": "real_time_b2b",
  "responseId": "uuid-here" // optional, for updating existing draft
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "responseId": "uuid-here",
    "status": "draft",
    "message": "Draft saved successfully"
  }
}
```

## Database Schema

### Tables
1. **organizations** - Organization information
2. **questionnaire_responses** - Main questionnaire data (JSONB storage)
3. **attachments** - File upload tracking
4. **audit_trail** - Change tracking and audit logs

### Key Features
- **JSONB Storage**: All 147+ questionnaire fields stored efficiently
- **Section Completion Tracking**: Real-time progress monitoring
- **Audit Trail**: Complete change history
- **Row Level Security**: Data protection and access control
- **Auto-timestamps**: Created/updated tracking

## Error Responses

All endpoints return errors in this format:
```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error (server/database issues)

## Frontend Integration

Use these endpoints to:
1. **Submit questionnaire** when user clicks "Complete Questionnaire"
2. **Auto-save drafts** as user fills out forms
3. **Load existing submissions** for editing/viewing
4. **Track completion progress** across sessions

## Admin Interface

### Implementation List Page
- **URL**: `http://localhost:3003/implementations`
- **Description**: View all submitted questionnaires in a table format
- **Features**:
  - Organization name and email
  - Implementation mode (Real-time Web, Real-time B2B, EDI Batch)
  - Submission status and timestamp
  - Submitted by information
  - Click any row to view detailed responses

### Implementation Detail Modal
- **Trigger**: Click on any row in the implementations list
- **Features**:
  - **Overview Tab**: Organization details, submission info, section completion status
  - **Questionnaire Responses Tab**: All form responses organized by section
  - **Raw Data Tab**: Complete JSON data for technical review

### Sample Data Available
- **Organization**: Aetna
- **Mode**: Real-time B2B
- **Status**: Submitted
- **Fields**: 67+ questionnaire responses including:
  - Organization information
  - Contact details
  - Enveloping requirements (ISA/GS segments)
  - Search options
  - Implementation-specific settings
