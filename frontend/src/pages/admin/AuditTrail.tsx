import React, { useState } from 'react';

interface ChatLog {
  id: string;
  timestamp: string;
  user_name: string;
  organization: string;
  user_message: string;
  bot_response: string;
  flags: ('answered' | 'phi-blocked' | 'escalated' | 'error' | 'voice-mode')[];
  context: {
    section?: string;
    mode?: string;
  };
}

// Mock data for demo
const MOCK_CHAT_LOGS: ChatLog[] = [
  {
    id: '1',
    timestamp: '2025-12-05T14:45:23Z',
    user_name: 'John Smith',
    organization: 'Blue Cross Blue Shield',
    user_message: 'What is ISA05?',
    bot_response: 'ISA05 is the Interchange ID Qualifier that identifies the type of identification being used in ISA06. Common values include "ZZ" for mutually defined, "01" for DUNS number, and "30" for Federal Tax ID.',
    flags: ['answered'],
    context: {
      section: 'Enveloping Requirements',
      mode: 'Real-time B2B'
    }
  },
  {
    id: '2',
    timestamp: '2025-12-05T14:32:15Z',
    user_name: 'Sarah Johnson',
    organization: 'UnitedHealthcare',
    user_message: 'I need help with member information for John Doe, SSN 123-45-6789',
    bot_response: '[BLOCKED - PHI Detected]',
    flags: ['phi-blocked'],
    context: {
      section: 'Member Information',
      mode: 'Real-time Web'
    }
  },
  {
    id: '3',
    timestamp: '2025-12-05T14:28:47Z',
    user_name: 'Mike Chen',
    organization: 'Cigna Healthcare',
    user_message: 'What is the SLA for testing environment approval?',
    bot_response: 'I don\'t have information about Availity\'s internal SLA timelines. This question has been forwarded to the Availity admin team.',
    flags: ['escalated'],
    context: {
      section: 'Dashboard',
      mode: 'N/A'
    }
  },
  {
    id: '4',
    timestamp: '2025-12-05T14:15:32Z',
    user_name: 'Lisa Anderson',
    organization: 'Humana Inc',
    user_message: 'Can you help me fill out the form?',
    bot_response: 'I can fill out the entire form with example data. This will populate all sections automatically. Would you like me to proceed?',
    flags: ['answered'],
    context: {
      section: 'Organization Information',
      mode: 'Real-time B2B'
    }
  },
  {
    id: '5',
    timestamp: '2025-12-05T14:10:18Z',
    user_name: 'David Martinez',
    organization: 'Aetna Health Insurance',
    user_message: 'Navigate to next section',
    bot_response: 'Moving to next section',
    flags: ['answered', 'voice-mode'],
    context: {
      section: 'Contact Information',
      mode: 'Real-time B2B'
    }
  },
  {
    id: '6',
    timestamp: '2025-12-05T13:58:42Z',
    user_name: 'Emily Rodriguez',
    organization: 'Blue Cross Blue Shield',
    user_message: 'What are the transaction fees for 270/271?',
    bot_response: 'I don\'t have information about pricing or transaction fees. This question has been forwarded to the Availity admin team.',
    flags: ['escalated'],
    context: {
      section: 'Dashboard',
      mode: 'N/A'
    }
  },
  {
    id: '7',
    timestamp: '2025-12-05T13:45:29Z',
    user_name: 'Robert Taylor',
    organization: 'UnitedHealthcare',
    user_message: 'Explain GS03 field',
    bot_response: 'GS03 is the Application Receiver Code in the functional group header. It identifies the receiving application and should match your trading partner\'s requirements.',
    flags: ['answered'],
    context: {
      section: 'Enveloping Requirements',
      mode: 'EDI Batch'
    }
  },
  {
    id: '8',
    timestamp: '2025-12-05T13:30:15Z',
    user_name: 'Jennifer Lee',
    organization: 'Cigna Healthcare',
    user_message: 'Patient Mary Wilson, DOB 05/15/1985, needs eligibility check',
    bot_response: '[BLOCKED - PHI Detected]',
    flags: ['phi-blocked'],
    context: {
      section: 'Testing',
      mode: 'Real-time Web'
    }
  }
];

export const AuditTrail: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFlag, setFilterFlag] = useState<'all' | 'answered' | 'phi-blocked' | 'escalated' | 'error' | 'voice-mode'>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Filter logs
  const filteredLogs = MOCK_CHAT_LOGS.filter(log => {
    const matchesSearch = 
      log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterFlag === 'all' || log.flags.includes(filterFlag);
    
    return matchesSearch && matchesFilter;
  });

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getFlagBadge = (flag: string) => {
    switch (flag) {
      case 'answered':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Answered
          </span>
        );
      case 'phi-blocked':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            PHI Blocked
          </span>
        );
      case 'escalated':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            Escalated
          </span>
        );
      case 'voice-mode':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
            Voice Mode
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Error
          </span>
        );
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Chats</p>
              <p className="text-3xl font-bold mt-1">{MOCK_CHAT_LOGS.length}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Answered</p>
              <p className="text-3xl font-bold mt-1">{MOCK_CHAT_LOGS.filter(l => l.flags.includes('answered')).length}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">PHI Blocked</p>
              <p className="text-3xl font-bold mt-1">{MOCK_CHAT_LOGS.filter(l => l.flags.includes('phi-blocked')).length}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Escalated</p>
              <p className="text-3xl font-bold mt-1">{MOCK_CHAT_LOGS.filter(l => l.flags.includes('escalated')).length}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Chats
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by user, organization, or message..."
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="md:w-64">
            <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              id="filter"
              value={filterFlag}
              onChange={(e) => setFilterFlag(e.target.value as any)}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">All Chats</option>
              <option value="answered">Answered</option>
              <option value="phi-blocked">PHI Blocked</option>
              <option value="escalated">Escalated</option>
              <option value="voice-mode">Voice Mode</option>
              <option value="error">Errors</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chat Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Audit Trail</h2>
              <p className="text-sm text-gray-600 mt-1">
                Showing {filteredLogs.length} of {MOCK_CHAT_LOGS.length} chatbot interactions
              </p>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Context
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-sm font-medium">No chat logs found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-medium">
                            {log.user_name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{log.user_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {log.organization}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                        {log.user_message}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {log.flags.map((flag, idx) => (
                            <div key={idx}>{getFlagBadge(flag)}</div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {log.context.section && (
                          <div className="text-xs">
                            <span className="font-medium">Section:</span> {log.context.section}
                          </div>
                        )}
                        {log.context.mode && (
                          <div className="text-xs text-gray-500">
                            {log.context.mode}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => toggleRow(log.id)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          {expandedRows.has(log.id) ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedRows.has(log.id) && (
                      <tr className="bg-gray-50">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="space-y-3">
                            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
                              <p className="text-xs font-semibold text-blue-900 mb-1">User Question:</p>
                              <p className="text-sm text-blue-800">{log.user_message}</p>
                            </div>
                            <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-4">
                              <p className="text-xs font-semibold text-green-900 mb-1">Bot Response:</p>
                              <p className="text-sm text-green-800">{log.bot_response}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

