import React from 'react';

interface RecordingIndicatorProps {
  interimTranscript?: string;
}

export const RecordingIndicator: React.FC<RecordingIndicatorProps> = ({ 
  interimTranscript 
}) => {
  return (
    <div className="px-4 py-2 bg-red-50 border-t border-red-200 flex items-center space-x-3">
      {/* Pulsing red dot */}
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium text-red-700">Listening...</span>
      </div>
      
      {/* Show interim transcript if available */}
      {interimTranscript && (
        <div className="flex-1 text-sm text-gray-600 italic truncate">
          "{interimTranscript}"
        </div>
      )}
    </div>
  );
};

