import { useState, useEffect } from 'react';
import { useClickRef } from '@make-software/csprclick-ui';

export interface ActiveAccount {
  publicKey: string;
  accountHash: string;
  balance?: string;
}

export const useCsprClick = () => {
  const clickRef = useClickRef();
  const [activeAccount, setActiveAccount] = useState<ActiveAccount | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Poll for account changes
  useEffect(() => {
    if (!clickRef) return;

    const checkConnection = async () => {
      try {
        const publicKey = await clickRef.getActivePublicKey();
        if (publicKey) {
          const accountHash = `account-hash-${publicKey.substring(2, 66)}`;
          setActiveAccount({ publicKey, accountHash });
        } else {
          setActiveAccount(null);
        }
      } catch (err) {
        // Silent fail for polling
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 500); // Poll every 500ms
    return () => clearInterval(interval);
  }, [clickRef]);

  const connect = async () => {
    if (!clickRef) {
      setError('CSPR.click not initialized');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Sign in with CSPR.click
      await clickRef.signIn();

      // Get active public key
      const publicKey = await clickRef.getActivePublicKey();
      if (publicKey) {
        const accountHash = `account-hash-${publicKey.substring(2, 66)}`;
        setActiveAccount({ publicKey, accountHash });
      } else {
        throw new Error('No active account found');
      }
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    if (!clickRef) return;

    try {
      await clickRef.disconnect();
      setActiveAccount(null);
    } catch (err) {
      console.error('Failed to disconnect:', err);
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    }
  };

  const signDeploy = async (deploy: any): Promise<any> => {
    if (!clickRef) {
      throw new Error('CSPR.click not initialized');
    }

    if (!activeAccount) {
      throw new Error('No wallet connected');
    }

    try {
      // Sign the deploy with CSPR.click
      const signedDeploy = await clickRef.sign(deploy, activeAccount.publicKey);
      return signedDeploy;
    } catch (err) {
      console.error('Failed to sign deploy:', err);
      throw err;
    }
  };

  return {
    isInitialized: !!clickRef,
    activeAccount,
    isConnecting,
    error,
    connect,
    disconnect,
    signDeploy,
    clickClient: clickRef,
  };
};
