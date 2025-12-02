import { useState, useEffect } from 'react';
import { ClickState, ClickEvent } from '@make-software/csprclick-core-types';
import { CsprClickInitOptions, ClickProvider } from '@make-software/csprclick-core-client';
import config from '../services/config';

let clickClient: ClickProvider | null = null;

export interface ActiveAccount {
  publicKey: string;
  accountHash: string;
  balance?: string;
}

export const useCsprClick = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeAccount, setActiveAccount] = useState<ActiveAccount | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize CSPR.click client
  useEffect(() => {
    const initializeClickClient = async () => {
      if (clickClient) {
        setIsInitialized(true);
        return;
      }

      try {
        const options: CsprClickInitOptions = {
          appName: 'StakeVue',
          appId: config.csprClickAppId,
          contentMode: 'iframe',
          providers: ['casper-wallet', 'ledger', 'torus-wallet'],
          betaMode: false,
        };

        clickClient = new ClickProvider(options);

        // Listen for account changes
        clickClient.on(ClickEvent.Connected, (evt: ClickState) => {
          if (evt?.activeKey) {
            setActiveAccount({
              publicKey: evt.activeKey,
              accountHash: evt.activeKey, // Will be converted to account hash
            });
          }
        });

        clickClient.on(ClickEvent.Disconnected, () => {
          setActiveAccount(null);
        });

        clickClient.on(ClickEvent.ActiveKeyChanged, (evt: ClickState) => {
          if (evt?.activeKey) {
            setActiveAccount({
              publicKey: evt.activeKey,
              accountHash: evt.activeKey,
            });
          }
        });

        setIsInitialized(true);
        console.log('✅ CSPR.click initialized');
      } catch (err) {
        console.error('Failed to initialize CSPR.click:', err);
        setError('Failed to initialize wallet connection');
      }
    };

    initializeClickClient();
  }, []);

  const connect = async () => {
    if (!clickClient) {
      setError('CSPR.click not initialized');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      await clickClient.signIn();
      console.log('✅ Wallet connected');
    } catch (err: any) {
      console.error('Failed to connect wallet:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    if (!clickClient) return;

    try {
      await clickClient.signOut();
      setActiveAccount(null);
      console.log('✅ Wallet disconnected');
    } catch (err) {
      console.error('Failed to disconnect wallet:', err);
    }
  };

  const signDeploy = async (deploy: any): Promise<any> => {
    if (!clickClient) {
      throw new Error('CSPR.click not initialized');
    }

    if (!activeAccount) {
      throw new Error('No active account');
    }

    try {
      const signedDeploy = await clickClient.sign(deploy, activeAccount.publicKey);
      return signedDeploy;
    } catch (err: any) {
      console.error('Failed to sign deploy:', err);
      throw new Error(err.message || 'Failed to sign transaction');
    }
  };

  return {
    isInitialized,
    activeAccount,
    isConnecting,
    error,
    connect,
    disconnect,
    signDeploy,
    clickClient,
  };
};
