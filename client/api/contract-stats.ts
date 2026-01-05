import type { VercelRequest, VercelResponse } from '@vercel/node';

// V22 Contract main purse URef
const CONTRACT_PURSE_UREF = 'uref-3e8ff29a521e5902bcfc106c2e1fe94aa29fa8a6246ed1fe375d350f5d34f6e2-007';
// Rate precision (9 decimals)
const RATE_PRECISION = 1_000_000_000;
// Known balance from blockchain explorer (1146.03 CSPR)
const KNOWN_BALANCE_MOTES = 1_146_030_000_000;

// RPC URL
const RPC_URL = 'https://rpc.testnet.casperlabs.io/rpc';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let totalPool = KNOWN_BALANCE_MOTES;
  let source = 'fallback';

  // Try to get live balance
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
    const stateRootHash = stateData?.result?.state_root_hash;

    if (stateRootHash) {
      // Step 2: Query balance
      const balResp = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'query_balance',
          params: {
            purse_identifier: { purse_uref: CONTRACT_PURSE_UREF },
            state_identifier: { StateRootHash: stateRootHash }
          }
        })
      });

      const balData = await balResp.json();

      if (balData?.result?.balance) {
        totalPool = parseInt(balData.result.balance, 10);
        source = 'live_rpc';
      }
    }
  } catch (e) {
    // Ignore errors, use fallback
    console.log('RPC error, using fallback:', e);
  }

  // Always return 200 with data
  return res.status(200).json({
    exchangeRate: RATE_PRECISION,
    totalPool: totalPool,
    totalStcspr: totalPool,
    exchangeRateFormatted: '1.0000',
    totalPoolCspr: totalPool / RATE_PRECISION,
    totalStcsprFormatted: totalPool / RATE_PRECISION,
    timestamp: new Date().toISOString(),
    source: source,
    purseUref: CONTRACT_PURSE_UREF
  });
}
