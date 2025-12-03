import { useState, useCallback } from 'react';
import { useCsprClick } from './useCsprClick';
import {
  buildStakeTransaction,
  buildUnstakeTransaction,
  sendTransaction,
  TransactionStatus,
  csprToMotes,
  motesToCspr,
} from '../services/transaction';

export interface StakingResult {
  success: boolean;
  deployHash?: string;
  error?: string;
}

export interface TransactionState {
  isProcessing: boolean;
  status: string | null;
  deployHash: string | null;
  error: string | null;
}

/**
 * Hook for staking operations on StakeVue
 *
 * Provides stake and unstake functionality using CSPR.click
 * for transaction signing and submission.
 */
export const useStaking = () => {
  const { activeAccount, isConnected } = useCsprClick();

  const [transactionState, setTransactionState] = useState<TransactionState>({
    isProcessing: false,
    status: null,
    deployHash: null,
    error: null,
  });

  /**
   * Handle transaction status updates
   */
  const handleStatusUpdate = useCallback((status: string, data: any) => {
    console.log('Staking status update:', status, data);

    setTransactionState((prev) => ({
      ...prev,
      status,
    }));

    if (status === TransactionStatus.SENT) {
      setTransactionState((prev) => ({
        ...prev,
        status: 'Transaction sent, waiting for confirmation...',
      }));
    }

    if (status === TransactionStatus.PENDING) {
      setTransactionState((prev) => ({
        ...prev,
        status: 'Transaction pending...',
      }));
    }
  }, []);

  /**
   * Stake CSPR tokens
   *
   * @param amountCspr - Amount in CSPR to stake
   * @returns Promise with stake result
   */
  const stake = async (amountCspr: string): Promise<StakingResult> => {
    // Validate connection
    if (!isConnected || !activeAccount) {
      const error = 'No wallet connected. Please connect your wallet first.';
      setTransactionState({
        isProcessing: false,
        status: null,
        deployHash: null,
        error,
      });
      return { success: false, error };
    }

    // Validate amount
    const amount = parseFloat(amountCspr);
    if (isNaN(amount) || amount <= 0) {
      const error = 'Invalid stake amount. Please enter a positive number.';
      setTransactionState({
        isProcessing: false,
        status: null,
        deployHash: null,
        error,
      });
      return { success: false, error };
    }

    // Check minimum stake
    const minStake = parseFloat(motesToCspr(window.config.min_stake_amount || '1000000000'));
    if (amount < minStake) {
      const error = `Minimum stake amount is ${minStake} CSPR`;
      setTransactionState({
        isProcessing: false,
        status: null,
        deployHash: null,
        error,
      });
      return { success: false, error };
    }

    // Reset state and start processing
    setTransactionState({
      isProcessing: true,
      status: 'Building transaction...',
      deployHash: null,
      error: null,
    });

    try {
      // Build the stake transaction
      const transaction = buildStakeTransaction(
        activeAccount.publicKey,
        amountCspr
      );

      setTransactionState((prev) => ({
        ...prev,
        status: 'Waiting for wallet signature...',
      }));

      // Send transaction via CSPR.click
      const result = await sendTransaction(
        transaction,
        activeAccount.publicKey,
        handleStatusUpdate
      );

      if (result.success) {
        setTransactionState({
          isProcessing: false,
          status: 'Stake successful!',
          deployHash: result.deployHash || null,
          error: null,
        });
        return {
          success: true,
          deployHash: result.deployHash,
        };
      } else {
        setTransactionState({
          isProcessing: false,
          status: null,
          deployHash: null,
          error: result.error || 'Stake failed',
        });
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (err: any) {
      const error = err?.message || 'Failed to stake';
      setTransactionState({
        isProcessing: false,
        status: null,
        deployHash: null,
        error,
      });
      return { success: false, error };
    }
  };

  /**
   * Unstake stCSPR tokens
   *
   * @param amountCspr - Amount in stCSPR to unstake
   * @returns Promise with unstake result
   */
  const unstake = async (amountCspr: string): Promise<StakingResult> => {
    // Validate connection
    if (!isConnected || !activeAccount) {
      const error = 'No wallet connected. Please connect your wallet first.';
      setTransactionState({
        isProcessing: false,
        status: null,
        deployHash: null,
        error,
      });
      return { success: false, error };
    }

    // Validate amount
    const amount = parseFloat(amountCspr);
    if (isNaN(amount) || amount <= 0) {
      const error = 'Invalid unstake amount. Please enter a positive number.';
      setTransactionState({
        isProcessing: false,
        status: null,
        deployHash: null,
        error,
      });
      return { success: false, error };
    }

    // Reset state and start processing
    setTransactionState({
      isProcessing: true,
      status: 'Building transaction...',
      deployHash: null,
      error: null,
    });

    try {
      // Build the unstake transaction
      const transaction = buildUnstakeTransaction(
        activeAccount.publicKey,
        amountCspr
      );

      setTransactionState((prev) => ({
        ...prev,
        status: 'Waiting for wallet signature...',
      }));

      // Send transaction via CSPR.click
      const result = await sendTransaction(
        transaction,
        activeAccount.publicKey,
        handleStatusUpdate
      );

      if (result.success) {
        setTransactionState({
          isProcessing: false,
          status: 'Unstake successful!',
          deployHash: result.deployHash || null,
          error: null,
        });
        return {
          success: true,
          deployHash: result.deployHash,
        };
      } else {
        setTransactionState({
          isProcessing: false,
          status: null,
          deployHash: null,
          error: result.error || 'Unstake failed',
        });
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (err: any) {
      const error = err?.message || 'Failed to unstake';
      setTransactionState({
        isProcessing: false,
        status: null,
        deployHash: null,
        error,
      });
      return { success: false, error };
    }
  };

  /**
   * Reset transaction state
   */
  const resetState = useCallback(() => {
    setTransactionState({
      isProcessing: false,
      status: null,
      deployHash: null,
      error: null,
    });
  }, []);

  return {
    // Connection state
    isConnected,
    activeAccount,

    // Transaction state
    isProcessing: transactionState.isProcessing,
    status: transactionState.status,
    deployHash: transactionState.deployHash,
    error: transactionState.error,

    // Actions
    stake,
    unstake,
    resetState,

    // Utilities
    csprToMotes,
    motesToCspr,
  };
};

export default useStaking;
