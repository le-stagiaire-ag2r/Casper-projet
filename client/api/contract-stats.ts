import type { VercelRequest, VercelResponse } from '@vercel/node';

// Casper RPC endpoint (testnet)
const RPC_URL = 'https://rpc.testnet.casperlabs.io/rpc';
// V22 Contract main purse URef
const CONTRACT_PURSE_UREF = 'uref-3e8ff29a521e5902bcfc106c2e1fe94aa29fa8a6246ed1fe375d350f5d34f6e2-007';
// Rate precision (9 decimals)
const RATE_PRECISION = 1_000_000_000;

/**
 * Simple API to fetch V22 contract stats via purse balance
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get state root hash
    const stateRootResponse = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'chain_get_state_root_hash',
        params: {},
      }),
    });
    const stateRootData = await stateRootResponse.json();
    const stateRootHash = stateRootData.result?.state_root_hash;

    if (!stateRootHash) {
      throw new Error('Could not get state root hash');
    }

    // Query purse balance directly
    const balanceResponse = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'query_balance',
        params: {
          purse_identifier: {
            purse_uref: CONTRACT_PURSE_UREF,
          },
          state_identifier: {
            StateRootHash: stateRootHash,
          },
        },
      }),
    });
    const balanceData = await balanceResponse.json();

    let totalPool = 0;
    let source = 'unknown';

    if (balanceData.result?.balance) {
      totalPool = parseInt(balanceData.result.balance, 10);
      source = 'purse_balance';
    } else {
      // Fallback: try state_get_balance
      const legacyResponse = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 3,
          method: 'state_get_balance',
          params: {
            purse_uref: CONTRACT_PURSE_UREF,
            state_root_hash: stateRootHash,
          },
        }),
      });
      const legacyData = await legacyResponse.json();

      if (legacyData.result?.balance_value) {
        totalPool = parseInt(legacyData.result.balance_value, 10);
        source = 'legacy_balance';
      } else {
        source = 'no_balance_found';
      }
    }

    // For now, assume 1:1 exchange rate and same supply
    // Real implementation would query token total_supply
    const totalStcspr = totalPool;
    const exchangeRate = RATE_PRECISION; // 1.0

    return res.status(200).json({
      exchangeRate,
      totalPool,
      totalStcspr,
      exchangeRateFormatted: (exchangeRate / RATE_PRECISION).toFixed(4),
      totalPoolCspr: totalPool / RATE_PRECISION,
      totalStcsprFormatted: totalStcspr / RATE_PRECISION,
      timestamp: new Date().toISOString(),
      source,
      debug: {
        stateRootHash,
        purseUref: CONTRACT_PURSE_UREF,
        balanceResult: balanceData.result || balanceData.error,
      },
    });
  } catch (error: any) {
    console.error('Contract stats API error:', error);
    return res.status(500).json({
      error: error.message,
      exchangeRate: RATE_PRECISION,
      totalPool: 0,
      totalStcspr: 0,
      exchangeRateFormatted: '1.0000',
      totalPoolCspr: 0,
      totalStcsprFormatted: 0,
      timestamp: new Date().toISOString(),
      source: 'error',
    });
  }
}
