// Renderiza una escena suelta (HTML con window.setT) a MP4: node seg.mjs <html> <timeline.json> <voz.wav> <salida.mp4>
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const [html, tlf, wav, out, still] = process.argv.slice(2);
const TL = JSON.parse(readFileSync(tlf, 'utf8')), fr = out + '.frames'; rmSync(fr, { recursive: true, force: true }); mkdirSync(fr, { recursive: true });
const b = await chromium.launch(), N = Math.ceil(TL.total * 30); let next = 0;
const open = async () => { const p = await b.newPage({ viewport: { width: 1080, height: 1920 } }); await p.addInitScript(tl => { window.TL = tl; }, TL); await p.goto(pathToFileURL(path.resolve(html)).href); await p.evaluate(() => document.fonts.ready); return p; };
if (still) { const p = await open(); await p.evaluate(t => window.setT(t), +still); await p.screenshot({ path: out + '.jpg', quality: 80 }); await b.close(); process.exit(0); }
await Promise.all(Array.from({ length: 4 }, async () => { const p = await open(); for (;;) { const i = next++; if (i >= N) break; await p.evaluate(t => window.setT(t), i / 30); await p.screenshot({ path: path.join(fr, String(i).padStart(5, '0') + '.jpg'), quality: 93 }); } }));
await b.close();
execFileSync('ffmpeg', ['-y', '-v', 'error', '-framerate', '30', '-i', path.join(fr, '%05d.jpg'), '-i', wav, '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-ar', '48000', '-shortest', out], { stdio: 'inherit' });
rmSync(fr, { recursive: true, force: true }); console.log('ok', out);
