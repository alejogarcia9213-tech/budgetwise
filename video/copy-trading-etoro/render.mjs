// Renderiza la animación a fotogramas (Playwright) y los une con la narración (ffmpeg).
// Uso: node render.mjs [--ep 09|10|11 --lang es|en|de] [segundos...]
//   sin --ep  -> video.html (16:9)      con --ep -> reel.html (9:16, reels/epXX-lang.mp4)
//   con segundos -> solo capturas de revisión en build/stills
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2), take = k => { const i = args.indexOf(k); return i >= 0 ? args.splice(i, 2)[1] : null; };
const ep = take('--ep'), lang = take('--lang') || 'es';
const cfg = ep ? { html: 'reel.html', q: `?ep=${ep}&lang=${lang}`, tl: `timeline-ep${ep}-${lang}.js`, w: 1080, h: 1920, wav: `narration-ep${ep}-${lang}.wav`, out: `reels/ep${ep}-${lang}.mp4`, tag: `ep${ep}-${lang}` }
  : { html: 'video.html', q: '', tl: 'timeline.js', w: 1920, h: 1080, wav: 'narration.wav', out: 'copy-trading-etoro.mp4', tag: 'main' };
const FPS = 30, WORKERS = 4;
const TL = JSON.parse(readFileSync(path.join(dir, cfg.tl), 'utf8').replace(/^window\.TL = /, '').replace(/;\s*$/, ''));
const url = pathToFileURL(path.join(dir, cfg.html)).href + cfg.q;
const browser = await chromium.launch();
const open = async () => {
  const p = await browser.newPage({ viewport: { width: cfg.w, height: cfg.h } });
  p.on('pageerror', e => console.log('PAGE ERROR', e.message));
  await p.addInitScript(() => { window.__RENDER__ = true; });
  await p.goto(url); await p.evaluate(() => document.fonts.ready); await p.waitForLoadState('networkidle');
  return p;
};
const stills = args.map(Number);
if (stills.length) {
  mkdirSync(path.join(dir, 'build/stills'), { recursive: true });
  const p = await open();
  for (const t of stills) { await p.evaluate(t => window.setT(t), t); await p.screenshot({ path: path.join(dir, `build/stills/${cfg.tag}-${String(Math.round(t * 10)).padStart(5, '0')}.jpg`), quality: 80 }); }
  await browser.close(); process.exit(0);
}
mkdirSync(path.join(dir, 'reels'), { recursive: true });
const fr = path.join(dir, 'build/frames-' + cfg.tag); rmSync(fr, { recursive: true, force: true }); mkdirSync(fr, { recursive: true });
const N = Math.ceil(TL.total * FPS); let next = 0;
await Promise.all(Array.from({ length: WORKERS }, async () => {
  const p = await open();
  for (;;) { const i = next++; if (i >= N) break; await p.evaluate(t => window.setT(t), i / FPS); await p.screenshot({ path: path.join(fr, String(i).padStart(5, '0') + '.jpg'), quality: 93 }); if (i % 600 === 0) console.log('frame', i, '/', N); }
}));
await browser.close();
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(fr, '%05d.jpg'), '-i', path.join(dir, 'build', cfg.wav),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-movflags', '+faststart', '-shortest',
  path.join(dir, cfg.out)], { stdio: 'inherit' });
rmSync(fr, { recursive: true, force: true });
console.log('ok', cfg.out);
