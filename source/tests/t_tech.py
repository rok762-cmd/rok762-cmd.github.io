# 기술자 이름 · 본사 단가 배포/받기 · 설정 잠금 (수신기 v4 흉내)
from playwright.sync_api import sync_playwright
import sys,json
F='file:///home/claude/pwa/index.html';O='/tmp/claude-0/-home-claude/e64cc57b-be18-55d0-8b1e-980ad89a477a/scratchpad/'
ok=fail=0
def check(c,m):
    global ok,fail
    if c: ok+=1
    else: fail+=1;print('FAIL',m)
store={'cat':''}
with sync_playwright() as p:
    b=p.chromium.launch();errs=[]
    def handle(route):
        body=json.loads(route.request.post_data or '{}');a=body.get('action')
        if a=='cat-put': store['cat']=body.get('json','');out={'ok':True}
        elif a=='cat-get': out={'ok':True,'json':store['cat']}
        else: out={'ok':True}
        route.fulfill(status=200,content_type='application/json',body=json.dumps(out,ensure_ascii=False))
    # 본사 기기
    ctx=b.new_context(viewport={'width':1280,'height':900});pg=ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('https://script.google.com/**',handle);pg.goto(F);pg.wait_for_timeout(1500)
    pg.evaluate("()=>{SY.url='https://script.google.com/macros/s/T/exec';SY.key='k';sySave()}")
    pg.evaluate("()=>ACT['tech-set']()");pg.fill('#tech-name','홍길동');pg.fill('#tech-tel','010-1111-2222');pg.click('#techForm button[type=submit]');pg.wait_for_timeout(300)
    check(pg.locator('#techChip').inner_text().strip()=='👷 홍길동','기술자 표시')
    pg.evaluate("()=>{job=newJob('kitchen');job.customer.name='테스트';render()}")
    sv=pg.evaluate("()=>drawingSVG(job,0)");check('홍길동' in sv,'도면 작성 칸에 기술자')
    # 단가 바꾸고 잠금 정하고 배포
    pg.evaluate("()=>{catalog.prices.fillerPrice=77777;saveCatalog();openManager();ACT['mgr-tab']({dataset:{v:'backup'}})}");pg.wait_for_timeout(300)
    check(pg.locator('[data-act="hq-push"]').count()==1,'배포 버튼')
    pg.fill('#lock-pin','1234');pg.click('[data-act="lock-set"]');pg.wait_for_timeout(400)
    pg.evaluate("()=>ACT['mgr-tab']({dataset:{v:'backup'}})");pg.wait_for_timeout(200)
    pg.click('[data-act="hq-push"]');pg.wait_for_timeout(800)
    check(bool(store['cat']) and '77777' in store['cat'],'본사 단가 올라감')
    ctx.close()
    # 기술자 기기 (새 저장소)
    ctx=b.new_context(viewport={'width':1280,'height':900});pg=ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('https://script.google.com/**',handle);pg.goto(F);pg.wait_for_timeout(1200)
    pg.evaluate("()=>{SY.url='https://script.google.com/macros/s/T/exec';SY.key='k';sySave()}")
    pg.evaluate("()=>hqPull(true)");pg.wait_for_timeout(1500)
    check(pg.evaluate("()=>catalog.prices.fillerPrice")==77777,'기술자 태블릿 단가 자동 반영')
    pg.reload();pg.wait_for_timeout(1500)
    check(pg.evaluate("()=>catalog.prices.fillerPrice")==77777 and pg.evaluate("()=>!!catalog.lockHash"),'다시 열어도 유지 (잠금 포함)')
    pg.evaluate("()=>ACT['manage-open']()");pg.wait_for_timeout(300)
    check(pg.locator('#pinForm').count()==1,'잠금: 비밀번호 물어봄')
    pg.fill('#pin-in','9999');pg.click('#pinForm button[type=submit]');pg.wait_for_timeout(300)
    check(pg.locator('#pinForm').count()==1,'틀린 비밀번호 거부')
    pg.fill('#pin-in','1234');pg.click('#pinForm button[type=submit]');pg.wait_for_timeout(400)
    check(pg.locator('#pinForm').count()==0,'맞는 비밀번호로 열림')
    check(not errs,'errors '+str(errs))
    print('OK',ok,' FAIL',fail);b.close()
