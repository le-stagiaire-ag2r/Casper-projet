import { useState, useCallback } from 'react';
import { useCsprClick } from './useCsprClick';
import {
  buildStakeTransaction,
  buildUnstakeTransaction,
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
 * Hook for staking operations on StakeVue V17
 *
 * V17 Features:
 * - stake(validator) - user chooses which validator
 * - request_unstake(amount, validator) - queues withdrawal (7 eras unbonding)
 * - Min stake: 500 CSPR for first delegation to a validator
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
   * Stake CSPR tokens to a validator (V17)
   *
   * @param amountCspr - Amount in CSPR to stake
   * @param validatorPublicKey - The validator's public key to stake with
   * @returns Promise with stake result
   */
  const stake = async (amountCspr: string, validatorPublicKey: string): Promise<StakingResult> => {
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

    // Validate validator
    if (!validatorPublicKey) {
      const error = 'Please select a validator to stake with.';
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

    // Check minimum stake (V17: 500 CSPR for first delegation)
    const minStake = parseFloat(motesToCspr(window.config.min_stake_amount || '500000000000'));
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
      // Build the stake transaction with validator (V17)
      const transaction = await buildStakeTransaction(
        activeAccount.publicKey,
        amountCspr,
        validatorPublicKey
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
   * Request unstake of stCSPR tokens (V17 - queues withdrawal)
   *
   * In V17, unstaking goes through a withdrawal queue:
   * 1. request_unstake() burns stCSPR and queues the CSPR withdrawal
   * 2. After 7 eras (~14 hours on testnet), user can claim_withdrawal()
   *
   * @param amountCspr - Amount in stCSPR to unstake
   * @param validatorPublicKey - The validator to undelegate from
   * @returns Promise with unstake result
   */
  const unstake = async (amountCspr: string, validatorPublicKey: string): Promise<StakingResult> => {
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

    // Validate validator
    if (!validatorPublicKey) {
      const error = 'Please select a validator to unstake from.';
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
      status: 'Queueing withdrawal request...',
      deployHash: null,
      error: null,
    });

    try {
      // Build the request_unstake transaction (V17)
      const transaction = await buildUnstakeTransaction(
        activeAccount.publicKey,
        amountCspr,
        validatorPublicKey
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
          status: 'Withdrawal request queued! CSPR will be available in ~7 eras.',
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
