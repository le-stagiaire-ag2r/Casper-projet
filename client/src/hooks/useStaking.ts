import { useState } from 'react';
import { useCsprClick } from './useCsprClick';
import { createStakeTransaction, createUnstakeTransaction } from '../services/casper';
import { api } from '../services/api';

export const useStaking = () => {
  const { activeAccount, signDeploy } = useCsprClick();
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

    try {
      // Create stake transaction
      const transaction = createStakeTransaction(activeAccount.publicKey, amountInCspr);

      // Sign transaction with wallet
      const signedDeploy = await signDeploy(transaction);

      // Extract transaction hash
      const deployHash = signedDeploy.hash || signedDeploy.deploy?.hash;

      if (deployHash) {
        setTxHash(deployHash);
        console.log(`✅ Stake transaction submitted: ${deployHash}`);
        console.log(`View on explorer: https://testnet.cspr.live/transaction/${deployHash}`);
      } else {
        throw new Error('No transaction hash returned from wallet');
      }

      return deployHash;
    } catch (err) {
      console.error('Stake transaction failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to stake CSPR';
      setError(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const unstake = async (amountInCspr: string): Promise<string | null> => {
    if (!activeAccount) {
      setError('No wallet connected');
      return null;
    }

    setIsProcessing(true);
    setError(null);
    setTxHash(null);

    try {
      // Create unstake transaction
      const transaction = createUnstakeTransaction(activeAccount.publicKey, amountInCspr);

      // Sign transaction with wallet
      const signedDeploy = await signDeploy(transaction);

      // Extract transaction hash
      const deployHash = signedDeploy.hash || signedDeploy.deploy?.hash;

      if (deployHash) {
        setTxHash(deployHash);
        console.log(`✅ Unstake transaction submitted: ${deployHash}`);
        console.log(`View on explorer: https://testnet.cspr.live/transaction/${deployHash}`);
      } else {
        throw new Error('No transaction hash returned from wallet');
      }

      return deployHash;
    } catch (err) {
      console.error('Unstake transaction failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to unstake stCSPR';
      setError(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const getBalance = async (): Promise<{ cspr: string; stCspr: string } | null> => {
    if (!activeAccount) {
      return null;
    }

    try {
      // Fetch user's total staked amount from API
      const userStaked = await api.getUserTotalStaked(activeAccount.accountHash);

      // Fetch account info for CSPR balance (could also use CSPR.cloud)
      // For now, return the staked amount - the actual CSPR balance would need CSPR.cloud integration
      return {
        cspr: '0', // Would need to fetch from CSPR.cloud
        stCspr: userStaked.totalStaked,
      };
    } catch (err) {
      console.error('Failed to fetch balances:', err);
      return null;
    }
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
