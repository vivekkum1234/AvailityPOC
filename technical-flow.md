# Technical Flow Documentation

## System Architecture Overview

### High-Level Architecture
```
PDF Source → Field Extraction → JSON Generation → Backend TypeScript → API → Frontend React
```

## Data Flow Pipeline

### 1. PDF Field Extraction
**Input**: PDF questionnaire files
**Output**: Raw field definitions

**Process**:
```
PDF Files → Python Scripts → extracted_fields/fields_raw.json
```

**Key Scripts**:
- `scripts/extract_fields.sh` - Main extraction orchestrator
- `scripts/analyze_form_controls.py` - PDF form field analysis
- `scripts/analyze_transaction_modes.py` - Mode-based logic extraction

**Output Structure**:
```json
{
  "field_id": {
    "name": "Human readable name",
    "type": "text|email|radio|checkbox",
    "section": "section_identifier",
    "required": true|false,
    "options": [...] // for radio/checkbox
  }
}
```

### 2. Questionnaire Generation
**Input**: Raw field definitions + business logic
**Output**: Complete questionnaire structure

**Process**:
```
fields_raw.json → generate_complete_questionnaire.py → complete_questionnaire.json
```

**Key Scripts**:
- `scripts/generate_complete_questionnaire.py` - Main questionnaire builder
- `scripts/create_proper_contact_structure.py` - Contact section structuring
- `scripts/update_contact_field_names.py` - Field name normalization

**Output Structure**:
```json
{
  "id": "questionnaire_id",
  "title": "Questionnaire Title",
  "sections": [
    {
      "id": "section_id",
      "title": "Section Title", 
      "order": 1,
      "questions": [
        {
          "id": "question_id",
          "type": "text|email|radio|checkbox|display",
          "title": "Question Title",
          "required": true|false,
          "conditionalLogic": {...},
          "validation": {...}
        }
      ]
    }
  ]
}
```

### 3. Backend TypeScript Generation
**Input**: Complete questionnaire JSON
**Output**: TypeScript data file for backend

**Process**:
```
complete_questionnaire.json → convert_questionnaire_to_backend.py → x12-270-271-complete.ts
```

**Key Scripts**:
- `scripts/convert_questionnaire_to_backend.py` - JSON to TypeScript converter
- `scripts/remove_x12_mappings.py` - X12 field cleanup utility

**Output Structure**:
```typescript
export const x12270271CompleteQuestionnaire: Questionnaire = {
  id: 'x12-270-271-complete',
  title: 'X12 270/271 Implementation Questionnaire',
  sections: [
    {
      id: 'contact-information',
      questions: [
        {
          id: 'trading-partner-technical-header',
          type: QuestionType.DISPLAY,
          title: 'Trading Partner Technical Contact'
        },
        {
          id: 'trading-partner-technical-name',
          type: QuestionType.TEXT,
          title: 'Trading Partner Technical Contact - Name'
        }
      ]
    }
  ]
};
```

## Backend Architecture

### Core Components

#### 1. Type Definitions (`backend/src/types/questionnaire.ts`)
```typescript
export enum QuestionType {
  TEXT = 'text',
  EMAIL = 'email',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  DISPLAY = 'display'
  // ... other types
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  required: boolean;
  conditionalLogic?: ConditionalLogic;
  validation?: QuestionValidation;
}

export interface Section {
  id: string;
  title: string;
  order: number;
  questions: Question[];
}

export interface Questionnaire {
  id: string;
  title: string;
  sections: Section[];
}
```

#### 2. Data Layer (`backend/src/data/x12-270-271-complete.ts`)
- Static TypeScript export of complete questionnaire
- Generated from JSON via conversion script
- Contains all sections, questions, and metadata

#### 3. Service Layer (`backend/src/services/questionnaireService.ts`)
```typescript
class QuestionnaireService {
  // Get all sections
  getSections(): Section[]
  
  // Get specific section
  getSection(sectionId: string): Section | null
  
  // Get questions with conditional logic applied
  getQuestionsForSection(sectionId: string, mode?: string): Question[]
}
```

#### 4. API Layer (`backend/src/routes/`)
```
GET /api/questionnaires/:id/sections
GET /api/questionnaires/:id/sections/:sectionId
POST /api/questionnaires/:id/responses
```

### Backend Data Flow
```
TypeScript Data File → Service Layer → API Routes → JSON Response
```

## Frontend Architecture

### Core Components

#### 1. Type Definitions (`frontend/src/types/questionnaire.ts`)
- Mirrors backend types exactly
- Ensures type safety across frontend

#### 2. Local Storage Service (`frontend/src/services/localStorageService.ts`)
```typescript
interface StoredResponse {
  questionnaireId: string;
  sectionId: string;
  responses: Record<string, any>;
  lastUpdated: string;
  implementationMode?: string;
}

class LocalStorageService {
  private static STORAGE_KEY = 'questionnaire_responses';

  // Save response data
  saveResponse(questionnaireId: string, sectionId: string, responses: Record<string, any>): void {
    const stored = this.getAllResponses();
    const key = `${questionnaireId}_${sectionId}`;
    stored[key] = {
      questionnaireId,
      sectionId,
      responses,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stored));
  }

  // Get response data
  getResponse(questionnaireId: string, sectionId: string): Record<string, any> {
    const stored = this.getAllResponses();
    const key = `${questionnaireId}_${sectionId}`;
    return stored[key]?.responses || {};
  }

  // Auto-save functionality
  autoSave(questionnaireId: string, sectionId: string, fieldId: string, value: any): void {
    const responses = this.getResponse(questionnaireId, sectionId);
    responses[fieldId] = value;
    this.saveResponse(questionnaireId, sectionId, responses);
  }

  // Get all stored responses
  private getAllResponses(): Record<string, StoredResponse> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  // Clear all data (for testing)
  clearAll(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Export responses for demo/testing
  exportResponses(): string {
    return JSON.stringify(this.getAllResponses(), null, 2);
  }
}

export const localStorageService = new LocalStorageService();
```

#### 3. Main App (`frontend/src/App.tsx`)
```typescript
function App() {
  // Fetch sections from API
  // Load saved responses from localStorage
  // Manage global state with persistence
  // Render QuestionnaireWizard
}
```

#### 4. Questionnaire Wizard (`frontend/src/components/QuestionnaireWizard.tsx`)
```typescript
export const QuestionnaireWizard: React.FC = ({
  sections,
  onSectionComplete,
  onAutoSave
}) => {
  const [responses, setResponses] = useState<Record<string, any>>({});

  // Load saved responses on mount
  useEffect(() => {
    const savedResponses = localStorageService.getResponse(
      'x12-270-271-complete',
      currentSection.id
    );
    setResponses(savedResponses);
  }, [currentSection]);

  // Auto-save on field change
  const handleFieldChange = (fieldId: string, value: any) => {
    setResponses(prev => ({ ...prev, [fieldId]: value }));

    // Auto-save to localStorage
    localStorageService.autoSave(
      'x12-270-271-complete',
      currentSection.id,
      fieldId,
      value
    );
  };

  // Section navigation logic
  // Conditional question filtering
  // Form state management with persistence
  // Progress tracking
}
```

#### 4. Question Renderer (`frontend/src/components/QuestionRenderer.tsx`)
```typescript
export const QuestionRenderer: React.FC = ({
  question,
  value,
  onChange,
  error
}) => {
  // Handle DISPLAY questions as headers
  if (question.type === QuestionType.DISPLAY) {
    return <SectionHeader />
  }
  
  // Render appropriate input based on question type
  switch (question.type) {
    case QuestionType.TEXT:
    case QuestionType.EMAIL:
      return <TextInput />
    case QuestionType.RADIO:
      return <RadioGroup />
    // ... other types
  }
}
```

### Frontend Data Flow
```
API Call → State Management → LocalStorage Load → Wizard Component → Question Renderer → User Input
                                      ↓
                              Auto-save to LocalStorage
```

### Local Storage Structure
```json
{
  "questionnaire_responses": {
    "x12-270-271-complete_contact-information": {
      "questionnaireId": "x12-270-271-complete",
      "sectionId": "contact-information",
      "responses": {
        "trading-partner-technical-name": "John Doe",
        "trading-partner-technical-phone": "555-0123",
        "trading-partner-technical-email": "john@company.com"
      },
      "lastUpdated": "2025-08-28T10:30:00.000Z"
    },
    "x12-270-271-complete_enveloping-requirements": {
      "questionnaireId": "x12-270-271-complete",
      "sectionId": "enveloping-requirements",
      "responses": {
        "isa06-270": "030240928",
        "implementation-mode": "real_time_web"
      },
      "lastUpdated": "2025-08-28T10:35:00.000Z"
    }
  }
}
```

## Question Type Handling

### Display Questions (Headers)
```typescript
// Backend Generation
{
  type: QuestionType.DISPLAY,
  title: "Trading Partner Technical Contact"
}

// Frontend Rendering
if (question.type === QuestionType.DISPLAY) {
  return (
    <div className="mb-6 mt-8">
      <h3 className="text-xl font-bold border-b-2 border-availity-500">
        {question.title}
      </h3>
    </div>
  );
}
```

### Input Questions (Data Collection)
```typescript
// Backend Generation  
{
  type: QuestionType.TEXT,
  title: "Trading Partner Technical Contact - Name",
  required: true
}

// Frontend Rendering
<div className="card p-8">
  <div className="flex items-start space-x-4">
    <div className="question-number">{questionNumber}</div>
    <TextInput question={question} />
  </div>
</div>
```

## Conditional Logic System

### Backend Structure
```typescript
interface ConditionalLogic {
  dependsOn?: string;        // Question ID this depends on
  showWhen?: string[];       // Values that show this question
  hideWhen?: string[];       // Values that hide this question
  requiredModes?: ImplementationMode[]; // Required implementation modes
}
```

### Frontend Processing
```typescript
// Filter questions based on conditional logic
const visibleQuestions = section.questions.filter(question => {
  if (!question.conditionalLogic) return true;
  
  const { dependsOn, showWhen, hideWhen } = question.conditionalLogic;
  const dependentValue = responses[dependsOn];
  
  if (showWhen && !showWhen.includes(dependentValue)) return false;
  if (hideWhen && hideWhen.includes(dependentValue)) return false;
  
  return true;
});
```

## Contact Information Specific Flow

### Structure
```
8 Contact Types × 4 Questions Each = 32 Total Questions
├── 8 Header Questions (type: DISPLAY) - Section dividers
└── 24 Input Questions (type: TEXT/EMAIL) - Data collection
    ├── Name fields (8)
    ├── Phone fields (8) 
    └── Email fields (8)
```

### Rendering Logic
```typescript
// Wizard separates display from input questions
visibleQuestions.map((question, index) => {
  if (question.type === QuestionType.DISPLAY) {
    // Render as section header (no card, no number)
    return <QuestionRenderer key={question.id} question={question} />
  }
  
  // Calculate question number excluding display questions
  const questionNumber = visibleQuestions
    .slice(0, index)
    .filter(q => q.type !== QuestionType.DISPLAY).length + 1;
    
  // Render as numbered input card
  return (
    <div className="card">
      <div className="question-number">{questionNumber}</div>
      <QuestionRenderer question={question} />
    </div>
  );
});
```

## API Response Format

### Sections List
```json
{
  "data": [
    {
      "id": "contact-information",
      "title": "Contact Information", 
      "description": "Primary and secondary contacts",
      "order": 3,
      "questionCount": 24  // Excludes display questions
    }
  ]
}
```

### Section Detail
```json
{
  "data": {
    "id": "contact-information",
    "title": "Contact Information",
    "questions": [
      {
        "id": "trading-partner-technical-header",
        "type": "display",
        "title": "Trading Partner Technical Contact",
        "required": false
      },
      {
        "id": "trading-partner-technical-name", 
        "type": "text",
        "title": "Trading Partner Technical Contact - Name",
        "required": true,
        "validation": { "maxLength": 100 }
      }
    ]
  }
}
```

## Development Workflow

### Adding New Questions
1. Update `extracted_fields/fields_raw.json`
2. Run `python3 scripts/generate_complete_questionnaire.py`
3. Run `python3 scripts/convert_questionnaire_to_backend.py`
4. Backend automatically reloads with new data
5. Frontend fetches updated structure

### Modifying Question Types
1. Update type definitions in both backend and frontend
2. Add rendering logic to `QuestionRenderer.tsx`
3. Update conversion script mapping
4. Regenerate backend data

### Testing Data Flow
1. **Backend**: Test API endpoints return correct structure
2. **Frontend**: Verify questions render with proper types
3. **Integration**: Test form submission and data persistence
4. **Conditional Logic**: Verify show/hide behavior works correctly
