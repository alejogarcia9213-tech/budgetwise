#!/usr/bin/env python3
"""Build timeline from script.json + available audio/s{i}.mp3, render frames, mux audio.
Missing narration segments get an estimated duration (silence)."""
import json, os, subprocess, sys
D = os.path.dirname(os.path.abspath(__file__))
sc = json.load(open(f"{D}/script.json"))
speed = sc["voice"]["speed"]
os.makedirs(f"{D}/build", exist_ok=True)
def dur(f): return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f]).decode())
t = 0.0; scenes = []; parts = []
for i, s in enumerate(sc["scenes"]):
    src = f"{D}/audio/s{i}.mp3"; out = f"{D}/build/a{i}.wav"
    if os.path.exists(src):
        subprocess.run(["ffmpeg","-y","-v","error","-i",src,"-af",f"atempo={speed},aresample=48000","-ac","2",out],check=True)
        speak = dur(out); real = True
    else:
        speak = len(s["text"].split())/2.95; real = False
        subprocess.run(["ffmpeg","-y","-v","error","-f","lavfi","-i","anullsrc=r=48000:cl=stereo","-t",f"{speak:.3f}",out],check=True)
    tail = 0.55 if i < len(sc["scenes"])-1 else 1.6
    total = speak + tail
    pad = f"{D}/build/p{i}.wav"
    subprocess.run(["ffmpeg","-y","-v","error","-i",out,"-af",f"apad=whole_dur={total:.3f}",pad],check=True)
    scenes.append({"id": s["id"], "caption": s["caption"], "start": round(t,3), "dur": round(total,3), "speak": round(speak,3), "voiced": real})
    parts.append(pad); t += total
tl = {"scenes": scenes, "total": round(t,3)}
json.dump(tl, open(f"{D}/build/timeline.json","w"), indent=1)
with open(f"{D}/build/list.txt","w") as f:
    for p in parts: f.write(f"file '{p}'\n")
subprocess.run(["ffmpeg","-y","-v","error","-f","concat","-safe","0","-i",f"{D}/build/list.txt","-c","pcm_s16le",f"{D}/build/voice.wav"],check=True)
print(json.dumps([(s["id"], s["dur"], s["voiced"]) for s in scenes]), "total", round(t,2))
