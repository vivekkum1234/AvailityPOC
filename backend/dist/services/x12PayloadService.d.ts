import { QuestionnaireResponse } from '../types/questionnaire';
export interface X12Payload {
    type: '270' | '271';
    payload: string;
    segments: X12Segment[];
    metadata: {
        organizationName: string;
        implementationMode: string;
        generatedAt: Date;
        testCase: boolean;
    };
}
export interface X12Segment {
    segmentId: string;
    elements: string[];
    description: string;
}
export declare class X12PayloadService {
    generatePayloads(responses: QuestionnaireResponse): Promise<{
        request270: X12Payload;
        response271: X12Payload;
    }>;
    generate270Request(responses: QuestionnaireResponse): Promise<X12Payload>;
    generate271Response(responses: QuestionnaireResponse): Promise<X12Payload>;
    private buildISASegment;
    private buildGSSegment;
    private extractResponseData;
    private segmentsToX12String;
    private generateControlNumber;
    private getCurrentDate;
    private getCurrentTime;
    validatePayload(payload: X12Payload): {
        isValid: boolean;
        errors: string[];
    };
    generateTestCases(responses: QuestionnaireResponse): Promise<{
        basicEligibility: {
            request270: X12Payload;
            response271: X12Payload;
        };
        memberNotFound: {
            request270: X12Payload;
            response271: X12Payload;
        };
        activeWithBenefits: {
            request270: X12Payload;
            response271: X12Payload;
        };
    }>;
    formatPayloadForDisplay(payload: X12Payload): string;
    generatePayloadSummary(payload: X12Payload): {
        segmentCount: number;
        transactionType: string;
        organizationName: string;
        implementationMode: string;
        keySegments: {
            segment: string;
            description: string;
        }[];
    };
}
//# sourceMappingURL=x12PayloadService.d.ts.map