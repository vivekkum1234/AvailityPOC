import React, { useEffect, useState } from 'react';
import {
  PlayIcon,
  CogIcon,
  CheckCircleIcon,
  SparklesIcon,
  LightningBoltIcon,
} from '@heroicons/react/outline';
import './TestGenerationAgent.css';

interface TestExecutionAgentProps {
  isExecuting: boolean;
  currentStep: 'connecting' | 'sending-requests' | 'awaiting-responses' | 'validating-responses' | 'complete' | null;
  totalTests?: number;
  completedTests?: number;
  onComplete?: () => void;
}

export const TestExecutionAgent: React.FC<TestExecutionAgentProps> = ({
  isExecuting,
  currentStep,
  totalTests = 0,
  completedTests = 0,
  onComplete,
}) => {
  const [showAgent, setShowAgent] = useState(false);

  useEffect(() => {
    if (isExecuting) {
      setShowAgent(true);
    } else if (currentStep === 'complete') {
      // Keep showing for 1.5 seconds after completion
      setTimeout(() => {
        setShowAgent(false);
        onComplete?.();
      }, 1500);
    }
  }, [isExecuting, currentStep, onComplete]);

  const getStepInfo = () => {
    switch (currentStep) {
      case 'connecting':
        return {
          icon: CogIcon,
          title: 'Connecting to Payer System',
          description: 'Establishing secure connection to the mock payer endpoint...',
          iconBgColor: 'bg-blue-100',
          iconColor: 'text-blue-600',
          gradientFrom: 'from-blue-400',
          gradientTo: 'to-blue-600',
          progress: 15,
        };
      case 'sending-requests':
        return {
          icon: LightningBoltIcon,
          title: 'Sending 270 Eligibility Requests',
          description: `Transmitting ${totalTests} X12 270 requests to payer system...`,
          iconBgColor: 'bg-orange-100',
          iconColor: 'text-orange-600',
          gradientFrom: 'from-orange-400',
          gradientTo: 'to-orange-600',
          progress: 35,
        };
      case 'awaiting-responses':
        return {
          icon: PlayIcon,
          title: 'Awaiting 271 Responses',
          description: completedTests > 0 
            ? `Received ${completedTests} of ${totalTests} responses...` 
            : 'Waiting for payer system to process requests...',
          iconBgColor: 'bg-purple-100',
          iconColor: 'text-purple-600',
          gradientFrom: 'from-purple-400',
          gradientTo: 'to-purple-600',
          progress: 35 + (completedTests / Math.max(totalTests, 1)) * 40,
        };
      case 'validating-responses':
        return {
          icon: CogIcon,
          title: 'Validating Responses',
          description: 'Checking X12 271 responses against business rules...',
          iconBgColor: 'bg-indigo-100',
          iconColor: 'text-indigo-600',
          gradientFrom: 'from-indigo-400',
          gradientTo: 'to-indigo-600',
          progress: 85,
        };
      case 'complete':
        return {
          icon: CheckCircleIcon,
          title: 'Test Execution Complete!',
          description: `Successfully executed ${totalTests} tests`,
          iconBgColor: 'bg-green-100',
          iconColor: 'text-green-600',
          gradientFrom: 'from-green-400',
          gradientTo: 'to-green-600',
          progress: 100,
        };
      default:
        return {
          icon: CogIcon,
          title: 'Preparing Test Execution',
          description: 'Initializing test runner...',
          iconBgColor: 'bg-gray-100',
          iconColor: 'text-gray-600',
          gradientFrom: 'from-gray-400',
          gradientTo: 'to-gray-600',
          progress: 0,
        };
    }
  };

  if (!showAgent) return null;

  const stepInfo = getStepInfo();

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

