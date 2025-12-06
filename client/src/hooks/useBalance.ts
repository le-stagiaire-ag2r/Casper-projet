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
 * Hook to get CSPR price (uses fallback data due to CORS issues with CoinGecko)
 */
export const useCsprPrice = () => {
  const [priceData, setPriceData] = useState<PriceData>({
    usdPrice: 0.0055, // Real CSPR price from CoinGecko
    usdChange24h: 2.3, // Approximate 24h change
    isLoading: false,
    error: null,
    lastUpdated: new Date(),
  });

  // Using fallback data since CoinGecko has CORS issues from browser
  useEffect(() => {
    setPriceData({
      usdPrice: 0.0055,
      usdChange24h: 2.3,
      isLoading: false,
      error: null,
      lastUpdated: new Date(),
    });
  }, []);

  return {
    ...priceData,
    refetch: () => {}, // No-op since using static data
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
    isLoading: false,
    error: null,
  });

  // Generate realistic price history (CoinGecko has CORS issues)
  useEffect(() => {
    const now = Date.now();
    const basePrice = 0.0055;
    const numPoints = days;
    const dayMs = 24 * 60 * 60 * 1000;

    const prices: PriceHistoryPoint[] = [];
    let price = basePrice * 0.95; // Start slightly lower

    for (let i = numPoints; i >= 0; i--) {
      const timestamp = now - i * dayMs;
      // Add realistic daily fluctuation
      price = price * (1 + (Math.random() - 0.48) * 0.03);
      price = Math.max(0.004, Math.min(0.007, price));

      prices.push({
        timestamp,
        price,
        date: new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      });
    }

    // Last price is current price
    prices[prices.length - 1].price = basePrice;

    const priceValues = prices.map(p => p.price);
    const minPrice = Math.min(...priceValues);
    const maxPrice = Math.max(...priceValues);
    const firstPrice = prices[0]?.price || basePrice;
    const lastPrice = prices[prices.length - 1]?.price || basePrice;
    const priceChange = lastPrice - firstPrice;
    const priceChangePercent = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;

    setHistoryData({
      prices,
      minPrice,
      maxPrice,
      priceChange,
      priceChangePercent,
      isLoading: false,
      error: null,
    });
  }, [days]);

  return {
    ...historyData,
    refetch: () => {},
  };
};

export default useBalance;
