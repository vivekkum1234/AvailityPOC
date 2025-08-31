# APOC - Availity POC Digital Questionnaire

A proof-of-concept digital questionnaire system for X12 HIPAA transaction implementation, transforming the current PDF-based process into an interactive TurboTax-style wizard.

## 🎯 Project Overview

This POC demonstrates the transformation of Availity's current PDF-based X12 270/271 questionnaire into a modern, digital, collaborative platform with:

- **TurboTax-style navigation** with step-by-step wizard interface
- **Conditional logic** showing/hiding questions based on implementation mode and previous answers
- **Real-time auto-save** functionality
- **Multi-user collaboration** capabilities
- **Field-level validation** with X12-specific rules
- **Progress tracking** and audit trails
- **Export capabilities** (PDF for customers, JSON/CSV for Availity)

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Hook Form** for form management and validation
- **Zod** for schema validation

### Backend
- **Node.js** with Express and TypeScript
- **RESTful API** design
- **In-memory storage** (for POC - database integration planned)
- **Zod** for request/response validation

### Current Implementation Status
✅ **Project Setup** - Complete  
✅ **API Architecture** - Complete  
🔄 **Question Types & Validation** - In Progress  
⏳ **Decision Tree Logic** - Planned  
⏳ **TurboTax Navigation** - Planned  
⏳ **Auto-save & Session Management** - Planned  

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd APOC
   npm install
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend && npm install
   
   # Install frontend dependencies  
   cd ../frontend && npm install
   ```

3. **Start development servers**
   ```bash
   # From project root - starts both frontend and backend
   npm run dev
   
   # Or start individually:
   npm run dev:backend  # Backend on http://localhost:3001
   npm run dev:frontend # Frontend on http://localhost:3000
   ```

### API Endpoints

**Questionnaires:**
- `GET /api/questionnaires` - List all questionnaires
- `GET /api/questionnaires/:id` - Get specific questionnaire
- `GET /api/questionnaires/:id/sections` - Get questionnaire sections
- `GET /api/questionnaires/:id/sections/:sectionId` - Get specific section

**Responses:**
- `POST /api/responses` - Create new response
- `GET /api/responses/:id` - Get response
- `PUT /api/responses/:id` - Update response
- `PUT /api/responses/:id/sections/:sectionId` - Update section response
- `POST /api/responses/:id/submit` - Submit questionnaire

**Health Check:**
- `GET /health` - Server health status

## 📋 Current Questionnaire Structure

Based on the existing `fields.md`, the questionnaire includes:

### 1. Enveloping Requirements
- ISA Envelope Fields (ISA05, ISA06, ISA07, ISA08, ISA11, ISA16)
- GS Functional Group Fields (GS02, GS03)
- Payer Information Fields (2100A NM103, 2100A NM109)

### 2. Payer Enhancements
- Uppercase character preferences
- X12 character set support
- Extended character set support

### 3. Trading Partner Documentation
- Email notification requirements
- Implementation mode selection (Real-time web, Real-time B2B, EDI batch)

### 4. Additional Sections (from fields.md)
- Payer-Specific Processing Errors/Edits
- Search Options
- Response Configuration
- Transaction Mode-Specific Sections

## 🔧 Key Features Implemented

### Question Types
- ✅ Text input with validation
- ✅ Radio buttons (single select)
- ✅ Checkboxes (multi-select)
- ✅ Dropdown/Select
- ✅ Email validation
- ✅ URL validation
- ✅ Number input with min/max
- ✅ Date picker
- ✅ Textarea for long text

### Conditional Logic
- ✅ Show/hide questions based on previous answers
- ✅ Implementation mode filtering
- ✅ Dependency chains

### Validation
- ✅ Required field validation
- ✅ Length constraints (min/max)
- ✅ Pattern matching (regex)
- ✅ X12-specific field validation

## 🎨 UI/UX Features

- **Progress indicator** showing completion percentage
- **Section navigation** with visual completion status
- **Auto-save indicators** for data persistence
- **Help tooltips** for complex questions
- **X12 field mapping** display for technical context
- **Responsive design** for mobile/tablet compatibility

## 🔄 Next Steps

1. **Complete Question Types** - Finish validation system
2. **Decision Tree Engine** - Advanced conditional logic
3. **TurboTax Navigation** - Smooth wizard experience
4. **Auto-save Implementation** - Real-time data persistence
5. **Database Integration** - Replace in-memory storage
6. **User Management** - Authentication and collaboration
7. **Export Features** - PDF/CSV generation
8. **Testing Suite** - Comprehensive test coverage

## 📁 Project Structure

```
APOC/
├── backend/
│   ├── src/
│   │   ├── data/           # Questionnaire data
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   └── index.ts        # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx         # Main app component
│   └── package.json
├── docs/                   # Documentation
├── fields.md              # Original PDF field structure
├── requirements.md        # Project requirements
└── package.json          # Root package.json
```

## 🤝 Contributing

This is a POC project. For questions or suggestions, please reach out to the Availity team.

## 📄 License

MIT License - see LICENSE file for details.
