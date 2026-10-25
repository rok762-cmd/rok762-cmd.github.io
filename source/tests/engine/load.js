// 엔진 모듈(src/js 앞쪽)을 화면 없이 Node vm 안에서 불러옵니다.
const fs=require('fs'),path=require('path'),vm=require('vm');
const SRC=path.join(__dirname,'../../src/js');
function load(files){
  const mem=new Map();
  const el=()=>({style:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},appendChild(){},addEventListener(){},querySelector:()=>null,querySelectorAll:()=>[],innerHTML:'',dataset:{}});
  const ctx={console,Math,JSON,Date,Promise,setTimeout:(f)=>0,clearTimeout(){},structuredClone,
    localStorage:{getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k)},
    navigator:{onLine:true,userAgent:'node'},location:{href:'file:///engine',search:''},matchMedia:()=>({matches:false,addEventListener(){}}),
    document:{querySelector:()=>null,querySelectorAll:()=>[],getElementById:()=>null,createElement:el,addEventListener(){},body:el(),documentElement:el(),head:el(),fonts:{ready:Promise.resolve()}},
    addEventListener(){},removeEventListener(){},requestAnimationFrame:()=>0,performance:{now:()=>Date.now()}};
  ctx.window=ctx;ctx.self=ctx;ctx.globalThis=ctx;
  vm.createContext(ctx);
  const all=fs.readdirSync(SRC).filter(f=>f.endsWith('.js')).sort();
  const pick=files?all.filter(f=>files.some(p=>f.startsWith(p))):all;
  const code=pick.map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('');
  vm.runInContext(code+'\n;globalThis.__E={get job(){return job},set job(v){job=v},get catalog(){return catalog},set catalog(v){catalog=v},get RULES(){return RULES},get RULES_DEF(){return RULES_DEF},get TYPES(){return TYPES}};',ctx,{filename:'engine.js'});
  return ctx;
}
module.exports={load};
