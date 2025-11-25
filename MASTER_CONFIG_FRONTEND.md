# Master Configuration - Frontend Implementation

## 🎯 Overview
Frontend admin UI for managing questionnaire templates. Allows Availity admins (like Lisa Wilson) to modify X12 transaction forms through a visual editor.

---

## 📁 Files Created/Modified

### **New Files Created:**

1. **`frontend/src/types/admin.ts`**
   - TypeScript interfaces for `QuestionnaireTemplate` and `QuestionnaireVersion`

2. **`frontend/src/services/adminApi.ts`**
   - Admin API service with methods:
     - `getTemplates()` - List all templates
     - `getTemplate(id)` - Get specific template
     - `createTemplate()` - Create new draft
     - `updateTemplate()` - Update draft
     - `publishTemplate()` - Publish template

3. **`frontend/src/pages/AdminDashboard.tsx`**
   - Admin dashboard showing all questionnaire templates
   - Card-based grid layout
   - Shows status badges (draft/published/archived)
   - Click to edit

4. **`frontend/src/pages/TemplateEditor.tsx`**
   - Visual form editor for modifying templates
   - Section-based layout
   - Edit question properties: title, description, required, options
   - Save draft / Publish workflow
   - Publish dialog with changes summary

### **Modified Files:**

1. **`frontend/src/contexts/AuthContext.tsx`**
   - Added `id` and `isAdmin` fields to User interface

2. **`frontend/src/App.tsx`**
   - Added admin routes:
     - `/admin` - Admin dashboard
     - `/admin/templates/:id` - Template editor
   - Added "Admin" button in header (visible only to admin users)

3. **`frontend/src/pages/Login.tsx`**
   - Updated to fetch user from database
   - Retrieves `isAdmin` flag and `id` from backend
   - Updated both `handleSubmit` and `handleQuickLogin`

4. **`backend/src/services/supabaseService.ts`**
   - Added `email` filter to `getUsers()` method

5. **`backend/src/routes/users.ts`**
   - Added `email` query parameter support

---

## 🚀 How It Works

### **1. Admin Access**
- Lisa Wilson logs in with `admin@availity.com`
- Backend fetches user from database and checks `is_admin` flag
- If admin, "Admin" button appears in header

### **2. Admin Dashboard**
- Navigate to `/admin` or click "Admin" button
- Shows all questionnaire templates in card grid
- Each card shows:
  - Transaction type (e.g., "X12 270/271")
  - Version number
  - Status badge (draft/published/archived)
  - Number of sections
  - Published date (if published)

### **3. Template Editor**
- Click on a template card to edit
- Shows all sections and questions
- For each question, can edit:
  - Title
  - Description
  - Required (yes/no)
  - Options (for radio/select/checkbox)
- **Draft templates**: Can save changes and publish
- **Published templates**: Read-only (cannot edit)

### **4. Publish Workflow**
1. Admin edits a draft template
2. Clicks "Save Draft" to save changes
3. Clicks "Publish" button
4. Enters optional changes summary
5. Confirms publish
6. Template status changes to "published"
7. Version history entry created
8. All new form submissions use this version

---

## 🎨 UI Features

### **Admin Dashboard:**
- Clean card-based grid layout
- Color-coded status badges:
  - 🟢 Published (green)
  - 🟡 Draft (yellow)
  - ⚫ Archived (gray)
- Responsive design (1-3 columns based on screen size)
- Empty state message if no templates

### **Template Editor:**
- Sticky header with action buttons
- Section-based accordion layout
- Form inputs for each question property
- Success/error message banners
- Publish confirmation dialog
- Loading states for save/publish actions

### **Admin Button:**
- Purple button in header (only for admins)
- Settings icon
- Positioned before user welcome message

---

## 🔒 Security

- Admin routes require authentication (ProtectedRoute wrapper)
- Backend API requires `x-user-id` header
- Admin middleware checks `is_admin` flag
- Only draft templates can be edited
- Published templates are read-only

---

## 📊 Data Flow

```
Login → Fetch user from DB → Check is_admin flag → Store in AuthContext
                                                    ↓
                                            Show/hide Admin button
                                                    ↓
                                            Click Admin → /admin
                                                    ↓
                                    Fetch templates from backend
                                                    ↓
                                    Display in card grid
                                                    ↓
                                    Click card → /admin/templates/:id
                                                    ↓
                                    Fetch template details
                                                    ↓
                                    Show editor (if draft) or read-only (if published)
                                                    ↓
                                    Edit → Save Draft → Publish
                                                    ↓
                                    Create version history → Status = published
```

---

## ✅ Next Steps (Not Yet Implemented)

1. **Run Database Migration**
   - Execute `backend/src/migrations/001_questionnaire_templates.sql`

2. **Run Seed Script**
   - `cd backend && npx ts-node src/scripts/seedQuestionnaireTemplates.ts`

3. **Test Admin Flow**
   - Login as Lisa Wilson
   - Navigate to Admin dashboard
   - Edit X12 270/271 template
   - Publish changes

4. **Future Enhancements** (Phase 2):
   - Add/delete sections and questions
   - Drag-drop reordering
   - Visual conditional logic builder
   - Version rollback
   - Advanced preview mode
   - Audit logs

---

## 🎯 MVP Scope (2-Day Timeline)

✅ **Completed:**
- Database schema
- Backend API
- Admin authentication
- Admin dashboard UI
- Template editor UI
- Publish workflow
- Version history (backend)

⏸️ **Deferred to Phase 2:**
- Add/delete sections/questions
- Drag-drop reordering
- Visual conditional logic builder
- Version rollback UI
- In-progress form handling

