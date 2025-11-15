// Chatbot components exports
export { AIChatbotContainer } from './AIChatbotContainer';
export { ChatbotSidebar } from './ChatbotSidebar';
export { ChatbotMessages } from './ChatbotMessages';
export { ChatbotMessage } from './ChatbotMessage';
export { ChatbotInput } from './ChatbotInput';
export { QuickActions } from './QuickActions';
export { VoiceInputButton } from './VoiceInputButton';
export { RecordingIndicator } from './RecordingIndicator';
export { VoiceModeToggle } from './VoiceModeToggle';
export { VoiceModePanel } from './VoiceModePanel';

// Hooks
export { useChatbotContext } from './useChatbotContext';

// Types
export type {
  ChatMessage,
  ChatbotContext,
  ChatbotProps,
  QuickAction,
  VoiceInputState,
  SpeechRecognitionOptions,
  VoiceModeState
} from './chatbot.types';
