import dotenv from 'dotenv';
dotenv.config();

// Types for test recommendations (Step 1)
export interface TestRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'Medium' | 'Low';
  category: 'Core Functionality' | 'Additional Testing';
  estimatedDuration: string;
}

// Types for detailed test data (Step 3)
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
   */
  static async generateTestRecommendations(
    payerInfo: PayerInfo,
    configuration: PayerConfiguration
  ): Promise<TestRecommendation[]> {
    console.log('🎯 Starting test recommendations generation...');
    console.log('🔑 OpenAI API key status:', this.AI_API_KEY ? 'Available' : 'Missing');

    try {
      // Create the AI prompt with specific instructions for the 12 test cases
      const prompt = this.createAIPrompt(payerInfo, configuration);
      console.log('📝 Created AI prompt, calling OpenAI API...');

      // Call AI API
      const startTime = Date.now();
      const aiResponse = await this.callAI(prompt);
      const endTime = Date.now();
      console.log(`🤖 Received AI response in ${endTime - startTime}ms`);
      console.log('📄 AI response length:', aiResponse.length);

      // Parse and structure the response
      const testCases = this.parseAIResponse(aiResponse, payerInfo);
      console.log(`✅ Successfully parsed ${testCases.length} test recommendations`);

      return testCases;
    } catch (error) {
      console.error('❌ Error generating test recommendations:', error);
      console.error('🔍 Error details:', error instanceof Error ? error.message : String(error));
      // Return fallback test cases if AI fails
      console.log('🔄 Falling back to template-based test recommendations');
      return this.getFallbackTestCases(payerInfo, configuration);
    }
  }

  /**
   * Create AI prompt for test recommendations (Step 1)
   */
  private static createAIPrompt(payerInfo: PayerInfo, configuration: PayerConfiguration): string {
    return `
Generate 12 test case recommendations for ${payerInfo.name} (${payerInfo.implementationMode}).

Configuration: ${this.extractConfigurationContext(configuration)}

Create relevant test cases based on the payer configuration. Include 6-8 "Core Functionality" (Critical priority) and 4-6 "Additional Testing" (Medium priority).

Return JSON array with 12 test cases:
[{
  "id": "TC_001",
  "title": "Test case title",
  "description": "Test description based on configuration",
  "category": "Core Functionality",
  "priority": "Critical",
  "estimatedDuration": "2 minutes"
}]
`;
  }

  /**
   * Call AI API with optimized parameters for faster response (10-15 seconds)
   */
  private static async callOptimizedAI(prompt: string): Promise<string> {
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
        model: 'gpt-3.5-turbo', // Faster model than gpt-4
        messages: [
          {
            role: 'system',
            content: 'You are an expert in X12 EDI healthcare transactions. Generate concise test case recommendations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500, // Reduced from 4000 for faster response
        temperature: 0.1  // Lower temperature for faster, more deterministic responses
      })
    };

    // Handle SSL certificate issues in development
    if (process.env.NODE_ENV === 'development') {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }

    try {
      const response = await fetch(this.AI_API_URL, fetchOptions);

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as any;
      return data.choices?.[0]?.message?.content || '';
    } finally {
      // Restore SSL verification
      if (process.env.NODE_ENV === 'development') {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
      }
    }
  }

  /**
   * Call AI API (original method for test recommendations)
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
        model: 'gpt-4',
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
        max_tokens: 4000,
        temperature: 0.3
      })
    };

    // Handle SSL certificate issues in development
    if (process.env.NODE_ENV === 'development') {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }

    try {
      const response = await fetch(this.AI_API_URL, fetchOptions);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('🚨 OpenAI API Error Response:', errorBody);
        throw new Error(`AI API error: ${response.status} ${response.statusText} - ${errorBody}`);
      }

      const data = await response.json() as any;
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
  private static parseAIResponse(aiResponse: string, payerInfo: PayerInfo): TestRecommendation[] {
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
        estimatedDuration: recommendation.estimatedDuration || '2 minutes'
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
   * Fallback test recommendations if AI fails
   */
  private static getFallbackTestCases(payerInfo: PayerInfo, configuration: PayerConfiguration): TestRecommendation[] {
    const fallbackRecommendations: TestRecommendation[] = [
      {
        id: 'TC_001',
        title: 'Active Member - General Health Benefits',
        description: 'Test active member eligibility verification for general health benefits',
        priority: 'Critical',
        category: 'Core Functionality',
        estimatedDuration: '2 minutes'
      },
      {
        id: 'TC_002',
        title: 'Inactive Member - Coverage Verification',
        description: 'Test inactive/expired member response handling',
        priority: 'Critical',
        category: 'Core Functionality',
        estimatedDuration: '2 minutes'
      },
      {
        id: 'TC_003',
        title: 'Member Not Found - Error Handling',
        description: 'Test invalid member ID error handling and response codes',
        priority: 'Critical',
        category: 'Core Functionality',
        estimatedDuration: '1 minute'
      },
      {
        id: 'TC_004',
        title: 'Service Type 88 Coverage',
        description: 'Test pharmacy service type coverage verification',
        priority: 'Critical',
        category: 'Core Functionality',
        estimatedDuration: '3 minutes'
      },
      {
        id: 'TC_005',
        title: 'Member ID Format Test',
        description: 'Test member ID format validation and requirements',
        priority: 'Critical',
        category: 'Core Functionality',
        estimatedDuration: '2 minutes'
      },
      {
        id: 'TC_006',
        title: 'Coverage Level Test',
        description: 'Test family vs individual coverage level verification',
        priority: 'Critical',
        category: 'Core Functionality',
        estimatedDuration: '2 minutes'
      },
      {
        id: 'TC_007',
        title: 'Future Effective Coverage',
        description: 'Test member coverage that starts in the future (DTP*356 > service date)',
        priority: 'Medium',
        category: 'Additional Testing',
        estimatedDuration: '3 minutes'
      },
      {
        id: 'TC_008',
        title: 'Terminated Coverage Validation',
        description: 'Test response where termination date (DTP*357) is before service date',
        priority: 'Medium',
        category: 'Additional Testing',
        estimatedDuration: '3 minutes'
      },
      {
        id: 'TC_009',
        title: 'Dependent Eligibility Verification (Aetna)',
        description: 'Test subscriber vs dependent eligibility under family plan',
        priority: 'Medium',
        category: 'Additional Testing',
        estimatedDuration: '4 minutes'
      },
      {
        id: 'TC_010',
        title: 'Dual Coverage (Medical & Dental) (Aetna)',
        description: 'Test multiple EB segments with different service types (30 for medical, 35 for dental)',
        priority: 'Medium',
        category: 'Additional Testing',
        estimatedDuration: '5 minutes'
      },
      {
        id: 'TC_011',
        title: 'Medicare / Other Payer ID Check (Aetna)',
        description: 'Test payer response when alternate payer ID or Medicare ID is used',
        priority: 'Medium',
        category: 'Additional Testing',
        estimatedDuration: '3 minutes'
      },
      {
        id: 'TC_012',
        title: 'Gender Mismatch Handling (Aetna)',
        description: 'Test rejection or warning when gender in request doesn\'t match payer record',
        priority: 'Medium',
        category: 'Additional Testing',
        estimatedDuration: '3 minutes'
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
      // Create AI prompt with configuration context for test data generation
      const prompt = this.createContextualTestDataPrompt(payerInfo, configuration, selectedTestCases);
      console.log('📝 Sending contextual request to AI for test data generation...');
      console.log('🔑 Using OpenAI API key:', this.AI_API_KEY ? 'Available' : 'Missing');
      console.log('📋 Selected test cases count:', selectedTestCases.length);
      console.log('📏 Prompt length:', prompt.length, 'characters');

      // Log a preview of the prompt to debug
      console.log('📄 Prompt preview (first 500 chars):', prompt.substring(0, 500));

      // Call AI API for test data generation
      const startTime = Date.now();
      const aiResponse = await this.callAI(prompt);
      const endTime = Date.now();
      console.log(`🤖 Received AI response in ${endTime - startTime}ms, parsing test data...`);
      console.log('📄 AI response length:', aiResponse.length);

      // Parse AI response and validate
      console.log('🔍 Raw AI response preview (first 500 chars):', aiResponse.substring(0, 500));
      console.log('🔍 Raw AI response preview (last 200 chars):', aiResponse.substring(Math.max(0, aiResponse.length - 200)));

      const aiTestCases = this.parseTestDataResponse(aiResponse, payerInfo, selectedTestCases);

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
   * Create contextual AI prompt for test data generation based on configuration
   */
  private static createContextualTestDataPrompt(
    payerInfo: PayerInfo,
    configuration: PayerConfiguration,
    selectedTestCases: TestRecommendation[]
  ): string {
    const configContext = this.extractConfigurationContext(configuration);

    return `
Generate X12 270/271 test data for ${selectedTestCases.length} test cases for ${payerInfo.name}.

PAYER: ${payerInfo.name} (${payerInfo.implementationMode})
CONFIG: ${configContext}

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
- Active member: EB*1*IND*30****1
- Inactive member: EB*6*IND*30 + DTP*357*D8*{end_date}
- Member not found: AAA*Y*15*72*N
- Pharmacy: EB*1*IND*88****1
- Family coverage: EB*1*FAM*30****1

INSTRUCTIONS:
1. Analyze each test case title to determine scenario
2. Generate appropriate X12 segments:
   - "Active" → EB*1 (Active Coverage)
   - "Inactive/Terminated" → EB*6 + DTP*357
   - "Not Found/Invalid" → AAA error segments
   - "Pharmacy" → Service type 88
   - "Individual" → EB02=IND, "Family" → EB02=FAM
3. Use consistent data between 270 and 271
4. GENERATE REALISTIC SYNTHETIC DATA:
   - Provider Names: "RIVERSIDE MEDICAL CENTER", "FAMILY HEALTH CLINIC", "DOWNTOWN URGENT CARE"
   - Provider NPIs: "1234567890", "9876543210", "5555666777"
   - Member IDs: "W883449464", "M123456789", "A987654321"
   - Member Names: "JOHN DOE", "JANE SMITH", "MICHAEL JOHNSON"
   - Sender IDs: "030240928" (Availity), "CLEARHS01"
   - Receiver IDs: "AETNA", "60054", "BCBSFL"
5. GENERATE COMPLETE X12 PAYLOADS - NOT PLACEHOLDERS:
   - Include ALL required segments: ISA, GS, ST, BHT, HL, NM1, DMG, DTP, EQ/EB, SE, GE, IEA
   - Use proper X12 format with ~ segment terminators
   - Generate actual segment data, not "Complete X12 payload" text
   - 270 request must have EQ segment, 271 response must have EB segment

IMPORTANT: Generate COMPLETE X12 payloads like the examples above. Do NOT use placeholder text like "Complete X12 payload" - generate actual ISA~GS~ST~...~IEA segments.

Return JSON array:
[{
  "id": "TC_001",
  "title": "Test case title",
  "description": "Description",
  "priority": "Critical",
  "category": "Core",
  "memberData": {"memberId": "W883449464", "firstName": "JOHN", "lastName": "DOE", "dob": "1985-01-15", "serviceType": "30"},
  "syntheticData": {"senderId": "030240928", "receiverId": "AETNA", "providerName": "RIVERSIDE MEDICAL CENTER", "providerNPI": "1234567890", "controlNumber": "001", "transactionDate": "241205", "transactionTime": "1430"},
  "request270": {"payload": "ISA*00*          *00*          *ZZ*030240928      *ZZ*AETNA          *241205*1430*^*00501*000000001*0*P*:~GS*HS*030240928*AETNA*20241205*1430*1*X*005010X279A1~ST*270*0001*005010X279A1~BHT*0022*13*001*20241205*1430~HL*1**20*1~NM1*PR*2*AETNA*****PI*AETNA~HL*2*1*21*1~NM1*1P*2*RIVERSIDE MEDICAL CENTER*****XX*1234567890~HL*3*2*22*0~NM1*IL*1*DOE*JOHN****MI*W883449464~DMG*D8*19850115~DTP*472*D8*20241205~EQ*30~SE*13*0001~GE*1*1~IEA*1*000000001~", "segments": ["ISA","GS","ST","BHT","HL","NM1","DMG","DTP","EQ","SE","GE","IEA"]},
  "expectedResponse271": {"payload": "ISA*00*          *00*          *ZZ*AETNA          *ZZ*030240928      *241205*1430*^*00501*000000001*0*P*:~GS*HS*AETNA*030240928*20241205*1430*1*X*005010X279A1~ST*271*0001*005010X279A1~BHT*0022*11*001*20241205*1430~HL*1**20*1~NM1*PR*2*AETNA*****PI*AETNA~HL*2*1*21*1~NM1*1P*2*RIVERSIDE MEDICAL CENTER*****XX*1234567890~HL*3*2*22*0~NM1*IL*1*DOE*JOHN****MI*W883449464~DMG*D8*19850115~DTP*472*D8*20241205~EB*1*IND*30****1~SE*13*0001~GE*1*1~IEA*1*000000001~", "segments": ["ISA","GS","ST","BHT","HL","NM1","DMG","DTP","EB","SE","GE","IEA"]},
  "validationRules": {"required": [], "forbidden": [], "business": []}
}]
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
          payload: testCase.request270?.payload || this.generateDefault270(payerInfo.name),
          segments: testCase.request270?.segments || []
        },
        expectedResponse271: {
          payload: testCase.expectedResponse271?.payload || this.generateDefault271(payerInfo.name),
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
