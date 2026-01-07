// V22 Contract main purse URef
const CONTRACT_PURSE_UREF = 'uref-3e8ff29a521e5902bcfc106c2e1fe94aa29fa8a6246ed1fe375d350f5d34f6e2-007';
// Rate precision (9 decimals)
const RATE_PRECISION = 1000000000;
// Fallback balance
const FALLBACK_BALANCE = 1146030000000;

// RPC endpoint
const RPC_URL = 'https://rpc.testnet.casperlabs.io/rpc';

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
  let debug = {};

  try {
    // Step 1: Get state root hash
    const stateResp = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'chain_get_state_root_hash',
        params: {}
      })
    });

    const stateData = await stateResp.json();
    debug.stateResponse = stateData;

    const stateRootHash = stateData && stateData.result && stateData.result.state_root_hash;

    if (stateRootHash) {
      debug.stateRootHash = stateRootHash;

      // Step 2: Try state_get_balance (legacy method)
      const balResp = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'state_get_balance',
          params: {
            state_root_hash: stateRootHash,
            purse_uref: CONTRACT_PURSE_UREF
          }
        })
      });

      const balData = await balResp.json();
      debug.balanceResponse = balData;

      // Check for balance_value (legacy response format)
      if (balData && balData.result && balData.result.balance_value) {
        totalPool = parseInt(balData.result.balance_value, 10);
        source = 'live_rpc_legacy';
      }
      // Check for balance (newer response format)
      else if (balData && balData.result && balData.result.balance) {
        totalPool = parseInt(balData.result.balance, 10);
        source = 'live_rpc';
      }
    }
  } catch (e) {
    debug.error = e.message;
    console.log('RPC error:', e.message);
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
    purseUref: CONTRACT_PURSE_UREF,
    debug: debug
  });
};
