from playwright.sync_api import sync_playwright
import sys
F=sys.argv[1] if len(sys.argv)>1 else 'file:///home/claude/실측스튜디오_오프라인.html'
ok=fail=0
def check(c,m):
    global ok,fail
    if c: ok+=1
    else: fail+=1;print('FAIL',m)
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1280,'height':900});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(F);pg.wait_for_timeout(1200)
    pg.evaluate("()=>{job=newJob('kitchen');job.faces[0].len=3400;job.faces[0].ends={R:'panel'};job.tallEnd={on:true,face:'A',side:'L',k:'pantry',w:600};stdNormalize.quiet=1;render();openManager();ACT['mgr-tab']({dataset:{v:'rules'}})}")
    pg.wait_for_timeout(200)
    def setr(k,v):
        el=pg.locator(f'#rule-{k}');el.fill(v);el.dispatch_event('change');pg.wait_for_timeout(150)
    setr('unit','100');setr('cookWs','600, 900');setr('maxW','1000');setr('epT','18');setr('tallM','2.5');setr('doorLeaf','450')
    r=pg.evaluate("""()=>{$('#layer').innerHTML='';render();const g=geom(job,0),q=quote();return{R:RULES,ws:g.rows.flatMap(r=>r.mods.filter(m=>m.t!=='hood').map(m=>m.w)),cook:g.rows[0].mods.filter(m=>m.t==='cook').map(m=>m.w),sR:g.sR,ep:g.ep,
      tall:q.lines.filter(l=>/키큰장/.test(l.item)).map(l=>l.qty),saved:catalog.rules}}""")
    print(r)
    check(all(w%100==0 for w in r['ws']),'unit 100 '+str(r['ws']))
    check(all(w in (600,900) for w in r['cook']),'cook set')
    check(max(r['ws'])<=1000,'maxW')
    check(r['sR']==18,'epT 18')
    check(r['tall']==[2.5],'tallM 2.5 '+str(r['tall']))
    # invalid: maxW below 3*unit -> reverted
    pg.evaluate("()=>{openManager();ACT['mgr-tab']({dataset:{v:'rules'}})}");pg.wait_for_timeout(150)
    setr('maxW','150')
    check(pg.evaluate("()=>RULES.maxW")==1000 and 'maxW' not in pg.evaluate("()=>catalog.rules") or pg.evaluate("()=>catalog.rules.maxW")!=150,'invalid reverted')
    # reset
    pg.evaluate("()=>{const b=document.querySelector('[data-act=\"rules-reset\"]');b.click();document.querySelector('[data-act=\"rules-reset\"]')?.click()}");pg.wait_for_timeout(200)
    r2=pg.evaluate("()=>({R:RULES,c:catalog.rules||null,ws:geom(job,0).rows.flatMap(r=>r.mods.map(m=>m.w))})")
    check(r2['c'] is None and r2['R']['unit']==50 and r2['R']['maxW']==1200,'reset '+str(r2))
    check(all(w%50==0 for w in r2['ws']),'back to 50')
    check(not errs,'errors '+str(errs))
    print('OK',ok,' FAIL',fail);b.close()
