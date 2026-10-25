// 무작위 현장 하나씩 계산 시간 재기 (느린 경우 찾기): node tests/engine/timing.js [개수] [시드]
const {load}=require('./load.js');
const E=load(['00','01','02','03','04','05']),S=E.__E;
const N=+process.argv[2]||40;let seed=+process.argv[3]||7;
const rnd=()=>(seed=(seed*1103515245+12345)%2147483648)/2147483648,pick=a=>a[Math.floor(rnd()*a.length)],ri=(a,b)=>a+Math.floor(rnd()*(b-a+1));
for(let n=0;n<N;n++){const lay=pick(['I','L','U','Lisland','II']);S.job=E.newJob('kitchen');if(lay!=='I')E.setLayout(lay);const j=S.job;
  j.faces.forEach(f=>{if(f.key==='I')return;f.len=ri(lay==='U'&&f.key==='A'?2600:1800,5200);if(rnd()<.35)f.ends={R:'panel'};if(rnd()<.15)f.ends={...(f.ends||{}),L:'panel'}});
  j.finish=pick(['filler','full']);if(rnd()<.3)j.bgap={mm:pick([50,100]),use:pick(['shelf','deep']),sh:100};
  if(rnd()<.35){const fs=j.faces.filter(f=>f.key!=='I'&&!(lay==='U'&&f.key==='A'));j.tallEnd={on:true,face:pick(fs).key,side:pick(['L','R']),k:pick(['pantry','combo','oven','larder','broom']),w:pick([450,600])};if(rnd()<.4)j.tall2={on:true,k:'pantry',w:pick([300,450,600])}}
  if(rnd()<.2)j.upAlign=false;if(rnd()<.2)j.ctBack='none';
  E.applyRules();let t=Date.now();try{E.fitAppCabs()}catch(e){}const t1=Date.now()-t;t=Date.now();E.stdNormalize.quiet=1;E.stdNormalize(j);const t2=Date.now()-t;t=Date.now();j.faces.forEach((f,fi)=>E.geom(j,fi));const t3=Date.now()-t;
  console.log(n,lay,j.faces.map(f=>f.len).join('/'),'fit',t1,'norm',t2,'geom',t3)}
