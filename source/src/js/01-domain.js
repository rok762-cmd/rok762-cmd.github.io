/* ---------- domain ---------- */
let T=20; const MFRAME=40; let CTH=850;
const PL_RANGE={closet:[50,120,'gap'],shoe:[50,120,'gap'],dress:[50,120,'gap'],kitchen:[120,150],middoor:[0,0],storage:[0,0],laundry:[50,120,'gap'],single:[0,120]};
const LAYOUTS={I:'일자형',L:'ㄱ자형',I1:'일자 + 옆벽 키큰장',L1:'ㄱ자 + 옆벽 키큰장',U:'ㄷ자형',island:'아일랜드형',Lisland:'ㄱ자+아일랜드',II:'11자형',niche:'매립형'};
const OBS={sp_fridge:{label:'냉장고 자리',color:'#0E7490',tip:'냉장고장이 이 위치로 옵니다',spot:1},sp_cook:{label:'쿡탑 자리',color:'#C2410C',tip:'쿡탑장이 이 위치로 옵니다',spot:1},sp_sink:{label:'싱크 자리',color:'#1D4ED8',tip:'싱크장이 이 위치로 옵니다',spot:1},sp_door:{label:'출입문',color:'#475569',tip:'이 자리는 장 없이 비웁니다',spot:1},sp_tall:{label:'키큰장 자리',color:'#7C3AED',tip:'키큰장이 이 위치로 옵니다',spot:1},dist:{label:'보일러 분배기',color:'#E5484D',tip:'바닥판·걸레받이 따내기, 해당 칸에 점검문 필요'},water:{label:'수도 (급·배수)',color:'#2F6BFF',tip:'뒷판·바닥판 타공 필요'},
  boiler:{label:'보일러',color:'#B4520F',tip:'장으로 덮지 말고 보일러 가림장(통풍 루버)이나 비움 검토'},access:{label:'점검구',color:'#8E4EC6',tip:'해당 칸 뒷판에 점검문 가공 필요'},
  gas:{label:'가스 배관·계량기',color:'#D6409F',tip:'가스 배관 이격 확인, 뒷판 따내기 필요'},duct:{label:'후드 배관 구멍 (덕트)',color:'#8A5A00',tip:'쿡탑·후드를 이 구멍 아래로 맞춥니다'},elec:{label:'콘센트·스위치',color:'#12A594',tip:'뒷판 타공 또는 전기 위치 이동'},
  supply:{label:'급수 밸브',color:'#3E63DD',tip:'뒷판 타공 · 식세기·정수기 분기 가능'},drain:{label:'배수구',color:'#0D74CE',tip:'바닥판·뒷판 타공 · 식세기·음식물처리기 배수 연결'},
  window:{label:'창문',color:'#0090FF',tip:'상부장·키큰장 설치 불가 구간, 높이 조정 필요'},etc:{label:'기타',color:'#6F6E77',tip:'현장 확인 필요'}};
const CAT_LAYOUTS={kitchen:['I','I1','L','L1','U','island','Lisland'],shoe:['I','II','L','U','niche'],closet:['I','L','niche'],dress:['I','L','U','II'],middoor:['I'],storage:['I'],storage:['I'],laundry:['I','niche','L'],single:['I']};
const LAYOUT_FACES={I:['A'],I1:['A','C'],L:['A','B'],L1:['A','B','C'],U:['A','B','C'],island:['A','I'],Lisland:['A','B','I'],II:['A','B'],niche:['A']};
const CORNER_T={blind:'일자장 붙임 (데드코너)',magic:'일자장 + 매직코너',pullout:'일자장 + 코너 풀아웃',diag:'오각 코너장',lshape:'ㄱ자(직각) 코너장',cdrawer:'코너 서랍 (V자)',tall:'키큰장 코너'};
const HWS={tandem:{l:'텐덤 서랍 (소프트)',p:'hwTandem'},cutlery:{l:'커트러리 트레이',p:'hwCutlery'},basket:{l:'그릇 바스켓',p:'hwBasket'},pullout:{l:'양념 풀아웃',p:'hwPullout'},trash:{l:'분리수거함',p:'hwTrash'},pants:{l:'바지걸이',p:'hwPants'},tray:{l:'액세서리 트레이',p:'hwTray'}};
const HW_FOR={baseDrawer:['tandem','cutlery'],base:['basket','pullout','trash'],sink:['trash','basket'],cook:['pullout','basket'],oven:['tandem'],drawerOnly:['tandem','tray','cutlery'],drawer:['tray','pants'],hang:['pants'],hang2:['pants'],shelf:['tray','basket'],shoe:['pullout'],washpair:['basket'],washone:['basket','pullout'],washstack:['basket']};
const GLASS_OK=t=>['upper','shelf','base','drawerOnly','hang','hang2','shoe','dryer'].includes(t);
const TALL_K={fspace:'냉장고 자리 (빈 공간+위 수납)',combo:'기기장 (전자레인지+오븐 빌트인)',oven:'오븐장',appl:'가전수납장 (밥솥·전자레인지 오픈 칸)',fridge:'냉장고장',pantry:'일반 키큰장 (수납)',oven2:'오븐 2대장 (오븐+콤팩트)',larder:'키큰 빼기장 (식품)',broom:'청소기장'};
const frOf=j=>{const r=j.fridge;if(!r?.id)return null;if(r.id==='custom'){const c=r.custom||{},free=c.type!=='built';return{...r,a:{id:'custom',kind:'fridge',type:free?'free':'built',name:`직접 입력 냉장고 (${free?'일반':'빌트인'})`,tag:'직접 입력',w:+c.w||912,h:+c.h||1850,d:+c.d||(free?920:700),gs:free?50:4,gt:free?20:15,gr:free?50:0,nd:700,price:+c.price||0}}}const a=appById(r.id);return a?{...r,a}:null};
function frNiche(j){const r=frOf(j);if(!r)return null;const a=r.a,c5=v=>Math.ceil(v/5)*5,free=a.type==='free',iw=c5(a.w+2*(+a.gs||4)),ih=c5(a.h+(+a.gt||15)),id=free?c5(a.d+(+a.gr||50)):Math.max(+a.nd||700,a.d);return{a,free,iw,ih,id,ow:iw+(r.housing!==false?2*T:0),housing:r.housing!==false,inRun:r.inRun!==false,stick:Math.max(0,id-kD(j))}}
const tallEndOf=(j,f)=>{const t=j.tallEnd;if(!t?.on||j.cat!=='kitchen'||!f||f.key==='I'||t.face!==f.key||isTallWall(j,f))return null;const corner=isCornerLay(j);if(corner&&j.layout==='U'&&f.key==='A')return null;const side=t.side==='M'?'M':corner?'R':(t.side==='L'?'L':'R');const nn=(t.k==='fspace')?frNiche(j):null;if(nn&&!nn.inRun)return null;return{w:nn?nn.ow:Math.max(300,Math.min(TALL_MAX,Math.round((+t.w||600)/50)*50)),k:t.k||'combo',side,x:+t.x||0,fh:nn?nn.ih:(+t.fh||0)}};
let TALL_MAX=Math.max(...RULES_DEF.tallWs),TALL_WS=RULES_DEF.tallWs;
const tall2Of=(j,f)=>{const t=j.tall2,te=tallEndOf(j,f);if(!t?.on||!te||te.side==='M')return null;return{w:Math.max(300,Math.min(TALL_MAX,Math.round((+t.w||600)/50)*50)),k:t.k&&t.k!=='fspace'?t.k:'pantry',side:te.side,fh:+t.fh||0}};
const isCornerLay=j=>['L','L1','U','Lisland'].includes(j.layout);
const isTallWall=(j,f)=>(j.layout==='L1'||j.layout==='I1')&&f?.key==='C';
const cKind=(j,z)=>{const c=j.corner||{},k=j.cat==='kitchen';let lo=c.lower||'blind';if(!k&&['pullout','cdrawer','tall'].includes(lo))lo='blind';if(lo==='tall'&&j.layout==='U')lo='blind';
  if(z==='upper'){const t=c.upper||'blind';return lo==='tall'||['magic','pullout','cdrawer','tall'].includes(t)?'blind':t}return lo};
const cType=(j,z)=>{const t=cKind(j,z);return t==='pullout'?'magic':t==='cdrawer'?'lshape':t==='tall'?'blind':t};
const penOn=j=>j.cat==='kitchen'&&(j.layout==='L'||j.layout==='Lisland')&&!!j.pen?.on;
const ctSegs=(g,a,b)=>{if(!g.island&&g.cat==='kitchen'&&g.rows&&!g.rows.some(r=>r.zone==='lower'))return[];let segs=[[a,b]];[...(g.talls||[]),...(g.gaps||[])].forEach(t=>{segs=segs.flatMap(([s,e])=>t.x>=e||t.x+t.w<=s?[[s,e]]:[[s,t.x],[t.x+t.w,e]])});return segs.filter(([s,e])=>e-s>30&&Math.min(e,g.Wm)-Math.max(s,0)>30)};
const tallOn=j=>j.cat==='kitchen'&&cKind(j,'lower')==='tall';
const lidOn=j=>j.cat==='kitchen'&&isCornerLay(j)&&cType(j,'lower')==='blind'&&!!(j.corner?.lid??tallOn(j));
const cLeg=(j,z)=>{const c=j.corner||{};return z==='upper'?(+c.legU||600):(+c.legL||900)};
const FACE_NAME=k=>k==='I'?'아일랜드':k+'면';
const SIDE_LEN={closet:1800,shoe:900,kitchen:1800,dress:1500,middoor:1500,laundry:1200,single:600};
const UPD=()=>Math.max(200,+(catalog?.prices?.upD??300)||300);
const isMD=c=>c==='middoor'||c==='storage';
const CATS={
  closet:{name:'붙박이장',W:2700,H:2300,D:600},
  shoe:{name:'현관장',W:1200,H:2300,D:380},
  kitchen:{name:'주방 싱크대',W:2400,H:2300,D:600},
  middoor:{name:'중문',W:1500,H:2300,D:120},storage:{name:'창고문',W:1200,H:2300,D:120},
  dress:{name:'드레스룸',W:2400,H:2300,D:450},
  laundry:{name:'세탁실장',W:1800,H:2300,D:700},
  single:{name:'단품 가구',W:800,H:1000,D:450}
};
const CAT_ORDER=['closet','shoe','kitchen','middoor','storage','dress','laundry','single'];
const TYPES={
  hang:{label:'긴옷 행거',door:1}, hang2:{label:'2단 행거',door:1},
  shelf:{label:'선반장',door:1,n:4,nl:'선반'}, drawer:{label:'내부서랍+행거',door:1,n:3,nl:'서랍'},
  drawerOnly:{label:'외부 서랍장',door:1,n:4,nl:'서랍'},basket:{label:'망서랍 옷장',door:1,n:2,nl:'망서랍'},pants:{label:'바지걸이장',door:1},acc:{label:'악세사리장',door:1,n:3,nl:'트레이'},quilt:{label:'이불장',door:1,n:2,nl:'서랍'}, open:{label:'오픈 선반',door:0,n:4,nl:'선반'},
  shoe:{label:'신발장',door:1,n:8,nl:'선반'}, bench:{label:'벤치·오픈장',door:1}, vanity:{label:'화장대',door:1},
  base:{label:'하부장',door:1,n:1,nl:'선반'}, baseDrawer:{label:'하부 서랍',door:1,n:3,nl:'서랍'},drawer2p:{label:'서랍 1+2 (얕은1·깊은2)',door:1},drawerDoor:{label:'서랍 1 + 문',door:1,n:1,nl:'선반'},innerDr:{label:'문 안 내부서랍',door:1,n:3,nl:'서랍'},spice:{label:'양념 빼기장 (150~300)',door:1},waste:{label:'분리수거장',door:1},
  sink:{label:'개수대',door:1}, cook:{label:'쿡탑 하부',door:1},
  upper:{label:'상부장',door:1,n:1,nl:'선반'},fridgeTop:{label:'냉장고 위 벽장 (플랩)',door:1,n:0,nl:'선반'},bigFlap:{label:'대형 플랩벽장',door:1,n:1,nl:'선반'}, upperOpen:{label:'상부 오픈',door:0,n:1,nl:'선반'}, hood:{label:'후드장',door:1}, topbox:{label:'위 칸 (깊은 장)',door:1,n:0,nl:'선반'},
  corner_diag:{label:'오각 코너장',door:1,n:1,nl:'선반'},corner_l:{label:'ㄱ자 코너장',door:1,n:1,nl:'선반'},corner_dr:{label:'코너 서랍 (V자)',door:1,n:3,nl:'서랍'},tallc:{label:'키큰장',door:1,n:4,nl:'선반'},
  dw:{label:'식기세척기 칸',door:1},wash:{label:'빌트인 세탁기 칸',door:0},oven:{label:'빌트인 오븐장',door:1},dryer:{label:'식기건조대장',door:1},
  washpair:{label:'세탁기+건조기 (나란히)',door:1},washstack:{label:'세탁기 위 건조기 (직렬)',door:1},washone:{label:'세탁기 1대 칸',door:1},filler:{label:'휠라(마감)',door:0},gap:{label:'빈 칸 (문·통로·창)',door:0,n:0},blindc:{label:'데드코너',door:0},mslide:{label:'슬라이딩 문짝',door:1}, mlouver:{label:'루버 문짝 (통풍)',door:1}, mcab:{label:'장문 (붙박이장식)',door:1}, mfixed:{label:'고정창',door:1}, mswing:{label:'여닫이 문짝',door:1}
};
const CAT_TYPES={closet:['hang','hang2','shelf','drawer','drawerOnly','basket','pants','acc','quilt','open'],shoe:['shoe','bench','shelf','open'],
  dress:['hang','hang2','shelf','drawer','drawerOnly','basket','pants','acc','quilt','vanity','open'],kitchen_lower:['gap','base','baseDrawer','drawer2p','drawerDoor','innerDr','spice','waste','sink','cook','dw','wash','oven','open'],
  kitchen_full:['tallc','gap'],kitchen_upper:['gap','upper','upperOpen','bigFlap','fridgeTop','hood','dryer'],top:['topbox','upperOpen'],kitchen_top:['topbox','upperOpen'],middoor:['mslide','mfixed','mswing'],storage:['mswing','mlouver','mcab','mslide'],laundry:['washpair','washstack','washone','shelf','open','drawerOnly','hang'],single:['drawerOnly','shelf','open','hang','hang2','shoe','drawer']};
const md=(t,r,n)=>({t,r,n:n??TYPES[t].n});
const GAP_K={door:'문',pass:'통로',window:'창',pillar:'기둥·벽',free:'빈 벽'};
const isGap=m=>m?.t==='gap';
const isSpot=o=>!!OBS[o?.type]?.spot;
const SPOT_DEF={sp_fridge:{w:920,h:1850,z:0},sp_cook:{w:600,h:80,z:860},sp_sink:{w:800,h:80,z:860},sp_door:{w:900,h:2100,z:0},sp_tall:{w:600,h:2100,z:0}};
const F=mods=>[{zone:'full',mods}];
const BUILTIN_PLANS=[
  {id:'cl-3',cat:'closet',name:'기본 3칸',rows:F([md('hang',900),md('drawer',900),md('hang2',900)])},
  {id:'cl-4',cat:'closet',name:'수납 4칸',rows:F([md('hang2',675),md('shelf',675,5),md('drawer',675),md('hang',675)])},
  {id:'cl-bed',cat:'closet',name:'이불장 포함',rows:F([md('shelf',900,2),md('hang',900),md('hang2',900)])},
  {id:'sh-2',cat:'shoe',name:'키큰장 2칸',rows:F([md('shoe',600,8),md('shoe',600,8)])},
  {id:'sh-b',cat:'shoe',name:'오픈 벤치형',rows:F([md('shoe',600,8),md('bench',600)])},
  {id:'sh-3',cat:'shoe',name:'슬림 3칸',rows:F([md('shoe',400,8),md('shoe',400,8),md('shelf',400,5)])},
  {id:'kt-1',cat:'kitchen',name:'일자형 기본',rows:[{zone:'lower',mods:[md('base',500),md('sink',900),md('baseDrawer',800),md('cook',600)]},{zone:'upper',mods:[md('upper',500),md('upper',900),md('upper',800),md('hood',600)]}]},
  {id:'kt-2',cat:'kitchen',name:'서랍 강화형',rows:[{zone:'lower',mods:[md('baseDrawer',450,4),md('sink',900),md('drawer2p',750),md('cook',600)]},{zone:'upper',mods:[md('upper',450),md('upper',900),md('upperOpen',750,2),md('hood',600)]}]},
  {id:'kt-eu',cat:'kitchen',name:'유럽식 서랍형',rows:[{zone:'lower',mods:[{...md('spice',200),fix:true},md('drawer2p',600),{...md('sink',900),sk:'drawer'},{...md('waste',400),fix:true},md('cook',600)]},{zone:'upper',mods:[md('upper',800),md('upper',900),md('upper',400),md('hood',600)]}]},
  {id:'kt-s',cat:'kitchen',name:'보조면 (ㄱ·ㄷ)',rows:[{zone:'lower',mods:[md('base',600),md('baseDrawer',600),md('base',600)]},{zone:'upper',mods:[md('upper',600),md('upper',600),md('upper',600)]}]},
  {id:'kt-i',cat:'kitchen',name:'아일랜드 기본',rows:[{zone:'lower',mods:[md('baseDrawer',600),md('base',600),md('baseDrawer',600)]}]},
  {id:'md-3',cat:'middoor',name:'3연동 슬라이딩',rows:F([md('mslide',1),md('mslide',1),md('mslide',1)])},
  {id:'md-1',cat:'middoor',name:'원슬라이딩+고정창',rows:F([md('mfixed',1),md('mslide',1.4)])},
  {id:'md-sw',cat:'middoor',name:'양개 스윙',rows:F([md('mswing',1),md('mswing',1)])},
  {id:'st-1',cat:'storage',name:'여닫이 1짝 + 문틀',rows:F([md('mswing',1)])},{id:'st-2',cat:'storage',name:'여닫이 양개',rows:F([md('mswing',1),md('mswing',1)])},{id:'st-l',cat:'storage',name:'루버 양개 (보일러실)',rows:F([md('mlouver',1),md('mlouver',1)])},{id:'st-s',cat:'storage',name:'슬라이딩 2짝',rows:F([md('mslide',1),md('mslide',1)])},{id:'st-c',cat:'storage',name:'장문 3짝 (붙박이장식)',rows:F([md('mcab',1),md('mcab',1),md('mcab',1)])},
  {id:'dr-4',cat:'dress',name:'시스템 4칸',rows:F([md('hang2',600),md('shelf',600,5),md('hang',600),md('drawerOnly',600,4)])},
  {id:'dr-v',cat:'dress',name:'화장대 포함',rows:F([md('hang',800),md('vanity',800),md('hang2',800)])},
  {id:'ld-p',cat:'laundry',name:'나란히 + 양옆 오픈',rows:F([md('open',350,5),{...md('washpair',1300),fix:true,r:1300},md('open',350,5)])},
  {id:'ld-s',cat:'laundry',name:'직렬 + 수납장',rows:F([{...md('washstack',700),fix:true,r:700},md('shelf',550,5),md('drawerOnly',550,4)])},
  {id:'ld-1',cat:'laundry',name:'세탁기 + 수납',rows:F([{...md('washone',700),fix:true,r:700},md('shelf',600,5),md('hang',500)])},
  {id:'sg-d4',cat:'single',name:'서랍장 4단',rows:F([md('drawerOnly',800,4)])},
  {id:'sg-s2',cat:'single',name:'수납장 (선반)',rows:F([md('shelf',800,3)])},
  {id:'sg-w',cat:'single',name:'옷장 1칸',rows:F([md('hang',800)])},
  {id:'sg-dd',cat:'single',name:'서랍+수납 2칸',rows:F([md('drawerOnly',450,4),md('shelf',450,3)])},
  {id:'dr-s',cat:'dress',name:'선반 집중형',rows:F([md('shelf',600,5),md('hang2',600),md('shelf',600,5),md('open',600,5)])}
];
const DEFAULT_DOORS=[
  {id:'d1',name:'무광 화이트 PET',kind:'hinged',tex:'solid',color:'#EEEDE9',price:95000,cats:['closet','shoe','kitchen','laundry','single']},
  {id:'d2',name:'그레이지 PET',kind:'hinged',tex:'solid',color:'#BDB5A9',price:98000,cats:['closet','shoe','kitchen','laundry','single']},
  {id:'d3',name:'내추럴 오크 LPM',kind:'hinged',tex:'wood',color:'#C9A77C',price:78000,cats:['closet','shoe','kitchen','dress','laundry','single']},
  {id:'d4',name:'월넛 무늬목',kind:'hinged',tex:'wood',color:'#6E4C35',price:165000,cats:['closet','shoe','kitchen','single']},
  {id:'d5',name:'딥그린 도장',kind:'hinged',tex:'solid',color:'#3E5245',price:185000,cats:['closet','shoe','kitchen']},
  {id:'t1',name:'템바보드 베이지',kind:'hinged',tex:'tambour',color:'#D9C9B3',price:145000,cats:['closet','shoe','kitchen','dress','laundry','single']},
  {id:'t2',name:'템바보드 오크',kind:'hinged',tex:'tambour',color:'#B8935F',price:155000,cats:['closet','shoe','kitchen','dress','laundry','single']},
  {id:'d6',name:'브론즈 유리 슬라이딩',kind:'sliding',tex:'glass',color:'#5E4B3B',frame:'#3B3229',price:210000,cats:['closet','dress']},
  {id:'d7',name:'화이트 슬라이딩',kind:'sliding',tex:'solid',color:'#EEEDE9',price:120000,cats:['closet']},
  {id:'d8',name:'도어 없음 (오크 시스템)',kind:'none',tex:'wood',color:'#CDB08A',price:0,cats:['dress','closet']},
  {id:'m1',name:'투명유리 · 블랙 프레임',kind:'frame',tex:'glass',color:'#2A2B2C',glass:'#BFD6DC',price:180000,cats:['middoor']},
  {id:'m2',name:'브론즈유리 · 샴페인골드',kind:'frame',tex:'glass',color:'#B49A6A',glass:'#6B5847',price:205000,cats:['middoor']},
  {id:'m3',name:'샤틴유리 · 화이트',kind:'frame',tex:'satin',color:'#EDEDEB',glass:'#EEF2F2',price:190000,cats:['middoor']},
  {id:'m4',name:'모루유리 · 블랙',kind:'frame',tex:'fluted',color:'#2A2B2C',glass:'#D5E0E2',price:230000,cats:['middoor']},
  {id:'s1',name:'화이트 도장 문',kind:'frame',tex:'solid',color:'#F1F0EC',price:0,cats:['storage']},{id:'s2',name:'오크 무늬목 문',kind:'frame',tex:'wood',color:'#C9A57A',price:0,cats:['storage']},{id:'s3',name:'그레이 PET 문',kind:'frame',tex:'solid',color:'#B9B4AC',price:0,cats:['storage']}
];
const DEFAULT_DOOR_BY_CAT={closet:'d1',shoe:'d2',kitchen:'d1',middoor:'m1',storage:'s1',dress:'d8',laundry:'d3',single:'d3'};
const DEFAULT_COUNTERS=[
  {id:'c1',name:'인조대리석 스노우화이트',type:'artificial',color:'#F2F1EE',price:220000},
  {id:'c2',name:'인조대리석 그레이 콘크리트',type:'artificial',color:'#9C9D9A',price:240000},
  {id:'c3',name:'세라믹 칼라카타',type:'ceramic',color:'#EDEBE6',price:520000},
  {id:'c4',name:'천연대리석 비앙코 카라라',type:'natural',color:'#ECEBE7',price:480000},
  {id:'c5',name:'올스텐 헤어라인 (일체형 싱크)',type:'stainless',color:'#C3C7CA',price:450000},
  {id:'c6',name:'저가형 스텐 상판',type:'stainless_low',color:'#CDD1D3',price:150000}
];
const CT_TYPES={
  artificial:{label:'인조대리석',thick:40,ths:[20,40,50,60],sinkCabMin:600,maxLen:3600,mount:'under',back:0,cut:'현장 타공',note:'12T + 앞 빌드업 30 · 열융착 무이음 가능'},
  natural:{label:'천연석',thick:20,ths:[20,40],sinkCabMin:650,maxLen:2700,mount:'under',back:0,cut:'현장 타공',note:'수전 타공은 상판 뒤쪽에 · 볼 뒤 여유 위해 싱크장 650 · 슬래브 길이 한계로 이음'},
  ceramic:{label:'세라믹',thick:20,ths:[20],sinkCabMin:620,maxLen:3200,mount:'under',back:0,cut:'현장 타공',note:'12T + 마이터 엣지 20 · 모서리 깨짐 주의 · 타공 시 석재용 공구'},
  stainless:{label:'스텐 맞춤',thick:50,ths:[50],sinkCabMin:600,maxLen:3000,mount:'integrated',back:50,cut:'현장 타공',note:'싱크볼 일체 용접 · 뒷턱 50 절곡 · 앞 엣지 50'},
  stainless_low:{label:'저가형 스텐',thick:30,ths:[30],sinkCabMin:580,maxLen:2400,mount:'over',back:30,cut:'현장 타공',note:'합판 보강 · 탑마운트(오버) 볼만 가능 · 언더싱크 불가'}};
const ctType=c=>c?.type||(/세라믹/.test(c?.name||'')?'ceramic':/천연|대리석 비앙코|카라라/.test(c?.name||'')&&!/인조/.test(c?.name||'')?'natural':/저가.*스텐/.test(c?.name||'')?'stainless_low':/스텐/.test(c?.name||'')?'stainless':'artificial');
const ctSpecJ=(j,c)=>{const sp=ctSpec(c),o=sp.ths||[sp.thick],t=+j?.ctThick;if(t&&o.includes(t))sp.thick=t;else if(!o.includes(sp.thick))sp.thick=o[0];if(j&&j.cat==='kitchen'){sp.back=j.ctBack==='none'?0:(+j.ctBackH||RULES.ctBack);sp.front=j.ctFront||'flat'}return sp};
const khOf=j=>({body:700,uni:true,mode:'std',ctH:850,cust:'',...(j.kh||{})});
function kitchenH(j,ct){const k=khOf(j),t=(ct||ctSpecJ(j,counterById(j.counterId))).thick,B=+k.body||700,[a,b]=plRange('kitchen'),T=k.mode==='cust'&&+k.cust>0?Math.round((+k.cust*10/2+50)/5)*5:k.mode==='h'&&+k.ctH>0?+k.ctH:a+B+t,want=T-B-t,leg=clamp(Math.round(want/5)*5,a,b);return{B,t,T,leg,top:leg+B+t,ok:want>=a&&want<=b,uni:k.uni!==false,mode:k.mode}}
const ctSpec=c=>{const t=ctType(c),d=CT_TYPES[t]||CT_TYPES.artificial;return{...d,type:t,...Object.fromEntries(['thick','sinkCabMin','maxLen','back'].filter(k=>c&&c[k]!=null&&c[k]!=='').map(k=>[k,+c[k]]))}};
const DEFAULT_PRICES={tallM:3,fridgeHousing:250000,glassDoor:120000,hwTandem:60000,hwCutlery:45000,hwBasket:120000,hwPullout:150000,hwTrash:90000,hwPants:70000,hwTray:40000,cornerPullout:280000,cornerDrawer:650000,cornerLid:220000,tallCorner:1100000,installRate:20,installMin:350000,wpSilkPy:85000,wpHapPy:50000,wpLoss:15,wpRollM2:16.5,wpRollSilk:25000,wpRollHap:10000,wpPrime:5000,wpLabor:280000,wpRateSilk:6,wpRateHap:8,wpRemove:4000,tallRate:2.5,lowD:600,upStd:300,upD:300,shipBase:50000,ship50:20000,ship70:40000,shipOver:60000,shipPerKm:0,ltShelf:35000,ltRod:45000,ltVert:35000,ltPuck:15000,ltUnder:30000,ltPlinth:25000,ltSensorDoor:12000,ltSensorPir:15000,ltTouch:15000,ltPsu60:25000,ltPsu100:35000,ltPsu150:45000,ltWire:20000,jaMM:300,clearance:10,fullTop:20,fullSide:20,fillerW:50,fillerMax:100,moldingH:50,fillerPrice:35000,demoPrice:40000,board:20,plinthBox:60,plinthKitchen:120,nicheClr:5,cornerK:180000,cornerB:90000,islandFinish:150000,islandOverhang:300,tableLeg:120000,tablePanel:180000,maxOverhang:300,appInstall:50000,magicCorner:450000,cornerDiag:350000,cornerDiagU:220000,cornerL:400000,cornerLU:260000,waterjet:80000,hoodRaise:0,hoodMinGas:650,hoodMinElec:600,elecLine:250000,breaker:80000,gasWork:60000,gasCap:50000,outlet:60000,body:{closet:110000,shoe:100000,dress:85000,laundry:95000,single:90000},kLower:380000,kUpper:260000,sinkSet:250000,
  mFrame:320000,mSlide:190000,mFixed:110000,mSwing:210000,drawer:45000,handleBar:9000,handleProj:35,pushOpener:12000,groove:5000,
  install:{closet:150000,shoe:80000,kitchen:200000,middoor:150000,storage:150000,dress:120000,laundry:120000,single:50000},vat:true};
const H_TYPE={bar:'바 손잡이',knob:'노브',edge:'엣지(끝단) 손잡이',groove:'J홈 가공',push:'푸시 오프너'};
const DEFAULT_HANDLES=[
  {id:'h1',name:'블랙 바 160',type:'bar',fam:'블랙 바',len:160,cc:128,proj:35,color:'#2B2B2B',price:7000},{id:'h2',name:'블랙 바 224',type:'bar',fam:'블랙 바',len:224,cc:192,proj:35,color:'#2B2B2B',price:9000},
  {id:'h3',name:'블랙 바 320',type:'bar',fam:'블랙 바',len:320,cc:288,proj:35,color:'#2B2B2B',price:12000},{id:'h4',name:'블랙 바 480',type:'bar',fam:'블랙 바',len:480,cc:448,proj:35,color:'#2B2B2B',price:16000},
  {id:'h5',name:'골드 바 224',type:'bar',fam:'골드 바',len:224,cc:192,proj:32,color:'#B8913A',price:14000},{id:'h6',name:'골드 바 320',type:'bar',fam:'골드 바',len:320,cc:288,proj:32,color:'#B8913A',price:18000},
  {id:'h7',name:'스텐 바 224',type:'bar',fam:'스텐 바',len:224,cc:192,proj:35,color:'#A9AEB2',price:8000},{id:'h8',name:'블랙 원형 노브',type:'knob',fam:'노브',len:30,cc:0,proj:28,color:'#2B2B2B',price:4000},
  {id:'h9',name:'엣지 손잡이 200 (알루미늄)',type:'edge',fam:'엣지',len:200,cc:160,proj:15,color:'#3A3A3A',price:11000},
  {id:'h10',name:'J홈 가공',type:'groove',fam:'J홈',len:0,cc:0,proj:0,color:'',price:5000},{id:'h11',name:'푸시 오프너',type:'push',fam:'푸시',len:0,cc:0,proj:0,color:'',price:12000}];
const DEFAULT_TRUCKS=[{id:'tk1',name:'1톤',t30:50000,t50:65000,t70:85000,over:100000,perKm:1500,maxLen:4000},
  {id:'tk2',name:'1.4톤',t30:60000,t50:80000,t70:100000,over:120000,perKm:1800,maxLen:8000},
  {id:'tk3',name:'2.5톤',t30:80000,t50:100000,t70:130000,over:160000,perKm:2200,maxLen:99999}];
const DEFAULT_UNITS=[
  {id:'m1',name:'하부 서랍장 600 (3단)',cat:'kitchen',zone:'lower',t:'baseDrawer',w:600,n:3,price:0},{id:'m2',name:'하부 서랍장 400 (4단)',cat:'kitchen',zone:'lower',t:'baseDrawer',w:400,n:4,price:0},
  {id:'m3',name:'개수대장 800',cat:'kitchen',zone:'lower',t:'sink',w:800,price:0},{id:'m4',name:'개수대장 900',cat:'kitchen',zone:'lower',t:'sink',w:900,price:0},
  {id:'m5',name:'쿡탑 하부장 600',cat:'kitchen',zone:'lower',t:'cook',w:600,price:0},{id:'m6',name:'식기세척기 칸 600',cat:'kitchen',zone:'lower',t:'dw',w:600,price:0},
  {id:'m7',name:'하부장 450',cat:'kitchen',zone:'lower',t:'base',w:450,n:1,price:0},{id:'m8',name:'상부장 600',cat:'kitchen',zone:'upper',t:'upper',w:600,n:1,price:0},
  {id:'m9',name:'상부장 800',cat:'kitchen',zone:'upper',t:'upper',w:800,n:1,price:0},{id:'m10',name:'후드장 600',cat:'kitchen',zone:'upper',t:'hood',w:600,price:0},
  {id:'m11',name:'상부 오픈장 300',cat:'kitchen',zone:'upper',t:'upperOpen',w:300,n:2,price:0},
  {id:'m12',name:'긴옷장 900',cat:'closet',zone:'full',t:'hang',w:900,price:0},{id:'m13',name:'2단 행거장 900',cat:'closet',zone:'full',t:'hang2',w:900,price:0},{id:'m14',name:'서랍+행거장 900',cat:'closet',zone:'full',t:'drawer',w:900,n:3,price:0},
  {id:'m15',name:'신발장 600',cat:'shoe',zone:'full',t:'shoe',w:600,n:8,price:0},{id:'m16',name:'신발장 400',cat:'shoe',zone:'full',t:'shoe',w:400,n:8,price:0},
  {id:'m17',name:'시스템 2단 행거 600',cat:'dress',zone:'full',t:'hang2',w:600,price:0},{id:'m18',name:'외부 서랍장 600 (4단)',cat:'dress',zone:'full',t:'drawerOnly',w:600,n:4,price:0}];
const DEFAULT_SUPPORTS=[
  {id:'s1',name:'철제 각관 다리 60×60 (블랙)',type:'leg',color:'#2F3133',price:60000},
  {id:'s2',name:'원형 스텐 다리 Ø76',type:'leg',color:'#B8BDC1',price:55000},
  {id:'s3',name:'측판 받침 (도어 동일 마감)',type:'panel',color:'',price:90000},
  {id:'s4',name:'숨은 지지 브라켓 (ㄱ자 철물)',type:'bracket',color:'#7A7D80',price:25000},
  {id:'s5',name:'뒷면 수납장 (얕은 장)',type:'cabinet',color:'',price:300000}];
const APP_KIND={sink:'싱크볼',faucet:'수전',cooktop:'쿡탑',hood:'후드',dw:'식기세척기',wash:'세탁기',oven:'오븐',dryer:'식기건조대',purifier:'빌트인 정수기',disposer:'음식물처리기',fridge:'냉장고',etc:'기타 부속'};
const DEFAULT_APPS=[
  {id:'a1',kind:'sink',tag:'일반',name:'사각 언더싱크볼 700',w:700,h:220,d:450,price:150000},{id:'a2',kind:'sink',tag:'일반',name:'사각 언더싱크볼 860',w:860,h:220,d:460,price:180000},
  {id:'b1',kind:'sink',tag:'SQSR500',name:'백조 사각볼 SQSR500 (소형·보조)',w:550,h:230,d:450,cw:508,cd:408,price:230000},{id:'b2',kind:'sink',tag:'SQSR630',name:'백조 사각볼 SQSR630',w:630,h:245,d:450,cw:588,cd:408,price:260000},
  {id:'b3',kind:'sink',tag:'SQSR730',name:'백조 사각볼 SQSR730',w:730,h:245,d:450,cw:688,cd:408,price:350000},{id:'b4',kind:'sink',tag:'SQSR780',name:'백조 사각볼 SQSR780',w:830,h:235,d:450,cw:788,cd:408,price:250000},
  {id:'b5',kind:'sink',tag:'SDS850 엠보',name:'백조 엠보 언더볼 SDS850',w:850,h:200,d:515,cw:822,cd:487,price:200000},{id:'b6',kind:'sink',tag:'리젠스 860',name:'리젠스 엠보 사각볼 GQE8603',w:860,h:230,d:515,cw:786,cd:473,cab:900,price:220000},
  {id:'b7',kind:'sink',tag:'깜뽀르테860',name:'백조 깜뽀르테 860',w:860,h:200,d:464,cw:828,cd:432,price:650000},{id:'b8',kind:'sink',tag:'SQSR900',name:'백조 사각볼 SQSR900 (대형)',w:900,h:250,d:460,cw:856,cd:416,price:380000},
  {id:'b9',kind:'sink',tag:'깜뽀르테960',name:'백조 깜뽀르테 960 (대형)',w:960,h:200,d:464,cw:928,cd:432,price:725000},{id:'b11',kind:'sink',tag:'880 기본',name:'사각 언더싱크볼 880 (기본)',w:880,h:230,d:480,cw:836,cd:436,cab:900,price:200000},{id:'b10',kind:'sink',tag:'LSD1200 2구',name:'백조 레이온 2구볼 LSD1200 (스텐 상판 일체)',w:1200,h:290,d:550,cw:1160,cd:510,cab:1200,price:300000},
  {id:'a3',kind:'faucet',name:'원홀 거위목 수전',w:0,h:0,d:0,price:90000},{id:'a4',kind:'etc',name:'싱크대 음식물처리기',w:0,h:0,d:0,price:450000},
  {id:'a5',kind:'cooktop',tag:'일반 고출력',name:'인덕션 3구 빌트인',w:580,h:60,d:510,price:650000,fuel:'elec',kw:7.4},{id:'a6',kind:'cooktop',tag:'일반 하이브리드',name:'하이브리드 3구 (인덕션2+하이라이트1)',w:590,h:60,d:520,price:590000,fuel:'elec',kw:6.4},{id:'a14',kind:'cooktop',tag:'일반',name:'가스쿡탑 3구 빌트인',w:600,h:60,d:510,price:320000,fuel:'gas',kw:0},
  {id:'c1',kind:'cooktop',tag:'SK매직 3구',name:'SK매직 파워부스트 인덕션 3구 IHR-B32P2',w:595,h:60,d:525,cw:560,cd:480,price:549000,fuel:'elec',kw:3.4},{id:'c2',kind:'cooktop',tag:'삼성 3구',name:'삼성 비스포크 인덕션 3구 NZ63DB503CFT',w:600,h:49,d:520,cw:560,cd:480,price:800000,fuel:'elec',kw:3.4},
  {id:'c3',kind:'cooktop',tag:'삼성 4구',name:'삼성 비스포크 인피니트 올플렉스 4구 (직결식)',w:600,h:48,d:522,cw:560,cd:480,price:1440000,fuel:'elec',kw:7.4},{id:'c4',kind:'cooktop',tag:'린나이 3구',name:'린나이 빌트인 가스쿡탑 3구 RBR-S3603DIJ',w:600,h:60,d:470,cw:560,cd:430,price:180000,fuel:'gas',kw:0},
  {id:'a7',kind:'hood',name:'슬림 히든 후드 600',w:600,h:150,d:300,price:230000},{id:'a8',kind:'hood',name:'침니 후드 900',w:900,h:700,d:500,price:380000,style:'chimney'},{id:'hd2',kind:'hood',name:'장식 후드 (T형 침니) 600',w:600,h:700,d:480,price:320000,style:'chimney'},{id:'hd3',kind:'hood',name:'와이드 슬림 후드 600',w:600,h:110,d:480,price:280000,style:'wide'},{id:'hd5',kind:'hood',name:'와이드 슬림 후드 900',w:900,h:110,d:480,price:350000,style:'wide'},{"id": "hz01", "kind": "hood", "brand": "하츠", "tag": "뉴빌트인 NBH-200", "name": "하츠 뉴빌트인 NBH-200", "w": 598, "h": 193, "d": 480, "cab": 600, "price": 181000, "style": "builtin"},{"id": "hz02", "kind": "hood", "brand": "하츠", "tag": "뉴빌트인 NBH-280", "name": "하츠 뉴빌트인 NBH-280", "w": 798, "h": 193, "d": 300, "cab": 800, "price": 260000, "style": "builtin"},{"id": "hz03", "kind": "hood", "brand": "하츠", "tag": "이너빌트인 IB-60S", "name": "하츠 이너빌트인 IB-60S", "w": 598, "h": 145, "d": 285, "cab": 600, "price": 70000, "style": "builtin"},{"id": "hz04", "kind": "hood", "brand": "하츠", "tag": "IB90S", "name": "하츠 IB90S", "w": 899, "h": 290, "d": 285, "cab": 900, "price": 235000, "style": "builtin"},{"id": "hz05", "kind": "hood", "brand": "하츠 엘리카", "tag": "ERA C 600", "name": "하츠 엘리카 ERA C 600", "w": 535, "h": 177, "d": 300, "cab": 600, "price": 370000, "style": "builtin"},{"id": "hz06", "kind": "hood", "brand": "하츠 엘리카", "tag": "ERA C 800", "name": "하츠 엘리카 ERA C 800", "w": 735, "h": 177, "d": 300, "cab": 750, "price": 420000, "style": "builtin"},{"id": "hz07", "kind": "hood", "brand": "하츠 엘리카", "tag": "히든 (Hidden)", "name": "하츠 엘리카 히든 (Hidden)", "w": 723, "h": 339, "d": 290, "cab": 750, "price": 900000, "style": "builtin"},{"id": "hz08", "kind": "hood", "brand": "팔멕", "tag": "에어맥 빌트인 후드 600", "name": "팔멕 에어맥 빌트인 후드 600", "w": 560, "h": 335, "d": 300, "cab": 600, "price": 970000, "style": "builtin"},{"id": "hz09", "kind": "hood", "brand": "팔멕", "tag": "에어맥 빌트인 후드 900", "name": "팔멕 에어맥 빌트인 후드 900", "w": 805, "h": 335, "d": 300, "cab": 900, "price": 1070000, "style": "builtin"},{"id": "hz10", "kind": "hood", "brand": "하츠", "tag": "쿠치나 G60AL", "name": "하츠 쿠치나 G60AL", "w": 598, "h": 145, "d": 254, "cab": 600, "price": 46500, "style": "wide", "sh": "slide"},{"id": "hz11", "kind": "hood", "brand": "하츠", "tag": "쿠치나 G60BL", "name": "하츠 쿠치나 G60BL", "w": 598, "h": 145, "d": 254, "cab": 600, "price": 50000, "style": "wide", "sh": "slide"},{"id": "hz12", "kind": "hood", "brand": "하츠", "tag": "쿠치나 S60", "name": "하츠 쿠치나 S60", "w": 598, "h": 120, "d": 460, "cab": 600, "price": 37000, "style": "wide", "sh": "slide"},{"id": "hz13", "kind": "hood", "brand": "하츠", "tag": "C60", "name": "하츠 C60", "w": 598, "h": 118, "d": 342, "cab": 600, "price": 44500, "style": "wide", "sh": "slide"},{"id": "hz14", "kind": "hood", "brand": "하츠", "tag": "A60", "name": "하츠 A60", "w": 598, "h": 160, "d": 257, "cab": 600, "price": 55000, "style": "wide", "sh": "slide"},{"id": "hz15", "kind": "hood", "brand": "하츠", "tag": "쿠치나 K60S (라운드 통후드)", "name": "하츠 쿠치나 K60S (라운드 통후드)", "w": 598, "h": 415, "d": 600, "cab": 600, "price": 110000, "style": "can", "sh": "box"},{"id": "hz16", "kind": "hood", "brand": "하츠", "tag": "슬림 카브 SSC-60S", "name": "하츠 슬림 카브 SSC-60S", "w": 598, "h": 700, "d": 305, "cab": 600, "price": 100000, "style": "can", "sh": "box"},{"id": "hz17", "kind": "hood", "brand": "하츠", "tag": "허리케인 HRH-80S", "name": "하츠 허리케인 HRH-80S", "w": 798, "h": 450, "d": 350, "cab": 800, "price": 237000, "style": "can", "sh": "box"},{"id": "hz18", "kind": "hood", "brand": "하츠", "tag": "허리케인 HRH-90S", "name": "하츠 허리케인 HRH-90S", "w": 898, "h": 350, "d": 450, "cab": 900, "price": 213000, "style": "can", "sh": "box"},{"id": "hz19", "kind": "hood", "brand": "나비엔매직(구 SK매직)", "tag": "RGS150-06PAB 슬라이딩", "name": "나비엔매직(구 SK매직) RGS150-06PAB 슬라이딩", "w": 598, "h": 145, "d": 458, "cab": 600, "price": 50000, "style": "wide", "sh": "slide"},{"id": "hz20", "kind": "hood", "brand": "엔텍(쿠센)", "tag": "라이프 HSL-6B3A", "name": "엔텍(쿠센) 라이프 HSL-6B3A", "w": 600, "h": 145, "d": 250, "cab": 600, "price": 45000, "style": "wide", "sh": "slide"},{"id": "hz22", "kind": "hood", "brand": "하츠", "tag": "KCH-60", "name": "하츠 KCH-60", "w": 598, "h": 795, "d": 500, "cab": 600, "price": 290000, "style": "chimney", "sh": "pyr"},{"id": "hz23", "kind": "hood", "brand": "하츠", "tag": "스마일 DSM-60S", "name": "하츠 스마일 DSM-60S", "w": 598, "h": 775, "d": 420, "cab": 600, "price": 270000, "style": "chimney", "sh": "pyr"},{"id": "hz24", "kind": "hood", "brand": "하츠", "tag": "밀레니엄 침니 MCH-90S", "name": "하츠 밀레니엄 침니 MCH-90S", "w": 898, "h": 750, "d": 500, "cab": 900, "price": 265000, "style": "chimney", "sh": "pyr"},{"id": "hz25", "kind": "hood", "brand": "하츠", "tag": "뉴침니 NCH-90", "name": "하츠 뉴침니 NCH-90", "w": 898, "h": 890, "d": 502, "cab": 900, "price": 250000, "style": "chimney", "sh": "pyr"},{"id": "hz26", "kind": "hood", "brand": "하츠", "tag": "테라 DTR-90S", "name": "하츠 테라 DTR-90S", "w": 898, "h": 775, "d": 500, "cab": 900, "price": 237000, "style": "chimney", "sh": "flat"},{"id": "hz27", "kind": "hood", "brand": "하츠", "tag": "모던스퀘어 MSH-90S", "name": "하츠 모던스퀘어 MSH-90S", "w": 898, "h": 775, "d": 490, "cab": 900, "price": 460000, "style": "chimney", "sh": "box"},{"id": "hz28", "kind": "hood", "brand": "하츠", "tag": "플래티늄 프레임후드 PFH88", "name": "하츠 플래티늄 프레임후드 PFH88", "w": 880, "h": 425, "d": 500, "cab": 900, "price": 538000, "style": "chimney", "sh": "flat"},{"id": "hz29", "kind": "hood", "brand": "나비엔매직(구 SK매직)", "tag": "RGX150-06PAA", "name": "나비엔매직(구 SK매직) RGX150-06PAA", "w": 598, "h": 619, "d": 500, "cab": 600, "price": 230000, "style": "chimney", "sh": "pyr"},{"id": "hz30", "kind": "hood", "brand": "나비엔매직(구 SK매직)", "tag": "RGC150-09PAB", "name": "나비엔매직(구 SK매직) RGC150-09PAB", "w": 898, "h": 420, "d": 450, "cab": 900, "price": 190000, "style": "chimney", "sh": "flat"},{"id": "hz31", "kind": "hood", "brand": "나비엔매직(구 SK매직)", "tag": "RGC150-09TBB", "name": "나비엔매직(구 SK매직) RGC150-09TBB", "w": 898, "h": 350, "d": 450, "cab": 900, "price": 420000, "style": "chimney", "sh": "flat"},{"id": "hz32", "kind": "hood", "brand": "나비엔매직(구 SK매직)", "tag": "3D 에어후드 RAC552-09TCBC", "name": "나비엔매직(구 SK매직) 3D 에어후드 RAC552-09TCBC", "w": 898, "h": 430, "d": 520, "cab": 900, "price": 810000, "style": "chimney", "sh": "flat"},{"id": "hz33", "kind": "hood", "brand": "엔텍(쿠센)", "tag": "나사로 LS-W500", "name": "엔텍(쿠센) 나사로 LS-W500", "w": 900, "h": 410, "d": 500, "cab": 900, "price": 447000, "style": "chimney", "sh": "flat"},{"id": "hz34", "kind": "hood", "brand": "하츠", "tag": "스퀘어 아일랜드 ISH-46S", "name": "하츠 스퀘어 아일랜드 ISH-46S", "w": 600, "h": 770, "d": 380, "cab": 600, "price": 580000, "style": "island", "shape": "sq", "dia": 460, "sh": "sqc"},{"id": "hz35", "kind": "hood", "brand": "하츠", "tag": "싱글 스퀘어 SIH-30S 1100", "name": "하츠 싱글 스퀘어 SIH-30S 1100", "w": 600, "h": 1100, "d": 340, "cab": 600, "price": 480000, "style": "island", "shape": "sq", "dia": 340, "sh": "col"},{"id": "hz36", "kind": "hood", "brand": "하츠", "tag": "싱글 스퀘어 SIH-30WHCI (화이트)", "name": "하츠 싱글 스퀘어 SIH-30WHCI (화이트)", "w": 600, "h": 750, "d": 340, "cab": 600, "price": 510000, "style": "island", "shape": "sq", "dia": 340, "sh": "col"},{"id": "hz37", "kind": "hood", "brand": "하츠 엘리카", "tag": "제니스2", "name": "하츠 엘리카 제니스2", "w": 600, "h": 1090, "d": 332, "cab": 600, "price": 1600000, "style": "island", "shape": "sq", "dia": 332, "sh": "cyl"},
  {id:'a9',kind:'dw',name:'빌트인 식기세척기 12인용',w:600,h:815,d:570,price:1100000,panel:1,kw:1.8},{id:'a10',kind:'dw',name:'빌트인 식기세척기 6인용 슬림',w:450,h:815,d:570,price:900000,panel:1},
  {id:'a11',kind:'wash',name:'빌트인 드럼세탁기',w:600,h:820,d:580,price:1200000,kw:2},{id:'a12',kind:'oven',name:'빌트인 오븐 60cm',w:595,h:595,d:560,price:900000,fuel:'elec',kw:3.5},
  {id:'p1',kind:'purifier',name:'빌트인 정수기 (언더싱크 직수형)',w:0,h:0,d:0,price:600000},{id:'p2',kind:'disposer',name:'음식물처리기 (분쇄형)',w:0,h:0,d:0,price:450000,kw:0.4},
  {id:'rs4',kind:'fridge',brand:'삼성',tag:'삼성 키친핏 Max 4도어',name:'삼성 비스포크 키친핏 Max 4도어 (RM70F63 등 · 602~640L)',w:912,h:1853,d:697,gs:4,gt:15,nd:700,price:2300000},
  {id:'rsb',kind:'fridge',brand:'삼성',tag:'삼성 비스포크 4도어 키친핏',name:'삼성 비스포크 4도어 키친핏 (RF60C99 계열)',w:912,h:1853,d:697,gs:4,gt:15,nd:700,price:4330000},
  {id:'rs1',kind:'fridge',brand:'삼성',tag:'삼성 키친핏 1도어',name:'삼성 비스포크 키친핏 1도어 409L (RR40C79)',w:595,h:1853,d:688,gs:4,gt:15,nd:700,price:1600000},
  {id:'rl4',kind:'fridge',brand:'LG',tag:'LG 핏앤맥스 600L',name:'LG 디오스 오브제 Fit & Max 상냉장 601~613L (M626)',w:914,h:1860,d:698,gs:4,gt:15,nd:720,price:2910000},
  {id:'rl5',kind:'fridge',brand:'LG',tag:'LG 핏앤맥스 504L',name:'LG 디오스 오브제 Fit & Max 504L (M516)',w:835,h:1860,d:685,gs:4,gt:15,nd:720,price:2600000},
  {id:'gs4',kind:'fridge',type:'free',brand:'삼성',tag:'삼성 비스포크 4도어 (일반)',name:'삼성 비스포크 4도어 프리스탠딩 841~850L (RF85C)',w:912,h:1853,d:930,gs:50,gt:20,gr:50,price:2300000},
  {id:'gl4',kind:'fridge',type:'free',brand:'LG',tag:'LG 오브제 4도어 870L (일반)',name:'LG 디오스 오브제컬렉션 4도어 870L (T875)',w:914,h:1787,d:918,gs:50,gt:20,gr:50,price:2250000},
  {id:'gss',kind:'fridge',type:'free',brand:'삼성',tag:'삼성 양문형 846L (일반)',name:'삼성 양문형 냉장고 846L (RS84)',w:912,h:1786,d:915,gs:50,gt:20,gr:50,price:1505000},
  {id:'rlk',kind:'fridge',brand:'LG',tag:'LG 김치톡톡 핏앤맥스',name:'LG 김치톡톡 Fit & Max 480L (Z484)',w:835,h:1860,d:685,gs:4,gt:15,nd:720,price:2680000},
  {id:'a13',kind:'dryer',name:'상부 스텐 식기건조대 800',w:760,h:0,d:280,price:120000}];
const DEFAULT_TILES=[{id:'t1',name:'서브웨이 화이트 75×150 유광',w:150,h:75,price:95000,color:'#F2F0EB',pattern:'brick'},{id:'t2',name:'포세린 600×1200 무광 그레이',w:1200,h:600,price:120000,color:'#D9D7D2',pattern:'grid'},{id:'t3',name:'헤링본 그린 75×300',w:300,h:75,price:140000,color:'#9DB4A4',pattern:'brick'},{id:'t4',name:'정사각 화이트 100×100',w:100,h:100,price:85000,color:'#F4F3F0',pattern:'grid'}];
const MOD_APPS={sink:['sink','faucet','purifier','disposer','etc'],cook:['cooktop','oven'],hood:['hood'],dw:['dw'],wash:['wash'],oven:['oven'],dryer:['dryer'],base:['etc'],baseDrawer:['etc'],upper:['dryer','etc']};
const MOD_DEFAULT_APPS={sink:['b11','a3'],cook:['a5'],hood:['a7'],dw:['a9'],wash:['a11'],oven:['a12'],dryer:['a13']};
const SUP_TYPE={leg:'다리',panel:'측판',bracket:'숨은 브라켓',cabinet:'장 (수납장)'},SUP_UNIT={leg:'개',panel:'장',bracket:'개',cabinet:'m'};
const DEFAULT_COMPANY={name:'○○ 인테리어',tel:'010-0000-0000',origin:'경기 파주시'};
const MC={spot:'#E8590C',ref:'#00A2C7',W:'#2F6BFF',H:'#FF7A1A',D:'#14B88E',note:'#C04CF0',obs:'#E5484D',calib:'#FFC53D'};
const ML={spot:'위치 표시',ref:'기준물',W:'가로',H:'높이',D:'깊이',note:'메모',obs:'설비 표시',calib:'벽 맞추기'};
const HANDLES={push:'푸시 (손잡이 없음)',bar:'일자 손잡이',groove:'J홈'};

