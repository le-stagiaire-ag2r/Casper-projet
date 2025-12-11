/**
 * Contract Reader Service - V15 Live Data
 *
 * Reads contract state directly from Casper blockchain RPC
 * to get real-time exchange rate, pool, and supply values.
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
    // First get the contract hash from the package
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

  // Handle different formats
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
 * Read contract state from blockchain
 */
export async function readContractState(): Promise<ContractState> {
  try {
    const stateRootHash = await getStateRootHash();

    // Query exchange_rate, total_cspr_pool, and total_stcspr_supply
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
    };
  } catch (err) {
    console.error('Failed to read contract state:', err);

    // Return default values on error
    return {
      exchangeRate: 1.0,
      totalPool: '0',
      totalStcspr: '0',
      lastUpdated: new Date(),
    };
  }
}

/**
 * Read user's stCSPR balance from the CEP-18 token contract
 */
export async function readUserStCsprBalance(accountHash: string): Promise<string> {
  try {
    const stateRootHash = await getStateRootHash();

    // The stCSPR balance is stored in a dictionary under the contract
    // Dictionary key is the account hash
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
    // User might not have any stCSPR
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

  const totalPoolCspr = Number(BigInt(state.totalPool)) / 1_000_000_000;
  const totalStcsprSupply = Number(BigInt(state.totalStcspr)) / 1_000_000_000;

  // Rough USD estimate (use actual price feed in production)
  const csprPrice = 0.0053; // From config or API
  const tvlUsd = totalPoolCspr * csprPrice;

  return {
    exchangeRate: state.exchangeRate,
    totalPoolCspr,
    totalStcsprSupply,
    tvlUsd,
  };
}

export default {
  readContractState,
  readUserStCsprBalance,
  getContractStats,
};
