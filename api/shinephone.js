export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { action, token, username } = req.body;

    console.log('🔍 REQUEST BODY:', JSON.stringify(req.body, null, 2));
    console.log('🔑 Token:', token ? token.substring(0, 8) + '...' : 'MISSING');
    console.log('👤 Username:', username || 'MISSING');

    if (!token) return res.status(400).json({ error: 'Token mancante' });
    if (!username) return res.status(400).json({ error: 'Username mancante' });

    const fetch = (await import('node-fetch')).default;
    const testDevice = 'GPG0CLU18P';

    const params = {
      action: 'queryDeviceRealTimeKpis',
      usr: username,
      timestamp: Math.floor(Date.now() / 1000),
      token: token,
      devcode: testDevice
    };

    const response = await fetch('https://api.shinemonitor.com/public/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'AxinteleDebug/1.0'
      },
      body: new URLSearchParams(params)
    });

    const data = await response.json();

    return res.status(200).json({
      success: true,
      debug: {
        httpStatus: response.status,
        testDevice: testDevice,
        apiParams: params,
        shinePhoneResponse: data
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}
