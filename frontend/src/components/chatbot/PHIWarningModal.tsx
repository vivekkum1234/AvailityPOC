import React from 'react';
import { PHIDetectionResult } from '../../utils/phiDetection';

interface PHIWarningModalProps {
  isOpen: boolean;
  detectionResult: PHIDetectionResult | null;
  onCancel: () => void;
}

export const PHIWarningModal: React.FC<PHIWarningModalProps> = ({
  isOpen,
  detectionResult,
  onCancel
}) => {
  if (!isOpen || !detectionResult) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">PHI Detected</h2>
              <p className="text-white text-opacity-90 text-sm">Protected Health Information found in your message</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning Message */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-red-800">HIPAA Compliance Alert</p>
                <p className="text-sm text-red-700 mt-1">
                  Your message contains Protected Health Information (PHI). Sending PHI through chat may violate HIPAA regulations.
                </p>
              </div>
            </div>
          </div>

          {/* Detected PHI Items */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Detected PHI ({detectionResult.matches.length} {detectionResult.matches.length === 1 ? 'item' : 'items'}):
            </h3>
            <div className="space-y-2">
              {detectionResult.matches.map((match, index) => (
                <div key={index} className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-red-600">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{match.label}</p>
                    <p className="text-sm text-gray-900 font-mono bg-white px-2 py-1 rounded border border-gray-200 mt-1 break-all">
                      "{match.value}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Original Message */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Original Message:
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{detectionResult.originalMessage}</p>
            </div>
          </div>

          {/* Redacted Message */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Redacted Message (HIPAA Compliant):
            </h3>
            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
              <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{detectionResult.redactedMessage}</p>
            </div>
          </div>

          {/* HIPAA Info */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-blue-800">About PHI Protection</p>
                <p className="text-xs text-blue-700 mt-1">
                  Protected Health Information (PHI) includes names, dates of birth, SSN, addresses, phone numbers, and other identifiers.
                  HIPAA requires this information to be protected to ensure patient privacy.
                </p>
              </div>
            </div>
          </div>

          {/* AI Assistant Purpose Notice */}
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-purple-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-purple-800">AI Assistant Purpose</p>
                <p className="text-sm text-purple-700 mt-1">
                  This AI Assistant is designed for <strong>onboarding help only</strong>, not for accessing member data.
                  Please do not include any Protected Health Information (PHI) in your messages.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex items-center justify-between border-t border-gray-200">
          <p className="text-sm text-gray-600 italic">
            Please rephrase your message without including PHI
          </p>
          <button
            onClick={onCancel}
            className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

