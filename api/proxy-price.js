export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Only GET allowed' });
  }

  const mint = req.query.mint;
  if (!mint) {
    return res.status(400).json({ message: 'Missing mint address' });
  }

  try {
    const response = await fetch(`https://price.jup.ag/v4/price?ids=${mint}`);
    if (!response.ok) {
      return res.status(502).json({ message: 'Failed to fetch from Jupiter' });
    }
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error proxying price:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
