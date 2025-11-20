import React, { useEffect, useState } from 'react';
import {
  DatabaseIcon,
  CogIcon,
  CheckCircleIcon,
  SparklesIcon,
} from '@heroicons/react/outline';
import './TestGenerationAgent.css';

interface TestDataGenerationAgentProps {
  isGenerating: boolean;
  currentStep: 'fetching-scenarios' | 'fetching-config' | 'fetching-envelope' | 'preparing-ai' | 'generating-270' | 'generating-271' | 'validating' | 'complete' | null;
  selectedCount?: number;
  onComplete?: () => void;
}

export const TestDataGenerationAgent: React.FC<TestDataGenerationAgentProps> = ({
  isGenerating,
  currentStep,
  selectedCount = 0,
  onComplete,
}) => {
  const [showAgent, setShowAgent] = useState(false);

  useEffect(() => {
    if (isGenerating) {
      setShowAgent(true);
    } else if (currentStep === 'complete') {
      // Keep showing for 1.5 seconds after completion
      setTimeout(() => {
        setShowAgent(false);
        onComplete?.();
      }, 1500);
    }
  }, [isGenerating, currentStep, onComplete]);

  const getStepInfo = () => {
    switch (currentStep) {
      case 'fetching-scenarios':
        return {
          icon: DatabaseIcon,
          title: 'Loading Test Scenarios',
          description: `Retrieving ${selectedCount} selected test scenarios...`,
          iconBgColor: 'bg-blue-100',
          iconColor: 'text-blue-600',
          gradientFrom: 'from-blue-400',
          gradientTo: 'to-blue-600',
          progress: 10,
        };
      case 'fetching-config':
        return {
          icon: DatabaseIcon,
          title: 'Fetching Implementation Details',
          description: 'Loading payer configuration and system requirements...',
          iconBgColor: 'bg-indigo-100',
          iconColor: 'text-indigo-600',
          gradientFrom: 'from-indigo-400',
          gradientTo: 'to-indigo-600',
          progress: 25,
        };
      case 'fetching-envelope':
        return {
          icon: DatabaseIcon,
          title: 'Retrieving Envelope Configuration',
          description: 'Loading ISA/GS segments from questionnaire responses...',
          iconBgColor: 'bg-cyan-100',
          iconColor: 'text-cyan-600',
          gradientFrom: 'from-cyan-400',
          gradientTo: 'to-cyan-600',
          progress: 40,
        };
      case 'preparing-ai':
        return {
          icon: CogIcon,
          title: 'Preparing AI Context',
          description: 'Building prompts with implementation-specific details...',
          iconBgColor: 'bg-purple-100',
          iconColor: 'text-purple-600',
          gradientFrom: 'from-purple-400',
          gradientTo: 'to-purple-600',
          progress: 50,
        };
      case 'generating-270':
        return {
          icon: CogIcon,
          title: 'Generating 270 Requests',
          description: `Creating eligibility inquiry payloads for ${selectedCount} test cases...`,
          iconBgColor: 'bg-purple-100',
          iconColor: 'text-purple-600',
          gradientFrom: 'from-purple-400',
          gradientTo: 'to-purple-600',
          progress: 70,
        };
      case 'generating-271':
        return {
          icon: CogIcon,
          title: 'Generating 271 Responses',
          description: `Creating expected response payloads for ${selectedCount} test cases...`,
          iconBgColor: 'bg-purple-100',
          iconColor: 'text-purple-600',
          gradientFrom: 'from-purple-400',
          gradientTo: 'to-purple-600',
          progress: 85,
        };
      case 'validating':
        return {
          icon: CheckCircleIcon,
          title: 'Validating Test Data',
          description: 'Verifying envelope segments and X12 structure...',
          iconBgColor: 'bg-green-100',
          iconColor: 'text-green-600',
          gradientFrom: 'from-green-400',
          gradientTo: 'to-green-600',
          progress: 95,
        };
      case 'complete':
        return {
          icon: CheckCircleIcon,
          title: 'Test Data Generation Complete!',
          description: `Successfully generated ${selectedCount} complete test data pairs`,
          iconBgColor: 'bg-green-100',
          iconColor: 'text-green-600',
          gradientFrom: 'from-green-400',
          gradientTo: 'to-green-600',
          progress: 100,
        };
      default:
        return null;
    }
  };

  const stepInfo = getStepInfo();

  if (!showAgent || !stepInfo) return null;

  return (
    <div className="test-generation-agent-overlay">
      <div className="test-generation-agent-modal">
        {/* Animated Icon */}
        <div className="flex justify-center mb-6">
          <div className={`p-4 rounded-full ${stepInfo.iconBgColor} ${
            currentStep !== 'complete' ? 'agent-icon-spin' : ''
          } ${
            currentStep === 'complete' ? 'agent-icon-bounce' : ''
          }`}>
            <stepInfo.icon className={`w-16 h-16 ${stepInfo.iconColor}`} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          {stepInfo.title}
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-center mb-6">
          {stepInfo.description}
        </p>

        {/* Progress Bar */}
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div
            className={`agent-progress-bar bg-gradient-to-r ${stepInfo.gradientFrom} ${stepInfo.gradientTo}`}
            style={{ width: `${stepInfo.progress}%` }}
          />
          {/* Shimmer effect */}
          {currentStep !== 'complete' && (
            <div className="agent-shimmer" />
          )}
        </div>

        {/* Sparkles for completion */}
        {currentStep === 'complete' && (
          <div className="flex justify-center gap-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="agent-sparkle"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <SparklesIcon className="w-6 h-6 text-yellow-400" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

