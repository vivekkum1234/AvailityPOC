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
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

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
        setPdfPreviewUrl(null);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        setPdfPreviewUrl(null);
        return;
      }
      setSelectedFile(file);
      setError(null);
      setExtractionResult(null);

      // Create preview URL for the PDF
      const fileUrl = URL.createObjectURL(file);
      setPdfPreviewUrl(fileUrl);
    }
  };

  // Cleanup preview URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12 px-4">
      {/* Extraction Agent Modal */}
      <ExtractionAgent
        isExtracting={showAgent}
        currentStep={agentStep}
        extractedCount={extractedCount}
        mappedCount={mappedCount}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header with Gradient Background */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-8 mb-8 transform hover:scale-[1.01] transition-transform duration-300">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <DocumentTextIcon className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-1 tracking-tight">
                  PDF Form Extractor
                </h1>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm text-white border border-white/30">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    AI-Powered
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm text-white border border-white/30">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Intelligent Mapping
                  </span>
                </div>
              </div>
            </div>
            <p className="text-blue-50 text-lg max-w-3xl">
              Upload your PDF form and let our AI automatically extract and map fields to your Real-Time B2B Implementation questionnaire
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        </div>

        {/* Upload Section with Enhanced Design */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <UploadIcon className="w-6 h-6 text-white" />
              </div>
              Upload Your PDF
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Max 10MB • PDF only
            </div>
          </div>

          <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-gradient-to-br from-gray-50 to-blue-50 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group">
            {/* Upload Icon with Animation */}
            <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors duration-300">
                <UploadIcon className="w-10 h-10 text-blue-600 group-hover:text-indigo-600 transition-colors duration-300" />
              </div>
            </div>

            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="pdf-upload"
            />

            <label
              htmlFor="pdf-upload"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl cursor-pointer hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Choose PDF File
            </label>

            <p className="mt-4 text-sm text-gray-500">
              or drag and drop your file here
            </p>

            {selectedFile && (
              <div className="mt-6 flex flex-col items-center animate-fade-in">
                <div className="inline-flex items-center gap-3 px-6 py-4 bg-white rounded-xl shadow-md border border-gray-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <DocumentTextIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <CheckCircleIcon className="w-6 h-6 text-green-500 ml-2" />
                </div>

                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="mt-10 inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transform hover:-translate-y-0.5 disabled:transform-none"
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Extracting Fields...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Extract & Map Fields
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* PDF Preview Section */}
          {pdfPreviewUrl && selectedFile && !extractionResult && (
            <div className="mt-8 animate-slide-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">PDF Preview</h3>
                  <p className="text-sm text-gray-500">Review your document before extraction</p>
                </div>
              </div>

              <div className="relative bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                {/* Preview Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <DocumentTextIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Ready
                    </span>
                  </div>
                </div>

                {/* PDF Embed */}
                <div className="relative bg-gray-100" style={{ height: '600px' }}>
                  <iframe
                    src={pdfPreviewUrl}
                    className="w-full h-full"
                    title="PDF Preview"
                    style={{ border: 'none' }}
                  />

                  {/* Overlay gradient for visual effect */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-gray-900/5 via-transparent to-transparent"></div>
                </div>

                {/* Preview Footer */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-600 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Click "Extract & Map Fields" above to begin AI-powered field extraction
                    </p>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPdfPreviewUrl(null);
                      }}
                      className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 hover:underline"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 p-5 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-xl flex items-start gap-4 shadow-md animate-fade-in">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <ExclamationCircleIcon className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-red-900 mb-1">Upload Error</h3>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {extractionResult && (
          <div className="animate-fade-in">
            {/* Success Banner with Auto-Populate Button */}
            <div className="relative overflow-hidden bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl shadow-2xl p-8 mb-8">
              {/* Animated Background */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                  backgroundSize: '30px 30px'
                }}></div>
              </div>

              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <CheckCircleIcon className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-1">Extraction Complete!</h2>
                    <p className="text-green-50 text-lg">
                      Successfully mapped {extractionResult.summary.commonMapped + extractionResult.summary.b2bMapped} fields from your PDF
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleAutoPopulate}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white text-green-600 font-bold rounded-xl hover:bg-green-50 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 whitespace-nowrap"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Auto-Populate Form
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
            </div>

            {/* Enhanced Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-green-100 mb-1">Common Fields</h3>
                <p className="text-4xl font-bold">{extractionResult.summary.commonMapped}</p>
                <p className="text-xs text-green-100 mt-2">Successfully mapped</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-blue-100 mb-1">B2B Fields</h3>
                <p className="text-4xl font-bold">{extractionResult.summary.b2bMapped}</p>
                <p className="text-xs text-blue-100 mt-2">Successfully mapped</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-purple-100 mb-1">Total Extracted</h3>
                <p className="text-4xl font-bold">{extractionResult.summary.totalExtracted}</p>
                <p className="text-xs text-purple-100 mt-2">Fields found</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-orange-100 mb-1">PDF Pages</h3>
                <p className="text-4xl font-bold">{extractionResult.totalPages}</p>
                <p className="text-xs text-orange-100 mt-2">Processed</p>
              </div>
            </div>



            {/* Common Fields Table */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      Common Fields
                      <span className="inline-flex items-center px-3 py-1 text-sm font-bold rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200">
                        {getMappedFields(extractionResult.commonFields).length} mapped
                      </span>
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Universal fields applicable to all implementation modes
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          Questionnaire Field
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Extracted Value
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {getMappedFields(extractionResult.commonFields).map((field, index) => (
                      <tr key={index} className="hover:bg-green-50 transition-colors duration-150 group">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 group-hover:text-green-900">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            {getQuestionTitle(field.questionId!)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                            {formatValue(field.mappedValue)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* B2B Fields Table */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      Real-Time B2B Fields
                      <span className="inline-flex items-center px-3 py-1 text-sm font-bold rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200">
                        {getMappedFields(extractionResult.b2bFields).length} mapped
                      </span>
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Specific to Real-Time B2B implementation mode
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          Questionnaire Field
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Extracted Value
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {getMappedFields(extractionResult.b2bFields).map((field, index) => (
                      <tr key={index} className="hover:bg-blue-50 transition-colors duration-150 group">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 group-hover:text-blue-900">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            {getQuestionTitle(field.questionId!)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                            {formatValue(field.mappedValue)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

