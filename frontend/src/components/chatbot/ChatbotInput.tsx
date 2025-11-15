import React, { useState, useEffect } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { VoiceInputButton } from './VoiceInputButton';
import { RecordingIndicator } from './RecordingIndicator';

interface ChatbotInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatbotInput: React.FC<ChatbotInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Ask me about X12 270/271..."
}) => {
  const [message, setMessage] = useState('');

  // Initialize speech recognition
  const {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition({
    continuous: true,
    interimResults: true,
    lang: 'en-US'
  });

  // Update message when transcript changes
  useEffect(() => {
    if (transcript) {
      setMessage(transcript.trim());
    }
  }, [transcript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      resetTranscript(); // Clear speech recognition transcript
    }
  };

  // Handle voice input button click
  const handleVoiceClick = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript(); // Clear previous transcript
      setMessage(''); // Clear input field
      startListening();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div>
      {/* Recording indicator */}
      {isListening && <RecordingIndicator interimTranscript={interimTranscript} />}

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-2xl">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled || isListening}
              rows={1}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-availity-500 focus:border-transparent transition-all duration-200 text-sm"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>

          {/* Voice input button */}
          <VoiceInputButton
            isListening={isListening}
            isSupported={isSupported}
            error={error}
            onClick={handleVoiceClick}
            disabled={disabled}
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
              message.trim() && !disabled
                ? 'bg-availity-500 hover:bg-availity-600 text-white shadow-medium hover:shadow-large'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};
