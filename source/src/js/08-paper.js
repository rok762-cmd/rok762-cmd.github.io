/* ---------- paper drawing ---------- */
const PAPER_CSS=`.box{fill:#fff;stroke:#111;stroke-width:1.5;vector-effect:non-scaling-stroke}.ln{fill:none;stroke:#111;stroke-width:1.1;vector-effect:non-scaling-stroke}
.thin{fill:none;stroke:#555;stroke-width:.7;vector-effect:non-scaling-stroke}.dash,.hinge{fill:none;stroke:#666;stroke-width:.7;stroke-dasharray:6 4;vector-effect:non-scaling-stroke}
.rod{fill:none;stroke:#444;stroke-width:1;stroke-dasharray:10 4 2 4;vector-effect:non-scaling-stroke}.dr{fill:none;stroke:#444;stroke-width:.8;vector-effect:non-scaling-stroke}
.sh{fill:#E6E6E6;stroke:#444;stroke-width:.6;vector-effect:non-scaling-stroke}.gnd{stroke:#111;stroke-width:2;vector-effect:non-scaling-stroke}.t{fill:#444}
.dim line{stroke:#1E56D0;stroke-width:.7;vector-effect:non-scaling-stroke}.dim text{fill:#1E56D0;font-family:IBM Plex Mono,Menlo,monospace}
.hd{fill:#111;font-weight:700}.lb{fill:#666}.vl{fill:#111;font-weight:600}.fr{fill:none;stroke:#111;stroke-width:1}.fr2{fill:none;stroke:#BBB;stroke-width:.7}.sel{fill:#DCE6FB;stroke:#1E56D0;stroke-width:1.6;vector-effect:non-scaling-stroke}`;
function placeView(area,title,extW,extH,draw){const s=Math.min((area.w-140)/extW,(area.h-130)/extH),k=1/s;
  const ox=area.x+80+((area.w-140)-extW*s)/2+ (extW*s*0.04),oy=area.y+area.h-38;
  const sc=Math.max(5,Math.round(1/(s*.3)*(typeof paperSel!=='undefined'&&paperSel==='A4'?420/297:1)*1.04/5)*5),pp=typeof paperSel!=='undefined'?paperSel:'A3';
  return`<text x="${area.x}" y="${area.y+16}" font-size="15" class="hd">${esc(title)}</text><text x="${area.x+area.w}" y="${area.y+16}" font-size="12" class="lb" text-anchor="end">축척 약 1:${sc} (${pp})</text>`+
    `<g transform="translate(${f(ox)},${f(oy)}) scale(${s.toFixed(5)})">${draw(k)}</g>`}
function drawingSVG(j=job,fi=j.fi){const g=gview(j,fi),fc_=j.faces[fi]||j.faces[0],d=doorById(j.doorId)||{name:'-',kind:'none'},W=1400,H=990;
  let s=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}"><style>${PAPER_CSS}</style><rect width="${W}" height="${H}" fill="#fff"/>`;
  s+=`<rect x="16" y="16" width="${W-32}" height="${H-32}" class="fr" stroke-width="2"/><text x="36" y="50" font-size="22" class="hd">제작 도면 · ${esc(CATS[g.cat].name)} · ${LAYOUTS[j.layout]}${j.faces.length>1?' · '+FACE_NAME(g.face):''}</text>`;
  s+=`<text x="${W-36}" y="50" font-size="13" class="lb" text-anchor="end">No. ${esc(j.docNo)} · 실측일 ${esc(j.customer.date)} · 단위 mm</text><line x1="16" y1="64" x2="${W-16}" y2="64" class="fr"/>`;
  const ext=k=>{let t=techExterior(g,d,k)+obsTech(g,k,j);const ch_=!isMD(g.cat)&&!g.island?42*k:0,its=r=>[...(r.corners||[]).filter(c=>!c.ghost&&c.w>=30),...r.mods.filter(m=>m.w>=30)].sort((a,b)=>a.x-b.x);
    if(ch_){const top=g.rows[g.rows.length-1];its(top).forEach(m=>t+=dimH(m.x,m.x+m.w,g.H+42*k,`${Math.round(m.w)}`,k,top.z1));if(g.rows.length>1){const lo=g.rows[0];its(lo).forEach(m=>t+=dimH(m.x,m.x+m.w,-48*k,`${Math.round(m.w)}`,k,0))}}
    if(g.sL)t+=dimH(-g.sL,0,g.H+42*k+ch_,`${g.ep?.L?'EP ':''}${g.sL}`,k,g.H);t+=dimH(0,g.Wm,g.H+42*k+ch_,`${g.Wm}`,k,g.H);if(g.sR)t+=dimH(g.Wm,g.Wm+g.sR,g.H+42*k+ch_,`${g.ep?.R?'EP ':''}${g.sR}`,k,g.H);if(!g.island&&!isMD(g.cat))t+=dimH(-g.sL,g.Wm+g.sR,g.H+84*k+ch_,`실측 ${g.W}`,k);g.rows.filter(r=>r.zone==='upper').forEach(r=>r.mods.filter(m=>m.raise>0).forEach(m=>{t+=dimV(CTH,m.z0,m.x+m.w/2,`${m.z0-CTH}`,k)+TX(m.x+m.w/2,m.z0-18*k,`${m.raise} 올림`,8*k,'fill="#B4520F" text-anchor="middle"')}));if(g.tbl){t+=dimH(g.tbl.x0,g.tbl.x0+g.tbl.w,g.tbl.top+40*k,`${g.tbl.w}`,k,g.tbl.top);t+=dimV(0,g.tbl.top,g.tbl.x0+g.tbl.w+30*k,`${g.tbl.top}`,k,g.tbl.x0+g.tbl.w)}
    let x=g.Wm+40*k;heightChain(g).forEach(([a,b])=>{if(b-a>0)t+=dimV(a,b,x,`${b-a}`,k,g.Wm)});t+=dimV(0,g.H,g.Wm+82*k,g.island?`높이 ${g.H}`:`실측 ${g.H}`,k);return t};
  const intr=k=>{let t=techInterior(g,k)+obsTech(g,k,j);if(isMD(g.cat)){midPanels(g).forEach(p=>t+=dimH(p.x,p.x+p.w,g.Hm+36*k,`${Math.round(p.w)}`,k,g.Hm));t+=dimH(0,g.Wm,g.Hm+78*k,`${g.Wm}`,k);return t}
    const top=g.rows[g.rows.length-1];top.mods.forEach(m=>t+=dimH(m.x,m.x+m.w,g.H+36*k,`${m.w}`,k,top.z1));t+=dimH(0,g.Wm,g.H+78*k,`${g.Wm}`,k);
    if(g.rows.length>1){const lo=g.rows[0];lo.mods.forEach(m=>t+=dimH(m.x,m.x+m.w,-48*k,`${m.w}`,k,0))}return t};
  s+=placeView({x:36,y:78,w:650,h:600},'정면도 · 도어 외관',(g.Wm+g.ext)*1.22,g.H*1.16+(isMD(g.cat)||g.island?0:140),ext);
  s+=placeView({x:714,y:78,w:650,h:600},isMD(g.cat)?'문짝 구성도':'내부 구성도 · 도어 제거',(g.Wm+g.ext)*1.12,g.H*1.16+(g.rows.length>1?100:0),intr);
  s+=`<line x1="16" y1="694" x2="${W-16}" y2="694" class="fr"/>`;
  s+=`<text x="36" y="720" font-size="15" class="hd">평면도 · ${LAYOUTS[j.layout]}</text>`+planPlace(j,{x:36,y:726,w:560,h:240},g.face);
  const notes=[...reqsFor(j,'factory').map(t=>'요청: '+t),j.customer.memo,...j.photos.flatMap(p=>p.marks).filter(m=>m.type==='note').map(m=>m.text),g.cut?`${FACE_NAME(g.face)}: 실측 ${g.len} − 코너 ${g.cut} = ${g.W}`:'',g.island?`아일랜드 장 깊이 ${g.Dm} · 상판 ${g.Wm+2*g.side}×${g.D} (뒤 오버행 ${j.island.over}${g.side?` · 좌우 ${g.side}`:''})`:finishText(g),g.pl?`걸레받이 ${g.pl}mm · 측판 ${T}T`:`판재 ${T}T`,
    j.layout==='II'?`통로 폭 ${(+j.span)-2*(+j.dims.D)}mm`:'',j.layout.includes('island')?`벽면 장~아일랜드 통로 ${j.island.gap}mm`:'',
    d.kind==='hinged'?`손잡이: ${handleSummary(j)}`:'',(()=>{const lp=lightPlan(j);return lp.runs.length?`조명: ${Object.keys(lp.byT).map(t=>LT[t].label).join('·')} · ${CCT[lp.cct][0]} · ${CTRL[lp.ctrl]} · ${lp.W}W`:''})(),(()=>{const c=clashIssues(j),b=c.filter(x=>x.lvl==='bad').length;return b?`문·서랍 간섭 미해결 ${b}건 — 확인 필요`:`문·서랍 간섭 검사 통과${isCornerLay(j)&&['blind','magic'].includes(cType(j,j.cat==='kitchen'?'lower':'full'))?` · 코너 휠라 ${cFill(j)}`:''}`})(),g.cat==='kitchen'?`상판: ${(g.island?islandCounter(j):counterById(j.counterId))?.name||'-'}`:'',g.tbl?`식탁 ${g.tbl.len}×${g.tbl.depth} · ${g.tbl.dir==='perp'?'ㄱ자 꺾임':'일자 연장'} · 높이 ${g.tbl.top} · 받침 ${g.tbl.sup?.name||'미정'}`:'',g.island?`오버행 받침: ${g.isup?.name||'없음'}`:'' ,...obstacleIssues(j).filter(x=>x.o.face===g.face&&!x.ok).map(x=>`${OBS[x.o.type].label} 걸림 → ${x.hits.map(h=>h.tag).join(', ')}`),j.preDemo?'철거 전 실측 · 철거 후 치수·설비 재확인 필요':'','치수 단위 mm · 현장 최종 확인 후 재단'].filter(Boolean);
  s+=`<line x1="606" y1="694" x2="606" y2="${H-16}" class="fr"/><text x="622" y="${720}" font-size="15" class="hd">특이사항</text>`;
  notes.slice(0,9).forEach((t,i)=>s+=`<text x="622" y="${744+i*22}" font-size="13" class="vl">· ${esc(t.length>34?t.slice(0,33)+'…':t)}</text>`);
  const tb=[['현장',j.customer.addr||'-'],['고객',j.customer.name||'-'],['품목',CATS[g.cat].name],['형태·면',`${LAYOUTS[j.layout]} · ${FACE_NAME(g.face)}`],['플랜',(planById(fc_.planId)?.name||'-')+(fc_.edited?' (수정)':'')],['도어·마감',d.name],
    ['실측 길이×H×D',`${g.len} × ${g.H} × ${g.D}`],['제작 W×H×D',`${g.Wm} × ${g.Hm} × ${g.Dm}`],['작성',`${catalog.company.name} · ${catalog.company.tel}`]];
  const bx=980;s+=`<line x1="${bx-10}" y1="694" x2="${bx-10}" y2="${H-16}" class="fr"/>`;
  tb.forEach(([a,b],i)=>{const y=706+i*28;s+=`<line x1="${bx-10}" y1="${y+20}" x2="${W-16}" y2="${y+20}" class="fr2"/><text x="${bx}" y="${y+12}" font-size="12" class="lb">${esc(a)}</text><text x="${bx+92}" y="${y+12}" font-size="13" class="vl">${esc(String(b).length>28?String(b).slice(0,27)+'…':b)}</text>`});
  return s+'</svg>'}
function planGeo(j){const D=kD(j)+bgOf(j),fs=j.faces,get=k=>fs.find(f=>f.key===k),L=+get('A').len,lay=j.layout;
  const rects=[{key:'A',x:0,y:0,w:L,h:D}],walls=[],dims=[{v:0,a:0,b:L,pos:0,side:-1,label:`A ${L}`}];let w=L,hh=D;
  if(lay==='I')walls.push([[-250,0],[L+250,0]]);
  if(lay==='niche'){walls.push([[-300,D],[0,D],[0,0],[L,0],[L,D],[L+300,D]]);dims.push({v:1,a:0,b:D,pos:L,side:1,label:`깊이 ${D}`})}
  const polys=[];if(isCornerLay(j)&&!isMD(j.cat)){const t=cType(j,j.cat==='kitchen'?'lower':'full'),lg=cLeg(j,'lower');if(t==='diag'||t==='lshape'){const A0=rects[0];const mk=(sx)=>{const P_=(x,y)=>[sx<0?L-x:x,y];return(t==='diag'?[[0,0],[lg,0],[lg,D],[D,lg],[0,lg]]:[[0,0],[lg,0],[lg,D],[D,D],[D,lg],[0,lg]]).map(([x,y])=>P_(x,y))};
    polys.push(mk(1));A0.x=lg;A0.w=L-lg;if(lay==='U'){polys.push(mk(-1));A0.w=L-2*lg}}}
  let blind=null;if(isCornerLay(j)&&!isMD(j.cat)){const t=cType(j,j.cat==='kitchen'?'lower':'full');if(t==='blind'||t==='magic'){const cf=cFill(j);blind={cf,D,t,U:lay==='U',L};}}
  if(lay==='L'||lay==='L1'||lay==='U'||lay==='Lisland'){const B=+get('B').len,cs=polys.length?cLeg(j,'lower'):D;rects.push({key:'B',x:0,y:cs,w:D,h:B-cs});dims.push({v:1,a:0,b:B,pos:0,side:-1,label:`B ${B}`});hh=Math.max(hh,B);
    if(lay==='U'){const C=+get('C').len;rects.push({key:'C',x:L-D,y:cs,w:D,h:C-cs});dims.push({v:1,a:0,b:C,pos:L,side:1,label:`C ${C}`});hh=Math.max(hh,C);walls.push([[0,B+250],[0,0],[L,0],[L,C+250]])}
    else if(lay==='L1'){const C=+get('C').len,cd=Math.max(300,+(j.dims.D)||600);rects.push({key:'C',x:L-cd,y:D,w:cd,h:Math.max(0,C-D),tw:1});dims.push({v:1,a:0,b:C,pos:L,side:1,label:`C ${C}`});hh=Math.max(hh,C);walls.push([[0,B+250],[0,0],[L,0],[L,C+250]])}
    else walls.push(j.pen?.on&&j.cat==='kitchen'?[[-300,0],[L+250,0]]:[[0,B+250],[0,0],[L+250,0]])}
  if(lay==='I1'){const C=+get('C').len,cd=Math.max(300,+(j.dims.D)||600),cx=j.twL?0:L-cd;rects.push({key:'C',x:cx,y:D,w:cd,h:Math.max(0,C-D),tw:1});dims.push({v:1,a:0,b:C,pos:j.twL?0:L,side:j.twL?-1:1,label:`C ${C}`});hh=Math.max(hh,C);walls.splice(0,walls.length,j.twL?[[0,C+250],[0,0],[L+250,0]]:[[-250,0],[L,0],[L,C+250]])}
  if(lay==='II'){const B=+get('B').len,S=+j.span;w=Math.max(L,B);hh=S;rects.push({key:'B',x:0,y:S-D,w:B,h:D,flip:1});walls.push([[-250,0],[w+250,0]],[[-250,S],[w+250,S]]);
    dims.push({v:0,a:0,b:B,pos:S,side:1,label:`B ${B}`},{v:1,a:0,b:S,pos:w,side:1,label:`벽 사이 ${S}`},{v:1,a:D,b:S-D,pos:w/2,side:0,label:`통로 ${S-2*D}`})}
  if(lay==='island'||lay==='Lisland'){const I=get('I'),iw=+I.len,id=(+j.island.cab||600)+(+j.island.over||0),gap=+j.island.gap,x=lay==='Lisland'?D+Math.max(gap,(L-D-iw)/2):(L-iw)/2,y=D+gap;if(lay==='island')walls.push([[-250,0],[L+250,0]]);
    rects.push({key:'I',x,y,w:iw,h:id});hh=Math.max(hh,y+id);if(lay==='Lisland')dims.push({v:0,a:D,b:x,pos:y+id*.5,side:0,label:`통로 ${Math.round(x-D)}`});dims.push({v:1,a:D,b:y,pos:x+iw*.25,side:0,label:`통로 ${gap}`},{v:0,a:x,b:x+iw,pos:y+id,side:1,label:`아일랜드 ${iw}`},{v:1,a:y,b:y+id,pos:x+iw,side:1,label:`${id}`});w=Math.max(L,x+iw)}
  const tb=j.table;if(j.cat==='kitchen'&&tb?.on){const r=rects.find(x=>x.key===tb.face);if(r){const vert=r.h>r.w&&r.key!=='A'&&r.key!=='I'&&!r.flip,len=+tb.len,dp=+tb.depth,perp=tb.dir==='perp';let t;
    if(!vert)t=perp?{x:r.x+r.w-dp,y:r.y+r.h,w:dp,h:len}:{x:r.x+r.w,y:r.key==='I'?r.y+(r.h-dp)/2:r.y,w:len,h:dp};else t=perp?{x:r.x+r.w,y:r.y+r.h-dp,w:len,h:dp}:{x:r.x,y:r.y+r.h,w:dp,h:len};
    rects.push({key:'T',...t,table:1});dims.push(t.w>=t.h?{v:0,a:t.x,b:t.x+t.w,pos:t.y+t.h,side:1,label:`식탁 ${len}`}:{v:1,a:t.y,b:t.y+t.h,pos:t.x+t.w,side:1,label:`식탁 ${len}`});w=Math.max(w,t.x+t.w);hh=Math.max(hh,t.y+t.h)}}
  return{rects,walls,dims,w,h:hh,D,polys,blind}}
function planInner(j,k,active,ui){const pg=planGeo(j);let s='';
  pg.walls.forEach(pts=>s+=`<polyline class="gnd" fill="none" points="${pts.map(p=>p.map(f).join(',')).join(' ')}"/>`);
  (pg.polys||[]).forEach(pts=>s+=`<polygon class="box" points="${pts.map(p=>p.map(f).join(',')).join(' ')}"/><text class="t" x="${f(pts.reduce((a,p)=>a+p[0],0)/pts.length)}" y="${f(pts.reduce((a,p)=>a+p[1],0)/pts.length+4*k)}" font-size="${f(10*k)}" text-anchor="middle">코너</text>`);
  pg.rects.forEach(r=>{if(r.table){s+=`<rect x="${f(r.x)}" y="${f(r.y)}" width="${f(r.w)}" height="${f(r.h)}" class="box" stroke-dasharray="10 6"/><text class="t" x="${f(r.x+r.w/2)}" y="${f(r.y+r.h/2+5*k)}" font-size="${f(Math.min(13*k,Math.min(r.w,r.h)*.4))}" text-anchor="middle">식탁</text>`;return}const fi=j.faces.findIndex(f=>f.key===r.key),g=geom(j,fi),vert=r.h>r.w&&r.key!=='A'&&r.key!=='I'&&!r.flip;
    s+=r.tw?`<rect x="${f(r.x)}" y="${f(r.y)}" width="${f(r.w)}" height="${f(r.h)}" fill="transparent" stroke="${r.key===active?'#2F6BFF':'#9AA6B8'}" stroke-dasharray="8 6" vector-effect="non-scaling-stroke" ${ui?`data-act="face" data-i="${fi}" style="cursor:pointer"`:''}/>`+(g.rows[0]?.mods||[]).map(m=>{const y0=r.y+obsOffset(g)+m.x-r.y+(r.y-r.y);const yy=obsOffset(g)+m.x;if(isGap(m))return`<text class="t" x="${f(r.x+r.w/2)}" y="${f(yy+m.w/2)}" font-size="${f(Math.min(11*k,m.w/4))}" text-anchor="middle">${GAP_K[m.gk||'door']}</text>`;return`<rect x="${f(r.x)}" y="${f(yy)}" width="${f(r.w)}" height="${f(m.w)}" class="${r.key===active?'sel':'box'}"/>`}).join(''):`<rect x="${f(r.x)}" y="${f(r.y)}" width="${f(r.w)}" height="${f(r.h)}" class="${r.key===active?'sel':'box'}" ${ui?`data-act="face" data-i="${fi}" style="cursor:pointer"`:''}/>`;
    const row=g.rows[0];if(row)rowAll(row).forEach(m=>{const wx=r.key==='I'?r.x+m.x:obsOffset(g)+m.x;if(vert){if(wx<=r.y+1||wx>=r.y+r.h-1)return;s+=`<line class="thin" x1="${f(r.x)}" y1="${f(wx)}" x2="${f(r.x+r.w)}" y2="${f(wx)}"/>`}else{const xx=r.flip||r.key==='I'?wx:wx;if(xx<=r.x+1||xx>=r.x+r.w-1)return;s+=`<line class="thin" x1="${f(xx)}" y1="${f(r.y)}" x2="${f(xx)}" y2="${f(r.y+r.h)}"/>`}});
    if(g.rows.some(rw=>rw.zone==='top')){const u=g.topD;s+=vert?`<rect class="dash" x="${f(r.key==='C'?r.x+r.w-u:r.x)}" y="${f(r.y)}" width="${u}" height="${f(r.h)}"/>`:`<rect class="dash" x="${f(r.x)}" y="${f(r.flip?r.y+r.h-u:r.y)}" width="${f(r.w)}" height="${u}"/>`}
    if(g.rows.some(rw=>rw.zone==='upper')){const u=UPD();s+=vert?`<rect class="dash" x="${f(r.key==='C'?r.x+r.w-u:r.x)}" y="${f(r.y)}" width="${u}" height="${f(r.h)}"/>`:`<rect class="dash" x="${f(r.x)}" y="${f(r.flip?r.y+r.h-u:r.y)}" width="${f(r.w)}" height="${u}"/>`}
    const fs=Math.min(15*k,Math.min(r.w,r.h)*.55);s+=`<text class="t" x="${f(r.x+r.w/2)}" y="${f(r.y+r.h/2+fs*.35)}" font-size="${f(fs)}" font-weight="700" text-anchor="middle" style="pointer-events:none">${r.key==='I'?'I':r.key}</text>`});
  if(pg.blind){const b=pg.blind,hp=`<pattern id="hatchP" patternUnits="userSpaceOnUse" width="${f(40*k)}" height="${f(40*k)}" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="${f(40*k)}" stroke="#8a8a8a" stroke-width="${f(1.4*k)}"/></pattern>`;
    const zone=(x0)=>{const dx=x0===0?0:b.L-b.D;return`<rect x="${f(dx)}" y="0" width="${b.D}" height="${b.D}" fill="url(#hatchP)" opacity=".8"/><text class="t" x="${f(dx+b.D/2)}" y="${f(b.D/2)}" font-size="${f(11*k)}" text-anchor="middle" style="paint-order:stroke;stroke:#fff;stroke-width:${f(4*k)}">${b.t==='magic'?'매직코너':'데드코너'}</text><text class="t" x="${f(dx+b.D/2)}" y="${f(b.D/2+14*k)}" font-size="${f(9*k)}" text-anchor="middle" style="paint-order:stroke;stroke:#fff;stroke-width:${f(4*k)}">${b.t==='magic'?'(철물로 꺼내 씀)':'(B장에 가려 안 쓰는 공간)'}</text>`};
    s+=hp+zone(0)+(b.U?zone(1):'');
    const fl=(x,y,w,h,lab)=>`<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="#E8590C" fill-opacity=".25" stroke="#E8590C" stroke-width="${f(1.5*k)}"/>`;
    const gA_=geom(j,Math.max(0,j.faces.findIndex(q=>q.key==='A'))),bi_=j.faces.findIndex(q=>q.key==='B'),gB_=bi_>=0?geom(j,bi_):null,cfA=(gA_.rows.find(r=>r.zone==='lower')?.corners||[]).find(c=>c.blind&&c.side==='L')?.cf??b.cf,cfB=(gB_?.rows.find(r=>r.zone==='lower')?.corners||[]).find(c=>c.cfill)?.w??b.cf;
    s+=fl(b.D,0,cfA,b.D)+fl(0,b.D,b.D,cfB)+(b.U?fl(b.L-b.D-b.cf,0,b.cf,b.D)+fl(b.L-b.D,b.D,b.D,b.cf):'');
    s+=`<text class="t" x="${f(b.D+cfA+6*k)}" y="${f(b.D+cfB+70*k)}" font-size="${f(10*k)}" fill="#C2410C">주황 = 코너 휠라${cfA===cfB?` ${cfA}`:` A ${cfA} · B ${cfB}`} · B장은 벽에서 ${b.D}+${cfB}=${b.D+cfB} 지점부터${gA_.shelfCF&&gA_.bg&&gA_.bgUse==='shelf'?` (뒷선반)`:''}</text>`}
  if(j.faces.some(f=>f.key==='I')){const r=pg.rects.find(x=>x.key==='I'),sp=supportById(j.island.support),cab=+j.island.cab||600,sd=+j.island.side||0;if(r){
    s+=`<line class="dash" x1="${f(r.x)}" y1="${f(r.y+cab)}" x2="${f(r.x+r.w)}" y2="${f(r.y+cab)}"/>`;if(sd)s+=`<rect class="dash" x="${f(r.x-sd)}" y="${f(r.y)}" width="${f(r.w+2*sd)}" height="${f(r.h)}"/>`;
    if(sp?.type==='leg'){const n=2+Math.max(0,Math.ceil((r.w+2*sd)/1500)-1);for(let i=0;i<n;i++){const x=r.x-sd+30+(r.w+2*sd-120)*i/(n-1);s+=`<rect x="${f(x)}" y="${f(r.y+r.h-90)}" width="60" height="60" fill="#2F3133"/>`}}
    if(sp?.type==='cabinet')s+=`<rect x="${f(r.x)}" y="${f(r.y+cab)}" width="${f(r.w)}" height="${f(r.h-cab)}" fill="#1E56D0" fill-opacity=".12" stroke="#1E56D0" stroke-dasharray="6 4" vector-effect="non-scaling-stroke"/>`;
    if(sp?.type==='panel')s+=`<rect x="${f(r.x-sd)}" y="${f(r.y)}" width="40" height="${f(r.h)}" fill="#555"/><rect x="${f(r.x+r.w+sd-40)}" y="${f(r.y)}" width="40" height="${f(r.h)}" fill="#555"/>`}}
  pg.dims.forEach(d=>{const off=d.side*36*k;if(d.v){const x=d.pos+off;s+=dimV(-d.a,-d.b,x,d.label,k,d.side?d.pos:null)}else{const y=d.pos+off;s+=dimH(d.a,d.b,-y,d.label,k,d.side?-d.pos:null)}});
  s+=workTriSVG(j,k);return{s,pg}}
function planBox(j){const pg=planGeo(j),m=Math.max(pg.w,pg.h)*.16+200;return{x:-m,y:-m,w:pg.w+2*m,h:pg.h+2*m}}
function planPlace(j,area,active){const b=planBox(j),sc=Math.min(area.w/b.w,area.h/b.h),k=1/sc,ox=area.x+(area.w-b.w*sc)/2-b.x*sc,oy=area.y+(area.h-b.h*sc)/2-b.y*sc;
  return`<g transform="translate(${f(ox)},${f(oy)}) scale(${sc.toFixed(5)})">${planInner(j,k,active,false).s}</g>`}
function planUI(j){const b=planBox(j),k=b.w/560;return`<svg class="tech" viewBox="${f(b.x)} ${f(b.y)} ${f(b.w)} ${f(b.h)}" font-family="${FONT}" role="img" aria-label="${LAYOUTS[j.layout]} 평면도">${planInner(j,k,j.faces[j.fi]?.key,true).s}</svg>`}
function fitText(v,px){let w=0,o='';for(const ch of v){const cw=/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af\u4e00-\u9fff]/.test(ch)?13:7.6;if(w+cw>px-8)return o+'…';w+=cw;o+=ch}return o}
function tablePage({w,h,title,meta,headers,cols,aligns,rows,foot}){let s=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="${FONT}"><rect width="${w}" height="${h}" fill="#fff"/>`;
  s+=`<text x="40" y="58" font-size="24" font-weight="700" fill="#111">${esc(title)}</text>`;
  meta.forEach((m,i)=>s+=`<text x="40" y="${86+i*20}" font-size="13" fill="#555">${esc(m)}</text>`);
  let y=96+meta.length*20;const rh=26;s+=`<rect x="40" y="${y}" width="${w-80}" height="${rh}" fill="#F0F2F3"/>`;
  let cx=40;headers.forEach((t,i)=>{const al=aligns[i]==='r';s+=`<text x="${al?cx+cols[i]-8:cx+8}" y="${y+17}" font-size="12" fill="#555" ${al?'text-anchor="end"':''}>${esc(t)}</text>`;cx+=cols[i]});y+=rh;
  rows.forEach(r=>{cx=40;r.forEach((t,i)=>{const al=aligns[i]==='r',v=String(t??'');s+=`<text x="${al?cx+cols[i]-8:cx+8}" y="${y+17}" font-size="13" fill="#111" ${al?'text-anchor="end" font-family="IBM Plex Mono, Menlo, monospace"':''}>${esc(fitText(v,cols[i]-8))}</text>`;cx+=cols[i]});
    s+=`<line x1="40" y1="${y+rh}" x2="${w-40}" y2="${y+rh}" stroke="#E2E5E6"/>`;y+=rh});
  return s+(foot?foot(y):'')+'</svg>'}
function tileSVG(j=job){const W=1400,H=990,tas=tileAreas(j);let s=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}"><style>${PAPER_CSS}</style><rect width="${W}" height="${H}" fill="#fff"/><rect x="16" y="16" width="${W-32}" height="${H-32}" class="fr" stroke-width="2"/>`;
  s+=`<text x="36" y="50" font-size="22" class="hd">타일 작업 도면 · 주방 벽</text><text x="${W-36}" y="50" font-size="13" class="lb" text-anchor="end">No. ${esc(j.docNo)} · ${esc(j.customer.name||'')} · 단위 mm</text><line x1="16" y1="64" x2="${W-16}" y2="64" class="fr"/>`;
  if(!tas.length)return s+`<text x="36" y="120" font-size="15" class="lb">타일 작업이 없습니다. 도어·마감 단계에서 벽 타일을 켜세요.</text></svg>`;
  const n=tas.length,aw=(W-72-(n-1)*20)/n;
  tas.forEach((ta,i)=>{const g=ta.g,area={x:36+i*(aw+20),y:80,w:aw,h:640},ex=ta.x1*1.15,eh=g.H*1.12,sc=Math.min((area.w-90)/ex,(area.h-110)/eh),k=1/sc,ox=area.x+60,oy=area.y+area.h-40,id='tc'+i;
    let d=`<defs><clipPath id="${id}"><rect x="${ta.x0}" y="${-ta.z1}" width="${ta.x1-ta.x0}" height="${ta.z1-ta.z0}"/>${ta.extra.map(e=>`<rect x="${f(e.x)}" y="${f(-e.z1)}" width="${f(e.w)}" height="${f(e.z1-e.z0)}"/>`).join('')}</clipPath></defs>`;
    d+=Rc(0,0,ta.x1,g.H,'thin');const off=obsOffset(g);d+=`<g transform="translate(${off},0)">`;g.rows.forEach(r=>d+=Rc(0,r.z0,g.Wm,r.z1-r.z0,'box'));d+=Rc(-10,820,g.Wm+20,30,'box')+'</g>';
    d+=`<rect x="${ta.x0}" y="${-ta.z1}" width="${ta.x1-ta.x0}" height="${ta.z1-ta.z0}" fill="${ta.tl.color}" stroke="#B4520F" stroke-width="2" vector-effect="non-scaling-stroke"/>`+ta.extra.map(e=>`<rect x="${f(e.x)}" y="${f(-e.z1)}" width="${f(e.w)}" height="${f(e.z1-e.z0)}" fill="${ta.tl.color}" stroke="#B4520F" stroke-width="2" vector-effect="non-scaling-stroke"/>`).join('');
    let gl='';const zTop=Math.max(ta.z1,...ta.extra.map(e=>e.z1));for(let z=ta.z0,row=0;z<zTop;z+=ta.tl.h,row++){gl+=`<line x1="${ta.x0}" y1="${-z}" x2="${ta.x1}" y2="${-z}" stroke="#9A958C" stroke-width=".5" vector-effect="non-scaling-stroke"/>`;const sh=ta.tl.pattern==='brick'&&row%2?ta.tl.w/2:0;
      for(let x=ta.x0-sh;x<ta.x1;x+=ta.tl.w)gl+=`<line x1="${f(x)}" y1="${-z}" x2="${f(x)}" y2="${-(Math.min(z+ta.tl.h,zTop))}" stroke="#9A958C" stroke-width=".5" vector-effect="non-scaling-stroke"/>`}
    d+=`<g clip-path="url(#${id})">${gl}</g>`;
    (j.obstacles||[]).filter(o=>o.face===g.face).forEach(o=>{const c=(OBS[o.type]||OBS.etc);d+=R(o.x,o.z,o.w,o.h,`fill="#fff" stroke="${c.color}" stroke-width="1.4" stroke-dasharray="6 4" vector-effect="non-scaling-stroke"`)+TX(o.x+o.w/2,o.z+o.h/2,c.label,8*k,`fill="${c.color}" text-anchor="middle"`)});
    d+=Lc(ta.x0-30*k,ta.z0,ta.x1+30*k,ta.z0,'gnd')+TX(ta.x1+34*k,ta.z0-3*k,'타일 시작선 (상판 위)',8*k,'fill="#B4520F"');
    d+=Lc(ta.x0-30*k,ta.z1,ta.x1+30*k,ta.z1,'gnd')+TX(ta.x1+34*k,ta.z1-3*k,j.tile.top==='ceiling'?'타일 끝선 (천장)':'타일 끝선 (상부장 아래)',8*k,'fill="#B4520F"');
    d+=dimH(ta.x0,ta.x1,ta.z1+40*k,`${ta.x1-ta.x0}`,k,ta.z1)+dimV(ta.z0,ta.z1,ta.x0-40*k,`${ta.z1-ta.z0}`,k,ta.x0)+dimV(0,ta.z0,ta.x0-40*k,String(CTH),k,ta.x0)+Lc(-200,0,ta.x1+200,0,'gnd');
    s+=`<text x="${area.x}" y="${area.y+16}" font-size="15" class="hd">${FACE_NAME(g.face)} 벽</text><g transform="translate(${f(ox)},${f(oy)}) scale(${sc.toFixed(5)})">${d}</g>`});
  s+=`<line x1="16" y1="740" x2="${W-16}" y2="740" class="fr"/><text x="36" y="770" font-size="15" class="hd">타일 물량</text>`;
  ['면','타일','시공 면적','주문 면적 (+10%)','장수 (+10%)','작업선'].forEach((t,i)=>s+=`<text x="${36+[0,90,520,680,860,1010][i]}" y="800" font-size="12" class="lb">${t}</text>`);
  tas.forEach((ta,r)=>{const y=826+r*26;[FACE_NAME(ta.g.face),ta.tl.name,`${ta.area} ㎡`,`${ta.order} ㎡`,`${ta.pcs} 장`,`${CTH} ~ ${ta.z1} (${ta.z1-CTH})`].forEach((t,i)=>s+=`<text x="${36+[0,90,520,680,860,1010][i]}" y="${y}" font-size="13" class="vl">${esc(t)}</text>`)});
  s+=`<text x="36" y="${840+tas.length*26+10}" font-size="12" class="lb">· 타일은 상판 설치 후 시공 · 상부장 하단 라인과 줄눈 맞춤 · 창문 면적 제외 · 콘센트·스위치 위치 타공</text>`;
  return s+'</svg>'}
function workOrder(j=job){const rows=[],add=(trade,task,detail,who)=>rows.push([trade,task,detail,who,'□']);const P=catalog.prices,gs=j.faces.map((f,i)=>geom(j,i)),u=utilNeeds(j),ap=allApps(j);
  {const lp=lightPlan(j);if(lp.runs.length){add('2 전기','장 조명 전원',`${[...new Set(lp.runs.map(r=>FACE_NAME(r.g.face)))].join('·')} 장 위(천장 쪽) 또는 걸레받이 안 콘센트 1구 · 총 ${lp.W}W · SMPS ${lp.psu.map(w=>w+'W').join('+')}`,'전기');
    if(lp.ctrl==='wall')add('2 전기','조명 벽 스위치 배선','장 옆 벽 스위치에서 장 위까지 배선','전기');
    add('5 장 설치','LED 조명 설치·결선',`${Object.keys(lp.byT).map(t=>LT[t].label).join(', ')} · ${CCT[lp.cct][0]} · ${CTRL[lp.ctrl]}`,'자체')}}
  reqsFor(j,'site').forEach(t=>add('0 고객 요청',t,'실측·상담 때 받은 요청','전원'));{const sf=shipFee(j);add('0 일정','운반',`${sf.tr.name} ${sf.n}대 · ${catalog.company.origin||'출고지'} → ${j.customer.addr||'현장'}${sf.km?` · ${sf.km}km (${sf.tier})`:' · 거리 미입력'}`,'운반')}if(j.dueInstall)add('0 일정','설치 예정일',j.dueInstall+(j.dueMake?` · 공장 출고 ${j.dueMake}`:''),'자체');
  j.faces.forEach((fc,fi)=>fc.rows.forEach(r=>r.mods.forEach((m,i)=>{if(m.note)add('0 고객 요청',`${FACE_NAME(fc.key)} ${r.zone==='upper'?'상부 ':r.zone==='top'?'위 칸 ':r.zone==='lower'?'하부 ':''}${i+1}번째 칸`,m.note,'자체')})));
  if(j.preDemo){add('1 철거','기존 장 철거·폐기',facesSpec(j),'자체');add('1 철거','바닥·벽 보양','철거 전 보양',"자체")}
  if(j.cat==='kitchen'){
    if(u.elec.length)add('2 전기',`쿡탑 전원 · ${u.lvT}${u.needLine?' (신설)':u.needOutlet?' (콘센트 신설)':' (확인)'}`,`${u.elec.map(x=>x.a.name).join(', ')} · 합계 ${r2(u.kw)}kW · ${u.spec} · ${u.elec[0].where} 하부`,'전기');
    if(u.elec.length&&u.lv!=='outlet')add('2 전기',`차단기 ${u.needBreaker?'별도 설치':'확인'}`,u.lv==='direct'?'분전반 40A 단독 차단기':'분전반 20A 전용 차단기','전기');
    if(u.needContract)add('2 전기','계약전력 증설 검토',`동시 최대 ${u.peak}kW > 계약 ${u.ct}kW · 한전 신청 (아파트는 관리사무소)`,'전기');
    ap.filter(x=>['dw','wash','oven','hood'].includes(x.a.kind)).forEach(x=>add('2 전기',`${APP_KIND[x.a.kind]} 전원 콘센트`,`${x.where} · 왼쪽 모서리에서 ${Math.round(x.cx)}${x.a.kind==='hood'?` · 후드 하단 높이 ${x.m.z0} (상판에서 ${x.m.z0-CTH}${x.m.raise?`, ${x.m.raise} 올림`:''})`:''}${x.a.kw?` · ${x.a.kw}kW`:''}`,'전기'));
    ap.filter(x=>x.a.kind==='sink').forEach(x=>add('3 설비','개수대 급수·배수',`${x.where} · 중심 ${Math.round(x.cx)} · ${x.a.name}`,'설비'));
    ap.filter(x=>['dw','wash'].includes(x.a.kind)).forEach(x=>add('3 설비',`${APP_KIND[x.a.kind]} 급수·배수`,`${x.where} · 중심 ${Math.round(x.cx)}`,'설비'));
    if(u.gas.length)add('3 설비',`가스 배관 ${u.needGas?'연결 (가스공사)':'확인'}`,`${u.gas.map(x=>x.a.name).join(', ')} · ${u.gas[0].where}`,'가스공사');
    if(u.capGas)add('3 설비','기존 가스 배관 막음','전기 쿡탑으로 변경 · 가스공사 의뢰','가스공사')}
  obstacleIssues(j).filter(x=>!x.ok).forEach(x=>add('3 설비',`${OBS[x.o.type].label} 처리`,`${x.hits.map(h=>h.tag).join(', ')} · ${OBS[x.o.type].tip}`,x.o.type==='elec'?'전기':'설비'));
  tileAreas(j).forEach(ta=>add('4 타일',`${FACE_NAME(ta.g.face)} 벽 타일`,`${ta.tl.name} · ${CTH}~${ta.z1} · ${ta.area}㎡ (주문 ${ta.order}㎡ · ${ta.pcs}장)`,'타일'));
  gs.forEach(g=>add('5 장 설치',g.island?'아일랜드':`${FACE_NAME(g.face)} ${CATS[j.cat].name}`,`제작 ${g.Wm}×${g.Hm}×${g.Dm} · 걸레받이 ${g.pl||0} · ${finishText(g)}`,'자체'));
  {const d=doorById(j.doorId);gs.forEach(g=>{const fl=g.rows.flatMap(r=>rowAll(r).filter(m=>m.filler&&(m.cfill||m.spacer)).map(m=>`${r.zone==='upper'?'상부 ':r.zone==='top'?'위 칸 ':r.zone==='lower'?'하부 ':''}${m.cfill?'코너 휠라':'벽쪽 스페이서'} ${m.w}`));if(fl.length)add('5 장 설치',`${FACE_NAME(g.face)} 간섭 방지 휠라`,fl.join(' · '),'자체')});
    if(d?.kind==='hinged')add('5 장 설치','경첩 방향','제작 도면 정면도 표시대로 (벽·코너·서랍·후드 반대쪽으로 자동 배치)','자체');clashIssues(j).filter(x=>x.lvl==='bad'||x.lvl==='warn').forEach(x=>add('5 장 설치','간섭 확인',x.msg,'자체'))}
  if(lidOn(j))add('6 상판','코너 리프트업 상판','A면 코너 분할된 상판에 피아노 경첩 + 가스쇼바 2개 장착 · 열림 각도·닫힘 확인','상판');
  if(penOn(j))add('5 장 설치','반도형 고정','B면은 뒤에 벽이 없으므로 바닥·A면 장에 단단히 고정 · 뒷면 마감판 부착','자체');
  if(j.tallEnd?.on&&j.cat==='kitchen')add('5 장 설치','키큰장',`${TALL_K[j.tallEnd.k||'combo']} · 수평·수직 먼저 맞추고 전원(오븐·전자레인지) 위치 확인`,'자체');
  if(j.faces.some(f=>f.key==='I'))add('5 장 설치','아일랜드 방향',`문은 ${j.island?.front==='room'?'거실 쪽':'싱크대 쪽'}으로 · 오버행 ${j.island?.over||0}은 반대쪽`,'자체');
  if(tallOn(j))add('5 장 설치','코너 키큰장',`${TALL_K[j.corner.tallK||'oven']} · 데드코너 옆에 먼저 세우고 수평·수직 맞춘 뒤 하부장 연결`,'자체');
  if(j.cat==='kitchen'){gs.forEach(g=>{const c=g.island?islandCounter(j):counterById(j.counterId);add('6 상판',`${FACE_NAME(g.face)} 상판`,`${c?.name||'-'} · ${g.Wm+2*g.side}×${g.island?g.D:g.D+20+(g.bg&&g.bgUse==='deep'?g.bg:0)}×${g.ct.thick}T${ctPieces(g)>1?` · ${ctPieces(g)}장 이음`:''}${g.ct.back&&!g.island?` · 뒷턱 ${g.ct.back}`:''} · ${g.ct.note}`,'상판')});
    ap.filter(x=>['sink','cooktop'].includes(x.a.kind)).forEach(x=>add('6 상판',`${APP_KIND[x.a.kind]} 현장 타공`,`${x.where} · ${cutPos(x.m,x.a).cw}×${cutPos(x.m,x.a).cd} · ${cutTxt(x.m,x.a)} · 상판 도면 위치 참고${x.a.kind==='sink'&&x.g.ct.type==='natural'?' · 수전 타공은 볼 뒤쪽 상판':''}`,'상판'))}
  ap.forEach(x=>add('7 가전',`${x.a.name} 설치`,`${x.where} · ${x.own==='cust'?'고객 구매품':'회사 공급'}`,'자체'));
  add('8 마감','실리콘·휠라 재단·청소',j.finish==='filler'?'휠라·상몰딩 현장 재단':'좌우·상부 틈 확인','자체');
  return rows}
function workPage(j=job){const rows=workOrder(j),w=1400,h=Math.max(990,230+rows.length*26+60);
  return{w,h,svg:tablePage({w,h,title:`작업지시서 · ${CATS[j.cat].name} ${LAYOUTS[j.layout]}`,meta:[`현장: ${j.customer.addr||'-'} · 고객: ${j.customer.name||'-'} · No. ${j.docNo}`,`${facesSpec(j)} · H ${j.dims.H} · ${catalog.company.name} ${catalog.company.tel} · 시공일 ____ / ____`],
    headers:['공정','작업','내용·위치','담당','확인'],cols:[120,260,720,140,80],aligns:['l','l','l','l','l'],rows})}}
const facesSpec=j=>j.faces.map(f=>`${FACE_NAME(f.key)} ${f.len}`).join(' · ');
function cutPage(j=job){const rows=cutList(j),g=geom(j);const h=Math.max(990,210+rows.length*26+60);
  return{w:1400,h,svg:tablePage({w:1400,h,title:`부재 목록 · ${CATS[g.cat].name}`,meta:[`No. ${j.docNo} · ${j.customer.name||'-'} · ${j.customer.addr||'-'}`,`${LAYOUTS[j.layout]} · ${facesSpec(j)} · H ${g.H} · D ${+j.dims.D} · 도어 ${doorById(j.doorId)?.name||'-'} · ${catalog.company.name}`],
    headers:['No','부재명','규격 (mm)','재질 / 마감','수량','비고'],cols:[60,260,260,400,100,240],aligns:['l','l','l','l','r','l'],rows:rows.map((r,i)=>[i+1,r.part,r.size,r.mat,r.qty,r.note])})}}
const QG=[['몸통 (목대)',/본체|하부장|키큰장|냉장고장|데드코너|코너 ·|위 칸|프레임·레일|문틀|내 장/],['도어',/^도어|문짝|유리 도어|장문|루버|고정창|플랩 도어 \(|유리·마감/],['마감판넬',/마감|휠라|몰딩|판넬/],['상판',/상판/],['선반·뒷선반',/선반/],['기기',/^(싱크볼|수전|쿡탑|후드|식기세척기|세탁기|오븐|식기건조대|빌트인 정수기|음식물처리기|냉장고|기타 부속)/],['시공·전기·운반',/설치|운반|전용|차단기|가스|철거|배선|타일|콘센트|계약|시공/],['액세서리·철물',/.*/],['할인',/^할인 \(네고\)/]];
const qGroup=it=>{if(/^할인 \(네고\)/.test(it))return'할인';for(const[g,re]of QG){if(g==='기기'&&/설치 \(고객 구매\)/.test(it))return'시공·전기·운반';if(re.test(it))return g}return'액세서리·철물'};
function groupLines(lines){const by={};lines.forEach(l=>{const g=qGroup(l.item);(by[g]=by[g]||[]).push(l)});return QG.map(([g])=>[g,by[g]||[]]).filter(([,ls])=>ls.length)}
function quotePage(j=job){const q=quote(j),g=geom(j),w=794,h=Math.max(1123,520+(q.lines.length+groupLines(q.lines).length)*26);
  return{w,h,svg:tablePage({w,h,title:`견적서 · ${catalog.company.name}`,meta:[`수신: ${j.customer.name||'고객님'}  ·  현장: ${j.customer.addr||'-'}`,`품목: ${CATS[g.cat].name} ${LAYOUTS[j.layout]} · ${facesSpec(j)} · 높이 ${g.H}mm`,`견적일 ${today()} · No. ${j.docNo} · 문의 ${catalog.company.tel}`],
    headers:['품목','규격','수량','단가','금액'],cols:[250,140,70,120,134],aligns:['l','l','r','r','r'],rows:groupLines(q.lines).flatMap(([g,ls])=>[[`■ ${g}`,'','','소계',won(ls.reduce((a,l)=>a+l.amt,0))],...ls.map(l=>['  '+l.item,l.spec,`${nf(l.qty)}${l.unit}`,won(l.price),won(l.amt)])]),
    foot:y=>{let s='';const r=(lab,v,big,yy)=>`<text x="560" y="${yy}" font-size="${big?15:13}" fill="${big?'#111':'#555'}" text-anchor="end" ${big?'font-weight="700"':''}>${lab}</text><text x="754" y="${yy}" font-size="${big?20:13}" fill="#111" text-anchor="end" font-family="IBM Plex Mono, Menlo, monospace" ${big?'font-weight="600"':''}>${v}</text>`;
      s+=r('공급가액',won(q.sub),0,y+30)+r('부가세 (10%)',won(q.vat),0,y+54)+`<line x1="420" y1="${y+68}" x2="754" y2="${y+68}" stroke="#111"/>`+r('합계 (VAT 포함)',`${won(q.total)}원`,1,y+96);
      ['· 본 견적은 실측 기준이며 현장 여건에 따라 달라질 수 있습니다.','· 견적 유효기간: 견적일로부터 14일','· 결제: 계약금 30% · 잔금 설치 완료 후'].forEach((t,i)=>s+=`<text x="40" y="${y+140+i*22}" font-size="12" fill="#555">${t}</text>`);return s}})}}

