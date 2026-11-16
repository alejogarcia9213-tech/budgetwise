# Reels "Del quirófano a la bolsa" — copy trading en eToro

Guía para continuar este trabajo desde otra sesión. Todo lo necesario para regenerar o ampliar los vídeos está en esta carpeta.

## Qué hay

| Archivo | Para qué sirve |
|---|---|
| `reels/epNN-xx.mp4` | Los 9 reels finales (1080×1920, 30 fps): episodios 09, 10 y 11 en `es`, `en`, `de` |
| `reel.html` | Animación de los reels. Se abre con `?ep=09&lang=es`; cada escena es función del tiempo |
| `i18n.js` | Todos los textos en pantalla, en los tres idiomas |
| `narration-epNN-xx.json` | Guion por escena y frase: `say` (lo que se locuta) y `show` (subtítulo) |
| `timeline-epNN-xx.js` | Tiempos de cada frase; lo genera `build_audio.py`, no se edita a mano |
| `build_audio.py` | Crea la pista de voz y el timeline |
| `render.mjs` | Renderiza fotogramas con Playwright y une el audio con ffmpeg |
| `assets/brand/` | Fotos de entrada, foto del Pro Investor Summit, logo PRO INV≡STOR y la miniatura real de eToro |
| `assets/logos/` | Logos de Meta, Microsoft, Intuitive Surgical, Spotify, Tesla, Nvidia |
| `assets/perfil-*.jpg` | Capturas del perfil de eToro (año a año y total) |
| `assets/voz/` | Locuciones completas de Higgsfield (`higgsfield-xavier` para español, `higgsfield-marcus` para inglés y alemán) |
| `muestras-voz/` | Muestras de cuatro voces de Higgsfield |
| `video.html`, `copy-trading-etoro.mp4` | Versión horizontal anterior (16:9). Sustituida por los reels; el MP4 aún dice "Elite" |

## Los tres episodios

- **09 · Qué pasa por dentro cuando me copias:** inversor → tu cuenta, pasteles con logos, compra de Nvidia y venta de Tesla, movimiento 1 a 1, "el resultado puede variar", control y cuenta virtual.
- **10 · Aportes mensuales y número FIRE:** perfil, resultados año a año con capturas, simulación de $300 al mes, comparación 13,8% frente a 9,7% anual, número FIRE.
- **11 · Cómo copiarme en 8 pasos:** búsqueda con la miniatura real, teléfono con los 8 pasos, "antes de confirmar".

## Formato de marca

- Vertical 9:16, fondo verde oscuro, acentos `#2fe36e`, tipografía Inter.
- Píldora superior "Del quirófano a la bolsa · Episodio N" (en: "From the operating room to the stock market", de: "Vom OP-Saal an die Börse").
- Zona útil entre y=290 y y=1562; línea de progreso en y=1562.
- Tarjeta final: foto del Summit, "Alejandro García", cargo, @AlejandroGarciaO, llamada a la acción, logo y aviso de riesgo.
- Narración en primera persona.
- Cargo: "Instrumentador Quirúrgico" (es), "Scrub Nurse" (en), "Operationstechnischer Assistent" (de, pendiente de confirmar).
- Título en eToro: **Popular Investor Champion** (no Elite).
- Miniatura de eToro: foto + "Jaime Alejandro Garcia Otalora ★" + @AlejandroGarciaO.

## Datos usados

- Portafolio público del 10 nov 2026: META 12,48%, MSFT 9,63%, ISRG 7,02%, SPOT 6,43%, TSLA 6,02%, otros 0,11%, efectivo 58,31%.
- Rentabilidad por año (13 nov 2026): 2022 −16,79%, 2023 +26,08%, 2024 +10,88%, 2025 +22,98%, 2026 +7,11%; total +53,2% desde el 16/04/2022.
- Rentabilidades mensuales: constante `GAINS` en `reel.html`.
- Simulación de $300 al mes desde abril de 2022: $16.800 aportados → $23.204; ≈13,8% anual sobre lo aportado frente a ≈9,7% de una inversión única. Sin costes.
- FIRE: gastos anuales × 25; ejemplo de $1.500 al mes → $450.000; al 8% hipotético: 30, 22,5 y 17 años aportando $300, $600 y $1.000.
- Nvidia en el episodio 09 es un ejemplo ilustrativo, no una posición real.
- Copy Stop-Loss: 40% por defecto, rango 5–95% (texto tomado del episodio 8 original). Mínimo para copiar: $200.

Antes de publicar algo nuevo conviene refrescar las cifras con el conector de eToro (`get-trader-profile-summary` y `/api/v2/portfolios/AlejandroGarciaO/gain/monthly`).

## Voces

Las voces por defecto (la voz clonada de Alejandro en español, inglés y alemán) están en `CLAUDE.md`, en la raíz del repositorio. Xavier y Marcus, usadas en las primeras versiones, ya no se usan.

Cómo se genera una locución:

1. Se envía el guion completo de un vídeo en una sola petición, con una línea en blanco entre frases. Higgsfield acepta unas 3 peticiones a la vez; el resto falla con 429 y hay que reenviarlas.
2. Se descarga el MP3 (host `d8j0ntlcm91z4.cloudfront.net`, permitido en el entorno "budgetwise").
3. `python3 build_audio.py narration-ep09-es --hf assets/voz/higgsfield-xavier/ep09-es.mp3 --tempo 1.05` corta por pausas y escribe el timeline. Tempo usado: 1.05 en español e inglés, 1.12 en alemán. La salida "car/s por frase" debe ser uniforme (12–18); un valor muy distinto indica un corte mal colocado.

Los textos `say` de los JSON llevan trucos fonéticos para las voces locales ("etoro", "copi tréiding", "Máicrosoft", "Envidia"…). Para Higgsfield se escriben las palabras reales (eToro, copy trading, Microsoft, Nvidia, Popular Investor Champion, FIRE, Copy Stop-Loss).

Alternativa sin créditos: voces locales con `--engine piper --piper <modelo.onnx>` o Kokoro con `--kokoro <kokoro.onnx> <voices.bin>`. Los modelos no están en el repositorio; se descargan de los releases de GitHub de `k2-fsa/sherpa-onnx` (`tts-models`) y `thewh1teagle/kokoro-onnx` (`model-files-v1.0`).

## Renderizar

```bash
node render.mjs --ep 09 --lang es          # vídeo completo → reels/ep09-es.mp4
node render.mjs --ep 09 --lang es 12 40 88 # solo capturas en build/stills para revisar
```

Necesita Playwright (preinstalado en el entorno) y ffmpeg. Un reel de 2 minutos tarda unos 2 minutos.

## Añadir un episodio

1. Escribir `narration-epNN-xx.json` para cada idioma (escenas con `id` y frases).
2. Añadir las escenas a `reel.html` (`<section class="scene" id="...">`) y sus textos a `i18n.js`. Las apariciones se sincronizan con `data-at="escena.frase"` o `data-frac="escena.frase:0.4"`.
3. Añadir `ctaNN` en `i18n.js` para la tarjeta final.
4. Generar la voz, `build_audio.py`, revisar capturas y renderizar.

## Pendientes y decisiones abiertas

- Clonar la voz real de Alejandro en Higgsfield (grabación de 1–2 minutos) y regenerar las locuciones.
- Decidir si inglés y alemán pasan también a Xavier o a la voz clonada.
- Confirmar el cargo en alemán.
- El episodio 10 supera los 2 minutos; valorar partirlo en dos.
- Posible música de fondo, como en los reels originales.
- Nadie ha escuchado todavía las locuciones desde la sesión que las generó: revisar pronunciación y sincronía.
