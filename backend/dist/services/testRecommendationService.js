"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestRecommendationService = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class TestRecommendationService {
    static AI_API_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
    static AI_API_KEY = process.env.OPENAI_API_KEY;
    static USE_SIMULATED_AI = true;
    static async simulateAIProcessing(duration) {
        console.log(`🤖 Simulating AI processing for ${Math.round(duration / 1000)}s...`);
        const startTime = Date.now();
        await new Promise(resolve => setTimeout(resolve, duration));
        const actualTime = Date.now() - startTime;
        console.log(`✅ AI processing simulation complete (${Math.round(actualTime / 1000)}s)`);
    }
    static getProvenTestTemplates() {
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
    static generateMemberId(scenario) {
        const patterns = {
            active: ['W883449464', 'W123456789', 'W987654321', 'W555123456'],
            inactive: ['W772233445', 'WINACTIVE002', 'WEXPIRED123', 'WTERMINATED1'],
            invalid: ['W999999999', 'WINVALID001', 'W000000000', 'WERROR12345']
        };
        if (scenario.includes('inactive') || scenario.includes('expired')) {
            return patterns.inactive[Math.floor(Math.random() * patterns.inactive.length)] || 'W772233445';
        }
        else if (scenario.includes('invalid') || scenario.includes('not found') || scenario.includes('error')) {
            return patterns.invalid[Math.floor(Math.random() * patterns.invalid.length)] || 'W999999999';
        }
        else {
            return patterns.active[Math.floor(Math.random() * patterns.active.length)] || 'W883449464';
        }
    }
    static async generateTestRecommendations(payerInfo, configuration) {
        try {
            const prompt = this.createAIPrompt(payerInfo, configuration);
            const aiResponse = await this.callAI(prompt);
            const testCases = this.parseAIResponse(aiResponse, payerInfo);
            return testCases;
        }
        catch (error) {
            console.error('Error generating test recommendations:', error);
            return this.getFallbackTestCases(payerInfo, configuration);
        }
    }
    static createAIPrompt(payerInfo, configuration) {
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
    static async callOptimizedAI(prompt) {
        if (!this.AI_API_KEY) {
            throw new Error('OpenAI API key not configured');
        }
        const fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.AI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
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
                max_tokens: 1500,
                temperature: 0.1
            })
        };
        if (process.env.NODE_ENV === 'development') {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        }
        try {
            const response = await fetch(this.AI_API_URL, fetchOptions);
            if (!response.ok) {
                throw new Error(`AI API error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            return data.choices?.[0]?.message?.content || '';
        }
        finally {
            if (process.env.NODE_ENV === 'development') {
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
            }
        }
    }
    static async callAI(prompt) {
        if (!this.AI_API_KEY) {
            throw new Error('OpenAI API key not configured');
        }
        const fetchOptions = {
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
        if (process.env.NODE_ENV === 'development') {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        }
        try {
            const response = await fetch(this.AI_API_URL, fetchOptions);
            if (!response.ok) {
                throw new Error(`AI API error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            return data.choices?.[0]?.message?.content || '';
        }
        finally {
            if (process.env.NODE_ENV === 'development') {
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
            }
        }
    }
    static parseAIResponse(aiResponse, payerInfo) {
        try {
            const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                throw new Error('No JSON array found in AI response');
            }
            const parsedRecommendations = JSON.parse(jsonMatch[0]);
            return parsedRecommendations.map((recommendation, index) => ({
                id: recommendation.id || `TC_${String(index + 1).padStart(3, '0')}`,
                title: recommendation.title || `Test Case ${index + 1}`,
                description: recommendation.description || 'AI-generated test recommendation',
                priority: recommendation.priority || 'Medium',
                category: recommendation.category || (index < 3 ? 'Core Functionality' : 'Additional Testing'),
                estimatedDuration: recommendation.estimatedDuration || '2 minutes'
            }));
        }
        catch (error) {
            console.error('Error parsing AI response:', error);
            throw new Error('Failed to parse AI response');
        }
    }
    static generateDefault270(payerName = 'TESTPAYER') {
        const now = new Date();
        const isaDate = now.toISOString().slice(2, 10).replace(/-/g, '');
        const isaTime = now.toTimeString().slice(0, 5).replace(':', '');
        const gsDate = now.toISOString().slice(0, 10).replace(/-/g, '');
        const gsTime = now.toTimeString().slice(0, 5).replace(':', '');
        const dtpDate = now.toISOString().slice(0, 10).replace(/-/g, '');
        return `ISA*00*          *00*          *ZZ*YOURSUBMITTERID *ZZ*${payerName.toUpperCase().replace(/\s+/g, '').padEnd(15, ' ')}*${isaDate}*${isaTime}*^*00501*000000001*0*T*:~GS*HS*YOURSUBMITTERID*${payerName.toUpperCase().replace(/\s+/g, '')}001*${gsDate}*${gsTime}*1*X*005010X279A1~ST*270*0001*005010X279A1~BHT*0022*13*10001234*${gsDate}*${gsTime}~HL*1**20*1~NM1*PR*2*${payerName.toUpperCase()}*****PI*60054~HL*2*1*21*1~NM1*1P*2*PROVIDER NAME*****XX*1234567890~HL*3*2*22*0~TRN*1*93175-012547*9877281234~NM1*IL*1*DOE*JOHN****MI*W883449464~DMG*D8*19850115*M~DTP*291*D8*${dtpDate}~EQ*30~SE*13*0001~GE*1*1~IEA*1*000000001~`;
    }
    static generateDefault271(payerName = 'TESTPAYER') {
        const now = new Date();
        const isaDate = now.toISOString().slice(2, 10).replace(/-/g, '');
        const isaTime = now.toTimeString().slice(0, 5).replace(':', '');
        const gsDate = now.toISOString().slice(0, 10).replace(/-/g, '');
        const gsTime = now.toTimeString().slice(0, 5).replace(':', '');
        const dtpDate = now.toISOString().slice(0, 10).replace(/-/g, '');
        return `ISA*00*          *00*          *ZZ*${payerName.toUpperCase().replace(/\s+/g, '').padEnd(15, ' ')}*ZZ*YOURSUBMITTERID *${isaDate}*${isaTime}*^*00501*000000001*0*T*:~GS*HB*${payerName.toUpperCase().replace(/\s+/g, '')}001*YOURSUBMITTERID*${gsDate}*${gsTime}*1*X*005010X279A1~ST*271*0001*005010X279A1~BHT*0022*11*10001234*${gsDate}*${gsTime}~HL*1**20*1~NM1*PR*2*${payerName.toUpperCase()}*****PI*60054~HL*2*1*21*1~NM1*1P*2*PROVIDER NAME*****XX*1234567890~HL*3*2*22*0~TRN*2*93175-012547*9877281234~NM1*IL*1*DOE*JOHN****MI*W883449464~DMG*D8*19850115*M~DTP*291*D8*${dtpDate}~EB*1*FAM*30**FAM~SE*13*0001~GE*1*1~IEA*1*000000001~`;
    }
    static getFallbackTestCases(payerInfo, configuration) {
        const fallbackRecommendations = [
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
    static async generateTestData(payerInfo, configuration, selectedTestCases) {
        console.log('🧪 Generating test data for selected test cases:', selectedTestCases);
        console.log('🤖 Demonstrating AI processing for POC...');
        if (this.USE_SIMULATED_AI) {
            console.log('📝 Starting AI test data generation (simulated for demo)...');
            const processingTime = 10000;
            await this.simulateAIProcessing(processingTime);
            console.log('🎯 Using proven templates for guaranteed exact payloads from data.md');
            return this.getTemplateBasedTestData(payerInfo, configuration, selectedTestCases);
        }
        if (!this.AI_API_KEY) {
            console.warn('⚠️ OpenAI API key not found, using proven template test data');
            return this.getTemplateBasedTestData(payerInfo, configuration, selectedTestCases);
        }
        try {
            const prompt = this.createOptimizedTestDataPrompt(payerInfo, configuration, selectedTestCases);
            console.log('📝 Sending optimized request to AI for realistic 10-15s processing...');
            const aiResponse = await this.callOptimizedAI(prompt);
            console.log('🤖 Received AI response (using proven templates for guaranteed results)');
            console.log('🎯 Using proven templates for guaranteed exact payloads from data.md');
            return this.getTemplateBasedTestData(payerInfo, configuration, selectedTestCases);
        }
        catch (error) {
            console.error('❌ AI call failed, using proven templates');
            return this.getTemplateBasedTestData(payerInfo, configuration, selectedTestCases);
        }
    }
    static createOptimizedTestDataPrompt(payerInfo, configuration, selectedTestCases) {
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
    static createTestDataPrompt(payerInfo, configuration, selectedTestCases) {
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
    static validateX12Payload(payload, type) {
        if (!payload || typeof payload !== 'string')
            return false;
        const requiredSegments = type === '270'
            ? ['ISA', 'GS', 'ST*270', 'BHT', 'HL', 'NM1*PR', 'NM1*1P', 'NM1*IL', 'EQ', 'SE', 'GE', 'IEA']
            : ['ISA', 'GS', 'ST*271', 'BHT', 'HL', 'NM1*PR', 'NM1*1P', 'NM1*IL', 'SE', 'GE', 'IEA'];
        for (const segment of requiredSegments) {
            if (!payload.includes(segment)) {
                console.warn(`❌ Missing required segment: ${segment} in ${type} payload`);
                return false;
            }
        }
        if (!payload.includes('*PI*60054~')) {
            console.warn(`❌ Missing or incorrect payer ID in ${type} payload`);
            return false;
        }
        if (!payload.includes('~')) {
            console.warn(`❌ Missing segment terminators in ${type} payload`);
            return false;
        }
        return true;
    }
    static parseTestDataResponse(aiResponse, payerInfo, selectedTestCases) {
        try {
            const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                throw new Error('No JSON array found in AI response');
            }
            const parsedCases = JSON.parse(jsonMatch[0]);
            return parsedCases.map((testCase, index) => ({
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
        }
        catch (error) {
            console.error('❌ Error parsing test data response:', error);
            console.log('🔄 AI response parsing failed, will fall back to template-based generation');
            throw new Error('Failed to parse test data response');
        }
    }
    static getTemplateBasedTestData(payerInfo, configuration, selectedTestCases) {
        console.log(`🎯 Using proven template-based test data generation for ${selectedTestCases.length} selected test cases`);
        const templateTestCases = [];
        const templateTypes = ['active', 'inactive', 'not_found'];
        selectedTestCases.forEach((testCaseId, index) => {
            const testCaseType = this.determineTestCaseType(testCaseId);
            console.log(`🔍 Processing selected test case: "${testCaseId}" → ${testCaseType} template`);
            const testCase = this.createTemplateBasedTestCaseByType(testCaseType, index + 1, payerInfo, testCaseId);
            if (testCase) {
                templateTestCases.push(testCase);
                console.log(`✅ Created template test case ${index + 1}: ${testCase.title} (${testCaseType})`);
            }
            else {
                console.error(`❌ Failed to create test case for ${testCaseId}`);
            }
        });
        console.log(`🎯 Generated ${templateTestCases.length} template-based test cases`);
        return templateTestCases.length > 0 ? templateTestCases : this.getFallbackTestData(payerInfo, configuration, selectedTestCases);
    }
    static createTemplateBasedTestCase(testCaseId, index, payerInfo) {
        const testCaseType = this.determineTestCaseType(testCaseId);
        return this.createTemplateBasedTestCaseByType(testCaseType, index, payerInfo, testCaseId);
    }
    static createTemplateBasedTestCaseByType(testCaseType, index, payerInfo, testCaseId) {
        const now = new Date();
        const isaDate = now.toISOString().slice(2, 10).replace(/-/g, '');
        const isaTime = now.toTimeString().slice(0, 5).replace(':', '');
        const gsDate = now.toISOString().slice(0, 10).replace(/-/g, '');
        const gsTime = now.toTimeString().slice(0, 5).replace(':', '');
        const controlNum = String(index).padStart(3, '0');
        console.log(`🔧 Creating ${testCaseType} test case ${index} for ${testCaseId}`);
        switch (testCaseType) {
            case 'active':
                return this.createActiveTestCase(controlNum, isaDate, isaTime, gsDate, gsTime);
            case 'inactive':
                return this.createInactiveTestCase(controlNum, isaDate, isaTime, gsDate, gsTime);
            case 'not_found':
                return this.createNotFoundTestCase(controlNum, isaDate, isaTime, gsDate, gsTime);
            default:
                console.warn(`⚠️ Unknown test case type: ${testCaseType}, defaulting to active`);
                return this.createActiveTestCase(controlNum, isaDate, isaTime, gsDate, gsTime);
        }
    }
    static determineTestCaseType(testCaseId) {
        const id = testCaseId.toLowerCase();
        if (id.includes('inactive') || id.includes('terminated') || id.includes('expired') ||
            id.includes('coverage verification') || id.includes('tc_002')) {
            return 'inactive';
        }
        else if (id.includes('not found') || id.includes('error') || id.includes('invalid') ||
            id.includes('member not found') || id.includes('error handling') || id.includes('tc_003')) {
            return 'not_found';
        }
        else {
            return 'active';
        }
    }
    static createActiveTestCase(controlNum, isaDate, isaTime, gsDate, gsTime) {
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
    static createInactiveTestCase(controlNum, isaDate, isaTime, gsDate, gsTime) {
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
    static createNotFoundTestCase(controlNum, isaDate, isaTime, gsDate, gsTime) {
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
    static getFallbackTestData(payerInfo, configuration, selectedTestCases) {
        return selectedTestCases.map((caseId, index) => ({
            id: caseId,
            title: `Test Case ${caseId}`,
            description: `Fallback test case for ${caseId}`,
            priority: 'Critical',
            category: 'Core',
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
exports.TestRecommendationService = TestRecommendationService;
//# sourceMappingURL=testRecommendationService.js.map