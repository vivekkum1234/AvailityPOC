export interface TestRecommendation {
    id: string;
    title: string;
    description: string;
    priority: 'Critical' | 'Medium' | 'Low';
    category: 'Core Functionality' | 'Additional Testing';
    estimatedDuration: string;
}
export interface TestCase {
    id: string;
    title: string;
    description: string;
    priority: 'Critical' | 'Medium' | 'Low';
    category: 'Core' | 'Additional';
    memberData: {
        memberId: string;
        firstName: string;
        lastName: string;
        dob: string;
        serviceType: string;
    };
    request270: {
        payload: string;
        segments: X12Segment[];
    };
    expectedResponse271: {
        payload: string;
        segments: X12Segment[];
    };
    validationRules: {
        required: string[];
        forbidden: string[];
        business: string[];
    };
}
export interface X12Segment {
    segment: string;
    elements: string[];
    description: string;
}
export interface PayerInfo {
    id: string;
    name: string;
    implementationMode: string;
}
export interface PayerConfiguration {
    implementationMode: string;
    xmlWrapper?: boolean | undefined;
    systemHours?: string | undefined;
    maxThreads?: number | undefined;
    serviceTypes?: string[] | undefined;
    memberIdFormat?: string | undefined;
    supportedSearchOptions?: string[] | undefined;
    supportedServiceTypes?: string[] | undefined;
    supportsAllServiceTypes?: boolean | undefined;
    testUrl?: string | undefined;
    validMemberRecordsRequired?: boolean | undefined;
    validProviderDataRequired?: boolean | undefined;
    [key: string]: any;
}
export declare class TestRecommendationService {
    private static readonly AI_API_URL;
    private static readonly AI_API_KEY;
    private static readonly USE_SIMULATED_AI;
    private static simulateAIProcessing;
    private static getProvenTestTemplates;
    private static generateMemberId;
    static generateTestRecommendations(payerInfo: PayerInfo, configuration: PayerConfiguration): Promise<TestRecommendation[]>;
    private static createAIPrompt;
    private static callOptimizedAI;
    private static callAI;
    private static parseAIResponse;
    private static generateDefault270;
    private static generateDefault271;
    private static getFallbackTestCases;
    static generateTestData(payerInfo: PayerInfo, configuration: PayerConfiguration, selectedTestCases: string[]): Promise<TestCase[]>;
    private static createOptimizedTestDataPrompt;
    private static createTestDataPrompt;
    private static validateX12Payload;
    private static parseTestDataResponse;
    private static getTemplateBasedTestData;
    private static createTemplateBasedTestCase;
    private static createTemplateBasedTestCaseByType;
    private static determineTestCaseType;
    private static createActiveTestCase;
    private static createInactiveTestCase;
    private static createNotFoundTestCase;
    private static getFallbackTestData;
}
//# sourceMappingURL=testRecommendationService.d.ts.map