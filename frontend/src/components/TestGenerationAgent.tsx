import React, { useEffect, useState } from 'react';
import {
  LightBulbIcon,
  CogIcon,
  CheckCircleIcon,
  SparklesIcon,
} from '@heroicons/react/outline';
import './TestGenerationAgent.css';

interface TestGenerationAgentProps {
  isGenerating: boolean;
  currentStep: 'analyzing' | 'generating-critical' | 'generating-high' | 'generating-medium' | 'finalizing' | 'complete' | null;
  predefinedCount?: number;
  criticalCount?: number;
  highCount?: number;
  mediumCount?: number;
  totalCount?: number;
  onComplete?: () => void;
}

export const TestGenerationAgent: React.FC<TestGenerationAgentProps> = ({
  isGenerating,
  currentStep,
  predefinedCount = 0,
  criticalCount = 0,
  highCount = 0,
  mediumCount = 0,
  totalCount = 0,
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
      case 'analyzing':
        return {
          icon: CogIcon,
          title: 'Analyzing Implementation Configuration',
          description: 'Reviewing questionnaire responses and requirements...',
          iconBgColor: 'bg-blue-100',
          iconColor: 'text-blue-600',
          gradientFrom: 'from-blue-400',
          gradientTo: 'to-blue-600',
          progress: 15,
        };
      case 'generating-critical':
        return {
          icon: CogIcon,
          title: 'Generating Critical Priority Tests',
          description: criticalCount > 0 ? `Generated ${criticalCount} of 20 critical tests...` : 'Starting critical test generation...',
          iconBgColor: 'bg-red-100',
          iconColor: 'text-red-600',
          gradientFrom: 'from-red-400',
          gradientTo: 'to-red-600',
          progress: 15 + (criticalCount / 20) * 40,
        };
      case 'generating-high':
        return {
          icon: CogIcon,
          title: 'Generating High Priority Tests',
          description: highCount > 0 ? `Generated ${highCount} of 15 high priority tests...` : 'Starting high priority test generation...',
          iconBgColor: 'bg-orange-100',
          iconColor: 'text-orange-600',
          gradientFrom: 'from-orange-400',
          gradientTo: 'to-orange-600',
          progress: 55 + (highCount / 15) * 20,
        };
      case 'generating-medium':
        return {
          icon: CogIcon,
          title: 'Generating Medium Priority Tests',
          description: mediumCount > 0 ? `Generated ${mediumCount} of 12 medium priority tests...` : 'Starting medium priority test generation...',
          iconBgColor: 'bg-blue-100',
          iconColor: 'text-blue-600',
          gradientFrom: 'from-blue-400',
          gradientTo: 'to-blue-600',
          progress: 75 + (mediumCount / 12) * 15,
        };
      case 'finalizing':
        return {
          icon: CogIcon,
          title: 'Finalizing Test Recommendations',
          description: 'Organizing and prioritizing test cases...',
          iconBgColor: 'bg-purple-100',
          iconColor: 'text-purple-600',
          gradientFrom: 'from-purple-400',
          gradientTo: 'to-purple-600',
          progress: 95,
        };
      case 'complete':
        return {
          icon: CheckCircleIcon,
          title: 'Test Generation Complete!',
          description: `Successfully generated ${totalCount} test recommendations`,
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

