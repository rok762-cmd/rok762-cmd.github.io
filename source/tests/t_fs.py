from playwright.sync_api import sync_playwright
import sys
F=sys.argv[1] if len(sys.argv)>1 else 'file:///home/claude/실측스튜디오_오프라인.html'
ok=fail=0
def check(c,m):
    global ok,fail
    if c: ok+=1
    else: fail+=1;print('FAIL',m)
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1180,'height':820});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(F);pg.wait_for_timeout(1200)
    pg.evaluate("()=>{setWork('field');step=1;tool=null;render()}");pg.wait_for_timeout(300)
    check(pg.locator('#fsm').count()==1,'full screen on in field mode')
    n0=pg.evaluate("()=>job.photos[job.active].marks.length")
    pg.click('.fsm-btn[data-tool="W"]');pg.wait_for_timeout(200)
    box=pg.locator('#photoSvg').bounding_box()
    pg.mouse.click(box['x']+box['width']*.3,box['y']+box['height']*.45);pg.wait_for_timeout(150)
    pg.mouse.click(box['x']+box['width']*.7,box['y']+box['height']*.45);pg.wait_for_timeout(300)
    inp=pg.locator('#layer input').first
    check(inp.count()==1,'value sheet opened')
    if inp.count():
        inp.fill('2650');pg.keyboard.press('Enter');pg.wait_for_timeout(300)
    n1=pg.evaluate("()=>job.photos[job.active].marks.length")
    check(n1==n0+1,f'mark added {n0}->{n1}')
    check(pg.locator('#fsm').count()==1,'still full screen after measure')
    pg.click('[data-act="fs-off"]');pg.wait_for_timeout(300)
    check(pg.locator('#fsm').count()==0 and pg.locator('#c-name').count()==1,'info form shown')
    pg.click('[data-act="fs-on"]');pg.wait_for_timeout(300)
    check(pg.locator('#fsm').count()==1,'back to full screen')
    pg.evaluate("()=>{setWork('office');fsM=null;step=1;render()}");pg.wait_for_timeout(200)
    check(pg.locator('#fsm').count()==0,'office mode normal form')
    check(not errs,'errors '+str(errs))
    print('OK',ok,' FAIL',fail);b.close()
