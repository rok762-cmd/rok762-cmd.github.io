import json
from playwright.sync_api import sync_playwright
F='file:///home/claude/실측스튜디오_오프라인.html'
JS="""()=>{const res=[];const cats=Object.keys(CATS);for(const c of cats){job=newJob(c);for(const lay of Object.keys(LAYOUTS)){try{if(!LAYOUT_FACES[lay])continue;setLayout(lay)}catch(e){continue}
 try{if(c==='kitchen')fitSinkCabs()}catch(e){}
 job.faces.forEach((f,fi)=>{let g;try{g=geom(job,fi)}catch(e){res.push([c,lay,f.key,'ERR '+e.message]);return}g.rows.forEach(r=>{const els=[...r.corners,...r.mods,...r.fill].sort((a,b)=>a.x-b.x);const sum=els.reduce((a,m)=>a+m.w,0);let gaps=[];for(let k=1;k<els.length;k++){const d=els[k].x-(els[k-1].x+els[k-1].w);if(Math.abs(d)>1)gaps.push(Math.round(d))}
 const W=isMD(c)?g.Wm-2*MFRAME:g.Wm;const x0=els.length?els[0].x:0;if(Math.abs(sum-W)>1||gaps.length)res.push([c,lay,f.key,r.zone,'sum',sum,'Wm',W,'x0',x0,'gaps',gaps.join(',')])})})}}return res}"""
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(F);pg.wait_for_timeout(1000)
    for r in pg.evaluate(JS):print(r)
    print(errs);b.close()
