export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const isForm = req.headers['content-type'] === 'application/x-www-form-urlencoded';
  const body = isForm ? Object.fromEntries(new URLSearchParams(req.body)) : req.body;

  const action = body.action;

  // ✅ Solo per le chiamate diverse da 'login', richiedi token e username
  if (action !== 'login') {
    const token = body.token;
    const username = body.usr || body.username || body.userName;

    if (!token) return res.status(400).json({ error: 'Token mancante' });
    if (!username) return res.status(400).json({ error: 'Username mancante' });
  }

  // 🔧 Imposta devcode se manca (solo test)
  const testDevice = 'GPG0CLU18P';
  if (!body.devcode && action !== 'login') {
    body.devcode = testDevice;
  }

  // 🕒 Aggiungi timestamp se non presente
  if (!body.timestamp) {
    body.timestamp = Date.now();
  }

  // 🔁 Invia la richiesta a ShinePhone
  const shineRes = await fetch('https://api.shinemonitor.com/public', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body).toString(),
  });

  const shineData = await shineRes.json();

  return res.status(200).json({
    success: true,
    debug: {
      httpStatus: shineRes.status,
      apiParams: body,
      shinePhoneResponse: shineData,
    },
    timestamp: new Date().toISOString(),
  });
}

