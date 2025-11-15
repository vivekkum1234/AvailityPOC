import React from 'react';

interface VoiceModePanelProps {
  isListening: boolean;
  isSpeaking: boolean;
  currentTranscript: string;
  hasHadInteraction?: boolean;
  onMute?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onExit: () => void;
}

export const VoiceModePanel: React.FC<VoiceModePanelProps> = ({
  isListening,
  isSpeaking,
  currentTranscript,
  hasHadInteraction = false,
  onMute,
  onPause,
  onResume,
  onExit
}) => {
  return (
    <div className="bg-gradient-to-br from-availity-50 to-blue-50 border-2 border-availity-200 rounded-xl p-6 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`
            w-3 h-3 rounded-full animate-pulse
            ${isListening ? 'bg-red-500' : 'bg-gray-400'}
          `} />
          <span className="text-sm font-semibold text-gray-700">
            {isListening ? '🎤 Listening...' : '⏸️ Ready'}
          </span>
        </div>
      </div>

      {/* Waveform visualization */}
      <div className="flex items-center justify-center h-20 mb-4">
        {isListening ? (
          <div className="flex items-end space-x-1 h-full">
            {[...Array(12)].map((_, i) => {
              const baseHeight = 30 + (i % 3) * 15; // Vary base heights
              const animationDelay = i * 0.15;

              return (
                <div
                  key={i}
                  className="w-2 bg-availity-500 rounded-full"
                  style={{
                    height: `${baseHeight}%`,
                    animation: `waveform 1.5s ease-in-out infinite`,
                    animationDelay: `${animationDelay}s`,
                  }}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-gray-400">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-500 font-medium">Ready to listen</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes waveform {
          0%, 100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(1.8);
          }
        }
      `}</style>

      {/* Transcript */}
      {currentTranscript && (
        <div className="bg-white rounded-lg p-3 mb-4 border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">You said:</p>
          <p className="text-sm text-gray-800 italic">"{currentTranscript}"</p>
        </div>
      )}

      {/* Help text */}
      <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-4">
        <p className="text-xs text-gray-600 mb-2 font-semibold">💡 Try saying:</p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• "What is ISA05?"</li>
          <li>• "Fill this section"</li>
          <li>• "Next section" or "Go back"</li>
          <li>• "Go to enveloping requirements"</li>
          <li>• "Show progress"</li>
          <li>• "Exit voice mode"</li>
        </ul>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between space-x-2">
        {!isListening && !isSpeaking && onResume && hasHadInteraction && (
          <button
            onClick={onResume}
            className="flex-1 px-4 py-2 bg-availity-500 hover:bg-availity-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span>Resume Listening</span>
          </button>
        )}
        <button
          onClick={onExit}
          className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Exit Voice Mode</span>
        </button>
      </div>
    </div>
  );
};

