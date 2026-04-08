import { useState, useEffect, useCallback, useMemo } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import ReactMarkdown from "react-markdown";

const S = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
:root{
  --bg:#0f0e0c;--surface:#1a1814;--surface2:#242118;--border:#2e2b24;
  --gold:#c9a84c;--gold-light:#e8c97a;--gold-dim:#7a6530;
  --text:#f0ead8;--muted:#8a8070;--green:#4caf7d;--red:#e05555;--blue:#5b9cf6;
}
html{scroll-behavior: smooth;}
body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;font-weight:300;overflow-x:hidden;}
.root{min-height:100vh;background:var(--bg);width:100%;}
.noise{position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");pointer-events:none;z-index:999;opacity:.4;}

/* HEADER */
.hdr{border-bottom:1px solid var(--border);padding:0 16px;display:flex;align-items:center;justify-content:space-between;height:64px;position:sticky;top:0;background:rgba(15,14,12,.94);backdrop-filter:blur(14px);z-index:100;}
.logo{font-family:'DM Serif Display',serif;font-size:1.1rem;color:var(--gold);letter-spacing:-.02em;cursor:pointer;flex-shrink:0;}
.logo small{color:var(--muted);font-size:.6rem;font-family:'DM Sans',sans-serif;font-weight:300;display:block;margin-top:-2px;}

/* TABS */
.tabs{display:flex;gap:4px;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:3px;overflow-x:auto;scrollbar-width:none;}
.tabs::-webkit-scrollbar{display:none;}
.tab{padding:6px 12px;border-radius:7px;font-size:.72rem;font-weight:500;cursor:pointer;border:none;background:transparent;color:var(--muted);transition:all .18s;letter-spacing:.02em;white-space:nowrap;}
.tab.active{background:var(--surface2);color:var(--gold);border:1px solid var(--border);}

/* HERO */
.hero{padding:60px 20px 40px;text-align:center;background:radial-gradient(circle at center, rgba(201,168,76,0.05) 0%, transparent 70%);}
.hero-title{font-family:'DM Serif Display',serif;font-size:clamp(2.2rem,7vw,4rem);line-height:1.1;margin-bottom:16px;letter-spacing:-0.03em;}
.hero-title em{color:var(--gold);font-style:italic;}
.hero-sub{font-size:1rem;color:var(--muted);max-width:540px;margin:0 auto 32px;line-height:1.5;}
.hero-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}
.btn-main, .btn-sec{padding:14px 24px;border-radius:12px;font-size:.9rem;font-weight:600;text-decoration:none;transition:all 0.2s;cursor:pointer;border:none;font-family:inherit;}
.btn-main{background:var(--gold);color:var(--bg);box-shadow:0 8px 16px rgba(201,168,76,0.12);}
.btn-main:hover{background:var(--gold-light);transform:translateY(-2px);}
.btn-sec{background:transparent;border:1px solid var(--border);color:var(--text);}
.btn-sec:hover{border-color:var(--gold-dim);background:rgba(255,255,255,0.03);}

/* MAIN */
.main{max-width:1000px;margin:0 auto;padding:20px 16px 80px;width:100%;}

/* SECTION HEADER */
.sec-hd{margin-bottom:24px;}
.sec-cat{display:inline-block;background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.2);color:var(--gold);font-size:.6rem;letter-spacing:.12em;text-transform:uppercase;padding:3px 10px;border-radius:100px;margin-bottom:10px;}
.sec-title{font-family:'DM Serif Display',serif;font-size:clamp(1.5rem,4vw,2rem);line-height:1.2;letter-spacing:-.02em;margin-bottom:6px;}
.sec-title em{color:var(--gold);font-style:italic;}
.sec-sub{color:var(--muted);font-size:.82rem;line-height:1.5;}

/* BCB STRIP */
.bcb-strip{display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:10px;margin-bottom:24px;}
.bcb-chip{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:12px 16px;display:flex;flex-direction:column;gap:4px;}
.bcb-chip-label{font-size:.6rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);}
.bcb-chip-val{font-family:'DM Serif Display',serif;font-size:1.2rem;color:var(--gold);}
.bcb-chip-sub{font-size:.65rem;color:var(--muted);}

/* AI SUMMARY */
.ai-summary{background:rgba(201,168,76,.03);border:1px solid rgba(201,168,76,.1);border-radius:14px;padding:20px;margin-bottom:24px;}
.ai-summary-hd{display:flex;align-items:center;gap:8px;margin-bottom:10px;font-size:.65rem;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);font-weight:600;}
.ai-summary-txt{font-size:.88rem;line-height:1.6;color:#d4cec0;}

/* COMMODITY GRID */
.cmd-toolbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;gap:12px;flex-wrap:wrap;}
.cmd-update{font-size:.7rem;color:var(--muted);}
.refresh-btn{background:transparent;border:1px solid var(--border);border-radius:8px;padding:6px 12px;color:var(--muted);font-size:.75rem;cursor:pointer;display:flex;align-items:center;gap:6px;}

.cmd-cats{display:flex;flex-direction:column;gap:24px;}
.cmd-cat-title{font-size:.65rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;}
.cmd-grid{display:grid;grid-template-columns:repeat(auto-fill, minmax(150px, 1fr));gap:10px;}
@media(max-width:400px){.cmd-grid{grid-template-columns:1fr 1fr;}}
.cmd-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px;transition:all .2s;cursor:pointer;min-height:110px;}
.cmd-card:hover{border-color:var(--gold-dim);}
.cmd-card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
.cmd-chg{font-size:.68rem;font-weight:600;padding:2px 6px;border-radius:6px;}
.cmd-name{font-size:.7rem;color:var(--muted);margin-bottom:2px;}
.cmd-price{font-family:'DM Serif Display',serif;font-size:1.15rem;color:var(--text);}

/* SIMULATOR */
.card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:24px;margin-bottom:24px;}
.form-grid{display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:16px;}
.field{display:flex;flex-direction:column;gap:6px;}
.field label{font-size:.65rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);}
.inp-wrap{position:relative;}
.inp-pre{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--gold-dim);font-size:.8rem;}
.inp{width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px 12px 10px 32px;color:var(--text);font-family:inherit;font-size:.9rem;outline:none;}
.inp.np{padding-left:12px;}
.btn-gold{width:100%;margin-top:20px;background:var(--gold);color:var(--bg);border:none;border-radius:10px;padding:14px;font-weight:700;cursor:pointer;font-family:inherit;}

.res-grid{display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:10px;margin-top:24px;}
.res-item{background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:16px;}
.res-lbl{font-size:.6rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:6px;}
.res-val{font-family:'DM Serif Display',serif;font-size:1.25rem;}
.res-val.o{color:var(--gold);}
.res-val.r{color:var(--red);}

/* TABLES */
.table-wrap{background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow-x:auto;margin-bottom:24px;scrollbar-width: thin;scrollbar-color: var(--border) transparent;}
.table-wrap::-webkit-scrollbar{height:4px;}
.table-wrap::-webkit-scrollbar-thumb{background:var(--border);border-radius:10px;}
table{width:100%;border-collapse:collapse;font-size:.85rem;min-width:500px;}
th{background:var(--surface2);color:var(--muted);font-weight:600;text-align:left;padding:12px 16px;font-size:.65rem;text-transform:uppercase;letter-spacing:.05em;}
td{padding:14px 16px;border-bottom:1px solid var(--border);color:#d4cec0;}
.ticker{font-weight:700;color:var(--gold);display:block;}
.name-sub{font-size:.65rem;color:var(--muted);display:block;}

/* ARTICLES */
.art-grid{display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:16px;}
@media(max-width:480px){.art-grid{grid-template-columns:1fr;}}
.art-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:24px;cursor:pointer;transition:all .2s;}
.art-card:hover{border-color:var(--gold-dim);transform:translateY(-2px);}
.art-card-title{font-family:'DM Serif Display',serif;font-size:1.2rem;margin:8px 0 12px;line-height:1.3;}
.art-card-desc{font-size:.85rem;color:var(--muted);line-height:1.5;}

.art-view{max-width:700px;margin:0 auto;padding:20px 0;}
.btn-back{background:transparent;border:1px solid var(--border);border-radius:8px;padding:8px 16px;color:var(--muted);font-size:.8rem;cursor:pointer;margin-bottom:24px;}
.art-view-title{font-family:'DM Serif Display',serif;font-size:clamp(1.8rem,6vw,2.5rem);line-height:1.1;margin-bottom:24px;}
.art-content{font-size:1.05rem;line-height:1.7;color:#d4cec0;}
.art-content h3{font-family:'DM Serif Display',serif;font-size:1.4rem;color:var(--text);margin:32px 0 16px;}
.art-content p{margin-bottom:20px;}

/* CONVERSION */
.conv-section{text-align:center;padding:60px 20px;border-top:1px solid var(--border);margin-top:40px;}
.conv-title{font-family:'DM Serif Display',serif;font-size:1.8rem;margin-bottom:24px;}

.ftr{padding:40px 20px;text-align:center;font-size:.75rem;color:var(--muted);border-top:1px solid var(--border);}
`;

const MARKET_DEF = [
  { key:"XAU-BRL", label:"Ouro", icon:"🟨", unit:"R$", cat:"Metais" },
  { key:"XAG-BRL", label:"Prata", icon:"⚪", unit:"R$", cat:"Metais" },
  { key:"USD-BRL", label:"Dólar", icon:"🇺🇸", unit:"R$", cat:"Câmbio" },
  { key:"EUR-BRL", label:"Euro", icon:"🇪🇺", unit:"R$", cat:"Câmbio" },
  { key:"OIL", label:"Petróleo", icon:"🛢️", unit:"USD", cat:"Commodities" },
  { key:"SPX", label:"S&P 500", icon:"🇺🇸", unit:"Pts", cat:"Bolsas" },
  { key:"NAS", label:"Nasdaq", icon:"💻", unit:"Pts", cat:"Bolsas" },
  { key:"IBOV", label:"IBOVESPA", icon:"🇧🇷", unit:"Pts", cat:"Bolsas" },
  { key:"BTC-BRL", label:"Bitcoin", icon:"₿", unit:"R$", cat:"Cripto" },
  { key:"ETH-BRL", label:"Ethereum", icon:"Ξ", unit:"R$", cat:"Cripto" },
];

const BCB_DEF = [
  { key:"11", label:"SELIC", sub:"Taxa básica" },
  { key:"433", label:"IPCA", sub:"Inflação" },
];

const DIVIDENDS_REAL = [
  { ticker: "BBDC4", name: "Bradesco", type: "JSCP", value: "0,30", dateCom: "06/04/2026" },
  { ticker: "IRBR3", name: "IRB Re", type: "Dividendo", value: "0,59", dateCom: "06/04/2026" },
  { ticker: "CXSE3", name: "Caixa Seguridade", type: "Dividendo", value: "0,33", dateCom: "30/04/2026" },
  { ticker: "ISAE4", name: "Isa Energia", type: "Dividendo", value: "0,14", dateCom: "17/04/2026" },
  { ticker: "CSUD3", name: "CSU Digital", type: "JSCP", value: "0,17", dateCom: "02/04/2026" },
  { ticker: "MILS3", name: "Mills", type: "Dividendo", value: "0,66", dateCom: "20/04/2026" },
  { ticker: "ALOS3", name: "Allos", type: "Dividendo", value: "0,29", dateCom: "22/04/2026" },
];

const ARTICLES = [
  { id:"cdb-vs-tesouro", cat:"Investimentos", title:"CDB vs Tesouro Direto", desc:"Qual rende mais para sua reserva?", conteudo: "<h3>CDB vs Tesouro</h3><p>Ambos são excelentes para reserva de emergência. O Tesouro Selic é o título mais seguro do país, enquanto CDBs de bancos sólidos podem pagar até 110% do CDI.</p>" },
  { id:"sair-cheque-especial", cat:"Crédito", title:"Sair do Cheque Especial", desc:"Como fugir dos juros de 150% ao ano.", conteudo: "<h3>Cheque Especial</h3><p>Fuja dos juros abusivos. A melhor estratégia é trocar a dívida cara por uma mais barata, como um empréstimo consignado ou pessoal com taxas menores.</p>" },
];

function fmtBRL(v){ return v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); }
function fmtNum(v,dec=2){ return v.toLocaleString("pt-BR",{minimumFractionDigits:dec,maximumFractionDigits:dec}); }
function calcParcela(val,entrada,taxaAA,anos){
  const p=val-entrada, i=taxaAA/100/12, n=anos*12;
  if(i===0) return p/n;
  return (p*i*Math.pow(1+i,n))/(Math.pow(1+i,n)-1);
}

export default function App() {
  const [tab, setTab] = useState("home");
  const [marketData, setMarketData] = useState(null);
  const [bcbData, setBcbData] = useState({});
  const [loading, setLoading] = useState(false);
  const [ts, setTs] = useState(null);
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [art, setArt] = useState(null);
  const [f,setF] = useState({renda:"8000",imovel:"400000",entrada:"80000",prazo:"30",taxa:"10.49"});
  const [res,setRes] = useState(null);
  const [aiSimTxt, setAiSimTxt] = useState("");
  const [aiSimLoading, setAiSimLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true); setAiLoading(true);
    try {
      const resM = await fetch(`/api/cotacoes`); const dataM = await resM.json();
      setMarketData(dataM); setTs(new Date());
      const resB = await fetch(`/api/bcb?serie=11`); const dataB = await resB.json();
      if (dataB?.length) setBcbData({ "11": dataB[0].valor });
      
      const summaryText = Object.entries(dataM).map(([k,v]) => `${v.name}: ${v.bid}`).join(", ");
      const resAi = await fetch("/api/groq", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ 
          messages: [
            { role: "system", content: "Você é um analista financeiro brasileiro. Resuma o mercado em 2 frases e diga o que o usuário deve fazer hoje." }, 
            { role: "user", content: `Dados atuais: ${summaryText}` }
          ] 
        }) 
      });
      const dataAi = await resAi.json();
      setAiSummary(dataAi.choices?.[0]?.message?.content || "Mercado em movimento. Considere diversificar.");
    } catch (e) { console.error("Erro IA:", e); setAiSummary("Análise indisponível no momento."); }
    setLoading(false); setAiLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const simular = async () => {
    const r = parseFloat(f.renda), i = parseFloat(f.imovel), e = parseFloat(f.entrada), p = parseInt(f.prazo), t = parseFloat(f.taxa.replace(",","."));
    const parc = calcParcela(i,e,t,p);
    const comp = (parc/r)*100;
    const juros = (parc*p*12)-(i-e);
    setRes({parc, comp, juros});

    setAiSimLoading(true);
    try {
      const response = await fetch("/api/groq", { 
        method:"POST", 
        headers:{"Content-Type":"application/json"}, 
        body: JSON.stringify({ 
          messages:[
            {role:"system", content:"Analista de crédito imobiliário. Seja direto e útil."}, 
            {role:"user", content:`Renda ${fmtBRL(r)}, Imóvel ${fmtBRL(i)}, Parcela ${fmtBRL(parc)} (${comp.toFixed(1)}% da renda). É uma boa ideia?`}
          ]
        }) 
      });
      const data = await response.json();
      setAiSimTxt(data.choices?.[0]?.message?.content || "Analise o comprometimento de renda antes de fechar.");
    } catch(e) { setAiSimTxt("Erro ao processar análise da IA."); }
    setAiSimLoading(false);
  };

  return (
    <div className="root">
      <style>{S}</style>
      <div className="noise" />
      <header className="hdr">
        <div className="logo" onClick={() => {setTab("home"); setArt(null); window.scrollTo(0,0);}}>FinançaBR<small>inteligência</small></div>
        <nav className="tabs">
          {["home", "mercados", "simulador", "dividendos"].map(t => (
            <button key={t} className={`tab ${tab===t?'active':''}`} onClick={()=>{setTab(t); setArt(null); window.scrollTo(0,0);}}>
              {t === "home" ? "Início" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </nav>
      </header>

      <main className="main">
        {art ? (
          <div className="art-view">
            <button className="btn-back" onClick={() => setArt(null)}>← Voltar</button>
            <h1 className="art-view-title">{art.title}</h1>
            <div className="art-content" dangerouslySetInnerHTML={{__html: art.conteudo}} />
          </div>
        ) : (
          <>
            {tab === "home" && (
              <>
                <section className="hero">
                  <h1 className="hero-title">O que fazer com seu <em>dinheiro</em> hoje?</h1>
                  <p className="hero-sub">Análises reais e simulações para você decidir com segurança.</p>
                  <div className="hero-btns">
                    <button className="btn-main" onClick={()=>setTab("mercados")}>Análise do Dia</button>
                    <button className="btn-sec" onClick={()=>setTab("simulador")}>Simulador</button>
                  </div>
                </section>
                <div className="sec-hd"><div className="sec-cat">Educação</div><h2 className="sec-title">Guia de <em>Patrimônio</em></h2></div>
                <div className="art-grid">
                  {ARTICLES.map(a => (
                    <div className="art-card" key={a.id} onClick={() => setArt(a)}>
                      <div className="art-card-cat">{a.cat}</div>
                      <h3 className="art-card-title">{a.title}</h3>
                      <p className="art-card-desc">{a.desc}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
            {tab === "mercados" && (
              <>
                <div className="sec-hd"><div className="sec-cat">Mercados</div><h2 className="sec-title">Cotações em <em>tempo real</em></h2></div>
                <div className="bcb-strip">
                  {BCB_DEF.map(b => (
                    <div className="bcb-chip" key={b.key}>
                      <span className="bcb-chip-label">{b.label}</span>
                      <span className="bcb-chip-val">{bcbData[b.key] ? fmtNum(parseFloat(bcbData[b.key]))+"%" : "..."}</span>
                      <span className="bcb-chip-sub">{b.sub}</span>
                    </div>
                  ))}
                </div>
                <div className="ai-summary">
                  <div className="ai-summary-hd"><span>✨ IA Insights</span></div>
                  <p className="ai-summary-txt">{aiLoading ? "Consultando analista..." : aiSummary}</p>
                </div>
                <div className="cmd-cats">
                  {["Metais", "Câmbio", "Commodities", "Bolsas", "Cripto"].map(cat => (
                    <div key={cat}>
                      <div className="cmd-cat-title">{cat}</div>
                      <div className="cmd-grid">
                        {MARKET_DEF.filter(c => c.cat === cat).map(item => {
                          const v = marketData?.[item.key.replace("-","")];
                          const chg = v ? parseFloat(v.pctChange) : 0;
                          return (
                            <div className="cmd-card" key={item.key}>
                              <div className="cmd-card-top"><span className="cmd-icon">{item.icon}</span><span className={`cmd-chg ${chg>=0?'chg-up':'chg-dn'}`}>{chg>=0?'+':''}{fmtNum(chg)}%</span></div>
                              <div className="cmd-name">{item.label}</div>
                              <div className="cmd-price">{item.unit} {v ? fmtNum(parseFloat(v.bid)) : "..."}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {tab === "simulador" && (
              <div className="card">
                <div className="sec-hd"><div className="sec-cat">Simulador</div><h2 className="sec-title">Crédito <em>Imobiliário</em></h2></div>
                <div className="form-grid">
                  <div className="field"><label>Renda Mensal</label><input className="inp np" value={f.renda} onChange={e=>setF({...f,renda:e.target.value})} /></div>
                  <div className="field"><label>Valor Imóvel</label><input className="inp np" value={f.imovel} onChange={e=>setF({...f,imovel:e.target.value})} /></div>
                  <div className="field"><label>Entrada</label><input className="inp np" value={f.entrada} onChange={e=>setF({...f,entrada:e.target.value})} /></div>
                  <div className="field"><label>Taxa Anual %</label><input className="inp np" value={f.taxa} onChange={e=>setF({...f,taxa:e.target.value})} /></div>
                </div>
                <button className="btn-gold" onClick={simular}>Calcular e Analisar com IA</button>
                {res && (
                  <>
                    <div className="res-grid">
                      <div className="res-item"><div className="res-lbl">Parcela</div><div className="res-val o">{fmtBRL(res.parc)}</div></div>
                      <div className="res-item"><div className="res-lbl">Comprometimento</div><div className="res-val r">{res.comp.toFixed(1)}%</div></div>
                      <div className="res-item"><div className="res-lbl">Total Juros</div><div className="res-val">{fmtBRL(res.juros)}</div></div>
                    </div>
                    <div className="ai-summary" style={{marginTop:20}}>
                      <div className="ai-summary-hd"><span>📊 Avaliação da IA</span></div>
                      <p className="ai-summary-txt">{aiSimLoading ? "Processando..." : aiSimTxt}</p>
                    </div>
                  </>
                )}
              </div>
            )}
            {tab === "dividendos" && (
              <>
                <div className="sec-hd"><div className="sec-cat">Proventos</div><h2 className="sec-title">Agenda de <em>Dividendos</em></h2><p className="sec-sub">Dados reais de pagamentos confirmados na B3 para 2026.</p></div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Empresa</th><th>Tipo</th><th>Valor</th><th>Data Com</th></tr></thead>
                    <tbody>{DIVIDENDS_REAL.map(d=>(<tr key={d.ticker}><td><span className="ticker">{d.ticker}</span><span className="name-sub">{d.name}</span></td><td>{d.type}</td><td>{fmtBRL(parseFloat(d.value.replace(",",".")))}</td><td>{d.dateCom}</td></tr>))}</tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
        <section className="conv-section">
          <h2 className="conv-title">Pronto para investir?</h2>
          <div className="hero-btns"><button className="btn-main">Abrir Corretora</button><button className="btn-sec">Ver Crédito</button></div>
        </section>
      </main>
      <footer className="ftr">© 2026 FinançaBR — Inteligência Financeira</footer>
    </div>
  );
}
