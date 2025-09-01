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

  // Temporary bypass for demo - set to false to use real AI
  private static readonly USE_SIMULATED_AI = true;

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
   * Generate test recommendations using AI (Step 1)
   */
  static async generateTestRecommendations(
    payerInfo: PayerInfo,
    configuration: PayerConfiguration
  ): Promise<TestRecommendation[]> {
    try {
      // Create the AI prompt with specific instructions for the 6 test cases
      const prompt = this.createAIPrompt(payerInfo, configuration);

      // Call AI API
      const aiResponse = await this.callAI(prompt);

      // Parse and structure the response
      const testCases = this.parseAIResponse(aiResponse, payerInfo);

      return testCases;
    } catch (error) {
      console.error('Error generating test recommendations:', error);
      // Return fallback test cases if AI fails
      return this.getFallbackTestCases(payerInfo, configuration);
    }
  }

  /**
   * Create AI prompt for test recommendations (Step 1)
   */
  private static createAIPrompt(payerInfo: PayerInfo, configuration: PayerConfiguration): string {
    return `
You are an expert in X12 EDI 270/271 HIPAA transactions and healthcare payer testing. Generate exactly 6 test case RECOMMENDATIONS for payer testing based on the configuration provided.

PAYER INFORMATION:
- Name: ${payerInfo.name}
- Implementation Mode: ${payerInfo.implementationMode}
- ID: ${payerInfo.id}

CONFIGURATION:
${JSON.stringify(configuration, null, 2)}

REQUIRED TEST CASE RECOMMENDATIONS (Generate exactly these 6):

1. **Active Member - General Health Benefits (Critical)**
   - Description: Test active member eligibility verification for general health benefits
   - Category: Core Functionality
   - Priority: Critical
   - Estimated Duration: 2 minutes

2. **Inactive Member - Coverage Verification (Critical)**
   - Description: Test inactive/expired member response handling
   - Category: Core Functionality
   - Priority: Critical
   - Estimated Duration: 2 minutes

3. **Member Not Found - Error Handling (Critical)**
   - Description: Test invalid member ID error handling and response codes
   - Category: Core Functionality
   - Priority: Critical
   - Estimated Duration: 1 minute

4. **Service Type 88 Coverage (Medium)**
   - Description: Test pharmacy service type coverage verification
   - Category: Additional Testing
   - Priority: Medium
   - Estimated Duration: 3 minutes

5. **Member ID Format Test (Medium)**
   - Description: Test member ID format validation and requirements
   - Category: Additional Testing
   - Priority: Medium
   - Estimated Duration: 2 minutes

6. **Coverage Level Test (Medium)**
   - Description: Test family vs individual coverage level verification
   - Category: Additional Testing
   - Priority: Medium
   - Estimated Duration: 2 minutes

Return ONLY test case recommendations as a JSON array with these fields:
- id: string (TC_001, TC_002, etc.)
- title: string
- description: string
- category: "Core Functionality" | "Additional Testing"
- priority: "Critical" | "Medium" | "Low"
- estimatedDuration: string

Do NOT include payloads, member data, or validation rules in this response.
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
        title: 'Active Member - General Health Benefits (Aetna)',
        description: 'Test active member eligibility verification for general health benefits',
        priority: 'Critical',
        category: 'Core Functionality',
        estimatedDuration: '2 minutes'
      },
      {
        id: 'TC_002',
        title: 'Inactive Member - Coverage Verification (Aetna)',
        description: 'Test inactive/expired member response handling',
        priority: 'Critical',
        category: 'Core Functionality',
        estimatedDuration: '2 minutes'
      },
      {
        id: 'TC_003',
        title: 'Member Not Found - Error Handling (Aetna)',
        description: 'Test invalid member ID error handling and response codes',
        priority: 'Critical',
        category: 'Core Functionality',
        estimatedDuration: '1 minute'
      },
      {
        id: 'TC_004',
        title: 'Service Type 88 Coverage (Aetna)',
        description: 'Test pharmacy service type coverage verification',
        priority: 'Medium',
        category: 'Additional Testing',
        estimatedDuration: '3 minutes'
      },
      {
        id: 'TC_005',
        title: 'Member ID Format Test (Aetna)',
        description: 'Test member ID format validation and requirements',
        priority: 'Medium',
        category: 'Additional Testing',
        estimatedDuration: '2 minutes'
      },
      {
        id: 'TC_006',
        title: 'Coverage Level Test (Aetna)',
        description: 'Test family vs individual coverage level verification',
        priority: 'Medium',
        category: 'Additional Testing',
        estimatedDuration: '2 minutes'
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
    selectedTestCases: string[]
  ): Promise<TestCase[]> {
    console.log('🧪 Generating test data for selected test cases:', selectedTestCases);

    // For POC: Hit AI for demonstration but use proven templates for results
    // This provides realistic loading time while guaranteeing exact data.md payloads
    console.log('🤖 Demonstrating AI processing for POC...');

    // Temporary bypass for demo - use simulated AI processing
    if (this.USE_SIMULATED_AI) {
      console.log('📝 Starting AI test data generation (simulated for demo)...');

      // Simulate realistic AI processing time (fixed 10 seconds for testing)
      const processingTime = 10000; // Exactly 10 seconds
      await this.simulateAIProcessing(processingTime);

      console.log('🎯 Using proven templates for guaranteed exact payloads from data.md');
      return this.getTemplateBasedTestData(payerInfo, configuration, selectedTestCases);
    }

    // Real AI processing (preserved for future use)
    if (!this.AI_API_KEY) {
      console.warn('⚠️ OpenAI API key not found, using proven template test data');
      return this.getTemplateBasedTestData(payerInfo, configuration, selectedTestCases);
    }

    try {
      // Create optimized AI prompt for faster processing
      const prompt = this.createOptimizedTestDataPrompt(payerInfo, configuration, selectedTestCases);
      console.log('📝 Sending optimized request to AI for realistic 10-15s processing...');

      // Call AI API with optimized parameters for faster response
      const aiResponse = await this.callOptimizedAI(prompt);
      console.log('🤖 Received AI response (using proven templates for guaranteed results)');

      // Use proven templates for guaranteed results while maintaining realistic timing
      console.log('🎯 Using proven templates for guaranteed exact payloads from data.md');
      return this.getTemplateBasedTestData(payerInfo, configuration, selectedTestCases);

    } catch (error) {
      console.error('❌ AI call failed, using proven templates');
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
    selectedTestCases: string[]
  ): TestCase[] {
    try {
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in AI response');
      }

      const parsedCases = JSON.parse(jsonMatch[0]);

      return parsedCases.map((testCase: any, index: number) => ({
        id: testCase.id || selectedTestCases[index] || `TC_${String(index + 1).padStart(3, '0')}`,
        title: testCase.title || `Test Case ${index + 1}`,
        description: testCase.description || 'AI-generated test case',
        priority: testCase.priority || 'Medium',
        category: testCase.category || 'Core',
        memberData: {
          memberId: testCase.memberData?.memberId || this.generateMemberId(testCase.title || ''),
          firstName: testCase.memberData?.firstName || 'John',
          lastName: testCase.memberData?.lastName || 'Doe',
          dob: testCase.memberData?.dob || '1985-01-15',
          serviceType: testCase.memberData?.serviceType || '30'
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
      }));
    } catch (error) {
      console.error('❌ Error parsing test data response:', error);
      console.log('🔄 AI response parsing failed, will fall back to template-based generation');
      throw new Error('Failed to parse test data response');
    }
  }

  /**
   * Get template-based test data using proven examples from data.md
   */
  private static getTemplateBasedTestData(
    payerInfo: PayerInfo,
    configuration: PayerConfiguration,
    selectedTestCases: string[]
  ): TestCase[] {
    console.log(`🎯 Using proven template-based test data generation for ${selectedTestCases.length} selected test cases`);

    const templateTestCases: TestCase[] = [];
    const templateTypes: ('active' | 'inactive' | 'not_found')[] = ['active', 'inactive', 'not_found'];

    // Generate exactly the number of test cases requested, mapping each to appropriate template
    selectedTestCases.forEach((testCaseId, index) => {
      // Determine test case type based on the selected test case ID/title
      const testCaseType = this.determineTestCaseType(testCaseId);

      console.log(`🔍 Processing selected test case: "${testCaseId}" → ${testCaseType} template`);

      const testCase = this.createTemplateBasedTestCaseByType(testCaseType, index + 1, payerInfo, testCaseId);
      if (testCase) {
        templateTestCases.push(testCase);
        console.log(`✅ Created template test case ${index + 1}: ${testCase.title} (${testCaseType})`);
      } else {
        console.error(`❌ Failed to create test case for ${testCaseId}`);
      }
    });

    console.log(`🎯 Generated ${templateTestCases.length} template-based test cases`);
    return templateTestCases.length > 0 ? templateTestCases : this.getFallbackTestData(payerInfo, configuration, selectedTestCases);
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
    testCaseId: string
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
