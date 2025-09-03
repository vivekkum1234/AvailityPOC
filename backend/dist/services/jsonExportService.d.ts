import { QuestionnaireResponse } from './supabaseService';
export interface ExportedJsonData {
    id: string;
    template: string;
    transactionType: string;
    name: string;
    clearinghouse: string;
    versions: Array<{
        version: string;
        edifecs: object;
        edifecsProfilesByVersion: object;
        payerSpecificEdifecsProfilesByVersion: object;
        ace: {
            disabled: boolean;
            rcmId: string;
            overrides: object;
            parameters: object;
        };
        options: {
            GS02: string;
            GS03: string;
            ISA01: string;
            ISA03: string;
            ISA05: string;
            ISA06: string;
            ISA07: string;
            ISA08: string;
            ISA11: string;
            ISA14: string;
            guideline_270_5010A1: string;
            severity_270_5010A1: string;
            guideline_271_5010A1: string;
            severity_271_5010A1: string;
            connectorId: string;
        };
        payerIds: string[];
        settings: object;
    }>;
    inboxes: string[];
    payerAriesId: string;
    submissionModeCd: number;
    batch: string;
    lastUpdateUserId: string;
    lastUpdateFirstName: string;
    lastUpdateLastName: string;
}
export declare class JsonExportService {
    static exportToClientFormat(response: QuestionnaireResponse): ExportedJsonData | null;
    private static exportB2BFormat;
    private static exportWebFormat;
    private static formatOrganizationName;
    private static getFieldValue;
    private static extractUserInfo;
    static isExportSupported(implementationMode: string): boolean;
}
//# sourceMappingURL=jsonExportService.d.ts.map