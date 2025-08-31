import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useLocation } from 'react-router-dom';
import { Section, Question, QuestionnaireResponse, QuestionType } from '../types/questionnaire';
import { QuestionRenderer } from './QuestionRenderer';
import { EnvelopingRequirementsTable } from './EnvelopingRequirementsTable';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface QuestionnaireWizardProps {
  sections: Section[];
  initialData?: QuestionnaireResponse;
  onSectionComplete: (sectionId: string, data: any) => void;
  onAutoSave: (sectionId: string, questionId: string, value: any) => void;
  onChatbotContextUpdate?: (context: any) => void;
}

export const QuestionnaireWizard: React.FC<QuestionnaireWizardProps> = ({
  sections,
  initialData,
  onSectionComplete,
  onAutoSave,
  onChatbotContextUpdate
}) => {
  const { user } = useAuth(); // Get authenticated user
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
  const [isLoadingEditData, setIsLoadingEditData] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  // Section Assignment State
  const [sectionAssignments, setSectionAssignments] = useState<Record<string, string>>({});
  const [showAssignDropdown, setShowAssignDropdown] = useState<string | null>(null);

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
    reset
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
          console.error('Error loading edit data:', error);
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
      console.error('Failed to load assignments:', error);
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



  const saveAssignments = (assignments: Record<string, string>) => {
    try {
      localStorage.setItem(getAssignmentStorageKey(), JSON.stringify(assignments));
      setSectionAssignments(assignments);
    } catch (error) {
      console.error('Failed to save assignments:', error);
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

  const handleNext = () => {
    if (currentSectionIndex < visibleSections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      scrollToTop(); // Scroll to top of page
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      scrollToTop(); // Scroll to top of page
    }
  };

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
          submittedByName: user ? `${user.name}` : 'Anonymous User'
        };

        console.log('Updating questionnaire:', updateData);
        const result = await apiService.updateQuestionnaire(draftResponseId, updateData);

        setSubmissionResult(result);
        console.log('Update successful:', result);
      } else {
        // Create new submission
        const submissionData = {
          organizationInfo,
          questionnaireData: allResponses,
          implementationMode: implementationMode || allResponses['implementation-mode-selection'],
          submittedBy: user?.email || 'anonymous',
          submittedByName: user ? `${user.name}` : 'Anonymous User'
        };

        console.log('Submitting questionnaire:', submissionData);
        const result = await apiService.submitQuestionnaire(submissionData);

        setSubmissionResult(result);
        console.log('Submission successful:', result);
      }

      // Show success modal
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Failed to submit questionnaire:', error);
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

      console.log('Saving draft:', draftData);

      // Save draft to API
      const result = await apiService.saveDraft(draftData);

      // Store the response ID for future updates
      setDraftResponseId(result.responseId);
      setDraftSaveMessage('Draft saved successfully!');

      console.log('Draft saved successfully:', result);

      // Clear message after 3 seconds
      setTimeout(() => {
        setDraftSaveMessage('');
      }, 3000);

    } catch (error) {
      console.error('Failed to save draft:', error);
      setDraftSaveMessage('Failed to save draft. Please try again.');

      // Clear error message after 5 seconds
      setTimeout(() => {
        setDraftSaveMessage('');
      }, 5000);
    } finally {
      setIsSavingDraft(false);
    }
  };

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
              onClick={() => console.log('View submission:', submissionResult.submissionId)}
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
      </form>

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
