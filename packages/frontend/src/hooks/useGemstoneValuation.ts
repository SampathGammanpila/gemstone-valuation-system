// packages/frontend/src/hooks/useGemstoneValuation.ts

import { useContext } from 'react';
import { GemstoneValuationContext } from '../contexts/GemstoneValuationContext';

/**
 * Custom hook to access the gemstone valuation context
 */
export const useGemstoneValuation = () => {
  const context = useContext(GemstoneValuationContext);
  
  if (context === undefined) {
    throw new Error('useGemstoneValuation must be used within a GemstoneValuationProvider');
  }
  
  return context;
};

export default useGemstoneValuation;