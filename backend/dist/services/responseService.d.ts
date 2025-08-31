import { QuestionnaireResponse, SectionResponse } from '../types/questionnaire';
export declare class ResponseService {
    private responses;
    createResponse(responseData: Omit<QuestionnaireResponse, 'id' | 'createdAt' | 'updatedAt'>): Promise<QuestionnaireResponse>;
    getResponseById(id: string): Promise<QuestionnaireResponse | null>;
    updateResponse(id: string, updateData: Partial<QuestionnaireResponse>): Promise<QuestionnaireResponse | null>;
    updateSectionResponse(responseId: string, sectionId: string, sectionData: SectionResponse): Promise<QuestionnaireResponse | null>;
    getResponsesByOrganization(organizationId: string, status?: string): Promise<QuestionnaireResponse[]>;
    submitResponse(id: string): Promise<QuestionnaireResponse | null>;
    autoSave(responseId: string, sectionId: string, questionId: string, value: any): Promise<QuestionnaireResponse | null>;
    getResponseStats(): Promise<{
        total: number;
        byStatus: Record<string, number>;
        byOrganization: Record<string, number>;
    }>;
}
//# sourceMappingURL=responseService.d.ts.map