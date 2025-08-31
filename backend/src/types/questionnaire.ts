import { z } from 'zod';

// Question Types
export enum QuestionType {
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  TEXT = 'text',
  EMAIL = 'email',
  URL = 'url',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  DATE = 'date',
  NUMBER = 'number',
  DISPLAY = 'display',
  FILE_UPLOAD = 'file_upload'
}

// Implementation Modes
export enum ImplementationMode {
  REAL_TIME_WEB = 'real_time_web',
  REAL_TIME_B2B = 'real_time_b2b',
  EDI_BATCH = 'edi_batch'
}

// Base Question Schema
export const QuestionSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(QuestionType),
  title: z.string(),
  description: z.string().optional(),
  required: z.boolean().default(false),
  options: z.array(z.object({
    value: z.string(),
    label: z.string(),
    description: z.string().optional()
  })).optional(),
  validation: z.object({
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    pattern: z.string().optional(),
    min: z.number().optional(),
    max: z.number().optional()
  }).optional(),
  conditionalLogic: z.object({
    dependsOn: z.string().optional(), // Question ID this depends on
    showWhen: z.array(z.string()).optional(), // Values that trigger showing this question
    hideWhen: z.array(z.string()).optional() // Values that trigger hiding this question
  }).optional(),
  x12Field: z.object({
    segment: z.string().optional(), // e.g., "ISA05", "GS02"
    description: z.string().optional(),
    length: z.string().optional() // e.g., "2", "2/15"
  }).optional(),
  fileUploadConfig: z.object({
    acceptedFormats: z.array(z.string()).optional(), // e.g., ['.pdf', '.jpg', '.png']
    maxFileSize: z.number().optional(), // in bytes
    multiple: z.boolean().default(false)
  }).optional(),
  helpText: z.string().optional(),
  attachmentRequired: z.boolean().default(false)
});

// Enveloping Requirement Schema
export const EnvelopingRequirementSchema = z.object({
  field: z.string(),
  fieldDescription: z.string(),
  length: z.number(),
  request270: z.object({
    id: z.string(),
    options: z.array(z.object({
      value: z.string(),
      label: z.string()
    })),
    defaultValue: z.string()
  }),
  response271: z.object({
    id: z.string(),
    options: z.array(z.object({
      value: z.string(),
      label: z.string()
    })),
    defaultValue: z.string()
  })
});

// Section Schema
export const SectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  order: z.number(),
  questions: z.array(QuestionSchema),
  customComponent: z.string().optional(),
  envelopingRequirements: z.array(EnvelopingRequirementSchema).optional(),
  modeLabel: z.string().optional(), // For displaying mode badge on section cards
  conditionalLogic: z.object({
    dependsOn: z.string().optional(),
    showWhen: z.array(z.string()).optional(),
    hideWhen: z.array(z.string()).optional(),
    requiredModes: z.array(z.nativeEnum(ImplementationMode)).optional()
  }).optional()
});

// Questionnaire Schema
export const QuestionnaireSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  version: z.string(),
  transactionType: z.string(), // e.g., "270/271"
  sections: z.array(SectionSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
  isActive: z.boolean().default(true)
});

// Response Schemas
export const QuestionResponseSchema = z.object({
  questionId: z.string(),
  value: z.union([z.string(), z.array(z.string()), z.number(), z.boolean()]),
  attachments: z.array(z.object({
    filename: z.string(),
    url: z.string(),
    uploadedAt: z.date()
  })).optional()
});

export const SectionResponseSchema = z.object({
  sectionId: z.string(),
  responses: z.array(QuestionResponseSchema),
  completedAt: z.date().optional(),
  isComplete: z.boolean().default(false)
});

export const QuestionnaireResponseSchema = z.object({
  id: z.string(),
  questionnaireId: z.string(),
  organizationId: z.string(),
  organizationName: z.string(),
  implementationMode: z.nativeEnum(ImplementationMode).optional(),
  sections: z.array(SectionResponseSchema),
  status: z.enum(['draft', 'in_progress', 'completed', 'submitted', 'archived']),
  createdAt: z.date(),
  updatedAt: z.date(),
  submittedAt: z.date().optional(),
  assignedUsers: z.array(z.object({
    userId: z.string(),
    email: z.string(),
    role: z.enum(['primary', 'collaborator', 'viewer'])
  })),
  auditTrail: z.array(z.object({
    action: z.string(),
    userId: z.string(),
    timestamp: z.date(),
    changes: z.record(z.any()).optional()
  }))
});

// Type exports
export type Question = z.infer<typeof QuestionSchema>;
export type EnvelopingRequirement = z.infer<typeof EnvelopingRequirementSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type Questionnaire = z.infer<typeof QuestionnaireSchema>;
export type QuestionResponse = z.infer<typeof QuestionResponseSchema>;
export type SectionResponse = z.infer<typeof SectionResponseSchema>;
export type QuestionnaireResponse = z.infer<typeof QuestionnaireResponseSchema>;
