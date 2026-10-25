import sys
from playwright.sync_api import sync_playwright
F='file:///home/claude/실측스튜디오_오프라인.html'
js=sys.argv[1];out=sys.argv[2];sel=sys.argv[3] if len(sys.argv)>3 else 'svg'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1280,'height':900})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(F);pg.wait_for_timeout(1000)
    print(pg.evaluate(js));pg.wait_for_timeout(600)
    els=[e for e in pg.query_selector_all(sel) if (e.bounding_box() or {}).get('width',0)>400]
    print(len(els)); els[0].screenshot(path=out) if els else pg.screenshot(path=out,full_page=True)
    print('errs',errs);b.close()
