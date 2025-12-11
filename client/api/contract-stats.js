// Vercel Serverless Function - Contract Stats API (with fallback endpoints)

// Multiple RPC endpoints for fallback
const RPC_ENDPOINTS = [
  'https://node.testnet.casper.network/rpc',          // Official Casper testnet
  'https://rpc.testnet.casperlabs.io/rpc',            // CasperLabs testnet
  'https://node-clarity-testnet.make.services/rpc',   // Make.services testnet
];

const CONTRACT_PACKAGE_HASH = '2b6c14a2cac5cfe4a1fd1efc2fc02b1090dbc3a6b661a329b90c829245540985';
const RATE_PRECISION = 1000000000;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let lastError = null;
  const debugInfo = { attempts: [] };

  // Try each RPC endpoint until one works
  for (const rpcUrl of RPC_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout

      // Try different key formats for Casper 2.0
      const keyFormats = [
        `entity-contract-${CONTRACT_PACKAGE_HASH}`,  // Casper 2.0 entity format
        `hash-${CONTRACT_PACKAGE_HASH}`,             // Legacy hash format
      ];

      let foundEntity = null;
      let usedKeyFormat = null;
      let usedMethod = 'query_global_state';

      // Method 1: Try query_global_state with different key formats
      for (const keyFormat of keyFormats) {
        try {
          const response = await fetch(rpcUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'User-Agent': 'StakeVue/1.0',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'query_global_state',
              params: {
                state_identifier: null,
                key: keyFormat,
                path: [],
              },
            }),
            signal: controller.signal,
          });

          if (response.ok) {
            const data = await response.json();
            debugInfo.attempts.push({
              endpoint: rpcUrl.split('/')[2],
              method: 'query_global_state',
              key: keyFormat,
              hasResult: !!data.result?.stored_value,
              error: data.error?.message,
            });

            if (data.result?.stored_value) {
              foundEntity = data.result.stored_value;
              usedKeyFormat = keyFormat;
              break;
            }
          }
        } catch (e) {
          // Continue trying other formats
        }
      }

      // Method 2: Try state_get_entity if query_global_state didn't work
      if (!foundEntity) {
        try {
          const entityResponse = await fetch(rpcUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 2,
              method: 'state_get_entity',
              params: {
                entity_identifier: {
                  EntityAddr: `entity-contract-${CONTRACT_PACKAGE_HASH}`,
                },
              },
            }),
            signal: controller.signal,
          });

          if (entityResponse.ok) {
            const entityData = await entityResponse.json();
            debugInfo.attempts.push({
              endpoint: rpcUrl.split('/')[2],
              method: 'state_get_entity',
              hasResult: !!entityData.result?.entity,
              error: entityData.error?.message,
            });

            if (entityData.result?.entity) {
              foundEntity = { AddressableEntity: entityData.result.entity };
              usedKeyFormat = 'state_get_entity';
              usedMethod = 'state_get_entity';
            }
          }
        } catch (e) {
          // Continue
        }
      }

      clearTimeout(timeout);

      // If we found the contract entity
      if (foundEntity) {
        let source = 'entity_found';
        let totalPool = 0;
        let totalStcspr = 0;

        // Check for AddressableEntity (Casper 2.0 format)
        if (foundEntity.AddressableEntity) {
          const entity = foundEntity.AddressableEntity;

          // Try to get the contract's main purse balance
          if (entity.main_purse) {
            try {
              const balanceResponse = await fetch(rpcUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                },
                body: JSON.stringify({
                  jsonrpc: '2.0',
                  id: 3,
                  method: 'query_balance',
                  params: {
                    purse_identifier: {
                      main_purse_under_entity_addr: `entity-contract-${CONTRACT_PACKAGE_HASH}`,
                    },
                  },
                }),
              });
              const balanceData = await balanceResponse.json();
              if (balanceData.result?.balance) {
                totalPool = parseInt(balanceData.result.balance, 10) || 0;
                totalStcspr = totalPool; // Assume 1:1 for now
                source = 'balance_query';
              }
            } catch (e) {
              // Balance query failed, continue with 0
            }
          }
        }

        // Calculate exchange rate
        const exchangeRate = totalStcspr > 0
          ? Math.floor((totalPool * RATE_PRECISION) / totalStcspr)
          : RATE_PRECISION;

        return res.status(200).json({
          exchangeRate: exchangeRate,
          totalPool: totalPool,
          totalStcspr: totalStcspr,
          exchangeRateFormatted: (exchangeRate / RATE_PRECISION).toFixed(4),
          totalPoolCspr: totalPool / RATE_PRECISION,
          totalStcsprFormatted: totalStcspr / RATE_PRECISION,
          timestamp: new Date().toISOString(),
          source: source,
          contractHash: CONTRACT_PACKAGE_HASH,
          contractExists: true,
          endpoint: rpcUrl.split('/')[2],
          keyFormat: usedKeyFormat,
          method: usedMethod,
        });
      }

      // Contract not found on this endpoint
      lastError = 'Contract not found';

    } catch (error) {
      lastError = error.name === 'AbortError' ? `timeout:${rpcUrl.split('/')[2]}` : error.message;
      continue;
    }
  }

  // All endpoints failed or contract not found
  return res.status(200).json({
    exchangeRate: RATE_PRECISION,
    totalPool: 0,
    totalStcspr: 0,
    exchangeRateFormatted: '1.0000',
    totalPoolCspr: 0,
    totalStcsprFormatted: 0,
    timestamp: new Date().toISOString(),
    source: 'contract_not_found',
    contractHash: CONTRACT_PACKAGE_HASH,
    contractExists: false,
    error: lastError,
    endpointsTried: RPC_ENDPOINTS.length,
    debug: debugInfo,
  });
};
