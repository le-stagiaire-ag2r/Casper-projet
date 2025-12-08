/**
 * Transaction Service for StakeVue
 *
 * Based on official Casper documentation patterns:
 * - V2 to V5 Migration Guide
 * - Building and Signing Transactions Guide
 * - Donation Demo patterns
 */

import {
  Args,
  CLValue,
  PublicKey,
  Deploy,
  DeployHeader,
  ExecutableDeployItem,
  StoredContractByHash,
  ContractHash,
  URef,
} from 'casper-js-sdk';

// Get runtime config
const config = window.config;

/**
 * Convert CSPR to motes (smallest unit)
 * 1 CSPR = 1,000,000,000 motes
 */
export const csprToMotes = (cspr: string): string => {
  const amount = parseFloat(cspr);
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Invalid CSPR amount');
  }
  return (BigInt(Math.floor(amount * 1_000_000_000))).toString();
};

/**
 * Convert motes to CSPR
 */
export const motesToCspr = (motes: string): string => {
  const amount = BigInt(motes);
  return (Number(amount) / 1_000_000_000).toFixed(4);
};

/**
 * Get contract hash without 'hash-' prefix
 */
const getContractHashHex = (): string => {
  const hash = config.contract_hash || '';
  return hash.startsWith('hash-') ? hash.substring(5) : hash;
};

/**
 * Parse URef string from CSPR.cloud format
 * Format: uref-{64 hex chars}-{3 digit access rights}
 * Example: uref-bb9f47c30ddbe192438fad10b7db8200247529d6592af7159d92c5f3aa7716a1-007
 */
export const parseURefString = (urefStr: string): URef | null => {
  try {
    // Parse format: uref-{64 hex chars}-{access rights}
    const parts = urefStr.split('-');
    if (parts.length !== 3 || parts[0] !== 'uref') {
      console.error('Invalid URef format:', urefStr);
      return null;
    }

    const hexBytes = parts[1];
    const accessRights = parseInt(parts[2], 8); // Access rights are in octal

    // Convert hex string to Uint8Array
    const bytes = new Uint8Array(hexBytes.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

    // Create URef with bytes and access rights
    return new URef(bytes, accessRights);
  } catch (error) {
    console.error('Failed to parse URef:', error);
    return null;
  }
};

/**
 * Build a Stake Transaction using Deploy.makeDeploy pattern
 *
 * This pattern is from the official V2→V5 migration guide:
 * - Uses ExecutableDeployItem and StoredContractByHash
 * - Compatible with Casper Network (both 1.x and 2.x)
 * - Serializes deploy with toJSON() for CSPR.click compatibility
 *
 * V6.1: If sourcePurse is provided and use_real_transfers is enabled,
 * real CSPR will be transferred from the user's purse to the contract.
 */
export const buildStakeTransaction = (
  senderPublicKeyHex: string,
  amountCspr: string,
  sourcePurse?: string // Optional: user's main_purse_uref for real transfers
): { deploy: any } => {
  // Validate inputs
  if (!senderPublicKeyHex) {
    throw new Error('Sender public key is required');
  }

  if (!config.contract_hash) {
    throw new Error('Contract hash not configured');
  }

  // Convert amounts
  const amountMotes = csprToMotes(amountCspr);
  const paymentMotes = config.transaction_payment || '5000000000'; // 5 CSPR default

  // Build runtime arguments for 'stake' entry point
  const argsMap: Record<string, CLValue> = {
    amount: CLValue.newCLUInt512(amountMotes),
  };

  // V6.1: Add source_purse if real transfers are enabled
  if (config.use_real_transfers && sourcePurse) {
    const parsedURef = parseURefString(sourcePurse);
    if (parsedURef) {
      argsMap.source_purse = CLValue.newCLUref(parsedURef);
      console.log('Building stake transaction with real transfer from purse:', sourcePurse);
    } else {
      console.warn('Failed to parse source purse, falling back to demo mode');
    }
  }

  const args = Args.fromMap(argsMap);

  // Build session using StoredContractByHash (V5 pattern)
  const session = new ExecutableDeployItem();
  session.storedContractByHash = new StoredContractByHash(
    ContractHash.newContract(getContractHashHex()),
    'stake',
    args
  );

  // Build deploy header (default() provides standard TTL of 30 minutes)
  const deployHeader = DeployHeader.default();
  deployHeader.account = PublicKey.fromHex(senderPublicKeyHex);
  deployHeader.chainName = config.chain_name || 'casper-test';
  deployHeader.gasPrice = 1;

  // Build payment (standardPayment expects string or BigNumber)
  const payment = ExecutableDeployItem.standardPayment(paymentMotes);

  // Create deploy
  const deploy = Deploy.makeDeploy(deployHeader, payment, session);

  // Serialize deploy for CSPR.click (like lottery demo does with transaction.toJSON())
  return { deploy: Deploy.toJSON(deploy) };
};

/**
 * Build an Unstake Transaction
 * Serializes deploy with toJSON() for CSPR.click compatibility
 *
 * V6.1: If destPurse is provided and use_real_transfers is enabled,
 * real CSPR will be transferred from the contract to the user's purse.
 */
export const buildUnstakeTransaction = (
  senderPublicKeyHex: string,
  amountCspr: string,
  destPurse?: string // Optional: user's main_purse_uref for real transfers
): { deploy: any } => {
  // Validate inputs
  if (!senderPublicKeyHex) {
    throw new Error('Sender public key is required');
  }

  if (!config.contract_hash) {
    throw new Error('Contract hash not configured');
  }

  // Convert amounts
  const amountMotes = csprToMotes(amountCspr);
  const paymentMotes = config.transaction_payment || '5000000000';

  // Build runtime arguments for 'unstake' entry point
  const argsMap: Record<string, CLValue> = {
    amount: CLValue.newCLUInt512(amountMotes),
  };

  // V6.1: Add dest_purse if real transfers are enabled
  if (config.use_real_transfers && destPurse) {
    const parsedURef = parseURefString(destPurse);
    if (parsedURef) {
      argsMap.dest_purse = CLValue.newCLUref(parsedURef);
      console.log('Building unstake transaction with real transfer to purse:', destPurse);
    } else {
      console.warn('Failed to parse dest purse, falling back to demo mode');
    }
  }

  const args = Args.fromMap(argsMap);

  // Build session
  const session = new ExecutableDeployItem();
  session.storedContractByHash = new StoredContractByHash(
    ContractHash.newContract(getContractHashHex()),
    'unstake',
    args
  );

  // Build deploy header (default() provides standard TTL of 30 minutes)
  const deployHeader = DeployHeader.default();
  deployHeader.account = PublicKey.fromHex(senderPublicKeyHex);
  deployHeader.chainName = config.chain_name || 'casper-test';
  deployHeader.gasPrice = 1;

  // Build payment (standardPayment expects string or BigNumber)
  const payment = ExecutableDeployItem.standardPayment(paymentMotes);

  // Create deploy
  const deploy = Deploy.makeDeploy(deployHeader, payment, session);

  // Serialize deploy for CSPR.click
  return { deploy: Deploy.toJSON(deploy) };
};

/**
 * Build a stCSPR Transfer Transaction
 * Serializes deploy with toJSON() for CSPR.click compatibility
 */
export const buildTransferStCsprTransaction = (
  senderPublicKeyHex: string,
  recipientAccountHash: string,
  amountCspr: string
): { deploy: any } => {
  if (!senderPublicKeyHex) {
    throw new Error('Sender public key is required');
  }

  if (!recipientAccountHash) {
    throw new Error('Recipient account hash is required');
  }

  if (!config.contract_hash) {
    throw new Error('Contract hash not configured');
  }

  const amountMotes = csprToMotes(amountCspr);
  const paymentMotes = config.transaction_payment || '5000000000';

  // Build runtime arguments for 'transfer_stcspr' entry point
  const recipientHash = recipientAccountHash.startsWith('account-hash-')
    ? recipientAccountHash.substring(13)
    : recipientAccountHash;

  const args = Args.fromMap({
    recipient: CLValue.newCLByteArray(Buffer.from(recipientHash, 'hex')),
    amount: CLValue.newCLUInt512(amountMotes),
  });

  // Build session
  const session = new ExecutableDeployItem();
  session.storedContractByHash = new StoredContractByHash(
    ContractHash.newContract(getContractHashHex()),
    'transfer_stcspr',
    args
  );

  // Build deploy header (default() provides standard TTL of 30 minutes)
  const deployHeader = DeployHeader.default();
  deployHeader.account = PublicKey.fromHex(senderPublicKeyHex);
  deployHeader.chainName = config.chain_name || 'casper-test';
  deployHeader.gasPrice = 1;

  // Build payment (standardPayment expects string or BigNumber)
  const payment = ExecutableDeployItem.standardPayment(paymentMotes);

  // Create deploy
  const deploy = Deploy.makeDeploy(deployHeader, payment, session);

  // Serialize deploy for CSPR.click
  return { deploy: Deploy.toJSON(deploy) };
};

/**
 * Transaction status types from CSPR.click
 */
export enum TransactionStatus {
  SENT = 'sent',
  PENDING = 'pending',
  PROCESSED = 'processed',
  CANCELLED = 'cancelled',
  ERROR = 'error',
  TIMEOUT = 'timeout',
}

/**
 * Send a transaction via CSPR.click
 *
 * This handles:
 * - Wallet signing prompt
 * - Transaction submission to network
 * - Status updates via callback
 */
export const sendTransaction = async (
  transaction: { deploy: object } | { transaction: { Version1: object } },
  senderPublicKey: string,
  onStatusUpdate?: (status: string, data: any) => void
): Promise<{
  success: boolean;
  deployHash?: string;
  error?: string;
}> => {
  return new Promise((resolve) => {
    if (!window.csprclick) {
      resolve({ success: false, error: 'CSPR.click is not initialized' });
      return;
    }

    const handleStatusUpdate = (status: string, data: any) => {
      console.log('Transaction status:', status, data);

      if (onStatusUpdate) {
        onStatusUpdate(status, data);
      }

      if (status === TransactionStatus.PROCESSED) {
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

      if (status === TransactionStatus.CANCELLED) {
        resolve({ success: false, error: 'Transaction cancelled by user' });
      }

      if (status === TransactionStatus.ERROR || status === TransactionStatus.TIMEOUT) {
        resolve({
          success: false,
          error: data?.error || data?.errorData || 'Transaction failed',
        });
      }
    };

    try {
      window.csprclick.send(
        transaction as any,
        senderPublicKey,
        handleStatusUpdate
      );
    } catch (err: any) {
      resolve({ success: false, error: err?.message || 'Failed to send transaction' });
    }
  });
};
