import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QuestionnaireWizard } from './components/QuestionnaireWizard';
import { MainDashboard } from './components/MainDashboard';
import { ImplementationsList } from './pages/ImplementationsList';
import { UserManagement } from './pages/UserManagement';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { apiService } from './services/api';
import { Section, QuestionnaireResponse } from './types/questionnaire';
import './App.css';

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

// Login wrapper component
const LoginWrapper: React.FC = () => {
  const { login } = useAuth();
  return <Login onLogin={login} />;
};

// Main questionnaire component
const QuestionnaireApp: React.FC = () => {
  const location = useLocation();
  const isEditMode = location.pathname.includes('/edit/');

  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentResponse] = useState<QuestionnaireResponse | null>(null);

  useEffect(() => {
    loadQuestionnaire();
  }, []);

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
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-availity-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-availity-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-availity-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 bg-error-50 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-600 mb-6 max-w-md">{error}</p>
          <button
            onClick={loadQuestionnaire}
            className="btn-primary"
          >
            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-availity-500 rounded-xl flex items-center justify-center shadow-medium">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Digital Questionnaire
                </h1>
                <p className="text-sm text-gray-600 font-medium">
                  X12 270/271 HIPAA Transaction Implementation - Complete
                </p>
              </div>
            </div>
            <HeaderActions />
          </div>
        </div>
      </header>

      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
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
          />
        </div>
      </main>
    </div>
  );
};

// Main App component with routing and authentication
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={<LoginWrapper />}
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/questionnaire/edit/:responseId"
            element={
              <ProtectedRoute>
                <QuestionnaireApp />
              </ProtectedRoute>
            }
          />
          <Route
            path="/implementations"
            element={
              <ProtectedRoute>
                <ImplementationsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            }
          />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
