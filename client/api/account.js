/**
 * Vercel Serverless Function to fetch Casper account info
 * Proxies requests to avoid CORS issues
 */

// Force Node.js 18 runtime for native fetch support
export const config = {
  runtime: 'nodejs18.x',
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { publicKey } = req.query;

  if (!publicKey) {
    return res.status(400).json({ error: 'publicKey is required' });
  }

  try {
    // Use Casper testnet RPC - try multiple endpoints
    const rpcUrls = [
      'https://rpc.testnet.casperlabs.io/rpc',
      'https://node-clarity-testnet.make.services/rpc',
    ];

    let lastError = null;
    for (const rpcUrl of rpcUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'state_get_account_info',
            params: {
              public_key: publicKey,
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          lastError = new Error(`HTTP ${response.status}`);
          continue;
        }

        const data = await response.json();

        if (data.error) {
          lastError = new Error(data.error.message);
          continue;
        }

        const mainPurse = data.result?.account?.main_purse;
        if (!mainPurse) {
          return res.status(404).json({ error: 'Could not find main purse' });
        }

        return res.status(200).json({ main_purse: mainPurse });
      } catch (err) {
        lastError = err;
        console.error(`RPC ${rpcUrl} failed:`, err.message);
        continue;
      }
    }

    return res.status(500).json({ error: lastError?.message || 'All RPC endpoints failed' });
  } catch (err) {
    console.error('Error fetching account:', err);
    return res.status(500).json({ error: err.message });
  }
}
