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
    r=pg.evaluate("""()=>{job=newJob('kitchen');setLayout('L1');job.faces[0].len=3600;job.faces[1].len=2400;job.faces[2].len=2700;stdNormalize.quiet=1;render();
      const fr=(catalog.apps||[]).find(a=>a.kind==='fridge');ACT['fr-pick']({dataset:{id:fr.id}});render();
      const gs=job.faces.map((f,i)=>geom(job,i)),C=gs[2],q=quote();
      return{te:job.tallEnd,C:C.rows.map(r=>r.zone+':'+r.mods.map(m=>(m.tk||m.gk||m.t)+m.w).join(',')),ctC:ctSegs(C,0,C.Wm).length,A:gs[0].rows[0].corners.map(c=>c.tk||c.t),
        ctLines:q.lines.filter(l=>/^상판/.test(l.item)).map(l=>l.spec),tall:q.lines.filter(l=>/키큰장/.test(l.item)).map(l=>l.qty),eps:endPanels(job).map(x=>x.lab)}}""")
    print(r)
    check(r['te']['face']=='A' and r['te']['k']=='fspace','fridge on A end')
    check(any('door900' in x for x in r['C']) and any('pantry600' in x for x in r['C']),'C wall door+tall')
    check(r['ctC']==0,'no counter on C')
    check('fspace' in r['A'],'fridge housing on A')
    check(r['tall']==[3],'tall priced 3m')
    check(any('문 옆 키큰장' in e for e in r['eps']),'EP beside door')
    for i,name in [(2,'l1_c'),(0,'l1_a')]:
        sv=pg.evaluate(f"()=>drawingSVG(job,{i})");pg.set_content('<body style="margin:0">'+sv+'</body>');pg.wait_for_timeout(300);pg.screenshot(path=O+name+'.png');pg.goto(F);pg.wait_for_timeout(900)
        pg.evaluate("""()=>{job=newJob('kitchen');setLayout('L1');job.faces[0].len=3600;job.faces[1].len=2400;job.faces[2].len=2700;stdNormalize.quiet=1;const fr=(catalog.apps||[]).find(a=>a.kind==='fridge');render();ACT['fr-pick']({dataset:{id:fr.id}});render()}""")
    sv=pg.evaluate("()=>planDetailSVG(job)");pg.set_content('<body style="margin:0">'+sv+'</body>');pg.wait_for_timeout(300);pg.screenshot(path=O+'l1_plan.png')
    pg.goto(F);pg.wait_for_timeout(900)
    pg.evaluate("""()=>{job=newJob('kitchen');setLayout('L1');job.faces[0].len=3600;job.faces[1].len=2400;job.faces[2].len=2700;stdNormalize.quiet=1;const fr=(catalog.apps||[]).find(a=>a.kind==='fridge');render();ACT['fr-pick']({dataset:{id:fr.id}});step=4;outTab='customer';viewMode='3d';render()}""")
    pg.wait_for_timeout(2500);pg.screenshot(path=O+'l1_3d.png')
    check(not errs,'errors '+str(errs))
    print('OK',ok,' FAIL',fail);b.close()
