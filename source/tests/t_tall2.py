from playwright.sync_api import sync_playwright
F='file:///home/claude/실측스튜디오_오프라인.html';O='/tmp/claude-0/-home-claude/e64cc57b-be18-55d0-8b1e-980ad89a477a/scratchpad/'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1280,'height':900});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(F);pg.wait_for_timeout(1200)
    r=pg.evaluate("""()=>{job=newJob('kitchen');setLayout('L');job.faces[0].len=3500;job.faces[1].len=2500;stdNormalize.quiet=1;render();
      job.tallEnd={on:true,face:'A',side:'R',k:'pantry',w:600};render();
      const fr=(catalog.apps||[]).find(a=>a.kind==='fridge');ACT['fr-pick']({dataset:{id:fr.id}});
      const g=geom(job,0),lo=g.rows.find(r=>r.zone==='lower'),up=g.rows.find(r=>r.zone==='upper');
      const q=quote();return{tallEnd:job.tallEnd,tall2:job.tall2,talls:g.talls,lo:lo.mods.map(m=>m.t+m.w).join(','),corners:lo.corners.map(c=>(c.tk||c.t)+':'+c.x+'+'+c.w).join(' '),up:up.mods.map(m=>m.t+m.w).join(','),
        max:Math.max(...job.faces.flatMap((f,fi)=>geom(job,fi).rows.flatMap(r=>r.mods.filter(m=>m.t!=='hood').map(m=>m.w)))),
        tallQ:q.lines.filter(l=>/키큰장|냉장고/.test(l.item)).map(l=>l.item+' '+l.spec+' '+l.qty+l.unit+' '+l.price),ct:q.lines.filter(l=>/^상판/.test(l.item)).map(l=>l.spec)}}""")
    for k,v in r.items():print(k,v)
    # long wall width cap
    r2=pg.evaluate("""()=>{job=newJob('kitchen');job.faces[0].len=4500;stdNormalize.quiet=1;render();const g=geom(job,0);return g.rows.map(r=>r.zone+':'+r.mods.map(m=>m.t.slice(0,4)+m.w).join(',')).join(' / ')}""")
    print('4500 I:',r2)
    pg.evaluate("()=>{job=newJob('kitchen');setLayout('L');job.faces[0].len=3500;job.faces[1].len=2500;job.ctFront='groove';render();step=1;render()}")
    pg.wait_for_timeout(300);el=pg.locator('text=끝 마감').first;el.scroll_into_view_if_needed();pg.screenshot(path=O+'e1.png')
    sv=pg.evaluate("()=>counterSVG(job)");pg.set_content('<body style="margin:0">'+sv+'</body>');pg.wait_for_timeout(300);pg.screenshot(path=O+'ct.png',clip={'x':0,'y':0,'width':1400,'height':990})
    print('errs',errs);b.close()
