export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  const url = "https://eu5.fusionsolar.huawei.com/thirdData/login.json"; // oppure l’URL giusto ShinePhone, se diverso

  try {
    const params = new URLSearchParams(req.body);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return res.status(200).json({ success: true, data });
    } else {
      const text = await response.text();
      return res.status(500).json({
        error: "Unexpected content-type from ShinePhone",
        contentType,
        rawText: text,
      });
    }
  } catch (error) {
    console.error("Errore nella chiamata:", error);
    return res.status(500).json({ error: "Errore interno", details: error.message });
  }
}
