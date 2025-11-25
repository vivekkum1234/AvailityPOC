# Quick Reference: Reverting to Hardcoded Template

## 🚨 Emergency Revert Guide

If you need to quickly revert to the hardcoded template, follow these steps:

---

## ⚡ Option 1: Archive Database Template (FASTEST - Recommended)

**Time:** ~30 seconds  
**Reversible:** Yes ✅  
**Downtime:** None

### Steps:

1. **Connect to Supabase:**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor

2. **Run this SQL:**
   ```sql
   UPDATE questionnaire_templates 
   SET status = 'archived' 
   WHERE transaction_type = '270/271' AND status = 'published';
   ```

3. **Verify:**
   ```bash
   curl -s "http://localhost:3002/api/questionnaires/270%2F271/latest" | jq '.source'
   # Should return: "hardcoded"
   ```

4. **Done!** Users now see the hardcoded template.

### To Restore Later:
```sql
UPDATE questionnaire_templates 
SET status = 'published' 
WHERE transaction_type = '270/271' AND status = 'archived';
```

---

## 🔧 Option 2: Using Backend Script

**Time:** ~1 minute  
**Reversible:** Yes ✅  
**Downtime:** None

### Steps:

1. **Create a script:**
   ```bash
   cd backend
   npx ts-node -e "
   import { supabase } from './src/services/supabaseService';
   
   async function archiveTemplate() {
     const { data, error } = await supabase
       .from('questionnaire_templates')
       .update({ status: 'archived' })
       .eq('transaction_type', '270/271')
       .eq('status', 'published')
       .select();
     
     if (error) {
       console.error('❌ Error:', error.message);
     } else {
       console.log('✅ Template archived successfully');
       console.log('Users will now see hardcoded template');
     }
   }
   
   archiveTemplate();
   "
   ```

2. **Verify:**
   - Refresh your app at `http://localhost:3000`
   - Check Network tab → Should see `"source": "hardcoded"`

---

## 💻 Option 3: Revert Frontend Code

**Time:** ~2 minutes  
**Reversible:** Yes ✅  
**Downtime:** During deployment

### Steps:

1. **Edit these files:**

   **`frontend/src/App.tsx` (line 103):**
   ```typescript
   // Change FROM:
   const questionnaireSections = await apiService.getLatestQuestionnaireSections('270/271');
   
   // Change TO:
   const questionnaireSections = await apiService.getQuestionnaireSections('x12-270-271-complete');
   ```

   **`frontend/src/components/MainDashboard.tsx` (line 210):**
   ```typescript
   // Change FROM:
   const questionnaireSections = await apiService.getLatestQuestionnaireSections('270/271');
   
   // Change TO:
   const questionnaireSections = await apiService.getQuestionnaireSections('x12-270-271-complete');
   ```

   **`frontend/src/pages/PDFExtractor.tsx` (line 72):**
   ```typescript
   // Change FROM:
   const sections = await apiService.getLatestQuestionnaireSections('270/271');
   
   // Change TO:
   const sections = await apiService.getQuestionnaireSections('x12-270-271-complete');
   ```

2. **Save files** - React dev server will auto-reload

3. **Verify:**
   - Refresh browser
   - Check Network tab → Should see `/api/questionnaires/x12-270-271-complete/sections`

---

## 🔍 How to Check Current Source

### Method 1: API Call
```bash
curl -s "http://localhost:3002/api/questionnaires/270%2F271/latest" | jq '.source'
```

**Output:**
- `"database"` → Using database template
- `"hardcoded"` → Using hardcoded template

### Method 2: Browser DevTools
1. Open `http://localhost:3000`
2. Open DevTools (F12)
3. Go to Network tab
4. Refresh page
5. Look for API call to `/questionnaires/...`
6. Check response → Look for `"source"` field

---

## 📊 Comparison Table

| Method | Speed | Reversible | Keeps Data | Downtime | Complexity |
|--------|-------|------------|------------|----------|------------|
| **Archive DB** | ⚡ Fastest | ✅ Yes | ✅ Yes | ❌ None | 🟢 Easy |
| **Backend Script** | ⚡ Fast | ✅ Yes | ✅ Yes | ❌ None | 🟡 Medium |
| **Revert Code** | 🐌 Slow | ✅ Yes | ✅ Yes | ⚠️ Yes | 🔴 Hard |

**Recommendation:** Use **Option 1 (Archive DB)** for fastest, safest revert.

---

## ✅ Verification Checklist

After reverting, verify:

- [ ] API returns `"source": "hardcoded"`
- [ ] Questionnaire loads in browser
- [ ] All 19 sections present
- [ ] All 129 questions present
- [ ] Voice mode works
- [ ] PDF extraction works
- [ ] Submissions work
- [ ] No console errors

---

## 🔄 Restore Database Template

If you archived the template and want to restore it:

```sql
UPDATE questionnaire_templates 
SET status = 'published' 
WHERE transaction_type = '270/271' AND status = 'archived';
```

Then verify:
```bash
curl -s "http://localhost:3002/api/questionnaires/270%2F271/latest" | jq '.source'
# Should return: "database"
```

---

## 📞 Emergency Contacts

If something goes wrong:
1. Check this guide
2. Review main documentation: `docs/ADMIN_TEMPLATE_EDITING.md`
3. Check backend logs
4. Contact development team

---

**Remember:** The system has **automatic fallback**. If the database template is archived or deleted, it will automatically use the hardcoded template. No manual intervention needed! 🎉

