/**
 * Development proxy for local testing
 * This proxies /api/account requests to fetch from Casper RPC directly
 * Only used during local development (npm start)
 */

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Custom handler for /api/account to fetch main purse
  app.get('/api/account', async (req, res) => {
    const { publicKey } = req.query;

    if (!publicKey) {
      return res.status(400).json({ error: 'publicKey is required' });
    }

    try {
      const fetch = require('node-fetch');
      const rpcUrl = 'https://rpc.testnet.casperlabs.io/rpc';

      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'state_get_account_info',
          params: { public_key: publicKey },
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
      console.error('Proxy error:', err);
      return res.status(500).json({ error: err.message });
    }
  });
};
