// api/cotacoes.js — VERSÃO 11 (ESTABILIDADE: Redundância e Proteção contra 429)
export default async function handler(req, res) {
  // Cache de 30 segundos na Vercel para evitar 429 excessivos
  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const fetchSafe = async (url, options = {}, defaultValue = null) => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 8000);
      const r = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      if (!r.ok) return defaultValue;
      return await r.json();
    } catch (e) {
      return defaultValue;
    }
  };

  const getHistory = async (pair) => {
    // Busca apenas se solicitado para reduzir carga
    const d = await fetchSafe(`https://economia.awesomeapi.com.br/json/daily/${pair}/7`, {}, []);
    return Array.isArray(d) ? d.map(i => ({ value: parseFloat(i.bid), date: i.timestamp })).reverse() : [];
  };

  try {
    // ── 1. BUSCAR CÂMBIO E METAIS (AwesomeAPI) ──────────────────────────────
    const awesomeData = await fetchSafe("https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,XAU-BRL,XAG-BRL");

    // Fallback de emergência para moedas se AwesomeAPI falhar (429)
    let fallbackFx = null;
    if (!awesomeData) {
      fallbackFx = await fetchSafe("https://latest.currency-api.pages.dev/v1/currencies/usd.json");
    }

    // ── 2. BUSCAR CRIPTO (CoinGecko) ─────────────────────────────────────────
    const cg = await fetchSafe("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=brl&include_24hr_change=true", {}, {});

    // ── 3. BUSCAR ÍNDICES (Yahoo Finance) ────────────────────────────────────
    const symbols = ["^GSPC", "^IXIC", "^BVSP", "BZ=F"];
    const yfPromises = symbols.map(s => fetchSafe(`https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s)}?range=7d&interval=1d`, { headers: { "User-Agent": "Mozilla/5.0" } }));
    const yfRaw = await Promise.all(yfPromises);

    const data = {};

    // Processar Câmbio e Metais
    const pairs = { "USDBRL": "USD-BRL", "EURBRL": "EUR-BRL", "XAUBRL": "XAU-BRL", "XAGBRL": "XAG-BRL" };
    for (const [key, pair] of Object.entries(pairs)) {
      if (awesomeData?.[key]) {
        data[key] = {
          bid: parseFloat(awesomeData[key].bid).toFixed(key.includes("XAU") ? 2 : 4),
          pctChange: parseFloat(awesomeData[key].pctChange).toFixed(2),
          name: awesomeData[key].name,
          history: await getHistory(pair)
        };
      } else if (fallbackFx && (key === "USDBRL" || key === "EURBRL")) {
        const rate = key === "USDBRL" ? fallbackFx.usd.brl : (fallbackFx.usd.brl / fallbackFx.usd.eur);
        data[key] = { bid: rate.toFixed(4), pctChange: "0.00", name: key, history: [] };
      } else {
        data[key] = { bid: "0.00", pctChange: "0.00", name: key, history: [] };
      }
    }

    // Processar Cripto
    data.BTCBRL = { bid: cg.bitcoin?.brl?.toString() || "0.00", pctChange: cg.bitcoin?.brl_24h_change?.toFixed(2) || "0.00", name: "Bitcoin/Real", history: [] };
    data.ETHBRL = { bid: cg.ethereum?.brl?.toString() || "0.00", pctChange: cg.ethereum?.brl_24h_change?.toFixed(2) || "0.00", name: "Ethereum/Real", history: [] };

    // Processar Yahoo
    const yfMap = { "^GSPC": "SPX", "^IXIC": "NAS", "^BVSP": "IBOV", "BZ=F": "OIL" };
    yfRaw.forEach((res, i) => {
      const obj = res?.chart?.result?.[0];
      const key = yfMap[symbols[i]];
      if (obj) {
        const prices = obj.indicators.quote[0].close;
        data[key] = {
          bid: obj.meta.regularMarketPrice.toString(),
          pctChange: (((obj.meta.regularMarketPrice - obj.meta.chartPreviousClose) / obj.meta.chartPreviousClose) * 100).toFixed(2),
          name: symbols[i],
          history: obj.timestamp.map((t, idx) => ({ value: prices[idx], date: t })).filter(h => h.value)
        };
      } else {
        data[key] = { bid: "0.00", pctChange: "0.00", name: symbols[i], history: [] };
      }
    });

    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: "Erro interno" });
  }
}
