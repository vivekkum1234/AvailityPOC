# Master Configuration Setup Guide

## 🚀 Quick Setup (2 Steps)

### Step 1: Run SQL Migration in Supabase

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/dmlivulltnjfrpocvysg/editor
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `backend/src/migrations/001_questionnaire_templates.sql`
5. Click "Run" button
6. Verify success (should see "Success. No rows returned")

### Step 2: Seed Database with X12 270/271 Form

```bash
cd backend
npx ts-node src/scripts/seedQuestionnaireTemplates.ts
```

Expected output:
```
🌱 Starting questionnaire template seeding...

1️⃣ Checking for Lisa Wilson (admin user)...
   ✅ Created Lisa Wilson (ID: xxx-xxx-xxx)

2️⃣ Checking for existing X12 270/271 template...

3️⃣ Creating X12 270/271 template...
   ✅ Created template (ID: xxx-xxx-xxx)
      Transaction Type: 270/271
      Version: 2.0.0
      Status: published
      Sections: 14

4️⃣ Creating version history...
   ✅ Created version history (ID: xxx-xxx-xxx)

✅ Seeding completed successfully!
```

---

## 📋 What Was Created

### Database Tables:
1. **questionnaire_templates** - Master configuration for X12 forms
2. **questionnaire_versions** - Version history and audit log
3. **users.is_admin** - Admin flag column added

### Admin User:
- **Email**: lisa.wilson@availity.com
- **Name**: Lisa Wilson
- **Role**: Availity Admin
- **Access**: Can edit and publish questionnaire templates

### Initial Data:
- **X12 270/271 v2.0.0** - Published and ready to use
- **14 sections** with all questions from the complete questionnaire
- **Version history** entry for initial migration

---

## 🧪 Test the Setup

### Test 1: Verify Database Tables
```sql
-- Run in Supabase SQL Editor
SELECT * FROM questionnaire_templates;
SELECT * FROM questionnaire_versions;
SELECT email, is_admin FROM users WHERE email = 'lisa.wilson@availity.com';
```

### Test 2: Test API Endpoints

```bash
# Get latest published template (public endpoint)
curl http://localhost:3002/api/questionnaires/270-271/latest

# Get all templates (admin only - requires x-user-id header)
curl -H "x-user-id: <lisa-wilson-user-id>" \
  http://localhost:3002/api/admin/questionnaire-templates
```

---

## 🎯 Next Steps

1. ✅ **Day 1 Complete**: Backend + Database ready
2. ⏳ **Day 2**: Build Admin UI
   - Admin dashboard page
   - Form editor
   - Publish workflow

---

## 🔧 Troubleshooting

### Error: "relation questionnaire_templates does not exist"
**Solution**: Run Step 1 (SQL migration) first

### Error: "Cannot read properties of undefined (reading 'from')"
**Solution**: Make sure `.env` file has correct Supabase credentials

### Error: "User not found"
**Solution**: Lisa Wilson will be created automatically by seed script

---

## 📚 API Documentation

### Public Endpoints (No Auth Required)

```
GET /api/questionnaires/:transactionType/latest
```
Returns the latest published questionnaire template for the given transaction type.

**Example**:
```bash
GET /api/questionnaires/270-271/latest
```

**Response**:
```json
{
  "success": true,
  "data": { /* full questionnaire config */ },
  "version": "2.0.0",
  "published_at": "2024-01-15T10:30:00Z",
  "source": "database"
}
```

### Admin Endpoints (Require x-user-id Header)

```
GET    /api/admin/questionnaire-templates
GET    /api/admin/questionnaire-templates/:id
POST   /api/admin/questionnaire-templates
PUT    /api/admin/questionnaire-templates/:id
POST   /api/admin/questionnaire-templates/:id/publish
```

**Example - Create Draft**:
```bash
POST /api/admin/questionnaire-templates
Headers: x-user-id: <lisa-wilson-id>
Body:
{
  "transaction_type": "276/277",
  "version": "1.0.0",
  "config": { /* questionnaire JSON */ }
}
```

**Example - Publish**:
```bash
POST /api/admin/questionnaire-templates/:id/publish
Headers: x-user-id: <lisa-wilson-id>
Body:
{
  "changes_summary": "Initial release of 276/277 form"
}
```

---

## ✅ Verification Checklist

- [ ] SQL migration ran successfully
- [ ] Seed script completed without errors
- [ ] Lisa Wilson user exists with is_admin=true
- [ ] X12 270/271 template exists with status='published'
- [ ] Version history entry created
- [ ] API endpoint returns latest template
- [ ] Ready for Day 2 (Admin UI)

