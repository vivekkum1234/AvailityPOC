"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionnaireService = void 0;
const x12_270_271_questionnaire_1 = require("../data/x12-270-271-questionnaire");
const x12_270_271_complete_1 = require("../data/x12-270-271-complete");
const errorHandler_1 = require("../middleware/errorHandler");
class QuestionnaireService {
    questionnaires = new Map();
    constructor() {
        this.questionnaires.set(x12_270_271_questionnaire_1.x12270271Questionnaire.id, x12_270_271_questionnaire_1.x12270271Questionnaire);
        this.questionnaires.set(x12_270_271_complete_1.x12270271CompleteQuestionnaire.id, x12_270_271_complete_1.x12270271CompleteQuestionnaire);
    }
    async getAllQuestionnaires() {
        return Array.from(this.questionnaires.values()).filter(q => q.isActive);
    }
    async getQuestionnaireById(id) {
        const questionnaire = this.questionnaires.get(id);
        return questionnaire && questionnaire.isActive ? questionnaire : null;
    }
    async getQuestionnaireSections(questionnaireId, implementationMode) {
        const questionnaire = await this.getQuestionnaireById(questionnaireId);
        if (!questionnaire) {
            throw (0, errorHandler_1.createError)('Questionnaire not found', 404);
        }
        let sections = questionnaire.sections;
        if (implementationMode) {
            sections = sections.filter(section => {
                if (section.conditionalLogic?.requiredModes) {
                    return section.conditionalLogic.requiredModes.includes(implementationMode);
                }
                return true;
            });
        }
        return sections.sort((a, b) => a.order - b.order);
    }
    async getQuestionnaireSection(questionnaireId, sectionId, implementationMode) {
        const sections = await this.getQuestionnaireSections(questionnaireId, implementationMode);
        return sections.find(section => section.id === sectionId) || null;
    }
    evaluateConditionalLogic(conditionalLogic, responses, implementationMode) {
        if (!conditionalLogic)
            return true;
        if (conditionalLogic.requiredModes && implementationMode) {
            if (!conditionalLogic.requiredModes.includes(implementationMode)) {
                return false;
            }
        }
        if (conditionalLogic.dependsOn) {
            const dependentValue = responses[conditionalLogic.dependsOn];
            if (conditionalLogic.showWhen) {
                return conditionalLogic.showWhen.includes(dependentValue);
            }
            if (conditionalLogic.hideWhen) {
                return !conditionalLogic.hideWhen.includes(dependentValue);
            }
        }
        return true;
    }
    async getFilteredQuestions(questionnaireId, sectionId, responses, implementationMode) {
        const section = await this.getQuestionnaireSection(questionnaireId, sectionId, implementationMode);
        if (!section) {
            throw (0, errorHandler_1.createError)('Section not found', 404);
        }
        const filteredQuestions = section.questions.filter(question => this.evaluateConditionalLogic(question.conditionalLogic, responses, implementationMode));
        return {
            ...section,
            questions: filteredQuestions
        };
    }
}
exports.QuestionnaireService = QuestionnaireService;
//# sourceMappingURL=questionnaireService.js.map