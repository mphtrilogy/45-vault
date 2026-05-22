import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://awseqiusypnazuddfhay.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3c2VxaXVzeXBuYXp1ZGRmaGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NjI5MDEsImV4cCI6MjA5NTAzODkwMX0.7lFkZwhFsSfaj4uepbRiCJWH2Oj9AiC3US09Qzoig4E";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

const OWNER_PASSWORD = "vault45";

const GENRES = ["R&B","Soul","Rock","Pop","Country","Jazz","Blues","Doo-Wop","Funk","Gospel","Rockabilly","Other"];
const CONDITIONS = ["M","NM","VG+","VG","G+","G","F"];
const SORT_OPTIONS = ["Artist A-Z","Artist Z-A","Label A-Z","Genre","Condition","Recently Played","Recently Added"];
const RIGS = ["Family Room","Attic","Office","Other"];

const fmtDate = (iso) => { if(!iso) return ""; const d=new Date(iso); return d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}); };
const fmtDateTime = (iso) => { if(!iso) return ""; const d=new Date(iso); return d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})+" · "+d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}); };

const cls = (...a) => a.filter(Boolean).join(" ");

const Icon = ({ d, size=18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);
const IconCamera   = () => <Icon d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>;
const IconPlus     = () => <Icon d="M12 5v14M5 12h14"/>;
const IconSearch   = () => <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>;
const IconVinyl    = () => <Icon d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 6a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 3a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>;
const IconEdit     = () => <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>;
const IconTrash    = () => <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>;
const IconLock     = () => <Icon d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4"/>;
const IconCheck    = () => <Icon d="M20 6L9 17l-5-5"/>;
const IconX        = () => <Icon d="M18 6L6 18M6 6l12 12"/>;
const IconDownload = () => <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>;
const IconShuffle  = () => <Icon d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>;
const IconPlay     = () => <Icon d="M5 3l14 9-14 9V3z"/>;
const IconChevron  = () => <Icon d="M9 18l6-6-6-6"/>;
const IconClock    = () => <Icon d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-14v4l3 3"/>;
const IconDollar   = () => <Icon d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>;
const IconExternal = () => <Icon d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>;

const labelColor = (label="") => {
  const l = label.toLowerCase();
  if(l.includes("atco"))      return "#2255aa";
  if(l.includes("arvee"))     return "#e05520";
  if(l.includes("chess"))     return "#3388cc";
  if(l.includes("sun"))       return "#f0a020";
  if(l.includes("specialty")) return "#cc3344";
  if(l.includes("motown")||l.includes("tamla")) return "#dd2222";
  if(l.includes("atlantic"))  return "#dd2222";
  if(l.includes("columbia"))  return "#cc2233";
  if(l.includes("rca"))       return "#cc2233";
  if(l.includes("capitol"))   return "#884499";
  if(l.includes("decca"))     return "#228866";
  if(l.includes("imperial"))  return "#338844";
  if(l.includes("prestige"))  return "#e8a020";
  return "#555";
};

async function readLabelWithAI(b64) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      model:"claude-sonnet-4-20250514", max_tokens:1000,
      messages:[{role:"user",content:[
        {type:"image",source:{type:"base64",media_type:"image/jpeg",data:b64}},
        {type:"text",text:'Read this vinyl 45 RPM record label. Return ONLY valid JSON:\n{"artist":"","title_a":"","title_b":"","label":"","catalog":"","genre":"","notes":""}\nGenre: R&B, Soul, Rock, Pop, Country, Jazz, Blues, Doo-Wop, Funk, Gospel, Rockabilly, or Other.'}
      ]}]
    })
  });
  const data = await res.json();
  const text = data.content?.find(b=>b.type==="text")?.text||"{}";
  try { return JSON.parse(text.replace(/```json|```/g,"").trim()); } catch { return {}; }
}

async function getPriceEstimate(record) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      model:"claude-sonnet-4-20250514", max_tokens:600,
      messages:[{role:"user",content:`You are a vinyl record pricing expert specializing in 45 RPM singles. Give a realistic market value estimate based on Discogs sold listings and collector knowledge.

Record: "${record.artist}" - "${record.title_a}" / "${record.title_b||'unknown B-side'}"
Label: ${record.label||'unknown'} | Catalog: ${record.catalog||'unknown'} | Genre: ${record.genre||'unknown'} | Condition: ${record.condition||'VG'}
Notes: ${record.notes||'none'}

Respond in this exact format:
RANGE: $X - $Y
MEDIAN: $Z
VERDICT: [1-2 sentences on value drivers or caveats]
FACTORS: [bullet list of 2-3 key value factors]`}]
    })
  });
  const data = await res.json();
  return data.content?.find(b=>b.type==="text")?.text||"";
}

function exportCSV(records) {
  const h = ["Artist","A-Side","B-Side","Label","Catalog","Genre","Condition","Pic Sleeve","Has Sleeve","Notes","Play Count","Last Played"];
  const rows = records.map(r => {
    const lastPlay = r.plays?.length ? fmtDate(r.plays[r.plays.length-1].played_at) : "";
    return [r.artist,r.title_a,r.title_b,r.label,r.catalog,r.genre,r.condition,
      r.picture_sleeve?"Yes":"No",r.has_sleeve?"Yes":"No",r.notes,r.plays?.length||0,lastPlay]
      .map(v=>`"${(v||"").toString().replace(/"/g,'""')}"`).join(",");
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([[h.join(","),...rows].join("\n")],{type:"text/csv"}));
  a.download="45-vault.csv"; a.click();
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{--bg:#0e0c0a;--sur:#181410;--card:#201c18;--bdr:#2e2820;--acc:#e8622a;--acc2:#f0a020;--txt:#f0ebe4;--mut:#7a6e64;--grn:#7acc50;--blu:#5090e0;--pur:#c080f0;--gold:#d4a017}
  body{background:var(--bg);color:var(--txt);font-family:'DM Sans',sans-serif;min-height:100vh}
  ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:var(--bdr);border-radius:3px}
  .app{max-width:900px;margin:0 auto;padding:0 14px 80px}

  .header{display:flex;align-items:center;justify-content:space-between;padding:20px 0 16px;border-bottom:1px solid var(--bdr);margin-bottom:18px}
  .logo{display:flex;align-items:center;gap:10px}
  .logo-icon{width:36px;height:36px;border-radius:50%;background:conic-gradient(var(--acc) 0deg 60deg,#1a1410 60deg 120deg,var(--acc2) 120deg 180deg,#1a1410 180deg 240deg,var(--acc) 240deg 300deg,#1a1410 300deg 360deg);display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 2px var(--bdr),0 4px 18px rgba(232,98,42,.3);animation:spin 8s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .logo-text{font-family:'Playfair Display',serif;font-size:18px}
  .logo-sub{font-size:10px;color:var(--mut);letter-spacing:2px;text-transform:uppercase;font-family:'DM Mono',monospace}

  .stats{display:flex;gap:7px;margin-bottom:16px;flex-wrap:wrap}
  .stat{background:var(--card);border:1px solid var(--bdr);border-radius:10px;padding:10px 13px;flex:1;min-width:75px}
  .stat-num{font-family:'Playfair Display',serif;font-size:20px;color:var(--acc);line-height:1}
  .stat-lbl{font-size:9px;color:var(--mut);text-transform:uppercase;letter-spacing:1.5px;margin-top:2px;font-family:'DM Mono',monospace}
  .stat-sub{font-size:10px;color:var(--mut);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

  .loading-wrap{display:flex;align-items:center;justify-content:center;min-height:200px;flex-direction:column;gap:12px;color:var(--mut)}
  .loading-wrap p{font-size:13px}

  .shuffle-banner{background:linear-gradient(135deg,#1e1208,#2a1a08);border:1px solid var(--acc);border-radius:14px;padding:16px 18px;margin-bottom:14px;display:flex;align-items:center;gap:14px;animation:fadeIn .3s ease}
  @keyframes fadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
  .sb-disc{width:52px;height:52px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;position:relative;animation:spin 3s linear infinite;box-shadow:0 0 18px rgba(232,98,42,.4)}
  .sb-disc::after{content:'';position:absolute;inset:0;border-radius:50%;background:repeating-radial-gradient(circle at center,transparent 0,transparent 2px,rgba(255,255,255,.04) 2px,rgba(255,255,255,.04) 3px)}
  .sb-info{flex:1;min-width:0}
  .sb-label{font-size:10px;color:var(--acc);text-transform:uppercase;letter-spacing:1.5px;font-family:'DM Mono',monospace;margin-bottom:2px}
  .sb-artist{font-family:'Playfair Display',serif;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sb-title{font-size:12px;color:var(--mut);margin-top:1px}
  .sb-actions{display:flex;gap:5px;flex-shrink:0;flex-wrap:wrap;justify-content:flex-end}

  .toolbar{display:flex;gap:7px;margin-bottom:12px;align-items:center;flex-wrap:wrap}
  .sw{flex:1;min-width:140px;position:relative}
  .sw svg{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--mut);pointer-events:none}
  .si{width:100%;background:var(--card);border:1px solid var(--bdr);border-radius:8px;color:var(--txt);padding:8px 10px 8px 33px;font-size:13px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s}
  .si:focus{border-color:var(--acc)}
  .si::placeholder{color:var(--mut)}
  select{background:var(--card);border:1px solid var(--bdr);border-radius:8px;color:var(--txt);padding:8px 9px;font-size:12px;font-family:'DM Sans',sans-serif;outline:none;cursor:pointer}
  select:focus{border-color:var(--acc)}

  .btn{display:inline-flex;align-items:center;gap:5px;padding:8px 13px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;border:none;transition:all .15s;font-family:'DM Sans',sans-serif;white-space:nowrap}
  .btn-p{background:var(--acc);color:#fff}.btn-p:hover{background:#d45520}
  .btn-g{background:var(--card);color:var(--txt);border:1px solid var(--bdr)}.btn-g:hover{border-color:var(--acc);color:var(--acc)}
  .btn-s{padding:6px 10px;font-size:12px}
  .btn-d{background:#3a1a1a;color:#e05555;border:1px solid #4a2020}.btn-d:hover{background:#4a2020}
  .btn-shuf{background:linear-gradient(135deg,#2a1408,#1e1008);color:var(--acc2);border:1px solid #4a3010}.btn-shuf:hover{border-color:var(--acc2)}
  .btn-log{background:#0e1e10;color:var(--grn);border:1px solid #1e3e20}.btn-log:hover{background:#142a16}
  .btn-price{background:#1a1608;color:var(--gold);border:1px solid #3a3010}.btn-price:hover{background:#221e08}
  .btn-dis{background:#201818;color:#e07050;border:1px solid #402828}.btn-dis:hover{background:#2c2020}

  .records-grid{display:flex;flex-direction:column;gap:7px}
  .rc{background:var(--card);border:1px solid var(--bdr);border-radius:12px;padding:12px 14px;display:flex;align-items:center;gap:12px;transition:border-color .2s,transform .1s;cursor:pointer}
  .rc:hover{border-color:var(--acc);transform:translateX(2px)}
  .rc.highlighted{border-color:var(--acc);box-shadow:0 0 0 1px var(--acc),0 4px 20px rgba(232,98,42,.2)}
  .rd{width:44px;height:44px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;position:relative;box-shadow:0 2px 8px rgba(0,0,0,.5)}
  .rd::after{content:'';position:absolute;inset:0;border-radius:50%;background:repeating-radial-gradient(circle at center,transparent 0,transparent 2px,rgba(255,255,255,.03) 2px,rgba(255,255,255,.03) 3px)}
  .dl{width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:5px;font-weight:700;text-align:center;z-index:1}
  .ri{flex:1;min-width:0}
  .ra{font-family:'Playfair Display',serif;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .rt{font-size:12px;color:var(--mut);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .rm{display:flex;gap:4px;margin-top:4px;flex-wrap:wrap;align-items:center}
  .tag{font-size:9px;padding:2px 6px;border-radius:20px;font-family:'DM Mono',monospace;letter-spacing:.5px;text-transform:uppercase}
  .tg{background:#1e2818;color:var(--grn);border:1px solid #2e3c20}
  .tc{background:#1a1e28;color:var(--blu);border:1px solid #202840}
  .tl{background:#201818;color:#c06040;border:1px solid #382020}
  .ts{background:#1e1a28;color:var(--pur);border:1px solid #302040}
  .tp{background:#0e1e10;color:var(--grn);border:1px solid #1e3e20}
  .play-dot{width:6px;height:6px;border-radius:50%;background:var(--grn);flex-shrink:0}

  .overlay{position:fixed;inset:0;background:rgba(0,0,0,.82);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;z-index:100}
  @media(min-width:600px){.overlay{align-items:center;padding:16px}}
  .modal{background:var(--sur);border:1px solid var(--bdr);border-radius:16px 16px 0 0;width:100%;max-width:560px;max-height:92vh;overflow-y:auto;padding:20px;box-shadow:0 -8px 40px rgba(0,0,0,.6)}
  @media(min-width:600px){.modal{border-radius:16px}}
  .mh{width:38px;height:4px;background:var(--bdr);border-radius:2px;margin:-2px auto 13px}
  .mt{font-family:'Playfair Display',serif;font-size:17px;margin-bottom:14px;display:flex;align-items:center;gap:8px}

  .detail-topbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
  .detail-topbar-actions{display:flex;gap:6px}
  .dh{display:flex;gap:13px;align-items:center;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--bdr)}
  .ddisc{border-radius:50%;display:flex;align-items:center;justify-content:center;position:relative;box-shadow:0 4px 18px rgba(0,0,0,.6);flex-shrink:0}
  .ddisc::after{content:'';position:absolute;inset:0;border-radius:50%;background:repeating-radial-gradient(circle at center,transparent 0,transparent 2px,rgba(255,255,255,.04) 2px,rgba(255,255,255,.04) 3px)}
  .ddl{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;text-align:center;z-index:1}
  .da{font-family:'Playfair Display',serif;font-size:18px}
  .dt{font-size:13px;color:var(--mut);margin-top:3px}
  .dr{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--bdr);font-size:13px}
  .dr:last-of-type{border-bottom:none}
  .dk{color:var(--mut);font-family:'DM Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:1px}

  .sec-header{display:flex;align-items:center;justify-content:space-between;margin:16px 0 10px}
  .sec-title{font-size:10px;color:var(--mut);text-transform:uppercase;letter-spacing:1.5px;font-family:'DM Mono',monospace;display:flex;align-items:center;gap:6px}

  .sl{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-bottom:2px}
  .slb{display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 6px;border-radius:9px;cursor:pointer;border:none;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;transition:all .15s;text-decoration:none}
  .slb-g{background:#1a2840;color:#6090e0;border:1px solid #2a4060}.slb-g:hover{background:#203050}
  .slb-w{background:#181e18;color:#70c070;border:1px solid #284028}.slb-w:hover{background:#202820}
  .slb-d{background:#201818;color:#e07050;border:1px solid #402828}.slb-d:hover{background:#2c2020}

  .price-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:4px}
  .price-loading{background:#1a1608;border:1px solid #3a3010;border-radius:10px;padding:14px;text-align:center;margin-top:8px}
  .price-loading p{color:var(--acc2);font-size:12px;margin-top:6px}
  .price-result{background:#1a1608;border:1px solid var(--gold);border-radius:10px;padding:14px;margin-top:8px;animation:fadeIn .3s ease}
  .price-range{display:flex;gap:16px;align-items:baseline;margin-bottom:8px;flex-wrap:wrap}
  .price-big{font-family:'Playfair Display',serif;font-size:22px;color:var(--gold)}
  .price-label{font-size:10px;color:var(--mut);text-transform:uppercase;letter-spacing:1px;font-family:'DM Mono',monospace}
  .price-verdict{font-size:12px;color:var(--txt);line-height:1.5;margin-bottom:8px}
  .price-factors{font-size:11px;color:var(--mut);line-height:1.6;white-space:pre-line}
  .price-disclaimer{font-size:10px;color:var(--mut);margin-top:8px;padding-top:8px;border-top:1px solid var(--bdr)}

  .log-empty{text-align:center;padding:16px;color:var(--mut);font-size:13px;background:var(--card);border-radius:10px;border:1px dashed var(--bdr)}
  .log-entry{background:var(--card);border:1px solid var(--bdr);border-radius:10px;padding:11px 13px;margin-bottom:7px;position:relative}
  .log-entry:last-child{margin-bottom:0}
  .log-date{font-size:10px;color:var(--acc2);font-family:'DM Mono',monospace;margin-bottom:4px;display:flex;align-items:center;gap:6px}
  .log-rig{font-size:10px;color:var(--mut);background:#1a1410;border:1px solid var(--bdr);border-radius:4px;padding:1px 6px;font-family:'DM Mono',monospace}
  .log-comment{font-size:13px;color:var(--txt);line-height:1.5}
  .log-del{position:absolute;top:8px;right:8px;background:none;border:none;color:var(--mut);cursor:pointer;padding:2px;opacity:0;transition:opacity .15s}
  .log-entry:hover .log-del{opacity:1}
  .add-play{background:#0e1a10;border:1px solid #1e3e20;border-radius:10px;padding:13px;margin-top:8px}
  .add-play-title{font-size:11px;color:var(--grn);text-transform:uppercase;letter-spacing:1px;font-family:'DM Mono',monospace;margin-bottom:10px;display:flex;align-items:center;gap:6px}

  .fg{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .ff{grid-column:1/-1}
  .fgrp{display:flex;flex-direction:column;gap:3px}
  .fl{font-size:10px;color:var(--mut);text-transform:uppercase;letter-spacing:1px;font-family:'DM Mono',monospace}
  .fi{background:var(--card);border:1px solid var(--bdr);border-radius:8px;color:var(--txt);padding:8px 10px;font-size:13px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s;width:100%}
  .fi:focus{border-color:var(--acc)}
  .fi::placeholder{color:var(--mut)}
  textarea.fi{resize:vertical;min-height:56px}
  .cbr{display:flex;align-items:center;gap:7px;cursor:pointer}
  .cbr input{accent-color:var(--acc);width:14px;height:14px;cursor:pointer}
  .ma{display:flex;gap:7px;margin-top:16px;justify-content:flex-end}

  .pz{border:2px dashed var(--bdr);border-radius:12px;padding:20px;text-align:center;cursor:pointer;transition:all .2s;background:var(--card)}
  .pz:hover{border-color:var(--acc);background:#1c1410}
  .pz p{font-size:12px;color:var(--mut);margin-top:6px}
  .pp{width:100%;border-radius:8px;margin-top:8px;max-height:160px;object-fit:contain}
  .air{background:#1a1410;border:1px solid var(--acc);border-radius:10px;padding:13px;text-align:center;margin:9px 0}
  .air p{color:var(--acc2);font-size:12px;margin-top:6px}
  .sp{width:24px;height:24px;border:3px solid var(--bdr);border-top-color:var(--acc);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto}
  .eb{background:#2a1515;border:1px solid #5a2020;border-radius:8px;padding:8px 12px;margin-top:7px;font-size:12px;color:#e08080}

  .lwrap{min-height:100vh;display:flex;align-items:center;justify-content:center}
  .lcard{background:var(--card);border:1px solid var(--bdr);border-radius:16px;padding:32px;width:100%;max-width:320px;text-align:center}
  .ldisc{width:64px;height:64px;border-radius:50%;margin:0 auto 15px;background:conic-gradient(var(--acc) 0deg 90deg,#1a1410 90deg 180deg,var(--acc2) 180deg 270deg,#1a1410 270deg 360deg);display:flex;align-items:center;justify-content:center;animation:spin 6s linear infinite}
  .lt{font-family:'Playfair Display',serif;font-size:22px;margin-bottom:3px}
  .ls{font-size:10px;color:var(--mut);letter-spacing:2px;text-transform:uppercase;font-family:'DM Mono',monospace;margin-bottom:20px}
  .empty{text-align:center;padding:44px 20px;color:var(--mut)}
  .empty h3{font-family:'Playfair Display',serif;font-size:16px;color:var(--txt);margin:10px 0 4px}
  @media(max-width:480px){.fg{grid-template-columns:1fr}.stats{gap:5px}}
`;

function Disc({ label, size=44, lblSize=20, fs=5 }) {
  const bg = labelColor(label);
  return (
    <div className="rd" style={{width:size,height:size,background:`radial-gradient(circle at center,#111 28%,${bg} 28% 52%,#111 52%)`}}>
      <div className="dl" style={{width:lblSize,height:lblSize,background:bg,color:"#fff",fontSize:fs}}>
        {(label||"?").slice(0,4).toUpperCase()}
      </div>
    </div>
  );
}

function AddPlayForm({ onAdd, onCancel, saving }) {
  const [rig, setRig] = useState("Attic");
  const [comment, setComment] = useState("");
  return (
    <div className="add-play">
      <div className="add-play-title"><IconPlay size={12}/> Log a Spin</div>
      <div className="fg">
        <div className="fgrp">
          <span className="fl">Rig</span>
          <select className="fi" value={rig} onChange={e=>setRig(e.target.value)}>
            {RIGS.map(r=><option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="fgrp ff">
          <span className="fl">Comments (optional)</span>
          <textarea className="fi" value={comment} onChange={e=>setComment(e.target.value)} placeholder="How did it sound? Pressing notes…" style={{minHeight:50}}/>
        </div>
      </div>
      <div style={{display:"flex",gap:7,marginTop:9,justifyContent:"flex-end"}}>
        <button className="btn btn-g btn-s" onClick={onCancel} disabled={saving}><IconX/> Cancel</button>
        <button className="btn btn-log btn-s" onClick={()=>onAdd({rig,comment:comment.trim()})} disabled={saving}>
          <IconCheck/>{saving?"Saving…":"Log It"}
        </button>
      </div>
    </div>
  );
}

function PriceSection({ record }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState(null);
  const q = encodeURIComponent(`${record.artist} ${record.title_a} ${record.label||""} 45`);
  const discogsMarket = `https://www.discogs.com/search/?q=${encodeURIComponent(record.artist+" "+record.title_a)}&type=release&format=Single`;

  const parseResult = (text) => ({
    range:   text.match(/RANGE:\s*(.+)/i)?.[1]?.trim()||"",
    median:  text.match(/MEDIAN:\s*(.+)/i)?.[1]?.trim()||"",
    verdict: text.match(/VERDICT:\s*(.+)/i)?.[1]?.trim()||"",
    factors: text.match(/FACTORS:\s*([\s\S]+?)(?=\n[A-Z]+:|$)/i)?.[1]?.trim()||"",
  });

  const getEstimate = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const text = await getPriceEstimate(record);
      if(!text) setError("No response — try again.");
      else setResult(parseResult(text));
    } catch { setError("API error — try again."); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="sec-header">
        <div className="sec-title"><IconDollar size={13}/> Value</div>
      </div>
      <div className="price-row">
        <button className="btn btn-price btn-s" onClick={getEstimate} disabled={loading}>
          <IconDollar size={13}/>{loading?"Estimating…":result?"Refresh":"AI Estimate"}
        </button>
        <a href={discogsMarket} target="_blank" rel="noopener noreferrer" className="btn btn-dis btn-s">
          <IconExternal size={13}/> Discogs Market
        </a>
      </div>
      {loading && <div className="price-loading"><div className="sp" style={{borderTopColor:"var(--gold)"}}/><p>Checking market value…</p></div>}
      {error && !loading && <div className="eb">⚠️ {error}</div>}
      {result && !loading && (
        <div className="price-result">
          <div className="price-range">
            <div><div className="price-label">Range</div><div className="price-big">{result.range}</div></div>
            {result.median && <div><div className="price-label">Median</div><div className="price-big" style={{fontSize:16,color:"var(--acc2)"}}>{result.median}</div></div>}
          </div>
          {result.verdict && <div className="price-verdict">{result.verdict}</div>}
          {result.factors && <div className="price-factors">{result.factors}</div>}
          <div className="price-disclaimer">⚠️ AI estimate — verify with Discogs sold listings.</div>
        </div>
      )}
    </div>
  );
}

function DetailModal({ record: r, onEdit, onDelete, onClose, isOwner, onRefresh }) {
  const [plays, setPlays]         = useState([]);
  const [loadingPlays, setLoadingPlays] = useState(true);
  const [showAddPlay, setShowAddPlay]   = useState(false);
  const [savingPlay, setSavingPlay]     = useState(false);

  const bg = labelColor(r.label);
  const q  = encodeURIComponent(`${r.artist} ${r.title_a}`);

  useEffect(() => {
    supabase.from("plays").select("*").eq("record_id", r.id).order("played_at", {ascending:true})
      .then(({data}) => { setPlays(data||[]); setLoadingPlays(false); });
  }, [r.id]);

  const handleAddPlay = async ({rig, comment}) => {
    setSavingPlay(true);
    const {data, error} = await supabase.from("plays").insert({record_id:r.id, rig, comment}).select().single();
    if(!error && data) setPlays(p=>[...p, data]);
    setSavingPlay(false);
    setShowAddPlay(false);
  };

  const handleDeletePlay = async (pid) => {
    await supabase.from("plays").delete().eq("id", pid);
    setPlays(p=>p.filter(x=>x.id!==pid));
  };

  const lastPlay = plays.length ? plays[plays.length-1] : null;
  const playCount = plays.length;

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="mh"/>
        <div className="detail-topbar">
          <button className="btn btn-g btn-s" onClick={onClose}><IconX size={13}/> Close</button>
          {isOwner && (
            <div className="detail-topbar-actions">
              <button className="btn btn-g btn-s" onClick={()=>{onEdit(r);onClose();}}><IconEdit size={13}/> Edit</button>
              <button className="btn btn-d btn-s" onClick={()=>{onDelete(r.id);onClose();}}><IconTrash size={13}/></button>
            </div>
          )}
        </div>

        <div className="dh">
          <div className="ddisc" style={{width:68,height:68,background:`radial-gradient(circle at center,#111 28%,${bg} 28% 52%,#111 52%)`}}>
            <div className="ddl" style={{width:30,height:30,background:bg,color:"#fff",fontSize:8}}>
              {(r.label||"?").slice(0,4).toUpperCase()}
            </div>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div className="da">{r.artist}</div>
            <div className="dt"><span style={{color:"var(--acc2)"}}>{r.title_a}</span>{r.title_b&&` / ${r.title_b}`}</div>
            <div className="rm" style={{marginTop:7}}>
              {r.genre      && <span className="tag tg">{r.genre}</span>}
              {r.condition  && <span className="tag tc">{r.condition}</span>}
              {r.picture_sleeve && <span className="tag ts">PIC SLV</span>}
              {playCount>0  && <span className="tag tp">▶ {playCount} spin{playCount!==1?"s":""}</span>}
            </div>
          </div>
        </div>

        {r.label   && <div className="dr"><span className="dk">Label</span><span>{r.label}</span></div>}
        {r.catalog && <div className="dr"><span className="dk">Catalog</span><span style={{fontFamily:"'DM Mono',monospace"}}>{r.catalog}</span></div>}
        {r.has_sleeve && <div className="dr"><span className="dk">Sleeve</span><span>{r.picture_sleeve?"Picture sleeve":"Plain sleeve"}</span></div>}
        {lastPlay  && <div className="dr"><span className="dk">Last Played</span><span style={{fontSize:12}}>{fmtDate(lastPlay.played_at)} · {lastPlay.rig}</span></div>}
        {r.notes   && <div className="dr"><span className="dk">Notes</span><span style={{textAlign:"right",maxWidth:"65%",fontSize:12}}>{r.notes}</span></div>}

        <div className="sec-header" style={{marginTop:14}}>
          <div className="sec-title">🔎 Search Online</div>
        </div>
        <div className="sl">
          <a href={`https://www.google.com/search?q=${q}+vinyl+45`} target="_blank" rel="noopener noreferrer" className="slb slb-g"><span style={{fontSize:16}}>🔍</span>Google</a>
          <a href={`https://en.wikipedia.org/w/index.php?search=${q}`} target="_blank" rel="noopener noreferrer" className="slb slb-w"><span style={{fontSize:16}}>📖</span>Wikipedia</a>
          <a href={`https://www.discogs.com/search/?q=${q}&type=release&format=Single`} target="_blank" rel="noopener noreferrer" className="slb slb-d"><span style={{fontSize:16}}>💿</span>Discogs</a>
        </div>

        <PriceSection record={r}/>

        <div className="sec-header">
          <div className="sec-title"><IconClock size={12}/> Play Log ({playCount})</div>
          {isOwner && !showAddPlay && (
            <button className="btn btn-log btn-s" onClick={()=>setShowAddPlay(true)}><IconPlay size={12}/> Log a Spin</button>
          )}
        </div>

        {showAddPlay && <AddPlayForm onAdd={handleAddPlay} onCancel={()=>setShowAddPlay(false)} saving={savingPlay}/>}

        {loadingPlays && <div style={{textAlign:"center",padding:"16px",color:"var(--mut)",fontSize:13}}>Loading plays…</div>}

        {!loadingPlays && plays.length===0 && !showAddPlay && (
          <div className="log-empty">No spins logged yet — hit "Log a Spin" after you drop the needle</div>
        )}

        {[...plays].reverse().map(p=>(
          <div key={p.id} className="log-entry">
            <div className="log-date">
              <IconClock size={11}/>{fmtDateTime(p.played_at)}
              {p.rig && <span className="log-rig">{p.rig}</span>}
            </div>
            {p.comment && <div className="log-comment">{p.comment}</div>}
            {isOwner && <button className="log-del" onClick={()=>handleDeletePlay(p.id)} title="Delete"><IconX size={12}/></button>}
          </div>
        ))}
        <div style={{height:8}}/>
      </div>
    </div>
  );
}

function RecordModal({ record, onSave, onClose }) {
  const isEdit = !!record?.id;
  const [form, setForm] = useState(record||{artist:"",title_a:"",title_b:"",label:"",catalog:"",genre:"",condition:"VG",picture_sleeve:false,has_sleeve:false,notes:""});
  const [preview, setPreview] = useState(null);
  const [reading, setReading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState(null);
  const fileRef = useRef();
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleFile = useCallback(async (file) => {
    if(!file) return; setErr(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      setPreview(e.target.result);
      const b64 = e.target.result.split(",")[1];
      setReading(true);
      try {
        const res = await readLabelWithAI(b64);
        if(!res||!res.artist) setErr("Couldn't read label — fill in below.");
        else setForm(f=>({...f,...Object.fromEntries(Object.entries(res).filter(([,v])=>v))}));
      } catch { setErr("API error — fill in manually below."); }
      finally { setReading(false); }
    };
    reader.onerror=()=>{ setErr("Couldn't read photo."); setReading(false); };
    reader.readAsDataURL(file);
  },[]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="mh"/>
        <div className="mt"><IconVinyl/>{isEdit?"Edit Record":"Add to the Vault"}</div>
        {!isEdit && (
          <>
            <div className="pz" onClick={()=>fileRef.current.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();handleFile(e.dataTransfer.files[0])}}>
              <IconCamera/><p>Tap to snap or drop a label photo — AI reads it for you</p>
              {preview && <img src={preview} className="pp" alt="label"/>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
            {reading && <div className="air"><div className="sp"/><p>Reading the label…</p></div>}
            {err && !reading && <div className="eb">⚠️ {err}</div>}
          </>
        )}
        <div className="fg" style={{marginTop:12}}>
          <div className="fgrp ff"><span className="fl">Artist</span><input className="fi" value={form.artist} onChange={e=>set("artist",e.target.value)} placeholder="Artist name"/></div>
          <div className="fgrp"><span className="fl">A-Side</span><input className="fi" value={form.title_a} onChange={e=>set("title_a",e.target.value)} placeholder="A-side"/></div>
          <div className="fgrp"><span className="fl">B-Side</span><input className="fi" value={form.title_b} onChange={e=>set("title_b",e.target.value)} placeholder="B-side"/></div>
          <div className="fgrp"><span className="fl">Label</span><input className="fi" value={form.label} onChange={e=>set("label",e.target.value)} placeholder="Arvee, ATCO…"/></div>
          <div className="fgrp"><span className="fl">Catalog #</span><input className="fi" value={form.catalog} onChange={e=>set("catalog",e.target.value)} placeholder="A-595"/></div>
          <div className="fgrp"><span className="fl">Genre</span>
            <select className="fi" value={form.genre} onChange={e=>set("genre",e.target.value)}>
              <option value="">— select —</option>{GENRES.map(g=><option key={g}>{g}</option>)}
            </select></div>
          <div className="fgrp"><span className="fl">Condition</span>
            <select className="fi" value={form.condition} onChange={e=>set("condition",e.target.value)}>
              {CONDITIONS.map(c=><option key={c}>{c}</option>)}
            </select></div>
          <div className="fgrp ff" style={{flexDirection:"row",gap:16}}>
            <label className="cbr"><input type="checkbox" checked={form.has_sleeve} onChange={e=>set("has_sleeve",e.target.checked)}/><span style={{fontSize:13}}>Has sleeve</span></label>
            <label className="cbr"><input type="checkbox" checked={form.picture_sleeve} onChange={e=>set("picture_sleeve",e.target.checked)}/><span style={{fontSize:13}}>Picture sleeve</span></label>
          </div>
          <div className="fgrp ff"><span className="fl">Notes</span><textarea className="fi" value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Label damage, promo, colored vinyl…"/></div>
        </div>
        <div className="ma">
          <button className="btn btn-g" onClick={onClose} disabled={saving}><IconX/> Cancel</button>
          <button className="btn btn-p" onClick={handleSave} disabled={reading||saving}>
            <IconCheck/>{saving?"Saving…":isEdit?"Save":"Add to Vault"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Login({ onLogin }) {
  const [pw,setPw]=useState(""); const [err,setErr]=useState(false);
  const go=()=>{ if(pw===OWNER_PASSWORD) onLogin(); else{setErr(true);setTimeout(()=>setErr(false),1400);} };
  return (
    <div className="lwrap"><div className="lcard">
      <div className="ldisc"><div style={{width:22,height:22,borderRadius:"50%",background:"#111"}}/></div>
      <div className="lt">The 45 Vault</div><div className="ls">Owner Access</div>
      <div className="fgrp" style={{textAlign:"left",marginBottom:10}}>
        <input className="fi" type="password" placeholder="Password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} style={err?{borderColor:"#e05555"}:{}} autoFocus/>
      </div>
      <button className="btn btn-p" style={{width:"100%"}} onClick={go}><IconLock/> Enter the Vault</button>
    </div></div>
  );
}

export default function App() {
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [fGenre, setFGenre]     = useState("");
  const [fCond, setFCond]       = useState("");
  const [sort, setSort]         = useState("Artist A-Z");
  const [modal, setModal]       = useState(null);
  const [detail, setDetail]     = useState(null);
  const [shuffle, setShuffle]   = useState(null);
  const [isOwner, setIsOwner]   = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const highlightRef = useRef(null);

  // load records
  useEffect(() => {
    supabase.from("records").select("*").order("created_at", {ascending:false})
      .then(({data}) => { setRecords(data||[]); setLoading(false); });
  }, []);

  // stats
  const genreCount={}, labelCount={};
  let totalPlays=0;
  records.forEach(r=>{
    if(r.genre) genreCount[r.genre]=(genreCount[r.genre]||0)+1;
    if(r.label) labelCount[r.label]=(labelCount[r.label]||0)+1;
  });
  const topGenre = Object.entries(genreCount).sort((a,b)=>b[1]-a[1])[0];

  const filtered = records.filter(r=>{
    const q=search.toLowerCase();
    return (!q||[r.artist,r.title_a,r.title_b,r.label,r.catalog,r.notes].some(f=>(f||"").toLowerCase().includes(q)))
      &&(!fGenre||r.genre===fGenre)&&(!fCond||r.condition===fCond);
  }).sort((a,b)=>{
    if(sort==="Artist A-Z") return (a.artist||"").localeCompare(b.artist||"");
    if(sort==="Artist Z-A") return (b.artist||"").localeCompare(a.artist||"");
    if(sort==="Label A-Z")  return (a.label||"").localeCompare(b.label||"");
    if(sort==="Genre")      return (a.genre||"").localeCompare(b.genre||"");
    if(sort==="Condition")  return CONDITIONS.indexOf(a.condition)-CONDITIONS.indexOf(b.condition);
    return b.id-a.id;
  });

  const doShuffle = () => {
    if(!records.length) return;
    const pick=records[Math.floor(Math.random()*records.length)];
    setShuffle(pick);
    setTimeout(()=>highlightRef.current?.scrollIntoView({behavior:"smooth",block:"center"}),100);
  };

  const save = async (form) => {
    if(form.id) {
      const {data} = await supabase.from("records").update({
        artist:form.artist,title_a:form.title_a,title_b:form.title_b,
        label:form.label,catalog:form.catalog,genre:form.genre,
        condition:form.condition,picture_sleeve:form.picture_sleeve,
        has_sleeve:form.has_sleeve,notes:form.notes
      }).eq("id",form.id).select().single();
      if(data) setRecords(rs=>rs.map(r=>r.id===form.id?data:r));
    } else {
      const {data} = await supabase.from("records").insert({
        artist:form.artist,title_a:form.title_a,title_b:form.title_b,
        label:form.label,catalog:form.catalog,genre:form.genre,
        condition:form.condition,picture_sleeve:form.picture_sleeve,
        has_sleeve:form.has_sleeve,notes:form.notes
      }).select().single();
      if(data) setRecords(rs=>[data,...rs]);
    }
    setModal(null);
  };

  const del = async (id) => {
    if(!confirm("Remove from Vault?")) return;
    await supabase.from("records").delete().eq("id",id);
    setRecords(rs=>rs.filter(r=>r.id!==id));
    setShuffle(s=>s?.id===id?null:s);
  };

  if(showLogin) return <Login onLogin={()=>{setIsOwner(true);setShowLogin(false);}}/>;

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="header">
          <div className="logo">
            <div className="logo-icon"><div style={{width:12,height:12,borderRadius:"50%",background:"#111"}}/></div>
            <div><div className="logo-text">The 45 Vault</div><div className="logo-sub">MPH Collection</div></div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"flex-end"}}>
            <button className="btn btn-shuf btn-s" onClick={doShuffle}><IconShuffle size={13}/> Shuffle</button>
            {isOwner&&<button className="btn btn-g btn-s" onClick={()=>exportCSV(records)}><IconDownload size={13}/> CSV</button>}
            {isOwner?(
              <>
                <button className="btn btn-p btn-s" onClick={()=>setModal("add")}><IconPlus/> Add</button>
                <button className="btn btn-g btn-s" onClick={()=>setIsOwner(false)}><IconLock/></button>
              </>
            ):(
              <button className="btn btn-g btn-s" onClick={()=>setShowLogin(true)}><IconLock/></button>
            )}
          </div>
        </div>

        <div className="stats">
          <div className="stat"><div className="stat-num">{records.length}</div><div className="stat-lbl">Records</div></div>
          <div className="stat"><div className="stat-num">{Object.keys(labelCount).length}</div><div className="stat-lbl">Labels</div></div>
          <div className="stat">
            <div className="stat-num">{topGenre?topGenre[1]:0}</div>
            <div className="stat-lbl">Top Genre</div>
            {topGenre&&<div className="stat-sub">{topGenre[0]}</div>}
          </div>
          <div className="stat"><div className="stat-num">{records.filter(r=>r.picture_sleeve).length}</div><div className="stat-lbl">Pic Sleeves</div></div>
        </div>

        {shuffle&&(
          <div className="shuffle-banner">
            <div className="sb-disc" style={{width:50,height:50,background:`radial-gradient(circle at center,#111 28%,${labelColor(shuffle.label)} 28% 52%,#111 52%)`}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:labelColor(shuffle.label),color:"#fff",fontSize:6,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",zIndex:1}}>
                {(shuffle.label||"?").slice(0,4).toUpperCase()}
              </div>
            </div>
            <div className="sb-info">
              <div className="sb-label">🎲 Now Spinning</div>
              <div className="sb-artist">{shuffle.artist}</div>
              <div className="sb-title"><span style={{color:"var(--acc2)"}}>{shuffle.title_a}</span>{shuffle.title_b&&` / ${shuffle.title_b}`}</div>
            </div>
            <div className="sb-actions">
              <button className="btn btn-p btn-s" onClick={()=>setDetail(shuffle)}>View</button>
              <button className="btn btn-shuf btn-s" onClick={doShuffle}>Again</button>
              <button className="btn btn-g btn-s" onClick={()=>setShuffle(null)}><IconX size={12}/></button>
            </div>
          </div>
        )}

        <div className="toolbar">
          <div className="sw"><IconSearch/><input className="si" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
          <select value={fGenre} onChange={e=>setFGenre(e.target.value)}>
            <option value="">All Genres</option>{GENRES.map(g=><option key={g}>{g}</option>)}
          </select>
          <select value={fCond} onChange={e=>setFCond(e.target.value)}>
            <option value="">All Cond.</option>{CONDITIONS.map(c=><option key={c}>{c}</option>)}
          </select>
          <select value={sort} onChange={e=>setSort(e.target.value)}>
            {SORT_OPTIONS.map(s=><option key={s}>{s}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="loading-wrap">
            <div className="sp" style={{width:32,height:32}}/>
            <p>Loading the Vault…</p>
          </div>
        ) : filtered.length===0 ? (
          <div className="empty">
            <div style={{opacity:.3}}><IconVinyl size={40}/></div>
            <h3>{records.length===0?"The Vault is empty":"No matches"}</h3>
            <p>{records.length===0?"Add your first 45 to get started":"Try a different search or filter"}</p>
          </div>
        ) : (
          <div className="records-grid">
            {filtered.map(r=>{
              const isH=shuffle?.id===r.id;
              return (
                <div key={r.id} ref={isH?highlightRef:null} className={cls("rc",isH&&"highlighted")} onClick={()=>setDetail(r)}>
                  <Disc label={r.label}/>
                  <div className="ri">
                    <div className="ra">{r.artist||"Unknown Artist"}</div>
                    <div className="rt"><span style={{color:"var(--acc2)"}}>{r.title_a||"—"}</span>{r.title_b&&` / ${r.title_b}`}</div>
                    <div className="rm">
                      {r.genre     &&<span className="tag tg">{r.genre}</span>}
                      {r.condition &&<span className="tag tc">{r.condition}</span>}
                      {r.label     &&<span className="tag tl">{r.label}</span>}
                    </div>
                  </div>
                  <div style={{color:"var(--mut)"}}><IconChevron/></div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {detail&&<DetailModal record={detail} isOwner={isOwner} onEdit={r=>setModal(r)} onDelete={del} onClose={()=>setDetail(null)}/>}
      {(modal==="add"||(modal&&modal.id))&&<RecordModal record={modal==="add"?null:modal} onSave={save} onClose={()=>setModal(null)}/>}
    </>
  );
}
