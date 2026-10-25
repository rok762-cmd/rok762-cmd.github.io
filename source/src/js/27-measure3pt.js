/* ---------- 3점 실측 (상·중·하 / 좌·중·우 / 대각선) + 블루투스 레이저 ---------- */
const TP_SLOTS=[['w',0,'가로 위'],['w',1,'가로 가운데'],['w',2,'가로 아래'],['h',0,'높이 왼쪽'],['h',1,'높이 가운데'],['h',2,'높이 오른쪽'],['d',0,'대각선 ↗'],['d',1,'대각선 ↖']];
function tpStat(f,j=job){const w=tpVals(f,'w'),h=tpVals(f,'h'),d=tpVals(f,'d');const st={w,h,d,wd:w.length>1?Math.max(...w)-Math.min(...w):0,hd:h.length>1?Math.max(...h)-Math.min(...h):0,dd:d.length===2?Math.abs(d[0]-d[1]):0,sq:0};
  if(d.length===2&&w.length&&h.length){const W=Math.min(...w),H=Math.min(...h),ex=Math.hypot(W,H);st.sq=Math.round(Math.max(...d)-ex)}return st}
function tpIssues(j=job){const out=[],P=catalog.prices;j.faces.forEach(f=>{if(f.key==='I'||!f.tp)return;const s_=tpStat(f,j),nm=FACE_NAME(f.key);if(!s_.w.length&&!s_.h.length)return;
  const cap=j.finish==='filler'?2*Math.max(+P.fillerW||0,+f.fw||0):(+P.fullSide||0);
  if(s_.wd>=10)out.push({lvl:s_.wd>cap?'warn':'ok',msg:`${nm} 가로 위·아래 차이 ${s_.wd}mm${s_.wd>cap?` — 좌우 여유 ${cap}mm보다 커서 틈이 보입니다 · 휠라 마감으로 바꾸거나 휠라를 넓히세요`:` — 최소값 ${Math.min(...s_.w)}로 만들고 휠라로 흡수`}`});
  if(s_.hd>=10)out.push({lvl:s_.hd>(+P.moldingH||0)&&j.finish==='filler'||j.finish!=='filler'&&s_.hd>(+P.fullTop||0)?'warn':'ok',msg:`${nm} 높이 좌·우 차이 ${s_.hd}mm (천장·바닥 기울기) — 최소값 ${Math.min(...s_.h)} 기준`});
  if(s_.dd>=10)out.push({lvl:'warn',msg:`${nm} 대각선 차이 ${s_.dd}mm — 벽 모서리가 직각이 아닙니다 · 끝 휠라는 현장 재단`});})
  return out}
function tpSummary(){const fs=job.faces.filter(f=>f.key!=='I'),n=fs.reduce((a,f)=>a+tpVals(f,'w').length+tpVals(f,'h').length+tpVals(f,'d').length,0),is=tpIssues().filter(x=>x.lvl==='warn').length;return`${n?`${n}곳 입력`:'안 함'}${is?` · 확인 ${is}`:''}${LZ.dev?' · 🔵 레이저':''}`}
function tpUI(){const fs=job.faces.filter(f=>f.key!=='I');const fi=Math.max(0,fs.indexOf(job.faces[job.fi]));const f=fs[fi]||fs[0];if(!f)return'<p class="hint">아일랜드만 있는 현장은 해당 없음</p>';const tp=f.tp||{},st=tpStat(f);
  const inp=(k,i,l)=>`<label class="dim-box" style="min-width:0"><span class="k">${l}</span><input inputmode="numeric" data-change="tp" data-face="${f.key}" data-k="${k}" data-i="${i}" data-tp="${k}${i}" value="${tp[k]?.[i]||''}" placeholder="mm" aria-label="${FACE_NAME(f.key)} ${l} mm"></label>`;
  const bt=!!navigator.bluetooth;
  return`${fs.length>1?`<div class="seg" role="group" aria-label="면" style="margin-bottom:8px">${fs.map(x=>`<button type="button" data-act="face" data-i="${job.faces.indexOf(x)}" aria-pressed="${x===f}">${FACE_NAME(x.key)}</button>`).join('')}</div>`:''}
    <p class="hint" style="margin:0 0 8px">벽 끝~벽 끝 가로를 위·가운데·아래, 바닥~천장 높이를 왼쪽·가운데·오른쪽에서 재면 <b>가장 작은 값</b>으로 만들고, 차이는 휠라·몰딩으로 흡수합니다. 대각선 두 개를 재면 벽이 직각인지 봅니다.</p>
    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px">${TP_SLOTS.slice(0,6).map(([k,i,l])=>inp(k,i,l)).join('')}</div>
    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin-top:6px">${TP_SLOTS.slice(6).map(([k,i,l])=>inp(k,i,l)).join('')}</div>
    <div class="make" style="margin:8px 0 0">${st.w.length?`가로 최소 <b>${Math.min(...st.w)}</b>${st.wd?` (차이 ${st.wd})`:''}`:''}${st.h.length?` · 높이 최소 <b>${Math.min(...st.h)}</b>${st.hd?` (차이 ${st.hd})`:''}`:''}${st.d.length===2?` · 대각선 차이 ${st.dd}${st.sq?` · 직각 대비 ${st.sq>0?'+':''}${st.sq}`:''}`:''}${(job.finish==='filler'&&f.fw)?` · 휠라 ${f.fw}mm로 자동 확대`:''}</div>
    ${tpIssues().filter(x=>x.lvl==='warn').map(x=>`<p class="make" style="margin:4px 0 0;color:var(--warn)">${esc(x.msg)}</p>`).join('')}
    ${st.wd>=10&&job.finish!=='filler'&&!isMD(job.cat)?'<button type="button" class="btn sm" data-act="finish" data-v="filler" style="margin-top:6px">휠라 + 상몰딩 마감으로 바꾸기</button>':''}
    <div class="toolbar" style="margin:10px 0 0;align-items:center;flex-wrap:wrap">${f.tp?'<button type="button" class="btn sm quiet" data-act="tp-clear">이 면 3점 값 지우기</button>':''}
      ${bt?(LZ.dev?`<span class="pill" style="background:#E6F0FF;color:#1E56D0">🔵 ${esc(LZ.name)} 연결됨</span><button type="button" class="btn sm quiet" data-act="lz-off">연결 끊기</button>`:`<button type="button" class="btn sm" data-act="lz-on">🔵 레이저 거리측정기 연결</button>`):''}
      <span class="hint" style="margin:0">${bt?(LZ.dev?'칸을 누르고 레이저 버튼을 누르면 값이 들어가고 다음 칸으로 넘어갑니다':'레이카 DISTO·보쉬 GLM(블루투스) 등 지원 · 처음 한 번 짝 맞추기'):'이 브라우저는 블루투스 연결을 못 합니다 · 안드로이드 Chrome에서 앱으로 열거나, 아이패드는 Bluefy 브라우저를 쓰세요'}</span></div>`}
function tpSet(face,k,i,v){const f=job.faces.find(x=>x.key===face);if(!f)return;f.tp=f.tp||{};f.tp[k]=f.tp[k]||[];f.tp[k][i]=v>0?Math.round(v):'';if(!['w','h','d'].some(q=>(f.tp[q]||[]).some(x=>+x>0)))delete f.tp;
  recomputeDims();const st=tpStat(f),P=catalog.prices,need=Math.ceil((st.wd/2+10)/5)*5;if(job.finish==='filler'&&st.wd>=10&&need>(+P.fillerW||0))f.fw=need;else delete f.fw;}
/* 블루투스 레이저: 레이카 DISTO · 보쉬 GLM · 일반 UART(FFE0 / Nordic) */
const LZ={dev:null,name:'',last:0};
const LZ_SVC={disto:'3ab10100-f831-4395-b29d-570977d5bf94',bosch:'02a6c0d0-0451-4000-b000-fb3210111989',ffe0:0xffe0,nus:'6e400001-b5a3-f393-e0a9-e50e24dcca9e'};
function lzParse(dv,kind){try{const n=dv.byteLength,b=new Uint8Array(dv.buffer,dv.byteOffset,n);
  if(kind==='bosch'){if(n>=11&&b[0]===0xC0&&b[1]===0x55){const m=dv.getFloat32(7,true);return m>0&&m<300?m*1000:null}return null}
  if(kind==='disto'&&n===4){const m=dv.getFloat32(0,true);return m>0&&m<300?m*1000:null}
  const t=new TextDecoder().decode(b).replace(/[^\x20-\x7E]/g,' ');const mm=t.match(/(\d+(?:[.,]\d+)?)\s*(mm|cm|m|ft|in)?/i);if(mm){let v=+mm[1].replace(',','.');const u=(mm[2]||'').toLowerCase();if(u==='m'||(!u&&v<50))v*=1000;else if(u==='cm')v*=10;else if(u==='ft')v*=304.8;else if(u==='in')v*=25.4;return v>0?v:null}
  if(n===4){const m=dv.getFloat32(0,true);if(m>0&&m<300)return m*1000}return null}catch(e){return null}}
function lzInput(mm){mm=Math.round(mm);if(!(mm>0))return;const now=Date.now();if(now-LZ.last<300)return;LZ.last=now;
  let el=document.activeElement;if(!(el instanceof HTMLInputElement&&(el.inputMode==='numeric'||el.type==='number')))el=[...document.querySelectorAll('input[data-tp]')].find(x=>!x.value)||null;
  if(!el){toast(`레이저 ${mm}mm — 넣을 칸을 먼저 누르세요`);return}const tpk=el.dataset.tp;el.value=mm;el.dispatchEvent(new Event('change',{bubbles:true}));toast(`📏 ${mm}mm 입력`);
  if(tpk){setTimeout(()=>{const all=[...document.querySelectorAll('input[data-tp]')],i=all.findIndex(x=>x.dataset.tp===tpk),nx=all.slice(i+1).find(x=>!x.value)||all.find(x=>!x.value);nx?.focus()},80)}}
async function lzConnect(){if(!navigator.bluetooth){toast('이 브라우저는 블루투스를 지원하지 않습니다');return}
  try{const dev=await navigator.bluetooth.requestDevice({acceptAllDevices:true,optionalServices:Object.values(LZ_SVC)});const gatt=await dev.gatt.connect();let ok=0;
    for(const[kind,uuid]of Object.entries(LZ_SVC)){let svc;try{svc=await gatt.getPrimaryService(uuid)}catch(e){continue}
      const chs=await svc.getCharacteristics().catch(()=>[]);for(const ch of chs){if(!(ch.properties.notify||ch.properties.indicate))continue;try{await ch.startNotifications();ch.addEventListener('characteristicvaluechanged',e=>{const v=lzParse(e.target.value,kind);if(v)lzInput(v)});ok++}catch(e){}}
      if(kind==='bosch'){const w=chs.find(c=>c.properties.write||c.properties.writeWithoutResponse);try{await w?.writeValue(new Uint8Array([0xC0,0x55,0x02,0x01,0x00,0x1A]))}catch(e){}}}
    if(!ok){toast('이 기기에서 거리 값을 받을 수 없습니다 (지원하지 않는 기종)');try{gatt.disconnect()}catch(e){}return}
    LZ.dev=dev;LZ.name=dev.name||'레이저';dev.addEventListener('gattserverdisconnected',()=>{LZ.dev=null;toast('레이저 연결이 끊겼습니다');if(step===1)renderStage()});toast(`${LZ.name} 연결됨 · 칸을 누르고 측정하세요`);openSec.add('tp');render()}
  catch(e){if(e?.name!=='NotFoundError')toast('레이저를 연결하지 못했습니다: '+(e?.message||''))}}
Object.assign(ACT,{'lz-on':()=>lzConnect(),'lz-off':()=>{try{LZ.dev?.gatt?.disconnect()}catch(e){}LZ.dev=null;render()},'tp-clear':()=>{const f=job.faces[job.fi];if(f&&f.key!=='I'){delete f.tp;delete f.fw;recomputeDims()}render()}});
Object.assign(ACT,{'backup-all':()=>backupAll().catch(e=>toast('백업하지 못했습니다')),'send-tablet':()=>sendToTablet().catch(e=>toast('보내지 못했습니다')),'sy-inbox':()=>syInbox(true)});
Object.assign(ACT,{work:b=>{setWork(b.dataset.v);if(WORK==='field'&&step===4&&!['customer','proposal','quote'].includes(outTab))outTab='customer';render()},present:()=>openPresent(),'pres-close':()=>closePresent(),'pres-step':b=>{PRES.i+=+b.dataset.d;presDraw()},'pres-go':b=>{PRES.i=+b.dataset.i;presDraw()}});
{const GATE={'srv-send':'발송','ex-make-pdf':'제작지시서를 저장','ex-make-png':'제작지시서를 저장','ex-draw-pdf':'도면을 저장','ex-draw-png':'도면을 저장','ex-cut-csv':'부재목록을 저장','fx-door-pdf':'도어 발주서를 저장','fx-door-csv':'도어 발주서를 저장','fx-panel-csv':'재단 목록을 저장','fx-panel-pdf':'재단 목록을 저장','fx-hw-csv':'하드웨어 목록을 저장','fx-hw-pdf':'하드웨어 목록을 저장','fx-all-pdf':'공장 출력을 저장'};
  Object.entries(GATE).forEach(([k,w])=>{const o=ACT[k];if(o)ACT[k]=(b,e)=>{if(mode!=='measure'||gateOK(b,w))return o(b,e)}})}
