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

  // Check for existing active account on mount
  useEffect(() => {
    if (!clickRef) return;

    // Check if user is already connected (from previous session)
    const checkExistingConnection = () => {
      try {
        const activeKey = clickRef.getActiveAccount?.()?.public_key;
        if (activeKey) {
          console.log('CSPR.click: Found existing connection', activeKey);
          setActiveAccount({
            publicKey: activeKey,
            accountHash: activeKey,
          });
        }
      } catch (e) {
        // getActiveAccount may not be available immediately
        console.log('CSPR.click: No existing connection found');
      }
    };

    // Small delay to ensure CSPR.click is fully initialized
    const timer = setTimeout(checkExistingConnection, 100);
    return () => clearTimeout(timer);
  }, [clickRef]);

  // Listen to CSPR.click events
  useEffect(() => {
    if (!clickRef?.on) return;

    const handleSignedIn = (event: any) => {
      console.log('CSPR.click: Signed in', event);
      setIsConnecting(false);
      setError(null);

      if (event?.activeKey) {
        setActiveAccount({
          publicKey: event.activeKey,
          accountHash: event.activeKey,
        });
      }
    };

    const handleSwitchedAccount = (event: any) => {
      console.log('CSPR.click: Switched account', event);
      if (event?.activeKey) {
        setActiveAccount({
          publicKey: event.activeKey,
          accountHash: event.activeKey,
        });
      }
    };

    const handleSignedOut = () => {
      console.log('CSPR.click: Signed out');
      setActiveAccount(null);
    };

    const handleDisconnected = () => {
      console.log('CSPR.click: Disconnected');
      setActiveAccount(null);
    };

    // Register event listeners
    clickRef.on('csprclick:signed_in', handleSignedIn);
    clickRef.on('csprclick:switched_account', handleSwitchedAccount);
    clickRef.on('csprclick:signed_out', handleSignedOut);
    clickRef.on('csprclick:disconnected', handleDisconnected);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clickRef?.on]);

  /**
   * Initiate wallet connection via CSPR.click signIn
   */
  const connect = async () => {
    if (!window.csprclick) {
      setError('CSPR.click is not initialized');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      window.csprclick.signIn();
    } catch (err: any) {
      setError(err?.message || 'Failed to connect wallet');
      setIsConnecting(false);
    }
  };

  /**
   * Disconnect wallet (using signOut which doesn't require args)
   */
  const disconnect = async () => {
    if (!window.csprclick) return;

    try {
      window.csprclick.signOut();
      setActiveAccount(null);
    } catch (err: any) {
      console.error('Error disconnecting:', err);
    }
  };

  /**
   * Switch to another account - opens signIn modal to select different account
   */
  const switchAccount = async () => {
    if (!window.csprclick) return;

    try {
      // Use signIn to open wallet selection modal for switching accounts
      window.csprclick.signIn();
    } catch (err: any) {
      console.error('Error switching account:', err);
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
    error,
    connect,
    disconnect,
    switchAccount,
    send,
  };
};

export default useCsprClick;
