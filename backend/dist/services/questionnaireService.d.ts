import { Questionnaire, Section, ImplementationMode } from '../types/questionnaire';
export declare class QuestionnaireService {
    private questionnaires;
    constructor();
    getAllQuestionnaires(): Promise<Questionnaire[]>;
    getQuestionnaireById(id: string): Promise<Questionnaire | null>;
    getQuestionnaireSections(questionnaireId: string, implementationMode?: string): Promise<Section[]>;
    getQuestionnaireSection(questionnaireId: string, sectionId: string, implementationMode?: string): Promise<Section | null>;
    private evaluateConditionalLogic;
    getFilteredQuestions(questionnaireId: string, sectionId: string, responses: Record<string, any>, implementationMode?: string): Promise<{
        questions: {
            id: string;
            type: import("../types/questionnaire").QuestionType;
            title: string;
            required: boolean;
            attachmentRequired: boolean;
            options?: {
                value: string;
                label: string;
                description?: string | undefined;
            }[] | undefined;
            validation?: {
                minLength?: number | undefined;
                maxLength?: number | undefined;
                pattern?: string | undefined;
                min?: number | undefined;
                max?: number | undefined;
            } | undefined;
            description?: string | undefined;
            conditionalLogic?: {
                dependsOn?: string | undefined;
                showWhen?: string[] | undefined;
                hideWhen?: string[] | undefined;
            } | undefined;
            x12Field?: {
                length?: string | undefined;
                description?: string | undefined;
                segment?: string | undefined;
            } | undefined;
            fileUploadConfig?: {
                multiple: boolean;
                acceptedFormats?: string[] | undefined;
                maxFileSize?: number | undefined;
            } | undefined;
            helpText?: string | undefined;
        }[];
        id: string;
        title: string;
        order: number;
        description?: string | undefined;
        conditionalLogic?: {
            dependsOn?: string | undefined;
            showWhen?: string[] | undefined;
            hideWhen?: string[] | undefined;
            requiredModes?: ImplementationMode[] | undefined;
        } | undefined;
        customComponent?: string | undefined;
        envelopingRequirements?: {
            length: number;
            field: string;
            fieldDescription: string;
            request270: {
                id: string;
                options: {
                    value: string;
                    label: string;
                }[];
                defaultValue: string;
            };
            response271: {
                id: string;
                options: {
                    value: string;
                    label: string;
                }[];
                defaultValue: string;
            };
        }[] | undefined;
        modeLabel?: string | undefined;
    }>;
}
//# sourceMappingURL=questionnaireService.d.ts.map