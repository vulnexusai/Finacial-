export default async function handler(req, res) {
  try {
    const coins = "USD-BRL,EUR-BRL,BTC-BRL,ETH-BRL";
    const r = await fetch(
      `https://economia.awesomeapi.com.br/json/last/${coins}`
    );

    if (!r.ok) {
      return res.status(502).json({ error: "Falha ao buscar cotações" });
    }

    const data = await r.json();
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=30");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (e) {
    console.error("Erro cotacoes:", e);
    res.status(500).json({ error: "Erro interno" });
  }
}
