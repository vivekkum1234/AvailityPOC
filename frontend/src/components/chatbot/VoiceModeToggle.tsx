import React from 'react';

interface VoiceModeToggleProps {
  isVoiceMode: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const VoiceModeToggle: React.FC<VoiceModeToggleProps> = ({
  isVoiceMode,
  onToggle,
  disabled = false
}) => {
  return (
    <div className={`
      flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-300
      ${isVoiceMode
        ? 'bg-gradient-to-r from-availity-500 to-blue-500 shadow-lg shadow-availity-200'
        : 'bg-white bg-opacity-50'
      }
    `}>
      <div className="flex items-center space-x-2">
        <span className={`text-sm font-semibold ${isVoiceMode ? 'text-white' : 'text-gray-700'}`}>
          {isVoiceMode ? 'Voice Mode' : 'Chat Mode'}
        </span>
        {isVoiceMode && (
          <span className="flex items-center space-x-1.5 px-2 py-0.5 bg-white bg-opacity-20 rounded-full">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            <span className="text-xs text-white font-medium">Active</span>
          </span>
        )}
      </div>

      <button
        onClick={onToggle}
        disabled={disabled}
        className={`
          relative inline-flex h-7 w-12 items-center rounded-full
          transition-all duration-300 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
          ${isVoiceMode ? 'bg-white bg-opacity-30' : 'bg-gray-300'}
        `}
        title={isVoiceMode ? 'Switch to Chat Mode' : 'Switch to Voice Mode'}
      >
        <span
          className={`
            inline-flex items-center justify-center h-5 w-5 transform rounded-full
            transition-all duration-300 ease-in-out shadow-md
            ${isVoiceMode ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white'}
          `}
        >
          {isVoiceMode && (
            <svg className="w-3 h-3 text-availity-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
          )}
        </span>
      </button>
    </div>
  );
};

