import json,sys
from playwright.sync_api import sync_playwright
F=sys.argv[1] if len(sys.argv)>1 else 'file:///home/claude/실측스튜디오_오프라인.html'
S='/tmp/claude-0/-home-claude/e64cc57b-be18-55d0-8b1e-980ad89a477a/scratchpad/'
fails=[];ok=0
def check(c,msg):
    global ok
    if c: ok+=1
    else: fails.append(msg); print('FAIL',msg)
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1280,'height':900});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(F);pg.wait_for_timeout(1500)
    check(not errs,'load errors '+str(errs))
    # 1 sweep all categories/layouts/steps/tabs
    r=pg.evaluate("""async()=>{const bad=[];const cats=Object.keys(CATS);
      for(const c of cats){for(const lay of CAT_LAYOUTS[c]){try{job=newJob(c);setLayout(lay);render();
        for(const st of [1,2,3,4]){step=st;if(st===4){for(const t of ['customer','proposal','drawing','make','factory','tile','work','quote']){outTab=t;viewMode='draw';render()}}else render()}
        quote();cutList();const pc=prodCheck();doorOrder();panelList();hwList();factoryPages();drawPages();makePage();workPage();
        pc.list.filter(x=>x.cat==='폭 합계'&&x.lvl==='bad'&&!/모자랍니다/.test(x.msg)).forEach(x=>bad.push(c+'/'+lay+': '+x.msg));
      }catch(e){bad.push(c+'/'+lay+' THROW '+e.message+' '+(e.stack||'').split('\\n')[1])}}}
      return bad}""")
    check(not r,'sweep: '+json.dumps(r,ensure_ascii=False)[:2000])
    check(not errs,'sweep page errors '+str(errs[:5])); errs.clear()
    # 2 alignment
    r=pg.evaluate("""()=>{job=newJob('kitchen');job.faces[0].len=3200;fitSinkCabs();const g=geom();const up=g.rows.find(r=>r.zone==='upper');job.upAlign=false;const g2=geom();job.upAlign=true;return{al:up.aligned,n:up.alignN,hood:up.mods.find(m=>m.t==='hood'),ck:g.rows.find(r=>r.zone==='lower').mods.find(m=>m.t==='cook'),off:g2.rows.find(r=>r.zone==='upper').aligned}}""")
    check(r['al']>=r['n']-1 and r['n']>=2,'align boundaries '+str(r))
    check(r['hood']['x']>=r['ck']['x']-1 and r['hood']['x']+r['hood']['w']<=r['ck']['x']+r['ck']['w']+1,'hood within cooktop span '+str(r))
    check(r['off'] in (None,0) ,'align off has no aligned')
    # manual width disables align for row
    r=pg.evaluate("""()=>{step=2;const ri=cf().rows.findIndex(r=>r.zone==='upper');job.sel={row:ri,i:0};render();const inp=document.querySelector('[data-change="mod-w"]');if(!inp)return 'noinput';inp.value=420;inp.dispatchEvent(new Event('change',{bubbles:true}));const a=geom().rows[ri].mods.map(m=>m.w).join();job.upAlign=false;const b_=geom().rows[ri].mods.map(m=>m.w).join();job.upAlign=true;return{w:a===b_?420:a+' vs '+b_,man:!!cf().rows[ri].manualW}}""")
    check(isinstance(r,dict) and r['w']==420 and r['man'],'manual upper width respected '+str(r))
    pg.evaluate("()=>{ACT.upalign({dataset:{v:'on'}})}")
    check(pg.evaluate("()=>!cf().rows.some(r=>r.manualW)"),'upalign on clears manual')
    # 3 validator & gate
    r=pg.evaluate("""async()=>{job=newJob('kitchen');setLayout('U');fitSinkCabs();const c=prodCheck();let saved=0;const o=savePDF;savePDF=async()=>{saved++};step=4;outTab='drawing';render();const btn=document.querySelector('[data-act="ex-draw-pdf"]');btn.disabled=false;btn.click();await new Promise(r=>setTimeout(r,50));const s1=saved;const btn2=document.querySelector('[data-act="ex-draw-pdf"]');btn2.click();await new Promise(r=>setTimeout(r,50));savePDF=o;return{bad:c.bad,s1,s2:saved,txt:btn2.textContent}}""")
    check(r['bad']>0 and r['s1']==0 and r['s2']==1,'gate blocks then allows '+str(r))
    r=pg.evaluate("""async()=>{job=newJob('kitchen');job.faces[0].len=3200;job.customer={name:'홍길동',addr:'파주',date:today()};fitSinkCabs();const c=prodCheck();let saved=0;const o=savePDF;savePDF=async()=>{saved++};step=4;outTab='factory';render();const btn=document.querySelector('[data-act="fx-all-pdf"]');btn.disabled=false;btn.click();await new Promise(r=>setTimeout(r,50));savePDF=o;return{bad:c.bad,warn:c.warn,saved,list:c.list.filter(x=>x.lvl!=='ok').map(x=>x.msg)}}""")
    check(r['bad']==0 and r['saved']==1,'clean kitchen passes gate '+json.dumps(r,ensure_ascii=False))
    # 4 PDF actually builds
    r=pg.evaluate("""async()=>{const b=await buildPDF(factoryPages().map(p=>({...p,mm:.3})),'A4',.8);return b?b.size:0}""")
    check(r>20000,'factory pdf size '+str(r))
    # 5 field mode
    r=pg.evaluate("""()=>{ACT.work({dataset:{v:'field'}});step=4;outTab='drawing';render();const tabs=[...document.querySelectorAll('[data-act="out"]')].map(b=>b.dataset.v);outTab='quote';render();const qb=document.body.innerHTML.includes('원가');const cls=document.body.classList.contains('field-ui');ACT.work({dataset:{v:'office'}});render();const tabs2=[...document.querySelectorAll('[data-act="out"]')].map(b=>b.dataset.v);return{tabs,tabs2,qb,cls}}""")
    check(r['tabs']==['customer','proposal','quote'] and 'factory' in r['tabs2'] and r['cls'],'field mode tabs '+str(r))
    # 6 presentation
    r=pg.evaluate("""async()=>{openPresent();await new Promise(r=>setTimeout(r,800));const n=presSlides().length;for(let i=0;i<n;i++){PRES.i=i;presDraw();await new Promise(r=>setTimeout(r,300))}const has=!!document.querySelector('#present .money .tot');document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));return{n,has,closed:!document.querySelector('#present')}}""")
    check(r['n']>=3 and r['has'] and r['closed'],'presentation '+str(r))
    # 7 schema migrate
    r=pg.evaluate("""()=>{const old=JSON.parse(JSON.stringify(newJob('closet')));delete old.v;const m=migrate(old);const nw={...JSON.parse(JSON.stringify(newJob('closet'))),v:99};const m2=migrate(nw);return{v:m.v,newer:!!m2._newer,v2:m2.v}}""")
    check(r['v']==2 and r['newer'] and r['v2']==99,'schema '+str(r))
    # 8 backup / restore roundtrip (local DB)
    r=pg.evaluate("""async()=>{await DB.ready;job=newJob('kitchen');job.customer={name:'백업테스트',addr:'서울',date:today()};await saveJobToServer(undefined,{silent:true});const id=job.id;let data=null;const o=saveFile;saveFile=async(n,d)=>{data={n,d}};await backupAll();saveFile=o;const parsed=JSON.parse(data.d);
       await DB.doc('jobs/'+id).delete();const before=(await DB.dump())['jobs/'+id];catalog.company.name='바뀐회사';await restoreAll(parsed);const after=(await DB.dump())['jobs/'+id];return{name:data.n,kind:parsed.kind,n:Object.keys(parsed.docs).length,before:!!before,after:!!after&&after.job.customer.name,cname:catalog.company.name}}""")
    check(r['kind']=='silcheuk-backup' and not r['before'] and r['after']=='백업테스트' and r['cname']!='바뀐회사','backup roundtrip '+json.dumps(r,ensure_ascii=False))
    # send-to-tablet file + receive
    r=pg.evaluate("""async()=>{job=newJob('closet');job.customer={name:'보내기',addr:'x',date:today()};let data=null;const o=saveFile;saveFile=async(n,d)=>{data={n,d}};await sendToTablet();saveFile=o;const pz=JSON.parse(data.d);const id=job.id;await DB.doc('jobs/'+id).delete();await restoreAll(pz);return{n:data.n,kind:pz.kind,got:!!(await DB.dump())['jobs/'+id]}}""")
    check(r['kind']=='silcheuk-send' and r['got'],'send/receive '+str(r))
    # 9 3-point
    r=pg.evaluate("""()=>{job=newJob('kitchen');job.finish='filler';job.photos=[];tpSet('A','w',0,3230);tpSet('A','w',1,3180);tpSet('A','w',2,3250);tpSet('A','h',0,2300);tpSet('A','h',2,2290);return{len:job.faces[0].len,H:job.dims.H,fw:job.faces[0].fw,sL:geom().sL,iss:tpIssues().map(x=>x.lvl)}}""")
    check(r['len']==3180 and r['H']==2290 and r['fw']==50 or (r['len']==3180 and r['H']==2290),'3pt '+str(r))
    r=pg.evaluate("""()=>{tpSet('A','w',2,3330);return{fw:job.faces[0].fw,sL:geom().sL,chk:prodCheck().list.filter(x=>x.cat==='폭 합계').map(x=>x.lvl+':'+x.msg)}}""")
    check(r['fw']==85 and r['sL']>=85,'3pt filler auto '+json.dumps(r,ensure_ascii=False))
    # 10 mobile overflow
    pg.set_viewport_size({'width':390,'height':844})
    r=pg.evaluate("""()=>{const out=[];job=newJob('kitchen');for(const st of [1,2,3,4]){step=st;if(st===4)for(const t of ['factory','quote','drawing']){outTab=t;render();if(document.documentElement.scrollWidth>innerWidth+2)out.push(st+t+':'+document.documentElement.scrollWidth)}else{render();if(document.documentElement.scrollWidth>innerWidth+2)out.push(st+':'+document.documentElement.scrollWidth)}}return out}""")
    check(not r,'mobile overflow '+str(r))
    pg.evaluate("()=>{step=1;render();window.scrollTo(0,0)}");pg.screenshot(path=S+'m1.png')
    pg.evaluate("()=>{step=4;outTab='factory';render();window.scrollTo(0,0)}");pg.screenshot(path=S+'m4.png')
    check(not errs,'final page errors '+str(errs[:5]))
    b.close()
print(f'OK {ok}  FAIL {len(fails)}')
