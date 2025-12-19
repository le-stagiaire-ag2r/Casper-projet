/**
 * Transaction Service for StakeVue V17
 *
 * Uses proxy_caller.wasm for all contract calls (stake, request_unstake, claim_withdrawal, harvest_rewards)
 *
 * V17 Features:
 * - stake(validator: PublicKey) payable - user chooses validator
 * - request_unstake(amount: U256, validator: PublicKey) - queues withdrawal (7 eras unbonding)
 * - claim_withdrawal(request_id: U64) - claim after unbonding period
 * - harvest_rewards() - owner function for auto-compounding
 * - Multi-validator support (up to 20 validators)
 * - Min stake: 500 CSPR for first delegation to a validator
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
 * Build a Stake Transaction using proxy_caller.wasm for V17 Odra contracts
 *
 * V17 stake(validator: PublicKey) is payable (#[odra(payable)]), which means
 * it receives CSPR via attached_value. We use proxy_caller.wasm to:
 * 1. Transfer CSPR from user's purse to a cargo purse
 * 2. Call the contract's stake(validator) entry point
 * 3. The contract uses self.env().attached_value() to get the amount
 *
 * @param senderPublicKeyHex - The sender's public key in hex format
 * @param amountCspr - Amount in CSPR to stake
 * @param validatorPublicKeyHex - The validator's public key to stake with
 */
export const buildStakeTransaction = async (
  senderPublicKeyHex: string,
  amountCspr: string,
  validatorPublicKeyHex: string
): Promise<{ deploy: any }> => {
  // Validate inputs
  if (!senderPublicKeyHex) {
    throw new Error('Sender public key is required');
  }

  if (!validatorPublicKeyHex) {
    throw new Error('Validator public key is required');
  }

  if (!config.contract_package_hash) {
    throw new Error('Contract package hash not configured');
  }

  // Load proxy_caller.wasm
  const proxyCallerWasm = await loadProxyCallerWasm();

  // Convert amounts
  const amountMotes = csprToMotes(amountCspr);
  // Payment = gas cost + attached value (CSPR being staked)
  // V17 needs more gas for delegation (~15 CSPR)
  const gasMotes = config.transaction_payment || '15000000000'; // 15 CSPR for gas
  const totalPayment = (BigInt(gasMotes) + BigInt(amountMotes)).toString();

  // Build RuntimeArgs for stake(validator: PublicKey)
  // Serialize the validator public key
  const validatorPubKey = PublicKey.fromHex(validatorPublicKeyHex);
  const stakeArgs = Args.fromMap({
    validator: CLValue.newCLPublicKey(validatorPubKey),
  });
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
 * Manually serialize a U256 value to Casper bytesrepr format
 * Format: 1 byte length (0-32) + little-endian bytes (no leading zeros)
 */
const serializeU256 = (value: bigint): Uint8Array => {
  if (value === 0n) {
    return new Uint8Array([0]); // Zero is serialized as just 0x00
  }

  // Convert to little-endian bytes
  const bytes: number[] = [];
  let remaining = value;
  while (remaining > 0n) {
    bytes.push(Number(remaining & 0xffn));
    remaining = remaining >> 8n;
  }

  // Prepend length byte
  return new Uint8Array([bytes.length, ...bytes]);
};

/**
 * Manually serialize RuntimeArgs for request_unstake(stcspr_amount: U256)
 * This avoids potential SDK serialization issues
 */
const serializeUnstakeArgs = (stcsprAmount: bigint): Uint8Array => {
  // Serialize the U256 value
  const u256Bytes = serializeU256(stcsprAmount);

  // RuntimeArgs format:
  // - u32: number of args (1)
  // - For each arg:
  //   - String: arg name (u32 length + UTF-8 bytes)
  //   - CLValue: (u32 inner_bytes_len + inner_bytes + type_bytes)

  const argName = 'stcspr_amount';
  const argNameBytes = new TextEncoder().encode(argName);

  // Calculate sizes
  const innerBytesLen = u256Bytes.length;
  const typeBytes = [8]; // U256 type tag is 8

  // Total size calculation:
  // 4 (num args) + 4 (name len) + argNameBytes.length + 4 (inner len) + innerBytesLen + typeBytes.length
  const totalSize = 4 + 4 + argNameBytes.length + 4 + innerBytesLen + typeBytes.length;

  const buffer = new Uint8Array(totalSize);
  let offset = 0;

  // Number of args (u32 little-endian)
  buffer[offset++] = 1;
  buffer[offset++] = 0;
  buffer[offset++] = 0;
  buffer[offset++] = 0;

  // Arg name length (u32 little-endian)
  buffer[offset++] = argNameBytes.length;
  buffer[offset++] = 0;
  buffer[offset++] = 0;
  buffer[offset++] = 0;

  // Arg name bytes
  buffer.set(argNameBytes, offset);
  offset += argNameBytes.length;

  // CLValue inner bytes length (u32 little-endian)
  buffer[offset++] = innerBytesLen;
  buffer[offset++] = 0;
  buffer[offset++] = 0;
  buffer[offset++] = 0;

  // CLValue inner bytes (the U256 serialization)
  buffer.set(u256Bytes, offset);
  offset += innerBytesLen;

  // CLType bytes (U256 = 8)
  buffer.set(typeBytes, offset);

  return buffer;
};

/**
 * Build a Request Unstake Transaction using proxy_caller.wasm for V20
 *
 * V20 uses pool-based architecture: request_unstake only burns stCSPR,
 * NO validator parameter needed (admin handles undelegation separately).
 *
 * Uses manual RuntimeArgs serialization to avoid SDK compatibility issues.
 *
 * @param senderPublicKeyHex - The sender's public key in hex format
 * @param amountStCspr - Amount of stCSPR to unstake (as string, will be converted to U256)
 * @param _validatorPublicKeyHex - IGNORED in V20 (kept for backwards compatibility)
 */
export const buildUnstakeTransaction = async (
  senderPublicKeyHex: string,
  amountStCspr: string,
  _validatorPublicKeyHex?: string // Ignored in V20
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

  // Convert stCSPR to internal units (like motes but for stCSPR - 9 decimals)
  const amountUnits = BigInt(csprToMotes(amountStCspr));
  const paymentMotes = config.transaction_payment || '10000000000'; // 10 CSPR for gas

  // Manually serialize RuntimeArgs to avoid SDK issues
  const serializedArgs = serializeUnstakeArgs(amountUnits);

  // Build proxy_caller arguments
  const proxyArgs = Args.fromMap({
    // Package hash of the StakeVue contract (32 bytes)
    package_hash: CLValue.newCLByteArray(hexToBytes(getPackageHashHex())),
    // Entry point to call
    entry_point: CLValue.newCLString('request_unstake'),
    // Manually serialized RuntimeArgs as Bytes (List<U8>)
    args: bytesToCLList(serializedArgs),
    // No attached value for unstake (non-payable)
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
 * Manually serialize a u64 value to Casper bytesrepr format
 * Format: 8 bytes little-endian
 */
const serializeU64 = (value: bigint): Uint8Array => {
  const bytes = new Uint8Array(8);
  let remaining = value;
  for (let i = 0; i < 8; i++) {
    bytes[i] = Number(remaining & 0xffn);
    remaining = remaining >> 8n;
  }
  return bytes;
};

/**
 * Manually serialize RuntimeArgs for claim_withdrawal(request_id: u64)
 */
const serializeClaimArgs = (requestId: bigint): Uint8Array => {
  // Serialize the u64 value
  const u64Bytes = serializeU64(requestId);

  const argName = 'request_id';
  const argNameBytes = new TextEncoder().encode(argName);

  // Calculate sizes
  const innerBytesLen = u64Bytes.length; // 8 bytes for u64
  const typeBytes = [5]; // U64 type tag is 5

  const totalSize = 4 + 4 + argNameBytes.length + 4 + innerBytesLen + typeBytes.length;

  const buffer = new Uint8Array(totalSize);
  let offset = 0;

  // Number of args (u32 little-endian)
  buffer[offset++] = 1;
  buffer[offset++] = 0;
  buffer[offset++] = 0;
  buffer[offset++] = 0;

  // Arg name length (u32 little-endian)
  buffer[offset++] = argNameBytes.length;
  buffer[offset++] = 0;
  buffer[offset++] = 0;
  buffer[offset++] = 0;

  // Arg name bytes
  buffer.set(argNameBytes, offset);
  offset += argNameBytes.length;

  // CLValue inner bytes length (u32 little-endian)
  buffer[offset++] = innerBytesLen;
  buffer[offset++] = 0;
  buffer[offset++] = 0;
  buffer[offset++] = 0;

  // CLValue inner bytes (the u64 serialization)
  buffer.set(u64Bytes, offset);
  offset += innerBytesLen;

  // CLType bytes (U64 = 5)
  buffer.set(typeBytes, offset);

  return buffer;
};

/**
 * Build a Claim Withdrawal Transaction using proxy_caller.wasm for V20
 *
 * After the unbonding period (7 eras), user can claim their CSPR.
 * Uses proxy_caller to call versioned contract via package hash.
 *
 * @param senderPublicKeyHex - The sender's public key in hex format
 * @param requestId - The withdrawal request ID returned by request_unstake
 */
export const buildClaimWithdrawalTransaction = async (
  senderPublicKeyHex: string,
  requestId: number
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

  const paymentMotes = config.transaction_payment || '5000000000'; // 5 CSPR for gas

  // Manually serialize RuntimeArgs to avoid SDK issues
  const serializedArgs = serializeClaimArgs(BigInt(requestId));

  // Build proxy_caller arguments
  const proxyArgs = Args.fromMap({
    package_hash: CLValue.newCLByteArray(hexToBytes(getPackageHashHex())),
    entry_point: CLValue.newCLString('claim_withdrawal'),
    args: bytesToCLList(serializedArgs),
    attached_value: CLValue.newCLUInt512('0'),
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
