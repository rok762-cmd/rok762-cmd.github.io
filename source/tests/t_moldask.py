# 천장이 장보다 많이 높으면 몰딩·장 높이를 물어봄
from playwright.sync_api import sync_playwright
import sys
F=sys.argv[1] if len(sys.argv)>1 else 'file:///home/claude/실측스튜디오_오프라인.html';O='/tmp/claude-0/-home-claude/e64cc57b-be18-55d0-8b1e-980ad89a477a/scratchpad/'
ok=fail=0
def check(c,m):
    global ok,fail
    if c: ok+=1
    else: fail+=1;print('FAIL',m)
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1280,'height':800});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(F);pg.wait_for_timeout(1200)
    pg.evaluate("()=>{job=newJob('kitchen');step=2;render()}");pg.wait_for_timeout(300)
    check(pg.locator('[data-act="mold-pick"]').count()==0,'차이 작으면(2300) 안 물어봄')
    pg.evaluate("()=>{job.dims.H=2600;render()}");pg.wait_for_timeout(300)
    check(pg.locator('[data-act="mold-pick"]').count()==4,'천장 2600 → 물어봄')
    pg.screenshot(path=O+'moldask.png')
    pg.click('[data-act="mold-pick"][data-v="raise"]');pg.wait_for_timeout(300)
    r=pg.evaluate("()=>{const g=geom(job,0);return[g.Hm,g.moldShow]}");print(r)
    check(r==[2520,80],'장 높여 천장 맞춤 '+str(r))
    pg.evaluate("()=>render()");pg.wait_for_timeout(300)
    check(pg.locator('[data-act="mold-pick"]').count()==0,'정한 뒤 다시 안 물어봄')
    pg.evaluate("()=>{job.dims.H=2800;delete job.cabH;render()}");pg.wait_for_timeout(300)
    check(pg.locator('[data-act="mold-pick"]').count()==4,'천장 바뀌면 다시 물어봄')
    pg.click('[data-act="mold-pick"][data-v="gap"]');pg.wait_for_timeout(300)
    r=pg.evaluate("()=>{const g=geom(job,0);return[g.Hm,g.moldShow]}");check(r==[2250,80],'몰딩 80만 '+str(r))
    pg.evaluate("()=>{job.dims.H=2900;render()}");pg.wait_for_timeout(300)
    pg.fill('#maCab','2300');pg.select_option('#maMode','full');pg.click('[data-act="mold-pick"][data-v="custom"]');pg.wait_for_timeout(300)
    r=pg.evaluate("()=>{const g=geom(job,0);return[g.Hm,g.moldShow]}");check(r==[2300,600],'직접 입력 '+str(r))
    check(not errs,'errors '+str(errs))
    print('OK',ok,' FAIL',fail);b.close()
