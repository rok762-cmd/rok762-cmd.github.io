# 보이는 옆면 EP(키큰장 안쪽·문 옆) + 주방 상몰딩 80 (도면·견적·3D)
from playwright.sync_api import sync_playwright
import sys,os
F=sys.argv[1] if len(sys.argv)>1 else 'file:///home/claude/실측스튜디오_오프라인.html';O='/tmp/claude-0/-home-claude/e64cc57b-be18-55d0-8b1e-980ad89a477a/scratchpad/'
TJS=O+'three.min.js'
ok=fail=0
def check(c,m):
    global ok,fail
    if c: ok+=1
    else: fail+=1;print('FAIL',m)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':1280,'height':900});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    if os.path.exists(TJS):pg.route('**/three.min.js',lambda r:r.fulfill(path=TJS,content_type='application/javascript'))
    pg.goto(F);pg.wait_for_timeout(1200)
    r=pg.evaluate("""()=>{job=newJob('kitchen');job.faces[0].len=3600;stdNormalize.quiet=1;job.tallEnd={on:true,face:'A',k:'pantry',w:600,side:'R'};
      const lo=job.faces[0].rows.find(r=>r.zone==='lower');lo.mods.unshift({t:'gap',n:0,gk:'door',userW:900,r:900,fix:true});syncGapsUp(job);step=2;render();
      const g=geom(job,0),L=g.rows.find(r=>r.zone==='lower'),ein=(L.corners||[]).find(c=>c.epIn),gd=L.mods.find(m=>m.t==='gap'),eps=endPanels(job),q=quote();
      return{ein:ein&&[ein.w,ein.z1-ein.z0],Hm:g.Hm,gap:gd&&[gd.w,gd.open,gd.epL,gd.epR],inner:eps.filter(e=>e.inner).map(e=>e.lab),gapEp:eps.filter(e=>e.gap).map(e=>e.lab),mold:g.mold,top:g.H-g.Hm,ql:q.lines.filter(l=>/몰딩/.test(l.item)).map(l=>l.item+' '+l.qty)}}""")
    print(r)
    check(r['ein'] and r['ein'][0]==20,'키큰장 안쪽 EP 20')
    check(r['inner'] and '키큰장 안쪽' in r['inner'][0],'EP 목록에 키큰장 안쪽')
    check(r['gap'] and r['gap'][0]==920 and r['gap'][1]==900 and r['gap'][3],'문 옆 EP 자리 (900+20)')
    check(len(r['gapEp'])>=2,'문 옆 하부·상부 EP '+str(r['gapEp']))
    check(r['mold']==80 and r['Hm']==2220 and r['top']==80,'천장 2300 → 장 2220 + 몰딩 80')
    check(any('상몰딩' in x for x in r['ql']),'견적 상몰딩')
    r2=pg.evaluate("()=>{job.dims.H=2600;const g=geom(job,0);const a=[g.Hm,g.H-g.Hm];job.cabH=2200;const g2=geom(job,0);const b=g2.Hm;delete job.cabH;job.dims.H=2300;return[a,b]}")
    print(r2);check(r2[0][0]==2250,'천장 2600 → 장 높이 2250 그대로');check(r2[1]==2200,'현장별 장 높이 2200')
    job_h=pg.evaluate("()=>{job.dims.H=2600;render();return 1}")
    sv=pg.evaluate("()=>drawingSVG(job,0)");check('상몰딩 80' in sv,'도면 상몰딩 표기');check('EP' in sv,'도면 EP 표기')
    pg.set_content('<body style="margin:0;background:#fff">'+sv+'</body>');pg.wait_for_timeout(200);pg.screenshot(path=O+'ep2.png',full_page=True)
    pg.goto(F);pg.wait_for_timeout(1200)
    pg.evaluate("""()=>{job=newJob('kitchen');job.faces[0].len=3600;job.tallEnd={on:true,face:'A',k:'pantry',w:600,side:'R'};const lo=job.faces[0].rows.find(r=>r.zone==='lower');lo.mods.unshift({t:'gap',n:0,gk:'door',userW:900,r:900,fix:true});syncGapsUp(job);step=2;viewMode='3d';render()}""")
    pg.wait_for_timeout(3500)
    has=pg.evaluate("()=>!!window.THREE&&typeof V3!=='undefined'&&!!V3")
    print('3d',has)
    if has:pg.screenshot(path=O+'ep3d.png')
    check(not errs,'errors '+str(errs))
    print('OK',ok,' FAIL',fail);b.close()
