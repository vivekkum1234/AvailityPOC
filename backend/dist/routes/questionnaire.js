"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const questionnaireService_1 = require("../services/questionnaireService");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
const questionnaireService = new questionnaireService_1.QuestionnaireService();
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const questionnaires = await questionnaireService.getAllQuestionnaires();
    return res.json({
        success: true,
        data: questionnaires
    });
}));
router.get('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            success: false,
            error: 'Questionnaire ID is required'
        });
    }
    const questionnaire = await questionnaireService.getQuestionnaireById(id);
    if (!questionnaire) {
        return res.status(404).json({
            success: false,
            error: 'Questionnaire not found'
        });
    }
    return res.json({
        success: true,
        data: questionnaire
    });
}));
router.get('/:id/sections', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            success: false,
            error: 'Questionnaire ID is required'
        });
    }
    const { mode } = req.query;
    const sections = await questionnaireService.getQuestionnaireSections(id, mode);
    return res.json({
        success: true,
        data: sections
    });
}));
router.get('/:id/sections/:sectionId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id, sectionId } = req.params;
    if (!id || !sectionId) {
        return res.status(400).json({
            success: false,
            error: 'Questionnaire ID and Section ID are required'
        });
    }
    const { mode } = req.query;
    const section = await questionnaireService.getQuestionnaireSection(id, sectionId, mode);
    if (!section) {
        return res.status(404).json({
            success: false,
            error: 'Section not found'
        });
    }
    return res.json({
        success: true,
        data: section
    });
}));
exports.default = router;
//# sourceMappingURL=questionnaire.js.map