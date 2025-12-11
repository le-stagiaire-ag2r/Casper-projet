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
  let workingEndpoint = null;

  // Try each RPC endpoint until one works
  for (const rpcUrl of RPC_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000); // 4s timeout per endpoint

      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'StakeVue/1.0 (Casper Liquid Staking)',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'query_global_state',
          params: {
            state_identifier: null, // Latest state
            key: `hash-${CONTRACT_PACKAGE_HASH}`,
            path: [],
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        lastError = `HTTP ${response.status}`;
        continue;
      }

      const data = await response.json();

      // Check for RPC error
      if (data.error) {
        lastError = data.error.message || 'RPC error';
        continue;
      }

      // Success! Check if we got AddressableEntity (contract exists)
      const storedValue = data.result?.stored_value;
      workingEndpoint = rpcUrl;
      let source = 'rpc';
      let totalPool = 0;
      let totalStcspr = 0;

      if (storedValue?.AddressableEntity) {
        source = 'entity_found';
        // Try to get main purse balance if available
        const entity = storedValue.AddressableEntity;
        if (entity.main_purse) {
          // Contract has a main purse - we can query its balance
          try {
            const balanceResponse = await fetch(rpcUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 2,
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
            // Ignore balance query errors
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
        contractExists: !!storedValue?.AddressableEntity,
        endpoint: rpcUrl.split('/')[2], // Show which endpoint worked
        note: 'Live RPC query - Odra storage requires view function calls',
      });
    } catch (error) {
      lastError = error.name === 'AbortError' ? `timeout:${rpcUrl.split('/')[2]}` : error.message;
      continue; // Try next endpoint
    }
  }

  // All endpoints failed - return defaults
  return res.status(200).json({
    exchangeRate: RATE_PRECISION,
    totalPool: 0,
    totalStcspr: 0,
    exchangeRateFormatted: '1.0000',
    totalPoolCspr: 0,
    totalStcsprFormatted: 0,
    timestamp: new Date().toISOString(),
    source: 'all_endpoints_failed',
    error: lastError,
    endpointsTried: RPC_ENDPOINTS.length,
  });
};
