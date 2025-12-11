import type { VercelRequest, VercelResponse } from '@vercel/node';

// Casper RPC endpoint (testnet)
const RPC_URL = 'https://rpc.testnet.casperlabs.io/rpc';
// V15 Contract Package Hash
const CONTRACT_PACKAGE_HASH = '2b6c14a2cac5cfe4a1fd1efc2fc02b1090dbc3a6b661a329b90c829245540985';
// Rate precision (9 decimals)
const RATE_PRECISION = 1_000_000_000;

/**
 * API endpoint to fetch StakeVue V15 contract stats
 *
 * Returns: exchange rate, total pool, stCSPR supply
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // Cache for 30 seconds
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get the state root hash first
    const stateRootHash = await getStateRootHash();

    // Try to query contract state using different methods
    let stats = await queryContractState(stateRootHash);

    // If direct state query fails, try to get from events
    if (!stats.success) {
      stats = await getStatsFromEvents();
    }

    return res.status(200).json({
      exchangeRate: stats.exchangeRate,
      totalPool: stats.totalPool,
      totalStcspr: stats.totalStcspr,
      exchangeRateFormatted: (stats.exchangeRate / RATE_PRECISION).toFixed(4),
      totalPoolCspr: stats.totalPool / RATE_PRECISION,
      totalStcsprFormatted: stats.totalStcspr / RATE_PRECISION,
      timestamp: new Date().toISOString(),
      source: stats.source,
      contractHash: CONTRACT_PACKAGE_HASH,
    });
  } catch (error: any) {
    console.error('Contract stats API error:', error);

    // Return default values on error
    return res.status(200).json({
      exchangeRate: RATE_PRECISION, // 1.0
      totalPool: 0,
      totalStcspr: 0,
      exchangeRateFormatted: '1.0000',
      totalPoolCspr: 0,
      totalStcsprFormatted: 0,
      timestamp: new Date().toISOString(),
      source: 'default',
      error: error.message,
    });
  }
}

/**
 * Get current state root hash from the blockchain
 */
async function getStateRootHash(): Promise<string> {
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'chain_get_state_root_hash',
      params: {},
    }),
  });

  const data = await response.json();
  return data.result?.state_root_hash || '';
}

/**
 * Try to query contract state directly
 */
async function queryContractState(stateRootHash: string): Promise<{
  success: boolean;
  exchangeRate: number;
  totalPool: number;
  totalStcspr: number;
  source: string;
}> {
  try {
    // Query the contract package to find the latest contract hash
    const contractKey = `hash-${CONTRACT_PACKAGE_HASH}`;

    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'query_global_state',
        params: {
          state_identifier: { StateRootHash: stateRootHash },
          key: contractKey,
          path: [],
        },
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.log('Contract query error:', data.error);
      return { success: false, exchangeRate: RATE_PRECISION, totalPool: 0, totalStcspr: 0, source: 'error' };
    }

    // Parse the contract state - look for named keys
    const storedValue = data.result?.stored_value;

    if (storedValue?.Package) {
      // This is a contract package, we need to find the active contract version
      console.log('Found contract package');

      // Try to get the contract's account info for purse balance
      const purseBalance = await getContractPurseBalance(stateRootHash, storedValue);

      if (purseBalance !== null) {
        return {
          success: true,
          exchangeRate: RATE_PRECISION, // We'd need more info to calculate actual rate
          totalPool: purseBalance,
          totalStcspr: purseBalance, // Approximation
          source: 'purse_balance',
        };
      }
    }

    return { success: false, exchangeRate: RATE_PRECISION, totalPool: 0, totalStcspr: 0, source: 'no_data' };
  } catch (error) {
    console.error('Query error:', error);
    return { success: false, exchangeRate: RATE_PRECISION, totalPool: 0, totalStcspr: 0, source: 'error' };
  }
}

/**
 * Try to get contract purse balance
 */
async function getContractPurseBalance(stateRootHash: string, packageData: any): Promise<number | null> {
  try {
    // Look for the contract's main purse in named keys
    // This is a simplified approach
    return null;
  } catch {
    return null;
  }
}

/**
 * Fallback: Try to get stats from contract events on CSPR.live
 */
async function getStatsFromEvents(): Promise<{
  success: boolean;
  exchangeRate: number;
  totalPool: number;
  totalStcspr: number;
  source: string;
}> {
  try {
    // Query recent deploys to this contract to find Staked/Unstaked/RewardsAdded events
    // This is a fallback approach

    // For now, we can try to query cspr.live API for contract transfers
    const response = await fetch(
      `https://testnet.cspr.live/contract/${CONTRACT_PACKAGE_HASH}`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (!response.ok) {
      return { success: false, exchangeRate: RATE_PRECISION, totalPool: 0, totalStcspr: 0, source: 'events_failed' };
    }

    // Parse transfers to calculate TVL
    // This is a simplified approach - in production we'd parse actual events

    return { success: false, exchangeRate: RATE_PRECISION, totalPool: 0, totalStcspr: 0, source: 'events_not_implemented' };
  } catch (error) {
    return { success: false, exchangeRate: RATE_PRECISION, totalPool: 0, totalStcspr: 0, source: 'events_error' };
  }
}
