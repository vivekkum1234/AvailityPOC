/**
 * Extraction Data Transformer
 * 
 * Transforms PDF extraction data into the format expected by the questionnaire auto-fill
 * This is ISOLATED from the chatbot auto-fill logic to avoid breaking existing functionality
 */

import { Section, Question, QuestionType } from '../types/questionnaire';

export interface ExtractionField {
  questionId: string;
  value: any;
}

export interface ExtractionData {
  fileName: string;
  extractedAt: string;
  commonFields: ExtractionField[];
  b2bFields: ExtractionField[];
}

/**
 * Enveloping requirements field options
 * Maps field IDs to their available options
 */
const ENVELOPING_FIELD_OPTIONS: Record<string, string[]> = {
  'isa06-270': ['030240928', 'custom'],
  'isa06-271': ['availity_defines', 'custom'],
  'isa08-270': ['availity_defines', 'custom'],
  'gs02-270': ['030240928', 'custom'],
  'gs02-271': ['availity_defines', 'custom'],
  'gs03-270': ['availity_defines', 'custom'],
  'gs03-271': ['030240928', 'custom'],
  '2100a-nm103-270': ['custom'],  // Payer Name - only custom option
  '2100a-nm103-271': ['custom'],  // Payer Name - only custom option
  '2100a-nm109-270': ['custom'],  // Payer ID - only custom option
  '2100a-nm109-271': ['custom'],  // Payer ID - only custom option
};

/**
 * Normalize a string for comparison (lowercase, replace spaces/hyphens with underscores)
 */
function normalizeForComparison(str: string): string {
  return str.toLowerCase().replace(/[\s-]/g, '_');
}

/**
 * Transform enveloping requirements field value
 * Checks if value matches a predefined option, otherwise uses 'custom'
 */
function transformEnvelopingField(fieldId: string, value: any): Record<string, any> {
  const result: Record<string, any> = {};
  const options = ENVELOPING_FIELD_OPTIONS[fieldId];

  if (!options) {
    return result;
  }

  const stringValue = String(value || '').trim();

  if (!stringValue) {
    return result;
  }

  const normalizedValue = normalizeForComparison(stringValue);

  // Check if value matches a predefined option
  // Compare normalized versions to handle variations like:
  // "Availity defines" -> "availity_defines"
  // "030240928" -> "030240928"
  const matchedOption = options.find(opt => {
    if (opt === 'custom') return false;
    return normalizeForComparison(opt) === normalizedValue;
  });

  if (matchedOption) {
    // Value matches a predefined option - select that radio button
    result[fieldId] = matchedOption;
  } else {
    // Value doesn't match - use custom option and fill text input
    result[fieldId] = 'custom';
    result[`${fieldId}-custom`] = stringValue;
  }

  return result;
}

/**
 * Transform extraction data to flat format for auto-fill
 * Validates and maps values to match questionnaire options
 */
export function transformExtractionDataForAutoFill(
  extractionData: ExtractionData,
  sections: Section[]
): Record<string, any> {
  // Build question map for quick lookup
  const questionMap = new Map<string, Question>();
  sections.forEach(section => {
    section.questions.forEach(q => {
      questionMap.set(q.id, q);
    });
  });

  const flatData: Record<string, any> = {};

  // Set implementation mode first
  flatData['implementation-mode-selection'] = 'real_time_b2b';

  // Combine all fields
  const allFields = [...extractionData.commonFields, ...extractionData.b2bFields];

  // Transform each field
  allFields.forEach(field => {
    // Skip implementation-mode-selection as it's already set in Step 1
    if (field.questionId === 'implementation-mode-selection') {
      return;
    }

    // Special handling for enveloping requirements fields
    if (ENVELOPING_FIELD_OPTIONS[field.questionId]) {
      const envelopingData = transformEnvelopingField(field.questionId, field.value);
      Object.assign(flatData, envelopingData);
      return;
    }

    const question = questionMap.get(field.questionId);

    if (!question) {
      return;
    }

    const transformedValue = transformValueForQuestion(field.value, question);

    if (transformedValue !== null && transformedValue !== undefined) {
      flatData[field.questionId] = transformedValue;
    }
  });

  return flatData;
}

/**
 * Transform a single value to match the question's expected format
 */
function transformValueForQuestion(value: any, question: Question): any {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return null;
  }

  switch (question.type) {
    case QuestionType.TEXT:
    case QuestionType.EMAIL:
    case QuestionType.URL:
    case QuestionType.TEXTAREA:
    case QuestionType.NUMBER:
      // Simple string/number values - return as-is
      return value;

    case QuestionType.DATE:
      // Transform date to YYYY-MM-DD format
      return transformDateValue(value);

    case QuestionType.RADIO:
    case QuestionType.SELECT:
      // Need to match against available options
      return matchValueToOption(value, question);

    case QuestionType.CHECKBOX:
      // CHECKBOX can be either:
      // 1. Multi-select checkboxes (if question has options) - value should be array
      // 2. Single checkbox (if no options) - value should be boolean
      if (question.options && question.options.length > 0) {
        // Multi-select checkboxes - treat like MULTI_SELECT
        return normalizeMultiSelectValue(value, question);
      } else {
        // Single checkbox - convert to boolean
        return normalizeCheckboxValue(value);
      }

    case QuestionType.MULTI_SELECT:
      // Multi-select - ensure array and validate each value
      return normalizeMultiSelectValue(value, question);

    default:
      // Unknown type - return as-is
      return value;
  }
}

/**
 * Match a value to the closest option in a question
 */
function matchValueToOption(value: any, question: Question): string | null {
  if (!question.options || question.options.length === 0) {
    return String(value);
  }

  const stringValue = String(value).toLowerCase().trim();

  // Try exact match first (case-insensitive)
  const exactMatch = question.options.find(
    opt => opt.value.toLowerCase() === stringValue || opt.label.toLowerCase() === stringValue
  );
  if (exactMatch) {
    return exactMatch.value;
  }

  // Try partial match
  const partialMatch = question.options.find(
    opt => opt.value.toLowerCase().includes(stringValue) || opt.label.toLowerCase().includes(stringValue)
  );
  if (partialMatch) {
    return partialMatch.value;
  }

  // No match found - return original value and let validation handle it
  return String(value);
}

/**
 * Normalize checkbox value to boolean
 */
function normalizeCheckboxValue(value: any): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  
  const stringValue = String(value).toLowerCase().trim();
  return stringValue === 'yes' || stringValue === 'true' || stringValue === '1';
}

/**
 * Normalize multi-select value to array
 */
function normalizeMultiSelectValue(value: any, question: Question): string[] {
  // Ensure it's an array
  const arrayValue = Array.isArray(value) ? value : [value];

  // Validate each value against options
  if (!question.options) {
    return arrayValue.map(v => String(v));
  }

  return arrayValue
    .map(v => matchValueToOption(v, question))
    .filter(v => v !== null) as string[];
}

/**
 * Transform date value to YYYY-MM-DD format
 * Handles various input formats: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
 */
function transformDateValue(value: any): string | null {
  if (!value) {
    return null;
  }

  const stringValue = String(value).trim();

  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
    return stringValue;
  }

  // Try DD/MM/YYYY format (common in PDFs)
  const ddmmyyyyMatch = stringValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    return `${year}-${month}-${day}`;
  }

  // Try MM/DD/YYYY format
  const mmddyyyyMatch = stringValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (mmddyyyyMatch) {
    // Ambiguous - could be DD/MM or MM/DD
    // Default to DD/MM/YYYY (international format)
    const [, first, second, year] = mmddyyyyMatch;
    return `${year}-${first}-${second}`;
  }

  // Try YYYY/MM/DD format
  const yyyymmddMatch = stringValue.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (yyyymmddMatch) {
    const [, year, month, day] = yyyymmddMatch;
    return `${year}-${month}-${day}`;
  }

  // Try parsing as Date object
  try {
    const date = new Date(stringValue);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (e) {
    // Ignore parsing errors
  }

  console.warn(`[ExtractionTransformer] Could not parse date: ${stringValue}`);
  return stringValue; // Return as-is and let form validation handle it
}
