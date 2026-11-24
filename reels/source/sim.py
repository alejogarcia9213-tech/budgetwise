import json
mon=[-3.22,-3.54,-10.77,1.24,1.55,-1.66,-2.38,4.72,-3.35,11.68,-4.44,6.48,-0.22,-1.96,4.32,3.47,-4.6,-4.07,-3.8,11.71,6.84,-2.91,8.73,2.59,-6.78,3.39,2.53,2.67,0.51,0.58,-0.34,2.56,-2.33,1.27,-0.16,-3.08,1.99,6.76,5.99,-0.21,3.55,5.71,3.38,-4.24,0.57,2.67,-5.92,-4.47,14.67,20.04,-3.92,-13.81,12.77,4.44,-13.11,-2.03]
# months Apr2022..Nov2026
months=[]
y,m=2022,4
for _ in mon: months.append(f"{y}-{m:02d}"); m+=1; y+= m==13; m = 1 if m==13 else m
c=json.load(open("spy_weekly.json"))
c=sorted(c,key=lambda r:r["fromDate"])
# month-end close: last weekly candle starting in that month
last={}
for r in c: last[r["fromDate"][:7]]=r["close"]
spy=[]
prev=last["2022-03"]
for mo in months:
    cur=last[mo]; spy.append((cur/prev-1)*100); prev=cur
def run(rets,amt=500):
    v=0;inv=0;rows=[]
    lump=1
    for i,r in enumerate(rets):
        v+=amt;inv+=amt   # contribute at start of month
        v*=1+r/100; lump*=1+r/100
        rows.append(dict(month=months[i],inv=inv,val=round(v,2),gainpct=round((v/inv-1)*100,2),lump=round((lump-1)*100,2)))
    # IRR monthly
    n=len(rets)
    def npv(x): return sum(-amt*(1+x)**(n-i) for i in range(n))+v
    lo,hi=-0.05,0.05
    for _ in range(200):
        mid=(lo+hi)/2
        if npv(mid)>0: lo=mid
        else: hi=mid
    irr=(1+mid)**12-1
    return rows,irr
out={}
for name,r in [("ago",mon),("spy",spy)]:
    rows,irr=run(r); out[name]=dict(rows=rows,irr=irr)
    f=rows[-1]; print(name,f, "IRR %.2f%%"%(irr*100), "max gainpct", max(x['gainpct'] for x in rows))
out["months"]=months; out["spy_monthly"]=[round(x,2) for x in spy]
json.dump(out,open("sim.json","w"))
for i in range(0,len(months),6): print(months[i], out["ago"]["rows"][i]["gainpct"], out["ago"]["rows"][i]["lump"], out["spy"]["rows"][i]["gainpct"], out["spy"]["rows"][i]["lump"])
