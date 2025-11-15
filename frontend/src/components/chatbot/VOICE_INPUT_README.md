# 🎤 Voice Input Feature - User Guide

## Overview

The chatbot now supports **voice-to-text input**, allowing users to speak their questions instead of typing. The transcribed text appears in the chat input field and can be sent manually.

---

## ✨ Features

- 🎙️ **Click-to-speak**: Click the microphone button to start/stop recording
- 📝 **Real-time transcription**: See your words appear as you speak
- ✏️ **Editable**: Edit the transcribed text before sending
- 🔴 **Visual feedback**: Pulsing red microphone when recording
- ⚠️ **Error handling**: Clear error messages for common issues
- 🌐 **Browser support**: Works in Chrome, Edge, and Safari

---

## 🚀 How to Use

### Step 1: Click the Microphone Button
- Look for the microphone icon next to the send button in the chatbot
- Click it to start recording

### Step 2: Grant Microphone Permission
- **First time only**: Your browser will ask for microphone permission
- Click "Allow" to enable voice input

### Step 3: Speak Your Question
- Speak clearly into your microphone
- You'll see:
  - 🔴 Red pulsing microphone icon (recording active)
  - "Listening..." indicator at the top
  - Your words appearing in the input field in real-time

### Step 4: Stop Recording
- Click the microphone button again to stop
- Or just start speaking and it will continue listening

### Step 5: Review and Send
- Review the transcribed text in the input field
- Edit if needed (you can type to make corrections)
- Click the send button (paper plane icon) or press Enter

---

## 🌐 Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| ✅ **Chrome** | Excellent | Recommended - Uses Google's speech recognition |
| ✅ **Edge** | Excellent | Same engine as Chrome |
| ✅ **Safari** | Good | macOS Big Sur+ and iOS 14.5+ |
| ⚠️ **Firefox** | Limited | Requires manual flag enablement |
| ❌ **IE** | Not supported | Please use a modern browser |

**Note**: The microphone button only appears in supported browsers.

---

## 🔐 Privacy & Security

### Microphone Permission
- Permission is requested only when you click the microphone button
- You can revoke permission anytime in your browser settings

### Audio Processing
- **Chrome/Edge**: Audio is sent to Google's servers for transcription
- **Safari**: Audio is processed by Apple's speech recognition
- **No storage**: Audio is NOT saved or stored anywhere
- **User control**: You must explicitly click to start recording

### HTTPS Requirement
- Voice input requires HTTPS in production (security requirement)
- Works on `localhost` for development
- Your deployment already uses HTTPS ✅

---

## ⚠️ Troubleshooting

### Microphone Button Not Visible
**Problem**: I don't see the microphone button  
**Solution**: 
- Use Chrome, Edge, or Safari (latest versions)
- Firefox requires enabling a flag - use Chrome instead

### Permission Denied
**Problem**: "Microphone permission denied" error  
**Solution**:
1. Click the lock icon in your browser's address bar
2. Find "Microphone" permissions
3. Change to "Allow"
4. Refresh the page

### No Speech Detected
**Problem**: "No speech detected" error  
**Solution**:
- Check that your microphone is connected and working
- Speak louder or closer to the microphone
- Test your microphone in system settings

### Poor Transcription Accuracy
**Problem**: Words are transcribed incorrectly  
**Solution**:
- Speak clearly and at a moderate pace
- Reduce background noise
- Use a better quality microphone
- Edit the text manually before sending

### Network Error
**Problem**: "Network error" message  
**Solution**:
- Check your internet connection
- Speech recognition requires internet access
- Try again when connection is stable

---

## 🎯 Tips for Best Results

1. **Speak clearly** - Enunciate words, don't mumble
2. **Moderate pace** - Not too fast, not too slow
3. **Quiet environment** - Reduce background noise
4. **Good microphone** - Use a quality microphone if possible
5. **Review before sending** - Always check the transcription
6. **Use punctuation commands** - Say "period", "comma", "question mark"

---

## 🛠️ Technical Details

### Technology Used
- **Web Speech API** - Built into modern browsers
- **Zero cost** - No API fees
- **Real-time** - Instant transcription as you speak
- **No dependencies** - Uses native browser capabilities

### Implementation
- Custom React hook: `useSpeechRecognition`
- Components: `VoiceInputButton`, `RecordingIndicator`
- Language: English (en-US) by default
- Continuous mode: Keeps listening until you stop

---

## 🔮 Future Enhancements

Planned features for future releases:

- 🌍 **Multi-language support** - Spanish, French, etc.
- 🎯 **Voice commands** - Say "send" to submit automatically
- ⌨️ **Keyboard shortcuts** - Ctrl+Shift+V to start recording
- 🔄 **Fallback to Whisper API** - For unsupported browsers
- 📊 **Usage analytics** - Track adoption and errors

---

## 📞 Support

If you encounter issues:

1. Check this troubleshooting guide first
2. Verify your browser is supported (Chrome/Edge recommended)
3. Test your microphone in system settings
4. Try refreshing the page
5. Contact support if issues persist

---

## 🎉 Enjoy Voice Input!

Voice input makes it faster and easier to interact with the chatbot, especially for longer questions or when typing is inconvenient. Give it a try!

