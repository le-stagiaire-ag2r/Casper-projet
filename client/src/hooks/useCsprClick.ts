import { useState, useEffect } from 'react';
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
          accountHash: event.activeKey, // Account hash is derived from public key
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

  return {
    clickRef,
    activeAccount,
    isConnecting,
    isConnected: !!activeAccount,
    error,
    connect,
    disconnect,
    switchAccount,
  };
};

export default useCsprClick;
