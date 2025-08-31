import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Question, QuestionType } from '../types/questionnaire';

interface QuestionRendererProps {
  question: Question;
  value?: any;
  onChange: (value: any) => void;
  error?: string;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  value,
  onChange,
  error
}) => {
  const [localError, setLocalError] = React.useState<string>('');

  const baseInputClasses = `
    input-field mt-3 text-base py-3 px-4
    ${(error || localError) ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
  `;

  // Custom styles to override browser autofill
  const inputStyle = {
    WebkitBoxShadow: '0 0 0 1000px white inset',
    WebkitTextFillColor: '#000000',
    backgroundColor: 'white !important'
  };

  // Validation functions
  const validateEmail = (email: string): string => {
    if (!email) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePhone = (phone: string): string => {
    if (!phone) return '';
    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');

    // Check if it's a valid US phone number (10 digits)
    if (digitsOnly.length !== 10) {
      return 'Please enter a valid 10-digit phone number';
    }

    // Check for valid US phone number pattern (not starting with 0 or 1)
    if (digitsOnly[0] === '0' || digitsOnly[0] === '1') {
      return 'Phone number cannot start with 0 or 1';
    }

    return '';
  };

  const validatePattern = (value: string, pattern: string): string => {
    if (!value || !pattern) return '';
    const regex = new RegExp(pattern);
    if (!regex.test(value)) {
      // Check if it's a URL pattern
      if (pattern.includes('https?')) {
        return 'Please enter a valid URL (e.g., https://example.com)';
      }
      return 'Please enter a valid format';
    }
    return '';
  };

  const handleBlur = (inputValue: string) => {
    let validationError = '';

    if (question.type === 'email') {
      validationError = validateEmail(inputValue);
    } else if (question.id.toLowerCase().includes('phone')) {
      validationError = validatePhone(inputValue);
    } else if (question.validation?.pattern) {
      validationError = validatePattern(inputValue, question.validation.pattern);
    }

    setLocalError(validationError);
  };

  const handleInputChange = (inputValue: string) => {
    // Clear local error when user starts typing
    if (localError) {
      setLocalError('');
    }
    onChange(inputValue);
  };

  const renderInput = () => {
    switch (question.type) {
      case QuestionType.TEXT:
      case QuestionType.EMAIL:
      case QuestionType.URL:
        return (
          <input
            type={question.type === QuestionType.EMAIL ? 'email' :
                  question.type === QuestionType.URL ? 'url' : 'text'}
            id={question.id}
            value={value || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={(e) => handleBlur(e.target.value)}
            className={baseInputClasses}
            style={inputStyle}
            placeholder={question.description}
            maxLength={question.validation?.maxLength}
            minLength={question.validation?.minLength}
            pattern={question.validation?.pattern}
            required={question.required}
          />
        );

      case QuestionType.TEXTAREA:
        return (
          <textarea
            id={question.id}
            value={value || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={(e) => handleBlur(e.target.value)}
            rows={4}
            className={baseInputClasses}
            style={inputStyle}
            placeholder={question.description}
            maxLength={question.validation?.maxLength}
            minLength={question.validation?.minLength}
            required={question.required}
          />
        );

      case QuestionType.NUMBER:
        return (
          <input
            type="number"
            id={question.id}
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            className={baseInputClasses}
            placeholder={question.description}
            min={question.validation?.min}
            max={question.validation?.max}
            required={question.required}
          />
        );

      case QuestionType.DATE:
        return (
          <input
            type="date"
            id={question.id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClasses}
            required={question.required}
          />
        );

      case QuestionType.RADIO:
        return (
          <div className="space-y-4 mt-4">
            {question.options?.map((option) => (
              <div
                key={option.value}
                className={`
                  relative flex items-start p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-soft
                  ${value === option.value
                    ? 'border-availity-500 bg-primary-50 shadow-soft'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
                onClick={() => onChange(option.value)}
              >
                <div className="flex items-center h-6">
                  <input
                    id={`${question.id}-${option.value}`}
                    name={question.id}
                    type="radio"
                    value={option.value}
                    checked={value === option.value}
                    onChange={(e) => onChange(e.target.value)}
                    className="focus:ring-availity-500 h-5 w-5 text-availity-600 border-gray-300"
                    required={question.required}
                  />
                </div>
                <div className="ml-4 flex-1">
                  <label htmlFor={`${question.id}-${option.value}`} className="font-semibold text-gray-800 cursor-pointer">
                    {option.label}
                  </label>
                  {option.description && (
                    <p className="mt-1 text-sm text-gray-600">{option.description}</p>
                  )}
                </div>
                {value === option.value && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-availity-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case QuestionType.CHECKBOX:
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <div key={option.value} className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id={`${question.id}-${option.value}`}
                    name={question.id}
                    type="checkbox"
                    value={option.value}
                    checked={Array.isArray(value) ? value.includes(option.value) : false}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      if (e.target.checked) {
                        onChange([...currentValues, option.value]);
                      } else {
                        onChange(currentValues.filter(v => v !== option.value));
                      }
                    }}
                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor={`${question.id}-${option.value}`} className="font-medium text-gray-700">
                    {option.label}
                  </label>
                  {option.description && (
                    <p className="text-gray-500">{option.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case QuestionType.SELECT:
        return (
          <select
            id={question.id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClasses}
            required={question.required}
          >
            <option value="">Select an option...</option>
            {question.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case QuestionType.DISPLAY:
        return null; // Display questions don't render input fields

      case QuestionType.FILE_UPLOAD:
        return (
          <div className="mt-4">
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor={question.id}
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-gray-500"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  {question.fileUploadConfig?.acceptedFormats && (
                    <p className="text-xs text-gray-500">
                      {question.fileUploadConfig.acceptedFormats.join(', ').toUpperCase()}
                    </p>
                  )}
                  {question.fileUploadConfig?.maxFileSize && (
                    <p className="text-xs text-gray-500">
                      Max size: {Math.round(question.fileUploadConfig.maxFileSize / 1024 / 1024)}MB
                    </p>
                  )}
                </div>
                <input
                  id={question.id}
                  type="file"
                  className="hidden"
                  accept={question.fileUploadConfig?.acceptedFormats?.join(',')}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onChange(file.name); // For now, just store the filename
                    }
                  }}
                  required={question.required}
                />
              </label>
            </div>
            {value && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">
                  Selected file: {value}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null; // Hide unsupported question types by default
    }
  };

  // Handle DISPLAY questions as section headers
  if (question.type === QuestionType.DISPLAY) {
    return (
      <div className="mb-6 mt-8 first:mt-0">
        <h3 className="text-xl font-bold text-gray-900 border-b-2 border-availity-500 pb-2 mb-4">
          {question.title}
        </h3>
        {question.description && (
          <p className="text-gray-600 mb-4">{question.description}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <label htmlFor={question.id} className="block text-lg font-semibold text-gray-800 leading-tight">
            {question.title}
            {question.required && <span className="text-error-500 ml-2 text-xl">*</span>}
          </label>
          {question.description && (
            <p className="mt-2 text-base text-gray-600 leading-relaxed">{question.description}</p>
          )}
          {question.helpText && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-blue-700">{question.helpText}</p>
              </div>
            </div>
          )}

        </div>
        {question.helpText && (
          <div className="ml-6">
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center justify-center"
              title={question.helpText}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {renderInput()}
      
      {(error || localError) && (
        <div className="mt-3 flex items-center p-3 bg-red-50 border border-red-200 rounded-xl">
          <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm font-medium text-red-700">{error || localError}</p>
        </div>
      )}

      {question.attachmentRequired && (
        <div className="mt-4 p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 transition-colors duration-200">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📎 Required Attachment
          </label>
          <input
            type="file"
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-availity-500 file:text-white hover:file:bg-availity-600 file:transition-colors file:duration-200"
          />
          <p className="mt-2 text-xs text-gray-500">
            Upload supporting documentation for this requirement
          </p>
        </div>
      )}
    </div>
  );
};
