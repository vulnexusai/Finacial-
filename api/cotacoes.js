// api/cotacoes.js — VERSÃO 12 (FIX: Fallback para XAU/XAG + Histórico via Yahoo Finance)
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

  // Busca histórico via Yahoo Finance (mais estável, sem rate limit para câmbio/metais)
  const getHistoryYahoo = async (symbol) => {
    const d = await fetchSafe(
      `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=7d&interval=1d`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const obj = d?.chart?.result?.[0];
    if (!obj) return [];
    const prices = obj.indicators.quote[0].close;
    return obj.timestamp
      .map((t, idx) => ({ value: prices[idx], date: t }))
      .filter(h => h.value != null);
  };

  // Busca histórico via AwesomeAPI (fallback secundário)
  const getHistoryAwesome = async (pair) => {
    const d = await fetchSafe(`https://economia.awesomeapi.com.br/json/daily/${pair}/7`, {}, []);
    return Array.isArray(d) ? d.map(i => ({ value: parseFloat(i.bid), date: i.timestamp })).reverse() : [];
  };

  try {
    // ── 1. BUSCAR CÂMBIO E METAIS (AwesomeAPI) ──────────────────────────────
    const awesomeData = await fetchSafe("https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,XAU-BRL,XAG-BRL");

    // Fallback de emergência para moedas se AwesomeAPI falhar (429)
    let fallbackFx = null;
    if (!awesomeData || !awesomeData.USDBRL?.bid || parseFloat(awesomeData.USDBRL.bid) === 0) {
      fallbackFx = await fetchSafe("https://open.er-api.com/v6/latest/USD");
    }

    // ── 2. BUSCAR CRIPTO (CoinGecko) ─────────────────────────────────────────
    const cg = await fetchSafe("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=brl&include_24hr_change=true", {}, {});

    // ── 3. BUSCAR ÍNDICES + CÂMBIO + METAIS via Yahoo Finance ────────────────
    // Adicionamos USDBRL=X, EURBRL=X, GC=F (ouro), SI=F (prata) para histórico e fallback
    const symbols = ["^GSPC", "^IXIC", "^BVSP", "BZ=F", "USDBRL=X", "EURBRL=X", "GC=F", "SI=F"];
    const yfPromises = symbols.map(s =>
      fetchSafe(
        `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s)}?range=7d&interval=1d`,
        { headers: { "User-Agent": "Mozilla/5.0" } }
      )
    );
    const yfRaw = await Promise.all(yfPromises);

    const data = {};

    // Extrair dados do Yahoo Finance por símbolo
    const yfBySymbol = {};
    symbols.forEach((s, i) => {
      const obj = yfRaw[i]?.chart?.result?.[0];
      if (obj) {
        const prices = obj.indicators.quote[0].close;
        yfBySymbol[s] = {
          price: obj.meta.regularMarketPrice,
          prevClose: obj.meta.chartPreviousClose,
          history: obj.timestamp
            .map((t, idx) => ({ value: prices[idx], date: t }))
            .filter(h => h.value != null)
        };
      }
    });

    // ── 4. PROCESSAR CÂMBIO E METAIS ─────────────────────────────────────────
    // Mapeamento: chave interna -> { par AwesomeAPI, símbolo Yahoo, nome, decimais }
    const pairConfig = {
      "USDBRL": {
        awesomeKey: "USDBRL",
        yahooSymbol: "USDBRL=X",
        name: "Dólar Americano/Real Brasileiro",
        decimals: 4
      },
      "EURBRL": {
        awesomeKey: "EURBRL",
        yahooSymbol: "EURBRL=X",
        name: "Euro/Real Brasileiro",
        decimals: 4
      },
      "XAUBRL": {
        awesomeKey: "XAUBRL",
        yahooSymbol: "GC=F",    // Ouro em USD/oz — precisa multiplicar por USD/BRL
        name: "Ouro/Real Brasileiro",
        decimals: 2
      },
      "XAGBRL": {
        awesomeKey: "XAGBRL",
        yahooSymbol: "SI=F",    // Prata em USD/oz — precisa multiplicar por USD/BRL
        name: "Prata Spot/Real Brasileiro",
        decimals: 2
      }
    };

    // Taxa USD/BRL para conversão de metais (Yahoo Finance)
    const usdBrlRate = yfBySymbol["USDBRL=X"]?.price
      || (fallbackFx?.rates?.BRL)
      || (awesomeData?.USDBRL ? parseFloat(awesomeData.USDBRL.bid) : null)
      || 5.20; // último recurso

    for (const [key, cfg] of Object.entries(pairConfig)) {
      const awesome = awesomeData?.[cfg.awesomeKey];
      const awesomeBid = awesome ? parseFloat(awesome.bid) : 0;
      const awesomePct = awesome ? parseFloat(awesome.pctChange) : NaN;
      const isMetalKey = key === "XAUBRL" || key === "XAGBRL";

      // Verificar se AwesomeAPI retornou dados válidos (bid > 0 e pctChange não é NaN)
      const awesomeValid = awesomeBid > 0 && !isNaN(awesomePct);

      if (awesomeValid) {
        // AwesomeAPI funcionou — usar dados dela + histórico
        let history = [];
        if (isMetalKey) {
          // Para metais, buscar histórico via AwesomeAPI (já em BRL)
          const awesomePair = key === "XAUBRL" ? "XAU-BRL" : "XAG-BRL";
          history = await getHistoryAwesome(awesomePair);
        } else {
          // Para câmbio, usar histórico do Yahoo Finance (mais estável)
          history = yfBySymbol[cfg.yahooSymbol]?.history || await getHistoryAwesome(key === "USDBRL" ? "USD-BRL" : "EUR-BRL");
        }

        data[key] = {
          bid: awesomeBid.toFixed(cfg.decimals),
          pctChange: awesomePct.toFixed(2),
          name: cfg.name,
          history
        };
      } else if (isMetalKey && yfBySymbol[cfg.yahooSymbol]) {
        // Fallback para metais: Yahoo Finance (USD/oz) * taxa USD/BRL
        const yf = yfBySymbol[cfg.yahooSymbol];
        const bidBRL = yf.price * usdBrlRate;
        const prevBRL = yf.prevClose * usdBrlRate;
        const pct = prevBRL > 0 ? ((bidBRL - prevBRL) / prevBRL) * 100 : 0;
        const historyBRL = yf.history.map(h => ({ value: h.value * usdBrlRate, date: h.date }));

        data[key] = {
          bid: bidBRL.toFixed(cfg.decimals),
          pctChange: pct.toFixed(2),
          name: cfg.name,
          history: historyBRL
        };
      } else if (!isMetalKey && fallbackFx?.rates) {
        // Fallback para câmbio: open.er-api.com
        const rate = key === "USDBRL"
          ? fallbackFx.rates.BRL
          : (fallbackFx.rates.BRL / fallbackFx.rates.EUR);

        // Tentar calcular pctChange via Yahoo Finance
        const yf = yfBySymbol[cfg.yahooSymbol];
        const pct = yf && yf.prevClose > 0
          ? ((yf.price - yf.prevClose) / yf.prevClose) * 100
          : 0;

        data[key] = {
          bid: rate.toFixed(cfg.decimals),
          pctChange: pct.toFixed(2),
          name: cfg.name,
          history: yf?.history || []
        };
      } else if (!isMetalKey && yfBySymbol[cfg.yahooSymbol]) {
        // Fallback final para câmbio: Yahoo Finance direto
        const yf = yfBySymbol[cfg.yahooSymbol];
        const pct = yf.prevClose > 0
          ? ((yf.price - yf.prevClose) / yf.prevClose) * 100
          : 0;

        data[key] = {
          bid: yf.price.toFixed(cfg.decimals),
          pctChange: pct.toFixed(2),
          name: cfg.name,
          history: yf.history
        };
      } else {
        // Último recurso: retornar zeros (evita crash)
        data[key] = { bid: "0.00", pctChange: "0.00", name: cfg.name, history: [] };
      }
    }

    // ── 5. PROCESSAR CRIPTO ───────────────────────────────────────────────────
    data.BTCBRL = {
      bid: cg.bitcoin?.brl?.toString() || "0.00",
      pctChange: isNaN(cg.bitcoin?.brl_24h_change) ? "0.00" : (cg.bitcoin?.brl_24h_change?.toFixed(2) || "0.00"),
      name: "Bitcoin/Real",
      history: []
    };
    data.ETHBRL = {
      bid: cg.ethereum?.brl?.toString() || "0.00",
      pctChange: isNaN(cg.ethereum?.brl_24h_change) ? "0.00" : (cg.ethereum?.brl_24h_change?.toFixed(2) || "0.00"),
      name: "Ethereum/Real",
      history: []
    };

    // ── 6. PROCESSAR ÍNDICES (Yahoo Finance) ─────────────────────────────────
    const yfIndexMap = { "^GSPC": "SPX", "^IXIC": "NAS", "^BVSP": "IBOV", "BZ=F": "OIL" };
    ["^GSPC", "^IXIC", "^BVSP", "BZ=F"].forEach((sym) => {
      const yf = yfBySymbol[sym];
      const key = yfIndexMap[sym];
      if (yf) {
        const pct = yf.prevClose > 0
          ? ((yf.price - yf.prevClose) / yf.prevClose) * 100
          : 0;
        data[key] = {
          bid: yf.price.toString(),
          pctChange: pct.toFixed(2),
          name: sym,
          history: yf.history
        };
      } else {
        data[key] = { bid: "0.00", pctChange: "0.00", name: sym, history: [] };
      }
    });

    res.status(200).json(data);
  } catch (e) {
    console.error("Erro interno em cotacoes.js:", e);
    res.status(500).json({ error: "Erro interno" });
  }
}
