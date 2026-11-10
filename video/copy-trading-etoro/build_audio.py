"""Genera narration.wav y timeline.js a partir de narration.json (voz Kokoro, local).
Uso: python3 build_audio.py <kokoro.onnx> <voices.bin>"""
import json, sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

LEAD, GAP, TAIL = 0.7, 0.38, 0.9
spec = json.load(open("narration.json", encoding="utf-8"))
k = Kokoro(sys.argv[1], sys.argv[2])
sr = 24000
chunks, cursor, scenes = [], 0.0, []

def silence(sec):
    global cursor
    chunks.append(np.zeros(int(sec * sr), dtype=np.float32)); cursor += int(sec * sr) / sr

for sc in spec["scenes"]:
    start = cursor; silence(LEAD); beats = []
    for i, b in enumerate(sc["beats"]):
        audio, got = k.create(b["say"], voice=spec["voice"], speed=spec["speed"], lang="es")
        assert got == sr
        audio = np.asarray(audio, dtype=np.float32)
        nz = np.where(np.abs(audio) > 0.004)[0]
        if len(nz): audio = audio[max(0, nz[0] - 600): nz[-1] + 2400]
        bs = cursor; chunks.append(audio); cursor += len(audio) / sr
        beats.append({"id": b["id"], "start": round(bs, 3), "end": round(cursor, 3), "text": b["show"]})
        if i < len(sc["beats"]) - 1: silence(GAP)
    silence(TAIL)
    scenes.append({"id": sc["id"], "title": sc["title"], "start": round(start, 3), "end": round(cursor, 3), "beats": beats})

full = np.concatenate(chunks)
full = full / max(1e-6, np.abs(full).max()) * 0.89
sf.write("build/narration.wav", full, sr)
tl = {"total": round(cursor, 3), "scenes": scenes}
open("timeline.js", "w", encoding="utf-8").write("window.TL = " + json.dumps(tl, ensure_ascii=False, indent=1) + ";\n")
for s in scenes: print(s["id"], s["start"], s["end"])
print("total", tl["total"])
