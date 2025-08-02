export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    action,
    usr,
    token,
    devcode,
    serialNum,
    client,
    language,
    region,
    v,
    isWeb,
    userName,
    userPassword,
  } = req.body || {};

  let url = '';
  let method = 'POST';
  let headers = {};
  let body = '';

  try {
    if (action === 'login') {
      url = 'https://eu.shinemonitor.com/user/login';
      headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };
      body = new URLSearchParams({
        userName,
        userPassword,
        language: language || 'en',
        isWeb: isWeb || 'true',
        client: client || 'ios',
      }).toString();
    } else if (action === 'queryDeviceRealTimeKpis') {
      url = 'https://eu.shinemonitor.com/device/queryDeviceRealTimeKpis';
      headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };
      body = new URLSearchParams({
        action,
        usr,
        token,
        devcode,
        serialNum,
        client: client || 'ios',
        language: language || 'en',
        region: region || 'eu',
        v: v || '4.0.2',
        isWeb: isWeb || 'true',
        timestamp: Math.floor(Date.now() / 1000),
      }).toString();
    } else {
      return res.status(400).json({ error: 'Unsupported action' });
    }

    const shinePhoneResponse = await fetch(url, {
      method,
      headers,
      body,
    });

    const json = await shinePhoneResponse.json();

    return res.status(200).json({
      success: true,
      debug: {
        httpStatus: shinePhoneResponse.status,
        testDevice: devcode,
        apiParams: Object.fromEntries(new URLSearchParams(body)),
        shinePhoneResponse: json,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
