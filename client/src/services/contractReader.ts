/**
 * Contract Reader Service - V16 Live Data
 *
 * Reads contract state via backend API for reliable data.
 * Falls back to direct RPC queries if API is unavailable.
 */

const config = (window as any).config || {};
const RPC_URL = config.rpc_url || 'https://rpc.testnet.casperlabs.io/rpc';
const CONTRACT_PACKAGE_HASH = config.contract_package_hash || '';
const RATE_PRECISION = config.rate_precision || 1_000_000_000;

export interface ContractState {
  exchangeRate: number;
  totalPool: string; // in motes
  totalStcspr: string; // in motes
  lastUpdated: Date;
  source?: string;
}

/**
 * Read contract state - tries API first, falls back to RPC
 */
export async function readContractState(): Promise<ContractState> {
  // Try the backend API first (more reliable)
  try {
    const apiResult = await readFromAPI();
    if (apiResult.exchangeRate > 0) {
      return apiResult;
    }
  } catch (err) {
    console.warn('API fetch failed, trying direct RPC:', err);
  }

  // Fallback to direct RPC
  try {
    return await readFromRPC();
  } catch (err) {
    console.error('All contract read methods failed:', err);
    return {
      exchangeRate: 1.0,
      totalPool: '0',
      totalStcspr: '0',
      lastUpdated: new Date(),
      source: 'default',
    };
  }
}

/**
 * Read from backend API (Vercel serverless function)
 */
async function readFromAPI(): Promise<ContractState> {
  const response = await fetch('/api/contract-stats', {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }

  const data = await response.json();

  // Convert from API format
  const exchangeRate = data.exchangeRate
    ? Number(data.exchangeRate) / RATE_PRECISION
    : parseFloat(data.exchangeRateFormatted) || 1.0;

  const totalPool = data.totalPool
    ? data.totalPool.toString()
    : Math.floor((data.totalPoolCspr || 0) * RATE_PRECISION).toString();

  const totalStcspr = data.totalStcspr
    ? data.totalStcspr.toString()
    : Math.floor((data.totalStcsprFormatted || 0) * RATE_PRECISION).toString();

  return {
    exchangeRate,
    totalPool,
    totalStcspr,
    lastUpdated: new Date(data.timestamp || Date.now()),
    source: data.source || 'api',
  };
}

/**
 * Read directly from Casper RPC (fallback)
 * Queries the contract's main purse balance directly
 */
async function readFromRPC(): Promise<ContractState> {
  // V22 Contract purse URef
  const PURSE_UREF = 'uref-3e8ff29a521e5902bcfc106c2e1fe94aa29fa8a6246ed1fe375d350f5d34f6e2-007';

  const stateRootHash = await getStateRootHash();

  // Try to get purse balance directly
  let totalPool = '0';

  try {
    const balanceResult = await rpcCall('state_get_balance', {
      state_root_hash: stateRootHash,
      purse_uref: PURSE_UREF,
    });

    if (balanceResult?.balance_value) {
      totalPool = balanceResult.balance_value;
    }
  } catch (e) {
    console.warn('state_get_balance failed, trying query_balance:', e);

    // Try newer query_balance method
    try {
      const queryResult = await rpcCall('query_balance', {
        purse_identifier: { purse_uref: PURSE_UREF },
        state_identifier: { StateRootHash: stateRootHash },
      });

      if (queryResult?.balance) {
        totalPool = queryResult.balance;
      }
    } catch (e2) {
      console.warn('query_balance also failed:', e2);
    }
  }

  return {
    exchangeRate: 1.0,
    totalPool: totalPool,
    totalStcspr: totalPool,
    lastUpdated: new Date(),
    source: 'rpc_direct',
  };
}

/**
 * Make a JSON-RPC call to the Casper node
 */
async function rpcCall(method: string, params: any): Promise<any> {
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || 'RPC Error');
  }

  return data.result;
}

/**
 * Get the latest state root hash
 */
async function getStateRootHash(): Promise<string> {
  const result = await rpcCall('chain_get_state_root_hash', {});
  return result.state_root_hash;
}

/**
 * Query a named key from the contract
 */
async function queryContractKey(stateRootHash: string, key: string): Promise<any> {
  try {
    const contractKey = `hash-${CONTRACT_PACKAGE_HASH}`;

    const result = await rpcCall('query_global_state', {
      state_identifier: {
        StateRootHash: stateRootHash,
      },
      key: contractKey,
      path: [key],
    });

    return result.stored_value;
  } catch (err) {
    console.warn(`Failed to query ${key}:`, err);
    return null;
  }
}

/**
 * Parse a CLValue U512 to string
 */
function parseU512(clValue: any): string {
  if (!clValue) return '0';

  if (clValue.CLValue) {
    const parsed = clValue.CLValue.parsed;
    if (typeof parsed === 'string') return parsed;
    if (typeof parsed === 'number') return parsed.toString();
  }

  if (typeof clValue === 'string') return clValue;
  if (typeof clValue === 'number') return clValue.toString();

  return '0';
}

/**
 * Read user's stCSPR balance from the CEP-18 token contract
 */
export async function readUserStCsprBalance(accountHash: string): Promise<string> {
  try {
    const stateRootHash = await getStateRootHash();
    const cleanHash = accountHash.replace('account-hash-', '');

    const result = await rpcCall('state_get_dictionary_item', {
      state_root_hash: stateRootHash,
      dictionary_identifier: {
        ContractNamedKey: {
          key: `hash-${CONTRACT_PACKAGE_HASH}`,
          dictionary_name: 'balances',
          dictionary_item_key: cleanHash,
        },
      },
    });

    if (result?.stored_value?.CLValue?.parsed) {
      return result.stored_value.CLValue.parsed.toString();
    }

    return '0';
  } catch (err) {
    console.warn('Failed to read stCSPR balance:', err);
    return '0';
  }
}

/**
 * Get formatted contract stats
 */
export async function getContractStats(): Promise<{
  exchangeRate: number;
  totalPoolCspr: number;
  totalStcsprSupply: number;
  tvlUsd: number;
}> {
  const state = await readContractState();

  const totalPoolCspr = Number(BigInt(state.totalPool || '0')) / 1_000_000_000;
  const totalStcsprSupply = Number(BigInt(state.totalStcspr || '0')) / 1_000_000_000;

  // Rough USD estimate
  const csprPrice = 0.0053;
  const tvlUsd = totalPoolCspr * csprPrice;

  return {
    exchangeRate: state.exchangeRate,
    totalPoolCspr,
    totalStcsprSupply,
    tvlUsd,
  };
}

/**
 * Withdrawal request info
 */
export interface WithdrawalInfo {
  requestId: number;
  csprAmount: number; // in CSPR
  isReady: boolean;
  isClaimed: boolean;
  requestBlock: number;
  estimatedReadyTime: Date;
}

/**
 * Read user's withdrawal requests
 */
export async function getUserWithdrawals(accountHash: string): Promise<WithdrawalInfo[]> {
  try {
    const response = await fetch(`/api/withdrawals?account=${encodeURIComponent(accountHash)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      console.warn('Withdrawals API returned', response.status);
      return [];
    }

    const data = await response.json();
    return data.withdrawals || [];
  } catch (err) {
    console.warn('Failed to fetch withdrawals:', err);
    return [];
  }
}

/**
 * Read next_request_id from contract
 * This is the ID that will be assigned to the next withdrawal request
 */
export async function getNextRequestId(): Promise<number> {
  try {
    const stateRootHash = await getStateRootHash();
    const value = await queryContractKey(stateRootHash, 'next_request_id');

    if (value?.CLValue?.parsed) {
      return parseInt(value.CLValue.parsed.toString(), 10);
    }

    // Fallback: try API
    const response = await fetch('/api/contract-stats', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.nextRequestId) {
        return parseInt(data.nextRequestId.toString(), 10);
      }
    }

    return 1; // Default if nothing found
  } catch (err) {
    console.warn('Failed to read next_request_id:', err);
    return 1;
  }
}

/**
 * Extract request_id from a confirmed unstake transaction
 * Fetches transaction details and parses the UnstakeRequested event
 */
export async function getRequestIdFromTransaction(deployHash: string): Promise<number | null> {
  const maxAttempts = 30; // Wait up to 5 minutes (10s intervals)
  const pollInterval = 10000; // 10 seconds

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Try CSPR.live API first (more reliable)
      const explorerUrl = config.cspr_live_url || 'https://testnet.cspr.live';
      const apiBase = explorerUrl.includes('testnet')
        ? 'https://event-store-api-clarity-testnet.make.services'
        : 'https://event-store-api-clarity-mainnet.make.services';

      const response = await fetch(`${apiBase}/deploys/${deployHash}`, {
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();

        // Check if transaction is confirmed
        if (data.execution_results && data.execution_results.length > 0) {
          const execResult = data.execution_results[0];

          // Look for request_id in transforms/effects
          if (execResult.result?.Success?.effect?.transforms) {
            for (const transform of execResult.result.Success.effect.transforms) {
              // Look for dictionary writes that contain UnstakeRequested event
              if (transform.transform?.WriteCLValue?.bytes) {
                const bytes = transform.transform.WriteCLValue.bytes;
                // Check if this contains "event_UnstakeRequested" (hex encoded)
                if (bytes.includes('6576656e745f556e7374616b6552657175657374656')) {
                  // Parse the request_id from the event bytes
                  // The request_id is a u64 little-endian value after the staker address
                  const requestIdMatch = bytes.match(/0026d3a742[a-f0-9]{56}([a-f0-9]{16})/);
                  if (requestIdMatch) {
                    const hexBytes = requestIdMatch[1];
                    // Convert little-endian hex to number
                    const requestId = parseInt(hexBytes.match(/.{2}/g)!.reverse().join(''), 16);
                    console.log('Extracted request_id from transaction:', requestId);
                    return requestId;
                  }
                }
              }
            }
          }
        }
      }

      // Fallback: Try RPC directly
      const rpcResult = await rpcCall('info_get_deploy', { deploy_hash: deployHash });

      if (rpcResult?.execution_results?.[0]?.result?.Success) {
        const effects = rpcResult.execution_results[0].result.Success.effect?.transforms || [];

        for (const effect of effects) {
          if (effect.transform?.WriteCLValue?.bytes) {
            const bytes = effect.transform.WriteCLValue.bytes;
            // Look for UnstakeRequested event pattern
            if (bytes.includes('6576656e745f556e7374616b6552657175657374656')) {
              // Extract u64 request_id (8 bytes after address)
              // Pattern: event name + staker address (32 bytes) + request_id (8 bytes)
              const eventStart = bytes.indexOf('6576656e745f556e7374616b6552657175657374656');
              if (eventStart !== -1) {
                // Skip event name and staker, get request_id bytes
                const afterEvent = bytes.substring(eventStart + 100); // rough offset
                const requestIdHex = afterEvent.substring(0, 16);
                if (requestIdHex.length === 16) {
                  const requestId = parseInt(requestIdHex.match(/.{2}/g)!.reverse().join(''), 16);
                  console.log('Extracted request_id from RPC:', requestId);
                  return requestId;
                }
              }
            }
          }
        }
      }

      // If transaction not yet confirmed, wait and retry
      if (attempt < maxAttempts - 1) {
        console.log(`Waiting for transaction confirmation... (attempt ${attempt + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    } catch (err) {
      console.warn('Error fetching transaction:', err);
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }
  }

  console.warn('Could not extract request_id from transaction after max attempts');
  return null;
}

/**
 * Parse request_id from raw transaction effects (for use with cspr.live data)
 */
export function parseRequestIdFromEffects(effects: any[]): number | null {
  for (const effect of effects) {
    // Look for dictionary writes containing UnstakeRequested event
    if (effect.kind?.Write?.CLValue?.bytes) {
      const bytes = effect.kind.Write.CLValue.bytes as string;

      // UnstakeRequested event contains: staker address + request_id (u64) + amounts
      // The event identifier is "event_UnstakeRequested" = 6576656e745f556e7374616b6552657175657374656
      if (bytes.includes('6576656e745f556e7374616b6552657175657374656')) {
        // Find the request_id in the bytes
        // Structure: event_type_len(4) + event_type + staker(33) + request_id(8) + amounts
        try {
          // The request_id is after the staker address (account-hash format = 32 bytes + 1 byte prefix)
          // Look for pattern: 00 + 26d3a742... (account hash) followed by 8 bytes of request_id
          const stakerPattern = /0026d3a742[a-f0-9]{56}/;
          const match = bytes.match(stakerPattern);
          if (match) {
            const afterStaker = bytes.substring(bytes.indexOf(match[0]) + match[0].length);
            // Next 16 hex chars = 8 bytes = u64 request_id (little-endian)
            const requestIdHex = afterStaker.substring(0, 16);
            if (/^[0-9a-f]{16}$/.test(requestIdHex)) {
              // Convert little-endian to number
              const bytes = requestIdHex.match(/.{2}/g)!;
              const requestId = parseInt(bytes.reverse().join(''), 16);
              console.log('Parsed request_id from effects:', requestId);
              return requestId;
            }
          }
        } catch (e) {
          console.warn('Failed to parse request_id from bytes:', e);
        }
      }
    }
  }
  return null;
}

export interface ValidatorDelegation {
  publicKey: string;
  delegatedAmount: string; // in motes
  delegatedCspr?: number; // in CSPR
  isActive: boolean;
}

/**
 * Get delegation amounts for all approved validators
 * Returns an array of validators with their delegated amounts from the contract
 */
export async function getValidatorDelegations(): Promise<ValidatorDelegation[]> {
  const approvedValidators: string[] = config.approved_validators || [];

  if (approvedValidators.length === 0) {
    return [];
  }

  try {
    // Fetch from API
    const response = await fetch('/api/validator-delegations', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.delegations && Array.isArray(data.delegations)) {
        return data.delegations;
      }
    }
  } catch (err) {
    console.warn('Could not fetch validator delegations from API:', err);
  }

  // Fallback: return validators with unknown amounts
  return approvedValidators.map(pk => ({
    publicKey: pk,
    delegatedAmount: '0',
    delegatedCspr: 0,
    isActive: false,
  }));
}

/**
 * Get available liquidity from contract
 */
export async function getAvailableLiquidity(): Promise<string> {
  try {
    const response = await fetch('/api/contract-stats', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      return data.availableLiquidity?.toString() || '0';
    }
  } catch (err) {
    console.warn('Could not fetch available liquidity:', err);
  }
  return '0';
}

/**
 * Get pending undelegations from contract
 */
export async function getPendingUndelegations(): Promise<string> {
  try {
    const response = await fetch('/api/contract-stats', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      return data.pendingUndelegations?.toString() || '0';
    }
  } catch (err) {
    console.warn('Could not fetch pending undelegations:', err);
  }
  return '0';
}

export default {
  readContractState,
  readUserStCsprBalance,
  getContractStats,
  getUserWithdrawals,
  getNextRequestId,
  getRequestIdFromTransaction,
  parseRequestIdFromEffects,
  getValidatorDelegations,
  getAvailableLiquidity,
  getPendingUndelegations,
};
