import { useState, useEffect, useCallback } from "react";

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
.cmd-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:16px;transition:border-color .2s;}
.cmd-card:hover{border-color:var(--gold-dim);}
.cmd-card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
.cmd-icon{font-size:1.1rem;}
.cmd-chg{font-size:.75rem;font-weight:600;padding:2px 8px;border-radius:100px;}
.chg-up{background:rgba(76,175,125,.12);color:var(--green);}
.chg-dn{background:rgba(224,85,85,.12);color:var(--red);}
.chg-flat{background:rgba(138,128,112,.12);color:var(--muted);}
.cmd-name{font-size:.72rem;color:var(--muted);margin-bottom:4px;letter-spacing:.02em;}
.cmd-price{font-family:'DM Serif Display',serif;font-size:1.25rem;color:var(--text);}
.cmd-unit{font-size:.68rem;color:var(--muted);margin-top:2px;}
.cmd-skeleton{background:linear-gradient(90deg,var(--surface) 25%,var(--surface2) 50%,var(--surface) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:6px;}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

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
.art-card-cat{font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);margin-bottom:10px;}
.art-card-title{font-family:'DM Serif Display',serif;font-size:1.05rem;line-height:1.3;margin-bottom:10px;}
.art-card-desc{font-size:.8rem;color:var(--muted);line-height:1.6;margin-bottom:14px;}
.art-card-footer{display:flex;align-items:center;justify-content:space-between;}
.art-card-time{font-size:.7rem;color:var(--muted);}
.art-card-read{font-size:.75rem;color:var(--gold);font-weight:500;}
.art-body{font-size:.92rem;line-height:1.85;color:#d4cec0;}
.art-body h3{font-family:'DM Serif Display',serif;font-size:1.15rem;color:var(--text);margin:28px 0 12px;}
.art-body p{margin-bottom:16px;}
.art-body ul{padding-left:20px;margin-bottom:16px;}
.art-body ul li{margin-bottom:8px;}
.art-body strong{color:var(--text);font-weight:600;}
.art-disclaimer{background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:14px 18px;margin-top:28px;font-size:.75rem;color:var(--muted);line-height:1.6;}
.art-disclaimer strong{color:var(--muted);font-weight:600;}
.art-updated{font-size:.7rem;color:var(--muted);margin-top:6px;}
`;

const MARKET_DEF = [
  // CÂMBIO
  { key:"USD-BRL", label:"Dólar/Real",    icon:"🇺🇸", unit:"R$", cat:"Câmbio" },
  { key:"EUR-BRL", label:"Euro/Real",     icon:"🇪🇺", unit:"R$", cat:"Câmbio" },
  
  // METAIS PRECIOSOS
  { key:"XAU-BRL", label:"Ouro/Real",     icon:"🟨", unit:"R$", cat:"Metais" },
  { key:"XAG-BRL", label:"Prata/Real",    icon:"⚪", unit:"R$", cat:"Metais" },
  
  // COMMODITIES
  { key:"OIL",     label:"Petróleo Brent", icon:"🛢️", unit:"USD", cat:"Commodities" },
  
  // ÍNDICES MUNDIAIS
  { key:"SPX",     label:"S&P 500",       icon:"🇺🇸", unit:"Pts", cat:"Bolsas" },
  { key:"NAS",     label:"Nasdaq",        icon:"💻", unit:"Pts", cat:"Bolsas" },
  { key:"IBOV",    label:"IBOVESPA",      icon:"🇧🇷", unit:"Pts", cat:"Bolsas" },
  
  // CRIPTOMOEDAS
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
  { name:"CDB 110% CDI",          tag:"prazo 12m+",     rate:13.5, ir:true,  liq:"No venc.",   min:"R$ 500"   },
  { name:"LCI 93% CDI",           tag:"isento de IR",   rate:11.4, ir:false, liq:"90 dias",    min:"R$ 1.000" },
  { name:"LCA 92% CDI",           tag:"isento de IR",   rate:11.3, ir:false, liq:"90 dias",    min:"R$ 1.000" },
  { name:"FII (DY médio)",        tag:"isento IR prov", rate:11.8, ir:false, liq:"D+2 bolsa",  min:"R$ 10"    },
  { name:"Debênture Inc. IPCA+7%",tag:"isento de IR",   rate:14.2, ir:false, liq:"Sec. baixa", min:"R$ 1.000" },
];

// ──────────────────────────────────────────────
// ARTIGOS DATA
// ──────────────────────────────────────────────
const ARTIGOS = [
  {
    id:"cdb-vs-tesouro",
    cat:"Investimentos",
    title:"CDB vs Tesouro Direto — qual rende mais?",
    desc:"Entenda as diferenças reais entre CDB e Tesouro Direto, quando cada um vale a pena e onde investir o seu dinheiro.",
    tempo:"6 min",
    updated:"Janeiro 2026",
    conteudo: `
<h3>O que é o Tesouro Direto?</h3>
<p>O Tesouro Direto é um programa do governo federal que permite que pessoas físicas emprestem dinheiro para o governo em troca de juros. É considerado o investimento mais seguro do Brasil, pois o risco de calote é mínimo — afinal, o governo pode emitir moeda para pagar suas dívidas.</p>
<p>Os principais títulos são: <strong>Tesouro Selic</strong> (pós-fixado, ideal para reserva de emergência), <strong>Tesouro IPCA+</strong> (protege da inflação) e <strong>Tesouro Prefixado</strong> (taxa travada na contratação).</p>

<h3>O que é CDB?</h3>
<p>O CDB (Certificado de Depósito Bancário) é um título emitido por bancos. Ao comprar um CDB, você empresta dinheiro para o banco e recebe juros em troca. A maioria dos CDBs rende um percentual do CDI — por exemplo, 110% do CDI.</p>
<p>O CDB é protegido pelo FGC (Fundo Garantidor de Créditos) até R$ 250.000 por CPF por instituição, o que garante segurança mesmo em bancos menores.</p>

<h3>Comparação direta</h3>
<p><strong>Rentabilidade:</strong> CDBs de bancos digitais como Nubank, Inter e C6 costumam pagar 100% a 110% do CDI, enquanto o Tesouro Selic paga próximo a 100% da SELIC (que é similar ao CDI). Para prazos mais longos, o Tesouro IPCA+ pode ser mais vantajoso por proteger contra a inflação.</p>
<p><strong>Liquidez:</strong> O Tesouro Selic tem liquidez diária (D+1). Muitos CDBs de bancos digitais também têm liquidez imediata, mas CDBs com rentabilidade maior geralmente têm carência.</p>
<p><strong>Imposto de Renda:</strong> Ambos seguem a tabela regressiva: 22,5% até 6 meses, 20% até 1 ano, 17,5% até 2 anos, 15% acima de 2 anos.</p>
<p><strong>Valor mínimo:</strong> Tesouro Direto a partir de R$ 30 (fração de título). CDB de banco digital a partir de R$ 1.</p>

<h3>Quando escolher cada um?</h3>
<p><strong>Escolha o Tesouro Direto quando:</strong> quiser a máxima segurança, precisar de proteção contra inflação (Tesouro IPCA+) ou quiser uma taxa prefixada para longo prazo.</p>
<p><strong>Escolha o CDB quando:</strong> encontrar taxas acima de 100% do CDI em bancos com boa saúde financeira, precisar de liquidez imediata com boa rentabilidade, ou quiser diversificar entre diferentes emissores.</p>

<h3>Conclusão prática</h3>
<p>Para reserva de emergência: <strong>CDB 100% CDI com liquidez diária</strong> (Nubank, Inter, C6) ou <strong>Tesouro Selic</strong>. Para objetivos de médio e longo prazo: compare o Tesouro IPCA+ com CDBs prefixados. A diferença de rentabilidade entre os melhores CDBs e o Tesouro Selic raramente passa de 0,5% ao ano — então segurança e liquidez devem pesar na decisão.
</p>`,
    afiliados:[
      { label:"💰 Abrir conta no Nubank — CDB 100% CDI", href:"#" },
      { label:"🏦 Banco Inter — CDB 120% CDI", href:"#" },
      { label:"📈 XP Investimentos — Tesouro Direto", href:"#" },
    ]
  },
  {
    id:"5-investimentos-poupanca",
    cat:"Investimentos",
    title:"5 investimentos melhores que a poupança em 2026",
    desc:"A poupança rende menos que a inflação. Veja alternativas simples, seguras e mais rentáveis para o seu dinheiro.",
    tempo:"5 min",
    updated:"Janeiro 2026",
    conteudo:`
<h3>Por que sair da poupança?</h3>
<p>A poupança rende 0,5% ao mês + TR quando a SELIC está acima de 8,5% ao ano. Com a SELIC atual em torno de 12%, isso representa cerca de 6,17% ao ano — bem abaixo da inflação acumulada e de alternativas igualmente seguras e acessíveis.</p>
<p>O problema não é que a poupança é ruim — é que existem opções melhores com a mesma facilidade e proteção.</p>

<h3>1. CDB de banco digital (100% CDI)</h3>
<p>Nubank, Banco Inter e C6 Bank oferecem CDBs com liquidez diária que rendem 100% do CDI. Com a SELIC atual, isso representa cerca de 12% ao ano — o dobro da poupança. Tem proteção do FGC até R$ 250 mil e funciona igual à poupança: deposita e resgata quando quiser.</p>

<h3>2. Tesouro Selic</h3>
<p>Emitido pelo governo federal, o Tesouro Selic acompanha a taxa SELIC diariamente. É considerado o investimento mais seguro do Brasil. Pode ser comprado a partir de R$ 30 no site do Tesouro Direto ou em qualquer corretora. Liquidez em D+1 (dinheiro disponível no próximo dia útil).</p>

<h3>3. LCI e LCA (isentos de Imposto de Renda)</h3>
<p>LCI (Letras de Crédito Imobiliário) e LCA (Letras de Crédito do Agronegócio) são isentas de IR para pessoa física. Isso significa que um LCI pagando 92% do CDI equivale, na prática, a um CDB pagando mais de 108% do CDI. A desvantagem é que geralmente têm carência mínima de 90 dias.</p>

<h3>4. CDB prefixado</h3>
<p>Se você acredita que os juros vão cair, travar uma taxa prefixada de 13% a 14% ao ano por 1 ou 2 anos pode ser uma ótima estratégia. Verifique as ofertas em plataformas como XP, BTG e Rico — é comum encontrar taxas atrativas para prazos específicos.</p>

<h3>5. Fundos de renda fixa DI</h3>
<p>Para quem prefere não escolher títulos individualmente, fundos DI de taxa zero (como os da Nubank, Inter e corretoras) aplicam automaticamente em títulos pós-fixados. Alguns têm liquidez no mesmo dia e são uma boa porta de entrada para quem está começando.</p>

<h3>Resumo comparativo</h3>
<p><strong>Poupança:</strong> ~6,17% a.a. | <strong>CDB 100% CDI:</strong> ~12% a.a. | <strong>Tesouro Selic:</strong> ~12% a.a. | <strong>LCI 92% CDI:</strong> ~11% a.a. líquido (equivale a ~13% com IR). Todos com cobertura do FGC ou garantia do governo.</p>`,
    afiliados:[
      { label:"💜 Nubank — CDB com liquidez diária", href:"#" },
      { label:"🏦 Banco Inter — LCI e CDB", href:"#" },
      { label:"🟠 C6 Bank — CDB 100% CDI", href:"#" },
    ]
  },
  {
    id:"como-investir-100-reais",
    cat:"Investimentos",
    title:"Como investir com R$ 100 por mês",
    desc:"Começar a investir com pouco dinheiro é possível. Veja um plano prático para quem está no início.",
    tempo:"5 min",
    updated:"Janeiro 2026",
    conteudo:`
<h3>O mito do "preciso de muito dinheiro para investir"</h3>
<p>A maioria das pessoas adia o início dos investimentos esperando "ter mais dinheiro". Esse é um dos maiores erros financeiros que existe — o tempo é o ativo mais valioso nos investimentos por causa dos juros compostos.</p>
<p>R$ 100 investidos hoje a 12% ao ano valem R$ 311 em 10 anos. R$ 100 por mês durante 10 anos, ao mesmo rendimento, viram mais de R$ 23.000.</p>

<h3>Passo 1: Reserve antes de investir</h3>
<p>Antes de qualquer investimento, você precisa de uma <strong>reserva de emergência</strong> equivalente a 3 a 6 meses de gastos. Enquanto não tiver isso, coloque tudo em CDB com liquidez diária ou Tesouro Selic — sem pensar em ações ou criptomoedas.</p>

<h3>Passo 2: Onde colocar os R$ 100</h3>
<p><strong>Se ainda está montando a reserva de emergência:</strong> CDB 100% CDI com liquidez diária (Nubank, Inter, C6). Simples, seguro, rende bem e você pode resgatar quando precisar.</p>
<p><strong>Se a reserva já está completa:</strong> Divida os R$ 100 em duas partes — R$ 70 no Tesouro Selic ou CDB e R$ 30 no Tesouro IPCA+ para um objetivo de longo prazo (aposentadoria, imóvel).</p>

<h3>Passo 3: Automatize</h3>
<p>Configure um débito automático no dia seguinte ao pagamento do salário. Investir o que sobra no final do mês raramente funciona — o dinheiro sempre "some". Invista primeiro, viva com o resto.</p>

<h3>Passo 4: Aumente gradualmente</h3>
<p>A cada aumento de salário ou renda extra, aumente o valor investido. Passe de R$ 100 para R$ 150, depois R$ 200. Em poucos anos a diferença será enorme.</p>

<h3>Erros para evitar no início</h3>
<p>Não invista em ações ou criptomoedas antes de ter reserva de emergência e pelo menos 6 meses de experiência com renda fixa. Não busque "o melhor investimento" — a consistência vale mais do que a rentabilidade perfeita. Não resgate antes do prazo para compras não planejadas.</p>`,
    afiliados:[
      { label:"💜 Abrir conta Nubank — comece com R$ 1", href:"#" },
      { label:"🏦 Banco Inter — investimento a partir de R$ 1", href:"#" },
      { label:"📈 Tesouro Direto — a partir de R$ 30", href:"#" },
    ]
  },
  {
    id:"cartoes-sem-anuidade",
    cat:"Cartões & Bancos",
    title:"Melhores cartões sem anuidade em 2026",
    desc:"Compare os melhores cartões de crédito gratuitos do Brasil com benefícios reais, cashback e limites acessíveis.",
    tempo:"7 min",
    updated:"Janeiro 2026",
    conteudo:`
<h3>Vale a pena ter cartão de crédito sem anuidade?</h3>
<p>Sim — desde que usado com responsabilidade. Cartões sem anuidade eliminam um custo fixo que pode chegar a R$ 600 por ano nos cartões tradicionais. Além disso, os cartões digitais modernos oferecem benefícios antes exclusivos de cartões premium: cashback, programa de pontos, seguro de compras e controle via app.</p>

<h3>Nubank Ultravioleta (Roxinho)</h3>
<p>O cartão roxo do Nubank é o mais famoso do Brasil. Sem anuidade, limite crescente conforme uso, controle total pelo app e 1% de cashback em todas as compras (na versão Ultravioleta). O processo de aprovação é 100% digital e rápido, ideal para quem tem histórico de crédito limitado.</p>
<p><strong>Para quem é:</strong> Quem está começando a construir crédito ou quer simplicidade total.</p>

<h3>Banco Inter Mastercard</h3>
<p>O cartão do Inter vem junto com a conta digital gratuita. Sem anuidade, com cashback na Inter Shop e possibilidade de aumentar o limite rapidamente investindo na conta. Aceito internacionalmente na bandeira Mastercard.</p>
<p><strong>Para quem é:</strong> Quem já usa o Inter para investimentos e quer centralizar tudo.</p>

<h3>C6 Bank Carbon</h3>
<p>O C6 Carbon é Mastercard Black sem anuidade (condicionada a gasto mínimo mensal ou investimento na conta). Oferece acesso a salas VIP nos aeroportos, seguro viagem e programa de pontos (Átomos) sem validade. Um dos melhores custo-benefício do Brasil.</p>
<p><strong>Para quem é:</strong> Quem viaja com frequência e quer benefícios premium sem pagar anuidade.</p>

<h3>PicPay Card</h3>
<p>Sem anuidade, com cashback de até 1,5% em todas as compras e parcelamento sem juros em lojas parceiras. A conta digital do PicPay também rende 100% do CDI automaticamente.</p>

<h3>Como escolher o melhor para você?</h3>
<p><strong>Prioridade cashback:</strong> Nubank Ultravioleta ou PicPay Card. <strong>Prioridade viagens:</strong> C6 Carbon. <strong>Prioridade investimentos integrados:</strong> Banco Inter. <strong>Construindo crédito do zero:</strong> Nubank ou qualquer banco digital com aprovação facilitada.</p>

<h3>Atenção: anuidade zero não significa custo zero</h3>
<p>Juros do rotativo chegam a 400% ao ano. Use o cartão apenas para o que você já tem dinheiro para pagar, e quite a fatura integralmente todo mês. Nunca pague apenas o mínimo.</p>`,
    afiliados:[
      { label:"💜 Solicitar Nubank — sem anuidade", href:"#" },
      { label:"🏦 Banco Inter — conta + cartão grátis", href:"#" },
      { label:"🖤 C6 Carbon — Mastercard Black grátis", href:"#" },
    ]
  },
  {
    id:"nubank-vs-inter-vs-c6",
    cat:"Cartões & Bancos",
    title:"Nubank vs Inter vs C6 — qual conta digital é melhor?",
    desc:"Comparamos os três maiores bancos digitais do Brasil em taxas, rendimento, cartão e investimentos.",
    tempo:"8 min",
    updated:"Janeiro 2026",
    conteudo:`
<h3>Os três gigantes dos bancos digitais</h3>
<p>Nubank, Banco Inter e C6 Bank juntos somam mais de 100 milhões de clientes no Brasil. Os três oferecem conta corrente gratuita, cartão de crédito sem anuidade e rendimento automático no saldo. Mas as diferenças entre eles são maiores do que parecem.</p>

<h3>Rendimento do saldo em conta</h3>
<p><strong>Nubank:</strong> Rende 100% do CDI automaticamente (chamado de "Caixinha"). O dinheiro fica disponível imediatamente. <strong>Banco Inter:</strong> Rende 100% do CDI via CDB automático, com liquidez diária. <strong>C6 Bank:</strong> Rende 100% do CDI no CDB automático, com liquidez diária. Empate técnico — os três rendem igual no saldo parado.</p>

<h3>Cartão de crédito</h3>
<p><strong>Nubank:</strong> Mastercard, sem anuidade, limite baseado em score. 1% cashback na versão Ultravioleta (que custa R$ 19/mês mas devolve mais do que cobra para quem gasta bastante). <strong>Inter:</strong> Mastercard Gold sem anuidade, cashback na Inter Shop, limite cresce com investimentos. <strong>C6:</strong> Mastercard Black (C6 Carbon) sem anuidade condicionada. Melhor programa de pontos (Átomos sem validade) e acesso a salas VIP.</p>

<h3>Investimentos</h3>
<p><strong>Nubank:</strong> CDB, fundos e criptomoedas direto no app. Interface simples. <strong>Banco Inter:</strong> Plataforma mais completa — CDB, LCI, LCA, fundos, ações, Tesouro Direto, câmbio. O Inter é essencialmente uma corretora completa. <strong>C6:</strong> CDB, fundos e câmbio. Menos completo que o Inter em renda variável.</p>

<h3>Transferências internacionais e câmbio</h3>
<p><strong>C6 Bank:</strong> Melhor taxa de câmbio para cartão internacional e remessas. <strong>Nubank:</strong> Cartão internacional sem taxas adicionais. <strong>Inter:</strong> Conta global em dólar (Inter Global) para quem viaja muito ou recebe do exterior.</p>

<h3>Qual escolher?</h3>
<p><strong>Escolha o Nubank</strong> se quiser o app mais simples e intuitivo do mercado, especialmente para quem está começando. <strong>Escolha o Inter</strong> se quiser centralizar investimentos, ações e o dia a dia financeiro em um só lugar. <strong>Escolha o C6</strong> se viajar com frequência e quiser o Mastercard Black com benefícios premium sem custo fixo.</p>
<p>Dica: não há nada que impeça ter conta nos três. São todos gratuitos — muita gente usa o Nubank no dia a dia e o Inter para investimentos.</p>`,
    afiliados:[
      { label:"💜 Abrir conta Nubank", href:"#" },
      { label:"🏦 Abrir conta Banco Inter", href:"#" },
      { label:"🖤 Abrir conta C6 Bank", href:"#" },
    ]
  },
  {
    id:"sair-cheque-especial",
    cat:"Cartões & Bancos",
    title:"Como sair do cheque especial de vez",
    desc:"O cheque especial cobra juros de até 150% ao ano. Veja como sair dessa armadilha e nunca mais voltar.",
    tempo:"5 min",
    updated:"Janeiro 2026",
    conteudo:`
<h3>O cheque especial é uma das dívidas mais caras do Brasil</h3>
<p>Os juros do cheque especial chegam a 12% ao mês — o que equivale a mais de 150% ao ano. É uma das modalidades de crédito mais caras disponíveis no país, perdendo apenas para o rotativo do cartão. Mesmo assim, milhões de brasileiros usam o cheque especial como "reserva de emergência" e pagam um preço altíssimo por isso.</p>

<h3>Entenda o que está acontecendo</h3>
<p>O cheque especial entra automaticamente quando sua conta fica negativa. O banco não avisa — simplesmente debita os juros no final do mês. Muitas pessoas nem percebem que estão pagando por isso.</p>
<p>Verifique no app do seu banco: se o saldo disponível é maior que o saldo real, a diferença é o limite do cheque especial. Se você entrou nesse limite, está pagando juros abusivos.</p>

<h3>Passo a passo para sair</h3>
<p><strong>1. Calcule o valor exato da dívida.</strong> Veja quanto você deve no cheque especial, incluindo juros acumulados.</p>
<p><strong>2. Substitua por um crédito mais barato.</strong> Empréstimo pessoal consignado (desconto em folha) pode custar 2% ao mês. Crédito pessoal em bancos digitais fica entre 3% e 6% ao mês. Qualquer um desses é muito melhor que 12% ao mês do cheque especial.</p>
<p><strong>3. Cancele ou reduza o limite.</strong> Após quitar, peça ao banco para reduzir ou cancelar o limite do cheque especial. Ter o limite disponível é uma tentação constante.</p>
<p><strong>4. Monte uma reserva de emergência.</strong> O motivo número um pelo qual as pessoas caem no cheque especial é a falta de reserva. Mesmo R$ 500 guardados em CDB com liquidez diária já evitam o problema na maioria dos meses.</p>

<h3>Como negociar a dívida do cheque especial</h3>
<p>Se o valor acumulado está alto, entre em contato direto com o banco e peça portabilidade de crédito ou renegociação. Bancos preferem renegociar a inadimplência — você tem mais poder do que imagina nessa conversa.</p>`,
    afiliados:[
      { label:"💜 Nubank — empréstimo pessoal com taxa justa", href:"#" },
      { label:"🏦 Inter — crédito pessoal sem burocracia", href:"#" },
    ]
  },
  {
    id:"financiamento-imobiliario-guia",
    cat:"Crédito & Financiamento",
    title:"Financiamento imobiliário: tudo que você precisa saber",
    desc:"Entenda como funciona o financiamento imobiliário, quais os sistemas de amortização e como pagar menos juros.",
    tempo:"10 min",
    updated:"Janeiro 2026",
    conteudo:`
<h3>Como funciona o financiamento imobiliário?</h3>
<p>No financiamento imobiliário, o banco paga o imóvel para você e você devolve esse dinheiro em parcelas mensais acrescidas de juros. O prazo pode chegar a 35 anos (420 meses) e o imóvel fica alienado ao banco como garantia até o pagamento total.</p>

<h3>Sistemas de amortização: Price vs SAC</h3>
<p><strong>Sistema Price (parcelas fixas):</strong> As parcelas são iguais do início ao fim. No começo, a maior parte da parcela é juros. Isso significa que você demora mais para diminuir o saldo devedor — e paga mais juros no total.</p>
<p><strong>Sistema SAC (Amortização Constante):</strong> A amortização do principal é igual todo mês, mas os juros vão diminuindo. Resultado: as primeiras parcelas são mais altas, mas o total pago é menor. O SAC é geralmente mais vantajoso para quem pode pagar as parcelas iniciais maiores.</p>

<h3>Quanto de entrada preciso ter?</h3>
<p>A maioria dos bancos financia até 80% do valor do imóvel — ou seja, você precisa de pelo menos 20% de entrada. Além disso, considere os custos de cartório, ITBI (2% a 3% do valor do imóvel) e avaliação do imóvel pelo banco, que podem somar mais 3% a 5% do valor.</p>

<h3>Quanto a parcela pode comprometer da minha renda?</h3>
<p>Os bancos geralmente limitam a parcela a 30% da renda bruta familiar. Mesmo que o banco aprove mais, especialistas recomendam não passar disso — imprevistos acontecem e parcelas altas comprometem a qualidade de vida por décadas.</p>

<h3>Como pagar menos juros?</h3>
<p><strong>Aumente a entrada:</strong> Cada real a mais na entrada reduz o saldo devedor e os juros totais. <strong>Faça amortizações extras:</strong> Use o 13º salário e bonificações para abater o saldo devedor — pelo SAC, isso reduz o prazo ou as parcelas futuras. <strong>Compare bancos:</strong> Uma diferença de 0,5% ao ano na taxa de juros representa dezenas de milhares de reais ao longo de 30 anos. Sempre simule em pelo menos três bancos antes de fechar.</p>

<h3>Posso usar o FGTS?</h3>
<p>Sim. O FGTS pode ser usado como entrada ou para amortizar o saldo devedor em financiamentos pelo SFH (Sistema Financeiro de Habitação). As condições são: imóvel até R$ 1,5 milhão, primeiro imóvel financiado, 3 anos de carteira assinada (podendo ser em empresas diferentes).</p>`,
    afiliados:[
      { label:"🏦 Simular financiamento na Caixa Econômica", href:"https://www.caixa.gov.br/voce/habitacao" },
      { label:"🏦 Santander Imóveis", href:"https://www.santander.com.br/imobiliario" },
      { label:"🏦 Itaú Crédito Imobiliário", href:"https://www.itau.com.br/emprestimos-financiamentos/imobiliario/" },
    ]
  },
  {
    id:"score-serasa-como-aumentar",
    cat:"Crédito & Financiamento",
    title:"Como funciona o Score e como aumentar o seu",
    desc:"Entenda o que é o Score de crédito, como é calculado e quais ações concretas aumentam sua pontuação.",
    tempo:"6 min",
    updated:"Janeiro 2026",
    conteudo:`
<h3>O que é o Score de crédito?</h3>
<p>O Score é uma pontuação de 0 a 1000 que representa a probabilidade de você pagar suas dívidas em dia. Quanto maior o Score, menor o risco que os bancos e empresas enxergam em você — o que resulta em aprovações mais fáceis, limites maiores e juros menores.</p>
<p>Os principais bureaus de crédito no Brasil são Serasa e SPC Brasil. Cada um tem sua própria metodologia, mas os princípios são similares.</p>

<h3>Como o Score é calculado?</h3>
<p>Os birôs de crédito analisam: <strong>histórico de pagamentos</strong> (pagou em dia? atrasou? ficou negativado?), <strong>tempo de relacionamento com o mercado</strong> (quanto mais antigo, melhor), <strong>variedade de crédito</strong> (cartão, financiamento, empréstimo), <strong>uso do crédito disponível</strong> (usar 90% do limite do cartão prejudica), e <strong>novas consultas</strong> (muitas consultas em pouco tempo sinalizam risco).</p>

<h3>O que mais prejudica o Score?</h3>
<p>Negativações (nome no SPC/Serasa) são o fator mais impactante — podem derrubar o score em centenas de pontos. Pagamentos atrasados, mesmo sem negativação, também afetam. Cancelar cartões antigos remove o histórico positivo.</p>

<h3>Como aumentar o Score — ações práticas</h3>
<p><strong>1. Quite dívidas em aberto.</strong> Negocie e quite qualquer negativação — mesmo que já tenha passado 5 anos e saído do cadastro, a dívida pode ainda constar no histórico interno dos birôs.</p>
<p><strong>2. Cadastre-se no Registrato e Serasa Você.</strong> Acompanhe seu histórico regularmente para identificar erros ou cobranças indevidas.</p>
<p><strong>3. Cadastre seu CPF no Cadastro Positivo.</strong> O Cadastro Positivo registra seus pagamentos em dia — quanto mais dados positivos existirem, melhor o Score.</p>
<p><strong>4. Pague contas no CPF.</strong> Água, luz, internet — vincule ao seu CPF para que os pagamentos em dia entrem no histórico.</p>
<p><strong>5. Mantenha conta bancária ativa.</strong> Relacionamento com banco por tempo prolongado contribui positivamente.</p>
<p><strong>6. Não use mais de 30% do limite do cartão.</strong> Usar o cartão com moderação e pagando integralmente todo mês é um dos melhores sinais para os algoritmos.</p>

<h3>Em quanto tempo o Score aumenta?</h3>
<p>Quitando dívidas, o score pode subir em 30 a 90 dias. Construir um histórico sólido do zero leva de 6 a 18 meses de pagamentos consistentes em dia.</p>`,
    afiliados:[
      { label:"💜 Nubank — comece seu histórico de crédito", href:"#" },
      { label:"🏦 Banco Inter — conta sem anuidade", href:"#" },
    ]
  },
  {
    id:"regra-50-30-20",
    cat:"Planejamento",
    title:"Regra 50-30-20: o orçamento mais simples do mundo",
    desc:"Aprenda a organizar seu dinheiro em três categorias e nunca mais ficar no vermelho no final do mês.",
    tempo:"4 min",
    updated:"Janeiro 2026",
    conteudo:`
<h3>O que é a regra 50-30-20?</h3>
<p>A regra 50-30-20 é um método de orçamento pessoal criado pela senadora americana Elizabeth Warren. A ideia é dividir a renda líquida (após impostos) em três grandes grupos: necessidades, desejos e poupança.</p>
<p>Sua popularidade vem da simplicidade — você não precisa planilha nem app complexo. Três categorias, três decisões.</p>

<h3>Os três grupos</h3>
<p><strong>50% — Necessidades:</strong> Moradia (aluguel ou prestação), alimentação básica, transporte para o trabalho, plano de saúde, contas essenciais (água, luz, internet). São gastos que você teria dificuldade de cortar sem impacto real na vida.</p>
<p><strong>30% — Desejos:</strong> Restaurantes, streaming, academia, viagens, roupas, lazer. São gastos que melhoram a qualidade de vida mas podem ser reduzidos sem consequências graves se necessário.</p>
<p><strong>20% — Poupança e investimentos:</strong> Reserva de emergência, investimentos de médio e longo prazo, previdência, quitação de dívidas.</p>

<h3>Como aplicar na prática</h3>
<p>Calcule sua renda líquida mensal. Multiplique por 0,5, 0,3 e 0,2 para ter os tetos de cada categoria. No início do mês, transfira os 20% para uma conta de investimentos antes de gastar — isso garante que você sempre investe, independente do que acontecer no mês.</p>

<h3>Adaptações para a realidade brasileira</h3>
<p>No Brasil, onde aluguel e transporte costumam consumir mais de 50% da renda nas grandes cidades, é comum adaptar para 60-20-20 ou até 65-15-20. O importante não é seguir os percentuais à risca, mas ter um sistema — qualquer divisão consciente é melhor que nenhuma.</p>

<h3>Quando a regra não se aplica?</h3>
<p>Se você tem dívidas com juros altos (cartão, cheque especial), priorize quitar antes de investir. Nesse caso, use 50-20-30, onde o 30% vai para quitar dívidas. Depois que as dívidas sumirem, volte ao modelo original.</p>`,
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
<p><strong>Nunca guarde a reserva em:</strong> Poupança bloqueada, CDB com carência, ações ou fundos de risco. O objetivo não é maximizar o rendimento — é ter o dinheiro disponível quando precisar.</p>

<h3>Como construir do zero</h3>
<p><strong>Meta 1 — R$ 1.000:</strong> Uma pequena reserva já resolve a maioria dos imprevistos cotidianos. Concentre esforços aqui primeiro. <strong>Meta 2 — 1 mês de despesas:</strong> Você está protegido contra imprevistos médios. <strong>Meta 3 — 3 a 6 meses:</strong> Reserva completa. A partir daqui, os aportes extras podem ir para investimentos de maior risco e retorno.</p>

<h3>Dicas práticas</h3>
<p>Abra uma conta separada da conta corrente para a reserva — dinheiro misturado some. Configure um débito automático mensal, mesmo que seja R$ 50. Não "empreste" a reserva para si mesmo para compras — ela só existe para emergências reais. Se usar, recomponha antes de continuar investindo.</p>`,
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
<p>O IR é retido na fonte automaticamente pelo banco ou corretora — você não precisa calcular nem pagar separadamente em aplicações de renda fixa.</p>

<h3>Ações e fundos de ações</h3>
<p><strong>Vendas de até R$ 20.000 por mês:</strong> Isentas de IR. <strong>Acima de R$ 20.000:</strong> 15% sobre o lucro (day trade: 20%). O investidor é responsável por calcular e recolher via DARF até o último dia útil do mês seguinte à venda.</p>

<h3>Declaração anual</h3>
<p>Todos os investimentos (mesmo isentos) precisam ser declarados na declaração anual de IR se o total superar R$ 300 ao ano de rendimentos isentos ou o patrimônio financeiro superar R$ 140 (valor vigente para obrigatoriedade de declaração). Consulte as regras atuais na Receita Federal — os valores e regras mudam anualmente.</p>

<h3>Informe de rendimentos</h3>
<p>Cada banco ou corretora emite o informe de rendimentos até o fim de fevereiro do ano seguinte. Guarde todos — são essenciais para preencher a declaração corretamente.</p>`,
    afiliados:[
      { label:"📈 XP Investimentos — LCI e LCA isentos", href:"#" },
      { label:"🏦 Inter — plataforma completa de investimentos", href:"#" },
    ]
  },
  {
    id:"pix-ted-boleto",
    cat:"Impostos & Extras",
    title:"Pix, TED ou boleto — quando usar cada um?",
    desc:"Cada meio de pagamento tem vantagens e limitações. Saiba quando usar cada um para não perder dinheiro nem tempo.",
    tempo:"4 min",
    updated:"Janeiro 2026",
    conteudo:`
<h3>Pix — o novo padrão</h3>
<p>Criado pelo Banco Central em 2020, o Pix revolucionou os pagamentos no Brasil. É gratuito para pessoas físicas, funciona 24 horas por dia, 7 dias por semana (inclusive fins de semana e feriados) e o dinheiro cai em segundos.</p>
<p><strong>Use o Pix para:</strong> quase tudo. Transferências entre pessoas, pagamentos em lojas físicas e online, pagamento de contas e boletos (Pix Cobrança), splits em grupo.</p>
<p><strong>Atenção:</strong> O Pix é irreversível na maioria dos casos. Verifique sempre a chave e o nome do destinatário antes de confirmar. Golpes via Pix são cada vez mais comuns — desconfie de urgência e pressão para transferir.</p>

<h3>TED — transferência entre bancos</h3>
<p>O TED (Transferência Eletrônica Disponível) foi o padrão antes do Pix. Funciona em dias úteis dentro do horário bancário (geralmente até 17h). Cai no mesmo dia para o destinatário.</p>
<p><strong>Use o TED quando:</strong> o destinatário não tiver chave Pix cadastrada, para transferências de valores muito altos onde você queira o registro formal bancário, ou em sistemas legados que ainda não aceitam Pix.</p>
<p>Bancos tradicionais cobram R$ 5 a R$ 20 por TED para outras instituições. Bancos digitais geralmente oferecem TEDs ilimitadas gratuitas.</p>

<h3>Boleto bancário</h3>
<p>O boleto ainda é amplamente usado em cobranças comerciais, assinaturas, impostos e parcelamentos. Tem prazo de vencimento definido e pode ser pago em qualquer banco, lotérica ou app.</p>
<p><strong>Use o boleto quando:</strong> o credor emitir um (você não "escolhe" pagar boleto — você paga quando ele é emitido). Em compras online parceladas sem cartão, o boleto pode sair mais barato que o cartão.</p>
<p><strong>Atenção:</strong> Boletos podem ser falsificados (bolware). Sempre verifique o CNPJ do beneficiário antes de pagar. Nunca pague boleto recebido por e-mail não solicitado.</p>

<h3>Resumo rápido</h3>
<p><strong>Pix:</strong> Use para tudo, sempre que possível. Rápido, gratuito, 24/7. <strong>TED:</strong> Use quando o Pix não for aceito. Verifique se o banco cobra. <strong>Boleto:</strong> Use quando emitido pelo credor. Confirme sempre o beneficiário.</p>`,
    afiliados:[
      { label:"💜 Nubank — Pix, TED e boleto sem taxas", href:"#" },
      { label:"🏦 Inter — transferências ilimitadas grátis", href:"#" },
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

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const resAwesome = await fetch(`/api/cotacoes`);
      const dataAwesome = await resAwesome.json();
      setMarketData(dataAwesome);

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
                  return (
                    <div className="cmd-card" key={item.key}>
                      <div className="cmd-card-top">
                        <span className="cmd-icon">{item.icon}</span>
                        {v
                          ? <span className={`cmd-chg ${cls}`}>{sign}{fmtNum(chg,2)}%</span>
                          : <span className="cmd-skeleton" style={{width:48,height:20,borderRadius:100}}>&nbsp;</span>
                        }
                      </div>
                      <div className="cmd-name">{item.label}</div>
                      {v
                        ? <div className="cmd-price">{item.unit} {fmtNum(parseFloat(v.bid),2)}</div>
                        : <div className="cmd-skeleton" style={{height:26,width:90,borderRadius:4,marginTop:4}}>&nbsp;</div>
                      }
                      <div className="cmd-unit">{item.unit} / {item.key.split("-")[0]}</div>
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
          model:"llama-3.3-70b-versatile",
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
      setAiTxt(data.choices[0].message.content);
    } catch(e) {
      setAiTxt("Erro ao conectar. Tente novamente.");
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
              <input className="inp" value={f.renda} onChange={set("renda")} inputMode="numeric"/>
            </div>
          </div>
          <div className="field">
            <label>Valor do imóvel</label>
            <div className="inp-wrap">
              <span className="inp-pre">R$</span>
              <input className="inp" value={f.imovel} onChange={set("imovel")} inputMode="numeric"/>
            </div>
          </div>
          <div className="field">
            <label>Entrada</label>
            <div className="inp-wrap">
              <span className="inp-pre">R$</span>
              <input className="inp" value={f.entrada} onChange={set("entrada")} inputMode="numeric"/>
            </div>
          </div>
          <div className="field">
            <label>Prazo (anos)</label>
            <div className="inp-wrap">
              <input className="inp np ns" value={f.prazo} onChange={set("prazo")} inputMode="numeric"/>
              <span className="inp-suf">anos</span>
            </div>
          </div>
          <div className="field">
            <label>Taxa de juros a.a.</label>
            <div className="inp-wrap">
              <input className="inp np ns" value={f.taxa} onChange={set("taxa")} inputMode="decimal"/>
              <span className="inp-suf">%</span>
            </div>
          </div>
        </div>
        <button className="btn-gold" onClick={calcular} disabled={loading}>
          {loading ? "Calculando..." : "Calcular financiamento"}
        </button>
      </div>

      {res && (
        <>
          <div className="res-grid">
            <div className="res-item">
              <div className="res-lbl">Parcela mensal</div>
              <div className="res-val o">{fmtBRL(res.parcela)}</div>
            </div>
            <div className="res-item">
              <div className="res-lbl">Comprometimento</div>
              <div className={`res-val ${res.comp>30?"r":"g"}`}>{fmtPct(res.comp)}</div>
              <div className="res-sub">da renda mensal</div>
            </div>
            <div className="res-item">
              <div className="res-lbl">Total pago</div>
              <div className="res-val">{fmtBRL(res.total)}</div>
            </div>
            <div className="res-item">
              <div className="res-lbl">Total de juros</div>
              <div className="res-val r">{fmtBRL(res.juros)}</div>
            </div>
            <div className="res-item">
              <div className="res-lbl">Entrada</div>
              <div className="res-val">{fmtPct(res.entPct)}</div>
              <div className="res-sub">do valor do imóvel</div>
            </div>
            <div className="res-item">
              <div className="res-lbl">Prazo total</div>
              <div className="res-val">{res.prazo*12}</div>
              <div className="res-sub">parcelas</div>
            </div>
          </div>

          {res.comp > 30 && (
            <div className="callout callout-warn">
              ⚠️ A parcela comprometeria {fmtPct(res.comp)} da sua renda. O recomendado é até 30%.
            </div>
          )}

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
  const [valor, setValor] = useState("10000");
  const [meses, setMeses] = useState("12");

  const calcRend = (inv, v, m) => {
    const vl = parseFloat(v) || 0;
    const taxaM = inv.rate / 100 / 12;
    const bruto = vl * (Math.pow(1 + taxaM, m) - 1);
    let ir = 0;
    if (inv.ir) {
      const aliq = m <= 6 ? 0.225 : m <= 12 ? 0.2 : m <= 24 ? 0.175 : 0.15;
      ir = bruto * aliq;
    }
    return { bruto, liquido: bruto - ir };
  };

  const m = parseInt(meses) || 12;
  const results = INVEST
    .map(inv => ({ ...inv, ...calcRend(inv, valor, m) }))
    .sort((a, b) => b.liquido - a.liquido);
  const best = results[0]?.liquido;

  return (
    <div>
      <div className="sec-hd">
        <div className="sec-cat">Renda Fixa</div>
        <h2 className="sec-title">Compare <em>investimentos</em></h2>
        <p className="sec-sub">Veja o rendimento líquido real de cada alternativa.</p>
      </div>

      <div className="card">
        <div className="cmp-inputs">
          <div className="cmp-inp-wrap">
            <div className="cmp-inp-lbl">Valor a investir</div>
            <div className="inp-wrap">
              <span className="inp-pre">R$</span>
              <input className="inp" value={valor} onChange={e => setValor(e.target.value)} inputMode="numeric"/>
            </div>
          </div>
          <div className="cmp-inp-wrap">
            <div className="cmp-inp-lbl">Período</div>
            <div className="inp-wrap">
              <input className="inp np ns" value={meses} onChange={e => setMeses(e.target.value)} inputMode="numeric"/>
              <span className="inp-suf">meses</span>
            </div>
          </div>
        </div>

        <div className="cmp-table-wrap">
          <table className="cmp-table">
            <thead>
              <tr>
                <th>Investimento</th>
                <th>Taxa</th>
                <th>Liquidez</th>
                <th>Mín.</th>
                <th>Rendimento bruto</th>
                <th>Rendimento líquido</th>
              </tr>
            </thead>
            <tbody>
              {results.map((inv, i) => (
                <tr key={inv.name}>
                  <td>
                    <span className="inv-name">{inv.name}</span>
                    <span className="inv-tag">{inv.tag}</span>
                  </td>
                  <td>{fmtNum(inv.rate,1)}% a.a.</td>
                  <td><span className="badge-ir">{inv.liq}</span></td>
                  <td>{inv.min}</td>
                  <td>{fmtBRL(inv.bruto)}</td>
                  <td>
                    {fmtBRL(inv.liquido)}
                    {inv.liquido === best && i === 0 && (
                      <> <span className="badge-best">melhor</span></>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="callout" style={{marginTop:20}}>
          💡 Rendimentos calculados com IR regressivo (tabela oficial). LCI/LCA/Poupança/FII/Debêntures incentivadas são isentos de IR para pessoa física.
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// ARTIGOS SECTION
// ──────────────────────────────────────────────
const CATS_ARTIGOS = [...new Set(ARTIGOS.map(a => a.cat))];

function ArtigoDetalhe({ artigo, onVoltar }) {
  return (
    <div>
      <button className="btn-back" onClick={onVoltar}>← Voltar aos artigos</button>
      <div className="sec-hd">
        <div className="sec-cat">{artigo.cat}</div>
        <h2 className="sec-title" style={{fontSize:"clamp(1.4rem,3vw,1.9rem)"}}>{artigo.title}</h2>
        <p className="art-updated">Atualizado em {artigo.updated} · {artigo.tempo} de leitura</p>
      </div>

      <div className="card">
        <div
          className="art-body"
          dangerouslySetInnerHTML={{ __html: artigo.conteudo }}
        />

        <div className="art-disclaimer">
          <strong>⚠️ Aviso importante:</strong> Este conteúdo é exclusivamente educacional e informativo. Não constitui recomendação de investimento, assessoria financeira ou consultoria jurídica. Consulte sempre um profissional habilitado antes de tomar decisões financeiras. Verifique as condições atuais diretamente nas instituições mencionadas, pois taxas e regras mudam com frequência.
        </div>
      </div>

      {artigo.afiliados && artigo.afiliados.length > 0 && (
        <div className="aff-box">
          <div className="aff-lbl">Links úteis</div>
          <div className="aff-links">
            {artigo.afiliados.map((af, i) => (
              <a
                key={i}
                className="aff-link"
                href={af.href}
                target="_blank"
                rel="noopener sponsored noreferrer"
                onClick={af.href === "#" ? e => e.preventDefault() : undefined}
                style={af.href === "#" ? {opacity:.5, cursor:"not-allowed"} : {}}
              >
                <span>{af.label}</span>
                <span className="aff-arrow">{af.href === "#" ? "Em breve" : "→"}</span>
              </a>
            ))}
          </div>
          <p style={{fontSize:".68rem",color:"var(--muted)",marginTop:12}}>
            * Este site pode receber comissão por indicações. Links marcados como "Em breve" aguardam aprovação do programa de afiliados.
          </p>
        </div>
      )}
    </div>
  );
}

function Artigos() {
  const [artigoAtivo, setArtigoAtivo] = useState(null);
  const [catAtiva, setCatAtiva] = useState("Todos");

  if (artigoAtivo) {
    return <ArtigoDetalhe artigo={artigoAtivo} onVoltar={() => setArtigoAtivo(null)} />;
  }

  const filtrados = catAtiva === "Todos"
    ? ARTIGOS
    : ARTIGOS.filter(a => a.cat === catAtiva);

  return (
    <div>
      <div className="sec-hd">
        <div className="sec-cat">Educação Financeira</div>
        <h2 className="sec-title">Artigos e <em>guias</em></h2>
        <p className="sec-sub">Conteúdo prático sobre investimentos, crédito, cartões e planejamento financeiro.</p>
      </div>

      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:24}}>
        {["Todos", ...CATS_ARTIGOS].map(c => (
          <button
            key={c}
            className={`tab${catAtiva===c?" active":""}`}
            onClick={() => setCatAtiva(c)}
            style={{borderRadius:100}}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="art-grid">
        {filtrados.map(a => (
          <div className="art-card" key={a.id} onClick={() => setArtigoAtivo(a)}>
            <div className="art-card-cat">{a.cat}</div>
            <div className="art-card-title">{a.title}</div>
            <div className="art-card-desc">{a.desc}</div>
            <div className="art-card-footer">
              <span className="art-card-time">⏱ {a.tempo}</span>
              <span className="art-card-read">Ler artigo →</span>
            </div>
          </div>
        ))}
      </div>

      <div className="callout" style={{marginTop:28}}>
        ⚠️ Todo conteúdo deste site é educacional e não constitui recomendação de investimento. Consulte um profissional habilitado antes de tomar decisões financeiras.
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// APP ROOT
// ──────────────────────────────────────────────
const TABS = [
  { id:"cotacoes",   label:"Cotações"    },
  { id:"simulador",  label:"Simulador"   },
  { id:"comparador", label:"Comparador"  },
  { id:"artigos",    label:"Artigos"     },
];

export default function App(){
  const [tab, setTab] = useState("cotacoes");

  return (
    <>
      <style>{S}</style>
      <div className="noise"/>
      <div className="root">
        <header className="hdr">
          <div className="logo" onClick={() => setTab("cotacoes")}>
            Finança<em style={{fontStyle:"italic"}}>BR</em>
            <small>mercados · crédito · investimentos</small>
          </div>
          <nav className="tabs">
            {TABS.map(t => (
              <button
                key={t.id}
                className={`tab${tab===t.id?" active":""}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </header>
        <main className="main">
          {tab === "cotacoes"   && <Cotacoes/>}
          {tab === "simulador"  && <Simulador/>}
          {tab === "comparador" && <Comparador/>}
          {tab === "artigos"    && <Artigos/>}
        </main>
      </div>
    </>
  );
}
