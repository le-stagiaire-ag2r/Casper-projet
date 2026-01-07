import type { VercelRequest, VercelResponse } from '@vercel/node';

// Casper RPC endpoint (testnet)
const RPC_URL = 'https://rpc.testnet.casperlabs.io/rpc';
// V22 Contract Package Hash (Pool-based architecture with U512 fix)
const CONTRACT_PACKAGE_HASH = '2d6a399bca8c71bb007de1cbcd57c7d6a54dc0283376a08fe6024a33c02b0ad3';
// V22 Contract main purse URef (for direct balance query)
const CONTRACT_PURSE_UREF = 'uref-3e8ff29a521e5902bcfc106c2e1fe94aa29fa8a6246ed1fe375d350f5d34f6e2-007';
// Rate precision (9 decimals)
const RATE_PRECISION = 1_000_000_000;

// Odra storage key names (based on contract variables)
const ODRA_KEYS = {
  totalCsprPool: 'total_cspr_pool',
  // Token supply is stored in the CEP-18 submodule
  tokenTotalSupply: 'token:total_supply', // Odra submodule prefix
};

/**
 * API endpoint to fetch StakeVue V22 contract stats
 *
 * Returns: exchange rate, total pool, stCSPR supply
 * V22: Pool-based architecture (Wise Lending style)
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

    // Method 1: Try direct purse balance query (most reliable)
    let stats = await queryPurseBalance(stateRootHash);

    // Method 2: Try Odra contract state
    if (!stats.success) {
      stats = await queryOdraContractState(stateRootHash);
    }

    // Method 3: Try entity API if first method fails
    if (!stats.success) {
      stats = await queryEntityState(stateRootHash);
    }

    // Method 4: Try named keys approach
    if (!stats.success) {
      stats = await queryNamedKeys(stateRootHash);
    }

    // Final fallback - try CSPR.live API
    if (!stats.success) {
      stats = await getStatsFromExplorer();
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
      debug: stats.debug || null,
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

interface StatsResult {
  success: boolean;
  exchangeRate: number;
  totalPool: number;
  totalStcspr: number;
  source: string;
  debug?: any;
}

/**
 * Make a JSON-RPC call
 */
async function rpcCall(method: string, params: any): Promise<any> {
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    }),
  });
  return response.json();
}

/**
 * Get current state root hash from the blockchain
 */
async function getStateRootHash(): Promise<string> {
  const data = await rpcCall('chain_get_state_root_hash', {});
  return data.result?.state_root_hash || '';
}

/**
 * Query contract purse balance directly using URef
 * This is the most reliable method for V22 contracts
 */
async function queryPurseBalance(stateRootHash: string): Promise<StatsResult> {
  try {
    // Try query_balance with purse URef
    const balanceData = await rpcCall('query_balance', {
      purse_identifier: {
        purse_uref: CONTRACT_PURSE_UREF,
      },
      state_identifier: { StateRootHash: stateRootHash },
    });

    if (balanceData.result?.balance) {
      const balance = parseInt(balanceData.result.balance, 10);

      // For exchange rate, we need to also get stCSPR supply
      // Try to get it from token total_supply
      let totalStcspr = balance; // Default to same as pool

      // Try to query stCSPR supply from contract
      const supplyData = await rpcCall('query_global_state', {
        state_identifier: { StateRootHash: stateRootHash },
        key: `hash-${CONTRACT_PACKAGE_HASH}`,
        path: ['token', 'total_supply'],
      });

      if (supplyData.result?.stored_value?.CLValue?.parsed) {
        const supply = parseInt(supplyData.result.stored_value.CLValue.parsed, 10);
        if (supply > 0) {
          totalStcspr = supply;
        }
      }

      // Calculate exchange rate
      const exchangeRate = totalStcspr > 0
        ? Math.floor((balance * RATE_PRECISION) / totalStcspr)
        : RATE_PRECISION;

      return {
        success: true,
        exchangeRate,
        totalPool: balance,
        totalStcspr,
        source: 'purse_uref_balance',
      };
    }

    // Fallback: Try state_get_balance (older API)
    const legacyBalance = await rpcCall('state_get_balance', {
      purse_uref: CONTRACT_PURSE_UREF,
      state_root_hash: stateRootHash,
    });

    if (legacyBalance.result?.balance_value) {
      const balance = parseInt(legacyBalance.result.balance_value, 10);
      return {
        success: true,
        exchangeRate: RATE_PRECISION, // Assume 1:1 if we can't get supply
        totalPool: balance,
        totalStcspr: balance,
        source: 'legacy_balance',
      };
    }

    return {
      success: false,
      exchangeRate: RATE_PRECISION,
      totalPool: 0,
      totalStcspr: 0,
      source: 'purse_balance_failed',
      debug: { balanceData, legacyBalance },
    };
  } catch (error: any) {
    return {
      success: false,
      exchangeRate: RATE_PRECISION,
      totalPool: 0,
      totalStcspr: 0,
      source: 'purse_balance_error',
      debug: { error: error.message },
    };
  }
}

/**
 * Query Odra contract state using path queries
 * Odra stores Var<T> with specific key patterns
 */
async function queryOdraContractState(stateRootHash: string): Promise<StatsResult> {
  try {
    const contractKey = `hash-${CONTRACT_PACKAGE_HASH}`;

    // Try various Odra storage key patterns
    const keyPatterns = [
      // Direct variable names
      ['total_cspr_pool'],
      // With module prefix (Odra sometimes uses this)
      ['state', 'total_cspr_pool'],
      // CEP-18 token patterns
      ['token', 'total_supply'],
      ['stcspr_token', 'total_supply'],
    ];

    let totalPool = 0;
    let totalStcspr = 0;
    const debugInfo: any = { attempts: [] };

    for (const path of keyPatterns) {
      try {
        const data = await rpcCall('query_global_state', {
          state_identifier: { StateRootHash: stateRootHash },
          key: contractKey,
          path,
        });

        debugInfo.attempts.push({ path, error: data.error?.message, hasResult: !!data.result });

        if (data.result?.stored_value) {
          const value = parseClValue(data.result.stored_value);
          if (value !== null) {
            // Determine what we found based on path
            if (path.includes('total_cspr_pool') || path[path.length - 1] === 'total_cspr_pool') {
              totalPool = value;
            } else if (path.includes('total_supply')) {
              totalStcspr = value;
            }
          }
        }
      } catch (err) {
        // Continue to next pattern
      }
    }

    if (totalPool > 0 || totalStcspr > 0) {
      // Calculate exchange rate
      const exchangeRate = totalStcspr > 0
        ? Math.floor((totalPool * RATE_PRECISION) / totalStcspr)
        : RATE_PRECISION;

      return {
        success: true,
        exchangeRate,
        totalPool,
        totalStcspr,
        source: 'odra_state',
        debug: debugInfo,
      };
    }

    return {
      success: false,
      exchangeRate: RATE_PRECISION,
      totalPool: 0,
      totalStcspr: 0,
      source: 'odra_no_data',
      debug: debugInfo,
    };
  } catch (error: any) {
    return {
      success: false,
      exchangeRate: RATE_PRECISION,
      totalPool: 0,
      totalStcspr: 0,
      source: 'odra_error',
      debug: { error: error.message },
    };
  }
}

/**
 * Query using Casper 2.0 state_get_entity API
 */
async function queryEntityState(stateRootHash: string): Promise<StatsResult> {
  try {
    // Use state_get_entity for Casper 2.0
    const data = await rpcCall('state_get_entity', {
      entity_identifier: {
        EntityAddr: `entity-contract-${CONTRACT_PACKAGE_HASH}`,
      },
      state_root_hash: stateRootHash,
    });

    if (data.error) {
      return {
        success: false,
        exchangeRate: RATE_PRECISION,
        totalPool: 0,
        totalStcspr: 0,
        source: 'entity_error',
        debug: { error: data.error },
      };
    }

    const entity = data.result?.entity;
    if (entity) {
      // Parse entity named keys if available
      const namedKeys = entity.named_keys || [];
      let totalPool = 0;
      let totalStcspr = 0;

      for (const nk of namedKeys) {
        if (nk.name.includes('pool') || nk.name.includes('cspr')) {
          // Try to query this key
          const keyData = await queryKeyByURef(stateRootHash, nk.key);
          if (keyData !== null) {
            totalPool = keyData;
          }
        }
        if (nk.name.includes('supply') || nk.name.includes('stcspr')) {
          const keyData = await queryKeyByURef(stateRootHash, nk.key);
          if (keyData !== null) {
            totalStcspr = keyData;
          }
        }
      }

      if (totalPool > 0 || totalStcspr > 0) {
        const exchangeRate = totalStcspr > 0
          ? Math.floor((totalPool * RATE_PRECISION) / totalStcspr)
          : RATE_PRECISION;

        return {
          success: true,
          exchangeRate,
          totalPool,
          totalStcspr,
          source: 'entity_state',
        };
      }
    }

    return {
      success: false,
      exchangeRate: RATE_PRECISION,
      totalPool: 0,
      totalStcspr: 0,
      source: 'entity_no_data',
      debug: { entity },
    };
  } catch (error: any) {
    return {
      success: false,
      exchangeRate: RATE_PRECISION,
      totalPool: 0,
      totalStcspr: 0,
      source: 'entity_exception',
      debug: { error: error.message },
    };
  }
}

/**
 * Query key by URef
 */
async function queryKeyByURef(stateRootHash: string, uref: string): Promise<number | null> {
  try {
    const data = await rpcCall('query_global_state', {
      state_identifier: { StateRootHash: stateRootHash },
      key: uref,
      path: [],
    });

    if (data.result?.stored_value) {
      return parseClValue(data.result.stored_value);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Query contract named keys
 */
async function queryNamedKeys(stateRootHash: string): Promise<StatsResult> {
  try {
    // First get the package info
    const packageData = await rpcCall('query_global_state', {
      state_identifier: { StateRootHash: stateRootHash },
      key: `hash-${CONTRACT_PACKAGE_HASH}`,
      path: [],
    });

    if (packageData.error) {
      return {
        success: false,
        exchangeRate: RATE_PRECISION,
        totalPool: 0,
        totalStcspr: 0,
        source: 'named_keys_error',
        debug: { error: packageData.error },
      };
    }

    const storedValue = packageData.result?.stored_value;

    // If it's an AddressableEntity (Casper 2.0)
    if (storedValue?.AddressableEntity) {
      const entity = storedValue.AddressableEntity;
      const mainPurse = entity.main_purse;

      if (mainPurse) {
        // Query the main purse balance
        const balanceData = await rpcCall('query_balance', {
          purse_identifier: {
            main_purse_under_entity_addr: `entity-contract-${CONTRACT_PACKAGE_HASH}`,
          },
          state_identifier: { StateRootHash: stateRootHash },
        });

        if (balanceData.result?.balance) {
          const balance = parseInt(balanceData.result.balance, 10);
          return {
            success: true,
            exchangeRate: RATE_PRECISION, // Assume 1:1 if we only have balance
            totalPool: balance,
            totalStcspr: balance,
            source: 'purse_balance',
          };
        }
      }

      // Parse named keys
      const namedKeys = entity.named_keys || [];
      return {
        success: false,
        exchangeRate: RATE_PRECISION,
        totalPool: 0,
        totalStcspr: 0,
        source: 'named_keys_parsed',
        debug: { namedKeys: namedKeys.map((nk: any) => nk.name) },
      };
    }

    return {
      success: false,
      exchangeRate: RATE_PRECISION,
      totalPool: 0,
      totalStcspr: 0,
      source: 'named_keys_no_entity',
      debug: { storedValueType: Object.keys(storedValue || {}) },
    };
  } catch (error: any) {
    return {
      success: false,
      exchangeRate: RATE_PRECISION,
      totalPool: 0,
      totalStcspr: 0,
      source: 'named_keys_exception',
      debug: { error: error.message },
    };
  }
}

/**
 * Fallback: Get stats from CSPR.live explorer API
 */
async function getStatsFromExplorer(): Promise<StatsResult> {
  try {
    // Try CSPR.live API for contract info
    const response = await fetch(
      `https://api.testnet.cspr.live/contracts/${CONTRACT_PACKAGE_HASH}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'StakeVue/1.0',
        },
      }
    );

    if (!response.ok) {
      // Try alternate endpoint
      const altResponse = await fetch(
        `https://event-store-api-clarity-testnet.make.services/contracts/${CONTRACT_PACKAGE_HASH}`,
        { headers: { 'Accept': 'application/json' } }
      );

      if (altResponse.ok) {
        const data = await altResponse.json();
        // Parse contract data if available
        return {
          success: false,
          exchangeRate: RATE_PRECISION,
          totalPool: 0,
          totalStcspr: 0,
          source: 'explorer_alt',
          debug: { hasData: !!data },
        };
      }
    }

    return {
      success: false,
      exchangeRate: RATE_PRECISION,
      totalPool: 0,
      totalStcspr: 0,
      source: 'explorer_unavailable',
    };
  } catch (error: any) {
    return {
      success: false,
      exchangeRate: RATE_PRECISION,
      totalPool: 0,
      totalStcspr: 0,
      source: 'explorer_error',
      debug: { error: error.message },
    };
  }
}

/**
 * Parse a CLValue to number
 */
function parseClValue(storedValue: any): number | null {
  if (!storedValue) return null;

  // CLValue format
  if (storedValue.CLValue) {
    const parsed = storedValue.CLValue.parsed;
    if (typeof parsed === 'string') {
      return parseInt(parsed, 10) || 0;
    }
    if (typeof parsed === 'number') {
      return parsed;
    }
  }

  // Direct number
  if (typeof storedValue === 'number') {
    return storedValue;
  }

  // String number
  if (typeof storedValue === 'string') {
    return parseInt(storedValue, 10) || null;
  }

  return null;
}
