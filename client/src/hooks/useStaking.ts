import { useState } from 'react';
import { CLPublicKey, CLValueBuilder, DeployUtil, RuntimeArgs } from 'casper-js-sdk';
import config from '../services/config';
import { useCsprClick } from './useCsprClick';

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
      // Convert CSPR to motes (1 CSPR = 1,000,000,000 motes)
      const amountInMotes = parseFloat(amountInCspr) * 1_000_000_000;

      // Build runtime arguments
      const runtimeArgs = RuntimeArgs.fromMap({
        amount: CLValueBuilder.u512(amountInMotes.toString()),
      });

      // Create deploy
      const publicKey = CLPublicKey.fromHex(activeAccount.publicKey);

      const deploy = DeployUtil.makeDeploy(
        new DeployUtil.DeployParams(publicKey, config.casperChainName),
        DeployUtil.ExecutableDeployItem.newStoredContractByHash(
          Uint8Array.from(Buffer.from(config.contractHash.replace('contract-', ''), 'hex')),
          'stake',
          runtimeArgs
        ),
        DeployUtil.standardPayment(5_000_000_000) // 5 CSPR payment
      );

      // Sign deploy
      const signedDeploy = await signDeploy(deploy);

      // Send deploy to network
      const response = await fetch(`${config.csprCloudUrl}/deploys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deploy: DeployUtil.deployToJson(signedDeploy) }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit transaction');
      }

      const result = await response.json();
      const deployHash = result.deploy_hash;

      setTxHash(deployHash);
      console.log('✅ Stake transaction submitted:', deployHash);

      return deployHash;
    } catch (err: any) {
      console.error('Stake failed:', err);
      setError(err.message || 'Stake transaction failed');
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
      const amountInMotes = parseFloat(amountInCspr) * 1_000_000_000;

      const runtimeArgs = RuntimeArgs.fromMap({
        amount: CLValueBuilder.u512(amountInMotes.toString()),
      });

      const publicKey = CLPublicKey.fromHex(activeAccount.publicKey);

      const deploy = DeployUtil.makeDeploy(
        new DeployUtil.DeployParams(publicKey, config.casperChainName),
        DeployUtil.ExecutableDeployItem.newStoredContractByHash(
          Uint8Array.from(Buffer.from(config.contractHash.replace('contract-', ''), 'hex')),
          'unstake',
          runtimeArgs
        ),
        DeployUtil.standardPayment(5_000_000_000)
      );

      const signedDeploy = await signDeploy(deploy);

      const response = await fetch(`${config.csprCloudUrl}/deploys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deploy: DeployUtil.deployToJson(signedDeploy) }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit transaction');
      }

      const result = await response.json();
      const deployHash = result.deploy_hash;

      setTxHash(deployHash);
      console.log('✅ Unstake transaction submitted:', deployHash);

      return deployHash;
    } catch (err: any) {
      console.error('Unstake failed:', err);
      setError(err.message || 'Unstake transaction failed');
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
      // Query stCSPR balance from contract
      // This is a simplified version - you'd need to query the contract state
      // For now, we'll use the API
      const response = await fetch(`${config.apiUrl}/user-staked/${activeAccount.accountHash}`);
      const data = await response.json();

      return {
        cspr: '0', // Would need to query from blockchain
        stCspr: data.totalStaked || '0',
      };
    } catch (err) {
      console.error('Failed to get balance:', err);
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
