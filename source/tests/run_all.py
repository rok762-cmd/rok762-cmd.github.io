#!/usr/bin/env python3
"""전체 점검: 빌드 → 모듈별 점검 → 오프라인·앱 두 빌드 회귀. 하나라도 실패하면 종료 코드 1."""
import subprocess, sys, os, re, glob
ROOT = '/home/claude'
OFF = 'file://' + ROOT + '/실측스튜디오_오프라인.html'
APP = 'file://' + ROOT + '/pwa/index.html'
def run(args, label):
    r = subprocess.run([sys.executable] + args, capture_output=True, text=True, cwd=ROOT, timeout=900)
    out = (r.stdout + r.stderr).strip().splitlines()
    tail = out[-1] if out else ''
    bad = r.returncode != 0 or 'FAIL' in tail and not re.search(r'FAIL 0\b', tail) or "errs ['" in '\n'.join(out) or 'Traceback' in '\n'.join(out)
    print(('✗ ' if bad else '✓ ') + label + ' · ' + tail[:140])
    return not bad
_all=''.join(open(p,encoding='utf-8').read() for p in sorted(glob.glob(ROOT+'/src/js/*.js')));open('/tmp/_silcheuk_all.js','w',encoding='utf-8').write(_all)
_r=subprocess.run(['node','--check','/tmp/_silcheuk_all.js'],capture_output=True,text=True);ok0=_r.returncode==0
print(('✓ ' if ok0 else '✗ ')+'문법 검사 (전체 모듈)'+('' if ok0 else ' · '+(_r.stderr.strip().splitlines() or [''])[0][:160]))
ok = ok0 and run(['build/build.py'], '빌드 (src/ 모듈 → 한 파일)')
# 모듈 구조: 파일 이름 순서대로 합친 결과가 원본과 같은지
js = ''.join(open(p, encoding='utf-8').read() for p in sorted(glob.glob(ROOT + '/src/js/*.js')))
ok &= js in open(ROOT + '/silcheuk-studio.html', encoding='utf-8').read() and print('✓ 모듈 합치기 일치 · ' + str(len(glob.glob(ROOT + '/src/js/*.js'))) + '개') is None
def node(args,label):
    r=subprocess.run(['node']+args,capture_output=True,text=True,cwd=ROOT,timeout=1500);out=(r.stdout+r.stderr).strip().splitlines();tail=out[-1] if out else ''
    bad=r.returncode!=0;print(('✗ ' if bad else '✓ ')+label+' · '+tail[:140]);[print('   '+l) for l in out if l.startswith('FAIL')][:10];return not bad
ok &= node(['tests/engine/engine.test.js','400','7'], '계산 엔진 (화면 없이) · 단위 + 무작위 400개')
ok &= node(['tests/engine/engine.test.js','200','2024'], '계산 엔진 · 다른 무작위 200개')
for t, lab in [('t_rules.py', '현장 규칙 표'), ('t_ep.py', '끝 마감 EP · 뒷선반 코너 휠라'), ('t_qedit.py', '견적 직접 수정'),
               ('t_tall2.py', '냉장고+키큰장 · 최대 폭'), ('t_tdoor.py', '키큰장 도어'), ('t_gap.py', '빈 칸 (문·통로)'), ('t_l1.py', 'ㄱ자 + 옆벽 키큰장'), ('t_drag.py', '칸 끌어서 옮기기'), ('t_snap.py', '칸 폭 정규격 (길이별)'), ('t_fs.py', '전체 화면 실측'), ('t_spot.py', '위치 표시 → 장 배치'), ('t_zoom.py', '실측 사진 확대'), ('t_ep2.py', '보이는 옆면 EP·상몰딩 80'), ('t_hfs.py', '평면도 전체 화면'), ('t_moldask.py', '천장 차이 물어보기'), ('t_hdeco.py', '벽에 붙박이·싱크대 자동 배치·가구 돌리기'), ('t_hdeco2.py', '벽 이어 눌러 ㄱ자·ㄷ자'), ('t_hdoor.py', '모서리 옆 출입문 → 문 앞 비움·EP'), ('t_htall.py', '옆벽 키큰장 벽 (일자·ㄱ자)'), ('t_drw.py', '서랍 모양')]:
    ok &= run(['tests/' + t], lab)
ok &= run(['tests/regress.py', OFF], '전체 회귀 · 오프라인 파일')
ok &= run(['tests/regress.py', APP], '전체 회귀 · 앱')
print('\n전체 결과:', '통과' if ok else '실패')
sys.exit(0 if ok else 1)
