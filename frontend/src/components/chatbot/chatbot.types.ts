// Chatbot TypeScript interfaces - completely separate from existing types
import React from 'react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  type?: 'message' | 'mode-notification';
}

export interface ModeChangeNotification {
  mode: string;
  sectionsAdded: number;
  sectionNames: string;
  message: string;
}

export interface AutoFillOptions {
  autoSubmit?: boolean;
  sectionId?: string;
  implementationMode?: string;
}

export interface ChatbotContext {
  currentSection?: string;
  currentQuestion?: string;
  implementationMode?: string;
  userResponses?: Record<string, any>;
  sectionDescription?: string;
  modeChangeNotification?: ModeChangeNotification;
  pendingAction?: 'auto-submit' | null;
}

export interface ChatbotProps {
  context?: ChatbotContext;
  onContextChange?: (context: ChatbotContext) => void;
  onAutoFillRequest?: (options?: AutoFillOptions) => Promise<void>;
  navigationCallbacks?: NavigationCallbacks;
  onFieldUpdate?: FieldUpdateCallback;
}

export interface QuickAction {
  id: string;
  label: string;
  message: string;
  icon?: string | React.ReactElement;
}

// Voice input related types
export interface VoiceInputState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
}

export interface SpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
}

// Voice mode related types
export interface VoiceModeState {
  isEnabled: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  currentTranscript: string;
  lastResponse: string;
}

// Navigation callbacks for voice commands
export interface NavigationCallbacks {
  onNext?: () => void;
  onPrevious?: () => void;
  onGoToSection?: (sectionName: string) => boolean;
  getSectionNames?: () => string[];
  getCurrentSectionName?: () => string;
}

// Field update callback for voice commands
export interface FieldUpdateCallback {
  (fieldName: string, fieldValue: string): Promise<{ success: boolean; message: string }>;
}
