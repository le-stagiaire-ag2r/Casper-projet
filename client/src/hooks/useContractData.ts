import { useState, useEffect, useCallback } from 'react';
import { readContractState, ContractState } from '../services/contractReader';

// Get runtime config
const config = (window as any).config || {};
const RATE_PRECISION = config.rate_precision || 1_000_000_000;

// Polling interval for live updates (30 seconds)
const POLL_INTERVAL = 30000;

export interface ContractData {
  exchangeRate: number;
  totalPool: string;
  totalStcspr: string;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isLive: boolean;
}

/**
 * Hook to fetch V15 contract data (exchange rate, pool, supply)
 *
 * Now reads live data from the blockchain via RPC!
 */
export const useContractData = () => {
  const [data, setData] = useState<ContractData>({
    exchangeRate: 1.0,
    totalPool: '0',
    totalStcspr: '0',
    isLoading: true,
    error: null,
    lastUpdated: null,
    isLive: false,
  });

  // Fetch live contract data from blockchain
  const fetchLiveData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      const state = await readContractState();

      setData({
        exchangeRate: state.exchangeRate,
        totalPool: state.totalPool,
        totalStcspr: state.totalStcspr,
        isLoading: false,
        error: null,
        lastUpdated: state.lastUpdated,
        isLive: true,
      });

      // Also save to localStorage for offline fallback
      localStorage.setItem('stakevue_contract_data', JSON.stringify({
        exchangeRate: state.exchangeRate,
        totalPool: state.totalPool,
        totalStcspr: state.totalStcspr,
        lastUpdated: state.lastUpdated.toISOString(),
      }));

      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('stakevue_rate_updated', {
        detail: { exchangeRate: state.exchangeRate }
      }));

    } catch (err: any) {
      console.error('Failed to fetch live contract data:', err);

      // Try to use cached data
      const cached = localStorage.getItem('stakevue_contract_data');
      if (cached) {
        const parsed = JSON.parse(cached);
        setData({
          exchangeRate: parsed.exchangeRate || 1.0,
          totalPool: parsed.totalPool || '0',
          totalStcspr: parsed.totalStcspr || '0',
          isLoading: false,
          error: 'Using cached data - live fetch failed',
          lastUpdated: parsed.lastUpdated ? new Date(parsed.lastUpdated) : null,
          isLive: false,
        });
      } else {
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: err?.message || 'Failed to fetch contract data',
          isLive: false,
        }));
      }
    }
  }, []);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  // Update exchange rate (for demo/simulation - also triggers refetch)
  const updateExchangeRate = useCallback((newRate: number) => {
    setData(prev => ({
      ...prev,
      exchangeRate: newRate,
      lastUpdated: new Date(),
    }));

    window.dispatchEvent(new CustomEvent('stakevue_rate_updated', {
      detail: { exchangeRate: newRate }
    }));
  }, []);

  // Simulate rewards being added (local simulation)
  const simulateRewards = useCallback((rewardCspr: number) => {
    setData(prev => {
      const currentPoolMotes = BigInt(prev.totalPool || '0');
      const currentSupplyMotes = BigInt(prev.totalStcspr || '0');
      const rewardMotes = BigInt(Math.floor(rewardCspr * 1_000_000_000));

      let newRate = prev.exchangeRate;

      if (currentSupplyMotes > 0n) {
        const newPoolMotes = currentPoolMotes + rewardMotes;
        newRate = Number((newPoolMotes * BigInt(RATE_PRECISION)) / currentSupplyMotes) / RATE_PRECISION;
      }

      const updated = {
        ...prev,
        exchangeRate: newRate,
        totalPool: (currentPoolMotes + rewardMotes).toString(),
        lastUpdated: new Date(),
      };

      window.dispatchEvent(new CustomEvent('stakevue_rate_updated', {
        detail: { exchangeRate: newRate }
      }));

      return updated;
    });
  }, []);

  // Update pool after stake (optimistic update)
  const updateAfterStake = useCallback((csprAmount: number) => {
    setData(prev => {
      const stakeMotes = BigInt(Math.floor(csprAmount * 1_000_000_000));
      const currentPoolMotes = BigInt(prev.totalPool || '0');
      const currentSupplyMotes = BigInt(prev.totalStcspr || '0');

      const stcsprMinted = prev.exchangeRate > 0
        ? BigInt(Math.floor(csprAmount / prev.exchangeRate * 1_000_000_000))
        : stakeMotes;

      return {
        ...prev,
        totalPool: (currentPoolMotes + stakeMotes).toString(),
        totalStcspr: (currentSupplyMotes + stcsprMinted).toString(),
        lastUpdated: new Date(),
      };
    });

    // Refetch after a short delay to get actual blockchain state
    setTimeout(fetchLiveData, 5000);
  }, [fetchLiveData]);

  // Update pool after unstake (optimistic update)
  const updateAfterUnstake = useCallback((stcsprAmount: number) => {
    setData(prev => {
      const burnMotes = BigInt(Math.floor(stcsprAmount * 1_000_000_000));
      const currentPoolMotes = BigInt(prev.totalPool || '0');
      const currentSupplyMotes = BigInt(prev.totalStcspr || '0');

      const csprReturned = BigInt(Math.floor(stcsprAmount * prev.exchangeRate * 1_000_000_000));

      const newPool = currentPoolMotes > csprReturned ? currentPoolMotes - csprReturned : 0n;
      const newSupply = currentSupplyMotes > burnMotes ? currentSupplyMotes - burnMotes : 0n;

      return {
        ...prev,
        totalPool: newPool.toString(),
        totalStcspr: newSupply.toString(),
        lastUpdated: new Date(),
      };
    });

    // Refetch after a short delay to get actual blockchain state
    setTimeout(fetchLiveData, 5000);
  }, [fetchLiveData]);

  // Convert stCSPR to CSPR value using current rate
  const stcsprToCspr = useCallback((stcsprAmount: number): number => {
    return stcsprAmount * data.exchangeRate;
  }, [data.exchangeRate]);

  // Convert CSPR to stCSPR using current rate
  const csprToStcspr = useCallback((csprAmount: number): number => {
    return data.exchangeRate > 0 ? csprAmount / data.exchangeRate : csprAmount;
  }, [data.exchangeRate]);

  // Format exchange rate for display
  const formatRate = useCallback((rate: number): string => {
    return rate.toFixed(4);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  // Poll for updates
  useEffect(() => {
    const interval = setInterval(fetchLiveData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchLiveData]);

  // Listen for rate updates from other components
  useEffect(() => {
    const handleRateUpdate = (e: CustomEvent) => {
      setData(prev => ({
        ...prev,
        exchangeRate: e.detail.exchangeRate,
        lastUpdated: new Date(),
      }));
    };

    window.addEventListener('stakevue_rate_updated', handleRateUpdate as EventListener);
    return () => {
      window.removeEventListener('stakevue_rate_updated', handleRateUpdate as EventListener);
    };
  }, []);

  return {
    // Data
    exchangeRate: data.exchangeRate,
    totalPool: data.totalPool,
    totalStcspr: data.totalStcspr,
    isLoading: data.isLoading,
    error: data.error,
    lastUpdated: data.lastUpdated,
    isLive: data.isLive,

    // Actions
    refresh,
    fetchData: fetchLiveData,
    updateExchangeRate,
    simulateRewards,
    updateAfterStake,
    updateAfterUnstake,

    // Utilities
    stcsprToCspr,
    csprToStcspr,
    formatRate,
  };
};

export default useContractData;
