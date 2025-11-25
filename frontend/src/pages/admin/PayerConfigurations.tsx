import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

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
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading payers...</p>
      </div>
    );
  }

  return (
    <>
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
              {configuration.envelopingRequirements && (
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Enveloping Requirements</h3>
                        <p className="text-sm text-gray-600">ISA and GS segment field values</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* ISA Fields */}
                      <div className="col-span-full">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">ISA Segment Fields</h4>
                      </div>
                      {configuration.envelopingRequirements.isa05_270 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">ISA05 (270):</label>
                          <p className="text-sm text-gray-900 font-mono">{configuration.envelopingRequirements.isa05_270}</p>
                        </div>
                      )}
                      {configuration.envelopingRequirements.isa05_271 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">ISA05 (271):</label>
                          <p className="text-sm text-gray-900 font-mono">{configuration.envelopingRequirements.isa05_271}</p>
                        </div>
                      )}
                      {configuration.envelopingRequirements.isa06_270 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">ISA06 (270):</label>
                          <p className="text-sm text-gray-900 font-mono">{configuration.envelopingRequirements.isa06_270}</p>
                        </div>
                      )}
                      {configuration.envelopingRequirements.isa06_271 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">ISA06 (271):</label>
                          <p className="text-sm text-gray-900 font-mono">{configuration.envelopingRequirements.isa06_271}</p>
                        </div>
                      )}
                      {configuration.envelopingRequirements.isa07_270 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">ISA07 (270):</label>
                          <p className="text-sm text-gray-900 font-mono">{configuration.envelopingRequirements.isa07_270}</p>
                        </div>
                      )}
                      {configuration.envelopingRequirements.isa07_271 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">ISA07 (271):</label>
                          <p className="text-sm text-gray-900 font-mono">{configuration.envelopingRequirements.isa07_271}</p>
                        </div>
                      )}
                      {configuration.envelopingRequirements.isa08_270 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">ISA08 (270):</label>
                          <p className="text-sm text-gray-900 font-mono">{configuration.envelopingRequirements.isa08_270}</p>
                        </div>
                      )}
                      {configuration.envelopingRequirements.isa08_271 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">ISA08 (271):</label>
                          <p className="text-sm text-gray-900 font-mono">{configuration.envelopingRequirements.isa08_271}</p>
                        </div>
                      )}
                      {configuration.envelopingRequirements.isa11_270 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">ISA11 (270):</label>
                          <p className="text-sm text-gray-900 font-mono">{configuration.envelopingRequirements.isa11_270}</p>
                        </div>
                      )}
                      {configuration.envelopingRequirements.isa11_271 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">ISA11 (271):</label>
                          <p className="text-sm text-gray-900 font-mono">{configuration.envelopingRequirements.isa11_271}</p>
                        </div>
                      )}
                      {configuration.envelopingRequirements.isa16_270 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">ISA16 (270):</label>
                          <p className="text-sm text-gray-900 font-mono">{configuration.envelopingRequirements.isa16_270}</p>
                        </div>
                      )}
                      {configuration.envelopingRequirements.isa16_271 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">ISA16 (271):</label>
                          <p className="text-sm text-gray-900 font-mono">{configuration.envelopingRequirements.isa16_271}</p>
                        </div>
                      )}

                      {/* GS Fields */}
                      <div className="col-span-full mt-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">GS Segment Fields</h4>
                      </div>
                      {configuration.envelopingRequirements.gs02_270 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">GS02 (270):</label>
                          <p className="text-sm text-gray-900 font-mono">{configuration.envelopingRequirements.gs02_270}</p>
                        </div>
                      )}
                      {configuration.envelopingRequirements.gs02_271 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">GS02 (271):</label>
                          <p className="text-sm text-gray-900 font-mono">{configuration.envelopingRequirements.gs02_271}</p>
                        </div>
                      )}
                      {configuration.envelopingRequirements.gs03_270 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">GS03 (270):</label>
                          <p className="text-sm text-gray-900 font-mono">{configuration.envelopingRequirements.gs03_270}</p>
                        </div>
                      )}
                      {configuration.envelopingRequirements.gs03_271 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">GS03 (271):</label>
                          <p className="text-sm text-gray-900 font-mono">{configuration.envelopingRequirements.gs03_271}</p>
                        </div>
                      )}

                      {/* Payer Name and ID */}
                      <div className="col-span-full mt-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">Payer Identification</h4>
                      </div>
                      {configuration.envelopingRequirements.payerName_270 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Payer Name (270):</label>
                          <p className="text-sm text-gray-900">{configuration.envelopingRequirements.payerName_270}</p>
                        </div>
                      )}
                      {configuration.envelopingRequirements.payerName_271 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Payer Name (271):</label>
                          <p className="text-sm text-gray-900">{configuration.envelopingRequirements.payerName_271}</p>
                        </div>
                      )}
                      {configuration.envelopingRequirements.payerId_270 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Payer ID (270):</label>
                          <p className="text-sm text-gray-900 font-mono">{configuration.envelopingRequirements.payerId_270}</p>
                        </div>
                      )}
                      {configuration.envelopingRequirements.payerId_271 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Payer ID (271):</label>
                          <p className="text-sm text-gray-900 font-mono">{configuration.envelopingRequirements.payerId_271}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Supported Search Options:</label>
                      <div className="flex flex-wrap gap-2">
                        {configuration.supportedSearchOptions && configuration.supportedSearchOptions.length > 0 ? (
                          configuration.supportedSearchOptions.map((option, index) => (
                            <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                              {option}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">Not specified</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Supported Service Types:</label>
                      {configuration.supportsAllServiceTypes ? (
                        <div className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-50 border border-blue-200">
                          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm font-medium text-blue-900">All Service Types Supported</span>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {configuration.supportedServiceTypes && configuration.supportedServiceTypes.length > 0 ? (
                            configuration.supportedServiceTypes.map((type, index) => (
                              <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                {type}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">Not specified</span>
                          )}
                        </div>
                      )}
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
    </>
  );
};

