# Reel: La regla de los primeros $100.000

- `reel-100k-borrador.mp4` — vídeo 1080×1920, 30 fps, ~96 s. Escenas 1 y 4 llevan tu voz clonada (Alejo-Español, elevenlabs_v4, +5 %); el resto tiene subtítulos y silencio con la duración estimada.
- `script.json` — guion por escena (texto para la voz y subtítulos).
- `audio/s{N}.mp3` — narración por escena (N = 0…8). Cuando exista un archivo, su duración real manda.

Rehacer el vídeo cuando estén todos los audios:

```
python3 build.py && node render.mjs 30 reel-100k-final.mp4
```

Números: simulación mensual con CAGR constante (12,5 % salvo donde dice 10–15 %).
