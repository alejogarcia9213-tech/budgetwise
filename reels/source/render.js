const {chromium}=require('playwright');const {spawn}=require('child_process');
const FPS=30,WK=4;
(async()=>{const b=await chromium.launch({args:['--allow-file-access-from-files']});
const p0=await b.newPage({viewport:{width:1080,height:1920}});await p0.goto('file://'+__dirname+'/reel.html');await p0.waitForFunction('window.READY');
const total=await p0.evaluate('TOTAL');await p0.close();const N=Math.ceil(total*FPS);const per=Math.ceil(N/WK);
await Promise.all([...Array(WK)].map(async(_,w)=>{const p=await b.newPage({viewport:{width:1080,height:1920}});await p.goto('file://'+__dirname+'/reel.html');await p.waitForFunction('window.READY');
 const ff=spawn('ffmpeg',['-y','-f','image2pipe','-framerate',''+FPS,'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p',`seg${w}.mp4`],{stdio:['pipe','ignore','ignore']});
 const a=w*per,e=Math.min(N,a+per);
 for(let f=a;f<e;f++){const d=await p.evaluate(t=>{draw(t);return document.getElementById('c').toDataURL('image/jpeg',0.95)},f/FPS);
  const buf=Buffer.from(d.split(',')[1],'base64');if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(w===0&&f%300===0)console.log('frame',f,'/',per);}
 ff.stdin.end();await new Promise(r=>ff.on('close',r));}));
await b.close();console.log('done',N)})();
