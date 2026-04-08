// api/cotacoes.js — VERSÃO 7 (Correção: variação percentual usando D-2 como fallback)
// Fontes:
//   • Câmbio e Metais: fawazahmed0 Currency API (com dados históricos)
//   • Criptomoedas: CoinGecko Public API
//   • Índices e Petróleo: Yahoo Finance Chart API
//
// PROBLEMA CORRIGIDO: A API "latest" retorna os dados do último dia disponível
// (geralmente D-1). Ao buscar "ontem" (D-1) como referência, ambas as datas
// apontam para o mesmo snapshot, resultando em variação 0,00%.
// SOLUÇÃO: Buscar D-2 como referência de comparação. Se D-2 também coincidir
// com "latest", tentar D-3 como último recurso.

export default async function handler(req, res) {
  try {
    // Obter data UTC para evitar problemas de fuso horário com a API
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const ymd = (d) => d.toISOString().split('T')[0];

    // Gerar datas de referência: D-1, D-2 e D-3
    const dMinus = (days) => {
      const d = new Date(todayUTC);
      d.setUTCDate(d.getUTCDate() - days);
      return ymd(d);
    };

    const d1 = dMinus(1); // ontem
    const d2 = dMinus(2); // anteontem
    const d3 = dMinus(3); // 3 dias atrás

    // ── 1. BUSCAR CÂMBIO E METAIS (USD, BRL, EUR, XAU, XAG) ───────────────────
    // "latest" retorna o snapshot mais recente disponível (geralmente D-1).
    // Para a variação, buscamos D-2 e D-3 como fallback para garantir que
    // a data de referência seja diferente da data atual da API.
    const [fxTodayRes, fxD2Res, fxD3Res] = await Promise.all([
      fetch(`https://latest.currency-api.pages.dev/v1/currencies/usd.json`),
      fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${d2}/v1/currencies/usd.json`),
      fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${d3}/v1/currencies/usd.json`),
    ]);

    const fxToday = fxTodayRes.ok ? await fxTodayRes.json() : null;
    const fxD2    = fxD2Res.ok    ? await fxD2Res.json()    : null;
    const fxD3    = fxD3Res.ok    ? await fxD3Res.json()    : null;

    // Selecionar a referência histórica: preferir D-2, mas se a data coincidir
    // com "latest" (ambas apontam para o mesmo dia), usar D-3.
    let fxRef = null;
    if (fxToday && fxD2) {
      if (fxD2.date !== fxToday.date) {
        fxRef = fxD2; // D-2 é diferente de hoje → usar D-2
      } else if (fxD3 && fxD3.date !== fxToday.date) {
        fxRef = fxD3; // D-2 == hoje, tentar D-3
      }
      // Se D-3 também coincidir, fxRef permanece null → porcentagem "0.00"
    }

    // Log para depuração (visível nos logs da Vercel)
    console.log(`Dates: latest=${fxToday?.date}, d2=${fxD2?.date}, d3=${fxD3?.date}`);
    console.log(`Ref escolhida: ${fxRef?.date ?? 'nenhuma'}`);
    console.log(`FX Status: today=${fxTodayRes.status}, d2=${fxD2Res.status}, d3=${fxD3Res.status}`);

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
      const usdBrlRef = fxRef?.usd?.brl;
      data.USDBRL = {
        bid: usdBrl.toFixed(4),
        pctChange: usdBrlRef ? pct(usdBrl, usdBrlRef) : "0.00",
        name: "Dólar Americano/Real",
      };

      const eurBrl = (1 / fxToday.usd.eur) * usdBrl;
      const eurBrlRef = fxRef ? (1 / fxRef.usd.eur) * fxRef.usd.brl : null;
      data.EURBRL = {
        bid: eurBrl.toFixed(4),
        pctChange: eurBrlRef ? pct(eurBrl, eurBrlRef) : "0.00",
        name: "Euro/Real",
      };

      // METAIS (XAU/XAG convertidos para BRL/oz)
      const xauBrl = (1 / fxToday.usd.xau) * usdBrl;
      const xauBrlRef = fxRef ? (1 / fxRef.usd.xau) * fxRef.usd.brl : null;
      data.XAUBRL = {
        bid: xauBrl.toFixed(2),
        pctChange: xauBrlRef ? pct(xauBrl, xauBrlRef) : "0.00",
        name: "Ouro/Real (oz)",
      };

      const xagBrl = (1 / fxToday.usd.xag) * usdBrl;
      const xagBrlRef = fxRef ? (1 / fxRef.usd.xag) * fxRef.usd.brl : null;
      data.XAGBRL = {
        bid: xagBrl.toFixed(2),
        pctChange: xagBrlRef ? pct(xagBrl, xagBrlRef) : "0.00",
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
