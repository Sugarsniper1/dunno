const fetch = (await import('node-fetch')).default;

export default async function handler(req, res) {
  try {
    const { action = 'login' } = req.body;

    if (action !== 'login') {
      return res.status(400).json({ error: 'Azione non supportata' });
    }

    // Dati fissi per il login ShinePhone
    const params = {
      action: 'login',
      userName: 'dsf',
      userPassword: '123456',
      language: 'en',
      isWeb: 'true',
      client: 'ios',
      region: 'eu',
      v: '4.0.2',
      devcode: 'GPG0CLU18P',
      serialNum: 'GPG0CLU18P'
    };

    const url = 'https://server.growatt.com/login'; // endpoint ufficiale da guida API

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_1 like Mac OS X)'
      },
      body: new URLSearchParams(params)
    });

    const text = await response.text();

    // Prova a convertire in JSON, se possibile
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      return res.status(500).json({
        error: 'Risposta non valida da ShinePhone (non è un JSON)',
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
