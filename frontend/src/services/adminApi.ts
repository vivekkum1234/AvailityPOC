import { QuestionnaireTemplate, QuestionnaireVersion } from '../types/admin';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

class AdminApiService {
  private getUserId(): string {
    // Get user from localStorage
    const savedUser = localStorage.getItem('apoc_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        return user.id || '';
      } catch (error) {
        console.error('Error parsing user:', error);
      }
    }
    return '';
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const userId = this.getUserId();

    console.log('[AdminAPI] Request:', { url, userId, endpoint });

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
          ...options?.headers,
        },
        ...options,
      });

      console.log('[AdminAPI] Response:', { status: response.status, ok: response.ok });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[AdminAPI] Error response:', errorData);
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[AdminAPI] Success:', { dataKeys: Object.keys(data), hasData: !!data.data });
      return data.data || data;
    } catch (error: any) {
      console.error('[AdminAPI] Request failed:', { endpoint, error: error.message, stack: error.stack });
      throw error;
    }
  }

  // Get all templates
  async getTemplates(transactionType?: string): Promise<QuestionnaireTemplate[]> {
    const query = transactionType ? `?transaction_type=${encodeURIComponent(transactionType)}` : '';
    return this.request<QuestionnaireTemplate[]>(`/admin/questionnaire-templates${query}`);
  }

  // Get specific template
  async getTemplate(id: string): Promise<QuestionnaireTemplate> {
    return this.request<QuestionnaireTemplate>(`/admin/questionnaire-templates/${id}`);
  }

  // Create new template (draft)
  async createTemplate(data: {
    transaction_type: string;
    version: string;
    config: any;
  }): Promise<QuestionnaireTemplate> {
    return this.request<QuestionnaireTemplate>('/admin/questionnaire-templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update template (draft only)
  async updateTemplate(id: string, data: {
    config?: any;
    version?: string;
  }): Promise<QuestionnaireTemplate> {
    return this.request<QuestionnaireTemplate>(`/admin/questionnaire-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Publish template
  async publishTemplate(id: string, changesSummary?: string): Promise<QuestionnaireTemplate> {
    return this.request<QuestionnaireTemplate>(`/admin/questionnaire-templates/${id}/publish`, {
      method: 'POST',
      body: JSON.stringify({ changes_summary: changesSummary }),
    });
  }

  // Create new version (archives current, creates draft with new version)
  async createNewVersion(id: string): Promise<QuestionnaireTemplate> {
    return this.request<QuestionnaireTemplate>(`/admin/questionnaire-templates/${id}/new-version`, {
      method: 'POST',
    });
  }

  // Get version history
  async getVersionHistory(templateId: string): Promise<QuestionnaireVersion[]> {
    return this.request<QuestionnaireVersion[]>(`/admin/questionnaire-templates/${templateId}/versions`);
  }

  // Product Mappings

  // Get all available products (published transaction types)
  async getProducts(): Promise<Array<{ type: string; name: string; status: string }>> {
    return this.request<Array<{ type: string; name: string; status: string }>>('/admin/product-mappings');
  }

  // Get payers with assignment status for a product
  async getProductMappings(productType: string): Promise<{
    productType: string;
    payers: Array<{ id: string; name: string; organizationId: string; isAssigned: boolean }>;
    stats: { total: number; assigned: number };
  }> {
    return this.request(`/admin/product-mappings/${encodeURIComponent(productType)}`);
  }

  // Update product assignments
  async updateProductMappings(productType: string, organizationIds: string[]): Promise<{
    success: boolean;
    productType: string;
    assignedCount: number;
  }> {
    return this.request(`/admin/product-mappings/${encodeURIComponent(productType)}`, {
      method: 'POST',
      body: JSON.stringify({ organizationIds }),
    });
  }
}

export const adminApiService = new AdminApiService();

