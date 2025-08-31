import { v4 as uuidv4 } from 'uuid';
import { QuestionnaireResponse, SectionResponse } from '../types/questionnaire';
import { createError } from '../middleware/errorHandler';

export class ResponseService {
  // In-memory storage for now (will be replaced with database later)
  private responses: Map<string, QuestionnaireResponse> = new Map();

  async createResponse(responseData: Omit<QuestionnaireResponse, 'id' | 'createdAt' | 'updatedAt'>): Promise<QuestionnaireResponse> {
    const id = uuidv4();
    const now = new Date();
    
    const response: QuestionnaireResponse = {
      ...responseData,
      id,
      createdAt: now,
      updatedAt: now,
      status: 'draft'
    };

    this.responses.set(id, response);
    return response;
  }

  async getResponseById(id: string): Promise<QuestionnaireResponse | null> {
    return this.responses.get(id) || null;
  }

  async updateResponse(
    id: string, 
    updateData: Partial<QuestionnaireResponse>
  ): Promise<QuestionnaireResponse | null> {
    const existingResponse = this.responses.get(id);
    
    if (!existingResponse) {
      return null;
    }

    const updatedResponse: QuestionnaireResponse = {
      ...existingResponse,
      ...updateData,
      id: existingResponse.id, // Ensure ID doesn't change
      createdAt: existingResponse.createdAt, // Ensure createdAt doesn't change
      updatedAt: new Date(),
      auditTrail: [
        ...existingResponse.auditTrail,
        {
          action: 'updated',
          userId: updateData.assignedUsers?.[0]?.userId || 'system',
          timestamp: new Date(),
          changes: updateData
        }
      ]
    };

    this.responses.set(id, updatedResponse);
    return updatedResponse;
  }

  async updateSectionResponse(
    responseId: string,
    sectionId: string,
    sectionData: SectionResponse
  ): Promise<QuestionnaireResponse | null> {
    const existingResponse = this.responses.get(responseId);
    
    if (!existingResponse) {
      return null;
    }

    // Update or add the section response
    const updatedSections = existingResponse.sections.filter(s => s.sectionId !== sectionId);
    updatedSections.push(sectionData);

    // Check if all sections are complete to update overall status
    const allSectionsComplete = updatedSections.every(s => s.isComplete);
    const newStatus = allSectionsComplete ? 'completed' : 'in_progress';

    return this.updateResponse(responseId, {
      sections: updatedSections,
      status: newStatus
    });
  }

  async getResponsesByOrganization(
    organizationId: string,
    status?: string
  ): Promise<QuestionnaireResponse[]> {
    const allResponses = Array.from(this.responses.values());
    
    let filteredResponses = allResponses.filter(
      response => response.organizationId === organizationId
    );

    if (status) {
      filteredResponses = filteredResponses.filter(
        response => response.status === status
      );
    }

    return filteredResponses.sort((a, b) => 
      b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  async submitResponse(id: string): Promise<QuestionnaireResponse | null> {
    const response = this.responses.get(id);
    
    if (!response) {
      return null;
    }

    // Validate that all required sections are complete
    const incompleteRequiredSections = response.sections.filter(
      section => !section.isComplete
    );

    if (incompleteRequiredSections.length > 0) {
      throw createError(
        `Cannot submit: ${incompleteRequiredSections.length} section(s) are incomplete`,
        400
      );
    }

    return this.updateResponse(id, {
      status: 'submitted',
      submittedAt: new Date()
    });
  }

  // Auto-save functionality
  async autoSave(
    responseId: string,
    sectionId: string,
    questionId: string,
    value: any
  ): Promise<QuestionnaireResponse | null> {
    const response = this.responses.get(responseId);
    
    if (!response) {
      return null;
    }

    // Find or create section response
    let sectionResponse = response.sections.find(s => s.sectionId === sectionId);
    
    if (!sectionResponse) {
      sectionResponse = {
        sectionId,
        responses: [],
        isComplete: false
      };
    }

    // Update or add question response
    const existingResponseIndex = sectionResponse.responses.findIndex(
      r => r.questionId === questionId
    );

    const questionResponse = {
      questionId,
      value
    };

    if (existingResponseIndex >= 0) {
      sectionResponse.responses[existingResponseIndex] = questionResponse;
    } else {
      sectionResponse.responses.push(questionResponse);
    }

    return this.updateSectionResponse(responseId, sectionId, sectionResponse);
  }

  // Get response statistics for monitoring
  async getResponseStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byOrganization: Record<string, number>;
  }> {
    const allResponses = Array.from(this.responses.values());
    
    const byStatus = allResponses.reduce((acc, response) => {
      acc[response.status] = (acc[response.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byOrganization = allResponses.reduce((acc, response) => {
      acc[response.organizationName] = (acc[response.organizationName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: allResponses.length,
      byStatus,
      byOrganization
    };
  }
}
