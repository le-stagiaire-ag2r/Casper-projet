/**
 * Vercel Serverless Function to fetch Casper account info
 * Proxies requests to avoid CORS issues
 */

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
    // Use Casper testnet RPC
    const rpcUrl = 'https://rpc.testnet.casperlabs.io/rpc';

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
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    const mainPurse = data.result?.account?.main_purse;
    if (!mainPurse) {
      return res.status(404).json({ error: 'Could not find main purse' });
    }

    return res.status(200).json({ main_purse: mainPurse });
  } catch (err) {
    console.error('Error fetching account:', err);
    return res.status(500).json({ error: err.message });
  }
}
