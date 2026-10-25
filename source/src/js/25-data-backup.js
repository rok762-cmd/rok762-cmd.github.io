/* ---------- 데이터: 전체 백업·복원 · 사무실→태블릿 보내기/받기 ---------- */
const tsName=()=>{const d=new Date();return`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}`};
async function importDocs(docs){if(!docs||typeof docs!=='object')throw{code:'fmt'};let n=0,skip=0,newer=0;
  if(!DB){const js=Object.entries(docs).filter(([k])=>k.startsWith('jobs/'));if(js.length){const[,v]=js.sort((a,b)=>(b[1].updatedAt||0)-(a[1].updatedAt||0))[0];const mj=migrate(JSON.parse(JSON.stringify(v.job||v)));if(mj){job=mj;n=1}}return{n,skip:js.length-n,newer:job._newer?1:0,cur:true}}
  if(!LOCAL&&!CAN_WRITE)throw{code:'perm'};if(!LOCAL&&!netOn)throw{code:'net'};
  const up=async s_=>{if(LOCAL||!String(s_).startsWith('data:')||!ASSETS)return s_;const r=await ASSETS.upload(dataURLtoBlob(s_),{type:'image/jpeg'});return'asset:'+r.id};
  for(const[path,v0]of Object.entries(docs)){if(!v0||typeof v0!=='object'||path.startsWith('settings/'))continue;const v=JSON.parse(JSON.stringify(v0));const ref=DB.doc(path),prev=await ref.get();if(prev.exists&&(prev.data().updatedAt||0)>=(v.updatedAt||0)){skip++;continue}
    if(path.startsWith('jobs/')){if((+v.job?.v||0)>JOB_V)newer++;if(v.job?.photos)for(const ph of v.job.photos)ph.src=await up(ph.src)}if(Array.isArray(v.photos))v.photos=await Promise.all(v.photos.map(up));await ref.set(v);n++}
  return{n,skip,newer}}
const impMsg=(r,src)=>`${src} ${r.n}건을 넣었습니다${r.skip?` · 이미 최신인 ${r.skip}건은 건너뜀`:''}${r.newer?` · ${r.newer}건은 새 버전 앱에서 만든 현장이라 앱을 새로 고침(업데이트)하세요`:''}`;
const impErr=e=>e?.code==='fmt'?'실측 스튜디오 파일이 아닙니다':e?.code==='perm'?'저장 권한이 없습니다':e?.code==='net'?'인터넷이 연결된 뒤 다시 하세요':'가져오지 못했습니다: '+(e?.message||'');
async function backupAll(){let docs={};if(DB?.dump){const all=await DB.dump();Object.entries(all).forEach(([k,v])=>{if(!k.startsWith('settings/'))docs[k]=v})}
  else if(serverJobs)serverJobs.forEach(x=>{const{id,...v}=x;docs['jobs/'+id]=v});
  const ls={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(/^silcheuk/.test(k)&&k!==SYK&&k!=='silcheuk-localdb')ls[k]=localStorage.getItem(k)}}catch(e){}
  const data={kind:'silcheuk-backup',v:1,jobV:JOB_V,at:Date.now(),catalog:JSON.parse(JSON.stringify(catalog)),current:job,docs,ls,sync:SY.url?{url:SY.url,wifi:SY.wifi,pdf:SY.pdf}:null};
  const n=Object.keys(docs).filter(k=>k.startsWith('jobs/')).length;await saveFile(`실측스튜디오_전체백업_${tsName()}.json`,JSON.stringify(data));toast(`전체 백업 파일을 만들었습니다 · 현장 ${n}건 + 제품·단가${Object.keys(docs).some(k=>/^(as_|shop_)/.test(k))?' + AS':''}`)}
async function restoreAll(data){if(!data||typeof data!=='object')throw{code:'fmt'};
  if(data.kind==='silcheuk-backup'){let msg=[];if(data.catalog){store.set(CK,data.catalog);catalog=loadCatalog();upgradeCatalog();saveCatalog();syncBoard();msg.push('제품·단가')}
    if(data.sync&&!SY.url){SY={...SY,...data.sync};sySave()}
    const r=await importDocs(data.docs||{});msg.push(`현장·고객 ${r.n}건`);
    if(data.current&&!DB){const mj=migrate(data.current);if(mj)job=mj}
    toast(`복원했습니다: ${msg.join(' · ')}${r.skip?` (이미 최신 ${r.skip}건 건너뜀)`:''}${r.newer?' · 일부는 새 버전 앱 자료입니다':''}`);return}
  if(['silcheuk-offline','silcheuk-send'].includes(data.kind)){const r=await importDocs(data.docs);toast(impMsg(r,data.kind==='silcheuk-send'?'보낸 현장':'오프라인 현장'));return}
  if(data.cat&&data.faces){const mj=migrate(data);if(!mj)throw{code:'fmt'};job=mj;toast('현장을 불러왔습니다');return}
  throw{code:'fmt'}}
async function sendToTablet(){if(DB&&(LOCAL||CAN_WRITE))await saveJobToServer(undefined,{silent:true});
  let doc=null;try{if(DB){const g=await DB.doc('jobs/'+job.id).get();if(g.exists)doc=g.data()}}catch(e){}
  if(!doc)doc={job:JSON.parse(JSON.stringify(job)),title:job.customer.name||'이름 없는 현장',addr:job.customer.addr||'',cat:job.cat,layout:job.layout,faces:facesSpec(job),total:siteGrand(),status:job.serverStatus||'draft',updatedAt:Date.now(),createdAt:Date.now()};
  {const inl=async ph=>{if(!String(ph.src).startsWith('asset:'))return;try{const b=await(await fetch(photoSrc(ph))).blob();ph.src=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(b)})}catch(e){}};
    for(const ph of doc.job?.photos||[])await inl(ph);for(const it of doc.job?.items||[])for(const ph of it.photos||[])await inl(ph)}
  const data={kind:'silcheuk-send',v:1,jobV:JOB_V,at:Date.now(),docs:{['jobs/'+job.id]:doc}},nm=`${syName(doc.title)||'현장'}_${job.id}.json`;
  if(syReady()){try{toast('드라이브로 보내는 중…');await syPost({action:'file',group:'보낼현장',name:nm,mime:'application/json',b64:u8b64(JSON.stringify(data))});toast('드라이브 ‘보낼현장’에 올렸습니다 · 태블릿에서 ‘사무실에서 받기’를 누르면 들어옵니다');return}catch(e){toast('드라이브로 못 보내 파일로 저장합니다: '+e.message)}}
  if(!DL){toast('이 화면에서는 파일 저장을 쓸 수 없습니다. 드라이브 업로드를 설정하거나 claude.ai·앱에서 여세요.');return}await saveFile('태블릿으로_'+nm,JSON.stringify(data));toast('파일을 만들었습니다 · 카톡·메일로 태블릿에 보내고 ‘현장 받기’에서 여세요')}
let syInboxBusy=false;
async function syInbox(manual){if(!syReady()||syInboxBusy)return 0;if(!navigator.onLine){if(manual)toast('인터넷이 연결되지 않았습니다');return 0}syInboxBusy=true;let n=0;
  try{const r=await syPost({action:'inbox'});for(const f of r.files||[]){try{const data=JSON.parse(decodeURIComponent(escape(atob(f.b64))));const x=await importDocs(data.docs||{});n+=x.n;await syPost({action:'take',fid:f.fid})}catch(e){}}
    if(manual||n)toast(n?`사무실에서 보낸 현장 ${n}건을 받았습니다 · 현장 목록에서 여세요`:'받을 현장이 없습니다')}
  catch(e){if(manual)toast(/action/.test(e.message)?'드라이브 수신기가 예전 버전입니다 · 새 apps-script.gs로 바꿔 주세요':'받기 실패: '+e.message)}
  syInboxBusy=false;return n}

