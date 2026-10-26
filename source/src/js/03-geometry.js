/* ---------- geometry ---------- */
function allocW(mods,span){const fx=mods.map(m=>m.fix?Math.max(150,Math.round((+m.r||0)/5)*5):0),F=fx.reduce((a,b)=>a+b,0),fl=mods.map((m,i)=>i).filter(i=>!mods[i].fix);
  if(fl.length&&span-F>=150*fl.length){const rr=fl.map(i=>+mods[i].r||1),fw=splitWidths(rr,span-F),ws=fx.slice();fl.forEach((i,k)=>ws[i]=fw[k]);return{ws,gap:0,over:0,lo:floorLeft(rr,span-F)}}
  if(!fl.length&&F<=span)return{ws:fx,gap:span-F,over:0};
  return{ws:splitWidths(mods.map(m=>+m.r||1),span),gap:0,over:F+150*fl.length-span}}
const floorLeft=(rs,total)=>{const s=rs.reduce((a,b)=>a+b,0)||1,u=Math.floor(total/5);return 5*(u-rs.reduce((a,r)=>a+Math.floor(u*r/s),0))};
function splitWidths(rs,total){const s=rs.reduce((a,b)=>a+b,0)||1;let acc=0;const u=Math.floor(total/5),base=rs.map(r=>u*r/s),fl=base.map(Math.floor);let left=u-fl.reduce((a,b)=>a+b,0);base.map((b,i)=>[b-fl[i],i]).sort((a,b)=>b[0]-a[0]).forEach(([_,i])=>{if(left>0){fl[i]++;left--}});const extra=total-u*5;return fl.map((q,i)=>q*5+(i===rs.length-1?extra:0))}
const DOOR_T=20;
const LT={shelf:{label:'선반 LED',unit:'m',wpm:10,pk:'ltShelf'},rod:{label:'행거봉 LED',unit:'m',wpm:8,pk:'ltRod'},vert:{label:'측면 세로 LED',unit:'m',wpm:10,pk:'ltVert'},puck:{label:'천판 다운라이트',unit:'개',w:3,pk:'ltPuck'},under:{label:'상부장 하부 간접등',unit:'m',wpm:12,pk:'ltUnder'},plinth:{label:'걸레받이 간접등',unit:'m',wpm:8,pk:'ltPlinth'}};
const CTRL={door:'문 열림 센서',pir:'인체 감지 센서',touch:'터치 스위치',wall:'벽 스위치 연동'};
const CCT={'3000':['전구색 3000K','#FFC978'],'4000':['주백색 4000K','#FFE6B8'],'6500':['주광색 6500K','#DCEBFF']};
function lightOpts(cat,zone,m){if(isMD(cat)||m.filler||m.blind||m.corner)return[];const lay=layout(m),o=[];
  if(cat==='kitchen'){if(zone==='upper'){if(m.t!=='hood')o.push('under');if(lay.shelves.length)o.push('shelf')}return o}
  if(lay.rods.length)o.push('rod');if(lay.shelves.length)o.push('shelf');o.push('vert','puck');return o}
function lightRec(cat,zone,m){const o=lightOpts(cat,zone,m);if(cat==='kitchen')return o.filter(t=>t==='under');if(o.includes('rod'))return['rod'];if(m.t==='vanity')return['vert','shelf'].filter(t=>o.includes(t));return o.includes('shelf')?['shelf']:[]}
function lightRuns(j=job){const out=[];if(isMD(j.cat))return out;
  j.faces.forEach((f,fi)=>{const g=geom(j,fi);g.rows.forEach(row=>row.mods.forEach((m,i)=>{const ok=lightOpts(g.cat,row.zone,m);(m.lights||[]).filter(t=>ok.includes(t)).forEach(t=>{const lay=layout(m),where=`${FACE_NAME(g.face)} ${row.zone==='upper'?'상부 ':row.zone==='top'?'위 칸 ':row.zone==='lower'?'하부 ':''}${i+1}번째 칸`;
      if(t==='shelf'&&lay.shelves.length)out.push({t,g,m,row,where,len:m.w-2*T-20,qty:lay.shelves.length});
      if(t==='rod'&&lay.rods.length)out.push({t,g,m,row,where,len:m.w-2*T,qty:lay.rods.length});
      if(t==='vert')out.push({t,g,m,row,where,len:m.z1-m.z0-2*T-60,qty:2});
      if(t==='puck')out.push({t,g,m,row,where,len:0,qty:Math.max(1,Math.round(m.w/450))});
      if(t==='under')out.push({t,g,m,row,where,len:m.w-20,qty:1})})}));
    if(j.lt?.plinth&&!g.island&&g.pl)out.push({t:'plinth',g,m:null,row:null,where:`${FACE_NAME(g.face)} 걸레받이`,len:g.Wm,qty:1})});
  return out}
function lightPlan(j=job){const runs=lightRuns(j),P=catalog.prices;let W=0;const byT={};
  runs.forEach(r=>{const L_=LT[r.t],w=L_.unit==='m'?r.len/1000*r.qty*L_.wpm:r.qty*L_.w;W+=w;const b=byT[r.t]=byT[r.t]||{m:0,n:0};if(L_.unit==='m')b.m+=r.len/1000*r.qty;else b.n+=r.qty});
  const mods=new Set(runs.filter(r=>r.m).map(r=>r.g.face+'|'+r.row.zone+'|'+r.m.i)),need=W*1.25,psu=[];let left=need;while(left>150){psu.push(150);left-=150}if(left>0)psu.push(left<=60?60:left<=100?100:150);
  const ctrl=j.lt?.ctrl||'door',inner=runs.filter(r=>r.m&&r.t!=='under'),innerMods=new Set(inner.map(r=>r.g.face+'|'+r.row.zone+'|'+r.m.i)),extFaces=new Set(runs.filter(r=>r.t==='under'||r.t==='plinth').map(r=>r.g.face)),allFaces=new Set(runs.map(r=>r.g.face));let sens=0,touch=0;
  if(ctrl==='door'){const door=doorById(j.doorId);let dl=0,withDoor=new Set();j.faces.forEach((f,fi)=>{const g=geom(j,fi);leaves(g,door).filter(l=>l.kind==='door').forEach(l=>{const k=g.face+'|'+l.zone+'|'+l.mi;if(innerMods.has(k)){dl++;withDoor.add(k)}})});sens=dl;touch=(innerMods.size-withDoor.size>0?1:0)+extFaces.size}
  if(ctrl==='pir')sens=allFaces.size;if(ctrl==='touch')touch=allFaces.size;
  return{runs,W:Math.round(W),psu:runs.length?psu:[],mods:mods.size,byT,sens,touch,ctrl,cct:j.lt?.cct||'3000'}}
const lightOn=j=>lightRuns(j).length>0;
const handleById=id=>(catalog.handles||[]).find(h=>h.id===id);
const NOH={id:'',name:'-',type:'push',proj:0,price:0,len:0,cc:0};
const usedHandleIds=j=>{const hs=j.hs||{},ids=new Set([hs.upper,hs.lower,hs.full,hs.drawer]);(j.faces||[]).forEach(f=>(f.rows||[]).forEach(r=>r.mods.forEach(m=>{if(m.handleId)ids.add(m.handleId)})));return[...ids].filter(Boolean)};
const hProj=j=>{if((doorById(j.doorId)?.kind)!=='hinged')return 0;return Math.max(0,...usedHandleIds(j).map(id=>+handleById(id)?.proj||0))};
function leafHandle(j,l){const hs=j.hs||{};const id=l.mh||(l.kind==='door'?(hs[l.zone]||hs.lower):(hs.drawer||hs.lower));let h=handleById(id)||NOH;
  if(hs.auto&&!l.mh&&h.type==='bar'){const fam=(catalog.handles||[]).filter(x=>x.type==='bar'&&x.fam===h.fam).sort((a,b)=>a.len-b.len);
    if(fam.length>1){if(l.kind!=='door'){const tgt=l.w*.42,ok=fam.filter(x=>x.len<=l.w-120);h=(ok.length?ok:[fam[0]]).reduce((a,b)=>Math.abs(b.len-tgt)<Math.abs(a.len-tgt)?b:a)}
      else if(h.len>l.h-2*(+hs.inset||40)){const ok=fam.filter(x=>x.len<=l.h-2*(+hs.inset||40));if(ok.length)h=ok[ok.length-1]}}}
  return h}
function handlePlace(j,l){const h=leafHandle(j,l);if(l.nh)return{h,kind:'none',holes:[],len:0};if(l.tall&&l.kind==='door'&&l.hinge!=='U'){const tp_=l.zb+l.h;l={...l,zone:l.zb>=900?'upper':tp_>1500?'full':'lower'}}const hs=j.hs||{},ins=Math.max(15,+hs.inset||40),top=l.zb+l.h,dr=l.kind!=='door',up=l.zone==='upper'||l.zone==='top';
  if(l.hinge==='U'){const cx=l.x+l.w/2;if(h.type==='push')return{h,kind:'push',holes:[],px:cx,pz:l.zb+60};if(h.type==='groove')return{h,kind:'groove',holes:[],gz:l.zb,side:'B'};if(h.type==='edge'){const len=Math.min(h.len,l.w-2*ins),cc=Math.min(h.cc||len-40,len-20);return{h,kind:'edge',holes:[[cx-cc/2,l.zb+15],[cx+cc/2,l.zb+15]],x1:cx-len/2,x2:cx+len/2,ez:l.zb,bottom:true,len,over:h.len>l.w-2*ins}}
    const len=h.type==='knob'?0:Math.min(h.len,Math.max(40,l.w-2*ins)),cc=h.type==='knob'?0:Math.min(h.cc||len,Math.max(0,len-20)),cz=l.zb+ins;return{h,kind:h.type,cx,cz,vert:false,len,cc,holes:h.type==='knob'?[[cx,cz]]:[[cx-cc/2,cz],[cx+cc/2,cz]],over:h.type==='bar'&&h.len>l.w-2*ins}}
  const far=l.hinge==='L'?'R':'L',edgeX=far==='R'?l.x+l.w:l.x;
  if(h.type==='push'){const px=dr?l.x+l.w/2:(far==='R'?l.x+l.w-60:l.x+60),pz=dr?l.zb+l.h/2:(up?l.zb+60:l.zone==='lower'?top-60:clamp(1050,l.zb+100,top-100));return{h,kind:'push',holes:[],px,pz}}
  if(h.type==='groove')return{h,kind:'groove',holes:[],gz:(up&&!dr)?l.zb:top,side:(up&&!dr)?'B':'T'};
  if(h.type==='edge'){const len=Math.min(h.len,l.w-2*ins),cx=dr?l.x+l.w/2:(far==='R'?l.x+l.w-ins-len/2:l.x+ins+len/2),ez=(up&&!dr)?l.zb:top,cc=Math.min(h.cc||len-40,len-20);
    return{h,kind:'edge',holes:[[cx-cc/2,ez+((up&&!dr)?15:-15)],[cx+cc/2,ez+((up&&!dr)?15:-15)]],x1:cx-len/2,x2:cx+len/2,ez,bottom:up&&!dr,len,over:h.len>l.w-2*ins}}
  const vert=!dr&&hs.dir!=='h',room=(vert?l.h:l.w)-2*ins,len=h.type==='knob'?0:Math.min(h.len,Math.max(40,room)),cc=h.type==='knob'?0:Math.min(h.cc||len,Math.max(0,len-20));let cx,cz;
  if(dr){cx=l.x+l.w/2;cz=hs.dz==='center'?l.zb+l.h/2:top-Math.min(l.h/2,ins+5)}
  else if(vert){cx=far==='R'?l.x+l.w-ins:l.x+ins;cz=up?l.zb+ins+len/2:l.zone==='lower'?top-ins-len/2:clamp(1050,l.zb+ins+len/2,top-ins-len/2)}
  else{cx=far==='R'?l.x+l.w-ins-len/2:l.x+ins+len/2;cz=up?l.zb+ins:l.zone==='lower'?top-ins:clamp(1050,l.zb+ins,top-ins)}
  const holes=h.type==='knob'?[[cx,cz]]:vert?[[cx,cz-cc/2],[cx,cz+cc/2]]:[[cx-cc/2,cz],[cx+cc/2,cz]];
  return{h,kind:h.type,cx,cz,vert,len,cc,holes,over:h.type==='bar'&&h.len>room}}
function handleSummary(j){const hs=j.hs||{},nm=id=>handleById(id)?.name||'-';const k=j.cat==='kitchen';const parts=k?[`상부 ${nm(hs.upper)}`,`하부 ${nm(hs.lower)}`,`서랍 ${nm(hs.drawer)}${hs.auto?' (폭 맞춤)':''}`]:[`문 ${nm(hs.full)}`,`서랍 ${nm(hs.drawer)}`];return parts.join(' · ')}
function techHandle(j,l,k){if(!j||!['door','drawer','panel'].includes(l.kind))return'';const p=handlePlace(j,l);let s='';
  if(p.kind==='bar'){const t=10;s+=p.vert?Rc(p.cx-t/2,p.cz-p.len/2,t,p.len,'ln'):Rc(p.cx-p.len/2,p.cz-t/2,p.len,t,'ln')}
  if(p.kind==='knob')s+=`<circle class="ln" cx="${f(p.cx)}" cy="${f(-p.cz)}" r="14"/>`;
  if(p.kind==='edge')s+=Rc(p.x1,p.bottom?p.ez:p.ez-12,p.x2-p.x1,12,'ln');
  if(p.kind==='groove')s+=Rc(l.x+4,p.side==='T'?p.gz-22:p.gz,l.w-8,22,'dash');
  if(p.kind==='push')s+=`<circle class="dash" cx="${f(p.px)}" cy="${f(-p.pz)}" r="12"/>`;
  p.holes.forEach(([x,z])=>s+=Lc(x-6,z,x+6,z,'thin')+Lc(x,z-6,x,z+6,'thin'));return s}
const cNeed=j=>Math.max(30,Math.ceil((hProj(j)+15)/10)*10);
const cFill=j=>{const v=j.corner?.fill;return v==null||v===''?cNeed(j):Math.max(0,+v||0)};
const innerDrawer=m=>m.t==='drawer';
const wallNeed=(j,m)=>(hProj(j)?hProj(j)+5:0)+(innerDrawer(m)?DOOR_T:0);
const r10=v=>Math.ceil(v/10)*10;
function hingeSolve(j,f,ctx,row){row.hinge=[];row.clash=[];row.b2b=0;if(isMD(ctx.cat))return;const door=doorById(j.doorId),hinged=door?.kind==='hinged',proj=hProj(j),ms=row.mods,n=ms.length;if(!n)return;
  const info=ms.map(m=>{const lz=layout(m).zones,d=!m.filler&&!m.flap&&lz.some(z=>z.kind==='door');return{door:hinged&&d,dbl:hinged&&d&&m.w>650,drw:!m.filler&&(lz.some(z=>z.kind==='drawer')||m.t==='dw'||m.t==='oven'),pro:m.t==='hood'&&modApps(m).some(x=>x.a.style==='chimney'),fill:!!m.filler}});
  const corner=isCornerLay(j)&&!ctx.isl&&!isTallWall(j,f),edgeL=ctx.isl||ctx.ep?.L?'open':corner?(tallOn(j)&&f.key==='A'?'wall':'corner'):'wall',edgeR=ctx.isl||ctx.ep?.R?'open':(corner&&f.key==='A'&&j.layout==='U')?'corner':'wall';
  const zt=corner?cType(j,row.zone):null,blind=zt==='blind'||zt==='magic',cf=blind?cFill(j):0,sp=f.sp||{},gapL=ctx.sL+(+sp[row.zone+':L']||0),gapR=ctx.sR+(+sp[row.zone+':R']||0),fillW=r10(DOOR_T+proj+10);
  const zm=(row.z0+row.z1)/2,where=i=>`${FACE_NAME(f.key)} ${row.zone==='upper'?'상부 ':row.zone==='top'?'위 칸 ':row.zone==='lower'?'하부 ':''}${i+1}번째 칸`;
  const edgeCost=(i,side,st)=>{const at=side==='L'?(st==='L'||st==='D'):(st==='R'||st==='D');if(!at)return null;const e=side==='L'?edgeL:edgeR,m=ms[i],x=side==='L'?m.x:m.x+m.w;
    if(e==='wall'){const gp=side==='L'?gapL:gapR,nd=wallNeed(j,m);if(gp<nd){const w=r10(nd-gp);return{c:.2,lvl:'warn',msg:`${where(i)}: 벽 쪽 경첩(손잡이는 벽 반대쪽) · 문을 끝까지 열면 ${proj?'손잡이·':''}문이 벽에 닿을 수 있어요${innerDrawer(m)?' (내부서랍도 덜 나옴)':''} · 벽 틈 ${gp} / 권장 ${nd}mm`,fix:{k:'spacer',fi:ctx.fi,zone:row.zone,side,w},fixLabel:`벽쪽 스페이서 ${w}mm`,x,z:zm}}return null}
    if(e==='corner'){if(blind){const nd=DOOR_T+2*proj+10;return cf<nd?{c:100,lvl:'bad',msg:`${where(i)}: 코너 쪽 경첩이라 문을 열면 맞은편 면 장${proj?' 손잡이':''}에 부딪힙니다 · 코너 휠라 ${cf} / 필요 ${nd}mm`,fix:{k:'cfill',v:nd},fixLabel:`코너 휠라 ${nd}mm`,x,z:zm}:null}return{c:3,lvl:'',x,z:zm}}
    return null};
  const pairCost=(i,a,b)=>{const A=info[i],B=info[i+1];if(A.fill||B.fill)return null;const hR=a==='R'||a==='D',hL=b==='L'||b==='D',x=ms[i].x+ms[i].w;const fx={k:'insFill',fi:ctx.fi,ri:row.rix,at:i+1,w:fillW};
    if((hR&&B.pro)||(hL&&A.pro))return{c:100,lvl:'bad',msg:`${where(hR&&B.pro?i:i+1)}: 경첩이 침니 후드 쪽이라 문이 후드에 부딪힙니다`,fix:fx,fixLabel:`사이에 휠라 ${fillW}mm`,x,z:zm};
    if((hR&&B.drw)||(hL&&A.drw)){const di=hR&&B.drw?i+1:i;return{c:20,lvl:'warn',msg:`${where(di===i?i+1:i)} 문을 열어 두면 옆 칸(${TYPES[ms[di].t].label})이 안 열립니다 (열린 문이 서랍 앞을 막음)`,fix:fx,fixLabel:`사이에 휠라 ${fillW}mm`,x,z:zm}}
    if(hR&&hL)return{c:proj?.5:0,lvl:'b2b',x,z:zm};return null};
  const sgl=info.map((I,i)=>I.door&&!I.dbl?i:-1).filter(i=>i>=0);const st=i=>{const I=info[i];if(!I.door)return['N'];if(I.dbl)return['D'];const ov=ms[i].hinge;return ov==='L'||ov==='R'?[ov]:['L','R']};
  const un=(i,s_)=>{let c=0;if((s_==='L'||s_==='R')&&!ms[i].hinge){if(i===0&&(edgeL==='wall'||edgeL==='open')&&s_!=='L')c+=2;if(i===n-1&&(edgeR==='wall'||edgeR==='open')&&s_!=='R')c+=2}if(i===0){const e=edgeCost(0,'L',s_);if(e)c+=e.c}if(i===n-1){const e=edgeCost(n-1,'R',s_);if(e)c+=e.c}if(s_==='L'||s_==='R'){const k=sgl.indexOf(i),m_=sgl.length;let want;if(k<0)want=(i%2===0)?'L':'R';else if(k===0)want='L';else if(k===m_-1)want='R';else want=k<m_/2?(k%2?'R':'L'):((m_-1-k)%2?'L':'R');c+=s_===want?0:(k===0||k===m_-1?.3:.05)}return c};
  let best=st(0).map(s_=>({s:s_,c:un(0,s_),p:[s_]}));
  for(let i=1;i<n;i++)best=st(i).map(s_=>{let bb=null;best.forEach(q=>{const pc=pairCost(i-1,q.s,s_),c=q.c+(pc?pc.c:0)+un(i,s_);if(!bb||c<bb.c)bb={s:s_,c,p:[...q.p,s_]}});return bb});
  const path=best.reduce((a,b)=>b.c<a.c?b:a).p;row.hinge=path;
  {const e=edgeCost(0,'L',path[0]);if(e&&e.lvl)row.clash.push(e)}{const e=edgeCost(n-1,'R',path[n-1]);if(e&&e.lvl)row.clash.push(e)}
  for(let i=0;i<n-1;i++){const pc=pairCost(i,path[i],path[i+1]);if(!pc)continue;if(pc.lvl==='b2b')row.b2b++;else row.clash.push(pc)}}
function upperH(Hm){return clamp(Hm-1450,500,900)}
function geom(j=job,fi=j.fi||0,rowsOverride,adjL=0){const cat=j.cat,c=CATS[cat],P=catalog.prices,f=j.faces[fi]||j.faces[0],isl=f.key==='I';
  const cut=cornerCut(j,f),fin=j.finish||'full';let sL,sR,top;
  if(isl||cat==='single'){sL=sR=top=0}else if(isMD(cat)){sL=sR=5;top=10}else if(fin==='filler'){sL=sR=Math.max(+P.fillerW||0,+f.fw||0);top=+P.moldingH||0}else{sL=sR=(+P.fullSide||0)/2;top=+P.fullTop||0}
  const mold=cat==='kitchen'&&!isl&&fin!=='filler'&&(+RULES.moldH||0)>0?+RULES.moldH:0;if(mold)top=mold;
  if(cut>0)sL=0;
  /* 한쪽만 벽: 트인 쪽(마감판 켬)은 휠라 없이 마감판(EP) 두께만 · ㄱ자 뒷선반: A면 코너 쪽 벽 휠라 → 코너 휠라 */
  const cSd=sd=>isCornerLay(j)&&(sd==='L'||(f.key==='A'&&j.layout==='U')),ep={L:false,R:false};
  if(!isl&&!isMD(cat)&&cat!=='single')['L','R'].forEach(sd=>{if(!cSd(sd)&&(f.ends||{})[sd]==='panel'){ep[sd]=true;if(sd==='L')sL=RULES.epT;else sR=RULES.epT}});
  const shelfC=cat==='kitchen'&&!isl&&['L','Lisland'].includes(j.layout)&&f.key==='A'&&bgOf(j)>0&&bgUse(j)==='shelf';let shelfCF=0,bSlack=0;if(shelfC){shelfCF=sL;sL=0}
  const cA=isCornerLay(j)&&f.key==='A'&&j.layout!=='U';let sL0=sL,sR0=sR,rem5=0;
  const slack=v=>{if(ep.L&&ep.R){const a=Math.floor(v/2);sL+=a;sR+=v-a}else if(ep.R){if(shelfC)shelfCF+=v;else if(cut>0)bSlack+=v;else if(cA)shelfCF+=v;else sL+=v}else if(ep.L||cut>0||cA)sR+=v;else{const a=Math.floor(v/2);sL+=a;sR+=v-a}};
  {const W0=Math.max(300,(+f.len||c.W)-cut),r=Math.round(((W0-sL-sR)%5+5)%5*10)/10;if(r&&isl){rem5=r;sL+=r/2;sR+=r/2}else if(r&&!isMD(cat)){rem5=r;slack(r)}}if(adjL){rem5+=adjL;slack(adjL)}const clr=sL+sR;
  const ctc=cat==='kitchen'?(isl?islandCounter(j):counterById(j.counterId)):null,ct=cat==='kitchen'?ctSpecJ(j,ctc):ctSpec(ctc),KH=cat==='kitchen'?kitchenH(j):null;let ct0;if(KH){ct0=KH.leg+KH.B;CTH=ct0+ct.thick}else{CTH=850;ct0=CTH-30}
  const H=isl?CTH:(+j.dims.H||c.H),D=isl?(+j.island.cab||600)+(+j.island.over||0):(cat==='kitchen'?kD(j):(+j.dims.D||c.D)),W=Math.max(300,(+f.len||c.W)-cut),pl=isMD(cat)?0:plinthOf(j);
  if(mold){const want=+j.cabH||+RULES.cabH||0;top=want>0?Math.max(mold,H-want):mold}
  const Wm=W-clr,Hm=H-top,Dm=isMD(cat)?D:isl?Math.max(300,+j.island.cab||600):Math.max(200,D-10);const side=isl?(+j.island.side||0)+rem5/2:0;
  const TB=j.table;let tbl=null;if(cat==='kitchen'&&TB?.on&&TB.face===f.key){const perp=TB.dir==='perp';tbl={dir:TB.dir,len:+TB.len||1000,depth:+TB.depth||700,top:TB.h==='low'?750:CTH,sup:supportById(TB.support),x0:perp?W-clr-(+TB.depth||700):W-clr+side,w:perp?(+TB.depth||700):(+TB.len||1000)}}
  let src=rowsOverride||f.rows;if(isl||(penOn(j)&&f.key==='B'))src=src.filter(r=>r.zone!=='upper');
  const tH=src.some(r=>r.zone==='top')?clamp(+f.topH||400,200,900):0,tD=+f.topD||450;
  const rows=src.map(row0=>{const row=epGapRow(row0);let z0,z1;const zc=row.zone==='top'?(cat==='kitchen'?'upper':'full'):row.zone;
    if(row.zone==='top'){z1=Hm;z0=Hm-tH}else if(row.zone==='lower'){z0=pl;z1=ct0}else if(row.zone==='upper'){z1=Hm-tH;z0=Hm-(KH&&KH.uni?KH.B:upperH(Hm))}else{z0=pl;z1=Hm-tH}
    let off=0,lc=0,rc=0;const corners=[];
    if(isCornerLay(j)&&!isl&&!isMD(cat)&&!isTallWall(j,f)){const zt=cType(j,zc),lg=cLeg(j,zc),ck=zt==='diag'?'corner_diag':cKind(j,zc)==='cdrawer'?'corner_dr':'corner_l',cfw=(zt==='blind'||zt==='magic')?cFill(j):0;
      if(f.key==='A'){if(zt==='diag'||zt==='lshape'){lc=Math.max(0,lg-sL0);corners.push({t:ck,x:0,w:lc,z0,z1,n:ck==='corner_dr'?3:1,r:0,i:'C',corner:true,side:'L',leg:lg});if(shelfCF>0){corners.push({t:'filler',x:lc,w:shelfCF,z0,z1,n:0,r:0,i:'F',filler:true,cfill:true});lc+=shelfCF}
        if(j.layout==='U'){rc=Math.max(0,lg-sR0);corners.push({t:ck,x:Wm-rc,w:rc,z0,z1,n:ck==='corner_dr'?3:1,r:0,i:'C',corner:true,side:'R',leg:lg})}}
        else{lc=Math.max(0,zoneCut(j,zc)+cfw+shelfCF-sL0);corners.push({t:'blindc',x:0,w:lc,z0,z1,n:0,r:0,i:'C',blind:true,side:'L',zt,cf:cfw+shelfCF});
          if(j.layout==='U'){rc=Math.max(0,zoneCut(j,zc)+cfw-sR0);corners.push({t:'blindc',x:Wm-rc,w:rc,z0,z1,n:0,r:0,i:'C',blind:true,side:'R',zt,cf:cfw})}
          if(tallOn(j)){const tw=Math.max(300,Math.round((+j.corner.tallW||600)/5)*5),ts=Math.max(0,zoneCut(j,'lower')+cFill(j)-sL0);
            if(zc==='upper'){if(ts>lc){corners.push({t:'filler',x:lc,w:ts-lc,z0,z1,n:0,r:0,i:'T',filler:true,tfill:true});}corners.push({t:'tallc',x:ts,w:tw,z0,z1,n:0,r:0,i:'C',ghost:true});lc=ts+tw}
            else{corners.push({t:'tallc',x:lc,w:tw,z0,z1:Hm,n:4,r:0,i:'C',tall:true,tk:j.corner.tallK||'oven'});lc+=tw}}}}
      else{const cw_=cfw+bSlack;off=zoneCut(j,zc)-cut+cw_;if(cw_)corners.push({t:'filler',x:off-cw_,w:cw_,z0,z1,n:0,r:0,i:'F',filler:true,cfill:true})}}
    if(zc==='upper'&&isCornerLay(j)&&!isl&&!isMD(cat)&&!tallOn(j)){const hu=k=>{const ff=j.faces.find(x=>x.key===k);return!!ff&&ff.rows.some(r=>r.zone==='upper')&&!(penOn(j)&&k==='B')};
      if(f.key==='A'){if(!hu('B')){const c0=corners.filter(c=>c.side==='L'||(c.x<lc&&c.side!=='R'));c0.forEach(c=>corners.splice(corners.indexOf(c),1));lc=0;if(shelfCF>0){corners.push({t:'filler',x:0,w:shelfCF,z0,z1,n:0,r:0,i:'F',filler:true});lc=shelfCF}}if(j.layout==='U'&&!hu('C')){const c1=corners.filter(c=>c.side==='R');c1.forEach(c=>{corners.splice(corners.indexOf(c),1);rc-=c.w})}}
      else if(!hu('A')){corners.splice(0,corners.length,...corners.filter(c=>!c.cfill));off=-cut}}
    let teM=null;{const te=tallEndOf(j,f);if(te&&!isl&&te.side==='M')teM=te;else if(te&&!isl){const up=row.zone==='upper'||row.zone==='top';if(te.side==='R'){rc+=te.w;corners.push(up?{t:'tallc',x:Wm-rc,w:te.w,z0,z1,n:0,r:0,i:'C',ghost:true}:{t:'tallc',x:Wm-rc,w:te.w,z0,z1:Hm,n:4,r:0,i:'C',tall:true,tk:te.k,fh:te.fh,end:true})}
      else{corners.push(up?{t:'tallc',x:off+lc,w:te.w,z0,z1,n:0,r:0,i:'C',ghost:true}:{t:'tallc',x:off+lc,w:te.w,z0,z1:Hm,n:4,r:0,i:'C',tall:true,tk:te.k,fh:te.fh,end:true});lc+=te.w}}}
    {const t2=tall2Of(j,f);if(t2&&!isl){const up=row.zone==='upper'||row.zone==='top';if(t2.side==='R'){rc+=t2.w;corners.push(up?{t:'tallc',x:Wm-rc,w:t2.w,z0,z1,n:0,r:0,i:'C',ghost:true}:{t:'tallc',x:Wm-rc,w:t2.w,z0,z1:Hm,n:4,r:0,i:'C',tall:true,tk:t2.k,fh:t2.fh,end:true,t2:true})}
      else{corners.push(up?{t:'tallc',x:off+lc,w:t2.w,z0,z1,n:0,r:0,i:'C',ghost:true}:{t:'tallc',x:off+lc,w:t2.w,z0,z1:Hm,n:4,r:0,i:'C',tall:true,tk:t2.k,fh:t2.fh,end:true,t2:true});lc+=t2.w}}}
    {const te=tallEndOf(j,f);if(te&&!isl&&te.side!=='M'){const eT=RULES.epT,up=row.zone==='upper'||row.zone==='top',hollow=te.k==='fspace'&&!tall2Of(j,f)&&frNiche(j)&&!frNiche(j).housing,c={t:'filler',w:eT,z0,z1:up||hollow?z1:Hm,n:0,r:0,i:'E',filler:true,epIn:true,tk:tall2Of(j,f)?.k||te.k,ghost:up&&!hollow};
      if(te.side==='R'){rc+=eT;c.x=Wm-rc;c.side='R'}else{c.x=off+lc;lc+=eT;c.side='L'}corners.push(c)}}
    if(!isMD(cat)){const sp=f.sp||{},spL=+sp[row.zone+':L']||0,spR=+sp[row.zone+':R']||0;
      if(spL>0){corners.push({t:'filler',x:off+lc,w:spL,z0,z1,n:0,r:0,i:'S',filler:true,spacer:'L'});lc+=spL}
      if(spR>0){rc+=spR;corners.push({t:'filler',x:Wm-rc,w:spR,z0,z1,n:0,r:0,i:'S',filler:true,spacer:'R'})}}
    const span=(isMD(cat)?Wm-2*MFRAME:Wm)-off-lc-rc;let al,ws,segs=null,xs=null;const s0=(isMD(cat)?MFRAME:0)+off+lc;let x=s0;
    if(teM){const up=row.zone==='upper'||row.zone==='top',e0=s0+span,tw=teM.w,tx=clamp(Math.round(teM.x/5)*5,s0,Math.max(s0,e0-tw)),wl=tx-s0,wr=e0-tx-tw,pa=allocW(row.mods,Math.max(200,span-tw)).ws;let acc=0;const sd=pa.map(w=>{const c=acc+w/2;acc+=w;return c<wl?0:1});
      const iL=row.mods.map((m,i)=>i).filter(i=>sd[i]===0),iR=row.mods.map((m,i)=>i).filter(i=>sd[i]===1),A=(ix,w)=>ix.length&&w>=150?allocW(ix.map(i=>row.mods[i]),w):{ws:ix.map(()=>0),gap:Math.max(0,w),over:0},aL=A(iL,wl),aR=A(iR,wr);ws=row.mods.map(()=>0);xs=row.mods.map(()=>0);
      let px=s0;iL.forEach((i,k)=>{ws[i]=aL.ws[k];xs[i]=px;px+=ws[i]});const gL=aL.gap>0?{x:px,w:aL.gap}:null;px=tx+tw;iR.forEach((i,k)=>{ws[i]=aR.ws[k];xs[i]=px;px+=ws[i]});const gR=aR.gap>0?{x:px,w:aR.gap}:null;
      al={ws,gap:(aL.gap||0)+(aR.gap||0),over:(aL.over||0)+(aR.over||0),lo:0,gL,gR};segs=[{idx:iL,w:wl},{idx:iR,w:wr}];
      corners.push(up?{t:'tallc',x:tx,w:tw,z0,z1,n:0,r:0,i:'C',ghost:true}:{t:'tallc',x:tx,w:tw,z0,z1:Hm,n:4,r:0,i:'C',tall:true,tk:teM.k,fh:teM.fh,end:true,mid:true})}
    else{al=allocW(row.mods,Math.max(200,span));ws=al.ws}
    const mods=row.mods.map((m,i)=>{const rz=row.zone==='upper'?clamp(modRaise(m),0,Math.max(0,z1-z0-250)):0;if(xs)x=xs[i];const o={...m,x,w:ws[i],z0:z0+rz,z1,i,raise:rz};x+=ws[i];return o});
    if(cat==='kitchen'&&!isl&&!teM&&row.zone==='lower'&&j.snap!==false&&mods.length&&(al.over>0||span<snapMinSum(mods,row.mods)-.5))al.tooMany=true;
    if(cat==='kitchen'&&!isl&&!teM&&row.zone==='lower'&&j.snap!==false&&!(al.over>0)&&mods.length){mods.forEach(m=>{if(m.axF!=null)m.ax=m.axF-(cut+sL)});const eo=snapEdge(j,f,sL,sR,lc,rc,ep),sr=snapAny(mods,row.mods,s0,s0+span,eo);if(!sr&&!row.noAuto&&span>mods.length*SNAP_MAX){const sx=snapRow(mods,row.mods,s0,s0+span,{...eo,extra:true})||snapRow(mods,row.mods,s0,s0+span,{...eo,extra:true,relax:2});if(sx?.ex){al.wantEx=sx.ex;al.wantAt=sx.exAt}}if(sr){if(!row.noAuto)Object.assign(al,snapAuto(mods.map(m=>({...m})),row.mods,s0,s0+span,eo,sr));let px=s0;mods.forEach((m,k)=>{m.x=px;m.w=sr.ws[k];px+=m.w});x=px;al={...al,ws:sr.ws,lo:0,gap:0,snapLt:sr.Lt,snapRelax:sr.relax};if(sr.R>0){if(!adjL&&!rowsOverride)al.lo=sr.R;else al.gap=sr.R}}}
    let fillA=teM?[al.gL,al.gR].filter(Boolean).map(q=>({t:'filler',x:q.x,w:q.w,z0,z1,n:0,r:0,i:'F',filler:true})):al.gap>0?[{t:'filler',x,w:al.gap,z0,z1,n:0,r:0,i:'F',filler:true}]:[],toC=0;
    if(!teM&&al.gap>0&&cat==='kitchen'&&j.fillAt==='corner'&&!isl){const cc=corners.find(c=>c.cfill)||corners.find(c=>c.blind&&c.side==='L');if(cc){const gp=al.gap;corners.filter(c=>c!==cc&&c.x>cc.x&&!(c.side==='R'||c.spacer==='R'||c.end&&c.x>=Wm-rc-1)).forEach(c=>c.x+=gp);cc.w+=gp;if(cc.blind)cc.cf=(cc.cf||0)+gp;mods.forEach(m=>m.x+=gp);fillA=[];toC=gp}}
    if(isTallWall(j,f)&&row.zone==='full'){if(al.over>0)al.tooMany=true;fillA=al.gap>0?[{t:'gap',gk:'free',x,w:al.gap,z0,z1,n:0,r:0,i:'G'}]:[];al={...al,gap:0}}
    return{tooMany:al.tooMany,snapLt:al.snapLt,snapRelax:al.snapRelax,wantEx:al.wantEx,wantAt:al.wantAt,dropAuto:al.dropAuto,lo:al.lo||0,zone:row.zone,rix:f.rows.indexOf(row0),z0,z1,off,corners,mods,fill:fillA,gap:al.gap,toC,over:al.over,segs}});
  if((fin==='filler'||cat==='kitchen')&&!isl&&!isMD(cat)&&!adjL&&!rowsOverride){const pr=rows.find(r=>r.zone!=='upper')||rows[0];if(pr&&pr.lo>0)return geom(j,fi,rowsOverride,pr.lo)}
  if(cat==='kitchen'&&!isl&&j.snap!==false){const lo=rows.find(r=>r.zone==='lower'),up=rows.find(r=>r.zone==='upper'),tp=rows.find(r=>r.zone==='top'),al_=j.upAlign!==false;const eo_=r=>snapEdge(j,f,sL,sR,(r.corners||[]).filter(c=>c.x<=(r.mods[0]?.x??0)).length?1:0,(r.corners||[]).filter(c=>c.x>=(r.mods[r.mods.length-1]?.x??0)).length?1:0,ep);if(up)snapPost(up,lo,f,{align:al_,...eo_(up)});if(tp)snapPost(tp,up||lo,f,{align:al_,...eo_(tp)})}
  else if(cat==='kitchen'&&!isl&&j.upAlign!==false){const lo=rows.find(r=>r.zone==='lower'),up=rows.find(r=>r.zone==='upper'),tp=rows.find(r=>r.zone==='top');if(lo&&up)alignRow(up,lo,f);if(tp&&(up||lo))alignRow(tp,up||lo,f)}
  if(j.tallLine&&j.tallLine!=='auto'){const up_=rows.find(r=>r.zone==='upper'),lo_=rows.find(r=>r.zone==='lower'),sz=j.tallLine==='upper'?(up_?up_.z0:Hm-(KH&&KH.uni?KH.B:upperH(Hm))-tH):(lo_?lo_.z1:ct0);rows.forEach(r=>(r.corners||[]).forEach(c=>{if(c.tall)c.split=sz}))}
  rows.forEach(r=>hingeSolve(j,f,{cat,isl,sL,sR,fi,ep},r));
  const lr_=rows.find(r=>r.zone==='lower'),tl_=lr_?.corners.find(c=>c.tall&&!c.end),cb_=lr_?.corners.find(c=>c.blind&&c.side==='L'),talls_=[...(lr_?.corners||[]).filter(c=>c.tall).map(c=>({x:c.x,w:c.w,k:c.tk,end:!!c.end})),...(cat==='kitchen'?(rows.find(r=>r.zone==='full')?.mods||[]).filter(m=>m.t==='tallc').map(m=>({x:m.x,w:m.w,k:m.tk||'pantry',end:true,wall:true})):[])];
  const gaps_=(rows.find(r=>r.zone==='lower'||r.zone==='full')?.mods||[]).filter(isGap).map(m=>({x:m.x,w:m.w,k:m.gk||'door'}));
  return{mold,moldShow:mold?(j.moldFull===false?Math.min(mold,H-Hm):H-Hm):0,gaps:gaps_,gapSum:gaps_.reduce((a,q)=>a+q.w,0),ep,shelfCF,bg:!isl?bgOf(j):0,bgUse:bgUse(j),topH:tH,topD:tD,talls:talls_,tallSum:talls_.reduce((a,t)=>a+t.w,0),pen:penOn(j)&&f.key==='B'?(+j.pen.over||0):null,tw:tl_?tl_.w:0,tx0:tl_?tl_.x:0,lidW:(!isl&&f.key==='A'&&cb_&&lidOn(j))?cb_.w:0,rem5,jref:j,cat,W,H,D,Wm,Hm,Dm,rows,clr,sL,sR,top,fin,pl,ct,ctc,ct0,face:f.key,island:isl,cut,len:+f.len,fi,side,tbl,isup:isl?supportById(j.island.support):null,ext:tbl?Math.max(0,tbl.x0+tbl.w-(W-clr)):side}}
/* 상부장(윗줄) 칸 경계를 아랫줄 문 선에 맞춘다 — 칸 수는 그대로, 폭만 옮김 */

/* 보이는 옆면은 전부 마감판(EP): 문·통로·창·빈 벽 옆 칸은 빈 칸 안쪽에 EP 두께만큼 자리를 잡음 (기둥·벽 옆은 제외) */
const epGapSide=(m,nb)=>isGap(m)&&m.gk!=='pillar'&&nb&&!isGap(nb)&&!nb.filler;
function epGapRow(row){if(!row.mods.some(isGap))return row;const eT=RULES.epT;return{...row,mods:row.mods.map((m,k,a)=>{if(!isGap(m))return m;const L=epGapSide(m,a[k-1]),R=epGapSide(m,a[k+1]);if(!L&&!R)return m;const add=eT*((L?1:0)+(R?1:0)),uw=+m.userW||+m.r||900;return{...m,userW:uw+add,r:uw+add,epL:L,epR:R,open:uw}})}}
