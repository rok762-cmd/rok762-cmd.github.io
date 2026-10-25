/* ---------- 실측 사진 확대: 두 손가락 벌리기·좁히기, 확대 중 한 손가락 끌어 이동, 마우스 휠, ＋/－/맞춤 버튼 ----------
   사진과 표시(svg)에 같은 변환을 걸기 때문에 누른 점 계산(getBoundingClientRect)은 그대로 맞습니다. */
const PZ={z:1,x:0,y:0,pid:null,pts:new Map(),pin:null,pan:null,swallow:0};
const pzWrap=()=>document.getElementById('photoWrap');
function pzSet(){const r=document.documentElement.style,w=pzWrap();if(w){const W=w.clientWidth,H=w.clientHeight;PZ.z=Math.min(8,Math.max(1,PZ.z));PZ.x=Math.min(0,Math.max(W*(1-PZ.z),PZ.x));PZ.y=Math.min(0,Math.max(H*(1-PZ.z),PZ.y));w.classList.toggle('pz-on',PZ.z>1.01)}
  if(PZ.z<=1.01){PZ.z=1;PZ.x=0;PZ.y=0}r.setProperty('--pz',PZ.z);r.setProperty('--pzx',PZ.x+'px');r.setProperty('--pzy',PZ.y+'px');const l=document.getElementById('pzLbl'),t=PZ.z>1?'×'+PZ.z.toFixed(1):'맞춤';if(l&&l.textContent!==t)l.textContent=t;const zk=Math.round(PZ.z*10);if(zk!==PZ.zk){PZ.zk=zk;cancelAnimationFrame(PZ.raf);PZ.raf=requestAnimationFrame(()=>{try{drawOverlay()}catch(e){}})}}
function pzSync(){const pid=job?.photos?.[job.active]?.id??null;if(pid!==PZ.pid){PZ.pid=pid;PZ.z=1;PZ.x=0;PZ.y=0}pzSet()}
function pzAt(z,cx,cy){const nz=Math.min(8,Math.max(1,z)),k=nz/PZ.z;PZ.x=cx-(cx-PZ.x)*k;PZ.y=cy-(cy-PZ.y)*k;PZ.z=nz;pzSet()}
const pzBtns=()=>`<div class="pz-btns"><button type="button" data-act="pz" data-v="in" aria-label="확대">＋</button><button type="button" data-act="pz" data-v="fit" id="pzLbl" aria-label="원래 크기">${PZ.z>1?'×'+PZ.z.toFixed(1):'맞춤'}</button><button type="button" data-act="pz" data-v="out" aria-label="축소">－</button></div>`;
ACT.pz=b=>{const w=pzWrap();if(!w)return;const v=b.dataset.v;if(v==='fit'){PZ.z=1;pzSet();return}pzAt(PZ.z*(v==='in'?1.6:1/1.6),w.clientWidth/2,w.clientHeight/2)};
const pzLocal=(e,w)=>{const r=w.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]};
document.addEventListener('pointerdown',e=>{const w=pzWrap();if(!w||!w.contains(e.target)||e.target.closest('.pz-btns'))return;PZ.pts.set(e.pointerId,pzLocal(e,w));
  if(PZ.pts.size===2){const[a,b]=[...PZ.pts.values()];PZ.pin={d:Math.hypot(a[0]-b[0],a[1]-b[1])||1,m:[(a[0]+b[0])/2,(a[1]+b[1])/2],z:PZ.z,x:PZ.x,y:PZ.y};PZ.pan=null}
  else if(PZ.pts.size===1)PZ.pan={s:pzLocal(e,w),x:PZ.x,y:PZ.y,moved:false}},true);
document.addEventListener('pointermove',e=>{if(!PZ.pts.has(e.pointerId))return;const w=pzWrap();if(!w)return;PZ.pts.set(e.pointerId,pzLocal(e,w));
  if(PZ.pin&&PZ.pts.size>=2){const[a,b]=[...PZ.pts.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]),m=[(a[0]+b[0])/2,(a[1]+b[1])/2],P=PZ.pin,z=Math.min(8,Math.max(1,P.z*d/P.d)),cx=(P.m[0]-P.x)/P.z,cy=(P.m[1]-P.y)/P.z;PZ.z=z;PZ.x=m[0]-cx*z;PZ.y=m[1]-cy*z;PZ.swallow=Date.now()+400;pzSet();e.preventDefault();return}
  if(PZ.pan&&PZ.z>1){const p=pzLocal(e,w),dx=p[0]-PZ.pan.s[0],dy=p[1]-PZ.pan.s[1];if(!PZ.pan.moved&&Math.hypot(dx,dy)<10)return;PZ.pan.moved=true;PZ.x=PZ.pan.x+dx;PZ.y=PZ.pan.y+dy;PZ.swallow=Date.now()+400;pzSet();e.preventDefault()}},{passive:false});
const pzEnd=e=>{if(!PZ.pts.delete(e.pointerId))return;if(PZ.pts.size<2)PZ.pin=null;if(!PZ.pts.size)PZ.pan=null};
document.addEventListener('pointerup',pzEnd);document.addEventListener('pointercancel',pzEnd);
document.addEventListener('click',e=>{if(Date.now()<PZ.swallow&&pzWrap()?.contains(e.target)&&!e.target.closest('.pz-btns')){e.stopPropagation();e.preventDefault();PZ.swallow=0}},true);
document.addEventListener('wheel',e=>{const w=pzWrap();if(!w||!w.contains(e.target))return;e.preventDefault();const[cx,cy]=pzLocal(e,w);pzAt(PZ.z*Math.exp(-e.deltaY*.0015),cx,cy)},{passive:false});
document.addEventListener('dblclick',e=>{const w=pzWrap();if(!w||!w.contains(e.target)||tool)return;const[cx,cy]=pzLocal(e,w);if(PZ.z>1){PZ.z=1;pzSet()}else pzAt(2.5,cx,cy)});
let pzLastW=null;try{new MutationObserver(()=>{const w=pzWrap();if(w&&w!==pzLastW){pzLastW=w;pzSync()}}).observe(document.body,{childList:true,subtree:true})}catch(e){}
