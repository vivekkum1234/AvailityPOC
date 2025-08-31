import { useState } from 'react';
import { ChatbotContext } from './chatbot.types';

// Custom hook to manage chatbot context
export const useChatbotContext = () => {
  const [context, setContext] = useState<ChatbotContext>({});

  const updateContext = (newContext: Partial<ChatbotContext>) => {
    setContext(prev => ({ ...prev, ...newContext }));
  };

  return {
    context,
    updateContext
  };
};
