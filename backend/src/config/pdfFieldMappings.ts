/**
 * PDF Field Mapping Configuration
 * 
 * Maps PDF form field names to questionnaire question IDs
 * Supports both common fields and Real-Time B2B specific fields
 */

export interface FieldMapping {
  pdfFieldName: string | null; // null means static value
  questionId: string;
  section: 'common' | 'b2b';
  staticValue?: string; // Static value if pdfFieldName is null
  transform?: (value: any) => any; // Optional value transformation function
}

/**
 * Common fields mapping (before Transaction Mode 1)
 */
export const commonFieldMappings: FieldMapping[] = [
  // ===== Section 1: Organization Information =====
  { pdfFieldName: 'Organization name', questionId: 'organization-name', section: 'common' },
  { pdfFieldName: 'Required return date', questionId: 'required-return-date', section: 'common' },

  // ===== Section 2: Trading Partner Documentation =====
  { pdfFieldName: 'Do you require Availity to enroll prior to submitting 270 transactions', questionId: 'availity-enrollment-required', section: 'common' },
  { pdfFieldName: 'Real-time B2B', questionId: 'implementation-mode-selection', section: 'common' },

  // ===== Section 3: Contact Information =====
  // Trading Partner Technical Contact (mandatory fields only)
  { pdfFieldName: 'Name1', questionId: 'trading-partner-technical-name', section: 'common' },
  { pdfFieldName: 'Phone1', questionId: 'trading-partner-technical-phone', section: 'common' },
  { pdfFieldName: 'Email1', questionId: 'trading-partner-technical-email', section: 'common' },

  // ===== Section 4: Enveloping Requirements =====
  // ISA05 - Sender ID Qualifier
  { pdfFieldName: null, questionId: 'isa05-270', section: 'common', staticValue: '01' },
  { pdfFieldName: null, questionId: 'isa05-271', section: 'common', staticValue: 'ZZ' },

  // ISA06 - Sender ID
  { pdfFieldName: 'ISA06_270', questionId: 'isa06-270', section: 'common' },
  { pdfFieldName: 'ISA06_271', questionId: 'isa06-271', section: 'common' },

  // ISA07 - Receiver ID Qualifier
  { pdfFieldName: null, questionId: 'isa07-270', section: 'common', staticValue: 'ZZ' },
  { pdfFieldName: 'ISA07_271', questionId: 'isa07-271', section: 'common' },

  // ISA08 - Receiver ID
  { pdfFieldName: 'ISA08_270', questionId: 'isa08-270', section: 'common' },
  { pdfFieldName: null, questionId: 'isa08-271', section: 'common', staticValue: '030240928' },

  // ISA11 - Repetition Separator
  { pdfFieldName: null, questionId: 'isa11-270', section: 'common', staticValue: '^' },
  { pdfFieldName: null, questionId: 'isa11-271', section: 'common', staticValue: '^' },

  // ISA16 - Component Element Separator
  { pdfFieldName: null, questionId: 'isa16-270', section: 'common', staticValue: ':' },
  { pdfFieldName: 'ISA16 Component Element Separator_3', questionId: 'isa16-271', section: 'common' },

  // GS02 - Application Sender Code
  { pdfFieldName: 'GS02_270', questionId: 'gs02-270', section: 'common' },
  { pdfFieldName: 'GS02_271', questionId: 'gs02-271', section: 'common' },

  // GS03 - Application Receiver Code
  { pdfFieldName: 'GS03_270', questionId: 'gs03-270', section: 'common' },
  { pdfFieldName: 'GS03_271', questionId: 'gs03-271', section: 'common' },

  // 2100A NM103 - Payer Name
  { pdfFieldName: '270_2100A_NM103', questionId: '2100a-nm103-270', section: 'common' },
  { pdfFieldName: '271_2100A_NM103', questionId: '2100a-nm103-271', section: 'common' },

  // 2100A NM109 - Payer ID
  { pdfFieldName: '270_2100A_NM109', questionId: '2100a-nm109-270', section: 'common' },
  { pdfFieldName: '271_2100A_NM109', questionId: '2100a-nm109-271', section: 'common' },

  // ===== SECTION 5: PAYER ENHANCEMENTS =====
  { pdfFieldName: 'Availitys standard is to send uppercase characters Is this acceptable', questionId: 'uppercase-characters-acceptable', section: 'common' },
  { pdfFieldName: 'A space is part of the X12 basic character set Does your system accept spaces', questionId: 'system-accept-spaces', section: 'common' },
  { pdfFieldName: 'Do you accept characters from the X12 extended character set', questionId: 'accept-extended-character-set', section: 'common' },

  // ===== SECTION 6: PAYER SPECIFIC PROCESSING ERRORS/EDITS =====
  { pdfFieldName: 'How do you reject the transaction?', questionId: 'ansi-translator-syntax-error-rejection', section: 'common' },
  { pdfFieldName: 'Do you support the TA1 response?', questionId: 'support-ta1-response', section: 'common' },
  { pdfFieldName: 'Is the TA1 response driven by ISA14?', questionId: 'ta1-response-driven-by-isa14', section: 'common' },
  { pdfFieldName: 'Will you reject transactions that contain not used segments', questionId: 'reject-not-used-segments', section: 'common' },

  // ===== SECTION 7: SEARCH OPTIONS =====
  // Multi-select checkbox options for supported search options
  // HARDCODED: Always select first two options (Patient ID & DOB, Patient ID First Name Last Name)
  { pdfFieldName: null, questionId: 'supported-search-options', section: 'common', staticValue: 'patient_id_dob' },
  { pdfFieldName: null, questionId: 'supported-search-options', section: 'common', staticValue: 'patient_id_first_last_name' },

  { pdfFieldName: 'Can you support all service type codes', questionId: 'support-all-service-type-codes', section: 'common' },
  { pdfFieldName: 'requirements for the formatting of the patient ID on the 270 request', questionId: 'specific-patient-id-formatting', section: 'common' },

  // ===== SECTION 8: RESPONSE =====
  { pdfFieldName: 'Will you return additional data not reported in the standard 271 response', questionId: 'return-additional-data', section: 'common' },
  { pdfFieldName: 'Will you return additional data not reported in the standard 271 response', questionId: 'additional-data-examples', section: 'common' },
];

/**
 * Real-Time B2B fields mapping (Transaction Mode 2)
 */
export const b2bFieldMappings: FieldMapping[] = [
  // ===== SECTION 15: CONNECTIVITY (REAL-TIME B2B) =====
  { pdfFieldName: '2. Availity supports XML envelope structure Do you require an XML wrapper', questionId: 'xml-wrapper-required-b2b', section: 'b2b' },
  { pdfFieldName: 'Do you have differing connectivity requirements for each state?2', questionId: 'differing-connectivity-requirements-b2b', section: 'b2b' },
  { pdfFieldName: 'Test URL2', questionId: 'test-url-b2b', section: 'b2b' },
  { pdfFieldName: 'Test user IDs2', questionId: 'test-user-id-b2b', section: 'b2b' },
  { pdfFieldName: 'Prod URL2', questionId: 'prod-url-b2b', section: 'b2b' },
  { pdfFieldName: 'Prod user IDs2', questionId: 'prod-user-id-b2b', section: 'b2b' },
  { pdfFieldName: 'What are your system\'s hours of availability?2', questionId: 'system-hours-availability-b2b', section: 'b2b' },
  { pdfFieldName: 'How many continuous threads can you support?2', questionId: 'continuous-threads-support-b2b', section: 'b2b' },

  // ===== SECTION 16: TESTING (REAL-TIME B2B) =====
  { pdfFieldName: 'Please describe your production approval process', questionId: 'production-approval-process-b2b', section: 'b2b' },
  { pdfFieldName: 'After you receive production approval will your test environment continue to be available_2', questionId: 'test-environment-availability-b2b', section: 'b2b' },
  { pdfFieldName: 'Does your organization have specific testing requirements_2', questionId: 'specific-testing-requirements-b2b', section: 'b2b' },
  { pdfFieldName: 'Do you exclude any E&B benefit types from testing?', questionId: 'exclude-eb-benefit-types-b2b', section: 'b2b' },
  { pdfFieldName: 'Do test files require valid provider data', questionId: 'test-files-valid-provider-data-b2b', section: 'b2b' },
  { pdfFieldName: 'Do test files require valid membership records?', questionId: 'test-files-valid-membership-b2b', section: 'b2b' },
  { pdfFieldName: 'Do you have a designated payer ID you would like Availity to use in testing_2', questionId: 'designated-payer-id-testing-b2b', section: 'b2b' },
  { pdfFieldName: 'Do you have a minimum or maximum number of test transactions you will accept_2', questionId: 'test-transaction-limits-b2b', section: 'b2b' },
  { pdfFieldName: 'Do you have any other testing or test transaction restrictions_2', questionId: 'other-testing-restrictions-b2b', section: 'b2b' },
  { pdfFieldName: '10 When will you be prepared to receive a test file Please specify a date or date range', questionId: 'test-file-preparation-date-b2b', section: 'b2b' },
];

/**
 * Combined mapping lookup
 */
export const allFieldMappings: FieldMapping[] = [
  ...commonFieldMappings,
  ...b2bFieldMappings
];

/**
 * Get question ID for a PDF field name
 */
export function getQuestionIdForPDFField(pdfFieldName: string): string | null {
  const mapping = allFieldMappings.find(m =>
    m.pdfFieldName !== null && m.pdfFieldName.toLowerCase() === pdfFieldName.toLowerCase()
  );
  return mapping ? mapping.questionId : null;
}

/**
 * Get all mappings for a specific section
 */
export function getMappingsForSection(section: 'common' | 'b2b'): FieldMapping[] {
  return allFieldMappings.filter(m => m.section === section);
}

/**
 * Transform PDF value to questionnaire format
 */
export function transformPDFValue(pdfFieldName: string, value: any): any {
  const mapping = allFieldMappings.find(m =>
    m.pdfFieldName !== null && m.pdfFieldName.toLowerCase() === pdfFieldName.toLowerCase()
  );
  
  if (mapping && mapping.transform) {
    return mapping.transform(value);
  }
  
  // Default transformations
  if (typeof value === 'boolean') {
    return value ? 'yes' : 'no';
  }
  
  return value;
}

