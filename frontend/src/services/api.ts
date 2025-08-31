import { Questionnaire, Section, QuestionnaireResponse } from '../types/questionnaire';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  // Questionnaire endpoints
  async getQuestionnaires(): Promise<Questionnaire[]> {
    return this.request<Questionnaire[]>('/questionnaires');
  }

  async getQuestionnaire(id: string): Promise<Questionnaire> {
    return this.request<Questionnaire>(`/questionnaires/${id}`);
  }

  async getQuestionnaireSections(id: string, mode?: string): Promise<Section[]> {
    const query = mode ? `?mode=${encodeURIComponent(mode)}` : '';
    return this.request<Section[]>(`/questionnaires/${id}/sections${query}`);
  }

  async getQuestionnaireSection(
    questionnaireId: string, 
    sectionId: string, 
    mode?: string
  ): Promise<Section> {
    const query = mode ? `?mode=${encodeURIComponent(mode)}` : '';
    return this.request<Section>(
      `/questionnaires/${questionnaireId}/sections/${sectionId}${query}`
    );
  }

  // Response endpoints
  async createResponse(responseData: Partial<QuestionnaireResponse>): Promise<QuestionnaireResponse> {
    return this.request<QuestionnaireResponse>('/responses', {
      method: 'POST',
      body: JSON.stringify(responseData),
    });
  }

  async getResponse(id: string): Promise<QuestionnaireResponse> {
    return this.request<QuestionnaireResponse>(`/responses/${id}`);
  }

  async updateResponse(
    id: string, 
    updateData: Partial<QuestionnaireResponse>
  ): Promise<QuestionnaireResponse> {
    return this.request<QuestionnaireResponse>(`/responses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async updateSectionResponse(
    responseId: string,
    sectionId: string,
    sectionData: any
  ): Promise<QuestionnaireResponse> {
    return this.request<QuestionnaireResponse>(
      `/responses/${responseId}/sections/${sectionId}`,
      {
        method: 'PUT',
        body: JSON.stringify(sectionData),
      }
    );
  }

  async getOrganizationResponses(
    organizationId: string,
    status?: string
  ): Promise<QuestionnaireResponse[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.request<QuestionnaireResponse[]>(
      `/responses/organization/${organizationId}${query}`
    );
  }

  async submitResponse(id: string): Promise<QuestionnaireResponse> {
    return this.request<QuestionnaireResponse>(`/responses/${id}/submit`, {
      method: 'POST',
    });
  }

  // Auto-save functionality
  async autoSave(
    responseId: string,
    sectionId: string,
    questionId: string,
    value: any
  ): Promise<QuestionnaireResponse> {
    return this.request<QuestionnaireResponse>(`/responses/${responseId}/autosave`, {
      method: 'POST',
      body: JSON.stringify({
        sectionId,
        questionId,
        value,
      }),
    });
  }

  // Submission endpoints
  async submitQuestionnaire(submissionData: {
    organizationInfo: {
      name: string;
      email?: string;
      phone?: string;
      address?: string;
    };
    questionnaireData: Record<string, any>;
    implementationMode: string;
    submittedBy?: string;
    submittedByName?: string;
  }): Promise<{
    submissionId: string;
    organizationId: string;
    status: string;
    submittedAt: string;
    message: string;
  }> {
    return this.request<any>('/submissions/submit', {
      method: 'POST',
      body: JSON.stringify(submissionData),
    });
  }

  async getSubmissions(filters?: {
    organization_id?: string;
    status?: string;
    implementation_mode?: string;
  }): Promise<any[]> {
    const query = filters ?
      '?' + Object.entries(filters)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}=${encodeURIComponent(value!)}`)
        .join('&')
      : '';
    return this.request<any[]>(`/submissions/submissions${query}`);
  }

  async getSubmission(id: string): Promise<any> {
    return this.request<any>(`/submissions/submission/${id}`);
  }

  async saveDraft(draftData: {
    organizationInfo?: {
      name: string;
      email?: string;
      phone?: string;
      address?: string;
    };
    questionnaireData: Record<string, any>;
    implementationMode?: string;
    responseId?: string;
    submittedBy?: string;
    submittedByName?: string;
  }): Promise<{
    responseId: string;
    status: string;
    message: string;
  }> {
    return this.request<any>('/submissions/draft', {
      method: 'POST',
      body: JSON.stringify(draftData),
    });
  }

  async getSubmissionForEdit(responseId: string): Promise<{
    responseId: string;
    organizationInfo: {
      name: string;
      email?: string;
      phone?: string;
      address?: string;
    };
    questionnaireData: Record<string, any>;
    implementationMode: string;
    status: string;
    submittedAt: string;
    submittedBy: string;
    submittedByName: string;
  }> {
    return this.request<any>(`/submissions/submission/${responseId}/edit`);
  }

  async updateQuestionnaire(responseId: string, submissionData: {
    organizationInfo: {
      name: string;
      email?: string;
      phone?: string;
      address?: string;
    };
    questionnaireData: Record<string, any>;
    implementationMode?: string;
    submittedBy?: string;
    submittedByName?: string;
    updatedBy?: string;
    updatedByName?: string;
  }): Promise<{
    submissionId: string;
    status: string;
    message: string;
  }> {
    return this.request<any>(`/submissions/submission/${responseId}`, {
      method: 'PUT',
      body: JSON.stringify(submissionData),
    });
  }



  // User Management endpoints
  async getUsers(): Promise<any[]> {
    return this.request<any[]>('/users');
  }

  async getUser(id: string): Promise<any> {
    return this.request<any>(`/users/${id}`);
  }

  async getRoleDefinitions(): Promise<any[]> {
    return this.request<any[]>('/users/roles');
  }

  async getUsersWithRoles(): Promise<any[]> {
    return this.request<any[]>('/users/with-roles');
  }

  async createUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    organizationId?: string;
    userType: 'payer' | 'availity';
    roleType: string;
  }): Promise<any> {
    return this.request<any>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: Partial<{
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    status: string;
  }>): Promise<any> {
    return this.request<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async assignRole(userId: string, roleData: {
    roleType: string;
    organizationId?: string;
  }): Promise<any> {
    return this.request<any>(`/users/${userId}/roles`, {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  }

  async removeRole(userId: string, roleType: string, organizationId?: string): Promise<any> {
    const query = organizationId ? `?organizationId=${organizationId}` : '';
    return this.request<any>(`/users/${userId}/roles/${roleType}${query}`, {
      method: 'DELETE',
    });
  }

  // Export questionnaire response to client JSON format
  async exportQuestionnaireJson(responseId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/submissions/submission/${responseId}/export-json`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to export JSON' }));
      throw new Error(errorData.error || 'Failed to export JSON');
    }

    // Get the filename from the response headers
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
      : 'questionnaire_export.json';

    // Get the JSON data
    const jsonData = await response.json();

    // Trigger download
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return jsonData;
  }

  // Email questionnaire response as JSON
  async emailQuestionnaireJson(responseId: string, emailData: {
    recipients: string[];
    subject?: string;
    message?: string;
    senderName?: string;
    senderEmail?: string;
  }): Promise<any> {
    return this.request<any>(`/submissions/submission/${responseId}/email-json`, {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }

  // Payer Configuration endpoints
  async getPayers(): Promise<any[]> {
    return this.request<any[]>('/payers');
  }

  async getPayerConfiguration(payerId: string): Promise<any> {
    return this.request<any>(`/payers/${payerId}/configuration`);
  }

  async generateTestRecommendations(payerId: string): Promise<any> {
    return this.request<any>(`/payers/${payerId}/test-recommendations`, {
      method: 'POST',
    });
  }

  async generateTestData(payerId: string, selectedTestCases: string[]): Promise<any> {
    return this.request<any>(`/payers/${payerId}/generate-test-data`, {
      method: 'POST',
      body: JSON.stringify({ selectedTestCases }),
    });
  }

  // Mock Payer endpoints for test execution
  async executeTests(testCases: any[], payerEndpoint?: string): Promise<any> {
    const url = `${API_BASE_URL}/mock-payer/execute-tests`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        testCases,
        payerEndpoint: payerEndpoint || 'Mock Payer (Internal)'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Return the full response object (including success and data properties)
    return await response.json();
  }

  async getMockPayerStatus(): Promise<any> {
    return this.request<any>('/mock-payer/status');
  }
}

export const apiService = new ApiService();
