import { Questionnaire, QuestionType, ImplementationMode } from '../types/questionnaire';

export const x12270271CompleteQuestionnaire: Questionnaire = {
  id: 'x12-270-271-complete',
  title: 'X12 270/271 Implementation Questionnaire - Complete',
  description: 'Comprehensive digital questionnaire for X12 270/271 HIPAA transaction implementation with all PDF fields',
  version: '2.0.0',
  transactionType: '270/271',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date(),
  createdBy: 'system',
  isActive: true,
  sections: [
    {
      id: 'organization-info',
      title: 'Organization Information',
      description: 'Basic information about your organization',
      order: 1,
      questions: [
        {
          id: 'organization-name',
          type: QuestionType.TEXT,
          title: 'Organization Name',
          description: '',
          required: true,
          attachmentRequired: false,
          validation: {
            maxLength: 100,
          }
        },
        {
          id: 'required-return-date',
          type: QuestionType.DATE,
          title: 'Required Return Date',
          description: 'When do you need this implementation completed?',
          required: true,
          attachmentRequired: false
        }
      ]
    },
    {
      id: 'trading-partner-documentation',
      title: 'Trading Partner Documentation',
      description: 'Trading partner enrollment and implementation mode requirements',
      order: 2,
      questions: [
        {
          id: 'availity-enrollment-required',
          type: QuestionType.RADIO,
          title: 'Do you require Availity to enroll prior to submitting 270 transactions?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'enrollment-forms-attachment',
          type: QuestionType.TEXT,
          title: 'If Yes, please include the forms Availity needs to complete for enrollment as a separate attachment.',
          description: '',
          required: false,
          attachmentRequired: true,
          conditionalLogic: {
            dependsOn: 'availity-enrollment-required',
            showWhen: ['yes']
          }
        },
        {
          id: 'implementation-mode-selection',
          type: QuestionType.RADIO,
          title: 'Please indicate the mode type you are implementing for the 270/271 transaction:',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'real_time_web', label: 'Real-time web' },
            { value: 'real_time_b2b', label: 'Real-time B2B' },
            { value: 'edi_batch', label: 'EDI batch' }
          ]
        },
        {
          id: 'questionnaire-completion-note',
          type: QuestionType.DISPLAY,
          title: 'Please only complete this questionnaire\'s primary sections (Trading partner documentation through Response) as well as the section for the mode you are implementing.',
          description: '',
          required: false,
          attachmentRequired: false
        }
      ]
    },
    {
      id: 'contact-information',
      title: 'Contact Information',
      description: 'Primary and secondary contacts for this implementation',
      order: 3,
      questions: [
        {
          id: 'trading-partner-technical-header',
          type: QuestionType.DISPLAY,
          title: 'Trading Partner Technical Contact',
          description: 'Technical contact from your organization',
          required: false,
          attachmentRequired: false
        },
        {
          id: 'trading-partner-technical-name',
          type: QuestionType.TEXT,
          title: 'Trading Partner Technical Contact - Name',
          description: '',
          required: true,
          attachmentRequired: false,
          validation: {
            maxLength: 100,
          }
        },
        {
          id: 'trading-partner-technical-phone',
          type: QuestionType.TEXT,
          title: 'Trading Partner Technical Contact - Phone',
          description: '',
          required: true,
          attachmentRequired: false,
          validation: {
            pattern: '^[\d\s\-\(\)\+]+$',
          },
          x12Field: {
            segment: 'PER*IC*{ContactName}*TE*{PhoneNumber}',
            description: ''
          }
        },
        {
          id: 'trading-partner-technical-email',
          type: QuestionType.EMAIL,
          title: 'Trading Partner Technical Contact - Email',
          description: '',
          required: true,
          attachmentRequired: false,
          x12Field: {
            segment: 'PER*IC*{ContactName}*EM*{EmailAddress}',
            description: ''
          }
        },
        {
          id: 'availity-technical-header',
          type: QuestionType.DISPLAY,
          title: 'Availity Technical Contact',
          description: 'Technical contact from Availity (to be completed by Availity)',
          required: false,
          attachmentRequired: false
        },
        {
          id: 'availity-technical-name',
          type: QuestionType.TEXT,
          title: 'Availity Technical Contact - Name',
          description: '',
          required: false,
          attachmentRequired: false,
          validation: {
            maxLength: 100,
          }
        },
        {
          id: 'availity-technical-phone',
          type: QuestionType.TEXT,
          title: 'Availity Technical Contact - Phone',
          description: '',
          required: false,
          attachmentRequired: false,
          validation: {
            pattern: '^[\d\s\-\(\)\+]+$',
          },
          x12Field: {
            segment: 'PER*IC*{ContactName}*TE*{PhoneNumber}',
            description: ''
          }
        },
        {
          id: 'availity-technical-email',
          type: QuestionType.EMAIL,
          title: 'Availity Technical Contact - Email',
          description: '',
          required: false,
          attachmentRequired: false,
          x12Field: {
            segment: 'PER*IC*{ContactName}*EM*{EmailAddress}',
            description: ''
          }
        },
        {
          id: 'trading-partner-account-manager-header',
          type: QuestionType.DISPLAY,
          title: 'Trading Partner Account/Program Manager',
          description: 'Account or program manager from your organization',
          required: false,
          attachmentRequired: false
        },
        {
          id: 'trading-partner-account-manager-name',
          type: QuestionType.TEXT,
          title: 'Trading Partner Account/Program Manager - Name',
          description: '',
          required: false,
          attachmentRequired: false,
          validation: {
            maxLength: 100,
          }
        },
        {
          id: 'trading-partner-account-manager-phone',
          type: QuestionType.TEXT,
          title: 'Trading Partner Account/Program Manager - Phone',
          description: '',
          required: false,
          attachmentRequired: false,
          validation: {
            pattern: '^[\d\s\-\(\)\+]+$',
          },
          x12Field: {
            segment: 'PER*IC*{ContactName}*TE*{PhoneNumber}',
            description: ''
          }
        },
        {
          id: 'trading-partner-account-manager-email',
          type: QuestionType.EMAIL,
          title: 'Trading Partner Account/Program Manager - Email',
          description: '',
          required: false,
          attachmentRequired: false,
          x12Field: {
            segment: 'PER*IC*{ContactName}*EM*{EmailAddress}',
            description: ''
          }
        },
        {
          id: 'availity-account-manager-header',
          type: QuestionType.DISPLAY,
          title: 'Availity Account/Program Manager',
          description: 'Account or program manager from Availity',
          required: false,
          attachmentRequired: false
        },
        {
          id: 'availity-account-manager-name',
          type: QuestionType.TEXT,
          title: 'Availity Account/Program Manager - Name',
          description: '',
          required: false,
          attachmentRequired: false,
          validation: {
            maxLength: 100,
          }
        },
        {
          id: 'availity-account-manager-phone',
          type: QuestionType.TEXT,
          title: 'Availity Account/Program Manager - Phone',
          description: '',
          required: false,
          attachmentRequired: false,
          validation: {
            pattern: '^[\d\s\-\(\)\+]+$',
          },
          x12Field: {
            segment: 'PER*IC*{ContactName}*TE*{PhoneNumber}',
            description: ''
          }
        },
        {
          id: 'availity-account-manager-email',
          type: QuestionType.EMAIL,
          title: 'Availity Account/Program Manager - Email',
          description: '',
          required: false,
          attachmentRequired: false,
          x12Field: {
            segment: 'PER*IC*{ContactName}*EM*{EmailAddress}',
            description: ''
          }
        },
        {
          id: 'trading-partner-escalation-header',
          type: QuestionType.DISPLAY,
          title: 'Trading Partner Escalation Contact',
          description: 'Escalation contact from your organization',
          required: false,
          attachmentRequired: false
        },
        {
          id: 'trading-partner-escalation-name',
          type: QuestionType.TEXT,
          title: 'Trading Partner Escalation Contact - Name',
          description: '',
          required: false,
          attachmentRequired: false,
          validation: {
            maxLength: 100,
          }
        },
        {
          id: 'trading-partner-escalation-phone',
          type: QuestionType.TEXT,
          title: 'Trading Partner Escalation Contact - Phone',
          description: '',
          required: false,
          attachmentRequired: false,
          validation: {
            pattern: '^[\d\s\-\(\)\+]+$',
          },
          x12Field: {
            segment: 'PER*IC*{ContactName}*TE*{PhoneNumber}',
            description: ''
          }
        },
        {
          id: 'trading-partner-escalation-email',
          type: QuestionType.EMAIL,
          title: 'Trading Partner Escalation Contact - Email',
          description: '',
          required: false,
          attachmentRequired: false,
          x12Field: {
            segment: 'PER*IC*{ContactName}*EM*{EmailAddress}',
            description: ''
          }
        },
        {
          id: 'availity-escalation-header',
          type: QuestionType.DISPLAY,
          title: 'Availity Escalation Contact',
          description: 'Escalation contact from Availity',
          required: false,
          attachmentRequired: false
        },
        {
          id: 'availity-escalation-name',
          type: QuestionType.TEXT,
          title: 'Availity Escalation Contact - Name',
          description: '',
          required: false,
          attachmentRequired: false,
          validation: {
            maxLength: 100,
          }
        },
        {
          id: 'availity-escalation-phone',
          type: QuestionType.TEXT,
          title: 'Availity Escalation Contact - Phone',
          description: '',
          required: false,
          attachmentRequired: false,
          validation: {
            pattern: '^[\d\s\-\(\)\+]+$',
          },
          x12Field: {
            segment: 'PER*IC*{ContactName}*TE*{PhoneNumber}',
            description: ''
          }
        },
        {
          id: 'availity-escalation-email',
          type: QuestionType.EMAIL,
          title: 'Availity Escalation Contact - Email',
          description: '',
          required: false,
          attachmentRequired: false,
          x12Field: {
            segment: 'PER*IC*{ContactName}*EM*{EmailAddress}',
            description: ''
          }
        },
        {
          id: 'additional-trading-partner-header',
          type: QuestionType.DISPLAY,
          title: 'Additional Trading Partner Contact',
          description: 'Additional contact from your organization',
          required: false,
          attachmentRequired: false
        },
        {
          id: 'additional-trading-partner-name',
          type: QuestionType.TEXT,
          title: 'Additional Trading Partner Contact - Name',
          description: '',
          required: false,
          attachmentRequired: false,
          validation: {
            maxLength: 100,
          }
        },
        {
          id: 'additional-trading-partner-phone',
          type: QuestionType.TEXT,
          title: 'Additional Trading Partner Contact - Phone',
          description: '',
          required: false,
          attachmentRequired: false,
          validation: {
            pattern: '^[\d\s\-\(\)\+]+$',
          },
          x12Field: {
            segment: 'PER*IC*{ContactName}*TE*{PhoneNumber}',
            description: ''
          }
        },
        {
          id: 'additional-trading-partner-email',
          type: QuestionType.EMAIL,
          title: 'Additional Trading Partner Contact - Email',
          description: '',
          required: false,
          attachmentRequired: false,
          x12Field: {
            segment: 'PER*IC*{ContactName}*EM*{EmailAddress}',
            description: ''
          }
        },
        {
          id: 'other-availity-header',
          type: QuestionType.DISPLAY,
          title: 'Other Availity Contact',
          description: 'Other contact from Availity',
          required: false,
          attachmentRequired: false
        },
        {
          id: 'other-availity-name',
          type: QuestionType.TEXT,
          title: 'Other Availity Contact - Name',
          description: '',
          required: false,
          attachmentRequired: false,
          validation: {
            maxLength: 100,
          }
        },
        {
          id: 'other-availity-phone',
          type: QuestionType.TEXT,
          title: 'Other Availity Contact - Phone',
          description: '',
          required: false,
          attachmentRequired: false,
          validation: {
            pattern: '^[\d\s\-\(\)\+]+$',
          },
          x12Field: {
            segment: 'PER*IC*{ContactName}*TE*{PhoneNumber}',
            description: ''
          }
        },
        {
          id: 'other-availity-email',
          type: QuestionType.EMAIL,
          title: 'Other Availity Contact - Email',
          description: '',
          required: false,
          attachmentRequired: false,
          x12Field: {
            segment: 'PER*IC*{ContactName}*EM*{EmailAddress}',
            description: ''
          }
        }
      ]
    },
    {
      id: 'enveloping-requirements',
      title: 'Enveloping Requirements',
      description: 'Availity uses standard ANSI enveloping requirements and can provide a complete copy of all values upon request. In the following table, please indicate the values you are using for the designated fields. Values without a reliable field cannot be modified.',
      order: 4,
      customComponent: 'EnvelopingRequirementsTable',
      envelopingRequirements: [
        {
          field: 'ISA05',
          fieldDescription: 'Sender ID Qualifier',
          length: 2,
          request270: {
            id: 'isa05-270',
            options: [
              { value: '01', label: '01' },
              { value: 'custom', label: 'Other (please specify)' }
            ],
            defaultValue: '01'
          },
          response271: {
            id: 'isa05-271',
            options: [
              { value: 'ZZ', label: 'ZZ' },
              { value: 'custom', label: 'Other (please specify)' }
            ],
            defaultValue: 'ZZ'
          }
        },
        {
          field: 'ISA06',
          fieldDescription: 'Sender ID',
          length: 15,
          request270: {
            id: 'isa06-270',
            options: [
              { value: '030240928', label: '030240928' },
              { value: 'custom', label: 'Other (please specify)' }
            ],
            defaultValue: '030240928'
          },
          response271: {
            id: 'isa06-271',
            options: [
              { value: 'availity_defines', label: 'Availity defines' },
              { value: 'custom', label: 'Other (please specify)' }
            ],
            defaultValue: 'availity_defines'
          }
        },
        {
          field: 'ISA07',
          fieldDescription: 'Receiver ID Qualifier',
          length: 2,
          request270: {
            id: 'isa07-270',
            options: [
              { value: 'ZZ', label: 'ZZ' }
            ],
            defaultValue: 'ZZ'
          },
          response271: {
            id: 'isa07-271',
            options: [
              { value: '01', label: '01' },
              { value: 'custom', label: 'Other (please specify)' }
            ],
            defaultValue: '01'
          }
        },
        {
          field: 'ISA08',
          fieldDescription: 'Receiver ID',
          length: 15,
          request270: {
            id: 'isa08-270',
            options: [
              { value: 'availity_defines', label: 'Availity defines' },
              { value: 'custom', label: 'Other (please specify)' }
            ],
            defaultValue: ''
          },
          response271: {
            id: 'isa08-271',
            options: [
              { value: '030240928', label: '030240928' }
            ],
            defaultValue: '030240928'
          }
        },
        {
          field: 'ISA11',
          fieldDescription: 'Repetition Separator',
          length: 1,
          request270: {
            id: 'isa11-270',
            options: [
              { value: '^', label: '^ (Availity standard)' }
            ],
            defaultValue: '^'
          },
          response271: {
            id: 'isa11-271',
            options: [
              { value: '^', label: '^ (Availity standard)' }
            ],
            defaultValue: '^'
          }
        },
        {
          field: 'ISA16',
          fieldDescription: 'Component Element Separator',
          length: 1,
          request270: {
            id: 'isa16-270',
            options: [
              { value: ':', label: 'Composite separator ( : )' }
            ],
            defaultValue: ':'
          },
          response271: {
            id: 'isa16-271',
            options: [
              { value: ':', label: ': (Availity standard)' },
              { value: '*', label: '*' },
              { value: '~', label: '~' }
            ],
            defaultValue: ':'
          }
        },
        {
          field: 'GS02',
          fieldDescription: 'Application Sender Code',
          length: 15,
          request270: {
            id: 'gs02-270',
            options: [
              { value: '030240928', label: '030240928' },
              { value: 'custom', label: 'Other (please specify)' }
            ],
            defaultValue: ''
          },
          response271: {
            id: 'gs02-271',
            options: [
              { value: 'availity_defines', label: 'Availity defines' },
              { value: 'custom', label: 'Other (please specify)' }
            ],
            defaultValue: ''
          }
        },
        {
          field: 'GS03',
          fieldDescription: 'Application Receiver Code',
          length: 15,
          request270: {
            id: 'gs03-270',
            options: [
              { value: 'availity_defines', label: 'Availity defines' },
              { value: 'custom', label: 'Other (please specify)' }
            ],
            defaultValue: ''
          },
          response271: {
            id: 'gs03-271',
            options: [
              { value: '030240928', label: '030240928' },
              { value: 'custom', label: 'Other (please specify)' }
            ],
            defaultValue: ''
          }
        },
        {
          field: '2100A NM103',
          fieldDescription: 'Payer Name',
          length: 35,
          request270: {
            id: '2100a-nm103-270',
            options: [
              { value: 'custom', label: 'Define value:' }
            ],
            defaultValue: 'custom'
          },
          response271: {
            id: '2100a-nm103-271',
            options: [
              { value: 'custom', label: 'Define value:' }
            ],
            defaultValue: 'custom'
          }
        },
        {
          field: '2100A NM109',
          fieldDescription: 'Payer ID',
          length: 80,
          request270: {
            id: '2100a-nm109-270',
            options: [
              { value: 'custom', label: 'Define value:' }
            ],
            defaultValue: ''
          },
          response271: {
            id: '2100a-nm109-271',
            options: [
              { value: 'custom', label: 'Define value:' }
            ],
            defaultValue: ''
          }
        }
      ],
      questions: []
    },
    {
      id: 'payer-enhancements',
      title: 'Payer Enhancements',
      description: 'Character set and formatting requirements for payer communications',
      order: 5,
      questions: [
        {
          id: 'uppercase-characters-acceptable',
          type: QuestionType.RADIO,
          title: "Availity's standard is to send uppercase characters. Is this acceptable?",
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'system-accept-spaces',
          type: QuestionType.RADIO,
          title: 'A space is part of the X12 basic character set. Does your system accept spaces?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'accept-extended-character-set',
          type: QuestionType.RADIO,
          title: 'Do you accept characters from the X12 extended character set?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        }
      ]
    },
    {
      id: 'payer-specific-processing-errors',
      title: 'Payer Specific Processing Errors/Edits',
      description: 'Note: Availity only sends X12 versions 5010 and higher to the receiver.',
      order: 6,
      questions: [
        {
          id: 'ansi-translator-syntax-error-rejection',
          type: QuestionType.RADIO,
          title: 'If your ANSI translator detects a syntax error within the ANSI X12 transmission file, how will you reject the transaction?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: '999_acknowledgement', label: '999 Acknowledgement' },
            { value: 'other', label: 'Other. Please explain:' }
          ]
        },
        {
          id: 'ansi-translator-syntax-error-other-explanation',
          type: QuestionType.TEXTAREA,
          title: 'Please explain your other method for rejecting transactions with syntax errors:',
          description: '',
          required: false,
          attachmentRequired: false,
          conditionalLogic: {
            dependsOn: 'ansi-translator-syntax-error-rejection',
            showWhen: ['other']
          }
        },
        {
          id: 'support-ta1-response',
          type: QuestionType.RADIO,
          title: 'Do you support the TA1 response?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'ta1-response-driven-by-isa14',
          type: QuestionType.RADIO,
          title: 'Is the TA1 response driven by ISA14 (i.e., if the value in ISA14 = 0, then TA1 is not sent)?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'reject-not-used-segments',
          type: QuestionType.RADIO,
          title: 'Will you reject transactions that contain "not used" segments?',
          description: 'Note: If you need this additional data as a payer, Availity will need to relax an edit.',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        }
      ]
    },
    {
      id: 'search-options',
      title: 'Search Options',
      description: 'Configuration for supported search options and service type codes',
      order: 7,
      questions: [
        {
          id: 'supported-search-options',
          type: QuestionType.CHECKBOX,
          title: 'Availity supports all search options listed in the table below. Please indicate which option(s) you support for the 270 request for all transaction modes:',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'patient_id_dob', label: 'Patient ID & DOB' },
            { value: 'patient_id_first_last_name', label: 'Patient ID, First Name, & Last Name' },
            { value: 'patient_id_first_last_name_dob', label: 'Patient ID, First Name, Last Name, & DOB' },
            { value: 'patient_id_first_name_dob', label: 'Patient ID, First Name, DOB' },
            { value: 'patient_id_last_name_dob', label: 'Patient ID, Last Name, DOB' },
            { value: 'patient_id_first_name', label: 'Patient ID & First Name' }
          ]
        },
        {
          id: 'support-all-service-type-codes',
          type: QuestionType.RADIO,
          title: 'Can you support all service type codes?',
          description: 'Note: Service type code 30 is the standard to show all benefits. Many health plans use service type 30; however, some may want to restrict benefits to certain specialties.',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'service-type-codes-list',
          type: QuestionType.TEXT,
          title: 'If No, please provide a list of codes you can support as a separate attachment.',
          description: '',
          required: false,
          attachmentRequired: true,
          conditionalLogic: {
            dependsOn: 'support-all-service-type-codes',
            showWhen: ['no']
          }
        },
        {
          id: 'specific-patient-id-formatting',
          type: QuestionType.RADIO,
          title: 'Some plans have very specific patient ID formatting per line of business (e.g., three alpha characters + seven numeric digits). Would you like Availity to implement specific editing requirements for the formatting of the patient ID on the 270 request?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'patient-id-editing-requirements',
          type: QuestionType.TEXT,
          title: 'If Yes, please include these editing requirements in a separate attachment.',
          description: '',
          required: false,
          attachmentRequired: true,
          conditionalLogic: {
            dependsOn: 'specific-patient-id-formatting',
            showWhen: ['yes']
          }
        }
      ]
    },
    {
      id: 'response',
      title: 'Response',
      description: 'Response processing and validation requirements',
      order: 8,
      questions: [
        {
          id: 'response-notes',
          type: QuestionType.DISPLAY,
          title: 'Notes:',
          description: '• Availity\'s standard is to return responses to the Availity customer as they are received from the payer.\n• All X12 transactions sent to Availity are subjected to SNIP level 4.',
          required: false,
          attachmentRequired: false
        },
        {
          id: 'return-additional-data',
          type: QuestionType.RADIO,
          title: 'Will you return additional data not reported in the standard 271 response?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'additional-data-examples',
          type: QuestionType.TEXT,
          title: 'If Yes, please provide examples and specifications for this additional data in a separate attachment.',
          description: '',
          required: false,
          attachmentRequired: true,
          conditionalLogic: {
            dependsOn: 'return-additional-data',
            showWhen: ['yes']
          }
        }
      ]
    },
    {
      id: 'payer-id-and-name',
      title: 'Payer ID and payer name',
      description: 'Payer identification and display requirements for Real-time Web implementation',
      order: 9,
      modeLabel: 'Real-time web',
      conditionalLogic: {
        requiredModes: [ImplementationMode.REAL_TIME_WEB]
      },
      questions: [
        {
          id: 'payer-id-organization',
          type: QuestionType.TEXT,
          title: 'Please list the payer ID for your organization. This payer ID will display on Availity Essentials. If you require different payer IDs for different lines of business, please provide these payer IDs in a separate attachment.',
          description: 'Payer ID:',
          required: true,
          attachmentRequired: false
        },
        {
          id: 'publish-payer-id-permission',
          type: QuestionType.RADIO,
          title: 'Availity\'s standard deployment process is to publish your payer ID(s) in the Availity Health Plan Partners document on our website. Do you give permission for this?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'controlled-deployment-select-group',
          type: QuestionType.RADIO,
          title: 'If No, is this a controlled deployment to a select group of providers?',
          description: '',
          required: false,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ],
          conditionalLogic: {
            dependsOn: 'publish-payer-id-permission',
            showWhen: ['no']
          }
        },
        {
          id: 'payer-plan-name-essentials-dropdown',
          type: QuestionType.TEXT,
          title: 'Please indicate the payer and/or plan name to be displayed in the Essentials drop-down for users to select.',
          description: 'Payer name:',
          required: true,
          attachmentRequired: false
        }
      ]
    },
    {
      id: 'implementation-states',
      title: 'Implementation states',
      description: 'State availability configuration for Real-time Web implementation',
      order: 10,
      modeLabel: 'Real-time web',
      conditionalLogic: {
        requiredModes: [ImplementationMode.REAL_TIME_WEB]
      },
      questions: [
        {
          id: 'implementation-nationwide',
          type: QuestionType.RADIO,
          title: 'In Availity Essentials, providers select payers by first selecting their state in a drop-down list. Is your implementation nationwide (i.e., available in every state in the drop-down list)?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'specify-states-available',
          type: QuestionType.TEXTAREA,
          title: 'If No, please specify the states for which your payer ID should be available:',
          description: '',
          required: false,
          attachmentRequired: false,
          conditionalLogic: {
            dependsOn: 'implementation-nationwide',
            showWhen: ['no']
          }
        }
      ]
    },
    {
      id: 'payer-logo',
      title: 'Payer logo',
      description: 'Logo upload requirements for Real-time Web implementation',
      order: 11,
      modeLabel: 'Real-time web',
      conditionalLogic: {
        requiredModes: [ImplementationMode.REAL_TIME_WEB]
      },
      questions: [
        {
          id: 'organization-logo-upload',
          type: QuestionType.FILE_UPLOAD,
          title: 'Please provide your organization\'s logo as a GIF, PNG, or JPG file. This logo displays in Availity Essentials.',
          description: 'Accepted formats: GIF, PNG, JPG',
          required: true,
          attachmentRequired: false,
          fileUploadConfig: {
            acceptedFormats: ['.gif', '.png', '.jpg', '.jpeg'],
            maxFileSize: 5242880, // 5MB in bytes
            multiple: false
          }
        }
      ]
    },
    {
      id: 'connectivity',
      title: 'Connectivity',
      description: 'Real-time web transaction connectivity requirements and specifications',
      order: 12,
      modeLabel: 'Real-time web',
      conditionalLogic: {
        requiredModes: [ImplementationMode.REAL_TIME_WEB]
      },
      questions: [
        {
          id: 'xml-wrapper-required',
          type: QuestionType.RADIO,
          title: 'Availity supports XML envelope structure. Do you require an XML wrapper?',
          description: 'Note: Availity supports an HTTPS connection, and the standard timeout is 30 seconds',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'xml-envelope-requirements',
          type: QuestionType.TEXTAREA,
          title: 'If Yes, please define your XML envelope requirements in a separate attachment.',
          description: '',
          required: false,
          attachmentRequired: true,
          conditionalLogic: {
            dependsOn: 'xml-wrapper-required',
            showWhen: ['yes']
          }
        },
        {
          id: 'differing-connectivity-requirements',
          type: QuestionType.RADIO,
          title: 'Do you have differing connectivity requirements and specifications for each region/state?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'connectivity-requirements-attachment',
          type: QuestionType.TEXTAREA,
          title: 'If Yes, please list the requirements in a separate attachment.',
          description: '',
          required: false,
          attachmentRequired: true,
          conditionalLogic: {
            dependsOn: 'differing-connectivity-requirements',
            showWhen: ['yes']
          }
        },
        {
          id: 'test-url-web',
          type: QuestionType.URL,
          title: 'Test URL(s)',
          description: '',
          required: true,
          attachmentRequired: false,
          validation: {
            pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$'
          }
        },
        {
          id: 'test-user-id-web',
          type: QuestionType.TEXT,
          title: 'Test user ID(s)',
          description: '',
          required: true,
          attachmentRequired: false
        },
        {
          id: 'prod-url-web',
          type: QuestionType.URL,
          title: 'Prod URL(s)',
          description: '',
          required: true,
          attachmentRequired: false,
          validation: {
            pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$'
          },
          helpText: 'Note: Availity must have the Prod URL 4-6 weeks before the go-live date.'
        },
        {
          id: 'prod-user-id-web',
          type: QuestionType.TEXT,
          title: 'Prod user ID(s)',
          description: '',
          required: true,
          attachmentRequired: false
        },
        {
          id: 'system-hours-availability',
          type: QuestionType.TEXT,
          title: 'What are your system\'s hours of availability?',
          description: '',
          required: true,
          attachmentRequired: false
        },
        {
          id: 'continuous-threads-support',
          type: QuestionType.TEXT,
          title: 'How many continuous threads can you support?',
          description: '',
          required: true,
          attachmentRequired: false
        }
      ]
    },
    {
      id: 'testing',
      title: 'Testing',
      description: 'Availity can provide basic test case scenarios; however, we recommend that payers test all possible business scenarios to identify any issues before moving to production. If this is unavailable in your test environment, speak with your Availity technical contact regarding additional testing options. Note: The payer must provide deidentified data for UAT.',
      order: 13,
      modeLabel: 'Real-time web',
      conditionalLogic: {
        requiredModes: [ImplementationMode.REAL_TIME_WEB]
      },
      questions: [
        {
          id: 'production-approval-process',
          type: QuestionType.TEXTAREA,
          title: 'Please describe your production approval process:',
          description: '',
          required: true,
          attachmentRequired: false
        },
        {
          id: 'test-environment-availability',
          type: QuestionType.RADIO,
          title: 'After you receive production approval, will your test environment continue to be available?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'specific-testing-requirements',
          type: QuestionType.RADIO,
          title: 'Does your organization have specific testing requirements?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'testing-requirements-details',
          type: QuestionType.TEXTAREA,
          title: 'If Yes, please specify:',
          description: '',
          required: false,
          attachmentRequired: false,
          conditionalLogic: {
            dependsOn: 'specific-testing-requirements',
            showWhen: ['yes']
          }
        },
        {
          id: 'exclude-e&b-benefit-types',
          type: QuestionType.RADIO,
          title: 'Do you exclude any E&B benefit types from testing?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'exclude-benefit-types-details',
          type: QuestionType.TEXTAREA,
          title: 'If Yes, please specify:',
          description: '',
          required: false,
          attachmentRequired: false,
          conditionalLogic: {
            dependsOn: 'exclude-e&b-benefit-types',
            showWhen: ['yes']
          }
        },
        {
          id: 'test-files-require-valid-provider-data',
          type: QuestionType.RADIO,
          title: 'Do test files require valid provider data?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'test-files-require-valid-membership-records',
          type: QuestionType.RADIO,
          title: 'Do test files require valid membership records?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'designated-payer-id-for-testing',
          type: QuestionType.RADIO,
          title: 'Do you have a designated payer ID you would like for Availity to use in testing?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'designated-payer-id-details',
          type: QuestionType.TEXTAREA,
          title: 'If Yes, please specify (please include a separate attachment if you require different IDs for different lines of business):',
          description: '',
          required: false,
          attachmentRequired: false,
          conditionalLogic: {
            dependsOn: 'designated-payer-id-for-testing',
            showWhen: ['yes']
          }
        },
        {
          id: 'minimum-maximum-test-transactions',
          type: QuestionType.RADIO,
          title: 'Do you have a minimum or maximum number of test transactions you will accept?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'test-transactions-details',
          type: QuestionType.TEXTAREA,
          title: 'If Yes, please specify:',
          description: '',
          required: false,
          attachmentRequired: false,
          conditionalLogic: {
            dependsOn: 'minimum-maximum-test-transactions',
            showWhen: ['yes']
          }
        },
        {
          id: 'other-testing-restrictions',
          type: QuestionType.RADIO,
          title: 'Do you have any other testing or test transaction restrictions?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'other-testing-restrictions-details',
          type: QuestionType.TEXTAREA,
          title: 'If Yes, please specify:',
          description: '',
          required: false,
          attachmentRequired: false,
          conditionalLogic: {
            dependsOn: 'other-testing-restrictions',
            showWhen: ['yes']
          }
        },
        {
          id: 'test-file-preparation-date',
          type: QuestionType.TEXT,
          title: 'When will you be prepared to receive a test file? Please specify a date or date range:',
          description: '',
          required: true,
          attachmentRequired: false
        }
      ]
    },
    {
      id: 'essentials-page-fields',
      title: 'Essentials page fields',
      description: 'Configuration requirements for payer-specific information displayed on Availity Essentials pages',
      order: 14,
      modeLabel: 'Real-time web',
      conditionalLogic: {
        requiredModes: [ImplementationMode.REAL_TIME_WEB]
      },
      questions: [
        // Payer Information
        {
          id: 'payer-name-field',
          type: QuestionType.TEXT,
          title: 'Payer name',
          description: '',
          required: true,
          attachmentRequired: false
        },
        {
          id: 'payer-id-qualifier-support',
          type: QuestionType.RADIO,
          title: 'Payer ID qualifier - Can you support the standard?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'payer-id-qualifier-requirements',
          type: QuestionType.TEXTAREA,
          title: 'If No, define requirements:',
          description: '',
          required: false,
          attachmentRequired: false,
          conditionalLogic: {
            dependsOn: 'payer-id-qualifier-support',
            showWhen: ['no']
          }
        },
        {
          id: 'payer-id-support',
          type: QuestionType.RADIO,
          title: 'Payer ID - Can you support the standard?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'payer-id-requirements',
          type: QuestionType.TEXTAREA,
          title: 'If No, define requirements:',
          description: '',
          required: false,
          attachmentRequired: false,
          conditionalLogic: {
            dependsOn: 'payer-id-support',
            showWhen: ['no']
          }
        },
        // Provider Information
        {
          id: 'provider-express-entry-requirements',
          type: QuestionType.TEXTAREA,
          title: 'Provider Express Entry requirements',
          description: '',
          required: false,
          attachmentRequired: false
        },
        {
          id: 'provider-identifiers-nm108-nm109-requirements',
          type: QuestionType.TEXTAREA,
          title: 'Provider Identifiers NM108 & NM109 requirements',
          description: '',
          required: false,
          attachmentRequired: false
        },
        // Patient Information
        {
          id: 'patient-id-editing-requirements-support',
          type: QuestionType.RADIO,
          title: 'Patient ID - Would you like Availity to implement specific editing requirements for the patient ID on the 270 request?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'patient-id-editing-requirements',
          type: QuestionType.TEXTAREA,
          title: 'If Yes, please include these editing requirements in a separate attachment. Requirements:',
          description: '',
          required: false,
          attachmentRequired: true,
          conditionalLogic: {
            dependsOn: 'patient-id-editing-requirements-support',
            showWhen: ['yes']
          }
        },
        {
          id: 'date-of-birth-requirements',
          type: QuestionType.TEXTAREA,
          title: 'Date of Birth requirements',
          description: '',
          required: false,
          attachmentRequired: false,
          validation: {
            maxLength: 8
          }
        },
        {
          id: 'patient-last-name-requirements',
          type: QuestionType.TEXTAREA,
          title: 'Patient Last Name requirements',
          description: '',
          required: false,
          attachmentRequired: false,
          validation: {
            maxLength: 35
          }
        },
        {
          id: 'patient-first-name-requirements',
          type: QuestionType.TEXTAREA,
          title: 'Patient First Name requirements',
          description: '',
          required: false,
          attachmentRequired: false,
          validation: {
            maxLength: 25
          }
        },
        {
          id: 'patient-relationship-subscriber-requirements',
          type: QuestionType.TEXTAREA,
          title: 'Patient\'s Relationship to Subscriber requirements',
          description: '',
          required: false,
          attachmentRequired: false
        },
        {
          id: 'gender-code-requirements',
          type: QuestionType.TEXTAREA,
          title: 'Gender code requirements',
          description: '',
          required: false,
          attachmentRequired: false
        },
        // Service Information
        {
          id: 'as-of-date-requirements',
          type: QuestionType.TEXTAREA,
          title: 'As of Date requirements',
          description: '',
          required: false,
          attachmentRequired: false
        },
        {
          id: 'benefit-service-type-support',
          type: QuestionType.RADIO,
          title: 'Benefit/Service Type - Can you support all service type codes?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'benefit-service-type-requirements',
          type: QuestionType.TEXTAREA,
          title: 'If No, please provide a list of codes you can support as a separate attachment.',
          description: '',
          required: false,
          attachmentRequired: true,
          conditionalLogic: {
            dependsOn: 'benefit-service-type-support',
            showWhen: ['no']
          }
        }
      ]
    },
    {
      id: 'connectivity-b2b',
      title: 'Connectivity',
      description: 'In the B2B transaction mode, physicians and other healthcare professionals submit patient eligibility inquiry requests to Availity. Availity then routes the valid HIPAA 270 transaction to the assigned receiver. The receiver returns valid HIPAA 271 responses to Availity. Note: Availity supports an HTTPS connection, and the standard timeout is 30 seconds.',
      order: 15,
      modeLabel: 'Real-time B2B',
      conditionalLogic: {
        requiredModes: [ImplementationMode.REAL_TIME_B2B]
      },
      questions: [
        {
          id: 'xml-wrapper-required-b2b',
          type: QuestionType.RADIO,
          title: 'Availity supports XML envelope structure. Do you require an XML wrapper?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'xml-envelope-requirements-b2b',
          type: QuestionType.TEXTAREA,
          title: 'If Yes, please define your XML envelope requirements in a separate attachment.',
          description: '',
          required: false,
          attachmentRequired: true,
          conditionalLogic: {
            dependsOn: 'xml-wrapper-required-b2b',
            showWhen: ['yes']
          }
        },
        {
          id: 'differing-connectivity-requirements-b2b',
          type: QuestionType.RADIO,
          title: 'Do you have differing connectivity requirements and specifications for each region/state?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'connectivity-requirements-attachment-b2b',
          type: QuestionType.TEXTAREA,
          title: 'If Yes, please list the requirements in a separate attachment.',
          description: '',
          required: false,
          attachmentRequired: true,
          conditionalLogic: {
            dependsOn: 'differing-connectivity-requirements-b2b',
            showWhen: ['yes']
          }
        },
        {
          id: 'test-url-b2b',
          type: QuestionType.TEXTAREA,
          title: 'Test URL(s)',
          description: '',
          required: true,
          attachmentRequired: false,
          validation: {
            pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$'
          }
        },
        {
          id: 'test-user-id-b2b',
          type: QuestionType.TEXTAREA,
          title: 'Test user ID(s)',
          description: '',
          required: true,
          attachmentRequired: false
        },
        {
          id: 'prod-url-b2b',
          type: QuestionType.TEXTAREA,
          title: 'Prod URL(s)',
          description: '',
          required: true,
          attachmentRequired: false,
          validation: {
            pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$'
          },
          helpText: 'Note: Availity must have the Prod URL 4-6 weeks before the go-live date.'
        },
        {
          id: 'prod-user-id-b2b',
          type: QuestionType.TEXTAREA,
          title: 'Prod user ID(s)',
          description: '',
          required: true,
          attachmentRequired: false
        },
        {
          id: 'system-hours-availability-b2b',
          type: QuestionType.TEXT,
          title: 'What are your system\'s hours of availability?',
          description: '',
          required: true,
          attachmentRequired: false
        },
        {
          id: 'continuous-threads-support-b2b',
          type: QuestionType.TEXT,
          title: 'How many continuous threads can you support?',
          description: '',
          required: true,
          attachmentRequired: false
        }
      ]
    },
    {
      id: 'testing-b2b',
      title: 'Testing',
      description: 'Availity can provide basic test case scenarios; however, we recommend that payers test all possible business scenarios to identify any issues before moving to production. If this is unavailable in your test environment, speak with your Availity technical contact regarding additional testing options. Note: The payer must provide deidentified data for UAT. Please describe your production approval process:',
      order: 16,
      modeLabel: 'Real-time B2B',
      conditionalLogic: {
        requiredModes: [ImplementationMode.REAL_TIME_B2B]
      },
      questions: [
        {
          id: 'production-approval-process-b2b',
          type: QuestionType.TEXTAREA,
          title: 'Please describe your production approval process:',
          description: '',
          required: true,
          attachmentRequired: false
        },
        {
          id: 'test-environment-availability-b2b',
          type: QuestionType.RADIO,
          title: 'After you receive production approval, will your test environment continue to be available?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'specific-testing-requirements-b2b',
          type: QuestionType.RADIO,
          title: 'Does your organization have specific testing requirements?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'testing-requirements-details-b2b',
          type: QuestionType.TEXTAREA,
          title: 'If Yes, please specify:',
          description: '',
          required: false,
          attachmentRequired: false,
          conditionalLogic: {
            dependsOn: 'specific-testing-requirements-b2b',
            showWhen: ['yes']
          }
        },
        {
          id: 'exclude-eb-benefit-types-b2b',
          type: QuestionType.RADIO,
          title: 'Do you exclude any E&B benefit types from testing?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'eb-benefit-exclusions-details-b2b',
          type: QuestionType.TEXTAREA,
          title: 'If Yes, please specify:',
          description: '',
          required: false,
          attachmentRequired: false,
          conditionalLogic: {
            dependsOn: 'exclude-eb-benefit-types-b2b',
            showWhen: ['yes']
          }
        },
        {
          id: 'test-files-valid-provider-data-b2b',
          type: QuestionType.RADIO,
          title: 'Do test files require valid provider data?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'test-files-valid-membership-b2b',
          type: QuestionType.RADIO,
          title: 'Do test files require valid membership records?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'designated-payer-id-testing-b2b',
          type: QuestionType.RADIO,
          title: 'Do you have a designated payer ID you would like Availity to use in testing?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'payer-id-testing-details-b2b',
          type: QuestionType.TEXTAREA,
          title: 'If Yes, please specify (please include a separate attachment if you require different IDs for different lines of business):',
          description: '',
          required: false,
          attachmentRequired: true,
          conditionalLogic: {
            dependsOn: 'designated-payer-id-testing-b2b',
            showWhen: ['yes']
          }
        },
        {
          id: 'test-transaction-limits-b2b',
          type: QuestionType.RADIO,
          title: 'Do you have a minimum or maximum number of test transactions you will accept?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'test-transaction-limits-details-b2b',
          type: QuestionType.TEXTAREA,
          title: 'If Yes, please specify:',
          description: '',
          required: false,
          attachmentRequired: false,
          conditionalLogic: {
            dependsOn: 'test-transaction-limits-b2b',
            showWhen: ['yes']
          }
        },
        {
          id: 'other-testing-restrictions-b2b',
          type: QuestionType.RADIO,
          title: 'Do you have any other testing or test transaction restrictions?',
          description: '',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'testing-restrictions-details-b2b',
          type: QuestionType.TEXTAREA,
          title: 'If Yes, please specify:',
          description: '',
          required: false,
          attachmentRequired: false,
          conditionalLogic: {
            dependsOn: 'other-testing-restrictions-b2b',
            showWhen: ['yes']
          }
        },
        {
          id: 'test-file-preparation-date-b2b',
          type: QuestionType.DATE,
          title: 'When will you be prepared to receive a test file? Please specify a date or date range:',
          description: '',
          required: true,
          attachmentRequired: false
        }
      ]
    },
    {
      id: 'connectivity-edi-batch',
      title: 'Connectivity',
      description: 'In the EDI batch transaction mode, physicians and other healthcare professionals submit patient eligibility inquiry requests to Availity in batches. Availity then routes the valid HIPAA 270 transactions to the assigned receiver. The receiver returns valid HIPAA 271 responses to Availity.\n\nIf you are a current Availity trading partner, you can use your current EDI connectivity for this transaction. Files can be posted to your existing Availity mailbox.\n\nFor new connectivity, Availity\'s standard method is for the receiver to initiate the file transfer via push/pull method with Availity\'s FTP server. Availity will provide the receiver with the FTP hostname & port and the login credentials designated for the receiver\'s mailbox. Availity will also identify the directories where the receiver will push to and pull from.',
      order: 17,
      modeLabel: 'EDI batch',
      conditionalLogic: {
        requiredModes: [ImplementationMode.EDI_BATCH]
      },
      questions: []
    },
    {
      id: 'file-structure-naming-edi-batch',
      title: 'File Structure & Naming Conventions',
      description: '1. Availity\'s standard file structure and naming conventions are as follows:\n\n2. Files are created with one ISA/IEA (interchange), one GS/GE (functional group), and one ST/SE (transaction set).\n\n3. Availity uses the following naming convention for outbound files:\n   CCCCMMDDHHMMSSSSSS.X279\n\n4. Please define your naming convention for inbound files:',
      order: 18,
      modeLabel: 'EDI batch',
      conditionalLogic: {
        requiredModes: [ImplementationMode.EDI_BATCH]
      },
      questions: [
        {
          id: 'inbound-file-naming-convention-edi-batch',
          type: QuestionType.TEXTAREA,
          title: 'Please define your naming convention for inbound files:',
          description: '',
          required: true,
          attachmentRequired: false
        }
      ]
    },
    {
      id: 'standard-aggregation-schedule-edi-batch',
      title: 'Standard Aggregation Schedule',
      description: 'Schedule: Daily\nFrequency: Every Hour\n\nIf your system is unable to support Availity\'s standard aggregation schedule, please speak with your Availity technical contact regarding additional options.',
      order: 19,
      modeLabel: 'EDI batch',
      conditionalLogic: {
        requiredModes: [ImplementationMode.EDI_BATCH]
      },
      questions: []
    }
  ]
};
