/* ---------- export ---------- */
const APP=!!window.SILCHEUK_APP,LOCAL=!!window.SILCHEUK_OFFLINE||APP;
const LOCAL_DL={save:async({filename,data})=>{const blob=data instanceof Blob?data:new Blob([data],{type:/\.json$/.test(filename)?'application/json':/\.csv$/.test(filename)?'text/csv':'application/octet-stream'});const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)}};
function localDB(){const KEY='silcheuk-localdb';let mem={},mode='mem',idb=null;const subs=[];
  const ready=(async()=>{try{idb=await new Promise((res,rej)=>{const r=indexedDB.open('silcheuk',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
      mem=await new Promise((res,rej)=>{const out={},c=idb.transaction('kv').objectStore('kv').openCursor();c.onsuccess=()=>{const cur=c.result;if(cur){out[cur.key]=cur.value;cur.continue()}else res(out)};c.onerror=()=>rej(c.error)});mode='idb'}
    catch(e){idb=null;try{mem=JSON.parse(localStorage.getItem(KEY)||'{}');localStorage.setItem(KEY+'-t','1');mode='ls'}catch(e2){mem={};mode='mem'}}})();
  const flush=async(path,val)=>{if(mode==='idb')await new Promise((res,rej)=>{const t=idb.transaction('kv','readwrite'),s=t.objectStore('kv');val===undefined?s.delete(path):s.put(val,path);t.oncomplete=res;t.onerror=()=>rej(t.error)});else if(mode==='ls')localStorage.setItem(KEY,JSON.stringify(mem))};
  const notify=()=>subs.forEach(s=>{try{s()}catch(e){}});const cp=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
  const docRef=path=>({id:path.split('/').pop(),get:async()=>{await ready;const v=mem[path];return{exists:v!==undefined,id:path.split('/').pop(),data:()=>cp(v)}},
    set:async v=>{await ready;mem[path]=cp(v);await flush(path,mem[path]);notify()},update:async v=>{await ready;mem[path]={...(mem[path]||{}),...cp(v)};await flush(path,mem[path]);notify()},
    delete:async()=>{await ready;delete mem[path];await flush(path);notify()}});
  const query=(col,ord,lim)=>({orderBy:(f,d)=>query(col,[f,d],lim),limit:n=>query(col,ord,n),onSnapshot:(cb)=>{const run=()=>{let ds=Object.keys(mem).filter(k=>k.startsWith(col+'/')&&k.split('/').length===2).map(k=>({id:k.slice(col.length+1),v:mem[k]}));
      if(ord)ds.sort((a,b)=>((a.v[ord[0]]||0)-(b.v[ord[0]]||0))*(ord[1]==='desc'?-1:1));if(lim)ds=ds.slice(0,lim);cb({docs:ds.map(d=>({id:d.id,data:()=>cp(d.v)}))})};subs.push(run);ready.then(run);return()=>{}}});
  return{collection:c=>({doc:id=>docRef(c+'/'+id),...query(c)}),doc:p=>docRef(p),ready,mode:()=>mode,dump:async()=>{await ready;return cp(mem)}}}
let DL=null;
(async()=>{try{DL=LOCAL?LOCAL_DL:window.claude?.use?await window.claude.use('downloads'):null}catch(e){DL=null}if(step===4)renderStage()})();
function svgToCanvas(svg,w,h,scale=2,clear=false){return new Promise((res,rej)=>{const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));const img=new Image();
  img.onload=()=>{const c=document.createElement('canvas');c.width=Math.round(w*scale);c.height=Math.round(h*scale);const x=c.getContext('2d');if(!clear){x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height)}x.drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);res(c)};
  img.onerror=e=>{URL.revokeObjectURL(url);rej(e)};img.src=url})}
async function saveFile(name,data){if(!DL){toast('이 화면에서는 파일 저장을 쓸 수 없습니다. claude.ai에서 열어주세요.');return}
  try{await DL.save({filename:name,data});toast('저장했습니다');return true}catch(e){if(e?.code==='declined')return;if(e?.code==='rate_limited')toast('잠시 후 다시 눌러주세요');else toast('저장하지 못했습니다')}}
async function savePNG(name,svg,w,h,scale=2){try{const c=await svgToCanvas(svg,w,h,scale);c.toBlob(b=>saveFile(name,b),'image/png')}catch(e){toast('이미지를 만들지 못했습니다')}}
let paperSel=(()=>{try{return localStorage.getItem('silcheuk-paper')||'A3'}catch(e){return'A3'}})();
const PAPERSEL=()=>paperSel;const PAPER={A3:[420,297],A4:[297,210]};
async function savePDF(name,pages,force){const paper=force||PAPERSEL();try{const blob=await buildPDF(pages,paper);if(!blob)return;await saveFile(name.replace(/\.pdf$/,`_${paper}.pdf`),blob)}catch(e){toast('PDF를 만들지 못했습니다')}}
async function buildPDF(pages,paper,q=.92){if(!window.jspdf){toast('PDF 도구를 불러오지 못했습니다. PNG로 저장해 주세요.');return null}
  {const{jsPDF}=window.jspdf;let pdf;const[PL,PS]=PAPER[paper]||PAPER.A3,M=8,sc=paper==='A3'?2.6:2;
    const add=(o)=>{const f=o==='l'?[PL,PS]:[PS,PL];if(!pdf)pdf=new jsPDF({orientation:o,unit:'mm',format:paper.toLowerCase()});else pdf.addPage(paper.toLowerCase(),o);return f};
    for(const p of pages){const c=await svgToCanvas(p.svg,p.w,p.h,sc),o=p.w>=p.h?'l':'p',[pw,ph]=o==='l'?[PL,PS]:[PS,PL],aw=pw-2*M,ah=ph-2*M;
      const sw=aw/p.w,sheetPx=ah/sw;
      if(p.h<=sheetPx*1.15){const s=Math.min(aw/p.w,ah/p.h),dw=p.w*s,dh=p.h*s;add(o);pdf.addImage(c.toDataURL('image/jpeg',q),'JPEG',(pw-dw)/2,(ph-dh)/2,dw,dh)}
      else{const n=Math.ceil(p.h/sheetPx),step=p.h/n;for(let k=0;k<n;k++){const y0=Math.round(k*step*sc),y1=Math.round(Math.min(p.h,(k+1)*step)*sc),cc=document.createElement('canvas');cc.width=c.width;cc.height=y1-y0;const x=cc.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,cc.width,cc.height);x.drawImage(c,0,y0,c.width,y1-y0,0,0,c.width,y1-y0);
        add(o);const dh=(y1-y0)/sc*sw;pdf.addImage(cc.toDataURL('image/jpeg',q),'JPEG',M,M,aw,dh);pdf.setFontSize(9);pdf.setTextColor(120);pdf.text(`${k+1} / ${n}`,pw-M,ph-3,{align:'right'})}}}
    return pdf.output('blob')}}
const paperSeg=()=>`<div class="seg" aria-label="용지 크기">${['A3','A4'].map(k=>`<button type="button" data-act="paper" data-v="${k}" aria-pressed="${paperSel===k}">${k}</button>`).join('')}</div>`;

/* ---------- 견적서 보내기 (이메일 · 카톡/문자) ---------- */
let MCP=null;(async()=>{try{MCP=window.claude?.use?await window.claude.use('mcp'):null}catch(e){MCP=null}})();
const b64=blob=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]);r.onerror=rej;r.readAsDataURL(blob)});
const isEmail=s=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
let SEND=null;
function quoteDoc(){const q=quotePage(),tot=siteGrand(),c=job.customer,nm0=(c.name||'고객').replace(/^예시\)\s*/,'').trim(),nm=/님$/.test(nm0)?nm0:nm0+' 님';
  return{pages:quotePages(),file:fname('견적서.pdf').replace(/\.pdf$/,'_A4.pdf'),to:c.email||'',phone:c.phone||'',
    subject:`[${catalog.company.name}] ${siteAll().length>1?siteAll().map(it=>itemName(it)).join('·'):CATS[job.cat].name} 견적서 · ${nm}`,
    text:`${nm} 안녕하세요, ${catalog.company.name}입니다.\n요청하신 ${[...(siteAll().length>1?siteAll().map(it=>itemName(it)):[CATS[job.cat].name]),...bathSite().map(b=>b.name)].join(', ')} 견적서를 보내드립니다.\n\n· 현장: ${c.addr||'-'}\n· 합계: ${won(tot)}원 (부가세 포함)\n\n자세한 내용은 첨부한 견적서를 확인해 주세요.\n문의: ${catalog.company.tel}`,
    log:x=>{(job.sent=job.sent||[]).push({at:new Date().toISOString(),...x});persist()}}}
function sendLog(list){return(list||[]).slice(-3).reverse().map(s=>`<div class="hint" style="margin:0">${s.via==='email'?'✉️ 이메일':'💬 공유'} · ${esc(s.to||'')} · ${new Date(s.at).toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}</div>`).join('')}
function openSend(doc,via){SEND={...doc,via};const lay=$('#layer');
  const em=via==='email';
  lay.innerHTML=`<div class="overlay center"><div class="modal" role="dialog" aria-modal="true" aria-label="${em?'이메일 발송':'카톡·문자 공유'}" style="width:min(560px,100%)"><div class="modal-head"><h2 style="font-size:18px">${em?'견적서 이메일 발송':'견적서 카톡·문자로 보내기'}</h2><button type="button" class="btn sm" data-act="send-close">닫기</button></div>
    <div class="modal-body" style="gap:12px">
    ${em?`<div class="field"><label for="snd-to">받는 사람 이메일</label><input class="input" id="snd-to" type="email" inputmode="email" value="${esc(doc.to)}" placeholder="kim@naver.com"></div>
      <div class="field"><label for="snd-sub">제목</label><input class="input" id="snd-sub" value="${esc(doc.subject)}"></div>`:''}
    <div class="field"><label for="snd-txt">${em?'본문':'함께 보낼 메시지'}</label><textarea class="input" id="snd-txt" rows="8" style="resize:vertical">${esc(doc.text)}</textarea></div>
    <p class="hint" style="margin:0">첨부: ${esc(doc.file)}</p>
    ${em?`<p class="hint" style="margin:0">${APP?'드라이브 수신기를 만든 구글 계정의 Gmail로 보냅니다.':'내 Gmail 계정에서 보냅니다. 처음 한 번은 Gmail 사용 허락 창이 뜹니다.'}</p>`:`<p class="hint" style="margin:0">태블릿 공유 창이 열리면 <b>카카오톡</b> 또는 <b>메시지</b>를 고르고 고객을 선택하세요. 공유 창이 안 열리는 화면에서는 PDF를 저장하고 메시지를 복사해 드립니다.</p>`}
    <div class="toolbar" style="margin:0;justify-content:flex-end"><button type="button" class="btn" data-act="send-close">취소</button><button type="button" class="btn primary" data-act="${em?'send-email':'send-share'}" id="sndGo">${em?'보내기':'공유하기'}</button></div></div></div></div>`;
  lay.querySelector(em?'#snd-to':'#snd-txt')?.focus()}
async function doEmail(){const d=SEND;if(!d)return;const to=$('#snd-to').value.trim(),subject=$('#snd-sub').value.trim(),body=$('#snd-txt').value;
  if(!isEmail(to)){toast('받는 사람 이메일을 확인해 주세요');$('#snd-to').focus();return}
  if(APP){if(!syReady()){toast('☰ 메뉴 → 드라이브 자동 업로드를 먼저 설정해 주세요 (같은 수신기로 메일을 보냅니다)');return}const go=$('#sndGo');go.disabled=true;go.textContent='보내는 중…';
    try{const blob=await buildPDF(d.pages,'A4',.85);await syPost({action:'email',to,subject,body,name:d.file,b64:await b64(blob),from:catalog.company.name});d.log({via:'email',to});$('#layer').innerHTML='';SEND=null;render();toast(`${to} 로 보냈습니다`)}catch(e){go.disabled=false;go.textContent='보내기';toast('보내지 못했습니다: '+(e.message||e))}return}
  if(!MCP){toast('이 화면에서는 이메일 발송을 쓸 수 없습니다. claude.ai에서 열고 Gmail을 연결해 주세요.');return}
  const go=$('#sndGo');go.disabled=true;go.textContent='보내는 중…';
  try{const blob=await buildPDF(d.pages,'A4',.85);if(!blob)throw{code:'pdf'};
    let att;let fileOk=false;try{const lt=await MCP.listTools();fileOk=!!lt?.fileArgs}catch(e){}
    if(fileOk)att={content:{$file:{data:blob,name:d.file,type:'application/pdf'}},filename:d.file,mimeType:'application/pdf'};
    else{if(blob.size>700000)throw{code:'too_big'};att={content:await b64(blob),filename:d.file,mimeType:'application/pdf'}}
    await MCP.callTool('Gmail','send_message',{to:[to],subject,body,attachments:[att]});
    if(d.saveTo)d.saveTo(to);d.log({via:'email',to});$('#layer').innerHTML='';SEND=null;render();toast(`${to} 로 보냈습니다`)}
  catch(e){go.disabled=false;go.textContent='보내기';const c=e?.code;
    toast(c==='server_not_connected'||c==='server_not_found'?'Gmail이 연결되어 있지 않습니다. claude.ai 설정 → 커넥터에서 Gmail을 연결해 주세요.':c==='needs_reauth'?'Gmail 로그인이 만료되었습니다. 커넥터에서 다시 연결해 주세요.':c==='not_granted'||c==='consent_required'?'Gmail 사용을 허락해야 보낼 수 있습니다.':c==='too_big'?'첨부 파일이 너무 커서 보낼 수 없습니다.':c==='rate_limited'?'잠시 후 다시 눌러주세요':'보내지 못했습니다. 잠시 후 다시 시도해 주세요.')}}
async function doShare(){const d=SEND;if(!d)return;const text=$('#snd-txt').value,go=$('#sndGo');go.disabled=true;go.textContent='준비 중…';
  try{const blob=await buildPDF(d.pages,'A4');if(!blob)return;const file=new File([blob],d.file,{type:'application/pdf'});
    let shared=false;
    if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:d.subject,text});shared=true}catch(e){if(e?.name==='AbortError'){go.disabled=false;go.textContent='공유하기';return}}}
    if(shared){d.log({via:'share',to:d.phone||''});$('#layer').innerHTML='';SEND=null;render();toast('공유했습니다');return}
    let copied=false;try{await navigator.clipboard.writeText(text);copied=true}catch(e){}
    await saveFile(d.file,blob);d.log({via:'share',to:d.phone||''});
    $('#layer').innerHTML='';SEND=null;render();toast(copied?'PDF를 저장하고 메시지를 복사했습니다. 카톡에서 붙여넣고 PDF를 첨부하세요.':'PDF를 저장했습니다. 카톡에서 파일로 첨부해 주세요.')}
  catch(e){go.disabled=false;go.textContent='공유하기';toast('공유하지 못했습니다')}}

/* ---------- 앱: 구글 드라이브 자동 업로드 ---------- */
function drawPages(){const c=cutPage(),wp=workPage(),mk=makePage();return[{svg:sheetSVG(job),w:1400,h:990,mm:.3},...(job.room?.on?[{svg:roomPage(job),w:1400,h:990,mm:.3}]:[]),...job.faces.map((f,i)=>elecPoints(job,i).pts.length?{svg:elecPage(job,i),w:1400,h:990,mm:.3}:null).filter(Boolean),...job.faces.flatMap((f,i)=>[{svg:drawingSVG(job,i),w:1400,h:990,mm:.3},...(!isMD(job.cat)?[{svg:sidePage(job,i),w:1400,h:990,mm:.3}]:[])]),{svg:planDetailSVG(job),w:1400,h:990,mm:.3},...(job.cat==='kitchen'?[{svg:counterSVG(job),w:1400,h:990,mm:.3}]:[]),{...mk,mm:.3},...(tileAreas().length?[{svg:tileSVG(),w:1400,h:990,mm:.3}]:[]),{...c,mm:.3},{...wp,mm:.3}]}
const SYK='silcheuk-sync';
let SY=(()=>{try{return{url:'',key:'',wifi:true,pdf:true,done:{},asSig:'',last:0,log:[],...(JSON.parse(localStorage.getItem(SYK))||{})}}catch(e){return{url:'',key:'',wifi:true,pdf:true,done:{},asSig:'',last:0,log:[]}}})();
const sySave=()=>{try{localStorage.setItem(SYK,JSON.stringify(SY))}catch(e){}};
let syBusy=false,syPending=0,syErr='',syT=0;
const syConn=()=>navigator.connection?.type;
const syWifiOK=()=>{const t=syConn();return!SY.wifi||!t||t==='wifi'||t==='ethernet'||t==='unknown'};
const syReady=()=>APP&&!!SY.url&&!!SY.key;
async function syPost(o){const r=await fetch(SY.url,{method:'POST',body:JSON.stringify({key:SY.key,...o}),redirect:'follow'});const j=await r.json().catch(()=>null);if(!j?.ok)throw new Error(j?.error==='key'?'비밀번호(KEY)가 맞지 않습니다':j?.error||'응답 없음');return j}
const syName=x=>String(x||'').replace(/^예시\)\s*/,'').replace(/[\\/:*?"<>|#'\n]/g,'').trim().slice(0,30);
function syFolder(d,id){const t=new Date(d.createdAt||d.updatedAt||Date.now()),ds=`${t.getFullYear()}${String(t.getMonth()+1).padStart(2,'0')}${String(t.getDate()).padStart(2,'0')}`;return[ds,syName(d.title)||'이름없음',syName((d.addr||'').split(' ').slice(0,2).join(' ')),id].filter(Boolean).join('_')}
async function syCount(){if(!DB?.dump)return 0;const all=await DB.dump();let n=0;Object.entries(all).forEach(([k,v])=>{if(k.startsWith('jobs/')&&(SY.done[k.slice(5)]||0)<(v.updatedAt||0))n++});const as=asSigNow(all);if(as&&as!==SY.asSig)n++;syPending=n;return n}
function asSigNow(all){const ks=Object.keys(all).filter(k=>/^(as_|shop_)/.test(k)).sort();if(!ks.length)return'';return ks.length+':'+ks.reduce((s,k)=>Math.max(s,all[k].updatedAt||0),0)}
async function syncNow(manual){if(!syReady()){if(manual)openSyncSettings();return}if(syBusy)return;
  if(!navigator.onLine){if(manual)toast('인터넷이 연결되지 않았습니다');return}
  if(!manual&&!syWifiOK()){await syCount();netChip();return}
  syBusy=true;syErr='';netChip();let up=0;
  try{if(autoOK()&&isDirty())await saveJobToServer(undefined,{silent:true});
    const all=await DB.dump();
    for(const[k,v]of Object.entries(all)){if(!k.startsWith('jobs/'))continue;const id=k.slice(5);if((SY.done[id]||0)>=(v.updatedAt||0))continue;
      const folder=syFolder(v,id),send=(name,mime,b64)=>syPost({action:'file',group:'현장',folder,id,name,mime,b64});
      const j=v.job||{};let i=0;for(const ph of j.photos||[]){i++;if(!String(ph.src).startsWith('data:'))continue;await send(`사진_${String(i).padStart(2,'0')}.jpg`,'image/jpeg',String(ph.src).split(',')[1])}
      const lite={...v,job:{...j,photos:(j.photos||[]).map((ph,n)=>({...ph,src:String(ph.src).startsWith('data:')?`사진_${String(n+1).padStart(2,'0')}.jpg`:ph.src}))}};
      await send('현장정보.json','application/json',btoa(unescape(encodeURIComponent(JSON.stringify(lite)))));
      if(SY.pdf){const keep=job;let qp,dp;try{job=migrate(JSON.parse(JSON.stringify(j)));qp=[{...quotePage(),mm:210/794}];dp=drawPages()}finally{job=keep}
        await send('견적서_A4.pdf','application/pdf',await b64(await buildPDF(qp,'A4',.85)));await send(`제작도면_${paperSel}.pdf`,'application/pdf',await b64(await buildPDF(dp,paperSel,.85)))}
      SY.done[id]=v.updatedAt||Date.now();sySave();up++;netChip()}
    const as=asSigNow(all);if(as&&as!==SY.asSig){const ad={};Object.entries(all).forEach(([k,v])=>{if(/^(as_|shop_)/.test(k))ad[k]=v});
      await syPost({action:'file',group:'AS',name:'AS_고객_접수_데이터.json',mime:'application/json',b64:btoa(unescape(encodeURIComponent(JSON.stringify({at:Date.now(),docs:ad}))))});SY.asSig=as;up++}
    if(up){SY.last=Date.now();SY.log=[{at:SY.last,n:up},...(SY.log||[])].slice(0,10)}sySave();if(manual||up)toast(up?`드라이브에 ${up}건 올렸습니다`:'올릴 새 내용이 없습니다')}
  catch(e){syErr=String(e.message||e);if(manual)toast('업로드 실패: '+syErr)}
  syBusy=false;try{if(!manual)await syInbox(false)}catch(e){}await syCount();netChip();if($('#syncModal'))openSyncSettings()}
function syKick(ms=4000){if(!syReady())return;clearTimeout(syT);syT=setTimeout(()=>syncNow(false),ms)}
if(APP){addEventListener('online',()=>syKick(3000));navigator.connection?.addEventListener?.('change',()=>syKick(3000));setInterval(()=>syKick(100),180000);setTimeout(()=>syCount().then(()=>{netChip();syKick(5000)}),2500);
  if('serviceWorker'in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('sw.js').catch(()=>{})}
function openSyncSettings(){const t=syConn();$('#layer').innerHTML=`<div class="overlay center"><div class="modal" id="syncModal" role="dialog" aria-modal="true" aria-label="드라이브 자동 업로드" style="width:min(620px,100%)"><div class="modal-head"><h2 style="font-size:18px">구글 드라이브 자동 업로드</h2><button type="button" class="btn sm" data-act="mgr-close">닫기</button></div>
  <div class="modal-body" style="gap:12px">
  <p class="hint" style="margin:0">현장·사진은 이 태블릿에 먼저 저장되고, ${SY.wifi?'와이파이에':'인터넷에'} 연결되면 내 구글 드라이브 <b>‘실측스튜디오’</b> 폴더로 자동으로 올라갑니다. 사무실 PC에 구글 드라이브를 설치하면 PC 폴더에도 들어옵니다.</p>
  <div class="field"><label for="sy-url">수신기 주소 (Apps Script 웹 앱 URL)</label><input class="input" id="sy-url" inputmode="url" placeholder="https://script.google.com/macros/s/…/exec" value="${esc(SY.url)}"></div>
  <div class="field"><label for="sy-key">비밀번호 (스크립트의 KEY와 같게)</label><input class="input" id="sy-key" value="${esc(SY.key)}"></div>
  <label class="toolbar" style="margin:0;gap:8px"><input type="checkbox" id="sy-wifi" ${SY.wifi?'checked':''}> 와이파이에서만 자동 업로드 <span class="hint" style="margin:0">(지금 연결: ${t==='wifi'?'와이파이':t==='cellular'?'모바일 데이터':t||'알 수 없음'})</span></label>
  <label class="toolbar" style="margin:0;gap:8px"><input type="checkbox" id="sy-pdf" ${SY.pdf?'checked':''}> 견적서·제작도면 PDF도 같이 올리기</label>
  <div class="toolbar" style="margin:0;flex-wrap:wrap"><button type="button" class="btn" data-act="sy-save">저장</button><button type="button" class="btn" data-act="sy-test">연결 테스트</button><button type="button" class="btn primary" data-act="sy-now" ${syBusy?'disabled':''}>${syBusy?'올리는 중…':'지금 올리기'}</button><button type="button" class="btn" data-act="sy-inbox">⬇ 사무실에서 받기</button></div>
  <p class="hint" style="margin:0">모바일 데이터에서도 올리려면 ‘와이파이에서만’을 끄세요. 꺼 두면 사진이 많은 현장은 데이터를 많이 씁니다. 켜 두어도 ‘지금 올리기’는 바로 올립니다.</p>
  <div class="panel" style="padding:10px 14px;background:var(--surface-2)"><div class="hint" style="margin:0">올릴 것 <b>${syPending}건</b>${SY.last?` · 마지막 업로드 ${fmtTime(SY.last)}`:''}${syErr?` · <span style="color:#C0362C">오류: ${esc(syErr)}</span>`:''}</div>${(SY.log||[]).slice(0,4).map(l=>`<div class="hint" style="margin:0">${fmtTime(l.at)} · ${l.n}건</div>`).join('')}</div>
  <details class="sec"><summary><span>처음 설정하는 방법 (5분)</span><span class="sum"></span></summary><div class="sec-body"><ol style="margin:0;padding-left:20px;display:grid;gap:6px;font-size:14px">
   <li>PC에서 <b>script.google.com</b> 접속 → <b>새 프로젝트</b></li><li><a href="https://rok762-cmd.github.io/apps-script.gs" target="_blank" rel="noopener"><b>apps-script.gs</b></a>(v3 · 사무실→태블릿 받기 · 드라이브 현장 열기 지원) 내용을 전부 붙여넣고, 맨 위 <b>KEY</b>를 원하는 비밀번호로 바꾼 뒤 저장</li>
   <li>오른쪽 위 <b>배포 → 새 배포</b> → 유형 <b>웹 앱</b> → 실행 계정 <b>나</b>, 액세스 <b>모든 사용자</b> → 배포 → 권한 허용</li><li>나온 <b>웹 앱 URL</b>을 위 주소 칸에, 비밀번호를 아래 칸에 넣고 <b>연결 테스트</b></li>
   <li>사무실 PC에 <b>Google Drive 데스크톱</b>을 설치하면 ‘실측스튜디오’ 폴더가 PC에 자동으로 생깁니다</li></ol></div></details></div></div></div>`}


/* ---------- 앱 아이콘 설치 · 열 때마다 새 버전 자동 업데이트 ---------- */
const APP_URL='https://rok762-cmd.github.io/';
const isStandalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true||!!window.__installed;
function appInstallBtn(){const b=document.getElementById('appInstallBtn');if(!b)return;const show=!isStandalone()&&(!APP||!!window.__bip||true);b.hidden=!show;b.textContent=APP?'📲 앱 설치':'📲 앱으로 쓰기'}
addEventListener('bip-ready',appInstallBtn);addEventListener('appinstalled',()=>{appInstallBtn();toast('앱 아이콘이 홈 화면에 생겼습니다')});setTimeout(appInstallBtn,800);
async function appInstall(){if(APP&&window.__bip){const e=window.__bip;window.__bip=null;e.prompt();try{const r=await e.userChoice;if(r.outcome==='accepted')toast('설치합니다 · 홈 화면의 ‘실측’ 아이콘으로 여세요')}catch(_){}appInstallBtn();return}
  $('#layer').innerHTML=`<div class="overlay center" data-act="sheet-back"><div class="modal" style="width:min(560px,100%)" role="dialog" aria-label="앱 설치"><div class="modal-head"><h2 style="font-size:18px">📲 앱 아이콘으로 설치</h2><button type="button" class="btn sm" data-act="sheet-cancel">닫기</button></div><div class="modal-body" style="gap:10px">
    ${APP?'':`<p style="margin:0">아래 주소를 <b>크롬</b>에서 열고 설치하세요. 설치하면 홈 화면의 아이콘으로 바로 열리고, 열 때마다 <b>새 버전으로 자동 업데이트</b>됩니다.</p><a class="btn primary" href="${APP_URL}" target="_blank" rel="noopener">${APP_URL} 열기</a>`}
    <ol style="margin:0;padding-left:20px;display:grid;gap:6px"><li><b>갤럭시탭·안드로이드 크롬:</b> 오른쪽 위 <b>⋮</b> → <b>앱 설치</b> (또는 <b>홈 화면에 추가 → 설치</b>)</li><li><b>아이패드:</b> 사파리로 열고 <b>공유(□↑)</b> → <b>홈 화면에 추가</b></li><li>카톡·네이버 앱 안에서 열렸다면 오른쪽 위 메뉴의 <b>다른 브라우저로 열기 → 크롬</b>을 먼저 누르세요</li></ol>
    <p class="hint" style="margin:0">이미 설치했다면 홈 화면의 <b>‘실측’</b> 아이콘으로 여세요. 현장 자료는 앱 안에 저장됩니다 (다른 곳에서 쓰던 자료는 ‘전체 백업 · 복원’으로 옮기세요).</p></div></div></div>`;sheetCb={ok:()=>{},cancel:()=>{$('#layer').innerHTML='';sheetCb=null}}}
let updChecking=false;
async function appUpdCheck(){if(!APP||!navigator.onLine||updChecking||!window.SILCHEUK_VER)return;updChecking=true;try{const r=await fetch('version.json?t='+Date.now(),{cache:'no-store'});const o=await r.json();
    if(o&&o.v&&o.v!==window.SILCHEUK_VER){let tried='';try{tried=sessionStorage.getItem('silcheuk-upd')||''}catch(_){}if(tried===o.v)return;try{sessionStorage.setItem('silcheuk-upd',o.v)}catch(_){}
      try{if(autoOK()&&isDirty())await saveJobToServer(undefined,{silent:true});persist()}catch(_){}toast('새 버전으로 업데이트합니다…');try{const reg=await navigator.serviceWorker?.getRegistration();await reg?.update()}catch(_){}setTimeout(()=>location.reload(),900)}}
  catch(_){}finally{updChecking=false}}
if(APP){setTimeout(appUpdCheck,2000);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')appUpdCheck()});addEventListener('online',()=>setTimeout(appUpdCheck,2000))}
