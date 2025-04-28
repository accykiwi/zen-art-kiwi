// /api/proxy-price.js

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Only GET method allowed' });
  }

  const mint = req.query.mint;
  if (!mint) {
    return res.status(400).json({ message: 'Mint address missing' });
  }

  try {
    const response = await fetch(`https://price.jup.ag/v4/price?ids=${mint}`);
    if (!response.ok) {
      console.error(`Jupiter price API error: ${response.status}`);
      return res.status(502).json({ message: 'Bad Gateway to Jupiter' });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
