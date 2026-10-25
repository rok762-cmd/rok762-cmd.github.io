#!/usr/bin/env python3
"""src/ (page.html + app.css + js/*.js, 파일 이름 순서) → silcheuk-studio.html (원본 한 파일)."""
import os, glob
ROOT='/home/claude'; S=os.path.join(ROOT,'src')
page=open(os.path.join(S,'page.html'),encoding='utf-8').read()
css=open(os.path.join(S,'app.css'),encoding='utf-8').read()
js=''.join(open(p,encoding='utf-8').read() for p in sorted(glob.glob(os.path.join(S,'js','*.js'))))
assert page.count('/*@CSS*/\n')==1 and page.count('/*@JS*/\n')==1
out=page.replace('/*@CSS*/\n',css).replace('/*@JS*/\n',js)
open(os.path.join(ROOT,'silcheuk-studio.html'),'w',encoding='utf-8').write(out)
print('assembled',len(sorted(glob.glob(os.path.join(S,'js','*.js')))),'modules',len(out))
