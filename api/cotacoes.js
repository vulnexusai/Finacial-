// api/cotacoes.js — VERSÃO 6 (Com Variação Percentual Corrigida)
// Fontes:
//   • Câmbio e Metais: fawazahmed0 Currency API (com dados históricos de ontem)
//   • Criptomoedas: CoinGecko Public API
//   • Índices e Petróleo: Yahoo Finance Chart API

export default async function handler(req, res) {
  try {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const ymd = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    const todayStr = ymd(today);
    const yesterdayStr = ymd(yesterday);

    // ── 1. BUSCAR CÂMBIO E METAIS (USD, BRL, EUR, XAU, XAG) ───────────────────
    // Usar a API com histórico para obter dados de ontem
    const [fxTodayRes, fxYestRes] = await Promise.all([
      fetch(`https://latest.currency-api.pages.dev/v1/currencies/usd.json`),
      fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${yesterdayStr}/v1/currencies/usd.json`),
    ]);

    const fxToday = fxTodayRes.ok ? await fxTodayRes.json() : null;
    const fxYest = fxYestRes.ok ? await fxYestRes.json() : null;

    // ── 2. BUSCAR CRIPTO (BTC, ETH) ──────────────────────────────────────────
    const cgRes = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=brl&include_24hr_change=true`
    );
    const cg = cgRes.ok ? await cgRes.json() : {};

    // ── 3. BUSCAR ÍNDICES E COMMODITIES (Yahoo Finance Chart API) ────────────
    const symbols = ["^GSPC", "^IXIC", "^BVSP", "BZ=F"];
    const yfResults = {};

    for (const symbol of symbols) {
      try {
        const yfRes = await fetch(
          `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`,
          {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              "Accept": "application/json",
            },
          }
        );

        if (yfRes.ok) {
          const yfData = await yfRes.json();
          const meta = yfData.chart?.result?.[0]?.meta;
          if (meta) {
            yfResults[symbol] = {
              price: meta.regularMarketPrice,
              prevClose: meta.chartPreviousClose,
            };
          }
        }
      } catch (e) {
        console.warn(`Aviso: Falha ao buscar ${symbol}:`, e.message);
      }
    }

    // ── FUNÇÕES AUXILIARES ───────────────────────────────────────────────────
    const pct = (now, prev) =>
      prev && prev !== 0 ? (((now - prev) / prev) * 100).toFixed(2) : "0.00";

    // ── MONTAGEM DO OBJETO DE RESPOSTA ───────────────────────────────────
    const data = {};

    // CÂMBIO (Baseado na Currency API com histórico)
    if (fxToday) {
      const usdBrl = fxToday.usd.brl;
      const usdBrlYest = fxYest?.usd?.brl || usdBrl; // Fallback se ontem não estiver disponível
      data.USDBRL = {
        bid: usdBrl.toFixed(4),
        pctChange: pct(usdBrl, usdBrlYest),
        name: "Dólar Americano/Real",
      };

      const eurBrl = (1 / fxToday.usd.eur) * usdBrl;
      const eurBrlYest = fxYest ? (1 / fxYest.usd.eur) * fxYest.usd.brl : eurBrl;
      data.EURBRL = {
        bid: eurBrl.toFixed(4),
        pctChange: pct(eurBrl, eurBrlYest),
        name: "Euro/Real",
      };

      // METAIS (XAU/XAG convertidos para BRL/oz)
      const xauBrl = (1 / fxToday.usd.xau) * usdBrl;
      const xauBrlYest = fxYest ? (1 / fxYest.usd.xau) * usdBrlYest : xauBrl;
      data.XAUBRL = {
        bid: xauBrl.toFixed(2),
        pctChange: pct(xauBrl, xauBrlYest),
        name: "Ouro/Real (oz)",
      };

      const xagBrl = (1 / fxToday.usd.xag) * usdBrl;
      const xagBrlYest = fxYest ? (1 / fxYest.usd.xag) * usdBrlYest : xagBrl;
      data.XAGBRL = {
        bid: xagBrl.toFixed(2),
        pctChange: pct(xagBrl, xagBrlYest),
        name: "Prata/Real (oz)",
      };
    }

    // CRIPTO (Baseado na CoinGecko)
    data.BTCBRL = {
      bid: cg.bitcoin?.brl?.toFixed(2) || "0",
      pctChange: cg.bitcoin?.brl_24h_change?.toFixed(2) || "0.00",
      name: "Bitcoin/Real",
    };
    data.ETHBRL = {
      bid: cg.ethereum?.brl?.toFixed(2) || "0",
      pctChange: cg.ethereum?.brl_24h_change?.toFixed(2) || "0.00",
      name: "Ethereum/Real",
    };

    // ÍNDICES E PETRÓLEO (Baseado no Yahoo Finance Chart API)
    const sp500 = yfResults["^GSPC"];
    data.SPX = {
      bid: sp500?.price?.toFixed(2) || "0",
      pctChange: sp500 ? pct(sp500.price, sp500.prevClose) : "0.00",
      name: "S&P 500 Index",
    };

    const nasdaq = yfResults["^IXIC"];
    data.NAS = {
      bid: nasdaq?.price?.toFixed(2) || "0",
      pctChange: nasdaq ? pct(nasdaq.price, nasdaq.prevClose) : "0.00",
      name: "Nasdaq Composite",
    };

    const ibov = yfResults["^BVSP"];
    data.IBOV = {
      bid: ibov?.price?.toFixed(0) || "0",
      pctChange: ibov ? pct(ibov.price, ibov.prevClose) : "0.00",
      name: "IBOVESPA (Brasil)",
    };

    const brent = yfResults["BZ=F"];
    data.OIL = {
      bid: brent?.price?.toFixed(2) || "0",
      pctChange: brent ? pct(brent.price, brent.prevClose) : "0.00",
      name: "Petróleo Brent (USD)",
    };

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=30");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (e) {
    console.error("Erro geral cotacoes:", e.message);
    res.status(500).json({ error: "Erro interno", detail: e.message });
  }
}
