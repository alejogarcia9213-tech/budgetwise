import json, subprocess, wave, os
from script import S
V="voices/vits-piper-es_MX-claude-high/es_MX-claude-high"
os.makedirs("audio",exist_ok=True)
GAP_LINE=0.35; GAP_SCENE=0.8; LEAD=0.6
t=LEAD; timeline=[]; files=[]
for sid,lines in S:
    sc={"id":sid,"start":t,"lines":[]}
    for i,txt in enumerate(lines):
        f=f"audio/{sid}_{i}.wav"
        subprocess.run(["python3","-m","piper","-m",V+".onnx","-c",V+".onnx.json","-f",f,"--length-scale","0.95","--sentence-silence","0.15"],input=txt.encode(),check=True,capture_output=True)
        with wave.open(f) as w: d=w.getnframes()/w.getframerate()
        sc["lines"].append({"t":t,"d":d,"text":txt}); files.append((f,t))
        t+=d+GAP_LINE
    t+=GAP_SCENE-GAP_LINE
    sc["end"]=t; timeline.append(sc)
total=t+1.5
json.dump({"total":total,"scenes":timeline},open("timeline.json","w"),indent=1,ensure_ascii=False)
# build narration track
inputs=[];flt=[]
for i,(f,st) in enumerate(files):
    inputs+=["-i",f]; flt.append(f"[{i}:a]adelay={int(st*1000)}|{int(st*1000)}[a{i}]")
mix="".join(f"[a{i}]" for i in range(len(files)))+f"amix=inputs={len(files)}:normalize=0,apad=whole_dur={total}[out]"
subprocess.run(["ffmpeg","-y",*inputs,"-filter_complex",";".join(flt)+";"+mix,"-map","[out]","-ar","44100","-ac","2","narration.wav"],check=True,capture_output=True)
print("total",round(total,1))
for s in timeline: print(s["id"],round(s["start"],1),round(s["end"],1))
