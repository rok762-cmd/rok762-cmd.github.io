/* ---------- 한 장 제안서 ---------- */
const u8b64=s=>btoa(unescape(encodeURIComponent(s)));
async function snap3D(j){try{await load3D();const T3=THREE,ren=new T3.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});ren.setPixelRatio(1);ren.setSize(1300,820,false);
  const scene=new T3.Scene();scene.background=new T3.Color('#f4f2ee');scene.add(new T3.HemisphereLight(0xffffff,0x9a958c,.78));const dl=new T3.DirectionalLight(0xffffff,.55);dl.position.set(3,6,5);scene.add(dl);const d2=new T3.DirectionalLight(0xffffff,.22);d2.position.set(-4,3,-2);scene.add(d2);
  const grp=build3D(j,false);scene.add(grp);const bb=new T3.Box3().setFromObject(grp),sz=bb.getSize(new T3.Vector3()),tg=bb.getCenter(new T3.Vector3());tg.y=Math.min(tg.y,1);
  const r=Math.max(sz.x,sz.z,2.4)*1.05+.8,th={I:0,niche:0,L:Math.PI/4,Lisland:Math.PI/4,U:0,island:.35,II:Math.PI/2}[j.layout]??0,ph=j.layout==='II'?.8:.4,cam=new T3.PerspectiveCamera(36,1300/820,.3,60);
  cam.position.set(tg.x+r*Math.sin(th)*Math.cos(ph),tg.y+r*Math.sin(ph),tg.z+r*Math.cos(th)*Math.cos(ph));cam.lookAt(tg);ren.render(scene,cam);const u=ren.domElement.toDataURL('image/jpeg',.9);
  grp.traverse(o=>{o.geometry&&o.geometry.dispose()});ren.dispose();return{u,w:1300,h:820}}catch(e){return null}}
async function proposalPage(j=job){const W=1400,H=990,g=gview(j,j.fi),d=doorById(j.doorId)||{name:'-',kind:'none',color:'#ECE9E3'},q=quote(j),c=j.cat==='kitchen'?counterById(j.counterId):null,P='p'+uid();
  let hero=null;if(j.cat==='kitchen')hero=await snap3D(j);
  if(!hero){const s=sceneSVG(j,{fi:j.fi,caption:false,px:1300});const hh=+s.match(/height="(\d+)"/)[1];hero={u:'data:image/svg+xml;base64,'+u8b64(s),w:1300,h:hh}}
  const hx=36,hy=78,hw=840,hh=500,sc=Math.min(hw/hero.w,hh/hero.h),iw=hero.w*sc,ih=hero.h*sc;
  let s=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}"><style>${PAPER_CSS}</style><defs>${finishDefs(P,d,.3)}</defs><rect width="${W}" height="${H}" fill="#fff"/>`;
  s+=`<rect x="16" y="16" width="${W-32}" height="${H-32}" class="fr" stroke-width="2"/><text x="36" y="52" font-size="24" class="hd">${esc(CATS[j.cat].name)} 디자인 제안서</text><text x="36" y="70" font-size="13" class="lb">${esc((j.customer.name||'').replace(/^예시\)\s*/,''))} · ${esc(j.customer.addr||'')} · ${LAYOUTS[j.layout]}</text>`;
  s+=`<text x="${W-36}" y="52" font-size="15" class="hd" text-anchor="end">${esc(catalog.company.name)}</text><text x="${W-36}" y="70" font-size="12" class="lb" text-anchor="end">${esc(catalog.company.tel||'')} · No. ${esc(j.docNo)} · ${new Date().toLocaleDateString('ko-KR')}</text><line x1="16" y1="80" x2="${W-16}" y2="80" class="fr"/>`;
  s+=`<rect x="${hx}" y="${hy+10}" width="${hw}" height="${hh}" fill="#f4f2ee" rx="8"/><image x="${hx+(hw-iw)/2}" y="${hy+10+(hh-ih)/2}" width="${iw}" height="${ih}" href="${hero.u}" xlink:href="${hero.u}" preserveAspectRatio="xMidYMid meet"/>`;
  const rx=900,rw=W-36-rx;let y=104;const head=t=>{s+=`<text x="${rx}" y="${y}" font-size="14" class="hd">${esc(t)}</text><line x1="${rx}" y1="${y+6}" x2="${rx+rw}" y2="${y+6}" stroke="#ccc"/>`;y+=26};
  const row=(k,v,sw)=>{if(sw)s+=sw(rx,y-13);s+=`<text x="${rx+(sw?30:0)}" y="${y}" font-size="12.5" class="lb">${esc(k)}</text><text x="${rx+rw}" y="${y}" font-size="12.5" class="vl" text-anchor="end">${esc(fitText(String(v),Math.max(10,rw-150)))}</text>`;y+=21};
  const sq=col=>(x,yy)=>`<rect x="${x}" y="${yy}" width="20" height="16" rx="3" fill="${col}" stroke="#999"/>`;
  head('자재 · 마감');row('도어',d.name,(x,yy)=>`<rect x="${x}" y="${yy}" width="20" height="16" rx="3" fill="${solidFill(P,d)}" stroke="#999"/>`);row('몸체',d.kind==='none'?d.name:`PB ${T}T 화이트`,sq(d.kind==='none'?d.color:'#ECE9E3'));
  if(c)row('상판',c.name,sq(c.color||'#eee'));if(d.kind==='hinged')row('손잡이',handleSummary(j).replace(/ · /g,', '),sq('#2c2e31'));
  {const lp=lightPlan(j);row('조명',lp.runs.length?`${Object.keys(lp.byT).map(t=>LT[t].label).join('·')} ${CCT[lp.cct][0]}`:'없음')}
  if(g.pl)row('걸레받이',`${g.pl}mm`);y+=6;
  head('사양');j.faces.forEach((f,i)=>{const gg=geom(j,i);row(FACE_NAME(f.key),`${gg.Wm} × ${gg.Hm} × ${gg.D}`)});row('마감',finishText(g));
  {const opts=[...(isCornerLay(j)&&!isMD(j.cat)?[`코너 ${CORNER_T[cKind(j,j.cat==='kitchen'?'lower':'full')]}`]:[]),...(lidOn(j)?['코너 리프트업 상판']:[]),...(j.tallEnd?.on&&j.cat==='kitchen'?[`키큰장 ${TALL_K[j.tallEnd.k||'combo']}`]:[]),...(penOn(j)?['반도형 카운터']:[]),...(j.faces.some(f=>f.key==='I')?[`아일랜드 문 ${j.island?.front==='room'?'거실 쪽':'싱크대 쪽'}`]:[])];if(opts.length)row('구성',opts.join(', '))}
  y+=6;head('색상');{let x=rx;[[d.color,'도어'],[d.kind==='none'?d.color:'#ECE9E3','몸체'],...(c?[[c.color||'#eee','상판']]:[]),['#2c2e31','손잡이']].forEach(([col,l])=>{s+=`<rect x="${x}" y="${y-12}" width="44" height="30" rx="4" fill="${col}" stroke="#999"/><text x="${x+22}" y="${y+32}" font-size="11" class="lb" text-anchor="middle">${l}</text>`;x+=62});y+=50}
  if(j.propPrice!==false){head('견적');row('합계 (부가세 포함)',`${won(q.total)}원`);s+=`<text x="${rx}" y="${y}" font-size="10.5" class="lb">실측 기준 · 현장 여건에 따라 달라질 수 있습니다</text>`;y+=22}
  const notes=[...reqsFor(j,'site'),...reqsFor(j,'factory')].filter((v,i,a)=>a.indexOf(v)===i).slice(0,4);if(notes.length&&y<560){head('요청 사항');notes.forEach(t=>{if(y<580){s+=`<text x="${rx}" y="${y}" font-size="12" fill="#111">· ${esc(fitText(t,rw-14))}</text>`;y+=19}})}
  s+=`<line x1="16" y1="618" x2="${W-16}" y2="618" class="fr"/>`;
  const dd=doorById(j.doorId)||{kind:'none'};const ext=k=>techExterior(g,dd,k)+dimH(0,g.Wm,g.H+42*k,`${g.Wm}`,k,g.H)+dimV(0,g.H,g.Wm+50*k,`${g.H}`,k);
  const intr=k=>{let t=techInterior(g,k);const top=g.rows[g.rows.length-1];top.mods.forEach(m=>t+=dimH(m.x,m.x+m.w,g.H+36*k,`${m.w}`,k,top.z1));return t};
  s+=placeView({x:36,y:628,w:440,h:340},`정면도${j.faces.length>1?' · '+FACE_NAME(g.face):''}`,(g.Wm+g.ext)*1.2,g.H*1.2,ext);
  s+=placeView({x:490,y:628,w:440,h:340},isMD(g.cat)?'문짝 구성':'내부 구성',(g.Wm+g.ext)*1.12,g.H*1.2,intr);
  s+=`<text x="944" y="644" font-size="15" class="hd">평면도${j.room?.on?' · 방 전체':''}</text>`+(j.room?.on?`<image x="944" y="652" width="420" height="310" href="data:image/svg+xml;base64,${u8b64(roomSVG(j,{w:420,h:310}))}"/>`:planPlace(j,{x:944,y:652,w:420,h:310},g.face));
  return{w:W,h:H,svg:s+'</svg>'}}
let propCache=null;
async function renderProposal(){const box=$('#propBox');if(!box)return;box.innerHTML='<p class="hint" style="padding:30px">제안서를 만드는 중…</p>';const p=await proposalPage();propCache=p;if(box.isConnected)box.innerHTML=p.svg}
async function propDoc(){const p=propCache||await proposalPage(),nm0=(job.customer.name||'고객').replace(/^예시\)\s*/,'').trim(),nm=/님$/.test(nm0)?nm0:nm0+' 님';
  return{...quoteDoc(),pages:[{...p,mm:.3}],file:fname('제안서.pdf').replace(/\.pdf$/,'_A4.pdf'),subject:`[${catalog.company.name}] ${CATS[job.cat].name} 디자인 제안서 · ${nm}`,
    text:`${nm} 안녕하세요, ${catalog.company.name}입니다.\n상담하신 ${CATS[job.cat].name} 디자인 제안서를 보내드립니다.\n\n· 현장: ${job.customer.addr||'-'}\n${job.propPrice!==false?`· 예상 금액: ${won(quote().total)}원 (부가세 포함)\n`:''}\n궁금하신 점은 편하게 연락 주세요.\n문의: ${catalog.company.tel}`}}

/* ---------- 손 메모 사진 → 자동 입력 ---------- */
let SAMPLE=null,SK_OK=false;
(async()=>{try{SAMPLE=!LOCAL&&window.claude?.use?await window.claude.use('sample'):null;if(SAMPLE){const lm=await SAMPLE.limits().catch(()=>null);SK_OK=!!lm?.images;if(SK_OK&&step===1)renderStage()}}catch(e){SAMPLE=null}})();
async function sketchBlob(file){return new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{const sc=Math.min(1,1600/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*sc);c.height=Math.round(im.height*sc);c.getContext('2d').drawImage(im,0,0,c.width,c.height);c.toBlob(b=>b?res(b):rej(),'image/jpeg',.85)};im.onerror=rej;im.src=fr.result};fr.onerror=rej;fr.readAsDataURL(file)})}
let SKRES=null;
async function readSketch(file){if(!SAMPLE){toast('이 기능은 claude.ai에서 연 본 앱에서만 쓸 수 있습니다');return}
  const lay=$('#layer');lay.innerHTML=`<div class="overlay center"><div class="modal" role="dialog" aria-modal="true" aria-label="손 메모 읽는 중" style="width:min(520px,100%)"><div class="modal-body"><b>손 메모를 읽는 중…</b><p class="hint" style="margin:0" id="skProg">사진을 보내는 중</p><button type="button" class="btn" data-act="sk-cancel">취소</button></div></div></div>`;
  window.__skAbort=new AbortController();
  try{const blob=await sketchBlob(file);$('#skProg')&&($('#skProg').textContent='AI가 형태와 치수를 읽고 있어요 (10~30초)');
    const cats=Object.entries(CATS).map(([k,v])=>`${k}=${v.name}`).join(', '),lays=Object.entries(CAT_LAYOUTS).map(([k,v])=>`${k}: ${v.map(l=>l+'('+LAYOUTS[l]+')').join(' ')}`).join(' / ');
    const prompt=`첨부 사진은 인테리어 현장에서 손으로 그린 실측 메모(평면 스케치와 치수)입니다. 사진에서 읽을 수 있는 것만 아래 JSON 하나로 답하세요. 설명 문장은 쓰지 마세요.
{"cat": 품목 키 또는 null, "layout": 형태 키 또는 null, "faces": {"A": 숫자|null, "B": 숫자|null, "C": 숫자|null, "I": 숫자|null}, "H": 숫자|null, "D": 숫자|null, "span": 숫자|null, "islandGap": 숫자|null, "customer": {"name": 문자|null, "addr": 문자|null, "phone": 문자|null}, "notes": [문자], "unclear": [문자]}
규칙:
- 품목 키: ${cats}
- 형태 키(품목별): ${lays}. 그림 모양을 보고 고르세요 (한 벽만=I, 꺾임 1번=L, ㄷ자=U, 마주보는 두 줄=II, 벽 안에 쏙=niche, 섬=island).
- 모든 치수는 mm 정수. cm로 보이면(예: 240) 10을 곱하고, m면 1000을 곱하세요. 2400처럼 4자리면 mm입니다.
- faces.A는 가장 긴 주벽 길이, B는 꺾인 두 번째 벽(ㄱ·ㄷ자), C는 세 번째 벽(ㄷ자), I는 아일랜드 길이. H는 천장 높이, D는 장 깊이, span은 11자형 벽 사이 거리, islandGap은 아일랜드 통로 폭.
- notes에는 콘센트·수도·분배기·보일러·창문·문 위치, 고객 요청 등 메모를 짧게 한국어로.
- 확실하지 않은 숫자는 넣지 말고 unclear에 "B 길이 숫자가 흐림"처럼 적으세요.`;
    const r=await SAMPLE.json(prompt,{images:[blob],modelTier:'default',signal:window.__skAbort.signal});SKRES=r||{};showSketch()}
  catch(e){if(e?.code==='cancelled'){lay.innerHTML='';return}lay.innerHTML='';toast(e?.code==='not_granted'?'Claude 사용을 허락해야 읽을 수 있습니다':e?.code==='rate_limited'?'잠시 후 다시 시도해 주세요':e?.code==='invalid_json'?'메모를 정확히 읽지 못했습니다. 더 밝고 가깝게 찍어 주세요':'메모를 읽지 못했습니다')}}
function showSketch(){const r=SKRES||{},lay=$('#layer'),cat=CATS[r.cat]?r.cat:job.cat,lyt=CAT_LAYOUTS[cat]?.includes(r.layout)?r.layout:null,F=r.faces||{},cu=r.customer||{};
  const rows=[['품목',CATS[cat]?.name+(r.cat&&CATS[r.cat]?'':' (그대로)')],['형태',lyt?LAYOUTS[lyt]:'(읽지 못함 · 그대로)'],...['A','B','C','I'].filter(k=>+F[k]>0).map(k=>[FACE_NAME(k)+' 길이',`${F[k]} mm`]),...(+r.H>0?[['높이',`${r.H} mm`]]:[]),...(+r.D>0?[['깊이',`${r.D} mm`]]:[]),...(+r.span>0?[['벽 사이',`${r.span} mm`]]:[]),...(+r.islandGap>0?[['아일랜드 통로',`${r.islandGap} mm`]]:[]),...(cu.name?[['고객명',cu.name]]:[]),...(cu.addr?[['주소',cu.addr]]:[]),...(cu.phone?[['연락처',cu.phone]]:[])];
  lay.innerHTML=`<div class="overlay center"><div class="modal" role="dialog" aria-modal="true" aria-label="손 메모 읽은 결과" style="width:min(560px,100%)"><div class="modal-head"><h2 style="font-size:18px">손 메모에서 읽은 내용</h2><button type="button" class="btn sm" data-act="mgr-close">닫기</button></div><div class="modal-body" style="gap:10px">
    <table style="width:100%"><tbody>${rows.map(([k,v])=>`<tr><td class="hint" style="padding:4px 8px 4px 0">${esc(k)}</td><td style="padding:4px 0"><b>${esc(String(v))}</b></td></tr>`).join('')}</tbody></table>
    ${(r.notes||[]).length?`<div><div class="label">메모</div>${r.notes.map(t=>`<div style="font-size:14px">· ${esc(t)}</div>`).join('')}</div>`:''}
    ${(r.unclear||[]).length?`<div style="color:var(--warn);font-size:14px"><b>확인 필요</b>${r.unclear.map(t=>`<div>· ${esc(t)}</div>`).join('')}</div>`:''}
    <p class="hint" style="margin:0">AI가 읽은 값이라 틀릴 수 있어요. 적용한 뒤 치수를 꼭 한 번 확인해 주세요.</p>
    <div class="toolbar" style="margin:0;justify-content:flex-end"><button type="button" class="btn" data-act="mgr-close">취소</button><button type="button" class="btn primary" data-act="sk-apply">이대로 적용</button></div></div></div></div>`}
function applySketch(){const r=SKRES||{},F=r.faces||{},cu=r.customer||{},okn=v=>+v>=100&&+v<=20000;
  if(CATS[r.cat]&&r.cat!==job.cat)setCat(r.cat);if(CAT_LAYOUTS[job.cat]?.includes(r.layout)&&r.layout!==job.layout)setLayout(r.layout);
  job.faces.forEach(f=>{if(okn(F[f.key]))f.len=Math.round(+F[f.key])});if(okn(r.H))job.dims.H=Math.round(+r.H);if(+r.D>=200&&+r.D<=1200)job.dims.D=Math.round(+r.D);if(okn(r.span))job.span=Math.round(+r.span);if(+r.islandGap>=500&&+r.islandGap<=3000&&job.island)job.island.gap=Math.round(+r.islandGap);
  if(cu.name)job.customer.name=String(cu.name).slice(0,40);if(cu.addr)job.customer.addr=String(cu.addr).slice(0,100);if(cu.phone)job.customer.phone=String(cu.phone).slice(0,30);
  if((r.notes||[]).length)job.customer.memo=[job.customer.memo,...r.notes.map(String)].filter(Boolean).join('\n').slice(0,1000);
  $('#layer').innerHTML='';render();toast('손 메모 내용을 넣었습니다 · 치수를 확인해 주세요')}
/* ---------- 방 평면도 (현장 전체) ---------- */
const RWALL={top:'위쪽 벽',right:'오른쪽 벽',bottom:'아래쪽 벽',left:'왼쪽 벽'};
const RITEM={door:{l:'문',w:900},window:{l:'창문',w:1200},pipe:{l:'수도·배관',w:0},outlet:{l:'콘센트',w:0},boiler:{l:'분배기·보일러',w:0},pillar:{l:'기둥',w:400}};
function roomOf(j=job){const A=j.faces.find(f=>f.key==='A'),B=j.faces.find(f=>f.key==='B');const r=j.room||{};return{on:!!r.on,W:+r.W||Math.max(2400,(+A?.len||2400)+600),L:+r.L||Math.max(2400,(B&&j.layout!=='II'?+B.len:0)+900,3000),wall:RWALL[r.wall]?r.wall:'top',off:Math.max(0,+r.off||0),items:Array.isArray(r.items)?r.items:[]}}
const rLen=(R,w)=>w==='top'||w==='bottom'?R.W:R.L;
function rPt(R,w,o,d=0){return w==='top'?[o,d]:w==='right'?[R.W-d,o]:w==='bottom'?[R.W-o,R.L-d]:[d,R.L-o]}
function rX(R){const o=R.off;return R.wall==='top'?(x,y)=>[o+x,y]:R.wall==='right'?(x,y)=>[R.W-y,o+x]:R.wall==='bottom'?(x,y)=>[R.W-o-x,R.L-y]:(x,y)=>[y,R.L-o-x]}
function pip(pt,poly){let c=false;for(let i=0,k=poly.length-1;i<poly.length;k=i++){const[xi,yi]=poly[i],[xk,yk]=poly[k];if(((yi>pt[1])!==(yk>pt[1]))&&pt[0]<(xk-xi)*(pt[1]-yi)/(yk-yi)+xi)c=!c}return c}
function roomGeo(j=job){const R=roomOf(j),pg=planGeo(j),X=rX(R),T_=p=>X(p[0],p[1]);
  const cabs=[...pg.rects.map(r=>({key:r.key,poly:[[r.x,r.y],[r.x+r.w,r.y],[r.x+r.w,r.y+r.h],[r.x,r.y+r.h]].map(T_),r})),...(pg.polys||[]).map((p,i)=>({key:'C'+i,poly:p.map(T_),corner:true}))];
  const inRoom=p=>p[0]>=-1&&p[1]>=-1&&p[0]<=R.W+1&&p[1]<=R.L+1,blocked=p=>cabs.some(c=>pip(p,c.poly));
  const warn=[],clr=[];
  cabs.forEach(c=>{if(c.poly.some(p=>!inRoom(p)))warn.push(`${c.key==='I'?'아일랜드':c.corner?'코너장':FACE_NAME(c.key)} 장이 방 밖으로 나갑니다 · 방 크기나 시작 위치를 확인하세요`)});
  pg.rects.forEach(r=>{if(r.key==='T')return;const lk=r.key,fr=lk==='A'?[[r.x+r.w/2,r.y+r.h],[0,1]]:lk==='I'?[[r.x+r.w/2,r.y],[0,-1]]:lk==='C'?[[r.x,r.y+r.h/2],[-1,0]]:r.flip?[[r.x+r.w/2,r.y],[0,-1]]:[[r.x+r.w,r.y+r.h/2],[1,0]];
    const p0=X(fr[0][0],fr[0][1]),p1=X(fr[0][0]+fr[1][0],fr[0][1]+fr[1][1]),dv=[p1[0]-p0[0],p1[1]-p0[1]];let d=0;
    for(d=10;d<8000;d+=10){const q=[p0[0]+dv[0]*d,p0[1]+dv[1]*d];if(!inRoom(q)||blocked(q))break}
    clr.push({key:lk,a:p0,b:[p0[0]+dv[0]*d,p0[1]+dv[1]*d],d:Math.round(d/10)*10});if(d<800)warn.push(`${lk==='I'?'아일랜드':FACE_NAME(lk)} 앞 통로가 ${Math.round(d/10)*10}mm로 좁습니다 (서랍·문 열면 700~900 필요)`)});
  const H=+j.dims.H||2300,k=j.cat==='kitchen';
  R.items.forEach(it=>{const L=rLen(R,it.wall),o=+it.off||0,w=+it.w||0;if(o+w>L+1)warn.push(`${RITEM[it.type]?.l||'항목'} 위치가 ${RWALL[it.wall]} 길이(${L})를 넘습니다`);
    if(it.type==='door'&&w>0){const hingeO=it.hinge==='R'?o+w:o,hp=rPt(R,it.wall,hingeO,0),inside=it.open!=='out';if(inside){let hit=false;for(let a=0;a<=90&&!hit;a+=10)for(let r_=100;r_<=w&&!hit;r_+=100){const along=it.hinge==='R'?hingeO-r_*Math.cos(a*Math.PI/180):hingeO+r_*Math.cos(a*Math.PI/180),q=rPt(R,it.wall,along,r_*Math.sin(a*Math.PI/180));if(blocked(q))hit=true}
      if(hit)warn.push(`${RWALL[it.wall]} 문(${w})을 열면 장에 부딪힙니다 · 문 방향이나 장 위치를 바꾸세요`)}
      if(cabs.some(c=>[0.1,.5,.9].some(t=>pip(rPt(R,it.wall,o+w*t,30),c.poly))))warn.push(`${RWALL[it.wall]} 문 자리 앞을 장이 막습니다`)}
    if(it.type==='window'&&w>0){const sill=+it.sill||900,top_=sill+(+it.h||1200),over=cabs.filter(c=>[0.1,.5,.9].some(t=>pip(rPt(R,it.wall,o+w*t,100),c.poly)));
      over.forEach(c=>{const tall=!k||c.key==='T'?false:true;const cabTop=k?(c.key==='I'?CTH:H):H;const lowBlock=k&&sill<CTH+30;const upBlock=k&&top_>H-CTH+100;if(!k&&sill<H)warn.push(`${RWALL[it.wall]} 창문(하단 ${sill}) 앞을 ${FACE_NAME(c.key)} 장이 가립니다`);else if(lowBlock)warn.push(`${RWALL[it.wall]} 창문 하단 ${sill}이 상판(${CTH})보다 낮습니다`);else if(upBlock&&c.key!=='I')warn.push(`${RWALL[it.wall]} 창문 위쪽이 상부장 자리와 겹칩니다 · 창 앞은 상부장을 빼세요`)})}
    if(it.type==='pillar'&&w>0){if(cabs.some(c=>[0,.5,1].some(t=>pip(rPt(R,it.wall,o+w*t,(+it.d||300)/2),c.poly))))warn.push(`${RWALL[it.wall]} 기둥이 장과 겹칩니다 · 기둥 따내기 필요`)}});
  return{R,cabs,clr,warn:[...new Set(warn)]}}
function roomSVG(j=job,{w=640,h=460,label=true}={}){const G=roomGeo(j),R=G.R,pad=Math.max(R.W,R.L)*.13+300,vb=[-pad,-pad,R.W+2*pad,R.L+2*pad],k=Math.max(R.W,R.L)/1000,kt=k*.42;
  const P=p=>`${f(p[0])},${f(p[1])}`;let s=`<svg viewBox="${vb.join(' ')}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" font-family="${FONT}" style="max-width:100%;height:auto;background:#fff">`;
  s+=`<rect x="0" y="0" width="${R.W}" height="${R.L}" fill="#FBFAF7"/><rect x="${-120}" y="${-120}" width="${R.W+240}" height="${R.L+240}" fill="none" stroke="#333" stroke-width="120"/>`;
  G.cabs.forEach(c=>{s+=`<polygon points="${c.poly.map(P).join(' ')}" fill="${c.key==='T'?'#F1E7D6':'#DCE6FB'}" stroke="#1E56D0" stroke-width="${12*k}"/>`;const cx=c.poly.reduce((a,p)=>a+p[0],0)/c.poly.length,cy=c.poly.reduce((a,p)=>a+p[1],0)/c.poly.length;if(label&&!c.corner)s+=`<text x="${f(cx)}" y="${f(cy+40*k)}" font-size="${f(110*kt)}" text-anchor="middle" fill="#1E56D0" font-weight="700">${c.key==='I'?'아일랜드':c.key==='T'?'식탁':c.key}</text>`});
  R.items.forEach(it=>{const o=+it.off||0,w_=+it.w||0,c=it.type==='door'?'#B4520F':it.type==='window'?'#0F7C9B':it.type==='pillar'?'#555':'#7A3FB0';
    if(it.type==='door'||it.type==='window'){const a=rPt(R,it.wall,o,-120),b=rPt(R,it.wall,o+w_,0);s+=`<rect x="${f(Math.min(a[0],b[0]))}" y="${f(Math.min(a[1],b[1]))}" width="${f(Math.abs(a[0]-b[0])||1)}" height="${f(Math.abs(a[1]-b[1])||1)}" fill="#fff"/>`;
      if(it.type==='window'){const a1=rPt(R,it.wall,o,-40),b1=rPt(R,it.wall,o+w_,-40),a2=rPt(R,it.wall,o,-80),b2=rPt(R,it.wall,o+w_,-80);s+=`<line x1="${f(a1[0])}" y1="${f(a1[1])}" x2="${f(b1[0])}" y2="${f(b1[1])}" stroke="${c}" stroke-width="${16*k}"/><line x1="${f(a2[0])}" y1="${f(a2[1])}" x2="${f(b2[0])}" y2="${f(b2[1])}" stroke="${c}" stroke-width="${16*k}"/>`}
      else{const hO=it.hinge==='R'?o+w_:o,dir=it.open==='out'?-1:1,hp=rPt(R,it.wall,hO,0),lp=rPt(R,it.wall,hO,dir*w_),ep=rPt(R,it.wall,it.hinge==='R'?o:o+w_,0);let arc='';for(let a=0;a<=90;a+=10){const al=it.hinge==='R'?hO-w_*Math.cos(a*Math.PI/180):hO+w_*Math.cos(a*Math.PI/180);arc+=(a?' L ':'M ')+P(rPt(R,it.wall,al,dir*w_*Math.sin(a*Math.PI/180)))}
        s+=`<line x1="${f(hp[0])}" y1="${f(hp[1])}" x2="${f(lp[0])}" y2="${f(lp[1])}" stroke="${c}" stroke-width="${18*k}"/><path d="${arc}" fill="none" stroke="${c}" stroke-width="${10*k}" stroke-dasharray="${50*k} ${35*k}"/>`}
      const m=rPt(R,it.wall,o+w_/2,it.type==='door'&&it.open!=='out'?-260:260);s+=`<text x="${f(m[0])}" y="${f(m[1])}" font-size="${f(80*kt)}" text-anchor="middle" fill="${c}">${RITEM[it.type].l} ${w_}${it.type==='window'?` · 하단 ${+it.sill||900}`:''}</text>`}
    else if(it.type==='pillar'){const d=+it.d||300,a=rPt(R,it.wall,o,0),b=rPt(R,it.wall,o+w_,d);s+=`<rect x="${f(Math.min(a[0],b[0]))}" y="${f(Math.min(a[1],b[1]))}" width="${f(Math.abs(a[0]-b[0]))}" height="${f(Math.abs(a[1]-b[1]))}" fill="#888" stroke="#333" stroke-width="${8*k}"/>`}
    else{const p=rPt(R,it.wall,o,60);s+=`<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(28*k)}" fill="${c}"/><text x="${f(p[0])}" y="${f(p[1]+170*k)}" font-size="${f(70*kt)}" text-anchor="middle" fill="${c}">${RITEM[it.type].l}</text>`}});
  G.clr.forEach(c=>{if(c.d<60)return;const mx=c.a[0]+(c.b[0]-c.a[0])*.3,my=c.a[1]+(c.b[1]-c.a[1])*.3,col=c.d<800?'#C0362C':'#B4520F';s+=`<line x1="${f(c.a[0])}" y1="${f(c.a[1])}" x2="${f(c.b[0])}" y2="${f(c.b[1])}" stroke="${col}" stroke-width="${8*k}" stroke-dasharray="${30*k} ${20*k}"/><text x="${f(mx+40*k)}" y="${f(my)}" font-size="${f(85*kt)}" fill="${col}" font-weight="700">통로 ${c.d}</text>`});
  if(j.cat==='kitchen')s+=workTriSVG(j,kt*2.4,rX(R));
  const dl=(a,b,lab,off)=>`<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" stroke="#1E56D0" stroke-width="${6*k}"/><text x="${f((a[0]+b[0])/2+off[0])}" y="${f((a[1]+b[1])/2+off[1])}" font-size="${f(95*kt)}" text-anchor="middle" fill="#1E56D0">${lab}</text>`;
  s+=dl([0,-260],[R.W,-260],`가로 ${R.W}`,[0,-40*k])+dl([-260,0],[-260,R.L],'',[0,0])+`<text x="${f(-320)}" y="${f(R.L/2)}" font-size="${f(95*kt)}" text-anchor="middle" fill="#1E56D0" transform="rotate(-90 ${f(-300)} ${f(R.L/2)})">세로 ${R.L}</text>`;
  return s+'</svg>'}
function roomUI(){const r=job.room||{},R=roomOf(job),on=!!r.on,G=on?roomGeo(job):null;
  const num=(k,v,l,wd=90)=>`<label class="hint" style="display:inline-flex;align-items:center;gap:6px">${l}<input class="input mono" style="width:${wd}px;min-height:36px" inputmode="numeric" data-change="room" data-k="${k}" value="${v}"></label>`;
  return`<div style="display:grid;gap:10px"><label class="toolbar" style="margin:0;gap:8px"><input type="checkbox" data-change="room-on" ${on?'checked':''}> <b>방 전체 평면 그리기</b> <span class="hint">문·창문·배관 위치와 통로 폭을 함께 확인</span></label>
  ${on?`<div class="toolbar" style="margin:0;flex-wrap:wrap">${num('W',R.W,'방 가로')}${num('L',R.L,'방 세로')}</div>
  <div class="toolbar" style="margin:0;flex-wrap:wrap"><span class="hint">A면 장이 붙는 벽</span><div class="seg">${Object.entries(RWALL).map(([v,l])=>`<button type="button" data-act="room-wall" data-v="${v}" aria-pressed="${R.wall===v}">${l.replace(' 벽','')}</button>`).join('')}</div>${num('off',R.off,'벽 왼쪽 끝에서',80)}</div>
  <div class="canvas plan" style="background:#fff;border-radius:12px;padding:6px">${roomSVG(job,{w:620,h:460})}</div>
  ${G.warn.length?`<div style="display:grid;gap:4px">${G.warn.map(t=>`<div class="make" style="margin:0;color:var(--warn)">⚠ ${esc(t)}</div>`).join('')}</div>`:'<div class="hint" style="margin:0">✓ 문·창문·통로에 걸리는 곳이 없습니다</div>'}
  <div class="toolbar" style="margin:0;flex-wrap:wrap"><span class="hint">추가</span>${Object.entries(RITEM).map(([v,x])=>`<button type="button" class="btn sm" data-act="ritem-add" data-v="${v}">+ ${x.l}</button>`).join('')}</div>
  ${R.items.map(it=>`<div class="toolbar" style="margin:0;flex-wrap:wrap;gap:6px;padding:8px;border:1px solid var(--line);border-radius:10px"><b style="min-width:64px">${RITEM[it.type]?.l||''}</b>
    <select class="input" style="width:auto;min-height:36px" data-change="ritem" data-id="${it.id}" data-k="wall">${Object.entries(RWALL).map(([v,l])=>`<option value="${v}" ${it.wall===v?'selected':''}>${l}</option>`).join('')}</select>
    <label class="hint" style="display:inline-flex;align-items:center;gap:4px">왼쪽 끝에서<input class="input mono" style="width:76px;min-height:36px" inputmode="numeric" data-change="ritem" data-id="${it.id}" data-k="off" value="${it.off||0}"></label>
    ${RITEM[it.type]?.w?`<label class="hint" style="display:inline-flex;align-items:center;gap:4px">폭<input class="input mono" style="width:70px;min-height:36px" inputmode="numeric" data-change="ritem" data-id="${it.id}" data-k="w" value="${it.w||0}"></label>`:''}
    ${it.type==='door'?`<div class="seg"><button type="button" data-act="ritem-set" data-id="${it.id}" data-k="open" data-v="in" aria-pressed="${it.open!=='out'}">안으로 열림</button><button type="button" data-act="ritem-set" data-id="${it.id}" data-k="open" data-v="out" aria-pressed="${it.open==='out'}">밖으로</button></div><div class="seg"><button type="button" data-act="ritem-set" data-id="${it.id}" data-k="hinge" data-v="L" aria-pressed="${it.hinge!=='R'}">경첩 왼쪽</button><button type="button" data-act="ritem-set" data-id="${it.id}" data-k="hinge" data-v="R" aria-pressed="${it.hinge==='R'}">오른쪽</button></div>`:''}
    ${it.type==='window'?`<label class="hint" style="display:inline-flex;align-items:center;gap:4px">창 하단 높이<input class="input mono" style="width:70px;min-height:36px" inputmode="numeric" data-change="ritem" data-id="${it.id}" data-k="sill" value="${it.sill||900}"></label>`:''}
    ${it.type==='pillar'?`<label class="hint" style="display:inline-flex;align-items:center;gap:4px">깊이<input class="input mono" style="width:70px;min-height:36px" inputmode="numeric" data-change="ritem" data-id="${it.id}" data-k="d" value="${it.d||300}"></label>`:''}
    <button type="button" class="btn sm quiet danger" data-act="ritem-del" data-id="${it.id}">삭제</button></div>`).join('')}`:''}</div>`}
function roomPage(j=job){const W=1400,H=990,G=roomGeo(j);let s=pageHead(j,'현장 평면도 · 방 전체','문·창문·설비 위치와 통로 · ');
  const inner=roomSVG(j,{w:900,h:780});s+=`<image x="36" y="90" width="900" height="780" href="data:image/svg+xml;base64,${u8b64(inner)}"/>`;
  let y=110;s+=`<text x="960" y="${y}" font-size="16" class="hd">확인 사항</text>`;y+=28;(G.warn.length?G.warn:['문·창문·통로에 걸리는 곳이 없습니다']).forEach(t=>{s+=`<text x="960" y="${y}" font-size="13" fill="${G.warn.length?'#B4520F':'#13795B'}">· ${esc(fitText(t,400))}</text>`;y+=22});
  y+=16;s+=`<text x="960" y="${y}" font-size="16" class="hd">항목</text>`;y+=26;G.R.items.forEach(it=>{s+=`<text x="960" y="${y}" font-size="13" class="lb">${esc(RITEM[it.type]?.l||'')} · ${RWALL[it.wall]} 왼쪽 끝에서 ${it.off||0}${it.w?` · 폭 ${it.w}`:''}${it.type==='window'?` · 하단 ${it.sill||900}`:''}${it.type==='door'?` · ${it.open==='out'?'밖으로':'안으로'} 열림`:''}</text>`;y+=20});
  y+=16;s+=`<text x="960" y="${y}" font-size="16" class="hd">통로</text>`;y+=26;G.clr.forEach(c=>{s+=`<text x="960" y="${y}" font-size="13" class="lb">${c.key==='I'?'아일랜드':FACE_NAME(c.key)} 앞 ${c.d}mm</text>`;y+=20});
  return s+'</svg>'}
/* ---------- 주방 작업 삼각형 ---------- */
function triPts(j=job){if(j.cat!=='kitchen')return null;const pg=planGeo(j),o={};
  j.faces.forEach((fc,fi)=>{const g=geom(j,fi),r=pg.rects.find(x=>x.key===g.face);if(!r)return;const P=ctFaceMap(j,g,r),dep=g.island?g.Dm:g.D,vm=g.island&&j.island?.front!=='room'?dep*.3:dep*.7;
    g.rows.forEach(row=>{if(row.zone==='upper')return;row.mods.forEach(m=>{const c=P(m.x+m.w/2,vm);if(m.t==='sink'&&!o.sink)o.sink=c;if((m.t==='cook'||modApps(m).some(x=>x.a.kind==='cooktop'))&&!o.cook)o.cook=c});
      (row.corners||[]).filter(c=>c.tall&&['fridge','fspace'].includes(c.tk)).forEach(c=>{if(!o.fridge)o.fridge=P(c.x+c.w/2,vm)})})});
  return o}
function workTri(j=job){const o=triPts(j);if(!o)return null;const d=(a,b)=>Math.round(Math.hypot(a[0]-b[0],a[1]-b[1])/10)*10;
  if(!o.sink||!o.cook)return{o,need:'싱크대와 쿡탑 칸이 있어야 작업 삼각형을 계산합니다'};if(!o.fridge)return{o,need:'키큰장에서 냉장고장이나 "냉장고 자리"를 넣으면 작업 삼각형을 계산합니다',legs:[['싱크–쿡탑',d(o.sink,o.cook)]]};
  const legs=[['싱크–쿡탑',d(o.sink,o.cook)],['쿡탑–냉장고',d(o.cook,o.fridge)],['냉장고–싱크',d(o.fridge,o.sink)]],tot=legs.reduce((a,l)=>a+l[1],0),msg=[];
  legs.forEach(([n,v])=>{if(v<1200)msg.push(`작업 삼각형 ${n} ${v}mm — 너무 가깝습니다 (1200~2700 권장)`);else if(v>2700)msg.push(`작업 삼각형 ${n} ${v}mm — 너무 멉니다 (1200~2700 권장)`)});
  if(tot>7900)msg.push(`작업 삼각형 합계 ${tot}mm — 동선이 깁니다 (4000~7900 권장)`);if(tot<4000)msg.push(`작업 삼각형 합계 ${tot}mm — 너무 좁습니다 (4000~7900 권장)`);
  return{o,legs,tot,msg,ok:!msg.length}}
function workTriSVG(j,k,X=p=>p){const t=workTri(j);if(!t||!t.legs||t.legs.length<3)return'';const o=t.o,pts=[o.sink,o.cook,o.fridge].map(X),col=t.ok?'#13795B':'#C0362C',sw=2.2*k;
  let s=`<polygon points="${pts.map(p=>`${f(p[0])},${f(p[1])}`).join(' ')}" fill="${col}" fill-opacity=".07" stroke="${col}" stroke-width="${f(sw)}" stroke-dasharray="${f(9*k)} ${f(6*k)}"/>`;
  [['싱크',pts[0]],['쿡탑',pts[1]],['냉장고',pts[2]]].forEach(([l,p])=>{s+=`<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(7*k)}" fill="${col}"/><text x="${f(p[0])}" y="${f(p[1]-11*k)}" font-size="${f(10*k)}" text-anchor="middle" fill="${col}" font-weight="700">${l}</text>`});
  [[0,1],[1,2],[2,0]].forEach(([a,b],i)=>{const m=[(pts[a][0]+pts[b][0])/2,(pts[a][1]+pts[b][1])/2];s+=`<text x="${f(m[0])}" y="${f(m[1]+4*k)}" font-size="${f(9.5*k)}" text-anchor="middle" fill="${col}" stroke="#fff" stroke-width="${f(3*k)}" paint-order="stroke">${t.legs[i][1]}</text>`});
  return s}

/* ---------- 전기·설비 도면 ---------- */
const EL={C2:{l:'상판 2구 콘센트',c:'#1E56D0'},S16:{l:'가전 콘센트 (16A)',c:'#1E56D0'},DS:{l:'전용 콘센트 (220V 전용선)',c:'#B4520F'},SW:{l:'조명 스위치',c:'#555'},PSU:{l:'조명 전원 (SMPS)',c:'#7A3FB0'},HW:{l:'온수',c:'#D0312D'},CW:{l:'냉수',c:'#1E77D0'},D:{l:'배수',c:'#333'},AW:{l:'가전 급수',c:'#1E77D0'},G:{l:'가스 밸브',c:'#C8A000'}};
function elecPoints(j=job,fi=j.fi){const g=gview(j,fi),pts=[],add=(t,x,z,n)=>pts.push({t,x:Math.round(x),z:Math.round(z),n});if(isMD(g.cat))return{g,pts};
  const ap=allApps(j),hasDW=ap.some(x=>x.a.kind==='dw'),lp=lightPlan(j);
  g.rows.forEach(row=>{const ms=row.mods;
    if(g.cat==='kitchen'&&row.zone==='lower'){let lastC=-9e9;
      ms.forEach(m=>{const cx=m.x+m.w/2,apps=modApps(m).map(x=>x.a);
        if(m.t==='sink'){add('HW',cx-100,500,'싱크 수전');add('CW',cx+100,500,'싱크 수전');add('D',cx,400,'싱크 배수');if(hasDW){add('AW',cx+220,450,'식기세척기 급수');add('S16',cx-220,300,'식기세척기')}}
        if(m.t==='cook'||apps.some(a=>a.kind==='cooktop')){const ck=apps.find(a=>a.kind==='cooktop');if(ck?.fuel==='gas')add('G',cx,600,'가스레인지');else add('DS',cx,300,`인덕션${ck?.kw?` ${ck.kw}kW`:''} 전용`)}
        if(m.t==='oven'||apps.some(a=>a.kind==='oven'))add('S16',cx,300,'빌트인 오븐');
        if(m.t==='wash'||apps.some(a=>a.kind==='wash')){add('S16',cx-150,300,'세탁기');add('CW',cx+150,500,'세탁기 급수');add('D',cx+150,300,'세탁기 배수')}
        if(['base','baseDrawer','open'].includes(m.t)&&!g.island&&cx-lastC>=1000){add('C2',cx,CTH+250,'상판 위 콘센트');lastC=cx}});
      (row.corners||[]).filter(c=>c.tall).forEach(c=>{const cx=c.x+c.w/2,L_=layout(c);if(L_.oven)add('S16',cx,L_.oven.zb-60,'오븐 (안쪽 뒤)');if(L_.micro)add('S16',cx+120,L_.micro.zb+60,`${L_.microLab||'전자레인지'} (안쪽 뒤)`);if(L_.broom)add('C2',cx,1000,'청소기 충전 (안쪽)');if(L_.fridge||c.tk==='fspace')add('S16',cx,1900,'냉장고 (위쪽 뒤)')})}
    if(g.cat==='kitchen'&&row.zone==='upper'){ms.forEach(m=>{if(m.t==='hood')add('S16',m.x+m.w/2,g.Hm-150,'후드')});
      if(ms.some(m=>(m.lights||[]).length)){add('PSU',ms[0].x+120,g.Hm-60,'상부장 조명 전원');add('SW',(ms[ms.length-1]?.x||0)+(ms[ms.length-1]?.w||0)-150,1100,'상부장 하부등 스위치')}}
    if(g.cat!=='kitchen'){ms.forEach(m=>{const cx=m.x+m.w/2,L_=layout(m);if(L_.washers){const n=L_.washers.n;add('S16',cx-120,L_.washers.zt+80,n>1?'세탁기·건조기':'세탁기');add('CW',cx+120,L_.washers.zt+80,'세탁기 급수');add('D',cx+200,150,'세탁기 배수 (바닥)')}if(m.t==='vanity')add('S16',cx+m.w/2-120,1100,'화장대')});
      if(ms.some(m=>(m.lights||[]).length)||(lp.runs.length&&g.face==='A')){add('PSU',(ms[0]?.x||0)+150,g.Hm-60,'장 조명 전원 (천판 위)');if(j.lt?.ctrl!=='door')add('SW',(ms[0]?.x||0)-120+((ms[0]?.x||0)<200?250:0),1200,'조명 스위치')}}});
  return{g,pts}}
function elecPage(j=job,fi=j.fi){const{g,pts}=elecPoints(j,fi),W=1400,H=990,d=doorById(j.doorId)||{kind:'none'};let s=pageHead(j,`전기·설비 도면${j.faces.length>1?' · '+FACE_NAME(g.face):''}`,'콘센트·스위치·수도·배수 위치와 바닥에서 높이 · ');
  const sym=(t,x,z,k)=>{const c=EL[t].c,r=26*k,cy=-z;if(t==='HW'||t==='CW')return`<circle cx="${f(x)}" cy="${f(cy)}" r="${f(r*.7)}" fill="${c}"/>`;if(t==='D')return`<circle cx="${f(x)}" cy="${f(cy)}" r="${f(r*.75)}" fill="#fff" stroke="${c}" stroke-width="${f(4*k)}"/><circle cx="${f(x)}" cy="${f(cy)}" r="${f(r*.3)}" fill="${c}"/>`;
    if(t==='G')return`<polygon points="${f(x)},${f(cy-r)} ${f(x+r)},${f(cy+r*.8)} ${f(x-r)},${f(cy+r*.8)}" fill="${c}"/>`;if(t==='SW')return`<circle cx="${f(x)}" cy="${f(cy)}" r="${f(r*.6)}" fill="#fff" stroke="${c}" stroke-width="${f(4*k)}"/><line x1="${f(x)}" y1="${f(cy)}" x2="${f(x+r)}" y2="${f(cy-r)}" stroke="${c}" stroke-width="${f(4*k)}"/>`;
    if(t==='PSU')return`<rect x="${f(x-r)}" y="${f(cy-r*.6)}" width="${f(2*r)}" height="${f(1.2*r)}" fill="#fff" stroke="${c}" stroke-width="${f(4*k)}" stroke-dasharray="${f(6*k)} ${f(4*k)}"/>`;if(t==='AW')return`<rect x="${f(x-r*.6)}" y="${f(cy-r*.6)}" width="${f(1.2*r)}" height="${f(1.2*r)}" fill="${c}"/>`;
    const w=t==='C2'?2.2*r:1.4*r;return`<rect x="${f(x-w/2)}" y="${f(cy-r*.6)}" width="${f(w)}" height="${f(1.2*r)}" rx="${f(3*k)}" fill="${t==='DS'?'#FCE7D6':'#fff'}" stroke="${c}" stroke-width="${f(4*k)}"/><circle cx="${f(x-w*.18)}" cy="${f(cy)}" r="${f(4*k)}" fill="${c}"/><circle cx="${f(x+w*.18)}" cy="${f(cy)}" r="${f(4*k)}" fill="${c}"/>`};
  const draw=k=>{let t=`<g opacity=".38">${techExterior(g,d,k)}</g>`;pts.forEach((p,i)=>{t+=Lc(p.x,0,p.x,p.z,'thin')+sym(p.t,p.x,p.z,k)+TX(p.x+30*k,p.z+18*k,`${i+1}`,13*k,'font-weight="700" fill="#111"')+TX(p.x+30*k,p.z-16*k,`${p.z}`,10*k,`fill="${EL[p.t].c}"`)});return t+dimH(0,g.Wm,g.H+42*k,`${g.Wm}`,k,g.H)};
  s+=placeView({x:36,y:78,w:900,h:880},'정면 · 바닥(FFL)에서 높이',(g.Wm+g.ext)*1.18,g.H*1.12,draw);
  let y=110;s+=`<text x="960" y="${y}" font-size="16" class="hd">기호</text>`;y+=12;Object.entries(EL).filter(([t])=>pts.some(p=>p.t===t)).forEach(([t,v])=>{y+=26;s+=`<g transform="translate(980,${y-6})">${sym(t,0,0,.55).replace(/cy="-?0(\.0+)?"/g,'cy="0"')}</g><text x="1004" y="${y}" font-size="13" fill="#111">${v.l}</text>`});
  y+=36;s+=`<text x="960" y="${y}" font-size="16" class="hd">위치 목록</text>`;y+=8;
  s+=pts.length?pts.map((p,i)=>{y+=21;return`<text x="960" y="${y}" font-size="12.5" fill="#111">${i+1}. ${esc(EL[p.t].l)} · ${esc(p.n)}</text><text x="1364" y="${y}" font-size="12.5" class="lb" text-anchor="end">왼쪽 ${p.x} / 높이 ${p.z}</text>`}).join(''):`<text x="960" y="${y+22}" font-size="13" class="lb">이 면에는 필요한 전기·설비 점이 없습니다</text>`;
  s+=`<text x="960" y="${Math.min(950,y+40)}" font-size="11.5" class="lb">· 높이는 마감 바닥에서, 왼쪽 거리는 장 시작점에서 잰 값입니다</text><text x="960" y="${Math.min(966,y+57)}" font-size="11.5" class="lb">· 실제 위치는 현장에서 기사님과 한 번 더 확인하세요</text>`;
  return s+'</svg>'}
const hasElec=j=>j.faces.some((f,i)=>elecPoints(j,i).pts.length);
const fname=s=>`${(job.customer.name||'현장').replace(/^예시\)\s*/,'').replace(/[\\/:*?"<>|]/g,'').trim()||'현장'}_${CATS[job.cat].name}_${s}`;

