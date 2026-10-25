import sys
from playwright.sync_api import sync_playwright
F=sys.argv[1] if len(sys.argv)>1 else 'file:///home/claude/실측스튜디오_오프라인.html'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)+' '+str(e.stack)[:400]));pg.on('console',lambda m:errs.append('console:'+m.text) if m.type=='error' else None)
    pg.goto(F);pg.wait_for_timeout(1500);print('\n'.join(errs) or 'no errors');print(pg.evaluate("()=>typeof render"))
    b.close()
