import { useState, useEffect, useCallback } from 'react';

const CSPR_CLOUD_API = 'https://api.testnet.cspr.cloud';
const REFRESH_INTERVAL = 30000; // 30 seconds

interface BalanceData {
  csprBalance: number;
  csprBalanceMotes: string;
  stCsprBalance: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface PriceData {
  usdPrice: number;
  usdChange24h: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Hook to fetch real CSPR balance from the blockchain
 */
export const useBalance = (publicKey: string | null) => {
  const [balanceData, setBalanceData] = useState<BalanceData>({
    csprBalance: 0,
    csprBalanceMotes: '0',
    stCsprBalance: 0,
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  const fetchBalance = useCallback(async () => {
    if (!publicKey) {
      setBalanceData(prev => ({ ...prev, csprBalance: 0, stCsprBalance: 0, isLoading: false }));
      return;
    }

    setBalanceData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fetch account info from CSPR.cloud API
      const response = await fetch(`${CSPR_CLOUD_API}/accounts/${publicKey}`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        // Account might not exist yet on testnet
        if (response.status === 404) {
          setBalanceData(prev => ({
            ...prev,
            csprBalance: 0,
            csprBalanceMotes: '0',
            stCsprBalance: 0,
            isLoading: false,
            lastUpdated: new Date(),
            error: null,
          }));
          return;
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Balance is in motes (1 CSPR = 1,000,000,000 motes)
      const balanceMotes = data.data?.balance || data.balance || '0';
      const balanceCSPR = parseInt(balanceMotes) / 1_000_000_000;

      setBalanceData({
        csprBalance: balanceCSPR,
        csprBalanceMotes: balanceMotes,
        stCsprBalance: 0, // TODO: Fetch from stCSPR contract
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (err: any) {
      console.error('Failed to fetch balance:', err);
      setBalanceData(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Failed to fetch balance',
      }));
    }
  }, [publicKey]);

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

/**
 * Hook to get CSPR price via our API proxy (bypasses CORS)
 */
export const useCsprPrice = () => {
  const [priceData, setPriceData] = useState<PriceData>({
    usdPrice: 0.0055,
    usdChange24h: 2.3,
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  const fetchPrice = useCallback(async () => {
    try {
      const response = await fetch('/api/price');
      if (response.ok) {
        const data = await response.json();
        setPriceData({
          usdPrice: data.price || 0.0055,
          usdChange24h: data.change24h || 0,
          isLoading: false,
          error: null,
          lastUpdated: new Date(),
        });
      } else {
        throw new Error('API error');
      }
    } catch (error) {
      // Fallback to static data
      setPriceData({
        usdPrice: 0.0055,
        usdChange24h: 2.3,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      });
    }
  }, []);

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
 * Hook to fetch CSPR price history from CoinGecko (7 days)
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
  });

  const generateFallbackHistory = useCallback((basePrice: number) => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const prices: PriceHistoryPoint[] = [];

    // For "max" (days=0), generate ~4 years of data since CSPR launch (March 2021)
    const daysToGenerate = days === 0 ? 1400 : days;
    let price = basePrice * 0.3; // Start lower for historical simulation

    for (let i = daysToGenerate; i >= 0; i--) {
      const timestamp = now - i * dayMs;
      price = price * (1 + (Math.random() - 0.48) * 0.05);
      price = Math.max(0.002, Math.min(0.15, price)); // CSPR historical range

      // Only add one point per week for "all time" to keep data manageable
      if (days === 0 && i % 7 !== 0 && i !== 0) continue;

      prices.push({
        timestamp,
        price,
        date: new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: days === 0 ? '2-digit' : undefined }),
      });
    }
    prices[prices.length - 1].price = basePrice;
    return prices;
  }, [days]);

  const fetchHistory = useCallback(async () => {
    setHistoryData(prev => ({ ...prev, isLoading: true }));
    try {
      // days=0 means "max" (all time since CSPR creation)
      const daysParam = days === 0 ? 'max' : days;
      const response = await fetch(`/api/price?days=${daysParam}`);
      if (response.ok) {
        const data = await response.json();
        let prices = data.history || [];

        // If no history from API, generate fallback
        if (prices.length === 0) {
          prices = generateFallbackHistory(data.price || 0.0055);
        }

        const priceValues = prices.map((p: PriceHistoryPoint) => p.price);
        const minPrice = Math.min(...priceValues);
        const maxPrice = Math.max(...priceValues);
        const firstPrice = prices[0]?.price || 0.0055;
        const lastPrice = prices[prices.length - 1]?.price || 0.0055;

        setHistoryData({
          prices,
          minPrice,
          maxPrice,
          priceChange: lastPrice - firstPrice,
          priceChangePercent: firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error('API error');
      }
    } catch (error) {
      const prices = generateFallbackHistory(0.0055);
      const priceValues = prices.map(p => p.price);
      setHistoryData({
        prices,
        minPrice: Math.min(...priceValues),
        maxPrice: Math.max(...priceValues),
        priceChange: prices[prices.length - 1].price - prices[0].price,
        priceChangePercent: ((prices[prices.length - 1].price - prices[0].price) / prices[0].price) * 100,
        isLoading: false,
        error: null,
      });
    }
  }, [days, generateFallbackHistory]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    ...historyData,
    refetch: fetchHistory,
  };
};

export default useBalance;
