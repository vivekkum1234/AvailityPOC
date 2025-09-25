// Frontend types matching backend types
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

export enum ImplementationMode {
  REAL_TIME_WEB = 'real_time_web',
  REAL_TIME_B2B = 'real_time_b2b',
  EDI_BATCH = 'edi_batch'
}

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

export interface QuestionValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
}

export interface ConditionalLogic {
  dependsOn?: string;
  showWhen?: string[];
  hideWhen?: string[];
  requiredModes?: ImplementationMode[];
}

export interface X12Field {
  segment?: string;
  description?: string;
  length?: string;
}

export interface FileUploadConfig {
  acceptedFormats?: string[];
  maxFileSize?: number;
  multiple?: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: QuestionOption[];
  validation?: QuestionValidation;
  conditionalLogic?: ConditionalLogic;
  x12Field?: X12Field;
  fileUploadConfig?: FileUploadConfig;
  helpText?: string;
  attachmentRequired: boolean;
}

export interface EnvelopingRequirement {
  field: string;
  fieldDescription: string;
  length: number;
  request270: {
    id: string;
    options: { value: string; label: string }[];
    defaultValue: string;
  };
  response271: {
    id: string;
    options: { value: string; label: string }[];
    defaultValue: string;
  };
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  order: number;
  questions: Question[];
  customComponent?: string;
  envelopingRequirements?: EnvelopingRequirement[];
  modeLabel?: string; // For displaying mode badge on section cards
  conditionalLogic?: ConditionalLogic;
}

export interface Questionnaire {
  id: string;
  title: string;
  description: string;
  version: string;
  transactionType: string;
  sections: Section[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isActive: boolean;
}

export interface QuestionResponse {
  questionId: string;
  value: string | string[] | number | boolean;
  attachments?: {
    filename: string;
    url: string;
    uploadedAt: Date;
  }[];
}

export interface SectionResponse {
  sectionId: string;
  responses: QuestionResponse[];
  completedAt?: Date;
  isComplete: boolean;
}

export interface QuestionnaireResponse {
  id: string;
  questionnaireId: string;
  organizationId: string;
  organizationName: string;
  implementationMode?: ImplementationMode;
  sections: SectionResponse[];
  status: 'draft' | 'in_progress' | 'completed' | 'submitted' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  assignedUsers: {
    userId: string;
    email: string;
    role: 'primary' | 'collaborator' | 'viewer';
  }[];
  auditTrail: {
    action: string;
    userId: string;
    timestamp: Date;
    changes?: Record<string, any>;
  }[];
}
