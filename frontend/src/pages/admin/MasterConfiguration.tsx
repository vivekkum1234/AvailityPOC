import React, { useState, useEffect } from 'react';
import { adminApiService } from '../../services/adminApi';
import { QuestionnaireTemplate } from '../../types/admin';
import { TemplateTable } from '../../components/admin/TemplateTable';

// Coming soon transactions
const COMING_SOON_TRANSACTIONS = [
  { type: '837', name: 'Claims Submission', eta: 'Q1 2026' },
  { type: '276/277', name: 'Claim Status', eta: 'Q2 2026' },
  { type: '278', name: 'Authorization', eta: 'Q2 2026' },
  { type: '835', name: 'Payment/Remittance', eta: 'Q3 2026' },
  { type: '834', name: 'Enrollment', eta: 'Q3 2026' },
];

export const MasterConfiguration: React.FC = () => {
  const [templates, setTemplates] = useState<QuestionnaireTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiService.getTemplates();

      // Group by transaction_type and keep only the latest version
      const latestTemplates = data.reduce((acc: QuestionnaireTemplate[], template) => {
        const existing = acc.find(t => t.transaction_type === template.transaction_type);
        if (!existing) {
          acc.push(template);
        } else {
          // Compare versions and keep the latest
          const existingVersion = existing.version.split('.').map(Number);
          const currentVersion = template.version.split('.').map(Number);

          for (let i = 0; i < 3; i++) {
            if (currentVersion[i] > existingVersion[i]) {
              // Replace with newer version
              const index = acc.indexOf(existing);
              acc[index] = template;
              break;
            } else if (currentVersion[i] < existingVersion[i]) {
              break;
            }
          }
        }
        return acc;
      }, []);

      setTemplates(latestTemplates);
    } catch (err: any) {
      setError(err.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      template.transaction_type.toLowerCase().includes(query) ||
      template.version.toLowerCase().includes(query) ||
      template.status.toLowerCase().includes(query) ||
      template.config?.title?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading templates...</p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm shadow-sm transition-all duration-200"
            placeholder="Search templates by transaction type, version, or status..."
          />
        </div>
      </div>

      {/* Templates Table */}
      <TemplateTable
        templates={filteredTemplates}
        comingSoonTransactions={COMING_SOON_TRANSACTIONS}
      />
    </>
  );
};

