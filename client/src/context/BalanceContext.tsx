import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useCsprClick } from '../hooks/useCsprClick';
import { csprCloudApi, isProxyAvailable } from '../services/csprCloud';

interface BalanceContextType {
  csprBalance: number;
  stCsprBalance: number;
  isLoading: boolean;
  isRealBalance: boolean;
  refetchBalance: () => Promise<void>;
  updateAfterStake: (amount: number) => void;
  updateAfterUnstake: (amount: number) => void;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

const GAS_FEE_CSPR = 5; // Gas fee in CSPR
const REFETCH_COOLDOWN_MS = 120000; // 2 minutes cooldown after stake/unstake

interface BalanceProviderProps {
  children: ReactNode;
}

// LocalStorage key for stCSPR balance
const STCSPR_STORAGE_KEY = 'stakevue_stcspr_balance';

// Load stCSPR balance from localStorage
const loadStCsprBalance = (publicKey: string | undefined): number => {
  if (!publicKey) return 0;
  try {
    const stored = localStorage.getItem(`${STCSPR_STORAGE_KEY}_${publicKey}`);
    return stored ? parseFloat(stored) : 0;
  } catch {
    return 0;
  }
};

// Save stCSPR balance to localStorage
const saveStCsprBalance = (publicKey: string | undefined, balance: number) => {
  if (!publicKey) return;
  try {
    localStorage.setItem(`${STCSPR_STORAGE_KEY}_${publicKey}`, balance.toString());
  } catch {
    // Ignore storage errors
  }
};

export const BalanceProvider: React.FC<BalanceProviderProps> = ({ children }) => {
  const { activeAccount, clickRef } = useCsprClick();
  const [csprBalance, setCsprBalance] = useState<number>(0);
  const [stCsprBalance, setStCsprBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRealBalance, setIsRealBalance] = useState<boolean>(false);

  // Track when the last local transaction happened to avoid stale API cache issues
  const lastTransactionTimeRef = useRef<number>(0);

  // Load stCSPR from localStorage when wallet connects
  useEffect(() => {
    if (activeAccount?.publicKey) {
      const savedBalance = loadStCsprBalance(activeAccount.publicKey);
      setStCsprBalance(savedBalance);
    }
  }, [activeAccount?.publicKey]);

  // Fetch balance from CSPR.click
  // IMPORTANT: This only fetches CSPR balance from blockchain
  // stCsprBalance is managed separately (localStorage) and should NOT be touched here
  const fetchBalance = useCallback(async () => {
    if (!activeAccount?.publicKey || !clickRef) {
      setCsprBalance(0);
      // DO NOT reset stCsprBalance here - it's stored locally, not on blockchain
      setIsRealBalance(false);
      return;
    }

    // Check if we're in cooldown period after a recent transaction
    // During cooldown, we skip refetching to avoid stale API cache overwriting local balance
    const timeSinceLastTransaction = Date.now() - lastTransactionTimeRef.current;
    if (lastTransactionTimeRef.current > 0 && timeSinceLastTransaction < REFETCH_COOLDOWN_MS) {
      console.log(`Skipping balance refetch - in cooldown (${Math.round((REFETCH_COOLDOWN_MS - timeSinceLastTransaction) / 1000)}s remaining)`);
      return;
    }

    setIsLoading(true);

    try {
      // Use CSPR.click's getActiveAccountAsync with balance
      const accountWithBalance = await clickRef.getActiveAccountAsync?.({ withBalance: true });

      if (accountWithBalance?.liquid_balance) {
        // Balance is in motes, convert to CSPR
        const balanceInCspr = parseInt(accountWithBalance.liquid_balance) / 1_000_000_000;
        setCsprBalance(balanceInCspr);
        setIsRealBalance(true);
        console.log('CSPR.click balance fetched:', balanceInCspr, 'CSPR');
      } else if (accountWithBalance?.balance) {
        // Fallback to total balance
        const balanceInCspr = parseInt(accountWithBalance.balance) / 1_000_000_000;
        setCsprBalance(balanceInCspr);
        setIsRealBalance(true);
        console.log('CSPR.click total balance fetched:', balanceInCspr, 'CSPR');
      } else {
        // If CSPR.click doesn't return balance, try CSPR.cloud API
        await fetchFromCsprCloud();
      }
    } catch (error) {
      console.error('Failed to fetch balance from CSPR.click:', error);
      // Fallback to CSPR.cloud API
      await fetchFromCsprCloud();
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAccount?.publicKey, clickRef]);

  // Fallback: Fetch from CSPR.cloud API via proxy
  const fetchFromCsprCloud = async () => {
    if (!activeAccount?.publicKey) return;

    // Check if proxy is available
    if (!isProxyAvailable()) {
      console.log('CSPR.click proxy not available, using demo balance');
      if (csprBalance === 0) {
        setCsprBalance(1000); // Demo fallback
        setIsRealBalance(false);
      }
      return;
    }

    try {
      const response = await csprCloudApi.getAccount(activeAccount.publicKey);
      const balanceMotes = response.data?.balance || '0';
      const balanceCSPR = parseInt(balanceMotes) / 1_000_000_000;
      setCsprBalance(balanceCSPR);
      setIsRealBalance(true);
      console.log('CSPR.cloud balance fetched via proxy:', balanceCSPR, 'CSPR');
    } catch (error) {
      console.error('Failed to fetch from CSPR.cloud:', error);
      // Keep existing balance or set demo
      if (csprBalance === 0) {
        setCsprBalance(1000); // Demo fallback
        setIsRealBalance(false);
      }
    }
  };

  // Fetch balance when account changes
  useEffect(() => {
    if (activeAccount?.publicKey) {
      fetchBalance();
    } else {
      setCsprBalance(0);
      setStCsprBalance(0);
      setIsRealBalance(false);
    }
  }, [activeAccount?.publicKey, fetchBalance]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!activeAccount?.publicKey) return;

    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [activeAccount?.publicKey, fetchBalance]);

  // Update balances after staking
  // IMPORTANT: We set a cooldown to prevent stale API cache from overwriting our local balance
  const updateAfterStake = useCallback((amount: number) => {
    // Mark that a transaction just happened - this starts the cooldown period
    lastTransactionTimeRef.current = Date.now();

    // Update CSPR balance (deduct staked amount + gas fee)
    setCsprBalance(prev => Math.max(0, prev - amount - GAS_FEE_CSPR));

    // Update stCSPR balance (add staked amount - this is stored locally, not on blockchain)
    setStCsprBalance(prev => {
      const newBalance = prev + amount;
      // Save to localStorage
      saveStCsprBalance(activeAccount?.publicKey, newBalance);
      return newBalance;
    });

    console.log(`Stake completed - cooldown active for ${REFETCH_COOLDOWN_MS / 1000}s`);
  }, [activeAccount?.publicKey]);

  // Update balances after unstaking
  // IMPORTANT: We set a cooldown to prevent stale API cache from overwriting our local balance
  const updateAfterUnstake = useCallback((amount: number) => {
    // Mark that a transaction just happened - this starts the cooldown period
    lastTransactionTimeRef.current = Date.now();

    // Update stCSPR balance (burn the unstaked amount)
    setStCsprBalance(prev => {
      const newBalance = Math.max(0, prev - amount);
      // Save to localStorage
      saveStCsprBalance(activeAccount?.publicKey, newBalance);
      return newBalance;
    });

    // Update CSPR balance (add unstaked amount minus gas fee)
    setCsprBalance(prev => prev + amount - GAS_FEE_CSPR);

    console.log(`Unstake completed - cooldown active for ${REFETCH_COOLDOWN_MS / 1000}s`);
  }, [activeAccount?.publicKey]);

  const value: BalanceContextType = {
    csprBalance,
    stCsprBalance,
    isLoading,
    isRealBalance,
    refetchBalance: fetchBalance,
    updateAfterStake,
    updateAfterUnstake,
  };

  return (
    <BalanceContext.Provider value={value}>
      {children}
    </BalanceContext.Provider>
  );
};

// Hook to use the balance context
export const useBalanceContext = (): BalanceContextType => {
  const context = useContext(BalanceContext);
  if (context === undefined) {
    throw new Error('useBalanceContext must be used within a BalanceProvider');
  }
  return context;
};

export default BalanceContext;
