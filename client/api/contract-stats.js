// V22 Contract main purse URef
const CONTRACT_PURSE_UREF = 'uref-3e8ff29a521e5902bcfc106c2e1fe94aa29fa8a6246ed1fe375d350f5d34f6e2-007';
// Rate precision (9 decimals)
const RATE_PRECISION = 1000000000;
// Fallback balance
const FALLBACK_BALANCE = 1146030000000;

// Multiple RPC endpoints to try
const RPC_ENDPOINTS = [
  'https://rpc.testnet.casperlabs.io/rpc',
  'https://node.testnet.cspr.cloud/rpc',
  'https://casper-testnet.make.services/rpc'
];

async function tryRpcCall(url, body, timeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return await resp.json();
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let totalPool = FALLBACK_BALANCE;
  let source = 'fallback';
  let usedRpc = null;

  // Try each RPC endpoint
  for (const rpcUrl of RPC_ENDPOINTS) {
    try {
      // Step 1: Get state root hash
      const stateData = await tryRpcCall(rpcUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'chain_get_state_root_hash',
        params: {}
      }, 8000);

      const stateRootHash = stateData && stateData.result && stateData.result.state_root_hash;
      if (!stateRootHash) continue;

      // Step 2: Query purse balance
      const balData = await tryRpcCall(rpcUrl, {
        jsonrpc: '2.0',
        id: 2,
        method: 'query_balance',
        params: {
          purse_identifier: { purse_uref: CONTRACT_PURSE_UREF },
          state_identifier: { StateRootHash: stateRootHash }
        }
      }, 8000);

      if (balData && balData.result && balData.result.balance) {
        totalPool = parseInt(balData.result.balance, 10);
        source = 'live_rpc';
        usedRpc = rpcUrl;
        break; // Success, stop trying
      }
    } catch (e) {
      console.log('RPC failed:', rpcUrl, e.message);
      continue; // Try next RPC
    }
  }

  return res.status(200).json({
    exchangeRate: RATE_PRECISION,
    totalPool: totalPool,
    totalStcspr: totalPool,
    exchangeRateFormatted: '1.0000',
    totalPoolCspr: totalPool / RATE_PRECISION,
    totalStcsprFormatted: totalPool / RATE_PRECISION,
    timestamp: new Date().toISOString(),
    source: source,
    rpcUsed: usedRpc,
    purseUref: CONTRACT_PURSE_UREF
  });
};
