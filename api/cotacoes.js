// api/cotacoes.js — VERSÃO 8 (MIGRAÇÃO: AwesomeAPI para Tempo Real + Fallbacks)
// Fontes:
//   • Câmbio e Metais: AwesomeAPI (Tempo Real - 30s)
//   • Criptomoedas: CoinGecko Public API
//   • Índices e Petróleo: Yahoo Finance Chart API

export default async function handler(req, res) {
  try {
    // ── 1. BUSCAR CÂMBIO E METAIS (AwesomeAPI - Tempo Real) ──────────────────
    // Parâmetros: USD-BRL (Dólar), EUR-BRL (Euro), XAU-BRL (Ouro), XAG-BRL (Prata)
    const awesomeRes = await fetch(
      "https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,XAU-BRL,XAG-BRL"
    );
    const awesomeData = awesomeRes.ok ? await awesomeRes.json() : null;

    // ── 2. BUSCAR CRIPTO (BTC, ETH) ──────────────────────────────────────────
    const cgRes = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=brl&include_24hr_change=true"
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

    // CÂMBIO E METAIS (Dados da AwesomeAPI)
    if (awesomeData) {
      // Dólar
      if (awesomeData.USDBRL) {
        data.USDBRL = {
          bid: parseFloat(awesomeData.USDBRL.bid).toFixed(4),
          pctChange: parseFloat(awesomeData.USDBRL.pctChange).toFixed(2),
          name: "Dólar Americano/Real",
        };
      }
      // Euro
      if (awesomeData.EURBRL) {
        data.EURBRL = {
          bid: parseFloat(awesomeData.EURBRL.bid).toFixed(4),
          pctChange: parseFloat(awesomeData.EURBRL.pctChange).toFixed(2),
          name: "Euro/Real",
        };
      }
      // Ouro (XAU-BRL já vem convertido pela AwesomeAPI)
      if (awesomeData.XAUBRL) {
        data.XAUBRL = {
          bid: parseFloat(awesomeData.XAUBRL.bid).toFixed(2),
          pctChange: parseFloat(awesomeData.XAUBRL.pctChange).toFixed(2),
          name: "Ouro/Real (oz)",
        };
      }
      // Prata (XAG-BRL já vem convertido pela AwesomeAPI)
      if (awesomeData.XAGBRL) {
        data.XAGBRL = {
          bid: parseFloat(awesomeData.XAGBRL.bid).toFixed(2),
          pctChange: parseFloat(awesomeData.XAGBRL.pctChange).toFixed(2),
          name: "Prata/Real (oz)",
        };
      }
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

    // Configuração de Cache (Vercel Edge Cache)
    // s-maxage=30: O cache da Vercel guarda por 30 segundos (Tempo Real)
    // stale-while-revalidate=60: Serve o cache antigo enquanto busca o novo em background
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (e) {
    console.error("Erro geral cotacoes:", e.message);
    res.status(500).json({ error: "Erro interno", detail: e.message });
  }
}
