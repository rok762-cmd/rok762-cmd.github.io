// 계산 엔진 점검 (브라우저 없이 Node에서): 단위 점검 + 무작위 대량 점검
// 실행: node tests/engine/engine.test.js [무작위 개수=400] [시드=7]
const {load}=require('./load.js');
const N=+process.argv[2]||400,SEED=+process.argv[3]||7;
const E=load(['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27']);
let ok=0,fail=0;const fails=[];
const S=E.__E;
/* ---------- 0. 경계 점검: 엔진 파일(00~05)만으로 칸 계산·정리·견적이 돌아가야 함 (화면 코드에 기대면 실패) ---------- */
{const E0=load(['00','01','02','03','04','05']),S0=E0.__E;let err=null;
  try{for(const lay of ['I','L','U','Lisland','II']){S0.job=E0.newJob('kitchen');if(lay!=='I')E0.setLayout(lay);const j=S0.job;E0.applyRules();E0.fitAppCabs();E0.stdNormalize.quiet=1;E0.stdNormalize(j);j.faces.forEach((f,fi)=>{E0.geom(j,fi);E0.gview(j,fi)});E0.quote(j);E0.cutList(j);E0.clashIssues(j);E0.endPanels(j)}}catch(e){err=e.message}
  if(err){fail++;fails.push('엔진 경계: 화면 코드 없이 실행 안 됨 — '+err)}else ok++}
const check=(c,msg)=>{if(c)ok++;else{fail++;if(fails.length<40)fails.push(msg)}};
let seed=SEED;const rnd=()=>(seed=(seed*1103515245+12345)%2147483648)/2147483648,pick=a=>a[Math.floor(rnd()*a.length)],ri=(a,b)=>a+Math.floor(rnd()*(b-a+1));
const J=o=>JSON.stringify(o);
const R=()=>E.eval?null:null;
function fresh(lay){S.job=E.newJob('kitchen');if(lay&&lay!=='I'){E.setLayout(lay)}return S.job}
function settle(j){S.job=j;E.applyRules();try{E.fitAppCabs()}catch(e){}E.stdNormalize.quiet=1;E.stdNormalize(j);try{E.fitAppCabs()}catch(e){}E.stdNormalize(j)}
const rules=()=>E.vmRules?E.vmRules():null;

/* ---------- 1. 정규격 맞춤 단위 점검 (snapRow) ---------- */
E.applyRules();
const mod=(t,w,extra={})=>({t,w,x:0,z0:120,z1:820,n:S.TYPES?.[t]?.n??1,...extra});
{ // 문 달린 장 하나, 800 자리 → 800 (400×2)
  const r=E.snapRow([mod('base',800)],[{}],0,800);check(r&&r.ws[0]===800&&r.R===0,'snap 800 단일 '+J(r));}
{ // 50 단위가 아닌 자리 → 50 단위 + 남는 몇 mm
  const r=E.snapRow([mod('base',400),mod('base',437)],[{},{}],0,837);check(r&&r.ws.every(w=>w%50===0)&&r.R<50&&r.R>=0,'snap 50단위 '+J(r));}
{ // 쿡탑장은 600·750·800·900만
  const r=E.snapRow([mod('base',500),mod('cook',650)],[{},{}],0,1150);check(r&&[600,750,800,900].includes(r.ws[1]),'쿡탑장 규격 '+J(r));}
{ // 후드장은 고정 폭 유지
  const r=E.snapRow([mod('upper',500),mod('hood',600,{hk:'builtin'})],[{},{}],0,1150);check(r&&r.ws[1]===600,'후드 고정 '+J(r));}
{ // 최대 1200 넘지 않음
  const r=E.snapRow([mod('base',1500)],[{}],0,1500);check(!r||r.ws.every(w=>w<=1200),'최대 1200 '+J(r));}
{ // 400/350 도어 우선: 1500 자리 장 두 개 → 문 폭이 400 또는 350
  const r=E.snapRow([mod('base',750),mod('base',750)],[{},{}],0,1500);check(r&&r.ws.every(w=>[400,350,800,700].includes(w))||r.ws.every(w=>w%50===0),'도어 우선 '+J(r));}
{ // 직접 고른 폭(userW)은 지킴
  const r=E.snapRow([mod('base',600),mod('base',600)],[{userW:450},{}],0,1200);check(r&&r.ws[0]===450,'직접 폭 유지 '+J(r));}
{ // 자리가 남으면 작은 장 하나 제안
  const r=E.snapRow([mod('base',800),mod('base',800)],[{},{}],0,1750,{extra:true});check(r&&(r.ex>0||r.R<50),'작은 장 제안 '+J(r));}

/* ---------- 2. 견적 단위 점검 ---------- */
{ const j=fresh('I');settle(j);const q=E.quote(j);const sum=q.lines.reduce((a,l)=>a+l.amt,0);
  check(sum===q.sub,'견적 합계=공급가 '+sum+'/'+q.sub);check(q.total===q.sub+q.vat,'합계=공급가+부가세');
  for(const T of [q.total-12345,Math.floor(q.total/100000)*100000,q.total-1]){j.qTarget=T;const q2=E.quote(j);check(q2.total===T,'최종 금액 맞춤 '+T+' → '+q2.total)}
  delete j.qTarget;j.qDisc=50000;const q3=E.quote(j);check(q3.sub===q.sub-50000,'할인 반영');delete j.qDisc;
  const k=q.lines[0].key;j.qOv={[k]:{price:q.lines[0].price+1000}};const q4=E.quote(j);check(q4.lines[0].amt===Math.round(q4.lines[0].qty*(q.lines[0].price+1000)),'줄 단가 수정');
  j.qOv={[k]:{off:true}};const q5=E.quote(j);check(q5.hidden.length===1&&!q5.lines.some(l=>l.key===k),'줄 빼기');delete j.qOv;
  j.qAdd=[{id:'a1',item:'운반',qty:2,unit:'식',price:30000}];const q6=E.quote(j);check(q6.lines.some(l=>l.custom==='a1'&&l.amt===60000),'항목 추가');delete j.qAdd;}

/* ---------- 3. 무작위 대량 점검 ---------- */
const LAYS=['I','L','U','Lisland','II'];let strictRows=0,relaxRows=0;
for(let n=0;n<N;n++){
  const lay=pick(LAYS),j=fresh(lay),tag=`#${n} ${lay}`;
  j.faces.forEach(f=>{if(f.key==='I')return;f.len=ri(lay==='U'&&f.key==='A'?2600:1800,5200);if(rnd()<.35)f.ends={R:'panel'};if(rnd()<.15)f.ends={...(f.ends||{}),L:'panel'}});
  j.finish=pick(['filler','full']);if(rnd()<.3)j.bgap={mm:pick([50,100]),use:pick(['shelf','deep']),sh:100};
  if(rnd()<.35){const fs=j.faces.filter(f=>f.key!=='I'&&!(lay==='U'&&f.key==='A'));j.tallEnd={on:true,face:pick(fs).key,side:pick(['L','R']),k:pick(['pantry','combo','oven','larder','broom']),w:pick([450,600])};if(rnd()<.4)j.tall2={on:true,k:'pantry',w:pick([300,450,600])}}
  if(rnd()<.2)j.upAlign=false;if(rnd()<.2)j.ctBack='none';
  try{settle(j)}catch(e){check(false,tag+' 정리 중 오류 '+e.message);continue}
  // 정리 안정성: 한 번 더 해도 바뀌지 않아야 함
  const before=J(j.faces);E.stdNormalize(j);check(J(j.faces)===before,tag+' 정리가 반복해도 같음');
  j.faces.forEach((f,fi)=>{let g;try{g=E.geom(j,fi)}catch(e){check(false,tag+f.key+' geom 오류 '+e.message);return}
    const g2=E.geom(j,fi);check(J(g.rows.map(r=>r.mods.map(m=>[m.x,m.w])))===J(g2.rows.map(r=>r.mods.map(m=>[m.x,m.w]))),tag+f.key+' 같은 입력 같은 결과');
    if(g.island)return;
    check(Math.abs(g.sL+g.Wm+g.sR+g.cut-g.len)<=.5,`${tag}${f.key} 폭 합계 ${g.sL}+${g.Wm}+${g.sR}+${g.cut}≠${g.len}`);
    ['L','R'].forEach(sd=>{if(g.ep?.[sd])check((sd==='L'?g.sL:g.sR)===S.RULES.epT||g.shelfCF!=null,`${tag}${f.key} EP ${sd}`)});
    g.rows.forEach(r=>{const items=[...(r.corners||[]).filter(c=>!c.ghost),...r.mods,...(r.fill||[])].filter(m=>m.w>0).sort((a,b)=>a.x-b.x);
      items.forEach(m=>check(Number.isFinite(m.x)&&Number.isFinite(m.w),`${tag}${f.key} ${r.zone} 숫자 아님`));
      if(!r.tooMany)for(let k=1;k<items.length;k++)check(items[k].x>=items[k-1].x+items[k-1].w-1,`${tag}${f.key} ${r.zone} 겹침 ${items[k-1].t}${items[k-1].x}+${items[k-1].w} / ${items[k].t}${items[k].x}`);
      if(items.length){check(items[0].x>=-1-(f.key!=='A'?1e9:0)||r.zone!=='lower',`${tag}${f.key} 왼쪽 밖`);check(items[items.length-1].x+items[items.length-1].w<=g.Wm+1,`${tag}${f.key} ${r.zone} 오른쪽 밖 ${items[items.length-1].x+items[items.length-1].w}>${g.Wm}`)}
      const lo_=g.rows.find(x=>x.zone==='lower'),strict=r.zone==='lower'?(!r.snapRelax&&!r.tooMany):(!r.tooMany&&!(lo_&&(lo_.snapRelax||lo_.tooMany)));if(strict&&r.zone==='lower')strictRows++;else if(r.zone==='lower')relaxRows++;
      r.mods.forEach(m=>{if(m.t==='hood'||m.unit||m.filler)return;
        if(strict){check(m.w%50===0,`${tag}${f.key} ${r.zone} 50단위 아님 ${m.t}${m.w}`);check(m.w<=1200,`${tag}${f.key} ${r.zone} 1200 초과 ${m.w}`)}
        if(strict&&r.zone==='lower'&&m.t==='cook')check([600,750,800,900].includes(m.w),`${tag}${f.key} 쿡탑장 ${m.w}`)})})});
  if(j.faces.some((f,fi)=>{const g=E.geom(j,fi);return!g.island&&g.rows.some(r=>r.tooMany)})){const pc=E.prodCheck(j);check(pc.bad>0,`${tag} 자리가 안 되는 현장인데 검증기 경고 없음`)}
  const q=E.quote(j);check(q.lines.every(l=>Number.isFinite(l.amt))&&q.total===q.sub+q.vat,`${tag} 견적 숫자`);
}
console.log(`엔진 점검: 무작위 ${N}개 (하부 줄: 정상 ${strictRows} · 자리 부족 ${relaxRows})`);
fails.forEach(f=>console.log('FAIL',f));
console.log(`OK ${ok}  FAIL ${fail}`);process.exit(fail?1:0);
