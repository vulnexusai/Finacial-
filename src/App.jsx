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
`;

const MARKET_DEF = [
  { key:"gold",    label:"Ouro",          icon:"🥇", unit:"USD/oz",  cat:"Metais" },
  { key:"silver",  label:"Prata",          icon:"🥈", unit:"USD/oz",  cat:"Metais" },
  { key:"copper",  label:"Cobre",          icon:"🔶", unit:"USD/lb",  cat:"Metais" },
  { key:"oil_wti", label:"Petróleo WTI",   icon:"🛢️", unit:"USD/bbl", cat:"Energia" },
  { key:"oil_brent",label:"Petróleo Brent",icon:"🛢️", unit:"USD/bbl", cat:"Energia" },
  { key:"soybeans",label:"Soja",           icon:"🌱", unit:"USD/bu",  cat:"Agrícolas" },
  { key:"corn",    label:"Milho",          icon:"🌽", unit:"USD/bu",  cat:"Agrícolas" },
  { key:"coffee",  label:"Café",           icon:"☕", unit:"USD/lb",  cat:"Agrícolas" },
  { key:"wheat",   label:"Trigo",          icon:"🌾", unit:"USD/bu",  cat:"Agrícolas" },
  { key:"usd_brl", label:"Dólar/Real",     icon:"💱", unit:"R$",      cat:"Câmbio" },
  { key:"eur_brl", label:"Euro/Real",      icon:"🇪🇺", unit:"R$",      cat:"Câmbio" },
];

const BCB_DEF = [
  { key:"selic", label:"SELIC", sub:"Taxa básica de juros" },
  { key:"cdi",   label:"CDI",   sub:"Taxa interbancária" },
  { key:"ipca",  label:"IPCA",  sub:"Inflação 12 meses" },
];

const INVEST = [
  { name:"Poupança",           tag:"isento de IR",  rate: 7.6,  ir:false, liq:"Imediata",  min:"R$ 1"     },
  { name:"Tesouro Selic",      tag:"gov. federal",  rate:12.2,  ir:true,  liq:"D+1",       min:"R$ 30"    },
  { name:"CDB 100% CDI",       tag:"banco digital", rate:12.3,  ir:true,  liq:"D+0/D+1",   min:"R$ 1"     },
  { name:"CDB 110% CDI",       tag:"prazo 12m+",    rate:13.5,  ir:true,  liq:"No venc.",  min:"R$ 500"   },
  { name:"LCI 93% CDI",        tag:"isento de IR",  rate:11.4,  ir:false, liq:"90 dias",   min:"R$ 1.000" },
  { name:"LCA 92% CDI",        tag:"isento de IR",  rate:11.3,  ir:false, liq:"90 dias",   min:"R$ 1.000" },
  { name:"FII (DY médio)",     tag:"isento IR prov",rate:11.8,  ir:false, liq:"D+2 bolsa", min:"R$ 10"    },
  { name:"Debênture Inc. IPCA+7%",tag:"isento de IR",rate:14.2, ir:false, liq:"Sec. baixa",min:"R$ 1.000" },
];

function fmtBRL(v){return v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});}
function fmtPct(v){return v.toFixed(2).replace(".",",") + "%";}
function fmtNum(v,dec=2){return v.toLocaleString("pt-BR",{minimumFractionDigits:dec,maximumFractionDigits:dec});}

function calcParcela(val,entrada,taxaAA,anos){
  const p=val-entrada,i=taxaAA/100/12,n=anos*12;
  if(i===0)return p/n;
  return (p*i*Math.pow(1+i,n))/(Math.pow(1+i,n)-1);
}

function calcInvest(valor,meses,taxaAA,isIR){
  const taxaLiq = isIR ? taxaAA * 0.85 : taxaAA;
  const r = Math.pow(1+taxaLiq/100, meses/12) - 1;
  return valor * (1 + r);
}

// ──────────────────────────────────────────────
// COTAÇÕES SECTION
// ──────────────────────────────────────────────
function Cotacoes(){
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(false);
  const [ts,setTs]=useState(null);

  const fetch_ = useCallback(async()=>{
    setLoading(true);
    try{
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1500,
          tools:[{type:"web_search_20250305",name:"web_search"}],
          system:`You are a financial data API. Search the web for current real-time prices.
Return ONLY a valid JSON object. No markdown. No backticks. No explanation. Start with { and end with }.
JSON structure: {"gold":{"price":3250,"chg":0.5},"silver":{"price":32.5,"chg":-0.3},"copper":{"price":4.5,"chg":0.2},"oil_wti":{"price":71.2,"chg":-1.1},"oil_brent":{"price":75.1,"chg":-0.9},"soybeans":{"price":1020,"chg":0.4},"corn":{"price":455,"chg":-0.2},"coffee":{"price":2.8,"chg":1.2},"wheat":{"price":540,"chg":0.1},"usd_brl":{"price":5.75,"chg":0.3},"eur_brl":{"price":6.30,"chg":0.1},"selic":{"price":14.75,"chg":0},"cdi":{"price":14.65,"chg":0},"ipca":{"price":5.1,"chg":0}}
chg = percentage change from previous close.`,
          messages:[{role:"user",content:"Search and return current market prices for: Gold (USD/oz), Silver (USD/oz), Copper (USD/lb), WTI Crude Oil (USD/barrel), Brent Crude Oil (USD/barrel), Soybeans (USD/bushel), Corn (USD/bushel), Coffee (USD/lb), Wheat (USD/bushel), USD/BRL, EUR/BRL, Brazil SELIC rate, CDI rate, Brazil IPCA 12m inflation. Return only the JSON object."}]
        })
      });
      const d=await res.json();
      const txt=d.content.filter(b=>b.type==="text").map(b=>b.text).join("");
      const m=txt.match(/\{[\s\S]*\}/);
      if(m){setData(JSON.parse(m[0]));setTs(new Date());}
    }catch(e){console.error(e);}
    setLoading(false);
  },[]);

  useEffect(()=>{fetch_();},[]);

  const cats = [...new Set(MARKET_DEF.map(c=>c.cat))];

  return(
    <div>
      <div className="sec-hd">
        <div className="sec-cat">Mercados</div>
        <h2 className="sec-title">Cotações em <em>tempo real</em></h2>
        <p className="sec-sub">Preços atualizados via busca em tempo real. Inclui commodities, energia, agrícolas e câmbio.</p>
      </div>

      {/* BCB Strip */}
      <div className="bcb-strip">
        {BCB_DEF.map(b=>{
          const v=data?.[b.key];
          return(
            <div className="bcb-chip" key={b.key}>
              <div className="bcb-chip-label">{b.label}</div>
              {v
                ? <div className="bcb-chip-val">{fmtNum(v.price,2)}%</div>
                : <div className="bcb-chip-val cmd-skeleton" style={{height:28,width:80,borderRadius:4}}>&nbsp;</div>
              }
              <div className="bcb-chip-sub">{b.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="cmd-toolbar">
        <div className="cmd-update">
          {ts ? <><span>●</span> Atualizado {ts.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</> : "Buscando preços..."}
        </div>
        <button className="refresh-btn" onClick={fetch_} disabled={loading}>
          <span className={loading?"spin":""}>↻</span>
          {loading?"Buscando...":"Atualizar"}
        </button>
      </div>

      <div className="cmd-cats">
        {cats.map(cat=>{
          const items=MARKET_DEF.filter(c=>c.cat===cat);
          return(
            <div key={cat}>
              <div className="cmd-cat-title">{cat}</div>
              <div className="cmd-grid">
                {items.map(item=>{
                  const v=data?.[item.key];
                  const chg=v?.chg??0;
                  const cls=chg>0?"chg-up":chg<0?"chg-dn":"chg-flat";
                  const sign=chg>0?"+":"";
                  return(
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
                        ? <div className="cmd-price">{item.unit==="R$"?"R$ ":item.unit==="USD/oz"||item.unit==="USD/lb"||item.unit==="USD/bbl"||item.unit==="USD/bu"?"$":""}{fmtNum(v.price,item.unit.includes("bbl")||item.unit.includes("bu")?2:2)}</div>
                        : <div className="cmd-skeleton" style={{height:26,width:90,borderRadius:4,marginTop:4}}>&nbsp;</div>
                      }
                      <div className="cmd-unit">{item.unit}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {data && (
        <div className="callout" style={{marginTop:20}}>
          <span>ℹ️</span>
          <span>Preços obtidos via busca em tempo real. Valores podem ter pequena defasagem em relação ao mercado. Para operações, consulte sua corretora.</span>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// SIMULADOR SECTION
// ──────────────────────────────────────────────
function Simulador(){
  const [f,setF]=useState({renda:"8000",imovel:"400000",entrada:"80000",prazo:"30",taxa:"10.49"});
  const [res,setRes]=useState(null);
  const [aiTxt,setAiTxt]=useState("");
  const [loading,setLoading]=useState(false);
  const [streaming,setStreaming]=useState(false);

  const set=k=>e=>setF(p=>({...p,[k]:e.target.value}));

  const calcular=useCallback(async()=>{
    const renda=parseFloat(f.renda)||0;
    const imovel=parseFloat(f.imovel)||0;
    const entrada=parseFloat(f.entrada)||0;
    const prazo=parseInt(f.prazo)||30;
    const taxa=parseFloat(f.taxa.replace(",","."))||10.49;
    const parcela=calcParcela(imovel,entrada,taxa,prazo);
    const comp=(parcela/renda)*100;
    const total=parcela*prazo*12;
    const juros=total-(imovel-entrada);
    const entPct=(entrada/imovel)*100;
    setRes({renda,imovel,entrada,prazo,taxa,parcela,comp,total,juros,entPct});
    setAiTxt(""); setLoading(true); setStreaming(false);

    const prompt=`Você é um consultor financeiro brasileiro especialista em crédito imobiliário. Analise com tom direto, humano e útil. Use o contexto econômico brasileiro de 2026.

DADOS:
- Renda mensal: ${fmtBRL(renda)}
- Imóvel: ${fmtBRL(imovel)} | Entrada: ${fmtBRL(entrada)} (${entPct.toFixed(1)}%)
- Prazo: ${prazo} anos | Taxa: ${taxa}% a.a.
- Parcela: ${fmtBRL(parcela)} | Comprometimento: ${comp.toFixed(1)}%
- Total de juros: ${fmtBRL(juros)}

Analise em 3 parágrafos curtos:
1. Viabilidade: o banco vai aprovar? O comprometimento está saudável?
2. Custo real: o que ${fmtBRL(juros)} em juros representa na prática?
3. Recomendação direta: financiar agora, esperar ou aumentar a entrada? Mencione a Selic em 14,75%.

Sem introduções genéricas. Resposta em português.`;

    try{
      const resp=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,stream:true,messages:[{role:"user",content:prompt}]})
      });
      setLoading(false); setStreaming(true);
      const reader=resp.body.getReader();
      const dec=new TextDecoder();
      let buf="";
      while(true){
        const{done,value}=await reader.read();
        if(done)break;
        buf+=dec.decode(value,{stream:true});
        const lines=buf.split("\n"); buf=lines.pop();
        for(const line of lines){
          if(line.startsWith("data: ")){
            const raw=line.slice(6).trim();
            if(raw==="[DONE]")break;
            try{const p=JSON.parse(raw);if(p.delta?.text)setAiTxt(t=>t+p.delta.text);}catch{}
          }
        }
      }
      setStreaming(false);
    }catch(e){setLoading(false);setStreaming(false);setAiTxt("Erro ao conectar com a IA.");}
  },[f]);

  return(
    <div>
      <div className="sec-hd">
        <div className="sec-cat">Crédito Imobiliário</div>
        <h2 className="sec-title">Simulador com <em>análise de IA</em></h2>
        <p className="sec-sub">Calcule sua parcela e receba uma avaliação personalizada: viabilidade, custo real e o que fazer agora.</p>
      </div>

      <div className="card">
        <div className="card-title">Dados do financiamento</div>
        <div className="form-grid">
          <div className="field"><label>Renda mensal bruta</label><div className="inp-wrap"><span className="inp-pre">R$</span><input className="inp" value={f.renda} onChange={set("renda")} inputMode="numeric"/></div></div>
          <div className="field"><label>Valor do imóvel</label><div className="inp-wrap"><span className="inp-pre">R$</span><input className="inp" value={f.imovel} onChange={set("imovel")} inputMode="numeric"/></div></div>
          <div className="field"><label>Entrada</label><div className="inp-wrap"><span className="inp-pre">R$</span><input className="inp" value={f.entrada} onChange={set("entrada")} inputMode="numeric"/></div></div>
          <div className="field"><label>Prazo (anos)</label><div className="inp-wrap"><input className="inp np ns" value={f.prazo} onChange={set("prazo")} inputMode="numeric"/><span className="inp-suf">anos</span></div></div>
          <div className="field full"><label>Taxa de juros (Caixa hoje ~10,49% a.a.)</label><div className="inp-wrap"><input className="inp np ns" value={f.taxa} onChange={set("taxa")} inputMode="decimal"/><span className="inp-suf">% a.a.</span></div></div>
        </div>
        <button className="btn-gold" onClick={calcular} disabled={loading||streaming}>
          {loading?"Calculando...":streaming?"Analisando com IA ▪▪▪":"Calcular e analisar com IA →"}
        </button>
      </div>

      {res&&(
        <div className="card">
          <div className="card-title">Resultado</div>
          <div className="res-grid">
            <div className="res-item"><div className="res-lbl">Parcela mensal</div><div className={`res-val ${res.comp>30?"r":res.comp>25?"o":"g"}`}>{fmtBRL(res.parcela)}</div><div className="res-sub">sistema Price</div></div>
            <div className="res-item"><div className="res-lbl">Comprometimento</div><div className={`res-val ${res.comp>30?"r":res.comp>25?"o":"g"}`}>{res.comp.toFixed(1)}%</div><div className="res-sub">da renda</div></div>
            <div className="res-item"><div className="res-lbl">Total de juros</div><div className="res-val r">{fmtBRL(res.juros)}</div><div className="res-sub">em {res.prazo} anos</div></div>
            <div className="res-item"><div className="res-lbl">Total pago</div><div className="res-val">{fmtBRL(res.total)}</div><div className="res-sub">principal + juros</div></div>
            <div className="res-item"><div className="res-lbl">Entrada</div><div className="res-val o">{res.entPct.toFixed(1)}%</div><div className="res-sub">do imóvel</div></div>
            <div className="res-item"><div className="res-lbl">Financiado</div><div className="res-val">{fmtBRL(res.imovel-res.entrada)}</div><div className="res-sub">principal</div></div>
          </div>
          {res.comp>30&&<div className="callout callout-warn"><span>⚠️</span><span>Comprometimento acima de 30% — limite habitual para aprovação bancária.</span></div>}
          <div className="divider"/>
          <div className="ai-box">
            <div className="ai-hd"><div className="ai-badge">✦ IA</div><div className="ai-hdtxt">Análise personalizada do seu caso</div></div>
            {loading&&<div className="ai-loading"><div className="ai-dots"><span/><span/><span/></div>Analisando...</div>}
            {aiTxt&&<div className="ai-txt">{aiTxt}{streaming?"▌":""}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// COMPARADOR SECTION
// ──────────────────────────────────────────────
function Comparador(){
  const [valor,setValor]=useState("10000");
  const [meses,setMeses]=useState("24");

  const v=parseFloat(valor)||10000;
  const m=parseInt(meses)||24;

  const rows=INVEST.map(inv=>{
    const saldo=calcInvest(v,m,inv.rate,inv.ir);
    const lucro=saldo-v;
    return{...inv,saldo,lucro};
  }).sort((a,b)=>b.saldo-a.saldo);

  const best=rows[0].saldo;

  return(
    <div>
      <div className="sec-hd">
        <div className="sec-cat">Renda Fixa + Variável</div>
        <h2 className="sec-title">Comparador de <em>investimentos</em></h2>
        <p className="sec-sub">Veja quanto R$ 1 investido rende em cada modalidade. Calcule pelo valor e prazo desejados.</p>
      </div>

      <div className="card">
        <div className="cmp-inputs">
          <div className="cmp-inp-wrap">
            <div className="cmp-inp-lbl">Valor a investir</div>
            <div className="inp-wrap"><span className="inp-pre">R$</span><input className="inp" value={valor} onChange={e=>setValor(e.target.value)} inputMode="numeric"/></div>
          </div>
          <div className="cmp-inp-wrap">
            <div className="cmp-inp-lbl">Prazo (meses)</div>
            <div className="inp-wrap"><input className="inp np ns" value={meses} onChange={e=>setMeses(e.target.value)} inputMode="numeric"/><span className="inp-suf">meses</span></div>
          </div>
        </div>

        <div className="cmp-table-wrap">
          <table className="cmp-table">
            <thead>
              <tr>
                <th>Investimento</th>
                <th>Taxa líquida</th>
                <th>Saldo final</th>
                <th>Lucro</th>
                <th>Liquidez</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r,i)=>(
                <tr key={r.name}>
                  <td>
                    <div className="inv-name">
                      {r.saldo===best&&<span className="badge-best" style={{marginRight:6}}>★ Melhor</span>}
                      {r.name}
                    </div>
                    <span className="inv-tag">
                      {r.tag} {!r.ir&&<span className="badge-ir">Isento IR</span>}
                    </span>
                  </td>
                  <td style={{color:"var(--gold)"}}>{fmtPct(r.rate)}</td>
                  <td style={{color:r.saldo===best?"var(--green)":"var(--text)",fontWeight:r.saldo===best?500:300}}>{fmtBRL(r.saldo)}</td>
                  <td style={{color:"var(--green)"}}>{fmtBRL(r.lucro)}</td>
                  <td style={{fontSize:".8rem",color:"var(--muted)"}}>{r.liq}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="callout" style={{marginTop:20}}>
          <span>💡</span>
          <span>Taxas estimadas para abril/2026 com Selic em 14,75%. LCI/LCA usam rentabilidade equivalente após isenção de IR. FII considera apenas dividendos (sem variação de cota).</span>
        </div>

        <div className="aff-box">
          <div className="aff-lbl">Onde investir agora</div>
          <div className="aff-links">
            <a href="#LINK-XP-AFILIADO" className="aff-link" target="_blank" rel="noopener sponsored">📈 XP — LCI, LCA, FIIs e Debêntures <span className="aff-arrow">↗</span></a>
            <a href="#LINK-INTER-AFILIADO" className="aff-link" target="_blank" rel="noopener sponsored">🧡 Inter — CDB 120% CDI a partir de R$ 100 <span className="aff-arrow">↗</span></a>
            <a href="#LINK-NUBANK-AFILIADO" className="aff-link" target="_blank" rel="noopener sponsored">💜 Nubank — 100% CDI automático <span className="aff-arrow">↗</span></a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// APP
// ──────────────────────────────────────────────
export default function App(){
  const [tab,setTab]=useState("mercados");
  const tabs=[
    {id:"mercados",label:"📊 Mercados"},
    {id:"simulador",label:"🏠 Simulador"},
    {id:"comparador",label:"📈 Comparador"},
  ];

  return(
    <>
      <style>{S}</style>
      <div className="root">
        <div className="noise"/>
        <header className="hdr">
          <div className="logo" onClick={()=>setTab("mercados")}>
            SimuladorFácil <small>Ferramentas Financeiras</small>
          </div>
          <div className="tabs">
            {tabs.map(t=>(
              <button key={t.id} className={`tab ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </header>
        <main className="main">
          {tab==="mercados"  && <Cotacoes/>}
          {tab==="simulador" && <Simulador/>}
          {tab==="comparador"&& <Comparador/>}
        </main>
      </div>
    </>
  );
}
