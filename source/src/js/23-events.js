document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act;
  if(a==='photo-tap'){photoTap(e);return}if(a==='sheet-back'){if(e.target===b)sheetCb?.cancel();return}ACT[a]?.(b,e)});
document.addEventListener('input',e=>{const t=e.target;if(t.dataset.bind){job.customer[t.dataset.bind]=t.value;renderSide();persist()}});
Object.assign(ACT,HACT,BACT);
document.addEventListener('change',async e=>{const t=e.target,c=t.dataset.change;if(!c)return;if(mode==='house'&&houseChange(c,t))return;if(mode==='bath'&&bathChange(c,t))return;
  if(c==='dim'){const v=Math.round(+t.value);if(v>0){job.dims[t.dataset.k]=v}render()}
  if(c==='face-len'){const v=Math.round(+t.value),fc=job.faces.find(x=>x.key===t.dataset.k);if(v>0&&fc){fc.len=v;job.photos.forEach(p=>p.marks=p.marks.filter(m=>!(m.type==='W'&&(m.face||'A')===fc.key)));if(fc.tp?.w){delete fc.tp.w;if(!fc.tp.h&&!fc.tp.d)delete fc.tp}}render()}
  if(c==='isl'){const v=Math.round(+t.value);if(v>=0&&(v>0||['over','side'].includes(t.dataset.k)))job.island[t.dataset.k]=v;render()}
  if(c==='isl-sup'){job.island.support=t.value;render()}
  if(c==='tbl'){const k=t.dataset.k;if(['len','depth'].includes(k)){const v=Math.round(+t.value);if(v>0)job.table[k]=v}else job.table[k]=t.value;render()}
  if(c==='span'){const v=Math.round(+t.value);if(v>0)job.span=v;render()}
  if(c==='mark'){job.photos.forEach(p=>p.marks.forEach(m=>{if(m.id===t.dataset.id){if(m.type==='note')m.text=t.value;else{const v=Math.round(+t.value);if(v>0)m.v=v}}}));recomputeDims();render()}
  if(c==='raise'){const m=cf().rows[job.sel.row].mods[job.sel.i];const v=Math.round(+t.value);if(v>=0){m.raise=clamp(v,0,600);cf().edited=true}render()}
  if(c==='hsel'){job.hs[t.dataset.z]=t.value;render();return}
  if(c==='hinset'){const v=Math.round(+t.value);if(v>=15&&v<=300)job.hs.inset=v;render();return}
  if(c==='mod-handle'){const m=cf().rows[job.sel.row].mods[job.sel.i];if(t.value)m.handleId=t.value;else delete m.handleId;cf().edited=true;render();return}
  if(c==='hdl-price'){const h=handleById(t.dataset.id);if(h){h.price=Math.max(0,Math.round(+t.value)||0);saveCatalog()}return}
  if(c==='cfill'){const v=t.value.trim();job.corner.fill=v===''?null:clamp(Math.round(+v)||0,0,300);render();return}
  if(c==='unit-price'){const u=unitById(t.dataset.id);if(u){u.price=Math.max(0,Math.round(+t.value)||0);saveCatalog()}return}
  if(c==='cleg'){const v=Math.round(+t.value);if(v>=400&&v<=1500)job.corner[t.dataset.k]=v;render()}
  if(c==='obs-in'){const o=(job.obstacles||[]).find(x=>x.id===t.dataset.id);if(!o)return;const v=Math.round(+t.value),k=t.dataset.k,L=+job.faces.find(f=>f.key===o.face)?.len||3000;if(!(v>=0)){render();return}
    if(k==='cx')o.x=clamp(v-Math.round(o.w/2),0,Math.max(0,L-o.w));else if(k==='z')o.z=clamp(v,0,3000);else if(k==='w'&&v>=20){const c0=o.x+o.w/2;o.w=v;o.x=clamp(Math.round(c0-v/2),0,Math.max(0,L-v))}else if(k==='h'&&v>=20)o.h=v;
    if(['dist','water','gas','duct'].includes(o.type)){const p=fitPlan(job,o);if(p&&!p.ok)toast(applyFit(job,o))}render();return}
  if(c==='obs-quick'||c==='obs-quick-w'){const face=cf().key,tt=t.dataset.t,ex=job.obstacles.find(x=>x.face===face&&x.type===tt);let o;
    if(c==='obs-quick')o=quickObs(tt,face,+t.value,ex?.w);else{if(!ex){render();return}o=quickObs(tt,face,ex.x+ex.w/2,+t.value)}
    if(o){const p=fitPlan(job,o);toast(p&&!p.ok?applyFit(job,o):p?.ok?(tt==='water'?'배관이 이미 싱크장 안에 있습니다':'분배기가 이미 한 칸 안에 있습니다'):'위치를 저장했습니다')}render();return}
  if(c==='fr-c'){job.fridge={...(job.fridge||{}),custom:{...(job.fridge?.custom||{}),[t.dataset.k]:+t.value||''}};render();return}
  if(c==='kh-in'){job.kh={...khOf(job),[t.dataset.k]:+t.value||''};render();return}
  if(c==='sink-pipe'){const v=Math.round(+t.value);const face=cf().key;let o=job.obstacles.find(x=>x.face===face&&x.type==='water');if(!(v>0)){if(o&&o.auto)job.obstacles=job.obstacles.filter(x=>x!==o);render();return}
    if(!o){o={id:uid(),face,type:'water',z:100,w:200,h:400,note:'싱크 배관 (직접 입력)',auto:true};job.obstacles.push(o)}o.x=Math.max(0,v-o.w/2);const p=fitPlan(job,o);toast(p&&!p.ok?applyFit(job,o):'배관이 이미 싱크장 안에 있습니다');render();return}
  if(c==='mod-w'){const rr=cf().rows[job.sel.row];if(job.cat==='kitchen'&&rr&&(rr.zone==='upper'||rr.zone==='top')&&job.upAlign!==false&&!rr.manualW){rr.manualW=true;toast('이 줄은 직접 입력한 폭을 따릅니다 · ‘하부장 문 선에 맞춤’을 다시 누르면 맞춰집니다')}setModWidth(job.sel.row,job.sel.i,+t.value);render()}
  if(c==='photo-add'){const files=[...t.files];if(!files.length)return;if(job.photos.length&&job.photos.every(p=>p.src==='sample')){job.photos=[];job.obstacles=job.obstacles.filter(o=>o.photo!=='sample');const cd=CATS[job.cat];job.dims={H:cd.H,D:cd.D}}
    for(const file of files){try{job.photos.push(await loadImageFile(file))}catch(err){toast('사진을 열지 못했습니다')}}job.active=job.photos.length-1;tool='W';pending=null;render()}
  if(c==='price'){const path=t.dataset.path.split('.');let o=catalog.prices;while(path.length>1){const k=path.shift();o=o[k]||(o[k]={})}o[path[0]]=Math.max(0,+t.value||0);syncBoard();saveCatalog();renderSide();if(step===4||step===3)renderStage()}
  if(c==='job-status'&&DB){DB.doc('jobs/'+t.dataset.id).update({status:t.value,updatedAt:Date.now()}).catch(()=>toast('상태를 바꾸지 못했습니다'))}
  if(c==='company'){catalog.company[t.dataset.k]=t.value;saveCatalog()}
  if(c==='vat'){catalog.prices.vat=t.checked;saveCatalog();renderSide()}
  if(c==='bundle-import'){const file=t.files[0];if(!file)return;t.value='';try{const data=JSON.parse(await file.text());if(data?.kind!=='silcheuk-offline'||!data.docs)throw{code:'fmt'};
    if(!DB||LOCAL||!CAN_WRITE){toast('claude.ai에서 연 본 앱에서만 가져올 수 있습니다.');return}if(!netOn){toast('인터넷이 연결된 뒤 가져와 주세요.');return}
    toast('오프라인 현장을 가져오는 중…');let n=0,skip=0;const up=async s=>{if(!String(s).startsWith('data:')||!ASSETS)return s;const r=await ASSETS.upload(dataURLtoBlob(s),{type:'image/jpeg'});return'asset:'+r.id};
    for(const[path,v]of Object.entries(data.docs)){const ref=DB.doc(path),prev=await ref.get();if(prev.exists&&(prev.data().updatedAt||0)>=(v.updatedAt||0)){skip++;continue}
      if(path.startsWith('jobs/')&&v.job?.photos)for(const ph of v.job.photos)ph.src=await up(ph.src);if(Array.isArray(v.photos))v.photos=await Promise.all(v.photos.map(up));await ref.set(v);n++}
    toast(`${n}건을 가져왔습니다${skip?` · 이미 최신인 ${skip}건은 건너뜀`:''}`)}catch(err){toast(err?.code==='fmt'?'오프라인 내보내기 파일이 아닙니다':'가져오지 못했습니다. 잠시 후 다시 시도해 주세요.')}return}
  if(c==='restore-all'){const file=t.files[0];if(!file)return;t.value='';try{toast('불러오는 중…');await restoreAll(JSON.parse(await file.text()));openManager();render()}catch(err){toast(impErr(err))}return}
  if(c==='tp'){const v=Math.round(+String(t.value).replace(/[^0-9.]/g,'')||0);tpSet(t.dataset.face,t.dataset.k,+t.dataset.i,v);openSec.add('tp');setTimeout(()=>{const a=document.activeElement?.dataset?.tp;render();if(a)document.querySelector(`input[data-tp="${a}"]`)?.focus()},0);return}
  if(c==='room-on'){const R=roomOf(job);job.room={...R,...(job.room||{}),on:t.checked};if(t.checked&&!job.room.W){job.room.W=R.W;job.room.L=R.L}render();return}
  if(c==='room'){job.room={...(job.room||{}),[t.dataset.k]:Math.max(0,Math.round(+t.value||0))};render();return}
  if(c==='ritem'){const it=(job.room?.items||[]).find(x=>x.id===t.dataset.id);if(it){it[t.dataset.k]=t.dataset.k==='wall'?t.value:Math.max(0,Math.round(+t.value||0))}render();return}
  if(c==='bgap-in'){job.bgap={...(job.bgap||{}),[t.dataset.k]:Math.max(0,+t.value||0)};render();return}
  if(c==='top-on'){const f=cf();if(t.checked){const base=f.rows.find(r=>r.zone===(job.cat==='kitchen'?'upper':'full'));const gb=geom().rows.find(r=>r.zone===base?.zone);f.rows.push({zone:'top',mods:(gb?gb.mods:[{w:600}]).map(m=>{const x=md('topbox',m.w);return x})});f.topH=f.topH||400;f.topD=f.topD||450}else{f.rows=f.rows.filter(r=>r.zone!=='top')}job.sel={row:0,i:0};f.edited=true;render();return}
  if(c==='top-in'){const v=+t.value;if(v>0){cf()[t.dataset.k]=v;cf().edited=true}render();return}
  if(c==='door-up'||c==='door-tall'){const k=c==='door-up'?'doorUpperId':'doorTallId';if(t.value)job[k]=t.value;else delete job[k];render();return}
  if(c==='mod-door'){const m=cf().rows[job.sel.row].mods[job.sel.i];if(t.value)m.doorId=t.value;else delete m.doorId;cf().edited=true;render();return}
  if(c==='mod-open'){const m=cf().rows[job.sel.row].mods[job.sel.i];const v=t.value;if(!v){delete m.openH;delete m.openPos}else{m.openPos=v;m.openH=+m.openH||(cf().rows[job.sel.row].zone==='upper'?300:350)}cf().edited=true;render();return}
  if(c==='mod-openh'){const m=cf().rows[job.sel.row].mods[job.sel.i];const v=+t.value;if(v>0)m.openH=v;cf().edited=true;render();return}
  if(c==='q-inst'||c==='q-demo'){const v=Math.max(0,Math.round(+String(t.value).replace(/[^0-9]/g,'')||0));if(c==='q-inst'){if(v)job.installOv=v;else delete job.installOv}else{if(v)job.demo=v;else delete job.demo}render();return}
  if(c==='mod-flapforce'){const m=cf().rows[job.sel.row].mods[job.sel.i];if(t.checked)m.flapForce=true;else delete m.flapForce;cf().edited=true;render();return}
  if(c==='mod-fold'){const m=cf().rows[job.sel.row].mods[job.sel.i];if(t.checked)m.fold=true;else delete m.fold;cf().edited=true;render();return}
  if(c==='mod-flap'){const m=cf().rows[job.sel.row].mods[job.sel.i];if(t.checked){m.flap=true;delete m.hinge}else delete m.flap;cf().edited=true;render();return}
  if(c==='mod-glass'){const m=cf().rows[job.sel.row].mods[job.sel.i];if(t.checked){m.glass=true;if(lightOpts(job.cat,cf().rows[job.sel.row].zone,geom().rows[job.sel.row].mods[job.sel.i]).includes('shelf')&&!(m.lights||[]).length)m.lights=['shelf']}else delete m.glass;render();return}
  if(c==='prop-price'){job.propPrice=t.checked;render();return}
  if(c==='sketch-in'){const f_=t.files[0];t.value='';if(f_)readSketch(f_);return}
  if(c==='te-on'){job.tallEnd={face:'A',k:'combo',w:600,side:'L',...(job.tallEnd||{}),on:t.checked};if(t.checked&&isCornerLay(job))job.tallEnd.side='R';if(t.checked)flowFix();render();return}
  if(c==='te-x'){job.tallEnd={...(job.tallEnd||{}),side:'M',x:Math.max(0,Math.round(+t.value||0))};render();return}
  if(c==='t2-on'){job.tall2={k:'pantry',w:600,...(job.tall2||{}),on:t.checked};render();return}
  if(c==='te-w'){job.tallEnd={...(job.tallEnd||{}),w:Math.max(300,Math.min(TALL_MAX,Math.round((+t.value||600)/50)*50))};render();return}
  if(c==='pen-on'){job.pen={over:300,...(job.pen||{}),on:t.checked};render();return}
  if(c==='pen-over'){job.pen={...(job.pen||{}),over:Math.max(0,Math.min(600,Math.round(+t.value||0)))};render();return}
  if(c==='tall-w'){job.corner.tallW=Math.max(300,Math.min(1200,Math.round((+t.value||600)/5)*5));render();return}
  if(c==='corner-lid'){job.corner.lid=t.checked;render();return}
  if(c==='cat-import'||c==='job-import'){const file=t.files[0];if(!file)return;try{const data=JSON.parse(await file.text());
    if(c==='cat-import'){store.set(CK,data);catalog=loadCatalog();saveCatalog();toast('제품·단가를 불러왔습니다')}
    else{const mj=migrate(data);if(!mj)throw 0;job=mj;toast('현장을 불러왔습니다')}openManager();render()}catch(err){toast('파일 형식이 맞지 않습니다')}}
});
document.addEventListener('click',e=>{const t=e.target;if(!(t instanceof HTMLInputElement)||t.type!=='file'||!matchMedia('(pointer:coarse)').matches)return;let opened=false;const on=()=>{opened=true};
  addEventListener('blur',on,{once:true});document.addEventListener('visibilitychange',on,{once:true});
  setTimeout(()=>{removeEventListener('blur',on);document.removeEventListener('visibilitychange',on);if(!opened&&!document.hidden&&document.hasFocus())toast('이 화면에서는 사진 선택 창이 열리지 않습니다. Claude 앱 대신 Chrome 브라우저에서 열어 주세요.')},2000)},true);

