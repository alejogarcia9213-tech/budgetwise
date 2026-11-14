import json,sys
# Simula si un guion cabe: python3 sim.py guiones/X.json [car/s]
for f in sys.argv[1:]:
    if f.replace('.','').isdigit(): continue
    cps=float(sys.argv[-1]) if sys.argv[-1].replace('.','').isdigit() else 15.5
    cues=json.load(open(f,encoding='utf-8')); t=0; bad=[]
    for i,(c,x) in enumerate(cues):
        st=max(c,t+.12); t=st+len(x)/cps
        if st-c>0.9: bad.append(f'{i}:{c}+{st-c:.1f}')
    print(f, 'tarde:', ' '.join(bad) or 'ninguna', f'fin {t:.0f}')
