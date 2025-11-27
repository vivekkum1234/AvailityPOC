import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { ImplementationDetail } from '../components/ImplementationDetail';
import { useAuth } from '../contexts/AuthContext';

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
  created_by?: string;
  updated_by?: string;
  updated_by_name?: string;
  organizations: {
    id: string;
    name: string;
    email: string;
  };
  created_by_user?: {
    id: string;
    name: string;
    email: string;
    user_type: string;
  };
}

export const ImplementationsList: React.FC = () => {
  const { user } = useAuth(); // Get current user for filtering
  const [implementations, setImplementations] = useState<Implementation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImplementationId, setSelectedImplementationId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [implementationToDelete, setImplementationToDelete] = useState<Implementation | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadImplementations();
  }, []);

  const loadImplementations = async () => {
    try {
      setLoading(true);
      const data = await apiService.getSubmissions();
      setImplementations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load implementations');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, impl: Implementation) => {
    e.stopPropagation();
    setImplementationToDelete(impl);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!implementationToDelete) return;

    try {
      setDeleteLoading(true);
      await apiService.deleteSubmission(implementationToDelete.id);

      // Show success message
      setSuccessMessage('Implementation deleted successfully');

      // Reload implementations
      await loadImplementations();

      // Close modal
      setDeleteModalOpen(false);
      setImplementationToDelete(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete implementation');
      setDeleteModalOpen(false);
      setImplementationToDelete(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setImplementationToDelete(null);
  };

  // Filter implementations based on user role
  const filteredImplementations = user?.userType === 'payer'
    ? implementations.filter(impl =>
        impl.submitted_by_name?.toLowerCase() === user.name.toLowerCase()
      )
    : implementations; // Availity users see all implementations



  const formatDate = (dateString: string | null, status: string) => {
    // If no date provided, show appropriate text
    if (!dateString) {
      return status === 'draft' ? 'Draft' : (status === 'in_progress' ? 'In Progress' : '—');
    }

    try {
      const date = new Date(dateString);
      // Check if date is valid (not epoch time)
      if (date.getTime() === 0 || date.getFullYear() < 1970) {
        return status === 'draft' ? 'Draft' : (status === 'in_progress' ? 'In Progress' : '—');
      }

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return status === 'draft' ? 'Draft' : (status === 'in_progress' ? 'In Progress' : '—');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      submitted: 'bg-success-100 text-success-800 border-success-200',
      completed: 'bg-primary-100 text-primary-800 border-primary-200',
      in_progress: 'bg-warning-100 text-warning-800 border-warning-200',
      draft: 'bg-gray-100 text-gray-800 border-gray-200',
      archived: 'bg-gray-100 text-gray-600 border-gray-200'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status as keyof typeof statusStyles] || statusStyles.draft}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getModeLabel = (mode: string) => {
    const modeLabels = {
      real_time_web: 'Real-time Web',
      real_time_b2b: 'Real-time B2B',
      edi_batch: 'EDI Batch'
    };
    return modeLabels[mode as keyof typeof modeLabels] || mode;
  };

  const formatLastModifiedDate = (impl: Implementation) => {
    // Check if the item was modified after submission
    const wasModified = impl.updated_at && impl.submitted_at &&
      new Date(impl.updated_at) > new Date(impl.submitted_at);

    if (wasModified) {
      try {
        const date = new Date(impl.updated_at);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        return '—';
      }
    }

    return '—';
  };

  const formatModifiedBy = (impl: Implementation) => {
    // Check if the item was modified after submission
    const wasModified = impl.updated_at && impl.submitted_at &&
      new Date(impl.updated_at) > new Date(impl.submitted_at);

    if (wasModified && impl.updated_by_name) {
      return impl.updated_by_name;
    }

    return '—';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-availity-500 mx-auto"></div>
          <h3 className="mt-6 text-xl font-semibold text-gray-800">Loading implementations</h3>
          <p className="mt-2 text-gray-600">Fetching submission data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 bg-error-50 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Failed to load implementations</h3>
          <p className="text-gray-600 mb-6 max-w-md">{error}</p>
          <button onClick={loadImplementations} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-availity-500 rounded-xl flex items-center justify-center shadow-medium">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  X12 270/271 Implementations
                </h1>
                <p className="text-sm text-gray-600 font-medium">
                  {user?.userType === 'payer'
                    ? `Your submitted questionnaires`
                    : 'View and manage submitted questionnaires'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-availity-700 border border-primary-200">
                <div className="w-2 h-2 bg-availity-500 rounded-full mr-2"></div>
                {filteredImplementations.length} Implementation{filteredImplementations.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg animate-fade-in">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
            </div>
          )}

          {filteredImplementations.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {user?.userType === 'payer' ? 'No implementations found' : 'No implementations found'}
              </h3>
              <p className="text-gray-600 mb-6">
                {user?.userType === 'payer'
                  ? 'You have not submitted any questionnaires yet.'
                  : 'No questionnaires have been submitted yet.'
                }
              </p>
              <a href="/" className="btn-primary">
                Create New Implementation
              </a>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Implementation Submissions</h2>
                <p className="text-sm text-gray-600 mt-1">Click on any row to view detailed responses</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Organization
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Implementation Mode
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Modified
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Modified By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredImplementations.map((impl, index) => (
                      <tr
                        key={impl.id}
                        onClick={() => setSelectedImplementationId(impl.id)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-availity-500 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-white font-bold text-sm">
                                {impl.organizations?.name?.charAt(0) || '?'}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {impl.organizations?.name || 'Unknown Organization'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-availity-100 text-availity-800">
                            {getModeLabel(impl.implementation_mode)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(impl.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(impl.submitted_at, impl.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {impl.submitted_by_name || impl.created_by_user?.name || impl.submitted_by || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatLastModifiedDate(impl)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatModifiedBy(impl)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/questionnaire/edit/${impl.id}`;
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(e, impl)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Implementation Detail Modal */}
      {selectedImplementationId && (
        <ImplementationDetail
          implementationId={selectedImplementationId}
          onClose={() => setSelectedImplementationId(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && implementationToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-t-2xl px-6 py-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Delete Implementation?</h3>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this implementation? This action cannot be undone.
              </p>

              {/* Implementation Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Organization:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {implementationToDelete.organizations?.name || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Implementation Mode:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {getModeLabel(implementationToDelete.implementation_mode)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Submitted:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatDate(implementationToDelete.submitted_at, implementationToDelete.status)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Submitted By:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {implementationToDelete.submitted_by_name || implementationToDelete.submitted_by || '—'}
                  </span>
                </div>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ This action cannot be undone. All data will be permanently deleted.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex items-center justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                disabled={deleteLoading}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {deleteLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Implementation'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
