/* ---------- 현장 규칙 표: 칸 폭·쿡탑장·도어·뒷턱·키큰장·마감판 규격을 한곳에 ----------
   기본값은 RULES_DEF, 제품·단가 관리 → '현장 규칙'에서 고친 값은 catalog.rules에 저장되고 applyRules()가 반영합니다. */
const RULES_DEF={unit:50,maxW:1200,prefW:1000,cookWs:[600,750,800,900],doorLeaf:[400,350],ctBack:50,tallM:3,tallWs:[300,350,450,600],epT:20};
const RULE_META=[
  ['unit','장 폭 단위 (mm)','num','칸 폭이 이 단위로만 나옵니다 (50이면 395·390 같은 폭이 안 나옴)'],
  ['maxW','장 최대 폭 (mm)','num','이 폭을 넘는 장은 만들지 않습니다 (문 처짐)'],
  ['prefW','장 권장 최대 폭 (mm)','num','이 폭을 넘으면 되도록 칸을 나눕니다'],
  ['cookWs','쿡탑장 폭 (mm)','list','쿡탑 아래 장은 이 중 하나로만'],
  ['doorLeaf','우선 도어 폭 (mm)','list','문 한 짝이 이 폭이 되도록 먼저 맞춥니다'],
  ['ctBack','상판 뒷턱 기본 (mm)','num','현장에서 ‘없음’을 고르지 않으면 이 높이'],
  ['tallM','키큰장 1개 = 밑장 몇 m','num','견적에서 키큰장 1개를 밑장 m단가 × 이 값으로 계산'],
  ['tallWs','키큰장 폭 (mm)','list','키큰장 폭 선택지 · 가장 큰 값이 최대 폭'],
  ['epT','마감판(EP) 두께 (mm)','num','트인 쪽 끝 마감판 두께 · 도면에 표기']];
let RULES={...RULES_DEF};
const ruleList=v=>(Array.isArray(v)?v:String(v||'').split(/[,\s·/]+/)).map(Number).filter(x=>x>0).sort((a,b)=>a-b);
function applyRules(){try{SNAP_CACHE.clear()}catch(e){}const r=(typeof catalog!=='undefined'&&catalog&&catalog.rules)||{};const o={...RULES_DEF};
  RULE_META.forEach(([k,,t])=>{const v=r[k];if(v==null||v==='')return;if(t==='list'){const L=ruleList(v);if(L.length)o[k]=L}else if(+v>0)o[k]=+v});
  if(k_ok(o)){RULES=o;try{SNAP=o.unit;SNAP_MAX=o.maxW;COOK_W=o.cookWs;SNAP_LT=[...o.doorLeaf,...[400,350,450,300].filter(x=>!o.doorLeaf.includes(x))];TALL_WS=o.tallWs;TALL_MAX=Math.max(...o.tallWs)}catch(e){}}}
function k_ok(o){return o.unit>=5&&o.maxW>=o.unit*3&&o.prefW>0&&o.cookWs.length&&o.doorLeaf.length&&o.tallWs.length}
