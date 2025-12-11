// Vercel Serverless Function - Contract Stats API (V2 - Enhanced Odra Support)

// Multiple RPC endpoints for fallback
const RPC_ENDPOINTS = [
  'https://node.testnet.casper.network/rpc',          // Official Casper testnet
  'https://rpc.testnet.casperlabs.io/rpc',            // CasperLabs testnet
  'https://node-clarity-testnet.make.services/rpc',   // Make.services testnet
];

const CONTRACT_PACKAGE_HASH = '2b6c14a2cac5cfe4a1fd1efc2fc02b1090dbc3a6b661a329b90c829245540985';
const RATE_PRECISION = 1000000000;
const API_VERSION = '2.4';

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
  const debugInfo = { attempts: [], version: API_VERSION };

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

      // Step 3: Handle ContractPackage vs AddressableEntity
      let source = 'entity_found';
      let totalPool = 0;
      let totalStcspr = 0;
      let purseBalance = null;
      let activeContractHash = null;

      let entity = foundEntity.AddressableEntity || foundEntity;
      debugInfo.entityKeys = Object.keys(entity || {});

      // If this is a ContractPackage, we need to get the active contract version
      if (entity.ContractPackage) {
        debugInfo.isContractPackage = true;
        const pkg = entity.ContractPackage;
        const versions = pkg.versions || [];
        debugInfo.packageVersions = versions.length;

        // Get the latest (active) version
        if (versions.length > 0) {
          const latestVersion = versions[versions.length - 1];
          activeContractHash = latestVersion.contract_hash;
          debugInfo.activeContractHash = activeContractHash;

          // Query the actual contract using the version hash
          if (activeContractHash) {
            // Convert contract-xxx to hash-xxx for query_global_state
            const queryContractKey = activeContractHash.replace('contract-', 'hash-');
            debugInfo.queryContractKey = queryContractKey;

            try {
              const contractResult = await rpcCall(rpcUrl, 'query_global_state', {
                state_identifier: stateRootHash ? { StateRootHash: stateRootHash } : null,
                key: queryContractKey,
                path: [],
              }, controller.signal);

              debugInfo.contractQuery = {
                hasResult: !!contractResult.result?.stored_value,
                error: contractResult.error?.message,
              };

              if (contractResult.result?.stored_value) {
                const contractValue = contractResult.result.stored_value;
                // Check if it's a Contract (Casper 1.x) or AddressableEntity
                if (contractValue.Contract) {
                  entity = contractValue.Contract;
                  debugInfo.contractType = 'Contract';
                } else if (contractValue.AddressableEntity) {
                  entity = contractValue.AddressableEntity;
                  debugInfo.contractType = 'AddressableEntity';
                } else {
                  debugInfo.contractType = Object.keys(contractValue);
                }
              }
            } catch (e) {
              debugInfo.contractQueryError = e.message;
            }
          }
        }
      }

      const namedKeys = entity?.named_keys || [];
      debugInfo.namedKeys = namedKeys.map(nk => nk.name);
      debugInfo.hasMainPurse = !!entity?.main_purse;
      debugInfo.mainPurse = entity?.main_purse || null;
      debugInfo.entityKind = entity?.entity_kind || 'unknown';

      // Method 1: Query named keys for Odra storage
      let contractMainPurseURef = null;
      let stateURef = null;

      for (const nk of namedKeys) {
        try {
          // Look for __contract_main_purse (Odra's purse)
          if (nk.name === '__contract_main_purse') {
            contractMainPurseURef = nk.key;
            debugInfo.contractMainPurseURef = nk.key;
          }

          // Look for state dictionary (where Odra stores Var<T>)
          if (nk.name === 'state') {
            stateURef = nk.key;
            debugInfo.stateURef = nk.key;
          }

          // Direct pool query
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

          // Token supply query
          if (nk.name === 'total_supply' || nk.name.includes('supply')) {
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

      // Try to get balance from __contract_main_purse
      if (contractMainPurseURef && totalPool === 0) {
        try {
          const purseBalanceResult = await rpcCall(rpcUrl, 'query_balance', {
            purse_identifier: {
              purse_uref: contractMainPurseURef,
            },
            state_identifier: stateRootHash ? { StateRootHash: stateRootHash } : null,
          }, controller.signal);

          debugInfo.contractPurseQuery = {
            hasResult: !!purseBalanceResult.result?.balance,
            balance: purseBalanceResult.result?.balance,
            error: purseBalanceResult.error?.message,
          };

          if (purseBalanceResult.result?.balance) {
            const balance = parseInt(purseBalanceResult.result.balance, 10) || 0;
            if (balance > 0) {
              totalPool = balance;
              purseBalance = balance;
              source = 'contract_main_purse';
            }
          }
        } catch (e) {
          debugInfo.contractPurseError = e.message;
        }
      }

      // Try to query state dictionary for total_cspr_pool
      if (stateURef && totalPool === 0) {
        try {
          // Query the state URef to see what's inside
          const stateResult = await rpcCall(rpcUrl, 'query_global_state', {
            state_identifier: stateRootHash ? { StateRootHash: stateRootHash } : null,
            key: stateURef,
            path: [],
          }, controller.signal);

          debugInfo.stateQuery = {
            hasResult: !!stateResult.result?.stored_value,
            type: stateResult.result?.stored_value ? Object.keys(stateResult.result.stored_value) : null,
            error: stateResult.error?.message,
          };

          // If state is a CLValue (like a dictionary seed), try to query it
          if (stateResult.result?.stored_value?.CLValue?.parsed) {
            const stateValue = stateResult.result.stored_value.CLValue.parsed;
            // If it's a number, it might be the total_cspr_pool directly
            if (typeof stateValue === 'string' || typeof stateValue === 'number') {
              totalPool = parseInt(stateValue, 10) || 0;
              source = 'state_direct';
            }
          }
        } catch (e) {
          debugInfo.stateQueryError = e.message;
        }
      }

      // Method 2: Try direct path queries for Odra Var storage
      if (totalPool === 0) {
        const odraPaths = [
          ['total_cspr_pool'],
          ['state', 'total_cspr_pool'],
          ['token', 'total_supply'],
        ];

        // Use active contract hash if available, otherwise fall back to package hash
        // Convert contract-xxx to hash-xxx format for queries
        let queryKey = activeContractHash || usedKeyFormat;
        if (queryKey && queryKey.startsWith('contract-')) {
          queryKey = queryKey.replace('contract-', 'hash-');
        }
        debugInfo.pathQueryKey = queryKey;

        debugInfo.pathAttempts = [];
        for (const path of odraPaths) {
          try {
            const pathResult = await rpcCall(rpcUrl, 'query_global_state', {
              state_identifier: stateRootHash ? { StateRootHash: stateRootHash } : null,
              key: queryKey,
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
      debugInfo.purseAttempts = [];

      // Extract contract hash from activeContractHash (remove 'contract-' prefix if present)
      const contractHashOnly = activeContractHash
        ? activeContractHash.replace('contract-', '').replace('hash-', '')
        : CONTRACT_PACKAGE_HASH;
      debugInfo.contractHashForPurse = contractHashOnly;

      // Try entity_addr format with the actual contract hash
      try {
        const entityBalanceResult = await rpcCall(rpcUrl, 'query_balance', {
          purse_identifier: {
            main_purse_under_entity_addr: `entity-contract-${contractHashOnly}`,
          },
          state_identifier: stateRootHash ? { StateRootHash: stateRootHash } : null,
        }, controller.signal);

        debugInfo.purseAttempts.push({
          format: 'main_purse_under_entity_addr',
          hasResult: !!entityBalanceResult.result?.balance,
          balance: entityBalanceResult.result?.balance,
          error: entityBalanceResult.error?.message,
          fullError: entityBalanceResult.error,
        });

        if (entityBalanceResult.result?.balance) {
          purseBalance = parseInt(entityBalanceResult.result.balance, 10) || 0;
          if (purseBalance > 0 && totalPool === 0) {
            totalPool = purseBalance;
            totalStcspr = purseBalance;
            source = 'purse_balance_entity';
          }
        }
      } catch (e) {
        debugInfo.purseAttempts.push({ format: 'main_purse_under_entity_addr', error: e.message });
      }

      // Try direct URef if entity has main_purse
      if (entity?.main_purse && purseBalance === null) {
        try {
          const urefBalanceResult = await rpcCall(rpcUrl, 'query_balance', {
            purse_identifier: {
              purse_uref: entity.main_purse,
            },
            state_identifier: stateRootHash ? { StateRootHash: stateRootHash } : null,
          }, controller.signal);

          debugInfo.purseAttempts.push({
            format: 'purse_uref',
            uref: entity.main_purse,
            hasResult: !!urefBalanceResult.result?.balance,
            balance: urefBalanceResult.result?.balance,
            error: urefBalanceResult.error?.message,
          });

          if (urefBalanceResult.result?.balance) {
            purseBalance = parseInt(urefBalanceResult.result.balance, 10) || 0;
            if (purseBalance > 0 && totalPool === 0) {
              totalPool = purseBalance;
              totalStcspr = purseBalance;
              source = 'purse_balance_uref';
            }
          }
        } catch (e) {
          debugInfo.purseAttempts.push({ format: 'purse_uref', error: e.message });
        }
      }

      // Try state_get_balance (legacy method)
      try {
        const legacyBalanceResult = await rpcCall(rpcUrl, 'state_get_balance', {
          state_root_hash: stateRootHash,
          purse_uref: entity?.main_purse || `uref-${CONTRACT_PACKAGE_HASH}-007`,
        }, controller.signal);

        debugInfo.purseAttempts.push({
          format: 'state_get_balance',
          hasResult: !!legacyBalanceResult.result?.balance_value,
          balance: legacyBalanceResult.result?.balance_value,
          error: legacyBalanceResult.error?.message,
        });

        if (legacyBalanceResult.result?.balance_value) {
          const legacyBalance = parseInt(legacyBalanceResult.result.balance_value, 10) || 0;
          if (legacyBalance > 0 && totalPool === 0) {
            purseBalance = legacyBalance;
            totalPool = legacyBalance;
            totalStcspr = legacyBalance;
            source = 'state_get_balance';
          }
        }
      } catch (e) {
        debugInfo.purseAttempts.push({ format: 'state_get_balance', error: e.message });
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
