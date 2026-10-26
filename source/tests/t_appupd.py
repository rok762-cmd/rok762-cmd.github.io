# 앱 설치 버튼 · 열 때 새 버전이면 자동 새로고침
from playwright.sync_api import sync_playwright
import sys,json
F='file:///home/claude/pwa/index.html'
ok=fail=0
def check(c,m):
    global ok,fail
    if c: ok+=1
    else: fail+=1;print('FAIL',m)
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1280,'height':900});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(F);pg.wait_for_timeout(1500)
    check(pg.locator('#appInstallBtn').is_visible(),'앱 설치 버튼 보임')
    pg.click('#appInstallBtn');pg.wait_for_timeout(300)
    check('앱 설치' in pg.locator('#layer').inner_text(),'설치 안내')
    pg.evaluate("()=>{$('#layer').innerHTML=''}")
    v=pg.evaluate("()=>window.SILCHEUK_VER");check(bool(v),'버전 표시 '+str(v))
    # 새 버전 흉내: fetch 가로채기
    pg.evaluate("()=>{const of=window.fetch;window.__reloaded=0;window.fetch=(u,o)=>String(u).startsWith('version.json')?Promise.resolve(new Response(JSON.stringify({v:'zzz'}))):of(u,o);try{sessionStorage.clear()}catch(e){}}")
    pg.evaluate("()=>{window.__mark=1;setTimeout(()=>appUpdCheck(),10)}");pg.wait_for_timeout(3000)
    check(pg.evaluate("()=>window.__mark")!=1,'새 버전이면 새로고침')
    check(not errs,'errors '+str(errs))
    print('OK',ok,' FAIL',fail);b.close()
