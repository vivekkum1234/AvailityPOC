import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApiService } from '../../services/adminApi';
import { QuestionnaireTemplate } from '../../types/admin';
import { FieldLibraryPanel } from '../../components/admin/builder/FieldLibraryPanel';
import { FormBuilderCanvas } from '../../components/admin/builder/FormBuilderCanvas';
import { FieldPropertiesPanel } from '../../components/admin/builder/FieldPropertiesPanel';

export const TemplateBuilderV2: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [masterFields, setMasterFields] = useState<any[]>([]);
  const [template, setTemplate] = useState<QuestionnaireTemplate | null>(null);
  const [selectedField, setSelectedField] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load master field library from published 270/271 template
  useEffect(() => {
    loadMasterFields();
  }, []);

  // Load template if editing existing
  useEffect(() => {
    if (id) {
      loadTemplate(id);
    } else {
      setLoading(false);
    }
  }, [id]);

  const loadMasterFields = async () => {
    try {
      // Get the published 270/271 template to use as master field library
      const templates = await adminApiService.getTemplates('270/271');
      const publishedTemplate = templates.find(t => t.status === 'published');
      
      if (publishedTemplate && publishedTemplate.config) {
        // Extract all fields from all sections
        const allFields: any[] = [];
        publishedTemplate.config.sections?.forEach((section: any) => {
          section.questions?.forEach((question: any) => {
            allFields.push({
              ...question,
              sectionId: section.id,
              sectionTitle: section.title
            });
          });
        });
        setMasterFields(allFields);
      }
    } catch (err: any) {
      console.error('Failed to load master fields:', err);
      setError('Failed to load master field library');
    }
  };

  const loadTemplate = async (templateId: string) => {
    try {
      setLoading(true);
      const data = await adminApiService.getTemplate(templateId);
      setTemplate(data);
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
      await adminApiService.updateTemplate(template.id, {
        config: template.config,
        version: template.version
      });
      alert('Template saved successfully!');
    } catch (err: any) {
      alert('Failed to save template: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!template) return;

    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Are you sure you want to publish this template? Users will see this version immediately.')) {
      return;
    }
    
    try {
      setSaving(true);
      await adminApiService.publishTemplate(template.id);
      alert('Template published successfully!');
      navigate('/admin/templates');
    } catch (err: any) {
      alert('Failed to publish template: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading template builder...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Template Builder V2</h1>
          <p className="text-sm text-gray-600 mt-1">
            {template ? `Editing: ${template.transaction_type} v${template.version}` : 'Create New Template'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/templates')}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !template}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          {template && template.status === 'draft' && (
            <button
              onClick={handlePublish}
              disabled={saving}
              className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Publish
            </button>
          )}
        </div>
      </div>

      {/* 3-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Field Library */}
        <FieldLibraryPanel
          fields={masterFields}
          onFieldSelect={setSelectedField}
        />

        {/* Center Panel - Canvas */}
        <FormBuilderCanvas
          template={template}
          onTemplateChange={setTemplate}
          selectedField={selectedField}
          onFieldSelect={setSelectedField}
        />

        {/* Right Panel - Properties */}
        <FieldPropertiesPanel
          field={selectedField}
          onFieldChange={(updatedField) => {
            // Update field in template
            if (template && selectedField) {
              const updatedConfig = { ...template.config };
              // Find and update the field in sections
              updatedConfig.sections = updatedConfig.sections?.map((section: any) => ({
                ...section,
                questions: section.questions?.map((q: any) =>
                  q.id === selectedField.id ? updatedField : q
                )
              }));
              setTemplate({ ...template, config: updatedConfig });
              setSelectedField(updatedField);
            }
          }}
        />
      </div>
    </div>
  );
};

