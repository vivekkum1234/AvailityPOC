import { useState, useEffect, useCallback, useRef } from 'react';

export interface TextToSpeechOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

export interface UseTextToSpeechReturn {
  isSpeaking: boolean;
  isSupported: boolean;
  availableVoices: SpeechSynthesisVoice[];
  speak: (text: string, options?: TextToSpeechOptions) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
}

export const useTextToSpeech = (
  defaultOptions?: TextToSpeechOptions
): UseTextToSpeechReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check if browser supports Web Speech API
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load available voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    
    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [isSupported]);

  const speak = useCallback(
    (text: string, options?: TextToSpeechOptions) => {
      if (!isSupported) {
        console.warn('Text-to-speech is not supported in this browser');
        return;
      }

      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply options
      const opts = { ...defaultOptions, ...options };
      utterance.lang = opts.lang || 'en-US';
      utterance.rate = opts.rate || 1.0;
      utterance.pitch = opts.pitch || 1.0;
      utterance.volume = opts.volume || 1.0;

      // Select voice
      if (opts.voice) {
        const selectedVoice = availableVoices.find(v => v.name === opts.voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      } else {
        // Try to find a natural-sounding voice
        const preferredVoice = availableVoices.find(v => 
          v.name.includes('Samantha') || // macOS
          v.name.includes('Google US English') || // Chrome
          v.name.includes('Microsoft Zira') || // Windows
          (v.lang === 'en-US' && v.localService) // Local English voice
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }

      // Event handlers
      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        utteranceRef.current = null;
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, availableVoices, defaultOptions]
  );

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    utteranceRef.current = null;
  }, [isSupported]);

  const pause = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.resume();
  }, [isSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    isSpeaking,
    isSupported,
    availableVoices,
    speak,
    stop,
    pause,
    resume,
  };
};

