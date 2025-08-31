export interface ValidationResult {
    passed: boolean;
    rule: string;
    description: string;
    severity: 'error' | 'warning' | 'info';
}
export interface PayerTestResult {
    testId: string;
    status: 'passed' | 'failed';
    responseTime: number;
    request270: string;
    response271?: string;
    validationResults: ValidationResult[];
    errorMessage?: string;
    executedAt: string;
}
export declare class MockPayerService {
    static processEligibilityRequest(request270: string, testId: string): Promise<PayerTestResult>;
    private static validateX12Request;
    private static validateX12Format;
    private static validateBusinessRules;
    private static validateCoreBusinessRules;
    private static validateActiveMemberRules;
    private static validateInactiveMemberRules;
    private static validateMemberNotFoundRules;
    private static validateMemberData;
    private static generate271Response;
    private static generateActiveMemberResponse;
    private static generateInactiveMemberResponse;
    private static generateMemberNotFoundResponse;
}
//# sourceMappingURL=mockPayerService.d.ts.map