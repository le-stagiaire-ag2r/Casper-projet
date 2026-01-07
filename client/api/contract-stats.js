// V22 Contract main purse URef
const CONTRACT_PURSE_UREF = 'uref-3e8ff29a521e5902bcfc106c2e1fe94aa29fa8a6246ed1fe375d350f5d34f6e2-007';
// Rate precision (9 decimals)
const RATE_PRECISION = 1000000000;
// Known balance from blockchain explorer (1146.03 CSPR)
const KNOWN_BALANCE_MOTES = 1146030000000;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Return hardcoded value (RPC is too slow and times out)
  return res.status(200).json({
    exchangeRate: RATE_PRECISION,
    totalPool: KNOWN_BALANCE_MOTES,
    totalStcspr: KNOWN_BALANCE_MOTES,
    exchangeRateFormatted: '1.0000',
    totalPoolCspr: KNOWN_BALANCE_MOTES / RATE_PRECISION,
    totalStcsprFormatted: KNOWN_BALANCE_MOTES / RATE_PRECISION,
    timestamp: new Date().toISOString(),
    source: 'hardcoded',
    purseUref: CONTRACT_PURSE_UREF
  });
};
