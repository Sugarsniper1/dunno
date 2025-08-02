export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { action, token, username, deviceId } = req.body;
    console.log(`🔄 Axintele API: ${action}`);

    const fetch = (await import('node-fetch')).default;
    const devices = ['GPG0CLU18P', 'GPG0CLU1MG', 'GPG0CM50QX', 'GPG0CM50QF', 'GPG0CM50QK', 'GPG0CM50NX'];

    const callAPI = async (devcode = null) => {
      const params = {
        action: action || 'queryDeviceRealTimeKpis',
        usr: username,
        timestamp: Math.floor(Date.now() / 1000),
        token
      };
      if (devcode) params.devcode = devcode;

      const response = await fetch('https://api.shinemonitor.com/public/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(params)
      });
      return await response.json();
    };

    if (action === 'queryDeviceInfo') {
      return res.json({
        code: 0,
        dat: {
          info: {
            devname: 'Axintele 0.4MWp',
            nominalpower: 400000,
            location: 'Parc fotovoltaic Axintele, Romania'
          }
        }
      });
    }

    // Aggregazione dati da tutti i device
    const results = await Promise.allSettled(
      devices.map(device => callAPI(device))
    );

    const successful = results
      .filter(r => r.status === 'fulfilled' && r.value.code === 0)
      .map(r => r.value.dat.kpi)
      .filter(Boolean);

    if (successful.length === 0) {
      return res.status(500).json({ error: 'No devices responded' });
    }

    const aggregated = successful.reduce((acc, kpi) => ({
      pac: acc.pac + (parseFloat(kpi.pac) || 0),
      etdy: acc.etdy + (parseFloat(kpi.etdy) || 0),
      etot: acc.etot + (parseFloat(kpi.etot) || 0),
      pr: acc.pr + (parseFloat(kpi.pr) || 0),
      co2: acc.co2 + (parseFloat(kpi.co2) || 0),
      money: acc.money + (parseFloat(kpi.money) || 0),
      tmp: acc.tmp + (parseFloat(kpi.tmp) || 0),
      ghi: acc.ghi + (parseFloat(kpi.ghi) || 0),
      count: acc.count + 1
    }), { pac: 0, etdy: 0, etot: 0, pr: 0, co2: 0, money: 0, tmp: 0, ghi: 0, count: 0 });

    return res.json({
      code: 0,
      msg: 'success',
      dat: {
        kpi: {
          pac: Math.round(aggregated.pac),
          etdy: Math.round(aggregated.etdy),
          etot: Math.round(aggregated.etot),
          pr: Math.round((aggregated.pr / aggregated.count) * 100) / 100,
          co2: Math.round(aggregated.co2 * 100) / 100,
          money: Math.round(aggregated.money * 100) / 100,
          tim: Math.floor(Date.now() / 1000),
          status: aggregated.count === devices.length ? 'normal' : 'warning',
          tmp: Math.round((aggregated.tmp / aggregated.count) * 10) / 10,
          ghi: Math.round(aggregated.ghi / aggregated.count)
        }
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
