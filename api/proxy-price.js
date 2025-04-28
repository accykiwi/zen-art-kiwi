import fetch from 'node-fetch';  // <-- you must import this

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Only GET method allowed' });
  }

  const mint = req.query.mint;
  if (!mint) {
    return res.status(400).json({ message: 'Missing mint address' });
  }

  try {
    const response = await fetch(`https://price.jup.ag/v4/price?ids=${mint}`);
    if (!response.ok) {
      console.error(`Jupiter price API error: ${response.status}`);
      return res.status(502).json({ message: 'Bad Gateway from Jupiter' });
    }

    const data = await response.json();
    if (!data.data || !data.data[mint] || !data.data[mint].price) {
      return res.status(404).json({ message: `No price data for ${mint}` });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
