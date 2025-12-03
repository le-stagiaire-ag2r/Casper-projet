import { useState, useCallback } from 'react';
import { useCsprClick } from './useCsprClick';
import {
  buildStakeTransaction,
  buildUnstakeTransaction,
  fetchMainPurse,
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
  const { activeAccount, isConnected, send } = useCsprClick();

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

    if (status === 'sent') {
      setTransactionState((prev) => ({
        ...prev,
        status: 'Transaction sent, waiting for confirmation...',
      }));
    }

    if (status === 'pending') {
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
      status: 'Fetching account info...',
      deployHash: null,
      error: null,
    });

    try {
      // V6.1: Fetch user's main purse first
      setTransactionState((prev) => ({
        ...prev,
        status: 'Fetching your main purse...',
      }));

      const mainPurse = await fetchMainPurse(activeAccount.publicKey);
      console.log('Main purse fetched:', mainPurse);

      setTransactionState((prev) => ({
        ...prev,
        status: 'Building transaction...',
      }));

      // Build the stake transaction with source_purse (V6.1)
      const transaction = buildStakeTransaction(
        activeAccount.publicKey,
        amountCspr,
        mainPurse // V6.1: Pass user's main purse
      );

      setTransactionState((prev) => ({
        ...prev,
        status: 'Waiting for wallet signature...',
      }));

      // Send transaction via CSPR.click using clickRef.send()
      const result = await send(
        transaction,
        activeAccount.publicKey,
        handleStatusUpdate
      );

      if (result.success) {
        // Store transaction in localStorage for history
        const txRecord = {
          id: Date.now().toString(),
          txHash: result.deployHash || '',
          actionType: 'stake',
          amount: csprToMotes(amountCspr),
          timestamp: new Date().toISOString(),
          userAddress: activeAccount.publicKey,
        };
        const existingTxs = JSON.parse(localStorage.getItem('stakevue_transactions') || '[]');
        localStorage.setItem('stakevue_transactions', JSON.stringify([txRecord, ...existingTxs]));

        // Dispatch event to notify history component
        window.dispatchEvent(new CustomEvent('stakevue_transaction_added'));

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
      status: 'Fetching account info...',
      deployHash: null,
      error: null,
    });

    try {
      // V6.1: Fetch user's main purse first
      setTransactionState((prev) => ({
        ...prev,
        status: 'Fetching your main purse...',
      }));

      const mainPurse = await fetchMainPurse(activeAccount.publicKey);
      console.log('Main purse fetched:', mainPurse);

      setTransactionState((prev) => ({
        ...prev,
        status: 'Building transaction...',
      }));

      // Build the unstake transaction with dest_purse (V6.1)
      const transaction = buildUnstakeTransaction(
        activeAccount.publicKey,
        amountCspr,
        mainPurse // V6.1: Pass user's main purse as destination
      );

      setTransactionState((prev) => ({
        ...prev,
        status: 'Waiting for wallet signature...',
      }));

      // Send transaction via CSPR.click using clickRef.send()
      const result = await send(
        transaction,
        activeAccount.publicKey,
        handleStatusUpdate
      );

      if (result.success) {
        // Store transaction in localStorage for history
        const txRecord = {
          id: Date.now().toString(),
          txHash: result.deployHash || '',
          actionType: 'unstake',
          amount: csprToMotes(amountCspr),
          timestamp: new Date().toISOString(),
          userAddress: activeAccount.publicKey,
        };
        const existingTxs = JSON.parse(localStorage.getItem('stakevue_transactions') || '[]');
        localStorage.setItem('stakevue_transactions', JSON.stringify([txRecord, ...existingTxs]));

        // Dispatch event to notify history component
        window.dispatchEvent(new CustomEvent('stakevue_transaction_added'));

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
