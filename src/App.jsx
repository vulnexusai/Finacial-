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
body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;font-weight:300;}
.root{min-height:100vh;background:var(--bg);}
.noise{position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");pointer-events:none;z-index:999;opacity:.4;}

/* HEADER */
.hdr{border-bottom:1px solid var(--border);padding:0 28px;display:flex;align-items:center;justify-content:space-between;height:60px;position:sticky;top:0;background:rgba(15,14,12,.94);backdrop-filter:blur(14px);z-index:100;}
.logo{font-family:'DM Serif Display',serif;font-size:1.25rem;color:var(--gold);letter-spacing:-.02em;cursor:pointer;}
.logo small{color:var(--muted);font-size:.68rem;font-family:'DM Sans',sans-serif;font-weight:300;display:block;margin-top:-3px;}

/* HERO */
.hero{padding:80px 20px 60px;text-align:center;background:radial-gradient(circle at center, rgba(201,168,76,0.05) 0%, transparent 70%);}
.hero-title{font-family:'DM Serif Display',serif;font-size:clamp(2.5rem,8vw,4.5rem);line-height:1.05;margin-bottom:20px;letter-spacing:-0.04em;}
.hero-title em{color:var(--gold);font-style:italic;}
.hero-sub{font-size:1.15rem;color:var(--muted);max-width:600px;margin:0 auto 40px;line-height:1.6;}
.hero-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;}
.btn-main{background:var(--gold);color:var(--bg);padding:16px 32px;border-radius:12px;font-weight:700;text-decoration:none;transition:all 0.2s;box-shadow:0 10px 20px rgba(201,168,76,0.15);}
.btn-main:hover{background:var(--gold-light);transform:translateY(-2px);}
.btn-sec{background:transparent;border:1px solid var(--border);color:var(--text);padding:16px 32px;border-radius:12px;font-weight:600;text-decoration:none;transition:all 0.2s;}
.btn-sec:hover{border-color:var(--gold-dim);background:rgba(255,255,255,0.03);}

/* TABS */
.tabs{display:flex;gap:4px;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:4px;}
.tab{padding:6px 16px;border-radius:7px;font-size:.8rem;font-weight:500;cursor:pointer;border:none;background:transparent;color:var(--muted);transition:all .18s;letter-spacing:.02em;}
.tab.active{background:var(--surface2);color:var(--gold);border:1px solid var(--border);}
.tab:hover:not(.active){color:var(--text);}

/* MAIN */
.main{max-width:1000px;margin:0 auto;padding:0 20px 100px;position:relative;z-index:1;}

/* SECTION HEADER */
.sec-hd{margin-bottom:28px;}
.sec-cat{display:inline-block;background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.2);color:var(--gold);font-size:.65rem;letter-spacing:.14em;text-transform:uppercase;padding:3px 11px;border-radius:100px;margin-bottom:12px;}
.sec-title{font-family:'DM Serif Display',serif;font-size:clamp(1.6rem,3.5vw,2.2rem);line-height:1.15;letter-spacing:-.03em;margin-bottom:8px;}
.sec-title em{color:var(--gold);font-style:italic;}
.sec-sub{color:var(--muted);font-size:.875rem;line-height:1.6;}

/* ANALYSIS BOX */
.analysis-box{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:24px;margin-bottom:40px;border-left:4px solid var(--gold);}
.analysis-hd{display:flex;align-items:center;gap:10px;margin-bottom:16px;color:var(--gold);font-weight:600;font-size:0.9rem;text-transform:uppercase;letter-spacing:0.05em;}
.analysis-txt{font-size:1.05rem;line-height:1.7;color:#d4cec0;}

/* COMMODITY GRID */
.cmd-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;margin-bottom:40px;}
.cmd-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:20px;transition:all .2s;display:flex;flex-direction:column;}
.cmd-card:hover{border-color:var(--gold-dim);transform:translateY(-2px);}
.cmd-card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
.cmd-icon{font-size:1.2rem;}
.cmd-chg{font-size:.75rem;font-weight:600;padding:2px 8px;border-radius:100px;}
.chg-up{background:rgba(76,175,125,.12);color:var(--green);}
.chg-dn{background:rgba(224,85,85,.12);color:var(--red);}
.cmd-name{font-size:.8rem;color:var(--muted);margin-bottom:4px;}
.cmd-price{font-family:'DM Serif Display',serif;font-size:1.5rem;color:var(--text);}
.cmd-interpret{font-size:0.8rem;color:var(--gold-dim);margin-top:12px;padding-top:12px;border-top:1px solid var(--border);line-height:1.4;}
.cmd-cta{margin-top:16px;font-size:0.75rem;color:var(--gold);font-weight:600;text-decoration:none;display:flex;align-items:center;gap:4px;cursor:pointer;}
.cmd-cta:hover{color:var(--gold-light);}

/* SMART RECOMMENDATION */
.rec-box{background:linear-gradient(135deg, var(--surface) 0%, var(--surface2) 100%);border:1px solid var(--border);border-radius:20px;padding:40px;margin-bottom:60px;text-align:center;}
.rec-title{font-family:'DM Serif Display',serif;font-size:1.8rem;margin-bottom:16px;}
.rec-grid{display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:20px;margin:30px 0;}
.rec-item{background:var(--bg);border:1px solid var(--border);padding:24px;border-radius:16px;transition:all 0.2s;}
.rec-item:hover{border-color:var(--gold);transform:scale(1.02);}
.rec-icon{font-size:2rem;margin-bottom:16px;display:block;}
.rec-label{font-weight:700;color:var(--gold);margin-bottom:8px;display:block;}
.rec-desc{font-size:0.85rem;color:var(--muted);line-height:1.5;}

/* SIMULATOR CENTRAL */
.sim-central{background:var(--surface);border:2px solid var(--gold-dim);border-radius:24px;padding:40px;margin-bottom:60px;box-shadow:0 20px 40px rgba(0,0,0,0.3);}
.sim-hd{text-align:center;margin-bottom:40px;}
.sim-title{font-family:'DM Serif Display',serif;font-size:2.2rem;margin-bottom:12px;}
.sim-grid{display:grid;grid-template-columns:1fr 1fr;gap:30px;}
@media(max-width:768px){.sim-grid{grid-template-columns:1fr;}}
.sim-inputs{display:flex;flex-direction:column;gap:20px;}
.sim-output{background:var(--bg);border:1px solid var(--border);border-radius:16px;padding:30px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;}
.sim-res-label{font-size:0.8rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted);margin-bottom:10px;}
.sim-res-val{font-family:'DM Serif Display',serif;font-size:3rem;color:var(--gold);margin-bottom:10px;}
.sim-res-sub{font-size:0.9rem;color:var(--muted);}

/* CONVERSION */
.conv-section{text-align:center;padding:60px 20px;border-top:1px solid var(--border);}
.conv-title{font-family:'DM Serif Display',serif;font-size:2rem;margin-bottom:30px;}
.conv-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;}

/* UTILS */
.divider{height:1px;background:var(--border);margin:40px 0;}
.disclaimer{background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:18px 22px;margin-top:40px;font-size:.78rem;color:var(--muted);line-height:1.7;}
.disclaimer strong{color:var(--gold-dim);font-weight:600;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em;}

/* BUTTONS */
.btn-gold{width:100%;margin-top:22px;background:var(--gold);color:var(--bg);border:none;border-radius:10px;padding:13px 22px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:.92rem;cursor:pointer;transition:background .2s;letter-spacing:.02em;}
.btn-gold:hover{background:var(--gold-light);}
`;

const MARKET_DEF = [
  { key:"XAU-BRL", label:"Ouro", icon:"🟨", unit:"R$", cat:"Proteção", interpret:"Reserva de valor histórica. Ideal para proteção contra inflação e incertezas." },
  { key:"USD-BRL", label:"Dólar", icon:"🇺🇸", unit:"R$", cat:"Câmbio", interpret:"Moeda global. Influencia preços de importados e viagens internacionais." },
  { key:"IBOV",    label:"IBOVESPA", icon:"🇧🇷", unit:"Pts", cat:"Ações", interpret:"Reflexo das maiores empresas brasileiras. Termômetro da economia local." },
  { key:"BTC-BRL", label:"Bitcoin", icon:"₿", unit:"R$", cat:"Cripto", interpret:"Ativo digital escasso. Alta volatilidade, foco em potencial de longo prazo." },
];

const INVEST = [
  { name:"CDB 100% CDI", icon:"🛡️", tag:"Conservador", desc:"Segurança total com liquidez diária. Ideal para reserva de emergência.", rate: 12.3 },
  { name:"Tesouro IPCA+", icon:"📈", tag:"Inflação", desc:"Protege seu poder de compra. Ideal para aposentadoria e longo prazo.", rate: 11.5 },
  { name:"Ações Dividendos", icon:"💰", tag:"Renda Passiva", desc:"Receba parte dos lucros de grandes empresas. Foco em geração de renda.", rate: 9.8 },
];

function fmtBRL(v){ return v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); }
function fmtNum(v,dec=2){ return v.toLocaleString("pt-BR",{minimumFractionDigits:dec,maximumFractionDigits:dec}); }

export default function App() {
  const [marketData, setMarketData] = useState(null);
  const [bcbData, setBcbData] = useState({});
  const [loading, setLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [sim, setSim] = useState({ valor: "10000", meses: "12", taxa: "12.3" });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const resM = await fetch(`/api/cotacoes`);
      const dataM = await resM.json();
      setMarketData(dataM);

      const resB = await fetch(`/api/bcb?serie=11`);
      const dataB = await resB.json();
      if (dataB?.length) setBcbData({ selic: dataB[0].valor });

      // IA Summary
      const summaryText = Object.entries(dataM).map(([k,v]) => `${v.name}: ${v.bid}`).join(", ");
      const resAi = await fetch("/api/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "Você é um consultor financeiro. Resuma o mercado hoje em 2 frases simples, focando no que o usuário deve fazer." },
            { role: "user", content: `Dados: ${summaryText}` }
          ]
        })
      });
      const dataAi = await resAi.json();
      setAiSummary(dataAi.choices?.[0]?.message?.content || "Mercado em movimento. Diversificação é a chave hoje.");
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const simResult = useMemo(() => {
    const v = parseFloat(sim.valor) || 0;
    const m = parseInt(sim.meses) || 1;
    const t = parseFloat(sim.taxa) || 0;
    const taxaMensal = Math.pow(1 + (t/100), 1/12) - 1;
    return v * Math.pow(1 + taxaMensal, m);
  }, [sim]);

  return (
    <div className="root">
      <style>{S}</style>
      <div className="noise" />
      
      <header className="hdr">
        <div className="logo">
          FinançaBR
          <small>inteligência financeira</small>
        </div>
        <nav className="tabs">
          <a href="#analise" className="tab">Análise</a>
          <a href="#simulador" className="tab">Simulador</a>
          <a href="#investir" className="tab active">Começar</a>
        </nav>
      </header>

      <section className="hero">
        <h1 className="hero-title">Descubra o que fazer com seu <em>dinheiro</em> hoje</h1>
        <p className="hero-sub">Análises simples + simulações práticas para você tomar decisões financeiras melhores e proteger seu patrimônio.</p>
        <div className="hero-btns">
          <a href="#analise" className="btn-main">Ver análise do dia</a>
          <a href="#simulador" className="btn-sec">Simular investimento</a>
        </div>
      </section>

      <main className="main">
        <div id="analise" className="divider" />
        
        <div className="sec-hd">
          <div className="sec-cat">Resumo do Consultor</div>
          <h2 className="sec-title">O que o <em>mercado</em> diz hoje</h2>
        </div>

        <div className="analysis-box">
          <div className="analysis-hd">
            <span>✨ Insights do dia</span>
          </div>
          <p className="analysis-txt">
            {loading ? "Analisando mercados..." : aiSummary}
          </p>
        </div>

        <div className="cmd-grid">
          {MARKET_DEF.map(item => {
            const v = marketData?.[item.key.replace("-","")];
            const bid = parseFloat(v?.bid || 0);
            const chg = parseFloat(v?.pctChange || 0);
            return (
              <div className="cmd-card" key={item.key}>
                <div className="cmd-card-top">
                  <span className="cmd-icon">{item.icon}</span>
                  <span className={`cmd-chg ${chg >= 0 ? 'chg-up' : 'chg-dn'}`}>
                    {chg >= 0 ? '+' : ''}{fmtNum(chg)}%
                  </span>
                </div>
                <div className="cmd-name">{item.label}</div>
                <div className="cmd-price">{item.unit} {fmtNum(bid)}</div>
                <p className="cmd-interpret">{item.interpret}</p>
                <div className="cmd-cta" onClick={() => setSim({...sim, taxa: item.key === 'IBOV' ? '9.5' : '12.3'})}>
                  Simular investimento →
                </div>
              </div>
            );
          })}
        </div>

        <div className="rec-box">
          <h2 className="rec-title">Com base no cenário atual, considere:</h2>
          <div className="rec-grid">
            {INVEST.map(inv => (
              <div className="rec-item" key={inv.name}>
                <span className="rec-icon">{inv.icon}</span>
                <span className="rec-label">{inv.name}</span>
                <p className="rec-desc">{inv.desc}</p>
                <div className="cmd-cta" style={{justifyContent:'center', marginTop:'15px'}} onClick={() => setSim({...sim, taxa: inv.rate.toString()})}>
                  Testar no simulador
                </div>
              </div>
            ))}
          </div>
        </div>

        <div id="simulador" className="sim-central">
          <div className="sim-hd">
            <h2 className="sim-title">Simulador de <em>Resultados</em></h2>
            <p className="sec-sub">Veja o poder dos juros compostos no seu patrimônio.</p>
          </div>
          <div className="sim-grid">
            <div className="sim-inputs">
              <div className="field">
                <label>Quanto quer investir?</label>
                <div className="inp-wrap">
                  <span className="inp-pre">R$</span>
                  <input className="inp" type="number" value={sim.valor} onChange={e => setSim({...sim, valor: e.target.value})} />
                </div>
              </div>
              <div className="field">
                <label>Por quanto tempo? (meses)</label>
                <div className="inp-wrap">
                  <input className="inp np" type="number" value={sim.meses} onChange={e => setSim({...sim, meses: e.target.value})} />
                </div>
              </div>
              <div className="field">
                <label>Taxa estimada (% ao ano)</label>
                <div className="inp-wrap">
                  <input className="inp np" type="number" value={sim.taxa} onChange={e => setSim({...sim, taxa: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="sim-output">
              <span className="sim-res-label">Resultado estimado</span>
              <div className="sim-res-val">{fmtBRL(simResult)}</div>
              <p className="sim-res-sub">Lucro de {fmtBRL(simResult - (parseFloat(sim.valor)||0))}</p>
              <a href="#investir" className="btn-gold" style={{marginTop:'30px'}}>Ver melhores opções reais</a>
            </div>
          </div>
        </div>

        <section id="investir" className="conv-section">
          <h2 className="conv-title">Quer aplicar isso na prática?</h2>
          <div className="conv-btns">
            <a href="#" className="btn-main" style={{padding:'18px 40px'}}>Abrir conta em corretora</a>
            <a href="#" className="btn-sec" style={{padding:'18px 40px'}}>Ver opções de crédito</a>
          </div>
          <p style={{marginTop:'20px', fontSize:'0.8rem', color:'var(--muted)'}}>*Links de parceiros selecionados</p>
        </section>

        <div className="disclaimer">
          <strong>Aviso Legal</strong>
          Este site é uma ferramenta de simulação e educação financeira. As informações e análises geradas não constituem recomendação oficial de investimento. O mercado financeiro envolve riscos. Sempre consulte um profissional certificado antes de tomar decisões definitivas.
        </div>
      </main>

      <footer className="ftr">
        <div className="ftr-copy">© 2026 FinançaBR — Inteligência para sua liberdade financeira.</div>
      </footer>
    </div>
  );
}
