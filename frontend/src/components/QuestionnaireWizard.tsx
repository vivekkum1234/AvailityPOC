import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Section, Question, QuestionnaireResponse, QuestionType } from '../types/questionnaire';
import { QuestionRenderer } from './QuestionRenderer';
import { EnvelopingRequirementsTable } from './EnvelopingRequirementsTable';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useExtractionData } from '../contexts/ExtractionDataContext';
import { transformExtractionDataForAutoFill } from '../utils/extractionDataTransformer';
import { getSampleDataForSection, getSectionsToFill } from '../utils/sampleDataGenerator';
import { AutoFillOptions, NavigationCallbacks, FieldUpdateCallback } from './chatbot/chatbot.types';
import { findMatchingQuestion, validateAndFormatValue } from '../utils/voiceFieldMatcher';

interface QuestionnaireWizardProps {
  sections: Section[];
  initialData?: QuestionnaireResponse;
  onSectionComplete: (sectionId: string, data: any) => void;
  onAutoSave: (sectionId: string, questionId: string, value: any) => void;
  onChatbotContextUpdate?: (context: any) => void;
  onAutoFillReady?: (callback: (options?: AutoFillOptions) => Promise<void>) => void;
  onNavigationReady?: (callbacks: NavigationCallbacks) => void;
  onFieldUpdateReady?: (callback: FieldUpdateCallback) => void;
}

export const QuestionnaireWizard: React.FC<QuestionnaireWizardProps> = ({
  sections,
  initialData,
  onSectionComplete,
  onAutoSave,
  onChatbotContextUpdate,
  onAutoFillReady,
  onNavigationReady,
  onFieldUpdateReady
}) => {
  const { user } = useAuth(); // Get authenticated user
  const { extractionData, clearExtractionData } = useExtractionData(); // Get PDF extraction data
  const { responseId } = useParams<{ responseId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Detect edit mode
  const isEditMode = location.pathname.includes('/edit/');

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [visibleQuestions, setVisibleQuestions] = useState<Question[]>([]);
  const [visibleSections, setVisibleSections] = useState<Section[]>([]);
  const [implementationMode, setImplementationMode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftResponseId, setDraftResponseId] = useState<string | null>(null);
  const [draftSaveMessage, setDraftSaveMessage] = useState<string>('');
  const [showExtractionBanner, setShowExtractionBanner] = useState(false);
  const [extractionFileName, setExtractionFileName] = useState<string>('');
  const [isLoadingEditData, setIsLoadingEditData] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  // Section Assignment State
  const [sectionAssignments, setSectionAssignments] = useState<Record<string, string>>({});
  const [showAssignDropdown, setShowAssignDropdown] = useState<string | null>(null);

  // Agentic Mode State
  const [agenticModeEnabled, setAgenticModeEnabled] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [agentStatus, setAgentStatus] = useState<'idle' | 'analyzing' | 'fixing' | 'creating-pr' | 'success' | 'error'>('idle');
  const [agentMessage, setAgentMessage] = useState('');
  const [prUrl, setPrUrl] = useState('');

  // Hardcoded users for assignment
  const availableUsers = [
    { id: 'bd7e174f-71b7-4c76-a13f-98a484f5ce5d', name: 'David Brown', email: 'support@availity.com' },
    { id: 'f706b57e-1c34-437d-b8b8-665a27a8a332', name: 'John Smith', email: 'admin@aetna.com' },
    { id: 'f7678e83-ad1c-4fac-9f9f-4075207648a8', name: 'Lisa Wilson', email: 'admin@availity.com' },
    { id: '69c33789-086f-4c6e-a6c9-21368e5afcc3', name: 'Mike Davis', email: 'admin@sample.com' },
    { id: '6ecb4b10-f6d4-4d18-a723-e3d1b7d1451e', name: 'Sarah Johnson', email: 'admin@valuelabs.com' }
  ];

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
    trigger
  } = useForm();

  const currentSection = visibleSections[currentSectionIndex];
  const watchedValues = watch();

  // Create a stable reference for conditional logic evaluation
  const [stableFormValues, setStableFormValues] = useState<Record<string, any>>({});

  // Update stable form values periodically to avoid constant re-renders
  useEffect(() => {
    const timer = setTimeout(() => {
      setStableFormValues({ ...responses, ...watchedValues });
    }, 100); // Debounce updates

    return () => clearTimeout(timer);
  }, [responses, watchedValues]);

  // Load initial data if provided (for editing existing drafts)
  useEffect(() => {
    if (initialData) {
      // Set the draft response ID if this is an existing draft
      if (initialData.id && (initialData.status === 'draft' || initialData.status === 'in_progress')) {
        setDraftResponseId(initialData.id);
      }

      // Load existing responses if available - flatten from sections structure
      if (initialData.sections && initialData.sections.length > 0) {
        const flatResponses: Record<string, any> = {};
        initialData.sections.forEach(section => {
          section.responses.forEach(response => {
            flatResponses[response.questionId] = response.value;
          });
        });

        setResponses(flatResponses);
        // Also set form values for immediate display
        Object.entries(flatResponses).forEach(([key, value]) => {
          setValue(key, value);
        });
      }

      // Set implementation mode if available
      if (initialData.implementationMode) {
        setImplementationMode(initialData.implementationMode);
      }
    }
  }, [initialData, setValue]);

  // Auto-fill from PDF extraction data - Step 1: Set mode
  useEffect(() => {
    if (extractionData && !implementationMode) {
      // Step 1: Set mode to Real-Time B2B first
      setImplementationMode('real_time_b2b');
      setValue('implementation-mode-selection', 'real_time_b2b');
      setResponses(prev => ({ ...prev, 'implementation-mode-selection': 'real_time_b2b' }));

      // Also trigger DOM event for the radio button to visually update
      setTimeout(() => {
        const radio = document.querySelector('[name="implementation-mode-selection"][value="real_time_b2b"]') as HTMLInputElement;
        if (radio) {
          radio.checked = true;
          radio.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, 100);

      // Show banner
      setShowExtractionBanner(true);
      setExtractionFileName(extractionData.fileName);
    }
  }, [extractionData, implementationMode, setValue]);

  // Load edit data when in edit mode
  useEffect(() => {
    const loadEditData = async () => {
      if (isEditMode && responseId) {
        try {
          setIsLoadingEditData(true);
          const data = await apiService.getSubmissionForEdit(responseId);

          setEditData(data);
          setDraftResponseId(data.responseId);
          setImplementationMode(data.implementationMode);

          // Set responses and form values
          setResponses(data.questionnaireData);
          Object.entries(data.questionnaireData).forEach(([key, value]) => {
            setValue(key, value);
          });

          // Set organization info in form
          if (data.organizationInfo) {
            setValue('organization-name', data.organizationInfo.name);
            setValue('organization-email', data.organizationInfo.email);
            setValue('organization-phone', data.organizationInfo.phone);
            setValue('organization-address', data.organizationInfo.address);
          }

        } catch (error) {
          alert('Failed to load submission data for editing');
        } finally {
          setIsLoadingEditData(false);
        }
      }
    };

    loadEditData();
  }, [isEditMode, responseId, setValue]);

  // Function to check if a section is completed (all required fields filled)
  const isSectionCompleted = (section: Section, formValues: Record<string, any>): boolean => {
    // For sections with enveloping requirements, check if all are filled
    if (section.envelopingRequirements && section.envelopingRequirements.length > 0) {
      return section.envelopingRequirements.every(req => {
        const req270Value = formValues[req.request270.id];
        const req271Value = formValues[req.response271.id];

        // Check if both 270 and 271 fields have values
        const has270Value = req270Value !== undefined && req270Value !== null && req270Value !== '';
        const has271Value = req271Value !== undefined && req271Value !== null && req271Value !== '';

        return has270Value && has271Value;
      });
    }

    // For regular sections, check required questions
    const requiredQuestions = section.questions.filter(q => q.required);

    // If no required questions, consider it completed
    if (requiredQuestions.length === 0) {
      return true;
    }

    // Check if all required questions have values
    return requiredQuestions.every(question => {
      const value = formValues[question.id];

      // For different question types, check if they have meaningful values
      if (question.type === 'checkbox' && Array.isArray(value)) {
        return value.length > 0;
      }

      return value !== undefined && value !== null && value !== '';
    });
  };

  // Update visible sections based on implementation mode
  useEffect(() => {
    const filtered = sections.filter(section => {
      // Always show organization info and mode selection sections
      if (['organization-info', 'implementation-mode'].includes(section.id)) {
        return true;
      }

      // If no mode selected yet, hide mode-specific sections
      if (!implementationMode) {
        return !section.conditionalLogic?.requiredModes;
      }

      // Check if section should be shown for current mode
      if (section.conditionalLogic?.requiredModes) {
        return section.conditionalLogic.requiredModes.includes(implementationMode as any);
      }

      // Show sections with conditional logic based on responses
      if (section.conditionalLogic?.dependsOn) {
        const dependentValue = stableFormValues[section.conditionalLogic.dependsOn];

        if (section.conditionalLogic.showWhen) {
          return section.conditionalLogic.showWhen.includes(dependentValue);
        }

        if (section.conditionalLogic.hideWhen) {
          return !section.conditionalLogic.hideWhen.includes(dependentValue);
        }
      }

      return true;
    });

    setVisibleSections(filtered);

    // Only reset current section index if it's out of bounds and we're not just adding mode-specific sections
    // This prevents unwanted scrolling when mode selection adds new sections
    if (currentSectionIndex >= filtered.length) {
      setCurrentSectionIndex(Math.max(0, filtered.length - 1));
    }
  }, [sections, implementationMode, stableFormValues, currentSectionIndex]);

  // Update visible questions based on conditional logic
  useEffect(() => {
    if (!currentSection) return;

    const filtered = currentSection.questions.filter(question => {
      if (!question.conditionalLogic) return true;

      const { dependsOn, showWhen, hideWhen } = question.conditionalLogic;

      if (dependsOn) {
        const dependentValue = stableFormValues[dependsOn];

        if (showWhen && !showWhen.includes(dependentValue)) {
          return false;
        }

        if (hideWhen && hideWhen.includes(dependentValue)) {
          return false;
        }
      }

      return true;
    });

    setVisibleQuestions(filtered);
  }, [currentSection, stableFormValues]);

  // Track implementation mode changes and notify chatbot
  useEffect(() => {
    const modeValue = stableFormValues['implementation-mode-selection'];
    if (modeValue && modeValue !== implementationMode) {
      // Save current scroll position to prevent unwanted scrolling
      const currentScrollY = window.scrollY;

      setImplementationMode(modeValue);

      // Restore scroll position after a brief delay to allow DOM updates
      setTimeout(() => {
        window.scrollTo(0, currentScrollY);
      }, 0);

      // Notify chatbot about mode selection and new sections
      if (onChatbotContextUpdate) {
        let modeLabel = '';
        let sectionCount = 0;
        let sectionNames = '';

        if (modeValue === 'real_time_web') {
          modeLabel = 'Real-time Web';
          sectionCount = 6;
          sectionNames = 'Payer ID and Name, Implementation States, Payer Logo, Connectivity, Testing, and Essentials Page Fields';
        } else if (modeValue === 'real_time_b2b') {
          modeLabel = 'Real-time B2B';
          sectionCount = 2;
          sectionNames = 'Connectivity (B2B) and Testing (B2B)';
        } else if (modeValue === 'edi_batch') {
          modeLabel = 'EDI Batch';
          sectionCount = 3;
          sectionNames = 'Connectivity (EDI Batch), File Structure and Naming, and Standard Aggregation Schedule';
        }

        if (sectionCount > 0) {
          onChatbotContextUpdate({
            currentSection: currentSection?.title,
            implementationMode: modeValue,
            sectionDescription: currentSection?.description,
            modeChangeNotification: {
              mode: modeLabel,
              sectionsAdded: sectionCount,
              sectionNames: sectionNames,
              message: `Great! You've selected ${modeLabel} mode. ${sectionCount} new sections have been added to your questionnaire: ${sectionNames}. Scroll down to see the new sections that are now available for completion.`
            }
          });
        }
      }
    }
  }, [stableFormValues, implementationMode, onChatbotContextUpdate, currentSection]);

  // Update chatbot context when section changes (without affecting progress logic)
  useEffect(() => {
    if (onChatbotContextUpdate && currentSection) {
      onChatbotContextUpdate({
        currentSection: currentSection.title,
        implementationMode,
        sectionDescription: currentSection.description
      });
    }
  }, [currentSection, implementationMode, onChatbotContextUpdate]);

  // Assignment Functions
  const getAssignmentStorageKey = () => {
    // Use responseId if in edit mode, otherwise use a temporary key
    const submissionId = responseId || 'current-submission';
    return `section-assignments-${submissionId}`;
  };

  const loadAssignments = useCallback(() => {
    try {
      const stored = localStorage.getItem(getAssignmentStorageKey());
      if (stored) {
        setSectionAssignments(JSON.parse(stored));
      }
    } catch (error) {
      // Silent error
    }
  }, [responseId]);

  // Load assignments on component mount
  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  // Close assignment dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowAssignDropdown(null);
    };

    if (showAssignDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showAssignDropdown]);

  // Auto-save on value change
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name && currentSection) {
        const questionValue = value[name];
        setResponses(prev => ({ ...prev, [name]: questionValue }));
        onAutoSave(currentSection.id, name, questionValue);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, currentSection, onAutoSave]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Agentic Mode Handlers
  const handleBrokenButtonClick = () => {
    setShowErrorPopup(true);
  };

  const handleTriggerAgent = async () => {
    try {
      setAgentStatus('analyzing');
      setAgentMessage('AI Agent is analyzing the codebase...');

      const response = await fetch('http://localhost:3002/api/ai-agent/fix-button', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          issue: 'Take Me Home button is broken - missing onClick handler to navigate to home page',
          file: 'frontend/src/components/QuestionnaireWizard.tsx',
          section: 'testing'
        })
      });

      const data = await response.json();

      if (data.success) {
        setAgentStatus('success');
        setAgentMessage(data.message || 'AI Agent successfully created a PR with the fix!');
        setPrUrl(data.prUrl || '');
      } else {
        setAgentStatus('error');
        setAgentMessage(data.error || 'Failed to trigger AI agent');
      }
    } catch (error) {
      console.error('Error triggering agent:', error);
      setAgentStatus('error');
      setAgentMessage('Failed to connect to AI agent service');
    }
  };



  const saveAssignments = (assignments: Record<string, string>) => {
    try {
      localStorage.setItem(getAssignmentStorageKey(), JSON.stringify(assignments));
      setSectionAssignments(assignments);
    } catch (error) {
      // Silent error
    }
  };

  const assignSection = (sectionId: string, userId: string) => {
    const newAssignments = { ...sectionAssignments, [sectionId]: userId };
    saveAssignments(newAssignments);
    setShowAssignDropdown(null);
  };

  const clearAssignment = (sectionId: string) => {
    const newAssignments = { ...sectionAssignments };
    delete newAssignments[sectionId];
    saveAssignments(newAssignments);
    setShowAssignDropdown(null);
  };

  const getAssignedUser = (sectionId: string) => {
    const userId = sectionAssignments[sectionId];
    return availableUsers.find(user => user.id === userId);
  };

  // Use refs for values that change frequently to keep callbacks stable
  const visibleSectionsRef = useRef(visibleSections);
  const currentSectionRef = useRef(currentSection);

  useEffect(() => {
    visibleSectionsRef