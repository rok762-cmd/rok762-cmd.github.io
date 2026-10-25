/* ---------- basics ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const won=n=>Math.round(n).toLocaleString('ko-KR');
const nf=v=>Number(v).toLocaleString('ko-KR',{maximumFractionDigits:2});
const uid=()=>Math.random().toString(36).slice(2,9);
const clone=o=>JSON.parse(JSON.stringify(o));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ceil1=v=>Math.ceil(v*10-1e-9)/10;
const r2=v=>Math.round(v*100)/100;
const f=v=>Math.round(v*10)/10;
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const FONT="IBM Plex Sans KR, Apple SD Gothic Neo, Malgun Gothic, Noto Sans KR, sans-serif";
const store={get(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}};

