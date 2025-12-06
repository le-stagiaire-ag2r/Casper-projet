import type { VercelRequest, VercelResponse } from '@vercel/node';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // Cache for 60 seconds
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get days parameter (default 7) - "max" means all time since CSPR creation
    const daysParam = req.query.days as string;
    const isMax = daysParam === 'max';
    const days = isMax ? 0 : (parseInt(daysParam) || 7);
    const validDays = isMax ? 'max' : Math.min(Math.max(days, 1), 365); // Clamp between 1 and 365, or "max"

    // Fetch current price
    const priceResponse = await fetch(
      `${COINGECKO_API}/simple/price?ids=casper-network&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`
    );

    if (!priceResponse.ok) {
      throw new Error(`CoinGecko API responded with status ${priceResponse.status}`);
    }

    const priceData = await priceResponse.json();
    const casper = priceData['casper-network'];

    // Fetch price history (dynamic days)
    // For "max", CoinGecko returns all available historical data
    const numericDays = isMax ? 9999 : validDays as number;
    const interval = numericDays <= 30 ? 'daily' : numericDays <= 90 ? 'daily' : '';
    const historyUrl = interval
      ? `${COINGECKO_API}/coins/casper-network/market_chart?vs_currency=usd&days=${validDays}&interval=${interval}`
      : `${COINGECKO_API}/coins/casper-network/market_chart?vs_currency=usd&days=${validDays}`;

    const historyResponse = await fetch(historyUrl);

    let history: { timestamp: number; price: number; date: string }[] = [];

    if (historyResponse.ok) {
      const historyData = await historyResponse.json();
      let rawPrices = historyData.prices || [];

      // For "max" (all time), downsample to weekly data to keep response manageable
      if (isMax && rawPrices.length > 200) {
        const step = Math.ceil(rawPrices.length / 200);
        rawPrices = rawPrices.filter((_: any, i: number) => i % step === 0 || i === rawPrices.length - 1);
      }

      history = rawPrices.map((p: [number, number]) => ({
        timestamp: p[0],
        price: p[1],
        date: new Date(p[0]).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: isMax ? '2-digit' : undefined
        }),
      }));
    }

    return res.status(200).json({
      price: casper?.usd || 0,
      change24h: casper?.usd_24h_change || 0,
      marketCap: casper?.usd_market_cap || 0,
      history,
      days: isMax ? 'max' : validDays,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Price API error:', error);

    // Return fallback data on error
    return res.status(200).json({
      price: 0.0055,
      change24h: 2.3,
      marketCap: 0,
      history: [],
      timestamp: new Date().toISOString(),
      fallback: true,
    });
  }
}
