const COINGECKO_API = 'https://api.coingecko.com/api/v3';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const daysParam = req.query.days;
    const isMax = daysParam === 'max';
    const days = isMax ? 0 : (parseInt(daysParam) || 7);
    const validDays = isMax ? 'max' : Math.min(Math.max(days, 1), 365);

    // Fetch current price
    const priceResponse = await fetch(
      COINGECKO_API + '/simple/price?ids=casper-network&vs_currencies=usd&include_24hr_change=true&include_market_cap=true'
    );

    if (!priceResponse.ok) {
      throw new Error('CoinGecko API error: ' + priceResponse.status);
    }

    const priceData = await priceResponse.json();
    const casper = priceData['casper-network'];

    // Fetch history
    const numericDays = isMax ? 9999 : validDays;
    const interval = numericDays <= 90 ? 'daily' : '';
    const historyUrl = interval
      ? COINGECKO_API + '/coins/casper-network/market_chart?vs_currency=usd&days=' + validDays + '&interval=' + interval
      : COINGECKO_API + '/coins/casper-network/market_chart?vs_currency=usd&days=' + validDays;

    const historyResponse = await fetch(historyUrl);
    let history = [];

    if (historyResponse.ok) {
      const historyData = await historyResponse.json();
      let rawPrices = historyData.prices || [];

      if (isMax && rawPrices.length > 200) {
        const step = Math.ceil(rawPrices.length / 200);
        rawPrices = rawPrices.filter(function(_, i) {
          return i % step === 0 || i === rawPrices.length - 1;
        });
      }

      history = rawPrices.map(function(p) {
        return {
          timestamp: p[0],
          price: p[1],
          date: new Date(p[0]).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })
        };
      });
    }

    return res.status(200).json({
      price: casper && casper.usd ? casper.usd : 0,
      change24h: casper && casper.usd_24h_change ? casper.usd_24h_change : 0,
      marketCap: casper && casper.usd_market_cap ? casper.usd_market_cap : 0,
      history: history,
      days: isMax ? 'max' : validDays,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Price API error:', error);
    return res.status(200).json({
      price: 0.0055,
      change24h: 2.3,
      marketCap: 0,
      history: [],
      timestamp: new Date().toISOString(),
      fallback: true
    });
  }
};
