# 서랍 모양: 깊은 1(절반) + 작은 2 기본, 다른 모양 선택
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
    pg.evaluate("()=>{job=newJob('kitchen');job.faces[0].len=3000;step=2;render()}");pg.wait_for_timeout(300)
    hs=lambda t:pg.evaluate(f"()=>{{const g=geom(job,0),lo=g.rows.find(r=>r.zone==='lower'),m=lo.mods.find(m=>m.t==='{t}');const L=layout(m);return L.drawers.map(d=>[Math.round(d.h),d.ext])}}")
    c=hs('cook');print('cook',c);check(len(c)==3 and abs(c[0][0]-2*c[1][0])<=2 and c[1][0]==c[2][0] or abs(c[0][0]-2*c[2][0])<=3,'쿡탑 하부 기본 깊은1+작은2 '+str(c))
    bd=hs('baseDrawer');print('base',bd);check(len(bd)==3 and bd[0][0]>bd[1][0],'하부 서랍 기본 깊은1+작은2')
    i=pg.evaluate("()=>job.faces[0].rows[0].mods.findIndex(m=>m.t==='baseDrawer')")
    pg.evaluate(f"()=>{{job.sel={{row:0,i:{i}}};render()}}");pg.wait_for_timeout(200)
    check(pg.locator('[data-act="mod-dk"]').count()==5,'서랍 모양 버튼 5개')
    pg.evaluate("()=>document.querySelector('[data-act=mod-dk][data-v=even]').click()");pg.wait_for_timeout(200)
    bd=hs('baseDrawer');check(len(bd)==3 and abs(bd[0][0]-bd[1][0])<=2,'같은 높이 3단 '+str(bd))
    pg.evaluate("()=>document.querySelector('[data-act=mod-dk][data-v=d2in]').click()");pg.wait_for_timeout(200)
    bd=hs('baseDrawer');check(sum(1 for h,e in bd if e)==2 and any(not e for h,e in bd),'2단 + 속서랍 '+str(bd))
    sv=pg.evaluate("()=>drawingSVG(job,0)");pg.set_content('<body style="margin:0">'+sv+'</body>');pg.wait_for_timeout(200);pg.screenshot(path=O+'drw.png')
    check(not errs,'errors '+str(errs))
    print('OK',ok,' FAIL',fail);b.close()
