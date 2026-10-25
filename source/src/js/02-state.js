/* ---------- state ---------- */
const CK='silcheuk-catalog-v1', JK='silcheuk-job-v1';
function defaultCatalog(){return{tiles:clone(DEFAULT_TILES),apps:clone(DEFAULT_APPS),supports:clone(DEFAULT_SUPPORTS),units:clone(DEFAULT_UNITS),trucks:clone(DEFAULT_TRUCKS),handles:clone(DEFAULT_HANDLES),doors:clone(DEFAULT_DOORS),plans:[],counters:clone(DEFAULT_COUNTERS),prices:clone(DEFAULT_PRICES),company:clone(DEFAULT_COMPANY)}}
function loadCatalog(){const c=store.get(CK);const d=defaultCatalog();if(!c)return d;
  return{ver:c.ver||0,tiles:Array.isArray(c.tiles)&&c.tiles.length?c.tiles:d.tiles,apps:Array.isArray(c.apps)&&c.apps.length?c.apps:d.apps,supports:Array.isArray(c.supports)&&c.supports.length?c.supports:d.supports,doors:Array.isArray(c.doors)&&c.doors.length?c.doors:d.doors,plans:Array.isArray(c.plans)?c.plans:[],asCfg:c.asCfg||null,units:Array.isArray(c.units)?c.units:d.units,trucks:Array.isArray(c.trucks)&&c.trucks.length?c.trucks:d.trucks,handles:Array.isArray(c.handles)&&c.handles.length?c.handles:d.handles,counters:Array.isArray(c.counters)&&c.counters.length?c.counters:d.counters,
    prices:{...d.prices,...(c.prices||{}),body:{...d.prices.body,...(c.prices?.body||{})},install:{...d.prices.install,...(c.prices?.install||{})}},company:{...d.company,...(c.company||{})}}}
let catalog=loadCatalog();
function upgradeCatalog(){if((catalog.ver||0)<2){DEFAULT_COUNTERS.forEach(c=>{if(!catalog.counters.some(x=>x.id===c.id))catalog.counters.push(clone(c))});catalog.counters.forEach(c=>{if(!c.type)c.type=ctType(c)});catalog.ver=2}if((catalog.ver||0)<3){catalog.units=catalog.units||[];DEFAULT_UNITS.forEach(u=>{if(!catalog.units.some(x=>x.id===u.id))catalog.units.push(clone(u))});catalog.ver=3}if((catalog.ver||0)<4){catalog.handles=catalog.handles||[];DEFAULT_HANDLES.forEach(h=>{if(!catalog.handles.some(x=>x.id===h.id))catalog.handles.push(clone(h))});catalog.ver=4}if((catalog.ver||0)<6){['d1','d2','d3','t1','t2'].forEach(id=>{const d=catalog.doors.find(x=>x.id===id);if(d&&!d.cats.includes('laundry'))d.cats.push('laundry')});}
  if((catalog.ver||0)<7){['d1','d2','d3','d4','t1','t2'].forEach(id=>{const d=catalog.doors.find(x=>x.id===id);if(d&&!d.cats.includes('single'))d.cats.push('single')});catalog.prices.body=catalog.prices.body||{};if(catalog.prices.body.single==null)catalog.prices.body.single=90000;catalog.prices.body=catalog.prices.body||{};if(catalog.prices.body.laundry==null)catalog.prices.body.laundry=95000}
  if((catalog.ver||0)<5){DEFAULT_DOORS.filter(d=>d.tex==='tambour').forEach(d=>{if(!catalog.doors.some(x=>x.id===d.id))catalog.doors.push(clone(d))});catalog.ver=5}if((catalog.ver||0)<7)catalog.ver=7;if((catalog.ver||0)<9){catalog.apps=(catalog.apps||[]).filter(x=>!['a15','a16','a17','a18','a19','a20'].includes(x.id));DEFAULT_APPS.filter(a=>a.kind==='sink').forEach(a=>{const x=catalog.apps.find(x=>x.id===a.id);if(!x)catalog.apps.push(clone(a));else if(!x.tag&&(a.id==='a1'||a.id==='a2'))x.tag=a.tag});catalog.ver=9}if((catalog.ver||0)<14){catalog.apps=catalog.apps||[];DEFAULT_APPS.filter(a=>a.kind==='fridge').forEach(a=>{if(!catalog.apps.some(x=>x.id===a.id))catalog.apps.push(clone(a))})}if((catalog.ver||0)<13){catalog.apps=(catalog.apps||[]).filter(x=>!['f1','f2','f3'].includes(x.id));DEFAULT_APPS.filter(a=>a.kind==='fridge').forEach(a=>{if(!catalog.apps.some(x=>x.id===a.id))catalog.apps.push(clone(a))})}if((catalog.ver||0)<12){catalog.apps=catalog.apps||[];DEFAULT_APPS.filter(a=>['purifier','disposer','fridge'].includes(a.kind)).forEach(a=>{if(!catalog.apps.some(x=>x.id===a.id))catalog.apps.push(clone(a))})}if((catalog.ver||0)<11){DEFAULT_DOORS.filter(d=>d.cats.includes('storage')).forEach(d=>{if(!catalog.doors.some(x=>x.id===d.id))catalog.doors.push(clone(d))});catalog.prices.body=catalog.prices.body||{};}if((catalog.ver||0)<10){catalog.apps=catalog.apps||[];DEFAULT_APPS.filter(a=>a.kind==='cooktop').forEach(a=>{const x=catalog.apps.find(x=>x.id===a.id);if(!x)catalog.apps.push(clone(a));else if(!x.tag&&a.tag)x.tag=a.tag});catalog.ver=10}if((catalog.ver||0)<11)catalog.ver=11;if((catalog.ver||0)<12)catalog.ver=12;if((catalog.ver||0)<13)catalog.ver=13;if((catalog.ver||0)<15){catalog.apps=catalog.apps||[];DEFAULT_APPS.filter(a=>a.id==='b11').forEach(a=>{if(!catalog.apps.some(x=>x.id===a.id))catalog.apps.push(clone(a))})}if((catalog.ver||0)<15)catalog.ver=15;if((catalog.ver||0)<16){catalog.apps=catalog.apps||[];DEFAULT_APPS.filter(a=>['hd2','hd3','hd4','hd5'].includes(a.id)).forEach(a=>{if(!catalog.apps.some(x=>x.id===a.id))catalog.apps.push(clone(a))});catalog.ver=16}if((catalog.ver||0)<17){catalog.apps=catalog.apps||[];DEFAULT_APPS.filter(a=>/^hz\d/.test(a.id)).forEach(a=>{if(!catalog.apps.some(x=>x.id===a.id))catalog.apps.push(clone(a))});catalog.ver=17}if((catalog.ver||0)<18){const D=Object.fromEntries(DEFAULT_APPS.filter(a=>/^hz\d/.test(a.id)).map(a=>[a.id,a]));(catalog.apps||[]).forEach(a=>{const d=D[a.id];if(d){a.style=d.style;if(d.sh)a.sh=d.sh;if(d.shape)a.shape=d.shape;if(d.dia)a.dia=d.dia}});catalog.ver=18}if((catalog.ver||0)<19){catalog.apps=(catalog.apps||[]).filter(a=>a.id!=='hd4');['hz15','hz16','hz17','hz18'].forEach(id=>{const a=catalog.apps.find(x=>x.id===id);if(a){a.style='can';a.sh='box'}});catalog.ver=19}if((catalog.ver||0)<20){const D=Object.fromEntries(DEFAULT_APPS.filter(a=>/^hz\d/.test(a.id)).map(a=>[a.id,a]));(catalog.apps||[]).forEach(a=>{if(D[a.id])a.cab=D[a.id].cab});catalog.ver=20}}
upgradeCatalog();
const syncBoard=()=>{T=clamp(+catalog.prices.board||20,9,40)};syncBoard();
const plRange=cat=>PL_RANGE[cat]||[0,0];
const plDefault=cat=>cat==='kitchen'?+catalog.prices.plinthKitchen:+catalog.prices.plinthBox;
const plinthOf=j=>{const[a,b]=plRange(j.cat);if(j.cat==='kitchen')return kitchenH(j).leg;return b?clamp(+j.plinth||plDefault(j.cat)||a,a,b):0};
const cf=(j=job)=>j.faces[j.fi]||j.faces[0];
let catT=0;const saveCatalog=()=>{store.set(CK,catalog);if(typeof DB!=='undefined'&&DB&&CAN_WRITE){clearTimeout(catT);catT=setTimeout(()=>DB.doc('settings/catalog').set({catalog:JSON.parse(JSON.stringify(catalog)),updatedAt:Date.now()}).catch(()=>toast('제품·단가를 서버에 저장하지 못했습니다')),700)}};
const plansFor=cat=>[...BUILTIN_PLANS.filter(p=>p.cat===cat),...catalog.plans.filter(p=>p.cat===cat)];
const planById=id=>BUILTIN_PLANS.find(p=>p.id===id)||catalog.plans.find(p=>p.id===id);
const doorById=id=>catalog.doors.find(d=>d.id===id);
const doorsFor=cat=>catalog.doors.filter(d=>d.cats.includes(cat));
const counterById=id=>catalog.counters.find(c=>c.id===id);
const unitById=id=>(catalog.units||[]).find(u=>u.id===id);
const unitsFor=(cat,zone)=>(catalog.units||[]).filter(u=>u.cat===cat&&(cat!=='kitchen'||u.zone===zone));
const supportById=id=>(catalog.supports||[]).find(s=>s.id===id);
const modRaise=m=>m.raise!=null?+m.raise:(m.t==='hood'?+(catalog?.prices?.hoodRaise||0):0);
const appById=id=>(catalog.apps||[]).find(a=>a.id===id);
const tileById=id=>(catalog.tiles||[]).find(t=>t.id===id);
const HOOD_K={builtin:'빌트인 (장 속 히든)',chimney:'장식 후드 (침니)',wide:'와이드 슬림 후드',can:'통후드 (캔후드 · 장 폭에 딱 맞춤)'};const HOOD_COL={st:['스텐','#B9BEC2'],wh:['화이트','#F1F1EF'],bk:['블랙','#2A2B2D']};
const FR_COL={wh:['화이트','#F0F0EE'],bg:['새틴 베이지','#E6DFD3'],gr:['새틴 그레이','#B9BBBA'],st:['메탈 스텐','#C5C9CC'],bk:['차콜 블랙','#2E3033'],nv:['네이비','#2E3A4F']};
const hoodK=m=>m.t!=='hood'?'':(m.hk||modApps(m).find(x=>x.a.kind==='hood')?.a?.style||'builtin');const hoodCol=m=>(HOOD_COL[m.hcol]||HOOD_COL.st)[1];
function modApps(m){const list=m.apps===undefined?(MOD_DEFAULT_APPS[m.t]||[]).map(id=>({id,own:'co'})):m.apps;return list.map(x=>({...x,a:appById(x.id)})).filter(x=>x.a)}
const FAUCET={back:'뒤 가운데',left:'뒤 왼쪽',right:'뒤 오른쪽',none:'구멍 없음'};
function cutPos(m,a){const fg=m.cutFront!=null&&m.cutFront!==''?+m.cutFront:(a.kind==='sink'?80:60),dx=+m.cutDx||0;return{dx,fg,cw:+a.cw||a.w-20,cd:+a.cd||a.d-20,faucet:m.faucet||'back'}}
function cutTxt(m,a){const p=cutPos(m,a);return`칸 중심${p.dx?(p.dx>0?' 오른쪽 '+p.dx:' 왼쪽 '+(-p.dx)):''} · 앞에서 ${p.fg}${a.kind==='sink'?` · 수전 ${FAUCET[p.faucet]}`:''}`}
const trucks=()=>catalog.trucks&&catalog.trucks.length?catalog.trucks:(catalog.trucks=clone(DEFAULT_TRUCKS));
function loadLen(j){return j.faces.reduce((a,f,fi)=>{const g=geom(j,fi);return a+g.Wm*(g.rows.some(r=>r.zone==='upper')&&g.rows.some(r=>r.zone==='lower')?1.6:1)},0)}
function truckAuto(j){const L=loadLen(j),T=trucks().slice().sort((a,b)=>(+a.maxLen||0)-(+b.maxLen||0));return T.find(t=>L<=(+t.maxLen||0))||T[T.length-1]}
function shipFee(j){const km=+j.customer?.km||0,auto=truckAuto(j),tr=trucks().find(t=>t.id===j.truck)||auto,n=Math.max(1,+j.truckN||1);let unit,tier;
  if(km>70){unit=(+tr.over||0)+Math.ceil(km-70)*(+tr.perKm||0);tier='70km 넘음'}else if(km>50){unit=+tr.t70||0;tier='50~70km'}else if(km>30){unit=+tr.t50||0;tier='30~50km'}else{unit=+tr.t30||0;tier='30km 이하'}
  return{km,tr,n,unit,tier,auto:!j.truck,autoTr:auto,total:unit*n}}
function appFit(m){const out=[];modApps(m).forEach(({a})=>{if(['sink','cooktop'].includes(a.kind)&&a.w&&m.w){const p=cutPos(m,a);if(Math.abs(p.dx)+p.cw/2>m.w/2-T)out.push(`${a.name} 타공이 칸 밖으로 ${Math.round(Math.abs(p.dx)+p.cw/2-(m.w/2-T))}mm 나갑니다 · 좌우 이동을 줄이세요`)}});modApps(m).forEach(({a})=>{const need=a.kind==='sink'?sinkNeed(a):a.kind==='cooktop'?cookReq(a):['dw','wash','oven'].includes(a.kind)?a.w+(a.kind==='oven'?2*T:0):a.kind==='dryer'?a.w+2*T:0;if(need&&m.w<need)out.push(`${a.name}은(는) 폭 ${need}mm 이상 필요 (지금 ${m.w})`)});return out}
function defaultDoor(cat){const p=DEFAULT_DOOR_BY_CAT[cat];return (doorById(p)&&doorById(p).cats.includes(cat))?p:(doorsFor(cat)[0]?.id||null)}

function defaultPlanFor(cat,key){if(cat==='kitchen'&&key==='I')return planById('kt-i');if(cat==='kitchen'&&key!=='A')return planById('kt-s');return plansFor(cat)[0]}
function newFace(cat,key,len){const p=defaultPlanFor(cat,key);let rows=clone(p.rows);if(key==='I')rows=rows.filter(r=>r.zone!=='upper');
  return{key,len:len??(key==='A'?CATS[cat].W:SIDE_LEN[cat]),planId:p.id,rows,edited:false}}
function newJob(cat='closet'){const c=CATS[cat];
  return{cat,layout:'I',faces:[newFace(cat,'A')],fi:0,lt:{cct:'3000',ctrl:'door',plinth:false,show:true},hs:{upper:'h2',lower:'h2',full:'h3',drawer:'h2',dir:'v',inset:40,dz:'top',auto:true},corner:{lower:'blind',upper:'blind',legL:900,legU:600},util:{line:'no',breaker:'no',gas:'yes'},tile:{on:false,tileId:'t1',top:'upper'},island:{cab:600,over:300,side:0,gap:1000,counterId:null,support:''},table:{on:false,face:'A',dir:'inline',len:1200,depth:800,h:'same',support:'s1'},span:1500,doorId:defaultDoor(cat),counterId:catalog.counters[0]?.id,handle:'push',
    id:uid(),finish:'full',dims:{H:c.H,D:c.D},plinth:null,obstacles:[],customer:{name:'',addr:'',date:today(),memo:''},photos:[],active:0,open:false,sel:{row:0,i:0},docNo:'D'+Date.now().toString().slice(-6),v:JOB_V}}
const JOB_V=2;
function migrate(j){if(!j||!CATS[j.cat])return null;
  if(!Array.isArray(j.faces)){if(!j.rows)return null;j.faces=[{key:'A',len:+j.dims?.W||CATS[j.cat].W,planId:j.planId,rows:j.rows,edited:!!j.edited}];j.layout='I';delete j.rows;delete j.planId;delete j.edited}
  if(!Array.isArray(j.reqs))j.reqs=[];
  if(!j.lt)j.lt={cct:'3000',ctrl:'door',plinth:false,show:true};
  if(!j.hs){const m={bar:'h2',push:'h11',groove:'h10'}[j.handle]||'h2';j.hs={upper:m,lower:m,full:m==='h2'?'h3':m,drawer:m,dir:'v',inset:40,dz:'top',auto:true}}
  if(!LAYOUTS[j.layout])j.layout='I';j.fi=Math.min(j.fi||0,j.faces.length-1);j.island=j.island||{gap:1000};if(j.island.cab==null){const ov=+catalog.prices.islandOverhang||300;j.island.over=ov;j.island.cab=Math.max(300,(+j.island.D||900)-ov);j.island.side=0}j.table=j.table||{on:false,face:'A',dir:'inline',len:1200,depth:800,h:'same',support:'s1'};if(!('support' in j.table))j.table.support=j.table.legs==='panel'?'s3':'s1';if(!('support' in j.island))j.island.support='';j.util=j.util||{line:'no',breaker:'no',gas:'yes'};j.corner=j.corner||{lower:'blind',upper:'blind',legL:900,legU:600};j.tile=j.tile||{on:false,tileId:'t1',top:'upper'};j.span=j.span||1500;j.obstacles=j.obstacles||[];j.id=j.id||uid();j.finish=j.finish||'full';j.dims=j.dims||{H:CATS[j.cat].H,D:CATS[j.cat].D};
  j.faces.forEach(f=>{if(!planById(f.planId))f.planId=defaultPlanFor(j.cat,f.key).id});
  if((+j.v||0)>JOB_V)j._newer=true;else delete j._newer;
  /* v1→v2: 상부장 줄맞춤(기본 켬)·3점 실측 칸 추가 — 예전 현장은 손대지 않고 기본값만 채움 */
  if((+j.v||0)<2){j.faces.forEach(f=>{if(f.tp&&typeof f.tp!=='object')delete f.tp})}
  j.v=Math.max(+j.v||0,JOB_V);return j}
function sampleJob(){const j=newJob('closet');
  j.customer={name:'예시) 김○○ 고객님',addr:'파주시 ○○동 ○○아파트 101동 1203호',date:today(),memo:'안방 붙박이장 · 천장 몰딩 없음'};
  j.photos=[{id:'sample',src:'sample',w:1600,h:1200,marks:[
    {id:uid(),type:'W',face:'A',a:[405,262],b:[1195,262],v:2702},{id:uid(),type:'W',face:'A',a:[405,560],b:[1195,560],v:2700},{id:uid(),type:'W',face:'A',a:[405,882],b:[1195,882],v:2705},
    {id:uid(),type:'H',a:[470,204],b:[470,916],v:2305},{id:uid(),type:'H',a:[1130,204],b:[1130,916],v:2300},
    {id:uid(),type:'D',a:[398,922],b:[130,1109],v:600},{id:uid(),type:'note',a:[300,872],text:'콘센트 · 바닥에서 300'}],calib:{face:'A',pts:[[400,920],[1200,920],[1200,200],[400,200]]}}];
  j.obstacles=[{id:uid(),face:'A',type:'access',x:2080,z:1950,w:400,h:300,note:'천장 점검구 아래',photo:'sample',a:[1016,216],b:[1134,310]}];
  recomputeDims(j);return j}
let job=migrate(store.get(JK))||sampleJob();
let step=1, outTab='customer', tool=null, pending=null;
let saveT=0; function persist(){clearTimeout(saveT);saveT=setTimeout(()=>{if(!store.set(JK,job)&&job.photos.some(p=>p.src!=='sample')) toast('기기 저장 공간이 부족해 현장 임시저장이 안 됐습니다. 사진 수를 줄여주세요.');checkDirty()},300)}

function tpVals(f,k){return((f&&f.tp||{})[k]||[]).map(Number).filter(v=>v>0)}
function recomputeDims(j=job){const ms=j.photos.flatMap(p=>p.marks);
  j.faces.forEach(f=>{const v=[...ms.filter(m=>m.type==='W'&&(m.face||'A')===f.key&&m.v>0).map(m=>+m.v),...tpVals(f,'w')];if(v.length)f.len=Math.min(...v)});
  for(const k of ['H','D']){const v=[...ms.filter(m=>m.type===k&&m.v>0).map(m=>+m.v),...(k==='H'?j.faces.flatMap(f=>tpVals(f,'h')):[])];if(v.length)j.dims[k]=Math.min(...v)}}
function dimSource(k,face){const v=job.photos.flatMap(p=>p.marks).filter(m=>m.type===k&&m.v>0&&(k!=='W'||(m.face||'A')===face)).length+(k==='W'?tpVals(job.faces.find(f=>f.key===face)||{},'w').length:k==='H'?job.faces.reduce((a,f)=>a+tpVals(f,'h').length,0):0);return v?`${v}곳 측정 · 최소값`:'직접 입력'}
function setLayout(lay){job.layout=lay;job.faces=LAYOUT_FACES[lay].map(k=>job.faces.find(f=>f.key===k)||newFace(job.cat,k,k==='I'?1800:undefined));job.fi=0;job.sel={row:0,i:0}}
function kD(j){const base=+j.dims.D||CATS[j.cat].D;if(j.cat!=='kitchen')return base;const sp=ctSpec(counterById(j.counterId)),hasSink=j.faces.some(f=>f.key!=='I'&&f.rows.some(r=>r.mods.some(m=>m.t==='sink')));return Math.max(base,hasSink?sp.sinkCabMin:0)}
const bgOf=j=>j.cat==='kitchen'?Math.max(0,+(j.bgap?.mm)||0):0,bgUse=j=>j.bgap?.use==='shelf'?'shelf':'deep';
function zoneCut(j,z){const t=cType(j,z);if(t==='blind'||t==='magic')return z==='upper'?UPD():(j.cat==='kitchen'?kD(j)+bgOf(j):(+j.dims.D||CATS[j.cat].D));return cLeg(j,z)}
function cornerCut(j,f){if(!isCornerLay(j)||f.key==='A'||f.key==='I')return 0;const z=f.rows.find(r=>r.zone!=='upper')?.zone||'lower';return zoneCut(j,z)}

