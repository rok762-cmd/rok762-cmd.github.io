/* ---------- 공장 출력: 도어 발주서 · 판재 재단 목록 · 하드웨어 목록 ---------- */
const SHEET={w:2440,h:1220,kerf:4},FX_TAG=/^(?:[A-Z]-|아일랜드-)?(?:[A-Z]\d+|[A-Z]코너[좌우]|[A-Z])\s/;
function hingeBore(h,n){if(n<=2)return[100,Math.round(h-100)];const a=100,b=h-100;return Array.from({length:n},(_,i)=>Math.round(a+(b-a)*i/(n-1)))}
function doorOrder(j=job){const door=doorById(j.doorId)||{kind:'none',name:'-'},grp=new Map();if(isMD(j.cat)||door.kind==='none'&&j.cat!=='kitchen')return[];
  const zt=z=>z==='upper'?'U':z==='top'?'T':z==='lower'?'L':'M';
  const put=(o)=>{const k=[o.kind,o.w,o.h,o.mat,o.hinge,o.bore,o.handle].join('|');const x=grp.get(k);if(x){x.qty++;if(x.where.length<12&&!x.where.includes(o.where))x.where.push(o.where)}else grp.set(k,{...o,qty:1,where:[o.where]})};
  j.faces.forEach((f,fi)=>{const g=gview(j,fi),pf=g.island?'I':g.face;
    leaves(g,door).forEach(l=>{if(!['door','drawer','panel','slide'].includes(l.kind))return;const W=Math.round(l.w),H=Math.round(l.h),mat=l.glass?'알루미늄 프레임 + 투명유리':((leafDoor(j,l,door)||door).name);
      const where=`${pf}-${zt(l.zone)}${typeof l.mi==='number'?l.mi+1:l.corner?'코너':''}`;let kind=l.kind==='drawer'?'서랍 앞판':l.kind==='panel'?'가전 도어 패널':l.kind==='slide'?'슬라이딩 도어':l.flap?'플랩 도어':'도어';if(l.corner)kind='코너 '+kind;
      let hinge='',bore='',handle='';
      if(l.kind==='door'&&door.kind==='hinged'){if(l.hinge==='U'){hinge='위 (리프트업)';bore=`위쪽 · 좌우 ${100}에서 컵 Ø35 ×2`}else{const n=hingesPer(l.h);hinge=l.hinge==='L'?'좌경':'우경';bore=`${l.hinge==='L'?'왼쪽':'오른쪽'} · 아래에서 ${hingeBore(H,n).join(' / ')} · 컵 Ø35 ×${n}`}}
      if(door.kind==='hinged'&&['door','drawer','panel'].includes(l.kind)){const p_=handlePlace(j,l);handle=p_.kind==='groove'?`손잡이 홈 (${p_.side==='T'?'상단':'하단'})`:p_.kind==='push'?'푸시 오프너':p_.kind==='none'||!p_.h?.id?'':`${p_.h.name} Ø5 ${p_.holes.map(([x,z])=>`(좌${Math.round(x-l.x)},하${Math.round(z-l.zb)})`).join(' ')}`}
      put({kind,w:W,h:H,t:DOOR_T,mat,hinge,bore,handle,where})});
    if(!g.island&&g.fin==='filler'&&!isMD(j.cat))fillerZones(g).forEach(([a,b])=>{[['L',g.sL],['R',g.sR]].forEach(([sd,v])=>{if(v>0&&!g.ep?.[sd])put({kind:'휠라 (벽 마감)',w:Math.round(v),h:Math.round(b-a),t:DOOR_T,mat:door.kind==='none'?'바디 동일':door.name,hinge:'',bore:'',handle:'',where:`${pf}-${sd==='L'?'좌':'우'}`})})});
    g.rows.forEach(r=>rowAll(r).filter(m=>m.filler).forEach(m=>put({kind:m.cfill?'코너 휠라':m.spacer?'스페이서':'휠라',w:Math.round(m.w),h:Math.round(m.z1-m.z0),t:DOOR_T,mat:door.kind==='none'?'바디 동일':door.name,hinge:'',bore:'',handle:'',where:`${pf}-${zt(r.zone)}`})));
    if(!g.island&&g.fin==='filler'&&g.top>0)put({kind:'상몰딩',w:Math.round(g.Wm+g.sL+g.sR),h:Math.round(g.top),t:DOOR_T,mat:door.kind==='none'?'바디 동일':door.name,hinge:'',bore:'',handle:'',where:pf})});
  endPanels(j).forEach(x=>put({kind:'마감판넬',w:Math.round(x.w),h:Math.round(x.h),t:RULES.epT,mat:door.kind==='none'?'바디 동일':door.name,hinge:'',bore:'',handle:'',where:`${x.face}-${x.side==='L'?'좌':'우'}`}));
  const ord=['도어','플랩 도어','코너 도어','서랍 앞판','가전 도어 패널','슬라이딩 도어','마감판넬','휠라 (벽 마감)','휠라','코너 휠라','스페이서','상몰딩'];
  return[...grp.values()].sort((a,b)=>(ord.indexOf(a.kind)+99)%99-(ord.indexOf(b.kind)+99)%99||b.h-a.h||b.w-a.w)}
function packSheets(parts){const W=SHEET.w,H=SHEET.h,k=SHEET.kerf,items=[];parts.forEach(p_=>{for(let i=0;i<p_.qty;i++){let a=Math.max(p_.a,p_.b),b=Math.min(p_.a,p_.b);if(a>W||b>H){items.push({a,b,over:true});continue}items.push({a,b})}});
  const ok=items.filter(x=>!x.over).sort((x,y)=>y.b-x.b||y.a-x.a);const sheets=[];
  ok.forEach(it=>{let placed=false;for(const sh of sheets){for(const st of sh.strips){if(it.b<=st.h&&st.used+it.a<=W){st.used+=it.a+k;placed=true;break}}if(placed)break;if(sh.usedH+it.b<=H){sh.strips.push({h:it.b,used:it.a+k});sh.usedH+=it.b+k;placed=true;break}}
    if(!placed)sheets.push({strips:[{h:it.b,used:it.a+k}],usedH:it.b+k})});
  const area=items.reduce((a_,x)=>a_+x.a*x.b,0)/1e6;return{n:sheets.length,area,over:items.filter(x=>x.over).length,eff:sheets.length?area/(sheets.length*W*H/1e6):0}}
function panelList(j=job){const rows=cutList(j).filter(r=>/PB|MDF|본체|25T/.test(r.mat)&&/\d+\s*×\s*\d+/.test(r.size));const grp=new Map();
  rows.forEach(r=>{const nums=(r.size.match(/\d+(?:\.\d+)?/g)||[]).map(Number),m3=nums.length>=3,a=Math.round(m3?nums[1]:nums[0]),b=Math.round(m3?nums[2]:nums[1]),mat=/MDF/.test(r.mat)?'MDF 9T':/25T/.test(r.mat)?'PB 25T':/PB/.test(r.mat)?r.mat.replace(/\s*마감/,''):'PB '+T+'T',part=r.part.replace(FX_TAG,'').trim()||r.part,edge=/뒷판|막음판|서랍박스/.test(part)?0:a;
    const key=[mat,part,a,b].join('|'),x=grp.get(key);if(x){x.qty+=r.qty;if(x.where.length<10)x.where.push(r.part.split(' ')[0])}else grp.set(key,{mat,part,a,b,qty:r.qty,edge,where:[r.part.split(' ')[0]],note:r.note})});
  const list=[...grp.values()].sort((x,y)=>x.mat.localeCompare(y.mat)||y.a*y.b-x.a*x.b),mats={};list.forEach(p_=>{(mats[p_.mat]=mats[p_.mat]||[]).push(p_)});
  const sum=Object.entries(mats).map(([mat,ps])=>({mat,qty:ps.reduce((a,p_)=>a+p_.qty,0),edge:Math.round(ps.reduce((a,p_)=>a+p_.edge*p_.qty,0)/100)/10,...packSheets(ps)}));return{list,sum}}
function hwList(j=job){const door=doorById(j.doorId)||{kind:'none'},cl=cutList(j),out=new Map(),add=(name,spec,qty,note='')=>{if(!(qty>0))return;const k=name+'|'+spec,x=out.get(k);if(x)x.qty+=qty;else out.set(k,{name,spec,qty,note})};
  if(!isMD(j.cat)){const lv=j.faces.flatMap((f,fi)=>leaves(geom(j,fi),door));
    if(door.kind==='hinged'){const n=lv.filter(l=>l.kind==='door'&&!l.flap&&!l.corner).reduce((a,l)=>a+hingesPer(l.h),0);add('경첩 (댐퍼 · 110°)','컵 Ø35 · 인셋/아웃셋은 도어 방식대로',n,'문 높이별 2~4개');
      lv.filter(l=>l.corner==='corner_diag'&&l.kind==='door').forEach(()=>add('165° 코너 경첩','오각 코너장 도어',3));lv.filter(l=>l.corner==='corner_l'&&l.kind==='door').forEach(()=>add('ㄱ자 폴딩 도어 경첩 세트','연결 경첩 + 경첩',1));
      const fl=lv.filter(l=>l.flap).length;add('플랩 리프트업 철물','도어 무게·높이에 맞춰',fl,'플랩 1짝당 1조');add('플랩 경첩','컵 Ø35',fl*2);
      const hm=new Map();lv.filter(l=>['door','drawer','panel'].includes(l.kind)).forEach(l=>{const p_=handlePlace(j,l);if(p_.kind==='groove'||p_.kind==='none'||!p_.h?.id)return;const nm=p_.kind==='push'?'푸시 오프너':p_.h.name,sp=p_.kind==='push'?'자석·스프링식':p_.h.len?`${p_.h.len}mm${p_.h.cc?` · 피치 ${p_.h.cc}`:''}`:'';hm.set(nm+'|'+sp,(hm.get(nm+'|'+sp)||0)+1)});
      hm.forEach((q,k)=>{const[nm,sp]=k.split('|');add(nm,sp,q,'손잡이 나사 포함')})}
    cl.forEach(r=>{const part=r.part.replace(FX_TAG,'');
      if(/서랍박스/.test(part)){const m=r.size.match(/(\d+)\s*×\s*(\d+)/),dp=m?Math.floor(+m[2]/50)*50:0;add(`서랍 레일 (풀익스텐션 · 소프트클로즈)${r.note==='내부'?' · 내부서랍':''}`,dp?`길이 ${dp}mm`:'',r.qty,'서랍 1개당 1조')}
      else if(/행거봉/.test(part))add('행거봉 + 브라켓',`${r.size}mm`,r.qty,'브라켓 2개/봉');
      else if(r.mat==='철물'&&!/경첩 \(댐퍼\)|플랩 리프트업/.test(part))add(part,r.size,r.qty,r.note);
      else if(/풀아웃|SMPS|LED 프로파일|가스쇼바/.test(part+r.mat))add(part,r.size,r.qty,r.note)});
    const lp=lightPlan(j);if(lp.runs.length){Object.entries(lp.byT).forEach(([t,b])=>add(LT[t].label,LT[t].unit==='m'?`${Math.round(b.m*10)/10} m`:`${b.n}개`,LT[t].unit==='m'?Math.ceil(b.m):b.n,LT[t].unit==='m'?'m 단위 (여유 포함 주문)':''));if(lp.sens)add('문 열림 센서','',lp.sens);if(lp.touch)add('터치 스위치','',lp.touch)}
    if(j.cat==='kitchen'){const lowers=j.faces.reduce((a,f,fi)=>{const g=geom(j,fi);return a+(g.pl?(g.rows.find(r=>r.zone==='lower')?.mods.filter(m=>!m.filler).length||0):0)},0);add('조절 다리 (걸레받이 클립 포함)',`${plRange(j.cat).join('~')}mm`,lowers*4,'하부장 1칸당 4개 기준')}
    add('선반 다보 (핀)','Ø5',cl.filter(r=>/ 선반$/.test(r.part)).reduce((a,r)=>a+r.qty*4,0),'선반 1장당 4개')}
  return[...out.values()]}
function factoryPages(j=job){const head=[`No. ${j.docNo} · ${j.customer.name||'-'} · ${j.customer.addr||'-'}`,`${CATS[j.cat].name} ${LAYOUTS[j.layout]} · ${facesSpec(j)} · H ${j.dims.H} · 도어 ${doorById(j.doorId)?.name||'-'} · ${catalog.company.name} ${catalog.company.tel||''}`];
  const dr=doorOrder(j),pl=panelList(j),hw=hwList(j),pg=(title,headers,cols,aligns,rows,foot)=>{const w=1400,h=Math.max(990,230+rows.length*26+(foot?140:60));return{w,h,svg:tablePage({w,h,title,meta:head,headers,cols,aligns,rows,foot})}};
  const ftxt=lines=>y=>lines.map((t,i)=>`<text x="40" y="${y+32+i*22}" font-size="14" fill="#111"${i===0?' font-weight="700"':''}>${esc(t)}</text>`).join('');
  return[pg(`도어 발주서 · 총 ${dr.reduce((a,x)=>a+x.qty,0)}장`,['종류','가로 × 세로 (mm)','재질·색','경첩','보링·가공','손잡이','수량','위치'],[120,150,190,60,280,340,50,130],['l','l','l','l','l','l','r','l'],dr.map(x=>[x.kind,`${x.w} × ${x.h} · ${x.t}T`,x.mat,x.hinge,x.bore,x.handle,x.qty,x.where.join(',')]),ftxt(['※ 가로 × 세로는 완성 치수(틈 3mm 반영). 경첩 보링은 문 아래 끝 기준, 손잡이 타공은 문 왼쪽·아래 기준입니다.'])),
    pg(`판재 재단 목록 · ${pl.sum.map(s_=>`${s_.mat} ${s_.n}장`).join(' · ')}`,['재질','부재','가로 × 세로 (mm)','수량','엣지(앞)','비고'],[160,300,220,80,120,440],['l','l','l','r','r','l'],pl.list.map(x=>[x.mat,x.part,`${x.a} × ${x.b}`,x.qty,x.edge?`${x.a}`:'-',(x.where.slice(0,6).join(',')+(x.note?` · ${x.note}`:'')).slice(0,60)]),ftxt([`원장 ${SHEET.w}×${SHEET.h} · 톱날 ${SHEET.kerf}mm 기준 예상 (실제 재단기 결과와 다를 수 있음)`,...pl.sum.map(s_=>`${s_.mat}: 부재 ${s_.qty}개 · 면적 ${s_.area.toFixed(2)}㎡ · 원장 ${s_.n}장 (수율 ${Math.round(s_.eff*100)}%)${s_.over?` · 원장보다 큰 부재 ${s_.over}개`:''} ${s_.edge?` · 앞 엣지 약 ${s_.edge}m`:''}`)])),
    pg(`하드웨어 목록 · ${hw.length}종`,['품명','규격','수량','비고'],[420,380,100,420],['l','l','r','l'],hw.map(x=>[x.name,x.spec,x.qty,x.note]))]}
function factoryUI(){const dr=doorOrder(),pl=panelList(),hw=hwList(),tb=(hd,rows)=>`<div class="table-wrap"><table><thead><tr>${hd.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')||`<tr><td colspan="${hd.length}" class="hint">없음</td></tr>`}</tbody></table></div>`;
  return`<div class="panel" style="padding:12px 14px;margin-bottom:12px;display:grid;gap:4px"><b>공장에 보내는 세 가지 목록</b><span class="hint" style="margin:0">도어 공장 · 재단(목대) 공장 · 철물 주문을 따로 보낼 수 있게 나눴습니다. 도면을 고치면 바로 다시 계산됩니다.</span></div>
  <h3 style="font-size:16px;margin:14px 0 6px">① 도어 발주서 <span class="hint">${dr.reduce((a,x)=>a+x.qty,0)}장 · ${dr.length}종</span></h3>${tb(['종류','가로×세로','재질·색','경첩','보링','손잡이','수량','위치'],dr.map(x=>[x.kind,`${x.w} × ${x.h}`,x.mat,x.hinge,x.bore,x.handle,x.qty,x.where.join(', ')]))}
  <h3 style="font-size:16px;margin:18px 0 6px">② 판재 재단 목록 <span class="hint">${pl.sum.map(s_=>`${s_.mat} 원장 ${s_.n}장 (수율 ${Math.round(s_.eff*100)}%)`).join(' · ')}</span></h3>${tb(['재질','부재','가로×세로','수량','엣지(앞)'],pl.list.map(x=>[x.mat,x.part,`${x.a} × ${x.b}`,x.qty,x.edge?x.a:'-']))}
  <h3 style="font-size:16px;margin:18px 0 6px">③ 하드웨어 목록 <span class="hint">${hw.length}종</span></h3>${tb(['품명','규격','수량','비고'],hw.map(x=>[x.name,x.spec,x.qty,x.note]))}`}
const csvOf=(hd,rows)=>'﻿'+[hd,...rows].map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\n');
Object.assign(ACT,{
  'fx-door-csv':()=>saveFile(fname('도어발주서.csv'),csvOf(['종류','가로(mm)','세로(mm)','두께','재질·색','경첩','보링·가공','손잡이','수량','위치'],doorOrder().map(x=>[x.kind,x.w,x.h,x.t,x.mat,x.hinge,x.bore,x.handle,x.qty,x.where.join(' ')]))),
  'fx-panel-csv':()=>saveFile(fname('판재재단목록.csv'),csvOf(['재질','부재','가로(mm)','세로(mm)','수량','앞엣지(mm)','위치'],panelList().list.map(x=>[x.mat,x.part,x.a,x.b,x.qty,x.edge||'',x.where.join(' ')]))),
  'fx-hw-csv':()=>saveFile(fname('하드웨어목록.csv'),csvOf(['품명','규격','수량','비고'],hwList().map(x=>[x.name,x.spec,x.qty,x.note]))),
  'fx-door-pdf':()=>savePDF(fname('도어발주서.pdf'),[{...factoryPages()[0],mm:.3}]),
  'fx-all-pdf':()=>savePDF(fname('공장출력.pdf'),factoryPages().map(p_=>({...p_,mm:.3})))});

