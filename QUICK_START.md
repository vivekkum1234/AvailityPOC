# 🚀 Agentic Mode - Quick Start

## ✅ What's Done

1. ✅ **Frontend UI** - Agentic Mode toggle, broken button, error popup
2. ✅ **Backend AI Agent** - Analyzes code and creates PRs
3. ✅ **Notifications** - SMS + Email alerts when bugs are detected
4. ✅ **Dependencies** - All packages installed

---

## 🔧 Setup (3 Steps)

### Step 1: GitHub Token (Required)

1. Go to: https://github.com/settings/tokens/new
2. Check: `repo` (only this one)
3. Click "Generate token"
4. Copy the token (starts with `ghp_`)
5. Add to `backend/.env`:
   ```env
   GITHUB_TOKEN=ghp_your_token_here
   ```

### Step 2: Notifications (Optional)

Choose one or both:

**SMS (Twilio)**
- Sign up: https://www.twilio.com/try-twilio
- Get credentials from console
- Add to `backend/.env`

**Email (Gmail)**
- Create App Password: https://myaccount.google.com/apppasswords
- Add to `backend/.env`

See `NOTIFICATION_SETUP.md` for detailed instructions.

### Step 3: Start Servers

```bash
# Backend (already running on port 3002)
cd backend
npm run dev

# Frontend (in new terminal)
cd frontend
npm run dev
```

---

## 🎬 Demo Flow

1. **Navigate to Testing Section**
   - Open http://localhost:3000
   - Start questionnaire
   - Go to "Testing" section (last page)

2. **Enable Agentic Mode**
   - Toggle the red switch in top-right corner
   - See broken button appear

3. **Trigger the Bug**
   - Click "Take Me Home" button
   - Error popup appears

4. **Call AI Agent**
   - Click "🤖 Call AI Agent to Fix It"
   - Watch the workflow:
     - 📧 Notifications sent (SMS + Email)
     - 🔍 Analyzing code
     - 🔧 Generating fix
     - 📝 Creating PR
     - ✅ Success!

5. **Review PR**
   - Click the PR link
   - Review AI-generated fix
   - Merge the PR

---

## 📱 What Happens

### When Bug is Detected:

1. **SMS to your phone**:
   ```
   🚨 APOC Bug Detected!
   Issue: Button is broken
   AI Agent is analyzing...
   ```

2. **Email to your inbox**:
   - Beautiful HTML email
   - Detailed bug information
   - AI Agent status
   - Next steps

3. **AI Agent Workflow**:
   - Reads the file
   - Analyzes with GPT-4
   - Generates fix
   - Creates PR on GitHub

---

## 🔄 Reset for Next Demo

After the PR is merged, run:

```bash
./scripts/reset-broken-button.sh
```

This reverts the button to broken state so you can demo again!

---

## 📋 Configuration Status

Check `backend/.env`:

```env
# Required
GITHUB_TOKEN=                    # ⚠️ ADD THIS

# Optional (for notifications)
TWILIO_ACCOUNT_SID=              # Optional
TWILIO_AUTH_TOKEN=               # Optional
TWILIO_PHONE_NUMBER=             # Optional
ALERT_PHONE_NUMBER=              # Optional

NOTIFICATION_EMAIL_USER=         # Optional
NOTIFICATION_EMAIL_PASSWORD=     # Optional
ALERT_EMAIL=                     # Optional
```

---

## ✨ Features

- 🎨 **Beautiful UI** - Red gradient toggle, smooth animations
- 🤖 **AI-Powered** - GPT-4 analyzes and fixes code
- 📧 **Notifications** - SMS + Email alerts
- 🔄 **Repeatable** - Reset script for multiple demos
- 🚀 **Fast** - Entire workflow takes ~10 seconds

---

## 🎯 Next Steps

1. Add your GitHub token to `backend/.env`
2. (Optional) Set up notifications
3. Test the feature!
4. Demo to stakeholders

---

**Everything is ready! Just add your GitHub token and you're good to go! 🚀**

