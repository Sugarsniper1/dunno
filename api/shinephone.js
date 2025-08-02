// api/shinephone.js

import querystring from 'querystring';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Supporto JSON e x-www-form-urlencoded
    const body = req.headers['content-type'] === 'application/x-www-form-urlencoded'
      ? querystring.parse(await new Promise((resolve, reject) => {
          let raw = '';
          req.on('data', chunk => raw += chunk);
          req.on('end', () => resolve(raw));
          req.on('error', reject);
        }))
      : req.body;

    const {
      action = 'queryDeviceRealTimeKpis',
      token,
      username,
      usr,
      devcode = 'GPG0CLU18P',
      serialNum = 'GPG0CLU18P',
      client = 'ios',
      language = 'en',
      region = 'eu',
      v = '4.0.2',
      isWeb = 'true',
      timestamp = Math.floor(Date.now() / 1000)
    } = body;

    const finalUsername = username || usr;

    // Log di debug
    console.log('🔍 BODY:', JSON.stringify(body, null, 2));
    console.log('🔑 Token:', token?.substring(0, 8) + '...');
    console.log('👤 Username:', finalUsername);
    console.log('📟 Device:', devcode);

    if (!token) return res.status(400).json({ error: 'Token mancante' });
    if (!finalUsername) return res.status(400).json({ error: 'Username mancante' });

    // Import dinamico di fetch (compatibile con Vercel)
    const fetch = (await import('node-fetch')).default;

    const params = {
      action,
      usr: finalUsername,
      token,
      devcode,
      serialNum,
      client,
      language,
      region,
      v,
      isWeb,
      timestamp
    };

    // Chiamata a ShinePhone
    const response = await fetch('https://api.shinemonitor.com/public/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Axintele/1.0'
      },
      body: new URLSearchParams(params)
    });

    const data = await response.json();

    return res.status(200).json({
      success: true,
      debug: {
        httpStatus: response.status,
        testDevice: devcode,
        apiParams: params,
        shinePhoneResponse: data
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 ERRORE:', error);
    return res.status(500).json({
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}
