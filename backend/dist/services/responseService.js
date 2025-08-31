"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseService = void 0;
const uuid_1 = require("uuid");
const errorHandler_1 = require("../middleware/errorHandler");
class ResponseService {
    responses = new Map();
    async createResponse(responseData) {
        const id = (0, uuid_1.v4)();
        const now = new Date();
        const response = {
            ...responseData,
            id,
            createdAt: now,
            updatedAt: now,
            status: 'draft'
        };
        this.responses.set(id, response);
        return response;
    }
    async getResponseById(id) {
        return this.responses.get(id) || null;
    }
    async updateResponse(id, updateData) {
        const existingResponse = this.responses.get(id);
        if (!existingResponse) {
            return null;
        }
        const updatedResponse = {
            ...existingResponse,
            ...updateData,
            id: existingResponse.id,
            createdAt: existingResponse.createdAt,
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
    async updateSectionResponse(responseId, sectionId, sectionData) {
        const existingResponse = this.responses.get(responseId);
        if (!existingResponse) {
            return null;
        }
        const updatedSections = existingResponse.sections.filter(s => s.sectionId !== sectionId);
        updatedSections.push(sectionData);
        const allSectionsComplete = updatedSections.every(s => s.isComplete);
        const newStatus = allSectionsComplete ? 'completed' : 'in_progress';
        return this.updateResponse(responseId, {
            sections: updatedSections,
            status: newStatus
        });
    }
    async getResponsesByOrganization(organizationId, status) {
        const allResponses = Array.from(this.responses.values());
        let filteredResponses = allResponses.filter(response => response.organizationId === organizationId);
        if (status) {
            filteredResponses = filteredResponses.filter(response => response.status === status);
        }
        return filteredResponses.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }
    async submitResponse(id) {
        const response = this.responses.get(id);
        if (!response) {
            return null;
        }
        const incompleteRequiredSections = response.sections.filter(section => !section.isComplete);
        if (incompleteRequiredSections.length > 0) {
            throw (0, errorHandler_1.createError)(`Cannot submit: ${incompleteRequiredSections.length} section(s) are incomplete`, 400);
        }
        return this.updateResponse(id, {
            status: 'submitted',
            submittedAt: new Date()
        });
    }
    async autoSave(responseId, sectionId, questionId, value) {
        const response = this.responses.get(responseId);
        if (!response) {
            return null;
        }
        let sectionResponse = response.sections.find(s => s.sectionId === sectionId);
        if (!sectionResponse) {
            sectionResponse = {
                sectionId,
                responses: [],
                isComplete: false
            };
        }
        const existingResponseIndex = sectionResponse.responses.findIndex(r => r.questionId === questionId);
        const questionResponse = {
            questionId,
            value
        };
        if (existingResponseIndex >= 0) {
            sectionResponse.responses[existingResponseIndex] = questionResponse;
        }
        else {
            sectionResponse.responses.push(questionResponse);
        }
        return this.updateSectionResponse(responseId, sectionId, sectionResponse);
    }
    async getResponseStats() {
        const allResponses = Array.from(this.responses.values());
        const byStatus = allResponses.reduce((acc, response) => {
            acc[response.status] = (acc[response.status] || 0) + 1;
            return acc;
        }, {});
        const byOrganization = allResponses.reduce((acc, response) => {
            acc[response.organizationName] = (acc[response.organizationName] || 0) + 1;
            return acc;
        }, {});
        return {
            total: allResponses.length,
            byStatus,
            byOrganization
        };
    }
}
exports.ResponseService = ResponseService;
//# sourceMappingURL=responseService.js.map