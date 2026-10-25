/* ---------- color helpers ---------- */
function shade(hex,a){const n=parseInt((hex||'#888888').slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const t=a<0?0:255,p=Math.abs(a);
  r=Math.round(r+(t-r)*p);g=Math.round(g+(t-g)*p);b=Math.round(b+(t-b)*p);return'#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1)}
function lum(hex){const n=parseInt((hex||'#888888').slice(1),16);return(.299*(n>>16)+.587*(n>>8&255)+.114*(n&255))/255}
const rnd=(i,s=1)=>{const x=Math.sin(i*12.9898+s*78.233)*43758.5453;return x-Math.floor(x)};

/* ---------- svg primitives (mm, floor = 0, up positive) ---------- */
const R=(x,zb,w,h,a='')=>`<rect x="${f(x)}" y="${f(-(zb+h))}" width="${f(Math.max(0,w))}" height="${f(Math.max(0,h))}" ${a}/>`;
const Rc=(x,zb,w,h,c)=>R(x,zb,w,h,`class="${c}"`);
const L=(x1,z1,x2,z2,a='')=>`<line x1="${f(x1)}" y1="${f(-z1)}" x2="${f(x2)}" y2="${f(-z2)}" ${a}/>`;
const Lc=(x1,z1,x2,z2,c)=>L(x1,z1,x2,z2,`class="${c}"`);
const TX=(x,z,t,fs,a='')=>`<text x="${f(x)}" y="${f(-z)}" font-size="${f(fs)}" ${a}>${esc(t)}</text>`;
function dimH(x1,x2,z,label,k,zFrom=null){const t=4*k;let s='<g class="dim">'+L(x1,z,x2,z);
  if(zFrom!=null)s+=L(x1,zFrom+3*k,x1,z+t*1.6)+L(x2,zFrom+3*k,x2,z+t*1.6);
  s+=L(x1-t,z-t,x1+t,z+t)+L(x2-t,z-t,x2+t,z+t);const lab=String(label);const fs=Math.max(7*k,Math.min(11*k,Math.abs(x2-x1)/(lab.length*.68)));
  return s+TX((x1+x2)/2,z+3.5*k,lab,fs,'text-anchor="middle"')+'</g>'}
function dimV(z1,z2,x,label,k,xFrom=null){const t=4*k;let s='<g class="dim">'+L(x,z1,x,z2);
  if(xFrom!=null){const dir=x>xFrom?1:-1;s+=L(xFrom+dir*3*k,z1,x+dir*t*1.6,z1)+L(xFrom+dir*3*k,z2,x+dir*t*1.6,z2)}
  s+=L(x-t,z1-t,x+t,z1+t)+L(x-t,z2-t,x+t,z2+t);const lab=String(label);const fs=Math.max(7*k,Math.min(11*k,Math.abs(z2-z1)/(lab.length*.68)));
  return s+`<text transform="translate(${f(x-3.5*k)},${f(-(z1+z2)/2)}) rotate(-90)" font-size="${f(fs)}" text-anchor="middle">${esc(lab)}</text></g>`}

/* ---------- technical renderers ---------- */
function techModule(m,k,label=true){const{x,w,z0,z1}=m,h=z1-z0,lay=layout(m);if(m.blind){const fx=m.side==='L'?x+w-m.cf:x+m.cf;let q=Rc(x,z0,w,h,'box')+Lc(x,z0,x+w,z1,'dash')+Lc(x,z1,x+w,z0,'dash');if(m.cf)q+=Lc(fx,z0,fx,z1,'thin');
    return q+(label!==null?TX(x+w/2,z0+h/2,m.zt==='magic'?'매직코너':'데드코너',Math.min(10*k,w/6),'class="t" text-anchor="middle"')+(m.cf?TX(m.side==='L'?x+w-m.cf/2:x+m.cf/2,z0+40*k,`휠라${m.cf}`,Math.min(8*k,m.cf*.4),'class="t" text-anchor="middle"'):''):'')}
  if(m.filler){let q=Rc(x,z0,w,h,'ln');for(let z=z0+w;z<z1;z+=Math.max(60,w))q+=Lc(x,z-w,x+w,z,'thin');return q+(w>=30?TX(x+w/2,z0+h/2,`휠라 ${w}`,Math.min(9*k,w*.5),`class="t" text-anchor="middle" transform="rotate(-90 ${f(x+w/2)} ${f(-(z0+h/2))})"`):'')}let s=Rc(x,z0,w,h,'box');
  s+=Lc(x+T,z0,x+T,z1,'thin')+Lc(x+w-T,z0,x+w-T,z1,'thin')+Lc(x+T,z1-T,x+w-T,z1-T,'thin')+Lc(x+T,z0+T,x+w-T,z0+T,'thin');
  lay.shelves.forEach(z=>s+=Rc(x+T,z-T,w-2*T,T,'sh'));lay.rods.forEach(z=>s+=Lc(x+T+20,z,x+w-T-20,z,'rod'));
  lay.drawers.forEach(d=>{s+=Rc(x+T+8,d.zb+4,w-2*T-16,d.h-8,'dr')+Lc(x+w/2-Math.min(40,w/6),d.zb+d.h-28,x+w/2+Math.min(40,w/6),d.zb+d.h-28,'thin')});
  if(lay.mirror)s+=Rc(x+T+40,lay.mirror.zb,w-2*T-80,lay.mirror.zt-lay.mirror.zb,'dash')+TX(x+w/2,(lay.mirror.zb+lay.mirror.zt)/2,'거울',9*k,'class="t" text-anchor="middle"');
  if(lay.sink){const sa=modApps(m).find(q=>q.a.kind==='sink'&&q.a.w)?.a,bw=sa?Math.min(+sa.cw||sa.w-40,w-2*T):w*.7,bh=sa?.h||200,bx=x+(w-bw)/2;s+=Rc(bx,z1-bh-10,bw,bh,'dash')+TX(x+w/2,z1-bh/2-6,sa?`싱크볼 ${sa.tag||sa.w}`:'싱크볼',9*k,'class="t" text-anchor="middle"')}
  if(lay.hood)s+=Rc(x+40,z0,w-80,150,'dash')+TX(x+w/2,z0+60,'후드',9*k,'class="t" text-anchor="middle"');
  if(m.corner){s+=Lc(m.side==='L'?x:x+w,z0+T,m.side==='L'?x+w:x,z1-T,'dash')+TX(x+w/2,z0+(z1-z0)/2,`${m.leg}×${m.leg}`,9*k,'class="t" text-anchor="middle"')}
  if(lay.cook)s+=TX(x+w/2,z1-120,'쿡탑',9*k,'class="t" text-anchor="middle"');
  if(lay.dw||lay.wash)s+=Rc(x+10,z0+10,w-20,h-20,'dash')+TX(x+w/2,z0+h/2,lay.dw?'식기세척기':'세탁기',9*k,'class="t" text-anchor="middle"');
  if(lay.oven)s+=Rc(x+T,lay.oven.zb,w-2*T,lay.oven.zt-lay.oven.zb,'dash')+TX(x+w/2,(lay.oven.zb+lay.oven.zt)/2,'오븐',9*k,'class="t" text-anchor="middle"');
  if(lay.washers){const W_=lay.washers,n=W_.n;for(let q=0;q<n;q++){const xa=W_.stack?x+T:x+T+q*(w-2*T)/n,wa=W_.stack?w-2*T:(w-2*T)/n,za=W_.stack?W_.zb+q*(W_.zt-W_.zb)/2:W_.zb,ha=W_.stack?(W_.zt-W_.zb)/2:W_.zt-W_.zb;s+=Rc(xa+8,za+8,wa-16,ha-16,'dash')+TX(xa+wa/2,za+ha/2,q===0?'세탁기':'건조기',9*k,'class="t" text-anchor="middle"')}}
  if(lay.micro)s+=Rc(x+T,lay.micro.zb,w-2*T,lay.micro.zt-lay.micro.zb,'dash')+TX(x+w/2,(lay.micro.zb+lay.micro.zt)/2,lay.microLab||'전자레인지',9*k,'class="t" text-anchor="middle"');
  if(lay.fridge)s+=Rc(x+T,lay.fridge.zb+T,w-2*T,lay.fridge.zt-lay.fridge.zb-2*T,'dash')+TX(x+w/2,(lay.fridge.zb+lay.fridge.zt)/2,'냉장고',9*k,'class="t" text-anchor="middle"');
  if(m.hw?.length)s+=TX(x+w/2,z0+50,m.hw.map(k=>HWS[k]?.l.split(' ')[0]).join('·'),Math.min(8*k,w/(m.hw.length*5+2)),'fill="#B4520F" text-anchor="middle"');
  if(m.tall)s+=TX(x+w/2,z1-80,`키큰장 ${w}`,9*k,'class="t" text-anchor="middle"');
  if(lay.rack)lay.rack.forEach(z=>s+=Lc(x+T+20,z,x+w-T-20,z,'rod'));
  if(m.lights?.length){const L_=m.lights;if(L_.includes('shelf'))lay.shelves.forEach(z=>s+=Lc(x+T+10,z-T-6,x+w-T-10,z-T-6,'dash'));if(L_.includes('rod'))lay.rods.forEach(z=>s+=Lc(x+T+10,z+6,x+w-T-10,z+6,'dash'));
    if(L_.includes('vert'))s+=Lc(x+T+8,z0+T+30,x+T+8,z1-T-30,'dash')+Lc(x+w-T-8,z0+T+30,x+w-T-8,z1-T-30,'dash');if(L_.includes('puck'))s+=`<circle class="dash" cx="${f(x+w/2)}" cy="${f(-(z1-T-15))}" r="25"/>`;if(L_.includes('under'))s+=Lc(x+20,z0-4,x+w-20,z0-4,'dash');
    if(label)s+=TX(x+w-T-6,z1-T-12*k,'LED',Math.min(8*k,w/8),'class="t" text-anchor="end" fill="#C77700"')}
  {const ap=modApps(m).filter(x=>['sink','cooktop','dw','wash','oven','hood','dryer'].includes(x.a.kind)).map(x=>x.a.name.replace(/빌트인 |상부 |사각 /g,''));if(ap.length&&label)s+=TX(x+w/2,z0+28*k,ap.join(' · ').slice(0,Math.floor(w/(7*k))),Math.min(8*k,w/10),'class="t" text-anchor="middle"')}
  if(label){const lab=(m.unit&&unitById(m.unit)?.name)||TYPES[m.t]?.label||'';const fs=Math.min(10*k,(w-2*T)/(lab.length*1.05));s+=TX(x+w/2,z1-T-fs*1.25,lab,fs,'class="t" text-anchor="middle"')}
  return s}
function hingeMarks(l){const top=l.zb+l.h,mid=l.zb+l.h/2;if(l.hinge==='U')return Lc(l.x,l.zb,l.x+l.w/2,top,'hinge')+Lc(l.x+l.w,l.zb,l.x+l.w/2,top,'hinge');return l.hinge==='L'?Lc(l.x+l.w,top,l.x,mid,'hinge')+Lc(l.x+l.w,l.zb,l.x,mid,'hinge'):Lc(l.x,top,l.x+l.w,mid,'hinge')+Lc(l.x,l.zb,l.x+l.w,mid,'hinge')}
function slideArrow(x,z,w,k){const a=x+w*.28,b=x+w*.72,t=8*k;return Lc(a,z,b,z,'ln')+`<polyline class="ln" points="${f(a+t)},${f(-z-t*.7)} ${f(a)},${f(-z)} ${f(a+t)},${f(-z+t*.7)}"/>`+`<polyline class="ln" points="${f(b-t)},${f(-z-t*.7)} ${f(b)},${f(-z)} ${f(b-t)},${f(-z+t*.7)}"/>`}
function techMiddoor(g,k){let s=Rc(0,0,g.Wm,g.Hm,'box')+Rc(0,g.Hm-60,g.Wm,60,'thin')+Rc(0,0,MFRAME,g.Hm-60,'thin')+Rc(g.Wm-MFRAME,0,MFRAME,g.Hm-60,'thin');
  midPanels(g).forEach((p,i)=>{const zb=10;s+=Rc(p.x,zb,p.w,p.h,'ln')+Rc(p.x+28,zb+28,p.w-56,p.h-56,'thin');
    if(p.t==='mslide')s+=slideArrow(p.x,zb+p.h*.5,p.w,k);
    if(['mswing','mlouver','mcab'].includes(p.t)){const sw=g.rows[0].mods.map((m,ii)=>['mswing','mlouver','mcab'].includes(m.t)?ii:-1).filter(x=>x>=0),si=sw.indexOf(i);s+=hingeMarks({x:p.x,zb,w:p.w,h:p.h,hinge:sw.length===1?(g.rows[0].mods[i]?.hinge||'L'):si<sw.length/2?'L':'R'})}
    if(p.t==='mlouver'){for(let yy=zb+60;yy<zb+p.h-60;yy+=45)s+=Lc(p.x+40,yy,p.x+p.w-40,yy,'thin')}
    if(p.t==='mfixed')s+=TX(p.x+p.w/2,zb+p.h*.5,'FIX',11*k,'class="t" text-anchor="middle"')});
  return s+Lc(-150,0,g.Wm+150,0,'gnd')}
function techExterior(g,door,k){let s='';if(isMD(g.cat))return techMiddoor(g,k);
  g.rows.forEach(row=>{const gh_=(row.corners||[]).filter(c=>c.ghost),bx_=Math.max(row.off||0,...gh_.filter(c=>c.x+c.w/2<g.Wm/2).map(c=>c.x+c.w)),bx2_=Math.min(g.Wm-(row.offR||0),...gh_.filter(c=>c.x+c.w/2>=g.Wm/2).map(c=>c.x));s+=Rc(bx_,row.z0,bx2_-bx_,row.z1-row.z0,'box');rowAll(row).forEach(m=>{const lay=layout(m);if(door?.kind==='none'||lay.openZ||!lay.zones.some(z=>z.kind==='door'))s+=techModule(m,k,false)})});
  if(g.pl)s+=Rc(0,0,g.Wm,g.pl,'thin');
  if(!g.island&&(g.ep?.L||g.ep?.R)){const kk=k,epx=sd=>sd==='L'?-g.sL:g.Wm;['L','R'].filter(sd=>g.ep?.[sd]).forEach(sd=>{const x=epx(sd),w=sd==='L'?g.sL:g.sR;g.rows.forEach(r=>{const z0=r.zone==='lower'?0:r.z0,z1=r.zone==='lower'?g.ct0:r.z1;s+=R(x,z0,w,z1-z0,'fill="#E8590C" fill-opacity=".18" stroke="#E8590C" stroke-width="1.2" vector-effect="non-scaling-stroke"')});
    const lz=g.ct0/2,lx=sd==='L'?x-12*kk:x+w+12*kk;s+=`<text x="${f(lx)}" y="${f(-lz)}" font-size="${f(11*kk)}" fill="#C2410C" text-anchor="middle" transform="rotate(-90 ${f(lx)} ${f(-lz)})" style="paint-order:stroke;stroke:#fff;stroke-width:${f(3*kk)}">마감판 EP ${RULES.epT}T</text>`})}
  if(!g.island){if(g.fin==='filler'){fillerZones(g).forEach(([a,b])=>{if(g.sL&&!g.ep?.L)s+=Rc(-g.sL,a,g.sL,b-a,'ln');if(g.sR&&!g.ep?.R)s+=Rc(g.Wm,a,g.sR,b-a,'ln')});s+=Rc(-g.sL,g.Hm,g.Wm+g.sL+g.sR,g.H-g.Hm,'ln')}
    else{s+=Lc(-g.sL,g.H,g.Wm+g.sR,g.H,'dash')}s+=Lc(-g.sL,0,-g.sL,g.H,'dash')+Lc(g.Wm+g.sR,0,g.Wm+g.sR,g.H,'dash')}
  if(g.cat==='kitchen')s+=(g.island?Rc(-g.side,g.ct0,g.Wm+2*g.side,g.ct.thick,'box'):ctSegs(g,-10,g.Wm+10).map(([a,b])=>Rc(a,g.ct0,b-a,g.ct.thick,'box')).join(''))+(g.lidW?TX(g.lidW/2,g.ct0-60,'리프트업 상판',Math.min(11,g.lidW/14)*(g.Wm/1400+.6),'class="t" text-anchor="middle"'):'')+(g.ct.back&&!g.island?Rc(-10,CTH,g.Wm+20,g.ct.back,'ln'):'')+ctSeams(g,'tech')+techTable(g,k);
  leaves(g,door).forEach(l=>{s+=Rc(l.x,l.zb,l.w,l.h,l.kind==='slide'?'box':'ln');if(l.glass)s+=Rc(l.x+30,l.zb+30,l.w-60,l.h-60,'thin')+TX(l.x+l.w/2,l.zb+l.h/2,'유리',Math.min(9*k,l.w/6),'class="t" text-anchor="middle"');
    if(l.kind==='door')s+=hingeMarks(l);if(door?.kind==='hinged')s+=techHandle(g.jref,l,k);
    if(l.kind==='slide')s+=slideArrow(l.x,l.zb+l.h*(l.layer?.42:.55),l.w,k)});
  return s+Lc(-150,0,g.Wm+150,0,'gnd')}
function techInterior(g,k){let s='';if(isMD(g.cat))return techMiddoor(g,k);
  g.rows.forEach(row=>rowAll(row).forEach(m=>s+=techModule(m,k)));
  if(g.pl)s+=Rc(0,0,g.Wm,g.pl,'thin');
  if(g.cat==='kitchen')s+=(g.island?Rc(-g.side,g.ct0,g.Wm+2*g.side,g.ct.thick,'box'):ctSegs(g,-10,g.Wm+10).map(([a,b])=>Rc(a,g.ct0,b-a,g.ct.thick,'box')).join(''))+(g.lidW?TX(g.lidW/2,g.ct0-60,'리프트업 상판',Math.min(11,g.lidW/14)*(g.Wm/1400+.6),'class="t" text-anchor="middle"'):'')+(g.ct.back&&!g.island?Rc(-10,CTH,g.Wm+20,g.ct.back,'ln'):'')+ctSeams(g,'tech')+techTable(g,k);
  return s+Lc(-150,0,g.Wm+g.ext+150,0,'gnd')}
function ctSeams(g,mode){const n=ctPieces(g);if(n<2)return'';let s='';const len=g.Wm+2*g.side,x0=-g.side;for(let i=1;i<n;i++){const x=x0+len*i/n;s+=mode==='tech'?Lc(x,g.ct0,x,CTH,'hinge'):L(x,g.ct0,x,CTH,'stroke="#8A8F92" stroke-width="3"')}return s}
function supportWarn(j=job){const P=catalog.prices,out=[];const isl=j.faces.some(f=>f.key==='I');
  if(isl){const ov=+j.island.over||0,sd=+j.island.side||0,sp=supportById(j.island.support),mx=+P.maxOverhang||300;
    if((ov>mx||sd>mx)&&!sp)out.push(`아일랜드 상판 오버행 ${Math.max(ov,sd)}mm는 받침 없이 ${mx}mm를 넘습니다. 다리·장·측판·브라켓 중 하나를 고르세요.`);
    if(sp?.type==='cabinet'&&ov-20<250)out.push(`뒷면 장은 오버행이 최소 270mm는 돼야 넣을 수 있습니다. 지금 ${ov}mm입니다.`);
    if(sp?.type==='panel'&&sd<40&&ov<=mx)out.push('측판 받침은 상판 양옆에 붙습니다. 좌우 오버행이 없으면 측판이 장 옆면을 덮는 형태가 됩니다.')}
  if(j.table?.on&&!supportById(j.table.support))out.push('식탁 받침을 고르세요.');
  if(j.cat==='kitchen'){const sinks=allApps(j).filter(x=>x.a.kind==='sink');sinks.forEach(x=>{const ct=x.g.ct;if(ct.mount==='over')out.push(`${x.g.ctc?.name||'상판'}: ${ct.label}은 언더싱크 불가 · 탑마운트(오버) 일체 볼로 바꾸세요 (${x.where})`);
      if(ct.mount==='integrated'&&x.own!=='cust')out.push(`${x.g.ctc?.name||'상판'}: 싱크볼이 상판과 일체 용접입니다 · ${x.a.name}는 빼도 됩니다 (${x.where})`)});
    j.faces.forEach((f,fi)=>{const g=geom(j,fi);if(!g.island&&ctPieces(g)>1)out.push(`${FACE_NAME(g.face)} 상판 ${g.Wm}mm는 ${g.ct.label} 최대 ${g.ct.maxLen}mm를 넘어 ${ctPieces(g)}장으로 이어 붙입니다 · 이음 위치가 싱크볼·쿡탑에 걸리지 않게 확인`)})}
  j.faces.forEach((f,fi)=>{const g=geom(j,fi),lo=g.rows.find(r=>r.zone==='lower'),up=g.rows.find(r=>r.zone==='upper');if(!lo||!up)return;
    up.mods.filter(m=>m.t==='hood').forEach(hm=>lo.mods.filter(c=>c.t==='cook'&&c.x<hm.x+hm.w&&c.x+c.w>hm.x).forEach(c=>{const ck=modApps(c).find(x=>x.a.kind==='cooktop')?.a,gas=ck?.fuel==='gas',min=gas?+P.hoodMinGas:+P.hoodMinElec,cl=hm.z0-CTH;
      if(cl<min)out.push(`${FACE_NAME(f.key)} 후드 하단~상판 ${cl}mm · ${gas?'가스':'전기'} 쿡탑은 ${min}mm 이상 권장 → 후드장을 ${min-cl}mm 이상 올리세요.`)}))});
  j.faces.forEach((f,fi)=>geom(j,fi).rows.forEach(r=>r.mods.forEach((m,i)=>appFit(m).forEach(t=>out.push(`${FACE_NAME(f.key)} ${r.zone==='upper'?'상부 ':r.zone==='top'?'위 칸 ':r.zone==='lower'?'하부 ':''}${i+1}번째 칸: ${t}`)))));
  clashIssues(j).filter(x=>x.lvl==='bad'||x.lvl==='warn').forEach(x=>out.push('간섭: '+x.msg));return out}
function supElev(g,mode,P,front,k){let s='';const tech=mode==='tech';
  const leg=(x,top,sp)=>tech?Rc(x,0,60,top,'ln'):R(x,0,60,top,`fill="${sp.color||'#2F3133'}"`);
  const panel=(x,top,w)=>tech?Rc(x,0,w,top,'ln'):R(x,0,w,top,`fill="${solidFill(P,front)}" stroke="${shade(front.color,-.3)}" stroke-width="3"`);
  if(g.island&&g.isup){const sp=g.isup;if(sp.type==='leg'&&g.side>=80){s+=leg(-g.side+20,g.ct0,sp)+leg(g.Wm+g.side-80,g.ct0,sp)}
    if(sp.type==='panel'&&g.side>=T*2){s+=panel(-g.side,g.ct0,T*2)+panel(g.Wm+g.side-T*2,g.ct0,T*2)}}
  if(g.tbl&&g.tbl.sup){const t=g.tbl,sp=t.sup,top=t.top-30;
    if(sp.type==='leg'){s+=leg(t.x0+t.w-100,top,sp);if(t.dir!=='perp')s+=tech?'':R(t.x0+40,0,60,top,`fill="${sp.color||'#2F3133'}" opacity=".5"`)}
    if(sp.type==='panel')s+=panel(t.x0+t.w-T*2,top,T*2);
    if(sp.type==='cabinet'){const cw=Math.min(600,t.w);s+=tech?Rc(t.x0+t.w-cw,g.pl||0,cw,top-(g.pl||0),'ln')+Lc(t.x0+t.w-cw/2,top-40,t.x0+t.w-cw,(top+(g.pl||0))/2,'hinge')+Lc(t.x0+t.w-cw/2,(g.pl||0)+40,t.x0+t.w-cw,(top+(g.pl||0))/2,'hinge'):R(t.x0+t.w-cw,0,cw,g.pl||0,`fill="${shade(front.color,-.42)}"`)+R(t.x0+t.w-cw+2,(g.pl||0)+2,cw-4,top-(g.pl||0)-4,`fill="${solidFill(P,front)}" stroke="${shade(front.color,-.3)}" stroke-width="4"`)}
    if(sp.type==='bracket'&&tech)s+=TX(t.x0+t.w/2,top-60*k,'숨은 브라켓',8*k,'class="t" text-anchor="middle"')}
  return s}
function techTable(g,k){if(!g.tbl)return supElev(g,'tech',null,null,k);const t=g.tbl;
  return Rc(t.x0,t.top-30,t.w,30,'box')+supElev(g,'tech',null,null,k)+TX(t.x0+t.w/2,t.top+14*k,t.dir==='perp'?'식탁 (꺾임)':'식탁',9*k,'class="t" text-anchor="middle"')}
function heightChain(g){if(isMD(g.cat))return[[0,g.Hm],[g.Hm,g.H]];
  if(g.cat==='kitchen'){const up=g.rows.find(r=>r.zone==='upper');const c=[[0,g.pl],[g.pl,g.ct0],[g.ct0,CTH]];if(up)c.push([CTH,up.z0],[up.z0,up.z1]);const tp=g.rows.find(r=>r.zone==='top');if(tp)c.push([tp.z0,tp.z1]);c.push([g.Hm,g.H]);return c}
  return[[0,g.pl],[g.pl,g.Hm],[g.Hm,g.H]]}

