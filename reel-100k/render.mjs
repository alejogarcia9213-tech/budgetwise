// node render.mjs [fps] [outfile] [--stills]
import { createRequire } from 'module'; const { chromium } = createRequire('/opt/node-tools/node_modules/playwright/index.js')('/opt/node-tools/node_modules/playwright/index.js');
import { spawn } from 'child_process';
import fs from 'fs'; import path from 'path'; import url from 'url';
const D = path.dirname(url.fileURLToPath(import.meta.url));
const fps = +(process.argv[2]||30); const out = process.argv[3]||`${D}/build/video.mp4`;
const stills = process.argv.includes('--stills');
const tl = JSON.parse(fs.readFileSync(`${D}/build/timeline.json`,'utf8'));
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+D+'/reel.html'); await p.evaluate(()=>document.fonts.ready);
await p.evaluate(t=>window.setTimeline(t), tl);
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
if (stills) {
  fs.mkdirSync(`${D}/build/stills`,{recursive:true});
  for (const s of tl.scenes) { const t = s.start + s.dur*0.88; await p.evaluate(t=>window.render(t), t);
    await p.locator('canvas').screenshot({path:`${D}/build/stills/${s.id}.png`}); }
  console.log('stills done', errs); await b.close(); process.exit(0);
}
const ff = spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-framerate',String(fps),'-c:v','mjpeg','-i','-',
  '-i',`${D}/build/voice.wav`,'-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-r',String(fps),
  '-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',out],{stdio:['pipe','inherit','inherit']});
const N = Math.ceil(tl.total*fps);
for (let f=0; f<N; f++) {
  const buf = await p.evaluate(t=>{ window.render(t); return document.getElementById('c').toDataURL('image/jpeg',0.92); }, f/fps);
  const ok = ff.stdin.write(Buffer.from(buf.split(',')[1],'base64'));
  if(!ok) await new Promise(r=>ff.stdin.once('drain',r));
  if (f%300===0) console.log(`frame ${f}/${N}`);
}
ff.stdin.end(); await new Promise(r=>ff.on('close',r)); await b.close();
console.log('done', out, errs);
