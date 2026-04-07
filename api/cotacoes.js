export default async function handler(req, res) {
  try {
    const coins = "USD-BRL,EUR-BRL,BTC-BRL,ETH-BRL";
    const r = await fetch(
      `https://economia.awesomeapi.com.br/json/last/${coins}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json",
        },
      }
    );

    if (!r.ok) {
      const txt = await r.text();
      console.error("AwesomeAPI status:", r.status, txt);
      return res.status(502).json({ error: "Falha ao buscar cotações", status: r.status });
    }

    const data = await r.json();
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=30");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (e) {
    console.error("Erro cotacoes:", e.message);
    res.status(500).json({ error: "Erro interno", detail: e.message });
  }
}
