"""Genera build/<nombre>.wav y timeline-*.js a partir de <nombre>.json (voces locales).
Uso: python3 build_audio.py <nombre> --kokoro <kokoro.onnx> <voices.bin> --piper <modelo.onnx>
  nombre: narration | narration-ep09-es | narration-ep11-de ...   (el JSON indica el motor)
  --engine piper [--speed 1.05]: fuerza la voz local de Piper (p. ej. es_MX)
  --patch <n>=<audio.mp3>: con --hf, sustituye la frase n (desde 0) por otra grabación
  --hf <audio.mp3> [--tempo 1.06]: usa una locución completa ya grabada y la corta por pausas"""
import json, sys, numpy as np, soundfile as sf

a = sys.argv[1:]; NAME = a[0]
opt = lambda k, n: a[a.index(k) + 1:a.index(k) + 1 + n] if k in a else None
spec = json.load(open(NAME + ".json", encoding="utf-8"))
LEAD, GAP, TAIL = 0.7, 0.38, 0.9

ENGINE = "split" if "--hf" in a else (opt("--engine", 1) or [spec.get("engine", "kokoro")])[0]
if ENGINE == "split":
    # Una sola locución (p. ej. de Higgsfield/ElevenLabs) con todo el guion: se corta por pausas.
    import subprocess
    sr = 24000; tempo = float((opt("--tempo", 1) or ["1.0"])[0])
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", opt("--hf", 1)[0], "-af", f"atempo={tempo}", "-f", "f32le", "-ac", "1", "-ar", str(sr), "-"], capture_output=True, check=True).stdout
    full = np.frombuffer(raw, dtype=np.float32).copy()
    beats_all = [b for sc in spec["scenes"] for b in sc["beats"]]
    hop = int(.02 * sr); rms = np.array([np.sqrt(np.mean(full[i:i + hop] ** 2)) for i in range(0, len(full) - hop, hop)])
    quiet = rms < max(.004, rms.max() * .035); sil = []; i = 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]: j += 1
            if (j - i) * .02 >= .2 and i > 0 and j < len(quiet): sil.append(((i + j) / 2 * .02, (j - i) * .02))
            i = j
        else: i += 1
    N = len(beats_all); c = np.array([b.get("split_len", len(b["say"])) for b in beats_all], float); total = len(full) / sr
    d = c / c.sum() * total  # duración esperada de cada frase
    pos = [x[0] for x in sil]; S = len(sil); INF = 1e18; best = np.full((N, S), INF); prev = np.zeros((N, S), int)
    for s in range(S): best[0, s] = (pos[s] - d[0]) ** 2 / d[0] - .5 * min(sil[s][1], 1.0)
    for k in range(1, N - 1):
        for s in range(k, S):
            cand = [best[k - 1, p] + (pos[s] - pos[p] - d[k]) ** 2 / d[k] for p in range(s)]
            p = int(np.argmin(cand)); best[k, s] = cand[p] - .5 * min(sil[s][1], 1.0); prev[k, s] = p
    fin = [best[N - 2, s] + (total - pos[s] - d[N - 1]) ** 2 / d[N - 1] for s in range(S)]
    s = int(np.argmin(fin)); cuts = []
    for k in range(N - 2, -1, -1): cuts.append(pos[s]); s = prev[k, s]
    cuts = [0.0] + cuts[::-1] + [total]
    segs = [full[int(cuts[i] * sr):int(cuts[i + 1] * sr)] for i in range(N)]
    for pi in range(len(a)):   # --patch <n>=<audio>: sustituye la frase n (desde 0) por otra grabación
        if a[pi] == "--patch":
            k, pf = a[pi + 1].split("=")
            praw = subprocess.run(["ffmpeg", "-v", "error", "-i", pf, "-af", f"atempo={tempo}", "-f", "f32le", "-ac", "1", "-ar", str(sr), "-"], capture_output=True, check=True).stdout
            segs[int(k)] = np.frombuffer(praw, dtype=np.float32).copy()
    print("car/s por frase:", " ".join(f"{c[i] / (cuts[i + 1] - cuts[i]):.0f}" for i in range(N))); it = iter(segs)
    def tts(text): return next(it)
elif ENGINE == "piper":
    from piper import PiperVoice
    from piper.config import SynthesisConfig
    voice = PiperVoice.load(opt("--piper", 1)[0]); sr = voice.config.sample_rate
    cfg = SynthesisConfig(length_scale=1.0 / float((opt("--speed", 1) or [1.0])[0]))
    def tts(text): return np.concatenate([c.audio_float_array for c in voice.synthesize(text, syn_config=cfg)]).astype(np.float32)
else:
    from kokoro_onnx import Kokoro
    k = Kokoro(*opt("--kokoro", 2)); sr = 24000
    def tts(text): return np.asarray(k.create(text, voice=spec["voice"], speed=spec["speed"], lang=spec.get("lang", "es"))[0], dtype=np.float32)

chunks, n, scenes = [], 0, []
def silence(sec):
    global n
    z = np.zeros(int(sec * sr), dtype=np.float32); chunks.append(z); n += len(z)
for sc in spec["scenes"]:
    start = n / sr; silence(LEAD); beats = []
    for i, b in enumerate(sc["beats"]):
        au = tts(b["say"]); au = au / max(1e-6, np.abs(au).max()) * 0.85
        nz = np.where(np.abs(au) > 0.006)[0]
        if len(nz): au = au[max(0, nz[0] - int(.025 * sr)): nz[-1] + int(.1 * sr)]
        bs = n / sr; chunks.append(au); n += len(au)
        beats.append({"id": b["id"], "start": round(bs, 3), "end": round(n / sr, 3), "text": b["show"]})
        if i < len(sc["beats"]) - 1: silence(GAP)
    silence(TAIL)
    scenes.append({"id": sc["id"], "title": sc["title"], "start": round(start, 3), "end": round(n / sr, 3), "beats": beats})
sf.write("build/" + NAME + ".wav", np.concatenate(chunks), sr)
tl = {"total": round(n / sr, 3), "scenes": scenes}
open(NAME.replace("narration", "timeline") + ".js", "w", encoding="utf-8").write("window.TL = " + json.dumps(tl, ensure_ascii=False, indent=1) + ";\n")
print(NAME, "total", tl["total"])
