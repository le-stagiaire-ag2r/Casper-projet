import { useState, useEffect, useCallback } from 'react';
import { csprCloudApi, isProxyAvailable, motesToCSPR } from '../services/csprCloud';

const REFRESH_INTERVAL = 30000; // 30 seconds

interface BalanceData {
  csprBalance: number;
  csprBalanceMotes: string;
  stakedBalance: number;
  delegatedBalance: number;
  undelegatingBalance: number;
  totalBalance: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isLive: boolean;
}

interface PriceData {
  usdPrice: number;
  usdChange24h: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isLive: boolean;
}

/**
 * Hook to fetch real CSPR balance from the blockchain
 * Uses CSPR.click proxy to access CSPR.cloud API (bypasses CORS)
 */
export const useBalance = (publicKey: string | null) => {
  const [balanceData, setBalanceData] = useState<BalanceData>({
    csprBalance: 0,
    csprBalanceMotes: '0',
    stakedBalance: 0,
    delegatedBalance: 0,
    undelegatingBalance: 0,
    totalBalance: 0,
    isLoading: false,
    error: null,
    lastUpdated: null,
    isLive: false,
  });

  const fetchBalanceFromProxy = useCallback(async (pk: string) => {
    // Try to use CSPR.click proxy for real CSPR.cloud data
    if (!isProxyAvailable()) {
      return null;
    }

    try {
      const response = await csprCloudApi.getAccount(pk);
      const account = response.data;

      const csprBalance = motesToCSPR(account.balance);
      const stakedBalance = account.staked_balance ? motesToCSPR(account.staked_balance) : 0;
      const delegatedBalance = account.delegated_balance ? motesToCSPR(account.delegated_balance) : 0;
      const undelegatingBalance = account.undelegating_balance ? motesToCSPR(account.undelegating_balance) : 0;

      return {
        csprBalance,
        csprBalanceMotes: account.balance,
        stakedBalance,
        delegatedBalance,
        undelegatingBalance,
        totalBalance: csprBalance + stakedBalance + delegatedBalance,
      };
    } catch (error: any) {
      // Account might not exist
      if (error?.message?.includes('404') || error?.status === 404) {
        return {
          csprBalance: 0,
          csprBalanceMotes: '0',
          stakedBalance: 0,
          delegatedBalance: 0,
          undelegatingBalance: 0,
          totalBalance: 0,
        };
      }
      console.error('CSPR.cloud proxy error:', error);
      return null;
    }
  }, []);

  const fetchBalanceFromAPI = useCallback(async (pk: string) => {
    // Fallback: try our own API proxy
    try {
      const response = await fetch(`/api/accounts/${pk}`);
      if (response.ok) {
        const data = await response.json();
        const balanceMotes = data.balance || '0';
        const csprBalance = parseInt(balanceMotes) / 1_000_000_000;
        return {
          csprBalance,
          csprBalanceMotes: balanceMotes,
          stakedBalance: 0,
          delegatedBalance: 0,
          undelegatingBalance: 0,
          totalBalance: csprBalance,
        };
      }
      if (response.status === 404) {
        return {
          csprBalance: 0,
          csprBalanceMotes: '0',
          stakedBalance: 0,
          delegatedBalance: 0,
          undelegatingBalance: 0,
          totalBalance: 0,
        };
      }
    } catch (error) {
      console.log('API fallback failed');
    }
    return null;
  }, []);

  const fetchBalance = useCallback(async () => {
    if (!publicKey) {
      setBalanceData(prev => ({
        ...prev,
        csprBalance: 0,
        csprBalanceMotes: '0',
        stakedBalance: 0,
        delegatedBalance: 0,
        undelegatingBalance: 0,
        totalBalance: 0,
        isLoading: false,
        isLive: false,
      }));
      return;
    }

    setBalanceData(prev => ({ ...prev, isLoading: true, error: null }));

    // First try CSPR.cloud via proxy (real live data)
    const proxyData = await fetchBalanceFromProxy(publicKey);
    if (proxyData) {
      setBalanceData({
        ...proxyData,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
        isLive: true,
      });
      return;
    }

    // Fallback to our API proxy
    const apiData = await fetchBalanceFromAPI(publicKey);
    if (apiData) {
      setBalanceData({
        ...apiData,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
        isLive: true,
      });
      return;
    }

    // No data available - new account or error
    setBalanceData(prev => ({
      ...prev,
      csprBalance: 0,
      csprBalanceMotes: '0',
      stakedBalance: 0,
      delegatedBalance: 0,
      undelegatingBalance: 0,
      totalBalance: 0,
      isLoading: false,
      error: 'Could not fetch balance. Connect wallet to enable live data.',
      lastUpdated: new Date(),
      isLive: false,
    }));
  }, [publicKey, fetchBalanceFromProxy, fetchBalanceFromAPI]);

  // Fetch on mount and when publicKey changes
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Auto-refresh
  useEffect(() => {
    if (!publicKey) return;

    const interval = setInterval(fetchBalance, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [publicKey, fetchBalance]);

  return {
    ...balanceData,
    refetch: fetchBalance,
  };
};

// Fallback price (Dec 2024 data)
const FALLBACK_PRICE = 0.0057;

/**
 * Hook to get CSPR price via CSPR.cloud API
 * Uses CSPR.click proxy to bypass CORS
 */
export const useCsprPrice = () => {
  const [priceData, setPriceData] = useState<PriceData>({
    usdPrice: FALLBACK_PRICE,
    usdChange24h: 0,
    isLoading: true,
    error: null,
    lastUpdated: null,
    isLive: false,
  });

  const fetchPriceFromProxy = useCallback(async () => {
    if (!isProxyAvailable()) {
      return null;
    }

    try {
      const response = await csprCloudApi.getCurrentRate(1); // USD currency
      return response.data.amount;
    } catch (error) {
      console.log('CSPR.cloud price fetch failed');
      return null;
    }
  }, []);

  const fetchPriceFromAPI = useCallback(async () => {
    try {
      const response = await fetch('/api/price');
      if (response.ok) {
        const data = await response.json();
        return data.price || null;
      }
    } catch (error) {
      console.log('API price fetch failed');
    }
    return null;
  }, []);

  const fetchPrice = useCallback(async () => {
    // First try CSPR.cloud via proxy
    const proxyPrice = await fetchPriceFromProxy();
    if (proxyPrice) {
      setPriceData({
        usdPrice: proxyPrice,
        usdChange24h: 0, // Could calculate from historical rates
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
        isLive: true,
      });
      return;
    }

    // Fallback to our API proxy
    const apiPrice = await fetchPriceFromAPI();
    if (apiPrice) {
      setPriceData({
        usdPrice: apiPrice,
        usdChange24h: 0,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
        isLive: true,
      });
      return;
    }

    // Use fallback data
    setPriceData({
      usdPrice: FALLBACK_PRICE,
      usdChange24h: 0,
      isLoading: false,
      error: null,
      lastUpdated: new Date(),
      isLive: false,
    });
  }, [fetchPriceFromProxy, fetchPriceFromAPI]);

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, [fetchPrice]);

  return {
    ...priceData,
    refetch: fetchPrice,
  };
};

/**
 * Hook to fetch CSPR price history
 * Uses CSPR.cloud historical rates API via proxy
 */
interface PriceHistoryPoint {
  timestamp: number;
  price: number;
  date: string;
}

interface PriceHistoryData {
  prices: PriceHistoryPoint[];
  minPrice: number;
  maxPrice: number;
  priceChange: number;
  priceChangePercent: number;
  isLoading: boolean;
  error: string | null;
  isLive: boolean;
}

export const useCsprPriceHistory = (days: number = 7) => {
  const [historyData, setHistoryData] = useState<PriceHistoryData>({
    prices: [],
    minPrice: 0,
    maxPrice: 0,
    priceChange: 0,
    priceChangePercent: 0,
    isLoading: true,
    error: null,
    isLive: false,
  });

  const generateFallbackHistory = useCallback((basePrice: number) => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const prices: PriceHistoryPoint[] = [];

    // For "max" (days=0), generate realistic CSPR history since May 2021
    const daysToGenerate = days === 0 ? 1400 : days;

    if (days === 0) {
      // Realistic CSPR price history pattern (May 2021 - present)
      // Based on cspr.live data: Started HIGH at ~$1.20 in May 2021, then continuous decline
      const csprLaunch = new Date('2021-05-01').getTime();
      const totalDays = Math.floor((now - csprLaunch) / dayMs);

      for (let i = 0; i <= totalDays; i += 7) { // Weekly points
        const timestamp = csprLaunch + i * dayMs;
        const daysSinceLaunch = i;
        let price: number;

        if (daysSinceLaunch < 30) {
          // May 2021: Peak around $1.10-1.20
          price = 1.10 - (daysSinceLaunch / 30) * 0.30;
        } else if (daysSinceLaunch < 120) {
          // May-Sep 2021: Sharp crash $0.80 -> $0.15
          price = 0.80 - ((daysSinceLaunch - 30) / 90) * 0.65;
        } else if (daysSinceLaunch < 300) {
          // Sep 2021 - Feb 2022: Continued decline $0.15 -> $0.05
          price = 0.15 - ((daysSinceLaunch - 120) / 180) * 0.10;
        } else if (daysSinceLaunch < 700) {
          // 2022-2023: Bear market $0.05 -> $0.02
          price = 0.05 - ((daysSinceLaunch - 300) / 400) * 0.03;
          price = Math.max(0.015, price);
        } else {
          // 2024-present: Bottom around $0.005-0.01
          price = 0.02 - ((daysSinceLaunch - 700) / 700) * 0.015;
          price = Math.max(0.004, price);
        }

        // Add some noise
        price = price * (1 + (Math.random() - 0.5) * 0.08);
        price = Math.max(0.003, price);

        prices.push({
          timestamp,
          price,
          date: new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
        });
      }
      // Ensure last point is current price
      if (prices.length > 0) {
        prices[prices.length - 1].price = basePrice;
        prices[prices.length - 1].timestamp = now;
        prices[prices.length - 1].date = new Date(now).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
      }
    } else {
      // For shorter periods, generate simple variance around current price
      let price = basePrice * 0.95;
      for (let i = daysToGenerate; i >= 0; i--) {
        const timestamp = now - i * dayMs;
        price = price * (1 + (Math.random() - 0.48) * 0.03);
        price = Math.max(basePrice * 0.8, Math.min(basePrice * 1.2, price));

        prices.push({
          timestamp,
          price,
          date: new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        });
      }
      prices[prices.length - 1].price = basePrice;
    }

    return prices;
  }, [days]);

  const fetchHistoryFromProxy = useCallback(async () => {
    if (!isProxyAvailable()) {
      return null;
    }

    try {
      // Calculate date range
      const now = new Date();
      const to = now.toISOString();
      const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

      const response = await csprCloudApi.getHistoricalRates(1, from, to);
      if (response.data && response.data.length > 0) {
        const prices: PriceHistoryPoint[] = response.data.map(rate => ({
          timestamp: new Date(rate.created).getTime(),
          price: rate.amount,
          date: new Date(rate.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        }));
        return prices;
      }
    } catch (error) {
      console.log('CSPR.cloud historical rates fetch failed');
    }
    return null;
  }, [days]);

  const fetchHistory = useCallback(async () => {
    setHistoryData(prev => ({ ...prev, isLoading: true }));

    // First try CSPR.cloud via proxy
    const proxyPrices = await fetchHistoryFromProxy();
    if (proxyPrices && proxyPrices.length > 0) {
      const priceValues = proxyPrices.map(p => p.price);
      const minPrice = Math.min(...priceValues);
      const maxPrice = Math.max(...priceValues);
      const firstPrice = proxyPrices[0].price;
      const lastPrice = proxyPrices[proxyPrices.length - 1].price;

      setHistoryData({
        prices: proxyPrices,
        minPrice,
        maxPrice,
        priceChange: lastPrice - firstPrice,
        priceChangePercent: firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0,
        isLoading: false,
        error: null,
        isLive: true,
      });
      return;
    }

    // Fallback to our API proxy
    try {
      // days=0 means "max" (all time since CSPR creation)
      const daysParam = days === 0 ? 'max' : days;
      const response = await fetch(`/api/price?days=${daysParam}`);
      if (response.ok) {
        const data = await response.json();
        let prices = data.history || [];
        let isLive = prices.length > 0;

        // If no history from API, generate fallback
        if (prices.length === 0) {
          prices = generateFallbackHistory(data.price || FALLBACK_PRICE);
          isLive = false;
        }

        const priceValues = prices.map((p: PriceHistoryPoint) => p.price);
        const minPrice = Math.min(...priceValues);
        const maxPrice = Math.max(...priceValues);
        const firstPrice = prices[0]?.price || FALLBACK_PRICE;
        const lastPrice = prices[prices.length - 1]?.price || FALLBACK_PRICE;

        setHistoryData({
          prices,
          minPrice,
          maxPrice,
          priceChange: lastPrice - firstPrice,
          priceChangePercent: firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0,
          isLoading: false,
          error: null,
          isLive,
        });
      } else {
        throw new Error('API error');
      }
    } catch (error) {
      const prices = generateFallbackHistory(FALLBACK_PRICE);
      const priceValues = prices.map(p => p.price);
      setHistoryData({
        prices,
        minPrice: Math.min(...priceValues),
        maxPrice: Math.max(...priceValues),
        priceChange: prices[prices.length - 1].price - prices[0].price,
        priceChangePercent: ((prices[prices.length - 1].price - prices[0].price) / prices[0].price) * 100,
        isLoading: false,
        error: null,
        isLive: false,
      });
    }
  }, [days, generateFallbackHistory, fetchHistoryFromProxy]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    ...historyData,
    refetch: fetchHistory,
  };
};

export default useBalance;
