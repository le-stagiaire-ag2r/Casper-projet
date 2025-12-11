// Vercel Serverless Function - Contract Stats API (Simplified)

const RPC_URL = 'https://rpc.testnet.casperlabs.io/rpc';
const CONTRACT_PACKAGE_HASH = '2b6c14a2cac5cfe4a1fd1efc2fc02b1090dbc3a6b661a329b90c829245540985';
const RATE_PRECISION = 1000000000;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Single quick RPC call with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const data = await response.json();

    // Check if we got AddressableEntity (contract exists)
    const storedValue = data.result?.stored_value;
    let source = 'rpc';
    let totalPool = 0;
    let totalStcspr = 0;

    if (storedValue?.AddressableEntity) {
      source = 'entity_found';
      // Contract exists but we can't easily read Odra storage
      // Return placeholder - real values need contract view calls
    }

    // For now return defaults with confirmation contract exists
    return res.status(200).json({
      exchangeRate: RATE_PRECISION,
      totalPool: totalPool,
      totalStcspr: totalStcspr,
      exchangeRateFormatted: '1.0000',
      totalPoolCspr: 0,
      totalStcsprFormatted: 0,
      timestamp: new Date().toISOString(),
      source: source,
      contractHash: CONTRACT_PACKAGE_HASH,
      contractExists: !!storedValue?.AddressableEntity,
      note: 'Live RPC query - Odra storage requires view function calls',
    });
  } catch (error) {
    // Return defaults on any error
    return res.status(200).json({
      exchangeRate: RATE_PRECISION,
      totalPool: 0,
      totalStcspr: 0,
      exchangeRateFormatted: '1.0000',
      totalPoolCspr: 0,
      totalStcsprFormatted: 0,
      timestamp: new Date().toISOString(),
      source: 'error',
      error: error.name === 'AbortError' ? 'RPC timeout' : error.message,
    });
  }
};
