from playwright.sync_api import sync_playwright
F='file:///home/claude/실측스튜디오_오프라인.html'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page();pg.goto(F);pg.wait_for_timeout(1000)
    print(pg.evaluate("""()=>{job=newJob('single');const g=geom();return JSON.stringify({rows:g.rows.map(r=>r.mods.map(m=>[m.t,m.x,m.w,m.z0,m.z1])),lv:leaves(g,doorById(job.doorId)).map(l=>[l.kind,Math.round(l.w),Math.round(l.h),l.zb])})}"""))
    b.close()
