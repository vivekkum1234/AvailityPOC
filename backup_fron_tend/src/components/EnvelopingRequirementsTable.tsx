import React, { useState, useEffect } from 'react';
import { EnvelopingRequirement } from '../types/questionnaire';

interface EnvelopingRequirementsTableProps {
  requirements: EnvelopingRequirement[];
  responses: Record<string, any>;
  onResponseChange: (fieldId: string, value: any) => void;
}

interface CustomValueState {
  [key: string]: string;
}

interface ValidationErrorState {
  [key: string]: string;
}

export const EnvelopingRequirementsTable: React.FC<EnvelopingRequirementsTableProps> = ({
  requirements,
  responses,
  onResponseChange
}) => {
  const [customValues, setCustomValues] = useState<CustomValueState>({});
  const [validationErrors, setValidationErrors] = useState<ValidationErrorState>({});

  // Initialize default values for ISA05, ISA07, ISA08, ISA11, ISA16, and Payer Name
  useEffect(() => {
    requirements.forEach((requirement) => {
      // Set default values for ISA05, ISA07, ISA11, and ISA16 (both 270 and 271)
      if (requirement.field === 'ISA05' || requirement.field === 'ISA07' || requirement.field === 'ISA11' || requirement.field === 'ISA16') {
        if (!responses[requirement.request270.id]) {
          onResponseChange(requirement.request270.id, requirement.request270.defaultValue);
        }
        if (!responses[requirement.response271.id]) {
          onResponseChange(requirement.response271.id, requirement.response271.defaultValue);
        }
      }
      // For ISA08, only set default for 271 response, not 270 request
      if (requirement.field === 'ISA08') {
        if (!responses[requirement.response271.id]) {
          onResponseChange(requirement.response271.id, requirement.response271.defaultValue);
        }
      }
      // For Payer Name (2100A NM103), set default values for both 270 and 271
      if (requirement.field === '2100A NM103') {
        if (!responses[requirement.request270.id]) {
          onResponseChange(requirement.request270.id, requirement.request270.defaultValue);
        }
        if (!responses[requirement.response271.id]) {
          onResponseChange(requirement.response271.id, requirement.response271.defaultValue);
        }
      }
    });
  }, [requirements, responses, onResponseChange]);

  // Validate fields on initial load for empty values
  useEffect(() => {
    requirements.forEach(requirement => {
      // Validate fields that require minimum length validation
      if (requirement.field === '2100A NM103' || requirement.field === '2100A NM109') {
        // Validate 270 Request field
        const value270 = getCustomValue(requirement.request270.id);
        const validation270 = validateLength(value270, requirement.length, requirement.field);
        if (!validation270.isValid) {
          setValidationErrors(prev => ({
            ...prev,
            [`${requirement.request270.id}-custom`]: validation270.error || 'Invalid input'
          }));
        }

        // Validate 271 Response field
        const value271 = getCustomValue(requirement.response271.id);
        const validation271 = validateLength(value271, requirement.length, requirement.field);
        if (!validation271.isValid) {
          setValidationErrors(prev => ({
            ...prev,
            [`${requirement.response271.id}-custom`]: validation271.error || 'Invalid input'
          }));
        }
      }
    });
  }, [requirements]);

  // Validate field length with min/max constraints
  const validateLength = (value: string, maxLength: number, fieldName?: string): { isValid: boolean; error?: string } => {
    // For GS02 and GS03, enforce minimum 2 characters and maximum 15
    if (fieldName === 'GS02' || fieldName === 'GS03') {
      if (value.length < 2) {
        return { isValid: false, error: 'Minimum 2 characters required' };
      }
      if (value.length > 15) {
        return { isValid: false, error: 'Maximum 15 characters allowed' };
      }
      return { isValid: true };
    }

    // For Payer Name (2100A NM103), enforce minimum 1 character and maximum 35
    if (fieldName === '2100A NM103') {
      if (value.length < 1) {
        return { isValid: false, error: 'Minimum 1 character required' };
      }
      if (value.length > 35) {
        return { isValid: false, error: 'Maximum 35 characters allowed' };
      }
      return { isValid: true };
    }

    // For Payer ID (2100A NM109), enforce minimum 2 characters and maximum 80
    if (fieldName === '2100A NM109') {
      if (value.length < 2) {
        return { isValid: false, error: 'Minimum 2 characters required' };
      }
      if (value.length > 80) {
        return { isValid: false, error: 'Maximum 80 characters allowed' };
      }
      return { isValid: true };
    }

    // For other fields, just check maximum length
    if (value.length > maxLength) {
      return { isValid: false, error: `Maximum ${maxLength} characters allowed` };
    }

    return { isValid: true };
  };

  // Handle option selection
  const handleOptionChange = (fieldId: string, value: string, maxLength: number, fieldName?: string) => {
    // Always set the selected value
    onResponseChange(fieldId, value);

    if (value !== 'custom') {
      // Clear any custom value when switching away from custom
      setCustomValues(prev => {
        const newState = { ...prev };
        delete newState[`${fieldId}-custom`];
        return newState;
      });
      // Also clear the custom value from responses
      onResponseChange(`${fieldId}-custom`, '');
      // Clear validation errors
      setValidationErrors(prev => {
        const newState = { ...prev };
        delete newState[`${fieldId}-custom`];
        return newState;
      });
    }
  };

  // Handle custom value input
  const handleCustomValueChange = (fieldId: string, value: string, maxLength: number, fieldName?: string) => {
    const validation = validateLength(value, maxLength, fieldName);

    // Always update the value (for real-time typing)
    setCustomValues(prev => ({
      ...prev,
      [`${fieldId}-custom`]: value
    }));
    onResponseChange(`${fieldId}-custom`, value);

    // Update validation errors
    if (validation.isValid) {
      setValidationErrors(prev => {
        const newState = { ...prev };
        delete newState[`${fieldId}-custom`];
        return newState;
      });
    } else {
      setValidationErrors(prev => ({
        ...prev,
        [`${fieldId}-custom`]: validation.error || 'Invalid input'
      }));
    }
  };

  // Get current value for display
  const getCurrentValue = (fieldId: string, defaultValue?: string, fieldName?: string) => {
    // Use default values for ISA05, ISA07, ISA11, and ISA16 (both 270 and 271)
    if (fieldName === 'ISA05' || fieldName === 'ISA07' || fieldName === 'ISA11' || fieldName === 'ISA16') {
      return responses[fieldId] || defaultValue || '';
    }
    // For ISA08, only use default for 271 response
    if (fieldName === 'ISA08' && fieldId.includes('271')) {
      return responses[fieldId] || defaultValue || '';
    }
    // For Payer Name (2100A NM103), use default values for both 270 and 271
    if (fieldName === '2100A NM103') {
      return responses[fieldId] || defaultValue || '';
    }
    return responses[fieldId] || '';
  };

  // Get custom value for display
  const getCustomValue = (fieldId: string) => {
    return customValues[`${fieldId}-custom`] || responses[`${fieldId}-custom`] || '';
  };

  // Check if custom input should be shown
  const shouldShowCustomInput = (fieldId: string, defaultValue?: string, fieldName?: string) => {
    return getCurrentValue(fieldId, defaultValue, fieldName) === 'custom';
  };

  return (
    <div className="enveloping-requirements-section">
      <div className="section-description">
        <p className="description-text">
          Availity uses standard ANSI enveloping requirements and can provide a complete copy of all values upon request.
          Please indicate the values you are using for the designated fields.
        </p>
      </div>

      <div className="requirements-grid">
        {requirements.map((requirement) => (
          <div key={requirement.field} className="requirement-card">
            <div className="requirement-header">
              <h3 className="field-title">{requirement.fieldDescription}</h3>
              <span className="field-code">({requirement.field})</span>
            </div>

            <div className="requirement-content">
              {/* 270 Request Section */}
              <div className="request-section">
                <h4 className="section-label">270 Request</h4>
                <div className="option-group">
                  {requirement.request270.options.map((option) => (
                    <label key={option.value} className="option-label">
                      <input
                        type="radio"
                        name={requirement.request270.id}
                        value={option.value}
                        checked={getCurrentValue(requirement.request270.id, requirement.request270.defaultValue, requirement.field) === option.value}
                        onChange={(e) => handleOptionChange(
                          requirement.request270.id,
                          e.target.value,
                          requirement.length,
                          requirement.field
                        )}
                        className="option-radio"
                      />
                      <span className="option-text">{option.label}</span>
                    </label>
                  ))}

                  {shouldShowCustomInput(requirement.request270.id, requirement.request270.defaultValue, requirement.field) && (
                    <div className="custom-input-container">
                      <input
                        type="text"
                        placeholder={`Enter value (max ${requirement.length} characters)`}
                        value={getCustomValue(requirement.request270.id)}
                        onChange={(e) => handleCustomValueChange(
                          requirement.request270.id,
                          e.target.value,
                          requirement.length,
                          requirement.field
                        )}
                        maxLength={requirement.length}
                        className="custom-input"
                      />
                      <div className="length-indicator">
                        {getCustomValue(requirement.request270.id).length}/{requirement.length} characters
                      </div>
                      {validationErrors[`${requirement.request270.id}-custom`] && (
                        <div className="validation-error">
                          {validationErrors[`${requirement.request270.id}-custom`]}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 271 Response Section */}
              <div className="response-section">
                <h4 className="section-label">271 Response</h4>
                <div className="option-group">
                  {requirement.response271.options.map((option) => (
                    <label key={option.value} className="option-label">
                      <input
                        type="radio"
                        name={requirement.response271.id}
                        value={option.value}
                        checked={getCurrentValue(requirement.response271.id, requirement.response271.defaultValue, requirement.field) === option.value}
                        onChange={(e) => handleOptionChange(
                          requirement.response271.id,
                          e.target.value,
                          requirement.length,
                          requirement.field
                        )}
                        className="option-radio"
                      />
                      <span className="option-text">{option.label}</span>
                    </label>
                  ))}

                  {shouldShowCustomInput(requirement.response271.id, requirement.response271.defaultValue, requirement.field) && (
                    <div className="custom-input-container">
                      <input
                        type="text"
                        placeholder={`Enter value (max ${requirement.length} characters)`}
                        value={getCustomValue(requirement.response271.id)}
                        onChange={(e) => handleCustomValueChange(
                          requirement.response271.id,
                          e.target.value,
                          requirement.length,
                          requirement.field
                        )}
                        maxLength={requirement.length}
                        className="custom-input"
                      />
                      <div className="length-indicator">
                        {getCustomValue(requirement.response271.id).length}/{requirement.length} characters
                      </div>
                      {validationErrors[`${requirement.response271.id}-custom`] && (
                        <div className="validation-error">
                          {validationErrors[`${requirement.response271.id}-custom`]}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .enveloping-requirements-section {
          width: 100%;
          margin: 0;
        }

        .section-description {
          margin-bottom: 32px;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #0066cc;
        }

        .description-text {
          margin: 0;
          color: #333;
          font-size: 16px;
          line-height: 1.5;
        }

        .requirements-grid {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .requirement-card {
          background: white;
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .requirement-card:hover {
          border-color: #0066cc;
          box-shadow: 0 2px 8px rgba(0, 102, 204, 0.1);
        }

        .requirement-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e1e5e9;
        }

        .field-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        .field-code {
          background-color: #f1f3f4;
          color: #5f6368;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 14px;
          font-family: monospace;
        }

        .requirement-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }

        .request-section,
        .response-section {
          background-color: #fafbfc;
          border-radius: 6px;
          padding: 16px;
        }

        .section-label {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: #0066cc;
        }

        .option-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .option-label {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
          padding: 12px;
          border-radius: 6px;
          transition: background-color 0.2s ease;
        }

        .option-label:hover {
          background-color: #f1f3f4;
        }

        .option-radio {
          margin: 0;
          margin-top: 2px;
          width: 16px;
          height: 16px;
          accent-color: #0066cc;
        }

        .option-text {
          font-size: 15px;
          line-height: 1.4;
          color: #333;
        }

        .custom-input-container {
          margin-top: 12px;
          padding: 16px;
          background-color: white;
          border-radius: 6px;
          border: 1px solid #dadce0;
        }

        .custom-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #dadce0;
          border-radius: 6px;
          font-size: 15px;
          transition: border-color 0.2s ease;
        }

        .custom-input:focus {
          outline: none;
          border-color: #0066cc;
          box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
        }

        .length-indicator {
          font-size: 13px;
          color: #5f6368;
          text-align: right;
          margin-top: 8px;
        }

        .validation-error {
          font-size: 13px;
          color: #dc3545;
          margin-top: 4px;
          padding: 4px 8px;
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 4px;
          display: flex;
          align-items: center;
        }

        .validation-error::before {
          content: "⚠️";
          margin-right: 6px;
        }

        @media (max-width: 768px) {
          .requirement-content {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .requirement-card {
            padding: 16px;
          }

          .field-title {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
};
