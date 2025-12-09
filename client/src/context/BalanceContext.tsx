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
const STALE_PROTECTION_MS = 120000; // 2 minutes - during this time, we check for stale values

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

  // Track transaction info to detect stale API values
  const lastTransactionRef = useRef<{
    time: number;
    type: 'stake' | 'unstake' | null;
    expectedBalance: number;
  }>({ time: 0, type: null, expectedBalance: 0 });

  // Load stCSPR from localStorage when wallet connects
  useEffect(() => {
    if (activeAccount?.publicKey) {
      const savedBalance = loadStCsprBalance(activeAccount.publicKey);
      setStCsprBalance(savedBalance);
    }
  }, [activeAccount?.publicKey]);

  // Helper to check if a fetched balance seems stale
  const isStaleValue = (fetchedBalance: number): boolean => {
    const { time, type, expectedBalance } = lastTransactionRef.current;
    const timeSinceTransaction = Date.now() - time;

    // If no recent transaction or protection period expired, accept any value
    if (time === 0 || timeSinceTransaction > STALE_PROTECTION_MS) {
      return false;
    }

    // After a STAKE: balance should be LOWER. If API returns higher, it's stale.
    if (type === 'stake' && fetchedBalance > expectedBalance + 1) {
      console.log(`Stale value detected: API returned ${fetchedBalance} but expected ~${expectedBalance} after stake`);
      return true;
    }

    // After an UNSTAKE: balance should be HIGHER. If API returns lower, it's stale.
    if (type === 'unstake' && fetchedBalance < expectedBalance - 1) {
      console.log(`Stale value detected: API returned ${fetchedBalance} but expected ~${expectedBalance} after unstake`);
      return true;
    }

    return false;
  };

  // Fetch balance from CSPR.click
  const fetchBalance = useCallback(async () => {
    if (!activeAccount?.publicKey || !clickRef) {
      setCsprBalance(0);
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
      const accountWithBalance = await clickRef.getActiveAccountAsync?.({ withBalance: true });

      if (accountWithBalance?.liquid_balance) {
        const balanceInCspr = parseInt(accountWithBalance.liquid_balance) / 1_000_000_000;

        // Check if this value seems stale
        if (!isStaleValue(balanceInCspr)) {
          setCsprBalance(balanceInCspr);
          setIsRealBalance(true);
          console.log('CSPR.click balance fetched:', balanceInCspr, 'CSPR');
        } else {
          console.log('Ignoring stale balance from API, keeping local value');
        }
      } else if (accountWithBalance?.balance) {
        const balanceInCspr = parseInt(accountWithBalance.balance) / 1_000_000_000;

        if (!isStaleValue(balanceInCspr)) {
          setCsprBalance(balanceInCspr);
          setIsRealBalance(true);
          console.log('CSPR.click total balance fetched:', balanceInCspr, 'CSPR');
        } else {
          console.log('Ignoring stale balance from API, keeping local value');
        }
      } else {
        await fetchFromCsprCloud();
      }
    } catch (error) {
      console.error('Failed to fetch balance from CSPR.click:', error);
      await fetchFromCsprCloud();
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAccount?.publicKey, clickRef]);

  // Fallback: Fetch from CSPR.cloud API via proxy
  const fetchFromCsprCloud = async () => {
    if (!activeAccount?.publicKey) return;

    if (!isProxyAvailable()) {
      console.log('CSPR.click proxy not available, using demo balance');
      if (csprBalance === 0) {
        setCsprBalance(1000);
        setIsRealBalance(false);
      }
      return;
    }

    try {
      const response = await csprCloudApi.getAccount(activeAccount.publicKey);
      const balanceMotes = response.data?.balance || '0';
      const balanceCSPR = parseInt(balanceMotes) / 1_000_000_000;

      // Check if this value seems stale
      if (!isStaleValue(balanceCSPR)) {
        setCsprBalance(balanceCSPR);
        setIsRealBalance(true);
        console.log('CSPR.cloud balance fetched via proxy:', balanceCSPR, 'CSPR');
      } else {
        console.log('Ignoring stale balance from CSPR.cloud, keeping local value');
      }
    } catch (error) {
      console.error('Failed to fetch from CSPR.cloud:', error);
      if (csprBalance === 0) {
        setCsprBalance(1000);
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
  const updateAfterStake = useCallback((amount: number) => {
    const newBalance = Math.max(0, csprBalance - amount - GAS_FEE_CSPR);

    // Store transaction info to detect stale API values
    lastTransactionRef.current = {
      time: Date.now(),
      type: 'stake',
      expectedBalance: newBalance,
    };

    // Update CSPR balance
    setCsprBalance(newBalance);

    // Update stCSPR balance
    setStCsprBalance(prev => {
      const newStBalance = prev + amount;
      saveStCsprBalance(activeAccount?.publicKey, newStBalance);
      return newStBalance;
    });

    console.log(`Stake completed: ${csprBalance} -> ${newBalance} CSPR`);
  }, [activeAccount?.publicKey, csprBalance]);

  // Update balances after unstaking
  const updateAfterUnstake = useCallback((amount: number) => {
    const newBalance = csprBalance + amount - GAS_FEE_CSPR;

    // Store transaction info to detect stale API values
    lastTransactionRef.current = {
      time: Date.now(),
      type: 'unstake',
      expectedBalance: newBalance,
    };

    // Update stCSPR balance
    setStCsprBalance(prev => {
      const newStBalance = Math.max(0, prev - amount);
      saveStCsprBalance(activeAccount?.publicKey, newStBalance);
      return newStBalance;
    });

    // Update CSPR balance
    setCsprBalance(newBalance);

    console.log(`Unstake completed: ${csprBalance} -> ${newBalance} CSPR`);
  }, [activeAccount?.publicKey, csprBalance]);

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
