import json
from playwright.sync_api import sync_playwright
F='file:///home/claude/실측스튜디오_오프라인.html'
S='/tmp/claude-0/-home-claude/e64cc57b-be18-55d0-8b1e-980ad89a477a/scratchpad/'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1280,'height':1000});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(F);pg.wait_for_timeout(1200)
    pg.evaluate("()=>{setCat('kitchen');job.finish='filler';job.photos=[];openSec.add('tp');step=1;render()}")
    vals={'w0':3212,'w1':3200,'w2':3226,'h0':2310,'h1':2302,'h2':2318,'d0':3950,'d1':3972}
    for k,v in vals.items():
        el=pg.locator(f'input[data-tp="{k}"]'); el.click(); el.fill(str(v)); el.press('Tab'); pg.wait_for_timeout(120)
    r=pg.evaluate("()=>({len:job.faces[0].len,H:job.dims.H,fw:job.faces[0].fw,tp:job.faces[0].tp,iss:tpIssues(),sL:geom().sL,sR:geom().sR,focus:document.activeElement?.dataset?.tp})")
    print(json.dumps(r,ensure_ascii=False))
    # laser parse
    r2=pg.evaluate("""()=>{const f=new DataView(new ArrayBuffer(4));f.setFloat32(0,2.345,true);const b=new DataView(new ArrayBuffer(16));b.setUint8(0,0xC0);b.setUint8(1,0x55);b.setUint8(2,0x10);b.setFloat32(7,1.5,true);const t=new DataView(new TextEncoder().encode('D=1.234m\\r\\n').buffer);const t2=new DataView(new TextEncoder().encode('1234mm').buffer);
      return [lzParse(f,'disto'),lzParse(b,'bosch'),lzParse(t,'ffe0'),lzParse(t2,'nus')]}""")
    print(r2)
    pg.evaluate("()=>{delete job.faces[0].tp;recomputeDims();render()}")
    pg.locator('input[data-tp="w0"]').click()
    pg.evaluate("()=>lzInput(2995)"); pg.wait_for_timeout(300)
    print(pg.evaluate("()=>({tp:job.faces[0].tp,len:job.faces[0].len,focus:document.activeElement?.dataset?.tp})"))
    el=pg.locator('details[data-sec="tp"]'); el.scroll_into_view_if_needed(); el.screenshot(path=S+'tp.png')
    print(errs);b.close()
