# 드라이브 현장 목록 열기 (수신기 v3 흉내) + 평면 새로 그리기/되돌리기 + 새 현장
from playwright.sync_api import sync_playwright
import sys,json,base64
F=sys.argv[1] if len(sys.argv)>1 else 'file:///home/claude/pwa/index.html';O='/tmp/claude-0/-home-claude/e64cc57b-be18-55d0-8b1e-980ad89a477a/scratchpad/'
ok=fail=0
def check(c,m):
    global ok,fail
    if c: ok+=1
    else: fail+=1;print('FAIL',m)
PH='/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/yQALCAABAAEBAREA/8wABgAQEAX/2gAIAQEAAD8A0s8g/9k='
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1280,'height':900});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    calls=[]
    def handle(route):
        body=json.loads(route.request.post_data or '{}');calls.append(body.get('action'))
        if body.get('action')=='list':
            out={'ok':True,'v':3,'items':[{'folder':'20261026_김철수_파주시 운정동_jdrv1','at':1792990000000}]}
        elif body.get('action')=='get':
            job=pg.evaluate("()=>{const j=newJob('kitchen');j.customer.name='김철수';j.customer.addr='파주시 운정동';j.faces[0].len=3333;j.photos=[{id:'p1',src:'사진_01.jpg',w:10,h:10,marks:[]}];return j}")
            v={'job':job,'title':'김철수','addr':'파주시 운정동','updatedAt':1792990000000,'createdAt':1792990000000,'status':'draft'}
            out={'ok':True,'json':json.dumps(v,ensure_ascii=False),'photos':{'사진_01.jpg':PH}}
        else: out={'ok':True}
        route.fulfill(status=200,content_type='application/json',body=json.dumps(out,ensure_ascii=False))
    pg.route('https://script.google.com/**',handle)
    pg.goto(F);pg.wait_for_timeout(1500)
    pg.evaluate("()=>{SY.url='https://script.google.com/macros/s/TEST/exec';SY.key='k';sySave()}")
    pg.evaluate("()=>openJobs()");pg.wait_for_timeout(500)
    check(pg.locator('[data-act="sy-list"]').count()>=1,'드라이브 현장 열기 버튼')
    check(pg.locator('#jobsModal [data-act="new-job"]').count()==1,'새 현장 버튼')
    pg.click('#jobsModal [data-act="sy-list"]');pg.wait_for_timeout(800)
    check(pg.locator('[data-act="sy-open"]').count()==1,'드라이브 목록 1건')
    pg.screenshot(path=O+'sydrive.png')
    pg.click('[data-act="sy-open"]');pg.wait_for_timeout(1500)
    r=pg.evaluate("()=>({name:job.customer.name,len:job.faces[0].len,id:job.id,ph:String(job.photos[0]?.src||'').slice(0,22)})");print(r)
    check(r['name']=='김철수' and r['len']==3333 and r['id']=='jdrv1','드라이브 현장 열림')
    check(r['ph'].startswith('data:image/jpeg'),'사진도 받아옴')
    # 평면 새로 그리기 / 되돌리기
    pg.evaluate("()=>{mode='house';hTab='plan';const H=HS();H.rooms=[{id:'r1',name:'거실',pts:[[0,0],[3000,0],[3000,3000],[0,3000]]}];renderHouse()}");pg.wait_for_timeout(300)
    pg.click('[data-act="h-clear"]');pg.click('[data-act="h-clear"]');pg.wait_for_timeout(300)
    check(pg.evaluate("()=>HS().rooms.length")==0,'평면 전부 지움')
    pg.click('[data-act="h-unclear"]');pg.wait_for_timeout(300)
    check(pg.evaluate("()=>HS().rooms.length")==1,'되돌리기')
    check(not errs,'errors '+str(errs))
    print('OK',ok,' FAIL',fail);b.close()
