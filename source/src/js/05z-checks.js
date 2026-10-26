/* ---------- 간섭 점검·자동 해결 (모델) ---------- */
function clashIssues(j=job){const out=[];if(isMD(j.cat))return out;const door=doorById(j.doorId),hinged=door?.kind==='hinged',proj=hProj(j),gs=j.faces.map((f,i)=>geom(j,i));
  if(isCornerLay(j)){const zs=[...new Set(gs.filter(g=>!g.island).flatMap(g=>g.rows.map(r=>r.zone)))].filter(z=>['blind','magic'].includes(cType(j,z)));
    if(zs.length){const c=cFill(j),nd=cNeed(j);if(c<nd)out.push({lvl:'bad',msg:`코너 휠라 ${c}mm — 손잡이 돌출 ${proj}mm면 ${nd}mm 이상이어야 코너 양쪽 서랍·문이 서로 안 걸립니다`,fix:{k:'cfill',v:null},fixLabel:`자동 ${nd}mm로`});
      else out.push({lvl:'ok',msg:`코너 휠라 ${c}mm를 A·B면 코너 양쪽에 넣었습니다 — ${proj?'서랍·문·손잡이가':'서랍·문이'} 맞은편 장에 안 걸림`})}}
  gs.forEach(g=>g.rows.forEach(r=>r.clash.forEach(c=>out.push({...c,fi:g.fi}))));
  if(hinged){const b=gs.reduce((a,g)=>a+g.rows.reduce((x,r)=>x+r.b2b,0),0);if(b&&proj)out.push({lvl:'info',msg:`이웃한 두 문의 경첩이 한 칸막이에 모인 곳 ${b}군데 — 두 문을 동시에 끝까지 열면 손잡이끼리 닿습니다 (한쪽씩 열면 문제없음 · J홈/푸시면 해결)`});
    const inner=gs.reduce((a,g)=>a+g.rows.reduce((x,r)=>x+r.mods.filter(m=>m.t==='drawer').length,0),0);if(inner)out.push({lvl:'ok',msg:`내부서랍 ${inner}칸: 문 경첩에 서랍이 걸리지 않게 좌우 덧대 25mm를 부재 목록에 넣었습니다`});
    if(gs.some(g=>g.rows.some(r=>r.hinge.some(h=>h==='L'||h==='R'))))out.push({lvl:'ok',msg:'한 짝 문의 경첩 방향은 벽·코너·서랍·후드 쪽을 피해 자동으로 정했습니다 (칸을 눌러 직접 바꿀 수 있음)'})}
  if(hinged){const ov=new Set();gs.forEach(g=>leaves(g,door).forEach(l=>{if(!['door','drawer','panel'].includes(l.kind))return;const p=handlePlace(j,l);if(p.over)ov.add(`${p.h.name} (${l.kind==='door'?'문':'서랍'} ${Math.round(l.kind==='door'&&p.vert?l.h:l.w)})`)}));
    if(ov.size)out.push({lvl:'warn',msg:`손잡이가 문·서랍보다 깁니다: ${[...ov].slice(0,3).join(', ')} — 더 짧은 손잡이를 고르거나 ‘서랍 폭에 맞춰 자동’을 켜세요`})}
  const ext=g=>Math.max(...g.rows.filter(r=>r.zone!=='upper').flatMap(r=>r.mods.map(m=>m.t==='dw'?620:layout(m).zones.some(z=>z.kind==='drawer')?g.Dm-50:0)),0);
  const leafMax=g=>Math.max(0,...leaves(g,door).filter(l=>l.kind==='door'&&l.zone!=='upper').map(l=>Math.round(l.w)));
  if(j.layout==='II'){const p=(+j.span)-2*(+j.dims.D),[A,B]=gs;if(A&&B){const la=hinged?leafMax(A):0,lb=hinged?leafMax(B):0,wide=Math.max(la,lb);
    if(hinged&&wide+DOOR_T+proj>p)out.push({lvl:'bad',msg:`통로 ${p}mm보다 문 한 짝(${wide}mm)이 넓어 맞은편 장에 걸려 끝까지 안 열립니다`,fix:{k:'narrow',max:p-DOOR_T-proj-20},fixLabel:'넓은 문 칸 반으로 나누기'});
    else if(hinged&&la+lb+2*(DOOR_T+proj)>p)out.push({lvl:'warn',msg:`마주 보는 A·B면 문(${la}+${lb})을 동시에 열면 서로 부딪힙니다 · 통로 ${p}mm`});
    const ea=ext(A),eb=ext(B);if(ea&&eb&&ea+eb>p)out.push({lvl:'warn',msg:`마주 보는 서랍을 동시에 끝까지 못 엽니다 (통로 ${p}mm)`})}}
  if(j.faces.some(f=>f.key==='I')){const gap=+j.island.gap||0,e=Math.max(...gs.map(ext),0);
    if(e&&gap<e+50)out.push({lvl:'bad',msg:`벽면 장~아일랜드 통로 ${gap}mm — 서랍·식기세척기 문(${e}mm)을 끝까지 못 엽니다`,fix:{k:'island',v:1000},fixLabel:'통로 1000mm로'});
    else if(e&&gap<e+400)out.push({lvl:'warn',msg:`통로 ${gap}mm — 서랍·식세기 문을 열어 두면 사람이 못 지나갑니다 (권장 1000~1200)`,fix:{k:'island',v:1000},fixLabel:'통로 1000mm로'})}
  return out}
function applyFix(fx,j=job){if(!fx)return;
  if(fx.k==='cfill')j.corner.fill=fx.v;
  if(fx.k==='spacer'){const f=j.faces[fx.fi];f.sp=f.sp||{};const k=fx.zone+':'+fx.side;f.sp[k]=(+f.sp[k]||0)+fx.w;f.edited=true}
  if(fx.k==='insFill'){const f=j.faces[fx.fi],row=f.rows[fx.ri],gr=geom(j,fx.fi).rows.find(r=>r.rix===fx.ri);if(!row||!gr)return;row.mods.forEach((m,i)=>m.r=gr.mods[i].w);row.mods.splice(fx.at,0,{t:'filler',n:0,r:fx.w,fix:true,filler:true});f.edited=true}
  if(fx.k==='island')j.island.gap=fx.v;
  if(fx.k==='narrow')j.faces.forEach((f,fi)=>{const g=geom(j,fi);f.rows.forEach((row,ri)=>{const gr=g.rows.find(r=>r.rix===ri);if(!gr||row.zone==='upper')return;row.mods.forEach((m,i)=>m.r=gr.mods[i].w);
    for(let i=row.mods.length-1;i>=0;i--){const m=row.mods[i],w=gr.mods[i].w,lw=w>650?w/2:w;if(!m.filler&&layout(gr.mods[i]).zones.some(z=>z.kind==='door')&&lw>fx.max){m.r=w/2;delete m.fix;delete m.unit;row.mods.splice(i+1,0,{...m});f.edited=true}}})})}
function autoFixAll(j=job){for(let k=0;k<6;k++){const fx=clashIssues(j).filter(x=>x.fix&&(x.lvl==='bad'||x.lvl==='warn'));if(!fx.length)return k;applyFix(fx[0].fix,j)}return 6}
function utilNeeds(j=job){const ap=allApps(j),elec=ap.filter(x=>x.a.kind==='cooktop'&&x.a.fuel==='elec'),gas=ap.filter(x=>x.a.kind==='cooktop'&&x.a.fuel==='gas'),u=j.util||{};
  const kw=elec.reduce((a,x)=>a+(+x.a.kw||0),0),others=ap.filter(x=>x.a.kind!=='cooktop'&&+x.a.kw>0),okw=others.reduce((a,x)=>a+(+x.a.kw||0),0);
  const lv=!elec.length?'none':kw<=3.4?'outlet':kw<=4.4?'circuit':'direct',heavy=lv==='circuit'||lv==='direct';
  const ct=+u.contract||0,peak=r2(kw+okw+1.5),why=[];
  if(elec.length){why.push(`쿡탑 최대 소비전력 ${r2(kw)}kW → ${lv==='outlet'?'3.4kW 이하라 일반 콘센트(최대 약 3.3~3.5kW)로 쓸 수 있습니다. 요즘 가정용 3구 인덕션 대부분이 이 등급입니다.':lv==='circuit'?'3.4kW를 넘어 일반 콘센트로는 차단기가 떨어집니다. 분전반에서 쿡탑만 쓰는 회로를 따로 빼야 합니다.':'7kW급 고출력이라 콘센트로는 불가. 분전반에서 굵은 선(6sq)을 직접 연결하고 40A 단독 차단기를 달아야 합니다.'}`);
    if(others.length)why.push(`주방 다른 전기 가전 ${others.map(x=>`${APP_KIND[x.a.kind]} ${x.a.kw}kW`).join(' · ')} → 쿡탑과 같은 콘센트·회로에 꽂지 않게 회로를 나눕니다.`);
    if(ct)why.push(peak>ct?`동시 사용 최대 약 ${peak}kW (쿡탑+가전+기본 생활 1.5kW) > 세대 계약전력 ${ct}kW → 메인 차단기가 떨어질 수 있어 계약전력 증설(한전 신청, 아파트는 관리사무소 확인)을 검토하세요.`:`동시 사용 최대 약 ${peak}kW ≤ 세대 계약전력 ${ct}kW → 계약전력 증설은 필요 없습니다.`);
    else if(lv!=='outlet')why.push(`세대 계약전력을 모릅니다 → 분전반 메인 차단기나 전기요금 고지서의 계약전력을 확인하세요 (오래된 아파트는 3kW인 곳이 많음).`)}
  const needLine=heavy&&u.line!=='yes',needBreaker=heavy&&u.breaker!=='yes',needOutlet=lv==='outlet'&&u.outlet==='no',needContract=!!(elec.length&&ct&&peak>ct);
  if(heavy&&u.line==='yes')why.push(`기존 전용선이 있다고 표시됨 → 전선 굵기가 ${lv==='direct'?'6sq':'2.5sq 이상'}인지 꼭 확인 (얇으면 재시공).`);
  return{elec,gas,lv,lvT:ELV[lv].t,spec:ELV[lv].spec,why,peak,ct,needLine,needBreaker,needOutlet,needContract,needGas:gas.length&&u.gas!=='yes',capGas:!gas.length&&elec.length&&u.gas==='yes',kw}}
function allApps(j=job){const out=[];j.faces.forEach((f,fi)=>{const g=geom(j,fi);g.rows.forEach(r=>r.mods.forEach((m,i)=>modApps(m).forEach(x=>out.push({...x,g,m,where:`${FACE_NAME(g.face)} ${r.zone==='upper'?'상부 ':r.zone==='top'?'위 칸 ':r.zone==='lower'?'하부 ':''}${i+1}번째 칸`,cx:obsOffset(g)+m.x+m.w/2}))))});return out}
const ELV={none:{t:'전기 쿡탑 없음',spec:''},outlet:{t:'일반 콘센트로 가능',spec:'쿡탑 칸 아래 단독 콘센트 (16A) · 다른 고출력 가전과 같은 회로 X'},circuit:{t:'전용 회로 필요',spec:'분전반 전용 회로 · 20A 차단기 · 전선 2.5sq 이상 (4sq 권장)'},direct:{t:'직결 전용선 + 단독 차단기 필수',spec:'분전반 직결 · 40A 단독 차단기 · 전선 6sq · 콘센트 X (단자 직결)'}};
function tileAreas(j=job){const t=j.tile;if(j.cat!=='kitchen'||!t?.on)return[];const tl=tileById(t.tileId);if(!tl)return[];
  return j.faces.map((f,fi)=>geom(j,fi)).filter(g=>!g.island).map(g=>{const up=g.rows.find(r=>r.zone==='upper'),z1=t.top==='ceiling'||!up?g.H:up.z0,x0=0,x1=g.len||g.W,z0=CTH+(g.ct.back||0);
    let area=(x1-x0)*(z1-z0)/1e6;(j.obstacles||[]).filter(o=>o.face===g.face&&o.type==='window').forEach(o=>{const ox=Math.max(0,Math.min(x1,o.x+o.w)-Math.max(x0,o.x)),oz=Math.max(0,Math.min(z1,o.z+o.h)-Math.max(z0,o.z));area-=ox*oz/1e6});
    const extra=t.top!=='ceiling'&&up?up.mods.filter(m=>m.raise>0).map(m=>({x:obsOffset(g)+m.x,w:m.w,z0:up.z0,z1:m.z0})):[];area+=extra.reduce((a,e)=>a+e.w*(e.z1-e.z0),0)/1e6;
    area=Math.max(0,area);const pcs=Math.ceil(area*1e6/(tl.w*tl.h)*1.1);return{g,tl,x0,x1,z0,z1,extra,area:r2(area),order:r2(area*1.1),pcs}})}
function supQty(sp,g,ctx){if(!sp)return null;const tw=ctx==='table'?g.tbl.len:g.Wm+2*g.side;
  if(sp.type==='leg')return{qty:ctx==='table'?(g.tbl.dir==='perp'?2:2):2+Math.max(0,Math.ceil(tw/1500)-1),spec:ctx==='table'?'식탁 끝':'뒤 오버행 모서리'};
  if(sp.type==='panel')return{qty:ctx==='table'?1:2,spec:ctx==='table'?'식탁 끝':'양 끝'};
  if(sp.type==='bracket')return{qty:Math.ceil(tw/600)+1,spec:'600 간격'};
  if(sp.type==='cabinet')return{qty:ctx==='table'?.6:ceil1(g.Wm/1000),spec:ctx==='table'?'식탁 끝 600 장':`깊이 ${Math.max(0,(+job.island.over||0)-20)}`};return null}
function ctLenOf(g){return Math.round(g.Wm+(g.ep?.L?g.sL:0)+(g.ep?.R?g.sR:0))}
function ctPieces(g){const len=g.island?g.Wm+2*(g.side||0):ctLenOf(g);return Math.max(1,Math.ceil(len/(g.ct.maxLen||3600)))}
