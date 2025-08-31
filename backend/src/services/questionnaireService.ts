import { Questionnaire, Section, ImplementationMode } from '../types/questionnaire';
import { x12270271Questionnaire } from '../data/x12-270-271-questionnaire';
import { x12270271CompleteQuestionnaire } from '../data/x12-270-271-complete';
import { createError } from '../middleware/errorHandler';

export class QuestionnaireService {
  // In-memory storage for now (will be replaced with database later)
  private questionnaires: Map<string, Questionnaire> = new Map();

  constructor() {
    // Initialize with the X12 270/271 questionnaires
    this.questionnaires.set(x12270271Questionnaire.id, x12270271Questionnaire);
    this.questionnaires.set(x12270271CompleteQuestionnaire.id, x12270271CompleteQuestionnaire);
  }

  async getAllQuestionnaires(): Promise<Questionnaire[]> {
    return Array.from(this.questionnaires.values()).filter(q => q.isActive);
  }

  async getQuestionnaireById(id: string): Promise<Questionnaire | null> {
    const questionnaire = this.questionnaires.get(id);
    return questionnaire && questionnaire.isActive ? questionnaire : null;
  }

  async getQuestionnaireSections(
    questionnaireId: string, 
    implementationMode?: string
  ): Promise<Section[]> {
    const questionnaire = await this.getQuestionnaireById(questionnaireId);
    
    if (!questionnaire) {
      throw createError('Questionnaire not found', 404);
    }

    // Filter sections based on implementation mode if provided
    let sections = questionnaire.sections;
    
    if (implementationMode) {
      sections = sections.filter(section => {
        // If section has conditional logic for modes, check it
        if (section.conditionalLogic?.requiredModes) {
          return section.conditionalLogic.requiredModes.includes(
            implementationMode as ImplementationMode
          );
        }
        // If no mode restrictions, include the section
        return true;
      });
    }

    return sections.sort((a, b) => a.order - b.order);
  }

  async getQuestionnaireSection(
    questionnaireId: string,
    sectionId: string,
    implementationMode?: string
  ): Promise<Section | null> {
    const sections = await this.getQuestionnaireSections(questionnaireId, implementationMode);
    return sections.find(section => section.id === sectionId) || null;
  }

  // Helper method to evaluate conditional logic
  private evaluateConditionalLogic(
    conditionalLogic: any,
    responses: Record<string, any>,
    implementationMode?: string
  ): boolean {
    if (!conditionalLogic) return true;

    // Check implementation mode requirements
    if (conditionalLogic.requiredModes && implementationMode) {
      if (!conditionalLogic.requiredModes.includes(implementationMode)) {
        return false;
      }
    }

    // Check dependency logic
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

  // Get filtered questions based on current responses
  async getFilteredQuestions(
    questionnaireId: string,
    sectionId: string,
    responses: Record<string, any>,
    implementationMode?: string
  ) {
    const section = await this.getQuestionnaireSection(questionnaireId, sectionId, implementationMode);
    
    if (!section) {
      throw createError('Section not found', 404);
    }

    // Filter questions based on conditional logic
    const filteredQuestions = section.questions.filter(question => 
      this.evaluateConditionalLogic(question.conditionalLogic, responses, implementationMode)
    );

    return {
      ...section,
      questions: filteredQuestions
    };
  }
}
