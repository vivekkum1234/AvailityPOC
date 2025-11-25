# 🤖 Agentic Mode POC - Ready to Test!

## ✅ Configuration Complete

### **What's Configured:**
- ✅ **GitHub Token**: Added to `backend/.env`
- ✅ **OpenAI API Key**: Already configured
- ✅ **Notifications**: Disabled (commented out for POC)
- ✅ **AI Agent Service**: Ready
- ✅ **Frontend UI**: Agentic Mode toggle + broken button

---

## 🚀 How to Test

### **Step 1: Start Backend Server**
```bash
cd backend
npm run dev
```

**Expected output:**
```
🚀 Server running on port 3002
✅ Connected to Supabase
```

### **Step 2: Start Frontend Server** (in new terminal)
```bash
cd frontend
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
```

### **Step 3: Navigate to Testing Section**
1. Open http://localhost:3000
2. Login as payer user (or start questionnaire)
3. Navigate through sections to **"Testing"** section (last page)

### **Step 4: Enable Agentic Mode**
1. Look for red **"Agentic Mode"** toggle in top-right corner
2. Click the toggle to turn it **ON**
3. You'll see a yellow warning box appear with the broken button

### **Step 5: Trigger the Bug**
1. Click the **"Take Me Home"** button
2. An error popup will appear with the message:
   ```
   🚨 Button Error Detected!
   
   This button is intentionally broken to demonstrate
   the AI agent's ability to detect and fix issues.
   ```

### **Step 6: Call AI Agent**
1. In the popup, click **"🤖 Call AI Agent to Fix It"**
2. Watch the workflow progress:
   - ⏳ **Analyzing**: "AI Agent is analyzing the codebase..."
   - ⏳ **Fixing**: GPT-4 generates the fix
   - ⏳ **Creating PR**: Creates branch and pull request
   - ✅ **Success**: "AI Agent successfully created a PR with the fix!"

### **Step 7: Review the Pull Request**
1. Click the **"View Pull Request"** link in the success message
2. GitHub will open showing the PR:
   - **Title**: 🤖 AI Agent: Fix broken "Take Me Home" button
   - **Branch**: `ai-agent/fix-take-me-home-button-{timestamp}`
   - **Base**: `availity-poc`
3. Review the changes:
   - Added `const navigate = useNavigate();`
   - Changed `onClick={handleBrokenButtonClick}` to `onClick={() => navigate('/')}`
4. **Approve and merge** the PR (manual step - safe!)

---

## 🎬 Demo Flow (Visual)

```
┌─────────────────────────────────────────────────┐
│  Testing Section                    [Agentic ●] │ ← Toggle ON
├─────────────────────────────────────────────────┤
│                                                  │
│  ⚠️  Agentic Mode Demo                          │
│  This button is intentionally broken...         │
│                                                  │
│  [🏠 Take Me Home]  ← Click this                │
│                                                  │
└─────────────────────────────────────────────────┘

                    ↓ Click

┌─────────────────────────────────────────────────┐
│  🚨 Button Error Detected!                  [×] │
│                                                  │
│  This button is intentionally broken to         │
│  demonstrate the AI agent's ability...          │
│                                                  │
│  [🤖 Call AI Agent to Fix It]  ← Click this     │
│  [Close]                                         │
└─────────────────────────────────────────────────┘

                    ↓ Click

┌─────────────────────────────────────────────────┐
│  🤖 AI Agent Working...                          │
│                                                  │
│  ⏳ AI Agent is analyzing the codebase...       │
│                                                  │
│  [Spinner animation]                             │
└─────────────────────────────────────────────────┘

                    ↓ ~10 seconds

┌─────────────────────────────────────────────────┐
│  ✅ Success!                                     │
│                                                  │
│  AI Agent successfully created a PR with the    │
│  fix!                                            │
│                                                  │
│  [View Pull Request →]  ← Click to see PR       │
│  [Close]                                         │
└─────────────────────────────────────────────────┘
```

---

## 🔍 What Happens Behind the Scenes

1. **Frontend** sends request to backend:
   ```json
   POST http://localhost:3002/api/ai-agent/fix-button
   {
     "issue": "Take Me Home button is broken - missing onClick handler",
     "file": "frontend/src/components/QuestionnaireWizard.tsx",
     "section": "testing"
   }
   ```

2. **Backend** reads the file (~1800 lines)

3. **OpenAI GPT-4** analyzes the code:
   - Receives full file content
   - Receives issue description
   - Receives specific instructions
   - Generates fixed code

4. **GitHub API** creates PR:
   - Creates new branch: `ai-agent/fix-take-me-home-button-{timestamp}`
   - Commits fixed file to branch
   - Creates pull request to `availity-poc` branch
   - Returns PR URL

5. **Frontend** displays success with PR link

---

## 🔄 Reset for Next Demo

After you merge the PR, the button will be fixed. To demo again:

```bash
./scripts/reset-broken-button.sh
```

This script will revert the button to its broken state.

---

## 🎯 Expected Results

### **Console Logs (Backend):**
```
🤖 AI Agent triggered: {
  issue: 'Take Me Home button is broken - missing onClick handler',
  file: 'frontend/src/components/QuestionnaireWizard.tsx',
  section: 'testing'
}
🤖 AI Agent started...
📋 Issue: Take Me Home button is broken - missing onClick handler
✅ Pull request created: https://github.com/vivekkum1234/AvailityPOC/pull/XX
```

### **GitHub PR:**
- **Title**: 🤖 AI Agent: Fix broken "Take Me Home" button
- **Files changed**: 1 file
- **Lines**: +2 insertions, -1 deletion
- **Status**: Ready for review

---

## ✨ POC Success Criteria

- ✅ AI agent can read the broken code
- ✅ AI agent understands the issue from description
- ✅ AI agent generates correct fix using GPT-4
- ✅ AI agent creates GitHub branch automatically
- ✅ AI agent creates pull request (not auto-merged)
- ✅ PR contains correct fix with proper React Router usage
- ✅ Entire workflow takes ~10-15 seconds
- ✅ Safe: Requires manual PR approval before merge

---

## 🚨 Troubleshooting

### **Issue: "Failed to connect to AI agent service"**
- **Solution**: Make sure backend is running on port 3002

### **Issue: "Failed to create pull request"**
- **Solution**: Check GitHub token in `backend/.env`
- **Verify**: Token has `repo` scope

### **Issue: "OpenAI API error"**
- **Solution**: Check OpenAI API key in `backend/.env`
- **Verify**: API key is valid and has credits

---

**Ready to test! 🎉**

