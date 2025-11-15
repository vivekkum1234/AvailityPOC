# AI Chatbot for X12 270/271 Questionnaire

## Overview
This AI-powered chatbot provides contextual help for users filling out the X12 270/271 HIPAA transaction implementation questionnaire. It appears as a left sidebar on desktop screens (1280px+) and provides intelligent assistance for complex technical fields.

## Features

### ✅ Implemented (MVP)
- **Desktop-only sidebar** - Clean left panel integration
- **Contextual help** - Understands current questionnaire section
- **Smart responses** - Detailed explanations for X12 fields
- **Quick actions** - Pre-defined helpful questions
- **🎤 Voice input** - Speak your questions instead of typing (Chrome/Edge/Safari)
- **Professional UI** - Matches application design system
- **Zero disruption** - Doesn't affect existing questionnaire logic

### 🔄 Sample Conversations
- ISA segment explanations (ISA05, ISA06, ISA08, etc.)
- Implementation mode guidance (Web, B2B, EDI Batch)
- Enveloping requirements help
- Character set and formatting advice
- Payer name and ID requirements
- Best practices and recommendations

### 🎤 Voice Input
- Click the microphone button to speak your question
- Real-time transcription appears in the input field
- Edit the text if needed, then press Enter to send
- Works in Chrome, Edge, and Safari
- See [VOICE_INPUT_README.md](./VOICE_INPUT_README.md) for details

## Components

```
chatbot/
├── AIChatbotContainer.tsx    # Main wrapper (desktop-only)
├── ChatbotSidebar.tsx        # Left panel with full chat interface
├── ChatbotMessages.tsx       # Message display area
├── ChatbotMessage.tsx        # Individual message bubbles
├── ChatbotInput.tsx          # Input field with send button + voice input
├── QuickActions.tsx          # Pre-defined help buttons
├── VoiceInputButton.tsx      # 🎤 Microphone button component
├── RecordingIndicator.tsx    # 🔴 Recording status indicator
├── useChatbotContext.ts      # Context management hook
├── chatbot.types.ts          # TypeScript interfaces
└── index.ts                  # Exports

hooks/
└── useSpeechRecognition.ts   # 🎤 Web Speech API integration
```

## Integration

### MainDashboard Integration
```typescript
// Only shows on questionnaire tab, desktop screens (xl:)
<div className="hidden xl:block w-80 flex-shrink-0">
  <AIChatbotContainer context={chatbotContext} />
</div>
```

### Layout Changes
- Changed max-width from `max-w-5xl` to `max-w-7xl` for chatbot space
- Added flex layout with chatbot on left, questionnaire on right
- Preserved all existing questionnaire logic and styling

## Design System Compliance

### Colors
- **Primary**: Availity orange (`availity-500`)
- **Gradients**: `from-primary-400 to-availity-500`
- **Shadows**: `shadow-soft`, `shadow-medium`, `shadow-large`
- **Text**: Gray scale matching application

### Animations
- **Fade-in**: `animate-fade-in` for messages
- **Slide-up**: `animate-slide-up` for components
- **Pulse**: Typing indicators and loading states

### Typography
- **Font**: Inter (matches application)
- **Sizes**: Consistent with existing components
- **Weights**: Proper hierarchy (semibold headers, medium labels)

## Future Enhancements

### 🚀 Next Phase (Backend Integration)
- **OpenAI API integration** - Replace sample responses
- **Real context awareness** - Track actual section/question state
- **Response caching** - Store common Q&A for performance
- **User feedback** - Thumbs up/down for response quality

### 📱 Mobile Support (Optional)
- **Floating button** - Bottom-right corner
- **Modal overlay** - Full-screen chat on mobile
- **Touch-optimized** - Larger buttons and inputs

### 🧠 Advanced Features (Future)
- **Section-specific prompts** - Tailored help per questionnaire section
- **Progress-aware suggestions** - Help based on completion status
- **Error prevention** - Proactive validation guidance
- **Learning system** - Improve responses based on user interactions

## Technical Notes

### Performance
- **Lazy loading** - Components only load when needed
- **Debounced typing** - Smooth user experience
- **Efficient re-renders** - Optimized React patterns

### Accessibility
- **Keyboard navigation** - Full keyboard support
- **Screen reader friendly** - Proper ARIA labels
- **Focus management** - Logical tab order

### Browser Support
- **Modern browsers** - ES6+ features
- **Responsive design** - Works on all screen sizes
- **Progressive enhancement** - Graceful degradation

## Usage Examples

### Quick Actions
- "Choose Implementation Mode" - Explains Web vs B2B vs EDI Batch
- "ISA Field Explanations" - Technical details for X12 segments
- "Payer Name & ID Help" - Requirements and best practices
- "Character Set Options" - Formatting and encoding guidance

### Natural Language Queries
- "What is ISA05?" → Detailed explanation with recommendations
- "Help me choose implementation mode" → Comparison guide
- "Explain enveloping requirements" → Technical overview
- "What are character set options?" → Formatting guidance

## Development

### Adding New Responses
Edit `generateSampleResponse()` in `ChatbotSidebar.tsx`:

```typescript
if (lowerMessage.includes('your-keyword')) {
  return `Your helpful response with:
  • Bullet points
  • **Bold text**
  • Clear explanations
  • Actionable advice`;
}
```

### Styling Updates
All styles use Tailwind classes matching the application's design system. Key classes:
- `bg-availity-500` - Primary brand color
- `shadow-soft` - Consistent shadows
- `animate-fade-in` - Smooth animations
- `text-gray-800` - Primary text color

This chatbot enhances the questionnaire experience without disrupting existing functionality, providing users with intelligent, contextual assistance for complex X12 270/271 implementation decisions.
