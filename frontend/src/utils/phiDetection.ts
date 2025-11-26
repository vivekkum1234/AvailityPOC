/**
 * PHI Detection Utility
 * Detects and redacts Protected Health Information (PHI) according to HIPAA Safe Harbor rules
 */

export interface PHIMatch {
  type: 'ssn' | 'phone' | 'email' | 'date' | 'zipCode' | 'name';
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

// Regex patterns for PHI detection
const PHI_PATTERNS: Record<string, PHIPatternConfig> = {
  // Social Security Number: XXX-XX-XXXX or XXXXXXXXX
  ssn: {
    pattern: /\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b/g,
    label: 'Social Security Number',
    redactText: '[SSN REDACTED]'
  },
  
  // Phone numbers: (XXX) XXX-XXXX, XXX-XXX-XXXX, XXX.XXX.XXXX, XXXXXXXXXX
  phone: {
    pattern: /\b(?:\(\d{3}\)\s*|\d{3}[-.\s]?)\d{3}[-.\s]?\d{4}\b/g,
    label: 'Phone Number',
    redactText: '[PHONE REDACTED]'
  },
  
  // Email addresses
  email: {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    label: 'Email Address',
    redactText: '[EMAIL REDACTED]'
  },
  
  // Dates: MM/DD/YYYY, MM-DD-YYYY, M/D/YYYY, etc.
  date: {
    pattern: /\b(0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12][0-9]|3[01])[\/\-](19|20)\d{2}\b/g,
    label: 'Date (Potential DOB)',
    redactText: '[DATE REDACTED]'
  },
  
  // ZIP codes: XXXXX or XXXXX-XXXX
  zipCode: {
    pattern: /\b\d{5}(?:-\d{4})?\b/g,
    label: 'ZIP Code',
    redactText: '[ZIP REDACTED]'
  },
  
  // Common name patterns (basic detection)
  // Looks for capitalized words that might be names in context
  name: {
    pattern: /\b(?:member|patient|person|individual|subscriber|beneficiary)\s+(?:information|info|data|details)?\s+(?:for|of|about)?\s*["']?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)["']?/gi,
    label: 'Name',
    redactText: '[NAME REDACTED]',
    captureGroup: 1 // Extract the name from capture group
  }
};

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

