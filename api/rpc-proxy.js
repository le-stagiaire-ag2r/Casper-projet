/**
 * Vercel Serverless Function - RPC Proxy
 * This proxy forwards RPC requests to Casper Network to avoid CORS issues
 */

const CASPER_RPC_URL = 'https://node.testnet.casper.network/rpc';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // In production, replace with your domain
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type')
      .end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    console.log('📡 Proxying RPC request to Casper Network...');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    // Forward the request to Casper RPC
    const response = await fetch(CASPER_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    console.log('✅ RPC response received');
    console.log('Response status:', response.status);

    // Return the RPC response with CORS headers
    return res.status(response.status)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Content-Type', 'application/json')
      .json(data);

  } catch (error) {
    console.error('❌ RPC Proxy Error:', error);

    return res.status(500)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Content-Type', 'application/json')
      .json({
        error: 'Failed to proxy RPC request',
        message: error.message,
        details: error.toString()
      });
  }
}
