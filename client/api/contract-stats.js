// Vercel Serverless Function - Contract Stats API

// Casper RPC endpoint (testnet)
const RPC_URL = 'https://rpc.testnet.casperlabs.io/rpc';
// V15 Contract Package Hash
const CONTRACT_PACKAGE_HASH = '2b6c14a2cac5cfe4a1fd1efc2fc02b1090dbc3a6b661a329b90c829245540985';
// Rate precision (9 decimals)
const RATE_PRECISION = 1000000000;

/**
 * API endpoint to fetch StakeVue V15 contract stats
 */
module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get the state root hash first
    const stateRootHash = await getStateRootHash();

    // Try multiple approaches to get contract state
    let stats = await queryOdraContractState(stateRootHash);

    // Try entity API if first method fails
    if (!stats.success) {
      stats = await queryEntityState(stateRootHash);
    }

    // Try named keys approach
    if (!stats.success) {
      stats = await queryNamedKeys(stateRootHash);
    }

    // Final fallback
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
  } catch (error) {
    console.error('Contract stats API error:', error);
    return res.status(200).json({
      exchangeRate: RATE_PRECISION,
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
};

async function rpcCall(method, params) {
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

async function getStateRootHash() {
  const data = await rpcCall('chain_get_state_root_hash', {});
  return data.result?.state_root_hash || '';
}

async function queryOdraContractState(stateRootHash) {
  try {
    const contractKey = `hash-${CONTRACT_PACKAGE_HASH}`;
    const keyPatterns = [
      ['total_cspr_pool'],
      ['state', 'total_cspr_pool'],
      ['token', 'total_supply'],
    ];

    let totalPool = 0;
    let totalStcspr = 0;
    const debugInfo = { attempts: [] };

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
            if (path.includes('total_cspr_pool')) {
              totalPool = value;
            } else if (path.includes('total_supply')) {
              totalStcspr = value;
            }
          }
        }
      } catch (err) {
        // Continue
      }
    }

    if (totalPool > 0 || totalStcspr > 0) {
      const exchangeRate = totalStcspr > 0
        ? Math.floor((totalPool * RATE_PRECISION) / totalStcspr)
        : RATE_PRECISION;
      return { success: true, exchangeRate, totalPool, totalStcspr, source: 'odra_state', debug: debugInfo };
    }

    return { success: false, exchangeRate: RATE_PRECISION, totalPool: 0, totalStcspr: 0, source: 'odra_no_data', debug: debugInfo };
  } catch (error) {
    return { success: false, exchangeRate: RATE_PRECISION, totalPool: 0, totalStcspr: 0, source: 'odra_error', debug: { error: error.message } };
  }
}

async function queryEntityState(stateRootHash) {
  try {
    const data = await rpcCall('state_get_entity', {
      entity_identifier: { EntityAddr: `entity-contract-${CONTRACT_PACKAGE_HASH}` },
      state_root_hash: stateRootHash,
    });

    if (data.error) {
      return { success: false, exchangeRate: RATE_PRECISION, totalPool: 0, totalStcspr: 0, source: 'entity_error', debug: { error: data.error } };
    }

    const entity = data.result?.entity;
    if (entity) {
      const namedKeys = entity.named_keys || [];
      let totalPool = 0;
      let totalStcspr = 0;

      for (const nk of namedKeys) {
        if (nk.name.includes('pool') || nk.name.includes('cspr')) {
          const keyData = await queryKeyByURef(stateRootHash, nk.key);
          if (keyData !== null) totalPool = keyData;
        }
        if (nk.name.includes('supply')) {
          const keyData = await queryKeyByURef(stateRootHash, nk.key);
          if (keyData !== null) totalStcspr = keyData;
        }
      }

      if (totalPool > 0 || totalStcspr > 0) {
        const exchangeRate = totalStcspr > 0 ? Math.floor((totalPool * RATE_PRECISION) / totalStcspr) : RATE_PRECISION;
        return { success: true, exchangeRate, totalPool, totalStcspr, source: 'entity_state' };
      }
    }

    return { success: false, exchangeRate: RATE_PRECISION, totalPool: 0, totalStcspr: 0, source: 'entity_no_data', debug: { entity } };
  } catch (error) {
    return { success: false, exchangeRate: RATE_PRECISION, totalPool: 0, totalStcspr: 0, source: 'entity_exception', debug: { error: error.message } };
  }
}

async function queryKeyByURef(stateRootHash, uref) {
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

async function queryNamedKeys(stateRootHash) {
  try {
    const packageData = await rpcCall('query_global_state', {
      state_identifier: { StateRootHash: stateRootHash },
      key: `hash-${CONTRACT_PACKAGE_HASH}`,
      path: [],
    });

    if (packageData.error) {
      return { success: false, exchangeRate: RATE_PRECISION, totalPool: 0, totalStcspr: 0, source: 'named_keys_error', debug: { error: packageData.error } };
    }

    const storedValue = packageData.result?.stored_value;

    if (storedValue?.AddressableEntity) {
      const entity = storedValue.AddressableEntity;
      const mainPurse = entity.main_purse;

      if (mainPurse) {
        const balanceData = await rpcCall('query_balance', {
          purse_identifier: { main_purse_under_entity_addr: `entity-contract-${CONTRACT_PACKAGE_HASH}` },
          state_identifier: { StateRootHash: stateRootHash },
        });

        if (balanceData.result?.balance) {
          const balance = parseInt(balanceData.result.balance, 10);
          return { success: true, exchangeRate: RATE_PRECISION, totalPool: balance, totalStcspr: balance, source: 'purse_balance' };
        }
      }

      const namedKeys = entity.named_keys || [];
      return { success: false, exchangeRate: RATE_PRECISION, totalPool: 0, totalStcspr: 0, source: 'named_keys_parsed', debug: { namedKeys: namedKeys.map(nk => nk.name) } };
    }

    return { success: false, exchangeRate: RATE_PRECISION, totalPool: 0, totalStcspr: 0, source: 'named_keys_no_entity', debug: { storedValueType: Object.keys(storedValue || {}) } };
  } catch (error) {
    return { success: false, exchangeRate: RATE_PRECISION, totalPool: 0, totalStcspr: 0, source: 'named_keys_exception', debug: { error: error.message } };
  }
}

async function getStatsFromExplorer() {
  try {
    const response = await fetch(`https://api.testnet.cspr.live/contracts/${CONTRACT_PACKAGE_HASH}`, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'StakeVue/1.0' },
    });

    if (!response.ok) {
      return { success: false, exchangeRate: RATE_PRECISION, totalPool: 0, totalStcspr: 0, source: 'explorer_unavailable' };
    }

    return { success: false, exchangeRate: RATE_PRECISION, totalPool: 0, totalStcspr: 0, source: 'explorer_no_data' };
  } catch (error) {
    return { success: false, exchangeRate: RATE_PRECISION, totalPool: 0, totalStcspr: 0, source: 'explorer_error', debug: { error: error.message } };
  }
}

function parseClValue(storedValue) {
  if (!storedValue) return null;

  if (storedValue.CLValue) {
    const parsed = storedValue.CLValue.parsed;
    if (typeof parsed === 'string') return parseInt(parsed, 10) || 0;
    if (typeof parsed === 'number') return parsed;
  }

  if (typeof storedValue === 'number') return storedValue;
  if (typeof storedValue === 'string') return parseInt(storedValue, 10) || null;

  return null;
}
