// Uso: node run_preview.js <jsx> <carpeta_emojis_existentes> <carpeta_salida>
// Ejecuta el JSX con mock.js en Chromium y guarda un PNG por mesa (NN.png) + vista general (todas.png).
const fs=require('fs'),path=require('path'),{chromium}=require('playwright');
const [jsx,emDir,out]=process.argv.slice(2),here=__dirname;
(async()=>{
  let code=fs.readFileSync(jsx,'utf8').replace(/^﻿/,'').replace(/^#target.*$/m,'');
  const EMPATH=/var EM = '([^']+)'/.exec(code)[1];
  const exist=fs.readdirSync(emDir).filter(f=>f.endsWith('.png')).map(f=>EMPATH+f);
  const fonts=[400,500,700].map(w=>'@font-face{font-family:M;font-weight:'+w+';src:url(file://'+path.join(here,'fonts','m'+w+'.ttf')+')}').join('');
  const html='<!doctype html><meta charset="utf-8"><style>'+fonts+'body{margin:0;background:#777}svg{display:block;margin:0 0 20px}</style>'+
    '<body><script>window.EXIST=new Set('+JSON.stringify(exist)+');window.EMLOCAL="file://'+path.resolve(emDir)+'/";</script>'+
    '<script>'+fs.readFileSync(path.join(here,'mock.js'),'utf8')+'</script>'+
    '<script>(async()=>{await Promise.all([400,500,700].map(w=>document.fonts.load(w+" 20px M")));'+
    'try{(0,eval)('+JSON.stringify(code)+');}catch(e){window.__err=String(e.stack||e);}'+
    'try{document.body.innerHTML=__render(__doc).join("");}catch(e){window.__err=(window.__err||"")+" RENDER "+e.stack;}window.__done=1;})();</script>';
  fs.mkdirSync(out,{recursive:true});const hp=path.join(out,'preview.html');fs.writeFileSync(hp,html);
  const b=await chromium.launch({args:['--allow-file-access-from-files']}),p=await b.newPage({viewport:{width:1300,height:1400}});
  p.on('console',m=>console.log('console:',m.text()));p.on('pageerror',e=>console.log('pageerror:',e.message));
  await p.goto('file://'+hp);await p.waitForFunction('window.__done',null,{timeout:60000});
  console.log('ALERT:',await p.evaluate('window.__alert'));const err=await p.evaluate('window.__err');if(err)console.log('ERR:',err);
  console.log('saved:',await p.evaluate('__doc.saved'));
  const n=await p.evaluate('document.querySelectorAll("svg").length');
  for(let i=0;i<n;i++)await p.locator('#ab'+i).screenshot({path:path.join(out,String(i+1).padStart(2,'0')+'.png')});
  await b.close();
})();
