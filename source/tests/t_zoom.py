# 실측 사진 확대: 버튼·휠·두 손가락, 확대 상태에서 누른 점이 사진 좌표로 맞는지
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
    pg.evaluate("()=>{setWork('field');step=1;tool=null;render()}");pg.wait_for_timeout(300)
    check(pg.locator('.pz-btns button').count()==3,'확대 버튼 3개')
    b0=pg.locator('#photoSvg').bounding_box()
    pg.click('.pz-btns [data-v="in"]');pg.wait_for_timeout(150);pg.click('.pz-btns [data-v="in"]');pg.wait_for_timeout(150)
    b1=pg.locator('#photoSvg').bounding_box();print(b0,b1)
    check(b1['width']>b0['width']*2.4,'버튼 확대 '+str(round(b1['width']/b0['width'],2)))
    check(pg.locator('#pzLbl').inner_text().startswith('×'),'배율 표시')
    # 확대 상태에서 두 점 찍기 → 사진 좌표가 화면 위치와 일치
    pw,ph=pg.evaluate("()=>[job.photos[job.active].w,job.photos[job.active].h]")
    pg.click('.fsm-btn[data-tool="W"]');pg.wait_for_timeout(200)
    wb=pg.locator('#photoWrap').bounding_box();sb=pg.locator('#photoSvg').bounding_box()
    sx,sy=wb['x']+wb['width']*.4,wb['y']+wb['height']*.5
    pg.mouse.click(sx,sy);pg.wait_for_timeout(150)
    exp=[(sx-sb['x'])/sb['width']*pw,(sy-sb['y'])/sb['height']*ph]
    pend=pg.evaluate("()=>typeof pending!=='undefined'&&pending")
    print('pending',pend,'exp',exp)
    check(pend and abs(pend[0]-exp[0])<=2 and abs(pend[1]-exp[1])<=2,'확대 중 점 위치 정확')
    pg.mouse.click(sx+60,sy);pg.wait_for_timeout(300)
    check(pg.locator('#layer input').count()>=1,'확대 중 재기 시트 열림')
    pg.keyboard.press('Escape');pg.evaluate("()=>{document.getElementById('layer').innerHTML='';tool=null;render()}");pg.wait_for_timeout(200)
    check(pg.locator('#photoSvg').bounding_box()['width']>b0['width']*2,'다시 그려도 확대 유지')
    pg.screenshot(path=O+'zoom.png')
    pg.click('.pz-btns [data-v="fit"]');pg.wait_for_timeout(150)
    check(abs(pg.locator('#photoSvg').bounding_box()['width']-b0['width'])<2,'맞춤으로 복귀')
    # 휠 확대
    pg.mouse.move(wb['x']+wb['width']/2,wb['y']+wb['height']/2);pg.mouse.wheel(0,-400);pg.wait_for_timeout(200)
    check(pg.locator('#photoSvg').bounding_box()['width']>b0['width']*1.3,'휠 확대')
    # 두 손가락(터치 포인터) 벌리기
    pg.click('.pz-btns [data-v="fit"]');pg.wait_for_timeout(100)
    z=pg.evaluate("""()=>{const w=document.getElementById('photoWrap'),r=w.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,t=w.querySelector('svg');
      const ev=(type,id,x)=>t.dispatchEvent(new PointerEvent(type,{pointerId:id,clientX:x,clientY:cy,bubbles:true,pointerType:'touch',cancelable:true}));
      ev('pointerdown',11,cx-40);ev('pointerdown',12,cx+40);for(let k=1;k<=10;k++){ev('pointermove',11,cx-40-k*12);ev('pointermove',12,cx+40+k*12)}ev('pointerup',11,cx-160);ev('pointerup',12,cx+160);return PZ.z}""")
    check(z>2.5,'두 손가락 확대 '+str(z))
    check(not errs,'errors '+str(errs))
    print('OK',ok,' FAIL',fail);b.close()
