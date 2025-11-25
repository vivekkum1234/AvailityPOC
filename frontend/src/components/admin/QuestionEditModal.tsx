import React, { useState, useEffect } from 'react';

interface QuestionEditModalProps {
  question: any;
  sectionIndex: number;
  questionIndex: number;
  onSave: (sectionIndex: number, questionIndex: number, updatedQuestion: any) => void;
  onClose: () => void;
}

export const QuestionEditModal: React.FC<QuestionEditModalProps> = ({
  question,
  sectionIndex,
  questionIndex,
  onSave,
  onClose
}) => {
  const [editedQuestion, setEditedQuestion] = useState(question);

  useEffect(() => {
    setEditedQuestion(question);
  }, [question]);

  const handleChange = (field: string, value: any) => {
    setEditedQuestion((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptionChange = (optionIndex: number, field: 'label' | 'value', value: string) => {
    const updatedOptions = [...(editedQuestion.options || [])];
    updatedOptions[optionIndex] = {
      ...updatedOptions[optionIndex],
      [field]: value
    };
    handleChange('options', updatedOptions);
  };

  const handleSave = () => {
    onSave(sectionIndex, questionIndex, editedQuestion);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Edit Question</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Question ID */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Question ID
            </label>
            <input
              type="text"
              value={editedQuestion.id}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
            />
          </div>

          {/* Question Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editedQuestion.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter question title"
            />
          </div>

          {/* Question Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={editedQuestion.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter question description (optional)"
            />
          </div>

          {/* Question Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Field Type
            </label>
            <input
              type="text"
              value={editedQuestion.type}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Field type cannot be changed after creation</p>
          </div>

          {/* Required */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required
            </label>
            <select
              value={editedQuestion.required ? 'true' : 'false'}
              onChange={(e) => handleChange('required', e.target.value === 'true')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* Options (for radio/select/checkbox) */}
          {editedQuestion.options && editedQuestion.options.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options
              </label>
              <div className="space-y-2">
                {editedQuestion.options.map((option: any, optionIndex: number) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option.label}
                      onChange={(e) => handleOptionChange(optionIndex, 'label', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Option label"
                    />
                    <input
                      type="text"
                      value={option.value}
                      onChange={(e) => handleOptionChange(optionIndex, 'value', e.target.value)}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Value"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

