import { SupabaseClient } from '@supabase/supabase-js';
export declare const supabase: SupabaseClient;
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
    updated_by_name?: string | null;
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
export declare class SupabaseService {
    createOrganization(org: Organization): Promise<Organization>;
    getOrganization(id: string): Promise<Organization | null>;
    createOrUpdateOrganization(org: Organization): Promise<Organization>;
    createQuestionnaireResponse(response: QuestionnaireResponse): Promise<QuestionnaireResponse>;
    updateQuestionnaireResponse(id: string, updates: Partial<QuestionnaireResponse>): Promise<QuestionnaireResponse>;
    getQuestionnaireResponse(id: string): Promise<QuestionnaireResponse | null>;
    getQuestionnaireResponses(filters?: {
        organization_id?: string;
        status?: string;
        implementation_mode?: string;
    }): Promise<QuestionnaireResponse[]>;
    submitQuestionnaire(responseId: string, submittedBy?: string): Promise<QuestionnaireResponse>;
    createAuditEntry(entry: AuditTrail): Promise<AuditTrail>;
    createAttachment(attachment: Attachment): Promise<Attachment>;
    getAttachments(responseId: string): Promise<Attachment[]>;
    createUser(user: User): Promise<User>;
    getUser(id: string): Promise<User | null>;
    getUserByEmail(email: string): Promise<User | null>;
    getUsers(filters?: {
        user_type?: string;
        status?: string;
        organization_id?: string;
    }): Promise<User[]>;
    updateUser(id: string, updates: Partial<User>): Promise<User>;
    getRoleDefinitions(): Promise<RoleDefinition[]>;
    getUserRoles(userId: string): Promise<UserRole[]>;
    assignRole(userRole: UserRole): Promise<UserRole>;
    removeRole(userId: string, roleType: string, organizationId?: string): Promise<void>;
    getUsersWithRoles(): Promise<any[]>;
}
export declare const supabaseService: SupabaseService;
//# sourceMappingURL=supabaseService.d.ts.map