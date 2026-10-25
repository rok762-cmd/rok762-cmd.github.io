import sys,json
from playwright.sync_api import sync_playwright
F='file:///home/claude/실측스튜디오_오프라인.html'
JS="""(lay)=>{setCat('kitchen');if(lay!=='I')setLayout(lay);fitSinkCabs();render();const res=[];
 for(const al of [false,true]){job.upAlign=al;const out=[];job.faces.forEach((f,fi)=>{const g=geom(job,fi);out.push({face:f.key,len:f.len,rows:g.rows.map(r=>({z:r.zone,al:r.aligned,n:r.alignN,ms:r.mods.map(m=>m.t+':'+m.x+'+'+m.w).join(' '),lines:rowLines(r).join(',')}))})});res.push(out)}return res}"""
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1280,'height':900})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(F);pg.wait_for_timeout(1200)
    for lay in ['I','L','U']:
        r=pg.evaluate(JS,lay)
        for k,out in zip(['OFF','ON'],r):
            print('==',lay,k)
            for fc in out:
                for row in fc['rows']: print(fc['face'],row['z'],row['al'],row['n'],row['ms'],'|',row['lines'] if row['z']=='lower' else '')
    print('errs',errs)
    b.close()
