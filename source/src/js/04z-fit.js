/* ---------- 칸 맞춤 동작 (모델): 정규격 정리 · 가전 칸 맞춤 · 칸 폭 직접 입력 · 좌우 뒤집기 ---------- */
/* 하부 줄 문·통로·기둥 빈 칸 위 → 상부·위 칸 줄에도 같은 폭 빈 칸 (짝 연결) */
function syncGapsUp(j=job){let ch=false;j.faces.forEach((f,fi)=>{const lo=f.rows.find(r=>r.zone==='lower');if(!lo)return;
  lo.mods.forEach(m=>{if(isGap(m)&&!m.gid)m.gid='g'+uid()});
  const want=lo.mods.filter(m=>isGap(m)&&m.gk!=='window');
  f.rows.filter(r=>r.zone==='upper'||r.zone==='top').forEach(r=>{
    r.mods=r.mods.filter(m=>{if(m.link&&!want.some(w=>w.gid===m.link)){ch=true;return false}return true});
    want.forEach(w=>{let u=r.mods.find(m=>m.link===w.gid);const uw=+w.userW||+w.r||900;
      if(!u){let g;try{g=geom(j,fi)}catch(e){return}const lg=g.rows.find(x=>x.zone==='lower')?.mods.find(m=>m.gid===w.gid),ug=g.rows.find(x=>x.rix===f.rows.indexOf(r));
        let at=r.mods.length;if(lg&&ug&&ug.mods.length){const ps=ug.mods.map(m=>m.x).concat(ug.mods[ug.mods.length-1].x+ug.mods[ug.mods.length-1].w);let bd=1e9;ps.forEach((x,k)=>{const d=Math.abs(x-lg.x);if(d<bd){bd=d;at=k}})}
        u={t:'gap',n:0,r:uw,userW:uw,gk:w.gk||'door',link:w.gid};r.mods.splice(at,0,u);ch=true}
      else if(u.userW!==uw||u.gk!==(w.gk||'door')){u.userW=uw;u.r=uw;u.gk=w.gk||'door';ch=true}})})});return ch}
function stdNormalize(j=job){if(j.cat!=='kitchen'||j.snap===false)return;const msg=[];if(syncGapsUp(j)){}
  for(let it=0;it<4;it++){let ch=false;j.faces.forEach((f,fi)=>{if(f.key==='I')return;let g;try{g=geom(j,fi)}catch(e){return}
    const pr=g.rows.find(r=>r.zone==='lower');const cand=[...g.rows].sort((a,b)=>(a===pr?0:1)-(b===pr?0:1));
    for(const r of cand){const src=f.rows[r.rix];if(!src||src.noAuto)continue;
      if(r.tooMany&&src.mods.length>1){const ks=src.mods.map((m,k)=>({m,k,w:r.mods[k]?.w||0})).filter(x=>!x.m.unit&&!isGap(x.m)&&x.m.t!=='tallc'&&!['sink','cook','hood','dw','wash','oven'].includes(x.m.t)).sort((a,b)=>(b.m.auto?1:0)-(a.m.auto?1:0)||a.w-b.w)[0];if(ks){src.mods.splice(ks.k,1);f.edited=true;ch=true;msg.push(`${FACE_NAME(f.key)} ${r.zone==='lower'?'하부':'상부'} 칸이 너무 많아 하나를 뺐습니다`);break}}
      if(r.zone==='lower'&&r.snapRelax>=2&&src.mods.length>2){const cand=src.mods.map((m,k)=>({m,k,w:r.mods[k]?.w||0})).filter(x=>!x.m.unit&&!x.m.fix&&!x.m.userW&&!isGap(x.m)&&!['sink','cook','dw','wash','oven','hood'].includes(x.m.t)).sort((a,b)=>a.w-b.w)[0];
        if(cand){src.mods.splice(cand.k,1);f.edited=true;ch=true;msg.push(`${FACE_NAME(f.key)} 하부 자리가 모자라 ${TYPES[cand.m.t]?.label||'칸'} 하나를 뺐습니다`);break}}
      if(r.moveGap){const[m_]=src.mods.splice(r.moveGap.from,1);src.mods.splice(r.moveGap.to,0,m_);f.edited=true;ch=true;break}
      if(r.wantEx){const t=r.zone==='lower'?'base':r.zone==='upper'?'upper':'topbox',m={...md(t,r.wantEx),auto:true,r:r.wantEx};if(r.zone==='lower'&&r.wantEx<=300)m.hw=['pullout'];src.mods.splice(r.wantAt??src.mods.length,0,m);f.edited=true;ch=true;msg.push(`${FACE_NAME(f.key)} ${r.zone==='lower'?'하부':'상부'} 끝에 ${r.wantEx} 장을 넣었습니다`);break}
      if(r.dropAuto){const k=src.mods.map((m,q)=>m.auto?q:-1).filter(q=>q>=0).pop();if(k!=null)src.mods.splice(k,1);f.edited=true;ch=true;break}}});if(!ch)break}
  j.faces.forEach(f=>f.rows.forEach((r,ri)=>{if(j.faces[j.fi]===f&&j.sel?.row===ri&&j.sel.i>=r.mods.length)j.sel.i=Math.max(0,r.mods.length-1)}));
  stdNormalize.last=msg;
  if(msg.length&&!stdNormalize.quiet&&typeof toast==='function')setTimeout(()=>toast(`규격 맞춤: ${msg.join(' · ')}`),0)}
function flipFace(f){f.rows.forEach(r=>{r.mods.reverse();r.mods.forEach(m=>{if(m.hinge==='L')m.hinge='R';else if(m.hinge==='R')m.hinge='L'})});f.edited=true}
function flowFix(){const t=job.tallEnd;if(job.cat!=='kitchen'||!t?.on||isCornerLay(job))return false;const f=job.faces.find(q=>q.key===(t.face||'A'));if(!f)return false;if((job.obstacles||[]).some(o=>o.face===f.key&&o.type==='water'))return false;const lo=f.rows.find(r=>r.zone==='lower');if(!lo)return false;const si=lo.mods.findIndex(m=>m.t==='sink'),ci=lo.mods.findIndex(m=>m.t==='cook');if(si<0||ci<0)return false;const side=t.side==='L'?'L':t.side==='R'?'R':null;if(!side)return false;if((side==='R'&&si<ci)||(side==='L'&&si>ci)){flipFace(f);toast('동선(냉장고·키큰장 → 싱크 → 조리대 → 쿡탑)에 맞게 칸 순서를 바꿨어요');return true}return false}
const cookReq=a=>{try{const t=ctSpecJ(job,counterById(job.counterId))?.thick;return(+t||40)>=40?0:cookNeed(a)}catch(e){return cookNeed(a)}};
const appNeed=m=>Math.max(0,...modApps(m).map(({a})=>a.kind==='sink'?sinkNeed(a):a.kind==='cooktop'?cookReq(a):['dw','wash','oven'].includes(a.kind)?(+a.w||0)+(a.kind==='oven'?2*T:0):a.kind==='dryer'?(+a.w||0)+2*T:a.kind==='hood'?(+m.hcab||+a.cab||+a.w||0):0));
function appShortage(fi){const f=job.faces[fi];if(!f)return null;const fi0=job.fi;job.fi=fi;try{const g=geom();let worst=null;g.rows.forEach((row,ri)=>{if(row.zone!=='lower'&&row.zone!=='full')return;const span=row.mods.reduce((a,m)=>a+m.w,0),src=f.rows[ri]?.mods||[],hM=f.rows.find(r=>r.zone==='upper')?.mods.find(m=>m.t==='hood'),hW=hM?(appNeed(hM)||600):0;let need=0,parts=[];row.mods.forEach((m,i)=>{const n=src[i]?(m.t==='cook'&&row.zone==='lower'?Math.max(appNeed(src[i]),hW):appNeed(src[i])):0;if(n){need+=n;parts.push(`${TYPES[m.t]?.label||m.t} ${n}${m.t==='cook'&&hW?' (후드와 한 쌍)':''}`)}else need+=150});if(need>span+1&&(!worst||need-span>worst.short))worst={short:need-span,need,span,parts,talls:(g.talls||[]).reduce((a,t)=>a+t.w,0)}});return worst}finally{job.fi=fi0}}
let SMW_AUTO=false;
function fitAppCabs(){if(job.cat!=='kitchen')return;const fi0=job.fi;SMW_AUTO=true;try{job.faces.forEach((f,fi)=>{job.fi=fi;
    const hoodM=f.rows.find(r=>r.zone==='upper')?.mods.find(m=>m.t==='hood'),hoodW=hoodM?(appNeed(hoodM)||600):0;f.rows.forEach((row,ri)=>{const keep=row.mods.map(m=>m.fix);let ch=false;row.mods.forEach((m,i)=>{const need=m.t==='cook'&&row.zone==='lower'?Math.max(appNeed(m),hoodW):appNeed(m);if(!need)return;const gm=geom().rows[ri]?.mods[i];if(gm&&gm.w<need-1){try{setModWidth(ri,i,need);ch=true}catch(e){}}else if(gm&&m.t==='sink'&&!keep[i]&&gm.w>need+200){try{setModWidth(ri,i,need+100)}catch(e){}}row.mods[i].fix=true});if(row.zone==='lower'&&hoodW){const ci=row.mods.findIndex(m=>m.t==='cook');if(ci===0||ci===row.mods.length-1){const want=Math.max(hoodW,appNeed(row.mods[ci])),gm=geom().rows[ri]?.mods[ci];if(gm&&Math.abs(gm.w-want)>2){row.mods[ci].fix=false;try{setModWidth(ri,ci,want)}catch(e){}}}}row.mods.forEach((m,i)=>{if(!keep[i])delete m.fix})});
    const g=geom(),lr=g.rows.findIndex(r=>r.zone==='lower'),ur=g.rows.findIndex(r=>r.zone==='upper');if(lr<0||ur<0)return;const ck=g.rows[lr].mods.find(m=>m.t==='cook'),hi=g.rows[ur].mods.findIndex(m=>m.t==='hood');if(!ck||hi<0)return;
    const urow=f.rows[ur],hmod=urow.mods[hi],hw=appNeed(hmod)||g.rows[ur].mods[hi].w,ug=g.rows[ur],ux0=Math.min(...ug.mods.map(m=>m.x)),ux1=Math.max(...ug.mods.map(m=>m.x+m.w)),hx=clamp(ck.x+ck.w/2-hw/2,ux0,ux1-hw);
    {const others=urow.mods.filter(m=>m!==hmod),ow=ug.mods.filter((m,i)=>i!==hi);let k=0,acc=ux0;while(k<ow.length&&acc+ow[k].w/2<hx){acc+=ow[k].w;k++}if(hx-ux0>=150&&k===0)k=1;if(hx-ux0<150)k=0;if(ux1-(hx+hw)<150)k=others.length;if(ux1-(hx+hw)>=150&&k===others.length&&others.length)k=others.length-1;
      const nw=[...others.slice(0,k),hmod,...others.slice(k)];if(nw.some((m,i)=>m!==urow.mods[i])){urow.mods.splice(0,urow.mods.length,...nw);f.edited=true}}
    const keep=urow.mods.map(m=>m.fix);try{const hi2=urow.mods.indexOf(hmod);let hm=geom().rows[ur].mods[hi2];if(Math.abs(hm.w-hw)>2)setModWidth(ur,hi2,hw);hmod.fix=true;
      if(job.snap===false)for(let it=0;it<3;it++){hm=geom().rows[ur].mods[hi2];const d=Math.round(hx-hm.x);if(Math.abs(d)<=4)break;if(hi2>0){const nm=geom().rows[ur].mods[hi2-1];setModWidth(ur,hi2-1,Math.max(150,nm.w+d))}else if(hi2+1<urow.mods.length){const nm=geom().rows[ur].mods[hi2+1];setModWidth(ur,hi2+1,Math.max(150,nm.w-d))}else break}}catch(e){}finally{urow.mods.forEach((m,i)=>{if(!keep[i])delete m.fix})}})}finally{job.fi=fi0;SMW_AUTO=false}}
const fitSinkCabs=fitAppCabs;
function setModWidth(ri,i,wmm){const g=geom(),row=g.rows[ri],src=cf().rows[ri].mods,sg=row.segs?row.segs.find(q=>q.idx.includes(i)):null,inS=j=>!sg||sg.idx.includes(j),span=sg?sg.w:row.mods.reduce((a,m)=>a+m.w,0)+(row.gap||0);
  const fixO=src.reduce((a,m,j)=>j!==i&&inS(j)&&m.fix?a+row.mods[j].w:a,0),flex=src.map((m,j)=>j).filter(j=>j!==i&&inS(j)&&!src[j].fix);
  const K_=job.cat==='kitchen'&&job.snap!==false&&!isGap(src[i]),w=clamp(Math.round(Math.min(wmm,K_?SNAP_MAX:1e9)/(K_?SNAP:5))*(K_?SNAP:5),150,Math.max(150,span-fixO-150*flex.length));if(isGap(src[i]))src[i].userW=w;if(K_&&!SMW_AUTO){src[i].userW=w;if(Math.abs(w-wmm)>=1)setTimeout(()=>toast(wmm>SNAP_MAX?`장 폭은 최대 ${SNAP_MAX}mm라 ${w}mm로 맞췄습니다 (문이 처집니다)`:`칸 폭은 50mm 단위라 ${w}mm로 맞췄습니다`),0)}
  if(src[i].fix||!flex.length){src[i].r=w;src[i].fix=true;cf().edited=true;return}
  const others=flex.reduce((a,j)=>a+row.mods[j].w,0)||1,rest=span-fixO-w;flex.forEach(j=>src[j].r=Math.max(150,row.mods[j].w*rest/others));src[i].r=w;cf().edited=true}
