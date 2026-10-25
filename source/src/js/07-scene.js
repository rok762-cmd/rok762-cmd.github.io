/* ---------- customer scene ---------- */
const PAL=['#7C8C9A','#C9B8A3','#3F4A56','#B5715A','#E2DED6','#6E7F6A','#A9A39A','#D7CDBE'];
function woodPat(id,color,u=1){const dk=shade(color,-.2),lt=shade(color,.1);let p='';
  for(let i=0;i<14;i++){const x=(i*9.3+(i*37%7))*u,a=(3+(i*13%5))*u;p+=`<path d="M${f(x)} 0 C ${f(x+a)} ${300*u}, ${f(x-a)} ${600*u}, ${f(x)} ${900*u} S ${f(x+a)} ${1500*u}, ${f(x)} ${1800*u}" stroke="${i%3?dk:lt}" stroke-width="${f((1+(i%4)*.8)*u)}" fill="none" opacity="${(.22+(i%5)*.07).toFixed(2)}"/>`}
  return`<pattern id="${id}" patternUnits="userSpaceOnUse" width="${f(130*u)}" height="${f(1800*u)}"><rect width="${f(130*u)}" height="${f(1800*u)}" fill="${color}"/>${p}</pattern>`}
function finishDefs(P,d,u=1){if(!d)return'';let s='';if(d.tex==='wood')s+=woodPat(P+'-wood',d.color,u);
  if(d.tex==='tambour'){const w=Math.max(.6,30*u);s+=`<pattern id="${P}-tamb" patternUnits="userSpaceOnUse" width="${f(w)}" height="${f(w)}"><rect width="${f(w)}" height="${f(w)}" fill="${d.color}"/><rect x="${f(w*.78)}" width="${f(w*.22)}" height="${f(w)}" fill="${shade(d.color,-.16)}"/><rect x="${f(w*.7)}" width="${f(w*.08)}" height="${f(w)}" fill="${shade(d.color,.12)}"/></pattern>`}
  if(d.kind==='frame'||['glass','satin','fluted'].includes(d.tex)){const gc=d.glass||d.color,op=d.tex==='satin'?[.92,.85,.92]:[.62,.36,.56];
    s+=`<linearGradient id="${P}-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${gc}" stop-opacity="${op[0]}"/><stop offset=".55" stop-color="${gc}" stop-opacity="${op[1]}"/><stop offset="1" stop-color="${gc}" stop-opacity="${op[2]}"/></linearGradient>`;
    if(d.tex==='fluted')s+=`<pattern id="${P}-flute" patternUnits="userSpaceOnUse" width="${f(18*u)}" height="${f(18*u)}"><rect width="${f(8*u)}" height="${f(18*u)}" fill="#fff" fill-opacity=".26"/></pattern>`}
  return s}
const solidFill=(P,d)=>d.tex==='wood'?`url(#${P}-wood)`:d.tex==='tambour'?`url(#${P}-tamb)`:d.color;
function glassPane(P,d,x,zb,w,h){let s=R(x,zb,w,h,`fill="url(#${P}-glass)"`);if(d.tex==='fluted')s+=R(x,zb,w,h,`fill="url(#${P}-flute)"`);
  const top=zb+h;s+=`<polygon points="${f(x+w*.3)},${f(-top)} ${f(x+w*.48)},${f(-top)} ${f(x+w*.22)},${f(-zb)} ${f(x+w*.04)},${f(-zb)}" fill="#fff" opacity=".14"/>`;return s}
function garments(x0,x1,z,len,seed){const n=Math.max(2,Math.floor((x1-x0)/62)),st=(x1-x0)/n;let s='';
  for(let i=0;i<n;i++){const gx=x0+i*st+st/2,l=len*(.7+.3*rnd(i,seed)),c=PAL[(i+seed*3)%PAL.length];
    s+=L(gx,z,gx,z-38,'stroke="#7d7f80" stroke-width="5"')+R(gx-22,z-38-l,44,l,`fill="${c}" rx="14"`)}return s}
function stacks(x0,x1,z,maxH,seed){const W=x1-x0,h=Math.min(maxH-40,170);if(h<40)return'';let s='';
  [[.08,.34],[.55,.3]].forEach(([a,b],j)=>{const n=Math.max(1,Math.floor(h/34)-(j+seed)%2);for(let i=0;i<n;i++)s+=R(x0+W*a,z+i*32,W*b,30,`fill="${PAL[(i*3+j+seed)%PAL.length]}" rx="6"`)});return s}
function shoes(x0,x1,z,seed){const n=Math.floor((x1-x0-30)/190);let s='';for(let i=0;i<n;i++){const c=PAL[(i*2+seed)%PAL.length],x=x0+20+i*190;
  s+=R(x,z,82,46,`fill="${c}" rx="20"`)+R(x+88,z,82,46,`fill="${shade(c,-.08)}" rx="20"`)}return s}
function interiorCust(m,body,P,front,seed){if(m.blind){const c=front?.color||body,fx=m.side==='L'?m.x+m.w-m.cf:m.x+m.cf;return R(m.x,m.z0,m.w,m.z1-m.z0,`fill="${shade(c,-.04)}"`)+(m.cf?R(fx-1,m.z0,2,m.z1-m.z0,'fill="#000" opacity=".15"'):'')}if(m.filler)return R(m.x,m.z0,m.w,m.z1-m.z0,`fill="${front?.color||body}"`)+R(m.x,m.z0,1.5,m.z1-m.z0,'fill="#000" opacity=".12"');if(m.t==='wash')return washerCust(m);const{x,w,z0,z1}=m,h=z1-z0,lay=layout(m),back=shade(body,-.07),side=shade(body,-.15),edge=shade(body,-.28);let s='';
  s+=R(x,z0,w,h,`fill="${back}"`)+R(x+T,z1-T-90,w-2*T,90,'fill="#000" opacity=".07"');
  const tops=[...lay.shelves].sort((a,b)=>a-b);const gapAbove=z=>{const nx=tops.find(t=>t>z+T);return(nx!=null?nx-T:z1-T)-z};
  lay.shelves.forEach(z=>s+=R(x+T,z-T-16,w-2*T,16,'fill="#000" opacity=".08"')+R(x+T,z-T,w-2*T,T,`fill="${body}"`));
  lay.rods.forEach(z=>s+=L(x+T+12,z,x+w-T-12,z,'stroke="#9EA3A6" stroke-width="16" stroke-linecap="round"'));
  lay.hangs.forEach((hg,i)=>s+=garments(x+T+30,x+w-T-30,hg.z,hg.len,seed+i));
  lay.stacks.forEach((z,i)=>s+=stacks(x+T,x+w-T,z,gapAbove(z),seed+i));
  lay.shoes.forEach((z,i)=>s+=shoes(x+T,x+w-T,z,seed+i));
  lay.drawers.forEach(d=>{if(d.ext)return;s+=R(x+T+6,d.zb+3,w-2*T-12,d.h-6,`fill="${shade(body,-.02)}" stroke="${edge}" stroke-width="2"`)+R(x+w/2-60,d.zb+d.h-40,120,12,`fill="${edge}" rx="6"`)});
  if(lay.washers){const W_=lay.washers,n=W_.n;for(let q=0;q<n;q++){const xa=W_.stack?x+T:x+T+q*(w-2*T)/n,wa=W_.stack?w-2*T:(w-2*T)/n,za=W_.stack?W_.zb+q*(W_.zt-W_.zb)/2:W_.zb,ha=W_.stack?(W_.zt-W_.zb)/2:W_.zt-W_.zb,mw=Math.min(wa-30,600),mx=xa+(wa-mw)/2,mh=Math.min(ha-10,850);s+=R(mx,za,mw,mh,'fill="#F2F3F3" stroke="#B9BEC1" stroke-width="4" rx="10"')+R(mx+20,za+mh-120,mw-40,90,'fill="#DDE0E2" rx="6"')+`<circle cx="${f(mx+mw/2)}" cy="${f(-(za+mh*.42))}" r="${f(Math.min(mw,mh)*.3)}" fill="#C9D3D8" stroke="#8E989D" stroke-width="10"/>`}}
  if(lay.fspace){const nn=frNiche(job);if(nn&&m.tall)s+=fridgeSVG(x+w/2,nn);else s+=R(x+40,lay.fridge.zb+10,w-80,lay.fridge.zt-lay.fridge.zb-20,'fill="#C9CDD0" stroke="#9EA3A6" stroke-width="6" rx="14"')+R(x+w/2-6,lay.fridge.zb+500,12,700,'fill="#8E9396" rx="6"')}
  if(lay.micro)s+=R(x+T,lay.micro.zb,w-2*T,lay.micro.zt-lay.micro.zb,'fill="#1E1F21"')+R(x+T+30,lay.micro.zb+40,w-2*T-170,lay.micro.zt-lay.micro.zb-80,'fill="#3A3D40" rx="8"')+R(x+w-T-110,lay.micro.zb+60,60,lay.micro.zt-lay.micro.zb-120,'fill="#55595c" rx="6"');
  if(lay.oven)s+=R(x+T,lay.oven.zb,w-2*T,lay.oven.zt-lay.oven.zb,'fill="#1E1F21"')+R(x+T+30,lay.oven.zt-90,w-2*T-60,16,'fill="#B8BDC1" rx="8"')+R(x+T+40,lay.oven.zb+60,w-2*T-80,lay.oven.zt-lay.oven.zb-200,'fill="#3A3D40" rx="10"');
  if(lay.dw)s+=R(x+8,z0+8,w-16,h-16,'fill="#C9CDD0" stroke="#9EA3A6" stroke-width="4"')+R(x+30,z1-70,w-60,18,'fill="#7E8487" rx="9"');
  if(lay.rack)lay.rack.forEach(z=>{for(let xx=x+T+30;xx<x+w-T-20;xx+=40)s+=L(xx,z,xx,z+120,'stroke="#A9AEB1" stroke-width="5"');s+=L(x+T+20,z,x+w-T-20,z,'stroke="#A9AEB1" stroke-width="8"')});
  if(lay.mirror)s+=R(x+T+40,lay.mirror.zb,w-2*T-80,lay.mirror.zt-lay.mirror.zb,'fill="#CFDADD" stroke="#B9C2C4" stroke-width="6"')+`<polygon points="${f(x+w*.35)},${f(-lay.mirror.zt)} ${f(x+w*.55)},${f(-lay.mirror.zt)} ${f(x+w*.3)},${f(-lay.mirror.zb)} ${f(x+w*.1)},${f(-lay.mirror.zb)}" fill="#fff" opacity=".35"/>`;
  s+=R(x,z0,T,h,`fill="${side}"`)+R(x+w-T,z0,T,h,`fill="${side}"`)+R(x,z1-T,w,T,`fill="${side}"`)+R(x,z0,w,T,`fill="${side}"`);
  return s}
function washerCust(m){const{x,w,z0,z1}=m,h=z1-z0,cx=x+w/2,r=Math.min(w,h)*.3,cz=z0+h*.42;
  return R(x,z0,w,h,'fill="#2B2D2F"')+R(x+6,z0,w-12,h-4,'fill="#F2F2F0" stroke="#C9C9C6" stroke-width="3" rx="10"')+R(x+16,z1-110,w-32,80,'fill="#E3E3E0" rx="6"')+R(cx+60,z1-90,80,30,'fill="#3A3D40" rx="6"')+
    `<circle cx="${f(cx)}" cy="${f(-cz)}" r="${f(r)}" fill="#9EA7AD" stroke="#D7DADB" stroke-width="18"/><circle cx="${f(cx)}" cy="${f(-cz)}" r="${f(r*.72)}" fill="#5E6A72" opacity=".75"/>`}
function handleCust(l,j,d){if(!d||d.kind!=='hinged')return'';if(l.nh)return'';const p=handlePlace(j,l),hcol=p.h.color||'#3A3A3A',top=l.zb+l.h;
  if(p.kind==='push')return'';
  if(p.kind==='groove'){const gz=p.side==='T'?top-22:l.zb;return R(l.x+6,gz,l.w-12,22,`fill="${shade(d.color,-.5)}" opacity=".75"`)}
  if(p.kind==='edge')return R(p.x1,p.bottom?p.ez-2:p.ez-16,p.x2-p.x1,18,`fill="${hcol}"`)+R(p.x1,p.bottom?p.ez-2:p.ez-16,p.x2-p.x1,4,'fill="#fff" opacity=".25"');
  if(p.kind==='knob')return`<circle cx="${f(p.cx)}" cy="${f(-p.cz)}" r="17" fill="${hcol}"/><circle cx="${f(p.cx-4)}" cy="${f(-p.cz-4)}" r="5" fill="#fff" opacity=".25"/>`;
  {const t=14,sh=R(p.vert?p.cx-t/2+4:p.cx-p.len/2+4,p.vert?p.cz-p.len/2-4:p.cz-t/2-4,p.vert?t:p.len,p.vert?p.len:t,'fill="#000" opacity=".12" rx="7"');
    return sh+(p.vert?R(p.cx-t/2,p.cz-p.len/2,t,p.len,`fill="${hcol}" rx="7"`):R(p.cx-p.len/2,p.cz-t/2,p.len,t,`fill="${hcol}" rx="7"`))}}
function fridgeSVG(cx,nn){const a=nn.a,fw=a.w,fh=a.h,col=FR_COL[job.fridge?.col||(nn.free?'wh':'bg')][1],ed=shade(col,-.25),gp='#3b3d40',x0=cx-fw/2,side=/양문/.test(a.name||a.tag||''),quad=fw>=800&&!side;let s=R(x0,0,fw,fh,`fill="${col}" stroke="${ed}" stroke-width="5" rx="8"`)+R(x0+20,0,fw-40,40,`fill="${gp}"`);
  if(side)s+=R(cx-3,40,6,fh-40,`fill="${gp}"`)+R(cx-34,800,14,fh-1300,`fill="${ed}" rx="7"`)+R(cx+20,800,14,fh-1300,`fill="${ed}" rx="7"`);
  else if(quad){const zm=Math.round(fh*.56);s+=R(x0,zm-3,fw,6,`fill="${gp}"`)+R(cx-3,40,6,fh-40,`fill="${gp}"`)+R(cx-30,zm+60,12,500,`fill="${ed}" rx="6"`)+R(cx+18,zm+60,12,500,`fill="${ed}" rx="6"`)+R(x0+60,zm-90,fw/2-120,12,`fill="${ed}" rx="6"`)+R(cx+60,zm-90,fw/2-120,12,`fill="${ed}" rx="6"`)}
  else s+=R(x0+fw-60,700,14,600,`fill="${ed}" rx="7"`);
  return s+R(x0+16,fh-160,40,140,'fill="#fff" opacity=".22" rx="8"')}
function leafCust(P,d,l,j){let s='';const glassy=['glass','satin','fluted'].includes(d.tex),base=d.color;
  if(l.kind==='slide'&&glassy){const fr=d.frame||shade(base,-.3);s+=R(l.x,l.zb,l.w,l.h,`fill="${fr}"`)+glassPane(P,d,l.x+26,l.zb+26,l.w-52,l.h-52);return s}
  if(l.glass){s+=R(l.x,l.zb,l.w,l.h,'fill="#2b2c2e"')+R(l.x+30,l.zb+30,l.w-60,l.h-60,'fill="#B7C7CC" fill-opacity=".38"')+R(l.x+30,l.zb+30,(l.w-60)*.3,l.h-60,'fill="#fff" fill-opacity=".12"');return s+handleCust(l,j,d)}
  s+=R(l.x,l.zb,l.w,l.h,`fill="${solidFill(P,d)}" stroke="${shade(base,-.3)}" stroke-width="5"`);
  if(l.kind==='slide'){const hx=l.layer?l.x+40:l.x+l.w-54;s+=R(hx,l.zb+l.h*.42,14,600,`fill="${shade(base,-.45)}" opacity=".7"`);return s}
  if(l.chan)s+=R(l.x-1.5,l.zb+l.h+1.5,l.w+3,33,'fill="#A9AEB2"')+R(l.x-1.5,l.zb+l.h+8,l.w+3,10,'fill="#5D6266" opacity=".7"');
  return s+handleCust(l,j,d)}

/* ---------- 정면에서 본 방향 (B면 좌우 반전 보정) ---------- */
function sceneSVG(j,{open=false,caption=true,px=1600,fi=j.fi,bare=false}={}){const g=gview(j,fi),fc_=j.faces[fi]||j.faces[0],d=doorById(j.doorId)||DEFAULT_DOORS[7],P='s'+uid(),W=g.Wm;
  const WH=g.island?1500:g.H,mx=Math.max(320,W*.16),topZ=WH+90,floor=230,cap=caption&&!bare?Math.round((W+g.ext+2*mx)*.13):0,vbX=-mx-g.side,vbW=W+g.ext+g.side+2*mx,vbY=-topZ,vbH=topZ+floor+cap;
  const body=d.kind==='none'?d.color:(j.bodyCol||'#ECE9E3'),bodyP={...d,kind:'hinged'};
  let defs=finishDefs(P,d)+
    (()=>{const tl=tileById(j.tile?.tileId)||DEFAULT_TILES[0],tw=tl.w,th=tl.h,br=tl.pattern==='brick';return`<pattern id="${P}-tile" patternUnits="userSpaceOnUse" width="${tw}" height="${th*2}" y="${-CTH}"><rect width="${tw}" height="${th*2}" fill="${tl.color}"/><path d="M0 0H${tw}M0 ${th}H${tw}M0 0V${th}M${br?tw/2:0} ${th}V${th*2}" stroke="${shade(tl.color,-.15)}" stroke-width="${Math.max(2,Math.min(tw,th)/30)}"/></pattern>`})()+
    `<linearGradient id="${P}-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DEDAD2"/><stop offset="1" stop-color="#D1CBC1"/></linearGradient>`+
    `<linearGradient id="${P}-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A9835A"/><stop offset="1" stop-color="#C39D73"/></linearGradient>`;
  {const cc=CCT[j.lt?.cct||'3000'][1];defs+=`<linearGradient id="${P}-glow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${cc}" stop-opacity=".75"/><stop offset="1" stop-color="${cc}" stop-opacity="0"/></linearGradient><linearGradient id="${P}-glowx" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${cc}" stop-opacity=".55"/><stop offset="1" stop-color="${cc}" stop-opacity="0"/></linearGradient>`}
  let bg=g.island?R(vbX,0,vbW,WH+90,'fill="#E9E5DF"'):R(vbX,0,vbW,g.H,`fill="url(#${P}-wall)"`)+R(vbX,g.H,vbW,90,'fill="#F5F4F1"')+L(vbX,g.H,vbX+vbW,g.H,'stroke="#D6D2CB" stroke-width="4"');
  bg+=R(vbX,-floor,vbW,floor,`fill="url(#${P}-floor)"`);for(let i=1;i<4;i++)bg+=L(vbX,-i*floor/4,vbX+vbW,-i*floor/4,'stroke="#8E6B46" stroke-width="2" opacity=".35"');
  for(let i=0;i<12;i++){const xx=vbX+((i*397)%Math.round(vbW));bg+=L(xx,-((i%4)*floor/4),xx,-((i%4)*floor/4)-floor/4,'stroke="#8E6B46" stroke-width="2" opacity=".3"')}
  if(!g.island)bg+=R(vbX,0,mx,70,'fill="#FAF9F7"')+R(W,0,mx,70,'fill="#FAF9F7"');
  bg+=R(-30,-14,W+60,14,'fill="#000" opacity=".16"')+(!isMD(g.cat)&&!g.island?R(W,0,40,g.H,'fill="#000" opacity=".07"')+R(-40,0,40,g.H,'fill="#000" opacity=".04"'):'');
  const off=obsOffset(g),issues=obstacleIssues(j).filter(x=>x.o.face===g.face);
  issues.filter(x=>x.ok).forEach(({o})=>{const c=OBS[o.type]||OBS.etc,x=o.x-off;bg+=R(x,o.z,o.w,o.h,`fill="${o.type==='window'?'#CFE0E6':'#F4F2EE'}" stroke="#9A958C" stroke-width="6" rx="8"`)+TX(x+o.w/2,o.z+o.h/2-30,c.label,Math.min(70,o.w/5),'fill="#6B665E" text-anchor="middle"')});
  let s='';const lv=leaves(g,d);
  if(isMD(g.cat)){const fc=d.color;s+=R(-70,0,W+140,g.Hm+70,`fill="${shade(fc,lum(fc)>.5?-.05:.05)}"`);
    if(!bare)s+=R(0,0,W,g.Hm,'fill="#F3F1EC"')+`<polygon points="0,0 ${f(W)},0 ${f(W*.8)},${f(-g.Hm*.3)} ${f(W*.2)},${f(-g.Hm*.3)}" fill="#D8CDBF" opacity=".55"/>`;
    s+=R(0,g.Hm-60,W,60,`fill="${fc}"`)+R(0,0,MFRAME,g.Hm-60,`fill="${fc}"`)+R(W-MFRAME,0,MFRAME,g.Hm-60,`fill="${fc}"`);
    if(g.cat==='storage'){const fr='#D8D6D1',sw=g.rows[0].mods.map((m,ii)=>m.t!=='mslide'?ii:-1).filter(x=>x>=0);s=s.replace(/fill="[^"]*"/,`fill="${shade('#cfcac2',0)}"`);s+=R(0,g.Hm-60,W,60,`fill="${fr}"`)+R(0,0,MFRAME,g.Hm-60,`fill="${fr}"`)+R(W-MFRAME,0,MFRAME,g.Hm-60,`fill="${fr}"`);
      midPanels(g).forEach((p,i)=>{const zb=10,hc=lum(fc)>.5?'#6b6b6b':'#E3DED4';s+=R(p.x,zb,p.w,p.h,`fill="${fc}" stroke="${shade(fc,-.18)}" stroke-width="3"`);
        if(p.t==='mlouver'){for(let yy=zb+70;yy<zb+p.h-60;yy+=45)s+=R(p.x+40,yy,p.w-80,14,`fill="${shade(fc,-.14)}"`)}
        if(p.t==='mcab')s+=R(p.x+18,zb+18,p.w-36,p.h-36,`fill="none" stroke="${shade(fc,-.08)}" stroke-width="3"`);
        if(p.t==='mslide')s+=R(i%2?p.x+40:p.x+p.w-56,1000-300,16,600,`fill="${hc}" rx="8"`);else{const si=sw.indexOf(i),left=sw.length===1?(g.rows[0].mods[i]?.hinge||'L')==='R':si>=sw.length/2;s+=p.t==='mcab'?R(left?p.x+40:p.x+p.w-56,1000-150,16,300,`fill="${hc}" rx="8"`):`<circle cx="${f(left?p.x+70:p.x+p.w-70)}" cy="${f(g.Hm-1000)}" r="0"/>`+R(left?p.x+45:p.x+p.w-75,1000,30,140,`fill="${hc}" rx="10"`)}})}
    else midPanels(g).forEach((p,i)=>{const zb=10;s+=R(p.x,zb,p.w,p.h,`fill="${fc}"`)+glassPane(P,d,p.x+28,zb+28,p.w-56,p.h-56);
      const hc=lum(fc)>.5?'#555':'#E3DED4';if(p.t==='mslide')s+=R(i%2?p.x+40:p.x+p.w-56,1000-300,16,600,`fill="${hc}" rx="8"`);if(p.t==='mswing')s+=R(i===0?p.x+p.w-70:p.x+40,1000,30,140,`fill="${hc}" rx="10"`)})}
  else{
    const front=d.kind==='none'?bodyP:d;
    if(g.cat==='kitchen'&&!g.island){const up=g.rows.find(r=>r.zone==='upper');bg+=R(0,CTH,W,(up?up.z0:g.Hm)-CTH,j.tile?.on?`fill="url(#${P}-tile)"`:'fill="#E4E0D9"');if(j.tile?.on&&j.tile.top==='ceiling'&&up)bg+=R(-g.sL,CTH,W+g.sL+g.sR,g.H-CTH,`fill="url(#${P}-tile)"`);if(up)up.mods.forEach(m=>{bg+=R(m.x,m.z0-120,m.w,120,'fill="#000" opacity=".06"');s+=R(m.x,m.z0-6,m.w,6,'fill="#FFF3CF" opacity=".9"')})}
    if(g.pl)s+=R(0,0,W,g.pl,`fill="${j.plCol==='door'?front.color:j.plCol||shade(front.color,-.42)}"`);
    if(!g.island){const ff=`fill="${solidFill(P,front)}" stroke="${shade(front.color,-.25)}" stroke-width="3"`;
      if(g.fin==='filler'){fillerZones(g).forEach(([a,b])=>{if(g.sL)s+=R(-g.sL,a,g.sL,b-a,ff);if(g.sR)s+=R(W,a,g.sR,b-a,ff)});s+=R(-g.sL,g.Hm,W+g.sL+g.sR,g.H-g.Hm,ff)}
      else{s+=R(-g.sL,0,g.sL,g.H,'fill="#000" opacity=".22"')+R(W,0,g.sR,g.H,'fill="#000" opacity=".22"')+(g.mold?R(0,g.Hm,W,g.moldShow,ff):R(0,g.Hm,W,g.H-g.Hm,'fill="#000" opacity=".18"'))}}
    const showInside=open||d.kind==='none'||['glass','satin','fluted'].includes(d.tex);
    g.rows.forEach(row=>rowAll(row).forEach(m=>{const lay=layout(m);if(lay.noBox)return;if(showInside||m.tall||m.glass||lay.washers||lay.openZ||!lay.zones.some(z=>z.kind==='door'||(z.kind==='panel'&&modApps(m).some(x=>x.a.panel))))s+=interiorCust(m,body,P,front,m.i+(row.zone==='upper'?5:0))}));
    if(j.lt?.show!==false){const cc=CCT[j.lt?.cct||'3000'][1],gl=`fill="url(#${P}-glow)"`,ok=t=>t;
      g.rows.forEach(row=>row.mods.forEach(m=>{const L_=(m.lights||[]).filter(t=>lightOpts(g.cat,row.zone,m).includes(t));if(!L_.length)return;const lay=layout(m),{x,w,z0,z1}=m,inside=showInside||!lay.zones.some(z=>z.kind==='door');
        if(L_.includes('under')){s+=R(x+10,z0-360,w-20,360,gl)+R(x+20,z0-6,w-40,6,`fill="${cc}"`)}
        if(!inside)return;
        if(L_.includes('shelf'))lay.shelves.forEach(z=>s+=R(x+T,z-T-220,w-2*T,220,gl)+R(x+T+10,z-T-6,w-2*T-20,6,`fill="${cc}"`));
        if(L_.includes('rod'))lay.rods.forEach(z=>s+=R(x+T,z-260,w-2*T,260,gl)+R(x+T,z-4,w-2*T,10,`fill="${cc}"`));
        if(L_.includes('vert'))s+=R(x+T,z0+T,90,z1-z0-2*T,`fill="url(#${P}-glowx)"`)+R(x+T,z0+T+30,8,z1-z0-2*T-60,`fill="${cc}"`)+`<g transform="translate(${f(2*x+w)},0) scale(-1,1)">${R(x+T,z0+T,90,z1-z0-2*T,`fill="url(#${P}-glowx)"`)+R(x+T,z0+T+30,8,z1-z0-2*T-60,`fill="${cc}"`)}</g>`;
        if(L_.includes('puck')){const n=Math.max(1,Math.round(w/450));for(let q=0;q<n;q++){const cx=x+w*(q+.5)/n;s+=`<polygon points="${f(cx-30)},${f(-(z1-T))} ${f(cx+30)},${f(-(z1-T))} ${f(cx+Math.min(w/n/2-10,220))},${f(-(z1-T-520))} ${f(cx-Math.min(w/n/2-10,220))},${f(-(z1-T-520))}" fill="url(#${P}-glow)"/>`+R(cx-30,z1-T-8,60,8,`fill="${cc}"`)}}}));
      if(j.lt?.plinth&&g.pl&&!g.island)s+=R(0,-70,W,70,gl)+R(0,0,W,4,`fill="${cc}"`)}
    if(open&&!bare)issues.filter(x=>!x.ok).forEach(({o})=>{const c=OBS[o.type]||OBS.etc,x=o.x-off;s+=R(x,o.z,o.w,o.h,`fill="${c.color}" fill-opacity=".18" stroke="${c.color}" stroke-width="8" stroke-dasharray="30 18"`)});
    {const ALT={};lv.filter(l=>open?l.kind==='drawer':true).forEach(l=>{const ld=leafDoor(j,l,front);if(!ld||ld===front||ld.id===front.id){s+=leafCust(P,front,l,j);return}if(!ALT[ld.id]){ALT[ld.id]=P+'a'+Object.keys(ALT).length;defs+=finishDefs(ALT[ld.id],ld)}s+=leafCust(ALT[ld.id],ld,l,j)})}
     if(j.swing&&!open)lv.filter(l=>l.kind==='door'&&l.hinge).forEach(l=>{s+=hingeMarks(l).replace(/class="hinge"/g,'fill="none" stroke="#3A4048" stroke-width="6" stroke-dasharray="44 28" opacity=".75"')});
    if(g.cat==='kitchen'&&(g.island||g.rows.some(r=>r.zone==='lower'))){const c=(g.island?islandCounter(j):counterById(j.counterId))||DEFAULT_COUNTERS[0],ov=g.island?g.side:15;s+=(g.island?[[-ov,W+ov]]:ctSegs(g,-ov,W+ov)).map(([a,b0])=>[a,b0-a]).map(([a,b])=>R(a,g.ct0,b,g.ct.thick,`fill="${c.color}" stroke="${shade(c.color,-.18)}" stroke-width="3"`)+R(a,844,b,6,'fill="#fff" opacity=".35"')).join('')+(g.lidW?L(g.lidW,g.ct0,g.lidW,CTH,`stroke="${shade(c.color,-.3)}" stroke-width="4"`):'')+(g.ct.back&&!g.island?R(0,CTH,W,g.ct.back,`fill="${shade(c.color,-.06)}"`):'')+ctSeams(g,'cust');
      if(g.tbl){const t=g.tbl;s+=R(t.x0,t.top-30,t.w,30,`fill="${c.color}" stroke="${shade(c.color,-.18)}" stroke-width="3"`)+R(t.x0,t.top-6,t.w,6,'fill="#fff" opacity=".35"')}
      s+=supElev(g,'cust',P,front,1);
      const lower=g.rows.find(r=>r.zone==='lower');lower?.mods.forEach(m=>{const cx=m.x+m.w/2;
        if(m.t==='sink')s+=`<path d="M${f(cx-30)} ${-CTH} V ${-CTH-280} Q ${f(cx-30)} ${-CTH-360} ${f(cx+50)} ${-CTH-360} Q ${f(cx+130)} ${-CTH-360} ${f(cx+130)} ${-CTH-280} V ${-CTH-240}" fill="none" stroke="#B8BDC1" stroke-width="22" stroke-linecap="round"/>`+R(cx-60,CTH,80,24,'fill="#B8BDC1" rx="6"');
        if(m.t==='cook'){const ck=modApps(m).find(x=>x.a.kind==='cooktop')?.a,cw=Math.min(ck?.w||580,m.w-20);if(ck||m.apps===undefined){s+=R(m.x+(m.w-cw)/2,CTH,cw,9,'fill="#1C1C1C"');if(ck?.fuel==='gas')[-.3,.3].forEach(p=>{const bx=m.x+m.w/2+cw*p;s+=R(bx-130,CTH+9,260,12,'fill="#1C1C1C"')+R(bx-130,CTH+9,12,34,'fill="#1C1C1C"')+R(bx+118,CTH+9,12,34,'fill="#1C1C1C"')+R(bx-45,CTH+9,90,18,'fill="#3A3B3D"')})}}});
      if(g.island&&j.island?.hoodId){const hd=appById(j.island.hoodId),ck=lower?.mods.find(m=>m.t==='cook');if(hd&&ck){const hc=(HOOD_COL[j.island.hcol]||HOOD_COL.st)[1],st=shade(hc,-.22),cx=ck.x+ck.w/2,zb=CTH+720,Ht=WH+60,r=(hd.dia||340)/2,hh=Math.min(+hd.h||750,Ht-zb);if(hd.sh==='sqc')s+=R(cx-110,zb+160,220,Ht-zb-160,`fill="${hc}" stroke="${st}" stroke-width="4"`)+R(cx-r,zb,2*r,160,`fill="${hc}" stroke="${st}" stroke-width="4"`);else s+=(zb+hh<Ht?L(cx,zb+hh,cx,Ht,'stroke="#9AA0A4" stroke-width="6"'):'')+R(cx-r,zb,2*r,hh,`fill="${hc}" stroke="${st}" stroke-width="4" rx="${hd.sh==='cyl'?r*.15:4}"`)+R(cx-r+20,zb+20,20,hh-40,'fill="#fff" opacity=".25"')}}
      const up=g.rows.find(r=>r.zone==='upper');up?.mods.filter(m=>m.t==='hood').forEach(m=>{const z0=m.z0,hd=modApps(m).find(x=>x.a.kind==='hood')?.a,k=hoodK(m),hc=hoodCol(m),st=shade(hc,-.22),cx=m.x+m.w/2,Ht=g.H||g.Hm;
        const hsh=m.hsh||hd?.sh||'pyr';if(k==='chimney'&&hsh==='slant'){const hw=Math.min(hd?.w||m.w,m.w+300),top=z0+Math.min(700,Math.max(450,hd?.h||600));s+=R(cx-140,top-40,280,Ht-top+40,`fill="${hc}" stroke="${st}" stroke-width="4"`)+R(cx-hw/2,z0,hw,top-z0,'fill="#1D1F22" opacity=".92" rx="6"')+`<polygon points="${f(cx-hw/2+30)},${f(-(top-30))} ${f(cx-hw/2+120)},${f(-(top-30))} ${f(cx-hw/2+60)},${f(-(z0+30))} ${f(cx-hw/2+30)},${f(-(z0+30))}" fill="#fff" opacity=".12"/>`}
        else if(k==='chimney'&&hsh==='tee'){const hw=Math.min(hd?.w||m.w,m.w+300);s+=R(cx-130,z0+45,260,Ht-z0-45,`fill="${hc}" stroke="${st}" stroke-width="4"`)+R(cx-hw/2,z0,hw,45,'fill="#1D1F22" rx="4"')}
        else if(k==='chimney'&&(hsh==='box'||hsh==='flat')){const hw=Math.min(hd?.w||m.w,m.w+300),bh=hsh==='box'?Math.min(320,hd?.h||300):60,dw_=hsh==='box'?300:280;s+=R(cx-dw_/2,z0+bh,dw_,Ht-z0-bh,`fill="${hc}" stroke="${st}" stroke-width="4"`)+R(cx-hw/2,z0,hw,bh,`fill="${shade(hc,-.06)}" stroke="${st}" stroke-width="4"`)+(hsh==='flat'?R(cx-hw/2+10,z0+60,hw-20,14,'fill="#2B2D30" opacity=".8"'):'')}
        else if(k==='chimney'){const hw=Math.min(hd?.w||m.w,m.w+300);s+=R(cx-160,z0+280,320,Ht-z0-280,`fill="${hc}" stroke="${st}" stroke-width="4"`)+`<polygon points="${f(cx-hw/2)},${f(-(z0+55))} ${f(cx+hw/2)},${f(-(z0+55))} ${f(cx+160)},${f(-(z0+280))} ${f(cx-160)},${f(-(z0+280))}" fill="${hc}" stroke="${st}" stroke-width="4"/>`+R(cx-hw/2,z0,hw,55,`fill="${shade(hc,-.08)}" stroke="${st}" stroke-width="4"`)}
        else if(k==='can'){const hh=layout(m).wideH||400;s+=R(m.x+2,z0,m.w-4,hh,`fill="${hc}" stroke="${st}" stroke-width="4" rx="4"`)+R(m.x+2,z0+8,m.w-4,62,`fill="${shade(hc,-.08)}"`)+R(cx-90,z0+22,180,30,'fill="#2B2D30" rx="4"')}
        else if(k==='wide'){const hh=layout(m).wideH||120,hw=Math.min(m.w-8,hd?.w||m.w);s+=R(cx-hw/2,z0,hw,hh,`fill="${hc}" stroke="${st}" stroke-width="4" rx="6"`)+R(cx-hw/2+26,z0+Math.min(22,hh*.2),hw-52,hh-2*Math.min(22,hh*.2),'fill="#2B2D30" opacity=".85" rx="4"')}
        else s+=R(m.x+3,z0-46,m.w-6,46,'fill="#B9BEC2"')})}}
  if(bare){const len=g.island?g.W:+fc_.len,Hh=g.H,pw=px,ph=Math.round(px*Hh/len);
    return{svg:`<svg xmlns="http://www.w3.org/2000/svg" width="${pw}" height="${ph}" viewBox="0 ${-Hh} ${len} ${Hh}" font-family="${FONT}"><defs>${defs}</defs><g transform="translate(${f(off)},0)">${s}</g></svg>`,w:pw,h:ph,len,H:Hh}}
  s=bg+s;
  if(caption){const q=quote(j),fs=vbW/52,y0=floor;s+=R(vbX,-(y0+cap),vbW,cap,'fill="#FFFFFF"')+L(vbX,-y0,vbX+vbW,-y0,'stroke="#E2E2E2" stroke-width="3"');
    const lx=vbX+fs*1.6;s+=`<g transform="translate(0,${f(y0)})">`+
      TX(lx,-(fs*2.1),catalog.company.name,fs*.8,'fill="#1E56D0" font-weight="600"')+
      TX(lx,-(fs*3.7),`${j.customer.name||'고객님'} · ${CATS[j.cat].name}${j.faces.length>1?' '+FACE_NAME(g.face):''} 제안`,fs*1.25,'fill="#182024" font-weight="700"')+
      TX(lx,-(fs*5.2),`${LAYOUTS[j.layout]} · ${planById(fc_.planId)?.name||'맞춤 구성'} · ${d.name} · ${g.Wm}×${g.Hm}×${g.Dm}mm`,fs*.8,'fill="#5B686D"')+
      TX(vbX+vbW-fs*1.6,-(fs*2.1),'예상 금액 (VAT 포함)',fs*.75,'fill="#5B686D" text-anchor="end"')+
      TX(vbX+vbW-fs*1.6,-(fs*3.9),`${won(q.total)}원`,fs*1.45,'fill="#182024" font-weight="700" text-anchor="end"')+
      TX(vbX+vbW-fs*1.6,-(fs*5.2),'실측 후 최종 확정 · 이미지는 참고용',fs*.65,'fill="#8A9599" text-anchor="end"')+'</g>'}
  const hpx=Math.round(px*vbH/vbW);
  return`<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${hpx}" viewBox="${f(vbX)} ${f(vbY)} ${f(vbW)} ${f(vbH)}" font-family="${FONT}"><defs>${defs}</defs>${s}</svg>`}
/* ---------- 이동 중 치수 표시 ---------- */
function dimL(x1,y1,x2,y2,txt,k,col='#E8590C',side=1){const L=Math.hypot(x2-x1,y2-y1);if(L<1)return'';const ux=(x2-x1)/L,uy=(y2-y1)/L,nx=-uy*side,ny=ux*side,t=7*k,mx=(x1+x2)/2+nx*14*k,my=(y1+y2)/2+ny*14*k,ang=Math.atan2(uy,ux)*180/Math.PI,a2=ang>90||ang<-90?ang+180:ang;
  return`<g pointer-events="none"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${1.6*k}"/><line x1="${x1-nx*t}" y1="${y1-ny*t}" x2="${x1+nx*t}" y2="${y1+ny*t}" stroke="${col}" stroke-width="${1.6*k}"/><line x1="${x2-nx*t}" y1="${y2-ny*t}" x2="${x2+nx*t}" y2="${y2+ny*t}" stroke="${col}" stroke-width="${1.6*k}"/><text x="${mx}" y="${my}" font-size="${13*k}" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="${col}" stroke="#fff" stroke-width="${4*k}" paint-order="stroke" font-family="IBM Plex Mono,monospace" transform="rotate(${a2} ${mx} ${my})">${txt}</text></g>`}
function obsDims(o,nx,nz,k,j=job){const fi=j.faces.findIndex(f=>f.key===o.face);if(fi<0)return'';const g=gview(j,fi),off=obsOffset(g),L=+j.faces[fi].len||0,x0=nx-off,x1=x0+o.w,yc=-(nz+o.h/2);let s='';
  s+=dimL(-off,yc,x0,yc,`${Math.round(nx)}`,k,'#E8590C',-1)+dimL(x1,yc,L-off,yc,`${Math.round(L-nx-o.w)}`,k,'#E8590C',-1);if(nz>0)s+=dimL(x0+o.w/2,0,x0+o.w/2,-nz,`${Math.round(nz)}`,k,'#E8590C',1);
  const bs=[...new Set(g.rows.filter(r=>r.z0<nz+o.h&&r.z1>nz).flatMap(r=>r.mods.flatMap(m=>[m.x,m.x+m.w])))].sort((a,b)=>a-b),lb=bs.filter(b=>b<=x0+.5).pop(),rb=bs.find(b=>b>=x1-.5),cross=bs.filter(b=>b>x0+.5&&b<x1-.5);
  const yb=-(nz+o.h)-26*k;if(lb!=null&&x0-lb<1500)s+=dimL(lb,yb,x0,yb,`칸 ${Math.round(x0-lb)}`,k,'#2F6BFF',1);if(rb!=null&&rb-x1<1500)s+=dimL(x1,yb,rb,yb,`칸 ${Math.round(rb-x1)}`,k,'#2F6BFF',1);
  cross.forEach(b=>s+=`<line x1="${b}" y1="${-nz}" x2="${b}" y2="${-(nz+o.h)}" stroke="#E5484D" stroke-width="${3*k}" pointer-events="none"/>`);return s}
function obsTech(g,k,j=job,live=false){let s='';const off=obsOffset(g);obstacleIssues(j).filter(x=>x.o.face===g.face).forEach(({o,ok})=>{const c=OBS[o.type]||OBS.etc,x=o.x-off;let t='';
  t+=R(x,o.z,o.w,o.h,`fill="${c.color}" fill-opacity="${ok?.06:.16}" stroke="${c.color}" stroke-width="${live?(job.obsSel===o.id?4:2.4):1.6}" stroke-dasharray="6 4" vector-effect="non-scaling-stroke"`);
  t+=TX(x+o.w/2,o.z+o.h+6*k,`${obsName(o)}${ok?'':' · 걸림'}${live?' ⇔':''}`,Math.max(8*k,Math.min(10*k,o.w/4)),`fill="${c.color}" text-anchor="middle" font-weight="600" data-obslbl="1"`);
  if(live)t+=R(x-20*k,o.z-20*k,o.w+40*k,o.h+60*k,`fill="transparent" data-drag="obs" data-id="${o.id}" style="cursor:move;touch-action:none"`);
  s+=live?`<g data-obsg="${o.id}">${t}</g>`:t;if(live&&j.obsSel===o.id)s+=`<g id="obsDimG">${obsDims(o,o.x,o.z,k*1.6,j)}</g>`});return s}
function swatchSVG(d){const P='w'+uid();let s='';
  if(d.kind==='frame')s=`<rect x="6" y="4" width="48" height="92" fill="${d.color}"/>`+`<g transform="translate(0,100)">${glassPane(P,d,12,10,36,80)}</g>`;
  else if(d.kind==='none')s=`<rect x="6" y="4" width="48" height="92" fill="${solidFill(P,d)}"/><rect x="10" y="8" width="40" height="84" fill="${shade(d.color,-.1)}"/><rect x="10" y="38" width="40" height="5" fill="${d.color}"/><rect x="10" y="64" width="40" height="5" fill="${d.color}"/>`;
  else{s=`<rect x="6" y="4" width="48" height="92" rx="1.5" fill="${['glass','satin','fluted'].includes(d.tex)?(d.frame||shade(d.color,-.3)):solidFill(P,d)}" stroke="${shade(d.color,-.3)}" stroke-width=".8"/>`;
    if(['glass','satin','fluted'].includes(d.tex))s+=`<g transform="translate(0,100)">${glassPane(P,d,10,8,40,84)}</g>`;
    else s+=`<rect x="${d.kind==='sliding'?10:44}" y="40" width="3" height="22" rx="1.5" fill="${lum(d.color)>.55?'#555':'#DDD7CC'}"/>`}
  return`<svg viewBox="0 0 60 100" aria-hidden="true"><defs>${finishDefs(P,d,.05)}</defs>${s}</svg>`}

