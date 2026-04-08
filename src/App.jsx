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
.btn-main{background:var(--gold);color:var(--bg);padding:16px 32px;border-radius:12px;font-weight:700;text-decoration:none;transition:all 0.2s;box-shadow:0 10px 20px rgba(201,168,76,0.15);cursor:pointer;border:none;font-family:inherit;}
.btn-main:hover{background:var(--gold-light);transform:translateY(-2px);}
.btn-sec{background:transparent;border:1px solid var(--border);color:var(--text);padding:16px 32px;border-radius:12px;font-weight:600;text-decoration:none;transition:all 0.2s;cursor:pointer;font-family:inherit;}
.btn-sec:hover{border-color:var(--gold-dim);background:rgba(255,255,255,0.03);}

/* TABS */
.tabs{display:flex;gap:4px;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:4px;}
.tab{padding:6px 16px;border-radius:7px;font-size:.8rem;font-weight:500;cursor:pointer;border:none;background:transparent;color:var(--muted);transition:all .18s;letter-spacing:.02em;}
.tab.active{background:var(--surface2);color:var(--gold);border:1px solid var(--border);}
.tab:hover:not(.active){color:var(--text);}

/* MAIN */
.main{max-width:1000px;margin:0 auto;padding:40px 20px 100px;position:relative;z-index:1;}

/* SECTION HEADER */
.sec-hd{margin-bottom:28px;}
.sec-cat{display:inline-block;background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.2);color:var(--gold);font-size:.65rem;letter-spacing:.14em;text-transform:uppercase;padding:3px 11px;border-radius:100px;margin-bottom:12px;}
.sec-title{font-family:'DM Serif Display',serif;font-size:clamp(1.6rem,3.5vw,2.2rem);line-height:1.15;letter-spacing:-.03em;margin-bottom:8px;}
.sec-title em{color:var(--gold);font-style:italic;}
.sec-sub{color:var(--muted);font-size:.875rem;line-height:1.6;}

/* BCB STRIP */
.bcb-strip{display:flex;gap:12px;margin-bottom:28px;flex-wrap:wrap;}
.bcb-chip{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:10px 16px;display:flex;flex-direction:column;gap:3px;flex:1;min-width:120px;}
.bcb-chip-label{font-size:.65rem;letter-spacing:.1rem;text-transform:uppercase;color:var(--muted);}
.bcb-chip-val{font-family:'DM Serif Display',serif;font-size:1.3rem;color:var(--gold);}
.bcb-chip-sub{font-size:.7rem;color:var(--muted);}

/* AI SUMMARY */
.ai-summary{background:rgba(201,168,76,.04);border:1px solid rgba(201,168,76,.12);border-radius:12px;padding:20px;margin-bottom:24px;position:relative;overflow:hidden;}
.ai-summary-hd{display:flex;align-items:center;gap:8px;margin-bottom:12px;font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);}
.ai-summary-txt{font-size:.88rem;line-height:1.6;color:#d4cec0;}
.ai-summary-loading{display:flex;align-items:center;gap:10px;color:var(--muted);font-size:.8rem;}
.ai-dots span{display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--gold);margin:0 2px;animation:dp 1.4s infinite ease-in-out;}
.ai-dots span:nth-child(2){animation-delay:.2s;}
.ai-dots span:nth-child(3){animation-delay:.4s;}
@keyframes dp{0%,80%,100%{opacity:.2;transform:scale(.8);}40%{opacity:1;transform:scale(1);}}

/* COMMODITY GRID */
.cmd-toolbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px;}
.cmd-update{font-size:.75rem;color:var(--muted);}
.cmd-update span{color:var(--green);}
.refresh-btn{background:transparent;border:1px solid var(--border);border-radius:7px;padding:6px 14px;color:var(--muted);font-size:.78rem;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .18s;display:flex;align-items:center;gap:6px;}
.refresh-btn:hover{border-color:var(--gold-dim);color:var(--gold);}
.refresh-btn:disabled{opacity:.5;cursor:not-allowed;}
.spin{display:inline-block;animation:spin .8s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}

.cmd-cats{display:flex;flex-direction:column;gap:20px;}
.cmd-cat-title{font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:10px;padding-left:2px;}
.cmd-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;}
.cmd-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:16px 16px 12px;transition:border-color .2s;display:flex;flex-direction:column;cursor:pointer;}
.cmd-card:hover{border-color:var(--gold-dim);}
.cmd-card.active{border-color:var(--gold-dim);background:rgba(201,168,76,.02);}
.cmd-card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
.cmd-icon{font-size:1.1rem;}
.cmd-chg{font-size:.75rem;font-weight:600;padding:2px 8px;border-radius:100px;}
.chg-up{background:rgba(76,175,125,.12);color:var(--green);}
.chg-dn{background:rgba(224,85,85,.12);color:var(--red);}
.chg-flat{background:rgba(138,128,112,.12);color:var(--muted);}
.cmd-name{font-size:.72rem;color:var(--muted);margin-bottom:4px;letter-spacing:.02em;}
.cmd-price{font-family:'DM Serif Display',serif;font-size:1.25rem;color:var(--text);}
.cmd-unit{font-size:.68rem;color:var(--muted);margin-top:2px;}
.cmd-chart{margin-top:16px;height:50px;width:100%;opacity:.6;transition:opacity .2s;pointer-events:none;}
.cmd-card:hover .cmd-chart{opacity:1;}
.cmd-skeleton{background:linear-gradient(90deg,var(--surface) 25%,var(--surface2) 50%,var(--surface) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:6px;}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* CALC CARD */
.calc-wrap{margin-top:14px;padding-top:14px;border-top:1px solid var(--border);animation:fadeIn .2s ease-out;}
@keyframes fadeIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
.calc-label{font-size:.65rem;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin-bottom:8px;display:block;}
.calc-input-group{display:flex;align-items:center;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:4px 8px;gap:8px;}
.calc-input-group:focus-within{border-color:var(--gold-dim);}
.calc-inp{background:transparent;border:none;color:var(--text);font-family:'DM Sans',sans-serif;font-size:.85rem;width:100%;outline:none;padding:4px 0;}
.calc-res{margin-top:10px;font-size:.82rem;color:var(--gold);font-weight:500;}

/* CARD */
.card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:28px 28px;margin-bottom:20px;}
.card-title{font-family:'DM Serif Display',serif;font-size:1.05rem;margin-bottom:22px;}

/* FORM */
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
@media(max-width:540px){.form-grid{grid-template-columns:1fr;}}
.field{display:flex;flex-direction:column;gap:7px;}
.field label{font-size:.7rem;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);font-weight:500;}
.inp-wrap{position:relative;}
.inp-pre{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--gold-dim);font-size:.82rem;pointer-events:none;font-weight:500;}
.inp-suf{position:absolute;right:13px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:.78rem;pointer-events:none;}
.inp{width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:11px 13px 11px 34px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:.92rem;outline:none;transition:border-color .2s;}
.inp:focus{border-color:var(--gold-dim);}
.inp.np{padding-left:13px;}
.inp.ns{padding-right:36px;}

/* RESULTS */
.res-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;}
@media(max-width:480px){.res-grid{grid-template-columns:1fr 1fr;}}
.res-item{background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:14px;}
.res-lbl{font-size:.65rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:7px;}
.res-val{font-family:'DM Serif Display',serif;font-size:1.35rem;}
.res-val.g{color:var(--green);}
.res-val.r{color:var(--red);}
.res-val.o{color:var(--gold);}
.res-sub{font-size:.68rem;color:var(--muted);margin-top:3px;}

/* AI BOX */
.ai-box{background:rgba(201,168,76,.04);border:1px solid rgba(201,168,76,.18);border-radius:12px;padding:24px 26px;margin-top:4px;}
.ai-hd{display:flex;align-items:center;gap:10px;margin-bottom:16px;}
.ai-badge{background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.25);border-radius:100px;padding:3px 11px;font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);}
.ai-hdtxt{font-family:'DM Serif Display',serif;font-size:1rem;}
.ai-loading{display:flex;align-items:center;gap:10px;color:var(--muted);font-size:.85rem;}
.ai-txt{font-size:.9rem;line-height:1.8;color:#d4cec0;white-space:pre-wrap;}

/* COMPARADOR */
.cmp-inputs{display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap;}
.cmp-inp-wrap{display:flex;flex-direction:column;gap:6px;flex:1;min-width:140px;}
.cmp-inp-lbl{font-size:.68rem;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);}
.cmp-table-wrap{overflow-x:auto;}
.cmp-table{width:100%;border-collapse:collapse;font-size:.875rem;}
.cmp-table th{background:var(--surface2);color:var(--muted);font-weight:500;text-align:left;padding:11px 14px;font-size:.7rem;letter-spacing:.07em;text-transform:uppercase;}
.cmp-table td{padding:12px 14px;border-bottom:1px solid var(--border);color:#d4cec0;vertical-align:middle;}
.cmp-table tr:last-child td{border-bottom:none;}
.cmp-table tr:hover td{background:rgba(201,168,76,.02);}
.badge-best{background:rgba(76,175,125,.12);color:var(--green);font-size:.68rem;padding:2px 8px;border-radius:100px;font-weight:600;white-space:nowrap;}
.inv-name{font-weight:500;color:var(--text);}
.inv-tag{display:block;font-size:.68rem;color:var(--muted);font-weight:300;}

/* DIVIDENDOS */
.div-table-wrap{background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow-x:auto;overflow-y:hidden;margin-bottom:24px;-webkit-overflow-scrolling:touch;}
.div-table{width:100%;border-collapse:collapse;font-size:.85rem;text-align:left;min-width:600px;}
.div-table th{background:var(--surface2);color:var(--muted);font-weight:600;padding:14px 12px;font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;border-bottom:1px solid var(--border);white-space:nowrap;}
.div-table td{padding:14px 12px;border-bottom:1px solid var(--border);color:#d4cec0;vertical-align:middle;}
.div-table tr:last-child td{border-bottom:none;}
.div-table tr:hover td{background:rgba(201,168,76,.03);}
.div-ticker{font-weight:700;color:var(--gold);font-size:.85rem;display:block;}
.div-name{font-size:.65rem;color:var(--muted);display:block;margin-top:2px;}
.div-type{font-size:.65rem;background:rgba(201,168,76,.1);color:var(--gold-light);padding:2px 6px;border-radius:100px;display:inline-block;font-weight:500;white-space:nowrap;}
.div-val{font-family:'DM Serif Display',serif;font-size:.95rem;color:var(--text);}
.div-date{font-size:.75rem;color:var(--text);font-weight:500;white-space:nowrap;}

/* ARTIGOS */
.art-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;}
.art-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:22px;cursor:pointer;transition:border-color .2s,transform .15s;}
.art-card:hover{border-color:var(--gold-dim);transform:translateY(-2px);}
.art-card-cat{font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold-dim);margin-bottom:8px;}
.art-card-title{font-family:'DM Serif Display',serif;font-size:1.15rem;margin-bottom:10px;line-height:1.3;}
.art-card-desc{font-size:.82rem;color:var(--muted);line-height:1.5;margin-bottom:16px;}
.art-card-ft{display:flex;align-items:center;gap:12px;font-size:.7rem;color:var(--gold-dim);}

.art-view{max-width:720px;margin:0 auto;}
.art-view-cat{background:rgba(201,168,76,.1);color:var(--gold);font-size:.65rem;padding:3px 10px;border-radius:100px;text-transform:uppercase;letter-spacing:.1em;margin-bottom:16px;display:inline-block;}
.art-view-title{font-family:'DM Serif Display',serif;font-size:2.4rem;margin-bottom:20px;line-height:1.1;}
.art-view-meta{display:flex;gap:20px;font-size:.75rem;color:var(--muted);margin-bottom:40px;padding-bottom:20px;border-bottom:1px solid var(--border);}
.art-content{font-size:1rem;line-height:1.8;color:#d4cec0;}
.art-content h3{font-family:'DM Serif Display',serif;font-size:1.5rem;color:var(--text);margin:32px 0 16px;}
.art-content p{margin-bottom:20px;}
.art-content strong{color:var(--gold-light);}

/* CONVERSION */
.conv-section{text-align:center;padding:60px 20px;border-top:1px solid var(--border);margin-top:60px;}
.conv-title{font-family:'DM Serif Display',serif;font-size:2rem;margin-bottom:30px;}
.conv-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;}

/* DISCLAIMER */
.disclaimer{background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:18px 22px;margin-top:40px;font-size:.78rem;color:var(--muted);line-height:1.7;}
.disclaimer strong{color:var(--gold-dim);font-weight:600;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em;}

.ftr{border-top:1px solid var(--border);padding:40px 20px;text-align:center;margin-top:60px;}
.btn-back{background:transparent;border:1px solid var(--border);border-radius:8px;padding:8px 16px;color:var(--muted);font-size:.8rem;cursor:pointer;margin-bottom:24px;display:inline-block;}
.btn-back:hover{border-color:var(--gold-dim);color:var(--gold);}
`;

const MARKET_DEF = [
  { key:"XAU-BRL", label:"Ouro/Real", icon:"🟨", unit:"R$", cat:"Metais" },
  { key:"XAG-BRL", label:"Prata/Real", icon:"⚪", unit:"R$", cat:"Metais" },
  { key:"USD-BRL", label:"Dólar/Real", icon:"🇺🇸", unit:"R$", cat:"Câmbio" },
  { key:"EUR-BRL", label:"Euro/Real", icon:"🇪🇺", unit:"R$", cat:"Câmbio" },
  { key:"OIL", label:"Petróleo Brent", icon:"🛢️", unit:"USD", cat:"Commodities" },
  { key:"SPX", label:"S&P 500", icon:"🇺🇸", unit:"Pts", cat:"Bolsas" },
  { key:"NAS", label:"Nasdaq", icon:"💻", unit:"Pts", cat:"Bolsas" },
  { key:"IBOV", label:"IBOVESPA", icon:"🇧🇷", unit:"Pts", cat:"Bolsas" },
  { key:"BTC-BRL", label:"Bitcoin/Real", icon:"₿", unit:"R$", cat:"Cripto" },
  { key:"ETH-BRL", label:"Ethereum/Real", icon:"Ξ", unit:"R$", cat:"Cripto" },
];

const BCB_DEF = [
  { key:"11", label:"SELIC", sub:"Taxa básica de juros" },
  { key:"433", label:"IPCA", sub:"Inflação mensal" },
];

const INVEST = [
  { name:"Poupança", tag:"isento de IR", rate: 7.6, ir:false, liq:"Imediata", min:"R$ 1" },
  { name:"Tesouro Selic", tag:"gov. federal", rate:12.2, ir:true, liq:"D+1", min:"R$ 30" },
  { name:"CDB 100% CDI", tag:"banco digital", rate:12.3, ir:true, liq:"D+0/D+1", min:"R$ 1" },
  { name:"LCI / LCA", tag:"isento de IR", rate:10.8, ir:false, liq:"90 dias+", min:"R$ 500" },
  { name:"Ações (Dividendos)", tag:"renda variável", rate: 9.5, ir:false, liq:"D+2", min:"R$ 10" },
  { name:"Fundos Imobiliários", tag:"renda mensal", rate:11.2, ir:false, liq:"D+2", min:"R$ 100" },
];

const DIVIDENDS = [
  { ticker: "PETR4", name: "Petrobras", type: "Dividendo", value: "0,52", dateCom: "25/04/2026", datePay: "20/05/2026" },
  { ticker: "VALE3", name: "Vale", type: "JCP", value: "2,73", dateCom: "11/04/2026", datePay: "19/04/2026" },
  { ticker: "ITUB4", name: "Itaú Unibanco", type: "Dividendo", value: "0,017", dateCom: "30/04/2026", datePay: "01/06/2026" },
  { ticker: "BBDC4", name: "Bradesco", type: "JCP", value: "0,017", dateCom: "01/05/2026", datePay: "03/06/2026" },
  { ticker: "BBAS3", name: "Banco do Brasil", type: "Dividendo", value: "0,41", dateCom: "13/05/2026", datePay: "28/05/2026" },
  { ticker: "ABEV3", name: "Ambev", type: "JCP", value: "0,73", dateCom: "19/12/2025", datePay: "15/04/2026" },
  { ticker: "WEGE3", name: "WEG", type: "Dividendo", value: "0,24", dateCom: "24/03/2026", datePay: "14/08/2026" },
  { ticker: "EGIE3", name: "Engie Brasil", type: "Dividendo", value: "1,13", dateCom: "08/05/2026", datePay: "26/07/2026" },
  { ticker: "CPLE6", name: "Copel", type: "JCP", value: "0,14", dateCom: "31/03/2026", datePay: "30/06/2026" },
  { ticker: "SANB11", name: "Santander BR", type: "Dividendo", value: "0,18", dateCom: "19/04/2026", datePay: "15/05/2026" }
];

const ARTICLES = [
  { id:"cdb-vs-tesouro", cat:"Investimentos", title:"CDB vs Tesouro Direto — qual rende mais?", desc:"Entenda as diferenças reais entre CDB e Tesouro Direto.", tempo:"6 min", updated:"Janeiro 2026", conteudo: "<h3>CDB vs Tesouro</h3><p>Ambos são excelentes para reserva de emergência...</p>", afiliados:[{label:"Nubank", href:"#"}] },
  { id:"sair-cheque-especial", cat:"Crédito", title:"Como sair do cheque especial de vez", desc:"O cheque especial cobra juros de até 150% ao ano. Veja como sair.", tempo:"5 min", updated:"Janeiro 2026", conteudo: "<h3>Cheque Especial</h3><p>Fuja dos juros abusivos...</p>", afiliados:[{label:"Inter", href:"#"}] },
];

function fmtBRL(v){ return v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); }
function fmtNum(v,dec=2){ return v.toLocaleString("pt-BR",{minimumFractionDigits:dec,maximumFractionDigits:dec}); }
function calcParcela(val,entrada,taxaAA,anos){
  const p=val-entrada, i=taxaAA/100/12, n=anos*12;
  if(i===0) return p/n;
  return (p*i*Math.pow(1+i,n))/(Math.pow(1+i,n)-1);
}

// ──────────────────────────────────────────────
// COMPONENTS
// ──────────────────────────────────────────────

function Cotacoes({ marketData, bcbData, loading, ts, fetchAll, aiSummary, aiLoading }) {
  const [activeCalc, setActiveCalc] = useState(null);
  const [calcVal, setCalcVal] = useState("1");
  const cats = [...new Set(MARKET_DEF.map(c => c.cat))];

  return (
    <div>
      <div className="sec-hd">
        <div className="sec-cat">Mercados</div>
        <h2 className="sec-title">Cotações em <em>tempo real</em></h2>
        <p className="sec-sub">Dados reais via AwesomeAPI e Banco Central do Brasil.</p>
      </div>

      <div className="bcb-strip">
        {BCB_DEF.map(b => (
          <div className="bcb-chip" key={b.key}>
            <div className="bcb-chip-label">{b.label}</div>
            {bcbData[b.key] ? <div className="bcb-chip-val">{fmtNum(parseFloat(bcbData[b.key]), 2)}%</div> : <div className="bcb-chip-val cmd-skeleton" style={{height:28,width:80}}>&nbsp;</div>}
            <div className="bcb-chip-sub">{b.sub}</div>
          </div>
        ))}
      </div>

      {(aiLoading || aiSummary) && (
        <div className="ai-summary">
          <div className="ai-summary-hd">
            <span className="ai-badge" style={{fontSize:".55rem"}}>IA</span>
            <span>Análise do Dia</span>
          </div>
          {aiLoading ? <div className="ai-summary-loading"><div className="ai-dots"><span/><span/><span/></div>Gerando insights...</div> : <div className="ai-summary-txt">{aiSummary}</div>}
        </div>
      )}

      <div className="cmd-toolbar">
        <div className="cmd-update">{ts ? <><span>●</span> Atualizado {ts.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</> : "Buscando..."}</div>
        <button className="refresh-btn" onClick={fetchAll} disabled={loading}><span className={loading?"spin":""}>↻</span> {loading ? "..." : "Atualizar"}</button>
      </div>

      <div className="cmd-cats">
        {cats.map(cat => (
          <div key={cat}>
            <div className="cmd-cat-title">{cat}</div>
            <div className="cmd-grid">
              {MARKET_DEF.filter(c => c.cat === cat).map(item => {
                const v = marketData?.[item.key.replace("-","")];
                const chg = v ? parseFloat(v.pctChange) : 0;
                const bid = parseFloat(v?.bid || 0);
                const isCalc = activeCalc === item.key;
                return (
                  <div className={`cmd-card ${isCalc ? 'active' : ''}`} key={item.key} onClick={() => { setActiveCalc(isCalc ? null : item.key); setCalcVal("1"); }}>
                    <div className="cmd-card-top"><span className="cmd-icon">{item.icon}</span><span className={`cmd-chg ${chg > 0 ? "chg-up" : chg < 0 ? "chg-dn" : "chg-flat"}`}>{chg > 0 ? "+" : ""}{fmtNum(chg,2)}%</span></div>
                    <div className="cmd-name">{item.label}</div>
                    <div className="cmd-price">{item.unit} {fmtNum(bid,2)}</div>
                    {isCalc && (
                      <div className="calc-wrap" onClick={e => e.stopPropagation()}>
                        <span className="calc-label">Conversor</span>
                        <div className="calc-input-group"><input autoFocus className="calc-inp" value={calcVal} onChange={e => setCalcVal(e.target.value)} /></div>
                        <div className="calc-res">= {fmtBRL((parseFloat(calcVal.replace(",",".")) || 0) * bid)}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Simulador() {
  const [f,setF] = useState({renda:"8000",imovel:"400000",entrada:"80000",prazo:"30",taxa:"10.49"});
  const [res,setRes] = useState(null);
  const [aiTxt,setAiTxt] = useState("");
  const [loading,setLoading] = useState(false);

  const calcular = async () => {
    const renda = parseFloat(f.renda), imovel = parseFloat(f.imovel), entrada = parseFloat(f.entrada), prazo = parseInt(f.prazo), taxa = parseFloat(f.taxa.replace(",","."));
    const parcela = calcParcela(imovel,entrada,taxa,prazo);
    setRes({renda,imovel,entrada,prazo,taxa,parcela,comp:(parcela/renda)*100,total:parcela*prazo*12,juros:(parcela*prazo*12)-(imovel-entrada)});
    setLoading(true);
    try {
      const response = await fetch("/api/groq", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ messages:[{role:"system",content:"Você é um consultor financeiro brasileiro."}, {role:"user",content:`Analise: Renda ${fmtBRL(renda)}, Imóvel ${fmtBRL(imovel)}, Parcela ${fmtBRL(parcela)}. Recomendações?`}]}) });
      const data = await response.json();
      setAiTxt(data.choices?.[0]?.message?.content || "Análise indisponível.");
    } catch(e) { setAiTxt("Erro na análise."); }
    setLoading(false);
  };

  return (
    <div className="card">
      <div className="sec-hd"><div className="sec-cat">Simulador</div><h2 className="sec-title">Crédito <em>Imobiliário</em></h2></div>
      <div className="form-grid">
        <div className="field"><label>Renda Mensal</label><input className="inp np" value={f.renda} onChange={e => setF({...f, renda: e.target.value})} /></div>
        <div className="field"><label>Valor do Imóvel</label><input className="inp np" value={f.imovel} onChange={e => setF({...f, imovel: e.target.value})} /></div>
        <div className="field"><label>Entrada</label><input className="inp np" value={f.entrada} onChange={e => setF({...f, entrada: e.target.value})} /></div>
        <div className="field"><label>Prazo (anos)</label><input className="inp np" value={f.prazo} onChange={e => setF({...f, prazo: e.target.value})} /></div>
      </div>
      <button className="btn-gold" onClick={calcular}>Calcular e Analisar com IA</button>
      {res && (
        <div className="res-grid" style={{marginTop:30}}>
          <div className="res-item"><div className="res-lbl">Parcela</div><div className="res-val o">{fmtBRL(res.parcela)}</div></div>
          <div className="res-item"><div className="res-lbl">Comprometimento</div><div className="res-val r">{res.comp.toFixed(1)}%</div></div>
          <div className="res-item"><div className="res-lbl">Total Juros</div><div className="res-val">{fmtBRL(res.juros)}</div></div>
        </div>
      )}
      {aiTxt && <div className="ai-box"><div className="ai-txt">{aiTxt}</div></div>}
    </div>
  );
}

// ──────────────────────────────────────────────
// APP MAIN
// ──────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState("home");
  const [marketData, setMarketData] = useState(null);
  const [bcbData, setBcbData] = useState({});
  const [loading, setLoading] = useState(false);
  const [ts, setTs] = useState(null);
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [art, setArt] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true); setAiLoading(true);
    try {
      const resM = await fetch(`/api/cotacoes`); const dataM = await resM.json();
      setMarketData(dataM); setTs(new Date());
      const resB = await fetch(`/api/bcb?serie=11`); const dataB = await resB.json();
      if (dataB?.length) setBcbData({ "11": dataB[0].valor });
      const summaryText = Object.entries(dataM).map(([k,v]) => `${v.name}: ${v.bid}`).join(", ");
      const resAi = await fetch("/api/groq", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "system", content: "Analista financeiro. Resumo curto do mercado e o que fazer hoje." }, { role: "user", content: `Dados: ${summaryText}` }]}) });
      const dataAi = await resAi.json(); setAiSummary(dataAi.choices?.[0]?.message?.content || "Diversifique hoje.");
    } catch (e) { console.error(e); }
    setLoading(false); setAiLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <div className="root">
      <style>{S}</style>
      <div className="noise" />
      <header className="hdr">
        <div className="logo" onClick={() => {setTab("home"); setArt(null);}}>FinançaBR<small>inteligência financeira</small></div>
        <nav className="tabs">
          <button className={`tab ${tab==="home"?'active':''}`} onClick={()=>setTab("home")}>Início</button>
          <button className={`tab ${tab==="mercados"?'active':''}`} onClick={()=>setTab("mercados")}>Cotações</button>
          <button className={`tab ${tab==="simulador"?'active':''}`} onClick={()=>setTab("simulador")}>Simulador</button>
          <button className={`tab ${tab==="dividendos"?'active':''}`} onClick={()=>setTab("dividendos")}>Dividendos</button>
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
                  <p className="hero-sub">Análises em tempo real para você decidir melhor.</p>
                  <div className="hero-btns">
                    <button className="btn-main" onClick={()=>setTab("mercados")}>Ver Análise do Dia</button>
                    <button className="btn-sec" onClick={()=>setTab("simulador")}>Simular Investimento</button>
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
            {tab === "mercados" && <Cotacoes marketData={marketData} bcbData={bcbData} loading={loading} ts={ts} fetchAll={fetchAll} aiSummary={aiSummary} aiLoading={aiLoading} />}
            {tab === "simulador" && <Simulador />}
            {tab === "dividendos" && (
              <div className="div-table-wrap">
                <table className="div-table">
                  <thead><tr><th>Empresa</th><th>Tipo</th><th>Valor</th><th>Data Com</th></tr></thead>
                  <tbody>{DIVIDENDS.map(d => <tr key={d.ticker}><td><span className="div-ticker">{d.ticker}</span><span className="div-name">{d.name}</span></td><td><span className="div-type">{d.type}</span></td><td><span className="div-val">R$ {d.value}</span></td><td><span className="div-date">{d.dateCom}</span></td></tr>)}</tbody>
                </table>
              </div>
            )}
          </>
        )}
        <section className="conv-section">
          <h2 className="conv-title">Pronto para investir?</h2>
          <div className="conv-btns"><button className="btn-main">Abrir conta em corretora</button><button className="btn-sec">Ver opções de crédito</button></div>
        </section>
        <div className="disclaimer"><strong>Aviso Legal</strong>Informações meramente educativas.</div>
      </main>
      <footer className="ftr"><div className="ftr-copy">© 2026 FinançaBR</div></footer>
    </div>
  );
}
