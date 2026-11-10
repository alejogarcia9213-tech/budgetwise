// Renderiza video.html a fotogramas (Playwright) y los une con la narración (ffmpeg).
// Uso: node render.mjs            -> vídeo completo
//      node render.mjs 12.5 40 .. -> solo capturas de esos segundos (revisión)
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const FPS = 30, WORKERS = 4;
const TL = JSON.parse(readFileSync(path.join(dir, 'timeline.js'), 'utf8').replace(/^window\.TL = /, '').replace(/;\s*$/, ''));
const url = pathToFileURL(path.join(dir, 'video.html')).href;
const browser = await chromium.launch();
const open = async () => {
  const p = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.addInitScript(() => { window.__RENDER__ = true; });
  await p.goto(url); await p.evaluate(() => document.fonts.ready);
  return p;
};
const stills = process.argv.slice(2).map(Number);
if (stills.length) {
  mkdirSync(path.join(dir, 'build/stills'), { recursive: true });
  const p = await open();
  for (const t of stills) { await p.evaluate(t => window.setT(t), t); await p.screenshot({ path: path.join(dir, `build/stills/t${String(t).padStart(6, '0')}.jpg`), quality: 80 }); }
  await browser.close(); process.exit(0);
}
const fr = path.join(dir, 'build/frames'); rmSync(fr, { recursive: true, force: true }); mkdirSync(fr, { recursive: true });
const N = Math.ceil(TL.total * FPS); let next = 0;
await Promise.all(Array.from({ length: WORKERS }, async () => {
  const p = await open();
  for (;;) { const i = next++; if (i >= N) break; await p.evaluate(t => window.setT(t), i / FPS); await p.screenshot({ path: path.join(fr, String(i).padStart(5, '0') + '.jpg'), quality: 93 }); if (i % 600 === 0) console.log('frame', i, '/', N); }
}));
await browser.close();
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(fr, '%05d.jpg'), '-i', path.join(dir, 'build/narration.wav'),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-movflags', '+faststart', '-shortest',
  path.join(dir, 'copy-trading-etoro.mp4')], { stdio: 'inherit' });
console.log('ok');
