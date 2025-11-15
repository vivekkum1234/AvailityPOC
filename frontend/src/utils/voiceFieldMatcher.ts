import { Question, QuestionType } from '../types/questionnaire';

/**
 * Normalize a string for fuzzy matching
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Calculate similarity score between two strings (0-1)
 * Uses a simple word overlap algorithm
 */
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = normalizeString(str1).split(' ');
  const words2 = normalizeString(str2).split(' ');
  
  let matchCount = 0;
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1 === word2 || word1.includes(word2) || word2.includes(word1)) {
        matchCount++;
        break;
      }
    }
  }
  
  const maxWords = Math.max(words1.length, words2.length);
  return maxWords > 0 ? matchCount / maxWords : 0;
}

/**
 * Find the best matching question from a list based on field name
 */
export function findMatchingQuestion(
  fieldName: string,
  questions: Question[]
): Question | null {
  if (!fieldName || !questions || questions.length === 0) {
    return null;
  }

  let bestMatch: Question | null = null;
  let bestScore = 0;
  const threshold = 0.3; // Minimum similarity threshold

  for (const question of questions) {
    const titleScore = calculateSimilarity(fieldName, question.title);
    const idScore = calculateSimilarity(fieldName, question.id);
    
    // Also check description if available
    const descScore = question.description 
      ? calculateSimilarity(fieldName, question.description) 
      : 0;
    
    const maxScore = Math.max(titleScore, idScore, descScore);
    
    if (maxScore > bestScore && maxScore >= threshold) {
      bestScore = maxScore;
      bestMatch = question;
    }
  }

  console.log('Field matching:', fieldName, '-> Best match:', bestMatch?.title, 'Score:', bestScore);
  return bestMatch;
}

/**
 * Normalize yes/no variations to standard values
 */
export function normalizeYesNo(value: string): string {
  const normalized = normalizeString(value);
  
  // Yes variations
  if (['yes', 'yeah', 'yep', 'yup', 'sure', 'correct', 'true', 'affirmative'].includes(normalized)) {
    return 'yes';
  }
  
  // No variations
  if (['no', 'nope', 'nah', 'negative', 'false', 'incorrect'].includes(normalized)) {
    return 'no';
  }
  
  return value;
}

/**
 * Match a value to a question's options (for radio/select questions)
 */
export function matchValueToOption(
  value: string,
  question: Question
): string | null {
  if (!question.options || question.options.length === 0) {
    return null;
  }

  // First, normalize yes/no if applicable
  const normalizedValue = normalizeYesNo(value);
  
  // Try exact match first
  for (const option of question.options) {
    if (normalizeString(option.value) === normalizeString(normalizedValue)) {
      return option.value;
    }
    if (normalizeString(option.label) === normalizeString(normalizedValue)) {
      return option.value;
    }
  }
  
  // Try fuzzy match
  let bestMatch: string | null = null;
  let bestScore = 0;
  const threshold = 0.5;
  
  for (const option of question.options) {
    const valueScore = calculateSimilarity(normalizedValue, option.value);
    const labelScore = calculateSimilarity(normalizedValue, option.label);
    const maxScore = Math.max(valueScore, labelScore);
    
    if (maxScore > bestScore && maxScore >= threshold) {
      bestScore = maxScore;
      bestMatch = option.value;
    }
  }
  
  console.log('Value matching:', value, '-> Best match:', bestMatch, 'Score:', bestScore);
  return bestMatch;
}

/**
 * Validate and format a value for a specific question type
 */
export function validateAndFormatValue(
  value: string,
  question: Question
): { valid: boolean; formattedValue?: string; error?: string } {
  const type = question.type;
  
  // For radio/select/checkbox, match to options
  if (type === QuestionType.RADIO || type === QuestionType.SELECT) {
    const matchedValue = matchValueToOption(value, question);
    if (matchedValue) {
      return { valid: true, formattedValue: matchedValue };
    }
    return { valid: false, error: `"${value}" is not a valid option for this field` };
  }
  
  // For text-based fields, return as-is (with basic validation)
  if (type === QuestionType.TEXT || type === QuestionType.TEXTAREA) {
    return { valid: true, formattedValue: value };
  }
  
  // For email, basic validation
  if (type === QuestionType.EMAIL) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(value)) {
      return { valid: true, formattedValue: value };
    }
    return { valid: false, error: 'Invalid email format' };
  }
  
  // For URL, basic validation
  if (type === QuestionType.URL) {
    try {
      new URL(value);
      return { valid: true, formattedValue: value };
    } catch {
      return { valid: false, error: 'Invalid URL format' };
    }
  }
  
  // For number
  if (type === QuestionType.NUMBER) {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      return { valid: true, formattedValue: num.toString() };
    }
    return { valid: false, error: 'Invalid number format' };
  }
  
  // Default: accept as-is
  return { valid: true, formattedValue: value };
}

