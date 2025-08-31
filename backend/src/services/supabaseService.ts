import dotenv from 'dotenv';
dotenv.config();

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://dmlivulltnjfrpocvysg.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'your-service-role-key-here';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

// Types for our database tables
export interface Organization {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface QuestionnaireResponse {
  id?: string;
  organization_id?: string | undefined;
  questionnaire_id: string;
  implementation_mode?: 'real_time_web' | 'real_time_b2b' | 'edi_batch';
  status: 'draft' | 'in_progress' | 'completed' | 'submitted' | 'archived';
  responses: Record<string, any>;
  section_completion?: Record<string, boolean>;
  created_at?: string;
  updated_at?: string;
  submitted_at?: string | null;
  submitted_by?: string | null;
  submitted_by_name?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface Attachment {
  id?: string;
  response_id: string;
  question_id: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  created_at?: string;
}

export interface AuditTrail {
  id?: string;
  response_id: string;
  action: string;
  section_id?: string;
  question_id?: string;
  old_value?: any;
  new_value?: any;
  user_identifier?: string;
  created_at?: string;
}

export interface User {
  id?: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  organization_id?: string;
  user_type: 'payer' | 'availity';
  status?: string;
  last_login_at?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface UserRole {
  id?: string;
  user_id: string;
  role_type: string;
  organization_id?: string;
  granted_by?: string;
  granted_at?: string;
  expires_at?: string;
  is_active?: boolean;
}

export interface RoleDefinition {
  id?: string;
  role_type: string;
  display_name: string;
  description?: string;
  user_type: 'payer' | 'availity';
  permissions: any[];
  is_active?: boolean;
  created_at?: string;
}

export class SupabaseService {
  
  // Organization methods
  async createOrganization(org: Organization): Promise<Organization> {
    const { data, error } = await supabase
      .from('organizations')
      .insert(org)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create organization: ${error.message}`);
    return data;
  }

  async getOrganization(id: string): Promise<Organization | null> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get organization: ${error.message}`);
    }
    return data;
  }

  async createOrUpdateOrganization(org: Organization): Promise<Organization> {
    // Try to find existing organization by name
    const { data: existing } = await supabase
      .from('organizations')
      .select('*')
      .eq('name', org.name)
      .single();

    if (existing) {
      // Update existing organization
      const { data, error } = await supabase
        .from('organizations')
        .update({
          email: org.email,
          phone: org.phone,
          address: org.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update organization: ${error.message}`);
      return data;
    } else {
      // Create new organization
      return this.createOrganization(org);
    }
  }

  // Questionnaire Response methods
  async createQuestionnaireResponse(response: QuestionnaireResponse): Promise<QuestionnaireResponse> {
    const { data, error } = await supabase
      .from('questionnaire_responses')
      .insert(response)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create questionnaire response: ${error.message}`);
    return data;
  }

  async updateQuestionnaireResponse(id: string, updates: Partial<QuestionnaireResponse>): Promise<QuestionnaireResponse> {
    const { data, error } = await supabase
      .from('questionnaire_responses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update questionnaire response: ${error.message}`);
    return data;
  }

  async getQuestionnaireResponse(id: string): Promise<QuestionnaireResponse | null> {
    const { data, error } = await supabase
      .from('questionnaire_responses')
      .select(`
        *,
        organizations (
          id,
          name,
          email
        )
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get questionnaire response: ${error.message}`);
    }
    return data;
  }

  async getQuestionnaireResponses(filters?: {
    organization_id?: string;
    status?: string;
    implementation_mode?: string;
  }): Promise<QuestionnaireResponse[]> {
    let query = supabase
      .from('questionnaire_responses')
      .select(`
        *,
        organizations (
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (filters?.organization_id) {
      query = query.eq('organization_id', filters.organization_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.implementation_mode) {
      query = query.eq('implementation_mode', filters.implementation_mode);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to get questionnaire responses: ${error.message}`);
    return data || [];
  }

  // Submit completed questionnaire
  async submitQuestionnaire(
    responseId: string, 
    submittedBy?: string
  ): Promise<QuestionnaireResponse> {
    const updates: Partial<QuestionnaireResponse> = {
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      submitted_by: submittedBy || null
    };

    return this.updateQuestionnaireResponse(responseId, updates);
  }

  // Audit trail methods
  async createAuditEntry(entry: AuditTrail): Promise<AuditTrail> {
    const { data, error } = await supabase
      .from('audit_trail')
      .insert(entry)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create audit entry: ${error.message}`);
    return data;
  }

  // Attachment methods
  async createAttachment(attachment: Attachment): Promise<Attachment> {
    const { data, error } = await supabase
      .from('attachments')
      .insert(attachment)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create attachment: ${error.message}`);
    return data;
  }

  async getAttachments(responseId: string): Promise<Attachment[]> {
    const { data, error } = await supabase
      .from('attachments')
      .select('*')
      .eq('response_id', responseId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get attachments: ${error.message}`);
    return data || [];
  }

  // User management methods
  async createUser(user: User): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();

    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return data;
  }

  async getUser(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get user: ${error.message}`);
    }
    return data;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get user by email: ${error.message}`);
    }
    return data;
  }

  async getUsers(filters?: { user_type?: string; status?: string; organization_id?: string }): Promise<User[]> {
    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.user_type) {
      query = query.eq('user_type', filters.user_type);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.organization_id) {
      query = query.eq('organization_id', filters.organization_id);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to get users: ${error.message}`);
    return data || [];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update user: ${error.message}`);
    return data;
  }

  // Role management methods
  async getRoleDefinitions(): Promise<RoleDefinition[]> {
    const { data, error } = await supabase
      .from('role_definitions')
      .select('*')
      .eq('is_active', true)
      .order('user_type', { ascending: true })
      .order('role_type', { ascending: true });

    if (error) throw new Error(`Failed to get role definitions: ${error.message}`);
    return data || [];
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw new Error(`Failed to get user roles: ${error.message}`);
    return data || [];
  }

  async assignRole(userRole: UserRole): Promise<UserRole> {
    const { data, error } = await supabase
      .from('user_roles')
      .insert(userRole)
      .select()
      .single();

    if (error) throw new Error(`Failed to assign role: ${error.message}`);
    return data;
  }

  async removeRole(userId: string, roleType: string, organizationId?: string): Promise<void> {
    let query = supabase
      .from('user_roles')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('role_type', roleType);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { error } = await query;

    if (error) throw new Error(`Failed to remove role: ${error.message}`);
  }

  async getUsersWithRoles(): Promise<any[]> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_roles!user_roles_user_id_fkey (
          role_type,
          organization_id,
          is_active,
          granted_at
        ),
        organizations!users_organization_id_fkey (
          name
        )
      `)
      .eq('user_roles.is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get users with roles: ${error.message}`);
    return data || [];
  }
}

export const supabaseService = new SupabaseService();
