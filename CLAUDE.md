# Notas para Claude

## Reels de copy trading (marca "Del quirófano a la bolsa")

El trabajo de vídeos para Instagram está en `video/copy-trading-etoro/`. Antes de tocar nada ahí o de crear episodios nuevos, lee `video/copy-trading-etoro/README.md`: describe el formato de marca, los datos usados, las voces de Higgsfield, cómo generar la locución y cómo renderizar.

Ese trabajo vive en la rama `claude/etoro-copy-trading-guide-982hc3` (aún no fusionada en `main`).

## Reels con la voz clonada de Alejandro

Carpeta `video/reels-voz/`. Sirve para poner narración sobre reels ya renderizados (sin archivos fuente):

- `guiones/<reel>.json`: frases de la narración con el segundo en que aparece cada una en pantalla (sacado por OCR de los subtítulos).
- `voz.py`: corta una locución completa por pausas, coloca cada frase en su segundo y mezcla con la música original bajada. No vuelve a codificar el vídeo. `sim.py` comprueba antes si un guion cabe en sus tiempos (unos 14,5 caracteres por segundo).
- `lump.html` + `seg.mjs`: escena suelta "DCA vs. inversión única", renderizada aparte e insertada en R02 con ffmpeg.
- `salida/`: reels finales. `voz/`: locuciones de Higgsfield.

**Voces por defecto de Alejandro (elegidas por él de oído; usar siempre estas en reels y vídeos nuevos, salvo que pida otra cosa).** Todas con su voz clonada en Higgsfield: `Alejo-Español`, id `ffff1547-43ad-41ee-be93-a1ba88daa60f`, `voice_type: element`, modelo `elevenlabs_v4` con `dialogue` (un solo turno) y el texto empezando por la etiqueta indicada:

| Idioma | Etiqueta al inicio del texto | Velocidad al montar |
|---|---|---|
| Español | `[Colombian Spanish accent]` (sin etiqueta de tono) | `--tempo 1.05` |
| Inglés | `[British accent]` | `--tempo 1.0` |
| Alemán | `[native German speaker, standard High German]` | `--tempo 1.0` |

Descartado para español: `text2speech_v2` con `variant: elevenlabs` (no deja fijar el acento y se desvió a argentino) y las etiquetas de tono alegre o enérgico (le parecieron demasiado rápidas y alegres). Cada guion completo con `elevenlabs_v4` cuesta unos 9 créditos.

- Un guion completo por petición, frases separadas por línea en blanco; máximo unas 3 peticiones a la vez. Escribir las cifras con letras.

Pendiente: versión en inglés de R02, R04, R06 y "Nota de domingo" (hay que reconstruir la animación, el texto va grabado en la imagen) y decidir qué hacer con los dos vídeos horizontales (`dca-explicado`, `fire-4-percent-rule`), cuyo contenido ya cubren R02, R04 y R06.
