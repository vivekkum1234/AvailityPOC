import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useLocation } from 'react-router-dom';
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
    visibleSectionsRef.current = visibleSections;
  }, [visibleSections]);

  useEffect(() => {
    currentSectionRef.current = currentSection;
  }, [currentSection]);

  const handleNext = useCallback(() => {
    setCurrentSectionIndex(prev => {
      if (prev < visibleSectionsRef.current.length - 1) {
        scrollToTop();
        return prev + 1;
      }
      return prev;
    });
  }, []);

  const handlePrevious = useCallback(() => {
    setCurrentSectionIndex(prev => {
      if (prev > 0) {
        scrollToTop();
        return prev - 1;
      }
      return prev;
    });
  }, []);

  const handleSectionSubmit = async (data: any) => {
    // Save current section data
    onSectionComplete(currentSection.id, data);

    // If this is the last section, submit the entire questionnaire
    if (currentSectionIndex === visibleSections.length - 1) {
      await handleQuestionnaireSubmit();
    } else {
      handleNext();
    }
  };

  const handleQuestionnaireSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Collect all responses including current form data
      const allResponses = { ...responses, ...watchedValues };

      // Extract organization info from responses
      const organizationInfo = {
        name: allResponses['organization-name'] || 'Unknown Organization',
        email: allResponses['organization-email'] || '',
        phone: allResponses['organization-phone'] || '',
        address: allResponses['organization-address'] || ''
      };

      if (isEditMode && draftResponseId) {
        // Update existing submission
        const updateData = {
          organizationInfo,
          questionnaireData: allResponses,
          implementationMode: implementationMode || allResponses['implementation-mode-selection'],
          submittedBy: user?.email || 'anonymous',
          submittedByName: user ? `${user.name}` : 'Anonymous User',
          updatedBy: user?.email || 'anonymous',
          updatedByName: user ? `${user.name}` : 'Anonymous User'
        };

        const result = await apiService.updateQuestionnaire(draftResponseId, updateData);

        setSubmissionResult(result);
      } else {
        // Create new submission
        const submissionData = {
          organizationInfo,
          questionnaireData: allResponses,
          implementationMode: implementationMode || allResponses['implementation-mode-selection'],
          submittedBy: user?.email || 'anonymous',
          submittedByName: user ? `${user.name}` : 'Anonymous User'
        };

        const result = await apiService.submitQuestionnaire(submissionData);

        setSubmissionResult(result);
      }

      // Show success modal
      setShowSuccessModal(true);

    } catch (error) {
      alert('Failed to submit questionnaire. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true);
      setDraftSaveMessage('');

      // Collect all responses including current form data
      const allResponses = { ...responses, ...watchedValues };

      // Extract organization info from responses (only if available)
      const organizationInfo = allResponses['organization-name'] ? {
        name: allResponses['organization-name'],
        email: allResponses['organization-email'] || '',
        phone: allResponses['organization-phone'] || '',
        address: allResponses['organization-address'] || ''
      } : undefined;

      // Prepare draft data with authenticated user info
      const draftData = {
        organizationInfo,
        questionnaireData: allResponses,
        implementationMode: implementationMode || allResponses['implementation-mode-selection'],
        responseId: draftResponseId || undefined, // Include existing draft ID if updating
        submittedBy: user?.email || 'anonymous', // Use authenticated user email
        submittedByName: user ? `${user.name}` : 'Anonymous User' // Add user name for display
      };

      // Save draft to API
      const result = await apiService.saveDraft(draftData);

      // Store the response ID for future updates
      setDraftResponseId(result.responseId);
      setDraftSaveMessage('Draft saved successfully!');

      // Clear message after 3 seconds
      setTimeout(() => {
        setDraftSaveMessage('');
      }, 3000);

    } catch (error) {
      setDraftSaveMessage('Failed to save draft. Please try again.');

      // Clear error message after 5 seconds
      setTimeout(() => {
        setDraftSaveMessage('');
      }, 5000);
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Auto-fill handler for AI chatbot
  // Helper function to simulate typing animation
  const typeText = async (element: HTMLInputElement | HTMLTextAreaElement, text: string, speed: number = 50) => {
    element.focus();
    element.value = ''; // Clear first
    for (let i = 0; i <= text.length; i++) {
      element.value = text.substring(0, i);
      element.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, speed));
    }
    // Trigger final change event
    element.dispatchEvent(new Event('change', { bubbles: true }));
  };

  /**
   * ISOLATED PDF Auto-Fill Handler
   * This function is separate from the chatbot auto-fill to avoid breaking existing functionality
   * It uses the same DOM manipulation logic but with PDF extraction data
   */
  const handlePDFAutoFill = useCallback(async (pdfData: Record<string, any>) => {
    try {
      // Fill fields WITHOUT animation (instant fill)
      // Sort fields to ensure radio buttons are filled before their associated text inputs
      // This is important for enveloping requirements fields where text input visibility depends on radio selection
      const fieldEntries = Object.entries(pdfData).sort(([keyA], [keyB]) => {
        const isCustomA = keyA.endsWith('-custom');
        const isCustomB = keyB.endsWith('-custom');
        // Non-custom fields (radio buttons) come first
        if (!isCustomA && isCustomB) return -1;
        if (isCustomA && !isCustomB) return 1;
        return 0;
      });

      let successCount = 0;
      let failCount = 0;
      const failedFields: string[] = [];

      for (let i = 0; i < fieldEntries.length; i++) {
        const [fieldId, value] = fieldEntries[i];

        // For -custom fields, wait a bit for the radio button to trigger DOM update
        if (fieldId.endsWith('-custom')) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Find the input element
        const element = document.querySelector(`[name="${fieldId}"]`) as HTMLElement | null;

        if (element) {
          // Handle different field types with proper DOM events
          if (Array.isArray(value)) {
            // Multi-select checkbox - check each option
            for (const optionValue of value) {
              const checkbox = document.querySelector(`[name="${fieldId}"][value="${optionValue}"]`) as HTMLInputElement;
              if (fieldId === 'supported-search-options') {
                console.log(`[DEBUG] Checkbox for ${optionValue}:`, checkbox, checkbox?.checked);
              }
              if (checkbox) {
                checkbox.checked = true;
                checkbox.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
            setValue(fieldId, value);
            successCount++;
          } else if (element.tagName === 'SELECT') {
            // Dropdown select
            const selectElement = element as HTMLSelectElement;
            selectElement.value = String(value);
            selectElement.dispatchEvent(new Event('change', { bubbles: true }));
            setValue(fieldId, value);
            successCount++;
          } else if (element.tagName === 'INPUT' && (element as HTMLInputElement).type === 'radio') {
            // Radio button - find the specific radio with matching value
            const radio = document.querySelector(`[name="${fieldId}"][value="${value}"]`) as HTMLInputElement;
            if (radio) {
              radio.checked = true;
              radio.dispatchEvent(new Event('change', { bubbles: true }));
              setValue(fieldId, value);
              successCount++;
            } else {
              // Try setting value anyway
              setValue(fieldId, value);
              failCount++;
              failedFields.push(fieldId);
            }
          } else if (element.tagName === 'INPUT' && (element as HTMLInputElement).type === 'checkbox') {
            // Single checkbox
            const checkboxElement = element as HTMLInputElement;
            checkboxElement.checked = Boolean(value);
            checkboxElement.dispatchEvent(new Event('change', { bubbles: true }));
            setValue(fieldId, value);
            successCount++;
          } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            // Text input or textarea - set value directly (no typing animation)
            const inputElement = element as HTMLInputElement | HTMLTextAreaElement;
            inputElement.value = String(value);
            inputElement.dispatchEvent(new Event('input', { bubbles: true }));
            inputElement.dispatchEvent(new Event('change', { bubbles: true }));
            setValue(fieldId, value);
            successCount++;
          } else {
            // Other types - set directly
            setValue(fieldId, value);
            successCount++;
          }

          // Update responses state
          setResponses(prev => ({ ...prev, [fieldId]: value }));

          // Trigger auto-save for the section that contains this field
          const fieldSection = sections.find(s =>
            s.questions?.some(q => q.id === fieldId)
          );
          if (fieldSection) {
            onAutoSave(fieldSection.id, fieldId, value);
          }
        } else {
          // Still set the value even if element not found
          setValue(fieldId, value);
          setResponses(prev => ({ ...prev, [fieldId]: value }));
          failCount++;
          failedFields.push(fieldId);
        }
      }

      // Silent completion

      // PDF AUTO-FILL SPECIFIC: Force re-validation to update section completion status
      // This is needed because enveloping requirements fields are filled via DOM manipulation
      // and the form state needs to be synchronized with the DOM values
      setTimeout(() => {
        // Trigger form validation to update watchedValues
        trigger();

        // Force a state update to trigger re-render of section completion indicators
        // This ensures the "Enveloping Requirements" section shows as completed
        setResponses(prev => ({ ...prev }));
      }, 300);
    } catch (error) {
      // Silent error handling
    }
  }, [sections, setValue, setResponses, onAutoSave, trigger]);

  // Auto-fill from PDF extraction data - Step 2: Fill fields after mode is set
  // This useEffect is placed AFTER handlePDFAutoFill is defined to avoid "used before declaration" error
  useEffect(() => {
    if (extractionData && implementationMode === 'real_time_b2b' && visibleSections.length > 0 && visibleQuestions.length > 0) {
      // Transform extraction data to flat format with value validation
      const transformedData = transformExtractionDataForAutoFill(extractionData, sections);

      // Wait for DOM to be fully ready, then fill
      // Increased timeout to 1200ms to ensure enveloping requirements table and all sections are rendered
      setTimeout(() => {
        handlePDFAutoFill(transformedData);
      }, 1200);
    }
  }, [extractionData, implementationMode, visibleSections, visibleQuestions, sections, handlePDFAutoFill]);

  const handleAutoFillRequest = useCallback(async (options?: AutoFillOptions) => {
    const { autoSubmit = false, sectionId, implementationMode: optionsMode } = options || {};

    try {
      // Use implementation mode from options, or fall back to current mode, or default to 'real_time_b2b'
      const modeToUse = optionsMode || implementationMode || 'real_time_b2b';

      // If implementation mode is not set yet, set it first
      if (!implementationMode && modeToUse) {
        setImplementationMode(modeToUse);
        setValue('implementation-mode', modeToUse);

        // Wait for the state to update and sections to become visible
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Determine which sections to fill
      let sectionsToFill: Section[];

      if (sectionId) {
        // Fill only specific section
        const section = sections.find(s => s.id === sectionId);
        sectionsToFill = section ? [section] : [];
      } else {
        // Fill all sections based on implementation mode
        const sectionIdsToFill = getSectionsToFill(modeToUse);
        sectionsToFill = sections.filter(s => sectionIdsToFill.includes(s.id));
      }

      // Fill each section with animation
      for (let i = 0; i < sectionsToFill.length; i++) {
        const section = sectionsToFill[i];
        const sampleData = getSampleDataForSection(section.id, { implementationMode: modeToUse });

        // Skip sections with no data
        if (Object.keys(sampleData).length === 0) {
          continue;
        }

        // Navigate to this section for visual effect
        // Wait for sections to become visible first
        await new Promise(resolve => setTimeout(resolve, 300));

        // Find the section in visible sections after state updates
        const sectionIndex = sections.findIndex(s => s.id === section.id);
        if (sectionIndex !== -1) {
          setCurrentSectionIndex(sectionIndex);
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait for navigation animation
        }

        // Fill fields with typing animation
        const fieldEntries = Object.entries(sampleData);
        for (let j = 0; j < fieldEntries.length; j++) {
          const [fieldId, value] = fieldEntries[j];

          // Small delay before starting to fill the field
          await new Promise(resolve => setTimeout(resolve, 300));

          // Find the input element
          const element = document.querySelector(`[name="${fieldId}"]`) as HTMLInputElement | HTMLTextAreaElement | null;

          if (element) {
            // Add visual highlight effect
            element.classList.add('auto-fill-highlight');
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Handle different field types
            if (Array.isArray(value)) {
              // Checkbox - select each option with delay
              for (const optionValue of value) {
                const checkbox = document.querySelector(`[name="${fieldId}"][value="${optionValue}"]`) as HTMLInputElement;
                if (checkbox) {
                  await new Promise(resolve => setTimeout(resolve, 400));
                  checkbox.checked = true;
                  checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
              }
              setValue(fieldId, value);
            } else if (element.tagName === 'INPUT' && (element as HTMLInputElement).type === 'radio') {
              // Radio button
              const radio = document.querySelector(`[name="${fieldId}"][value="${value}"]`) as HTMLInputElement;
              if (radio) {
                await new Promise(resolve => setTimeout(resolve, 400));
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
              }
              setValue(fieldId, value);
            } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
              // Text input or textarea - type letter by letter
              const textValue = String(value);
              await typeText(element, textValue, 50); // 50ms per character for visible typing
              setValue(fieldId, value);
            } else {
              // Other types - set directly
              setValue(fieldId, value);
            }

            // Update responses state
            setResponses(prev => ({ ...prev, [fieldId]: value }));

            // Trigger auto-save
            onAutoSave(section.id, fieldId, value);

            // Remove highlight after a delay
            setTimeout(() => {
              element.classList.remove('auto-fill-highlight');
            }, 1000);
          } else {
            // Still set the value even if element not found
            setValue(fieldId, value);
            setResponses(prev => ({ ...prev, [fieldId]: value }));
            onAutoSave(section.id, fieldId, value);
          }
        }

        // Brief pause before moving to next section
        if (i < sectionsToFill.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      // Auto-submit if requested
      if (autoSubmit) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause before submit
        await handleQuestionnaireSubmit();
      }
    } catch (error) {
      alert('Auto-fill failed. Please try again.');
    }
  }, [visibleSections, implementationMode, currentSectionIndex, setValue, onAutoSave, handleNext, handleQuestionnaireSubmit]);

  // Register auto-fill handler with parent component
  useEffect(() => {
    if (onAutoFillReady) {
      onAutoFillReady(handleAutoFillRequest);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onAutoFillReady]);

  // Create stable callback for section navigation
  const handleGoToSection = useCallback((sectionName: string) => {
    const normalizedInput = sectionName.toLowerCase().trim();

    // Try to find matching section
    const matchIndex = visibleSectionsRef.current.findIndex(section => {
      const normalizedTitle = section.title.toLowerCase();

      // Exact match
      if (normalizedTitle === normalizedInput) return true;

      // Contains match
      if (normalizedTitle.includes(normalizedInput)) return true;

      // Partial word match
      const words = normalizedTitle.split(/[\s\-()]+/);
      return words.some(word => word.toLowerCase() === normalizedInput);
    });

    if (matchIndex !== -1) {
      setCurrentSectionIndex(matchIndex);
      scrollToTop();
      return true;
    }

    return false;
  }, []);

  // Create stable navigation callbacks
  const stableNavigationCallbacks = useCallback((): NavigationCallbacks => ({
    onNext: handleNext,
    onPrevious: handlePrevious,
    onGoToSection: handleGoToSection,
    getSectionNames: () => visibleSectionsRef.current.map(s => s.title),
    getCurrentSectionName: () => currentSectionRef.current?.title || ''
  }), [handleNext, handlePrevious, handleGoToSection]);

  // Register navigation callbacks with parent component
  useEffect(() => {
    if (onNavigationReady) {
      onNavigationReady(stableNavigationCallbacks());
    }
  }, [onNavigationReady, stableNavigationCallbacks]);

  // Field update handler for voice commands
  const handleFieldUpdate = useCallback(async (fieldName: string, fieldValue: string): Promise<{ success: boolean; message: string }> => {
    if (!currentSection) {
      return { success: false, message: 'No section is currently active' };
    }

    // Get visible questions in current section
    const currentQuestions = visibleQuestions;

    // Find matching question
    const matchedQuestion = findMatchingQuestion(fieldName, currentQuestions);

    if (!matchedQuestion) {
      return { success: false, message: `I couldn't find a field matching "${fieldName}" in this section` };
    }

    // Validate and format the value
    const validation = validateAndFormatValue(fieldValue, matchedQuestion);

    if (!validation.valid) {
      return { success: false, message: validation.error || 'Invalid value for this field' };
    }

    const formattedValue = validation.formattedValue!;

    // Update the form
    setValue(matchedQuestion.id, formattedValue);
    setResponses(prev => ({ ...prev, [matchedQuestion.id]: formattedValue }));
    onAutoSave(currentSection.id, matchedQuestion.id, formattedValue);

    // Add visual highlight
    const element = document.querySelector(`[name="${matchedQuestion.id}"]`) as HTMLElement;
    if (element) {
      element.classList.add('auto-fill-highlight');
      setTimeout(() => {
        element.classList.remove('auto-fill-highlight');
      }, 1000);
    }

    // Get a friendly field name for the response
    const friendlyFieldName = matchedQuestion.title.length > 50
      ? matchedQuestion.title.substring(0, 50) + '...'
      : matchedQuestion.title;

    // Get a friendly value for the response
    let friendlyValue = formattedValue;
    if (matchedQuestion.options) {
      const option = matchedQuestion.options.find(opt => opt.value === formattedValue);
      if (option) {
        friendlyValue = option.label;
      }
    }

    return {
      success: true,
      message: `Set ${friendlyFieldName} to ${friendlyValue}`
    };
  }, [currentSection, visibleQuestions, setValue, setResponses, onAutoSave]);

  // Use a ref to store the latest callback
  const handleFieldUpdateRef = useRef(handleFieldUpdate);

  // Update the ref whenever the callback changes
  useEffect(() => {
    handleFieldUpdateRef.current = handleFieldUpdate;
  }, [handleFieldUpdate]);

  // Create a stable wrapper function that always calls the latest callback
  const stableFieldUpdateCallback = useCallback(async (fieldName: string, fieldValue: string) => {
    return handleFieldUpdateRef.current(fieldName, fieldValue);
  }, []);

  // Register field update callback with parent component (only once)
  useEffect(() => {
    if (onFieldUpdateReady) {
      onFieldUpdateReady(stableFieldUpdateCallback);
    }
  }, [onFieldUpdateReady, stableFieldUpdateCallback]);

  const calculateProgress = () => {
    return ((currentSectionIndex + 1) / visibleSections.length) * 100;
  };

  if (!currentSection) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-400 to-availity-500 rounded-full flex items-center justify-center shadow-large">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Questionnaire Complete!</h2>
        <p className="text-lg text-gray-600 mb-4 max-w-md mx-auto">
          Congratulations! You've successfully completed your X12 270/271 implementation questionnaire.
        </p>

        {submissionResult && (
          <div className="bg-success-50 border border-success-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-success-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-success-800 font-medium">Successfully submitted!</span>
            </div>
            <p className="text-success-700 text-sm mt-1">
              Submission ID: {submissionResult.submissionId?.slice(0, 8)}...
            </p>
            <p className="text-success-700 text-sm">
              Submitted at: {new Date(submissionResult.submittedAt).toLocaleString()}
            </p>
          </div>
        )}

        <div className="flex justify-center space-x-4">
          <button className="btn-primary">
            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Summary
          </button>
          {submissionResult && (
            <button
              className="btn-secondary"
              onClick={() => {}}
            >
              View Submission
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Enhanced Progress Bar */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-gray-600">
                {currentSectionIndex + 1}
              </span>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-800">
                Section {currentSectionIndex + 1} of {visibleSections.length}
              </span>
              <p className="text-xs text-gray-500">
                {currentSection.title}
              </p>
              {implementationMode && (
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-availity-100 text-availity-800">
                    {implementationMode === 'real_time_web' && 'Real-time Web'}
                    {implementationMode === 'real_time_b2b' && 'Real-time B2B'}
                    {implementationMode === 'edi_batch' && 'EDI Batch'}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-availity-600">
              {Math.round(calculateProgress())}%
            </span>
            <p className="text-xs text-gray-500">Complete</p>
          </div>
        </div>

        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-primary-400 to-availity-500 h-3 rounded-full transition-all duration-500 ease-out shadow-soft relative overflow-hidden"
              style={{ width: `${calculateProgress()}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-between mt-2">
            {visibleSections.map((section, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  isSectionCompleted(section, { ...responses, ...watchedValues }) && index !== currentSectionIndex
                    ? 'bg-success-500 shadow-soft'
                    : index === currentSectionIndex
                    ? 'bg-availity-500 shadow-medium animate-pulse-soft'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Section Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-6 shadow-soft">
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">
          {currentSection.title}
        </h1>
        {currentSection.description && (
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {currentSection.description}
          </p>
        )}
        <div className="mt-6 flex justify-center">
          <div className="inline-flex items-center px-4 py-2 bg-primary-50 rounded-full border border-primary-200">
            <svg className="w-4 h-4 text-availity-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-availity-700">
              {(() => {
                // For sections with enveloping requirements, count those instead of regular questions
                if (currentSection?.envelopingRequirements && currentSection.envelopingRequirements.length > 0) {
                  return currentSection.envelopingRequirements.length;
                }
                // For regular sections, count non-display questions
                return visibleQuestions.filter(q => q.type !== QuestionType.DISPLAY).length;
              })()} question{(() => {
                const count = currentSection?.envelopingRequirements && currentSection.envelopingRequirements.length > 0
                  ? currentSection.envelopingRequirements.length
                  : visibleQuestions.filter(q => q.type !== QuestionType.DISPLAY).length;
                return count !== 1 ? 's' : '';
              })()} in this section
            </span>
          </div>
        </div>
      </div>

      {/* Agentic Mode Toggle - Only show in Testing section */}
      {(currentSection?.id === 'testing' || currentSection?.id === 'testing-b2b') && (
        <div className="mb-6 flex justify-end">
          <div className="flex items-center space-x-3 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-sm font-bold text-red-700">Agentic Mode</span>
            </div>
            <button
              type="button"
              onClick={() => setAgenticModeEnabled(!agenticModeEnabled)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                agenticModeEnabled ? 'bg-red-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                  agenticModeEnabled ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            {agenticModeEnabled && (
              <span className="text-xs font-semibold text-red-600 animate-pulse">ON</span>
            )}
          </div>
        </div>
      )}

      {/* PDF Extraction Banner */}
      {showExtractionBanner && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start justify-between animate-fade-in">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-blue-900">Form Pre-filled from PDF Extraction</h3>
              <p className="text-sm text-blue-700 mt-1">
                Values from <span className="font-medium">{extractionFileName}</span> have been automatically populated in the form.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowExtractionBanner(false)}
            className="text-blue-400 hover:text-blue-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Enhanced Questions Form */}
      <form onSubmit={handleSubmit(handleSectionSubmit)} className="space-y-8">
        {/* Custom Component Rendering */}
        {currentSection?.customComponent === 'EnvelopingRequirementsTable' && currentSection.envelopingRequirements && (
          <div className="card p-8 animate-slide-up">
            <EnvelopingRequirementsTable
              requirements={currentSection.envelopingRequirements}
              responses={responses}
              onResponseChange={(fieldId, value) => {
                setValue(fieldId, value);
                onAutoSave(currentSection.id, fieldId, value);
              }}
            />
          </div>
        )}

        {visibleQuestions.map((question, index) => {
          // Handle DISPLAY questions differently - render as section headers without cards
          if (question.type === QuestionType.DISPLAY) {
            return (
              <QuestionRenderer
                key={question.id}
                question={question}
                value={watchedValues[question.id]}
                onChange={(value) => setValue(question.id, value)}
                error={errors[question.id]?.message as string}
              />
            );
          }

          // Calculate the question number excluding display questions
          const questionNumber = visibleQuestions
            .slice(0, index)
            .filter(q => q.type !== QuestionType.DISPLAY).length + 1;

          return (
            <div
              key={question.id}
              className="card p-8 animate-slide-up hover:shadow-large transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-sm font-bold text-gray-600">
                    {questionNumber}
                  </span>
                </div>
                <div className="flex-1">
                  <QuestionRenderer
                    question={question}
                    value={watchedValues[question.id]}
                    onChange={(value) => setValue(question.id, value)}
                    error={errors[question.id]?.message as string}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {/* Enhanced Navigation Buttons */}
        <div className="flex justify-between items-center pt-12 mt-12 border-t border-gray-200">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentSectionIndex === 0}
            className={`
              flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200
              ${currentSectionIndex === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'btn-secondary hover:scale-105'
              }
            `}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
              className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 border ${
                isSavingDraft
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200 hover:shadow-soft'
              }`}
            >
              {isSavingDraft ? (
                <>
                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Save Draft
                </>
              )}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`btn-primary flex items-center ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {currentSectionIndex === visibleSections.length - 1 ? (
                <>
                  {isSubmitting ? (
                    <>
                      <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {isEditMode ? 'Update Implementation' : 'Complete Questionnaire'}
                    </>
                  )}
                </>
              ) : (
                <>
                  Continue
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Broken "Take Me Home" Button - Only shows when Agentic Mode is ON and in Testing section */}
        {agenticModeEnabled && (currentSection?.id === 'testing' || currentSection?.id === 'testing-b2b') && (
          <div className="mt-8 p-6 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-900 mb-2">🤖 Agentic Mode Demo</h3>
                <p className="text-sm text-yellow-800 mb-4">
                  This button is intentionally broken to demonstrate the AI agent's ability to detect and fix issues automatically.
                </p>
                <button
                  type="button"
                  onClick={handleBrokenButtonClick}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Take Me Home</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Error Popup Modal */}
      {showErrorPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-slide-up">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Something's Wrong!</h2>
              <p className="text-gray-600 text-center mb-6">
                It's not working. The button doesn't seem to do anything.
              </p>

              {agentStatus === 'idle' && (
                <div className="space-y-3">
                  <button
                    onClick={handleTriggerAgent}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>🤖 Call AI Agent to Fix It</span>
                  </button>
                  <button
                    onClick={() => setShowErrorPopup(false)}
                    className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              )}

              {agentStatus === 'analyzing' && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
                  <p className="text-purple-600 font-semibold">{agentMessage}</p>
                </div>
              )}

              {agentStatus === 'success' && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-green-800 font-semibold mb-2">{agentMessage}</p>
                        {prUrl && (
                          <a
                            href={prUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center space-x-1"
                          >
                            <span>View Pull Request</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowErrorPopup(false);
                      setAgentStatus('idle');
                    }}
                    className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              )}

              {agentStatus === 'error' && (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{agentMessage}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowErrorPopup(false);
                      setAgentStatus('idle');
                    }}
                    className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Draft Save Message */}
      {draftSaveMessage && (
        <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
          draftSaveMessage.includes('successfully')
            ? 'bg-success-50 text-success-700 border border-success-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <div className="flex items-center">
            {draftSaveMessage.includes('successfully') ? (
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {draftSaveMessage}
          </div>
        </div>
      )}

      {/* Enhanced Section Navigation */}
      <div className="mt-16 pt-12 border-t border-gray-200">
        <div className="text-center mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">All Sections</h3>
          <p className="text-sm text-gray-600">Jump to any section or review your progress</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleSections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => {
                setCurrentSectionIndex(index);
                scrollToTop();
              }}
              className={`
                group relative p-6 text-left rounded-2xl border-2 transition-all duration-300 ${showAssignDropdown === section.id ? '' : 'hover:scale-105'}
                ${index === currentSectionIndex
                  ? 'border-availity-500 bg-primary-50 shadow-medium'
                  : isSectionCompleted(section, { ...responses, ...watchedValues })
                  ? 'border-success-300 bg-success-50 shadow-soft hover:shadow-medium'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-soft'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3
                      ${index === currentSectionIndex
                        ? 'bg-availity-500 text-white'
                        : isSectionCompleted(section, { ...responses, ...watchedValues })
                        ? 'bg-success-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                      }
                    `}>
                      {isSectionCompleted(section, { ...responses, ...watchedValues }) && index !== currentSectionIndex ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className={`
                      text-sm font-semibold
                      ${index === currentSectionIndex
                        ? 'text-availity-700'
                        : isSectionCompleted(section, { ...responses, ...watchedValues })
                        ? 'text-success-700'
                        : 'text-gray-700'
                      }
                    `}>
                      {section.title}
                    </span>
                  </div>

                  {/* Assignment Section */}
                  <div className="mt-3 relative">
                    {getAssignedUser(section.id) ? (
                      <div className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-xs font-bold text-white">
                              {getAssignedUser(section.id)?.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-blue-800">
                              {getAssignedUser(section.id)?.name}
                            </div>
                            <div className="text-xs text-blue-600">
                              Assigned
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAssignDropdown(showAssignDropdown === section.id ? null : section.id);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded-md hover:bg-blue-100 transition-all duration-200"
                          >
                            Change
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearAssignment(section.id);
                            }}
                            className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded-md hover:bg-red-100 transition-all duration-200"
                          >
                            Unassign
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAssignDropdown(showAssignDropdown === section.id ? null : section.id);
                        }}
                        className="flex items-center justify-center space-x-2 w-full p-2 text-xs text-gray-600 hover:text-availity-600 border-2 border-dashed border-gray-300 hover:border-availity-400 rounded-lg transition-all duration-200 hover:bg-availity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        <span className="font-medium">Assign Section</span>
                      </button>
                    )}

                    {/* Enhanced Assignment Dropdown */}
                    {showAssignDropdown === section.id && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl z-[60] pointer-events-auto">
                        <div className="p-1">
                          <div className="px-3 py-2 border-b border-gray-100">
                            <div className="text-xs font-semibold text-gray-800 mb-1">Assign Section To:</div>
                            <div className="text-xs text-gray-500">Select a team member</div>
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {availableUsers.map((user) => (
                              <button
                                key={user.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  assignSection(section.id, user.id);
                                }}
                                className="w-full text-left px-3 py-3 hover:bg-gray-50 flex items-center space-x-3 group"
                              >
                                <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center shadow-sm">
                                  <span className="text-xs font-bold text-white">
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 group-hover:text-availity-700">
                                    {user.name}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate">
                                    {user.email}
                                  </div>
                                </div>
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-availity-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Mode Badge */}
                {section.modeLabel && (
                  <div className="absolute -top-2 -right-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      {section.modeLabel}
                    </span>
                  </div>
                )}

                {/* Current Section Indicator */}
                {index === currentSectionIndex && !section.modeLabel && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-availity-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>

              <div className={`
                mt-4 text-xs font-medium
                ${index === currentSectionIndex
                  ? 'text-availity-600'
                  : isSectionCompleted(section, { ...responses, ...watchedValues })
                  ? 'text-success-600'
                  : 'text-gray-400'
                }
              `}>
                {isSectionCompleted(section, { ...responses, ...watchedValues }) && index !== currentSectionIndex
                  ? 'Completed'
                  : index === currentSectionIndex
                  ? 'In Progress'
                  : 'Pending'
                }
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-scale-in">
            <div className="text-center">
              {/* Large Success Icon with Animation */}
              <div className="relative mx-auto mb-6">
                {/* Outer Ring with Pulse Animation */}
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                  {/* Inner Success Checkmark */}
                  <svg className="w-12 h-12 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {/* Success Ring Effect */}
                <div className="absolute inset-0 w-24 h-24 mx-auto border-4 border-green-200 rounded-full animate-ping"></div>
              </div>

              {/* Success Message */}
              <h2 className="text-3xl font-bold text-gray-900 mb-3 animate-fade-in">
                🎉 Successfully Submitted!
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                Your X12 270/271 implementation questionnaire has been submitted successfully.
                <br />
                <span className="text-green-600 font-semibold">Thank you for completing the questionnaire!</span>
              </p>

              {/* Action Button */}
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  // Redirect to homepage
                  window.location.href = '/';
                }}
                className="w-full bg-gradient-to-r from-primary-500 to-availity-500 text-white font-semibold py-4 px-6 rounded-xl hover:from-primary-600 hover:to-availity-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🏠 Go to Homepage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
