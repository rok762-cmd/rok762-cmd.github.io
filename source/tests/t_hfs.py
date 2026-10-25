# 평면도 전체 화면: 하얀 판이 화면 대부분, 도구는 가장자리, 정보는 서랍
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
    pg.evaluate("()=>{mode='house';hTab='plan';render()}");pg.wait_for_timeout(400)
    check(pg.locator('#hfs').count()==1,'전체 화면 기본')
    bb=pg.locator('#houseBox').bounding_box();print(bb)
    check(bb['width']>1100 and bb['height']>650,'하얀 판 크기 '+str(bb))
    check(pg.locator('.hfs-rail [data-act="h-tool"]').count()==6,'도구 6개 가장자리')
    pg.screenshot(path=O+'hfs0.png')
    pg.click('[data-act="h-addroom"]');pg.wait_for_timeout(300)
    if pg.locator('#layer form').count():
        ins=pg.locator('#roomForm input[inputmode="numeric"]')
        for i in range(ins.count()):ins.nth(i).fill('3200')
        pg.locator('#roomForm button[type=submit]').first.click();pg.wait_for_timeout(400)
        if pg.locator('#layer .overlay').count():pg.evaluate("()=>{document.getElementById('layer').innerHTML=''}")
    n=pg.evaluate("()=>HS().rooms.length");print('rooms',n)
    check(n>=1,'방 추가')
    if pg.locator('.hfs-side.on').count()==0:pg.click('[data-act="h-side"]');pg.wait_for_timeout(200)
    check(pg.locator('.hfs-side.on').count()==1,'정보 서랍 열림')
    pg.screenshot(path=O+'hfs1.png')
    pg.click('[data-act="h-side-close"]');pg.wait_for_timeout(200)
    check(pg.locator('.hfs-side.on').count()==0,'정보 서랍 닫힘')
    pg.screenshot(path=O+'hfs2.png')
    pg.click('[data-act="h-side"]');pg.wait_for_timeout(200)
    check(pg.locator('.hfs-side.on').count()==1,'정보 버튼으로 다시 열림')
    pg.click('.hfs-tabs [data-act="h-tab"][data-v="elev"]');pg.wait_for_timeout(300)
    check(pg.locator('#hfs').count()==0,'다른 탭은 일반 화면')
    pg.evaluate("()=>{hTab='plan';renderHouse()}");pg.click('[data-act="h-fs-off"]');pg.wait_for_timeout(200)
    check(pg.locator('#hfs').count()==0 and pg.locator('[data-act="h-fs-on"]').count()==1,'끄기·다시 켜기 버튼')
    check(not errs,'errors '+str(errs))
    print('OK',ok,' FAIL',fail);b.close()
