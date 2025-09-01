import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { QuestionnaireWizard } from './QuestionnaireWizard';
import { ImplementationsList } from '../pages/ImplementationsList';
import { UserManagement } from '../pages/UserManagement';
import { PayerConfigurations } from './PayerConfigurations';
import { PayerTesting } from './PayerTesting';
import { AIChatbotContainer } from './chatbot';
import { apiService } from '../services/api';
import { Section, QuestionnaireResponse } from '../types/questionnaire';
import { useAuth } from '../contexts/AuthContext';

type TabId = 'dashboard' | 'questionnaire' | 'implementations' | 'configurations' | 'testing' | 'users';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
}

// Header Actions Component
const HeaderActions: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="flex items-center space-x-4">
      {/* User Welcome & Logout */}
      {user && (
        <div className="flex items-center space-x-4">
          {/* Welcome Message */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-availity-500 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-sm font-semibold text-white">
                {user.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="text-sm">
              <div className="text-gray-500 text-xs">Welcome back,</div>
              <div className="font-semibold text-gray-900">{user.name}</div>
            </div>
          </div>

          {/* Assignment Notification Bell - Only for David Brown */}
          {user.email === 'support@availity.com' && (() => {
            // Check if David Brown has any assignments
            const getAssignmentStorageKey = () => {
              const submissionId = 'current-submission'; // Default key for new submissions
              return `section-assignments-${submissionId}`;
            };

            const checkDavidAssignments = () => {
              try {
                const stored = localStorage.getItem(getAssignmentStorageKey());
                if (stored) {
                  const assignments = JSON.parse(stored);
                  const davidId = 'bd7e174f-71b7-4c76-a13f-98a484f5ce5d';
                  const davidAssignments = Object.entries(assignments).filter(([_, userId]) => userId === davidId);
                  return davidAssignments.length > 0;
                }
              } catch (error) {
                console.error('Failed to check assignments:', error);
              }
              return false;
            };

            const hasAssignments = checkDavidAssignments();

            if (hasAssignments) {
              return (
                <div className="relative group">
                  <button className="relative p-2 text-gray-600 hover:text-availity-600 hover:bg-availity-50 rounded-full transition-all duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7C18 6.279 15.458 4 12.25 4H11.75C8.542 4 6 6.279 6 9.05v.7a8.967 8.967 0 01-1.989 5.611c-.317.631-.317 1.398.063 1.999l.117.183a.25.25 0 00.218.133h15.282a.25.25 0 00.218-.133l.117-.183c.38-.601.38-1.368.063-1.999zM12 21a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                    {/* Notification Badge */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  </button>
                  {/* Tooltip */}
                  <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    You have new section assignments
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export const MainDashboard: React.FC = () => {
  const location = useLocation();
  const isEditMode = location.pathname.includes('/edit/');
  const { user } = useAuth(); // Get current user for role-based access

  const [activeTab, setActiveTab] = useState<TabId>('questionnaire');

  // Questionnaire state (from QuestionnaireApp)
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentResponse] = useState<QuestionnaireResponse | null>(null);

  // Chatbot context state
  const [chatbotContext, setChatbotContext] = useState({
    currentSection: '',
    implementationMode: '',
    sectionDescription: ''
  });

  useEffect(() => {
    loadQuestionnaire();
  }, []);

  // Safety check: If payer user is on a restricted tab, redirect to questionnaire
  useEffect(() => {
    if (user?.userType === 'payer') {
      const restrictedTabs: TabId[] = ['configurations', 'testing', 'users'];
      if (restrictedTabs.includes(activeTab)) {
        setActiveTab('questionnaire');
      }
    }
  }, [user, activeTab]);

  const loadQuestionnaire = async () => {
    try {
      setLoading(true);
      // Load the complete X12 270/271 questionnaire with all PDF fields
      const questionnaireSections = await apiService.getQuestionnaireSections('x12-270-271-complete');
      setSections(questionnaireSections);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load questionnaire');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionComplete = async (sectionId: string, data: any) => {
    try {
      console.log('Section completed:', sectionId, data);
      // Here you would typically save the section data
      // For now, we'll just log it
    } catch (err) {
      console.error('Failed to save section:', err);
    }
  };

  const handleAutoSave = async (sectionId: string, questionId: string, value: any) => {
    try {
      console.log('Auto-saving:', { sectionId, questionId, value });
      // Here you would typically auto-save the data
      // For now, we'll just log it
    } catch (err) {
      console.error('Auto-save failed:', err);
    }
  };

  // Callback to update chatbot context from QuestionnaireWizard
  const handleChatbotContextUpdate = useCallback((context: any) => {
    setChatbotContext(context);
  }, []);

  // Define all available tabs
  const allTabs: Tab[] = [
    {
      id: 'questionnaire',
      label: 'Questionnaire',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'implementations',
      label: 'Implementations',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      id: 'configurations',
      label: 'Payer Configurations',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'testing',
      label: 'Payer Testing',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'users',
      label: 'Users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    }
  ];

  // Filter tabs based on user role - hide restricted tabs for payer users
  const tabs: Tab[] = allTabs.filter(tab => {
    // If user is a payer, hide configurations, testing, and users tabs
    if (user?.userType === 'payer') {
      const restrictedTabs: TabId[] = ['configurations', 'testing', 'users'];
      return !restrictedTabs.includes(tab.id);
    }
    // Availity users see all tabs
    return true;
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'questionnaire':
        if (loading) {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center animate-fade-in">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-availity-500 mx-auto"></div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400 to-availity-500 opacity-20 animate-pulse-soft"></div>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-800">Loading your questionnaire</h3>
                <p className="mt-2 text-gray-600">Preparing your personalized experience...</p>
              </div>
            </div>
          );
        }

        if (error) {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center animate-fade-in">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Unable to load questionnaire</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={loadQuestionnaire}
                  className="btn-primary"
                >
                  Try Again
                </button>
              </div>
            </div>
          );
        }

        return (
          <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex gap-8">
                {/* AI Chatbot - Desktop Only */}
                <div className="hidden xl:block w-80 flex-shrink-0">
                  <AIChatbotContainer context={chatbotContext} />
                </div>

                {/* Existing Questionnaire - Unchanged Logic */}
                <div className="flex-1 max-w-5xl">
                  <div className="mb-12 text-center animate-fade-in">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                      {isEditMode ? 'Edit X12 270/271 Implementation' : 'X12 270/271 Implementation Setup'}
                    </h2>
                    <p className="text-base text-gray-600 max-w-2xl mx-auto">
                      {isEditMode
                        ? 'Update your HIPAA transaction configuration. Modify any fields and submit to save your changes.'
                        : 'Complete your HIPAA transaction configuration with our comprehensive questionnaire. Select your implementation mode and we\'ll show you only the relevant sections and requirements.'
                      }
                    </p>
                  </div>

                  <QuestionnaireWizard
                    sections={sections}
                    initialData={currentResponse || undefined}
                    onSectionComplete={handleSectionComplete}
                    onAutoSave={handleAutoSave}
                    onChatbotContextUpdate={handleChatbotContextUpdate}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 'implementations':
        return <ImplementationsList />;
      case 'configurations':
        return <PayerConfigurations />;
      case 'users':
        return <UserManagement />;
      case 'testing':
        return <PayerTesting />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 flex items-center justify-center">
                {/* Availity logo */}
                <img
                  src="/availity.jpeg"
                  alt="Availity Logo"
                  className="w-14 h-14 object-contain drop-shadow-sm"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Availity Dashboard
                </h1>
                <p className="text-sm text-gray-600 font-medium">
                  X12 270/271 HIPAA Transaction Implementation Platform
                </p>
              </div>
            </div>
            <HeaderActions />
          </div>
        </div>
      </header>

      {/* Professional Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <nav className="flex space-x-0 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex items-center px-8 py-6 font-medium text-sm transition-all duration-200 border-b-3
                  ${activeTab === tab.id
                    ? 'text-availity-600 border-availity-500 bg-availity-50'
                    : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
                  }
                  ${tab.comingSoon ? 'cursor-default' : 'cursor-pointer'}
                `}
                disabled={tab.comingSoon && activeTab !== tab.id}
              >
                <span className="mr-3">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.comingSoon && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Coming Soon
                  </span>
                )}
                
                {/* Active tab indicator */}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-availity-500 rounded-t-full" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {renderTabContent()}
      </div>
    </div>
  );
};
