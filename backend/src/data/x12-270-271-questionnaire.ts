import { Questionnaire, QuestionType, ImplementationMode } from '../types/questionnaire';

export const x12270271Questionnaire: Questionnaire = {
  id: 'x12-270-271-v1',
  title: 'X12 270/271 Implementation Questionnaire',
  description: 'Digital questionnaire for X12 270/271 HIPAA transaction implementation',
  version: '1.0.0',
  transactionType: '270/271',
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'system',
  isActive: true,
  sections: [
    {
      id: 'enveloping-requirements',
      title: 'Enveloping Requirements',
      description: 'ISA and GS segment configuration requirements',
      order: 1,
      questions: [
        {
          id: 'isa05-sender-id-qualifier',
          type: QuestionType.RADIO,
          title: 'ISA05 - Sender ID Qualifier',
          description: 'Select the Sender ID Qualifier value',
          required: true,
          attachmentRequired: false,
          options: [
            { value: '030240928_availity', label: '030240928 (Availity defines)' },
            { value: 'custom', label: 'Define custom value' }
          ],
          x12Field: {
            segment: 'ISA05',
            description: 'Sender ID Qualifier',
            length: '2'
          }
        },
        {
          id: 'isa05-custom-value',
          type: QuestionType.TEXT,
          title: 'Custom ISA05 Value',
          description: 'Enter your custom Sender ID Qualifier value',
          required: true,
          attachmentRequired: false,
          validation: {
            maxLength: 2,
            pattern: '^(01|ZZ)$'
          },
          conditionalLogic: {
            dependsOn: 'isa05-sender-id-qualifier',
            showWhen: ['custom']
          }
        },
        {
          id: 'isa06-sender-id',
          type: QuestionType.RADIO,
          title: 'ISA06 - Sender ID',
          description: 'Select the Sender ID configuration',
          required: true,
          attachmentRequired: false,
          options: [
            { value: '030240928_availity', label: '030240928 (Availity defines)' },
            { value: 'custom', label: 'Define custom value' }
          ],
          x12Field: {
            segment: 'ISA06',
            description: 'Sender ID',
            length: '15'
          }
        },
        {
          id: 'isa06-custom-value',
          type: QuestionType.TEXT,
          title: 'Custom ISA06 Value',
          description: 'Enter your custom Sender ID value',
          required: true,
          attachmentRequired: false,
          validation: {
            maxLength: 15
          },
          conditionalLogic: {
            dependsOn: 'isa06-sender-id',
            showWhen: ['custom']
          }
        },
        {
          id: 'isa07-receiver-id-qualifier',
          type: QuestionType.RADIO,
          title: 'ISA07 - Receiver ID Qualifier',
          description: 'Select the Receiver ID Qualifier value',
          required: true,
          attachmentRequired: false,
          options: [
            { value: '01', label: '01' },
            { value: 'custom', label: 'Define custom value' }
          ],
          x12Field: {
            segment: 'ISA07',
            description: 'Receiver ID Qualifier',
            length: '2'
          }
        },
        {
          id: 'isa08-receiver-id',
          type: QuestionType.RADIO,
          title: 'ISA08 - Receiver ID',
          description: 'Select the Receiver ID configuration',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'availity_defined', label: 'Availity defined' },
            { value: '030240928', label: 'Define value: 030240928' }
          ],
          x12Field: {
            segment: 'ISA08',
            description: 'Receiver ID',
            length: '15'
          }
        },
        {
          id: 'isa11-repetition-separator',
          type: QuestionType.RADIO,
          title: 'ISA11 - Repetition Separator',
          description: 'Select the repetition separator configuration',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'caret', label: 'Repetition separator (^)' },
            { value: 'availity_standard', label: 'Availity standard' }
          ],
          x12Field: {
            segment: 'ISA11',
            description: 'Repetition Separator',
            length: '1'
          }
        },
        {
          id: 'isa16-composite-separator',
          type: QuestionType.RADIO,
          title: 'ISA16 - Composite Element Separator',
          description: 'Select the composite element separator configuration',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'colon', label: 'Composite separator (:)' },
            { value: 'availity_standard', label: 'Availity standard' }
          ],
          x12Field: {
            segment: 'ISA16',
            description: 'Composite Element Separator',
            length: '1'
          }
        },
        {
          id: 'gs02-application-sender',
          type: QuestionType.RADIO,
          title: 'GS02 - Application Sender Code',
          description: 'Select the Application Sender Code configuration',
          required: true,
          attachmentRequired: false,
          options: [
            { value: '030240928', label: '030240928' },
            { value: 'availity_defines', label: 'Availity defines' },
            { value: 'custom', label: 'Define custom value' }
          ],
          x12Field: {
            segment: 'GS02',
            description: 'Application Sender Code',
            length: '2/15'
          }
        },
        {
          id: 'gs02-custom-value',
          type: QuestionType.TEXT,
          title: 'Custom GS02 Value',
          description: 'Enter your custom Application Sender Code',
          required: true,
          attachmentRequired: false,
          validation: {
            minLength: 2,
            maxLength: 15
          },
          conditionalLogic: {
            dependsOn: 'gs02-application-sender',
            showWhen: ['custom']
          }
        },
        {
          id: 'gs03-application-receiver',
          type: QuestionType.RADIO,
          title: 'GS03 - Application Receiver Code',
          description: 'Select the Application Receiver Code configuration',
          required: true,
          attachmentRequired: false,
          options: [
            { value: '030240928', label: '030240928' },
            { value: 'custom', label: 'Define custom value' }
          ],
          x12Field: {
            segment: 'GS03',
            description: 'Application Receiver Code',
            length: '2/15'
          }
        },
        {
          id: 'payer-name',
          type: QuestionType.TEXT,
          title: '2100A NM103 - Payer Name',
          description: 'Enter the Payer Name',
          required: true,
          attachmentRequired: false,
          validation: {
            minLength: 1,
            maxLength: 35
          },
          x12Field: {
            segment: '2100A NM103',
            description: 'Payer Name',
            length: '1/35'
          }
        },
        {
          id: 'payer-id',
          type: QuestionType.TEXT,
          title: '2100A NM109 - Payer ID',
          description: 'Enter the Payer ID',
          required: true,
          attachmentRequired: false,
          validation: {
            minLength: 2,
            maxLength: 80
          },
          x12Field: {
            segment: '2100A NM109',
            description: 'Payer ID',
            length: '2/80'
          }
        }
      ]
    },
    {
      id: 'payer-enhancements',
      title: 'Payer Enhancements',
      description: 'Character set and formatting preferences',
      order: 2,
      questions: [
        {
          id: 'uppercase-characters',
          type: QuestionType.RADIO,
          title: 'Uppercase Characters',
          description: "Availity's standard is to send uppercase characters. Is this acceptable?",
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'x12-basic-character-spaces',
          type: QuestionType.RADIO,
          title: 'X12 Basic Character Set Spaces',
          description: 'A space is part of the X12 basic character set. Does your system accept spaces?',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'x12-extended-character-set',
          type: QuestionType.RADIO,
          title: 'X12 Extended Character Set',
          description: 'Do you accept characters from the X12 extended character set?',
          required: true,
          attachmentRequired: false,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        }
      ]
    }
  ]
};
