import json
from playwright.sync_api import sync_playwright
F='file:///home/claude/실측스튜디오_오프라인.html'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(F);pg.wait_for_timeout(1200)
    for setup in ["setCat('kitchen');job.faces[0].len=3200;fitSinkCabs()","setCat('kitchen');setLayout('L');job.faces[0].len=3000;job.faces[1].len=2200;fitSinkCabs()","job=newJob('closet')","job=newJob('middoor')"]:
        r=pg.evaluate("()=>{"+setup+";const d=doorOrder(),pl=panelList(),hw=hwList(),pgs=factoryPages();return {d:d.map(x=>[x.kind,x.w,x.h,x.hinge,x.bore,x.handle,x.qty,x.where.join(' ')]),sum:pl.sum,np:pl.list.length,pl:pl.list.slice(0,8).map(x=>[x.mat,x.part,x.a,x.b,x.qty]),hw:hw.map(x=>[x.name,x.spec,x.qty]),pages:pgs.map(q=>q.h)}}")
        print('=====',setup)
        for k,v in r.items(): print(k, json.dumps(v,ensure_ascii=False)[:1800])
    print(errs);b.close()
