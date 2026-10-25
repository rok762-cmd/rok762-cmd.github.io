/* ---------- 칸 폭 정규격 맞춤 (주방): 50mm 단위 · 쿡탑장 600/750/800/900 · 도어 400·350 우선 · 정면 균등 · 상하 선 맞춤 ---------- */
let SNAP=RULES_DEF.unit,SNAP_MAX=RULES_DEF.maxW,COOK_W=RULES_DEF.cookWs,SNAP_LT=[400,350,450,300];
const c50=v=>Math.ceil(v/SNAP-1e-6)*SNAP,r50=v=>Math.round(v/SNAP)*SNAP;
const hasDoorM=m=>!m.filler&&!m.flap&&m.t!=='hood'&&!!(layout(m).zones||[]).some(z=>z.kind==='door');
const leafPen=L=>RULES.doorLeaf.includes(L)?0:L===400||L===350?.8:L===450||L===300?1.5:L===500||L===250?2.5:L===150||L===200?3:L===550||L===600?3:6;
function snapOpts(m,src,w0,relax=0){const unit=!!m.unit&&!!unitById(m.unit),uw=+src?.userW||0,need=relax>2?150:m.t==='cook'?minWOf(m):relax>1||(relax&&m.t!=='sink')?150:minWOf(m);

  if(m.t==='gap')return[Math.max(50,Math.round(+src?.userW||w0))];
  if(m.t==='hood')return[appNeed(m)||r50(w0)];if(unit)return[w0];
  if(m.t==='cook'&&relax<3){const base=Math.max(need,uw||(src?.fix?w0:0)),L=COOK_W.filter(w=>w>=base);return L.length?(uw||src?.fix?[L[0]]:L):[c50(base)]}
  if(uw)return[Math.max(c50(need),r50(uw))];if(src?.fix)return[Math.max(c50(need),r50(w0))];
  const lo=Math.max(150,c50(need)),hi=Math.min(SNAP_MAX,Math.max(RULES.prefW,c50(need))),o=[];for(let w=lo;w<=hi;w+=SNAP)o.push(w);return o}
/* 같은 입력이면 같은 결과: 계산 결과를 기억해 두었다가 다시 씀 (화면 한 번에 칸 계산이 수십 번 일어남) */
const SNAP_CACHE=new Map();let snapHits=0,snapMiss=0;
function snapKey(ms,srcs,b0,bn,o){return JSON.stringify([ms.map(m=>[m.t,Math.round(m.w*10),m.unit||'',(m.apps||[]).map(a=>a.id).join('+'),m.hk||'',m.hcab||'',m.z0,m.z1,m.n,m.flap?1:0,m.filler?1:0,m.hw||'',m.glass?1:0,m.ax??null]),srcs.map(q=>[q?.userW||0,q?.fix?1:0,q?.auto?1:0]),Math.round(b0*10),Math.round(bn*10),o.grid0,o.lines,o.cookC,o.pref,o.relax||0,o.extra?1:0,o.edgeL?1:0,o.edgeR?1:0,o.pins||null])}
function snapRow(ms,srcs,b0,bn,o={}){const key=snapKey(ms,srcs,b0,bn,o);if(SNAP_CACHE.has(key)){snapHits++;const r=SNAP_CACHE.get(key);return r&&{...r,ws:[...r.ws]}}snapMiss++;const r=snapRow0(ms,srcs,b0,bn,o);if(SNAP_CACHE.size>4000)SNAP_CACHE.clear();SNAP_CACHE.set(key,r);return r&&{...r,ws:[...r.ws]}}
function snapRow0(ms,srcs,b0,bn,o={}){const n=ms.length;if(!n)return null;const g0=o.grid0??b0,lines=o.lines,near=v=>!lines||lines.some(q=>Math.abs(q-v)<=1),onG=v=>{const r=(((v-g0)%SNAP)+SNAP)%SNAP;return r<.5||SNAP-r<.5};
  const opt=ms.map((m,i)=>snapOpts(m,srcs[i],m.w,o.relax||0)),door=ms.map(hasDoorM),EX=o.extra?[150,200,250,300,350,400,700,800]:[];let best=null;
  const edgeC=(pos,e,last)=>(!last&&lines&&!near(e)?3:0)+(!last&&!onG(e)?.5:0);
  for(const Lt of SNAP_LT){let dp=new Map([[b0+'|0',{pos:b0,c:o.pref&&o.pref!==Lt?1:0,ws:[],ex:null}]]);
    const push=(nx,st)=>{const key=st.pos+'|'+(st.ex?1:0),q=nx.get(key);if(!q||st.c<q.c)nx.set(key,st)};
    const addEx=(nx,st,k)=>EX.forEach(e=>{const p=st.pos+e;if(p>bn+.5)return;push(nx,{pos:p,c:st.c+leafPen(e)+1+Math.abs(e-Lt)/SNAP*.2+edgeC(st.pos,p,false),ws:st.ws,ex:{at:k,w:e}})});
    for(let k=0;k<n;k++){const m=ms[k],lockd=opt[k].length===1;
      if(EX.length){const pre=new Map();dp.forEach(st=>{push(pre,st);if(!st.ex)addEx(pre,st,k)});dp=pre}
      const nx=new Map();
      const pin=o.pins?.[k];dp.forEach(st=>opt[k].forEach(w=>{const pos=st.pos,e=pos+w;if(e>bn+.5)return;if(pin!=null&&Math.abs(pos-pin)>1)return;const leaf=door[k]&&w>650?w/2:w;
        let c=st.c+Math.abs(w-m.w)/SNAP*.15+(w>RULES.prefW&&!lockd?3+(w-RULES.prefW)/SNAP:0);
        if(m.t==='sink'&&o.relax){const nd=minWOf(m);if(w<nd)c+=(nd-w)/SNAP*2}
        if(m.t==='cook')c+=(w===600?0:w===900?1.2:.8)*(o.relax?3:1);else if(!lockd){if(door[k])c+=leafPen(leaf)+Math.abs(leaf-Lt)/SNAP*.8;else c+=(w>=400&&w<=600?0:w>=300&&w<=800?1.5:4)}
        c+=edgeC(pos,e,k===n-1&&!EX.length);
        if(door[k]&&w>650&&((k===0&&o.edgeL)||(k===n-1&&o.edgeR)))c+=4;
        if(m.ax!=null)c+=Math.abs(pos+w/2-m.ax)/SNAP*(isGap(m)?16:4);
        if(m.t==='hood'&&o.cookC!=null)c+=Math.abs(pos+w/2-o.cookC)/SNAP*4;
        push(nx,{pos:e,c,ws:[...st.ws,w],ex:st.ex})}));
      dp=nx;if(!dp.size)break}
    if(EX.length){const pre=new Map();dp.forEach(st=>{push(pre,st);if(!st.ex)addEx(pre,st,n)});dp=pre}
    dp.forEach(st=>{if(st.ws.length!==n)return;const R=bn-st.pos;if(R<-.5)return;const c=st.c+(R<SNAP-.5?R/SNAP*.5:3*R/SNAP)+(o.relax?20*o.relax:0);
      if(!best||c<best.c)best={c,ws:st.ws,R:Math.max(0,Math.round(R*10)/10),Lt,relax:o.relax||0,ex:st.ex?.w,exAt:st.ex?.at}})}
  return best}
const snapEdge=(j,f,sL,sR,lc,rc,ep)=>{const nd=hProj(j)+5;return{edgeL:!lc&&!ep?.L&&sL<nd,edgeR:!rc&&!ep?.R&&sR<nd}};
const snapMinSum=(ms,srcs)=>ms.reduce((a,m,i)=>a+Math.min(...snapOpts(m,srcs[i],m.w,3)),0);
const snapAny=(ms,srcs,b0,bn,o={})=>snapRow(ms,srcs,b0,bn,o)||(o.pins?snapAny(ms,srcs,b0,bn,{...o,pins:null,pinFail:1}):null)||snapRow(ms,srcs,b0,bn,{...o,relax:1})||snapRow(ms,srcs,b0,bn,{...o,relax:2})||snapRow(ms,srcs,b0,bn,{...o,relax:3});
/* 남는 자리를 작은 장(150~300)으로 채울지, 넣어 둔 작은 장을 뺄지 판단 */
function snapAuto(ms,srcs,b0,bn,o,sr){const ai=srcs.map((m,k)=>m?.auto?k:-1).filter(k=>k>=0);
  if(ai.length){const k=ai[ai.length-1],pins2=o.pins?Object.fromEntries(Object.entries(o.pins).filter(([q])=>+q!==k).map(([q,v])=>[+q>k?+q-1:+q,v])):null,s2=snapAny(ms.filter((_,q)=>q!==k),srcs.filter((_,q)=>q!==k),b0,bn,{...o,pins:pins2});if(s2&&s2.c<=sr.c+.3&&s2.R<150)return{dropAuto:true}}
  if(ai.length>=3)return{};const sx=snapRow(ms,srcs,b0,bn,{...o,extra:true})||snapRow(ms,srcs,b0,bn,{...o,extra:true,relax:sr.relax});return sx&&sx.ex&&sx.c<sr.c-1?{wantEx:sx.ex,wantAt:sx.exAt}:{}}
function snapPost(row,ref,f,o={}){const ms=row.mods,n=ms.length;if(n&&row.over>0)row.tooMany=true;if(!n||row.over>0||row.segs)return;const src=f.rows[row.rix]?epGapRow(f.rows[row.rix]):null;if(!src)return;
  for(let k=0;k<n-1;k++)if(Math.abs(ms[k].x+ms[k].w-ms[k+1].x)>1)return;
  const b0=ms[0].x,bn=ms[n-1].x+ms[n-1].w+(row.gap||0),useL=o.align&&ref&&!src.manualW,cook=ref?.mods.find(m=>m.t==='cook');
  let pins=null;if(ref){src.mods.forEach((sm,k)=>{if(sm?.link){const lg=ref.mods.find(x=>x.gid===sm.link);if(lg){pins=pins||{};pins[k]=lg.x}}})}
  const so={pins,edgeL:o.edgeL,edgeR:o.edgeR,grid0:ref?.mods[0]?.x??b0,lines:useL?rowLines(ref):null,cookC:cook?cook.x+cook.w/2:null,pref:ref?.snapLt},r0_=pins?snapRow(ms,src.mods,b0,bn,so):null;
  if(pins&&Object.keys(pins).length===1){const gk=+Object.keys(pins)[0],px=pins[gk];let best=r0_?{c:r0_.c,at:gk}:null;
    for(let at=0;at<n;at++){if(at===gk)continue;const ord=ms.map((_,q)=>q).filter(q=>q!==gk);ord.splice(at,0,gk);const r2=snapRow(ord.map(q=>ms[q]),ord.map(q=>src.mods[q]),b0,bn,{...so,pins:{[at]:px}});if(r2&&(!best||r2.c<best.c-.01))best={c:r2.c,at}}
    if(best&&best.at!==gk)row.moveGap={from:gk,to:best.at}}
  const r=r0_||snapAny(ms,src.mods,b0,bn,so);if(!r){if(bn-b0<snapMinSum(ms,src.mods)-.5)row.tooMany=true;if(!src.noAuto&&bn-b0>n*SNAP_MAX){const sx=snapRow(ms,src.mods,b0,bn,{...so,extra:true})||snapRow(ms,src.mods,b0,bn,{...so,extra:true,relax:2});if(sx?.ex){row.wantEx=sx.ex;row.wantAt=sx.exAt}}return}if(!src.noAuto&&!pins)Object.assign(row,snapAuto(ms.map(m=>({...m})),src.mods,b0,bn,so,r));else if(pins&&src.mods.some(m=>m.auto))row.dropAuto=true;
  let px=b0;ms.forEach((m,k)=>{if(Math.abs(m.x-px)>.1||Math.abs(m.w-r.ws[k])>.1)row.alignMoved=true;m.x=px;m.w=r.ws[k];px+=m.w});
  row.fill=(row.fill||[]).filter(q=>!(q.i==='F'&&q.x>=b0-1));row.gap=r.R;if(r.R>0)row.fill.push({t:'filler',x:px,w:r.R,z0:row.z0,z1:row.z1,n:0,r:0,i:'F',filler:true});
  row.snapLt=r.Lt;if(useL){const L=rowLines(ref);row.aligned=ms.slice(0,-1).filter(m=>L.some(q=>Math.abs(q-(m.x+m.w))<=1)).length;row.alignN=n-1}}
function rowLines(r){const L=[];rowAll(r).forEach(m=>{L.push(m.x,m.x+m.w);if(r.mods.includes(m)&&m.w>650&&!m.filler&&!m.flap&&layout(m).zones?.some(z=>z.kind==='door'))L.push(m.x+m.w/2)});return[...new Set(L.map(v=>Math.round(v*2)/2))].sort((a,b)=>a-b)}
function alignRow(row,ref,f){const ms=row.mods,n=ms.length;row.aligned=0;if(n<2||row.gap>0||row.over>0||row.segs)return;const src=f.rows[row.rix]?epGapRow(f.rows[row.rix]):null;if(!src||src.manualW)return;
  for(let k=0;k<n-1;k++)if(Math.abs(ms[k].x+ms[k].w-ms[k+1].x)>1)return;
  const R=rowLines(ref),b0=ms[0].x,bn=ms[n-1].x+ms[n-1].w,TOL=250,near=v=>R.some(q=>Math.abs(q-v)<=1);
  const lock=ms.map((m,k)=>m.t==='hood'||!!src.mods[k]?.fix),minW=k=>Math.min(ms[k].w,250),maxW=k=>Math.max(ms[k].w,1000);
  const ok=(k,w)=>lock[k]?Math.abs(w-ms[k].w)<=.5:(w>=minW(k)-.01&&w<=maxW(k)+.01);
  const B=[];for(let k=1;k<n;k++){const o=ms[k].x,c=[{v:o,c:near(o)?0:1}];R.forEach(q=>{if(q>b0+1&&q<bn-1&&Math.abs(q-o)<=TOL&&Math.abs(q-o)>.5)c.push({v:q,c:Math.abs(q-o)/2000})});B.push(c)}
  let dp=[{v:b0,c:0,p:[]}];for(let k=0;k<n-1;k++){const nx=[];B[k].forEach(cd=>{let best=null;dp.forEach(s=>{if(!ok(k,cd.v-s.v))return;const c=s.c+cd.c;if(!best||c<best.c)best={v:cd.v,c,p:[...s.p,cd.v]}});if(best)nx.push(best)});if(!nx.length)return;dp=nx}
  let fin=null;dp.forEach(s=>{if(ok(n-1,bn-s.v)&&(!fin||s.c<fin.c))fin=s});if(!fin)return;
  const xs=[b0,...fin.p,bn];let ch=false;ms.forEach((m,k)=>{const x=xs[k],w=xs[k+1]-xs[k];if(Math.abs(x-m.x)>.1||Math.abs(w-m.w)>.1){m.x=x;m.w=w;ch=true}});
  row.aligned=fin.p.filter(near).length;row.alignN=n-1;if(ch)row.alignMoved=true}
const rowAll=row=>[...(row.corners||[]).filter(c=>!c.ghost),...row.mods,...(row.fill||[])];
const islandCounter=j=>counterById(j.island?.counterId)||counterById(j.counterId);
function layout(m){const t=m.t,z0=m.z0,z1=m.z1,h=z1-z0,n=Math.max(0,m.n??TYPES[t]?.n??0);
  const o={shelves:[],rods:[],hangs:[],drawers:[],stacks:[],shoes:[],zones:null,mirror:null,sink:false,cook:false,hood:false};
  const even=(a,b,k)=>{const r=[];for(let i=1;i<=k;i++)r.push(Math.round(a+(b-a)*i/(k+1)));return r};
  if(t==='gap'){o.zones=[];o.noBox=true;o.gap=true;return o}
  switch(t){
    case 'hang':o.shelves.push(z1-380);o.rods.push(z1-450);o.hangs.push({z:z1-450,len:Math.max(300,Math.min(1250,h-560))});o.stacks.push(z1-380);break;
    case 'hang2':{const zm=z0+Math.round(h*.47);o.shelves.push(z1-380,zm);o.rods.push(z1-450,zm-70);
      o.hangs.push({z:z1-450,len:Math.max(200,Math.min(820,z1-450-zm-80))},{z:zm-70,len:Math.max(200,Math.min(820,zm-70-z0-80))});o.stacks.push(z1-380);break}
    case 'shelf':case 'open':o.shelves=even(z0,z1,n);o.stacks=[z0+T,...o.shelves];break;
    case 'drawer':{const k=Math.max(1,n);for(let i=0;i<k;i++)o.drawers.push({zb:z0+T+i*200,h:200,ext:false});const dz=z0+T+k*200;
      o.shelves.push(dz+T,z1-380);o.rods.push(z1-450);o.hangs.push({z:z1-450,len:Math.max(200,Math.min(900,z1-450-dz-80))});o.stacks.push(z1-380);break}
    case 'drawerOnly':{const k=Math.max(1,n);if(h-k*220<250){const dh=Math.floor(h/k);for(let i=0;i<k;i++)o.drawers.push({zb:z0+i*dh,h:i===k-1?h-i*dh:dh,ext:true});o.zones=o.drawers.map(d=>({zb:d.zb,zt:d.zb+d.h,kind:'drawer'}));break}const dh=220;for(let i=0;i<k;i++)o.drawers.push({zb:z0+i*dh,h:dh,ext:true});const top=z0+k*dh;
      const up=even(top+T,z1,2);o.shelves.push(top+T,...up);o.stacks=[top+T,...up];
      o.zones=[...o.drawers.map(d=>({zb:d.zb,zt:d.zb+d.h,kind:'drawer'})),{zb:top,zt:z1,kind:'door'}];break}
    case 'basket':{const k=Math.max(1,Math.min(4,n)),dh=230;for(let i=0;i<k;i++)o.drawers.push({zb:z0+T+i*dh,h:dh-20,ext:false,mesh:true});const dz=z0+T+k*dh;o.mesh=k;
      o.shelves.push(dz+T,z1-380);o.rods.push(z1-450);o.hangs.push({z:z1-450,len:Math.max(200,Math.min(900,z1-450-dz-80))});o.stacks.push(z1-380);break}
    case 'pants':{const pz=z0+Math.round(h*.45);o.shelves.push(z1-380,pz+T);o.rods.push(z1-450);o.hangs.push({z:z1-450,len:Math.max(200,Math.min(800,z1-450-pz-80))});o.stacks.push(z1-380);o.pants={zb:z0+120,zt:pz-20,n:Math.max(4,Math.floor((m.w-60)/90))};o.rods.push(pz-60);o.hangs.push({z:pz-60,len:Math.max(200,Math.min(650,pz-60-z0-160))});break}
    case 'acc':{const k=Math.max(1,Math.min(5,n)),ab=z0+Math.round(h*.38),dh=110;for(let i=0;i<k;i++)o.drawers.push({zb:ab+i*dh,h:dh-15,ext:false,tray:true});const at=ab+k*dh;o.acc=k;o.shelves.push(ab-T,at+T,...even(at+T,z1,2),...even(z0,ab-T,1));o.stacks=[at+T];break}
    case 'quilt':{const k=Math.max(1,Math.min(3,n)),dh=260;for(let i=0;i<k;i++)o.drawers.push({zb:z0+i*dh,h:dh,ext:true});const top=z0+k*dh;const up=even(top+T,z1,1);o.shelves.push(top+T,...up);o.stacks=[top+T,...up];o.quilt=true;
      o.zones=[...o.drawers.map(d=>({zb:d.zb,zt:d.zb+d.h,kind:'drawer'})),{zb:top,zt:z1,kind:'door'}];break}
    case 'shoe':o.shelves=even(z0,z1,n);o.shoes=[z0+T,...o.shelves];break;
    case 'bench':{const ub=z1-Math.round(h*.42),lt=z0+450;o.shelves.push(ub+T,Math.round((ub+z1)/2),lt,z0+225);o.shoes=[z0+T];
      o.zones=[{zb:ub,zt:z1,kind:'door'},{zb:z0,zt:lt-T,kind:'door'}];break}
    case 'vanity':{const ub=z1-500;o.shelves.push(ub+T,Math.round((ub+z1)/2),750);o.drawers.push({zb:600,h:132,ext:true});o.mirror={zb:900,zt:ub-60};
      o.zones=[{zb:ub,zt:z1,kind:'door'},{zb:600,zt:732,kind:'drawer'}];break}
    case 'baseDrawer':{const k=Math.max(1,n),dh=Math.floor(h/k);for(let i=0;i<k;i++)o.drawers.push({zb:z0+i*dh,h:i===k-1?h-i*dh:dh,ext:true});
      o.zones=o.drawers.map(d=>({zb:d.zb,zt:d.zb+d.h,kind:'drawer'}));break}
    case 'drawer2p':{const d=Math.round(h*2/5);o.drawers.push({zb:z0,h:d,ext:true},{zb:z0+d,h:d,ext:true},{zb:z0+2*d,h:h-2*d,ext:true});o.zones=o.drawers.map(d_=>({zb:d_.zb,zt:d_.zb+d_.h,kind:'drawer'}));break}
    case 'drawerDoor':{const dh=Math.max(130,Math.min(180,Math.round(h*.2)));o.drawers.push({zb:z1-dh,h:dh,ext:true});o.shelves=even(z0,z1-dh,n);o.zones=[{zb:z1-dh,zt:z1,kind:'drawer'},{zb:z0,zt:z1-dh,kind:'door'}];break}
    case 'innerDr':{const k=Math.max(1,Math.min(5,n||3)),dh=Math.max(110,Math.min(180,Math.floor((h-2*T-40)/k)));for(let i=0;i<k;i++)o.drawers.push({zb:z0+T+i*dh,h:dh-10,ext:false});o.zones=[{zb:z0,zt:z1,kind:'door'}];break}
    case 'spice':case 'waste':{o.drawers.push({zb:z0,h,ext:true});o.zones=[{zb:z0,zt:z1,kind:'drawer'}];o.pull=t;if(t==='spice')o.shelves=even(z0,z1,3);break}
    case 'base':case 'upper':case 'upperOpen':case 'topbox':case 'bigFlap':case 'fridgeTop':o.shelves=even(z0,z1,n);break;
    case 'washpair':case 'washone':{const pb=z0+400,mt=pb+880;o.drawers.push({zb:z0,h:200,ext:true},{zb:z0+200,h:200,ext:true});o.washers={zb:pb+10,zt:mt,n:t==='washpair'?2:1};o.shelves=even(mt+T+20,z1,1);o.zones=[{zb:z0,zt:z0+200,kind:'drawer'},{zb:z0+200,zt:pb,kind:'drawer'},{zb:mt+20,zt:z1,kind:'door'}];break}
    case 'washstack':{const mt=z0+1760;o.washers={zb:z0+10,zt:mt,n:2,stack:true};o.shelves=even(mt+T+20,z1,1);o.zones=[{zb:mt+20,zt:z1,kind:'door'}];break}
    case 'corner_dr':{const k=Math.max(1,n),dh=Math.floor(h/k);for(let i=0;i<k;i++)o.drawers.push({zb:z0+i*dh,h:i===k-1?h-i*dh:dh,ext:true});o.zones=o.drawers.map(d=>({zb:d.zb,zt:d.zb+d.h,kind:'drawer'}));break}
    case 'tallc':{const tk=m.tk||'oven';if(tk==='fspace'){const ft=Math.min(z1-250,+m.fh>0?+m.fh:z0+1850);o.fridge={zb:z0,zt:ft};o.fspace=true;o.shelves=[];o.zones=[{zb:ft+20,zt:z1,kind:'door'}]}
      else if(tk==='combo'){const ob=z0+380,ot=ob+600,mb=ot+30,mt=mb+400;o.drawers.push({zb:z0,h:ob-z0,ext:true});o.oven={zb:ob,zt:ot};o.micro={zb:mb,zt:mt};o.shelves=even(mt+T,z1,2);o.openTop=mt+T;o.zones=[{zb:z0,zt:ob,kind:'drawer'}]}
      else if(tk==='oven'){const ob=z0+620,ot=ob+600;o.drawers.push({zb:z0,h:310,ext:true},{zb:z0+310,h:310,ext:true});o.oven={zb:ob,zt:ot};o.shelves=even(ot+T,z1,2);
        o.zones=[{zb:z0,zt:z0+310,kind:'drawer'},{zb:z0+310,zt:ob,kind:'drawer'},{zb:ot,zt:z1,kind:'door'}]}
      else if(tk==='appl'){const ab=z0+620,at=Math.min(z1-400,ab+720);o.drawers.push({zb:z0,h:310,ext:true},{zb:z0+310,h:310,ext:true});o.shelves=[ab,Math.round((ab+at)/2),at,...even(at,z1,1)];o.openTop=ab;o.appl={zb:ab,zt:at};o.zones=[{zb:z0,zt:z0+310,kind:'drawer'},{zb:z0+310,zt:ab,kind:'drawer'},{zb:at,zt:z1,kind:'door'}]}
      else if(tk==='oven2'){const ob=z0+620,ot=ob+595,cb=ot+10,ct=cb+450;o.drawers.push({zb:z0,h:310,ext:true},{zb:z0+310,h:310,ext:true});o.oven={zb:ob,zt:ot};o.micro={zb:cb,zt:ct};o.microLab='콤팩트 오븐';o.shelves=even(ct+T,z1,1);o.zones=[{zb:z0,zt:z0+310,kind:'drawer'},{zb:z0+310,zt:ob,kind:'drawer'},{zb:ct+10,zt:z1,kind:'door'}]}
      else if(tk==='larder'){const mid=m.split>z0+400&&m.split<z1-250?m.split:z0+Math.round(h*.56);o.drawers.push({zb:z0,h:mid-z0,ext:true},{zb:mid,h:z1-mid,ext:true});o.shelves=[...even(z0,mid,3),...even(mid,z1,2)];o.larder=true;o.zones=[{zb:z0,zt:mid,kind:'drawer'},{zb:mid,zt:z1,kind:'drawer'}]}
      else if(tk==='broom'){const bt=m.split>z0+600&&m.split<z1-250?m.split:Math.min(z1-350,z0+1800);o.shelves=[bt,Math.round((bt+z1)/2)];o.broom={zb:z0,zt:bt};o.zones=[{zb:z0,zt:bt,kind:'door'},{zb:bt,zt:z1,kind:'door'}]}
      else if(tk==='fridge'){const ft=Math.min(z1-300,z0+(+m.fh||1850));o.fridge={zb:z0,zt:ft};o.shelves=[Math.round((ft+z1)/2)];o.zones=[{zb:z0,zt:ft,kind:'door'},{zb:ft,zt:z1,kind:'door'}]}
      else{const mid=m.split>z0+400&&m.split<z1-250?m.split:z0+Math.round(h*.52);o.shelves=[...even(z0,mid,2),mid,...even(mid,z1,2)];o.zones=[{zb:z0,zt:mid,kind:'door'},{zb:mid,zt:z1,kind:'door'}]}break}
    case 'sink':o.sink=true;if(m.sk==='drawer'){const d=Math.round(h*.62);o.drawers.push({zb:z0,h:d,ext:true},{zb:z0+d,h:h-d,ext:true});o.zones=o.drawers.map(d_=>({zb:d_.zb,zt:d_.zb+d_.h,kind:'drawer'}))}break;
    case 'dw':o.dw=true;o.zones=[{zb:z0,zt:z1,kind:'panel'}];break;
    case 'wash':o.wash=true;break;
    case 'oven':{o.oven={zb:z1-600,zt:z1-5};o.drawers.push({zb:z0,h:z1-600-z0,ext:true});o.zones=[{zb:z0,zt:z1-600,kind:'drawer'}];break}
    case 'dryer':o.shelves=[];o.rack=[z0+Math.round((z1-z0)*.35),z0+Math.round((z1-z0)*.7)];break;
    case 'cook':o.cook=true;o.shelves=even(z0,z1,1);if(m.ck!=='door'){const d=Math.round(h*2/5);o.shelves=[];o.drawers.push({zb:z0,h:d,ext:true},{zb:z0+d,h:d,ext:true},{zb:z0+2*d,h:h-2*d,ext:true});o.zones=o.drawers.map(d_=>({zb:d_.zb,zt:d_.zb+d_.h,kind:'drawer'}))}break;
    case 'hood':{o.hood=true;const k=hoodK(m);o.hoodK=k;if(k==='chimney'){o.zones=[];o.noBox=true}else if(k==='wide'||k==='can'){const a=modApps(m).find(x=>x.a.kind==='hood')?.a,hh=Math.min(h,Math.max(100,+a?.h||120));o.wideH=hh;if(hh>h-150){o.zones=[];o.noBox=true}else o.zones=[{zb:z0+hh,zt:z1,kind:'door'}]}break}
  }
  if(!o.zones)o.zones=TYPES[t]?.door?[{zb:z0,zt:z1,kind:'door'}]:[];
  if(+m.openH>0&&!m.tall&&o.zones.length===1&&o.zones[0].kind==='door'&&h>=400){const oh=clamp(Math.round(+m.openH),150,h-200);if(m.openPos==='T'){const zb=z1-oh;o.zones=[{zb:z0,zt:zb,kind:'door'},{zb,zt:z1,kind:'open'}];o.shelves=[...o.shelves.filter(z=>z<zb-60),zb]}else{const zt=z0+oh;o.zones=[{zb:z0,zt,kind:'open'},{zb:zt,zt:z1,kind:'door'}];o.shelves=[zt,...o.shelves.filter(z=>z>zt+60)]}o.openZ=o.zones.find(z=>z.kind==='open')}
  return o}
function leafDoor(j,l,def){const base=def||doorById(j.doorId);if(!base||base.kind!=='hinged'||!l)return base;const ok=id=>{const d=id&&doorById(id);return d&&d.kind==='hinged'?d:null};
  if(ok(l.did))return ok(l.did);if(l.tall||l.zone==='tall'){const d=ok(j.doorTallId);if(d)return d;if(j.tallDoor==='upper')return ok(j.doorUpperId)||base;if(j.tallDoor==='split'&&l.zb>=CTH-60)return ok(j.doorUpperId)||base;return base}
  return((l.zone==='upper'||l.zone==='top')?ok(j.doorUpperId):null)||base}
function leaves(g,door){const gap=3,out=[];if(isMD(g.cat))return out;const none=!door||door.kind==='none';
  if(!none&&door.kind==='sliding'){const row=g.rows[0],n=Math.max(2,Math.round(g.Wm/1100)),ov=40,lw=Math.round((g.Wm+(n-1)*ov)/n);
    for(let i=0;i<n;i++)out.push({x:i*(lw-ov),zb:row.z0,w:lw,h:row.z1-row.z0,kind:'slide',layer:i%2,zone:'full'});return out}
  const sinkR=(g.rows.find(r_=>r_.zone==='lower')?.mods||[]).filter(m_=>m_.t==='sink').map(m_=>[m_.x,m_.x+m_.w]),overSink=(row,m)=>row.zone==='upper'&&sinkR.some(([a,b])=>Math.min(b,m.x+m.w)-Math.max(a,m.x)>m.w*.5);
  g.rows.forEach(row=>{const all=rowAll(row),sg=all.filter(m=>!m.corner&&!m.flap&&m.w<=650&&layout(m).zones.some(z=>!['drawer','panel'].includes(z.kind))),x0=Math.min(...all.map(m=>m.x)),x1=Math.max(...all.map(m=>m.x+m.w)),defH=m=>{const n=sg.length,k=sg.indexOf(m);if(k<0)return'L';if(n===1)return m.x+m.w/2>(x0+x1)/2?'R':'L';if(k===0)return'L';if(k===n-1)return'R';return k<n/2?(k%2?'R':'L'):((n-1-k)%2?'L':'R')};all.forEach((m,mi)=>{const st0=out.length;layout(m).zones.forEach(z=>{if(z.kind==='open')return;if(none&&z.kind!=='drawer')return;const zh=z.zt-z.zb;
    if(z.kind==='drawer'||z.kind==='panel'){if(z.kind==='panel'&&!modApps(m).some(x=>x.a.panel))return;out.push({x:m.x+gap/2,zb:z.zb+gap/2,w:m.w-gap,h:zh-gap,kind:z.kind,zone:row.zone});return}
    const os_=overSink(row,m)&&!m.flapForce;if(os_&&!m.corner&&m.w>=450&&!['hood','dryer'].includes(m.t)){const hw=m.w/2;out.push({x:m.x+gap/2,zb:z.zb+gap/2,w:hw-gap,h:zh-gap,kind:'door',hinge:'L',zone:row.zone,os:true},{x:m.x+hw+gap/2,zb:z.zb+gap/2,w:hw-gap,h:zh-gap,kind:'door',hinge:'R',zone:row.zone,os:true});return}
    if((m.flap||m.t==='fridgeTop'||m.t==='bigFlap')&&!m.corner&&!os_){if(m.fold&&zh>=500){const hh=Math.round(zh/2);out.push({x:m.x+gap/2,zb:z.zb+gap/2,w:m.w-gap,h:hh-gap,kind:'door',hinge:'U',flap:true,fold:true,zone:row.zone},{x:m.x+gap/2,zb:z.zb+hh+gap/2,w:m.w-gap,h:zh-hh-gap,kind:'door',hinge:'U',flap:true,fold:true,nh:true,zone:row.zone});return}out.push({x:m.x+gap/2,zb:z.zb+gap/2,w:m.w-gap,h:zh-gap,kind:'door',hinge:'U',flap:true,zone:row.zone});return}
    if(m.w>650&&!m.corner){const hw=m.w/2;out.push({x:m.x+gap/2,zb:z.zb+gap/2,w:hw-gap,h:zh-gap,kind:'door',hinge:'L',zone:row.zone});
      out.push({x:m.x+hw+gap/2,zb:z.zb+gap/2,w:hw-gap,h:zh-gap,kind:'door',hinge:'R',zone:row.zone})}
    else out.push({x:m.x+gap/2,zb:z.zb+gap/2,w:m.w-gap,h:zh-gap,kind:'door',hinge:m.corner?(m.side==='L'?'R':'L'):(row.hinge?.[m.i]==='L'||row.hinge?.[m.i]==='R'?row.hinge[m.i]:defH(m)),zone:row.zone,corner:m.corner?m.t:''})});for(let q=st0;q<out.length;q++){out[q].mh=m.handleId||'';out[q].mi=m.i;if(m.t==='hood'&&out[q].kind==='door')out[q].nh=true;if(m.tall)out[q].tall=true;if(m.doorId)out[q].did=m.doorId;if(m.glass&&out[q].kind==='door')out[q].glass=true}})});
  if((g.jref||(typeof job!=='undefined'?job:{}))?.hs?.chan&&g.cat==='kitchen')out.forEach(l=>{if(l.tall||!['door','drawer','panel'].includes(l.kind))return;if(l.zone==='lower'){l.h-=35;l.chan=true;l.nh=true}else if(l.zone==='upper'){l.zb-=20;l.h+=20;l.nh=true;l.chanU=true}});
  return out}
const hingesPer=h=>h>1800?4:h>1000?3:2;
function countDrawers(g){return g.rows.reduce((a,r)=>a+r.mods.reduce((b,m)=>b+layout(m).drawers.length,0),0)}
function hasType(g,t){return g.rows.some(r=>r.mods.some(m=>m.t===t))}
function midPanels(g){return g.rows[0].mods.map(m=>m.t==='mslide'&&g.cat==='storage'?{t:m.t,x:m.x-10,w:m.w+20,h:g.Hm-70}:m.t==='mslide'?{t:m.t,x:m.x-15,w:m.w+30,h:g.Hm-80}:m.t==='mfixed'?{t:m.t,x:m.x,w:m.w,h:g.Hm-70}:{t:m.t,x:m.x+3,w:m.w-6,h:g.Hm-66})}

