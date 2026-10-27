/* ---------- 기술자용: ① 기술자 이름 ② 본사 단가·제품 일괄 배포 ③ 설정 잠금 ---------- */
const TECHK='silcheuk-tech';
let TECH=(()=>{try{return{name:'',tel:'',...(JSON.parse(localStorage.getItem(TECHK))||{})}}catch(e){return{name:'',tel:''}}})();
const techSave=()=>{try{localStorage.setItem(TECHK,JSON.stringify(TECH))}catch(e){}};
function techChip(){const el=document.getElementById('techChip');if(!el)return;el.hidden=!TECH.name;el.textContent=TECH.name?'👷 '+TECH.name:''}
setTimeout(techChip,300);
function techMenuBtn(){return`<button type="button" class="btn" data-act="tech-set" style="width:100%;margin-bottom:8px">👷 기술자: ${TECH.name?esc(TECH.name):'이름 정하기'}</button>`}
function openTechSet(){$('#layer').innerHTML=`<div class="overlay" data-act="sheet-back"><form class="sheet" id="techForm" style="width:min(480px,100%)"><h3>기술자 정보 (이 태블릿)</h3>
  <p class="hint">현장 목록·드라이브 폴더·도면 ‘작성’ 칸에 누가 실측했는지 들어갑니다.</p>
  <div class="field"><label for="tech-name">이름</label><input class="input" id="tech-name" value="${esc(TECH.name)}" placeholder="예: 홍길동"></div>
  <div class="field"><label for="tech-tel">연락처</label><input class="input" id="tech-tel" inputmode="tel" value="${esc(TECH.tel)}" placeholder="예: 010-1234-5678"></div>
  <div class="sheet-actions"><button type="button" class="btn" data-act="sheet-cancel">취소</button><button type="submit" class="btn primary">저장</button></div></form></div>`;
  sheetCb={ok:()=>{},cancel:()=>{$('#layer').innerHTML='';sheetCb=null}};
  $('#techForm').addEventListener('submit',e=>{e.preventDefault();TECH.name=$('#tech-name').value.trim().slice(0,20);TECH.tel=$('#tech-tel').value.trim().slice(0,20);techSave();if(TECH.name&&!isSampleJob()&&!job.tech)job.tech=TECH.name;$('#layer').innerHTML='';sheetCb=null;techChip();render();toast(TECH.name?`기술자 ${TECH.name}(으)로 정했습니다`:'기술자 이름을 지웠습니다')})}
const techOf=(j=job)=>j?.tech||TECH.name||'';
const techTel=(j=job)=>(j?.tech&&j.tech!==TECH.name)?'':TECH.tel||'';

/* ③ 설정 잠금: 본사가 정한 비밀번호가 있으면 제품·단가 관리를 열 때 물어봄 */
let lockOpen=false;
async function pinHash(p){const b=new TextEncoder().encode('silcheuk:'+p);try{const h=await crypto.subtle.digest('SHA-256',b);return Array.from(new Uint8Array(h)).map(x=>x.toString(16).padStart(2,'0')).join('')}catch(e){let h=0;for(const c of b)h=(h*31+c)|0;return'h'+h}}
const isLocked=()=>!!catalog.lockHash&&!lockOpen;
function askPin(then){$('#layer').innerHTML=`<div class="overlay" data-act="sheet-back"><form class="sheet" id="pinForm" style="width:min(420px,100%)"><h3>🔒 설정 잠금</h3><p class="hint">본사에서 단가·규칙을 잠가 두었습니다. 비밀번호를 넣으면 이 화면을 닫을 때까지 열립니다.</p>
  <div class="field"><label for="pin-in">비밀번호</label><input class="input" id="pin-in" type="password" inputmode="numeric" autocomplete="off"></div><p class="hint" id="pin-err" style="color:var(--warn)"></p>
  <div class="sheet-actions"><button type="button" class="btn" data-act="sheet-cancel">취소</button><button type="submit" class="btn primary">열기</button></div></form></div>`;
  sheetCb={ok:()=>{},cancel:()=>{$('#layer').innerHTML='';sheetCb=null}};setTimeout(()=>$('#pin-in')?.focus(),30);
  $('#pinForm').addEventListener('submit',async e=>{e.preventDefault();const h=await pinHash($('#pin-in').value.trim());if(h!==catalog.lockHash){$('#pin-err').textContent='비밀번호가 맞지 않습니다';return}lockOpen=true;$('#layer').innerHTML='';sheetCb=null;then()})}

/* ② 본사 단가·제품 일괄 배포 (드라이브 수신기 v4: cat-put / cat-get) */
async function hqPush(){if(!syReady()){toast('먼저 ☰ 메뉴 → 드라이브 설정을 하세요 (본사 계정 수신기)');return}if(isLocked()){askPin(hqPush);return}
  try{toast('모든 태블릿으로 배포하는 중…');const at=Date.now(),c=JSON.parse(JSON.stringify(catalog));c.hqAt=at;await syPost({action:'cat-put',json:JSON.stringify({at,catalog:c})});catalog.hqAt=at;saveCatalog();toast('배포했습니다 · 각 태블릿은 다음에 앱을 열 때 자동으로 바뀝니다');if($('#layer').innerHTML)openManager()}
  catch(e){toast(/action/.test(e.message)?'드라이브 수신기가 예전 버전입니다 · 새 apps-script.gs(v4)로 바꿔 주세요':'배포 실패: '+e.message)}}
let hqChecking=false;
async function hqPull(manual){if(!syReady()||!navigator.onLine||hqChecking)return;hqChecking=true;try{const r=await syPost({action:'cat-get'});if(!r.json){if(manual)toast('본사에서 배포한 단가가 아직 없습니다');return}const d=JSON.parse(r.json);
    if(!d.catalog||!(d.at>(catalog.hqAt||0))){if(manual)toast('이미 본사 최신 단가입니다');return}store.set(CK,{...d.catalog,hqAt:d.at});catalog=loadCatalog();catalog.hqAt=d.at;saveCatalog();lockOpen=false;try{applyRules()}catch(e){}render();toast('본사 단가·제품이 업데이트됐습니다')}
  catch(e){if(manual)toast(/action/.test(e.message)?'드라이브 수신기가 예전 버전입니다 · 새 apps-script.gs(v4)로 바꿔 주세요':'받기 실패: '+e.message)}finally{hqChecking=false}}
if(APP){setTimeout(()=>hqPull(false),4000);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')hqPull(false)})}
function hqCard(){return`<div class="panel" style="padding:12px 14px;display:grid;gap:8px"><b>본사 → 모든 태블릿 (단가·제품 일괄 배포)</b><span class="hint" style="margin:0">본사 태블릿·PC에서 단가·도어·규칙을 고친 뒤 <b>배포</b>를 누르면, 같은 드라이브 수신기를 쓰는 기술자 태블릿이 다음에 앱을 열 때 자동으로 같은 단가로 바뀝니다.${catalog.hqAt?` · 이 기기 단가 기준: ${fmtTime(catalog.hqAt)}`:''}</span>
  <div class="toolbar" style="margin:0;flex-wrap:wrap"><button type="button" class="btn primary" data-act="hq-push">📤 모든 태블릿에 배포</button><button type="button" class="btn" data-act="hq-pull">⬇ 본사 단가 받기</button></div>
  <b style="margin-top:6px">🔒 설정 잠금</b><span class="hint" style="margin:0">비밀번호를 정하고 배포하면 기술자 태블릿에서 제품·단가 관리(현장 규칙 포함)를 열 때 비밀번호를 물어봅니다. ${catalog.lockHash?'<b>지금 잠금 켜짐</b>':'지금 잠금 꺼짐'}</span>
  <div class="toolbar" style="margin:0;flex-wrap:wrap"><input class="input" id="lock-pin" type="password" inputmode="numeric" placeholder="새 비밀번호 (숫자 4자리 이상)" style="width:220px;min-height:40px"><button type="button" class="btn" data-act="lock-set">잠금 비밀번호 정하기</button>${catalog.lockHash?'<button type="button" class="btn quiet danger" data-act="lock-off">잠금 끄기</button>':''}</div></div>`}
Object.assign(ACT,{
  'tech-set':()=>openTechSet(),
  'hq-push':()=>hqPush(),'hq-pull':()=>hqPull(true),
  'lock-set':async()=>{const v=($('#lock-pin')?.value||'').trim();if(v.length<4){toast('비밀번호는 4자리 이상으로 정하세요');return}catalog.lockHash=await pinHash(v);lockOpen=true;saveCatalog();openManager();toast('잠금 비밀번호를 정했습니다 · ‘모든 태블릿에 배포’를 눌러야 기술자 태블릿에도 적용됩니다')},
  'lock-off':()=>{delete catalog.lockHash;saveCatalog();openManager();toast('잠금을 껐습니다 · 배포하면 기술자 태블릿도 풀립니다')},
});
{const _mo=ACT['manage-open'];ACT['manage-open']=(...a)=>{if(isLocked()){askPin(()=>_mo(...a));return}_mo(...a)}}
