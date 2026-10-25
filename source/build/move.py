#!/usr/bin/env python3
"""최상위 정의(함수·상수)를 한 모듈에서 다른 모듈 끝으로 옮깁니다: move.py 이름 [이름...] --from 파일 --to 파일"""
import re,sys
TOP=re.compile(r'^(function |const |let |document\.|Object\.|/\*)')
def blocks(path):
    L=open(path,encoding='utf-8').read().split('\n');idx=[i for i,l in enumerate(L) if TOP.match(l)];out=[]
    if not idx or idx[0]>0: out.append(('__head','\n'.join(L[:idx[0] if idx else len(L)])))
    for k,i in enumerate(idx):
        j=idx[k+1] if k+1<len(idx) else len(L);m=re.match(r'^(?:function |const |let )([A-Za-z0-9_$]+)',L[i])
        out.append((m.group(1) if m else L[i][:25],'\n'.join(L[i:j])))
    return out
a=sys.argv[1:];fi=a.index('--from');ti=a.index('--to');names=a[:fi];src=a[fi+1];dst=a[ti+1]
bs=blocks(src);take=[t for n,t in bs if n in names];keep=[t for n,t in bs if n not in names]
missing=set(names)-{n for n,_ in bs};assert not missing,missing
open(src,'w',encoding='utf-8').write('\n'.join(keep))
d=open(dst,encoding='utf-8').read();d=d.rstrip('\n')+'\n'+'\n'.join(t.rstrip('\n') for t in take)+'\n'
open(dst,'w',encoding='utf-8').write(d);print('moved',names,'→',dst)
