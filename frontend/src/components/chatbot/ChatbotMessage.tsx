import React from 'react';
import { ChatMessage } from './chatbot.types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatbotMessageProps {
  message: ChatMessage;
}

export const ChatbotMessage: React.FC<ChatbotMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const isModeNotification = message.type === 'mode-notification';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
      <div className={`max-w-xs lg:max-w-sm px-4 py-3 rounded-2xl ${
        isUser
          ? 'bg-availity-500 text-white rounded-br-md'
          : isModeNotification
          ? 'bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 text-gray-800 rounded-bl-md shadow-soft'
          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-soft'
      }`}>
        {!isUser && (
          <div className="flex items-center mb-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
              isModeNotification
                ? 'bg-gradient-to-br from-green-400 to-blue-500'
                : 'bg-gradient-to-br from-primary-400 to-availity-500'
            }`}>
              {isModeNotification ? (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="text-xs font-medium text-gray-500">
              {isModeNotification ? 'Mode Update' : 'AI Assistant'}
            </span>
          </div>
        )}
        
        {message.isTyping ? (
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-sm text-gray-500 ml-2">AI is typing...</span>
          </div>
        ) : (
          <MarkdownRenderer content={message.content} />
        )}
        
        <div className={`text-xs mt-2 ${isUser ? 'text-availity-100' : 'text-gray-400'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};
