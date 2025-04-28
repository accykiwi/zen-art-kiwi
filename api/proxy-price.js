export default async function handler(req, res) {
  const { mint } = req.query;

  if (!mint) {
    return res.status(400).json({ message: 'Missing mint address' });
  }

  try {
    const apiResponse = await fetch(`https://public-api.birdeye.so/market/token_price?address=${mint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer 5e03e241b51b4ed3946001c68634ddcf`,
        'Accept': 'application/json'
      }
    });

    if (!apiResponse.ok) {
      const text = await apiResponse.text();
      console.error('Birdeye error response:', text);
      return res.status(apiResponse.status).json({ error: 'Birdeye API failed', details: text });
    }

    const data = await apiResponse.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Proxy server error:', error);
    return res.status(500).json({ error: 'Internal Server Error (proxy)' });
  }
}
