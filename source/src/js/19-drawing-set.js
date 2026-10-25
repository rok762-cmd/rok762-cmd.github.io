/* ---------- 도면 세트: 평면 상세·측면·배면·상판 ---------- */
let drawTab='front';
function pageHead(j,title,sub=''){const W=1400,H=990;return`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}"><style>${PAPER_CSS}</style><rect width="${W}" height="${H}" fill="#fff"/>`+
  `<rect x="16" y="16" width="${W-32}" height="${H-32}" class="fr" stroke-width="2"/><text x="36" y="50" font-size="22" class="hd">${esc(title)}</text>`+
  `<text x="${W-36}" y="50" font-size="13" class="lb" text-anchor="end">No. ${esc(j.docNo)} · ${esc(j.customer.name||'')} · ${esc(sub)}단위 mm</text><line x1="16" y1="64" x2="${W-16}" y2="64" class="fr"/>`}
function noteBox(x,y,w,title,lines){let s=`<text x="${x}" y="${y}" font-size="15" class="hd">${esc(title)}</text>`;lines.filter(Boolean).slice(0,8).forEach((t,i)=>s+=`<text x="${x}" y="${y+24+i*21}" font-size="13" class="vl">· ${esc(t.length>Math.floor(w/13)?t.slice(0,Math.floor(w/13)-1)+'…':t)}</text>`);return s}
function endKind(j,g,side){if(g.island||g.ep?.[side])return'open';if(isMD(g.cat))return'wall';const c=isCornerLay(j);if(c&&side==='L')return'corner';if(c&&side==='R'&&g.face==='A'&&j.layout==='U')return'corner';return'wall'}
const END_TXT={wall:'벽 붙음',corner:'코너 (옆 면 장과 맞닿음)',open:'노출 측판 (마감재)'};
function sideExt(g){const K=g.cat==='kitchen';return{w:(g.island?(+job.island.over||0)+g.Dm+40:(K?g.D+20:g.Dm))+160,h:g.H}}
function sideView(j,g,side,k){const dir=side==='L'?1:-1,X=x=>x*dir,K=g.cat==='kitchen',DT=20,pl=g.pl||0,ek=endKind(j,g,side);
  const box=(x0,x1,z0,z1,c)=>Rc(Math.min(X(x0),X(x1)),z0,Math.abs(x1-x0),z1-z0,c);let s='';
  const lo=g.rows.find(r=>r.zone!=='upper'),up=g.rows.find(r=>r.zone==='upper');
  if(g.island){const cab=g.Dm,ov=+j.island.over||0;s+=Lc(X(-ov-80),0,X(cab+120),0,'gnd');
    s+=box(0,cab-DT,pl,lo?lo.z1:g.ct0,'box')+box(cab-DT,cab,pl+3,(lo?lo.z1:g.ct0)-3,'ln')+box(30,cab-DT-40,0,pl,'thin');
    s+=box(-ov,cab+(g.side?0:0),g.ct0,CTH,'box')+TX(X(-ov/2),g.ct0-40*k,`오버행 ${ov}`,9*k,'class="t" text-anchor="middle"');
    s+=dimH(X(-ov),X(cab),900+40*k,`${ov+cab}`,k,CTH)+dimH(X(0),X(cab),-50*k,`${cab}`,k,0);
    s+=dimV(0,pl,X(cab)+dir*40*k,`${pl}`,k)+dimV(pl,g.ct0,X(cab)+dir*40*k,`${g.ct0-pl}`,k)+dimV(g.ct0,CTH,X(cab)+dir*40*k,`${CTH-g.ct0}`,k)+dimV(0,CTH,X(cab)+dir*84*k,String(CTH),k);
    return s+TX(X(cab/2),g.H+40*k,END_TXT.open,10*k,'class="t" text-anchor="middle"')}
  s+=Lc(0,-60,0,g.H+60,'gnd')+Lc(X(-20),0,X((K?g.D+20:g.Dm)+150),0,'gnd')+Lc(0,g.H,X((K?g.D:g.Dm)+120),g.H,'thin')+TX(X(40),g.H+12*k,'천장',9*k,`class="t" ${dir<0?'text-anchor="end"':''}`);
  const chain=[];
  if(K){const cd=g.D-DT,z1=lo?lo.z1:g.ct0,b=g.bg||0,sh=g.bgUse==='shelf',c0=sh?b:0;
    s+=box(b,b+cd,pl,z1,'box')+box(b+cd,b+cd+DT,pl+3,z1-3,'ln')+box(b,b+cd-50,0,pl,'thin')+box(b+cd-68,b+cd-50,0,pl,'box');
    s+=box(c0,b+g.D+20,g.ct0,CTH,'box');if(g.ct.back)s+=box(c0,c0+20,CTH,CTH+g.ct.back,'box');if(g.ct.front==='nose')s+=box(b+g.D+5,b+g.D+20,CTH,CTH+8,'box')+TX(X(b+g.D+12),CTH+40*k,'물코',8*k,'class="t" text-anchor="middle"');else if(g.ct.front==='groove')s+=box(b+g.D-25,b+g.D-15,CTH-4,CTH,'sh')+TX(X(b+g.D-20),CTH+40*k,'물홈',8*k,'class="t" text-anchor="middle"');if(g.ct.back)s+=TX(X(c0+10),CTH+g.ct.back+30*k,`뒷턱 ${g.ct.back}`,8*k,'class="t" text-anchor="middle"');
    if(b&&sh){const shh=Math.max(0,+(g.jref.bgap?.sh??100)||0);s+=box(0,b,CTH+shh-20,CTH+shh,'box');if(shh>20)s+=box(b-20,b,CTH,CTH+shh-20,'box');s+=dimH(X(0),X(b),CTH+shh+40*k,`뒷선반 ${b}`,k,CTH+shh)}
    if(b)s+=dimH(X(0),X(b),-140*k,`벽에서 띄움 ${b}`,k,0);
    s+=dimH(X(b),X(b+cd),-50*k,`${cd}`,k,0)+dimH(X(b+cd),X(b+cd+DT),-50*k,`${DT}`,k,0)+dimH(X(c0),X(b+g.D+20),CTH+50*k,`상판 ${b+g.D+20-c0}`,k,CTH)+dimH(X(b+cd-50),X(b+cd),-95*k,'걸레받이 50 들임',k,0);
    chain.push([0,pl],[pl,g.ct0],[g.ct0,CTH]);
    if(up){const z0=up.z0,z1u=up.z1;{const ub=UPD()-20;s+=box(0,ub,z0,z1u,'box')+box(ub,ub+20,z0+3,z1u-3,'ln')+dimH(X(0),X(ub),z1u+40*k,String(ub),k,z1u)+dimH(X(ub),X(ub+20),z1u+40*k,'20',k,z1u)}chain.push([CTH,z0],[z0,z1u]);
      const tp=g.rows.find(r=>r.zone==='top');if(tp){const td=g.topD;s+=box(0,td-20,tp.z0,tp.z1,'box')+box(td-20,td,tp.z0+3,tp.z1-3,'ln')+dimH(X(0),X(td),tp.z1+40*k,`위 칸 ${td}`,k,tp.z1);chain.push([tp.z0,tp.z1]);const z1t=tp.z1;if(g.H>z1t){if(g.fin==='filler')s+=box(td-20,td,z1t,g.H,'sh');chain.push([z1t,g.H])}}
      else if(g.H>z1u){if(g.fin==='filler')s+=box(UPD()-20,UPD(),z1u,g.H,'sh');chain.push([z1u,g.H])}}
    else if(g.H>CTH)chain.push([CTH,g.H])}
  else{const cd=g.Dm-DT,top=g.Hm;s+=box(0,cd,pl,top,'box')+box(cd,cd+DT,pl+3,top-3,'ln')+box(0,cd,0,pl,'thin');
    if(g.H>top&&g.fin==='filler')s+=box(cd,cd+DT,top,g.H,'sh');
    s+=dimH(X(0),X(cd),-50*k,`${cd}`,k,0)+dimH(X(cd),X(cd+DT),-50*k,`${DT}`,k,0)+dimH(X(0),X(cd+DT),-95*k,`깊이 ${g.Dm}`,k,0);
    chain.push([0,pl],[pl,top]);if(g.H>top)chain.push([top,g.H])}
  const xr=X((K?g.D+20:g.Dm))+dir*40*k;chain.filter(([a,b])=>b-a>0).forEach(([a,b])=>s+=dimV(a,b,xr,`${Math.round(b-a)}`,k));s+=dimV(0,g.H,xr+dir*44*k,`${g.H}`,k);
  const gap=side==='L'?g.sL:g.sR;
  return s+TX(X((K?g.D:g.Dm)/2),g.H+70*k,`${END_TXT[ek]}${ek==='wall'&&gap?` · 벽 틈 ${gap}`:''}`,10*k,'class="t" text-anchor="middle"')}
function rearView(j,g,k){const W=g.Wm,mx=x=>W-x;let s='';
  g.rows.forEach(row=>{rowAll(row).forEach(m=>{const x=mx(m.x+m.w);if(m.filler){s+=Rc(x,m.z0,m.w,m.z1-m.z0,'thin');return}s+=Rc(x,m.z0,m.w,m.z1-m.z0,'box')+Rc(x+T,m.z0+T,m.w-2*T,m.z1-m.z0-2*T,'thin')});
    if(!g.island&&(row.zone==='upper'||row.zone==='full'))s+=Lc(0,row.z1-90,W,row.z1-90,'dash')+TX(W/2,row.z1-80+6*k,'벽 고정 레일 (행거 볼트)',8*k,'class="t" text-anchor="middle"')});
  if(g.pl)s+=Rc(0,0,W,g.pl,'thin');if(g.cat==='kitchen')s+=Rc(g.island?-g.side:0,g.ct0,W+(g.island?2*g.side:0),CTH-g.ct0,'box');
  const off=obsOffset(g);obstacleIssues(j).filter(x=>x.o.face===g.face).forEach(({o,ok})=>{const c=OBS[o.type]||OBS.etc,x=mx(o.x-off+o.w);
    s+=R(x,o.z,o.w,o.h,`fill="${c.color}" fill-opacity=".12" stroke="${c.color}" stroke-width="1.4" stroke-dasharray="8 5" vector-effect="non-scaling-stroke"`)+TX(x+o.w/2,o.z+o.h/2,`${c.label}${ok?'':' · 뒷판 타공'}`,Math.min(9*k,o.w/4),`fill="${c.color}" text-anchor="middle"`)});
  allApps(j).filter(x=>x.g.face===g.face&&['sink','dw','wash'].includes(x.a.kind)).forEach(x=>{const cx=mx(x.m.x+x.m.w/2);s+=`<circle class="dash" cx="${f(cx)}" cy="${f(-260)}" r="${f(40)}"/>`+TX(cx,200,'배관 Ø80',8*k,'class="t" text-anchor="middle"')});
  const top=g.rows[g.rows.length-1];top.mods.forEach(m=>s+=dimH(mx(m.x+m.w),mx(m.x),g.H+36*k,`${m.w}`,k,top.z1));s+=dimH(0,W,g.H+78*k,`${W}`,k);
  return s+Lc(-150,0,W+150,0,'gnd')+TX(0,-60*k,`← ${g.island?'':'우측 끝'}`,9*k,'class="t"')+TX(W,-60*k,`${g.island?'':'좌측 끝'} →`,9*k,'class="t" text-anchor="end"')}
function sidePage(j=job,fi=j.fi){const g=geom(j,fi);let s=pageHead(j,`측면도·배면도 · ${CATS[g.cat].name}${j.faces.length>1?' · '+FACE_NAME(g.face):''}`,`${LAYOUTS[j.layout]} · `);
  if(isMD(g.cat))return s+`<text x="36" y="120" font-size="15" class="lb">중문은 정면도로 충분합니다.</text></svg>`;
  const e=sideExt(g);
  s+=placeView({x:36,y:78,w:330,h:540},'좌측면도',e.w*1.15,g.H*1.2,k=>sideView(j,g,'L',k));
  s+=placeView({x:376,y:78,w:330,h:540},'우측면도',e.w*1.15,g.H*1.2,k=>`<g transform="translate(${f(e.w)},0)">${sideView(j,g,'R',k)}</g>`);
  s+=placeView({x:724,y:78,w:640,h:560},'배면도 · 뒤에서 본 모습',(g.Wm+2*(g.side||0))*1.18,g.H*1.16,k=>rearView(j,g,k));
  s+=`<line x1="16" y1="694" x2="1384" y2="694" class="fr"/>`;
  const K=g.cat==='kitchen';
  s+=noteBox(36,724,640,'측면 기준',[`좌측: ${END_TXT[endKind(j,g,'L')]} · 우측: ${END_TXT[endKind(j,g,'R')]}`,K?`하부장 몸통 ${g.D-20} + 도어 20 = ${g.D} · 상판 ${g.D+20} (앞 20 돌출)`:`몸통 ${g.Dm-20} + 도어 20 = ${g.Dm}`,K?`걸레받이 ${g.pl} · 앞에서 50 들임 (발 들어가는 자리)`:`걸레받이 ${g.pl||0}`,
    K&&g.rows.some(r=>r.zone==='upper')?`상부장 몸통 ${UPD()-20} + 도어 20 · 바닥에서 ${g.rows.find(r=>r.zone==='upper').z0}부터`:'',g.fin==='filler'?`상몰딩 ${g.top} · 좌우 휠라 ${g.sL}/${g.sR}`:`몰딩 없음 · 위 ${g.top} 띄움`,g.ct?.back?`상판 뒷턱 ${g.ct.back}`:'']);
  s+=noteBox(724,724,640,'배면 기준',['뒤에서 본 모습이라 좌우가 반대입니다',`설비 걸림 ${obstacleIssues(j).filter(x=>x.o.face===g.face&&!x.ok).length}곳 · 걸린 곳은 뒷판 타공`,K?'싱크·식세기·세탁기 칸 뒷판에 배관 구멍 Ø80':'',!g.island?'벽 고정 레일 위치 = 장 윗면에서 90 아래':'']);
  return s+'</svg>'}
function planModDims(j,k){const pg=planGeo(j);let s='';
  j.faces.forEach((fc,fi)=>{const g=geom(j,fi),r=pg.rects.find(x=>x.key===g.face);if(!r)return;const row=g.rows.find(x=>x.zone!=='upper')||g.rows[0];if(!row)return;
    const vert=r.h>r.w&&r.key!=='A'&&r.key!=='I'&&!r.flip,items=rowAll(row).filter(m=>m.w>0);
    items.forEach(m=>{const a=r.key==='I'?r.x+m.x:obsOffset(g)+m.x,b=a+m.w,lab=m.blind?`${m.w}`:`${m.w}`;
      if(vert){const x=r.key==='C'?r.x-34*k:r.x+r.w+34*k;s+=dimV(-a,-b,x,lab,k)}else{const y=r.flip?r.y-34*k:r.y+r.h+34*k;s+=dimH(a,b,-y,lab,k)}})});
  return s}
function planDetailSVG(j=job){let s=pageHead(j,`평면도 · ${CATS[j.cat].name} · ${LAYOUTS[j.layout]}`,'위에서 본 모습 · ');
  const b=planBox(j),area={x:36,y:80,w:1328,h:700},sc=Math.min(area.w/b.w,area.h/b.h),k=1/sc,ox=area.x+(area.w-b.w*sc)/2-b.x*sc,oy=area.y+(area.h-b.h*sc)/2-b.y*sc;
  s+=`<g transform="translate(${f(ox)},${f(oy)}) scale(${sc.toFixed(5)})">${planInner(j,k,null,false).s}${planModDims(j,k)}</g>`;
  s+=`<line x1="16" y1="800" x2="1384" y2="800" class="fr"/>`;
  const rows=j.faces.map((fc,fi)=>{const g=geom(j,fi);return`${FACE_NAME(g.face)}: 실측 ${g.island?g.W:fc.len}${g.cut?` − 코너 ${g.cut}`:''} → 제작 ${g.Wm} · 깊이 ${g.Dm} · 칸 ${g.rows.find(r=>r.zone!=='upper')?.mods.length||0}개`});
  s+=noteBox(36,828,900,'면별 치수',rows)+noteBox(960,828,400,'읽는 법',['파란 숫자 = 칸 폭 (하부·전체 장 기준)',`점선 = 상부장 (깊이 ${UPD()})`,'빗금 = 데드코너 · 주황 = 코너 휠라']);
  return s+'</svg>'}
function ctFaceMap(j,g,r){ // face coords u (from face x=0), v (from wall) → plan [x,y]
  const off=obsOffset(g),S=+j.span;if(g.island)return(u,v)=>[r.x+u,r.y+v];
  if(r.key==='A')return(u,v)=>[off+u,v];if(r.flip)return(u,v)=>[off+u,S-v];if(r.key==='C')return(u,v)=>[r.x+r.w-v,off+u];return(u,v)=>[v,off+u]}
function counterSVG(j=job){let s=pageHead(j,`상판 도면 · ${LAYOUTS[j.layout]}`,'위에서 본 모습 · ');
  if(j.cat!=='kitchen')return s+'<text x="36" y="120" font-size="15" class="lb">상판 도면은 주방 싱크대에서만 나옵니다.</text></svg>';
  const pg=planGeo(j),gs=j.faces.map((fc,i)=>geom(j,i)),pieces=[],cuts=[],seams=[],dims=[];
  const A=gs.find(g=>g.face==='A'),cdA=A?A.D+20:0;
  gs.forEach(g=>{const r=pg.rects.find(x=>x.key===g.face);if(!r)return;const P=ctFaceMap(j,g,r),c=g.island?islandCounter(j):counterById(j.counterId),cs=ctSpec(c);
    let u0=g.island?-g.side:-(g.sL||0),u1=g.Wm+(g.island?g.side:(g.sR||0)),vd=g.island?g.D:g.D+20;
    if(!g.island&&g.cut>0){const clip=Math.max(0,cdA-(g.cut));u0=Math.max(u0,clip-(g.sL||0))}
    const v0_=g.pen!=null?-g.pen:0;
    if(g.lidW){const lu=g.lidW;pieces.push({pts:[P(u0,0),P(lu,0),P(lu,vd),P(u0,vd)],g,c,cs,P,u0,u1:lu,vd,lid:true,label:'리프트업 상판 (코너 수납 덮개)'});u0=lu;seams.push([P(lu,0),P(lu,vd),''])}
    {const sg=g.island?[[u0,u1]]:ctSegs(g,u0,u1);sg.slice(1).forEach(([a,b])=>pieces.push({pts:[P(a,v0_),P(b,v0_),P(b,vd),P(a,vd)],g,c,cs,P,u0:a,u1:b,vd,label:`${g.face} 상판 (키큰장 옆)`}));if(sg[0]){u0=sg[0][0];u1=sg[0][1]}}
    const pts=[P(u0,v0_),P(u1,v0_),P(u1,vd),P(u0,vd)];pieces.unshift({pts,g,c,cs,P,u0,u1,vd,label:g.pen!=null?`B 상판 (반도형 · 뒤 오버행 ${g.pen})`:''});
    const n=ctPieces(g);for(let i=1;i<n;i++){const u=u0+(u1-u0)*i/n;seams.push([P(u,0),P(u,vd),'이음'])}
    if(!g.island&&g.cut>0&&cs.type!=='artificial')seams.push([P(u0,0),P(u0,vd),'코너 이음']);
    dims.push({a:P(u0,vd+70),b:P(u1,vd+70),label:`${Math.round(u1-u0)}`,vertical:Math.abs(P(u0,0)[0]-P(u1,0)[0])<1});
    dims.push({a:P(u1+70,0),b:P(u1+70,vd),label:`${vd}`,vertical:Math.abs(P(u1,0)[0]-P(u1,vd)[0])<1});
    if(g.tbl){const t=pg.rects.find(x=>x.key==='T');if(t)pieces.push({rect:t,label:`식탁 상판 ${g.tbl.len}×${g.tbl.depth}`})}});
  allApps(j).filter(x=>['sink','cooktop'].includes(x.a.kind)&&x.a.w).forEach(x=>{const pc=pieces.find(p=>p.g&&p.g.face===x.g.face);if(!pc)return;const cp=cutPos(x.m,x.a),cw=cp.cw,cd=cp.cd,fg=cp.fg,uc=x.m.x+x.m.w/2+cp.dx;
    const v1=pc.vd-fg,v0=v1-cd;cuts.push({pc,x,uc,cw,cd,v0,v1,fg,faucet:cp.faucet});});
  let mnx=1e9,mny=1e9,mxx=-1e9,mxy=-1e9;const acc=([x,y])=>{mnx=Math.min(mnx,x);mny=Math.min(mny,y);mxx=Math.max(mxx,x);mxy=Math.max(mxy,y)};pieces.forEach(p=>p.pts?p.pts.forEach(acc):[[p.rect.x,p.rect.y],[p.rect.x+p.rect.w,p.rect.y+p.rect.h]].forEach(acc));
  const pad=Math.max(mxx-mnx,mxy-mny)*.12+150,bx=mnx-pad,by=mny-pad,bw=mxx-mnx+2*pad,bh=mxy-mny+2*pad,area={x:36,y:80,w:1328,h:680},sc=Math.min(area.w/bw,area.h/bh),k=1/sc,ox=area.x+(area.w-bw*sc)/2-bx*sc,oy=area.y+(area.h-bh*sc)/2-by*sc;
  let d='';pieces.forEach(p=>{if(p.rect){d+=`<rect x="${f(p.rect.x)}" y="${f(p.rect.y)}" width="${f(p.rect.w)}" height="${f(p.rect.h)}" class="box" stroke-dasharray="10 6"/><text class="t" x="${f(p.rect.x+p.rect.w/2)}" y="${f(p.rect.y+p.rect.h/2)}" font-size="${f(10*k)}" text-anchor="middle">${esc(p.label)}</text>`;return}
    d+=`<polygon points="${p.pts.map(q=>q.map(f).join(',')).join(' ')}" fill="${p.c?.color||'#eee'}" fill-opacity=".55" class="box"/>`;const cx=(p.pts[0][0]+p.pts[2][0])/2,cy=(p.pts[0][1]+p.pts[2][1])/2;
    d+=`<text class="t" x="${f(cx)}" y="${f(cy-10*k)}" font-size="${f(11*k)}" text-anchor="middle" font-weight="700">${esc(p.label||(p.g.island?'아일랜드':p.g.face)+' 상판')}</text>`});
  {const sp_=ctSpecJ(j,counterById(j.counterId)),bk=sp_.back,poly=q=>`<polygon points="${q.map(v=>v.map(f).join(',')).join(' ')}" fill="#5B6168" fill-opacity=".55" stroke="#333" stroke-width="${f(.8*k)}"/>`;const Ap=pieces.filter(p=>p.pts&&p.g&&!p.g.island&&p.g.face==='A'),mnA=Math.min(...Ap.map(p=>p.u0)),mxA=Math.max(...Ap.map(p=>p.u1));
    pieces.filter(p=>p.pts&&p.g&&!p.g.island).forEach(p=>{const P=p.P;if(bk){d+=poly([P(p.u0,0),P(p.u1,0),P(p.u1,20),P(p.u0,20)]);if(p.g.face==='A'&&isCornerLay(j)){if(p.u0===mnA){d+=poly([P(p.u0,0),P(p.u0+20,0),P(p.u0+20,p.vd),P(p.u0,p.vd)]);const tp=P(p.u0+60,60);d+=`<text class="t" x="${f(tp[0])}" y="${f(tp[1])}" font-size="${f(9*k)}" fill="#333">뒷턱 ${bk} ㄱ자 연결</text>`}if(j.layout==='U'&&p.u1===mxA)d+=poly([P(p.u1-20,0),P(p.u1,0),P(p.u1,p.vd),P(p.u1-20,p.vd)])}}
      if(sp_.front&&sp_.front!=='flat'){const a=P(p.u0,p.vd-40),b=P(p.u1,p.vd-40);d+=`<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" stroke="#1E56D0" stroke-width="${f(1.4*k)}" stroke-dasharray="${f(8*k)} ${f(5*k)}"/>`}});}
  pg.walls.forEach(pts=>d+=`<polyline class="gnd" fill="none" points="${pts.map(q=>q.map(f).join(',')).join(' ')}"/>`);
  seams.forEach(([a,b,l])=>d+=`<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" stroke="#C2410C" stroke-width="2" stroke-dasharray="12 6" vector-effect="non-scaling-stroke"/><text x="${f((a[0]+b[0])/2+6*k)}" y="${f((a[1]+b[1])/2)}" font-size="${f(9*k)}" fill="#C2410C">${l}</text>`);
  cuts.forEach(c=>{const P=c.pc.P,q=[P(c.uc-c.cw/2,c.v0),P(c.uc+c.cw/2,c.v0),P(c.uc+c.cw/2,c.v1),P(c.uc-c.cw/2,c.v1)],xs=q.map(p=>p[0]),ys=q.map(p=>p[1]),x0=Math.min(...xs),y0=Math.min(...ys),w=Math.max(...xs)-x0,h=Math.max(...ys)-y0;
    d+=`<rect x="${f(x0)}" y="${f(y0)}" width="${f(w)}" height="${f(h)}" fill="#fff" stroke="#111" stroke-width="1.4" vector-effect="non-scaling-stroke" rx="${f(c.x.a.kind==='sink'?30:4)}"/>`;
    d+=`<text class="t" x="${f(x0+w/2)}" y="${f(y0+h/2)}" font-size="${f(9*k)}" text-anchor="middle">${APP_KIND[c.x.a.kind]} ${c.cw}×${c.cd}</text><text class="t" x="${f(x0+w/2)}" y="${f(y0+h/2+12*k)}" font-size="${f(8*k)}" text-anchor="middle">중심 ${Math.round(c.uc-c.pc.u0)} · 앞에서 ${c.fg}</text>`;
    const cc=P(c.uc,(c.v0+c.v1)/2);d+=`<line x1="${f(cc[0]-14*k)}" y1="${f(cc[1])}" x2="${f(cc[0]+14*k)}" y2="${f(cc[1])}" stroke="#1E56D0" vector-effect="non-scaling-stroke"/><line x1="${f(cc[0])}" y1="${f(cc[1]-14*k)}" x2="${f(cc[0])}" y2="${f(cc[1]+14*k)}" stroke="#1E56D0" vector-effect="non-scaling-stroke"/>`;
    if(c.x.a.kind==='sink'&&c.faucet!=='none'&&c.v0>70){const fp=P(c.uc+(c.faucet==='left'?-(c.cw/2-40):c.faucet==='right'?c.cw/2-40:0),c.v0/2);d+=`<circle cx="${f(fp[0])}" cy="${f(fp[1])}" r="17.5" fill="#fff" stroke="#111" vector-effect="non-scaling-stroke"/><text class="t" x="${f(fp[0]+24*k)}" y="${f(fp[1]+3*k)}" font-size="${f(8*k)}">수전 Ø35</text>`}});
  dims.forEach(m=>{if(m.vertical)d+=dimV(-m.a[1],-m.b[1],m.a[0],m.label,k);else d+=dimH(m.a[0],m.b[0],-m.a[1],m.label,k)});
  s+=`<g transform="translate(${f(ox)},${f(oy)}) scale(${sc.toFixed(5)})">${d}</g><line x1="16" y1="776" x2="1384" y2="776" class="fr"/>`;
  const c0=counterById(j.counterId),cs=ctSpecJ(j,c0);
  s+=noteBox(36,804,680,'상판 사양',[`${c0?.name||'-'} · ${cs.label} ${cs.thick}T · ${cs.note}`,`깊이 = 하부장 ${A?A.D:''} + 앞 돌출 20 · 벽 쪽 3면 실리콘`,`타공: 현장에서 진행 (아래 타공 목록 위치대로) · 싱크볼 ${cs.mount==='under'?'언더':cs.mount==='over'?'탑마운트':'일체형'}`,ctEdgeTxt(j).slice(3).replace(' · ',' · 앞 '),`최대 길이 ${cs.maxLen} · 넘으면 이음`]);
  s+=noteBox(740,804,620,'타공 목록',cuts.map(c=>`${c.pc.g.island?'아일랜드':c.pc.g.face} ${APP_KIND[c.x.a.kind]} ${c.cw}×${c.cd} · 시작에서 중심 ${Math.round(c.uc-c.pc.u0)} · 앞에서 ${c.fg}`).concat(cuts.length?[]:['타공 없음']));
  return s+'</svg>'}
function nestSVG(str,x,y,w,h){const m=str.match(/<svg[^>]*viewBox="([^"]+)"[^>]*>/);if(!m)return'';const inner=str.slice(m.index+m[0].length,str.lastIndexOf('</svg>'));return`<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${m[1]}" preserveAspectRatio="xMidYMid meet">${inner}</svg>`}
function sheetSVG(j=job){const W=1400,H=990,C=catalog.company||{},cu=j.customer||{},d=doorById(j.doorId),ct=j.cat==='kitchen'?counterById(j.counterId):null,nF=j.faces.length;let s=`<rect width="${W}" height="${H}" fill="#fff"/><rect x="14" y="14" width="${W-28}" height="${H-28}" fill="none" stroke="#222" stroke-width="2"/><rect x="20" y="20" width="${W-40}" height="${H-40}" fill="none" stroke="#222" stroke-width=".8"/>`;
  const tbY=H-130,planW=Math.round((W-60)*(nF>1?.42:.38));s+=nestSVG(planDetailSVG(j),30,30,planW,tbY-40)+`<line x1="${30+planW+8}" y1="30" x2="${30+planW+8}" y2="${tbY-6}" stroke="#bbb" stroke-dasharray="6 5"/>`;
  const ex=30+planW+20,ew=W-30-ex,eh=(tbY-40)/Math.max(1,nF);j.faces.forEach((f,i)=>{s+=`<text x="${ex}" y="${44+i*eh}" font-size="15" font-weight="700" fill="#222">${FACE_NAME(f.key)} 정면 (입면)</text>`+nestSVG(sceneSVG(j,{fi:i,caption:false,px:900}),ex,50+i*eh,ew,eh-26)});
  const cells=[['회사',C.name||''],['고객',String(cu.name||'').replace(/^예시\)\s*/,'')],['현장 주소',cu.addr||''],['날짜',cu.date||new Date().toLocaleDateString('ko-KR')],['품목',`${CATS[j.cat].name} · ${LAYOUTS[j.layout]||''}`],['크기',j.faces.map(f=>`${FACE_NAME(f.key)} ${f.len}`).join(' · ')],['도어',(d?.name||'-')+(j.doorUpperId?` / 상부 ${doorById(j.doorUpperId)?.name||''}`:'')+(j.hs?.chan?' · 찬넬':'')],['상판',ct?.name||'-']];
  s+=`<rect x="20" y="${tbY}" width="${W-40}" height="${H-20-tbY}" fill="#fafafa" stroke="#222" stroke-width="1.2"/>`;const cw=(W-40-240)/4;s+=`<text x="40" y="${tbY+50}" font-size="26" font-weight="800" fill="#1E56D0">${esc(C.name||'실측 스튜디오')}</text><text x="40" y="${tbY+80}" font-size="13" fill="#555">${esc(C.phone||C.tel||'')}</text><line x1="260" y1="${tbY}" x2="260" y2="${H-20}" stroke="#222"/>`;
  cells.forEach(([k,v],i)=>{const cx=260+(i%4)*cw,cy=tbY+(i<4?0:(H-20-tbY)/2),ch=(H-20-tbY)/2;s+=`<rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" fill="none" stroke="#999" stroke-width=".7"/><text x="${cx+8}" y="${cy+18}" font-size="11" fill="#777">${k}</text><text x="${cx+8}" y="${cy+42}" font-size="14" fill="#111">${esc(String(v)).slice(0,40)}</text>`});
  return`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}">${s}</svg>`}
function drawPage(tab=drawTab,j=job,fi=j.fi){if(tab==='sheet')return sheetSVG(j);if(tab==='room')return roomPage(j);if(tab==='elec')return elecPage(j,fi);if(tab==='plan')return planDetailSVG(j);if(tab==='side')return sidePage(j,fi);if(tab==='counter')return counterSVG(j);return drawingSVG(j,fi)}

/* ---------- 고객 요구사항 · 제작지시서 ---------- */
const REQ_TO={both:'공장+현장',factory:'공장',site:'현장'};
const REQ_QUICK=['서랍 소프트클로징','문 쪽 콘센트 자리 비우기','상부장 높이 낮게','손잡이 없는 디자인 선호','기존 장 철거·폐기','엘리베이터 사용 예약 필요','주차 공간 확인','반려동물 있음 · 문 닫고 작업','오전 작업 원함','바닥 보양 꼼꼼히'];
const hingeTxt=h=>({L:'좌',R:'우',D:'양개',N:'-'}[h]||'-');
function reqUI(){const R=job.reqs||[];
  return`<div class="panel" style="padding:14px;display:grid;gap:10px;background:var(--surface-2)"><div class="toolbar" style="margin:0"><div class="label" style="margin:0;flex:1">고객 요구사항 <span class="hint">· 적은 내용이 제작지시서·작업지시서·도면에 들어갑니다</span></div></div>
    ${R.map(r=>`<div style="display:grid;gap:6px;padding-bottom:8px;border-bottom:1px solid var(--line)"><span style="font-size:14px;font-weight:600">${esc(r.text)}</span><div class="toolbar" style="margin:0"><div class="seg">${Object.entries(REQ_TO).map(([k,l])=>`<button type="button" data-act="req-to" data-id="${r.id}" data-v="${k}" aria-pressed="${r.to===k}">${l}</button>`).join('')}</div><button type="button" class="btn sm quiet danger" data-act="req-del" data-id="${r.id}" aria-label="요구사항 삭제">삭제</button></div></div>`).join('')||'<p class="hint" style="margin:0">아직 없습니다.</p>'}
    <div class="toolbar" style="margin:0"><input class="input" style="flex:1 1 100%;min-width:0" id="reqText" placeholder="예: 서랍은 전부 소프트클로징, 냉장고 옆 휠라 넉넉히"><select class="input" style="width:auto" id="reqTo">${Object.entries(REQ_TO).map(([k,l])=>`<option value="${k}">${l}</option>`).join('')}</select><button type="button" class="btn primary" data-act="req-add">추가</button></div>
    <div class="chips">${REQ_QUICK.map(q=>`<button type="button" class="chip" style="min-height:34px" data-act="req-quick" data-v="${esc(q)}">${esc(q)}</button>`).join('')}</div>
    <div class="form-grid"><div class="field"><label for="dueMake">공장 출고 (납기)</label><input class="input" type="date" id="dueMake" data-change="due" data-k="dueMake" value="${esc(job.dueMake||'')}"></div><div class="field"><label for="dueInstall">설치 예정일</label><input class="input" type="date" id="dueInstall" data-change="due" data-k="dueInstall" value="${esc(job.dueInstall||'')}"></div></div></div>`}
const reqsFor=(j,who)=>(j.reqs||[]).filter(r=>r.to==='both'||r.to===who).map(r=>r.text);
function makeRows(j){const rows=[],door=doorById(j.doorId),hinged=door?.kind==='hinged';
  j.faces.forEach((fc,fi)=>{const g=geom(j,fi);g.rows.forEach(row=>{const zl=row.zone==='upper'?'상부':row.zone==='lower'?'하부':'';
    (row.corners||[]).forEach(m=>{if(m.tall){rows.push([`${g.face}-${m.end?'':'코너 '}키큰장`,`${TALL_K[m.tk]||'키큰장'}`,`${m.w}×${m.z1-m.z0}×${g.D}`,m.tk==='combo'?'서랍 · 오븐 · 전자레인지 · 오픈 선반':m.tk==='oven'?'서랍 2 · 오븐 · 선반 2':m.tk==='appl'?'서랍 2 · 가전 오픈 칸(슬라이드 선반 · 콘센트 2구) · 위 문':m.tk==='fridge'?'냉장고 칸 · 상부 선반':'선반 4','-','-','-','바닥~천장 일체']);return}if(m.ghost)return;if(m.corner)rows.push([`${g.island?'I':g.face}-${zl}코너`,TYPES[m.t].label,`${m.leg}×${m.leg}×${m.z1-m.z0}`,'선반 1','폴딩/사선','-','-','코너 가공 (재단표 참조)']);else if(m.blind)rows.push([`${g.face}-${zl}코너`,m.zt==='magic'?'매직코너 (안쪽)':'데드코너 막음',`${m.w}×${m.z1-m.z0}`,'-','-','-','-',`코너 휠라 ${m.cf} 포함`]);else if(m.filler)rows.push([`${g.face}-${zl}휠라`,m.cfill?'코너 휠라':'벽쪽 스페이서',`${m.w}×${m.z1-m.z0}`,'-','-','-','-','간섭 방지'])});
    row.mods.forEach((m,i)=>{const lay=layout(m),d=row.zone==='top'?g.topD:row.zone==='upper'?UPD():g.cat==='kitchen'?g.D:g.Dm,inner=[lay.shelves.length?`선반 ${lay.shelves.length}`:'',lay.drawers.length?`서랍 ${lay.drawers.length}`:'',lay.rods.length?`행거 ${lay.rods.length}`:''].filter(Boolean).join(' · ')||'-';
      const lv=hinged?leaves(g,door).filter(l=>l.mi===m.i&&l.zone===row.zone&&['door','drawer','panel'].includes(l.kind)):[],hn=[...new Set(lv.map(l=>leafHandle(j,l).name))].join(', ')||'-';
      const lt=(m.lights||[]).filter(t=>lightOpts(g.cat,row.zone,m).includes(t)).map(t=>LT[t].label).join(', ')||'-',ap=modApps(m).map(x=>x.a.name).join(', ');
      rows.push([`${g.island?'I':g.face}-${zl}${i+1}`,m.filler?'휠라':(m.unit&&unitById(m.unit)?.name)||TYPES[m.t].label,`${m.w}×${m.z1-m.z0}×${d}`,inner,m.filler?'-':hingeTxt(row.hinge?.[i]),hn,lt,[m.note?'요청: '+m.note:'',ap,m.glass?'유리 도어':'',(m.hw||[]).map(k=>HWS[k]?.l).filter(Boolean).join('·'),m.raise?`${m.raise} 올림`:''].filter(Boolean).join(' · ')||'-'])})})});
  return rows}
function makePage(j=job){const rows=makeRows(j),w=1400,fr=reqsFor(j,'factory'),d=doorById(j.doorId),gs=j.faces.map((f,i)=>geom(j,i)),lp=lightPlan(j),cl=clashIssues(j).filter(x=>x.lvl==='bad'||x.lvl==='warn');
  const extra=[...gs.flatMap(g=>(g.talls||[]).filter(t=>t.end).map(t=>`${FACE_NAME(g.face)} 끝 키큰장 ${TALL_K[t.k]} ${t.w} · 바닥~천장 일체`)),...(penOn(j)?[`반도형: B면 뒤쪽 벽 없음 · 뒷면 마감판 · 상판 뒤 오버행 ${j.pen.over||0}`]:[]),...(j.faces.some(f=>f.key==='I')?[`아일랜드 문 방향: ${j.island?.front==='room'?'거실 쪽 (오버행은 싱크대 쪽)':'싱크대 쪽 (오버행은 거실 쪽)'}`]:[]),...(lidOn(j)?['코너 리프트업 상판: A면 상판 코너 부분 분할 · 가스쇼바·경첩은 현장 장착']:[]),...(tallOn(j)?[`코너 키큰장(${TALL_K[j.corner.tallK||'oven']})이 A면 데드코너 바로 옆 · 하부·상부 사이 끊김 없이 일체`]:[]),...gs.flatMap(g=>rowAll(g.rows[0]||{mods:[]}).filter(m=>m.filler&&m.i==='F'&&!m.cfill&&!m.spacer).map(m=>`${FACE_NAME(g.face)} 끝 휠라 ${m.w}`)),...cl.map(x=>'간섭 확인: '+x.msg)];
  const foot=y=>{let s='',yy=y+40;const block=(title,list,color)=>{if(!list.length)return;s+=`<text x="40" y="${yy}" font-size="16" font-weight="700" fill="${color||'#111'}">${esc(title)}</text>`;yy+=24;list.forEach(t=>{s+=`<text x="52" y="${yy}" font-size="14" fill="#111">· ${esc(t.length>110?t.slice(0,109)+'…':t)}</text>`;yy+=22});yy+=14};
    block('고객 요구사항 (공장)',fr,'#C2410C');block('제작 특이사항',extra);
    s+=`<text x="40" y="${yy+10}" font-size="13" fill="#555">작성 ${catalog.company.name} · ${catalog.company.tel} · 부재 목록·제작 도면 함께 확인 · 확인자 ________ / 출고 확인 ________</text>`;return s};
  const h=Math.max(990,330+rows.length*26+(fr.length+extra.length)*22+160);
  return{w,h,svg:tablePage({w,h,title:`제작지시서 · ${CATS[j.cat].name} ${LAYOUTS[j.layout]}`,meta:[`No. ${j.docNo} · 고객 ${j.customer.name||'-'} · 현장 ${j.customer.addr||'-'} · 실측 ${j.customer.date||'-'}`,`공장 출고 ${j.dueMake||'____-__-__'} · 설치 예정 ${j.dueInstall||'____-__-__'} · ${facesSpec(j)} · H ${j.dims.H}`,
      `도어 ${d?.name||'-'}${d?.kind==='hinged'?` · 손잡이 ${handleSummary(j)}`:''}${j.cat==='kitchen'?` · 상판 ${counterById(j.counterId)?.name||'-'}`:''}`,`마감 ${gs.filter(g=>!g.island).map(g=>FACE_NAME(g.face)+' '+finishText(g)).join(' / ')} · 걸레받이 ${gs[0]?.pl||0}${isCornerLay(j)?` · 코너 하부 ${CORNER_T[cKind(j,'lower')]}${lidOn(j)?' + 리프트업 상판':''}`:''}`,lp.runs.length?`조명 ${Object.keys(lp.byT).map(t=>LT[t].label).join('·')} · ${CCT[lp.cct][0]} · ${CTRL[lp.ctrl]} · ${lp.W}W · SMPS ${lp.psu.map(x=>x+'W').join('+')}`:'조명 없음'],
    headers:['칸','종류','W×H×D','내부','경첩','손잡이','조명','가전·비고'],cols:[100,170,150,140,60,180,150,370],aligns:['l','l','l','l','l','l','l','l'],rows,foot})}}

Object.assign(ACT,{
  'cut-dx':b=>{const m=cf().rows[job.sel.row].mods[job.sel.i];m.cutDx=(+m.cutDx||0)+(+b.dataset.d);cf().edited=true;render()},
  'cut-faucet':b=>{const m=cf().rows[job.sel.row].mods[job.sel.i];m.faucet=b.dataset.v;cf().edited=true;render()},
  'cut-reset':()=>{const m=cf().rows[job.sel.row].mods[job.sel.i];delete m.cutDx;delete m.cutFront;cf().edited=true;render()},
  'trk-add':()=>{trucks().push({id:'tk'+uid(),name:'새 차량',t30:70000,t50:90000,t70:110000,over:130000,perKm:2000,maxLen:6000});saveCatalog();openManager();render()},
  'trk-del':b=>{if(trucks().length<2){toast('차량은 하나 이상 있어야 합니다');return}const id=trucks()[+b.dataset.i].id;catalog.trucks.splice(+b.dataset.i,1);if(job.truck===id)delete job.truck;saveCatalog();openManager();render()},
  's3tab':b=>{s3tab=b.dataset.v;renderStage()},
  'sync-open':()=>{syCount().then(openSyncSettings)},
  'sy-save':()=>{SY.url=$('#sy-url').value.trim();SY.key=$('#sy-key').value.trim();SY.wifi=$('#sy-wifi').checked;SY.pdf=$('#sy-pdf').checked;sySave();toast('저장했습니다');syKick(1500);openSyncSettings()},
  'sy-test':async()=>{SY.url=$('#sy-url').value.trim();SY.key=$('#sy-key').value.trim();sySave();if(!SY.url){toast('주소를 넣어 주세요');return}try{await syPost({action:'ping'});toast('연결 성공 · 드라이브에 ‘실측스튜디오’ 폴더가 준비됐습니다')}catch(e){toast('연결 실패: '+(e.message||e))}},
  'sy-now':()=>syncNow(true),
  'menu-open':()=>{$('#layer').innerHTML=`<div class="overlay" data-act="sheet-back"><div class="sheet menu-sheet"><h3>메뉴</h3>${mode==='measure'?`<button type="button" class="btn" data-act="jobs-open">현장 목록 (${LOCAL?'이 태블릿':'서버'})</button>`:''}<button type="button" class="btn" data-act="manage-open">제품·단가 관리</button>${mode==='measure'?'<button type="button" class="btn" data-act="send-tablet">📲 이 현장 태블릿으로 보내기</button>':''}${APP?`<button type="button" class="btn" data-act="sync-open">☁️ 드라이브 자동 업로드${syPending?` (${syPending})`:''}</button>`:''}${mode==='measure'?'<button type="button" class="btn danger" data-act="new-job">새 현장 시작 (한 번 더 누르면 비움)</button>':''}<button type="button" class="btn quiet" data-act="mgr-close">닫기</button></div></div>`},
  'draw-tab':b=>{drawTab=b.dataset.v;renderStage()},
  'req-quick':b=>{const i=$('#reqText');if(i){i.value=b.dataset.v;i.focus()}},
  'req-add':()=>{const t=($('#reqText')?.value||'').trim();if(!t){toast('요구사항을 적어 주세요');return}job.reqs=job.reqs||[];job.reqs.push({id:uid(),text:t,to:$('#reqTo')?.value||'both'});render();toast('지시서에 넣었습니다')},
  'req-del':b=>{job.reqs=(job.reqs||[]).filter(r=>r.id!==b.dataset.id);render()},
  'req-to':b=>{const r=(job.reqs||[]).find(x=>x.id===b.dataset.id);if(r){r.to=b.dataset.v;render()}},
  'ex-make-pdf':()=>{const p=makePage();savePDF(fname('제작지시서.pdf'),[{...p,mm:.3}])},'ex-make-png':()=>{const p=makePage();savePNG(fname('제작지시서.png'),p.svg,p.w,p.h,2)}});
document.addEventListener('change',e=>{const t=e.target,c=t.dataset.change;if(c==='due'){job[t.dataset.k]=t.value;render()}if(c==='truck'){if(t.value)job.truck=t.value;else delete job.truck;render()}if(c==='truckN'){job.truckN=+t.value||1;render()}if(c==='trk'){const tr=trucks()[+t.dataset.i];if(tr){tr[t.dataset.k]=t.dataset.k==='name'?(t.value.trim()||tr.name):Math.max(0,Math.round(+t.value)||0);saveCatalog();render()}}if(c==='cut'){const m=cf().rows[job.sel.row]?.mods[job.sel.i];if(m){const v=Math.round(+t.value);if(!isNaN(v)){if(t.dataset.k==='cutFront')m.cutFront=clamp(v,20,400);else m.cutDx=clamp(v,-1000,1000);cf().edited=true}render()}}if(c==='mod-note'){const m=cf().rows[job.sel.row]?.mods[job.sel.i];if(m){if(t.value.trim())m.note=t.value.trim();else delete m.note;render()}}});

