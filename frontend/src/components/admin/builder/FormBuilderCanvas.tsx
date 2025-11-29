import React, { useState } from 'react';
import { QuestionnaireTemplate } from '../../../types/admin';

interface FormBuilderCanvasProps {
  template: QuestionnaireTemplate | null;
  onTemplateChange: (template: QuestionnaireTemplate) => void;
  selectedField: any | null;
  onFieldSelect: (field: any) => void;
}

export const FormBuilderCanvas: React.FC<FormBuilderCanvasProps> = ({
  template,
  onTemplateChange,
  selectedField,
  onFieldSelect
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  if (!template) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Template Selected</h3>
          <p className="text-gray-500">Select a template to start editing</p>
        </div>
      </div>
    );
  }

  const sections = template.config?.sections || [];

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleFieldClick = (field: any, sectionId: string) => {
    onFieldSelect({ ...field, sectionId });
  };

  const handleRemoveField = (sectionId: string, fieldId: string) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Remove this field from the template?')) return;

    const updatedConfig = { ...template.config };
    updatedConfig.sections = updatedConfig.sections?.map((section: any) => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions?.filter((q: any) => q.id !== fieldId)
        };
      }
      return section;
    });

    onTemplateChange({ ...template, config: updatedConfig });
  };

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'TEXT':
      case 'EMAIL':
      case 'URL':
        return '📝';
      case 'TEXTAREA':
        return '📄';
      case 'NUMBER':
        return '🔢';
      case 'DATE':
        return '📅';
      case 'RADIO':
        return '🔘';
      case 'CHECKBOX':
        return '☑️';
      case 'SELECT':
        return '📋';
      case 'FILE_UPLOAD':
        return '📎';
      default:
        return '❓';
    }
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Template Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {template.config?.title || 'Untitled Template'}
          </h2>
          <p className="text-sm text-gray-600">
            Transaction Type: {template.transaction_type} • Version: {template.version}
          </p>
        </div>

        {/* Sections */}
        {sections.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg
              className="w-12 h-12 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <p className="text-gray-500">No sections yet. Add fields from the library to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section: any) => (
              <div
                key={section.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {section.title}
                    </h3>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                      {section.questions?.length || 0} fields
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      expandedSections.has(section.id) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Section Fields */}
                {expandedSections.has(section.id) && (
                  <div className="p-4 space-y-3">
                    {section.questions?.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No fields in this section
                      </p>
                    ) : (
                      section.questions?.map((field: any) => (
                        <div
                          key={field.id}
                          onClick={() => handleFieldClick(field, section.id)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedField?.id === field.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <span className="text-2xl">{getFieldIcon(field.type)}</span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-semibold text-gray-900">
                                    {field.title}
                                  </h4>
                                  {field.required && (
                                    <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                      Required
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Type: {field.type} • ID: {field.id}
                                </p>
                                {field.description && (
                                  <p className="text-xs text-gray-600 mt-2">
                                    {field.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveField(section.id, field.id);
                              }}
                              className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Remove field"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

