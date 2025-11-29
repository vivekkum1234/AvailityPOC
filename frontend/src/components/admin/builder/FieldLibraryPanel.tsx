import React, { useState } from 'react';

interface FieldLibraryPanelProps {
  fields: any[];
  onFieldSelect: (field: any) => void;
}

export const FieldLibraryPanel: React.FC<FieldLibraryPanelProps> = ({
  fields,
  onFieldSelect
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Group fields by section
  const fieldsBySection = fields.reduce((acc, field) => {
    const sectionTitle = field.sectionTitle || 'Other';
    if (!acc[sectionTitle]) {
      acc[sectionTitle] = [];
    }
    acc[sectionTitle].push(field);
    return acc;
  }, {} as Record<string, any[]>);

  const filteredFields = fields.filter(field => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      field.title?.toLowerCase().includes(query) ||
      field.id?.toLowerCase().includes(query) ||
      field.type?.toLowerCase().includes(query)
    );
  });

  const toggleSection = (sectionTitle: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionTitle)) {
      newExpanded.delete(sectionTitle);
    } else {
      newExpanded.add(sectionTitle);
    }
    setExpandedSections(newExpanded);
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
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Field Library</h2>
        <input
          type="text"
          placeholder="Search fields..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-2">
          {fields.length} fields available
        </p>
      </div>

      {/* Field List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {searchQuery ? (
          // Show filtered flat list when searching
          filteredFields.map((field) => (
            <div
              key={field.id}
              onClick={() => onFieldSelect(field)}
              className="p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">{getFieldIcon(field.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {field.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {field.type} • {field.sectionTitle}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          // Show grouped by section when not searching
          Object.entries(fieldsBySection).map(([sectionTitle, sectionFields]) => {
            const fields = sectionFields as any[];
            return (
              <div key={sectionTitle} className="mb-4">
                <button
                  onClick={() => toggleSection(sectionTitle)}
                  className="w-full flex items-center justify-between p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <span className="text-sm font-semibold text-gray-700">
                    {sectionTitle}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {fields.length}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform ${
                        expandedSections.has(sectionTitle) ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {expandedSections.has(sectionTitle) && (
                  <div className="mt-2 space-y-2 pl-2">
                    {fields.map((field: any) => (
                      <div
                        key={field.id}
                        onClick={() => onFieldSelect(field)}
                        className="p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{getFieldIcon(field.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {field.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{field.type}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

