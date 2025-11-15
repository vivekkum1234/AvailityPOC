/**
 * Sample Data Generator for Auto-Fill Feature
 * Generates realistic sample data for each questionnaire section
 */

export interface SampleDataOptions {
  implementationMode?: string;
  organizationName?: string;
}

/**
 * Get sample data for a specific section
 */
export function getSampleDataForSection(
  sectionId: string,
  options: SampleDataOptions = {}
): Record<string, any> {
  const { implementationMode = 'real_time_b2b', organizationName = 'Aetna Health Insurance' } = options;

  const sampleDataMap: Record<string, Record<string, any>> = {
    'organization-info': {
      'organization-name': organizationName,
      'required-return-date': '2025-12-31'
    },

    'trading-partner-documentation': {
      'availity-enrollment-required': 'yes',
      'enrollment-forms-attachment': 'Enrollment forms attached separately',
      'implementation-mode-selection': implementationMode
    },

    'contact-information': {
      'trading-partner-technical-name': 'John Smith',
      'trading-partner-technical-phone': '555-123-4567',
      'trading-partner-technical-email': 'john.smith@aetna.com',
      'trading-partner-business-name': 'Sarah Johnson',
      'trading-partner-business-phone': '555-234-5678',
      'trading-partner-business-email': 'sarah.johnson@aetna.com',
      'availity-technical-name': 'Mike Davis',
      'availity-technical-phone': '555-345-6789',
      'availity-technical-email': 'mike.davis@availity.com',
      'availity-business-name': 'Lisa Wilson',
      'availity-business-phone': '555-456-7890',
      'availity-business-email': 'lisa.wilson@availity.com'
    },

    'enveloping-requirements': {
      'isa05-270': '01',
      'isa05-271': 'ZZ',
      'isa06-270': '030240928',
      'isa06-271': 'availity_defines',
      'isa07-270': 'ZZ',
      'isa07-271': '01',
      'isa08-270': 'availity_defines',
      'isa08-271': '030240928',
      'isa11-270': '^',
      'isa11-271': '^',
      'isa16-270': ':',
      'isa16-271': ':',
      'gs02-270': '030240928',
      'gs02-271': 'availity_defines',
      'gs03-270': 'availity_defines',
      'gs03-271': '030240928',
      '2100a-nm103-270': 'custom',
      '2100a-nm103-270-custom': 'Aetna',
      '2100a-nm103-271': 'custom',
      '2100a-nm103-271-custom': 'Aetna',
      '2100a-nm109-270': 'custom',
      '2100a-nm109-270-custom': '60054',
      '2100a-nm109-271': 'custom',
      '2100a-nm109-271-custom': '60054'
    },

    'payer-enhancements': {
      'uppercase-characters-acceptable': 'yes',
      'system-accept-spaces': 'yes',
      'accept-extended-character-set': 'yes',
      'extended-character-set-details': 'Standard ASCII extended characters supported',
      'character-set-requirements': 'UTF-8 encoding preferred'
    },

    'payer-specific-processing-errors': {
      'ansi-translator-syntax-error-rejection': '999',
      'support-ta1-response': 'yes',
      'ta1-response-driven-by-isa14': 'yes',
      'reject-not-used-segments': 'no'
    },

    'search-options': {
      'supported-search-options': [
        'patient_id_dob',
        'patient_id_first_last_name',
        'patient_id_first_last_name_dob'
      ],
      'support-all-service-type-codes': 'yes',
      'specific-patient-id-formatting': 'no'
    },

    'response': {
      'return-additional-data': 'no',
      'additional-response-requirements': 'Standard 271 response format'
    },

    // Real-time Web specific sections
    'payer-id-and-name': {
      'payer-id-organization': '60054',
      'publish-payer-id-permission': 'yes',
      'payer-name-display': 'Aetna Health Insurance'
    },

    'implementation-states': {
      'implementation-nationwide': 'yes'
    },

    'payer-logo': {
      // File upload - will be skipped in auto-fill
    },

    'connectivity': {
      'xml-wrapper-required': 'no',
      'test-url': 'https://test.aetna.com/eligibility',
      'prod-url': 'https://prod.aetna.com/eligibility',
      'test-user-id': 'test_user_123',
      'prod-user-id': 'prod_user_456',
      'continuous-threads-support': '10',
      'production-approval-process': 'Submit test results to technical team for review and approval'
    },

    'testing': {
      'test-member-id-format': 'Alphanumeric, 9-12 characters',
      'test-member-ids': 'TEST123456, TEST234567, TEST345678',
      'other-testing-restrictions': 'no',
      'test-file-preparation-date': '2025-02-01'
    },

    'essentials-page-fields': {
      'payer-name-field': 'Aetna Health Insurance',
      'payer-id-qualifier-support': 'yes',
      'member-id-label': 'Member ID',
      'group-number-label': 'Group Number',
      'additional-fields-required': 'no'
    },

    // Real-time B2B specific sections
    'connectivity-b2b': {
      'xml-wrapper-required-b2b': 'no',
      'differing-connectivity-requirements-b2b': 'no',
      'test-url-b2b': 'https://test.aetna.com/b2b/eligibility',
      'test-user-id-b2b': 'b2b_test_user_123',
      'prod-url-b2b': 'https://prod.aetna.com/b2b/eligibility',
      'prod-user-id-b2b': 'b2b_prod_user_456',
      'system-hours-availability-b2b': '24/7 - Available all days',
      'continuous-threads-support-b2b': '20'
    },

    'testing-b2b': {
      'production-approval-process-b2b': 'Submit test results and UAT documentation to technical team for review. Production approval requires successful completion of all test scenarios and sign-off from QA team.',
      'test-environment-availability-b2b': 'yes',
      'specific-testing-requirements-b2b': 'yes',
      'testing-requirements-details-b2b': 'All test scenarios must include edge cases and error handling validation.',
      'exclude-eb-benefit-types-b2b': 'no',
      'test-files-valid-provider-data-b2b': 'yes',
      'test-files-valid-membership-b2b': 'yes',
      'designated-payer-id-testing-b2b': 'yes',
      'payer-id-testing-details-b2b': 'Test Payer ID: 12345 for Commercial, 67890 for Medicare',
      'test-transaction-limits-b2b': 'yes',
      'test-transaction-limits-details-b2b': 'Minimum 100 transactions, maximum 10,000 transactions per test cycle',
      'other-testing-restrictions-b2b': 'no',
      'test-file-preparation-date-b2b': '2024-12-01'
    }
  };

  return sampleDataMap[sectionId] || {};
}

/**
 * Get sample data for all sections based on implementation mode
 */
export function getAllSampleData(implementationMode: string = 'real_time_b2b'): Record<string, any> {
  const allData: Record<string, any> = {};
  
  // Common sections (always included)
  const commonSections = [
    'organization-info',
    'trading-partner-documentation',
    'contact-information',
    'enveloping-requirements',
    'payer-enhancements',
    'search-options',
    'response'
  ];

  // Add common sections data
  commonSections.forEach(sectionId => {
    const sectionData = getSampleDataForSection(sectionId, { implementationMode });
    Object.assign(allData, sectionData);
  });

  // Add mode-specific sections
  if (implementationMode === 'real_time_web') {
    const webSections = [
      'payer-id-and-name',
      'implementation-states',
      'connectivity',
      'testing',
      'essentials-page-fields'
    ];
    webSections.forEach(sectionId => {
      const sectionData = getSampleDataForSection(sectionId, { implementationMode });
      Object.assign(allData, sectionData);
    });
  } else if (implementationMode === 'real_time_b2b') {
    const b2bSections = [
      'connectivity-b2b',
      'testing-b2b'
    ];
    b2bSections.forEach(sectionId => {
      const sectionData = getSampleDataForSection(sectionId, { implementationMode });
      Object.assign(allData, sectionData);
    });
  } else if (implementationMode === 'edi_batch') {
    const batchSections = [
      'connectivity-edi-batch',
      'file-structure-naming-edi-batch',
      'standard-aggregation-schedule-edi-batch'
    ];
    batchSections.forEach(sectionId => {
      const sectionData = getSampleDataForSection(sectionId, { implementationMode });
      Object.assign(allData, sectionData);
    });
  }

  return allData;
}

/**
 * Get list of section IDs that should be filled based on implementation mode
 */
export function getSectionsToFill(implementationMode: string = 'real_time_b2b'): string[] {
  const commonSections = [
    'organization-info',
    'trading-partner-documentation',
    'contact-information',
    'enveloping-requirements',
    'payer-enhancements',
    'payer-specific-processing-errors',
    'search-options',
    'response'
  ];

  const modeSections: Record<string, string[]> = {
    'real_time_web': [
      'payer-id-and-name',
      'implementation-states',
      'payer-logo',
      'connectivity',
      'testing',
      'essentials-page-fields'
    ],
    'real_time_b2b': [
      'connectivity-b2b',
      'testing-b2b'
    ],
    'edi_batch': [
      'connectivity-edi-batch',
      'file-structure-naming-edi-batch',
      'standard-aggregation-schedule-edi-batch'
    ]
  };

  return [...commonSections, ...(modeSections[implementationMode] || [])];
}

