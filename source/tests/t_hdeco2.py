# 평면에서 벽을 이어 눌러 싱크대 ㄱ자·ㄷ자
from playwright.sync_api import sync_playwright
import sys
F=sys.argv[1] if len(sys.argv)>1 else 'file:///home/claude/실측스튜디오_오프라인.html';O='/tmp/claude-0/-home-claude/e64cc57b-be18-55d0-8b1e-980ad89a477a/scratchpad/'
ok=fail=0
def check(c,m):
    global ok,fail
    if c: ok+=1
    else: fail+=1;print('FAIL',m)
def tap(pg,x,y,dx=0,dy=0):
    xy=pg.evaluate(f"()=>{{const svg=document.getElementById('houseSvg'),m=svg.getScreenCTM();const p=svg.createSVGPoint();p.x={x};p.y={y};const q=p.matrixTransform(m);return[q.x,q.y]}}")
    pg.mouse.click(xy[0]+dx,xy[1]+dy);pg.wait_for_timeout(500)
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1280,'height':800});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(F);pg.wait_for_timeout(1200)
    pg.evaluate("""()=>{job=newJob('kitchen');mode='house';hTab='plan';render();const H=HS();H.rooms=[{id:'r1',name:'주방',pts:[[0,0],[4000,0],[4000,3000],[0,3000]]}];H.opens=[];hTab='deco';hView='plan';renderHouse()}""");pg.wait_for_timeout(300)
    pg.click('.hfs-rail [data-act="h-bi-pick"][data-v="kitchen"]');pg.wait_for_timeout(200)
    tap(pg,2000,0,0,2)
    st=lambda:pg.evaluate("()=>{const it=siteAll().find(x=>x.cat==='kitchen'&&x.houseWall);return it?{lay:it.layout,lens:it.faces.map(f=>f.key+f.len),hw:it.houseWall}:null}")
    r=st();print(r);check(r and r['lay']=='I' and r['lens']==['A4000'],'일자 4000')
    check(pg.locator('.hfs-est').count()==1 and '옆 벽' in pg.locator('.hfs-est').inner_text(),'옆 벽 안내')
    tap(pg,4000,1500,-2,0)
    r=st();print(r);check(r and r['lay']=='L' and sorted(r['lens'])==sorted(['A4000','B3000']) or (r and r['lay']=='L' and sorted(r['lens'])==sorted(['A3000','B4000'])),'ㄱ자 '+str(r))
    pg.screenshot(path=O+'hl.png')
    tap(pg,0,1500,2,0)
    r=st();print(r);check(r and r['lay']=='U' and len(r['lens'])==3,'ㄷ자 '+str(r))
    pg.screenshot(path=O+'hu.png')
    check(not errs,'errors '+str(errs))
    print('OK',ok,' FAIL',fail);b.close()
