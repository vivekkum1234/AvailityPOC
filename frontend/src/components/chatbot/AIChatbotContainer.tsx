import React from 'react';
import { ChatbotContext } from './chatbot.types';
import { ChatbotSidebar } from './ChatbotSidebar';

interface AIChatbotContainerProps {
  context?: ChatbotContext;
}

export const AIChatbotContainer: React.FC<AIChatbotContainerProps> = ({ context }) => {
  return (
    <div className="hidden xl:block">
      <ChatbotSidebar context={context} />
    </div>
  );
};
