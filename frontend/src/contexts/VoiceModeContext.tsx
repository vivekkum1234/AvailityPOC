import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface VoiceModeContextType {
  isVoiceMode: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  currentTranscript: string;
  enableVoiceMode: () => void;
  disableVoiceMode: () => void;
  toggleVoiceMode: () => void;
  setListening: (listening: boolean) => void;
  setSpeaking: (speaking: boolean) => void;
  setCurrentTranscript: (transcript: string) => void;
}

const VoiceModeContext = createContext<VoiceModeContextType | undefined>(undefined);

export const VoiceModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');

  const enableVoiceMode = useCallback(() => {
    setIsVoiceMode(true);
    // Save preference
    localStorage.setItem('chatbot-voice-mode', 'true');
  }, []);

  const disableVoiceMode = useCallback(() => {
    setIsVoiceMode(false);
    setIsListening(false);
    setIsSpeaking(false);
    setCurrentTranscript('');
    // Save preference
    localStorage.setItem('chatbot-voice-mode', 'false');
  }, []);

  const toggleVoiceMode = useCallback(() => {
    if (isVoiceMode) {
      disableVoiceMode();
    } else {
      enableVoiceMode();
    }
  }, [isVoiceMode, enableVoiceMode, disableVoiceMode]);

  const setListening = useCallback((listening: boolean) => {
    setIsListening(listening);
  }, []);

  const setSpeaking = useCallback((speaking: boolean) => {
    setIsSpeaking(speaking);
  }, []);

  const value: VoiceModeContextType = {
    isVoiceMode,
    isListening,
    isSpeaking,
    currentTranscript,
    enableVoiceMode,
    disableVoiceMode,
    toggleVoiceMode,
    setListening,
    setSpeaking,
    setCurrentTranscript,
  };

  return (
    <VoiceModeContext.Provider value={value}>
      {children}
    </VoiceModeContext.Provider>
  );
};

export const useVoiceMode = (): VoiceModeContextType => {
  const context = useContext(VoiceModeContext);
  if (!context) {
    throw new Error('useVoiceMode must be used within a VoiceModeProvider');
  }
  return context;
};

