# 위치 표시(냉장고·쿡탑·싱크·출입문·키큰장 자리) → 장 자동 배치
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
    pg.evaluate("()=>{job=newJob('kitchen');job.faces[0].len=3600;stdNormalize.quiet=1;step=1;render()}")
    check(pg.locator('[data-act="tool"][data-tool="spot"]').count()>0,'위치 표시 도구 버튼')
    # 사진 없이 시트 직접: 위치 표시 모드 → 위치 표시 종류만
    pg.evaluate("()=>openObsSheet({face:'A',type:'sp_cook',x:2400,z:'',w:600,h:'',spotMode:1})")
    kinds=pg.evaluate("()=>[...document.querySelectorAll('input[name=obs-type]')].map(i=>i.value)")
    check(kinds and all(k.startswith('sp_') for k in kinds),'시트에 위치 종류만 '+str(kinds))
    pg.locator('#sheetForm button[type=submit]').click();pg.wait_for_timeout(300)
    r=pg.evaluate("""()=>{const g=geom(job,0),lo=g.rows.find(r=>r.zone==='lower'),up=g.rows.find(r=>r.zone==='upper'),off=g.cut+g.sL,c=lo.mods.find(m=>m.t==='cook'),h=up.mods.find(m=>m.t==='hood');return{cc:c&&c.x+c.w/2+off,cw:c&&c.w,hc:h&&h.x+h.w/2+off,o:job.obstacles.length}}""")
    print(r)
    check(r['o']==1,'표시 저장')
    check(r['cc'] and abs(r['cc']-2700)<=250,'쿡탑장이 표시 위치로 '+str(r['cc']))
    check(r['cw'] in (600,750,800,900),'쿡탑장 규격')
    check(r['hc'] and abs(r['hc']-r['cc'])<=100,'후드가 쿡탑 위 '+str(r['hc']))
    # 오른쪽 아래 버튼(장 배치 화면 · 설비 칩)으로 출입문 넣기
    pg.evaluate("()=>{job.sel={row:0,i:0};const o={id:uid(),type:'sp_door',face:'A',x:0,z:0,w:900,h:2100};job.obstacles.push(o);toast(autoPlace(job,o));stdNormalize(job);render()}")
    r=pg.evaluate("""()=>{let ep;const g=geom(job,0),lo=g.rows.find(r=>r.zone==='lower'),up=g.rows.find(r=>r.zone==='upper'),gd=lo.mods.find(m=>m.t==='gap'),gu=up.mods.find(m=>m.t==='gap');return{gx:gd&&gd.x,gw:gd&&(gd.open||gd.w),uw:gu&&(gu.open||gu.w),ux:gu&&gu.x,ep:ep=endPanels(job).filter(e=>e.gap).length}}""")
    print(r)
    check(r['gw']==900 and r['gx']<=60,'출입문 빈 칸 왼쪽 '+str(r))
    check(r['uw']==900 and r['ux']==r['gx'],'상부도 같은 자리 비움')
    check(r['ep']>=2,'문 옆 상·하부 EP '+str(r['ep']))
    # 목록에 표시 + 삭제하면 빈 칸도 빠짐
    pg.evaluate("()=>{step=1;render()}")
    html=pg.content();check('이 자리에 맞춰 장을 배치합니다' in html,'목록 표시')
    pg.evaluate("()=>{const o=job.obstacles.find(o=>o.type==='sp_door');ACT['obs-del']({dataset:{id:o.id}})}")
    r=pg.evaluate("()=>job.faces[0].rows.map(r=>r.mods.filter(m=>m.t==='gap').length)")
    check(sum(r)==0,'삭제 시 빈 칸 제거 '+str(r))
    # 냉장고 자리 → 끝 키큰장 냉장고
    pg.evaluate("()=>{const o={id:uid(),type:'sp_fridge',face:'A',x:2680,z:0,w:920,h:1850};job.obstacles.push(o);toast(autoPlace(job,o));stdNormalize(job);render()}")
    te=pg.evaluate("()=>job.tallEnd");check(te and te.get('k')=='fspace' and te.get('side')=='R','냉장고 자리 오른쪽 '+str(te))
    pg.evaluate("()=>{step=2;render()}");pg.wait_for_timeout(300);pg.screenshot(path=O+'spot.png')
    sv=pg.evaluate("()=>drawingSVG(job,0)");check('쿡탑 자리' in sv,'도면에 위치 표시')
    check(not errs,'errors '+str(errs))
    print('OK',ok,' FAIL',fail);b.close()
