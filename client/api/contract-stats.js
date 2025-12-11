// Vercel Serverless Function - Contract Stats API (V2 - Enhanced Odra Support)

// Multiple RPC endpoints for fallback
const RPC_ENDPOINTS = [
  'https://node.testnet.casper.network/rpc',          // Official Casper testnet
  'https://rpc.testnet.casperlabs.io/rpc',            // CasperLabs testnet
  'https://node-clarity-testnet.make.services/rpc',   // Make.services testnet
];

const CONTRACT_PACKAGE_HASH = '2b6c14a2cac5cfe4a1fd1efc2fc02b1090dbc3a6b661a329b90c829245540985';
const RATE_PRECISION = 1000000000;

// Helper to make RPC calls
async function rpcCall(rpcUrl, method, params, signal) {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'StakeVue/2.0',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    }),
    signal,
  });
  return response.json();
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let lastError = null;
  const debugInfo = { attempts: [], version: '2.0' };

  // Try each RPC endpoint until one works
  for (const rpcUrl of RPC_ENDPOINTS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

    try {
      // Step 1: Get the current state root hash for consistent queries
      let stateRootHash = null;
      try {
        const stateRootResult = await rpcCall(rpcUrl, 'chain_get_state_root_hash', {}, controller.signal);
        stateRootHash = stateRootResult.result?.state_root_hash;
        debugInfo.stateRootHash = stateRootHash;
      } catch (e) {
        debugInfo.stateRootHashError = e.message;
      }

      // Step 2: Try to get the contract entity
      let foundEntity = null;
      let usedKeyFormat = null;
      let usedMethod = 'unknown';

      // Method A: state_get_entity (Casper 2.0 preferred)
      try {
        const entityResult = await rpcCall(rpcUrl, 'state_get_entity', {
          entity_identifier: {
            EntityAddr: `entity-contract-${CONTRACT_PACKAGE_HASH}`,
          },
        }, controller.signal);

        debugInfo.attempts.push({
          method: 'state_get_entity',
          endpoint: rpcUrl.split('/')[2],
          hasResult: !!entityResult.result?.entity,
          error: entityResult.error?.message,
        });

        if (entityResult.result?.entity) {
          foundEntity = { AddressableEntity: entityResult.result.entity };
          usedKeyFormat = `entity-contract-${CONTRACT_PACKAGE_HASH}`;
          usedMethod = 'state_get_entity';
        }
      } catch (e) {
        debugInfo.attempts.push({ method: 'state_get_entity', error: e.message });
      }

      // Method B: query_global_state with hash format (fallback)
      if (!foundEntity) {
        const keyFormats = [
          `hash-${CONTRACT_PACKAGE_HASH}`,
          `entity-contract-${CONTRACT_PACKAGE_HASH}`,
        ];

        for (const keyFormat of keyFormats) {
          try {
            const queryResult = await rpcCall(rpcUrl, 'query_global_state', {
              state_identifier: stateRootHash ? { StateRootHash: stateRootHash } : null,
              key: keyFormat,
              path: [],
            }, controller.signal);

            debugInfo.attempts.push({
              method: 'query_global_state',
              key: keyFormat,
              endpoint: rpcUrl.split('/')[2],
              hasResult: !!queryResult.result?.stored_value,
              error: queryResult.error?.message,
            });

            if (queryResult.result?.stored_value) {
              foundEntity = queryResult.result.stored_value;
              usedKeyFormat = keyFormat;
              usedMethod = 'query_global_state';
              break;
            }
          } catch (e) {
            // Continue
          }
        }
      }

      clearTimeout(timeout);

      if (!foundEntity) {
        lastError = 'Contract entity not found';
        continue;
      }

      // Step 3: Extract contract data
      let source = 'entity_found';
      let totalPool = 0;
      let totalStcspr = 0;
      let purseBalance = null;

      const entity = foundEntity.AddressableEntity || foundEntity;
      const namedKeys = entity?.named_keys || [];
      debugInfo.namedKeys = namedKeys.map(nk => nk.name);
      debugInfo.hasMainPurse = !!entity?.main_purse;

      // Method 1: Query named keys for Odra storage
      for (const nk of namedKeys) {
        try {
          if (nk.name === 'total_cspr_pool' || nk.name.includes('pool')) {
            const valueResult = await rpcCall(rpcUrl, 'query_global_state', {
              state_identifier: stateRootHash ? { StateRootHash: stateRootHash } : null,
              key: nk.key,
              path: [],
            }, controller.signal);

            if (valueResult.result?.stored_value?.CLValue?.parsed) {
              totalPool = parseInt(valueResult.result.stored_value.CLValue.parsed, 10) || 0;
              source = 'named_key_pool';
            }
          }

          if (nk.name === 'total_supply' || nk.name.includes('supply') || nk.name.includes('token')) {
            const valueResult = await rpcCall(rpcUrl, 'query_global_state', {
              state_identifier: stateRootHash ? { StateRootHash: stateRootHash } : null,
              key: nk.key,
              path: [],
            }, controller.signal);

            if (valueResult.result?.stored_value?.CLValue?.parsed) {
              totalStcspr = parseInt(valueResult.result.stored_value.CLValue.parsed, 10) || 0;
              source = 'named_key_supply';
            }
          }
        } catch (e) {
          // Continue
        }
      }

      // Method 2: Try direct path queries for Odra Var storage
      if (totalPool === 0) {
        const odraPaths = [
          ['total_cspr_pool'],
          ['state', 'total_cspr_pool'],
          ['token', 'total_supply'],
        ];

        debugInfo.pathAttempts = [];
        for (const path of odraPaths) {
          try {
            const pathResult = await rpcCall(rpcUrl, 'query_global_state', {
              state_identifier: stateRootHash ? { StateRootHash: stateRootHash } : null,
              key: usedKeyFormat,
              path: path,
            }, controller.signal);

            debugInfo.pathAttempts.push({
              path: path.join('/'),
              hasResult: !!pathResult.result?.stored_value,
              error: pathResult.error?.message,
            });

            if (pathResult.result?.stored_value?.CLValue?.parsed) {
              const value = parseInt(pathResult.result.stored_value.CLValue.parsed, 10) || 0;
              if (path.includes('total_cspr_pool') || path.includes('pool')) {
                totalPool = value;
                source = 'odra_path_pool';
              } else if (path.includes('total_supply') || path.includes('supply')) {
                totalStcspr = value;
                source = 'odra_path_supply';
              }
            }
          } catch (e) {
            debugInfo.pathAttempts.push({ path: path.join('/'), error: e.message });
          }
        }
      }

      // Method 3: Query contract's main purse balance (ALWAYS try this)
      try {
        // Try multiple purse query formats
        const purseFormats = [
          { main_purse_under_entity_addr: `entity-contract-${CONTRACT_PACKAGE_HASH}` },
          { main_purse_under_public_key: null }, // Skip this
          { purse_uref: entity?.main_purse },
        ];

        debugInfo.purseAttempts = [];

        for (const purseId of purseFormats) {
          if (!purseId.purse_uref && !purseId.main_purse_under_entity_addr) continue;

          try {
            const balanceResult = await rpcCall(rpcUrl, 'query_balance', {
              purse_identifier: purseId,
              state_identifier: stateRootHash ? { StateRootHash: stateRootHash } : null,
            }, controller.signal);

            debugInfo.purseAttempts.push({
              format: Object.keys(purseId)[0],
              hasResult: !!balanceResult.result?.balance,
              balance: balanceResult.result?.balance,
              error: balanceResult.error?.message,
            });

            if (balanceResult.result?.balance) {
              purseBalance = parseInt(balanceResult.result.balance, 10) || 0;
              if (purseBalance > 0) {
                // Use purse balance if we haven't found values from storage
                if (totalPool === 0) {
                  totalPool = purseBalance;
                  totalStcspr = purseBalance; // Assume 1:1 if no supply found
                  source = 'purse_balance';
                }
                break;
              }
            }
          } catch (e) {
            debugInfo.purseAttempts.push({ error: e.message });
          }
        }
      } catch (e) {
        debugInfo.purseError = e.message;
      }

      // Method 4: Try state_get_dictionary_item for Odra dictionaries
      if (totalPool === 0) {
        const dictNames = ['state', 'storage', 'data', 'vars'];
        debugInfo.dictAttempts = [];

        for (const dictName of dictNames) {
          try {
            // Try to find dictionary by seed URef
            const dictResult = await rpcCall(rpcUrl, 'state_get_dictionary_item', {
              state_root_hash: stateRootHash,
              dictionary_identifier: {
                ContractNamedKey: {
                  key: `hash-${CONTRACT_PACKAGE_HASH}`,
                  dictionary_name: dictName,
                  dictionary_item_key: 'total_cspr_pool',
                },
              },
            }, controller.signal);

            debugInfo.dictAttempts.push({
              dictName,
              hasResult: !!dictResult.result?.stored_value,
              error: dictResult.error?.message,
            });

            if (dictResult.result?.stored_value?.CLValue?.parsed) {
              totalPool = parseInt(dictResult.result.stored_value.CLValue.parsed, 10) || 0;
              source = 'dictionary';
              break;
            }
          } catch (e) {
            debugInfo.dictAttempts.push({ dictName, error: e.message });
          }
        }
      }

      // Calculate exchange rate
      const exchangeRate = totalStcspr > 0
        ? Math.floor((totalPool * RATE_PRECISION) / totalStcspr)
        : RATE_PRECISION;

      return res.status(200).json({
        exchangeRate,
        totalPool,
        totalStcspr,
        exchangeRateFormatted: (exchangeRate / RATE_PRECISION).toFixed(4),
        totalPoolCspr: totalPool / RATE_PRECISION,
        totalStcsprFormatted: totalStcspr / RATE_PRECISION,
        purseBalance: purseBalance !== null ? purseBalance / RATE_PRECISION : null,
        timestamp: new Date().toISOString(),
        source,
        contractHash: CONTRACT_PACKAGE_HASH,
        contractExists: true,
        endpoint: rpcUrl.split('/')[2],
        keyFormat: usedKeyFormat,
        method: usedMethod,
        debug: debugInfo,
      });

    } catch (error) {
      clearTimeout(timeout);
      lastError = error.name === 'AbortError' ? `timeout:${rpcUrl.split('/')[2]}` : error.message;
      continue;
    }
  }

  // All endpoints failed
  return res.status(200).json({
    exchangeRate: RATE_PRECISION,
    totalPool: 0,
    totalStcspr: 0,
    exchangeRateFormatted: '1.0000',
    totalPoolCspr: 0,
    totalStcsprFormatted: 0,
    timestamp: new Date().toISOString(),
    source: 'all_endpoints_failed',
    contractHash: CONTRACT_PACKAGE_HASH,
    contractExists: false,
    error: lastError,
    endpointsTried: RPC_ENDPOINTS.length,
    debug: debugInfo,
  });
};
