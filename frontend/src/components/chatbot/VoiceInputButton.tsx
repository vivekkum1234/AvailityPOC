import React from 'react';

interface VoiceInputButtonProps {
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  onClick: () => void;
  disabled?: boolean;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  isListening,
  isSupported,
  error,
  onClick,
  disabled = false
}) => {
  // Don't render if not supported
  if (!isSupported) {
    return null;
  }

  const getButtonClasses = () => {
    if (disabled) {
      return 'bg-gray-300 text-gray-500 cursor-not-allowed';
    }
    if (error) {
      return 'bg-red-100 text-red-600 hover:bg-red-200';
    }
    if (isListening) {
      return 'bg-red-500 text-white hover:bg-red-600 animate-pulse';
    }
    return 'bg-gray-200 text-gray-600 hover:bg-gray-300';
  };

  const getTooltip = () => {
    if (error) return error;
    if (isListening) return 'Click to stop recording';
    return 'Click to start voice input';
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={getTooltip()}
      className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm ${getButtonClasses()}`}
    >
      {isListening ? (
        // Recording state - pulsing microphone
        <svg 
          className="w-5 h-5" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
      ) : error ? (
        // Error state - microphone with slash
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
        </svg>
      ) : (
        // Idle state - normal microphone
        <svg 
          className="w-5 h-5" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
      )}
    </button>
  );
};

