from playwright.sync_api import sync_playwright
F='file:///home/claude/실측스튜디오_오프라인.html';O='/tmp/claude-0/-home-claude/e64cc57b-be18-55d0-8b1e-980ad89a477a/scratchpad/'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1280,'height':900});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(F);pg.wait_for_timeout(1200)
    r=pg.evaluate("""()=>{job=newJob('kitchen');job.faces[0].len=3600;job.tallEnd={on:true,face:'A',side:'R',k:'pantry',w:600};stdNormalize.quiet=1;render();
      const hd=catalog.doors.filter(d=>d.cats.includes('kitchen')&&d.kind==='hinged');job.doorUpperId=hd.find(d=>d.id!==job.doorId).id;
      const out={};for(const td of ['lower','upper','split'])for(const tl of ['auto','upper','lower']){job.tallDoor=td;job.tallLine=tl;const g=geom(job,0),lv=leaves(g,doorById(job.doorId)).filter(l=>l.tall);out[td+'/'+tl]=lv.map(l=>Math.round(l.zb)+'-'+Math.round(l.zb+l.h)+':'+(leafDoor(job,l).id===job.doorUpperId?'UP':'LO')).join(' ')}
      job.tallDoor='split';job.tallLine='upper';step=3;m3Tab='tall';render();return out}""")
    for k,v in r.items():print(k,v)
    el=pg.locator('[data-act="m3-tl"]').first;el.scroll_into_view_if_needed();pg.wait_for_timeout(200);pg.screenshot(path=O+'td.png')
    sv=pg.evaluate("()=>drawingSVG(job,0)");pg.set_content('<body style="margin:0">'+sv+'</body>');pg.wait_for_timeout(300);pg.screenshot(path=O+'td2.png',clip={'x':0,'y':0,'width':1400,'height':990})
    print('errs',errs);b.close()
