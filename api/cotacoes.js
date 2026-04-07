// api/cotacoes.js — versão corrigida
// Substitui a AwesomeAPI (que retorna 429/QuotaExceeded) por:
//   • Câmbio (USD/BRL, EUR/BRL): fawazahmed0 Currency API (via jsDelivr CDN) — sem chave, sem limite
//   • Cripto (BTC/BRL, ETH/BRL): CoinGecko API pública — sem chave, limite generoso

export default async function handler(req, res) {
  try {
    // ── 1. Buscar câmbio: hoje e ontem (para calcular pctChange) ──────────────
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const ymd = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    const [fxTodayRes, fxYestRes] = await Promise.all([
      fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json`),
      fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${ymd(yesterday)}/v1/currencies/usd.json`),
    ]);

    if (!fxTodayRes.ok || !fxYestRes.ok) {
      return res.status(502).json({ error: "Falha ao buscar câmbio" });
    }

    const fxToday = await fxTodayRes.json();
    const fxYest = await fxYestRes.json();

    const usdBrlToday = fxToday.usd.brl;
    const usdBrlYest = fxYest.usd.brl;
    const eurBrlToday = fxToday.usd.eur ? (1 / fxToday.usd.eur) * usdBrlToday : null;
    const eurBrlYest = fxYest.usd.eur ? (1 / fxYest.usd.eur) * usdBrlYest : null;

    const pct = (now, prev) =>
      prev && prev !== 0 ? (((now - prev) / prev) * 100).toFixed(2) : "0.00";

    // ── 2. Buscar cripto via CoinGecko ────────────────────────────────────────
    const cgRes = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=brl&include_24hr_change=true`,
      { headers: { Accept: "application/json" } }
    );

    if (!cgRes.ok) {
      return res.status(502).json({ error: "Falha ao buscar cripto" });
    }

    const cg = await cgRes.json();
    const btcBrl = cg.bitcoin?.brl;
    const btcChg = cg.bitcoin?.brl_24h_change?.toFixed(2) ?? "0.00";
    const ethBrl = cg.ethereum?.brl;
    const ethChg = cg.ethereum?.brl_24h_change?.toFixed(2) ?? "0.00";

    // ── 3. Montar resposta no mesmo formato que o App.jsx espera ─────────────
    // O frontend usa: marketData[key.replace("-","")] → v.bid e v.pctChange
    const data = {
      USDBRL: {
        bid: usdBrlToday.toFixed(4),
        ask: usdBrlToday.toFixed(4),
        pctChange: pct(usdBrlToday, usdBrlYest),
        high: usdBrlToday.toFixed(4),
        low: usdBrlToday.toFixed(4),
        name: "Dólar Americano/Real Brasileiro",
      },
      EURBRL: {
        bid: eurBrlToday ? eurBrlToday.toFixed(4) : "0",
        ask: eurBrlToday ? eurBrlToday.toFixed(4) : "0",
        pctChange: eurBrlToday ? pct(eurBrlToday, eurBrlYest) : "0.00",
        high: eurBrlToday ? eurBrlToday.toFixed(4) : "0",
        low: eurBrlToday ? eurBrlToday.toFixed(4) : "0",
        name: "Euro/Real Brasileiro",
      },
      BTCBRL: {
        bid: btcBrl?.toFixed(2) ?? "0",
        ask: btcBrl?.toFixed(2) ?? "0",
        pctChange: btcChg,
        high: btcBrl?.toFixed(2) ?? "0",
        low: btcBrl?.toFixed(2) ?? "0",
        name: "Bitcoin/Real Brasileiro",
      },
      ETHBRL: {
        bid: ethBrl?.toFixed(2) ?? "0",
        ask: ethBrl?.toFixed(2) ?? "0",
        pctChange: ethChg,
        high: ethBrl?.toFixed(2) ?? "0",
        low: ethBrl?.toFixed(2) ?? "0",
        name: "Ethereum/Real Brasileiro",
      },
    };

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=30");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (e) {
    console.error("Erro cotacoes:", e.message);
    res.status(500).json({ error: "Erro interno", detail: e.message });
  }
}
