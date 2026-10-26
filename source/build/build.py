#!/usr/bin/env python3
"""실측 스튜디오 빌드: 원본(silcheuk-studio.html) → 앱(PWA index.html, sw.js) + 오프라인 파일."""
import re, hashlib, os, sys, subprocess
subprocess.run([sys.executable, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assemble.py')], check=True)
ROOT = '/home/claude'
B = os.path.join(ROOT, 'build')
src = open(os.path.join(ROOT, 'silcheuk-studio.html'), encoding='utf-8').read()
jspdf = open(os.path.join(B, 'jspdf.inl'), encoding='utf-8').read()
three = open(os.path.join(B, 'three.inl'), encoding='utf-8').read()
CDN = '<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>'
assert src.count(CDN) == 1, 'jspdf CDN tag missing'
body = re.sub(r'<title>[^<]*</title>\n?', '', src, count=1)
body = body.replace(CDN, jspdf + three)

HEAD_APP = ('<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
            '<title>실측 스튜디오</title><meta name="theme-color" content="#1E56D0"><link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icon-192.png"><link rel="apple-touch-icon" href="icon-192.png">\n'
            '<script>window.SILCHEUK_APP=true;window.SILCHEUK_VER="@VER@";addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__bip=e;window.dispatchEvent(new Event("bip-ready"))});addEventListener("appinstalled",function(){window.__bip=null;window.__installed=true})</script></head><body>\n')
bver = hashlib.md5(body.encode()).hexdigest()[:8]
app = HEAD_APP.replace('@VER@', bver) + body + '</body></html>'
out = os.path.join(ROOT, 'pwa')
os.makedirs(out, exist_ok=True)
open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(app)
ver = hashlib.md5(app.encode()).hexdigest()[:8]
sw = open(os.path.join(ROOT, 'rok762-cmd.github.io', 'sw.js'), encoding='utf-8').read()
sw = re.sub(r"const V='silcheuk-[0-9a-f]+'", f"const V='silcheuk-{ver}'", sw)
if "version.json" not in sw:
    sw = sw.replace("if(e.request.method!=='GET'||u.origin!==location.origin)return;", "if(e.request.method!=='GET'||u.origin!==location.origin)return;\n  if(u.pathname.endsWith('/version.json'))return; // 새 버전 확인은 항상 인터넷에서", 1)
open(os.path.join(out, 'version.json'), 'w', encoding='utf-8').write('{"v":"%s"}' % bver)
open(os.path.join(out, 'sw.js'), 'w', encoding='utf-8').write(sw)

HEAD_OFF = ('<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
            '<title>실측 스튜디오</title><script>window.SILCHEUK_OFFLINE=true</script></head><body>\n')
off = HEAD_OFF + body + '</body></html>'
open(os.path.join(ROOT, '실측스튜디오_오프라인.html'), 'w', encoding='utf-8').write(off)
print('built', ver, len(app), len(off))
