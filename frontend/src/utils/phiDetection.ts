/**
 * PHI Detection Utility
 * Detects and redacts Protected Health Information (PHI) according to HIPAA Safe Harbor rules
 */

export interface PHIMatch {
  type: 'ssn' | 'phone' | 'email' | 'date' | 'zipCode' | 'name' | 'mrn' | 'accountNumber' | 'address' | 'memberId';
  value: string;
  label: string;
  startIndex: number;
  endIndex: number;
}

export interface PHIDetectionResult {
  hasPHI: boolean;
  matches: PHIMatch[];
  originalMessage: string;
  redactedMessage: string;
}

interface PHIPatternConfig {
  pattern: RegExp;
  label: string;
  redactText: string;
  captureGroup?: number;
}

// Regex patterns for PHI detection based on HIPAA Safe Harbor identifiers
const PHI_PATTERNS: Record<string, PHIPatternConfig> = {
  // 1. Social Security Number: XXX-XX-XXXX or XXXXXXXXX
  ssn: {
    pattern: /\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b/g,
    label: 'Social Security Number',
    redactText: '[SSN REDACTED]'
  },

  // 2. Phone numbers: (XXX) XXX-XXXX, XXX-XXX-XXXX, XXX.XXX.XXXX, XXXXXXXXXX
  phone: {
    pattern: /\b(?:\(\d{3}\)\s*|\d{3}[-.\s]?)\d{3}[-.\s]?\d{4}\b/g,
    label: 'Phone Number',
    redactText: '[PHONE REDACTED]'
  },

  // 3. Email addresses
  email: {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    label: 'Email Address',
    redactText: '[EMAIL REDACTED]'
  },

  // 4. Dates: MM/DD/YYYY, MM-DD-YYYY, M/D/YYYY, etc. (potential DOB or admission dates)
  date: {
    pattern: /\b(0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12][0-9]|3[01])[\/\-](19|20)\d{2}\b/g,
    label: 'Date (Potential DOB)',
    redactText: '[DATE REDACTED]'
  },

  // 5. ZIP codes: XXXXX or XXXXX-XXXX (first 3 digits if population < 20,000)
  zipCode: {
    pattern: /\b\d{5}(?:-\d{4})?\b/g,
    label: 'ZIP Code',
    redactText: '[ZIP REDACTED]'
  },

  // 6. Medical Record Numbers (MRN): Common patterns like MRN-XXXXXX, MR#XXXXXX, etc.
  mrn: {
    pattern: /\b(?:MRN|MR#|Medical\s+Record|Record\s+Number|Patient\s+ID)[\s:#-]*([A-Z0-9]{5,})\b/gi,
    label: 'Medical Record Number',
    redactText: '[MRN REDACTED]',
    captureGroup: 1
  },

  // 7. Account Numbers: Common patterns
  accountNumber: {
    pattern: /\b(?:Account|Acct|Policy)[\s:#-]*([A-Z0-9]{6,})\b/gi,
    label: 'Account Number',
    redactText: '[ACCOUNT REDACTED]',
    captureGroup: 1
  },

  // 8. Names: Detects capitalized first and last names in ANY context
  // Matches 2-4 capitalized words (e.g., "John Doe", "Mary Jane Smith", "Ramki Sridhar")
  // Pattern: At least 2 words, each starting with capital letter followed by lowercase
  // Minimum 2 characters per word to avoid initials
  name: {
    pattern: /\b[A-Z][a-z]{1,}(?:\s+[A-Z][a-z]{1,}){1,3}\b/g,
    label: 'Potential Name',
    redactText: '[NAME REDACTED]'
  },

  // 9. Street Addresses: Detects patterns like "123 Main St", "456 Oak Avenue"
  address: {
    pattern: /\b\d{1,5}\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir|Way|Place|Pl)\b/gi,
    label: 'Street Address',
    redactText: '[ADDRESS REDACTED]'
  },

  // 10. Member/Subscriber ID: Common insurance ID patterns
  memberId: {
    pattern: /\b(?:Member|Subscriber|Insurance|Policy)\s+(?:ID|Number|#)[\s:#-]*([A-Z0-9]{6,})\b/gi,
    label: 'Member/Subscriber ID',
    redactText: '[MEMBER ID REDACTED]',
    captureGroup: 1
  }
};

// Common words that should NOT be flagged as names (false positive filter)
const EXCLUDED_NAMES = new Set([
  // Organizations & Companies
  'Availity', 'HIPAA', 'Medicare', 'Medicaid', 'United States', 'Social Security',
  'Health Insurance', 'Blue Cross', 'Blue Shield', 'Kaiser Permanente',
  'Aetna', 'Cigna', 'Humana', 'Anthem', 'UnitedHealthcare',

  // Months
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',

  // Days of week
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',

  // Geographic locations (major cities/regions)
  'North America', 'South America', 'New York', 'Los Angeles', 'San Francisco',
  'United Kingdom', 'Great Britain', 'New Jersey', 'New Mexico', 'New Hampshire',
  'North Carolina', 'South Carolina', 'South Dakota', 'North Dakota',
  'West Virginia', 'Rhode Island', 'Puerto Rico',

  // Common phrases that look like names
  'Thank You', 'Good Morning', 'Good Afternoon', 'Good Evening', 'Good Night',
  'Best Regards', 'Kind Regards', 'Yours Truly', 'Yours Sincerely',

  // Medical/Insurance terms
  'Primary Care', 'Emergency Room', 'Urgent Care', 'Mental Health',
  'Physical Therapy', 'Occupational Therapy', 'Speech Therapy',
  'Home Health', 'Skilled Nursing', 'Assisted Living',

  // Common business terms
  'Customer Service', 'Technical Support', 'Human Resources', 'Quality Assurance',
  'Project Management', 'Business Development', 'Sales Team', 'Marketing Team'
]);

/**
 * Check if a potential name is actually a false positive
 */
function isExcludedName(name: string): boolean {
  return EXCLUDED_NAMES.has(name);
}

/**
 * Detect PHI in a message
 */
export function detectPHI(message: string): PHIDetectionResult {
  const matches: PHIMatch[] = [];
  let redactedMessage = message;

  // Check each pattern
  Object.entries(PHI_PATTERNS).forEach(([type, config]) => {
    const regex = new RegExp(config.pattern);
    let match;

    while ((match = regex.exec(message)) !== null) {
      const value = config.captureGroup ? match[config.captureGroup] : match[0];
      const startIndex = config.captureGroup ? match.index + match[0].indexOf(value) : match.index;

      // Filter out false positives for names
      if (type === 'name' && isExcludedName(value.trim())) {
        continue; // Skip this match
      }

      matches.push({
        type: type as PHIMatch['type'],
        value: value,
        label: config.label,
        startIndex: startIndex,
        endIndex: startIndex + value.length
      });
    }
  });

  // Sort matches by start index (descending) to redact from end to start
  // This prevents index shifting issues
  const sortedMatches = [...matches].sort((a, b) => b.startIndex - a.startIndex);

  // Apply redactions
  sortedMatches.forEach(match => {
    const config = PHI_PATTERNS[match.type];
    redactedMessage = 
      redactedMessage.substring(0, match.startIndex) +
      config.redactText +
      redactedMessage.substring(match.endIndex);
  });

  return {
    hasPHI: matches.length > 0,
    matches: matches.sort((a, b) => a.startIndex - b.startIndex), // Return in original order
    originalMessage: message,
    redactedMessage: redactedMessage
  };
}

/**
 * Check if a message contains PHI (quick check)
 */
export function hasPHI(message: string): boolean {
  return detectPHI(message).hasPHI;
}

/**
 * Redact PHI from a message
 */
export function redactPHI(message: string): string {
  return detectPHI(message).redactedMessage;
}

/**
 * Get a user-friendly description of detected PHI
 */
export function getPHIDescription(matches: PHIMatch[]): string {
  if (matches.length === 0) return 'No PHI detected';
  
  const counts: Record<string, number> = {};
  matches.forEach(match => {
    counts[match.label] = (counts[match.label] || 0) + 1;
  });

  const descriptions = Object.entries(counts).map(([label, count]) => 
    count > 1 ? `${count} ${label}s` : label
  );

  return descriptions.join(', ');
}

