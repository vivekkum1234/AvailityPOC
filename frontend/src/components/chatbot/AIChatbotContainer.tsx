import React, { useEffect } from 'react';
import { ChatbotContext, AutoFillOptions, NavigationCallbacks, FieldUpdateCallback } from './chatbot.types';
import { ChatbotSidebar } from './ChatbotSidebar';

interface AIChatbotContainerProps {
  context?: ChatbotContext;
  onAutoFillRequest?: (options?: AutoFillOptions) => Promise<void>;
  navigationCallbacks?: NavigationCallbacks;
  onFieldUpdate?: FieldUpdateCallback;
}

export const AIChatbotContainer: React.FC<AIChatbotContainerProps> = ({
  context,
  onAutoFillRequest,
  navigationCallbacks,
  onFieldUpdate
}) => {
  // Debug: Log when callbacks change
  useEffect(() => {
    console.log('AIChatbotContainer: onAutoFillRequest changed:', !!onAutoFillRequest);
  }, [onAutoFillRequest]);

  useEffect(() => {
    console.log('AIChatbotContainer: onFieldUpdate changed:', !!onFieldUpdate);
  }, [onFieldUpdate]);

  return (
    <div className="hidden xl:block">
      <ChatbotSidebar
        context={context}
        onAutoFillRequest={onAutoFillRequest}
        navigationCallbacks={navigationCallbacks}
        onFieldUpdate={onFieldUpdate}
      />
    </div>
  );
};
