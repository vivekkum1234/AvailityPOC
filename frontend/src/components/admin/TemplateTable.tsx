import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestionnaireTemplate } from '../../types/admin';
import { StatusBadge, TemplateStatus } from './StatusBadge';
import { VersionHistoryRow } from './VersionHistoryRow';

interface TemplateTableProps {
  templates: QuestionnaireTemplate[];
  comingSoonTransactions?: ComingSoonTransaction[];
}

interface ComingSoonTransaction {
  type: string;
  name: string;
  eta?: string;
}

interface ExpandedRows {
  [key: string]: boolean;
}

export const TemplateTable: React.FC<TemplateTableProps> = ({ 
  templates, 
  comingSoonTransactions = [] 
}) => {
  const navigate = useNavigate();
  const [expandedRows, setExpandedRows] = useState<ExpandedRows>({});

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const countQuestions = (template: QuestionnaireTemplate): number => {
    return template.config?.sections?.reduce((total: number, section: any) => {
      return total + (section.questions?.length || 0);
    }, 0) || 0;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            <th className="w-12 px-6 py-4"></th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Transaction Type
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Current Version
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Sections
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Questions
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Last Updated
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {/* Real Templates */}
          {templates.map((template) => (
            <React.Fragment key={template.id}>
              <tr
                className="hover:bg-blue-50 cursor-pointer transition-all duration-200 border-b border-gray-100"
                onClick={() => navigate(`/admin/templates/${template.id}`)}
              >
                <td className="px-6 py-5 whitespace-nowrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRow(template.id);
                    }}
                    className="text-gray-400 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                    title="Toggle version history"
                  >
                    {expandedRows[template.id] ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-16 w-16 flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl shadow-lg">
                      <span className="text-white font-bold text-base">
                        {template.transaction_type}
                      </span>
                    </div>
                    <div className="ml-5">
                      <div className="text-base font-semibold text-gray-900">
                        X12 {template.transaction_type}
                      </div>
                      <div className="text-sm text-gray-600">
                        {template.config?.title || 'Eligibility & Benefits'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">v{template.version}</div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <StatusBadge status={template.status as TemplateStatus} />
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-700">
                  {template.config?.sections?.length || 0}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-700">
                  {countQuestions(template)}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600">
                  {template.updated_at ? formatDate(template.updated_at) : '-'}
                </td>
              </tr>
              {expandedRows[template.id] && (
                <VersionHistoryRow
                  templateId={template.id}
                  currentVersion={template.version}
                  onRestoreSuccess={() => window.location.reload()}
                />
              )}
            </React.Fragment>
          ))}

          {/* Coming Soon Transactions */}
          {comingSoonTransactions.map((transaction, index) => (
            <tr key={`coming-soon-${index}`} className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="w-5 h-5 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
              </td>
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-16 w-16 flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl shadow-lg">
                    <span className="text-white font-bold text-base">
                      {transaction.type}
                    </span>
                  </div>
                  <div className="ml-5">
                    <div className="text-base font-semibold text-gray-900">
                      X12 {transaction.type}
                    </div>
                    <div className="text-sm text-gray-600">
                      {transaction.name}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="text-sm text-gray-500">-</div>
              </td>
              <td className="px-6 py-5 whitespace-nowrap">
                <StatusBadge status="coming_soon" />
              </td>
              <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">-</td>
              <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">-</td>
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-blue-700">
                    {transaction.eta || 'TBD'}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {templates.length === 0 && comingSoonTransactions.length === 0 && (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-4">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No templates found</h3>
          <p className="mt-2 text-sm text-gray-600">Get started by creating a new template.</p>
        </div>
      )}
    </div>
  );
};

