# 📧 Notification Setup Guide

When a bug is detected in Agentic Mode, the system will automatically send:
- 📱 **SMS** to your phone
- 📧 **Email** with detailed bug information

---

## 🔧 Quick Setup

### Option 1: SMS Only (Twilio)

1. **Sign up for Twilio**: https://www.twilio.com/try-twilio
   - Get $15 free credit (enough for testing)

2. **Get your credentials** from https://console.twilio.com/
   - Account SID
   - Auth Token
   - Phone Number (buy one or use trial number)

3. **Add to `backend/.env`**:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ALERT_PHONE_NUMBER=+1234567890  # Your phone number
   ```

### Option 2: Email Only (Gmail)

1. **Use your Gmail account**

2. **Create App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "APOC Notifications"
   - Copy the 16-character password

3. **Add to `backend/.env`**:
   ```env
   NOTIFICATION_EMAIL_USER=your_email@gmail.com
   NOTIFICATION_EMAIL_PASSWORD=abcd efgh ijkl mnop  # App password
   ALERT_EMAIL=recipient@example.com  # Where to send alerts
   ```

### Option 3: Both SMS + Email (Recommended)

Just configure both options above!

---

## 📱 What You'll Receive

### SMS Message (Short & Quick)
```
🚨 APOC Bug Detected!

Issue: Take Me Home button is broken - missing onClick handler
File: frontend/src/components/QuestionnaireWizard.tsx
Section: testing
Time: 11/19/2025, 12:30:45 PM

AI Agent is analyzing...
```

### Email (Detailed & Formatted)
- Beautiful HTML email with:
  - Bug details
  - File location
  - Timestamp
  - AI Agent status
  - Next steps

---

## 🧪 Testing

1. **Start the backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Navigate to Testing section** in the questionnaire

3. **Enable Agentic Mode**

4. **Click "Take Me Home" button**

5. **Click "🤖 Call AI Agent to Fix It"**

6. **Check your phone and email!** 📱📧

---

## ⚙️ Configuration Options

### Skip Notifications (Optional)

If you don't want to set up notifications right now, just leave the env variables empty. The system will:
- ✅ Still work perfectly
- ⚠️ Log "notification skipped" in console
- ✅ Continue with AI agent workflow

### Partial Setup

You can configure just SMS or just Email:
- **SMS only**: Configure Twilio variables
- **Email only**: Configure Gmail variables
- **Both**: Configure all variables

---

## 🔐 Security Notes

- Never commit `.env` file to git
- Use App Passwords for Gmail (not your main password)
- Twilio credentials are sensitive - keep them secret
- For production, use AWS Secrets Manager

---

## 💰 Cost

### Twilio SMS
- **Free tier**: $15 credit
- **Cost**: ~$0.0075 per SMS
- **Trial**: Can send to verified numbers only

### Gmail
- **Free**: Unlimited emails
- **No cost**: Completely free

---

## 🎯 Next Steps

1. Choose your notification method (SMS, Email, or Both)
2. Follow the setup steps above
3. Add credentials to `backend/.env`
4. Restart the backend server
5. Test by triggering the AI agent!

---

**Ready to receive bug alerts! 🚀**

