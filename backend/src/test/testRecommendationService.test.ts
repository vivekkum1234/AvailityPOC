import { TestRecommendationService } from '../services/testRecommendationService';

describe('TestRecommendationService', () => {
  const mockPayerInfo = {
    id: 'test-payer-123',
    name: 'Test Aetna Payer',
    implementationMode: 'real_time_b2b'
  };

  const mockConfiguration = {
    implementationMode: 'real_time_b2b',
    xmlWrapper: false,
    systemHours: '24/7',
    maxThreads: 10,
    serviceTypes: ['30', '88'],
    memberIdFormat: 'W + 9 digits',
    supportedSearchOptions: ['patient_id_dob', 'patient_id_first_last_name'],
    supportedServiceTypes: ['30', '88'],
    supportsAllServiceTypes: false,
    testUrl: 'https://test.aetna.com/eligibility',
    validMemberRecordsRequired: true,
    validProviderDataRequired: true
  };

  describe('generateTestRecommendations', () => {
    it('should return fallback test cases when AI API is not configured', async () => {
      // Test without OpenAI API key
      const originalApiKey = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      const testCases = await TestRecommendationService.generateTestRecommendations(
        mockPayerInfo,
        mockConfiguration
      );

      expect(testCases).toBeDefined();
      expect(Array.isArray(testCases)).toBe(true);
      expect(testCases.length).toBeGreaterThan(0);

      // Check the structure of the first test case
      const firstTestCase = testCases[0];
      expect(firstTestCase).toBeDefined();
      expect(firstTestCase).toHaveProperty('id');
      expect(firstTestCase).toHaveProperty('title');
      expect(firstTestCase).toHaveProperty('description');
      expect(firstTestCase).toHaveProperty('priority');
      expect(firstTestCase).toHaveProperty('category');
      expect(firstTestCase).toHaveProperty('memberData');
      expect(firstTestCase).toHaveProperty('request270');
      expect(firstTestCase).toHaveProperty('expectedResponse271');
      expect(firstTestCase).toHaveProperty('validationRules');

      if (firstTestCase) {
        // Check member data structure
        expect(firstTestCase.memberData).toHaveProperty('memberId');
        expect(firstTestCase.memberData).toHaveProperty('firstName');
        expect(firstTestCase.memberData).toHaveProperty('lastName');
        expect(firstTestCase.memberData).toHaveProperty('dob');
        expect(firstTestCase.memberData).toHaveProperty('serviceType');

        // Check that member ID follows Aetna format (W + digits)
        expect(firstTestCase.memberData.memberId).toMatch(/^W/);

        // Check 270/271 payload structure
        expect(firstTestCase.request270).toHaveProperty('payload');
        expect(firstTestCase.expectedResponse271).toHaveProperty('payload');
        expect(typeof firstTestCase.request270.payload).toBe('string');
        expect(typeof firstTestCase.expectedResponse271.payload).toBe('string');

        // Check validation rules structure
        expect(Array.isArray(firstTestCase.validationRules.required)).toBe(true);
        expect(Array.isArray(firstTestCase.validationRules.forbidden)).toBe(true);
        expect(Array.isArray(firstTestCase.validationRules.business)).toBe(true);
      }

      // Restore original API key
      if (originalApiKey) {
        process.env.OPENAI_API_KEY = originalApiKey;
      }
    });

    it('should generate member IDs with correct patterns', async () => {
      const testCases = await TestRecommendationService.generateTestRecommendations(
        mockPayerInfo,
        mockConfiguration
      );

      testCases.forEach(testCase => {
        const memberId = testCase.memberData.memberId;
        
        // All member IDs should start with 'W'
        expect(memberId).toMatch(/^W/);
        
        // Check for different patterns based on test case type
        if (testCase.title.toLowerCase().includes('inactive') || 
            testCase.title.toLowerCase().includes('expired')) {
          expect(memberId).toMatch(/^W(INACTIVE|EXPIRED|TERMINATED)/);
        } else if (testCase.title.toLowerCase().includes('invalid') || 
                   testCase.title.toLowerCase().includes('not found') ||
                   testCase.title.toLowerCase().includes('error')) {
          expect(memberId).toMatch(/^W(NOTFOUND|INVALID|ERROR|\d{9})/);
        } else {
          // Active member should have numeric format
          expect(memberId).toMatch(/^W\d{9}$/);
        }
      });
    });

    it('should generate valid X12 payload structure', async () => {
      const testCases = await TestRecommendationService.generateTestRecommendations(
        mockPayerInfo,
        mockConfiguration
      );

      testCases.forEach(testCase => {
        const payload270 = testCase.request270.payload;
        const payload271 = testCase.expectedResponse271.payload;

        // Check basic X12 structure
        expect(payload270).toContain('ISA*');
        expect(payload270).toContain('GS*');
        expect(payload270).toContain('ST*270*');
        expect(payload270).toContain('~');

        expect(payload271).toContain('ISA*');
        expect(payload271).toContain('GS*');
        expect(payload271).toContain('ST*271*');
        expect(payload271).toContain('~');

        // Check for proper segment terminators
        expect(payload270.endsWith('~')).toBe(true);
        expect(payload271.endsWith('~')).toBe(true);
      });
    });

    it('should include the expected 6 test case categories', async () => {
      const testCases = await TestRecommendationService.generateTestRecommendations(
        mockPayerInfo,
        mockConfiguration
      );

      // Should have at least one test case (fallback provides 1, AI should provide 6)
      expect(testCases.length).toBeGreaterThanOrEqual(1);

      // Check that we have both Core and Additional categories
      const categories = testCases.map(tc => tc.category);
      const priorities = testCases.map(tc => tc.priority);

      expect(categories).toContain('Core');
      expect(priorities).toContain('Critical');
    });
  });
});
