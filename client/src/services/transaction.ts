/**
 * Transaction Service for StakeVue V15
 *
 * Uses proxy_caller.wasm for all contract calls (stake, unstake, add_rewards)
 *
 * V15 Features:
 * - stake() payable - uses attached_value(), exchange rate aware
 * - unstake(amount: U256) - burns stCSPR and returns CSPR based on rate
 * - add_rewards() payable - owner can add rewards to increase exchange rate
 * - get_exchange_rate() - query current rate (1.0 = 1_000_000_000)
 * - Integrated SubModule<Cep18> token for stCSPR (mint/burn)
 * - Ownable module for admin control
 *
 * Based on:
 * - Odra Framework 2.4.0 proxy_caller pattern
 * - Casper SDK V5 patterns
 * - Official Casper liquid staking architecture
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
  CLTypeList,
  CLTypeUInt8,
  CLValueList,
} from 'casper-js-sdk';

// Get runtime config
const config = window.config;

// Cache for proxy_caller.wasm bytes
let proxyCallerWasmCache: Uint8Array | null = null;

/**
 * Load proxy_caller.wasm from public folder
 */
const loadProxyCallerWasm = async (): Promise<Uint8Array> => {
  if (proxyCallerWasmCache) {
    return proxyCallerWasmCache;
  }

  const response = await fetch('/proxy_caller.wasm');
  if (!response.ok) {
    throw new Error('Failed to load proxy_caller.wasm');
  }

  const arrayBuffer = await response.arrayBuffer();
  proxyCallerWasmCache = new Uint8Array(arrayBuffer);
  return proxyCallerWasmCache;
};

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
 * Get package hash without 'hash-' prefix (for V8 Odra contracts)
 */
const getPackageHashHex = (): string => {
  const hash = config.contract_package_hash || '';
  return hash.startsWith('hash-') ? hash.substring(5) : hash;
};

/**
 * Convert hex string to Uint8Array
 */
const hexToBytes = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
};

/**
 * Convert Uint8Array to CLValue List<U8> (Bytes type in Casper)
 * This is needed because proxy_caller expects Bytes type, not ByteArray
 */
const bytesToCLList = (bytes: Uint8Array): CLValue => {
  // Create the List<U8> type
  const listType = new CLTypeList(CLTypeUInt8);

  // Create elements as CLValue U8s
  const elements = Array.from(bytes).map(b => CLValue.newCLUint8(b));

  // Create CLValueList with proper type
  const listValue = new CLValueList(listType, elements);

  // Create CLValue with List type
  const clValue = new CLValue(listType);
  clValue.list = listValue;

  return clValue;
};

/**
 * Build a Stake Transaction using proxy_caller.wasm for V8 Odra contracts
 *
 * The stake() function in V8 is payable (#[odra(payable)]), which means
 * it receives CSPR via attached_value. We use proxy_caller.wasm to:
 * 1. Transfer CSPR from user's purse to a cargo purse
 * 2. Call the contract's stake() entry point
 * 3. The contract uses self.env().attached_value() to get the amount
 */
export const buildStakeTransaction = async (
  senderPublicKeyHex: string,
  amountCspr: string
): Promise<{ deploy: any }> => {
  // Validate inputs
  if (!senderPublicKeyHex) {
    throw new Error('Sender public key is required');
  }

  if (!config.contract_package_hash) {
    throw new Error('Contract package hash not configured');
  }

  // Load proxy_caller.wasm
  const proxyCallerWasm = await loadProxyCallerWasm();

  // Convert amounts
  const amountMotes = csprToMotes(amountCspr);
  // Payment = gas cost + attached value (CSPR being staked)
  const gasMotes = config.transaction_payment || '5000000000'; // 5 CSPR for gas
  const totalPayment = (BigInt(gasMotes) + BigInt(amountMotes)).toString();

  // Build empty RuntimeArgs for stake() - it uses attached_value instead
  const stakeArgs = Args.fromMap({});
  const serializedArgs = stakeArgs.toBytes();

  // Build proxy_caller arguments
  // See: odra-casper/proxy-caller/src/lib.rs
  // Note: args must be passed as List<U8> (Bytes type in Casper)
  const proxyArgs = Args.fromMap({
    // Package hash of the StakeVue contract (32 bytes as ByteArray)
    package_hash: CLValue.newCLByteArray(hexToBytes(getPackageHashHex())),
    // Entry point to call
    entry_point: CLValue.newCLString('stake'),
    // Serialized RuntimeArgs as Bytes (List<U8>)
    args: bytesToCLList(serializedArgs),
    // Amount of CSPR to attach (this is what stake() will receive)
    attached_value: CLValue.newCLUInt512(amountMotes),
    // Special Casper argument to allow access to main purse (must equal attached_value)
    amount: CLValue.newCLUInt512(amountMotes),
  });

  // Build session using ModuleBytes with proxy_caller.wasm
  const session = ExecutableDeployItem.newModuleBytes(proxyCallerWasm, proxyArgs);

  // Build deploy header
  const deployHeader = DeployHeader.default();
  deployHeader.account = PublicKey.fromHex(senderPublicKeyHex);
  deployHeader.chainName = config.chain_name || 'casper-test';
  deployHeader.gasPrice = 1;

  // Build payment (includes both gas and attached value)
  const payment = ExecutableDeployItem.standardPayment(totalPayment);

  // Create deploy
  const deploy = Deploy.makeDeploy(deployHeader, payment, session);

  // Serialize deploy for CSPR.click
  return { deploy: Deploy.toJSON(deploy) };
};

/**
 * Build an Unstake Transaction using proxy_caller.wasm for V8 Odra contracts
 *
 * The unstake() function takes an amount parameter and returns CSPR to the caller.
 * We use proxy_caller.wasm to call versioned contracts properly.
 */
export const buildUnstakeTransaction = async (
  senderPublicKeyHex: string,
  amountCspr: string
): Promise<{ deploy: any }> => {
  // Validate inputs
  if (!senderPublicKeyHex) {
    throw new Error('Sender public key is required');
  }

  if (!config.contract_package_hash) {
    throw new Error('Contract package hash not configured');
  }

  // Load proxy_caller.wasm
  const proxyCallerWasm = await loadProxyCallerWasm();

  // Convert amounts
  const amountMotes = csprToMotes(amountCspr);
  const paymentMotes = config.transaction_payment || '5000000000';

  // Build RuntimeArgs for unstake(amount: U512) - V8.2 uses U512
  const unstakeArgs = Args.fromMap({
    amount: CLValue.newCLUInt512(amountMotes),
  });
  const serializedArgs = unstakeArgs.toBytes();

  // Build proxy_caller arguments
  const proxyArgs = Args.fromMap({
    // Package hash of the StakeVue contract (32 bytes)
    package_hash: CLValue.newCLByteArray(hexToBytes(getPackageHashHex())),
    // Entry point to call
    entry_point: CLValue.newCLString('unstake'),
    // Serialized RuntimeArgs as Bytes (List<U8>)
    args: bytesToCLList(serializedArgs),
    // No attached value for unstake
    attached_value: CLValue.newCLUInt512('0'),
    // Special Casper argument (0 for non-payable calls)
    amount: CLValue.newCLUInt512('0'),
  });

  // Build session using ModuleBytes with proxy_caller.wasm
  const session = ExecutableDeployItem.newModuleBytes(proxyCallerWasm, proxyArgs);

  // Build deploy header
  const deployHeader = DeployHeader.default();
  deployHeader.account = PublicKey.fromHex(senderPublicKeyHex);
  deployHeader.chainName = config.chain_name || 'casper-test';
  deployHeader.gasPrice = 1;

  // Build payment
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
 * Build an Add Rewards Transaction using proxy_caller.wasm (Owner only)
 *
 * The add_rewards() function is payable and owner-only. It adds CSPR to the pool
 * without minting new stCSPR, effectively increasing the exchange rate.
 * This simulates validator rewards distribution.
 */
export const buildAddRewardsTransaction = async (
  senderPublicKeyHex: string,
  amountCspr: string
): Promise<{ deploy: any }> => {
  // Validate inputs
  if (!senderPublicKeyHex) {
    throw new Error('Sender public key is required');
  }

  if (!config.contract_package_hash) {
    throw new Error('Contract package hash not configured');
  }

  // Load proxy_caller.wasm
  const proxyCallerWasm = await loadProxyCallerWasm();

  // Convert amounts
  const amountMotes = csprToMotes(amountCspr);
  // Payment = gas cost + attached value (rewards being added)
  const gasMotes = config.add_rewards_payment || '10000000000'; // 10 CSPR for gas
  const totalPayment = (BigInt(gasMotes) + BigInt(amountMotes)).toString();

  // Build empty RuntimeArgs for add_rewards() - it uses attached_value
  const rewardsArgs = Args.fromMap({});
  const serializedArgs = rewardsArgs.toBytes();

  // Build proxy_caller arguments
  const proxyArgs = Args.fromMap({
    // Package hash of the StakeVue contract (32 bytes as ByteArray)
    package_hash: CLValue.newCLByteArray(hexToBytes(getPackageHashHex())),
    // Entry point to call
    entry_point: CLValue.newCLString('add_rewards'),
    // Serialized RuntimeArgs as Bytes (List<U8>)
    args: bytesToCLList(serializedArgs),
    // Amount of CSPR to attach (this is what add_rewards() will receive)
    attached_value: CLValue.newCLUInt512(amountMotes),
    // Special Casper argument to allow access to main purse
    amount: CLValue.newCLUInt512(amountMotes),
  });

  // Build session using ModuleBytes with proxy_caller.wasm
  const session = ExecutableDeployItem.newModuleBytes(proxyCallerWasm, proxyArgs);

  // Build deploy header
  const deployHeader = DeployHeader.default();
  deployHeader.account = PublicKey.fromHex(senderPublicKeyHex);
  deployHeader.chainName = config.chain_name || 'casper-test';
  deployHeader.gasPrice = 1;

  // Build payment (includes both gas and attached value)
  const payment = ExecutableDeployItem.standardPayment(totalPayment);

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
