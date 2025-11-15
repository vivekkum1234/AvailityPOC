# 🎤 Voice Input - Testing Guide

## 🚀 Quick Start

### Step 1: Start the Application
```bash
# Terminal 1 - Start backend
cd backend
npm run dev

# Terminal 2 - Start frontend
cd frontend
npm start
```

### Step 2: Open in Chrome
- Navigate to `http://localhost:3000`
- Go to the questionnaire page
- Open the chatbot sidebar (right side)

### Step 3: Test Voice Input
1. **Click the microphone button** (gray microphone icon next to send button)
2. **Grant permission** when browser asks for microphone access
3. **Speak your question**: "What is ISA05?"
4. **Watch the magic**:
   - Microphone turns red and pulses
   - "Listening..." indicator appears
   - Your words appear in the input field in real-time
5. **Click microphone again** to stop recording
6. **Review the text** - edit if needed
7. **Press Enter or click Send** to submit

---

## ✅ What to Test

### Basic Functionality
- [ ] Microphone button appears next to send button
- [ ] Button is gray when idle
- [ ] Clicking button requests microphone permission (first time)
- [ ] Button turns red and pulses when recording
- [ ] "Listening..." indicator appears at top
- [ ] Spoken words appear in input field
- [ ] Clicking button again stops recording
- [ ] Text remains in input field after stopping
- [ ] Can edit text before sending
- [ ] Send button works normally

### Visual Feedback
- [ ] Red pulsing animation on microphone button
- [ ] "Listening..." banner with red pulsing dot
- [ ] Interim transcript shows in indicator (optional)
- [ ] Button returns to gray when stopped
- [ ] Indicator disappears when stopped

### Error Handling
- [ ] Permission denied shows error message
- [ ] Error message is clear and helpful
- [ ] Button shows error state (red with slash)
- [ ] Can retry after fixing error

### User Experience
- [ ] Transcription is accurate for clear speech
- [ ] Real-time feedback feels responsive
- [ ] Can interrupt and restart recording
- [ ] Text is editable before sending
- [ ] Works with existing chatbot features

---

## 🎯 Test Scenarios

### Scenario 1: Simple Question
**Action**: Click mic, say "What is ISA05?", click mic to stop  
**Expected**: Text "What is ISA05?" appears in input field  
**Result**: ✅ / ❌

### Scenario 2: Long Question
**Action**: Click mic, say "Can you explain the differences between real-time web and real-time B2B implementation modes?", stop  
**Expected**: Full sentence transcribed accurately  
**Result**: ✅ / ❌

### Scenario 3: Edit Before Sending
**Action**: Record "What is ISA05?", stop, edit to "What is ISA06?", send  
**Expected**: Can edit text, sends edited version  
**Result**: ✅ / ❌

### Scenario 4: Re-record
**Action**: Record something, stop, click mic again, record new question  
**Expected**: Previous transcript cleared, new recording starts  
**Result**: ✅ / ❌

### Scenario 5: Permission Denied
**Action**: Deny microphone permission when prompted  
**Expected**: Clear error message, button shows error state  
**Result**: ✅ / ❌

---

## 🐛 Known Limitations

### Browser Support
- **Chrome/Edge**: ✅ Works perfectly
- **Safari**: ✅ Works well (macOS/iOS 14.5+)
- **Firefox**: ⚠️ Limited support (requires flag)
- **IE**: ❌ Not supported

### Accuracy
- Works best with:
  - Clear speech
  - Quiet environment
  - Good quality microphone
  - Moderate speaking pace
- May struggle with:
  - Heavy accents
  - Background noise
  - Technical jargon (X12 terms)
  - Very fast speech

### Technical
- Requires internet connection (Chrome uses Google's servers)
- Requires HTTPS in production (works on localhost)
- May have slight delay in transcription
- Interim results may be inaccurate (final results are better)

---

## 🔧 Troubleshooting

### Microphone Button Not Visible
**Problem**: I don't see the microphone button  
**Solution**: 
- Make sure you're using Chrome, Edge, or Safari
- Check browser console for errors
- Refresh the page

### Permission Issues
**Problem**: "Microphone permission denied"  
**Solution**:
1. Click the lock icon in address bar
2. Find "Microphone" in permissions
3. Change to "Allow"
4. Refresh the page

### No Transcription
**Problem**: Button is red but no text appears  
**Solution**:
- Check microphone is working (test in system settings)
- Speak louder or closer to microphone
- Check browser console for errors
- Try refreshing the page

### Poor Accuracy
**Problem**: Words are transcribed incorrectly  
**Solution**:
- Speak more clearly and slowly
- Reduce background noise
- Use a better microphone
- Edit the text manually before sending

---

## 📊 Testing Checklist

### Pre-Testing
- [ ] Backend is running (`npm run dev`)
- [ ] Frontend is running (`npm start`)
- [ ] Using Chrome or Edge browser
- [ ] Microphone is connected and working
- [ ] In a quiet environment

### During Testing
- [ ] Microphone button appears
- [ ] Permission granted successfully
- [ ] Recording starts on click
- [ ] Visual feedback is clear
- [ ] Transcription is accurate
- [ ] Can stop recording
- [ ] Can edit text
- [ ] Can send message
- [ ] Chatbot responds normally

### Post-Testing
- [ ] No console errors
- [ ] No memory leaks
- [ ] Performance is good
- [ ] UI is responsive
- [ ] Feature feels polished

---

## 📝 Feedback Template

Please provide feedback on:

**Accuracy** (1-5): ___  
How accurate was the transcription?

**Ease of Use** (1-5): ___  
How easy was it to use the feature?

**Visual Feedback** (1-5): ___  
Was it clear when recording was active?

**Performance** (1-5): ___  
How responsive did it feel?

**Overall** (1-5): ___  
Would you use this feature?

**Comments**:
- What worked well?
- What needs improvement?
- Any bugs or issues?
- Feature requests?

---

## 🎉 Success Criteria

The feature is successful if:
- ✅ Works in Chrome without errors
- ✅ Transcription accuracy > 80% for clear speech
- ✅ Visual feedback is clear and intuitive
- ✅ No performance issues
- ✅ Users find it helpful and easy to use

---

## 📞 Need Help?

If you encounter issues:
1. Check this guide first
2. Check browser console for errors
3. Try in a different browser (Chrome recommended)
4. Test microphone in system settings
5. Contact the development team

---

## 🚀 Ready to Test!

Open Chrome, navigate to the chatbot, and click that microphone button! 🎤

**Pro Tip**: Try asking "What is ISA05?" or "Help me choose implementation mode" to test with real chatbot responses.

