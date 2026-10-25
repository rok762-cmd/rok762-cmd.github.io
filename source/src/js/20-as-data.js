/* ---------- AS·고객 관리 ---------- */
let mode='measure',asTab='dash',asSel={cust:null,tk:null},asQ={cust:'',prod:'',custF:'all',tkF:'open',prodCat:'',part:''};
const ASK='silcheuk-as-v1',AS_COL={customers:'as_customers',tickets:'as_tickets',products:'shop_products'};
const ASD={customers:[],tickets:[],products:[],live:false};
const TK_KIND={repair:'수리',exchange:'교환',defect:'하자 보수',inspect:'정기 점검',install:'추가 설치'};
const TK_ST={new:'접수',sched:'방문 예정',done:'처리 완료',paid:'정산 완료',cancel:'취소'};
const TK_OPEN=['new','sched'];
const AS_TABS=[['dash','현황'],['tickets','AS 접수'],['customers','고객'],['products','수리용품'],['plans','구독·설정']];
const DEFAULT_TASKS=[{id:'k1',name:'문짝 수평·경첩 조정',unit:'짝',price:5000},{id:'k2',name:'경첩 교체',unit:'개',price:5000},{id:'k3',name:'서랍 레일 교체',unit:'조',price:15000},{id:'k4',name:'댐퍼·손잡이 교체',unit:'개',price:3000},
  {id:'k5',name:'문짝·서랍 앞판 교체',unit:'짝',price:20000},{id:'k6',name:'싱크대 실리콘 재시공',unit:'m',price:10000},{id:'k7',name:'걸레받이 재부착',unit:'m',price:5000},{id:'k8',name:'상판 찍힘·깨짐 보수',unit:'곳',price:30000},
  {id:'k9',name:'중문 롤러·레일 교체',unit:'짝',price:50000},{id:'k10',name:'기타 작업 (시간)',unit:'시간',price:35000}];
const DEFAULT_ASCFG={travel:30000,far:20000,labor:20000,surcharge:20,warrantyMonths:12,tasks:DEFAULT_TASKS,zones:[{name:'파주',fee:30000},{name:'고양',fee:30000},{name:'김포',fee:30000}],plans:[
  {id:'p1',name:'케어 베이직',monthly:9900,travelFree:true,discount:5,freeCount:1,inspectMonths:12},
  {id:'p2',name:'케어 프리미엄',monthly:19900,travelFree:true,discount:10,freeCount:3,inspectMonths:6}]};
const asCfg=()=>{if(!catalog.asCfg)catalog.asCfg=clone(DEFAULT_ASCFG);if(!catalog.asCfg.zones)catalog.asCfg.zones=clone(DEFAULT_ASCFG.zones);if(!catalog.asCfg.tasks){catalog.asCfg.tasks=clone(DEFAULT_TASKS);catalog.asCfg.labor=20000;catalog.asCfg.surcharge=20}return catalog.asCfg};
const zoneOf=t=>{const Z=asCfg().zones;if(t.zone==='etc')return null;return Z.find(z=>z.name===t.zone)||Z.find(z=>z.name&&(t.addr||'').includes(z.name))||null};
const pad2=n=>String(n).padStart(2,'0');
const ymd=d=>`${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
const addMonths=(s,n)=>{const d=new Date((s||today())+'T00:00:00');const day=d.getDate();d.setMonth(d.getMonth()+n);if(d.getDate()<day)d.setDate(0);return ymd(d)};
const addDays=(s,n)=>{const d=new Date((s||today())+'T00:00:00');d.setDate(d.getDate()+n);return ymd(d)};
const dayOf=t=>t?ymd(new Date(t)):'';
const mdd=s=>s?`${+s.slice(5,7)}/${+s.slice(8,10)}`:'-';
function asLoadLocal(){const d=store.get(ASK)||{};['customers','tickets','products'].forEach(k=>ASD[k]=Array.isArray(d[k])?d[k]:[])}
function asSaveLocal(){if(!ASD.live)store.set(ASK,{customers:ASD.customers,tickets:ASD.tickets,products:ASD.products})}
asLoadLocal();
function asSubscribe(){if(!DB)return;ASD.live=true;
  Object.entries(AS_COL).forEach(([k,col])=>{try{DB.collection(col).limit(k==='products'?3000:2000).onSnapshot(snap=>{ASD[k]=snap.docs.map(d=>({...d.data(),id:d.id}));if(mode==='as')renderAS()},()=>{})}catch(e){}})}
async function asPut(k,o){const now=Date.now();o.updatedAt=now;o.createdAt=o.createdAt||now;const arr=ASD[k],i=arr.findIndex(x=>x.id===o.id);if(i>=0)arr[i]=o;else arr.unshift(o);
  if(ASD.live){if(!CAN_WRITE){toast('서버에 저장할 권한이 없습니다');return false}try{const{id,...rest}=o;await DB.collection(AS_COL[k]).doc(id).set(JSON.parse(JSON.stringify(rest)))}catch(e){toast('서버에 저장하지 못했습니다');return false}}
  else asSaveLocal();return true}
async function asDel(k,id){ASD[k]=ASD[k].filter(x=>x.id!==id);if(ASD.live){try{await DB.collection(AS_COL[k]).doc(id).delete()}catch(e){toast('삭제하지 못했습니다')}}else asSaveLocal()}
const custById=id=>ASD.customers.find(c=>c.id===id);
const tkById=id=>ASD.tickets.find(t=>t.id===id);
const prodById=id=>ASD.products.find(p=>p.id===id);
const asPlan=id=>asCfg().plans.find(p=>p.id===id);
function subOf(c,at=today()){if(!c?.subId)return null;const p=asPlan(c.subId);if(!p)return null;
  const active=c.subStatus!=='stop'&&(!c.subStart||c.subStart<=at)&&(!c.subEnd||c.subEnd>=at);return{p,active,start:c.subStart,end:c.subEnd}}
function freeLeft(c,exceptId){const s=subOf(c);if(!s?.active)return 0;const from=s.start||'0000';
  const used=ASD.tickets.filter(t=>t.custId===c.id&&t.freeUse&&t.status!=='cancel'&&t.id!==exceptId&&(t.visitDate||dayOf(t.createdAt))>=from).length;return Math.max(0,(+s.p.freeCount||0)-used)}
function inWarranty(c){const w=+asCfg().warrantyMonths||0;return(c?.installs||[]).some(i=>i.date&&addMonths(i.date,w)>=today())}
function nextInspect(c){const s=subOf(c);if(!s?.active||!(+s.p.inspectMonths))return null;
  const last=ASD.tickets.filter(t=>t.custId===c.id&&t.kind==='inspect'&&['done','paid'].includes(t.status)).map(t=>t.visitDate||dayOf(t.updatedAt)).sort().pop()||s.start||today();
  return addMonths(last,+s.p.inspectMonths)}
function tkCalc(t){const cfg=asCfg(),c=custById(t.custId),s=subOf(c,t.visitDate||today()),sub=s?.active?s.p:null;
  const parts=(t.parts||[]).reduce((a,x)=>a+(+x.price||0)*(+x.qty||0),0),disc=sub?(+sub.discount||0):0,discAmt=Math.round(parts*disc/100/10)*10;
  const zn=zoneOf(t),travel=t.travel!=null&&t.travel!==''?+t.travel:zn?(+zn.fee||0):(+cfg.travel||0)+(t.far?(+cfg.far||0):0),taskSum=(t.tasks||[]).reduce((a,x)=>a+(+x.price||0)*(+x.qty||0),0),manual=t.labor!=null&&t.labor!=='',labor=manual?+t.labor:Math.max(+cfg.labor||0,taskSum),minApplied=!manual&&labor>taskSum;
  const night=surOn(t),sRate=night?(+cfg.surcharge||0)/100:0,surch=Math.round((labor+travel)*sRate/100)*100;
  let travelW=0,laborW=0,partsW=0,surchW=0;const notes=[];
  if(t.warranty){travelW=travel;laborW=labor;partsW=parts-discAmt;surchW=surch;notes.push('무상 보증 기간')}
  else{if(sub&&sub.travelFree){travelW=travel;notes.push(`${sub.name} 출장비 무료`)}if(sub&&sub.travelFree)surchW=Math.round(travel*sRate/100)*100;if(t.freeUse){laborW=labor;travelW=travel;surchW=surch;notes.push(`${sub?.name||'구독'} 무상 AS 1회 사용`)}}
  if(disc&&!t.warranty)notes.push(`${sub.name} 수리용품 ${disc}% 할인`);
  const sum=Math.max(0,parts-discAmt+labor+travel+surch-travelW-laborW-partsW-surchW),vat=catalog.prices.vat?Math.round(sum*.1):0;
  return{parts,disc,discAmt,travel,labor,taskSum,minApplied,night,surch,surchW,travelW,laborW,partsW,sum,vat,total:sum+vat,sub,notes}}
function surOn(t){if(t.surch==='on')return true;if(t.surch==='off')return false;const d=t.visitDate?new Date(t.visitDate+'T00:00:00').getDay():-1;return d===0||d===6||(t.visitTime||'')>='18:00'}
function nextTkNo(){const d=today().replace(/-/g,'').slice(2),n=ASD.tickets.filter(t=>(t.no||'').startsWith('AS'+d)).length+1;return`AS${d}-${pad2(n)}`}
function newTicket(custId){const c=custById(custId);return{id:'t'+uid(),no:nextTkNo(),custId:custId||null,custName:c?.name||'',phone:c?.phone||'',addr:c?.addr||'',kind:'repair',item:'',symptom:'',
  status:'new',visitDate:'',visitTime:'',tech:'',parts:[],tasks:[],labor:'',travel:'',far:false,freeUse:false,warranty:false,photos:[],memo:'',source:'direct'}}
function newCustomer(o={}){return{id:'c'+uid(),name:'',phone:'',addr:'',memo:'',subId:'',subStart:'',subEnd:'',subStatus:'',installs:[],...o}}

/* AS render */
