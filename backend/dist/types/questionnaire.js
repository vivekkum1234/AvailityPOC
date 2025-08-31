"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionnaireResponseSchema = exports.SectionResponseSchema = exports.QuestionResponseSchema = exports.QuestionnaireSchema = exports.SectionSchema = exports.EnvelopingRequirementSchema = exports.QuestionSchema = exports.ImplementationMode = exports.QuestionType = void 0;
const zod_1 = require("zod");
var QuestionType;
(function (QuestionType) {
    QuestionType["CHECKBOX"] = "checkbox";
    QuestionType["RADIO"] = "radio";
    QuestionType["TEXT"] = "text";
    QuestionType["EMAIL"] = "email";
    QuestionType["URL"] = "url";
    QuestionType["TEXTAREA"] = "textarea";
    QuestionType["SELECT"] = "select";
    QuestionType["MULTI_SELECT"] = "multi_select";
    QuestionType["DATE"] = "date";
    QuestionType["NUMBER"] = "number";
    QuestionType["DISPLAY"] = "display";
    QuestionType["FILE_UPLOAD"] = "file_upload";
})(QuestionType || (exports.QuestionType = QuestionType = {}));
var ImplementationMode;
(function (ImplementationMode) {
    ImplementationMode["REAL_TIME_WEB"] = "real_time_web";
    ImplementationMode["REAL_TIME_B2B"] = "real_time_b2b";
    ImplementationMode["EDI_BATCH"] = "edi_batch";
})(ImplementationMode || (exports.ImplementationMode = ImplementationMode = {}));
exports.QuestionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.nativeEnum(QuestionType),
    title: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    required: zod_1.z.boolean().default(false),
    options: zod_1.z.array(zod_1.z.object({
        value: zod_1.z.string(),
        label: zod_1.z.string(),
        description: zod_1.z.string().optional()
    })).optional(),
    validation: zod_1.z.object({
        minLength: zod_1.z.number().optional(),
        maxLength: zod_1.z.number().optional(),
        pattern: zod_1.z.string().optional(),
        min: zod_1.z.number().optional(),
        max: zod_1.z.number().optional()
    }).optional(),
    conditionalLogic: zod_1.z.object({
        dependsOn: zod_1.z.string().optional(),
        showWhen: zod_1.z.array(zod_1.z.string()).optional(),
        hideWhen: zod_1.z.array(zod_1.z.string()).optional()
    }).optional(),
    x12Field: zod_1.z.object({
        segment: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        length: zod_1.z.string().optional()
    }).optional(),
    fileUploadConfig: zod_1.z.object({
        acceptedFormats: zod_1.z.array(zod_1.z.string()).optional(),
        maxFileSize: zod_1.z.number().optional(),
        multiple: zod_1.z.boolean().default(false)
    }).optional(),
    helpText: zod_1.z.string().optional(),
    attachmentRequired: zod_1.z.boolean().default(false)
});
exports.EnvelopingRequirementSchema = zod_1.z.object({
    field: zod_1.z.string(),
    fieldDescription: zod_1.z.string(),
    length: zod_1.z.number(),
    request270: zod_1.z.object({
        id: zod_1.z.string(),
        options: zod_1.z.array(zod_1.z.object({
            value: zod_1.z.string(),
            label: zod_1.z.string()
        })),
        defaultValue: zod_1.z.string()
    }),
    response271: zod_1.z.object({
        id: zod_1.z.string(),
        options: zod_1.z.array(zod_1.z.object({
            value: zod_1.z.string(),
            label: zod_1.z.string()
        })),
        defaultValue: zod_1.z.string()
    })
});
exports.SectionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    order: zod_1.z.number(),
    questions: zod_1.z.array(exports.QuestionSchema),
    customComponent: zod_1.z.string().optional(),
    envelopingRequirements: zod_1.z.array(exports.EnvelopingRequirementSchema).optional(),
    modeLabel: zod_1.z.string().optional(),
    conditionalLogic: zod_1.z.object({
        dependsOn: zod_1.z.string().optional(),
        showWhen: zod_1.z.array(zod_1.z.string()).optional(),
        hideWhen: zod_1.z.array(zod_1.z.string()).optional(),
        requiredModes: zod_1.z.array(zod_1.z.nativeEnum(ImplementationMode)).optional()
    }).optional()
});
exports.QuestionnaireSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    version: zod_1.z.string(),
    transactionType: zod_1.z.string(),
    sections: zod_1.z.array(exports.SectionSchema),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    createdBy: zod_1.z.string(),
    isActive: zod_1.z.boolean().default(true)
});
exports.QuestionResponseSchema = zod_1.z.object({
    questionId: zod_1.z.string(),
    value: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string()), zod_1.z.number(), zod_1.z.boolean()]),
    attachments: zod_1.z.array(zod_1.z.object({
        filename: zod_1.z.string(),
        url: zod_1.z.string(),
        uploadedAt: zod_1.z.date()
    })).optional()
});
exports.SectionResponseSchema = zod_1.z.object({
    sectionId: zod_1.z.string(),
    responses: zod_1.z.array(exports.QuestionResponseSchema),
    completedAt: zod_1.z.date().optional(),
    isComplete: zod_1.z.boolean().default(false)
});
exports.QuestionnaireResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    questionnaireId: zod_1.z.string(),
    organizationId: zod_1.z.string(),
    organizationName: zod_1.z.string(),
    implementationMode: zod_1.z.nativeEnum(ImplementationMode).optional(),
    sections: zod_1.z.array(exports.SectionResponseSchema),
    status: zod_1.z.enum(['draft', 'in_progress', 'completed', 'submitted', 'archived']),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    submittedAt: zod_1.z.date().optional(),
    assignedUsers: zod_1.z.array(zod_1.z.object({
        userId: zod_1.z.string(),
        email: zod_1.z.string(),
        role: zod_1.z.enum(['primary', 'collaborator', 'viewer'])
    })),
    auditTrail: zod_1.z.array(zod_1.z.object({
        action: zod_1.z.string(),
        userId: zod_1.z.string(),
        timestamp: zod_1.z.date(),
        changes: zod_1.z.record(zod_1.z.any()).optional()
    }))
});
//# sourceMappingURL=questionnaire.js.map