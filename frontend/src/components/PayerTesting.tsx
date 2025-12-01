import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { TestGenerationAgent } from './TestGenerationAgent';
import { TestDataGenerationAgent } from './TestDataGenerationAgent';
import { TestExecutionAgent } from './TestExecutionAgent';

interface Implementation {
  id: string;
  organization_id: string;
  questionnaire_id: string;
  implementation_mode: string;
  status: string;
  created_at: string;
  updated_at: string;
  submitted_at: string;
  submitted_by: string;
  submitted_by_name?: string;
  organizations: {
    id: string;
    name: string;
    email: string;
  };
}

interface TestRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'Critical' | 'High' | 'Medium';
  estimatedDuration: string;
  hasPreConfiguredData: boolean;
  dataSource: 'predefined' | 'ai-generated';
  implementationSpecific: boolean;
}

interface DetailedTestCase {
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
    segments: any[];
  };
  expectedResponse271: {
    payload: string;
    segments: any[];
  };
  validationRules: {
    required: string[];
    forbidden: string[];
    business: string[];
  };
}

interface TestData {
  id: string;
  type: '270' | '271';
  payload: string;
  description: string;
  scenario: string;
}

interface ValidationResult {
  passed: boolean;
  rule: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
}

interface TestResult {
  testId: string;
  status: 'passed' | 'failed';
  responseTime: number;
  request270: string;
  response271?: string;
  validationResults: ValidationResult[];
  errorMessage?: string;
  executedAt: string;
}

interface TestExecutionSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  totalExecutionTime: number;
  averageResponseTime: number;
}

type WorkflowStep = 1 | 2 | 3 | 4;

// Custom Scenario Form Component
interface CustomScenarioFormProps {
  onSubmit: (scenario: Omit<TestRecommendation, 'id'>) => void;
  onCancel: () => void;
}

const CustomScenarioForm: React.FC<CustomScenarioFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium' as 'Critical' | 'High' | 'Medium',
    category: 'Additional Testing' as 'Core Functionality' | 'Additional Testing',
    estimatedDuration: '',
    hasPreConfiguredData: false,
    dataSource: 'predefined' as 'predefined' | 'ai-generated',
    implementationSpecific: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    onSubmit(formData);
    setFormData({
      title: '',
      description: '',
      priority: 'Medium',
      category: 'Additional Testing',
      estimatedDuration: '',
      hasPreConfiguredData: false,
      dataSource: 'predefined',
      implementationSpecific: false
    });
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Custom Test Scenario</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., Custom Coverage Verification Test"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Duration
            </label>
            <input
              type="text"
              value={formData.estimatedDuration}
              onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., 3 minutes"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Describe what this test scenario should validate..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'Critical' | 'High' | 'Medium' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="Core Functionality">Core Functionality</option>
              <option value="Additional Testing">Additional Testing</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            Add Scenario
          </button>
        </div>
      </form>
    </div>
  );
};

export const PayerTesting: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(1);
  const [selectedImplementation, setSelectedImplementation] = useState<string>('');
  const [implementations, setImplementations] = useState<Implementation[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingImplementations, setLoadingImplementations] = useState(true);
  const [recommendations, setRecommendations] = useState<TestRecommendation[]>([]);
  const [customScenarios, setCustomScenarios] = useState<TestRecommendation[]>([]);
  const [showCustomScenarioForm, setShowCustomScenarioForm] = useState(false);
  const [detailedTestCases, setDetailedTestCases] = useState<DetailedTestCase[]>([]);
  const [testData, setTestData] = useState<TestData[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [executionSummary, setExecutionSummary] = useState<TestExecutionSummary | null>(null);
  const [payerEndpoint, setPayerEndpoint] = useState('https://availitypoc-production.up.valuelabs.app/api/mock-payer/execute-tests');
  const [executionMode, setExecutionMode] = useState('Simulated (Demo)');

  // Test generation agent states
  const [showGenerationAgent, setShowGenerationAgent] = useState(false);
  const [generationStep, setGenerationStep] = useState<'analyzing' | 'generating-critical' | 'generating-high' | 'generating-medium' | 'finalizing' | 'complete' | null>(null);
  const [predefinedCount, setPredefinedCount] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const [highCount, setHighCount] = useState(0);
  const [mediumCount, setMediumCount] = useState(0);
  const [totalGeneratedCount, setTotalGeneratedCount] = useState(0);

  // Test data generation agent states
  const [showDataGenerationAgent, setShowDataGenerationAgent] = useState(false);
  const [dataGenerationStep, setDataGenerationStep] = useState<'fetching-scenarios' | 'fetching-config' | 'fetching-envelope' | 'preparing-ai' | 'generating-270' | 'generating-271' | 'validating' | 'complete' | null>(null);

  // Test execution agent states
  const [showExecutionAgent, setShowExecutionAgent] = useState(false);
  const [executionStep, setExecutionStep] = useState<'connecting' | 'sending-requests' | 'awaiting-responses' | 'validating-responses' | 'complete' | null>(null);
  const [completedTestCount, setCompletedTestCount] = useState(0);

  useEffect(() => {
    loadImplementations();
  }, []);

  const loadImplementations = async () => {
    try {
      setLoadingImplementations(true);
      const implementationData = await apiService.getSubmissions();
      // Filter to only show submitted implementations
      const submittedImplementations = implementationData.filter(
        (impl: Implementation) => impl.status === 'submitted'
      );
      setImplementations(submittedImplementations);
      if (submittedImplementations.length > 0) {
        setSelectedImplementation(submittedImplementations[0].id);
      }
    } catch (error) {
      console.error('Error loading implementations:', error);
    } finally {
      setLoadingImplementations(false);
    }
  };

  const generateTestRecommendations = async () => {
    if (!selectedImplementation) return;

    setLoading(true);
    setShowGenerationAgent(true);

    try {
      const selectedImpl = implementations.find(impl => impl.id === selectedImplementation);
      if (!selectedImpl) {
        throw new Error('Selected implementation not found');
      }

      console.log('🎯 Generating 50 test recommendations...');

      // Step 1: Analyzing questionnaire
      setGenerationStep('analyzing');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Start generating critical priority tests
      setGenerationStep('generating-critical');
      setCriticalCount(0);

      // Make the actual API call
      const apiCallPromise = apiService.generateTestRecommendations(selectedImpl.organization_id);

      // Simulate progress updates while waiting for API (spread across all phases)
      let criticalProgress = 0;
      let highProgress = 0;
      let mediumProgress = 0;
      let currentPhase = 'critical';

      const progressInterval = setInterval(() => {
        if (currentPhase === 'critical') {
          criticalProgress = Math.min(criticalProgress + 1, 20);
          setCriticalCount(criticalProgress);
          if (criticalProgress >= 20) {
            currentPhase = 'high';
            setGenerationStep('generating-high');
          }
        } else if (currentPhase === 'high') {
          highProgress = Math.min(highProgress + 1, 15);
          setHighCount(highProgress);
          if (highProgress >= 15) {
            currentPhase = 'medium';
            setGenerationStep('generating-medium');
          }
        } else if (currentPhase === 'medium') {
          mediumProgress = Math.min(mediumProgress + 1, 12);
          setMediumCount(mediumProgress);
        }
      }, 600); // Update every 600ms (20+15+12 = 47 updates * 600ms ≈ 28 seconds)

      // Wait for API response
      const response = await apiCallPromise;
      clearInterval(progressInterval);

      // Ensure all counts are at max
      setCriticalCount(20);
      setHighCount(15);
      setMediumCount(12);
      setGenerationStep('generating-medium');

      // Step 5: Finalizing
      setGenerationStep('finalizing');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 6: Complete
      setGenerationStep('complete');
      setTotalGeneratedCount(response.totalCount);

      console.log(`✅ Received ${response.totalCount} test recommendations`);
      console.log(`   - Predefined: ${response.predefinedCount} (ready-to-use)`);
      console.log(`   - AI-generated: ${response.aiGeneratedCount} (implementation-specific)`);

      // Wait for completion animation
      await new Promise(resolve => setTimeout(resolve, 1500));

      // The API now returns structured response with metadata
      setRecommendations(response.recommendations);
      setCurrentStep(2);
      setShowGenerationAgent(false);
      setGenerationStep(null);

      // Reset counts
      setPredefinedCount(0);
      setCriticalCount(0);
      setHighCount(0);
      setMediumCount(0);
      setTotalGeneratedCount(0);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setShowGenerationAgent(false);
      setGenerationStep(null);
      alert('Failed to generate test recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addCustomScenario = (customScenario: Omit<TestRecommendation, 'id'>) => {
    const newScenario: TestRecommendation = {
      ...customScenario,
      id: `CUSTOM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setCustomScenarios(prev => [...prev, newScenario]);
    setShowCustomScenarioForm(false);
  };

  const getAllRecommendations = () => {
    return [...recommendations, ...customScenarios];
  };

  const generateTestData = async () => {
    if (!selectedImplementation) return;

    setLoading(true);

    // Show progress modal
    setShowDataGenerationAgent(true);

    try {
      const selectedImpl = implementations.find(impl => impl.id === selectedImplementation);
      if (!selectedImpl) {
        throw new Error('Selected implementation not found');
      }

      // Get selected test case objects from checkboxes (both AI-generated and custom)
      const allRecommendations = getAllRecommendations();
      const selectedTestCases = allRecommendations
        .filter(rec => {
          const checkbox = document.querySelector(`input[data-test-id="${rec.id}"]`) as HTMLInputElement;
          return checkbox?.checked;
        });

      console.log('Selected test cases:', selectedTestCases);
      console.log('Total AI recommendations:', recommendations.length);
      console.log('Total custom scenarios:', customScenarios.length);
      console.log('Total available scenarios:', allRecommendations.length);

      // Start API call immediately in the background
      const apiCallPromise = apiService.generateTestData(
        selectedImpl.id,  // Use implementation ID to fetch correct questionnaire responses
        selectedTestCases
      );

      // Show progress workflow while API call is running
      // Step 1: Fetching scenarios (2s)
      setDataGenerationStep('fetching-scenarios');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 2: Fetching implementation config (2s)
      setDataGenerationStep('fetching-config');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 3: Fetching envelope data (2s)
      setDataGenerationStep('fetching-envelope');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 4: Preparing AI context (3s)
      setDataGenerationStep('preparing-ai');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 5: Generating 270 requests (4s)
      setDataGenerationStep('generating-270');
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Step 6: Generating 271 responses (wait for API to complete)
      setDataGenerationStep('generating-271');
      const detailedTestCases = await apiCallPromise;

      // Step 7: Validating (1s)
      setDataGenerationStep('validating');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Store detailed test cases
      setDetailedTestCases(detailedTestCases);

      // Generate test data from the detailed test cases
      const generatedTestData: TestData[] = [];

      detailedTestCases.forEach((testCase: any) => {
        // Add 270 request
        generatedTestData.push({
          id: `${testCase.id}_270`,
          type: '270',
          payload: testCase.request270.payload,
          description: `270 Request: ${testCase.title}`,
          scenario: `Member ID: ${testCase.memberData.memberId}, Service Type: ${testCase.memberData.serviceType}`
        });

        // Add expected 271 response
        generatedTestData.push({
          id: `${testCase.id}_271`,
          type: '271',
          payload: testCase.expectedResponse271.payload,
          description: `271 Response: ${testCase.title}`,
          scenario: `Expected response for ${testCase.memberData.firstName} ${testCase.memberData.lastName}`
        });
      });

      setTestData(generatedTestData);

      // Step 6: Mark as complete
      setDataGenerationStep('complete');
      await new Promise(resolve => setTimeout(resolve, 1500));

      setCurrentStep(3);
    } catch (error) {
      console.error('Error generating test data:', error);
      setShowDataGenerationAgent(false);
    } finally {
      setLoading(false);
      setShowDataGenerationAgent(false);
    }
  };

  const executeTests = async () => {
    if (!detailedTestCases.length) {
      console.error('No test cases available for execution');
      return;
    }

    setLoading(true);
    setShowExecutionAgent(true);
    setCompletedTestCount(0);

    try {
      console.log('🧪 Executing tests against mock payer system...');
      console.log('Test cases to execute:', detailedTestCases.length);
      console.log('Payer endpoint:', payerEndpoint);
      console.log('Execution mode:', executionMode);

      // Step 1: Connecting to payer system (1.5s)
      setExecutionStep('connecting');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 2: Sending requests (2s)
      setExecutionStep('sending-requests');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 3: Awaiting responses - start API call
      setExecutionStep('awaiting-responses');

      // Simulate progress while waiting for API
      const totalTests = detailedTestCases.length;
      let progressCount = 0;
      const progressInterval = setInterval(() => {
        if (progressCount < totalTests - 1) {
          progressCount++;
          setCompletedTestCount(progressCount);
        }
      }, 500);

      // Execute tests using the mock payer API
      const response = await apiService.executeTests(detailedTestCases, payerEndpoint);

      clearInterval(progressInterval);
      setCompletedTestCount(totalTests);

      console.log('🔍 Frontend received response:', response);
      console.log('🔍 Response success:', response.success);
      console.log('🔍 Response data:', response.data);

      if (response.success) {
        const { results, summary } = response.data;

        // Step 4: Validating responses (1s)
        setExecutionStep('validating-responses');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 5: Complete
        setExecutionStep('complete');
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log('✅ Test execution completed');
        console.log('Results:', results);
        console.log('Summary:', summary);

        setTestResults(results);
        setExecutionSummary(summary);
        setCurrentStep(4);
      } else {
        console.error('❌ Response indicates failure:', response.error);
        throw new Error(response.error || 'Test execution failed');
      }
    } catch (error) {
      console.error('❌ Error executing tests:', error);
      setShowExecutionAgent(false);
      // Show error to user
      alert(`Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      setShowExecutionAgent(false);
    }
  };

  const getStepStatus = (step: WorkflowStep) => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) {
      // If we're on step 4 (results) and all tests passed, show as completed
      if (step === 4 && testResults.length > 0 && testResults.every(result => result.status === 'passed')) {
        return 'completed';
      }
      return 'active';
    }
    return 'pending';
  };

  const getModeLabel = (mode: string) => {
    const modeLabels = {
      real_time_web: 'Real-time Web',
      real_time_b2b: 'Real-time B2B',
      edi_batch: 'EDI Batch'
    };
    return modeLabels[mode as keyof typeof modeLabels] || mode;
  };

  const getSelectedImplementation = () => {
    return implementations.find(impl => impl.id === selectedImplementation);
  };

  const renderStepIndicator = () => {
    const stepLabels = [
      {
        title: 'Test Recommendations',
        subtitle: 'AI suggests test cases',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        )
      },
      {
        title: 'Generate Test Data',
        subtitle: 'Create 270/271 pairs',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        )
      },
      {
        title: 'Execute Tests',
        subtitle: 'Send to payer system',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      },
      {
        title: 'View Results',
        subtitle: 'Analyze outcomes',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )
      }
    ];

    return (
      <div className="mb-12">
        <div className="relative">
          {/* Steps with arrows between them */}
          <div className="relative flex items-start justify-between">
            {[1, 2, 3, 4].map((step, index) => {
              const status = getStepStatus(step as WorkflowStep);
              const isCompleted = status === 'completed';

              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center" style={{ width: '20%' }}>
                    {/* Step Circle */}
                    <div className={`
                      relative w-20 h-20 rounded-full flex items-center justify-center font-bold text-sm
                      transition-all duration-500 transform
                      ${status === 'completed'
                        ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg shadow-green-500/50 scale-100'
                        : status === 'active'
                        ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-xl shadow-orange-500/50 scale-110 animate-pulse'
                        : 'bg-white border-2 border-gray-300 text-gray-400 scale-95'
                      }
                    `}>
                      {status === 'completed' ? (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : status === 'active' ? (
                        <div className="flex flex-col items-center">
                          {stepLabels[index].icon}
                          <span className="text-xs font-semibold mt-1">Active</span>
                        </div>
                      ) : (
                        <div className="opacity-50">
                          {stepLabels[index].icon}
                        </div>
                      )}

                      {/* Step Number Badge */}
                      <div className={`
                        absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                        ${status === 'completed'
                          ? 'bg-green-600 text-white'
                          : status === 'active'
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-300 text-gray-600'
                        }
                      `}>
                        {step}
                      </div>
                    </div>

                    {/* Step Label + Subtitle */}
                    <div className="mt-3 text-center px-2">
                      <div className={`text-sm font-semibold transition-colors duration-300 ${
                        status === 'completed' ? 'text-green-700' :
                        status === 'active' ? 'text-orange-600' :
                        'text-gray-500'
                      }`}>
                        {stepLabels[index].title}
                      </div>
                      <div className={`text-xs mt-0.5 transition-colors duration-300 ${
                        status === 'completed' ? 'text-green-600' :
                        status === 'active' ? 'text-orange-500' :
                        'text-gray-400'
                      }`}>
                        {stepLabels[index].subtitle}
                      </div>
                    </div>
                  </div>

                  {/* Line + Arrow connector (show between steps, not after last) */}
                  {index < 3 && (
                    <div className="flex items-center" style={{ marginTop: '30px', width: '6.67%' }}>
                      {/* Horizontal line */}
                      <div
                        className={`flex-1 h-1 rounded transition-colors duration-500 ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      ></div>
                      {/* Arrow head - larger and more visible */}
                      <svg
                        className={`w-6 h-6 -ml-1 transition-colors duration-500 ${
                          isCompleted ? 'text-green-500' : 'text-gray-400'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 1: Test Case Recommendations</h2>
              <p className="text-gray-600 mb-6">
                Get AI-powered recommendations for testing {getSelectedImplementation()?.organizations.name || 'your payer'}'s X12 270/271 implementation.
              </p>
            </div>

            {loadingImplementations ? (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-200 border-t-orange-500"></div>
                  <span className="ml-3 text-gray-600">Loading implementations...</span>
                </div>
              </div>
            ) : implementations.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Submitted Implementations</h3>
                  <p className="text-gray-600 mb-4">You need submitted questionnaire implementations to run tests.</p>
                  <a href="/" className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                    Create Implementation
                  </a>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select Payer Implementation:</label>
                  <select
                    value={selectedImplementation}
                    onChange={(e) => setSelectedImplementation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {implementations.map(impl => (
                      <option key={impl.id} value={impl.id}>
                        {impl.organizations.name} - {getModeLabel(impl.implementation_mode)}
                        {impl.submitted_at && ` (${new Date(impl.submitted_at).toLocaleDateString()})`}
                      </option>
                    ))}
                  </select>

                  {getSelectedImplementation() && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Organization:</span>
                          <p className="text-gray-900">{getSelectedImplementation()?.organizations.name}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Implementation Mode:</span>
                          <p className="text-gray-900">{getModeLabel(getSelectedImplementation()?.implementation_mode || '')}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Submitted:</span>
                          <p className="text-gray-900">
                            {getSelectedImplementation()?.submitted_at
                              ? new Date(getSelectedImplementation()!.submitted_at).toLocaleDateString()
                              : 'N/A'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={generateTestRecommendations}
                  disabled={loading || !selectedImplementation}
                  className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate Test Recommendations
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 2: Select Test Cases</h2>
              <p className="text-gray-600 mb-6">
                Choose which test cases to generate and execute. Core recommendations are pre-selected.
              </p>
            </div>

            {/* Core Recommendations Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  defaultChecked={true}
                  id="select-all-core"
                  onChange={(e) => {
                    const checkboxes = document.querySelectorAll('[data-category="core"]');
                    checkboxes.forEach((checkbox) => {
                      (checkbox as HTMLInputElement).checked = e.target.checked;
                    });
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <h3 className="text-lg font-semibold text-gray-900">✅ Core Recommendations</h3>
              </div>

              {recommendations
                .filter(rec => rec.category === 'Core Functionality')
                .map((rec) => (
                  <div key={rec.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked={true}
                        data-test-id={rec.id}
                        data-category="core"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-base font-semibold text-gray-900">{rec.title}</h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            rec.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                            rec.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {rec.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{rec.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Additional Test Cases Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  defaultChecked={false}
                  id="select-all-additional"
                  onChange={(e) => {
                    const checkboxes = document.querySelectorAll('[data-category="additional"]');
                    checkboxes.forEach((checkbox) => {
                      (checkbox as HTMLInputElement).checked = e.target.checked;
                    });
                  }}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <h3 className="text-lg font-semibold text-gray-900">📋 Additional Test Cases (Optional)</h3>
              </div>

              {recommendations
                .filter(rec => rec.category === 'Additional Testing')
                .map((rec) => (
                  <div key={rec.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked={false}
                        data-test-id={rec.id}
                        data-category="additional"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-base font-semibold text-gray-900">{rec.title}</h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            rec.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                            rec.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {rec.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{rec.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Custom Scenarios Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">🎯 Custom Test Scenarios</h3>
                <button
                  onClick={() => setShowCustomScenarioForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Custom Scenario
                </button>
              </div>

              {showCustomScenarioForm && (
                <CustomScenarioForm
                  onSubmit={addCustomScenario}
                  onCancel={() => setShowCustomScenarioForm(false)}
                />
              )}

              {customScenarios.length > 0 && (
                <div className="space-y-3">
                  {customScenarios.map((scenario) => (
                    <div key={scenario.id} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          defaultChecked={false}
                          data-test-id={scenario.id}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-base font-semibold text-gray-900">{scenario.title}</h4>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              scenario.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                              scenario.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {scenario.priority}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              Custom
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{scenario.description}</p>
                          {scenario.estimatedDuration && (
                            <p className="text-xs text-gray-500 mt-1">Duration: {scenario.estimatedDuration}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {customScenarios.length === 0 && !showCustomScenarioForm && (
                <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p className="text-gray-500 text-sm">No custom scenarios added yet</p>
                  <p className="text-gray-400 text-xs mt-1">Click "Add Custom Scenario" to create your own test cases</p>
                </div>
              )}
            </div>

            <button
              onClick={generateTestData}
              disabled={loading}
              className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Generating...
                </>
              ) : (
                'Generate Test Data'
              )}
            </button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 3: Execute Tests</h2>
              <p className="text-gray-600 mb-6">
                Generated test data ready for execution. Review the 270/271 pairs before sending to the payer system.
              </p>
            </div>

            <div className="space-y-4">
              {testData.map((data) => (
                <div key={data.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{data.description}</h3>
                      <p className="text-sm text-gray-600">{data.scenario}</p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      data.type === '270' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      X12 {data.type}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-md p-4">
                    <pre className="text-sm text-gray-800 break-all whitespace-pre-wrap overflow-x-auto"><code>{data.payload}</code></pre>
                  </div>
                </div>
              ))}
            </div>

            {/* Payer Endpoint Configuration */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payer Endpoint Configuration</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="endpoint-url" className="block text-sm font-medium text-gray-700 mb-2">
                    Test Endpoint URL
                  </label>
                  <input
                    id="endpoint-url"
                    type="text"
                    value={payerEndpoint}
                    onChange={(e) => setPayerEndpoint(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="https://availitypoc-production.up.valuelabs.app/api/mock-payer/execute-tests"
                  />
                  <p className="text-sm text-gray-500 mt-1">Mock payer endpoint for demonstration</p>
                </div>

                <div>
                  <label htmlFor="execution-mode" className="block text-sm font-medium text-gray-700 mb-2">
                    Execution Mode
                  </label>
                  <select
                    id="execution-mode"
                    value={executionMode}
                    onChange={(e) => setExecutionMode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="Simulated (Demo)">Simulated (Demo)</option>
                    <option value="Live Testing">Live Testing</option>
                    <option value="Sandbox">Sandbox</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">Simulated mode for demonstration</p>
                </div>
              </div>
            </div>

            <button
              onClick={executeTests}
              disabled={loading || !detailedTestCases.length}
              className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Executing...
                </>
              ) : (
                `Execute Tests (${detailedTestCases.length} tests)`
              )}
            </button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 4: Test Results</h2>
              <p className="text-gray-600 mb-6">
                Review test execution results and analyze the payer system responses.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {executionSummary?.passedTests || testResults.filter(r => r.status === 'passed').length}
                </div>
                <div className="text-sm text-gray-600">Tests Passed</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {executionSummary?.failedTests || testResults.filter(r => r.status === 'failed').length}
                </div>
                <div className="text-sm text-gray-600">Tests Failed</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-gray-600 mb-2">
                  {executionSummary?.averageResponseTime || Math.round(testResults.reduce((acc, r) => acc + r.responseTime, 0) / testResults.length)}ms
                </div>
                <div className="text-sm text-gray-600">Avg Response Time</div>
              </div>
            </div>

            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={result.testId} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        result.status === 'passed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        Test ID: {result.testId} • {result.responseTime}ms
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(result.executedAt).toLocaleTimeString()}
                    </span>
                  </div>

                  {/* Business Rules Validation */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Business Rules Validation</h4>
                    <div className="space-y-1">
                      {result.validationResults && result.validationResults.length > 0 ? (
                        result.validationResults.map((validation, vIndex) => (
                          <div key={vIndex} className="flex items-center space-x-2 text-sm">
                            <span className={`inline-flex items-center w-4 h-4 rounded-full ${
                              validation.passed ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {validation.passed ? (
                                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              )}
                            </span>
                            <span className={validation.passed ? 'text-gray-700' : 'text-red-700'}>
                              {validation.description}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">No validation results available</div>
                      )}
                    </div>
                  </div>



                  {/* Error Message */}
                  {result.errorMessage && (
                    <div className="bg-red-50 rounded-md p-4">
                      <h4 className="text-sm font-medium text-red-800 mb-2">Error Details</h4>
                      <code className="text-sm text-red-700">{result.errorMessage}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center px-6 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Run New Tests
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      {/* Test Generation Agent Modal */}
      <TestGenerationAgent
        isGenerating={showGenerationAgent}
        currentStep={generationStep}
        predefinedCount={predefinedCount}
        criticalCount={criticalCount}
        highCount={highCount}
        mediumCount={mediumCount}
        totalCount={totalGeneratedCount}
      />

      {/* Test Data Generation Agent Modal */}
      <TestDataGenerationAgent
        isGenerating={showDataGenerationAgent}
        currentStep={dataGenerationStep}
        selectedCount={getAllRecommendations().filter(rec => {
          const checkbox = document.querySelector(`input[data-test-id="${rec.id}"]`) as HTMLInputElement;
          return checkbox?.checked;
        }).length}
      />

      {/* Test Execution Agent Modal */}
      <TestExecutionAgent
        isExecuting={showExecutionAgent}
        currentStep={executionStep}
        totalTests={detailedTestCases.length}
        completedTests={completedTestCount}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-availity-500 rounded-xl flex items-center justify-center shadow-medium mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Payer Integration Testing</h1>
            <p className="text-sm text-gray-600 font-medium mt-1">Execute real X12 270/271 tests with AI-generated validation</p>
          </div>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        <div className="bg-gray-50 rounded-lg p-8">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};
