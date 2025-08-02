export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { action, token, username } = req.body;

    // Log base
    console.log('🔍 REQUEST BODY:', JSON.stringify(req.body, null, 2));
    console.log('🔑 Token:', token ? token.substring(0, 8) + '...' : 'MISSING');
    console.log('👤 Username:', username || 'MISSING');

    // Validazioni
    if (!token) return res.status(400).json({ error: 'Token mancante' });
    if (!username) return res.status(400).json({ error: 'Username mancante' });

    const fetch = (await import('node-fetch')).default;

    const testDevice = 'GPG0CLU18P';
    const timestamp = Math.floor(Date.now() / 1000);

const params = {
  action: 'queryDeviceRealTimeKpis',
  usr: username,
  token: token,
  devcode: testDevice,
  client: 'ios',
  language: 'en',
  timestamp: Date.now()
};

    console.log('📡 API Params:', JSON.stringify(params, null, 2));

    const response = await fetch('https://api.shinemonitor.com/public/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'AxinteleDebug/1.0'
      },
      body: new URLSearchParams(params)
    });

    console.log('📡 HTTP Status:', response.status);
    console.log('📡 HTTP Headers:', JSON.stringify([...response.headers.entries()]));

    const data = await response.json();
    console.log('📦 ShinePhone Response:', JSON.stringify(data, null, 2));

    return res.status(200).json({
      success: true,
      debug: {
        httpStatus: response.status,
        testDevice,
        apiParams: params,
        shinePhoneResponse: data
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 ERROR:', error);
    return res.status(500).json({
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}
