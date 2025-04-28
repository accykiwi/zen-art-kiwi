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
      // Jupiter did not find a price
      return res.status(404).json({ message: `No price found for ${mint}` });
    }

    const data = await response.json();
    if (!data.data || !data.data[mint] || !data.data[mint].price) {
      // No price in the response
      return res.status(404).json({ message: `No price data for ${mint}` });
    }

    // Valid price found
    return res.status(200).json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
