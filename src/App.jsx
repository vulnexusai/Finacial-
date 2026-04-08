import { useState, useEffect, useCallback } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

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

/* TABS */
.tabs{display:flex;gap:4px;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:4px;}
.tab{padding:6px 16px;border-radius:7px;font-size:.8rem;font-weight:500;cursor:pointer;border:none;background:transparent;color:var(--muted);transition:all .18s;letter-spacing:.02em;}
.tab.active{background:var(--surface2);color:var(--gold);border:1px solid var(--border);}
.tab:hover:not(.active){color:var(--text);}

/* MAIN */
.main{max-width:900px;margin:0 auto;padding:40px 20px 100px;position:relative;z-index:1;}

/* SECTION HEADER */
.sec-hd{margin-bottom:28px;}
.sec-cat{display:inline-block;background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.2);color:var(--gold);font-size:.65rem;letter-spacing:.14em;text-transform:uppercase;padding:3px 11px;border-radius:100px;margin-bottom:12px;}
.sec-title{font-family:'DM Serif Display',serif;font-size:clamp(1.6rem,3.5vw,2.2rem);line-height:1.15;letter-spacing:-.03em;margin-bottom:8px;}
.sec-title em{color:var(--gold);font-style:italic;}
.sec-sub{color:var(--muted);font-size:.875rem;line-height:1.6;}

/* BCB STRIP */
.bcb-strip{display:flex;gap:12px;margin-bottom:28px;flex-wrap:wrap;}
.bcb-chip{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:10px 16px;display:flex;flex-direction:column;gap:3px;flex:1;min-width:120px;}
.bcb-chip-label{font-size:.65rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);}
.bcb-chip-val{font-family:'DM Serif Display',serif;font-size:1.3rem;color:var(--gold);}
.bcb-chip-sub{font-size:.7rem;color:var(--muted);}

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

/* RESUMO IA HOME */
.ai-summary{background:rgba(201,168,76,.04);border:1px solid rgba(201,168,76,.12);border-radius:12px;padding:20px;margin-bottom:24px;position:relative;overflow:hidden;}
.ai-summary-hd{display:flex;align-items:center;gap:8px;margin-bottom:12px;font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);}
.ai-summary-txt{font-size:.88rem;line-height:1.6;color:#d4cec0;}
.ai-summary-loading{display:flex;align-items:center;gap:10px;color:var(--muted);font-size:.8rem;}

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
.full{grid-column:1/-1;}

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
.ai-dots span{display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--gold);margin:0 2px;animation:dp 1.4s infinite ease-in-out;}
.ai-dots span:nth-child(2){animation-delay:.2s;}
.ai-dots span:nth-child(3){animation-delay:.4s;}
@keyframes dp{0%,80%,100%{opacity:.2;transform:scale(.8);}40%{opacity:1;transform:scale(1);}}
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
.badge-ir{background:rgba(91,156,246,.1);color:var(--blue);font-size:.68rem;padding:2px 8px;border-radius:100px;}
.inv-name{font-weight:500;color:var(--text);}
.inv-tag{display:block;font-size:.68rem;color:var(--muted);font-weight:300;}

/* BUTTONS */
.btn-gold{width:100%;margin-top:22px;background:var(--gold);color:var(--bg);border:none;border-radius:10px;padding:13px 22px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:.92rem;cursor:pointer;transition:background .2s;letter-spacing:.02em;}
.btn-gold:hover{background:var(--gold-light);}
.btn-gold:disabled{opacity:.5;cursor:not-allowed;}
.btn-back{background:transparent;border:1px solid var(--border);border-radius:8px;padding:8px 16px;color:var(--muted);font-size:.82rem;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .18s;display:inline-flex;align-items:center;gap:6px;margin-bottom:24px;}
.btn-back:hover{border-color:var(--gold-dim);color:var(--gold);}

/* CALLOUT */
.callout{display:flex;align-items:flex-start;gap:10px;background:var(--surface);border-left:3px solid var(--gold);border-radius:0 8px 8px 0;padding:13px 16px;margin:18px 0;font-size:.85rem;color:#d4cec0;line-height:1.6;}
.callout-warn{border-left-color:var(--red);}

/* AFF */
.aff-box{background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:22px 24px;margin-top:20px;}
.aff-lbl{font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold-dim);margin-bottom:12px;}
.aff-links{display:flex;flex-direction:column;gap:8px;}
.aff-link{display:flex;align-items:center;justify-content:space-between;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:11px 14px;color:var(--text);text-decoration:none;font-size:.85rem;transition:border-color .2s,background .2s;}
.aff-link:hover{border-color:var(--gold);background:rgba(201,168,76,.04);}
.aff-arrow{color:var(--gold);}

.divider{height:1px;background:var(--border);margin:22px 0;}

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
`;

const MARKET_DEF = [
  { key:"XAU-BRL", label:"Ouro/Real",     icon:"🟨", unit:"R$", cat:"Metais" },
  { key:"XAG-BRL", label:"Prata/Real",    icon:"⚪", unit:"R$", cat:"Metais" },
  { key:"USD-BRL", label:"Dólar/Real",    icon:"🇺🇸", unit:"R$", cat:"Câmbio" },
  { key:"EUR-BRL", label:"Euro/Real",     icon:"🇪🇺", unit:"R$", cat:"Câmbio" },
  { key:"OIL",     label:"Petróleo Brent", icon:"🛢️", unit:"USD", cat:"Commodities" },
  { key:"SPX",     label:"S&P 500",       icon:"🇺🇸", unit:"Pts", cat:"Bolsas" },
  { key:"NAS",     label:"Nasdaq",        icon:"💻", unit:"Pts", cat:"Bolsas" },
  { key:"IBOV",    label:"IBOVESPA",      icon:"🇧🇷", unit:"Pts", cat:"Bolsas" },
  { key:"BTC-BRL", label:"Bitcoin/Real",  icon:"₿",  unit:"R$", cat:"Cripto" },
  { key:"ETH-BRL", label:"Ethereum/Real", icon:"Ξ",  unit:"R$", cat:"Cripto" },
];

const BCB_DEF = [
  { key:"11",  label:"SELIC", sub:"Taxa básica de juros" },
  { key:"433", label:"IPCA",  sub:"Inflação mensal" },
];

const INVEST = [
  { name:"Poupança",              tag:"isento de IR",   rate: 7.6, ir:false, liq:"Imediata",   min:"R$ 1"     },
  { name:"Tesouro Selic",         tag:"gov. federal",   rate:12.2, ir:true,  liq:"D+1",        min:"R$ 30"    },
  { name:"CDB 100% CDI",          tag:"banco digital",  rate:12.3, ir:true,  liq:"D+0/D+1",    min:"R$ 1"     },
  { name:"LCI / LCA",             tag:"isento de IR",   rate:10.8, ir:false, liq:"90 dias+",   min:"R$ 500"   },
  { name:"Ações (Dividendos)",    tag:"renda variável", rate: 9.5, ir:false, liq:"D+2",        min:"R$ 10"    },
  { name:"Fundos Imobiliários",   tag:"renda mensal",   rate:11.2, ir:false, liq:"D+2",        min:"R$ 100"   },
];

const ARTICLES = [
  {
    id:"onde-investir-2026",
    cat:"Mercados",
    title:"Onde investir em 2026: As melhores oportunidades",
    desc:"Com a Selic em patamares elevados e a inflação controlada, veja quais ativos podem performar melhor este ano.",
    tempo:"6 min",
    updated:"Janeiro 2026",
    conteudo:`
<h3>Cenário Macroeconômico</h3>
<p>O ano de 2026 começa com um cenário de juros reais ainda atrativos no Brasil. O Banco Central mantém a vigilância sobre a inflação, o que sustenta as taxas de renda fixa em dois dígitos. No exterior, a expectativa de corte de juros nos EUA pode favorecer ativos de risco.</p>

<h3>Renda Fixa: A queridinha continua</h3>
<p><strong>Tesouro IPCA+:</strong> Para quem busca proteção contra a inflação a longo prazo, títulos com vencimento em 2029 e 2035 oferecem taxas reais acima de 6% ao ano — um patamar historicamente muito alto.</p>
<p><strong>LCI e LCA:</strong> Continuam sendo excelentes opções para o curto prazo (1 a 2 anos) devido à isenção de Imposto de Renda para pessoa física.</p>

<h3>Renda Variável e FIIs</h3>
<p>O setor imobiliário pode se beneficiar de uma eventual estabilidade ou queda nos juros futuros. Fundos de Papel (CRI) seguem pagando dividendos robustos, enquanto Fundos de Tijolo (shoppings e logística) apresentam desconto em relação ao valor patrimonial.</p>
<p><strong>Ações:</strong> Foco em empresas resilientes e boas pagadoras de dividendos (Utilities e Bancos). O setor de commodities pode sofrer volatilidade dependendo da demanda chinesa.</p>`,
    afiliados:[
      { label:"💜 Nubank — organize suas finanças", href:"#" },
      { label:"🏦 Inter — conta gratuita para começar", href:"#" },
    ]
  },
  {
    id:"reserva-de-emergencia",
    cat:"Planejamento",
    title:"Como montar uma reserva de emergência do zero",
    desc:"A reserva de emergência é o alicerce de qualquer vida financeira saudável. Veja como construir a sua.",
    tempo:"5 min",
    updated:"Janeiro 2026",
    conteudo:`
<h3>Por que a reserva de emergência é tão importante?</h3>
<p>A reserva de emergência é o dinheiro guardado para cobrir imprevistos — perda de emprego, doença, conserto urgente, emergência familiar. Sem ela, qualquer imprevisto vira dívida. Com ela, você tem tranquilidade para tomar decisões melhores sem pressão financeira.</p>
<p>É o primeiro e mais importante passo nas finanças pessoais — mais importante do que qualquer investimento sofisticado.</p>

<h3>Quanto guardar?</h3>
<p><strong>Empregado CLT:</strong> 3 a 6 meses de despesas mensais totais. Como você tem FGTS e seguro-desemprego, pode ser mais conservador. <strong>Autônomo ou MEI:</strong> 6 a 12 meses de despesas. A renda é mais variável e não há rede de proteção do governo. <strong>Empresário:</strong> 12 meses ou mais, especialmente se o negócio é recente.</p>

<h3>Onde guardar a reserva?</h3>
<p>A reserva precisa estar em um investimento com <strong>liquidez imediata</strong> (você saca quando precisar, sem carência) e <strong>baixo risco</strong>. As melhores opções são CDB com liquidez diária de 100% do CDI (Nubank, Inter, C6) ou Tesouro Selic.</p>
<p><strong>Nunca guarde a reserva em:</strong> Poupança bloqueada, CDB com carência, ações ou fundos de risco. O objetivo não é maximizar o rendimento — é ter o dinheiro disponível quando precisar.</p>`,
    afiliados:[
      { label:"💜 Nubank — abra sua conta agora", href:"#" },
      { label:"🏦 Inter — CDB liquidez diária", href:"#" },
      { label:"🟠 C6 Bank — rendimento automático", href:"#" },
    ]
  },
  {
    id:"ir-sobre-investimentos",
    cat:"Impostos & Extras",
    title:"Imposto de Renda sobre investimentos — guia completo",
    desc:"Entenda quais investimentos pagam IR, como funciona a tabela regressiva e como declarar corretamente.",
    tempo:"8 min",
    updated:"Janeiro 2026",
    conteudo:`
<h3>Nem todo investimento paga IR</h3>
<p>O Imposto de Renda incide sobre os rendimentos de alguns investimentos, mas não de todos. Conhecer essa diferença é fundamental para comparar rentabilidades de forma justa e otimizar sua carteira.</p>

<h3>Investimentos isentos de IR (pessoa física)</h3>
<p><strong>Poupança:</strong> 100% isenta. <strong>LCI e LCA:</strong> Letras de Crédito Imobiliário e do Agronegócio — isentas para PF. <strong>CRI e CRA:</strong> Certificados de Recebíveis — isentos. <strong>Debêntures incentivadas:</strong> Emitidas para projetos de infraestrutura — isentas. <strong>FII:</strong> Os dividendos (proventos) são isentos de IR para PF com menos de 10% das cotas e desde que o fundo tenha mais de 50 cotistas. O ganho de capital na venda das cotas paga 20% de IR.</p>

<h3>Tabela regressiva de IR (renda fixa tributada)</h3>
<p>CDB, Tesouro Direto, fundos de renda fixa e LCIs/LCAs empresariais seguem a tabela regressiva: <strong>até 180 dias:</strong> 22,5% | <strong>181 a 360 dias:</strong> 20% | <strong>361 a 720 dias:</strong> 17,5% | <strong>acima de 720 dias:</strong> 15%</p>
<p>O IR é retido na fonte automaticamente pelo banco ou corretora — você não precisa calcular nem pagar separadamente em aplicações de renda fixa.</p>`,
    afiliados:[
      { label:"📈 XP Investimentos — LCI e LCA isentos", href:"#" },
      { label:"🏦 Inter — plataforma completa de investimentos", href:"#" },
    ]
  },
];

function fmtBRL(v){ return v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); }
function fmtPct(v){ return v.toFixed(2).replace(".",",") + "%"; }
function fmtNum(v,dec=2){ return v.toLocaleString("pt-BR",{minimumFractionDigits:dec,maximumFractionDigits:dec}); }

function calcParcela(val,entrada,taxaAA,anos){
  const p=val-entrada, i=taxaAA/100/12, n=anos*12;
  if(i===0) return p/n;
  return (p*i*Math.pow(1+i,n))/(Math.pow(1+i,n)-1);
}

// ──────────────────────────────────────────────
// COTAÇÕES SECTION
// ──────────────────────────────────────────────
function Cotacoes(){
  const [marketData, setMarketData] = useState(null);
  const [bcbData, setBcbData] = useState({});
  const [loading, setLoading] = useState(false);
  const [ts, setTs] = useState(null);
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [activeCalc, setActiveCalc] = useState(null);
  const [calcVal, setCalcVal] = useState("1");

  const fetchSummary = async (data) => {
    if (!data) return;
    setAiLoading(true);
    try {
      const summaryText = Object.entries(data)
        .map(([k, v]) => `${v.name}: ${v.bid} (${v.pctChange}%)`)
        .join(", ");

      const response = await fetch("/api/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "Você é um analista financeiro brasileiro. Escreva um resumo ultra-curto (máximo 280 caracteres) do mercado agora em português. Seja direto e profissional."
            },
            {
              role: "user",
              content: `Resuma o mercado com estes dados: ${summaryText}`
            }
          ]
        })
      });
      const resData = await response.json();
      if (resData.choices && resData.choices[0]) {
        setAiSummary(resData.choices[0].message.content);
      }
    } catch (e) { console.error("Erro resumo IA:", e); }
    setAiLoading(false);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const resAwesome = await fetch(`/api/cotacoes`);
      const dataAwesome = await resAwesome.json();
      setMarketData(dataAwesome);
      fetchSummary(dataAwesome);

      const bcbResults = {};
      for (const b of BCB_DEF) {
        const resBcb = await fetch(`/api/bcb?serie=${b.key}`);
        const dataBcb = await resBcb.json();
        if (dataBcb && dataBcb.length > 0) {
          bcbResults[b.key] = dataBcb[0].valor;
        }
      }
      setBcbData(bcbResults);
      setTs(new Date());
    } catch (e) {
      console.error("Erro ao buscar dados:", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

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
            {bcbData[b.key]
              ? <div className="bcb-chip-val">{fmtNum(parseFloat(bcbData[b.key]), 2)}%</div>
              : <div className="bcb-chip-val cmd-skeleton" style={{height:28,width:80,borderRadius:4}}>&nbsp;</div>
            }
            <div className="bcb-chip-sub">{b.sub}</div>
          </div>
        ))}
      </div>

      {(aiLoading || aiSummary) && (
        <div className="ai-summary">
          <div className="ai-summary-hd">
            <span className="ai-badge" style={{fontSize:'.55rem'}}>IA</span>
            <span>Resumo do Mercado</span>
          </div>
          {aiLoading ? (
            <div className="ai-summary-loading">
              <div className="ai-dots"><span/><span/><span/></div>
              Gerando análise...
            </div>
          ) : (
            <div className="ai-summary-txt">{aiSummary}</div>
          )}
        </div>
      )}

      <div className="cmd-toolbar">
        <div className="cmd-update">
          {ts ? <><span>●</span> Atualizado {ts.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</> : "Buscando preços..."}
        </div>
        <button className="refresh-btn" onClick={fetchAll} disabled={loading}>
          <span className={loading?"spin":""}>↻</span>
          {loading ? "Buscando..." : "Atualizar"}
        </button>
      </div>

      <div className="cmd-cats">
        {cats.map(cat => {
          const items = MARKET_DEF.filter(c => c.cat === cat);
          return (
            <div key={cat}>
              <div className="cmd-cat-title">{cat}</div>
              <div className="cmd-grid">
                {items.map(item => {
                  const v = marketData?.[item.key.replace("-","")];
                  const chg = v ? parseFloat(v.pctChange) : 0;
                  const cls = chg > 0 ? "chg-up" : chg < 0 ? "chg-dn" : "chg-flat";
                  const sign = chg > 0 ? "+" : "";
                  const isPending = !marketData && loading;
                  const isCalc = activeCalc === item.key;
                  const bid = parseFloat(v?.bid || 0);
                  const result = (parseFloat(calcVal.replace(",",".")) || 0) * bid;

                  return (
                    <div 
                      className={`cmd-card ${isCalc ? 'active' : ''}`} 
                      key={item.key}
                      onClick={() => {
                        if (!isPending) {
                          setActiveCalc(isCalc ? null : item.key);
                          setCalcVal("1");
                        }
                      }}
                    >
                      <div className="cmd-card-top">
                        <span className="cmd-icon">{item.icon}</span>
                        {isPending ? (
                          <span className="cmd-skeleton" style={{width:48,height:20,borderRadius:100}}>&nbsp;</span>
                        ) : (
                          <span className={`cmd-chg ${cls}`}>{sign}{fmtNum(chg,2)}%</span>
                        )}
                      </div>
                      <div className="cmd-name">{item.label}</div>
                      {isPending ? (
                        <div className="cmd-skeleton" style={{height:26,width:90,borderRadius:4,marginTop:4}}>&nbsp;</div>
                      ) : (
                        <div className="cmd-price">{item.unit} {fmtNum(bid,2)}</div>
                      )}
                      <div className="cmd-unit">{item.unit} / {item.key.split("-")[0]}</div>
                      
                      {!isCalc && v?.history && v.history.length > 1 && (
                        <div className="cmd-chart">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={v.history} margin={{top:5,right:5,bottom:5,left:5}}>
                              <Line type="monotone" dataKey="value" stroke={chg > 0 ? "#4caf7d" : chg < 0 ? "#e05555" : "#8a8070"} dot={false} strokeWidth={1.5} isAnimationActive={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {isCalc && (
                        <div className="calc-wrap" onClick={e => e.stopPropagation()}>
                          <span className="calc-label">Conversor rápido</span>
                          <div className="calc-input-group">
                            <span style={{fontSize:'.7rem', color:'var(--gold-dim)'}}>{item.key.split("-")[0]}</span>
                            <input 
                              autoFocus
                              className="calc-inp"
                              value={calcVal}
                              onChange={e => setCalcVal(e.target.value)}
                              placeholder="0,00"
                            />
                          </div>
                          <div className="calc-res">
                            = {fmtBRL(result)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// SIMULADOR SECTION
// ──────────────────────────────────────────────
function Simulador(){
  const [f,setF] = useState({renda:"8000",imovel:"400000",entrada:"80000",prazo:"30",taxa:"10.49"});
  const [res,setRes] = useState(null);
  const [aiTxt,setAiTxt] = useState("");
  const [loading,setLoading] = useState(false);

  const set = k => e => setF(p => ({...p,[k]:e.target.value}));

  const calcular = useCallback(async () => {
    const renda   = parseFloat(f.renda) || 0;
    const imovel  = parseFloat(f.imovel) || 0;
    const entrada = parseFloat(f.entrada) || 0;
    const prazo   = parseInt(f.prazo) || 30;
    const taxa    = parseFloat(f.taxa.replace(",",".")) || 10.49;
    const parcela = calcParcela(imovel,entrada,taxa,prazo);
    const comp    = (parcela/renda)*100;
    const total   = parcela*prazo*12;
    const juros   = total-(imovel-entrada);
    const entPct  = (entrada/imovel)*100;
    setRes({renda,imovel,entrada,prazo,taxa,parcela,comp,total,juros,entPct});

    setAiTxt("");
    setLoading(true);
    try {
      const response = await fetch("/api/groq", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          messages:[{
            role:"system",
            content:"Você é um consultor financeiro brasileiro especialista em crédito imobiliário. Analise com tom direto, humano e útil. Use o contexto econômico brasileiro atual."
          },{
            role:"user",
            content:`Analise esta simulação: Renda mensal ${fmtBRL(renda)}, Valor do Imóvel ${fmtBRL(imovel)}, Entrada ${fmtBRL(entrada)} (${entPct.toFixed(1)}%), Parcela ${fmtBRL(parcela)} (${comp.toFixed(1)}% da renda). Total de juros: ${fmtBRL(juros)}. O que você recomenda?`
          }]
        })
      });
      const data = await response.json();
      
      if (data.choices && data.choices[0]) {
        setAiTxt(data.choices[0].message.content);
      } else {
        setAiTxt(data.message || "IA indisponível no momento. Verifique as configurações da API.");
      }
    } catch(e) {
      setAiTxt("Erro de conexão com a IA. Verifique se a variável GROQ_API_KEY está configurada na Vercel.");
    }
    setLoading(false);
  },[f]);

  return (
    <div>
      <div className="sec-hd">
        <div className="sec-cat">Crédito Imobiliário</div>
        <h2 className="sec-title">Simulador com <em>análise de IA</em></h2>
        <p className="sec-sub">Calcule sua parcela e receba uma avaliação personalizada via Groq AI.</p>
      </div>

      <div className="card">
        <div className="card-title">Dados do financiamento</div>
        <div className="form-grid">
          <div className="field">
            <label>Renda mensal bruta</label>
            <div className="inp-wrap">
              <span className="inp-pre">R$</span>
              <input className="inp" value={f.renda} onChange={set("renda")} type="number"/>
            </div>
          </div>
          <div className="field">
            <label>Valor do imóvel</label>
            <div className="inp-wrap">
              <span className="inp-pre">R$</span>
              <input className="inp" value={f.imovel} onChange={set("imovel")} type="number"/>
            </div>
          </div>
          <div className="field">
            <label>Valor da entrada</label>
            <div className="inp-wrap">
              <span className="inp-pre">R$</span>
              <input className="inp" value={f.entrada} onChange={set("entrada")} type="number"/>
            </div>
          </div>
          <div className="field">
            <label>Prazo (anos)</label>
            <div className="inp-wrap">
              <input className="inp np ns" value={f.prazo} onChange={set("prazo")} type="number"/>
              <span className="inp-suf">anos</span>
            </div>
          </div>
          <div className="field full">
            <label>Taxa de juros anual (%)</label>
            <div className="inp-wrap">
              <input className="inp np ns" value={f.taxa} onChange={set("taxa")} type="text"/>
              <span className="inp-suf">% a.a.</span>
            </div>
          </div>
        </div>
        <button className="btn-gold" onClick={calcular} disabled={loading}>
          {loading ? "Calculando..." : "Simular Financiamento"}
        </button>
      </div>

      {res && (
        <>
          <div className="res-grid">
            <div className="res-item">
              <div className="res-lbl">Parcela mensal</div>
              <div className="res-val o">{fmtBRL(res.parcela)}</div>
              <div className="res-sub">SAC / Price aprox.</div>
            </div>
            <div className="res-item">
              <div className="res-lbl">Comprometimento</div>
              <div className={`res-val ${res.comp > 30 ? 'r' : 'g'}`}>{res.comp.toFixed(1)}%</div>
              <div className="res-sub">Máx sugerido: 30%</div>
            </div>
            <div className="res-item">
              <div className="res-lbl">Total pago</div>
              <div className="res-val">{fmtBRL(res.total)}</div>
              <div className="res-sub">Incluindo juros</div>
            </div>
          </div>

          <div className="ai-box">
            <div className="ai-hd">
              <span className="ai-badge">IA</span>
              <span className="ai-hdtxt">Análise do consultor</span>
            </div>
            {loading && (
              <div className="ai-loading">
                <div className="ai-dots"><span/><span/><span/></div>
                Analisando...
              </div>
            )}
            {aiTxt && <div className="ai-txt">{aiTxt}</div>}
          </div>

          <div className="aff-box">
            <div className="aff-lbl">Simule com bancos reais</div>
            <div className="aff-links">
              <a className="aff-link" href="https://www.caixa.gov.br/voce/habitacao" target="_blank" rel="noreferrer">
                <span>🏦 Caixa Econômica Federal</span><span className="aff-arrow">→</span>
              </a>
              <a className="aff-link" href="https://www.santander.com.br/imobiliario" target="_blank" rel="noreferrer">
                <span>🏦 Santander Imóveis</span><span className="aff-arrow">→</span>
              </a>
              <a className="aff-link" href="https://www.itau.com.br/emprestimos-financiamentos/imobiliario/" target="_blank" rel="noreferrer">
                <span>🏦 Itaú Imóveis</span><span className="aff-arrow">→</span>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// COMPARADOR SECTION
// ──────────────────────────────────────────────
function Comparador(){
  const [val,setVal] = useState("10000");
  const [meses,setMeses] = useState("12");
  const v = parseFloat(val) || 0;
  const m = parseInt(meses) || 1;

  return (
    <div>
      <div className="sec-hd">
        <div className="sec-cat">Investimentos</div>
        <h2 className="sec-title">Compare sua <em>rentabilidade</em></h2>
        <p className="sec-sub">Simule quanto seu dinheiro renderia em diferentes ativos financeiros.</p>
      </div>

      <div className="card">
        <div className="cmp-inputs">
          <div className="cmp-inp-wrap">
            <div className="cmp-inp-lbl">Valor inicial</div>
            <div className="inp-wrap">
              <span className="inp-pre">R$</span>
              <input className="inp" value={val} onChange={e => setVal(e.target.value)} type="number"/>
            </div>
          </div>
          <div className="cmp-inp-wrap">
            <div className="cmp-inp-lbl">Período (meses)</div>
            <div className="inp-wrap">
              <input className="inp np ns" value={meses} onChange={e => setMeses(e.target.value)} type="number"/>
              <span className="inp-suf">meses</span>
            </div>
          </div>
        </div>

        <div className="cmp-table-wrap">
          <table className="cmp-table">
            <thead>
              <tr>
                <th>Investimento</th>
                <th>Rentabilidade</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {INVEST.sort((a,b)=>b.rate-a.rate).map((inv,idx) => {
                const taxaMensal = Math.pow(1 + (inv.rate/100), 1/12) - 1;
                const bruto = v * Math.pow(1 + taxaMensal, m);
                const lucro = bruto - v;
                let ir = 0;
                if(inv.ir){
                  if(m <= 6) ir = 0.225;
                  else if(m <= 12) ir = 0.20;
                  else if(m <= 24) ir = 0.175;
                  else ir = 0.15;
                }
                const liq = v + (lucro * (1 - ir));

                return (
                  <tr key={inv.name}>
                    <td>
                      <span className="inv-name">{inv.name}</span>
                      <span className="inv-tag">{inv.tag}</span>
                    </td>
                    <td>
                      <div style={{color:'var(--green)',fontWeight:500}}>{inv.rate}% a.a.</div>
                      <div style={{fontSize:'.68rem',color:'var(--muted)'}}>Liquidez: {inv.liq}</div>
                    </td>
                    <td>
                      <div style={{fontWeight:600,color:'var(--text)'}}>{fmtBRL(liq)}</div>
                      {idx === 0 && <span className="badge-best">Melhor retorno</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// APP MAIN
// ──────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("mercados");
  const [art, setArt] = useState(null);

  useEffect(() => { window.scrollTo(0,0); }, [tab, art]);

  return (
    <div className="root">
      <style>{S}</style>
      <div className="noise" />
      
      <header className="hdr">
        <div className="logo" onClick={() => {setTab("mercados"); setArt(null);}}>
          FinançaBR
          <small>inteligência financeira</small>
        </div>
        
        <nav className="tabs">
          <button className={`tab ${tab==="mercados"?'active':''}`} onClick={()=>{setTab("mercados");setArt(null)}}>Cotações</button>
          <button className={`tab ${tab==="simulador"?'active':''}`} onClick={()=>{setTab("simulador");setArt(null)}}>Simulador</button>
          <button className={`tab ${tab==="comparador"?'active':''}`} onClick={()=>{setTab("comparador");setArt(null)}}>Comparador</button>
        </nav>
      </header>

      <main className="main">
        {art ? (
          <div className="art-view">
            <button className="btn-back" onClick={() => setArt(null)}>← Voltar para artigos</button>
            <div className="art-view-cat">{art.cat}</div>
            <h1 className="art-view-title">{art.title}</h1>
            <div className="art-view-meta">
              <span>Por Equipe FinançaBR</span>
              <span>•</span>
              <span>{art.tempo} de leitura</span>
              <span>•</span>
              <span>Atualizado em {art.updated}</span>
            </div>
            <div className="art-content" dangerouslySetInnerHTML={{__html: art.conteudo}} />
            
            <div className="aff-box">
              <div className="aff-lbl">Links úteis recomendados</div>
              <div className="aff-links">
                {art.afiliados.map(a => (
                  <a key={a.label} className="aff-link" href={a.href} target="_blank" rel="noreferrer">
                    <span>{a.label}</span><span className="aff-arrow">→</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {tab === "mercados" && (
              <>
                <Cotacoes />
                <div className="divider" />
                <div className="sec-hd">
                  <div className="sec-cat">Educação</div>
                  <h2 className="sec-title">Guia para seu <em>patrimônio</em></h2>
                  <p className="sec-sub">Aprenda a investir e proteger seu dinheiro com nossos especialistas.</p>
                </div>
                <div className="art-grid">
                  {ARTICLES.map(a => (
                    <div className="art-card" key={a.id} onClick={() => setArt(a)}>
                      <div className="art-card-cat">{a.cat}</div>
                      <h3 className="art-card-title">{a.title}</h3>
                      <p className="art-card-desc">{a.desc}</p>
                      <div className="art-card-ft">
                        <span>{a.tempo}</span>
                        <span>•</span>
                        <span>Ver artigo completo →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {tab === "simulador" && <Simulador />}
            {tab === "comparador" && <Comparador />}
          </>
        )}
      </main>
    </div>
  );
}
