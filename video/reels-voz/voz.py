"""Pone una locución sobre un reel ya terminado, sincronizada con las frases en pantalla.
Uso: python3 voz.py <guion.json> <locucion.mp3> <video.mp4> <salida.mp4> [volumen_musica]
  guion.json: [[segundo, "frase"], ...]  (la locución contiene esas frases en orden, separadas por pausas)
La locución se corta por pausas, cada frase se coloca en su segundo y la música original queda de fondo."""
import json, sys, subprocess, numpy as np, soundfile as sf
cues = json.load(open(sys.argv[1], encoding='utf-8')); voice, video, out = sys.argv[2:5]
mus = float(sys.argv[5]) if len(sys.argv) > 5 else 0.28; sr = 24000
SEQ = video == '-'   # modo escena nueva: frases seguidas con pausa fija; escribe <salida>.wav y <salida>.json
dur = 1e9 if SEQ else float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video], capture_output=True, text=True).stdout)
has_audio = (not SEQ) and bool(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', video], capture_output=True, text=True).stdout.strip())

def split(tempo):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', voice, '-af', f'atempo={tempo}', '-f', 'f32le', '-ac', '1', '-ar', str(sr), '-'], capture_output=True, check=True).stdout
    full = np.frombuffer(raw, dtype=np.float32).copy(); hop = int(.02 * sr)
    rms = np.array([np.sqrt(np.mean(full[i:i + hop] ** 2)) for i in range(0, len(full) - hop, hop)])
    quiet = rms < max(.004, rms.max() * .035); sil = []; i = 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]: j += 1
            if (j - i) * .02 >= .18 and i > 0 and j < len(quiet): sil.append(((i + j) / 2 * .02, (j - i) * .02))
            i = j
        else: i += 1
    N = len(cues); c = np.array([len(t) for _, t in cues], float); total = len(full) / sr; d = c / c.sum() * total
    pos = [x[0] for x in sil]; S = len(sil); best = np.full((N, S), 1e18); prev = np.zeros((N, S), int)
    for s in range(S): best[0, s] = (pos[s] - d[0]) ** 2 / d[0] - .5 * min(sil[s][1], 1.0)
    for k in range(1, N - 1):
        for s in range(k, S):
            cand = [best[k - 1, p] + (pos[s] - pos[p] - d[k]) ** 2 / d[k] for p in range(s)]
            p = int(np.argmin(cand)); best[k, s] = cand[p] - .5 * min(sil[s][1], 1.0); prev[k, s] = p
    s = int(np.argmin([best[N - 2, s] + (total - pos[s] - d[N - 1]) ** 2 / d[N - 1] for s in range(S)])); cuts = []
    for k in range(N - 2, -1, -1): cuts.append(pos[s]); s = prev[k, s]
    cuts = [0.0] + cuts[::-1] + [total]; segs = []
    for i in range(N):
        a = full[int(cuts[i] * sr):int(cuts[i + 1] * sr)]; nz = np.where(np.abs(a) > .006)[0]
        segs.append(a[max(0, nz[0] - 480):nz[-1] + 1900] if len(nz) else a)
    return segs, [c[i] / (cuts[i + 1] - cuts[i]) for i in range(N)]

for tempo in [1.0, 1.04, 1.08, 1.12, 1.16]:   # nunca más rápido que 1.16 para que suene natural
    segs, cps = split(tempo); t = 0.0; starts = []; late = 0.0
    for (cue, _), a in zip(cues, segs):
        st = (t + .45 if t else .5) if SEQ else max(cue, t + .12); starts.append(st); late = max(late, st - cue); t = st + len(a) / sr
    if SEQ or (late <= 1.0 and t <= dur - .2): break
if SEQ:
    dur = t + .9; json.dump({'total': round(dur, 2), 'beats': [[round(st, 2), round(st + len(a) / sr, 2), x] for st, a, (_, x) in zip(starts, segs, cues)]}, open(out + '.json', 'w'), ensure_ascii=False)
track = np.zeros(int(dur * sr) + sr, dtype=np.float32)
for st, a in zip(starts, segs):
    i = int(st * sr); track[i:i + len(a)] += a[:len(track) - i]
track = track[:int(dur * sr)] / max(1e-6, np.abs(track).max()) * .9
wav = out + '.voz.wav'; sf.write(wav, track, sr)
if SEQ:
    import os; os.replace(wav, out + '.wav'); print(out, 'total', round(dur, 2)); sys.exit()
fc = f'[0:a]volume={mus}[m];[1:a]aresample=48000[v];[m][v]amix=inputs=2:normalize=0:duration=first[a]' if has_audio else '[1:a]aresample=48000[a]'
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', video, '-i', wav, '-filter_complex', fc, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out], check=True)
import os; os.remove(wav)
print(f'{out}: tempo {tempo}, retraso máx {late:.1f}s, fin voz {t:.1f}/{dur:.0f}s, car/s {min(cps):.0f}-{max(cps):.0f}')
