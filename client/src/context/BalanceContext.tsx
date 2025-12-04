import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useCsprClick } from '../hooks/useCsprClick';

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

interface BalanceProviderProps {
  children: ReactNode;
}

export const BalanceProvider: React.FC<BalanceProviderProps> = ({ children }) => {
  const { activeAccount, clickRef } = useCsprClick();
  const [csprBalance, setCsprBalance] = useState<number>(0);
  const [stCsprBalance, setStCsprBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRealBalance, setIsRealBalance] = useState<boolean>(false);

  // Fetch balance from CSPR.click
  const fetchBalance = useCallback(async () => {
    if (!activeAccount?.publicKey || !clickRef) {
      setCsprBalance(0);
      setStCsprBalance(0);
      setIsRealBalance(false);
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

  // Fallback: Fetch from CSPR.cloud API
  const fetchFromCsprCloud = async () => {
    if (!activeAccount?.publicKey) return;

    try {
      const response = await fetch(
        `https://api.testnet.cspr.cloud/accounts/${activeAccount.publicKey}`,
        { headers: { 'Accept': 'application/json' } }
      );

      if (response.ok) {
        const data = await response.json();
        const balanceMotes = data.data?.balance || data.balance || '0';
        const balanceCSPR = parseInt(balanceMotes) / 1_000_000_000;
        setCsprBalance(balanceCSPR);
        setIsRealBalance(true);
        console.log('CSPR.cloud balance fetched:', balanceCSPR, 'CSPR');
      }
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
  const updateAfterStake = useCallback((amount: number) => {
    setCsprBalance(prev => Math.max(0, prev - amount - GAS_FEE_CSPR));
    setStCsprBalance(prev => prev + amount);

    // Refetch real balance after a delay
    setTimeout(fetchBalance, 5000);
  }, [fetchBalance]);

  // Update balances after unstaking
  const updateAfterUnstake = useCallback((amount: number) => {
    setStCsprBalance(prev => Math.max(0, prev - amount));
    setCsprBalance(prev => prev + amount - GAS_FEE_CSPR);

    // Refetch real balance after a delay
    setTimeout(fetchBalance, 5000);
  }, [fetchBalance]);

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
