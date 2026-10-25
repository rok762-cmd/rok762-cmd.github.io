from playwright.sync_api import sync_playwright
F='file:///home/claude/실측스튜디오_오프라인.html'
JS="""(a)=>{const[lay,fin,endR,shelf]=a;setCat('kitchen');if(lay!=='I')setLayout(lay);job.finish=fin;job.faces.forEach(f=>{f.ends={}});if(endR)job.faces.forEach(f=>{if(f.key!=='I')f.ends.R='panel'});
 job.bgap=shelf?{mm:100,use:'shelf',sh:100}:{};fitSinkCabs();render();
 return job.faces.map((f,fi)=>{const g=geom(job,fi),lo=g.rows.find(r=>r.zone==='lower'),up=g.rows.find(r=>r.zone==='upper');
  const cs=r=>r?(r.corners||[]).map(c=>(c.blind?'blind':c.cfill?'cfill':c.t)+':'+c.x+'+'+c.w+(c.cf!=null?'(cf'+c.cf+')':'')).join(' '):'';
  return{face:f.key,len:f.len,sL:g.sL,sR:g.sR,Wm:g.Wm,ep:g.ep,scf:g.shelfCF,sum:g.sL+g.Wm+g.sR+g.cut,lo:cs(lo)+' | '+(lo?lo.mods.map(m=>m.x+'+'+m.w).join(' '):''),up:cs(up)+' | '+(up?up.mods.map(m=>m.x+'+'+m.w).join(' '):''),
   ep2:endPanels(job).filter(x=>x.face===f.key).map(x=>x.side+x.zone).join(','),fill:cutList().filter(r=>/휠라/.test(r.part)&&r.part.startsWith(f.key)).map(r=>r.part+' '+r.size).join(' ; ')}})}"""
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(F);pg.wait_for_timeout(1200)
    for a in [['I','filler',False,False],['I','filler',True,False],['L','filler',False,False],['L','filler',False,True],['L','filler',True,True],['L','filler',True,False]]:
        print('==',a)
        for r in pg.evaluate(JS,a): print(r)
    print('errs',errs);b.close()
