# 디귿자 자리인데 오른쪽 벽 모서리에 다용도실 문 → ㄱ자로 멈추고 문 앞 비우고 EP
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
    # 위 벽(0) 4000, 오른쪽 벽(1) 3000: 모서리에서 100 떨어진 곳에 문 900
    pg.evaluate("""()=>{job=newJob('kitchen');mode='house';hTab='plan';render();const H=HS();H.rooms=[{id:'r1',name:'주방',pts:[[0,0],[4000,0],[4000,3000],[0,3000]]}];H.opens=[{id:'o1',room:'r1',edge:1,type:'door',w:900,h:2100,sill:0,off:100,hinge:'L'}];hTab='deco';hView='plan';renderHouse()}""");pg.wait_for_timeout(300)
    pg.click('.hfs-rail [data-act="h-bi-pick"][data-v="kitchen"]');pg.wait_for_timeout(200)
    tap(pg,2000,0,0,2)
    st=lambda:pg.evaluate("()=>{const it=siteAll().find(x=>x.cat==='kitchen'&&x.houseWall);return it?{lay:it.layout,faces:it.faces.map(f=>[f.key,f.len,f.ends||{}]),hw:it.houseWall}:null}")
    r=st();print(r)
    check(r and r['faces'][0][1]==3100 and r['faces'][0][2].get('R')=='panel' or (r and r['faces'][0][1]==3100 and r['faces'][0][2].get('L')=='panel'),'문 앞 900 비우고 3100 + 문 쪽 EP '+str(r))
    tap(pg,0,1500,2,0)
    r=st();print(r);check(r and r['lay']=='L','왼쪽 벽 이어 ㄱ자')
    tap(pg,4000,1500,-2,0)
    r=st();print(r);check(r and r['lay']=='L','문 있는 오른쪽 벽은 ㄷ자 안 됨')
    pg.screenshot(path=O+'hdoor.png')
    # 문이 뒷벽에서 900 떨어져 있으면: 싱크대 뒷벽 전체 + 오른쪽 장은 문 너머까지 (문 자리 비움)
    pg.evaluate("()=>{const H=HS();siteAll().forEach(it=>{delete it.houseWall});H.opens=[{id:'o2',room:'r1',edge:1,type:'door',w:900,h:2100,sill:0,off:900,hinge:'L'}];hPickCat=null;hPickExt=null;renderHouse()}");pg.wait_for_timeout(300)
    pg.click('.hfs-rail [data-act="h-bi-pick"][data-v="kitchen"]');pg.wait_for_timeout(200)
    tap(pg,2000,0,0,2);tap(pg,0,1500,2,0);print('ext',pg.evaluate('()=>JSON.stringify(hPickExt)'));tap(pg,4000,1500,-2,0);print('toast',pg.evaluate("()=>document.querySelector('.toast,#toast')?.textContent"))
    r=pg.evaluate("()=>{const it=siteAll().find(x=>x.cat==='kitchen'&&x.houseWall);if(!it)return null;const fi=it.faces.findIndex(f=>f.key==='C');const g=fi>=0?withJob(it,()=>geom(it,fi)):null;return{lay:it.layout,faces:it.faces.map(f=>[f.key,f.len]),C:g?g.rows.map(r=>r.zone+':'+r.mods.map(m=>m.t+(m.gk||'')+'@'+Math.round(m.x+g.cut+g.sL)+'+'+m.w).join(' ')):null}}")
    print(r)
    check(r and r['lay']=='U' and dict(r['faces'])['A']==4000 and dict(r['faces'])['C']==3000,'뒷벽 전체 + ㄷ자 '+str(r))
    check(r and r['C'] and any('gapdoor@900' in x for x in r['C']),'오른쪽 장: 뒷벽에서 900 지점에 문 빈 칸 '+str(r and r['C']))
    pg.screenshot(path=O+'hdoor2.png')
    check(not errs,'errors '+str(errs))
    print('OK',ok,' FAIL',fail);b.close()
