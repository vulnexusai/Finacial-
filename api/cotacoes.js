// api/cotacoes.js — VERSÃO 4 CORRIGIDA (Com Yahoo Finance Crumb)
// Fontes:
//   • Câmbio e Metais: fawazahmed0 Currency API (via jsDelivr)
//   • Criptomoedas: CoinGecko Public API
//   • Índices e Petróleo: Yahoo Finance API (com crumb para autenticação)

export default async function handler(req, res) {
  try {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const ymd = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    // ── 1. BUSCAR CÂMBIO E METAIS (USD, BRL, EUR, XAU, XAG) ───────────────────
    const [fxTodayRes, fxYestRes] = await Promise.all([
      fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json`),
      fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${ymd(yesterday)}/v1/currencies/usd.json`),
    ]);

    const fxToday = fxTodayRes.ok ? await fxTodayRes.json() : null;
    const fxYest = fxYestRes.ok ? await fxYestRes.json() : null;

    // ── 2. BUSCAR CRIPTO (BTC, ETH) ──────────────────────────────────────────
    const cgRes = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=brl&include_24hr_change=true`
    );
    const cg = cgRes.ok ? await cgRes.json() : {};

    // ── 3. BUSCAR ÍNDICES E COMMODITIES (Yahoo Finance com Crumb) ────────────
    let yfResults = [];
    try {
      // Obter crumb para autenticação
      const crumbRes = await fetch(`https://query1.finance.yahoo.com/v1/test/getcrumb`);
      if (crumbRes.ok) {
        const crumb = await crumbRes.text();

        // Usar crumb para fazer a requisição de cotações
        const yfRes = await fetch(
          `https://query1.finance.yahoo.com/v7/finance/quote?symbols=^GSPC,^IXIC,^BVSP,BZ=F&crumb=${encodeURIComponent(crumb)}`,
          {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
          }
        );

        if (yfRes.ok) {
          const yfData = await yfRes.json();
          yfResults = yfData.quoteResponse?.result || [];
        }
      }
    } catch (e) {
      console.warn("Aviso: Falha ao buscar dados do Yahoo Finance:", e.message);
    }

    const getIdx = (sym) => yfResults.find((r) => r.symbol === sym) || {};

    // ── FUNÇÕES AUXILIARES ───────────────────────────────────────────────────
    const pct = (now, prev) =>
      prev && prev !== 0 ? (((now - prev) / prev) * 100).toFixed(2) : "0.00";

    // ── MONTAGEM DO OBJETO DE RESPOSTA ───────────────────────────────────
    const data = {};

    // CÂMBIO (Baseado na Currency API)
    if (fxToday && fxYest) {
      const usdBrl = fxToday.usd.brl;
      const usdBrlYest = fxYest.usd.brl;
      data.USDBRL = {
        bid: usdBrl.toFixed(4),
        pctChange: pct(usdBrl, usdBrlYest),
        name: "Dólar Americano/Real",
      };

      const eurBrl = (1 / fxToday.usd.eur) * usdBrl;
      const eurBrlYest = (1 / fxYest.usd.eur) * usdBrlYest;
      data.EURBRL = {
        bid: eurBrl.toFixed(4),
        pctChange: pct(eurBrl, eurBrlYest),
        name: "Euro/Real",
      };

      // METAIS (XAU/XAG convertidos para BRL/oz)
      const xauBrl = (1 / fxToday.usd.xau);
      const xauBrlYest = (1 / fxYest.usd.xau);
      data.XAUBRL = {
        bid: xauBrl.toFixed(2),
        pctChange: pct(xauBrl, xauBrlYest),
        name: "Ouro/Real (oz)",
      };

      const xagBrl = (1 / fxToday.usd.xag);
      const xagBrlYest = (1 / fxYest.usd.xag);
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

    // ÍNDICES E PETRÓLEO (Baseado no Yahoo Finance com Crumb)
    const sp500 = getIdx("^GSPC");
    data.SPX = {
      bid: sp500.regularMarketPrice?.toFixed(2) || "0",
      pctChange: sp500.regularMarketChangePercent?.toFixed(2) || "0.00",
      name: "S&P 500 Index",
    };

    const nasdaq = getIdx("^IXIC");
    data.NAS = {
      bid: nasdaq.regularMarketPrice?.toFixed(2) || "0",
      pctChange: nasdaq.regularMarketChangePercent?.toFixed(2) || "0.00",
      name: "Nasdaq Composite",
    };

    const ibov = getIdx("^BVSP");
    data.IBOV = {
      bid: ibov.regularMarketPrice?.toFixed(0) || "0",
      pctChange: ibov.regularMarketChangePercent?.toFixed(2) || "0.00",
      name: "IBOVESPA (Brasil)",
    };

    const brent = getIdx("BZ=F");
    data.OIL = {
      bid: brent.regularMarketPrice?.toFixed(2) || "0",
      pctChange: brent.regularMarketChangePercent?.toFixed(2) || "0.00",
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
