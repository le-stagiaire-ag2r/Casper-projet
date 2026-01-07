// V22 Contract main purse URef
const CONTRACT_PURSE_UREF = 'uref-3e8ff29a521e5902bcfc106c2e1fe94aa29fa8a6246ed1fe375d350f5d34f6e2-007';
const PURSE_HASH = '3e8ff29a521e5902bcfc106c2e1fe94aa29fa8a6246ed1fe375d350f5d34f6e2';
// Rate precision (9 decimals)
const RATE_PRECISION = 1000000000;
// Fallback balance
const FALLBACK_BALANCE = 1146030000000;

// CSPR.click proxy for Cloud API (faster and more reliable)
const CSPR_CLICK_PROXY = 'https://accounts.cspr.click/api/cloud-proxy';

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

  try {
    // Try CSPR.click proxy for Cloud API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      CSPR_CLICK_PROXY + '/accounts/' + PURSE_HASH + '/balance',
      {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.data && data.data.balance) {
        totalPool = parseInt(data.data.balance, 10);
        source = 'cspr_click_proxy';
      }
    }
  } catch (e) {
    console.log('CSPR.click proxy error, using fallback:', e.message);
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
    purseUref: CONTRACT_PURSE_UREF
  });
};
