import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/outline';
import { apiService } from '../services/api';
import { ExtractionAgent } from '../components/ExtractionAgent';
import { Section, Question } from '../types/questionnaire';
import { useExtractionData } from '../contexts/ExtractionDataContext';


interface MappedField {
  pdfFieldName: string;
  pdfFieldType: string;
  pdfValue: any;
  questionId: string | null;
  mappedValue: any;
  section: 'common' | 'mode2_realtime_b2b' | 'unknown';
  fieldIndex: number;
  pageNumber: number;
  yPosition?: number;
  xPosition?: number;
}

interface ExtractionResult {
  fileName: string;
  fileSize: number;
  totalFields: number;
  totalPages: number;
  commonFields: MappedField[];
  b2bFields: MappedField[];
  allFields: MappedField[]; // All fields in extraction order
  summary: {
    totalExtracted: number;
    commonExtracted: number;
    b2bExtracted: number;
    commonMapped: number;
    b2bMapped: number;
    unmapped: number;
  };
}

export const PDFExtractor: React.FC = () => {
  const navigate = useNavigate();
  const { setExtractionData } = useExtractionData();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Extraction agent states
  const [showAgent, setShowAgent] = useState(false);
  const [agentStep, setAgentStep] = useState<'extracting' | 'mapping' | 'complete' | null>(null);
  const [extractedCount, setExtractedCount] = useState(0);
  const [mappedCount, setMappedCount] = useState(0);

  // Questionnaire data for field titles
  const [questionnaireSections, setQuestionnaireSections] = useState<Section[]>([]);
  const [questionMap, setQuestionMap] = useState<Map<string, Question>>(new Map());

  // Load questionnaire data on mount
  useEffect(() => {
    const loadQuestionnaire = async () => {
      try {
        const sections = await apiService.getQuestionnaireSections('x12-270-271-complete');
        setQuestionnaireSections(sections);

        // Build a map of questionId -> Question for quick lookup
        const qMap = new Map<string, Question>();
        sections.forEach(section => {
          section.questions.forEach(question => {
            qMap.set(question.id, question);
          });
        });
        setQuestionMap(qMap);
      } catch (err) {
        console.error('Failed to load questionnaire:', err);
      }
    };

    loadQuestionnaire();
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setExtractionResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setShowAgent(true);

    try {
      // Step 1: Extracting (show for 1.5 seconds)
      setAgentStep('extracting');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Call the API
      const result = await apiService.uploadAndExtractPDF(selectedFile);

      // Step 2: Mapping (show for 1.5 seconds)
      setAgentStep('mapping');
      setExtractedCount(result.summary.totalExtracted);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 3: Complete
      setAgentStep('complete');
      setMappedCount(result.summary.commonMapped + result.summary.b2bMapped);

      // Wait for completion animation, then show results
      await new Promise(resolve => setTimeout(resolve, 1500));
      setExtractionResult(result);
      setShowAgent(false);
      setAgentStep(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract PDF');
      setShowAgent(false);
      setAgentStep(null);
    } finally {
      setIsUploading(false);
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  };

  // Get question title from questionId
  const getQuestionTitle = (questionId: string): string => {
    const question = questionMap.get(questionId);
    return question?.title || questionId;
  };

  // Filter to only mapped fields
  const getMappedFields = (fields: MappedField[]) => {
    return fields.filter(field => field.questionId !== null);
  };

  // Handle auto-populate button click
  const handleAutoPopulate = () => {
    if (!extractionResult) return;

    // Prepare extraction data for context
    const commonMappedFields = getMappedFields(extractionResult.commonFields).map(field => ({
      questionId: field.questionId!,
      value: field.mappedValue
    }));

    const b2bMappedFields = getMappedFields(extractionResult.b2bFields).map(field => ({
      questionId: field.questionId!,
      value: field.mappedValue
    }));

    // Save to context
    setExtractionData({
      fileName: extractionResult.fileName,
      extractedAt: new Date().toISOString(),
      commonFields: commonMappedFields,
      b2bFields: b2bMappedFields
    });

    console.log('[PDFExtractor] Saved extraction data to context:', {
      commonFields: commonMappedFields.length,
      b2bFields: b2bMappedFields.length
    });

    // Navigate to onboarding form
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Extraction Agent Modal */}
      <ExtractionAgent
        isExtracting={showAgent}
        currentStep={agentStep}
        extractedCount={extractedCount}
        mappedCount={mappedCount}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <DocumentTextIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">PDF Form Extractor</h1>
          </div>
          <p className="text-gray-600">
            Upload a PDF form to extract and map fields for Real-Time B2B Implementation
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload PDF</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="pdf-upload"
            />
            
            <label
              htmlFor="pdf-upload"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
            >
              Select PDF File
            </label>
            
            {selectedFile && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Selected: <span className="font-medium">{selectedFile.name}</span>
                  {' '}({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Extracting...' : 'Extract Fields'}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        {extractionResult && (
          <>
            {/* Header with Auto-Populate Button */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Extraction Results</h2>
              <button
                onClick={handleAutoPopulate}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Auto-Populate in Onboarding Form
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Common Fields Mapped</h3>
                <p className="text-3xl font-bold text-green-600">{extractionResult.summary.commonMapped}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">B2B Fields Mapped</h3>
                <p className="text-3xl font-bold text-blue-600">{extractionResult.summary.b2bMapped}</p>
              </div>
            </div>



            {/* Common Fields Table */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                  Common
                </span>
                Mapped Fields ({getMappedFields(extractionResult.commonFields).length})
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                These values will be used to auto-populate the questionnaire form
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Questionnaire Field
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Extracted Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getMappedFields(extractionResult.commonFields).map((field, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {getQuestionTitle(field.questionId!)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-blue-600">
                          {formatValue(field.mappedValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* B2B Fields Table */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                  Real-Time B2B
                </span>
                Mapped Fields ({getMappedFields(extractionResult.b2bFields).length})
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                These values will be used to auto-populate the questionnaire form
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Questionnaire Field
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Extracted Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getMappedFields(extractionResult.b2bFields).map((field, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {getQuestionTitle(field.questionId!)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-blue-600">
                          {formatValue(field.mappedValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

