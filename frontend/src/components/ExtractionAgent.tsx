import React, { useEffect, useState } from 'react';
import {
  DocumentSearchIcon,
  CheckCircleIcon,
  CogIcon,
  SparklesIcon,
} from '@heroicons/react/outline';
import './ExtractionAgent.css';

interface ExtractionAgentProps {
  isExtracting: boolean;
  currentStep: 'extracting' | 'mapping' | 'complete' | null;
  extractedCount?: number;
  mappedCount?: number;
  onComplete?: () => void;
}

export const ExtractionAgent: React.FC<ExtractionAgentProps> = ({
  isExtracting,
  currentStep,
  extractedCount = 0,
  mappedCount = 0,
  onComplete,
}) => {
  const [showAgent, setShowAgent] = useState(false);

  useEffect(() => {
    if (isExtracting) {
      setShowAgent(true);
    } else if (currentStep === 'complete') {
      // Keep showing for 1 second after completion
      setTimeout(() => {
        setShowAgent(false);
        onComplete?.();
      }, 1500);
    }
  }, [isExtracting, currentStep, onComplete]);

  const getStepInfo = () => {
    switch (currentStep) {
      case 'extracting':
        return {
          icon: DocumentSearchIcon,
          title: 'Extracting PDF Fields',
          description: 'Scanning your document for form fields...',
          iconBgColor: 'bg-blue-100',
          iconColor: 'text-blue-600',
          gradientFrom: 'from-blue-400',
          gradientTo: 'to-blue-600',
          progress: 33,
        };
      case 'mapping':
        return {
          icon: CogIcon,
          title: 'Mapping Fields',
          description: `Mapping ${extractedCount} fields to questionnaire...`,
          iconBgColor: 'bg-purple-100',
          iconColor: 'text-purple-600',
          gradientFrom: 'from-purple-400',
          gradientTo: 'to-purple-600',
          progress: 66,
        };
      case 'complete':
        return {
          icon: CheckCircleIcon,
          title: 'Extraction Complete!',
          description: `Successfully mapped ${mappedCount} fields`,
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
    <div className="extraction-agent-overlay">
      <div className="extraction-agent-modal">
        {/* Animated Icon */}
        <div className="flex justify-center mb-6">
          <div className={`p-4 rounded-full ${stepInfo.iconBgColor} ${
            currentStep === 'mapping' ? 'agent-icon-spin' : ''
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

