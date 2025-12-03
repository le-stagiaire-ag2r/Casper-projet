import { useState, useEffect, useCallback } from 'react';
import { useClickRef } from '@make-software/csprclick-ui';

export interface ActiveAccountType {
  publicKey: string;
  accountHash: string;
}

/**
 * Hook to manage CSPR.click wallet connection state
 * Based on official CSPR.click documentation pattern
 */
export const useCsprClick = () => {
  const clickRef = useClickRef();
  const [activeAccount, setActiveAccount] = useState<ActiveAccountType | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Helper to get active account from clickRef
   */
  const updateActiveAccount = useCallback(() => {
    if (!clickRef) return;

    try {
      const account = clickRef.getActiveAccount?.();
      if (account?.public_key) {
        console.log('CSPR.click: Active account updated', account.public_key);
        setActiveAccount({
          publicKey: account.public_key,
          accountHash: account.public_key,
        });
      } else {
        setActiveAccount(null);
      }
    } catch (e) {
      console.log('CSPR.click: Could not get active account');
      setActiveAccount(null);
    }
  }, [clickRef]);

  // Check for existing active account on mount
  useEffect(() => {
    if (!clickRef) return;

    // Small delay to ensure CSPR.click is fully initialized
    const timer = setTimeout(updateActiveAccount, 100);
    return () => clearTimeout(timer);
  }, [clickRef, updateActiveAccount]);

  // Listen to CSPR.click events
  useEffect(() => {
    if (!clickRef?.on) return;

    const handleSignedIn = () => {
      console.log('CSPR.click: Signed in event received');
      setIsConnecting(false);
      setError(null);
      // Get account from clickRef after sign in
      updateActiveAccount();
    };

    const handleSwitchedAccount = () => {
      console.log('CSPR.click: Switched account event received');
      // Get updated account from clickRef
      updateActiveAccount();
    };

    const handleSignedOut = () => {
      console.log('CSPR.click: Signed out event received');
      setActiveAccount(null);
    };

    const handleDisconnected = () => {
      console.log('CSPR.click: Disconnected event received');
      setActiveAccount(null);
    };

    // Register event listeners
    clickRef.on('csprclick:signed_in', handleSignedIn);
    clickRef.on('csprclick:switched_account', handleSwitchedAccount);
    clickRef.on('csprclick:signed_out', handleSignedOut);
    clickRef.on('csprclick:disconnected', handleDisconnected);

    // Cleanup event listeners on unmount
    return () => {
      if (clickRef?.off) {
        clickRef.off('csprclick:signed_in', handleSignedIn);
        clickRef.off('csprclick:switched_account', handleSwitchedAccount);
        clickRef.off('csprclick:signed_out', handleSignedOut);
        clickRef.off('csprclick:disconnected', handleDisconnected);
      }
    };
  }, [clickRef, updateActiveAccount]);

  /**
   * Initiate wallet connection via CSPR.click signIn
   */
  const connect = async () => {
    if (!clickRef) {
      setError('CSPR.click is not initialized');
      return;
    }

    setError(null);

    try {
      // Use clickRef.signIn() as per documentation
      clickRef.signIn();
    } catch (err: any) {
      setError(err?.message || 'Failed to connect wallet');
    }
  };

  /**
   * Disconnect wallet completely
   * Uses window.csprclick.disconnect() to force full re-authentication on next login
   */
  const disconnect = async () => {
    try {
      // Use window.csprclick.disconnect() to fully disconnect
      // This forces the user to re-authenticate on next login
      // Cast to any to bypass TypeScript strict checking on disconnect signature
      if ((window as any).csprclick?.disconnect) {
        (window as any).csprclick.disconnect();
      } else if (clickRef?.signOut) {
        // Fallback to signOut if disconnect not available
        clickRef.signOut();
      }
      setActiveAccount(null);
    } catch (err: any) {
      console.error('Error disconnecting:', err);
      setActiveAccount(null);
    }
  };

  /**
   * Send a transaction via CSPR.click
   * Uses clickRef.send() as per official documentation pattern
   */
  const send = useCallback(
    async (
      transaction: any,
      senderPublicKey: string,
      onStatusUpdate?: (status: string, data: any) => void
    ): Promise<{ success: boolean; deployHash?: string; error?: string }> => {
      return new Promise((resolve) => {
        if (!clickRef) {
          resolve({ success: false, error: 'CSPR.click is not initialized' });
          return;
        }

        const handleStatusUpdate = (status: string, data: any) => {
          console.log('Transaction status:', status, data);

          if (onStatusUpdate) {
            onStatusUpdate(status, data);
          }

          // Handle final states
          if (status === 'processed') {
            if (data?.csprCloudTransaction?.error_message === null) {
              resolve({
                success: true,
                deployHash: data?.deployHash || data?.transactionHash,
              });
            } else {
              resolve({
                success: false,
                error: data?.csprCloudTransaction?.error_message || 'Transaction failed',
              });
            }
          }

          if (status === 'cancelled') {
            resolve({ success: false, error: 'Transaction cancelled by user' });
          }

          if (status === 'error' || status === 'timeout') {
            resolve({
              success: false,
              error: data?.error || data?.errorData || 'Transaction failed',
            });
          }
        };

        try {
          // Use clickRef.send() as per documentation
          clickRef.send(transaction, senderPublicKey, handleStatusUpdate);
        } catch (err: any) {
          resolve({ success: false, error: err?.message || 'Failed to send transaction' });
        }
      });
    },
    [clickRef]
  );

  return {
    clickRef,
    activeAccount,
    isConnecting,
    isConnected: !!activeAccount,
    isReady: !!clickRef, // CSPR.click is ready when clickRef is available
    error,
    connect,
    disconnect,
    send,
  };
};

export default useCsprClick;
