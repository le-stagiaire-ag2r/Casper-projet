import type { VercelRequest, VercelResponse } from '@vercel/node';

const CASPER_API = 'https://event-store-api-clarity-mainnet.make.services';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const limit = req.query.limit || '100';
    const page = req.query.page || '1';

    const response = await fetch(
      `${CASPER_API}/validators?page=${page}&limit=${limit}&order_direction=DESC&order_by=total_stake`
    );

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();

    // Transform data to our format
    const validators = data.data?.map((v: any) => ({
      publicKey: v.public_key,
      name: v.account_info?.info?.owner?.name || `Validator ${v.public_key.substring(0, 8)}...`,
      stake: parseFloat(v.total_stake) / 1e9,
      delegators: v.delegators_number || 0,
      fee: v.fee ? v.fee / 100 : 0,
      isActive: v.is_active,
      selfStake: parseFloat(v.self_stake || 0) / 1e9,
      networkShare: v.network_share ? parseFloat(v.network_share) : 0,
    })) || [];

    // Calculate network stats
    let totalStaked = 0;
    let totalDelegators = 0;
    let activeValidators = 0;

    data.data?.forEach((v: any) => {
      totalStaked += parseFloat(v.total_stake || 0);
      totalDelegators += v.delegators_number || 0;
      if (v.is_active) activeValidators++;
    });

    return res.status(200).json({
      validators,
      stats: {
        totalStaked: totalStaked / 1e9,
        totalDelegators,
        activeValidators,
        totalValidators: data.data?.length || 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Validators API error:', error);
    return res.status(500).json({
      error: 'Failed to fetch validators',
      message: error.message,
    });
  }
}
