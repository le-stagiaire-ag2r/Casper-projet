import { useState, useEffect, useCallback } from 'react';

const CSPR_CLOUD_API = 'https://api.testnet.cspr.cloud';
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
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
 * Hook to fetch CSPR price from CoinGecko
 */
export const useCsprPrice = () => {
  const [priceData, setPriceData] = useState<PriceData>({
    usdPrice: 0,
    usdChange24h: 0,
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  const fetchPrice = useCallback(async () => {
    setPriceData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(
        `${COINGECKO_API}/simple/price?ids=casper-network&vs_currencies=usd&include_24hr_change=true`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const casperData = data['casper-network'];

      setPriceData({
        usdPrice: casperData?.usd || 0,
        usdChange24h: casperData?.usd_24h_change || 0,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (err: any) {
      console.error('Failed to fetch CSPR price:', err);
      setPriceData(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Failed to fetch price',
      }));
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  // Auto-refresh every 60 seconds for price
  useEffect(() => {
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
    isLoading: false,
    error: null,
  });

  const fetchPriceHistory = useCallback(async () => {
    setHistoryData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(
        `${COINGECKO_API}/coins/casper-network/market_chart?vs_currency=usd&days=${days}&interval=daily`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const prices: PriceHistoryPoint[] = data.prices.map((p: [number, number]) => ({
        timestamp: p[0],
        price: p[1],
        date: new Date(p[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }));

      const priceValues = prices.map(p => p.price);
      const minPrice = Math.min(...priceValues);
      const maxPrice = Math.max(...priceValues);
      const firstPrice = prices[0]?.price || 0;
      const lastPrice = prices[prices.length - 1]?.price || 0;
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
    } catch (err: any) {
      console.error('Failed to fetch price history:', err);
      setHistoryData(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Failed to fetch price history',
      }));
    }
  }, [days]);

  // Fetch on mount
  useEffect(() => {
    fetchPriceHistory();
  }, [fetchPriceHistory]);

  // Auto-refresh every 5 minutes for history
  useEffect(() => {
    const interval = setInterval(fetchPriceHistory, 300000);
    return () => clearInterval(interval);
  }, [fetchPriceHistory]);

  return {
    ...historyData,
    refetch: fetchPriceHistory,
  };
};

export default useBalance;
