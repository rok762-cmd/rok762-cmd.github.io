from playwright.sync_api import sync_playwright
F='file:///home/claude/실측스튜디오_오프라인.html'
JS="""()=>{const res=[];for(const c of Object.keys(CATS)){job=newJob(c);for(const lay of Object.keys(LAYOUTS)){if(!LAYOUT_FACES[lay])continue;if(c!=='kitchen'&&lay!=='I')continue;try{setLayout(lay);if(c==='kitchen')fitSinkCabs();const r=prodCheck();res.push([c,lay,r.bad,r.warn,r.list.filter(x=>x.lvl!=='ok').map(x=>x.lvl+':'+x.cat+':'+x.msg).join(' | ')])}catch(e){res.push([c,lay,'ERR',e.message,e.stack.split('\\n')[1]])}}}return res}"""
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(F);pg.wait_for_timeout(1000)
    for r in pg.evaluate(JS):print(r)
    print(errs);b.close()
