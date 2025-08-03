export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { plantId, type, date, token } = req.query;

  if (!plantId || !type || !date || !token) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const url = `https://server.growatt.com/v1/plant/getEnergyTrend?plantId=${plantId}&type=${type}&date=${date}`;

    const response = await fetch(url, {
      headers: {
        'token': token
      }
    });

    const data = await response.json();

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch energy trend',
      details: error.message
    });
  }
}
