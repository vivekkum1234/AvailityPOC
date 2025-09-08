# 🏥 APOC - AI-Powered Test Case Generator for X12 EDI 270/271 Transactions

A comprehensive healthcare EDI testing platform that generates intelligent test cases and realistic synthetic data for X12 270/271 eligibility verification transactions using AI.

## 🎯 Overview

APOC (Availity Proof of Concept) is a comprehensive healthcare EDI implementation and testing platform designed for healthcare payers implementing X12 EDI 270/271 eligibility verification. The platform provides a complete workflow from initial implementation questionnaire through AI-powered test case generation to final validation.

### 🔄 Complete Implementation Workflow

1. **📋 Digital Questionnaire**: Interactive implementation questionnaire capturing payer-specific requirements, technical specifications, and implementation mode selection (Real-time B2B, Real-time Web, or Batch processing)

2. **🤖 AI-Powered Analysis**: Intelligent analysis of questionnaire responses to generate contextual test scenarios tailored to the specific payer configuration and implementation approach

3. **📊 Test Data Generation**: AI creates complete X12 270/271 payloads with realistic synthetic data including healthcare provider information, member details, and trading partner data

4. **⚡ Automated Testing**: Real-time test execution against mock payer endpoints with comprehensive X12 format validation and business rule compliance checking

### ✨ Key Features

- **📋 Digital Questionnaire**: Interactive X12 270/271 implementation questionnaire
- **🔄 Multi-Mode Support**: Real-time B2B, Real-time Web, and Batch processing modes
- **🤖 AI-Powered Test Recommendations**: Generate 12 dynamic test cases based on payer configuration
- **📊 Intelligent Test Data Generation**: Create complete X12 270/271 payloads with realistic synthetic data
- **🏥 Healthcare-Focused**: Provider names, NPIs, member IDs, and trading partner data
- **⚡ Real-Time Testing**: Execute test cases against mock payer endpoints
- **✅ Comprehensive Validation**: X12 format validation and business rule checking
- **📈 Progress Tracking**: Visual progress indicators and submission management
- **🎨 Professional UI**: Clean, responsive interface for complete workflow management

## 🚀 Live Demo

- **Frontend**: [https://availitypoc.vercel.app](https://availitypoc.vercel.app)
- **Backend API**: [https://availitypoc-production.up.valuelabs.app](https://availitypoc-production.up.valuelabs.app)
- **API Documentation**: [https://availitypoc-production.up.valuelabs.app/api](https://availitypoc-production.up.valuelabs.app/api)

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Express Backend │    │   Supabase DB   │
│                 │    │                 │    │                 │
│ • Questionnaire │◄──►│ • AI Integration │◄──►│ • Questionnaires│
│ • Test Case UI  │    │ • X12 Generation │    │ • Submissions   │
│ • Data Display  │    │ • Mock Payer     │    │ • Test Results  │
│ • Execution     │    │ • Validation     │    │ • User Data     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   OpenAI API    │
                    │                 │
                    │ • GPT-4 Turbo   │
                    │ • Test Gen      │
                    │ • Synthetic Data│
                    └─────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vercel** deployment

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **OpenAI API** for AI-powered generation
- **Supabase** for database
- **Railway** deployment

### AI Integration
- **OpenAI GPT-4 Turbo** for test case generation
- **Custom prompts** for healthcare EDI context
- **Realistic synthetic data** generation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key
- Supabase account

### 1. Clone Repository
```bash
git clone https://github.com/ramki271/AvailityPOC.git
cd AvailityPOC
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Add your API keys:
# OPENAI_API_KEY=your_openai_key
# SUPABASE_URL=your_supabase_url
# SUPABASE_ANON_KEY=your_supabase_key

npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Access Application
- Frontend: http://localhost:3003
- Backend API: http://localhost:3002
- API Docs: http://localhost:3002/api

## 📋 Complete Workflow Guide

### 1. Digital Questionnaire (Implementation Setup)
1. **Access Questionnaire**: Navigate to the main questionnaire section
2. **Select Implementation Mode**: Choose from:
   - **Real-time B2B**: Direct payer-to-payer integration
   - **Real-time Web**: Web portal integration
   - **Batch**: File-based processing
3. **Fill Implementation Details**:
   - Payer information and contact details
   - Supported service types (30, 12, 13, 35, 88, AL, MH)
   - Search options (Patient ID + DOB, Patient ID + Name + DOB, etc.)
   - Technical specifications (XML wrapper, system hours, thread limits)
   - Testing environment details
4. **Submit Configuration**: Save your implementation setup

### 2. Review Submissions
1. **View Submissions**: Check all submitted questionnaire responses
2. **Track Progress**: Monitor completion status and timestamps
3. **Edit if Needed**: Update configurations as requirements change

### 3. Generate Test Recommendations (AI-Powered)
1. **Access Payer Testing**: Go to "Payer Testing" section
2. **Select Configuration**: Choose your submitted payer configuration
3. **Generate Recommendations**: Click "Generate Test Recommendations"
4. **AI Processing**: Wait 20-30 seconds for intelligent analysis
5. **Review Results**: Get 12 contextual test cases based on your configuration

### 4. Generate Test Data (AI-Powered)
1. **Select Test Cases**: Choose from AI-generated recommendations
2. **Generate Data**: Click "Generate Test Data"
3. **AI Processing**: Wait 20-30 seconds for complete X12 payload generation
4. **Review Output**:
   - Complete X12 270 request payloads
   - Complete X12 271 response payloads
   - Realistic synthetic data (provider names, NPIs, member IDs)
   - Validation rules and business logic

### 5. Execute Tests
1. **Select Test Cases**: Choose generated test cases to run
2. **Execute**: Click "Execute Tests" against mock payer endpoint
3. **Real-time Results**: View immediate test execution results
4. **Validation**: Check X12 format validation and business rule compliance
5. **Analysis**: Review response times and success/failure rates

## 📋 Questionnaire Structure

### Implementation Modes

#### 🔄 Real-time B2B
- **Direct Integration**: Payer-to-payer real-time connectivity
- **Use Cases**: Live eligibility verification, instant responses
- **Technical Requirements**: API endpoints, authentication, real-time processing
- **Configuration**: Service types, search options, system specifications

#### 🌐 Real-time Web
- **Web Portal**: Browser-based eligibility checking
- **Use Cases**: Provider portals, member self-service
- **Technical Requirements**: Web interface, session management, responsive design
- **Configuration**: UI preferences, user authentication, web-specific settings

#### 📦 Batch Processing
- **File-based**: Bulk eligibility processing
- **Use Cases**: Overnight processing, bulk verification
- **Technical Requirements**: File formats, scheduling, batch validation
- **Configuration**: File specifications, processing windows, error handling

### Questionnaire Sections

1. **Payer Information**: Organization details, contact information
2. **Implementation Mode**: Technical approach selection
3. **Service Types**: Supported X12 service type codes
4. **Search Options**: Member lookup capabilities
5. **Technical Specifications**: System requirements and limitations
6. **Testing Environment**: Test endpoint and validation setup

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Server Configuration
PORT=3002
NODE_ENV=development
```

#### Frontend (.env.local)
```env
REACT_APP_API_URL=http://localhost:3002
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
npm run test:watch
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📦 Deployment

### Backend (Railway)
1. Connect GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to main

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `build`
4. Deploy automatically on push to main

## 🤖 AI Features

### Test Recommendation Generation
- **Context-Aware**: Analyzes payer configuration
- **Healthcare-Specific**: Understands EDI 270/271 requirements
- **Dynamic Scenarios**: Generates relevant test cases
- **Priority-Based**: Critical vs Medium priority classification

### Test Data Generation
- **Complete X12 Payloads**: Full ISA~GS~ST~...~IEA segments
- **Realistic Synthetic Data**: 
  - Provider names: "RIVERSIDE MEDICAL CENTER"
  - NPIs: Valid 10-digit provider identifiers
  - Member IDs: Healthcare-format member identifiers
  - Trading partners: Availity, Aetna, BCBS, etc.

## 📊 Sample Output

### Questionnaire Submission
```json
{
  "id": "410a13ca-b41e-4be8-b2c4-ca8ed4c51e87",
  "organization_id": "AETNA_IMPL_001",
  "implementation_mode": "real_time_b2b",
  "payer_name": "Aetna Better Health",
  "contact_email": "implementation@aetna.com",
  "supported_service_types": ["30", "12", "13", "35", "88", "AL", "MH"],
  "search_options": ["Patient Id Dob", "Patient Id Name Dob", "Patient Id First Last"],
  "test_environment": "Available",
  "xml_wrapper": false,
  "system_hours": "24/7",
  "max_threads": 10,
  "submitted_at": "2024-09-08T15:30:00Z",
  "submitted_by": "John Smith"
}
```

### Generated Test Case
```json
{
  "id": "TC_001",
  "title": "Active Member Eligibility Verification",
  "memberData": {
    "memberId": "W883449464",
    "firstName": "JOHN",
    "lastName": "DOE",
    "serviceType": "30"
  },
  "syntheticData": {
    "providerName": "RIVERSIDE MEDICAL CENTER",
    "providerNPI": "1234567890",
    "senderId": "030240928",
    "receiverId": "AETNA"
  },
  "request270": {
    "payload": "ISA*00*...*EQ*30~SE*13*0001~GE*1*1~IEA*1*000000001~"
  },
  "expectedResponse271": {
    "payload": "ISA*00*...*EB*1*IND*30****1~SE*13*0001~GE*1*1~IEA*1*000000001~"
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For questions or support:
- Create an issue in this repository
- Contact the development team
- Check the [documentation](./docs/) folder

## 🎯 Roadmap

- [ ] Additional payer integrations
- [ ] Enhanced AI prompts for edge cases
- [ ] Real-time collaboration features
- [ ] Advanced analytics dashboard
- [ ] Custom test scenario builder

---

**Built with ❤️ for the healthcare EDI community**
