import React, { createContext, useContext, useState, ReactNode } from 'react';

/**
 * Mapped field from PDF extraction
 */
export interface MappedField {
  questionId: string;
  value: any; // Can be string, boolean, array, etc.
}

/**
 * Extraction data to be used for auto-populating the onboarding form
 */
export interface ExtractionData {
  fileName: string;
  extractedAt: string;
  commonFields: MappedField[];
  b2bFields: MappedField[];
}

/**
 * Context value type
 */
interface ExtractionDataContextType {
  extractionData: ExtractionData | null;
  setExtractionData: (data: ExtractionData) => void;
  clearExtractionData: () => void;
  hasExtractionData: boolean;
}

/**
 * Create the context
 */
const ExtractionDataContext = createContext<ExtractionDataContextType | undefined>(undefined);

/**
 * Provider component
 */
export const ExtractionDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [extractionData, setExtractionDataState] = useState<ExtractionData | null>(null);

  const setExtractionData = (data: ExtractionData) => {
    console.log('[ExtractionDataContext] Setting extraction data:', {
      fileName: data.fileName,
      commonFields: data.commonFields.length,
      b2bFields: data.b2bFields.length
    });
    setExtractionDataState(data);
  };

  const clearExtractionData = () => {
    console.log('[ExtractionDataContext] Clearing extraction data');
    setExtractionDataState(null);
  };

  const hasExtractionData = extractionData !== null;

  return (
    <ExtractionDataContext.Provider
      value={{
        extractionData,
        setExtractionData,
        clearExtractionData,
        hasExtractionData
      }}
    >
      {children}
    </ExtractionDataContext.Provider>
  );
};

/**
 * Hook to use extraction data context
 */
export const useExtractionData = (): ExtractionDataContextType => {
  const context = useContext(ExtractionDataContext);
  if (context === undefined) {
    throw new Error('useExtractionData must be used within an ExtractionDataProvider');
  }
  return context;
};

