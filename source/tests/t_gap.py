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
    r=pg.evaluate("""()=>{job=newJob('kitchen');job.faces[0].len=4200;stdNormalize.quiet=1;render();step=2;job.sel={row:0,i:0};render();
      ACT['mod-type']({dataset:{t:'gap'}});setModWidth(0,0,900);render();
      const g=geom(job,0),lo=g.rows.find(r=>r.zone==='lower'),gm=lo.mods.find(m=>m.t==='gap'),q=quote();
      return{gap:gm&&(gm.open||gm.w),gw:gm&&gm.w,gaps:g.gaps,others:lo.mods.filter(m=>m.t!=='gap').map(m=>m.w),segs:ctSegs(g,-10,g.Wm+10),ct:q.lines.filter(l=>/상판|하부장 본체/.test(l.item)).map(l=>l.item+' '+l.qty),leaves:leaves(g,doorById(job.doorId)).filter(l=>l.x>=gm.x-1&&l.x<gm.x+gm.w-5&&l.zone==='lower').length,Wm:g.Wm}}""")
    print(r)
    check(r['gap']==900,'gap width 900')
    check(all(w%50==0 for w in r['others']),'others snapped')
    check(len(r['segs'])==2 or (r['segs'] and r['segs'][0][0]>=r['gaps'][0]['x']+r['gaps'][0]['w']-1),'counter split around gap '+str(r['segs']))
    check(r['leaves']==0,'no doors in gap')
    pg.evaluate("()=>ACT['gap-k']({dataset:{v:'pass'}})")
    sv=pg.evaluate("()=>drawingSVG(job,0)");check('통로 900' in sv,'drawing label')
    pg.set_content('<body style="margin:0">'+sv+'</body>');pg.wait_for_timeout(300);pg.screenshot(path=O+'gap.png')
    check(not errs,'errors '+str(errs))
    print('OK',ok,' FAIL',fail);b.close()
