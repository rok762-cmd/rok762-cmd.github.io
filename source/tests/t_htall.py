# 평면에서 싱크대 끝 옆 벽을 '키큰장 벽'으로: 일자+옆벽 키큰장, ㄱ자+옆벽 키큰장
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
st="()=>{const it=siteAll().find(x=>x.cat==='kitchen'&&x.houseWall);if(!it)return null;const fi=it.faces.findIndex(f=>f.key==='C');const g=fi>=0?withJob(it,()=>geom(it,fi)):null;return{lay:it.layout,twL:!!it.twL,faces:it.faces.map(f=>[f.key,f.len]),C:g?g.rows.map(r=>r.mods.map(m=>m.t+(m.gk||m.tk||'')+'@'+Math.round(m.x+g.cut+g.sL)+'+'+m.w).join(' ')):null}}"
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1280,'height':800});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(F);pg.wait_for_timeout(1200)
    pg.evaluate("""()=>{job=newJob('kitchen');mode='house';hTab='plan';render();const H=HS();H.rooms=[{id:'r1',name:'주방',pts:[[0,0],[4000,0],[4000,3000],[0,3000]]}];H.opens=[];hTab='deco';hView='plan';renderHouse()}""");pg.wait_for_timeout(300)
    check(pg.locator('.hfs-rail [data-v="tallw"]').count()==1,'키큰장 벽 버튼')
    pg.click('.hfs-rail [data-v="kitchen"]');tap(pg,2000,0,0,2);pg.click('.hfs-rail [data-v="kitchen"]')  # 일자 후 완료
    pg.click('.hfs-rail [data-v="tallw"]');tap(pg,4000,1500,-2,0)
    r=pg.evaluate(st);print(r)
    check(r and r['lay']=='I1' and dict(r['faces'])['C']==3000,'일자+옆벽 키큰장 (오른쪽) '+str(r))
    check(r and r['C'] and r['C'][0].count('tallc')==4,'키큰장 4개 (600)')
    pg.screenshot(path=O+'htall1.png')
    # 왼쪽 벽도 되는지 (twL)
    pg.evaluate("()=>{const it=siteAll().find(x=>x.cat==='kitchen');withJob(it,()=>{setLayout('I')});renderHouse()}")
    pg.click('.hfs-rail [data-v="tallw"]');tap(pg,0,1500,2,0)
    r=pg.evaluate(st);print(r);check(r and r['lay']=='I1' and r['twL'],'왼쪽 벽 키큰장 '+str(r))
    # ㄱ자 + 옆벽 키큰장 : 다용도실 문 (오른쪽 벽, 뒷벽에서 900)
    pg.evaluate("""()=>{siteAll().forEach(it=>{delete it.houseWall});const it=siteAll().find(x=>x.cat==='kitchen');withJob(it,()=>setLayout('I'));HS().opens=[{id:'o9',room:'r1',edge:1,type:'door',w:900,h:2100,sill:0,off:900,hinge:'L'}];hPickCat=null;hPickExt=null;renderHouse()}""")
    pg.click('.hfs-rail [data-v="kitchen"]');tap(pg,2000,0,0,2);tap(pg,0,1500,2,0);pg.click('.hfs-rail [data-v="kitchen"]')
    pg.click('.hfs-rail [data-v="tallw"]');tap(pg,4000,1500,-2,0)
    r=pg.evaluate(st);print(r)
    check(r and r['lay']=='L1','ㄱ자+옆벽 키큰장 '+str(r))
    check(r and r['C'] and 'gapdoor@900' in r['C'][0],'옆벽 문 자리 900 비움 '+str(r and r['C']))
    pg.screenshot(path=O+'htall2.png')
    check(not errs,'errors '+str(errs))
    print('OK',ok,' FAIL',fail);b.close()
