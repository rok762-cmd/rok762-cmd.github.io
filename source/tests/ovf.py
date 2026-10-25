from playwright.sync_api import sync_playwright
F='file:///home/claude/실측스튜디오_오프라인.html'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':390,'height':844});pg.goto(F);pg.wait_for_timeout(1200)
    print(pg.evaluate("""()=>{job=newJob('kitchen');step=4;outTab='quote';render();const W=innerWidth;const clip=e=>{for(let a=e.parentElement;a;a=a.parentElement){const o=getComputedStyle(a).overflowX;if(o==="auto"||o==="hidden"||o==="scroll")return true}return false};return [...document.querySelectorAll("body *")].filter(e=>{const r=e.getBoundingClientRect();return r.right>W+2&&r.width>0&&!clip(e)}).slice(0,8).map(e=>e.tagName+'.'+e.className+' '+Math.round(e.getBoundingClientRect().right)+' '+(e.textContent||'').slice(0,40))}"""))
    b.close()
