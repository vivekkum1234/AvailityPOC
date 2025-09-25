import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface Payer {
  id: string;
  name: string;
  payerId?: string;
  organizationId: string;
}

interface PayerConfiguration {
  // Testing Configuration
  testUrl?: string;
  validMemberRecordsRequired?: boolean;
  validProviderDataRequired?: boolean;
  testVolumeMin?: number;
  testVolumeMax?: number;
  
  // Payer Configuration Summary
  implementationMode?: string;
  xmlWrapper?: boolean;
  systemHours?: string;
  maxThreads?: number;
  serviceTypes?: string[];
  memberIdFormat?: string;
  
  // Enveloping Requirements
  envelopingRequirements?: {
    isa05_270?: string;
    isa05_271?: string;
    isa06_270?: string;
    isa06_271?: string;
    isa07_270?: string;
    isa07_271?: string;
    isa08_270?: string;
    isa08_271?: string;
    isa11_270?: string;
    isa11_271?: string;
    isa16_270?: string;
    isa16_271?: string;
    gs02_270?: string;
    gs02_271?: string;
    gs03_270?: string;
    gs03_271?: string;
    payerName_270?: string;
    payerName_271?: string;
    payerId_270?: string;
    payerId_271?: string;
  };
  
  // Search Options
  supportedSearchOptions?: string[];
  supportedServiceTypes?: string[];
  supportsAllServiceTypes?: boolean;
}

export const PayerConfigurations: React.FC = () => {
  const [payers, setPayers] = useState<Payer[]>([]);
  const [selectedPayerId, setSelectedPayerId] = useState<string>('');
  const [configuration, setConfiguration] = useState<PayerConfiguration | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payersLoading, setPayersLoading] = useState(true);

  // Load payers on component mount
  useEffect(() => {
    loadPayers();
  }, []);

  // Load configuration when payer is selected
  useEffect(() => {
    if (selectedPayerId) {
      loadPayerConfiguration(selectedPayerId);
    } else {
      setConfiguration(null);
    }
  }, [selectedPayerId]);

  const loadPayers = async () => {
    try {
      setPayersLoading(true);
      const response = await apiService.getPayers();
      setPayers(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payers');
    } finally {
      setPayersLoading(false);
    }
  };

  const loadPayerConfiguration = async (payerId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getPayerConfiguration(payerId);
      setConfiguration(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payer configuration');
    } finally {
      setLoading(false);
    }
  };

  const handlePayerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPayerId(event.target.value);
  };

  if (payersLoading) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-medium">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Payer Configurations
                </h1>
                <p className="text-sm text-gray-600 font-medium">
                  View X12 field mappings and implementation settings
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                {payers.length} Payer{payers.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Payer Selection */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Select Payer Configuration</h2>
              <p className="text-sm text-gray-600 mt-1">Choose a payer to view their X12 implementation settings</p>
            </div>
            <div className="px-6 py-4">
              <label htmlFor="payer-select" className="block text-sm font-medium text-gray-700 mb-2">
                Payer Organization
              </label>
              <select
                id="payer-select"
                value={selectedPayerId}
                onChange={handlePayerChange}
                className="block w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Choose a payer...</option>
                {payers.map((payer) => (
                  <option key={payer.id} value={payer.id}>
                    {payer.name} {payer.payerId ? `(${payer.payerId})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

        {/* Configuration Content */}
        {selectedPayerId && (
          <>
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading configuration...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {configuration && !loading && (
              <div className="space-y-8">
                {/* Testing Configuration Section */}
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Testing Configuration</h3>
                        <p className="text-sm text-gray-600">Test environment and validation requirements</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Test URL:</label>
                        <p className="text-sm text-blue-600 break-all">{configuration.testUrl || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valid Provider Data Required:</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          configuration.validProviderDataRequired ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {configuration.validProviderDataRequired ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valid Member Records Required:</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          configuration.validMemberRecordsRequired ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {configuration.validMemberRecordsRequired ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Test Volume Limits:</label>
                        <p className="text-sm text-gray-900">
                          {configuration.testVolumeMin && configuration.testVolumeMax
                            ? `${configuration.testVolumeMin} - ${configuration.testVolumeMax}`
                            : 'Not specified'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payer Configuration Summary Section */}
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {payers.find(p => p.id === selectedPayerId)?.name || 'Payer'} Configuration Summary
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Implementation Mode:</label>
                        <p className="text-sm text-gray-900 capitalize">{configuration.implementationMode?.replace(/_/g, ' ') || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">XML Wrapper:</label>
                        <p className="text-sm text-gray-900">{configuration.xmlWrapper ? 'Required' : 'Not Required'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">System Hours:</label>
                        <p className="text-sm text-gray-900">{configuration.systemHours || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service Types:</label>
                        <div className="flex flex-wrap gap-1">
                          {configuration.serviceTypes?.map((type, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {type}
                            </span>
                          )) || <span className="text-sm text-gray-500">Not specified</span>}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Threads:</label>
                        <p className="text-sm text-gray-900">10</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Member ID Format:</label>
                        <p className="text-sm text-gray-900 font-mono">{configuration.memberIdFormat || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enveloping Requirements Section */}
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Enveloping Requirements</h3>
                        <p className="text-sm text-gray-600">ISA and GS segment configuration</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Field
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              270 Request
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              271 Response
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {/* ISA Segment Fields */}
                          <tr className="bg-blue-50">
                            <td colSpan={4} className="px-6 py-2 text-sm font-semibold text-blue-900">
                              ISA Segment Fields
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">ISA05</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Sender ID Qualifier</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 bg-gray-50">
                              {configuration.envelopingRequirements?.isa05_270 || <span className="text-gray-400 italic">Not specified</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 bg-gray-50">
                              {configuration.envelopingRequirements?.isa05_271 || <span className="text-gray-400 italic">Not specified</span>}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">ISA06</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Sender ID</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 bg-gray-50">
                              {configuration.envelopingRequirements?.isa06_270 || <span className="text-gray-400 italic">Not specified</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 bg-gray-50">
                              {configuration.envelopingRequirements?.isa06_271 || <span className="text-gray-400 italic">Not specified</span>}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">ISA07</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Receiver ID Qualifier</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 bg-gray-50">
                              {configuration.envelopingRequirements?.isa07_270 || <span className="text-gray-400 italic">Not specified</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 bg-gray-50">
                              {configuration.envelopingRequirements?.isa07_271 || <span className="text-gray-400 italic">Not specified</span>}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">ISA08</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Receiver ID</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 bg-gray-50">
                              {configuration.envelopingRequirements?.isa08_270 || <span className="text-gray-400 italic">Not specified</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 bg-gray-50">
                              {configuration.envelopingRequirements?.isa08_271 || <span className="text-gray-400 italic">Not specified</span>}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">ISA11</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Repetition Separator</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 bg-gray-50">
                              {configuration.envelopingRequirements?.isa11_270 || <span className="text-gray-400 italic">Not specified</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 bg-gray-50">
                              {configuration.envelopingRequirements?.isa11_271 || <span className="text-gray-400 italic">Not specified</span>}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">ISA16</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Component Element Separator</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 bg-gray-50">
                              {configuration.envelopingRequirements?.isa16_270 || <span className="text-gray-400 italic">Not specified</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 bg-gray-50">
                              {configuration.envelopingRequirements?.isa16_271 || <span className="text-gray-400 italic">Not specified</span>}
                            </td>
                          </tr>

                          {/* GS Segment Fields */}
                          <tr className="bg-green-50">
                            <td colSpan={4} className="px-6 py-2 text-sm font-semibold text-green-900">
                              GS Segment Fields
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">GS02</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Application Sender Code</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 bg-gray-50">
                              {configuration.envelopingRequirements?.gs02_270 || <span className="text-gray-400 italic">Not specified</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 bg-gray-50">
                              {configuration.envelopingRequirements?.gs02_271 || <span className="text-gray-400 italic">Not specified</span>}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">GS03</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Application Receiver Code</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 bg-gray-50">
                              {configuration.envelopingRequirements?.gs03_270 || <span className="text-gray-400 italic">Not specified</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 bg-gray-50">
                              {configuration.envelopingRequirements?.gs03_271 || <span className="text-gray-400 italic">Not specified</span>}
                            </td>
                          </tr>

                          {/* 2100A Segment Fields */}
                          <tr className="bg-purple-50">
                            <td colSpan={4} className="px-6 py-2 text-sm font-semibold text-purple-900">
                              2100A Segment Fields
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2100A NM103</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Payer Name</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 bg-gray-50">
                              {configuration.envelopingRequirements?.payerName_270 || <span className="text-gray-400 italic">Not specified</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 bg-gray-50">
                              {configuration.envelopingRequirements?.payerName_271 || <span className="text-gray-400 italic">Not specified</span>}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2100A NM109</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Payer ID</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 bg-gray-50">
                              {configuration.envelopingRequirements?.payerId_270 || <span className="text-gray-400 italic">Not specified</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 bg-gray-50">
                              {configuration.envelopingRequirements?.payerId_271 || <span className="text-gray-400 italic">Not specified</span>}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Search Options Section */}
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Search Options</h3>
                        <p className="text-sm text-gray-600">Supported search criteria and service types</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Supported Search Options:</label>
                        <div className="flex flex-wrap gap-2">
                          {configuration.supportedSearchOptions?.map((option, index) => (
                            <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              {option}
                            </span>
                          )) || <span className="text-sm text-gray-500">No search options specified</span>}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Supported Service Types:</label>
                        <div className="space-y-2">
                          {configuration.supportsAllServiceTypes ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <div className="flex items-center">
                                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium text-green-800">Supports All Service Type Codes</span>
                              </div>
                              <p className="text-xs text-green-700 mt-1">
                                This payer supports all standard X12 service type codes. Most common codes shown below:
                              </p>
                              <div className="flex flex-wrap gap-2 mt-3">
                                {configuration.supportedServiceTypes?.map((type, index) => {
                                  const serviceTypeNames: Record<string, string> = {
                                    '30': '30 - General Benefits',
                                    '12': '12 - Inpatient',
                                    '13': '13 - Outpatient',
                                    '35': '35 - Dental',
                                    '88': '88 - Pharmacy',
                                    'AL': 'AL - Vision',
                                    'MH': 'MH - Mental Health'
                                  };
                                  return (
                                    <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                      {serviceTypeNames[type] || type}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {configuration.supportedServiceTypes?.map((type, index) => {
                                const serviceTypeNames: Record<string, string> = {
                                  '30': '30 - General Benefits',
                                  '12': '12 - Inpatient',
                                  '13': '13 - Outpatient',
                                  '35': '35 - Dental',
                                  '88': '88 - Pharmacy',
                                  'AL': 'AL - Vision',
                                  'MH': 'MH - Mental Health'
                                };
                                return (
                                  <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                    {serviceTypeNames[type] || type}
                                  </span>
                                );
                              }) || <span className="text-sm text-gray-500">No service types specified</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!selectedPayerId && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Payer</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Choose a payer from the dropdown above to view their X12 field mappings and implementation settings.
            </p>
          </div>
        )}
        </div>
      </main>
    </>
  );
};
