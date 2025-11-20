import dotenv from 'dotenv';
import { supabase } from './supabaseService';
dotenv.config();

// Types for test recommendations (Step 1)
export interface TestRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium';
  category: 'Core Functionality' | 'Additional Testing' | 'Edge Cases' | 'Performance';
  estimatedDuration: string;
  hasPreConfiguredData: boolean;
  dataSource: 'predefined' | 'ai-generated';
  implementationSpecific: boolean;
}

// Types for detailed test data (Step 3)
export interface TestCase {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium';
  category: 'Core' | 'Additional';
  memberData: {
    memberId: string;
    firstName: string;
    lastName: string;
    dob: string;
    serviceType: string;
  };
  syntheticData?: {
    senderId: string;
    receiverId: string;
    providerName: string;
    providerNPI: string;
    controlNumber: string;
    transactionDate: string;
    transactionTime: string;
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
  organizationId: string;
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

export class TestRecommendationService {
  private static readonly AI_API_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
  private static readonly AI_API_KEY = process.env.OPENAI_API_KEY;

  static {
    // Debug API key loading
    console.log('🔑 TestRecommendationService: OpenAI API Key status:',
      TestRecommendationService.AI_API_KEY ? 'Loaded' : 'Missing');
    if (!TestRecommendationService.AI_API_KEY) {
      console.warn('⚠️ OPENAI_API_KEY environment variable not set');
    }
  }

  // Use real AI for dynamic test case generation
  private static readonly USE_SIMULATED_AI = false;

  /**
   * Simulate AI processing with realistic timing (10-12 seconds)
   */
  private static async simulateAIProcessing(duration: number): Promise<void> {
    console.log(`🤖 Simulating AI processing for ${Math.round(duration/1000)}s...`);
    const startTime = Date.now();
    await new Promise(resolve => setTimeout(resolve, duration));
    const actualTime = Date.now() - startTime;
    console.log(`✅ AI processing simulation complete (${Math.round(actualTime/1000)}s)`);
  }

  /**
   * Extract key configuration details for AI context
   */
  private static extractConfigurationContext(configuration: PayerConfiguration): string {
    const context = [];

    // Implementation mode specific details
    if (configuration.implementationMode) {
      context.push(`Implementation Mode: ${configuration.implementationMode}`);
    }

    // Service types supported
    if (configuration.supportedServiceTypes && configuration.supportedServiceTypes.length > 0) {
      context.push(`Supported Service Types: ${configuration.supportedServiceTypes.join(', ')}`);
    } else if (configuration.supportsAllServiceTypes) {
      context.push(`Supports All Service Types: Yes`);
    }

    // Member ID format requirements
    if (configuration.memberIdFormat) {
      context.push(`Member ID Format: ${configuration.memberIdFormat}`);
    }

    // Search options
    if (configuration.supportedSearchOptions && configuration.supportedSearchOptions.length > 0) {
      context.push(`Supported Search Options: ${configuration.supportedSearchOptions.join(', ')}`);
    }

    // Test environment details
    if (configuration.testUrl) {
      context.push(`Test Environment: Available`);
    }

    // Data requirements
    if (configuration.validMemberRecordsRequired) {
      context.push(`Valid Member Records Required: Yes`);
    }
    if (configuration.validProviderDataRequired) {
      context.push(`Valid Provider Data Required: Yes`);
    }

    // Additional configuration details
    const otherConfig = Object.entries(configuration)
      .filter(([key, value]) =>
        !['implementationMode', 'supportedServiceTypes', 'supportsAllServiceTypes',
          'memberIdFormat', 'supportedSearchOptions', 'testUrl',
          'validMemberRecordsRequired', 'validProviderDataRequired'].includes(key)
        && value !== undefined && value !== null && value !== ''
      )
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .slice(0, 5); // Limit to avoid overly long context

    context.push(...otherConfig);

    return context.length > 0 ? context.join('\n- ') : 'Standard configuration';
  }

  /**
   * Get proven test templates from data.md for AI reference
   */
  private static getProvenTestTemplates(): string {
    return `
TEST CASE 1: Active Member – General Health Benefits (Critical)

270 request:
ISA*00*          *00*          *ZZ*030240928     *ZZ*6686CBAF-048001*250830*1405*^*00501*000000101*0*T*:~
GS*HS*030240928*6686CBAF-048001*20250830*1405*101*X*005010X279A1~
ST*270*000101*005010X279A1~
BHT*0022*13*ELIG-REQ-000101*20250830*1405~
HL*1**20*1~
NM1*PR*2*AETNA*****PI*60054~
HL*2*1*21*1~
NM1*1P*2*GREEN VALLEY FAMILY CLINIC*****XX*1234567890~
HL*3*2*22*0~
TRN*1*ELIG-20250830-000101*9876543210~
NM1*IL*1*DOE*JOHN****MI*W883449464~
DMG*D8*19850115*M~
DTP*291*D8*20250830~
EQ*30~
SE*13*000101~
GE*1*101~
IEA*1*000000101~

271 response:
ISA*00*          *00*          *ZZ*6686CBAF-048001*ZZ*030240928     *250830*1405*^*00501*000000101*0*T*:~
GS*HB*6686CBAF-048001*030240928*20250830*1405*101*X*005010X279A1~
ST*271*000101*005010X279A1~
BHT*0022*11*ELIG-REQ-000101*20250830*1405*CH~
HL*1**20*1~
NM1*PR*2*AETNA*****PI*60054~
HL*2*1*21*1~
NM1*1P*2*GREEN VALLEY FAMILY CLINIC*****XX*1234567890~
HL*3*2*22*0~
TRN*2*ELIG-20250830-000101*9876543210~
NM1*IL*1*DOE*JOHN****MI*W883449464~
DTP*291*D8*20250830~
EB*1*IND*30****1~
DTP*356*D8*20240101~
MSG*Active Coverage for General Health Benefits. Plan: Aetna Choice POS II.~
SE*13*000101~
GE*1*101~
IEA*1*000000101~

TEST CASE 2: Inactive Member – Coverage Verification (Critical)

270 request:
ISA*00*          *00*          *ZZ*030240928     *ZZ*6686CBAF-048001*250830*1410*^*00501*000000102*0*T*:~
GS*HS*030240928*6686CBAF-048001*20250830*1410*102*X*005010X279A1~
ST*270*000102*005010X279A1~
BHT*0022*13*ELIG-REQ-000102*20250830*1410~
HL*1**20*1~
NM1*PR*2*AETNA*****PI*60054~
HL*2*1*21*1~
NM1*1P*2*RIVERBEND INTERNAL MEDICINE*****XX*2233445566~
HL*3*2*22*0~
TRN*1*ELIG-20250830-000102*9876543210~
NM1*IL*1*SMITH*JANE****MI*W772233445~
DMG*D8*19890322*F~
DTP*291*D8*20250830~
EQ*30~
SE*13*000102~
GE*1*102~
IEA*1*000000102~

271 response:
ISA*00*          *00*          *ZZ*6686CBAF-048001*ZZ*030240928     *250830*1410*^*00501*000000102*0*T*:~
GS*HB*6686CBAF-048001*030240928*20250830*1410*102*X*005010X279A1~
ST*271*000102*005010X279A1~
BHT*0022*11*ELIG-REQ-000102*20250830*1410*CH~
HL*1**20*1~
NM1*PR*2*AETNA*****PI*60054~
HL*2*1*21*1~
NM1*1P*2*RIVERBEND INTERNAL MEDICINE*****XX*2233445566~
HL*3*2*22*0~
TRN*2*ELIG-20250830-000102*9876543210~
NM1*IL*1*SMITH*JANE****MI*W772233445~
DTP*291*D8*20250830~
EB*6*IND*30~
DTP*356*D8*20240101~
DTP*357*D8*20240731~
MSG*Coverage terminated for General Health Benefits as of 2024-07-31.~
SE*14*000102~
GE*1*102~
IEA*1*000000102~

TEST CASE 3: Member Not Found – Error Handling (Critical)

270 request:
ISA*00*          *00*          *ZZ*030240928     *ZZ*6686CBAF-048001*250830*1415*^*00501*000000103*0*T*:~
GS*HS*030240928*6686CBAF-048001*20250830*1415*103*X*005010X279A1~
ST*270*000103*005010X279A1~
BHT*0022*13*ELIG-REQ-000103*20250830*1415~
HL*1**20*1~
NM1*PR*2*AETNA*****PI*60054~
HL*2*1*21*1~
NM1*1P*2*SUMMIT FAMILY MEDICINE*****XX*4455667788~
HL*3*2*22*0~
TRN*1*ELIG-20250830-000103*9876543210~
NM1*IL*1*BROWN*ALEX****MI*W999999999~
DMG*D8*19911111*U~
DTP*291*D8*20250830~
EQ*30~
SE*13*000103~
GE*1*103~
IEA*1*000000103~

271 response:
ISA*00*          *00*          *ZZ*6686CBAF-048001*ZZ*030240928     *250830*1415*^*00501*000000103*0*T*:~
GS*HB*6686CBAF-048001*030240928*20250830*1415*103*X*005010X279A1~
ST*271*000103*005010X279A1~
BHT*0022*11*ELIG-REQ-000103*20250830*1415*CH~
HL*1**20*1~
NM1*PR*2*AETNA*****PI*60054~
HL*2*1*21*1~
NM1*1P*2*SUMMIT FAMILY MEDICINE*****XX*4455667788~
HL*3*2*22*0~
TRN*2*ELIG-20250830-000103*9876543210~
NM1*IL*1*BROWN*ALEX****MI*W999999999~
AAA*Y*79*ZZ*Member not found / invalid member ID~
SE*11*000103~
GE*1*103~
IEA*1*000000103~
`;
  }

  /**
   * Generate member ID based on Aetna format patterns
   */
  private static generateMemberId(scenario: string): string {
    const patterns = {
      active: ['W883449464', 'W123456789', 'W987654321', 'W555123456'],
      inactive: ['W772233445', 'WINACTIVE002', 'WEXPIRED123', 'WTERMINATED1'],
      invalid: ['W999999999', 'WINVALID001', 'W000000000', 'WERROR12345']
    };

    if (scenario.includes('inactive') || scenario.includes('expired')) {
      return patterns.inactive[Math.floor(Math.random() * patterns.inactive.length)] || 'W772233445';
    } else if (scenario.includes('invalid') || scenario.includes('not found') || scenario.includes('error')) {
      return patterns.invalid[Math.floor(Math.random() * patterns.invalid.length)] || 'W999999999';
    } else {
      return patterns.active[Math.floor(Math.random() * patterns.active.length)] || 'W883449464';
    }
  }

  /**
   * Get realistic provider name based on index
   */
  private static getRealisticProviderName(index: number): string {
    const providerNames = [
      'RIVERSIDE MEDICAL CENTER',
      'FAMILY HEALTH CLINIC',
      'DOWNTOWN URGENT CARE',
      'GREEN VALLEY FAMILY CLINIC',
      'RIVERBEND INTERNAL MEDICINE',
      'CENTRAL CITY MEDICAL GROUP',
      'NORTHSIDE FAMILY PRACTICE',
      'WESTSIDE URGENT CARE',
      'EASTSIDE MEDICAL CENTER',
      'SOUTHSIDE HEALTH CLINIC'
    ];
    return providerNames[index % providerNames.length] || 'FAMILY HEALTH CLINIC';
  }

  /**
   * Get realistic provider NPI based on index
   */
  private static getRealisticProviderNPI(index: number): string {
    const providerNPIs = [
      '1234567890',
      '9876543210',
      '5555666777',
      '2233445566',
      '7788990011',
      '3344556677',
      '8899001122',
      '4455667788',
      '9900112233',
      '5566778899'
    ];
    return providerNPIs[index % providerNPIs.length] || '1234567890';
  }

  /**
   * Get realistic first name based on index
   */
  private static getRealisticFirstName(index: number): string {
    const firstNames = [
      'JOHN',
      'JANE',
      'MICHAEL',
      'SARAH',
      'DAVID',
      'LISA',
      'ROBERT',
      'MARY',
      'JAMES',
      'JENNIFER'
    ];
    return firstNames[index % firstNames.length] || 'JOHN';
  }

  /**
   * Get realistic last name based on index
   */
  private static getRealisticLastName(index: number): string {
    const lastNames = [
      'DOE',
      'SMITH',
      'JOHNSON',
      'WILLIAMS',
      'BROWN',
      'JONES',
      'GARCIA',
      'MILLER',
      'DAVIS',
      'RODRIGUEZ'
    ];
    return lastNames[index % lastNames.length] || 'DOE';
  }

  /**
   * Generate test recommendations using AI (Step 1)
   * Returns 50 test cases: 6 predefined + 44 AI-generated
   */
  static async generateTestRecommendations(
    payerInfo: PayerInfo,
    configuration: PayerConfiguration,
    questionnaireResponses: Record<string, any>
  ): Promise<{
    recommendations: TestRecommendation[];
    totalCount: number;
    predefinedCount: number;
    aiGeneratedCount: number;
  }> {
    console.log('🎯 Starting test recommendations generation (50 cases)...');
    console.log('🔑 OpenAI API key status:', this.AI_API_KEY ? 'Available' : 'Missing');

    try {
      // STEP 1: Get 6 predefined test cases instantly
      const predefinedCases = this.getPredefinedTestCases(payerInfo, configuration);
      console.log(`✅ Generated ${predefinedCases.length} predefined test cases (instant)`);

      // STEP 2: Generate 44 AI test cases in parallel batches
      const startTime = Date.now();
      const aiGeneratedCases = await this.generateAITestCasesInParallel(
        payerInfo,
        configuration,
        questionnaireResponses,
        44  // Generate 44 additional cases
      );
      const endTime = Date.now();
      console.log(`✅ Generated ${aiGeneratedCases.length} AI test cases in ${endTime - startTime}ms`);

      // STEP 3: Sort AI-generated cases by priority (Critical > High > Medium)
      const priorityOrder = { 'Critical': 1, 'High': 2, 'Medium': 3 };
      const sortedAICases = aiGeneratedCases.sort((a, b) => {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      // STEP 4: Combine results (first 6 predefined, then sorted AI cases)
      const allRecommendations = [...predefinedCases, ...sortedAICases];
      console.log(`✅ Total: ${allRecommendations.length} test recommendations (sorted by priority)`);

      return {
        recommendations: allRecommendations,
        totalCount: allRecommendations.length,
        predefinedCount: predefinedCases.length,
        aiGeneratedCount: aiGeneratedCases.length
      };
    } catch (error) {
      console.error('❌ Error generating test recommendations:', error);
      console.error('🔍 Error details:', error instanceof Error ? error.message : String(error));
      // Return only predefined test cases if AI fails
      console.log('🔄 Falling back to predefined test recommendations only');
      const predefinedCases = this.getPredefinedTestCases(payerInfo, configuration);
      return {
        recommendations: predefinedCases,
        totalCount: predefinedCases.length,
        predefinedCount: predefinedCases.length,
        aiGeneratedCount: 0
      };
    }
  }

  /**
   * Get 6 predefined test cases with pre-configured data (instant)
   */
  private static getPredefinedTestCases(
    payerInfo: PayerInfo,
    configuration: PayerConfiguration
  ): TestRecommendation[] {
    return [
      {
        id: 'TC_001',
        title: 'Active Member - General Health Benefits',
        description: 'Test active member eligibility verification for general health benefits',
        priority: 'Critical',
        category: 'Core Functionality',
        estimatedDuration: '2 minutes',
        hasPreConfiguredData: true,
        dataSource: 'predefined',
        implementationSpecific: false
      },
      {
        id: 'TC_002',
        title: 'Inactive Member - Coverage Verification',
        description: 'Test inactive/expired member response handling',
        priority: 'Critical',
        category: 'Core Functionality',
        estimatedDuration: '2 minutes',
        hasPreConfiguredData: true,
        dataSource: 'predefined',
        implementationSpecific: false
      },
      {
        id: 'TC_003',
        title: 'Member Not Found - Error Handling',
        description: 'Test invalid member ID error handling and response codes',
        priority: 'Critical',
        category: 'Core Functionality',
        estimatedDuration: '1 minute',
        hasPreConfiguredData: true,
        dataSource: 'predefined',
        implementationSpecific: false
      },
      {
        id: 'TC_004',
        title: 'Service Type 88 Coverage (Pharmacy)',
        description: 'Test pharmacy service type coverage verification',
        priority: 'Critical',
        category: 'Core Functionality',
        estimatedDuration: '3 minutes',
        hasPreConfiguredData: true,
        dataSource: 'predefined',
        implementationSpecific: false
      },
      {
        id: 'TC_005',
        title: 'Member ID Format Test',
        description: 'Test member ID format validation and requirements',
        priority: 'Critical',
        category: 'Core Functionality',
        estimatedDuration: '2 minutes',
        hasPreConfiguredData: true,
        dataSource: 'predefined',
        implementationSpecific: false
      },
      {
        id: 'TC_006',
        title: 'Coverage Level Test (Family vs Individual)',
        description: 'Test family vs individual coverage level verification',
        priority: 'Critical',
        category: 'Core Functionality',
        estimatedDuration: '2 minutes',
        hasPreConfiguredData: true,
        dataSource: 'predefined',
        implementationSpecific: false
      }
    ];
  }

  /**
   * Generate AI test cases in parallel batches
   */
  private static async generateAITestCasesInParallel(
    payerInfo: PayerInfo,
    configuration: PayerConfiguration,
    questionnaireResponses: Record<string, any>,
    totalCases: number
  ): Promise<TestRecommendation[]> {
    const batchSize = 9;  // 9 cases per batch
    const numBatches = 5;  // 5 batches for 44 cases (9+9+5+9+12)

    // Define batch configurations with specific test areas to avoid duplicates
    const batchConfigs = [
      {
        startIndex: 7,
        count: 9,
        priority: 'Critical',
        focus: 'Implementation mode specific core tests',
        category: 'Core Functionality',
        specificAreas: [
          'Threading/concurrency limits (if real-time B2B)',
          'Timeout handling (if real-time B2B)',
          'XML wrapper validation (if required)',
          'System hours validation (if specified)',
          'Session management (if real-time web)',
          'File naming conventions (if EDI batch)',
          'Batch aggregation schedules (if EDI batch)',
          'ISA/GS envelope validation',
          'Character set validation (uppercase/spaces/extended)'
        ]
      },
      {
        startIndex: 16,
        count: 9,
        priority: 'Critical',
        focus: 'Search options and service types',
        category: 'Core Functionality',
        specificAreas: [
          'Each supported search option (Member ID, SSN, DOB+Name, etc.)',
          'Primary service types from questionnaire',
          'Service type combinations',
          'Search option validation',
          'Invalid search option handling',
          'Service type code validation',
          'Coverage level testing (IND vs FAM)',
          'Dependent coverage scenarios',
          'Multi-service type requests'
        ]
      },
      {
        startIndex: 25,
        count: 5,
        priority: 'Critical',
        focus: 'Member ID format and enveloping',
        category: 'Core Functionality',
        specificAreas: [
          'Member ID format validation (based on questionnaire)',
          'Member ID length validation',
          'Member ID prefix/suffix requirements',
          'Invalid member ID format handling',
          'Payer-specific ID requirements'
        ]
      },
      {
        startIndex: 30,
        count: 9,
        priority: 'High',
        focus: 'Additional service types and configurations',
        category: 'Core Functionality',
        specificAreas: [
          'Secondary service types from questionnaire',
          'Specialty service types (DME, Vision, Dental, etc.)',
          'Date range validations',
          'Provider type variations',
          'Subscriber vs dependent scenarios',
          'Multiple dependent scenarios',
          'Coordination of benefits',
          'Prior authorization requirements',
          'Network status validation'
        ]
      },
      {
        startIndex: 39,
        count: 12,
        priority: 'Medium',
        focus: 'Edge cases and validation',
        category: 'Additional Testing',
        specificAreas: [
          'Missing required fields',
          'Invalid date formats',
          'Future dates validation',
          'Past dates validation',
          'Special characters in names',
          'Maximum field length testing',
          'Minimum field length testing',
          'Invalid provider NPI',
          'Invalid payer ID',
          'Malformed segments',
          'Missing segments',
          'Duplicate segments'
        ]
      }
    ];

    // Create batch prompts with specific areas
    const batchPrompts = batchConfigs.map((config, index) =>
      this.createEnhancedAIPrompt(
        payerInfo,
        configuration,
        questionnaireResponses,
        config.startIndex,
        config.count,
        config.priority,
        config.focus,
        config.category,
        index,
        config.specificAreas
      )
    );

    console.log(`🚀 Launching ${numBatches} parallel AI batch requests...`);
    const batchStartTime = Date.now();

    // Execute all batches in parallel
    const batchResults = await Promise.all(
      batchPrompts.map((prompt, index) => {
        console.log(`📤 Batch ${index + 1}: Generating ${batchConfigs[index].count} test cases...`);
        return this.callAIOptimized(prompt);
      })
    );

    const batchTotalTime = Date.now() - batchStartTime;
    console.log(`⏱️ All ${numBatches} batches completed in ${batchTotalTime}ms (${(batchTotalTime/1000).toFixed(2)}s)`);

    // Combine and parse results
    const allRecommendations: TestRecommendation[] = [];
    batchResults.forEach((result, batchIndex) => {
      try {
        const parsed = this.parseAIResponse(result, payerInfo, true);
        console.log(`✅ Batch ${batchIndex + 1}: Parsed ${parsed.length} test cases (expected: ${batchConfigs[batchIndex].count})`);
        if (parsed.length < batchConfigs[batchIndex].count) {
          console.warn(`⚠️ Batch ${batchIndex + 1}: Got ${parsed.length} test cases, expected ${batchConfigs[batchIndex].count}`);
          console.warn(`⚠️ Raw AI response length: ${result.length} characters`);
        }
        allRecommendations.push(...parsed);
      } catch (error) {
        console.error(`❌ Batch ${batchIndex + 1}: Failed to parse`, error);
        console.error(`❌ Raw response: ${result.substring(0, 500)}...`);
      }
    });

    console.log(`📊 Total AI-generated test cases: ${allRecommendations.length} (expected: 44)`);
    return allRecommendations;
  }

  /**
   * Create enhanced AI prompt with full questionnaire context
   */
  private static createEnhancedAIPrompt(
    payerInfo: PayerInfo,
    configuration: PayerConfiguration,
    questionnaireResponses: Record<string, any>,
    startIndex: number,
    numCases: number,
    priorityGuidance: string,
    focusArea: string,
    categoryGuidance: string,
    batchNumber: number,
    specificAreas: string[] = []
  ): string {
    const implementationGuidance = this.getImplementationModeGuidance(configuration.implementationMode);

    // Extract only relevant questionnaire fields to reduce prompt size
    const relevantConfig = {
      implementationMode: configuration.implementationMode,
      xmlWrapper: configuration.xmlWrapper,
      systemHours: configuration.systemHours,
      maxThreads: configuration.maxThreads,
      supportedSearchOptions: configuration.supportedSearchOptions,
      supportedServiceTypes: configuration.supportedServiceTypes,
      memberIdFormat: configuration.memberIdFormat,
      validMemberRecordsRequired: configuration.validMemberRecordsRequired,
      // Add specific envelope fields if needed
      isa08: questionnaireResponses['isa08-receiver-id'],
      payerName: questionnaireResponses['payer-name'],
      payerId: questionnaireResponses['payer-id']
    };

    return `
Generate ${numCases} UNIQUE implementation-specific test case recommendations for ${payerInfo.name}.

IMPLEMENTATION MODE: ${configuration.implementationMode}

RELEVANT CONFIGURATION:
${JSON.stringify(relevantConfig, null, 2)}

KEY CONFIGURATION:
- Implementation Mode: ${configuration.implementationMode}
- XML Wrapper: ${configuration.xmlWrapper ? 'Required' : 'Not Required'}
- System Hours: ${configuration.systemHours || '24/7'}
- Max Threads: ${configuration.maxThreads || 'Not specified'}
- Supported Search Options: ${configuration.supportedSearchOptions?.join(', ') || 'All'}
- Supported Service Types: ${configuration.supportedServiceTypes?.join(', ') || 'All'}
- Member ID Format: ${configuration.memberIdFormat || 'Not specified'}
- Valid Member Records Required: ${configuration.validMemberRecordsRequired ? 'Yes' : 'No'}

BATCH FOCUS: ${focusArea}
PRIORITY GUIDANCE: ${priorityGuidance}
CATEGORY: ${categoryGuidance}

SPECIFIC TEST AREAS FOR THIS BATCH (Generate ONE test case for EACH area):
${specificAreas.map((area, i) => `${i + 1}. ${area}`).join('\n')}

${implementationGuidance}

CRITICAL INSTRUCTIONS TO AVOID DUPLICATES:
1. Generate EXACTLY ONE test case for EACH specific area listed above
2. Each test case MUST be UNIQUE - no duplicate scenarios
3. Base test scenarios ONLY on the questionnaire responses provided
4. If a feature is NOT in the questionnaire, DO NOT generate a test for it
5. For example:
   - If XML wrapper is NOT required, skip XML wrapper tests
   - If max threads is NOT specified, skip threading tests
   - If only certain search options are supported, test ONLY those
   - If only certain service types are supported, test ONLY those
6. DO NOT generate generic "Test Service Type XX" scenarios
7. Make each test scenario implementation-specific and unique
8. Test titles should clearly describe the SPECIFIC scenario being tested
9. ALL Critical and High priority tests MUST be in "Core Functionality" category
10. ONLY Medium priority tests can be in "Additional Testing" category

EXAMPLES OF GOOD vs BAD TEST TITLES:
❌ BAD: "Test Service Type 30" (too generic)
✅ GOOD: "Verify Active Coverage for Service Type 30 (General Health) with Member ID Format Validation"

❌ BAD: "Concurrent Request Handling" (duplicate-prone)
✅ GOOD: "Verify System Handles ${configuration.maxThreads || 'N/A'} Concurrent Threads as per Configuration"

❌ BAD: "Test Member ID Format" (vague)
✅ GOOD: "Validate Member ID Format: ${configuration.memberIdFormat || 'Standard'} - Reject Invalid Formats"

Return JSON array with ${numCases} UNIQUE test cases starting from TC_${String(startIndex).padStart(3, '0')}:
[{
  "id": "TC_${String(startIndex).padStart(3, '0')}",
  "title": "Specific, unique, implementation-based test title",
  "description": "Detailed description based on questionnaire responses and specific test area",
  "category": "${categoryGuidance}",
  "priority": "${priorityGuidance}",
  "estimatedDuration": "X minutes"
}]

REMEMBER: Each test case must be UNIQUE and based on the specific areas listed above!
`;
  }

  /**
   * Get implementation mode specific guidance
   */
  private static getImplementationModeGuidance(mode: string): string {
    const guidance: Record<string, string> = {
      'real_time_b2b': `
REAL-TIME B2B MODE - ONLY test features that are CONFIGURED in the questionnaire:
- If max threads is specified → Test concurrent request handling up to that limit
- If timeout is specified → Test timeout handling with that specific value
- If XML wrapper is required → Test XML wrapper structure validation
- If system hours are specified → Test system availability during those hours
- Always test: Synchronous response validation, error handling
- DO NOT test features that are not configured in the questionnaire
`,
      'real_time_web': `
REAL-TIME WEB MODE - ONLY test features that are CONFIGURED in the questionnaire:
- If session timeout is specified → Test session management with that timeout
- If specific authentication is required → Test that authentication method
- Always test: Web service endpoint availability, response validation
- DO NOT test features that are not configured in the questionnaire
`,
      'edi_batch': `
EDI BATCH MODE - ONLY test features that are CONFIGURED in the questionnaire:
- If file naming convention is specified → Test that specific naming convention
- If aggregation schedule is specified → Test compliance with that schedule
- If file size limits are specified → Test those specific limits
- Always test: Batch file structure validation, error handling
- DO NOT test features that are not configured in the questionnaire
`
    };

    return guidance[mode] || '';
  }

  /**
   * Call AI API with optimized parameters for faster response (GPT-4-turbo)
   */
  private static async callAIOptimized(prompt: string): Promise<string> {
    if (!this.AI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Create fetch options with optimized parameters for faster response
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.AI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Faster and cheaper model for test generation
        messages: [
          {
            role: 'system',
            content: 'You are an expert in X12 EDI 270/271 healthcare transactions. Generate UNIQUE, implementation-specific test scenarios based ONLY on the actual payer configuration provided. Do NOT generate duplicate test scenarios. Each test must be distinct and based on specific questionnaire responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000, // Increased to ensure all test cases are generated
        temperature: 0.3  // Balanced for quality and consistency
      })
    };

    // Handle SSL certificate issues in development
    if (process.env.NODE_ENV === 'development') {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }

    const startTime = Date.now();
    try {
      console.log('⏱️ Starting AI API call...');
      const response = await fetch(this.AI_API_URL, fetchOptions);
      const fetchTime = Date.now() - startTime;
      console.log(`⏱️ AI API fetch completed in ${fetchTime}ms`);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('🚨 OpenAI API Error Response:', errorBody);
        throw new Error(`AI API error: ${response.status} ${response.statusText} - ${errorBody}`);
      }

      const data = await response.json() as any;
      const totalTime = Date.now() - startTime;
      console.log(`⏱️ AI API call completed in ${totalTime}ms total`);
      return data.choices?.[0]?.message?.content || '';
    } finally {
      // Restore SSL verification
      if (process.env.NODE_ENV === 'development') {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
      }
    }
  }

  /**
   * Call AI API (original method for test data generation - optimized)
   */
  private static async callAI(prompt: string): Promise<string> {
    if (!this.AI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Create fetch options with SSL handling
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.AI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Faster model for test data generation
        messages: [
          {
            role: 'system',
            content: 'You are an expert in X12 EDI healthcare transactions and payer testing. Generate comprehensive test cases with complete 270/271 payloads and validation rules.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000, // Reduced for faster response while still allowing complete payloads
        temperature: 0.3
      })
    };

    // Handle SSL certificate issues in development
    if (process.env.NODE_ENV === 'development') {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }

    const startTime = Date.now();
    try {
      console.log('⏱️ Starting AI API call for test data generation...');
      const response = await fetch(this.AI_API_URL, fetchOptions);
      const fetchTime = Date.now() - startTime;
      console.log(`⏱️ AI API fetch completed in ${fetchTime}ms`);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('🚨 OpenAI API Error Response:', errorBody);
        throw new Error(`AI API error: ${response.status} ${response.statusText} - ${errorBody}`);
      }

      const data = await response.json() as any;
      const totalTime = Date.now() - startTime;
      console.log(`⏱️ AI API call for test data completed in ${totalTime}ms total`);
      return data.choices?.[0]?.message?.content || '';
    } finally {
      // Restore SSL verification
      if (process.env.NODE_ENV === 'development') {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
      }
    }
  }

  /**
   * Parse AI response and structure test recommendations
   */
  private static parseAIResponse(aiResponse: string, payerInfo: PayerInfo, isAIGenerated: boolean = false): TestRecommendation[] {
    try {
      // Try to extract JSON from the AI response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in AI response');
      }

      const parsedRecommendations = JSON.parse(jsonMatch[0]);

      // Structure and validate the test recommendations
      return parsedRecommendations.map((recommendation: any, index: number) => ({
        id: recommendation.id || `TC_${String(index + 1).padStart(3, '0')}`,
        title: recommendation.title || `Test Case ${index + 1}`,
        description: recommendation.description || 'AI-generated test recommendation',
        priority: recommendation.priority || 'Medium',
        category: recommendation.category || (index < 3 ? 'Core Functionality' : 'Additional Testing'),
        estimatedDuration: recommendation.estimatedDuration || '2 minutes',
        hasPreConfiguredData: false,
        dataSource: 'ai-generated' as const,
        implementationSpecific: isAIGenerated
      }));
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI response');
    }
  }

  /**
   * Generate default 270 request
   */
  private static generateDefault270(payerName: string = 'TESTPAYER'): string {
    const now = new Date();
    const isaDate = now.toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
    const isaTime = now.toTimeString().slice(0, 5).replace(':', ''); // HHMM
    const gsDate = now.toISOString().slice(0, 10).replace(/-/g, ''); // CCYYMMDD
    const gsTime = now.toTimeString().slice(0, 5).replace(':', ''); // HHMM
    const dtpDate = now.toISOString().slice(0, 10).replace(/-/g, ''); // CCYYMMDD

    return `ISA*00*          *00*          *ZZ*YOURSUBMITTERID *ZZ*${payerName.toUpperCase().replace(/\s+/g, '').padEnd(15, ' ')}*${isaDate}*${isaTime}*^*00501*000000001*0*T*:~GS*HS*YOURSUBMITTERID*${payerName.toUpperCase().replace(/\s+/g, '')}001*${gsDate}*${gsTime}*1*X*005010X279A1~ST*270*0001*005010X279A1~BHT*0022*13*10001234*${gsDate}*${gsTime}~HL*1**20*1~NM1*PR*2*${payerName.toUpperCase()}*****PI*60054~HL*2*1*21*1~NM1*1P*2*PROVIDER NAME*****XX*1234567890~HL*3*2*22*0~TRN*1*93175-012547*9877281234~NM1*IL*1*DOE*JOHN****MI*W883449464~DMG*D8*19850115*M~DTP*291*D8*${dtpDate}~EQ*30~SE*13*0001~GE*1*1~IEA*1*000000001~`;
  }

  /**
   * Generate default 271 response
   */
  private static generateDefault271(payerName: string = 'TESTPAYER'): string {
    const now = new Date();
    const isaDate = now.toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
    const isaTime = now.toTimeString().slice(0, 5).replace(':', ''); // HHMM
    const gsDate = now.toISOString().slice(0, 10).replace(/-/g, ''); // CCYYMMDD
    const gsTime = now.toTimeString().slice(0, 5).replace(':', ''); // HHMM
    const dtpDate = now.toISOString().slice(0, 10).replace(/-/g, ''); // CCYYMMDD

    return `ISA*00*          *00*          *ZZ*${payerName.toUpperCase().replace(/\s+/g, '').padEnd(15, ' ')}*ZZ*YOURSUBMITTERID *${isaDate}*${isaTime}*^*00501*000000001*0*T*:~GS*HB*${payerName.toUpperCase().replace(/\s+/g, '')}001*YOURSUBMITTERID*${gsDate}*${gsTime}*1*X*005010X279A1~ST*271*0001*005010X279A1~BHT*0022*11*10001234*${gsDate}*${gsTime}~HL*1**20*1~NM1*PR*2*${payerName.toUpperCase()}*****PI*60054~HL*2*1*21*1~NM1*1P*2*PROVIDER NAME*****XX*1234567890~HL*3*2*22*0~TRN*2*93175-012547*9877281234~NM1*IL*1*DOE*JOHN****MI*W883449464~DMG*D8*19850115*M~DTP*291*D8*${dtpDate}~EB*1*FAM*30**FAM~SE*13*0001~GE*1*1~IEA*1*000000001~`;
  }

  /**
   * Fallback test recommendations if AI fails (returns predefined cases only)
   */
  private static getFallbackTestCases(payerInfo: PayerInfo, configuration: PayerConfiguration): TestRecommendation[] {
    // Return the same 6 predefined test cases
    return this.getPredefinedTestCases(payerInfo, configuration);
  }

  /**
   * DEPRECATED: Old fallback with 12 cases - keeping for reference
   */
  private static getOldFallbackTestCases(payerInfo: PayerInfo, configuration: PayerConfiguration): TestRecommendation[] {
    const fallbackRecommendations: TestRecommendation[] = [
      {
        id: 'TC_001',
        title: 'Active Member - General Health Benefits',
        description: 'Test active member eligibility verification for general health benefits',
        priority: 'Critical',
        category: 'Core Functionality',
        estimatedDuration: '2 minutes',
        hasPreConfiguredData: true,
        dataSource: 'predefined',
        implementationSpecific: false
      },
      {
        id: 'TC_002',
        title: 'Inactive Member - Coverage Verification',
        description: 'Test inactive/expired member response handling',
        priority: 'Critical',
        category: 'Core Functionality',
        estimatedDuration: '2 minutes',
        hasPreConfiguredData: true,
        dataSource: 'predefined',
        implementationSpecific: false
      },
      {
        id: 'TC_003',
        title: 'Member Not Found - Error Handling',
        description: 'Test invalid member ID error handling and response codes',
        priority: 'Critical',
        category: 'Core Functionality',
        estimatedDuration: '1 minute',
        hasPreConfiguredData: true,
        dataSource: 'predefined',
        implementationSpecific: false
      },
      {
        id: 'TC_004',
        title: 'Service Type 88 Coverage',
        description: 'Test pharmacy service type coverage verification',
        priority: 'Critical',
        category: 'Core Functionality',
        estimatedDuration: '3 minutes',
        hasPreConfiguredData: true,
        dataSource: 'predefined',
        implementationSpecific: false
      },
      {
        id: 'TC_005',
        title: 'Member ID Format Test',
        description: 'Test member ID format validation and requirements',
        priority: 'Critical',
        category: 'Core Functionality',
        estimatedDuration: '2 minutes',
        hasPreConfiguredData: true,
        dataSource: 'predefined',
        implementationSpecific: false
      },
      {
        id: 'TC_006',
        title: 'Coverage Level Test',
        description: 'Test family vs individual coverage level verification',
        priority: 'Critical',
        category: 'Core Functionality',
        estimatedDuration: '2 minutes',
        hasPreConfiguredData: true,
        dataSource: 'predefined',
        implementationSpecific: false
      },
      {
        id: 'TC_007',
        title: 'Future Effective Coverage',
        description: 'Test member coverage that starts in the future (DTP*356 > service date)',
        priority: 'Medium',
        category: 'Additional Testing',
        estimatedDuration: '3 minutes',
        hasPreConfiguredData: false,
        dataSource: 'predefined',
        implementationSpecific: false
      },
      {
        id: 'TC_008',
        title: 'Terminated Coverage Validation',
        description: 'Test response where termination date (DTP*357) is before service date',
        priority: 'Medium',
        category: 'Additional Testing',
        estimatedDuration: '3 minutes',
        hasPreConfiguredData: false,
        dataSource: 'predefined',
        implementationSpecific: false
      },
      {
        id: 'TC_009',
        title: 'Dependent Eligibility Verification (Aetna)',
        description: 'Test subscriber vs dependent eligibility under family plan',
        priority: 'Medium',
        category: 'Additional Testing',
        estimatedDuration: '4 minutes',
        hasPreConfiguredData: false,
        dataSource: 'predefined',
        implementationSpecific: false
      },
      {
        id: 'TC_010',
        title: 'Dual Coverage (Medical & Dental) (Aetna)',
        description: 'Test multiple EB segments with different service types (30 for medical, 35 for dental)',
        priority: 'Medium',
        category: 'Additional Testing',
        estimatedDuration: '5 minutes',
        hasPreConfiguredData: false,
        dataSource: 'predefined',
        implementationSpecific: false
      },
      {
        id: 'TC_011',
        title: 'Medicare / Other Payer ID Check (Aetna)',
        description: 'Test payer response when alternate payer ID or Medicare ID is used',
        priority: 'Medium',
        category: 'Additional Testing',
        estimatedDuration: '3 minutes',
        hasPreConfiguredData: false,
        dataSource: 'predefined',
        implementationSpecific: false
      },
      {
        id: 'TC_012',
        title: 'Gender Mismatch Handling (Aetna)',
        description: 'Test rejection or warning when gender in request doesn\'t match payer record',
        priority: 'Medium',
        category: 'Additional Testing',
        estimatedDuration: '3 minutes',
        hasPreConfiguredData: false,
        dataSource: 'predefined',
        implementationSpecific: false
      }
    ];

    return fallbackRecommendations;
  }

  /**
   * Generate detailed test data for selected test cases (Step 3)
   */
  static async generateTestData(
    payerInfo: PayerInfo,
    configuration: PayerConfiguration,
    selectedTestCases: TestRecommendation[]
  ): Promise<TestCase[]> {
    console.log('🧪 Generating test data for selected test cases:', selectedTestCases);
    console.log('🤖 Using AI to generate contextual test data...');

    // Check if AI API key is available
    if (!this.AI_API_KEY) {
      console.warn('⚠️ OpenAI API key not found, using proven template test data');
      return this.getTemplateBasedTestData(payerInfo, configuration, selectedTestCases);
    }

    try {
      // Extract envelope data from questionnaire responses
      const dbStartTime = Date.now();
      console.log('Fetching questionnaire for submission ID:', payerInfo.organizationId);
      const questionnaireResponses = await this.getQuestionnaireResponses(payerInfo.organizationId);
      const dbEndTime = Date.now();
      console.log(`Fetched questionnaire responses in ${dbEndTime - dbStartTime}ms`);
      console.log('Questionnaire responses keys count:', Object.keys(questionnaireResponses).length);
      console.log('First 30 keys:', Object.keys(questionnaireResponses).slice(0, 30));
      console.log('Has payer-name?', 'payer-name' in questionnaireResponses);
      console.log('Has payer-id?', 'payer-id' in questionnaireResponses);

      // Search for payer-related fields
      const payerKeys = Object.keys(questionnaireResponses).filter(key =>
        key.toLowerCase().includes('payer') || key.toLowerCase().includes('nm109') || key.toLowerCase().includes('nm103')
      );
      console.log('Payer-related keys found:', payerKeys);

      if ('payer-name' in questionnaireResponses) {
        console.log('payer-name value:', questionnaireResponses['payer-name']);
      }
      if ('payer-id' in questionnaireResponses) {
        console.log('payer-id value:', questionnaireResponses['payer-id']);
      }

      // Create AI prompt with configuration context for test data generation
      const promptStartTime = Date.now();
      const prompt = this.createContextualTestDataPrompt(payerInfo, configuration, selectedTestCases, questionnaireResponses);
      const promptEndTime = Date.now();
      console.log(`⏱️ Created prompt in ${promptEndTime - promptStartTime}ms`);
      console.log('📝 Sending contextual request to AI for test data generation...');
      console.log('🔑 Using OpenAI API key:', this.AI_API_KEY ? 'Available' : 'Missing');
      console.log('📋 Selected test cases count:', selectedTestCases.length);
      console.log('📏 Prompt length:', prompt.length, 'characters');

      // Log a preview of the prompt to debug
      console.log('📄 Prompt preview (first 500 chars):', prompt.substring(0, 500));

      // Call AI API for test data generation
      const aiStartTime = Date.now();
      const aiResponse = await this.callAI(prompt);
      const aiEndTime = Date.now();
      console.log(`🤖 Received AI response in ${aiEndTime - aiStartTime}ms, parsing test data...`);
      console.log('📄 AI response length:', aiResponse.length);

      // Parse AI response and validate
      console.log('🔍 Raw AI response preview (first 500 chars):', aiResponse.substring(0, 500));
      console.log('🔍 Raw AI response preview (last 200 chars):', aiResponse.substring(Math.max(0, aiResponse.length - 200)));

      const parseStartTime = Date.now();
      const aiTestCases = this.parseTestDataResponse(aiResponse, payerInfo, selectedTestCases);
      const parseEndTime = Date.now();
      console.log(`⏱️ Parsed AI response in ${parseEndTime - parseStartTime}ms`);

      if (aiTestCases && aiTestCases.length > 0) {
        console.log(`✅ Successfully generated ${aiTestCases.length} AI test cases`);
        return aiTestCases;
      } else {
        console.warn('⚠️ AI response was empty or invalid, falling back to templates');
        return this.getTemplateBasedTestData(payerInfo, configuration, selectedTestCases);
      }

    } catch (error) {
      console.error('❌ AI call failed, using proven templates:', error);
      console.error('🔍 Error details:', error instanceof Error ? error.message : String(error));
      return this.getTemplateBasedTestData(payerInfo, configuration, selectedTestCases);
    }

    // TODO: Re-enable AI response parsing after POC if needed
    /*
    if (!this.AI_API_KEY) {
      console.warn('⚠️ OpenAI API key not found, using proven template test data');
      return this.getTemplateBasedTestData(payerInfo, configuration, selectedTestCases);
    }

    try {
      // Create the enhanced AI prompt with proven templates
      const prompt = this.createTestDataPrompt(payerInfo, configuration, selectedTestCases);
      console.log('📝 Generated enhanced prompt with proven templates');

      // Call AI API
      const aiResponse = await this.callAI(prompt);
      console.log('🤖 Received AI response for test data');

      // Parse and validate the response
      const testCases = this.parseTestDataResponse(aiResponse, payerInfo, selectedTestCases);

      // Validate each test case against proven structure
      const validatedTestCases = testCases.filter(testCase => {
        const is270Valid = this.validateX12Payload(testCase.request270.payload, '270');
        const is271Valid = this.validateX12Payload(testCase.expectedResponse271.payload, '271');

        if (!is270Valid || !is271Valid) {
          console.warn(`❌ Test case ${testCase.id} failed validation, excluding from results`);
          return false;
        }
        return true;
      });

      if (validatedTestCases.length === 0) {
        console.warn('⚠️ No valid test cases from AI, falling back to proven templates');
        return this.getTemplateBasedTestData(payerInfo, configuration, selectedTestCases);
      }

      // If AI didn't generate enough test cases, supplement with templates
      if (validatedTestCases.length < selectedTestCases.length) {
        console.warn(`⚠️ AI only generated ${validatedTestCases.length} of ${selectedTestCases.length} requested test cases, supplementing with templates`);
        const templateCases = this.getTemplateBasedTestData(payerInfo, configuration, selectedTestCases);
        // Take the missing number of test cases from templates
        const missingCount = selectedTestCases.length - validatedTestCases.length;
        const supplementalCases = templateCases.slice(validatedTestCases.length, validatedTestCases.length + missingCount);
        validatedTestCases.push(...supplementalCases);
      }

      console.log(`✅ Successfully generated and validated ${validatedTestCases.length} test cases`);
      return validatedTestCases;
    } catch (error) {
      console.error('❌ Error generating test data with AI:', error);
      console.log('🔄 Falling back to proven template test data');
      return this.getTemplateBasedTestData(payerInfo, configuration, selectedTestCases);
    }
    */
  }

  /**
   * Create optimized AI prompt for faster processing (10-15 seconds)
   */
  private static createOptimizedTestDataPrompt(
    payerInfo: PayerInfo,
    configuration: PayerConfiguration,
    selectedTestCases: string[]
  ): string {
    return `
Generate ${selectedTestCases.length} test case recommendations for ${payerInfo.name} payer testing.

Payer: ${payerInfo.name}
Mode: ${configuration.implementationMode}
Selected Cases: ${selectedTestCases.join(', ')}

Return brief JSON array with:
- id, title, description, priority
- Focus on core eligibility scenarios
- Keep responses concise for faster processing

Example: [{"id":"TC_001","title":"Active Member Test","description":"Basic eligibility check","priority":"Critical"}]
`;
  }

  /**
   * Fix ISA segment padding to ensure ISA02, ISA04, ISA06, ISA08 are correct length
   */
  private static fixISAPadding(payload: string): string {
    if (!payload || !payload.includes('ISA*')) {
      return payload;
    }

    console.log('🔧 Fixing ISA padding...');
    console.log('🔍 Original ISA segment:', payload.substring(0, payload.indexOf('~') + 1));

    // Split by segment terminator
    const segments = payload.split('~');

    // Find and fix ISA segment
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].startsWith('ISA*')) {
        const elements = segments[i].split('*');

        console.log(`🔍 ISA has ${elements.length} elements`);
        console.log('🔍 ISA02 before:', `"${elements[2]}"`, `(length: ${elements[2]?.length || 0})`);
        console.log('🔍 ISA04 before:', `"${elements[4]}"`, `(length: ${elements[4]?.length || 0})`);
        console.log('🔍 ISA06 before:', `"${elements[6]}"`, `(length: ${elements[6]?.length || 0})`);
        console.log('🔍 ISA08 before:', `"${elements[8]}"`, `(length: ${elements[8]?.length || 0})`);

        if (elements.length >= 17) {
          // ISA02 (Authorization Info) - must be exactly 10 characters
          elements[2] = (elements[2] || '').padEnd(10, ' ').substring(0, 10);

          // ISA04 (Security Info) - must be exactly 10 characters
          elements[4] = (elements[4] || '').padEnd(10, ' ').substring(0, 10);

          // ISA06 (Sender ID) - must be exactly 15 characters
          elements[6] = (elements[6] || '').trim().padEnd(15, ' ').substring(0, 15);

          // ISA08 (Receiver ID) - must be exactly 15 characters
          elements[8] = (elements[8] || '').trim().padEnd(15, ' ').substring(0, 15);

          console.log('🔍 ISA02 after:', `"${elements[2]}"`, `(length: ${elements[2].length})`);
          console.log('🔍 ISA04 after:', `"${elements[4]}"`, `(length: ${elements[4].length})`);
          console.log('🔍 ISA06 after:', `"${elements[6]}"`, `(length: ${elements[6].length})`);
          console.log('🔍 ISA08 after:', `"${elements[8]}"`, `(length: ${elements[8].length})`);

          // Reconstruct ISA segment
          segments[i] = elements.join('*');
          console.log('✅ Fixed ISA segment:', segments[i]);
        }
      }
    }

    const result = segments.join('~');
    console.log('✅ Fixed ISA in full payload:', result.substring(0, result.indexOf('~') + 1));
    return result;
  }

  /**
   * Get questionnaire responses for a submission
   */
  private static async getQuestionnaireResponses(submissionId: string): Promise<Record<string, any>> {
    try {
      console.log('Fetching questionnaire responses for submission ID:', submissionId);

      const { data, error } = await supabase
        .from('questionnaire_responses')
        .select('responses')
        .eq('id', submissionId)  // Fetch by submission ID, not organization_id
        .single();

      if (error) {
        console.log('Could not fetch questionnaire responses:', error.message);
        return {};
      }

      console.log('Successfully fetched questionnaire responses');
      return data?.responses || {};
    } catch (error) {
      console.log('Error fetching questionnaire responses:', error);
      return {};
    }
  }

  /**
   * Extract envelope data from questionnaire responses
   */
  private static extractEnvelopeData(questionnaireResponses: Record<string, any>): {
    isa05: string;
    isa06: string;
    isa07: string;
    isa08: string;
    isa11: string;
    isa16: string;
    gs02: string;
    gs03: string;
    payerName: string;
    payerId: string;
  } {
    console.log('Extracting envelope data from questionnaire...');

    // Try both simple and complete questionnaire formats
    // Simple format: payer-name, payer-id, isa08-receiver-id, etc.
    // Complete format: 2100a-nm103-270, 2100a-nm109-270, isa08-270, etc.

    // Extract payer name - try complete format first, then simple format
    let payerName = questionnaireResponses['2100a-nm103-270'];
    if (!payerName || payerName === 'custom') {
      payerName = questionnaireResponses['2100a-nm103-270-custom'];
    }
    if (!payerName) {
      payerName = questionnaireResponses['payer-name'] || 'PAYER NAME';
    }

    // Extract payer ID - try complete format first, then simple format
    let payerId = questionnaireResponses['2100a-nm109-270'];
    if (!payerId || payerId === 'custom') {
      payerId = questionnaireResponses['2100a-nm109-270-custom'];
    }
    if (!payerId) {
      payerId = questionnaireResponses['payer-id'] || 'PAYERID';
    }

    console.log('payer-name (2100a-nm103-270):', payerName);
    console.log('payer-id (2100a-nm109-270):', payerId);

    // Extract ISA05 - try complete format first
    let isa05 = questionnaireResponses['isa05-270'];
    if (!isa05 || isa05 === 'custom') {
      isa05 = questionnaireResponses['isa05-270-custom'] || questionnaireResponses['isa05-custom-value'] || 'ZZ';
    }

    // Extract ISA06 - try complete format first
    let isa06 = questionnaireResponses['isa06-270'];
    if (!isa06 || isa06 === 'custom') {
      isa06 = questionnaireResponses['isa06-270-custom'] || questionnaireResponses['isa06-custom-value'] || '030240928';
    }

    // Extract ISA07 - try complete format first
    const isa07 = questionnaireResponses['isa07-270'] || questionnaireResponses['isa07-receiver-id-qualifier'] || 'ZZ';

    // Extract ISA08 - try complete format first
    let isa08 = questionnaireResponses['isa08-270'];
    if (!isa08 || isa08 === 'custom' || isa08 === 'availity_defines') {
      isa08 = questionnaireResponses['isa08-270-custom'] || payerId;
    }

    // Extract ISA11 - try complete format first
    const isa11 = questionnaireResponses['isa11-270'] === '^' || questionnaireResponses['isa11-repetition-separator'] === 'caret' ? '^' : '^';

    // Extract ISA16 - try complete format first
    const isa16 = questionnaireResponses['isa16-270'] === ':' || questionnaireResponses['isa16-composite-separator'] === 'colon' ? ':' : ':';

    // Extract GS02 - try complete format first
    let gs02 = questionnaireResponses['gs02-270'];
    if (!gs02 || gs02 === 'custom') {
      gs02 = questionnaireResponses['gs02-270-custom'] || questionnaireResponses['gs02-custom-value'] || '030240928';
    }

    // Extract GS03 - try complete format first
    let gs03 = questionnaireResponses['gs03-270'];
    if (!gs03 || gs03 === 'custom' || gs03 === 'availity_defines') {
      gs03 = questionnaireResponses['gs03-270-custom'] || payerId;
    }

    console.log('Extracted envelope data:', { isa05, isa06, isa07, isa08, isa11, isa16, gs02, gs03, payerName, payerId });

    return { isa05, isa06, isa07, isa08, isa11, isa16, gs02, gs03, payerName, payerId };
  }

  /**
   * Create contextual AI prompt for test data generation based on configuration
   */
  private static createContextualTestDataPrompt(
    payerInfo: PayerInfo,
    configuration: PayerConfiguration,
    selectedTestCases: TestRecommendation[],
    questionnaireResponses: Record<string, any> = {}
  ): string {
    const configContext = this.extractConfigurationContext(configuration);
    const envelopeData = this.extractEnvelopeData(questionnaireResponses);

    return `
Generate X12 270/271 test data for ${selectedTestCases.length} test cases for ${payerInfo.name}.

PAYER: ${payerInfo.name} (${payerInfo.implementationMode})
CONFIG: ${configContext}

CRITICAL - USE THESE EXACT ENVELOPE VALUES FROM QUESTIONNAIRE:
ISA05 (Sender ID Qualifier): ${envelopeData.isa05}
ISA06 (Sender ID): ${envelopeData.isa06} (MUST be padded to exactly 15 characters with trailing spaces)
ISA07 (Receiver ID Qualifier): ${envelopeData.isa07}
ISA08 (Receiver ID): ${envelopeData.isa08} (MUST be padded to exactly 15 characters with trailing spaces)
ISA11 (Repetition Separator): ${envelopeData.isa11}
ISA16 (Composite Separator): ${envelopeData.isa16}
GS02 (Application Sender): ${envelopeData.gs02}
GS03 (Application Receiver): ${envelopeData.gs03}
Payer Name (NM103): ${envelopeData.payerName}
Payer ID (NM109): ${envelopeData.payerId}

CRITICAL ISA SEGMENT FIXED-LENGTH REQUIREMENTS:
- ISA02 (Authorization Info): Exactly 10 spaces
- ISA04 (Security Info): Exactly 10 spaces
- ISA06 (Sender ID): Exactly 15 characters (right-pad with spaces if needed)
- ISA08 (Receiver ID): Exactly 15 characters (right-pad with spaces if needed)
Example: If ISA06 = "030240928" (9 chars), it must be "030240928      " (15 chars total)

TEST CASES:
${selectedTestCases.map((tc, i) => `${i + 1}. ${tc.title} - ${tc.description}`).join('\n')}

REQUIREMENTS:
- Generate complete X12 270 request and 271 response payloads
- Use consistent data between 270 and 271 (same member, provider, control numbers)
- Generate appropriate segments based on test case scenario:
  * Active member → EB*1 segments
  * Inactive member → EB*6 segments
  * Member not found → AAA error segments
- Use realistic member IDs, provider names, and control numbers

SEGMENT EXAMPLES:
- Active member (individual): EB*1*EMP*30**PLAN NAME~
- Active member (family): EB*1*FAM*30**PLAN NAME~
- Inactive member: EB*6*EMP*30~ + DTP*357*D8*{end_date}~
- Member not found: AAA*Y*15*72*N~
- Pharmacy: EB*1*EMP*88**PHARMACY PLAN~
- With dates: EB*1*EMP*30**PLAN NAME~ + DTP*291*D8*{start_date}~

CRITICAL EB02 CODES (Benefit Coverage Level):
- EMP = Employee Only (use for individual subscriber)
- FAM = Family
- SPO = Spouse Only
- CHD = Children Only
- ECH = Employee and Children
- ESP = Employee and Spouse
- DEP = Dependents Only
- SPC = Spouse and Children
- DO NOT USE "IND" - it is NOT a valid EB02 code in X12 5010!

INSTRUCTIONS:
1. **MANDATORY - USE EXACT ENVELOPE VALUES ABOVE**: All ISA/GS segments MUST use the exact values provided above from the questionnaire
2. Analyze each test case title to determine scenario
3. Generate appropriate X12 segments:
   - "Active" → EB*1 (Active Coverage)
   - "Inactive/Terminated" → EB*6 + DTP*357
   - "Not Found/Invalid" → AAA error segments
   - "Pharmacy" → Service type 88
   - "Individual/Employee" → EB02=EMP (NOT IND!)
   - "Family" → EB02=FAM
4. Use consistent data between 270 and 271
5. GENERATE REALISTIC SYNTHETIC DATA (AI can randomize these):
   - Provider Names: "RIVERSIDE MEDICAL CENTER", "FAMILY HEALTH CLINIC", "DOWNTOWN URGENT CARE"
   - Provider NPIs: "1234567890", "9876543210", "5555666777"
   - Member IDs: "W883449464", "M123456789", "A987654321"
   - Member Names: "JOHN DOE", "JANE SMITH", "MICHAEL JOHNSON"
6. GENERATE COMPLETE X12 PAYLOADS - NOT PLACEHOLDERS:
   - Include ALL required segments: ISA, GS, ST, BHT, HL, NM1, DMG, DTP, EQ/EB, SE, GE, IEA
   - Use proper X12 format with ~ segment terminators
   - Generate actual segment data, not "Complete X12 payload" text
   - 270 request must have EQ segment, 271 response must have EB segment

CRITICAL:
- ISA/GS envelope segments MUST use the exact values from the questionnaire provided above
- DO NOT make up sender/receiver IDs - use the values from ISA05, ISA06, ISA07, ISA08, GS02, GS03
- Payer Name and Payer ID MUST match the values provided above
- Only member data, provider data, dates, and control numbers should be AI-generated

Return JSON array (use the EXACT envelope values from above):
[{
  "id": "TC_001",
  "title": "Test case title",
  "description": "Description",
  "priority": "Critical",
  "category": "Core",
  "memberData": {"memberId": "W883449464", "firstName": "JOHN", "lastName": "DOE", "dob": "1985-01-15", "serviceType": "30"},
  "syntheticData": {"senderId": "${envelopeData.isa06}", "receiverId": "${envelopeData.isa08}", "providerName": "RIVERSIDE MEDICAL CENTER", "providerNPI": "1234567890", "controlNumber": "001", "transactionDate": "241205", "transactionTime": "1430"},
  "request270": {"payload": "ISA*00*          *00*          *${envelopeData.isa05}*${envelopeData.isa06.padEnd(15)}*${envelopeData.isa07}*${envelopeData.isa08.padEnd(15)}*241205*1430*${envelopeData.isa11}*00501*000000001*0*P*${envelopeData.isa16}~GS*HS*${envelopeData.gs02}*${envelopeData.gs03}*20241205*1430*1*X*005010X279A1~ST*270*0001*005010X279A1~BHT*0022*13*001*20241205*1430~HL*1**20*1~NM1*PR*2*${envelopeData.payerName}*****PI*${envelopeData.payerId}~HL*2*1*21*1~NM1*1P*2*RIVERSIDE MEDICAL CENTER*****XX*1234567890~HL*3*2*22*0~NM1*IL*1*DOE*JOHN****MI*W883449464~DMG*D8*19850115~DTP*472*D8*20241205~EQ*30~SE*13*0001~GE*1*1~IEA*1*000000001~", "segments": ["ISA","GS","ST","BHT","HL","NM1","DMG","DTP","EQ","SE","GE","IEA"]},
  "expectedResponse271": {"payload": "ISA*00*          *00*          *${envelopeData.isa07}*${envelopeData.isa08.padEnd(15)}*${envelopeData.isa05}*${envelopeData.isa06.padEnd(15)}*241205*1430*${envelopeData.isa11}*00501*000000001*0*P*${envelopeData.isa16}~GS*HS*${envelopeData.gs03}*${envelopeData.gs02}*20241205*1430*1*X*005010X279A1~ST*271*0001*005010X279A1~BHT*0022*11*001*20241205*1430~HL*1**20*1~NM1*PR*2*${envelopeData.payerName}*****PI*${envelopeData.payerId}~HL*2*1*21*1~NM1*1P*2*RIVERSIDE MEDICAL CENTER*****XX*1234567890~HL*3*2*22*0~NM1*IL*1*DOE*JOHN****MI*W883449464~DMG*D8*19850115~DTP*291*D8*20200101~EB*1*EMP*30**HEALTH PLAN~SE*14*0001~GE*1*1~IEA*1*000000001~", "segments": ["ISA","GS","ST","BHT","HL","NM1","DMG","DTP","EB","SE","GE","IEA"]},
  "validationRules": {"required": [], "forbidden": [], "business": []}
}]

CRITICAL VALIDATION RULES:
1. The ISA/GS segments in your response MUST match the envelope values provided at the top of this prompt!
2. ISA06 and ISA08 MUST be exactly 15 characters (right-pad with spaces if needed)
3. ISA02 and ISA04 MUST be exactly 10 spaces each
4. EB02 must be a valid code (EMP, FAM, SPO, CHD, ECH, ESP, DEP, SPC) - NEVER use "IND"!
5. SE01 segment count must be accurate (count all segments from ST to SE inclusive)
6. For active coverage, include DTP*291 (Plan Begin Date) after DMG segment
7. Include plan name in EB05 when possible (e.g., EB*1*EMP*30**HEALTH PLAN~)

EXAMPLE ISA SEGMENT WITH CORRECT PADDING:
ISA*00*          *00*          *01*030240928      *ZZ*60054          *241205*1430*^*00501*000000001*0*P*:~
    ^^10 spaces  ^^10 spaces      ^^15 chars total    ^^15 chars total
`;
  }

  /**
   * Create enhanced AI prompt with proven templates for test data generation (Step 3)
   */
  private static createTestDataPrompt(
    payerInfo: PayerInfo,
    configuration: PayerConfiguration,
    selectedTestCases: string[]
  ): string {
    // Include proven test case templates from data.md
    const provenTemplates = this.getProvenTestTemplates();

    return `
You are an expert in X12 EDI 270/271 HIPAA transactions. Generate complete test data with 270 request and 271 response payloads for the selected test cases.

IMPORTANT: Use the PROVEN TEMPLATES below as your foundation. These are production-tested and validated. Only customize specific fields while maintaining the exact structure and format.

PROVEN TEST TEMPLATES (USE THESE AS FOUNDATION):
${provenTemplates}

PAYER INFORMATION:
- Name: ${payerInfo.name}
- Implementation Mode: ${payerInfo.implementationMode}
- ID: ${payerInfo.id}

CONFIGURATION:
${JSON.stringify(configuration, null, 2)}

SELECTED TEST CASES: ${selectedTestCases.join(', ')}

CRITICAL X12 VALIDATION REQUIREMENTS:

1. **Payer ID Requirements:**
   - Use correct payer ID: 60054 (for ${payerInfo.name})
   - NM1*PR*2*${payerInfo.name.toUpperCase()}*****PI*60054~

2. **Date/Time Format Requirements:**
   - ISA date/time: YYMMDD*HHMM (e.g., 250830*1250)
   - GS date/time: CCYYMMDD*HHMM (e.g., 20250830*1250)
   - BHT date/time: CCYYMMDD*HHMM (e.g., 20250830*1250)
   - DTP*291: 8-digit date format (e.g., DTP*291*D8*20250830~)

3. **Trading Partner IDs:**
   - Replace SENDER/RECEIVER with realistic IDs
   - ISA: *ZZ*YOURSUBMITTERID *ZZ*${payerInfo.name.toUpperCase().replace(/\s+/g, '')}001 *
   - GS: GS*HS*YOURSUBMITTERID*${payerInfo.name.toUpperCase().replace(/\s+/g, '')}001*

4. **ISA Padding Requirements:**
   - Pad ISA06 and ISA08 to exactly 15 characters with spaces
   - Example: "YOURSUBMITTERID" → "YOURSUBMITTERID" (15 chars)

5. **Control Number Consistency:**
   - ISA13 ↔ IEA02 must match (e.g., 000000001)
   - GS06 ↔ GE02 must match (e.g., 1)
   - ST02 ↔ SE02 must match (e.g., 0001)

6. **Usage Indicator:**
   - ISA15*T* for test environment
   - Use P for production

7. **Segment Count Validation:**
   - SE01 = exact count of segments from ST through SE inclusive
   - Recalculate for each transaction

INSTRUCTIONS FOR USING PROVEN TEMPLATES:

1. **Map Selected Test Cases to Templates:**
   - If "Active Member" or similar → Use TEST CASE 1 template
   - If "Inactive Member" or similar → Use TEST CASE 2 template
   - If "Member Not Found" or "Error" → Use TEST CASE 3 template

2. **Customization Rules:**
   - Keep EXACT segment structure and order from templates
   - Only change: member names, provider names, dates/times, control numbers
   - NEVER change: segment counts, payer ID (60054), trading partner IDs
   - Maintain exact spacing and formatting

3. **Required Output Format:**
   For each selected test case, generate:
   - **Complete 270 Request Payload** (exact X12 format from template)
   - **Expected 271 Response Payload** (exact X12 format from template)
   - **Member Data** (ID, name, DOB, service type)
   - **Test Scenario Description**

4. **Member ID Patterns (from proven templates):**
   - Active members: W883449464 (or similar W + 9 digits)
   - Inactive members: W772233445 (or similar W + 9 digits)
   - Invalid members: W999999999 (or similar W + 9 digits)

Return as JSON array with complete test case objects including all payloads and validation rules.
`;
  }

  /**
   * Validate AI response against proven template structure
   */
  private static validateX12Payload(payload: string, type: '270' | '271'): boolean {
    if (!payload || typeof payload !== 'string') return false;

    // Check for required segments
    const requiredSegments = type === '270'
      ? ['ISA', 'GS', 'ST*270', 'BHT', 'HL', 'NM1*PR', 'NM1*1P', 'NM1*IL', 'EQ', 'SE', 'GE', 'IEA']
      : ['ISA', 'GS', 'ST*271', 'BHT', 'HL', 'NM1*PR', 'NM1*1P', 'NM1*IL', 'SE', 'GE', 'IEA'];

    for (const segment of requiredSegments) {
      if (!payload.includes(segment)) {
        console.warn(`❌ Missing required segment: ${segment} in ${type} payload`);
        return false;
      }
    }

    // Check for proper payer ID (60054)
    if (!payload.includes('*PI*60054~')) {
      console.warn(`❌ Missing or incorrect payer ID in ${type} payload`);
      return false;
    }

    // Check for proper segment terminator
    if (!payload.includes('~')) {
      console.warn(`❌ Missing segment terminators in ${type} payload`);
      return false;
    }

    return true;
  }

  /**
   * Parse test data response from AI with validation
   */
  private static parseTestDataResponse(
    aiResponse: string,
    payerInfo: PayerInfo,
    selectedTestCases: TestRecommendation[]
  ): TestCase[] {
    try {
      console.log('🔍 Attempting to parse AI response...');
      console.log('🔍 Raw AI response (first 100 chars):', aiResponse.substring(0, 100));
      console.log('🔍 Raw AI response (around position 23):', aiResponse.substring(15, 35));

      // Try multiple JSON extraction methods
      let jsonString = '';

      // Method 1: Look for clean JSON array at start
      if (aiResponse.trim().startsWith('[')) {
        const endIndex = aiResponse.lastIndexOf(']');
        if (endIndex !== -1) {
          jsonString = aiResponse.substring(0, endIndex + 1).trim();
          console.log('✅ Found clean JSON array at start');
        }
      }

      // Method 2: Look for JSON array anywhere in response
      if (!jsonString) {
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          jsonString = jsonMatch[0];
          console.log('✅ Found JSON array using regex match');
        }
      }

      // Method 3: Look for JSON between code blocks
      if (!jsonString) {
        const codeBlockMatch = aiResponse.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
        if (codeBlockMatch && codeBlockMatch[1]) {
          jsonString = codeBlockMatch[1];
          console.log('✅ Found JSON in code blocks');
        }
      }

      // Method 4: Extract from multiple test case blocks
      if (!jsonString) {
        // Look for pattern like "Test Case 1: { ... } Test Case 2: { ... }"
        const testCaseMatches = aiResponse.match(/\{[\s\S]*?\}/g);
        if (testCaseMatches && testCaseMatches.length > 0) {
          jsonString = '[' + testCaseMatches.join(',') + ']';
          console.log('✅ Found multiple test case objects, combining into array');
        }
      }

      // Method 5: Last resort - try to find any array-like structure
      if (!jsonString) {
        const arrayMatch = aiResponse.match(/\[[\s\S]*?\]/);
        if (arrayMatch) {
          jsonString = arrayMatch[0];
          console.log('✅ Found array-like structure');
        } else {
          console.error('❌ No JSON structure found in AI response');
          throw new Error('No JSON array found in AI response');
        }
      }

      console.log('🔍 JSON string to parse (first 200 chars):', jsonString.substring(0, 200));
      console.log('🔍 JSON string length:', jsonString.length);

      const parsedCases = JSON.parse(jsonString);
      console.log('✅ Successfully parsed JSON, found', parsedCases.length, 'test cases');

      return parsedCases.map((testCase: any, index: number) => {
        const selectedTestCase = selectedTestCases[index];
        return {
          id: testCase.id || selectedTestCase?.id || `TC_${String(index + 1).padStart(3, '0')}`,
          title: testCase.title || selectedTestCase?.title || `Test Case ${index + 1}`,
          description: testCase.description || selectedTestCase?.description || 'AI-generated test case',
          priority: (testCase.priority || selectedTestCase?.priority || 'Medium') as 'Critical' | 'Medium' | 'Low',
          category: (testCase.category || (selectedTestCase?.category === 'Core Functionality' ? 'Core' : 'Additional') || 'Core') as 'Core' | 'Additional',
        memberData: {
          memberId: testCase.memberData?.memberId || this.generateMemberId(testCase.title || ''),
          firstName: testCase.memberData?.firstName || this.getRealisticFirstName(index),
          lastName: testCase.memberData?.lastName || this.getRealisticLastName(index),
          dob: testCase.memberData?.dob || '1985-01-15',
          serviceType: testCase.memberData?.serviceType || '30'
        },
        syntheticData: {
          senderId: testCase.syntheticData?.senderId || '030240928',
          receiverId: testCase.syntheticData?.receiverId || 'AETNA',
          providerName: testCase.syntheticData?.providerName || this.getRealisticProviderName(index),
          providerNPI: testCase.syntheticData?.providerNPI || this.getRealisticProviderNPI(index),
          controlNumber: testCase.syntheticData?.controlNumber || String(index + 1).padStart(3, '0'),
          transactionDate: testCase.syntheticData?.transactionDate || new Date().toISOString().slice(2, 10).replace(/-/g, ''),
          transactionTime: testCase.syntheticData?.transactionTime || new Date().toTimeString().slice(0, 5).replace(':', '')
        },
        request270: {
          payload: this.fixISAPadding(testCase.request270?.payload || this.generateDefault270(payerInfo.name)),
          segments: testCase.request270?.segments || []
        },
        expectedResponse271: {
          payload: this.fixISAPadding(testCase.expectedResponse271?.payload || this.generateDefault271(payerInfo.name)),
          segments: testCase.expectedResponse271?.segments || []
        },
        validationRules: {
          required: testCase.validationRules?.required || [],
          forbidden: testCase.validationRules?.forbidden || [],
          business: testCase.validationRules?.business || []
        }
      };
      });
    } catch (error) {
      console.error('❌ Error parsing test data response:', error);
      console.error('🔍 Error type:', error instanceof Error ? error.name : typeof error);
      console.error('🔍 Error message:', error instanceof Error ? error.message : String(error));
      console.log('🔄 AI response parsing failed, will fall back to template-based generation');

      // Return empty array to trigger fallback
      return [];
    }
  }

  /**
   * Get template-based test data using proven examples from data.md
   */
  private static getTemplateBasedTestData(
    payerInfo: PayerInfo,
    configuration: PayerConfiguration,
    selectedTestCases: TestRecommendation[]
  ): TestCase[] {
    console.log(`🎯 Using proven template-based test data generation for ${selectedTestCases.length} selected test cases`);

    const templateTestCases: TestCase[] = [];

    // Generate exactly the number of test cases requested, mapping each to appropriate template
    selectedTestCases.forEach((selectedTestCase, index) => {
      // Determine test case type based on the selected test case title/description
      const testCaseType = this.determineTestCaseType(selectedTestCase.title || selectedTestCase.id);

      console.log(`🔍 Processing selected test case: "${selectedTestCase.title}" → ${testCaseType} template`);

      const testCase = this.createTemplateBasedTestCaseByType(testCaseType, index + 1, payerInfo, selectedTestCase.id, selectedTestCase);
      if (testCase) {
        templateTestCases.push(testCase);
        console.log(`✅ Created template test case ${index + 1}: ${testCase.title} (${testCaseType})`);
      } else {
        console.error(`❌ Failed to create test case for ${selectedTestCase.id}`);
      }
    });

    console.log(`🎯 Generated ${templateTestCases.length} template-based test cases`);
    return templateTestCases.length > 0 ? templateTestCases : this.getFallbackTestData(payerInfo, configuration, selectedTestCases.map(tc => tc.id));
  }

  /**
   * Create test case based on proven templates (legacy method)
   */
  private static createTemplateBasedTestCase(testCaseId: string, index: number, payerInfo: PayerInfo): TestCase | null {
    const testCaseType = this.determineTestCaseType(testCaseId);
    return this.createTemplateBasedTestCaseByType(testCaseType, index, payerInfo, testCaseId);
  }

  /**
   * Create test case by specific type using proven templates
   */
  private static createTemplateBasedTestCaseByType(
    testCaseType: 'active' | 'inactive' | 'not_found' | 'pharmacy' | 'invalid_id' | 'family_coverage',
    index: number,
    payerInfo: PayerInfo,
    testCaseId: string,
    selectedTestCase?: TestRecommendation
  ): TestCase | null {
    const now = new Date();
    const isaDate = now.toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
    const isaTime = now.toTimeString().slice(0, 5).replace(':', ''); // HHMM
    const gsDate = now.toISOString().slice(0, 10).replace(/-/g, ''); // CCYYMMDD
    const gsTime = now.toTimeString().slice(0, 5).replace(':', ''); // HHMM
    const controlNum = String(index).padStart(3, '0');

    console.log(`🔧 Creating ${testCaseType} test case ${index} for ${testCaseId}`);
    console.log(`📋 Template mapping: ${testCaseId} → ${testCaseType}`);

    switch (testCaseType) {
      case 'active':
        return this.createActiveTestCase(controlNum, isaDate, isaTime, gsDate, gsTime);
      case 'inactive':
        return this.createInactiveTestCase(controlNum, isaDate, isaTime, gsDate, gsTime);
      case 'not_found':
        return this.createNotFoundTestCase(controlNum, isaDate, isaTime, gsDate, gsTime);
      case 'pharmacy':
        return this.createPharmacyTestCase(controlNum, isaDate, isaTime, gsDate, gsTime);
      case 'invalid_id':
        return this.createInvalidIdTestCase(controlNum, isaDate, isaTime, gsDate, gsTime);
      case 'family_coverage':
        return this.createFamilyCoverageTestCase(controlNum, isaDate, isaTime, gsDate, gsTime);
      default:
        console.warn(`⚠️ Unknown test case type: ${testCaseType}, defaulting to active`);
        return this.createActiveTestCase(controlNum, isaDate, isaTime, gsDate, gsTime);
    }
  }

  /**
   * Determine test case type from ID or title - maps to proven templates
   */
  private static determineTestCaseType(testCaseId: string): 'active' | 'inactive' | 'not_found' | 'pharmacy' | 'invalid_id' | 'family_coverage' {
    const id = testCaseId.toLowerCase();

    // Direct ID mapping for fallback recommendations
    if (id === 'tc_001') {
      return 'active';
    }
    else if (id === 'tc_002') {
      return 'inactive';
    }
    else if (id === 'tc_003') {
      return 'not_found';
    }
    else if (id === 'tc_004') {
      return 'pharmacy';
    }
    else if (id === 'tc_005') {
      return 'invalid_id';
    }
    else if (id === 'tc_006') {
      return 'family_coverage';
    }
    // Keyword-based mapping for custom scenarios or AI-generated IDs
    else if (id.includes('inactive') || id.includes('terminated') || id.includes('expired') ||
        id.includes('coverage verification')) {
      return 'inactive';
    }
    else if (id.includes('not found') || id.includes('error handling') || id.includes('member not found')) {
      return 'not_found';
    }
    else if (id.includes('pharmacy') || id.includes('service type 88') || id.includes('drug') ||
             id.includes('88 coverage')) {
      return 'pharmacy';
    }
    else if (id.includes('invalid') || id.includes('format') || id.includes('member id format') ||
             id.includes('id format')) {
      return 'invalid_id';
    }
    else if (id.includes('family') || id.includes('coverage level') || id.includes('family vs individual') ||
             id.includes('fam coverage')) {
      return 'family_coverage';
    }
    // Default to active member template
    else {
      return 'active';
    }
  }

  /**
   * Create active member test case using proven template
   */
  private static createActiveTestCase(controlNum: string, isaDate: string, isaTime: string, gsDate: string, gsTime: string): TestCase {
    const request270 = `ISA*00*          *00*          *ZZ*030240928     *ZZ*6686CBAF-048001*${isaDate}*${isaTime}*^*00501*0000001${controlNum}*0*T*:~GS*HS*030240928*6686CBAF-048001*${gsDate}*${isaTime}*1${controlNum}*X*005010X279A1~ST*270*0001${controlNum}*005010X279A1~BHT*0022*13*ELIG-REQ-0001${controlNum}*${gsDate}*${isaTime}*RP~HL*1**20*1~NM1*PR*2*AETNA*****PI*60054~HL*2*1*21*1~NM1*1P*2*GREEN VALLEY FAMILY CLINIC*****XX*1234567890~HL*3*2*22*0~TRN*1*ELIG-${gsDate}-0001${controlNum}*9876543210~NM1*IL*1*DOE*JOHN****MI*W883449464~DMG*D8*19850115*M~DTP*291*D8*${gsDate}~EQ*30~SE*13*0001${controlNum}~GE*1*1${controlNum}~IEA*1*0000001${controlNum}~`;

    const response271 = `ISA*00*          *00*          *ZZ*6686CBAF-048001*ZZ*030240928     *${isaDate}*${isaTime}*^*00501*0000001${controlNum}*0*T*:~GS*HB*6686CBAF-048001*030240928*${gsDate}*${isaTime}*1${controlNum}*X*005010X279A1~ST*271*0001${controlNum}*005010X279A1~BHT*0022*11*ELIG-REQ-0001${controlNum}*${gsDate}*${isaTime}*CH~HL*1**20*1~NM1*PR*2*AETNA*****PI*60054~HL*2*1*21*1~NM1*1P*2*GREEN VALLEY FAMILY CLINIC*****XX*1234567890~HL*3*2*22*0~TRN*2*ELIG-${gsDate}-0001${controlNum}*9876543210~NM1*IL*1*DOE*JOHN****MI*W883449464~DTP*291*D8*${gsDate}~EB*1*IND*30****1~DTP*356*D8*20240101~MSG*Active Coverage for General Health Benefits. Plan: Aetna Choice POS II.~SE*14*0001${controlNum}~GE*1*1${controlNum}~IEA*1*0000001${controlNum}~`;

    return {
      id: `TC_ACTIVE_${controlNum}`,
      title: 'Active Member - General Health Benefits',
      description: 'Test case for active member with general health coverage',
      priority: 'Critical',
      category: 'Core',
      memberData: {
        memberId: 'W883449464',
        firstName: 'JOHN',
        lastName: 'DOE',
        dob: '19850115',
        serviceType: '30'
      },
      syntheticData: {
        senderId: '030240928',
        receiverId: '6686CBAF-048001',
        providerName: 'GREEN VALLEY FAMILY CLINIC',
        providerNPI: '1234567890',
        controlNumber: controlNum,
        transactionDate: isaDate,
        transactionTime: isaTime
      },
      request270: {
        payload: request270,
        segments: []
      },
      expectedResponse271: {
        payload: response271,
        segments: []
      },
      validationRules: {
        required: ['EB*1*IND*30', 'MSG*Active Coverage'],
        forbidden: ['AAA*Y*79', 'EB*6*IND'],
        business: ['Active coverage should return EB*1', 'Should include plan details in MSG']
      }
    };
  }

  /**
   * Create inactive member test case using proven template
   */
  private static createInactiveTestCase(controlNum: string, isaDate: string, isaTime: string, gsDate: string, gsTime: string): TestCase {
    const request270 = `ISA*00*          *00*          *ZZ*030240928     *ZZ*6686CBAF-048001*${isaDate}*${isaTime}*^*00501*0000001${controlNum}*0*T*:~GS*HS*030240928*6686CBAF-048001*${gsDate}*${isaTime}*1${controlNum}*X*005010X279A1~ST*270*0001${controlNum}*005010X279A1~BHT*0022*13*ELIG-REQ-0001${controlNum}*${gsDate}*${isaTime}*RP~HL*1**20*1~NM1*PR*2*AETNA*****PI*60054~HL*2*1*21*1~NM1*1P*2*RIVERBEND INTERNAL MEDICINE*****XX*2233445566~HL*3*2*22*0~TRN*1*ELIG-${gsDate}-0001${controlNum}*9876543210~NM1*IL*1*SMITH*JANE****MI*W772233445~DMG*D8*19890322*F~DTP*291*D8*${gsDate}~EQ*30~SE*13*0001${controlNum}~GE*1*1${controlNum}~IEA*1*0000001${controlNum}~`;

    const response271 = `ISA*00*          *00*          *ZZ*6686CBAF-048001*ZZ*030240928     *${isaDate}*${isaTime}*^*00501*0000001${controlNum}*0*T*:~GS*HB*6686CBAF-048001*030240928*${gsDate}*${isaTime}*1${controlNum}*X*005010X279A1~ST*271*0001${controlNum}*005010X279A1~BHT*0022*11*ELIG-REQ-0001${controlNum}*${gsDate}*${isaTime}*CH~HL*1**20*1~NM1*PR*2*AETNA*****PI*60054~HL*2*1*21*1~NM1*1P*2*RIVERBEND INTERNAL MEDICINE*****XX*2233445566~HL*3*2*22*0~TRN*2*ELIG-${gsDate}-0001${controlNum}*9876543210~NM1*IL*1*SMITH*JANE****MI*W772233445~DTP*291*D8*${gsDate}~EB*6*IND*30~DTP*356*D8*20240101~DTP*357*D8*20240731~MSG*Coverage terminated for General Health Benefits as of 2024-07-31.~SE*15*0001${controlNum}~GE*1*1${controlNum}~IEA*1*0000001${controlNum}~`;

    return {
      id: `TC_INACTIVE_${controlNum}`,
      title: 'Inactive Member - Coverage Verification',
      description: 'Test case for inactive member with terminated coverage',
      priority: 'Critical',
      category: 'Core',
      memberData: {
        memberId: 'W772233445',
        firstName: 'JANE',
        lastName: 'SMITH',
        dob: '19890322',
        serviceType: '30'
      },
      request270: {
        payload: request270,
        segments: []
      },
      expectedResponse271: {
        payload: response271,
        segments: []
      },
      validationRules: {
        required: ['EB*6*IND*30', 'DTP*357', 'MSG*Coverage terminated'],
        forbidden: ['EB*1*IND', 'AAA*Y*79'],
        business: ['Terminated coverage should return EB*6', 'Should include termination date in DTP*357']
      }
    };
  }

  /**
   * Create member not found test case using proven template
   */
  private static createNotFoundTestCase(controlNum: string, isaDate: string, isaTime: string, gsDate: string, gsTime: string): TestCase {
    const request270 = `ISA*00*          *00*          *ZZ*030240928     *ZZ*6686CBAF-048001*${isaDate}*${isaTime}*^*00501*0000001${controlNum}*0*T*:~GS*HS*030240928*6686CBAF-048001*${gsDate}*${isaTime}*1${controlNum}*X*005010X279A1~ST*270*0001${controlNum}*005010X279A1~BHT*0022*13*ELIG-REQ-0001${controlNum}*${gsDate}*${isaTime}*RP~HL*1**20*1~NM1*PR*2*AETNA*****PI*60054~HL*2*1*21*1~NM1*1P*2*SUMMIT FAMILY MEDICINE*****XX*4455667788~HL*3*2*22*0~TRN*1*ELIG-${gsDate}-0001${controlNum}*9876543210~NM1*IL*1*BROWN*ALEX****MI*W999999999~DMG*D8*19911111*U~DTP*291*D8*${gsDate}~EQ*30~SE*13*0001${controlNum}~GE*1*1${controlNum}~IEA*1*0000001${controlNum}~`;

    const response271 = `ISA*00*          *00*          *ZZ*6686CBAF-048001*ZZ*030240928     *${isaDate}*${isaTime}*^*00501*0000001${controlNum}*0*T*:~GS*HB*6686CBAF-048001*030240928*${gsDate}*${isaTime}*1${controlNum}*X*005010X279A1~ST*271*0001${controlNum}*005010X279A1~BHT*0022*11*ELIG-REQ-0001${controlNum}*${gsDate}*${isaTime}*CH~HL*1**20*1~NM1*PR*2*AETNA*****PI*60054~HL*2*1*21*1~NM1*1P*2*SUMMIT FAMILY MEDICINE*****XX*4455667788~HL*3*2*22*0~TRN*2*ELIG-${gsDate}-0001${controlNum}*9876543210~NM1*IL*1*BROWN*ALEX****MI*W999999999~AAA*Y*15*72*N~MSG*Subscriber/Insured Not Found – Invalid Member ID.~SE*12*0001${controlNum}~GE*1*1${controlNum}~IEA*1*0000001${controlNum}~`;

    return {
      id: `TC_NOT_FOUND_${controlNum}`,
      title: 'Member Not Found - Error Handling',
      description: 'Test case for invalid member ID with error response',
      priority: 'Critical',
      category: 'Core',
      memberData: {
        memberId: 'W999999999',
        firstName: 'ALEX',
        lastName: 'BROWN',
        dob: '19911111',
        serviceType: '30'
      },
      request270: {
        payload: request270,
        segments: []
      },
      expectedResponse271: {
        payload: response271,
        segments: []
      },
      validationRules: {
        required: ['AAA*Y*15*72*N', 'MSG*Subscriber/Insured Not Found'],
        forbidden: ['EB*1*IND', 'EB*6*IND', 'MSG*Active Coverage'],
        business: ['Invalid member should return AAA error segment with action code 15', 'Should include MSG segment with error description', 'Should not include EB segments for not found members']
      }
    };
  }

  /**
   * Create pharmacy coverage test case using proven template (Test Case 4)
   */
  private static createPharmacyTestCase(controlNum: string, isaDate: string, isaTime: string, gsDate: string, gsTime: string): TestCase {
    const request270 = `ISA*00*          *00*          *ZZ*030240928     *ZZ*6686CBAF-048001*${isaDate}*${isaTime}*^*00501*0000002${controlNum}*0*T*:~GS*HS*030240928*6686CBAF-048001*${gsDate}*${isaTime}*2${controlNum}*X*005010X279A1~ST*270*0002${controlNum}*005010X279A1~BHT*0022*13*ELIG-REQ-0002${controlNum}*${gsDate}*${isaTime}*RP~HL*1**20*1~NM1*PR*2*AETNA*****PI*60054~HL*2*1*21*1~NM1*1P*2*MAIN STREET CLINIC*****XX*1234567890~HL*3*2*22*0~TRN*1*ELIG-${gsDate}-0002${controlNum}*9876543210~NM1*IL*1*DOE*JANE****MI*W445566778~DMG*D8*19801010*F~DTP*291*D8*${gsDate}~EQ*88~SE*13*0002${controlNum}~GE*1*2${controlNum}~IEA*1*0000002${controlNum}~`;

    const response271 = `ISA*00*          *00*          *ZZ*6686CBAF-048001*ZZ*030240928     *${isaDate}*${isaTime}*^*00501*0000002${controlNum}*0*T*:~GS*HB*6686CBAF-048001*030240928*${gsDate}*${isaTime}*2${controlNum}*X*005010X279A1~ST*271*0002${controlNum}*005010X279A1~BHT*0022*11*ELIG-REQ-0002${controlNum}*${gsDate}*${isaTime}*CH~HL*1**20*1~NM1*PR*2*AETNA*****PI*60054~HL*2*1*21*1~NM1*1P*2*MAIN STREET CLINIC*****XX*1234567890~HL*3*2*22*0~TRN*2*ELIG-${gsDate}-0002${controlNum}*9876543210~NM1*IL*1*DOE*JANE****MI*W445566778~DTP*291*D8*${gsDate}~EB*1*IND*88****1~DTP*356*D8*20240101~MSG*Active Coverage for Pharmacy Benefits.~SE*13*0002${controlNum}~GE*1*2${controlNum}~IEA*1*0000002${controlNum}~`;

    return {
      id: `TC_PHARMACY_${controlNum}`,
      title: 'Service Type 88 Coverage (Pharmacy)',
      description: 'Test case for pharmacy benefits coverage verification',
      priority: 'Critical',
      category: 'Additional',
      memberData: {
        memberId: 'W445566778',
        firstName: 'JANE',
        lastName: 'DOE',
        dob: '19801010',
        serviceType: '88'
      },
      request270: {
        payload: request270,
        segments: []
      },
      expectedResponse271: {
        payload: response271,
        segments: []
      },
      validationRules: {
        required: ['EB*1*IND*88', 'MSG*Active Coverage for Pharmacy Benefits'],
        forbidden: ['AAA*Y*79', 'EB*6*IND'],
        business: ['Pharmacy coverage should return EB*1*IND*88', 'Should include pharmacy-specific benefits message']
      }
    };
  }

  /**
   * Create invalid ID format test case using proven template (Test Case 5)
   */
  private static createInvalidIdTestCase(controlNum: string, isaDate: string, isaTime: string, gsDate: string, gsTime: string): TestCase {
    const request270 = `ISA*00*          *00*          *ZZ*030240928     *ZZ*6686CBAF-048001*${isaDate}*${isaTime}*^*00501*0000002${controlNum}*0*T*:~GS*HS*030240928*6686CBAF-048001*${gsDate}*${isaTime}*2${controlNum}*X*005010X279A1~ST*270*0002${controlNum}*005010X279A1~BHT*0022*13*ELIG-REQ-0002${controlNum}*${gsDate}*${isaTime}*RP~HL*1**20*1~NM1*PR*2*AETNA*****PI*60054~HL*2*1*21*1~NM1*1P*2*CITY HEALTH PROVIDERS*****XX*2233445566~HL*3*2*22*0~TRN*1*ELIG-${gsDate}-0002${controlNum}*9876543210~NM1*IL*1*SMITH*ROBERT****MI*INVALID123~DMG*D8*19900101*M~DTP*291*D8*${gsDate}~EQ*30~SE*13*0002${controlNum}~GE*1*2${controlNum}~IEA*1*0000002${controlNum}~`;

    const response271 = `ISA*00*          *00*          *ZZ*6686CBAF-048001*ZZ*030240928     *${isaDate}*${isaTime}*^*00501*0000002${controlNum}*0*T*:~GS*HB*6686CBAF-048001*030240928*${gsDate}*${isaTime}*2${controlNum}*X*005010X279A1~ST*271*0002${controlNum}*005010X279A1~BHT*0022*11*ELIG-REQ-0002${controlNum}*${gsDate}*${isaTime}*CH~HL*1**20*1~NM1*PR*2*AETNA*****PI*60054~HL*2*1*21*1~NM1*1P*2*CITY HEALTH PROVIDERS*****XX*2233445566~HL*3*2*22*0~TRN*2*ELIG-${gsDate}-0002${controlNum}*9876543210~NM1*IL*1*SMITH*ROBERT****MI*INVALID123~AAA*Y*15*72*N~MSG*Invalid Member ID Format.~SE*12*0002${controlNum}~GE*1*2${controlNum}~IEA*1*0000002${controlNum}~`;

    return {
      id: `TC_INVALID_ID_${controlNum}`,
      title: 'Member ID Format Test (Invalid ID)',
      description: 'Test case for invalid member ID format validation',
      priority: 'Critical',
      category: 'Additional',
      memberData: {
        memberId: 'INVALID123',
        firstName: 'ROBERT',
        lastName: 'SMITH',
        dob: '19900101',
        serviceType: '30'
      },
      request270: {
        payload: request270,
        segments: []
      },
      expectedResponse271: {
        payload: response271,
        segments: []
      },
      validationRules: {
        required: ['AAA*Y*15*72*N', 'MSG*Invalid Member ID Format'],
        forbidden: ['EB*1*IND', 'EB*6*IND', 'MSG*Active Coverage'],
        business: ['Invalid ID format should return AAA error segment with action code 15', 'Should include MSG segment with format error description', 'Should not include EB segments for invalid IDs']
      }
    };
  }

  /**
   * Create family coverage test case using proven template (Test Case 6)
   */
  private static createFamilyCoverageTestCase(controlNum: string, isaDate: string, isaTime: string, gsDate: string, gsTime: string): TestCase {
    const request270 = `ISA*00*          *00*          *ZZ*030240928     *ZZ*6686CBAF-048001*${isaDate}*${isaTime}*^*00501*0000002${controlNum}*0*T*:~GS*HS*030240928*6686CBAF-048001*${gsDate}*${isaTime}*2${controlNum}*X*005010X279A1~ST*270*0002${controlNum}*005010X279A1~BHT*0022*13*ELIG-REQ-0002${controlNum}*${gsDate}*${isaTime}*RP~HL*1**20*1~NM1*PR*2*AETNA*****PI*60054~HL*2*1*21*1~NM1*1P*2*FAMILY CARE CLINIC*****XX*3344556677~HL*3*2*22*0~TRN*1*ELIG-${gsDate}-0002${controlNum}*9876543210~NM1*IL*1*JOHNSON*DAVID****MI*W556677889~DMG*D8*19850505*M~DTP*291*D8*${gsDate}~EQ*30~SE*13*0002${controlNum}~GE*1*2${controlNum}~IEA*1*0000002${controlNum}~`;

    const response271 = `ISA*00*          *00*          *ZZ*6686CBAF-048001*ZZ*030240928     *${isaDate}*${isaTime}*^*00501*0000002${controlNum}*0*T*:~GS*HB*6686CBAF-048001*030240928*${gsDate}*${isaTime}*2${controlNum}*X*005010X279A1~ST*271*0002${controlNum}*005010X279A1~BHT*0022*11*ELIG-REQ-0002${controlNum}*${gsDate}*${isaTime}*CH~HL*1**20*1~NM1*PR*2*AETNA*****PI*60054~HL*2*1*21*1~NM1*1P*2*FAMILY CARE CLINIC*****XX*3344556677~HL*3*2*22*0~TRN*2*ELIG-${gsDate}-0002${controlNum}*9876543210~NM1*IL*1*JOHNSON*DAVID****MI*W556677889~DTP*291*D8*${gsDate}~EB*1*FAM*30****1~DTP*356*D8*20240101~MSG*Active Family Coverage for General Health Benefits.~SE*13*0002${controlNum}~GE*1*2${controlNum}~IEA*1*0000002${controlNum}~`;

    return {
      id: `TC_FAMILY_COVERAGE_${controlNum}`,
      title: 'Coverage Level Test (Family vs Individual)',
      description: 'Test case for family coverage level verification',
      priority: 'Critical',
      category: 'Additional',
      memberData: {
        memberId: 'W556677889',
        firstName: 'DAVID',
        lastName: 'JOHNSON',
        dob: '19850505',
        serviceType: '30'
      },
      request270: {
        payload: request270,
        segments: []
      },
      expectedResponse271: {
        payload: response271,
        segments: []
      },
      validationRules: {
        required: ['EB*1*FAM*30', 'MSG*Active Family Coverage'],
        forbidden: ['AAA*Y*79', 'EB*6*IND', 'EB*1*IND'],
        business: ['Family coverage should return EB*1*FAM*30', 'Should distinguish between family and individual coverage', 'Should include family-specific benefits message']
      }
    };
  }

  /**
   * Fallback test data if AI fails (original method)
   */
  private static getFallbackTestData(
    payerInfo: PayerInfo,
    configuration: PayerConfiguration,
    selectedTestCases: string[]
  ): TestCase[] {
    return selectedTestCases.map((caseId, index) => ({
      id: caseId,
      title: `Test Case ${caseId}`,
      description: `Fallback test case for ${caseId}`,
      priority: 'Critical' as const,
      category: 'Core' as const,
      memberData: {
        memberId: this.generateMemberId(`test case ${index}`),
        firstName: 'John',
        lastName: 'Doe',
        dob: '1985-01-15',
        serviceType: '30'
      },
      request270: {
        payload: this.generateDefault270(payerInfo.name),
        segments: []
      },
      expectedResponse271: {
        payload: this.generateDefault271(payerInfo.name),
        segments: []
      },
      validationRules: {
        required: ['Must contain valid X12 270 format'],
        forbidden: ['Must not return error segments'],
        business: ['Must have valid member coverage']
      }
    }));
  }
}
