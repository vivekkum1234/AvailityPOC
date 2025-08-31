"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mockPayerService_1 = require("../services/mockPayerService");
const router = express_1.default.Router();
router.post('/270', async (req, res) => {
    try {
        const { request270, testId } = req.body;
        if (!request270) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: request270'
            });
        }
        console.log(`🏥 Mock Payer: Processing 270 request for test ${testId || 'unknown'}`);
        const result = await mockPayerService_1.MockPayerService.processEligibilityRequest(request270, testId || `test_${Date.now()}`);
        console.log(`✅ Mock Payer: Completed processing - Status: ${result.status}, Time: ${result.responseTime}ms`);
        return res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('❌ Mock Payer Error:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error'
        });
    }
});
router.post('/execute-tests', async (req, res) => {
    try {
        const { testCases, payerEndpoint } = req.body;
        if (!testCases || !Array.isArray(testCases)) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: testCases (array)'
            });
        }
        console.log(`🧪 Executing ${testCases.length} test cases against mock payer`);
        console.log(`🎯 Target endpoint: ${payerEndpoint || 'Mock Payer (Internal)'}`);
        if (testCases.length > 0) {
            console.log('🔍 Debug - First test case structure:', JSON.stringify(testCases[0], null, 2));
        }
        const results = [];
        const startTime = Date.now();
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            console.log(`📋 Executing test ${i + 1}/${testCases.length}: ${testCase.id || testCase.description}`);
            try {
                let request270 = '';
                if (testCase.request270?.payload) {
                    request270 = testCase.request270.payload;
                }
                else if (testCase.payload && testCase.type === '270') {
                    request270 = testCase.payload;
                }
                else {
                    console.error('❌ Test case structure:', JSON.stringify(testCase, null, 2));
                    throw new Error('No 270 request found in test case');
                }
                const result = await mockPayerService_1.MockPayerService.processEligibilityRequest(request270, testCase.id || `test_${i + 1}`);
                results.push(result);
                console.log(`  ✅ Test ${i + 1} completed: ${result.status} (${result.responseTime}ms)`);
            }
            catch (error) {
                console.log(`  ❌ Test ${i + 1} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                results.push({
                    testId: testCase.id || `test_${i + 1}`,
                    status: 'failed',
                    responseTime: 0,
                    request270: testCase.request270?.payload || testCase.payload || '',
                    validationResults: [{
                            passed: false,
                            rule: 'EXECUTION_ERROR',
                            description: `Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                            severity: 'error'
                        }],
                    errorMessage: 'Test execution failed',
                    executedAt: new Date().toISOString()
                });
            }
        }
        const totalTime = Date.now() - startTime;
        const passedTests = results.filter(r => r.status === 'passed').length;
        const failedTests = results.filter(r => r.status === 'failed').length;
        const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
        console.log(`🎯 Test execution completed:`);
        console.log(`  📊 Total: ${results.length} tests`);
        console.log(`  ✅ Passed: ${passedTests}`);
        console.log(`  ❌ Failed: ${failedTests}`);
        console.log(`  ⏱️  Total time: ${totalTime}ms`);
        console.log(`  📈 Avg response time: ${Math.round(avgResponseTime)}ms`);
        return res.json({
            success: true,
            data: {
                results,
                summary: {
                    totalTests: results.length,
                    passedTests,
                    failedTests,
                    totalExecutionTime: totalTime,
                    averageResponseTime: Math.round(avgResponseTime)
                }
            }
        });
    }
    catch (error) {
        console.error('❌ Test execution error:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Test execution failed'
        });
    }
});
router.get('/status', (req, res) => {
    return res.json({
        success: true,
        data: {
            status: 'operational',
            payerName: 'Aetna (Mock)',
            payerId: '60054',
            supportedTransactions: ['270', '271'],
            environment: 'simulation',
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        }
    });
});
exports.default = router;
//# sourceMappingURL=mockPayer.js.map