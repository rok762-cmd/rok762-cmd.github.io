# EP 높이: 하부는 바닥부터(다릿발 포함)·상판이 EP 위로, 상부·키큰장은 몰딩만큼 위로, 장식후드 양옆 EP
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
    r=pg.evaluate("""()=>{job=newJob('kitchen');job.dims.H=2400;job.moldPick='full';job.moldPickH=2400;job.moldPickW=2250;job.faces[0].len=3600;job.faces[0].ends={R:'panel'};job.tallEnd={on:true,face:'A',k:'pantry',w:600,side:'L'};
      const lo=job.faces[0].rows.find(r=>r.zone==='lower');lo.mods.splice(2,0,{t:'gap',n:0,gk:'door',userW:900,r:900,fix:true});syncGapsUp(job);stdNormalize.quiet=1;stdNormalize(job);
      const g=geom(job,0),eps=endPanels(job),gap=g.rows.find(r=>r.zone==='lower').mods.find(m=>m.t==='gap'),gs=g.gaps[0];
      return{Hm:g.Hm,ms:g.moldShow,ct0:g.ct0,eps:eps.map(e=>[e.zone,e.h,e.gap?1:e.inner?2:e.hood?3:0]),gapEP:[gap.epZ0,gap.epZ1],gapX:[gap.x,gap.w],ctGap:[gs.x,gs.w]}}""")
    print(r)
    ms=r['ms'];Hm=r['Hm']
    check(ms==150,'몰딩 150 (천장 2400)')
    check(any(z=='lower' and h==r['ct0'] and t==0 for z,h,t in r['eps']),'끝 하부 EP = 바닥~상판밑 (다릿발 포함)')
    check(any(z=='upper' and t==0 and h==700+ms for z,h,t in r['eps']),'끝 상부 EP = 상부 높이 + 몰딩')
    check(any(t==2 and h==Hm+ms for z,h,t in r['eps']),'키큰장 안쪽 EP = 바닥~몰딩 위')
    check(r['gapEP'][0]==0 and r['gapEP'][1]==r['ct0'],'문 옆 하부 EP 바닥부터')
    check(r['ctGap'][1]==900,'상판은 EP 위까지 (빈 칸 900만 비움)')
    # 장식 후드
    r=pg.evaluate("""()=>{job=newJob('kitchen');job.faces[0].len=3000;stdNormalize.quiet=1;stdNormalize(job);const up=job.faces[0].rows.find(r=>r.zone==='upper'),h=up.mods.find(m=>m.t==='hood');h.hk='chimney';render();return endPanels(job).filter(e=>e.hood).map(e=>e.lab)}""")
    print(r);check(len(r)>=1,'장식(침니) 후드 옆 EP')
    r=pg.evaluate("""()=>{const up=job.faces[0].rows.find(r=>r.zone==='upper'),h=up.mods.find(m=>m.t==='hood');h.hk='builtin';return endPanels(job).filter(e=>e.hood).length}""")
    check(r==0,'빌트인 후드(라인 맞음)는 EP 없음 '+str(r))
    check(not errs,'errors '+str(errs))
    print('OK',ok,' FAIL',fail);b.close()
