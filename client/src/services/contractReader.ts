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
 */
async function readFromRPC(): Promise<ContractState> {
  const stateRootHash = await getStateRootHash();

  // Query contract named keys
  const [exchangeRateValue, poolValue, supplyValue] = await Promise.all([
    queryContractKey(stateRootHash, 'exchange_rate'),
    queryContractKey(stateRootHash, 'total_cspr_pool'),
    queryContractKey(stateRootHash, 'total_stcspr_supply'),
  ]);

  // Parse values
  const exchangeRateRaw = parseU512(exchangeRateValue);
  const totalPool = parseU512(poolValue);
  const totalStcspr = parseU512(supplyValue);

  // Convert exchange rate from fixed point to float
  const exchangeRate = Number(BigInt(exchangeRateRaw || RATE_PRECISION.toString())) / RATE_PRECISION;

  return {
    exchangeRate: exchangeRate || 1.0,
    totalPool: totalPool || '0',
    totalStcspr: totalStcspr || '0',
    lastUpdated: new Date(),
    source: 'rpc',
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

export default {
  readContractState,
  readUserStCsprBalance,
  getContractStats,
  getUserWithdrawals,
};
