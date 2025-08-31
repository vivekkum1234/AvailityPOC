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

export interface ChatbotContext {
  currentSection?: string;
  currentQuestion?: string;
  implementationMode?: string;
  userResponses?: Record<string, any>;
  sectionDescription?: string;
  modeChangeNotification?: ModeChangeNotification;
}

export interface ChatbotProps {
  context?: ChatbotContext;
  onContextChange?: (context: ChatbotContext) => void;
}

export interface QuickAction {
  id: string;
  label: string;
  message: string;
  icon?: string | React.ReactElement;
}
