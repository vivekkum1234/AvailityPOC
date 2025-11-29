import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { adminApiService } from '../services/adminApi';
import { QuestionnaireTemplate, QuestionnaireVersion } from '../types/admin';
import { SectionAccordion } from '../components/admin/SectionAccordion';
import { QuestionEditModal } from '../components/admin/QuestionEditModal';

export const TemplateEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const versionId = searchParams.get('version');

  const [template, setTemplate] = useState<QuestionnaireTemplate | null>(null);
  const [viewingVersion, setViewingVersion] = useState<QuestionnaireVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [changesSummary, setChangesSummary] = useState('');
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
  const [editingQuestion, setEditingQuestion] = useState<{ sectionIndex: number; questionIndex: number; question: any } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [creatingNewVersion, setCreatingNewVersion] = useState(false);

  useEffect(() => {
    if (id) {
      loadTemplate();
    }
  }, [id, versionId]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      setError(null);
      setViewingVersion(null);

      // If viewing a specific version from history
      if (versionId) {
        const versions = await adminApiService.getVersionHistory(id!);
        const version = versions.find(v => v.id === versionId);

        if (version) {
          setViewingVersion(version);
          // Create a template-like object from the version for display
          const templateData = await adminApiService.getTemplate(id!);
          setTemplate({
            ...templateData,
            config: version.config,
            version: version.version,
            status: 'archived' as const
          });
        } else {
          setError('Version not found');
        }
      } else {
        // Load current template
        const data = await adminApiService.getTemplate(id!);
        setTemplate(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!template) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      await adminApiService.updateTemplate(template.id, {
        config: template.config,
        version: template.version,
      });
      
      setSuccess('Template saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!template) return;

    try {
      setPublishing(true);
      setError(null);

      console.log('Publishing template with first question:', template.config.sections[0]?.questions[0]?.title);

      // Save any pending changes first
      await adminApiService.updateTemplate(template.id, {
        config: template.config,
        version: template.version,
      });

      // Then publish
      await adminApiService.publishTemplate(template.id, changesSummary);

      setSuccess('Template published successfully!');
      setShowPublishDialog(false);
      setChangesSummary('');

      // Reload template to get updated status
      await loadTemplate();
    } catch (err: any) {
      setError(err.message || 'Failed to publish template');
    } finally {
      setPublishing(false);
    }
  };

  const handleQuestionSave = (sectionIndex: number, questionIndex: number, updatedQuestion: any) => {
    if (!template) return;

    // Deep clone the config to avoid mutation issues
    const updatedConfig = JSON.parse(JSON.stringify(template.config));
    updatedConfig.sections[sectionIndex].questions[questionIndex] = updatedQuestion;

    setTemplate({
      ...template,
      config: updatedConfig,
    });

    console.log('Question saved to state:', updatedQuestion.title);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const toggleAllSections = (expand: boolean) => {
    if (!template) return;
    const newExpandedState: { [key: string]: boolean } = {};
    template.config.sections?.forEach((section: any) => {
      newExpandedState[section.id] = expand;
    });
    setExpandedSections(newExpandedState);
  };

  const handleQuestionEdit = (sectionIndex: number, questionIndex: number, question: any) => {
    setEditingQuestion({ sectionIndex, questionIndex, question });
  };

  const handleCreateNewVersion = async () => {
    if (!template) return;

    try {
      setCreatingNewVersion(true);
      setError(null);

      // Create new version (archives current, updates template to new draft version)
      const updatedTemplate = await adminApiService.createNewVersion(template.id);

      // Reload the template to show the new draft version
      await loadTemplate();
      setSuccess(`Created new draft version ${updatedTemplate.version}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create new version');
    } finally {
      setCreatingNewVersion(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading template...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Template not found</p>
          <button
            onClick={() => navigate('/admin')}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isDraft = template.status === 'draft';
  const isViewingHistoricalVersion = !!viewingVersion;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                X12 {template.transaction_type} - v{template.version}
                {isViewingHistoricalVersion && (
                  <span className="ml-3 text-sm font-normal text-gray-500">(Historical Version)</span>
                )}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Status: <span className="font-medium">{template.status}</span>
                {viewingVersion?.created_at && (
                  <span className="ml-2">
                    • Archived on {new Date(viewingVersion.created_at).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back to Dashboard
              </button>
              {!isViewingHistoricalVersion && isDraft ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Draft'}
                  </button>
                  <button
                    onClick={() => setShowPublishDialog(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    Publish
                  </button>
                </>
              ) : !isViewingHistoricalVersion ? (
                <button
                  onClick={handleCreateNewVersion}
                  disabled={creatingNewVersion}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {creatingNewVersion ? 'Creating...' : '✏️ Create New Version to Edit'}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Historical Version Banner */}
      {isViewingHistoricalVersion && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-amber-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">
                  You are viewing a historical version (v{template.version})
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  {viewingVersion.changes_summary || 'This is a read-only archived version.'}
                </p>
              </div>
              <button
                onClick={() => navigate(`/admin/templates/${id}`)}
                className="ml-4 px-4 py-2 text-sm font-medium text-amber-800 bg-amber-100 rounded-lg hover:bg-amber-200"
              >
                View Current Version
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">{success}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Controls */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Search questions..."
              />
            </div>
          </div>
          <div className="flex space-x-2 ml-4">
            <button
              onClick={() => toggleAllSections(true)}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Expand All
            </button>
            <button
              onClick={() => toggleAllSections(false)}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {template.config.sections?.map((section: any, sectionIndex: number) => (
            <SectionAccordion
              key={section.id}
              section={section}
              sectionIndex={sectionIndex}
              isExpanded={expandedSections[section.id] || false}
              onToggle={() => toggleSection(section.id)}
              onQuestionEdit={(questionIndex, question) => handleQuestionEdit(sectionIndex, questionIndex, question)}
              isDraft={isDraft}
            />
          ))}
        </div>
      </main>

      {/* Publish Dialog */}
      {showPublishDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Publish Template</h3>
              <p className="text-sm text-gray-600 mb-4">
                Publishing this template will make it available to all users. This action cannot be undone.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Changes Summary (Optional)
                </label>
                <textarea
                  value={changesSummary}
                  onChange={(e) => setChangesSummary(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe what changed in this version..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowPublishDialog(false)}
                  disabled={publishing}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {publishing ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Question Edit Modal */}
      {editingQuestion && (
        <QuestionEditModal
          question={editingQuestion.question}
          sectionIndex={editingQuestion.sectionIndex}
          questionIndex={editingQuestion.questionIndex}
          onSave={handleQuestionSave}
          onClose={() => setEditingQuestion(null)}
        />
      )}
    </div>
  );
};

