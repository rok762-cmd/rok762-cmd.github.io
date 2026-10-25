from playwright.sync_api import sync_playwright
F='file:///home/claude/실측스튜디오_오프라인.html';S='/tmp/claude-0/-home-claude/e64cc57b-be18-55d0-8b1e-980ad89a477a/scratchpad/'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1400,'height':1000});pg.goto(F);pg.wait_for_timeout(1200)
    for i in range(3):
        pg.evaluate(f"()=>{{setCat('kitchen');job.faces[0].len=3200;fitSinkCabs();document.body.innerHTML=factoryPages()[{i}].svg}}")
        pg.locator('svg').first.screenshot(path=S+f'fx{i}.png')
    b.close()
