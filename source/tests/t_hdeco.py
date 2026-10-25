# 평면·가구: 벽 눌러 싱크대·붙박이장 자동 배치, 가구 돌리기 손잡이, 가구 탭 전체 화면
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
    pg.evaluate("""()=>{job=newJob('kitchen');mode='house';hTab='plan';render();const H=HS();H.rooms=[{id:'r1',name:'주방',pts:[[0,0],[4000,0],[4000,3000],[0,3000]]}];
      H.opens=[{id:'o1',room:'r1',edge:0,type:'door',w:900,h:2100,sill:0,off:0,hinge:'L'}];hTab='deco';hView='plan';renderHouse()}""");pg.wait_for_timeout(400)
    check(pg.locator('#hfs').count()==1,'가구 탭 전체 화면')
    check(pg.locator('.hfs-rail [data-act="h-bi-pick"]').count()==6,'붙박이·싱크대 버튼 6개')
    pg.click('.hfs-rail [data-act="h-bi-pick"][data-v="kitchen"]');pg.wait_for_timeout(200)
    # 벽0 (y=0, x 0..4000) 가운데를 화면 좌표로
    xy=pg.evaluate("""()=>{const svg=document.getElementById('houseSvg'),m=svg.getScreenCTM();const p=svg.createSVGPoint();p.x=2500;p.y=0;const q=p.matrixTransform(m);return[q.x,q.y]}""")
    pg.mouse.click(xy[0],xy[1]+2);pg.wait_for_timeout(600)
    r=pg.evaluate("()=>{const it=siteAll().find(x=>x.cat==='kitchen'&&x.houseWall);return it?{len:it.faces[0].len,off:it.houseWall.off,edge:it.houseWall.edge,mode,cabs:(document.getElementById('houseSvg')?.innerHTML.match(/E9DCC6/g)||[]).length}:null}")
    print(r)
    check(r and r['len']==3100 and r['off']==900,'문 빼고 벽 3100에 싱크대 '+str(r))
    check(r and r['mode']=='house','평면에 그대로 있음')
    check(r and r['cabs']>0,'평면에 싱크대 그려짐')
    pg.screenshot(path=O+'hdeco1.png')
    # 붙박이장 다른 벽 (edge 1: x=4000)
    pg.click('.hfs-rail [data-act="h-bi-pick"][data-v="closet"]');pg.wait_for_timeout(200)
    xy=pg.evaluate("""()=>{const svg=document.getElementById('houseSvg'),m=svg.getScreenCTM();const p=svg.createSVGPoint();p.x=4000;p.y=1500;const q=p.matrixTransform(m);return[q.x,q.y]}""")
    pg.mouse.click(xy[0]-2,xy[1]);pg.wait_for_timeout(600)
    r=pg.evaluate("()=>siteAll().filter(x=>x.houseWall).map(x=>[x.cat,x.faces[0].len,x.houseWall.edge])");print(r)
    check(any(c=='closet' and l==2400 and e==1 for c,l,e in r),'붙박이장: 싱크대 코너 600 빼고 2400 '+str(r))
    # 가구 놓고 돌리기 손잡이
    pg.evaluate("()=>{ACT['h-fadd']({dataset:{v:'sofa3'}})}");pg.wait_for_timeout(300)
    check(pg.locator('[data-frot]').count()==1,'돌리기 손잡이')
    hb=pg.locator('[data-frot]').bounding_box();fx=pg.evaluate("()=>{const F=HS().furn[0];const svg=document.getElementById('houseSvg'),m=svg.getScreenCTM();const p=svg.createSVGPoint();p.x=F.x;p.y=F.y;const q=p.matrixTransform(m);return[q.x,q.y]}")
    pg.mouse.move(hb['x']+hb['width']/2,hb['y']+hb['height']/2);pg.mouse.down();pg.mouse.move(fx[0]+200,fx[1],steps=5);pg.mouse.up();pg.wait_for_timeout(300)
    rot=pg.evaluate("()=>HS().furn[0].rot");print('rot',rot)
    check(rot==90,'손잡이로 90° 돌림 '+str(rot))
    pg.screenshot(path=O+'hdeco2.png')
    check(not errs,'errors '+str(errs))
    print('OK',ok,' FAIL',fail);b.close()
