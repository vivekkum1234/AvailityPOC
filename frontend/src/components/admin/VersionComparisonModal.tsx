import React, { useState, useEffect } from 'react';
import { adminApiService } from '../../services/adminApi';

interface VersionComparisonModalProps {
  templateId: string;
  versionId: string;
  versionNumber: string;
  onClose: () => void;
  onContinue: () => void;
}

export const VersionComparisonModal: React.FC<VersionComparisonModalProps> = ({
  templateId,
  versionId,
  versionNumber,
  onClose,
  onContinue
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<any>(null);

  useEffect(() => {
    loadComparison();
  }, [templateId, versionId]);

  const loadComparison = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiService.compareVersions(templateId, versionId);
      setComparison(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load comparison');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Compare Versions
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && comparison && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Current Version</h3>
                  <p className="text-2xl font-bold text-gray-900">v{comparison.current.version}</p>
                  <div className="mt-3 space-y-1 text-sm text-gray-600">
                    <p>• {comparison.current.sections} sections</p>
                    <p>• {comparison.current.questions} questions</p>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-600 mb-2">Restoring Version</h3>
                  <p className="text-2xl font-bold text-blue-900">v{comparison.restoring.version}</p>
                  <div className="mt-3 space-y-1 text-sm text-blue-700">
                    <p>• {comparison.restoring.sections} sections</p>
                    <p>• {comparison.restoring.questions} questions</p>
                  </div>
                </div>
              </div>

              {/* Field Label Changes */}
              {comparison.changes.labelChanges.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Field Label Changes ({comparison.changes.labelChanges.length})
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="max-h-96 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Label</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">→</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restoring Label</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {comparison.changes.labelChanges.slice(0, 10).map((change: any, index: number) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-600">{change.section}</td>
                              <td className="px-4 py-3 text-sm text-red-600 line-through">{change.currentLabel}</td>
                              <td className="px-4 py-3 text-center text-gray-400">→</td>
                              <td className="px-4 py-3 text-sm text-green-600 font-medium">{change.restoringLabel}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {comparison.changes.labelChanges.length > 10 && (
                      <div className="bg-gray-50 px-4 py-2 text-sm text-gray-600 text-center border-t border-gray-200">
                        ... and {comparison.changes.labelChanges.length - 10} more changes
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Warning */}
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-amber-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-amber-800">
                    Restoring will revert these label changes and may affect the questionnaire form for all users.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onContinue}
            disabled={loading || !!error}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Restore
          </button>
        </div>
      </div>
    </div>
  );
};

