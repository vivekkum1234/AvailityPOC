"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseService = exports.SupabaseService = exports.supabase = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL || 'https://dmlivulltnjfrpocvysg.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'your-service-role-key-here';
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
class SupabaseService {
    async createOrganization(org) {
        const { data, error } = await exports.supabase
            .from('organizations')
            .insert(org)
            .select()
            .single();
        if (error)
            throw new Error(`Failed to create organization: ${error.message}`);
        return data;
    }
    async getOrganization(id) {
        const { data, error } = await exports.supabase
            .from('organizations')
            .select('*')
            .eq('id', id)
            .single();
        if (error && error.code !== 'PGRST116') {
            throw new Error(`Failed to get organization: ${error.message}`);
        }
        return data;
    }
    async createOrUpdateOrganization(org) {
        const { data: existing } = await exports.supabase
            .from('organizations')
            .select('*')
            .eq('name', org.name)
            .single();
        if (existing) {
            const { data, error } = await exports.supabase
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
            if (error)
                throw new Error(`Failed to update organization: ${error.message}`);
            return data;
        }
        else {
            return this.createOrganization(org);
        }
    }
    async createQuestionnaireResponse(response) {
        const { data, error } = await exports.supabase
            .from('questionnaire_responses')
            .insert(response)
            .select()
            .single();
        if (error)
            throw new Error(`Failed to create questionnaire response: ${error.message}`);
        return data;
    }
    async updateQuestionnaireResponse(id, updates) {
        const { data, error } = await exports.supabase
            .from('questionnaire_responses')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new Error(`Failed to update questionnaire response: ${error.message}`);
        return data;
    }
    async getQuestionnaireResponse(id) {
        const { data, error } = await exports.supabase
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
    async getQuestionnaireResponses(filters) {
        let query = exports.supabase
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
        if (error)
            throw new Error(`Failed to get questionnaire responses: ${error.message}`);
        return data || [];
    }
    async submitQuestionnaire(responseId, submittedBy) {
        const updates = {
            status: 'submitted',
            submitted_at: new Date().toISOString(),
            submitted_by: submittedBy || null
        };
        return this.updateQuestionnaireResponse(responseId, updates);
    }
    async createAuditEntry(entry) {
        const { data, error } = await exports.supabase
            .from('audit_trail')
            .insert(entry)
            .select()
            .single();
        if (error)
            throw new Error(`Failed to create audit entry: ${error.message}`);
        return data;
    }
    async createAttachment(attachment) {
        const { data, error } = await exports.supabase
            .from('attachments')
            .insert(attachment)
            .select()
            .single();
        if (error)
            throw new Error(`Failed to create attachment: ${error.message}`);
        return data;
    }
    async getAttachments(responseId) {
        const { data, error } = await exports.supabase
            .from('attachments')
            .select('*')
            .eq('response_id', responseId)
            .order('created_at', { ascending: false });
        if (error)
            throw new Error(`Failed to get attachments: ${error.message}`);
        return data || [];
    }
    async createUser(user) {
        const { data, error } = await exports.supabase
            .from('users')
            .insert(user)
            .select()
            .single();
        if (error)
            throw new Error(`Failed to create user: ${error.message}`);
        return data;
    }
    async getUser(id) {
        const { data, error } = await exports.supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();
        if (error && error.code !== 'PGRST116') {
            throw new Error(`Failed to get user: ${error.message}`);
        }
        return data;
    }
    async getUserByEmail(email) {
        const { data, error } = await exports.supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        if (error && error.code !== 'PGRST116') {
            throw new Error(`Failed to get user by email: ${error.message}`);
        }
        return data;
    }
    async getUsers(filters) {
        let query = exports.supabase
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
        if (error)
            throw new Error(`Failed to get users: ${error.message}`);
        return data || [];
    }
    async updateUser(id, updates) {
        const { data, error } = await exports.supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new Error(`Failed to update user: ${error.message}`);
        return data;
    }
    async getRoleDefinitions() {
        const { data, error } = await exports.supabase
            .from('role_definitions')
            .select('*')
            .eq('is_active', true)
            .order('user_type', { ascending: true })
            .order('role_type', { ascending: true });
        if (error)
            throw new Error(`Failed to get role definitions: ${error.message}`);
        return data || [];
    }
    async getUserRoles(userId) {
        const { data, error } = await exports.supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true);
        if (error)
            throw new Error(`Failed to get user roles: ${error.message}`);
        return data || [];
    }
    async assignRole(userRole) {
        const { data, error } = await exports.supabase
            .from('user_roles')
            .insert(userRole)
            .select()
            .single();
        if (error)
            throw new Error(`Failed to assign role: ${error.message}`);
        return data;
    }
    async removeRole(userId, roleType, organizationId) {
        let query = exports.supabase
            .from('user_roles')
            .update({ is_active: false })
            .eq('user_id', userId)
            .eq('role_type', roleType);
        if (organizationId) {
            query = query.eq('organization_id', organizationId);
        }
        const { error } = await query;
        if (error)
            throw new Error(`Failed to remove role: ${error.message}`);
    }
    async getUsersWithRoles() {
        const { data, error } = await exports.supabase
            .from('users')
            .select(`
        *,
        user_roles!inner (
          role_type,
          organization_id,
          is_active,
          granted_at
        ),
        organizations (
          name
        )
      `)
            .eq('user_roles.is_active', true)
            .order('created_at', { ascending: false });
        if (error)
            throw new Error(`Failed to get users with roles: ${error.message}`);
        return data || [];
    }
}
exports.SupabaseService = SupabaseService;
exports.supabaseService = new SupabaseService();
//# sourceMappingURL=supabaseService.js.map