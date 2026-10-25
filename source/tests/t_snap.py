from playwright.sync_api import sync_playwright
F='file:///home/claude/실측스튜디오_오프라인.html'
JS="""(lay)=>{setCat('kitchen');if(lay!=='I')setLayout(lay);const out={n:0,bad50:[],cook:[],over:0,ex:{}};
 for(let L=2000;L<=4200;L+=37){job.faces[0].len=L;stdNormalize.quiet=1;render();job.faces.forEach((f,fi)=>{const g=geom(job,fi);g.rows.forEach(r=>{out.n++;if(r.over>0){out.over++;return}
  r.mods.forEach(m=>{if(m.t==='hood'||m.unit)return;if(m.w%50)out.bad50.push(L+f.key+r.zone+':'+m.t+m.w);if(m.t==='cook'&&![600,750,800,900].includes(m.w))out.cook.push(L+':'+m.w)})});
  if(L%10===2||L===2000||L===3036||L===2370)out.ex[L+f.key]=g.sL+'|'+g.rows.map(r=>r.zone[0]+':'+r.mods.map(m=>m.t.slice(0,4)+m.w).join(',')+(r.gap?' gap'+r.gap:'')).join(' / ')+'|'+g.sR})}
 out.bad50=out.bad50.slice(0,12);out.cook=out.cook.slice(0,12);return out}"""
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(F);pg.wait_for_timeout(1200)
    for lay in ['I','L','U']:
        r=pg.evaluate(JS,lay);ex=r.pop('ex');print(lay,r)
        for k,v in list(ex.items())[:8]:print('  ',k,v)
    print('errs',errs);b.close()
