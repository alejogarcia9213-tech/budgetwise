const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:1080,height:1920}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file://'+__dirname+'/reel.html');await p.waitForFunction('window.READY');
const ts=process.argv.slice(2).map(Number);
for(const t of ts){await p.evaluate(t=>draw(t),t);await p.locator('canvas').screenshot({path:`stills/s_${t}.png`,scale:'css'});}
console.log('errors',errs);await b.close()})();
