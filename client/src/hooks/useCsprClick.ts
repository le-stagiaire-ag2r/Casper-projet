import { useState } from 'react';

export interface ActiveAccount {
  publicKey: string;
  accountHash: string;
  balance?: string;
}

export const useCsprClick = () => {
  const [activeAccount, setActiveAccount] = useState<ActiveAccount | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    setIsConnecting(true);
    setError(null);

    // Simulation mode for now
    // TODO: Integrate CSPR.click when ready
    setTimeout(() => {
      setActiveAccount({
        publicKey: '0203a1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd',
        accountHash: 'account-hash-123456789',
      });
      setIsConnecting(false);
    }, 1000);
  };

  const disconnect = async () => {
    setActiveAccount(null);
  };

  const signDeploy = async (deploy: any): Promise<any> => {
    // TODO: Implement CSPR.click signing
    console.warn('Sign deploy not yet implemented');
    throw new Error('Wallet signing not yet implemented');
  };

  return {
    isInitialized: true,
    activeAccount,
    isConnecting,
    error,
    connect,
    disconnect,
    signDeploy,
    clickClient: null,
  };
};
