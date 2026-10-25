/* ---------- 정면에서 본 방향 (B면 좌우 반전 보정) — 엔진 ---------- */
const isMir=(j,fi)=>{const f=j.faces[fi];return!!f&&f.key==='B'&&!isMD(j.cat)&&['L','U','Lisland','II'].includes(j.layout)};
const swLR=v=>v==='L'?'R':v==='R'?'L':v;
function gview(j=job,fi=j.fi){const g=geom(j,fi);if(!isMir(j,fi))return g;const W=g.Wm,mx=m=>({...m,x:W-m.x-m.w,side:swLR(m.side),spacer:swLR(m.spacer)});
  const rows=g.rows.map(r=>({...r,corners:(r.corners||[]).map(mx),mods:r.mods.map(m=>({...mx(m),hinge:swLR(m.hinge)})),fill:(r.fill||[]).map(mx),hinge:(r.hinge||[]).map(swLR),clash:(r.clash||[]).map(c=>({...c,x:W-c.x})),offR:r.off||0,off:0}));
  return{...g,rows,sL:g.sR,sR:g.sL,ep:{L:!!g.ep?.R,R:!!g.ep?.L},mirrored:true,talls:(g.talls||[]).map(t=>({...t,x:W-t.x-t.w})),tx0:g.tw?W-g.tx0-g.tw:0,lidW:0,tbl:g.tbl?{...g.tbl,x0:W-g.tbl.x0-g.tbl.w}:null}}
