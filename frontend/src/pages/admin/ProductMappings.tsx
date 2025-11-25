import React, { useState, useEffect } from 'react';
import { adminApiService } from '../../services/adminApi';

interface Product {
  type: string;
  name: string;
  status: string;
}

interface Payer {
  id: string;
  name: string;
  organizationId: string;
  isAssigned: boolean;
}

interface ProductMappingData {
  productType: string;
  payers: Payer[];
  stats: {
    total: number;
    assigned: number;
  };
}

export const ProductMappings: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [mappingData, setMappingData] = useState<ProductMappingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      loadProductMappings(selectedProduct);
    }
  }, [selectedProduct]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiService.getProducts();
      setProducts(data);
      
      // Auto-select first product if available
      if (data.length > 0 && !selectedProduct) {
        setSelectedProduct(data[0].type);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadProductMappings = async (productType: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiService.getProductMappings(productType);
      setMappingData(data);
      setHasChanges(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load product assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePayer = (payerId: string) => {
    if (!mappingData) return;

    const updatedPayers = mappingData.payers.map(payer =>
      payer.id === payerId ? { ...payer, isAssigned: !payer.isAssigned } : payer
    );

    setMappingData({
      ...mappingData,
      payers: updatedPayers,
      stats: {
        ...mappingData.stats,
        assigned: updatedPayers.filter(p => p.isAssigned).length
      }
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!mappingData || !selectedProduct) return;

    try {
      setSaving(true);
      setError(null);

      const assignedOrgIds = mappingData.payers
        .filter(p => p.isAssigned)
        .map(p => p.organizationId);

      await adminApiService.updateProductMappings(selectedProduct, assignedOrgIds);
      
      setHasChanges(false);
      // Reload to get fresh data
      await loadProductMappings(selectedProduct);
    } catch (err: any) {
      setError(err.message || 'Failed to save product assignments');
    } finally {
      setSaving(false);
    }
  };

  const filteredPayers = mappingData?.payers.filter(payer =>
    payer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payer.organizationId.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (loading && !mappingData) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-5 shadow-sm animate-fade-in">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Product Selection Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Select Product</h3>
              <p className="text-sm text-gray-600">Choose a product to manage payer assignments</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <select
            id="product-select"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="block w-full px-4 py-3.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base font-medium text-gray-900 transition-all duration-200 hover:border-gray-400"
          >
            <option value="">Choose a product...</option>
            {products.map((product) => (
              <option key={product.type} value={product.type}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mappings Section */}
      {selectedProduct && mappingData && (
        <>
          {/* Stats Card */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-100 uppercase tracking-wide">Assignment Status</p>
                  <p className="text-5xl font-bold mt-2">
                    {mappingData.stats.assigned}
                    <span className="text-2xl text-blue-100 font-normal ml-2">/ {mappingData.stats.total}</span>
                  </p>
                  <p className="text-sm text-blue-100 mt-2">
                    {mappingData.stats.assigned === mappingData.stats.total
                      ? 'All payers assigned'
                      : `payers assigned to ${products.find(p => p.type === selectedProduct)?.name || selectedProduct}`
                    }
                  </p>
                </div>
              </div>
              {hasChanges && (
                <div className="flex items-center gap-3 px-5 py-3 bg-yellow-400 text-yellow-900 rounded-xl shadow-lg animate-pulse">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="font-semibold">Unsaved Changes</span>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm transition-all duration-200 hover:border-gray-300"
              placeholder="🔍 Search payers by name or organization ID..."
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Payers List */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden">
            <div className="px-6 py-5 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Payer Organizations</h3>
                    <p className="text-sm text-gray-600">
                      {filteredPayers.length} payer{filteredPayers.length !== 1 ? 's' : ''}
                      {searchQuery && ` matching "${searchQuery}"`}
                    </p>
                  </div>
                </div>
                {filteredPayers.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-blue-700">
                      {filteredPayers.filter(p => p.isAssigned).length} Selected
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto custom-scrollbar">
              {filteredPayers.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-1">No payers found</p>
                  <p className="text-sm text-gray-500 mb-4">Try adjusting your search criteria</p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                filteredPayers.map((payer, index) => (
                  <div
                    key={payer.id}
                    className={`px-6 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer group ${
                      payer.isAssigned ? 'bg-green-50/50' : ''
                    }`}
                    onClick={() => handleTogglePayer(payer.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={payer.isAssigned}
                          onChange={() => handleTogglePayer(payer.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300 rounded cursor-pointer transition-all"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">{payer.name}</p>
                          {payer.isAssigned && (
                            <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 font-mono">{payer.organizationId}</span>
                        </div>
                      </div>
                      {payer.isAssigned ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Assigned
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to assign
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200">
            <div className="flex items-center gap-3">
              {hasChanges ? (
                <>
                  <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">You have unsaved changes</p>
                    <p className="text-xs text-gray-600">Save your changes to update payer assignments</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">All changes saved</p>
                    <p className="text-xs text-gray-600">Your payer assignments are up to date</p>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => loadProductMappings(selectedProduct)}
                disabled={!hasChanges || saving}
                className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </span>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

