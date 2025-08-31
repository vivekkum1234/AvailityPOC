import { z } from 'zod';
export declare enum QuestionType {
    CHECKBOX = "checkbox",
    RADIO = "radio",
    TEXT = "text",
    EMAIL = "email",
    URL = "url",
    TEXTAREA = "textarea",
    SELECT = "select",
    MULTI_SELECT = "multi_select",
    DATE = "date",
    NUMBER = "number",
    DISPLAY = "display",
    FILE_UPLOAD = "file_upload"
}
export declare enum ImplementationMode {
    REAL_TIME_WEB = "real_time_web",
    REAL_TIME_B2B = "real_time_b2b",
    EDI_BATCH = "edi_batch"
}
export declare const QuestionSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodNativeEnum<typeof QuestionType>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodDefault<z.ZodBoolean>;
    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
        value: z.ZodString;
        label: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: string;
        label: string;
        description?: string | undefined;
    }, {
        value: string;
        label: string;
        description?: string | undefined;
    }>, "many">>;
    validation: z.ZodOptional<z.ZodObject<{
        minLength: z.ZodOptional<z.ZodNumber>;
        maxLength: z.ZodOptional<z.ZodNumber>;
        pattern: z.ZodOptional<z.ZodString>;
        min: z.ZodOptional<z.ZodNumber>;
        max: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        minLength?: number | undefined;
        maxLength?: number | undefined;
        pattern?: string | undefined;
        min?: number | undefined;
        max?: number | undefined;
    }, {
        minLength?: number | undefined;
        maxLength?: number | undefined;
        pattern?: string | undefined;
        min?: number | undefined;
        max?: number | undefined;
    }>>;
    conditionalLogic: z.ZodOptional<z.ZodObject<{
        dependsOn: z.ZodOptional<z.ZodString>;
        showWhen: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        hideWhen: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        dependsOn?: string | undefined;
        showWhen?: string[] | undefined;
        hideWhen?: string[] | undefined;
    }, {
        dependsOn?: string | undefined;
        showWhen?: string[] | undefined;
        hideWhen?: string[] | undefined;
    }>>;
    x12Field: z.ZodOptional<z.ZodObject<{
        segment: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        length: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        length?: string | undefined;
        description?: string | undefined;
        segment?: string | undefined;
    }, {
        length?: string | undefined;
        description?: string | undefined;
        segment?: string | undefined;
    }>>;
    fileUploadConfig: z.ZodOptional<z.ZodObject<{
        acceptedFormats: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        maxFileSize: z.ZodOptional<z.ZodNumber>;
        multiple: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        multiple: boolean;
        acceptedFormats?: string[] | undefined;
        maxFileSize?: number | undefined;
    }, {
        acceptedFormats?: string[] | undefined;
        maxFileSize?: number | undefined;
        multiple?: boolean | undefined;
    }>>;
    helpText: z.ZodOptional<z.ZodString>;
    attachmentRequired: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: QuestionType;
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
}, {
    id: string;
    type: QuestionType;
    title: string;
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
    required?: boolean | undefined;
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
        acceptedFormats?: string[] | undefined;
        maxFileSize?: number | undefined;
        multiple?: boolean | undefined;
    } | undefined;
    helpText?: string | undefined;
    attachmentRequired?: boolean | undefined;
}>;
export declare const EnvelopingRequirementSchema: z.ZodObject<{
    field: z.ZodString;
    fieldDescription: z.ZodString;
    length: z.ZodNumber;
    request270: z.ZodObject<{
        id: z.ZodString;
        options: z.ZodArray<z.ZodObject<{
            value: z.ZodString;
            label: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: string;
            label: string;
        }, {
            value: string;
            label: string;
        }>, "many">;
        defaultValue: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        options: {
            value: string;
            label: string;
        }[];
        defaultValue: string;
    }, {
        id: string;
        options: {
            value: string;
            label: string;
        }[];
        defaultValue: string;
    }>;
    response271: z.ZodObject<{
        id: z.ZodString;
        options: z.ZodArray<z.ZodObject<{
            value: z.ZodString;
            label: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: string;
            label: string;
        }, {
            value: string;
            label: string;
        }>, "many">;
        defaultValue: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        options: {
            value: string;
            label: string;
        }[];
        defaultValue: string;
    }, {
        id: string;
        options: {
            value: string;
            label: string;
        }[];
        defaultValue: string;
    }>;
}, "strip", z.ZodTypeAny, {
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
}, {
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
}>;
export declare const SectionSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    order: z.ZodNumber;
    questions: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodNativeEnum<typeof QuestionType>;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        required: z.ZodDefault<z.ZodBoolean>;
        options: z.ZodOptional<z.ZodArray<z.ZodObject<{
            value: z.ZodString;
            label: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: string;
            label: string;
            description?: string | undefined;
        }, {
            value: string;
            label: string;
            description?: string | undefined;
        }>, "many">>;
        validation: z.ZodOptional<z.ZodObject<{
            minLength: z.ZodOptional<z.ZodNumber>;
            maxLength: z.ZodOptional<z.ZodNumber>;
            pattern: z.ZodOptional<z.ZodString>;
            min: z.ZodOptional<z.ZodNumber>;
            max: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            minLength?: number | undefined;
            maxLength?: number | undefined;
            pattern?: string | undefined;
            min?: number | undefined;
            max?: number | undefined;
        }, {
            minLength?: number | undefined;
            maxLength?: number | undefined;
            pattern?: string | undefined;
            min?: number | undefined;
            max?: number | undefined;
        }>>;
        conditionalLogic: z.ZodOptional<z.ZodObject<{
            dependsOn: z.ZodOptional<z.ZodString>;
            showWhen: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            hideWhen: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            dependsOn?: string | undefined;
            showWhen?: string[] | undefined;
            hideWhen?: string[] | undefined;
        }, {
            dependsOn?: string | undefined;
            showWhen?: string[] | undefined;
            hideWhen?: string[] | undefined;
        }>>;
        x12Field: z.ZodOptional<z.ZodObject<{
            segment: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            length: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            length?: string | undefined;
            description?: string | undefined;
            segment?: string | undefined;
        }, {
            length?: string | undefined;
            description?: string | undefined;
            segment?: string | undefined;
        }>>;
        fileUploadConfig: z.ZodOptional<z.ZodObject<{
            acceptedFormats: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            maxFileSize: z.ZodOptional<z.ZodNumber>;
            multiple: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            multiple: boolean;
            acceptedFormats?: string[] | undefined;
            maxFileSize?: number | undefined;
        }, {
            acceptedFormats?: string[] | undefined;
            maxFileSize?: number | undefined;
            multiple?: boolean | undefined;
        }>>;
        helpText: z.ZodOptional<z.ZodString>;
        attachmentRequired: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: QuestionType;
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
    }, {
        id: string;
        type: QuestionType;
        title: string;
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
        required?: boolean | undefined;
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
            acceptedFormats?: string[] | undefined;
            maxFileSize?: number | undefined;
            multiple?: boolean | undefined;
        } | undefined;
        helpText?: string | undefined;
        attachmentRequired?: boolean | undefined;
    }>, "many">;
    customComponent: z.ZodOptional<z.ZodString>;
    envelopingRequirements: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        fieldDescription: z.ZodString;
        length: z.ZodNumber;
        request270: z.ZodObject<{
            id: z.ZodString;
            options: z.ZodArray<z.ZodObject<{
                value: z.ZodString;
                label: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                value: string;
                label: string;
            }, {
                value: string;
                label: string;
            }>, "many">;
            defaultValue: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            options: {
                value: string;
                label: string;
            }[];
            defaultValue: string;
        }, {
            id: string;
            options: {
                value: string;
                label: string;
            }[];
            defaultValue: string;
        }>;
        response271: z.ZodObject<{
            id: z.ZodString;
            options: z.ZodArray<z.ZodObject<{
                value: z.ZodString;
                label: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                value: string;
                label: string;
            }, {
                value: string;
                label: string;
            }>, "many">;
            defaultValue: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            options: {
                value: string;
                label: string;
            }[];
            defaultValue: string;
        }, {
            id: string;
            options: {
                value: string;
                label: string;
            }[];
            defaultValue: string;
        }>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
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
    }>, "many">>;
    modeLabel: z.ZodOptional<z.ZodString>;
    conditionalLogic: z.ZodOptional<z.ZodObject<{
        dependsOn: z.ZodOptional<z.ZodString>;
        showWhen: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        hideWhen: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        requiredModes: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof ImplementationMode>, "many">>;
    }, "strip", z.ZodTypeAny, {
        dependsOn?: string | undefined;
        showWhen?: string[] | undefined;
        hideWhen?: string[] | undefined;
        requiredModes?: ImplementationMode[] | undefined;
    }, {
        dependsOn?: string | undefined;
        showWhen?: string[] | undefined;
        hideWhen?: string[] | undefined;
        requiredModes?: ImplementationMode[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    order: number;
    questions: {
        id: string;
        type: QuestionType;
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
}, {
    id: string;
    title: string;
    order: number;
    questions: {
        id: string;
        type: QuestionType;
        title: string;
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
        required?: boolean | undefined;
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
            acceptedFormats?: string[] | undefined;
            maxFileSize?: number | undefined;
            multiple?: boolean | undefined;
        } | undefined;
        helpText?: string | undefined;
        attachmentRequired?: boolean | undefined;
    }[];
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
export declare const QuestionnaireSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    version: z.ZodString;
    transactionType: z.ZodString;
    sections: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        order: z.ZodNumber;
        questions: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodNativeEnum<typeof QuestionType>;
            title: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            required: z.ZodDefault<z.ZodBoolean>;
            options: z.ZodOptional<z.ZodArray<z.ZodObject<{
                value: z.ZodString;
                label: z.ZodString;
                description: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                value: string;
                label: string;
                description?: string | undefined;
            }, {
                value: string;
                label: string;
                description?: string | undefined;
            }>, "many">>;
            validation: z.ZodOptional<z.ZodObject<{
                minLength: z.ZodOptional<z.ZodNumber>;
                maxLength: z.ZodOptional<z.ZodNumber>;
                pattern: z.ZodOptional<z.ZodString>;
                min: z.ZodOptional<z.ZodNumber>;
                max: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                minLength?: number | undefined;
                maxLength?: number | undefined;
                pattern?: string | undefined;
                min?: number | undefined;
                max?: number | undefined;
            }, {
                minLength?: number | undefined;
                maxLength?: number | undefined;
                pattern?: string | undefined;
                min?: number | undefined;
                max?: number | undefined;
            }>>;
            conditionalLogic: z.ZodOptional<z.ZodObject<{
                dependsOn: z.ZodOptional<z.ZodString>;
                showWhen: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                hideWhen: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                dependsOn?: string | undefined;
                showWhen?: string[] | undefined;
                hideWhen?: string[] | undefined;
            }, {
                dependsOn?: string | undefined;
                showWhen?: string[] | undefined;
                hideWhen?: string[] | undefined;
            }>>;
            x12Field: z.ZodOptional<z.ZodObject<{
                segment: z.ZodOptional<z.ZodString>;
                description: z.ZodOptional<z.ZodString>;
                length: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                length?: string | undefined;
                description?: string | undefined;
                segment?: string | undefined;
            }, {
                length?: string | undefined;
                description?: string | undefined;
                segment?: string | undefined;
            }>>;
            fileUploadConfig: z.ZodOptional<z.ZodObject<{
                acceptedFormats: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                maxFileSize: z.ZodOptional<z.ZodNumber>;
                multiple: z.ZodDefault<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                multiple: boolean;
                acceptedFormats?: string[] | undefined;
                maxFileSize?: number | undefined;
            }, {
                acceptedFormats?: string[] | undefined;
                maxFileSize?: number | undefined;
                multiple?: boolean | undefined;
            }>>;
            helpText: z.ZodOptional<z.ZodString>;
            attachmentRequired: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            type: QuestionType;
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
        }, {
            id: string;
            type: QuestionType;
            title: string;
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
            required?: boolean | undefined;
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
                acceptedFormats?: string[] | undefined;
                maxFileSize?: number | undefined;
                multiple?: boolean | undefined;
            } | undefined;
            helpText?: string | undefined;
            attachmentRequired?: boolean | undefined;
        }>, "many">;
        customComponent: z.ZodOptional<z.ZodString>;
        envelopingRequirements: z.ZodOptional<z.ZodArray<z.ZodObject<{
            field: z.ZodString;
            fieldDescription: z.ZodString;
            length: z.ZodNumber;
            request270: z.ZodObject<{
                id: z.ZodString;
                options: z.ZodArray<z.ZodObject<{
                    value: z.ZodString;
                    label: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    label: string;
                }, {
                    value: string;
                    label: string;
                }>, "many">;
                defaultValue: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
                options: {
                    value: string;
                    label: string;
                }[];
                defaultValue: string;
            }, {
                id: string;
                options: {
                    value: string;
                    label: string;
                }[];
                defaultValue: string;
            }>;
            response271: z.ZodObject<{
                id: z.ZodString;
                options: z.ZodArray<z.ZodObject<{
                    value: z.ZodString;
                    label: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    label: string;
                }, {
                    value: string;
                    label: string;
                }>, "many">;
                defaultValue: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
                options: {
                    value: string;
                    label: string;
                }[];
                defaultValue: string;
            }, {
                id: string;
                options: {
                    value: string;
                    label: string;
                }[];
                defaultValue: string;
            }>;
        }, "strip", z.ZodTypeAny, {
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
        }, {
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
        }>, "many">>;
        modeLabel: z.ZodOptional<z.ZodString>;
        conditionalLogic: z.ZodOptional<z.ZodObject<{
            dependsOn: z.ZodOptional<z.ZodString>;
            showWhen: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            hideWhen: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            requiredModes: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof ImplementationMode>, "many">>;
        }, "strip", z.ZodTypeAny, {
            dependsOn?: string | undefined;
            showWhen?: string[] | undefined;
            hideWhen?: string[] | undefined;
            requiredModes?: ImplementationMode[] | undefined;
        }, {
            dependsOn?: string | undefined;
            showWhen?: string[] | undefined;
            hideWhen?: string[] | undefined;
            requiredModes?: ImplementationMode[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
        order: number;
        questions: {
            id: string;
            type: QuestionType;
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
    }, {
        id: string;
        title: string;
        order: number;
        questions: {
            id: string;
            type: QuestionType;
            title: string;
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
            required?: boolean | undefined;
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
                acceptedFormats?: string[] | undefined;
                maxFileSize?: number | undefined;
                multiple?: boolean | undefined;
            } | undefined;
            helpText?: string | undefined;
            attachmentRequired?: boolean | undefined;
        }[];
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
    }>, "many">;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    createdBy: z.ZodString;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    description: string;
    version: string;
    transactionType: string;
    sections: {
        id: string;
        title: string;
        order: number;
        questions: {
            id: string;
            type: QuestionType;
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
    }[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    isActive: boolean;
}, {
    id: string;
    title: string;
    description: string;
    version: string;
    transactionType: string;
    sections: {
        id: string;
        title: string;
        order: number;
        questions: {
            id: string;
            type: QuestionType;
            title: string;
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
            required?: boolean | undefined;
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
                acceptedFormats?: string[] | undefined;
                maxFileSize?: number | undefined;
                multiple?: boolean | undefined;
            } | undefined;
            helpText?: string | undefined;
            attachmentRequired?: boolean | undefined;
        }[];
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
    }[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    isActive?: boolean | undefined;
}>;
export declare const QuestionResponseSchema: z.ZodObject<{
    questionId: z.ZodString;
    value: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">, z.ZodNumber, z.ZodBoolean]>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        filename: z.ZodString;
        url: z.ZodString;
        uploadedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        url: string;
        filename: string;
        uploadedAt: Date;
    }, {
        url: string;
        filename: string;
        uploadedAt: Date;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    value: string | number | boolean | string[];
    questionId: string;
    attachments?: {
        url: string;
        filename: string;
        uploadedAt: Date;
    }[] | undefined;
}, {
    value: string | number | boolean | string[];
    questionId: string;
    attachments?: {
        url: string;
        filename: string;
        uploadedAt: Date;
    }[] | undefined;
}>;
export declare const SectionResponseSchema: z.ZodObject<{
    sectionId: z.ZodString;
    responses: z.ZodArray<z.ZodObject<{
        questionId: z.ZodString;
        value: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">, z.ZodNumber, z.ZodBoolean]>;
        attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            filename: z.ZodString;
            url: z.ZodString;
            uploadedAt: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            url: string;
            filename: string;
            uploadedAt: Date;
        }, {
            url: string;
            filename: string;
            uploadedAt: Date;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        value: string | number | boolean | string[];
        questionId: string;
        attachments?: {
            url: string;
            filename: string;
            uploadedAt: Date;
        }[] | undefined;
    }, {
        value: string | number | boolean | string[];
        questionId: string;
        attachments?: {
            url: string;
            filename: string;
            uploadedAt: Date;
        }[] | undefined;
    }>, "many">;
    completedAt: z.ZodOptional<z.ZodDate>;
    isComplete: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    sectionId: string;
    responses: {
        value: string | number | boolean | string[];
        questionId: string;
        attachments?: {
            url: string;
            filename: string;
            uploadedAt: Date;
        }[] | undefined;
    }[];
    isComplete: boolean;
    completedAt?: Date | undefined;
}, {
    sectionId: string;
    responses: {
        value: string | number | boolean | string[];
        questionId: string;
        attachments?: {
            url: string;
            filename: string;
            uploadedAt: Date;
        }[] | undefined;
    }[];
    completedAt?: Date | undefined;
    isComplete?: boolean | undefined;
}>;
export declare const QuestionnaireResponseSchema: z.ZodObject<{
    id: z.ZodString;
    questionnaireId: z.ZodString;
    organizationId: z.ZodString;
    organizationName: z.ZodString;
    implementationMode: z.ZodOptional<z.ZodNativeEnum<typeof ImplementationMode>>;
    sections: z.ZodArray<z.ZodObject<{
        sectionId: z.ZodString;
        responses: z.ZodArray<z.ZodObject<{
            questionId: z.ZodString;
            value: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">, z.ZodNumber, z.ZodBoolean]>;
            attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                filename: z.ZodString;
                url: z.ZodString;
                uploadedAt: z.ZodDate;
            }, "strip", z.ZodTypeAny, {
                url: string;
                filename: string;
                uploadedAt: Date;
            }, {
                url: string;
                filename: string;
                uploadedAt: Date;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            value: string | number | boolean | string[];
            questionId: string;
            attachments?: {
                url: string;
                filename: string;
                uploadedAt: Date;
            }[] | undefined;
        }, {
            value: string | number | boolean | string[];
            questionId: string;
            attachments?: {
                url: string;
                filename: string;
                uploadedAt: Date;
            }[] | undefined;
        }>, "many">;
        completedAt: z.ZodOptional<z.ZodDate>;
        isComplete: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        sectionId: string;
        responses: {
            value: string | number | boolean | string[];
            questionId: string;
            attachments?: {
                url: string;
                filename: string;
                uploadedAt: Date;
            }[] | undefined;
        }[];
        isComplete: boolean;
        completedAt?: Date | undefined;
    }, {
        sectionId: string;
        responses: {
            value: string | number | boolean | string[];
            questionId: string;
            attachments?: {
                url: string;
                filename: string;
                uploadedAt: Date;
            }[] | undefined;
        }[];
        completedAt?: Date | undefined;
        isComplete?: boolean | undefined;
    }>, "many">;
    status: z.ZodEnum<["draft", "in_progress", "completed", "submitted", "archived"]>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    submittedAt: z.ZodOptional<z.ZodDate>;
    assignedUsers: z.ZodArray<z.ZodObject<{
        userId: z.ZodString;
        email: z.ZodString;
        role: z.ZodEnum<["primary", "collaborator", "viewer"]>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        userId: string;
        role: "primary" | "collaborator" | "viewer";
    }, {
        email: string;
        userId: string;
        role: "primary" | "collaborator" | "viewer";
    }>, "many">;
    auditTrail: z.ZodArray<z.ZodObject<{
        action: z.ZodString;
        userId: z.ZodString;
        timestamp: z.ZodDate;
        changes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        action: string;
        timestamp: Date;
        changes?: Record<string, any> | undefined;
    }, {
        userId: string;
        action: string;
        timestamp: Date;
        changes?: Record<string, any> | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "draft" | "in_progress" | "completed" | "submitted" | "archived";
    sections: {
        sectionId: string;
        responses: {
            value: string | number | boolean | string[];
            questionId: string;
            attachments?: {
                url: string;
                filename: string;
                uploadedAt: Date;
            }[] | undefined;
        }[];
        isComplete: boolean;
        completedAt?: Date | undefined;
    }[];
    createdAt: Date;
    updatedAt: Date;
    questionnaireId: string;
    organizationId: string;
    organizationName: string;
    assignedUsers: {
        email: string;
        userId: string;
        role: "primary" | "collaborator" | "viewer";
    }[];
    auditTrail: {
        userId: string;
        action: string;
        timestamp: Date;
        changes?: Record<string, any> | undefined;
    }[];
    implementationMode?: ImplementationMode | undefined;
    submittedAt?: Date | undefined;
}, {
    id: string;
    status: "draft" | "in_progress" | "completed" | "submitted" | "archived";
    sections: {
        sectionId: string;
        responses: {
            value: string | number | boolean | string[];
            questionId: string;
            attachments?: {
                url: string;
                filename: string;
                uploadedAt: Date;
            }[] | undefined;
        }[];
        completedAt?: Date | undefined;
        isComplete?: boolean | undefined;
    }[];
    createdAt: Date;
    updatedAt: Date;
    questionnaireId: string;
    organizationId: string;
    organizationName: string;
    assignedUsers: {
        email: string;
        userId: string;
        role: "primary" | "collaborator" | "viewer";
    }[];
    auditTrail: {
        userId: string;
        action: string;
        timestamp: Date;
        changes?: Record<string, any> | undefined;
    }[];
    implementationMode?: ImplementationMode | undefined;
    submittedAt?: Date | undefined;
}>;
export type Question = z.infer<typeof QuestionSchema>;
export type EnvelopingRequirement = z.infer<typeof EnvelopingRequirementSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type Questionnaire = z.infer<typeof QuestionnaireSchema>;
export type QuestionResponse = z.infer<typeof QuestionResponseSchema>;
export type SectionResponse = z.infer<typeof SectionResponseSchema>;
export type QuestionnaireResponse = z.infer<typeof QuestionnaireResponseSchema>;
//# sourceMappingURL=questionnaire.d.ts.map