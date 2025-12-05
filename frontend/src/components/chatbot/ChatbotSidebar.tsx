import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ChatMessage, ChatbotContext, QuickAction, AutoFillOptions, NavigationCallbacks, FieldUpdateCallback } from './chatbot.types';
import { ChatbotMessages } from './ChatbotMessages';
import { ChatbotInput } from './ChatbotInput';
import { QuickActions } from './QuickActions';
import { VoiceModeToggle } from './VoiceModeToggle';
import { VoiceModePanel } from './VoiceModePanel';
import { PHIWarningModal } from './PHIWarningModal';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';
import { apiService } from '../../services/api'; // NEW: For X12 code lookup
import { detectPHI, PHIDetectionResult } from '../../utils/phiDetection';

interface ChatbotSidebarProps {
  context?: ChatbotContext;
  onAutoFillRequest?: (options?: AutoFillOptions) => Promise<void>;
  navigationCallbacks?: NavigationCallbacks;
  onFieldUpdate?: FieldUpdateCallback;
}

// FAQ Questions
interface FAQQuestion {
  id: string;
  question: string;
  icon: string;
}

const FAQ_QUESTIONS: FAQQuestion[] = [
  {
    id: 'sla-testing',
    question: 'What is the SLA for testing environment approval?',
    icon: '📋'
  },
  {
    id: 'member-data',
    question: 'Can you give me the member data for Ramki Sridhar?',
    icon: '👤'
  }
];

export const ChatbotSidebar: React.FC<ChatbotSidebarProps> = ({
  context,
  onAutoFillRequest,
  navigationCallbacks,
  onFieldUpdate
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isQuickActionsCollapsed, setIsQuickActionsCollapsed] = useState(false);
  const [isFAQExpanded, setIsFAQExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Voice mode state
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [hasHadInteraction, setHasHadInteraction] = useState(false);
  const lastResponseRef = useRef<string>('');

  // PHI detection state
  const [showPHIModal, setShowPHIModal] = useState(false);
  const [phiDetectionResult, setPhiDetectionResult] = useState<PHIDetectionResult | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string>('');

  // Voice hooks
  const { speak, stop: stopSpeaking, isSpeaking } = useTextToSpeech();
  const {
    isSupported: isSpeechSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition({
    continuous: true,
    interimResults: true,
    lang: 'en-US'
  });

  // Debug: Log when onAutoFillRequest changes
  useEffect(() => {
    console.log('ChatbotSidebar: onAutoFillRequest changed:', !!onAutoFillRequest);
    console.log('ChatbotSidebar: onAutoFillRequest type:', typeof onAutoFillRequest);
    console.log('ChatbotSidebar: onAutoFillRequest value:', onAutoFillRequest);
  }, [onAutoFillRequest]);

  // Handle mode change notifications
  useEffect(() => {
    if (context?.modeChangeNotification) {
      const notification = context.modeChangeNotification;
      const newMessage: ChatMessage = {
        id: `mode-change-${Date.now()}`,
        content: notification.message,
        sender: 'assistant',
        timestamp: new Date(),
        type: 'mode-notification'
      };

      setMessages(prev => [...prev, newMessage]);

      // Clear the notification after processing (optional - depends on how you want to handle this)
      // You might want to clear this in the parent component instead
    }
  }, [context?.modeChangeNotification]);

  // Voice mode: Auto-greeting when enabled (only once)
  useEffect(() => {
    if (isVoiceMode && !hasGreeted && isSpeechSupported) {
      const greetingMessage = "Hello! I'm ready to help. What would you like to do?";
      const greeting: ChatMessage = {
        id: `greeting-${Date.now()}`,
        content: greetingMessage,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, greeting]);

      // Delay speaking significantly to avoid showing "Speaking..." immediately
      setTimeout(() => {
        if (isVoiceMode) {
          speak(greetingMessage);
          lastResponseRef.current = greetingMessage;
        }
      }, 1500);

      setHasGreeted(true);

      // Start listening after greeting completes
      setTimeout(() => {
        if (isVoiceMode) {
          startListening();
        }
      }, 4500);
    }

    if (!isVoiceMode) {
      setHasGreeted(false);
      setHasHadInteraction(false);
      stopListening();
      stopSpeaking();
    }
  }, [isVoiceMode, hasGreeted, isSpeechSupported]);

  // Voice mode: Handle transcript changes
  useEffect(() => {
    if (isVoiceMode && transcript && transcript.trim()) {
      console.log('Voice transcript received:', transcript);

      // Check if it's a command first
      const command = detectCommand(transcript);
      console.log('Detected command:', command);

      if (command) {
        const executed = executeCommand(command);
        console.log('Command executed:', executed);
        if (executed) {
          setHasHadInteraction(true); // Mark that we've had an interaction
          resetTranscript();
          return;
        }
      }

      // If not a command or command failed, treat as regular message
      // Wait for a pause (transcript hasn't changed for 1.5 seconds)
      const timer = setTimeout(() => {
        if (transcript.trim()) {
          console.log('Treating as regular message:', transcript);
          setHasHadInteraction(true); // Mark that we've had an interaction
          handleSendMessage(transcript);
          resetTranscript();
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [transcript, isVoiceMode]);

  // Sample quick actions based on current context
  const getQuickActions = useCallback((): QuickAction[] => {
    const baseActions: QuickAction[] = [
      {
        id: 'implementation-modes',
        label: 'Choose Implementation Mode',
        message: 'What are the differences between Real-time Web, Real-time B2B, and EDI Batch modes?',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        )
      },
      {
        id: 'isa-fields',
        label: 'ISA Field Explanations',
        message: 'Can you explain ISA segments and their purpose in X12 transactions?',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )
      },
      {
        id: 'audience',
        label: 'Audience',
        message: 'Tell me about audience for questionnaire sections',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        )
      },
      {
        id: 'implementation-guide',
        label: 'Implementation Guide',
        message: 'Show me the implementation guide and technical requirements',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      },

    ];

    // Add context-specific actions
    if (context?.currentSection) {
      const sectionName = context.currentSection.toLowerCase();
      // Skip adding generic help for organization sections
      if (!sectionName.includes('organization')) {
        baseActions.unshift({
          id: 'current-section',
          label: `Help with ${context.currentSection}`,
          message: `I need help with the ${context.currentSection} section. Can you explain what this section is about and what I need to fill out?`,
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        });
      }

      // Add section-specific quick actions
      if (sectionName.includes('enveloping')) {
        baseActions.splice(1, 0, {
          id: 'enveloping-help',
          label: 'ISA/GS Fields',
          message: 'Explain the ISA and GS segment fields in the enveloping requirements',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          )
        });
      } else if (sectionName.includes('contact')) {
        baseActions.splice(1, 0, {
          id: 'contact-help',
          label: 'Contact Requirements',
          message: 'What contact information do I need to provide?',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          )
        });
      }
    }

    return baseActions;
  }, [context]);

  // Voice mode: Voice command handlers - wrap in useCallback to prevent stale closures
  const handleNavigateCommand = useCallback((direction: 'next' | 'previous', sectionName?: string) => {
    console.log('handleNavigateCommand called:', { direction, sectionName, hasCallbacks: !!navigationCallbacks });
    stopListening(); // Pause listening during action

    if (sectionName && navigationCallbacks?.onGoToSection) {
      // Navigate to specific section by name
      console.log('Calling onGoToSection with:', sectionName);
      const success = navigationCallbacks.onGoToSection(sectionName);
      console.log('Navigation result:', success);
      if (success) {
        speak(`Navigating to ${sectionName} section`);
      } else {
        speak(`Sorry, I couldn't find a section matching ${sectionName}`);
      }
    } else if (direction === 'next' && navigationCallbacks?.onNext) {
      // Navigate to next section
      console.log('Calling onNext');
      navigationCallbacks.onNext();
      speak('Moving to next section');
    } else if (direction === 'previous' && navigationCallbacks?.onPrevious) {
      // Navigate to previous section
      console.log('Calling onPrevious');
      navigationCallbacks.onPrevious();
      speak('Going back to previous section');
    } else {
      console.log('Navigation not available:', { direction, sectionName, callbacks: navigationCallbacks });
      speak('Navigation is not available right now');
    }

    // Resume listening after action completes
    setTimeout(() => {
      if (isVoiceMode) startListening();
    }, 2500);
  }, [navigationCallbacks, stopListening, speak, isVoiceMode, startListening]);

  // Field update handler
  const handleFieldUpdate = useCallback(async (fieldName: string, fieldValue: string) => {
    console.log('handleFieldUpdate called:', { fieldName, fieldValue, hasCallback: !!onFieldUpdate });
    stopListening(); // Pause listening during update

    if (onFieldUpdate) {
      try {
        const result = await onFieldUpdate(fieldName, fieldValue);
        console.log('Field update result:', result);

        if (result.success) {
          speak(result.message);
        } else {
          speak(result.message || 'Sorry, I could not update that field');
        }
      } catch (error) {
        console.error('Field update error:', error);
        speak('Sorry, there was an error updating the field');
      }
    } else {
      console.log('No onFieldUpdate callback available');
      speak('Field updates are not available right now');
    }

    // Resume listening after update
    setTimeout(() => {
      if (isVoiceMode) startListening();
    }, 2000);
  }, [onFieldUpdate, stopListening, speak, isVoiceMode, startListening]);

  const { detectCommand, executeCommand } = useVoiceCommands({
    onNavigate: handleNavigateCommand,
    onFieldUpdate: handleFieldUpdate,
    onAutoFill: async (scope) => {
      console.log('Auto-fill command handler called, scope:', scope);
      stopListening(); // Pause listening during auto-fill

      // Speak only a short confirmation message
      speak("Auto-fill activated. I will fill the form for you.");

      // Wait for TTS to finish speaking before starting auto-fill (longer delay)
      await new Promise(resolve => setTimeout(resolve, 3500));

      if (onAutoFillRequest) {
        console.log('Calling onAutoFillRequest');
        await onAutoFillRequest({
          sectionId: scope === 'section' ? context?.currentSection : undefined
        });
        console.log('Auto-fill request completed');
      } else {
        console.log('No onAutoFillRequest callback available');
      }

      // Resume listening after auto-fill completes
      setTimeout(() => {
        if (isVoiceMode) startListening();
      }, 1000);
    },
    onSubmit: () => {
      stopListening(); // Pause listening during submit
      speak('Submitting');
      // TODO: Implement submit
      console.log('Submit form');

      // Resume listening after submit
      setTimeout(() => {
        if (isVoiceMode) startListening();
      }, 2000);
    },
    onHelp: (topic) => {
      stopListening(); // Pause listening while answering
      if (topic) {
        handleSendMessage(`What is ${topic}?`);
      } else {
        speak('What do you need help with?');
        // Resume listening after response
        setTimeout(() => {
          if (isVoiceMode) startListening();
        }, 2000);
      }
    },
    onExit: () => {
      stopListening(); // Stop listening when exiting
      speak('Goodbye');
      setIsVoiceMode(false);
    },
    onSave: () => {
      stopListening(); // Pause listening during save
      speak('Saved');
      // TODO: Implement save
      console.log('Save draft');

      // Resume listening after save
      setTimeout(() => {
        if (isVoiceMode) startListening();
      }, 2000);
    },
    onShowProgress: () => {
      stopListening(); // Pause listening while speaking
      const message = context?.currentSection
        ? `Currently on ${context.currentSection}`
        : 'Not started yet';
      speak(message);

      // Resume listening after response
      setTimeout(() => {
        if (isVoiceMode) startListening();
      }, 2000);
    },
    onRepeat: () => {
      stopListening(); // Pause listening while repeating
      if (lastResponseRef.current) {
        speak(lastResponseRef.current);
      } else {
        speak('Nothing to repeat');
      }

      // Resume listening after repeat
      setTimeout(() => {
        if (isVoiceMode) startListening();
      }, 2000);
    }
  });

  /**
   * NEW: Helper function to detect X12 code lookup queries
   * SEPARATE from existing chatbot logic
   */
  const detectX12CodeQuery = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();

    // Keywords that indicate code lookup
    const codeKeywords = [
      'code',
      'codes',
      'service type',
      'claim status',
      'claim adjustment',
      'error reason',
      'payment type',
      'provider taxonomy',
      'remittance',
      'what is code',
      'what does code',
      'show me code',
      'list code',
      'tell me about code',
      'explain code'
    ];

    // Check if message contains any code-related keywords
    return codeKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  // PHI Detection: Check message before sending
  const handleSendMessage = async (messageContent: string) => {
    // Check for PHI in the message
    const phiResult = detectPHI(messageContent);

    if (phiResult.hasPHI) {
      // PHI detected - show warning modal and block sending
      setPendingMessage(messageContent);
      setPhiDetectionResult(phiResult);
      setShowPHIModal(true);
      return; // Don't send - user must cancel and rephrase
    }

    // No PHI detected - send normally
    await sendMessageInternal(messageContent);
  };

  // Handle close PHI modal
  const handleClosePHIModal = () => {
    setShowPHIModal(false);
    setPendingMessage('');
    setPhiDetectionResult(null);
  };

  // Handle FAQ question click
  const handleFAQClick = (question: string) => {
    // Send the FAQ question as a message
    handleSendMessage(question);
    // Auto-collapse the FAQ section
    setIsFAQExpanded(false);
  };

  // Internal function to actually send the message
  const sendMessageInternal = async (messageContent: string) => {
    // Pause listening in voice mode while processing
    if (isVoiceMode) {
      stopListening();
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: 'typing',
      sender: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };

    setMessages(prev => [...prev, typingMessage]);

    try {
      // NEW: Check if this is an X12 code lookup query (SEPARATE from existing chatbot)
      const isCodeQuery = detectX12CodeQuery(messageContent);

      let aiResponse: string;
      let autoFillAction: AutoFillOptions | undefined;

      if (isCodeQuery) {
        // Use NEW separate X12 code lookup service
        console.log('[Chatbot] Detected X12 code query, using code lookup service');
        try {
          const contextInfo = context ? `Current section: ${context.currentSection || 'unknown'}` : undefined;
          aiResponse = await apiService.lookupX12Code(messageContent, contextInfo);
        } catch (error) {
          console.error('[Chatbot] X12 code lookup error:', error);
          aiResponse = "I'm having trouble looking up that code right now. Please try again or visit https://x12.org/codes directly.";
        }
      } else {
        // EXISTING chatbot logic (UNCHANGED)
        await new Promise(resolve => setTimeout(resolve, 1500));
        const result = generateSampleResponse(messageContent, context, messages);
        aiResponse = typeof result === 'string' ? result : result.response;
        autoFillAction = typeof result === 'object' ? result.autoFillAction : undefined;
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      // Remove typing indicator and add real response
      setMessages(prev => prev.filter(msg => msg.id !== 'typing').concat(aiMessage));

      // Speak response in voice mode (read full content)
      if (isVoiceMode) {
        // Extract and clean text for TTS
        const plainText = aiResponse
          .replace(/\*\*/g, '')  // Remove bold
          .replace(/\*/g, '')    // Remove italic
          .replace(/•/g, '')     // Remove bullets
          .replace(/#{1,6}\s/g, '') // Remove headers
          .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emojis
          .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Remove misc symbols
          .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Remove dingbats
          .replace(/\n{2,}/g, '. ')  // Replace double newlines with period
          .replace(/\n/g, ' ')       // Replace single newlines with space
          .replace(/\s{2,}/g, ' ')   // Collapse multiple spaces
          .trim();

        if (plainText) {
          speak(plainText);
          lastResponseRef.current = plainText;

          // Resume listening after speaking the response (longer delay for full content)
          setTimeout(() => {
            if (isVoiceMode) startListening();
          }, 5000);
        }
      }

      // Execute auto-fill action if requested
      if (autoFillAction && onAutoFillRequest) {
        console.log('Executing auto-fill action:', autoFillAction);
        console.log('Type of onAutoFillRequest:', typeof onAutoFillRequest);
        console.log('onAutoFillRequest is function?', typeof onAutoFillRequest === 'function');
        if (typeof onAutoFillRequest === 'function') {
          await onAutoFillRequest(autoFillAction);
        } else {
          console.error('onAutoFillRequest is not a function, it is:', onAutoFillRequest);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove typing indicator and show error
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSendMessage(action.message);
  };

  return (
    <>
      {/* Minimized State - Bottom Tab */}
      {isMinimized && (
        <div className="fixed bottom-4 left-4 z-50">
          <button
            onClick={() => setIsMinimized(false)}
            className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-primary-400 to-availity-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            title="Open AI Assistant"
          >
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="font-medium">AI Assistant</span>
          </button>
        </div>
      )}

      {/* Full Chatbot - Only when expanded */}
      {!isMinimized && (
        <div className="w-80 h-screen sticky top-0 bg-white border-r border-gray-200 flex flex-col shadow-soft">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-availity-50 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-availity-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Assistant</h3>
                  <p className="text-sm text-gray-600">X12 270/271 Help</p>
                </div>
              </div>

              {/* Professional Minimize Button */}
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 hover:bg-white hover:bg-opacity-50 rounded transition-colors duration-200 flex-shrink-0"
                title="Minimize chatbot"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <div className="w-3 h-0.5 bg-gray-600 rounded-full"></div>
                </div>
              </button>
            </div>

            {/* Voice Mode Toggle */}
            {isSpeechSupported && (
              <div className="mb-3">
                <VoiceModeToggle
                  isVoiceMode={isVoiceMode}
                  onToggle={() => setIsVoiceMode(!isVoiceMode)}
                  disabled={isLoading}
                />
              </div>
            )}

            {context?.currentSection && (
              <div className="mt-3 px-3 py-2 bg-white rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500">Current Section</p>
                <p className="text-sm font-medium text-gray-800">{context.currentSection}</p>
                {context.implementationMode && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-availity-100 text-availity-800">
                      {context.implementationMode === 'real_time_web' && 'Real-time Web'}
                      {context.implementationMode === 'real_time_b2b' && 'Real-time B2B'}
                      {context.implementationMode === 'edi_batch' && 'EDI Batch'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions - Collapsible (hide in voice mode) */}
          {!isVoiceMode && (
            <div className="border-b border-gray-200 flex-shrink-0">
              <button
                onClick={() => setIsQuickActionsCollapsed(!isQuickActionsCollapsed)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
              >
                <span className="text-sm font-medium text-gray-700">Quick Help</span>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isQuickActionsCollapsed ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {!isQuickActionsCollapsed && (
                <QuickActions actions={getQuickActions()} onActionClick={handleQuickAction} />
              )}
            </div>
          )}

          {/* Voice Mode Panel */}
          {isVoiceMode && (
            <div className="p-4 flex-shrink-0">
              <VoiceModePanel
                isListening={isListening}
                isSpeaking={isSpeaking}
                currentTranscript={transcript}
                hasHadInteraction={hasHadInteraction}
                onResume={() => {
                  console.log('Resume listening clicked');
                  resetTranscript();
                  startListening();
                }}
                onExit={() => setIsVoiceMode(false)}
              />
            </div>
          )}

          {/* Messages */}
          <ChatbotMessages messages={messages} />

          {/* FAQ Section - Collapsible (hide in voice mode) */}
          {!isVoiceMode && (
            <div className="border-t border-gray-200 flex-shrink-0">
              <button
                onClick={() => setIsFAQExpanded(!isFAQExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
              >
                <span className="text-sm font-medium text-gray-700 flex items-center">
                  <span className="mr-2">💡</span>
                  Quick Questions
                </span>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isFAQExpanded ? '' : 'rotate-180'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* FAQ Questions - Expandable */}
              {isFAQExpanded && (
                <div className="px-4 pb-3 space-y-2 animate-slide-down">
                  {FAQ_QUESTIONS.map((faq) => (
                    <button
                      key={faq.id}
                      onClick={() => handleFAQClick(faq.question)}
                      className="w-full text-left px-3 py-2.5 rounded-lg border border-gray-200 hover:border-availity-400 hover:bg-availity-50 transition-all duration-200 group"
                    >
                      <div className="flex items-start space-x-2">
                        <span className="text-lg flex-shrink-0 mt-0.5">{faq.icon}</span>
                        <span className="text-sm text-gray-700 group-hover:text-availity-700 font-medium">
                          {faq.question}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Input - disabled in voice mode */}
          {!isVoiceMode && (
            <ChatbotInput onSendMessage={handleSendMessage} disabled={isLoading} />
          )}
        </div>
      )}

      {/* PHI Warning Modal */}
      <PHIWarningModal
        isOpen={showPHIModal}
        detectionResult={phiDetectionResult}
        onCancel={handleClosePHIModal}
      />
    </>
  );
};

// Sample response generator (replace with actual AI integration)
// Returns both the response text and optional auto-fill action
function generateSampleResponse(
  message: string,
  context?: ChatbotContext,
  messages?: ChatMessage[]
): { response: string; autoFillAction?: AutoFillOptions } {
  const lowerMessage = message.toLowerCase();

  // Handle auto-fill requests
  // Mode 1: Fill current section only
  if ((lowerMessage.includes('fill') && lowerMessage.includes('section')) ||
      (lowerMessage.includes('fill') && lowerMessage.includes('current'))) {
    if (context?.currentSection) {
      return {
        response: `✨ **Filling Current Section**

I'm filling out the "${context.currentSection}" section with example data.

Watch as the fields populate automatically! You can modify any field after auto-fill completes.`,
        autoFillAction: { sectionId: context.currentSection }
      };
    }
    return {
      response: `⚠️ Please navigate to a section first, then I can fill it with example data.`
    };
  }

  // Mode 2: Fill entire form (no submit)
  if ((lowerMessage.includes('fill') && lowerMessage.includes('form')) ||
      (lowerMessage.includes('help') && lowerMessage.includes('filling')) ||
      (lowerMessage.includes('fill') && lowerMessage.includes('example')) ||
      lowerMessage.includes('auto fill') ||
      lowerMessage.includes('autofill') ||
      lowerMessage.includes('populate')) {
    return {
      response: `🎯 **Auto-Fill Activated!**

I'm filling out the entire questionnaire with example data. This will take about 30-60 seconds.

**What's being filled:**
• Implementation Mode: Real Time B2B
• Organization: Aetna Health Insurance
• Contact: John Smith (john.smith@aetna.com)
• All ISA/GS segments configured
• All required fields

**I'll stop at the last section** so you can review before clicking "Complete Questionnaire".

You can modify any field after auto-fill completes!`,
      autoFillAction: { autoSubmit: false, implementationMode: 'real_time_b2b' }
    };
  }

  // Mode 3: Fill and submit (with confirmation)
  if ((lowerMessage.includes('fill') && lowerMessage.includes('submit')) ||
      (lowerMessage.includes('complete') && lowerMessage.includes('automatically'))) {
    return {
      response: `⚠️ **Auto-Submit Confirmation Required**

I can fill out the entire form AND submit it automatically. This will:
• Fill all sections with example data
• Navigate through all sections
• Click "Complete Questionnaire"
• **Submit to the database** (creates a real submission!)

**Are you sure you want to proceed?**

Reply with:
• **"confirm submit"** - Fill and submit automatically
• **"just fill"** - Fill only, I'll review and submit manually`
    };
  }

  // Handle confirmation for auto-submit
  if ((lowerMessage.includes('confirm') && lowerMessage.includes('submit')) ||
      lowerMessage === 'confirm submit') {
    return {
      response: `🚀 **Auto-Fill & Submit Activated!**

I'm filling out the entire questionnaire and will submit it automatically.

⏱️ This will take about 30-60 seconds. Watch as I:
1. Set implementation mode to Real Time B2B
2. Fill all sections with example data
3. Navigate through each section
4. Click "Complete Questionnaire"
5. Submit the form

Sit back and watch! 🎬`,
      autoFillAction: { autoSubmit: true, implementationMode: 'real_time_b2b' }
    };
  }

  // Handle "just fill" response
  if (lowerMessage.includes('just fill') || (lowerMessage.includes('fill') && lowerMessage.includes('only'))) {
    return {
      response: `✅ **Filling Form (No Submit)**

I'm filling out the questionnaire with example data in Real Time B2B mode. I'll stop at the last section so you can review before submitting.`,
      autoFillAction: { autoSubmit: false, implementationMode: 'real_time_b2b' }
    };
  }

  // Handle audience queries
  if (lowerMessage.includes('audience')) {
    return {
      response: `🎯 **Team Collaboration**

You can assign the sections to varied audiences of your implementation team to complete the work faster, they would get notifications when they are assigned to a section.

✅ **Benefits:**
• Faster completion through parallel work
• Automatic notifications to assigned team members
• Better organization of responsibilities`
    };
  }

  // Handle implementation guide queries
  if (lowerMessage.includes('implementation guide') || lowerMessage.includes('technical requirements')) {
    return {
      response: `📖 **Implementation Guide**

📋 **Technical Standards:**
Rules for format, content, and data element values for this transaction are listed in the following ASC X12 Technical Report Type 3 (TR3): Health Care Eligibility Benefit Inquiry and Response (270/271); version/release/industry identifier code: **005010X279**.

🔗 **Resources:**

💰 **Cost Information:**
<a href="http://www.wpc-edi.com/" target="_blank" rel="noopener noreferrer">http://www.wpc-edi.com/</a>

📋 **External Code Sets:**
<a href="https://x12.org/codes" target="_blank" rel="noopener noreferrer">https://x12.org/codes</a>`
    };
  }

  // ISA Field Explanations - Specific field queries
  // Handle voice input variations: "ISA05", "ISA 05", "ISA-05", "ISA zero five"
  if (lowerMessage.includes('isa05') ||
      lowerMessage.includes('isa 05') ||
      lowerMessage.includes('isa-05') ||
      lowerMessage.includes('isa zero five') ||
      lowerMessage.includes('isa 5') ||
      lowerMessage.includes('isa-5') ||
      /isa[\s-]*0?5/.test(lowerMessage)) {
    return {
      response: `📋 **ISA05 - Sender ID Qualifier**

**Purpose:** Identifies the type of organization sending the transaction.

**Field Details:**
• **Segment:** ISA05
• **Length:** 2 characters
• **Position:** Interchange Control Header

**Common Values:**
• **01** - DUNS (Data Universal Numbering System)
• **ZZ** - Mutually Defined

**For 270 Request:**
• Standard: 01
• Alternative: ZZ or custom value

**For 271 Response:**
• Standard: ZZ
• Alternative: Custom value

**Recommendation:** For most healthcare payers, use "01" for 270 requests. This is the most widely supported option in the industry.`
    };
  }

  if (lowerMessage.includes('isa06') ||
      lowerMessage.includes('isa 06') ||
      lowerMessage.includes('isa-06') ||
      lowerMessage.includes('isa zero six') ||
      lowerMessage.includes('isa 6') ||
      lowerMessage.includes('isa-6') ||
      /isa[\s-]*0?6/.test(lowerMessage)) {
    return {
      response: `📋 **ISA06 - Sender ID**

**Purpose:** The actual identification number of the sender organization.

**Field Details:**
• **Segment:** ISA06
• **Length:** 15 characters (max)
• **Position:** Interchange Control Header

**For 270 Request:**
• **Standard:** 030240928 (Availity defines)
• **Alternative:** Custom value (up to 15 chars)

**For 271 Response:**
• **Standard:** Availity defines
• **Alternative:** Custom value

**Important:** This value must match the qualifier type specified in ISA05. If ISA05 is "01" (DUNS), then ISA06 should be your DUNS number.

**Example:** If using Availity standard, ISA06 = "030240928"`
    };
  }

  if (lowerMessage.includes('isa07') ||
      lowerMessage.includes('isa 07') ||
      lowerMessage.includes('isa-07') ||
      lowerMessage.includes('isa zero seven') ||
      lowerMessage.includes('isa 7') ||
      lowerMessage.includes('isa-7') ||
      /isa[\s-]*0?7/.test(lowerMessage)) {
    return {
      response: `📋 **ISA07 - Receiver ID Qualifier**

**Purpose:** Identifies the type of organization receiving the transaction.

**Field Details:**
• **Segment:** ISA07
• **Length:** 2 characters
• **Position:** Interchange Control Header

**Common Values:**
• **01** - DUNS (Data Universal Numbering System)
• **ZZ** - Mutually Defined

**For 270 Request:**
• **Standard:** ZZ (fixed)
• Availity uses ZZ for routing

**For 271 Response:**
• **Standard:** 01
• **Alternative:** Custom value

**Note:** This must match the receiver's identification system. For Availity routing, use "ZZ" in 270 requests.`
    };
  }

  if (lowerMessage.includes('isa08') ||
      lowerMessage.includes('isa 08') ||
      lowerMessage.includes('isa-08') ||
      lowerMessage.includes('isa zero eight') ||
      lowerMessage.includes('isa 8') ||
      lowerMessage.includes('isa-8') ||
      /isa[\s-]*0?8/.test(lowerMessage)) {
    return {
      response: `📋 **ISA08 - Receiver ID**

**Purpose:** The actual identification number of the receiver organization.

**Field Details:**
• **Segment:** ISA08
• **Length:** 15 characters (max)
• **Position:** Interchange Control Header

**For 270 Request:**
• **Standard:** Availity defines (based on payer routing)
• **Alternative:** Custom value (e.g., 030240928)

**For 271 Response:**
• **Standard:** 030240928 (fixed)

**Important:**
• This value is typically assigned by Availity for routing purposes
• Must match the qualifier type in ISA07
• For 270 requests, Availity will populate this based on the target payer

**Example:** When sending to Availity, they define the receiver ID for proper routing.`
    };
  }

  if (lowerMessage.includes('isa11') ||
      lowerMessage.includes('isa 11') ||
      lowerMessage.includes('isa-11') ||
      lowerMessage.includes('isa eleven') ||
      /isa[\s-]*11/.test(lowerMessage)) {
    return {
      response: `📋 **ISA11 - Repetition Separator**

**Purpose:** Character used to separate repeated data elements within a segment.

**Field Details:**
• **Segment:** ISA11
• **Length:** 1 character
• **Position:** Interchange Control Header

**Standard Value:**
• **^** (caret/circumflex) - Availity standard

**For Both 270 Request & 271 Response:**
• **Standard:** ^ (caret)
• This is the industry standard

**Usage Example:**
When a field can have multiple values, they're separated by this character:
\`NM1*IL*1*SMITH*JOHN^MIDDLE~\`

**Recommendation:** Always use "^" (caret) as it's the Availity and industry standard. Do not change this unless specifically required by your trading partner.`
    };
  }

  if (lowerMessage.includes('isa16') ||
      lowerMessage.includes('isa 16') ||
      lowerMessage.includes('isa-16') ||
      lowerMessage.includes('isa sixteen') ||
      /isa[\s-]*16/.test(lowerMessage)) {
    return {
      response: `📋 **ISA16 - Component Element Separator**

**Purpose:** Character used to separate component data elements within a composite data structure.

**Field Details:**
• **Segment:** ISA16
• **Length:** 1 character
• **Position:** Interchange Control Header

**Standard Value:**
• **:** (colon) - Availity standard

**For 270 Request:**
• **Standard:** : (colon/composite separator)

**For 271 Response:**
• **Standard:** : (colon) - Availity standard
• **Alternatives:** * (asterisk), ~ (tilde)

**Usage Example:**
When a data element has sub-components:
\`REF*0F*123456:789~\`
The colon separates the composite parts.

**Recommendation:** Use ":" (colon) as it's the Availity standard. Only change if your trading partner specifically requires a different separator.`
    };
  }

  // GS Field Explanations
  if (lowerMessage.includes('gs02') ||
      lowerMessage.includes('gs 02') ||
      lowerMessage.includes('gs-02') ||
      lowerMessage.includes('gs zero two') ||
      lowerMessage.includes('gs 2') ||
      lowerMessage.includes('gs-2') ||
      /gs[\s-]*0?2/.test(lowerMessage)) {
    return {
      response: `📋 **GS02 - Application Sender Code**

**Purpose:** Identifies the application or location that is sending the functional group.

**Field Details:**
• **Segment:** GS02
• **Length:** 2-15 characters
• **Position:** Functional Group Header

**Common Values:**
• **030240928** - Availity standard
• **Availity defines** - Let Availity set the value
• **Custom value** - Your organization's code

**For 270 Request:**
• Standard: 030240928 or Availity defines
• Alternative: Custom value (2-15 chars)

**Important:** This should match your organization's sender identification. Often the same as ISA06 but at the application level rather than interchange level.

**Recommendation:** Use "030240928" or let Availity define it for consistency with ISA envelope.`
    };
  }

  if (lowerMessage.includes('gs03') ||
      lowerMessage.includes('gs 03') ||
      lowerMessage.includes('gs-03') ||
      lowerMessage.includes('gs zero three') ||
      lowerMessage.includes('gs 3') ||
      lowerMessage.includes('gs-3') ||
      /gs[\s-]*0?3/.test(lowerMessage)) {
    return {
      response: `📋 **GS03 - Application Receiver Code**

**Purpose:** Identifies the application or location that is receiving the functional group.

**Field Details:**
• **Segment:** GS03
• **Length:** 2-15 characters
• **Position:** Functional Group Header

**Common Values:**
• **030240928** - Standard value
• **Custom value** - Receiver's application code

**For 270 Request:**
• Standard: 030240928
• Alternative: Custom value (2-15 chars)

**Important:** This identifies the receiving application at the payer. Availity typically manages this value for proper routing to the correct payer system.

**Recommendation:** Use "030240928" or the value specified by your trading partner/payer.`
    };
  }

  // Payer-specific fields
  if (lowerMessage.includes('nm103') || lowerMessage.includes('payer name')) {
    return {
      response: `📋 **2100A NM103 - Payer Name**

**Purpose:** The official name of the payer organization in eligibility transactions.

**Field Details:**
• **Segment:** 2100A NM103
• **Length:** 1-35 characters
• **Loop:** 2100A (Payer Name)

**For 270 Request:**
• Define value: Maximum 35 characters
• Use official payer name

**Requirements:**
• Must be the legal or commonly recognized name
• Maximum 35 characters
• Should match payer's official records

**Example:** "AETNA HEALTH INSURANCE" or "BLUE CROSS BLUE SHIELD"

**Important:** This name must match what the payer expects to see in transactions for proper routing and processing.`
    };
  }

  if (lowerMessage.includes('nm109') || lowerMessage.includes('payer id')) {
    return {
      response: `📋 **2100A NM109 - Payer ID**

**Purpose:** The unique identifier for the payer organization.

**Field Details:**
• **Segment:** 2100A NM109
• **Length:** 2-80 characters
• **Loop:** 2100A (Payer Name)

**For 270 Request:**
• Define value: 2-80 characters
• Use payer's assigned ID

**Common ID Types:**
• **Payer ID** - Assigned by the payer
• **Tax ID** - Federal tax identification
• **NPI** - National Provider Identifier

**Example:** "12345" or "87726"

**Important:** This must be the ID that the payer recognizes for your organization. Contact your payer to confirm the correct ID to use.`
    };
  }

  // General ISA segment query (only if not asking about specific field)
  if ((lowerMessage.includes('isa segment') ||
       (lowerMessage.includes('isa') && lowerMessage.includes('what is isa') && !lowerMessage.match(/isa\s*\d/))) &&
      !lowerMessage.match(/isa\s*0?\d/)) {
    return {
      response: `📋 **ISA Segment - Interchange Control Header**

**Purpose:** The ISA segment is the outermost envelope in X12 EDI transactions. It controls the entire interchange between trading partners.

**Key ISA Fields:**

**ISA05** - Sender ID Qualifier (2 chars)
• Identifies sender type (01=DUNS, ZZ=Mutually Defined)

**ISA06** - Sender ID (15 chars)
• Your organization's unique identifier

**ISA07** - Receiver ID Qualifier (2 chars)
• Identifies receiver type

**ISA08** - Receiver ID (15 chars)
• Receiving organization's identifier

**ISA11** - Repetition Separator (1 char)
• Standard: ^ (caret)

**ISA16** - Component Element Separator (1 char)
• Standard: : (colon)

**Ask me about any specific ISA field!**
Examples: "What is ISA05?", "Explain ISA11", "Tell me about ISA16"`
    };
  }

  // General GS segment query (only if not asking about specific field)
  if ((lowerMessage.includes('gs segment') ||
       (lowerMessage.includes('gs') && lowerMessage.includes('what is gs') && !lowerMessage.match(/gs\s*\d/))) &&
      !lowerMessage.match(/gs\s*0?\d/)) {
    return {
      response: `📋 **GS Segment - Functional Group Header**

**Purpose:** The GS segment groups related transaction sets together within an interchange. It's the second level of enveloping after ISA.

**Key GS Fields:**

**GS02** - Application Sender Code (2-15 chars)
• Identifies the sending application
• Standard: 030240928 or Availity defines

**GS03** - Application Receiver Code (2-15 chars)
• Identifies the receiving application
• Standard: 030240928

**Relationship to ISA:**
• ISA = Interchange level (entire transmission)
• GS = Functional group level (related transactions)
• ST = Transaction set level (individual 270/271)

**Ask me about specific GS fields!**
Examples: "What is GS02?", "Explain GS03"`
    };
  }



  if (lowerMessage.includes('uppercase') || lowerMessage.includes('character')) {
    return {
      response: `**Character Set Requirements** ensure your system can process X12 data correctly.

**Uppercase Characters:** Availity's standard is uppercase. Most systems accept this.

**Spaces:** Part of X12 basic character set. Required for proper field formatting.

**Extended Characters:** Special characters beyond basic ASCII. Only enable if your system supports them.

**Recommendation:** Accept Availity's standards unless you have specific system limitations.`
    };
  }

  if (lowerMessage.includes('xml wrapper') || lowerMessage.includes('envelope')) {
    return {
      response: `**XML Wrapper** adds an XML envelope around your X12 transactions.

**When to Use:**
• Your system requires XML formatting
• You need additional metadata
• Integration with XML-based systems

**Standard Option:** Most implementations don't need XML wrapper - raw X12 format works fine.

**If Yes:** You'll need to provide XML envelope specifications as an attachment.`
    };
  }

  if ((lowerMessage.includes('implementation') && lowerMessage.includes('mode')) ||
      (lowerMessage.includes('differences') && lowerMessage.includes('real-time') && lowerMessage.includes('modes')) ||
      (lowerMessage.includes('choose') && lowerMessage.includes('implementation') && lowerMessage.includes('mode'))) {
    const currentMode = context?.implementationMode;
    const modeStatus = currentMode ? `\n**Current Selection:** ${
      currentMode === 'real_time_web' ? '🌐 Real-time Web' :
      currentMode === 'real_time_b2b' ? '🔗 Real-time B2B' :
      currentMode === 'edi_batch' ? '📦 EDI Batch' : currentMode
    }` : '';

    return {
      response: `**Implementation Modes** - Choose the transaction type that best fits your organization:

**🌐 Real-time Web Transaction**
Physicians and other healthcare professionals submit patient eligibility inquiries via Availity Essentials. Availity then formats the data into a valid HIPAA 270 request and routes it to the payer. The payer returns valid HIPAA 271 responses to Availity.

**Complete:** Standard sections (Trading partner documentation through Response) + Real-time web implementation sections.

**🔗 Real-time B2B Transaction**
Physicians and other healthcare professionals submit patient eligibility inquiry requests to Availity. Availity then routes the valid HIPAA 270 transaction to the assigned receiver. The receiver returns valid HIPAA 271 responses to Availity.

**Complete:** Standard sections (Trading partner documentation through Response) + Real-time B2B implementation sections.

**📦 EDI Batch Transaction**
Physicians and other healthcare professionals submit patient eligibility inquiry requests to Availity in batches. Availity then routes the valid HIPAA 270 transactions to the assigned receiver. The receiver returns valid HIPAA 271 responses to Availity.

**Complete:** Standard sections (Trading partner documentation through Response) + EDI batch implementation sections.${modeStatus}

${context?.currentSection ? `\n**Current Section:** ${context.currentSection}` : ''}

${currentMode ? 'Need help with your selected mode?' : 'Which mode fits your organization\'s technical capabilities?'}`
    };
  }

  if (lowerMessage.includes('isa') || lowerMessage.includes('segment')) {
    return {
      response: `**ISA Segments** are the foundation of X12 transactions - they're like the "envelope" for your data.

**Key ISA Fields:**
• **ISA05/ISA06:** Who's sending (Sender ID Qualifier/ID)
• **ISA07/ISA08:** Who's receiving (Receiver ID Qualifier/ID)
• **ISA11:** Repetition separator (usually ^)
• **ISA16:** Component separator (usually :)

**Think of it like:** Addressing an envelope - you need sender, receiver, and formatting rules.

**Pro Tip:** Use Availity's standard values unless you have specific regulatory requirements.

Need help with a specific ISA field?`
    };
  }

  if (lowerMessage.includes('enveloping') || lowerMessage.includes('envelope')) {
    return {
      response: `**Enveloping Requirements** define how your X12 transactions are packaged and transmitted.

**Components:**
• **ISA Envelope:** Interchange control (sender/receiver info)
• **GS Envelope:** Functional group (application routing)
• **Character Sets:** How text is formatted
• **Separators:** How data fields are divided

**Purpose:** Ensures your transactions are properly formatted and routable through Availity's network.

${context?.currentSection ? `**Current Section:** ${context.currentSection}` : ''}

Which specific enveloping field do you need help with?`
    };
  }

  // Section-specific help
  if (lowerMessage.includes('organization information') || (context?.currentSection?.toLowerCase().includes('organization') && lowerMessage.includes('help'))) {
    return {
      response: `**Organization Information** section collects basic details about your company.

**Required Fields:**
• **Organization Name:** Your official business name
• **Email:** Primary contact email for implementation
• **Phone:** Main business phone number
• **Address:** Business mailing address

**Tips:**
• Use your legal business name exactly as it appears on official documents
• Provide a monitored email address for important updates
• This information will be used for Availity's records and provider communications

${context?.currentSection ? `**Current Section:** ${context.currentSection}` : ''}

Need help with any specific organization field?`
    };
  }

  if (lowerMessage.includes('contact information') || (context?.currentSection?.toLowerCase().includes('contact') && lowerMessage.includes('help'))) {
    return {
      response: `**Contact Information** section identifies key people for your implementation.

**Contact Types Required:**
• **Trading Partner Technical Contact:** Your IT/technical lead
• **Availity Technical Contact:** Availity's assigned technical resource
• **Account/Program Managers:** Business relationship contacts
• **Escalation Contacts:** For urgent issues
• **Additional Contacts:** Other relevant team members

**For Each Contact:**
• Name (required)
• Phone number (required)
• Email address (required)

**Purpose:** Ensures smooth communication during implementation and ongoing support.

${context?.currentSection ? `**Current Section:** ${context.currentSection}` : ''}

Which contact type do you need help with?`
    };
  }

  // Handle SLA and internal Availity process questions (out of scope)
  if (lowerMessage.includes('sla') ||
      (lowerMessage.includes('how long') && (lowerMessage.includes('availity') || lowerMessage.includes('approve') || lowerMessage.includes('review'))) ||
      (lowerMessage.includes('how many days') && (lowerMessage.includes('availity') || lowerMessage.includes('approve') || lowerMessage.includes('review'))) ||
      (lowerMessage.includes('timeline') && lowerMessage.includes('approval')) ||
      (lowerMessage.includes('testing environment') && lowerMessage.includes('approval'))) {
    return {
      response: `I don't have information about Availity's internal SLA timelines or approval processes.

Would you like me to forward this question to the Availity admin team for a response?`
    };
  }

  // Handle "yes" response to escalation
  if ((lowerMessage === 'yes' || lowerMessage === 'yeah' || lowerMessage === 'sure' || lowerMessage === 'ok' || lowerMessage === 'okay') &&
      messages && messages.length > 0 &&
      messages[messages.length - 1]?.content?.includes('forward this question to the Availity admin')) {
    // Get the original question (2 messages back - user's question before the escalation prompt)
    const originalQuestion = messages.length >= 2 ? messages[messages.length - 2]?.content : 'User question';

    return {
      response: `✅ I've forwarded your question to the Availity admin team. They will respond to you shortly.

Your question: "${originalQuestion}"`
    };
  }

  // Handle "no" response to escalation
  if ((lowerMessage === 'no' || lowerMessage === 'nope' || lowerMessage === 'no thanks') &&
      messages && messages.length > 0 &&
      messages[messages.length - 1]?.content?.includes('forward this question to the Availity admin')) {
    return {
      response: `Okay, no problem. Is there anything else I can help you with?`
    };
  }

  // Default helpful response with real context
  const contextInfo = context?.currentSection ?
    `\n**Current Context:**
• Section: ${context.currentSection}
${context.implementationMode ? `• Mode: ${context.implementationMode.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}` : ''}
${context.sectionDescription ? `• About: ${context.sectionDescription}` : ''}` : '';

  return {
    response: `I'm here to help with your X12 270/271 questionnaire!

**I can explain:**
• ISA/GS segment fields and their purposes
• Implementation mode differences
• Enveloping requirements
• Character set and formatting options
• Best practices for your configuration${contextInfo}

**Try asking:**
• "What is ISA05?"
• "Help me choose implementation mode"
• "Explain enveloping requirements"
• "What are the character set options?"
${context?.currentSection ? `• "Help with ${context.currentSection}"` : ''}

What specific topic would you like help with?`
  };
}
