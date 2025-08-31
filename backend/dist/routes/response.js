"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const responseService_1 = require("../services/responseService");
const questionnaire_1 = require("../types/questionnaire");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
const responseService = new responseService_1.ResponseService();
router.post('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const validatedData = questionnaire_1.QuestionnaireResponseSchema.parse(req.body);
    const response = await responseService.createResponse(validatedData);
    res.status(201).json({
        success: true,
        data: response
    });
}));
router.get('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            success: false,
            error: 'Response ID is required'
        });
    }
    const response = await responseService.getResponseById(id);
    if (!response) {
        return res.status(404).json({
            success: false,
            error: 'Response not found'
        });
    }
    return res.json({
        success: true,
        data: response
    });
}));
router.put('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            success: false,
            error: 'Response ID is required'
        });
    }
    const validatedData = questionnaire_1.QuestionnaireResponseSchema.partial().parse(req.body);
    const response = await responseService.updateResponse(id, validatedData);
    if (!response) {
        return res.status(404).json({
            success: false,
            error: 'Response not found'
        });
    }
    return res.json({
        success: true,
        data: response
    });
}));
router.put('/:id/sections/:sectionId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id, sectionId } = req.params;
    if (!id || !sectionId) {
        return res.status(400).json({
            success: false,
            error: 'Response ID and Section ID are required'
        });
    }
    const validatedData = questionnaire_1.SectionResponseSchema.parse(req.body);
    const response = await responseService.updateSectionResponse(id, sectionId, validatedData);
    if (!response) {
        return res.status(404).json({
            success: false,
            error: 'Response or section not found'
        });
    }
    return res.json({
        success: true,
        data: response
    });
}));
router.get('/organization/:orgId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { orgId } = req.params;
    if (!orgId) {
        return res.status(400).json({
            success: false,
            error: 'Organization ID is required'
        });
    }
    const { status } = req.query;
    const responses = await responseService.getResponsesByOrganization(orgId, status);
    return res.json({
        success: true,
        data: responses
    });
}));
router.post('/:id/submit', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            success: false,
            error: 'Response ID is required'
        });
    }
    const response = await responseService.submitResponse(id);
    if (!response) {
        return res.status(404).json({
            success: false,
            error: 'Response not found'
        });
    }
    return res.json({
        success: true,
        data: response,
        message: 'Questionnaire submitted successfully'
    });
}));
exports.default = router;
//# sourceMappingURL=response.js.map