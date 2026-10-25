from playwright.sync_api import sync_playwright
import sys
F=sys.argv[1] if len(sys.argv)>1 else 'file:///home/claude/실측스튜디오_오프라인.html';O='/tmp/claude-0/-home-claude/e64cc57b-be18-55d0-8b1e-980ad89a477a/scratchpad/'
ok=fail=0
def check(c,m):
    global ok,fail
    if c: ok+=1
    else: fail+=1;print('FAIL',m)
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1280,'height':900});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(F);pg.wait_for_timeout(1200)
    before=pg.evaluate("()=>{job=newJob('kitchen');job.faces[0].len=3600;stdNormalize.quiet=1;step=2;render();cf().rows[0].mods[0].dragTag='X';render();return cf().rows[0].mods.map(m=>m.t)}")
    print('before',before)
    hits=pg.locator('.hit[data-act="mod-sel"][data-row="0"]')
    n=hits.count();hits.nth(0).scroll_into_view_if_needed();pg.wait_for_timeout(200);a=hits.nth(0).bounding_box();z=hits.nth(n-1).bounding_box()
    pg.mouse.move(a['x']+a['width']/2,a['y']+a['height']/2);pg.mouse.down()
    pg.mouse.move(a['x']+a['width']/2+30,a['y']+a['height']/2,steps=3)
    pg.mouse.move(z['x']+z['width']-5,a['y']+a['height']/2,steps=10);pg.wait_for_timeout(100);pg.screenshot(path=O+'drag_mid.png')
    pg.mouse.up();pg.wait_for_timeout(300)
    after=pg.evaluate("()=>({t:cf().rows[0].mods.map(m=>m.t+(m.dragTag?'#':'')),sel:job.sel})");print('after',after)
    check(after['t'][-1]==before[0]+'#','first moved to end '+str(after))
    # click still selects
    hits=pg.locator('.hit[data-act="mod-sel"][data-row="0"]');hits.nth(1).click();pg.wait_for_timeout(200)
    check(pg.evaluate("()=>job.sel.i")==1,'click selects')
    check(not errs,'errors '+str(errs))
    print('OK',ok,' FAIL',fail);b.close()
