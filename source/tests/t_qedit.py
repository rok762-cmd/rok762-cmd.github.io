from playwright.sync_api import sync_playwright
F='file:///home/claude/실측스튜디오_오프라인.html';O='/tmp/claude-0/-home-claude/e64cc57b-be18-55d0-8b1e-980ad89a477a/scratchpad/'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1280,'height':900});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(F);pg.wait_for_timeout(1200)
    r=pg.evaluate("""()=>{setCat('kitchen');fitSinkCabs();step=4;outTab='quote';render();const q0=quote();return{n:q0.lines.length,total:q0.total,first:q0.lines[0].item+' '+q0.lines[0].qty+'x'+q0.lines[0].price,vat:catalog.prices.vat}}""")
    print('base',r)
    # open editor, change first line price via UI
    pg.click('details[data-qedit] summary');pg.wait_for_timeout(200)
    inp=pg.locator('[data-change="q-ov"][data-k="price"]').first;inp.fill('500000');inp.press('Tab');pg.wait_for_timeout(300)
    pg.click('[data-act="q-add-new"][data-v="운반·양중비"]');pg.wait_for_timeout(300)
    pi=pg.locator('[data-change="q-add"][data-k="price"]').last;pi.fill('150000');pi.press('Tab');pg.wait_for_timeout(300)
    pg.locator('[data-act="q-ov-off"]').nth(1).click();pg.wait_for_timeout(300)
    pg.click('[data-act="q-round"][data-v="100000"]');pg.wait_for_timeout(300)
    r=pg.evaluate("""()=>{const q=quote(),B=quoteBreak();let pdf='ok';try{quotePages()}catch(e){pdf=String(e)}return{total:q.total,before:q.before,disc:q.disc,hidden:q.hidden.map(l=>l.item),last:q.lines.slice(-2).map(l=>l.item+':'+l.amt),ov:job.qOv,target:job.qTarget,margin:B.margin,open:!!document.querySelector('details[data-qedit]').open,pdf}}""")
    print(r)
    pg.locator('details[data-qedit]').scroll_into_view_if_needed();pg.screenshot(path=O+'q1.png')
    pg.evaluate("()=>document.querySelector('.paper-wrap').scrollIntoView()");pg.wait_for_timeout(200);pg.screenshot(path=O+'q2.png')
    pg.set_viewport_size({'width':390,'height':844});pg.wait_for_timeout(300)
    print('ovf',pg.evaluate("()=>document.documentElement.scrollWidth"))
    print('errs',errs);b.close()
