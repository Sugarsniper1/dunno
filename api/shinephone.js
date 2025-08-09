import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const params = {
      action: 'login',
      userName: process.env.SHINE_USERNAME,
      userPassword: process.env.SHINE_PASSWORD,
      language: 'en',
      isWeb: 'true',
      client: 'ios',
      region: process.env.SHINE_REGION || 'romania',
      v: '4.0.2',
      devcode: process.env.SHINE_DEVCODE,
      serialNum: process.env.SHINE_SERIAL
    };

    const response = await fetch('https://server.growatt.com/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_1 like Mac OS X)'
      },
      body: new URLSearchParams(params).toString()
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      return res.status(500).json({
        error: 'ShinePhone returned non-JSON response',
        raw: text
      });
    }

    return res.status(200).json({
      success: true,
      debug: {
        httpStatus: response.status,
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

