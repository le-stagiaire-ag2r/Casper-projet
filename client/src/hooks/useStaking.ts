import { useState } from 'react';
import { useCsprClick } from './useCsprClick';

export const useStaking = () => {
  const { activeAccount } = useCsprClick();
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stake = async (amountInCspr: string): Promise<string | null> => {
    if (!activeAccount) {
      setError('No wallet connected');
      return null;
    }

    setIsProcessing(true);
    setError(null);
    setTxHash(null);

    // Simulation mode
    setTimeout(() => {
      const mockTxHash = `${Date.now()}-mock-stake-tx`;
      setTxHash(mockTxHash);
      setIsProcessing(false);
      console.log(`Simulated stake: ${amountInCspr} CSPR`);
    }, 2000);

    return 'mock-tx-hash';
  };

  const unstake = async (amountInCspr: string): Promise<string | null> => {
    if (!activeAccount) {
      setError('No wallet connected');
      return null;
    }

    setIsProcessing(true);
    setError(null);
    setTxHash(null);

    // Simulation mode
    setTimeout(() => {
      const mockTxHash = `${Date.now()}-mock-unstake-tx`;
      setTxHash(mockTxHash);
      setIsProcessing(false);
      console.log(`Simulated unstake: ${amountInCspr} stCSPR`);
    }, 2000);

    return 'mock-tx-hash';
  };

  const getBalance = async (): Promise<{ cspr: string; stCspr: string } | null> => {
    if (!activeAccount) {
      return null;
    }

    // Simulation
    return {
      cspr: '1000000000000', // 1000 CSPR in motes
      stCspr: '500000000000', // 500 stCSPR in motes
    };
  };

  return {
    stake,
    unstake,
    getBalance,
    isProcessing,
    txHash,
    error,
  };
};
