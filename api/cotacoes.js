// api/cotacoes.js — VERSÃO 10 (ESTABILIDADE: Tratamento de erros e Fallback)
// Fontes:
//   • Câmbio e Metais: AwesomeAPI (Tempo Real + Histórico)
//   • Criptomoedas: CoinGecko Public API (Histórico de 7 dias)
//   • Índices e Petróleo: Yahoo Finance Chart API (Histórico de 7 dias)

export default async function handler(req, res) {
  try {
    // ── FUNÇÕES AUXILIARES ───────────────────────────────────────────────────
    const fetchSafe = async (url, options = {}, defaultValue = null) => {
      try {
        const r = await fetch(url, { ...options, timeout: 8000 });
        if (!r.ok) {
          console.warn(`Fetch falhou: ${url} Status: ${r.status}`);
          return defaultValue;
        }
        return await r.json();
      } catch (e) {
        console.error(`Erro ao buscar ${url}:`, e.message);
        return defaultValue;
      }
    };

    const pct = (now, prev) =>
      prev && prev !== 0 ? (((now - prev) / prev) * 100).toFixed(2) : "0.00";

    // ── 1. BUSCAR CÂMBIO E METAIS (AwesomeAPI) ──────────────────────────────
    // Tentar buscar cotações atuais
    const awesomeData = await fetchSafe(
      "https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,XAU-BRL,XAG-BRL",
      {},
      null
    );

    // Buscar histórico de forma sequencial ou com delay se necessário para evitar 429
    // Para simplificar e garantir estabilidade, buscamos apenas se o principal funcionar
    const getHistory = async (pair) => {
      return await fetchSafe(`https://economia.awesomeapi.com.br/json/daily/${pair}/7`, {}, [])
        .then(d => Array.isArray(d) ? d.map(i => ({ value: parseFloat(i.bid), date: i.timestamp })).reverse() : []);
    };

    // ── 2. BUSCAR CRIPTO (CoinGecko) ─────────────────────────────────────────
    const cg = await fetchSafe(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=brl&include_24hr_change=true",
      {},
      {}
    );

    const getCgHistory = async (id) => {
      const d = await fetchSafe(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=brl&days=7&interval=daily`, {}, null);
      return d?.prices ? d.prices.map(p => ({ value: p[1], date: p[0] })) : [];
    };

    // ── 3. BUSCAR ÍNDICES E COMMODITIES (Yahoo Finance) ──────────────────────
    const symbols = ["^GSPC", "^IXIC", "^BVSP", "BZ=F"];
    const yfPromises = symbols.map(symbol => 
      fetchSafe(
        `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=7d&interval=1d`,
        { headers: { "User-Agent": "Mozilla/5.0" } },
        null
      )
    );

    // Executar buscas em paralelo para performance
    const [histUSD, histEUR, histXAU, histXAG, histBTC, histETH, ...yfRaw] = await Promise.all([
      getHistory("USD-BRL"),
      getHistory("EUR-BRL"),
      getHistory("XAU-BRL"),
      getHistory("XAG-BRL"),
      getCgHistory("bitcoin"),
      getCgHistory("ethereum"),
      ...yfPromises
    ]);

    const yfResults = {};
    symbols.forEach((symbol, index) => {
      const resObj = yfRaw[index]?.chart?.result?.[0];
      if (resObj) {
        const prices = resObj.indicators.quote[0].close;
        const timestamps = resObj.timestamp;
        yfResults[symbol] = {
          price: resObj.meta.regularMarketPrice,
          prevClose: resObj.meta.chartPreviousClose,
          history: timestamps.map((t, i) => ({ value: prices[i], date: t })).filter(h => h.value !== null)
        };
      }
    });

    // ── MONTAGEM DO OBJETO DE RESPOSTA ───────────────────────────────────
    const data = {};

    // CÂMBIO E METAIS (AwesomeAPI)
    const pairs = { "USDBRL": histUSD, "EURBRL": histEUR, "XAUBRL": histXAU, "XAGBRL": histXAG };
    Object.entries(pairs).forEach(([key, hist]) => {
      if (awesomeData?.[key]) {
        data[key] = {
          bid: parseFloat(awesomeData[key].bid).toFixed(key.includes("BRL") && key.length <= 6 ? 4 : 2),
          pctChange: parseFloat(awesomeData[key].pctChange).toFixed(2),
          name: awesomeData[key].name,
          history: hist
        };
      } else {
        // Fallback se a AwesomeAPI falhar (preços zerados mas não quebra o site)
        data[key] = { bid: "0.00", pctChange: "0.00", name: key, history: [] };
      }
    });

    // CRIPTO
    data.BTCBRL = {
      bid: cg.bitcoin?.brl?.toFixed(2) || "0.00",
      pctChange: cg.bitcoin?.brl_24h_change?.toFixed(2) || "0.00",
      name: "Bitcoin/Real",
      history: histBTC
    };
    data.ETHBRL = {
      bid: cg.ethereum?.brl?.toFixed(2) || "0.00",
      pctChange: cg.ethereum?.brl_24h_change?.toFixed(2) || "0.00",
      name: "Ethereum/Real",
      history: histETH
    };

    // ÍNDICES E PETRÓLEO
    const yfMap = { "^GSPC": "SPX", "^IXIC": "NAS", "^BVSP": "IBOV", "BZ=F": "OIL" };
    Object.entries(yfMap).forEach(([id, key]) => {
      const y = yfResults[id];
      data[key] = {
        bid: y?.price?.toFixed(id === "^BVSP" ? 0 : 2) || "0.00",
        pctChange: y ? pct(y.price, y.prevClose) : "0.00",
        name: id,
        history: y?.history || []
      };
    });

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (e) {
    console.error("Erro crítico cotacoes:", e.message);
    res.status(500).json({ error: "Erro interno", detail: e.message });
  }
}
