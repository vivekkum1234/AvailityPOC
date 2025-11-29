import React from 'react';

interface FieldPropertiesPanelProps {
  field: any | null;
  onFieldChange: (field: any) => void;
}

export const FieldPropertiesPanel: React.FC<FieldPropertiesPanelProps> = ({
  field,
  onFieldChange
}) => {
  if (!field) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex items-center justify-center">
        <div className="text-center p-6">
          <svg
            className="w-12 h-12 text-gray-300 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          <p className="text-sm text-gray-500">Select a field to edit properties</p>
        </div>
      </div>
    );
  }

  const handleChange = (key: string, value: any) => {
    onFieldChange({ ...field, [key]: value });
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Field Properties</h2>

        {/* Field ID (Read-only) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Field ID
          </label>
          <input
            type="text"
            value={field.id}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm"
          />
        </div>

        {/* Field Type (Read-only) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Field Type
          </label>
          <input
            type="text"
            value={field.type}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm"
          />
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={field.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={field.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Required */}
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={field.required || false}
              onChange={(e) => handleChange('required', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Required Field</span>
          </label>
        </div>

        {/* Placeholder (for text inputs) */}
        {['TEXT', 'EMAIL', 'URL', 'TEXTAREA', 'NUMBER'].includes(field.type) && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Placeholder
            </label>
            <input
              type="text"
              value={field.placeholder || ''}
              onChange={(e) => handleChange('placeholder', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {/* Validation */}
        {field.validation && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Validation
            </label>
            <div className="space-y-2 text-xs">
              {field.validation.minLength && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Min Length:</span>
                  <span className="font-medium">{field.validation.minLength}</span>
                </div>
              )}
              {field.validation.maxLength && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Max Length:</span>
                  <span className="font-medium">{field.validation.maxLength}</span>
                </div>
              )}
              {field.validation.pattern && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Pattern:</span>
                  <code className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">
                    {field.validation.pattern}
                  </code>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Options (for SELECT, RADIO, CHECKBOX) */}
        {['SELECT', 'RADIO', 'CHECKBOX'].includes(field.type) && field.options && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options
            </label>
            <div className="space-y-2">
              {field.options.map((option: any, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="w-6 text-gray-500">{index + 1}.</span>
                  <span className="flex-1 text-gray-900">{option.label}</span>
                  <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {option.value}
                  </code>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conditional Logic */}
        {field.conditionalLogic && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conditional Logic
            </label>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                This field has conditional logic configured
              </p>
            </div>
          </div>
        )}

        {/* X12 Mapping */}
        {field.x12Field && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              X12 Mapping
            </label>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-blue-600 font-medium">Segment:</span>
                <code className="font-mono">{field.x12Field.segment}</code>
              </div>
              {field.x12Field.element && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-blue-600 font-medium">Element:</span>
                  <code className="font-mono">{field.x12Field.element}</code>
                </div>
              )}
              {field.x12Field.description && (
                <p className="text-xs text-blue-700 mt-2">
                  {field.x12Field.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-600">
            💡 <strong>Tip:</strong> Field properties are read-only in this version.
            To modify field behavior, you'll need to update the master template configuration.
          </p>
        </div>
      </div>
    </div>
  );
};

