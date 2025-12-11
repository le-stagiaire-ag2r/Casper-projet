import { useState, useEffect, useCallback } from 'react';

// Get runtime config
const config = (window as any).config || {};
const RATE_PRECISION = config.rate_precision || 1_000_000_000;

export interface ContractData {
  exchangeRate: number; // 1.0 = 1_000_000_000
  totalPool: string; // Total CSPR in pool (motes)
  totalStcspr: string; // Total stCSPR supply (motes)
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Hook to fetch V15 contract data (exchange rate, pool, supply)
 *
 * For now this uses localStorage to persist demo data.
 * In production, this would query the contract state via RPC or backend API.
 */
export const useContractData = () => {
  const [data, setData] = useState<ContractData>({
    exchangeRate: 1.0,
    totalPool: '0',
    totalStcspr: '0',
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  // Fetch contract data
  const fetchData = useCallback(async () => {
    setData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Try to get data from localStorage (demo mode)
      const storedData = localStorage.getItem('stakevue_contract_data');

      if (storedData) {
        const parsed = JSON.parse(storedData);
        setData({
          exchangeRate: parsed.exchangeRate || 1.0,
          totalPool: parsed.totalPool || '0',
          totalStcspr: parsed.totalStcspr || '0',
          isLoading: false,
          error: null,
          lastUpdated: new Date(parsed.lastUpdated),
        });
      } else {
        // Default values for fresh start
        setData({
          exchangeRate: 1.0,
          totalPool: '0',
          totalStcspr: '0',
          isLoading: false,
          error: null,
          lastUpdated: new Date(),
        });
      }

      // TODO: In production, fetch from contract via RPC:
      // const rpcClient = new CasperServiceByJsonRPC(RPC_URL);
      // const stateRootHash = await rpcClient.getStateRootHash();
      // const contractHash = config.contract_package_hash;
      // const exchangeRate = await rpcClient.queryContractData(
      //   stateRootHash, contractHash, 'exchange_rate'
      // );

    } catch (err: any) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: err?.message || 'Failed to fetch contract data',
      }));
    }
  }, []);

  // Update exchange rate (for demo/simulation)
  const updateExchangeRate = useCallback((newRate: number) => {
    setData(prev => {
      const updated = {
        ...prev,
        exchangeRate: newRate,
        lastUpdated: new Date(),
      };

      // Persist to localStorage
      localStorage.setItem('stakevue_contract_data', JSON.stringify({
        exchangeRate: updated.exchangeRate,
        totalPool: updated.totalPool,
        totalStcspr: updated.totalStcspr,
        lastUpdated: updated.lastUpdated?.toISOString(),
      }));

      return updated;
    });
  }, []);

  // Simulate rewards being added (increases exchange rate)
  const simulateRewards = useCallback((rewardCspr: number) => {
    setData(prev => {
      // Calculate new rate: new_pool / total_stcspr
      // If no stCSPR exists yet, rate stays 1.0
      const currentPoolMotes = BigInt(prev.totalPool || '0');
      const currentSupplyMotes = BigInt(prev.totalStcspr || '0');
      const rewardMotes = BigInt(Math.floor(rewardCspr * 1_000_000_000));

      let newRate = prev.exchangeRate;

      if (currentSupplyMotes > 0n) {
        const newPoolMotes = currentPoolMotes + rewardMotes;
        // rate = pool / supply * PRECISION
        newRate = Number((newPoolMotes * BigInt(RATE_PRECISION)) / currentSupplyMotes) / RATE_PRECISION;
      }

      const updated = {
        ...prev,
        exchangeRate: newRate,
        totalPool: (currentPoolMotes + rewardMotes).toString(),
        lastUpdated: new Date(),
      };

      // Persist to localStorage
      localStorage.setItem('stakevue_contract_data', JSON.stringify({
        exchangeRate: updated.exchangeRate,
        totalPool: updated.totalPool,
        totalStcspr: updated.totalStcspr,
        lastUpdated: updated.lastUpdated?.toISOString(),
      }));

      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('stakevue_rate_updated', {
        detail: { exchangeRate: newRate }
      }));

      return updated;
    });
  }, []);

  // Update pool after stake (for demo)
  const updateAfterStake = useCallback((csprAmount: number) => {
    setData(prev => {
      const stakeMotes = BigInt(Math.floor(csprAmount * 1_000_000_000));
      const currentPoolMotes = BigInt(prev.totalPool || '0');
      const currentSupplyMotes = BigInt(prev.totalStcspr || '0');

      // stCSPR minted = cspr / rate
      const stcsprMinted = prev.exchangeRate > 0
        ? BigInt(Math.floor(csprAmount / prev.exchangeRate * 1_000_000_000))
        : stakeMotes;

      const updated = {
        ...prev,
        totalPool: (currentPoolMotes + stakeMotes).toString(),
        totalStcspr: (currentSupplyMotes + stcsprMinted).toString(),
        lastUpdated: new Date(),
      };

      localStorage.setItem('stakevue_contract_data', JSON.stringify({
        exchangeRate: updated.exchangeRate,
        totalPool: updated.totalPool,
        totalStcspr: updated.totalStcspr,
        lastUpdated: updated.lastUpdated?.toISOString(),
      }));

      return updated;
    });
  }, []);

  // Update pool after unstake (for demo)
  const updateAfterUnstake = useCallback((stcsprAmount: number) => {
    setData(prev => {
      const burnMotes = BigInt(Math.floor(stcsprAmount * 1_000_000_000));
      const currentPoolMotes = BigInt(prev.totalPool || '0');
      const currentSupplyMotes = BigInt(prev.totalStcspr || '0');

      // CSPR returned = stcspr * rate
      const csprReturned = BigInt(Math.floor(stcsprAmount * prev.exchangeRate * 1_000_000_000));

      const newPool = currentPoolMotes > csprReturned ? currentPoolMotes - csprReturned : 0n;
      const newSupply = currentSupplyMotes > burnMotes ? currentSupplyMotes - burnMotes : 0n;

      const updated = {
        ...prev,
        totalPool: newPool.toString(),
        totalStcspr: newSupply.toString(),
        lastUpdated: new Date(),
      };

      localStorage.setItem('stakevue_contract_data', JSON.stringify({
        exchangeRate: updated.exchangeRate,
        totalPool: updated.totalPool,
        totalStcspr: updated.totalStcspr,
        lastUpdated: updated.lastUpdated?.toISOString(),
      }));

      return updated;
    });
  }, []);

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
    fetchData();
  }, [fetchData]);

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

    // Actions
    fetchData,
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
