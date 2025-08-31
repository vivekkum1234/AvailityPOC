import React, { useEffect, useRef } from 'react';
import { ChatMessage } from './chatbot.types';
import { ChatbotMessage } from './ChatbotMessage';

interface ChatbotMessagesProps {
  messages: ChatMessage[];
}

export const ChatbotMessages: React.FC<ChatbotMessagesProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-availity-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Assistant Ready</h3>
          <p className="text-sm text-gray-600 max-w-xs mx-auto">
            I'm here to help you with your X12 270/271 questionnaire. Ask me about any section or field!
          </p>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <ChatbotMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};
