import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApiService } from '../../services/adminApi';
import { QuestionnaireVersion } from '../../types/admin';
import { VersionComparisonModal } from './VersionComparisonModal';
import { RestoreConfirmationDialog } from './RestoreConfirmationDialog';

interface VersionHistoryRowProps {
  templateId: string;
  currentVersion: string;
  onRestoreSuccess?: () => void;
}

export const VersionHistoryRow: React.FC<VersionHistoryRowProps> = ({
  templateId,
  currentVersion,
  onRestoreSuccess
}) => {
  const navigate = useNavigate();
  const [versions, setVersions] = useState<QuestionnaireVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<QuestionnaireVersion | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  useEffect(() => {
    loadVersionHistory();
  }, [templateId]);

  const loadVersionHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiService.getVersionHistory(templateId);
      setVersions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load version history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRestoreClick = (version: QuestionnaireVersion) => {
    setSelectedVersion(version);
    setShowComparisonModal(true);
    setRestoreError(null);
  };

  const handleComparisonContinue = () => {
    setShowComparisonModal(false);
    setShowConfirmDialog(true);
  };

  const handleRestoreConfirm = async (changesSummary: string) => {
    if (!selectedVersion) return;

    try {
      setIsRestoring(true);
      setRestoreError(null);

      await adminApiService.restoreVersion(
        templateId,
        selectedVersion.id,
        changesSummary
      );

      // Close dialogs
      setShowConfirmDialog(false);
      setSelectedVersion(null);

      // Reload version history
      await loadVersionHistory();

      // Notify parent component
      if (onRestoreSuccess) {
        onRestoreSuccess();
      }

      // Navigate to dashboard
      navigate('/admin');
    } catch (err: any) {
      setRestoreError(err.message || 'Failed to restore version');
      setIsRestoring(false);
    }
  };

  const handleCancelRestore = () => {
    setShowComparisonModal(false);
    setShowConfirmDialog(false);
    setSelectedVersion(null);
    setRestoreError(null);
  };

  return (
    <>
    <tr className="bg-gray-50">
      <td colSpan={8} className="px-6 py-4">
        <div className="ml-14">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Version History
          </h4>

          {loading && (
            <div className="text-sm text-gray-500 py-2">Loading version history...</div>
          )}

          {error && (
            <div className="text-sm text-red-600 py-2">
              {error}
            </div>
          )}

          {!loading && !error && versions.length === 0 && (
            <div className="text-sm text-gray-500 py-2">
              No version history available yet.
            </div>
          )}

          {!loading && !error && versions.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Version
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Created Date
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Created By
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Changes
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {versions.map((version) => (
                    <tr key={version.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        v{version.version}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Archived
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {version.created_at ? formatDate(version.created_at) : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {version.created_by_name || 'System'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <div className="max-w-xs truncate" title={version.changes_summary || ''}>
                          {version.changes_summary || 'No description'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(`/admin/templates/${version.template_id}?version=${version.id}`)}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleRestoreClick(version)}
                          className="text-amber-600 hover:text-amber-900"
                          title="Restore this version"
                        >
                          Restore
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Restore Error */}
        {restoreError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-red-800">Failed to restore version</h4>
                <p className="text-sm text-red-700 mt-1">{restoreError}</p>
              </div>
            </div>
          </div>
        )}
      </td>
    </tr>

    {/* Modals */}
    {showComparisonModal && selectedVersion && (
      <VersionComparisonModal
        templateId={templateId}
        versionId={selectedVersion.id}
        versionNumber={selectedVersion.version}
        onClose={handleCancelRestore}
        onContinue={handleComparisonContinue}
      />
    )}

    {showConfirmDialog && selectedVersion && (
      <RestoreConfirmationDialog
        versionNumber={selectedVersion.version}
        currentVersion={currentVersion}
        onConfirm={handleRestoreConfirm}
        onCancel={handleCancelRestore}
        isRestoring={isRestoring}
      />
    )}
    </>
  );
};

