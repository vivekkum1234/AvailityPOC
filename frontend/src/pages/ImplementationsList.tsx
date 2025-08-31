import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { ImplementationDetail } from '../components/ImplementationDetail';

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
  const [implementations, setImplementations] = useState<Implementation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImplementationId, setSelectedImplementationId] = useState<string | null>(null);

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
                  View and manage submitted questionnaires
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-availity-700 border border-primary-200">
                <div className="w-2 h-2 bg-availity-500 rounded-full mr-2"></div>
                {implementations.length} Implementation{implementations.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {implementations.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No implementations found</h3>
              <p className="text-gray-600 mb-6">No questionnaires have been submitted yet.</p>
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
                    {implementations.map((impl, index) => (
                      <tr
                        key={impl.id}
                        onClick={() => setSelectedImplementationId(impl.id)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-availity-500 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-white font-bold text-sm">
                                {impl.organizations.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {impl.organizations.name}
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
    </div>
  );
};
