/* ---------- sample photo ---------- */
let SAMPLE_SRC=null;
function sampleSrc(){if(SAMPLE_SRC)return SAMPLE_SRC;const c=document.createElement('canvas');c.width=1600;c.height=1200;const x=c.getContext('2d');
  const poly=(pts,fill)=>{x.beginPath();pts.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.closePath();x.fillStyle=fill;x.fill()};
  const lg=(x0,y0,x1,y1,a,b)=>{const g=x.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,a);g.addColorStop(1,b);return g};
  poly([[0,0],[1600,0],[1200,200],[400,200]],lg(0,0,0,200,'#E6E3DD','#F0EEEA'));
  poly([[0,0],[400,200],[400,920],[0,1200]],lg(0,0,400,0,'#C2BCB2','#D7D2CA'));
  poly([[1600,0],[1200,200],[1200,920],[1600,1200]],lg(1600,0,1200,0,'#BDB7AD','#CFCAC1'));
  poly([[400,200],[1200,200],[1200,920],[400,920]],lg(0,200,0,920,'#E8E4DD','#DCD7CF'));
  poly([[0,1200],[400,920],[1200,920],[1600,1200]],lg(0,920,0,1200,'#9E7A52','#B98F62'));
  x.strokeStyle='rgba(80,55,30,.35)';x.lineWidth=2;for(let i=0;i<=10;i++){const px=400+80*i,bx=800+(px-800)*(1200-560)/(920-560);x.beginPath();x.moveTo(px,920);x.lineTo(bx,1200);x.stroke()}
  poly([[400,904],[1200,904],[1200,920],[400,920]],'#F4F2EE');poly([[0,1178],[400,906],[400,920],[0,1200]],'#EDEAE5');poly([[1600,1178],[1200,906],[1200,920],[1600,1200]],'#E3E0DA');
  x.strokeStyle='rgba(0,0,0,.12)';x.lineWidth=3;[[400,200,400,920],[1200,200,1200,920],[400,200,1200,200]].forEach(([a,b,c2,d])=>{x.beginPath();x.moveTo(a,b);x.lineTo(c2,d);x.stroke()});
  poly([[284,846],[318,836],[318,892],[284,904]],'#F7F6F3');x.strokeStyle='#A9A49B';x.lineWidth=2;x.stroke();
  const rg=x.createRadialGradient(800,300,50,800,500,900);rg.addColorStop(0,'rgba(255,250,240,.18)');rg.addColorStop(1,'rgba(0,0,0,.12)');x.fillStyle=rg;x.fillRect(0,0,1600,1200);
  SAMPLE_SRC=c.toDataURL('image/jpeg',.86);return SAMPLE_SRC}
const photoSrc=p=>p.src==='sample'?sampleSrc():String(p.src).startsWith('asset:')?'/_blob/'+p.src.slice(6):p.src;
function loadImageFile(file){return new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>{const img=new Image();img.onload=()=>{const sc=Math.min(1,1600/Math.max(img.width,img.height)),w=Math.round(img.width*sc),h=Math.round(img.height*sc);
  const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);res({id:uid(),src:c.toDataURL('image/jpeg',.8),w,h,marks:[]})};img.onerror=rej;img.src=fr.result};fr.onerror=rej;fr.readAsDataURL(file)})}

/* ---------- server (artifact db) ---------- */
let DB=null,ASSETS=null,USER=null,CAN_WRITE=false,serverJobs=null,jobFilter='all',NAMES={};
const STATUS={draft:'작성중',sent:'발송됨',making:'제작중',done:'완료'};
function dataURLtoBlob(u){const[hd,b64]=u.split(',');const mime=(hd.match(/data:([^;]+)/)||[])[1]||'image/jpeg';const bin=atob(b64),a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return new Blob([a],{type:mime})}
(async()=>{if(!LOCAL&&!window.claude?.use)return;
  const[db,as,us]=LOCAL?[localDB(),null,null]:await Promise.all(['db','assets','user'].map(n=>window.claude.use(n).catch(()=>null)));DB=db;ASSETS=as;USER=us;if(LOCAL){await DB.ready;if(DB.mode()==='mem')setTimeout(()=>toast('이 태블릿에 저장할 수 없는 상태입니다. 작업 후 꼭 ‘전체 내보내기’를 하세요.'),1500)}
  CAN_WRITE=!!DB&&(USER?USER.can?.('data.write')!==false:true);
  if(DB){try{const s=await DB.doc('settings/catalog').get();if(s.exists&&s.data()?.catalog){store.set(CK,s.data().catalog);catalog=loadCatalog();const v=catalog.ver||0;upgradeCatalog();if(v<14&&CAN_WRITE)saveCatalog();syncBoard()}else if(CAN_WRITE)saveCatalog()}catch(e){}
    DB.collection('jobs').orderBy('updatedAt','desc').limit(300).onSnapshot(async snap=>{serverJobs=snap.docs.map(d=>({id:d.id,...d.data()}));
      const ids=[...new Set(serverJobs.map(x=>x.by).filter(Boolean))].filter(i=>!NAMES[i]);if(ids.length&&USER?.profiles){try{const ps=await USER.profiles(ids);ids.forEach(i=>NAMES[i]=ps[i]?.name||'')}catch(e){}}
      const mine=serverJobs.find(x=>x.id===job.id);if(mine&&mine.status!==job.serverStatus){job.serverStatus=mine.status;persist()}
      if($('#jobsModal'))renderJobs();renderSide();$('#jobsBadge')&&( $('#jobsBadge').textContent=serverJobs.filter(x=>x.status==='sent').length||'')},()=>{serverJobs=[];if($('#jobsModal'))renderJobs()});asSubscribe()}
  render();netChip();if(autoOK()&&isDirty())setTimeout(autoSave,3000)})();

/* ---------- 인터넷 연결 · 자동 서버 저장 ---------- */
const SK='silcheuk-saved-sig';
function jobSig(j=job){const s=JSON.stringify({...j,savedAt:0,serverStatus:0,sel:0,fi:0,open:0,reqs:j.reqs&&j.reqs.length?j.reqs:0,sent:j.sent&&j.sent.length?j.sent:0});let x=2166136261;for(let i=0;i<s.length;i+=(s.length>400000?3:1)){x^=s.charCodeAt(i);x=Math.imul(x,16777619)}return j.id+':'+s.length+':'+(x>>>0)}
let savedSig=store.get(SK)||'',autoT=0,autoBusy=false,autoAgain=false,autoErr=false,netOn=navigator.onLine!==false;
const isSampleJob=()=>/^예시\)/.test(job.customer.name||'');
const isEmptyJob=()=>!(job.customer.name||'').trim()&&!(job.customer.addr||'').trim()&&!job.photos.some(p=>p.src!=='sample');
const isDirty=()=>jobSig()!==savedSig;
function markClean(){savedSig=jobSig();store.set(SK,savedSig);netChip()}
function checkDirty(){netChip();if(!isDirty()||!autoOK())return;clearTimeout(autoT);autoT=setTimeout(autoSave,autoErr?60000:12000)}
const autoOK=()=>DB&&CAN_WRITE&&!isSampleJob()&&!isEmptyJob();
async function autoSave(){clearTimeout(autoT);if(!autoOK()||!isDirty()){netChip();return}if(!netOn&&!LOCAL){netChip();return}
  if(autoBusy){autoAgain=true;return}autoBusy=true;netChip();
  const ok=await saveJobToServer(undefined,{silent:true});autoBusy=false;autoErr=!ok;netChip();
  if(autoAgain||(!ok&&netOn)){autoAgain=false;clearTimeout(autoT);autoT=setTimeout(autoSave,ok?2000:60000)}}
function netChip(){const el=$('#netChip');if(!el)return;let c='',t='',tip='';
  if(APP&&syBusy){c='wait';t='드라이브 업로드 중…';tip='구글 드라이브에 올리고 있습니다.'}
  else if(APP&&syReady()&&syPending&&!autoBusy&&!isDirty()){c='wait';t=`업로드 대기 ${syPending}`;tip=syWifiOK()?'곧 드라이브에 올립니다.':'와이파이에 연결되면 드라이브에 올립니다.'}
  else if(LOCAL&&!autoBusy&&!isDirty()&&!isSampleJob()&&!isEmptyJob()){c='ok';t=`${APP&&syReady()?(SY.last?'업로드됨':'태블릿 저장됨'):'태블릿 저장됨'} ${job.savedAt?fmtTime(job.savedAt).split(' ')[1]:''}`.trim();tip=APP?(syReady()?'태블릿에 저장되었고 드라이브에도 올라가 있습니다. 누르면 업로드 설정':'태블릿에 저장되어 있습니다. 누르면 드라이브 업로드 설정'):'오프라인용 앱 · 이 태블릿에 저장되어 있습니다.'}
  else if(!netOn&&!LOCAL){c='off';t='오프라인';tip='인터넷이 끊겼습니다. 입력 내용은 태블릿에 임시 저장되고, 연결되면 자동으로 서버에 저장합니다.'}
  else if(mode==='as'){c='ok';t='온라인';tip='인터넷 연결됨'}
  else if(!DB){c='local';t='태블릿에만 저장';tip='claude.ai에서 열면 서버에 자동 저장됩니다.'}
  else if(!CAN_WRITE){c='local';t='저장 권한 없음';tip='서버에 저장할 권한이 없습니다.'}
  else if(isSampleJob()){c='local';t='예시 현장';tip='예시 현장은 자동 저장하지 않습니다. 고객명을 바꾸면 자동 저장됩니다.'}
  else if(isEmptyJob()){c='local';t='입력 전';tip='고객명이나 주소를 넣으면 자동 저장이 시작됩니다.'}
  else if(autoBusy){c='wait';t='저장 중…';tip='서버에 저장하고 있습니다.'}
  else if(isDirty()){c='wait';t=autoErr?'저장 재시도 대기':'저장 대기';tip=autoErr?'서버 저장에 실패해 1분 뒤 다시 시도합니다.':'잠시 뒤 자동으로 서버에 저장합니다.'}
  else{c='ok';t=`저장됨 ${job.savedAt?fmtTime(job.savedAt).split(' ')[1]:''}`.trim();tip='서버에 저장되어 있습니다.'}
  el.className='net '+c;el.textContent=t;if(APP){el.style.cursor='pointer';el.dataset.act='sync-open'}el.title=tip;el.setAttribute('aria-label',tip)}
addEventListener('offline',()=>{netOn=false;netChip();if(!LOCAL)toast('인터넷이 끊겼습니다. 입력은 태블릿에 임시 저장되고, 연결되면 자동으로 서버에 저장합니다.')});
addEventListener('online',()=>{netOn=true;netChip();if(autoOK()&&isDirty()){toast('다시 연결됐습니다. 서버에 저장합니다.');setTimeout(autoSave,1500)}});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&autoOK()&&isDirty()&&netOn)autoSave()});
async function saveJobToServer(status,opt={}){const S=opt.silent,say=m=>{if(!S)toast(m)};if(!DB){say('서버 저장은 claude.ai에서 이 페이지를 열었을 때 쓸 수 있습니다.');return false}
  if(!CAN_WRITE){say('서버에 저장할 권한이 없습니다. 공유 설정에서 기여자 이상 권한을 받아야 합니다.');return false}
  if(!netOn&&!S&&!LOCAL){toast('인터넷이 끊겨 있습니다. 연결되면 자동으로 저장합니다.');return false}
  say(status==='sent'?'회사로 발송하는 중…':'서버에 저장하는 중…');
  try{for(const ph of siteAll().flatMap(x=>x.photos||[])){if(!LOCAL&&String(ph.src).startsWith('data:')&&!ph.aid){if(!ASSETS)throw{code:'no_assets'};const r=await ASSETS.upload(dataURLtoBlob(ph.src),{type:'image/jpeg'});ph.aid=r.id}}
    const ref=DB.collection('jobs').doc(job.id),prev=await ref.get(),pd=prev.exists?prev.data():{},me=USER?.id?await USER.id().catch(()=>null):null,q=quote(),now=Date.now();
    const st=status||pd.status||'draft',mapPh=ps=>(ps||[]).map(ph=>ph.aid&&String(ph.src).startsWith('data:')?{...ph,src:'asset:'+ph.aid,aid:undefined}:ph),doc={job:JSON.parse(JSON.stringify({...job,serverStatus:st,photos:mapPh(job.photos),items:job.items?job.items.map(it=>({...it,photos:mapPh(it.photos)})):undefined})),title:job.customer.name||'이름 없는 현장',addr:job.customer.addr||'',cat:job.cat,layout:job.layout,
      faces:facesSpec(job)+(job.items?.length?` 외 ${job.items.length}품목`:''),total:siteGrand(),items:siteAll().map(it=>itemName(it)),status:st,updatedAt:now,createdAt:pd.createdAt||now,by:pd.by||me||null,sentAt:status==='sent'?now:(pd.sentAt||null)};
    await ref.set(doc);job.serverStatus=st;job.savedAt=now;markClean();if(APP){syCount().then(netChip);syKick(8000)}persist();if(!S){toast(LOCAL?'태블릿에 저장했습니다':status==='sent'?'회사로 발송했습니다. 현장 목록에서 확인할 수 있습니다.':'서버에 저장했습니다');render()}else{renderSide()}return true}
  catch(e){if(S)return false;toast(e?.code==='no_assets'?'사진을 올릴 권한이 없어 저장하지 못했습니다.':e?.code==='not_granted'?'서버 사용이 허용되지 않았습니다.':'서버에 저장하지 못했습니다. 잠시 후 다시 시도하세요.');return false}}
const fmtTime=t=>{if(!t)return'-';const d=new Date(t);return`${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`};
function openJobs(){$('#layer').innerHTML=`<div class="overlay center"><div class="modal" id="jobsModal" role="dialog" aria-modal="true" aria-label="현장 목록"></div></div>`;renderJobs()}
function renderJobs(){const m=$('#jobsModal');if(!m)return;const list=(serverJobs||[]).filter(x=>jobFilter==='all'||x.status===jobFilter);
  const body=!DB?'<p class="hint">현장 목록은 claude.ai에서 이 페이지를 열었을 때 서버와 연결됩니다.</p>':serverJobs===null?'<p class="hint">불러오는 중…</p>':!list.length?`<p class="hint">${jobFilter==='all'?'아직 서버에 저장된 현장이 없습니다. 결과물 단계에서 ‘서버에 저장’이나 ‘회사로 발송’을 누르면 여기에 쌓입니다.':'이 상태의 현장이 없습니다.'}</p>`
    :`<div class="table-wrap" style="margin:0"><table><thead><tr><th>현장</th><th>품목</th><th class="r">견적</th><th>상태</th><th>수정</th><th></th></tr></thead><tbody>${list.map(x=>`<tr>
      <td style="white-space:normal;min-width:160px"><b>${esc(x.title)}</b><br><span class="hint">${esc(x.addr||'')}${x.by&&NAMES[x.by]?' · '+esc(NAMES[x.by]):''}</span></td>
      <td style="white-space:normal">${x.items&&x.items.length>1?esc(x.items.join(' · ')):(CATS[x.cat]?.name||'')+' · '+(LAYOUTS[x.layout]||'')}<br><span class="hint mono">${esc(x.faces||'')}</span></td><td class="r">${won(x.total||0)}</td>
      <td><select class="input" style="min-height:36px;width:auto" data-change="job-status" data-id="${x.id}" aria-label="상태" ${CAN_WRITE?'':'disabled'}>${Object.entries(STATUS).map(([k,v])=>`<option value="${k}" ${x.status===k?'selected':''}>${v}</option>`).join('')}</select></td>
      <td class="mono">${fmtTime(x.updatedAt)}</td><td><span style="display:flex;gap:4px"><button type="button" class="btn sm" data-act="job-open" data-id="${x.id}">열기</button>${CAN_WRITE?`<button type="button" class="btn sm quiet danger" data-act="job-del" data-id="${x.id}">삭제</button>`:''}</span></td></tr>`).join('')}</tbody></table></div>`;
  m.innerHTML=`<div class="modal-head"><h2 style="font-size:18px">현장 목록 · ${LOCAL?'이 태블릿':'서버'}</h2>${LOCAL?'<button type="button" class="btn sm primary" data-act="local-export">전체 내보내기</button><label class="btn sm file-btn">현장 받기 (파일)<input type="file" accept=".json,application/json" data-change="restore-all"></label>'+(APP?'<button type="button" class="btn sm" data-act="sy-inbox">⬇ 사무실에서 받기</button>':''):'<label class="btn sm file-btn">오프라인 현장 가져오기<input type="file" accept=".json,application/json" data-change="bundle-import"></label>'}<div class="seg">${[['all','전체'],...Object.entries(STATUS)].map(([k,v])=>`<button type="button" data-act="job-filter" data-v="${k}" aria-pressed="${jobFilter===k}">${v}${k!=='all'&&serverJobs?` ${serverJobs.filter(x=>x.status===k).length}`:''}</button>`).join('')}</div><button type="button" class="btn sm" data-act="mgr-close">닫기</button></div><div class="modal-body">${body}</div>`}
function srvBar(){const st=job.serverStatus;if(LOCAL)return`<div class="toolbar" style="margin:0;align-items:center"><button type="button" class="btn" data-act="srv-save">태블릿에 저장</button><button type="button" class="btn primary" data-act="local-export">전체 내보내기 (본 앱으로 옮기기)</button><span class="hint">${APP?`현장은 이 태블릿에 저장되고 ${SY.wifi?'와이파이에서':'인터넷이 되면'} 구글 드라이브로 자동 업로드됩니다.${syReady()?'':' (☰ 메뉴에서 드라이브 설정 필요)'}`:'오프라인용 앱 · 현장은 이 태블릿에 저장됩니다. 인터넷이 될 때 내보낸 파일을 본 앱에서 불러오세요.'}</span></div>`;return`<div class="toolbar" style="margin:0;align-items:center"><button type="button" class="btn" data-act="srv-save" ${DB?'':'disabled'}>서버에 저장</button><button type="button" class="btn primary" data-act="srv-send" ${DB?'':'disabled'}>회사로 발송</button>
  <span class="hint">${!DB?'서버 저장은 claude.ai에서 열었을 때 사용할 수 있습니다.':st?`서버 상태: <b>${STATUS[st]}</b> · ${fmtTime(job.savedAt)} 저장`:'아직 서버에 저장하지 않았습니다.'}</span></div>`}

/* ---------- photo calibration & composite ---------- */
function solveLin(A,b){const n=b.length,M=A.map((r,i)=>[...r,b[i]]);for(let c=0;c<n;c++){let p=c;for(let r=c+1;r<n;r++)if(Math.abs(M[r][c])>Math.abs(M[p][c]))p=r;[M[c],M[p]]=[M[p],M[c]];
  if(Math.abs(M[c][c])<1e-12)return null;for(let r=0;r<n;r++){if(r===c)continue;const k=M[r][c]/M[c][c];for(let q=c;q<=n;q++)M[r][q]-=k*M[c][q]}}return M.map((r,i)=>r[n]/r[i])}
function homog(src,dst){const A=[],b=[];for(let i=0;i<4;i++){const[x,y]=src[i],[u,v]=dst[i];A.push([x,y,1,0,0,0,-u*x,-u*y]);b.push(u);A.push([0,0,0,x,y,1,-v*x,-v*y]);b.push(v)}const s=solveLin(A,b);return s?[...s,1]:null}
function applyH(H,x,y){const w=H[6]*x+H[7]*y+H[8];return[(H[0]*x+H[1]*y+H[2])/w,(H[3]*x+H[4]*y+H[5])/w]}
const REF_PRESETS=[['A4 용지',210,297],['A3 용지',297,420],['신용카드',86,54],['A4 2장 (가로로 붙임)',420,297],['A4 4장 (2×2로 붙임)',420,594]];
function openRefSheet(){const lay=$('#layer'),r=job.refObj||{};lay.innerHTML=`<div class="overlay" data-act="sheet-back"><div class="sheet"><h3>기준물 고르기</h3>
  <p class="hint" style="margin:0"><b>클수록 정확합니다</b> (A4 1장 오차 약 3~5% · A4 4장 약 1~2%). 크기를 아는 물건을 <b>재려는 벽에 평평하게 붙이고</b> 사진을 찍은 뒤, 사진에서 그 물건의 <b>네 모서리</b>를 누르세요.</p>
  <div style="display:grid;gap:8px">${REF_PRESETS.map(([l,w,h])=>`<button type="button" class="btn" data-act="ref-pick" data-w="${w}" data-h="${h}" data-l="${l}">${l} <span class="hint">${w}×${h}mm</span></button>`).join('')}</div>
  <div class="toolbar" style="margin:0"><span class="hint">직접</span><input class="input mono" id="refW" style="width:80px" inputmode="numeric" placeholder="가로" value="${r.l==='직접 입력'?r.w:''}"><span>×</span><input class="input mono" id="refH" style="width:80px" inputmode="numeric" placeholder="세로" value="${r.l==='직접 입력'?r.h:''}"><button type="button" class="btn sm" data-act="ref-pick">확인</button></div>
  <div class="sheet-actions"><button type="button" class="btn" data-act="sheet-cancel">취소</button></div></div></div>`;sheetCb={ok:()=>{},cancel:()=>{lay.innerHTML='';sheetCb=null}}}
function refOf(p){if(!p?.ref)return null;const{w,h,pts}=p.ref,src=[[0,0],[w,0],[w,h],[0,h]],H=homog(pts,src);return H?{p2r:H}:null}
function refDist(p,a,b){const r=refOf(p);if(!r)return null;const A=applyH(r.p2r,a[0],a[1]),B=applyH(r.p2r,b[0],b[1]);const d=Math.hypot(A[0]-B[0],A[1]-B[1]);return isFinite(d)?Math.round(d/5)*5:null}
function setRef(p,pts){const q=orderQuad(pts),L=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]),hz=(L(q[0],q[1])+L(q[3],q[2]))/2,vt=(L(q[0],q[3])+L(q[1],q[2]))/2,o=job.refObj||{w:210,h:297,l:'A4 용지'},big=Math.max(o.w,o.h),sm=Math.min(o.w,o.h);
  p.ref={pts:q,w:hz>=vt?big:sm,h:hz>=vt?sm:big,l:o.l}}
function calibOf(p){if(!p?.calib)return null;const f=job.faces.find(x=>x.key===p.calib.face);if(!f)return null;const len=+f.len,H=+job.dims.H,src=[[0,0],[len,0],[len,H],[0,H]];
  const w2p=homog(src,p.calib.pts),p2w=homog(p.calib.pts,src);return w2p&&p2w?{w2p,p2w,len,H}:null}
const calibPhotoFor=fi=>{const k=job.faces[fi]?.key;return job.photos.find(p=>p.calib&&p.calib.face===k&&calibOf(p))};
function loadImg(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src})}
function drawTri(ctx,img,s,d){const cx=(d[0][0]+d[1][0]+d[2][0])/3,cy=(d[0][1]+d[1][1]+d[2][1])/3,e=p=>[p[0]+(p[0]-cx)*.03,p[1]+(p[1]-cy)*.03];
  const A=[[s[0][0],s[0][1],1],[s[1][0],s[1][1],1],[s[2][0],s[2][1],1]],X=solveLin(A,d.map(p=>p[0])),Y=solveLin(A,d.map(p=>p[1]));if(!X||!Y)return;
  ctx.save();ctx.beginPath();const q=d.map(e);ctx.moveTo(...q[0]);ctx.lineTo(...q[1]);ctx.lineTo(...q[2]);ctx.closePath();ctx.clip();ctx.transform(X[0],Y[0],X[1],Y[1],X[2],Y[2]);ctx.drawImage(img,0,0);ctx.restore()}
let compositeCanvas=null,compEdit=false;
function orderQuad(pts){const cx=pts.reduce((s,q)=>s+q[0],0)/4,cy=pts.reduce((s,q)=>s+q[1],0)/4;const s=[...pts].map(q=>[+q[0],+q[1]]).sort((a,b)=>Math.atan2(a[1]-cy,a[0]-cx)-Math.atan2(b[1]-cy,b[0]-cx));return[s[3],s[2],s[1],s[0]]}
let compTok=0;
async function renderComposite(el,open){compositeCanvas=null;const p=calibPhotoFor(job.fi);if(!el)return;if(!p){el.innerHTML='<p class="hint">현장 실측에서 이 면의 ‘벽 맞추기’를 하면 사진 합성을 볼 수 있습니다.</p>';return}
  const tok=++compTok;if(!el.querySelector('canvas'))el.innerHTML='<p class="hint">사진에 합성하는 중…</p>';
  try{const cal=calibOf(p),img=await loadImg(photoSrc(p)),c=document.createElement('canvas');c.width=p.w;c.height=p.h;const ctx=c.getContext('2d');ctx.drawImage(img,0,0,p.w,p.h);
    const b=sceneSVG(job,{fi:job.fi,bare:true,open,px:1400}),tex=await svgToCanvas(b.svg,b.w,b.h,1,true),N=18;
    const P_=(u,v)=>applyH(cal.w2p,u*b.len,b.H*(1-v)),S_=(u,v)=>[u*b.w,v*b.h];
    for(let i=0;i<N;i++)for(let k=0;k<N;k++){const u0=i/N,u1=(i+1)/N,v0=k/N,v1=(k+1)/N;
      drawTri(ctx,tex,[S_(u0,v0),S_(u1,v0),S_(u1,v1)],[P_(u0,v0),P_(u1,v0),P_(u1,v1)]);drawTri(ctx,tex,[S_(u0,v0),S_(u1,v1),S_(u0,v1)],[P_(u0,v0),P_(u1,v1),P_(u0,v1)])}
    if(!el.isConnected||tok!==compTok)return;
    const u=Math.max(p.w,p.h)/900,pts=p.calib.pts;
    el.innerHTML=`<div class="comp-wrap" style="position:relative;touch-action:${compEdit?'none':'auto'}"></div>
      <div class="toolbar" style="margin:10px 0 0;flex-wrap:wrap"><button type="button" class="btn sm ${compEdit?'primary':''}" data-act="comp-edit" aria-pressed="${compEdit}">${compEdit?'✔ 조절 끝내기':'✥ 크기·위치 조절'}</button>
      ${compEdit?`<button type="button" class="btn sm" data-act="comp-scale" data-v="1.03">＋ 크게</button><button type="button" class="btn sm" data-act="comp-scale" data-v="0.97">－ 작게</button><button type="button" class="btn sm" data-act="comp-move" data-v="0,-1">↑</button><button type="button" class="btn sm" data-act="comp-move" data-v="0,1">↓</button><button type="button" class="btn sm" data-act="comp-move" data-v="-1,0">←</button><button type="button" class="btn sm" data-act="comp-move" data-v="1,0">→</button>${p.calib.orig?'<button type="button" class="btn sm quiet" data-act="comp-reset">처음대로</button>':''}<button type="button" class="btn sm quiet" data-act="go-calib">모서리 다시 찍기</button>`:''}</div>
      ${compEdit?'<p class="hint" style="margin:6px 0 0">노란 점 4개를 끌면 그 모서리가 움직이고, 안쪽을 끌면 전체가 이동합니다.</p>':''}`;
    const wrap=el.querySelector('.comp-wrap');c.setAttribute('role','img');c.setAttribute('aria-label','현장 사진 합성 이미지');wrap.appendChild(c);compositeCanvas=c;
    if(compEdit){const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox',`0 0 ${p.w} ${p.h}`);svg.setAttribute('style','position:absolute;inset:0;width:100%;height:100%;touch-action:none');
      const draw=q=>{svg.innerHTML=`<polygon points="${q.map(x=>x.join(',')).join(' ')}" fill="rgba(255,197,61,.12)" stroke="#FFC53D" stroke-width="${4*u}" stroke-dasharray="${14*u} ${10*u}" data-h="all" style="cursor:move"/>`+q.map((x,i)=>`<circle cx="${x[0]}" cy="${x[1]}" r="${30*u}" fill="rgba(0,0,0,.001)" data-h="${i}"/><circle cx="${x[0]}" cy="${x[1]}" r="${13*u}" fill="#FFC53D" stroke="#000" stroke-width="${3*u}" pointer-events="none"/>`).join('')};
      let q=pts.map(x=>[...x]),drag=null;draw(q);wrap.appendChild(svg);
      const at=e=>{const m=svg.getScreenCTM();if(!m)return[0,0];const pt=new DOMPoint(e.clientX,e.clientY).matrixTransform(m.inverse());return[pt.x,pt.y]};
      svg.addEventListener('pointerdown',e=>{const hd=e.target.dataset?.h;if(hd===undefined)return;e.preventDefault();svg.setPointerCapture(e.pointerId);drag={h:hd,s:at(e),q0:q.map(x=>[...x])}});
      svg.addEventListener('pointermove',e=>{if(!drag)return;const[x,y]=at(e),dx=x-drag.s[0],dy=y-drag.s[1];if(drag.h==='all')q=drag.q0.map(v=>[v[0]+dx,v[1]+dy]);else{q=drag.q0.map(v=>[...v]);q[+drag.h]=[drag.q0[+drag.h][0]+dx,drag.q0[+drag.h][1]+dy]}draw(q)});
      const end=()=>{if(!drag)return;drag=null;setCalib(p,q)};svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end)}}
  catch(err){if(tok===compTok)el.innerHTML='<p class="hint">사진 합성을 만들지 못했습니다. 다른 사진으로 벽 맞추기를 다시 해 보세요.</p>'}}
function setCalib(p,q){p.calib.pts=orderQuad(q.map(v=>[Math.round(v[0]),Math.round(v[1])]));if(!calibOf(p)){toast('모서리 모양이 이상해 되돌렸습니다');p.calib.pts=p.calib.orig||p.calib.pts}persist();renderComposite($('#compositeBox'),job.open)}
