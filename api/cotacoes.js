// api/cotacoes.js — VERSÃO 9 (HISTÓRICO: Dados de 7 dias para mini-gráficos)
// Fontes:
//   • Câmbio e Metais: AwesomeAPI (Tempo Real + Histórico)
//   • Criptomoedas: CoinGecko Public API (Histórico de 7 dias)
//   • Índices e Petróleo: Yahoo Finance Chart API (Histórico de 7 dias)

export default async function handler(req, res) {
  try {
    // ── 1. BUSCAR CÂMBIO E METAIS (AwesomeAPI) ──────────────────────────────
    // Cotações atuais
    const awesomeRes = await fetch(
      "https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,XAU-BRL,XAG-BRL"
    );
    const awesomeData = awesomeRes.ok ? await awesomeRes.json() : null;

    // Histórico de 7 dias (AwesomeAPI)
    const getHistory = async (pair) => {
      try {
        const r = await fetch(`https://economia.awesomeapi.com.br/json/daily/${pair}/7`);
        if (!r.ok) return [];
        const d = await r.json();
        return d.map(i => ({ value: parseFloat(i.bid), date: i.timestamp })).reverse();
      } catch { return []; }
    };

    const [histUSD, histEUR, histXAU, histXAG] = await Promise.all([
      getHistory("USD-BRL"),
      getHistory("EUR-BRL"),
      getHistory("XAU-BRL"),
      getHistory("XAG-BRL")
    ]);

    // ── 2. BUSCAR CRIPTO (CoinGecko) ─────────────────────────────────────────
    const cgRes = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=brl&include_24hr_change=true"
    );
    const cg = cgRes.ok ? await cgRes.json() : {};

    const getCgHistory = async (id) => {
      try {
        const r = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=brl&days=7&interval=daily`);
        if (!r.ok) return [];
        const d = await r.json();
        return d.prices.map(p => ({ value: p[1], date: p[0] }));
      } catch { return []; }
    };

    const [histBTC, histETH] = await Promise.all([
      getCgHistory("bitcoin"),
      getCgHistory("ethereum")
    ]);

    // ── 3. BUSCAR ÍNDICES E COMMODITIES (Yahoo Finance) ──────────────────────
    const symbols = ["^GSPC", "^IXIC", "^BVSP", "BZ=F"];
    const yfResults = {};

    for (const symbol of symbols) {
      try {
        // range=7d para pegar o histórico da semana
        const yfRes = await fetch(
          `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=7d&interval=1d`,
          {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              "Accept": "application/json",
            },
          }
        );

        if (yfRes.ok) {
          const yfData = await yfRes.json();
          const resObj = yfData.chart?.result?.[0];
          if (resObj) {
            const prices = resObj.indicators.quote[0].close;
            const timestamps = resObj.timestamp;
            yfResults[symbol] = {
              price: resObj.meta.regularMarketPrice,
              prevClose: resObj.meta.chartPreviousClose,
              history: timestamps.map((t, i) => ({ value: prices[i], date: t })).filter(h => h.value !== null)
            };
          }
        }
      } catch (e) {
        console.warn(`Aviso: Falha ao buscar ${symbol}:`, e.message);
      }
    }

    // ── MONTAGEM DO OBJETO DE RESPOSTA ───────────────────────────────────
    const data = {};

    // CÂMBIO E METAIS
    if (awesomeData) {
      const mapAwesome = (key, hist) => {
        if (!awesomeData[key]) return;
        data[key] = {
          bid: parseFloat(awesomeData[key].bid).toFixed(4),
          pctChange: parseFloat(awesomeData[key].pctChange).toFixed(2),
          name: awesomeData[key].name,
          history: hist
        };
      };
      mapAwesome("USDBRL", histUSD);
      mapAwesome("EURBRL", histEUR);
      mapAwesome("XAUBRL", histXAU);
      mapAwesome("XAGBRL", histXAG);
    }

    // CRIPTO
    data.BTCBRL = {
      bid: cg.bitcoin?.brl?.toFixed(2) || "0",
      pctChange: cg.bitcoin?.brl_24h_change?.toFixed(2) || "0.00",
      name: "Bitcoin/Real",
      history: histBTC
    };
    data.ETHBRL = {
      bid: cg.ethereum?.brl?.toFixed(2) || "0",
      pctChange: cg.ethereum?.brl_24h_change?.toFixed(2) || "0.00",
      name: "Ethereum/Real",
      history: histETH
    };

    // ÍNDICES E PETRÓLEO
    const mapYf = (id, key) => {
      const y = yfResults[id];
      data[key] = {
        bid: y?.price?.toFixed(2) || "0",
        pctChange: y ? (((y.price - y.prevClose) / y.prevClose) * 100).toFixed(2) : "0.00",
        name: id,
        history: y?.history || []
      };
    };
    mapYf("^GSPC", "SPX");
    mapYf("^IXIC", "NAS");
    mapYf("^BVSP", "IBOV");
    mapYf("BZ=F", "OIL");

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (e) {
    console.error("Erro geral cotacoes:", e.message);
    res.status(500).json({ error: "Erro interno", detail: e.message });
  }
}
