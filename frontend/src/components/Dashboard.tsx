import React, { useState, useEffect } from 'react';

// Types
interface PayerData {
  id: string;
  name: string;
  organizationId: string;
  products: ProductComponent[];
  currentStep: string;
  stepStartDate: string;
  lastActivityDate: string;
  completionPercentage: number;
  status: 'active' | 'stuck' | 'abandoned' | 'completed';
}

interface ProductComponent {
  transactionType: string;
  transactionName: string;
  status: 'active' | 'pending' | 'completed' | 'not_started';
  startDate?: string;
  completionDate?: string;
}

interface ThresholdConfig {
  stuckDays: number;
  abandonedDays: number;
}

export const Dashboard: React.FC = () => {
  const [payers, setPayers] = useState<PayerData[]>([]);
  const [selectedPayer, setSelectedPayer] = useState<string>('all');
  const [thresholds, setThresholds] = useState<ThresholdConfig>({
    stuckDays: 7,
    abandonedDays: 30
  });
  const [showThresholdConfig, setShowThresholdConfig] = useState(false);

  // Load payer data
  useEffect(() => {
    loadPayerData();
  }, [thresholds]);

  const loadPayerData = () => {
    // Helper function to get date X days ago
    const getDaysAgo = (days: number) => {
      const date = new Date();
      date.setDate(date.getDate() - days);
      return date.toISOString().split('T')[0];
    };

    // Mock data - replace with actual API call
    const mockPayers: PayerData[] = [
      {
        id: '1',
        name: 'Aetna Health Insurance',
        organizationId: 'ORG-001',
        products: [
          { transactionType: '270/271', transactionName: 'Eligibility & Benefits', status: 'active', startDate: getDaysAgo(25) },
          { transactionType: '835', transactionName: 'Claims Payment', status: 'pending' },
          { transactionType: '837', transactionName: 'Claims Submission', status: 'not_started' },
        ],
        currentStep: 'Enveloping Requirements',
        stepStartDate: getDaysAgo(5),
        lastActivityDate: getDaysAgo(2),
        completionPercentage: 45,
        status: 'active'
      },
      {
        id: '2',
        name: 'Blue Cross Blue Shield',
        organizationId: 'ORG-002',
        products: [
          { transactionType: '270/271', transactionName: 'Eligibility & Benefits', status: 'active', startDate: getDaysAgo(30) },
          { transactionType: '276/277', transactionName: 'Claim Status', status: 'pending' },
          { transactionType: '278', transactionName: 'Prior Authorization', status: 'not_started' },
        ],
        currentStep: 'Connectivity (B2B)',
        stepStartDate: getDaysAgo(10),
        lastActivityDate: getDaysAgo(8),
        completionPercentage: 60,
        status: 'stuck'
      },
      {
        id: '3',
        name: 'UnitedHealthcare',
        organizationId: 'ORG-003',
        products: [
          { transactionType: '270/271', transactionName: 'Eligibility & Benefits', status: 'completed', startDate: getDaysAgo(60), completionDate: getDaysAgo(40) },
          { transactionType: '835', transactionName: 'Claims Payment', status: 'completed', startDate: getDaysAgo(60), completionDate: getDaysAgo(40) },
          { transactionType: '837', transactionName: 'Claims Submission', status: 'active', startDate: getDaysAgo(20) },
        ],
        currentStep: 'Testing',
        stepStartDate: getDaysAgo(4),
        lastActivityDate: getDaysAgo(1),
        completionPercentage: 85,
        status: 'active'
      },
      {
        id: '4',
        name: 'Cigna Healthcare',
        organizationId: 'ORG-004',
        products: [
          { transactionType: '270/271', transactionName: 'Eligibility & Benefits', status: 'active', startDate: getDaysAgo(45) },
          { transactionType: '276/277', transactionName: 'Claim Status', status: 'not_started' },
        ],
        currentStep: 'Organization Information',
        stepStartDate: getDaysAgo(35),
        lastActivityDate: getDaysAgo(35),
        completionPercentage: 12,
        status: 'abandoned'
      },
      {
        id: '5',
        name: 'Humana Inc',
        organizationId: 'ORG-005',
        products: [
          { transactionType: '270/271', transactionName: 'Eligibility & Benefits', status: 'active', startDate: getDaysAgo(18) },
          { transactionType: '835', transactionName: 'Claims Payment', status: 'pending' },
          { transactionType: '837', transactionName: 'Claims Submission', status: 'pending' },
          { transactionType: '278', transactionName: 'Prior Authorization', status: 'not_started' },
        ],
        currentStep: 'Payer Enhancements',
        stepStartDate: getDaysAgo(9),
        lastActivityDate: getDaysAgo(7),
        completionPercentage: 35,
        status: 'stuck'
      }
    ];

    // Calculate status based on thresholds
    const now = new Date();
    const processedPayers = mockPayers.map(payer => {
      const daysSinceActivity = Math.floor((now.getTime() - new Date(payer.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24));
      const daysInCurrentStep = Math.floor((now.getTime() - new Date(payer.stepStartDate).getTime()) / (1000 * 60 * 60 * 24));
      
      let status: PayerData['status'] = 'active';
      if (payer.completionPercentage === 100) {
        status = 'completed';
      } else if (daysSinceActivity >= thresholds.abandonedDays) {
        status = 'abandoned';
      } else if (daysInCurrentStep >= thresholds.stuckDays) {
        status = 'stuck';
      }
      
      return { ...payer, status };
    });

    setPayers(processedPayers);
  };

  const getStatusColor = (status: PayerData['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'stuck': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'abandoned': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProductStatusColor = (status: ProductComponent['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'active': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'not_started': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredPayers = selectedPayer === 'all' 
    ? payers 
    : payers.filter(p => p.id === selectedPayer);

  const stats = {
    total: payers.length,
    active: payers.filter(p => p.status === 'active').length,
    stuck: payers.filter(p => p.status === 'stuck').length,
    abandoned: payers.filter(p => p.status === 'abandoned').length,
    completed: payers.filter(p => p.status === 'completed').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-availity-600 to-primary-600 bg-clip-text text-transparent">
              Implementation Dashboard
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Monitor payer implementations and track progress</p>
          </div>
          <button
            onClick={() => setShowThresholdConfig(!showThresholdConfig)}
            className="px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-availity-500 hover:shadow-lg transition-all duration-200 flex items-center space-x-2 group"
          >
            <svg className="w-5 h-5 text-gray-600 group-hover:text-availity-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-semibold text-gray-700 group-hover:text-availity-600 transition-colors">Configure Thresholds</span>
          </button>
        </div>

        {/* Threshold Configuration Panel */}
        {showThresholdConfig && (
          <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-availity-200 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-availity-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Threshold Configuration
            </h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200">
                <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Stuck Threshold (days)
                </label>
                <input
                  type="number"
                  value={thresholds.stuckDays}
                  onChange={(e) => setThresholds({ ...thresholds, stuckDays: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border-2 border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-semibold text-lg"
                  min="1"
                />
                <p className="text-xs text-gray-600 mt-2">⚠️ Mark as stuck if no progress for this many days</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border-2 border-red-200">
                <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Abandoned Threshold (days)
                </label>
                <input
                  type="number"
                  value={thresholds.abandonedDays}
                  onChange={(e) => setThresholds({ ...thresholds, abandonedDays: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-semibold text-lg"
                  min="1"
                />
                <p className="text-xs text-gray-600 mt-2">🚨 Mark as abandoned if no activity for this many days</p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Total Payers Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Payers</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>

          {/* Active Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Active</p>
            <p className="text-4xl font-bold text-blue-900 mt-2">{stats.active}</p>
          </div>

          {/* Stuck Card */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-yellow-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-semibold text-yellow-700 uppercase tracking-wide">Stuck</p>
            <p className="text-4xl font-bold text-yellow-900 mt-2">{stats.stuck}</p>
            <p className="text-xs text-yellow-700 mt-2 font-medium">≥ {thresholds.stuckDays} days in step</p>
          </div>

          {/* Abandoned Card */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-red-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-semibold text-red-700 uppercase tracking-wide">Abandoned</p>
            <p className="text-4xl font-bold text-red-900 mt-2">{stats.abandoned}</p>
            <p className="text-xs text-red-700 mt-2 font-medium">≥ {thresholds.abandonedDays} days inactive</p>
          </div>

          {/* Completed Card */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Completed</p>
            <p className="text-4xl font-bold text-green-900 mt-2">{stats.completed}</p>
          </div>
        </div>

        {/* Payer Filter */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-availity-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter by Payer
          </label>
          <select
            value={selectedPayer}
            onChange={(e) => setSelectedPayer(e.target.value)}
            className="w-full md:w-96 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-availity-500 focus:border-availity-500 font-medium text-gray-700 bg-gray-50 hover:bg-white transition-colors"
          >
            <option value="all">All Payers ({payers.length})</option>
            {payers.map(payer => (
              <option key={payer.id} value={payer.id}>{payer.name}</option>
            ))}
          </select>
        </div>

        {/* Payer Details */}
        <div className="space-y-6">
          {filteredPayers.map(payer => (
            <div key={payer.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-100 hover:border-availity-300 transition-all duration-300">
              {/* Payer Header */}
              <div className="bg-gradient-to-r from-availity-500 to-primary-500 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-availity-600">
                        {payer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{payer.name}</h3>
                      <p className="text-sm text-white/80 mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {payer.organizationId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <span className={`px-6 py-3 rounded-xl text-sm font-bold shadow-lg ${getStatusColor(payer.status)}`}>
                      {payer.status.charAt(0).toUpperCase() + payer.status.slice(1)}
                    </span>
                    <div className="text-right bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
                      <p className="text-4xl font-bold text-white">{payer.completionPercentage}%</p>
                      <p className="text-xs text-white/80 font-medium">Complete</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="w-full bg-white/30 rounded-full h-3 backdrop-blur-sm">
                    <div
                      className="bg-white h-3 rounded-full transition-all duration-500 shadow-lg"
                      style={{ width: `${payer.completionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Three Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-8 bg-gray-50">
                {/* Column 1: Product/Transaction Components */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                  <h4 className="text-lg font-bold text-gray-900 mb-5 flex items-center pb-3 border-b-2 border-availity-200">
                    <div className="w-8 h-8 bg-gradient-to-br from-availity-500 to-primary-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    Product Components
                  </h4>
                  <div className="space-y-3">
                    {payer.products.map((product, idx) => (
                      <div key={idx} className="bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl p-4 hover:border-availity-300 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-900 text-sm">{product.transactionType}</span>
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getProductStatusColor(product.status)}`}>
                            {product.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-2">{product.transactionName}</p>
                        <div className="flex items-center space-x-3 text-xs">
                          {product.startDate && (
                            <span className="text-gray-500 flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(product.startDate).toLocaleDateString()}
                            </span>
                          )}
                          {product.completionDate && (
                            <span className="text-green-600 font-semibold flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              {new Date(product.completionDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: Progress Queue Monitor */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                  <h4 className="text-lg font-bold text-gray-900 mb-5 flex items-center pb-3 border-b-2 border-blue-200">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    Progress Queue
                  </h4>

                  <div className="space-y-4">
                    {/* Current Step */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-5 shadow-sm">
                      <p className="text-xs font-bold text-blue-700 mb-2 uppercase tracking-wide">Current Step</p>
                      <p className="text-base font-bold text-gray-900">{payer.currentStep}</p>
                    </div>

                    {/* Time in Current Step */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Time in Step</p>
                        {(() => {
                          const daysInStep = Math.floor((new Date().getTime() - new Date(payer.stepStartDate).getTime()) / (1000 * 60 * 60 * 24));
                          const isStuck = daysInStep >= thresholds.stuckDays;
                          return (
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${isStuck ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300' : 'bg-green-100 text-green-800 border-2 border-green-300'}`}>
                              {daysInStep} days
                            </span>
                          );
                        })()}
                      </div>
                      <p className="text-xs text-gray-600 font-medium flex items-center">
                        <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Started: {new Date(payer.stepStartDate).toLocaleDateString()}
                      </p>
                      {(() => {
                        const daysInStep = Math.floor((new Date().getTime() - new Date(payer.stepStartDate).getTime()) / (1000 * 60 * 60 * 24));
                        if (daysInStep >= thresholds.stuckDays) {
                          return (
                            <div className="mt-3 bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
                              <div className="flex items-start space-x-2">
                                <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <p className="text-xs text-yellow-800 font-semibold">Stuck - Exceeds {thresholds.stuckDays} day threshold</p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    {/* Step History/Timeline */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm">
                      <p className="text-xs font-bold text-gray-700 mb-4 uppercase tracking-wide">Recent Activity</p>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5 shadow-sm"></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 font-semibold">{payer.currentStep}</p>
                            <p className="text-xs text-gray-500">{new Date(payer.stepStartDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-3 h-3 bg-gray-300 rounded-full mt-1.5"></div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-600">Previous steps completed</p>
                            <button className="text-xs text-availity-600 hover:text-availity-700 font-semibold mt-1">
                              View full history →
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3: Abandonment Monitoring */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                  <h4 className="text-lg font-bold text-gray-900 mb-5 flex items-center pb-3 border-b-2 border-purple-200">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    Abandonment Monitor
                  </h4>

                  <div className="space-y-4">
                    {/* Last Activity */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm">
                      <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Last Activity</p>
                      <p className="text-base font-bold text-gray-900">{new Date(payer.lastActivityDate).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-600 mt-2 font-medium flex items-center">
                        <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {(() => {
                          const daysSinceActivity = Math.floor((new Date().getTime() - new Date(payer.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24));
                          return `${daysSinceActivity} days ago`;
                        })()}
                      </p>
                    </div>

                    {/* Abandonment Risk */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm">
                      <p className="text-xs font-bold text-gray-700 mb-4 uppercase tracking-wide">Abandonment Risk</p>
                      {(() => {
                        const daysSinceActivity = Math.floor((new Date().getTime() - new Date(payer.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24));
                        const riskPercentage = Math.min(100, Math.floor((daysSinceActivity / thresholds.abandonedDays) * 100));

                        let riskLevel = 'Low';
                        let riskColor = 'from-green-400 to-green-500';
                        let riskTextColor = 'text-green-800';
                        let riskBgColor = 'bg-green-100';
                        let riskBorderColor = 'border-green-300';

                        if (riskPercentage >= 100) {
                          riskLevel = 'Abandoned';
                          riskColor = 'from-red-400 to-red-500';
                          riskTextColor = 'text-red-800';
                          riskBgColor = 'bg-red-100';
                          riskBorderColor = 'border-red-300';
                        } else if (riskPercentage >= 75) {
                          riskLevel = 'Critical';
                          riskColor = 'from-orange-400 to-orange-500';
                          riskTextColor = 'text-orange-800';
                          riskBgColor = 'bg-orange-100';
                          riskBorderColor = 'border-orange-300';
                        } else if (riskPercentage >= 50) {
                          riskLevel = 'High';
                          riskColor = 'from-yellow-400 to-yellow-500';
                          riskTextColor = 'text-yellow-800';
                          riskBgColor = 'bg-yellow-100';
                          riskBorderColor = 'border-yellow-300';
                        }

                        return (
                          <>
                            <div className="flex items-center justify-between mb-3">
                              <span className={`px-4 py-2 rounded-lg text-xs font-bold ${riskBgColor} ${riskTextColor} border-2 ${riskBorderColor} shadow-sm`}>
                                {riskLevel}
                              </span>
                              <span className="text-2xl font-bold text-gray-900">{riskPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                              <div
                                className={`bg-gradient-to-r ${riskColor} h-3 rounded-full transition-all duration-500 shadow-sm`}
                                style={{ width: `${riskPercentage}%` }}
                              />
                            </div>
                            {riskPercentage >= 100 && (
                              <div className="mt-3 bg-red-50 border-l-4 border-red-500 p-3 rounded">
                                <div className="flex items-start space-x-2">
                                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                  </svg>
                                  <p className="text-xs text-red-800 font-semibold">Implementation abandoned - No activity for {thresholds.abandonedDays}+ days</p>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    {/* Completion Rate */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-5 shadow-sm">
                      <p className="text-xs font-bold text-purple-700 mb-3 uppercase tracking-wide">Completion Rate</p>
                      <div className="flex items-baseline space-x-2 mb-3">
                        <span className="text-3xl font-bold text-purple-900">{payer.completionPercentage}%</span>
                        <span className="text-xs text-purple-600 font-medium">of questionnaire</span>
                      </div>
                      <div className="w-full bg-purple-200 rounded-full h-2 shadow-inner mb-3">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${payer.completionPercentage}%` }}
                        />
                      </div>
                      <div className="mt-3">
                        {payer.completionPercentage < 25 && (
                          <div className="flex items-center space-x-2 text-orange-700 bg-orange-100 px-3 py-2 rounded-lg">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs font-semibold">Low completion - needs attention</p>
                          </div>
                        )}
                        {payer.completionPercentage >= 25 && payer.completionPercentage < 75 && (
                          <div className="flex items-center space-x-2 text-blue-700 bg-blue-100 px-3 py-2 rounded-lg">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs font-semibold">In progress</p>
                          </div>
                        )}
                        {payer.completionPercentage >= 75 && payer.completionPercentage < 100 && (
                          <div className="flex items-center space-x-2 text-green-700 bg-green-100 px-3 py-2 rounded-lg">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs font-semibold">Nearly complete</p>
                          </div>
                        )}
                        {payer.completionPercentage === 100 && (
                          <div className="flex items-center space-x-2 text-green-700 bg-green-100 px-3 py-2 rounded-lg">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs font-semibold">Completed!</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-2">
                      <button className="w-full px-5 py-3 bg-gradient-to-r from-availity-600 to-primary-600 text-white rounded-xl hover:from-availity-700 hover:to-primary-700 text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>Send Reminder</span>
                      </button>
                      <button className="w-full px-5 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-availity-500 text-sm font-bold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

