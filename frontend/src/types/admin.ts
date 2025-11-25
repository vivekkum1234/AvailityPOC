// Admin types for master configuration

export interface QuestionnaireTemplate {
  id: string;
  transaction_type: string;
  version: string;
  status: 'draft' | 'published' | 'archived';
  config: any; // Full questionnaire JSON
  published_at?: string;
  published_by?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface QuestionnaireVersion {
  id: string;
  template_id: string;
  version: string;
  config: any;
  changes_summary?: string;
  created_by?: string;
  created_at: string;
  created_by_name?: string; // Populated from join with users table
}

