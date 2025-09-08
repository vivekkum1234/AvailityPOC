# 🏥 APOC - AI-Powered Test Case Generator for X12 EDI 270/271 Transactions

A comprehensive healthcare EDI testing platform that generates intelligent test cases and realistic synthetic data for X12 270/271 eligibility verification transactions using AI.

## 🎯 Overview

APOC (Availity Proof of Concept) is an advanced test case generation system designed for healthcare payers implementing X12 EDI 270/271 eligibility verification. The platform uses AI to generate contextual test scenarios and complete X12 payloads with realistic synthetic data.

### ✨ Key Features

- **🤖 AI-Powered Test Recommendations**: Generate 12 dynamic test cases based on payer configuration
- **📋 Intelligent Test Data Generation**: Create complete X12 270/271 payloads with realistic synthetic data
- **🏥 Healthcare-Focused**: Provider names, NPIs, member IDs, and trading partner data
- **⚡ Real-Time Testing**: Execute test cases against mock payer endpoints
- **📊 Comprehensive Validation**: X12 format validation and business rule checking
- **🎨 Professional UI**: Clean, responsive interface for test case management

## 🚀 Live Demo

- **Frontend**: [https://availitypoc.vercel.app](https://availitypoc.vercel.app)
- **Backend API**: [https://availitypoc-production.up.valuelabs.app](https://availitypoc-production.up.valuelabs.app)
- **API Documentation**: [https://availitypoc-production.up.valuelabs.app/api](https://availitypoc-production.up.valuelabs.app/api)

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Express Backend │    │   Supabase DB   │
│                 │    │                 │    │                 │
│ • Test Case UI  │◄──►│ • AI Integration │◄──►│ • Questionnaires│
│ • Data Display  │    │ • X12 Generation │    │ • Submissions   │
│ • Execution     │    │ • Mock Payer     │    │ • Test Results  │
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

## 📋 Usage Guide

### 1. Create Payer Configuration
1. Navigate to the questionnaire section
2. Fill out payer implementation details
3. Submit configuration

### 2. Generate Test Recommendations
1. Go to "Payer Testing" section
2. Select your payer configuration
3. Click "Generate Test Recommendations"
4. Wait 20-30 seconds for AI processing

### 3. Generate Test Data
1. Select test cases from recommendations
2. Click "Generate Test Data"
3. Review generated X12 270/271 payloads
4. Verify realistic synthetic data

### 4. Execute Tests
1. Select test cases to run
2. Click "Execute Tests"
3. Review validation results
4. Check business rule compliance

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
