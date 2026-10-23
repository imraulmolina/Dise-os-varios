#target illustrator
// Carrusel "Consultorio Universitario Psicológico Abierto Virtual" — 7 placas de 1080×1350.
// Misma línea híbrida que el carrusel de cuidadores (diagonales continuas, títulos con peso mixto y subrayado rojo, banner con
// emblema, tarjetas con filete, cajas azules, emojis Apple, badge con arco, sombras suaves), con otra estructura en cada placa.
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
// ===== CONFIG: carpeta de salida, nombre del .ai, emojis Apple (slug.png), logo y QR =====
var DIR = 'C:/Users/raulm/Claude/UCP/Carrusel-consultorio-virtual/', OUT = 'Carrusel_Consultorio_Abierto_Virtual.ai';
var EM = 'C:/Users/raulm/.claude/skills/fead-infografias/assets/emojis-apple/', ERR = [], NOTE = [];
var LOGO = 'C:/Users/raulm/Claude/UCP/logo-ucp.png';   // logo UCP a color (png, ai, svg o pdf); si no está, se usa un rótulo de texto
var QR = DIR+'qr.png';                                 // código QR de la postulación; si no está, queda un recuadro para pegarlo
var AW = 1080, AH = 1350, ML = 120, MX = AW/2, SL = 0.126;   // mesa, margen izquierdo, centro y pendiente de las diagonales
function C(h){var c=new RGBColor();c.red=parseInt(h.substr(0,2),16);c.green=parseInt(h.substr(2,2),16);c.blue=parseInt(h.substr(4,2),16);return c;}
var NAVY=C('2153D0'),RED=C('FA2626'),ORG=C('FF8A3D'),BG=C('F7F7F7'),BG2=C('EEEEEE'),WHITE=C('FFFFFF'),GRAY=C('68686A'),DARK=C('3E3F43'),
    SHD=C('1B365D'),TRACK=C('ECEEF3'),SKY=C('C9D7F7'),RULE=C('4A72DA'),DOT=C('B9C1D0');
var TH={navy:{m:NAVY,t:C('E7EDF9')},red:{m:RED,t:C('FDECEE')}},TINT=[TH.navy.t,TH.red.t];
var F={b:app.textFonts.getByName('Gotham-Bold'),s:app.textFonts.getByName('Gotham-Medium'),r:app.textFonts.getByName('Gotham-Book')};
var AX=0,AY=0,TMP,GR,N;
function X(x){return AX+x;} function Y(y){return AY-y;}

// ---------- emojis Apple: los que todavía no están en la skill van incrustados y se escriben en %TEMP%/fead_emojis ----------
var XE={

};
function unb64(s){var k='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',o=[],v=0,b=0,n;
  for(var i=0;i<s.length;i++){n=k.indexOf(s.charAt(i));if(n<0)continue;v=(v<<6)|n;b+=6;if(b>=8){b-=8;o.push(String.fromCharCode((v>>b)&255));v&=(1<<b)-1;}}
  return o.join('');}
function emFile(k){var f=new File(EM+k+'.png');if(f.exists||!XE[k])return f;
  var d=new Folder(Folder.temp+'/fead_emojis');if(!d.exists)d.create();f=new File(d.fullName+'/'+k+'.png');
  if(!f.exists){f.encoding='BINARY';f.open('w');f.write(unb64(XE[k]));f.close();}return f;}
function E(P,k,cx,cy,sz,rot){var f=emFile(k);if(!f.exists){ERR.push('emoji '+k);return;}
  var p=P.placedItems.add();p.file=f;p.width=sz;p.height=sz;p.left=X(cx-sz/2);p.top=Y(cy-sz/2);p.name=k;if(rot)p.rotate(rot);p.embed();}

// ---------- primitivas ----------
function paint(p,f,s,sw){if(f){p.filled=true;p.fillColor=f;}else p.filled=false;if(s){p.stroked=true;p.strokeColor=s;p.strokeWidth=sw||1;}else p.stroked=false;return p;}
function rr(P,x,y,w,h,r,f,s,sw){return paint(P.pathItems.roundedRectangle(Y(y),X(x),w,h,r,r),f,s,sw);}
function ell(P,cx,cy,rx,ry,f,s,sw){return paint(P.pathItems.ellipse(Y(cy-ry),X(cx-rx),rx*2,ry*2),f,s,sw);}
function circ(P,cx,cy,r,f,s,sw){return ell(P,cx,cy,r,r,f,s,sw);}
function bg(P,f){rr(P,0,0,AW,AH,0,f);}
function blur(p,b){try{p.applyEffect('<LiveEffect name="Adobe PSL Gaussian Blur"><Dict data="R blur '+b+'"/></LiveEffect>');}catch(e){ERR.push('blur '+e);}}
function card(P,x,y,w,h,r,f){var s=rr(P,x+6,y+10,w-12,h-6,r,SHD);s.opacity=10;blur(s,18);return rr(P,x,y,w,h,r,f||WHITE);}
function ccard(P,cx,cy,r){var s=circ(P,cx,cy+9,r-3,SHD);s.opacity=11;blur(s,16);return circ(P,cx,cy,r,WHITE);}
function sat(P,cx,cy,r,e){ccard(P,cx,cy,r);E(P,e,cx,cy,r*1.3);}
function scard(P,x,y,w,h,sc,fc,sh){var r=24;   // tarjeta con filete de color a la izquierda
  if(sh){var s=rr(P,x+6,y+10,w-12,h-6,r,SHD);s.opacity=9;blur(s,18);}
  rr(P,x,y,20+2*r,h,r,sc);rr(P,x+20,y,w-20,h,r,fc);rr(P,x+20,y,r,h,0,fc);}
function pts(a){var o=[];for(var i=0;i<a.length;i++)o.push([X(a[i][0]),Y(a[i][1])]);return o;}
function poly(P,a,f){var p=P.pathItems.add();p.setEntirePath(pts(a));p.closed=true;return paint(p,f);}
function line(P,a,s,sw,dash){var p=P.pathItems.add();p.setEntirePath(pts(a));p.filled=false;p.stroked=true;p.strokeColor=s;p.strokeWidth=sw;
  p.strokeCap=StrokeCap.ROUNDENDCAP;p.strokeJoin=StrokeJoin.ROUNDENDJOIN;if(dash)p.strokeDashes=dash;return p;}
function arc(P,cx,cy,r,a0,a1,sw,col){var n=Math.ceil(Math.abs(a1-a0)/90),da=(a1-a0)/n,k=4/3*Math.tan(da*Math.PI/720)*r,p=P.pathItems.add();
  for(var i=0;i<=n;i++){var a=(a0+da*i)*Math.PI/180,x=cx+r*Math.cos(a),y=cy+r*Math.sin(a),tx=-Math.sin(a),ty=Math.cos(a),pp=p.pathPoints.add();
    pp.anchor=[X(x),Y(y)];pp.leftDirection=[X(x-tx*k),Y(y-ty*k)];pp.rightDirection=[X(x+tx*k),Y(y+ty*k)];pp.pointType=PointType.SMOOTH;}
  p.closed=false;p.filled=false;p.stroked=true;p.strokeWidth=sw;p.strokeColor=col;p.strokeCap=StrokeCap.ROUNDENDCAP;return p;}
function GC(){var g=new GradientColor();g.gradient=GR;return g;}
function arrowDot(P,cx,cy,r,f,dir){var s=r*0.42*(dir||1),a=Math.abs(s)*0.8,w=r*0.2;circ(P,cx,cy,r,f||NAVY);
  line(P,[[cx-s,cy],[cx+s,cy]],WHITE,w);line(P,[[cx+s*0.15,cy-a],[cx+s,cy],[cx+s*0.15,cy+a]],WHITE,w);}

// ---------- texto (**así** marca un tramo en negrita y color) ----------
function sty(t,f,sz,c,ld,tr){var a=t.textRange.characterAttributes;a.textFont=f;a.size=sz;a.fillColor=c;if(ld){a.autoLeading=false;a.leading=ld;}a.tracking=tr||0;}
function mw(s,f,sz,tr){TMP.contents=s;sty(TMP,f,sz,DARK,0,tr);return TMP.width;}
function mwm(s,f,hf,sz,tr,b){var a=s.split('**'),w=0;for(var k=0;k<a.length;k++)if(a[k])w+=mw(a[k],(k%2==1)!=b?hf:f,sz,tr);return w;}
function flip(s,b){return (s.split('**').length-1)%2?!b:b;}
function wrap(s,f,sz,w,tr,hf){var o=[],ps=s.split('\n'),b=false;hf=hf||f;   // mide los tramos **resaltados** con su fuente
  for(var i=0;i<ps.length;i++){var ws=ps[i].split(' '),cur='',cb=b;
    for(var j=0;j<ws.length;j++){var t=cur?cur+' '+ws[j]:ws[j];if(cur&&mwm(t,f,hf,sz,tr,cb)>w){o.push(cur);cb=flip(cur,cb);cur=ws[j];}else cur=t;}
    o.push(cur);b=flip(cur,cb);}return o.join('\r');}
function T(P,s,x,y,o){var hl=[],p='',k,j,a=(o.w?wrap(s,o.f,o.size,o.w,o.tr,o.hf||F.b):s).split('**');
  for(k=0;k<a.length;k++){if(k%2)hl.push([p.length,p.length+a[k].length]);p+=a[k];}
  var t=P.textFrames.add();t.contents=p;sty(t,o.f,o.size,o.c,o.lead||Math.round(o.size*1.3),o.tr);
  if(hl.length){var cs=t.textRange.characters,s2=t.contents,sk=cs.length!=s2.length;
    for(k=0;k<hl.length;k++)for(j=hl[k][0];j<hl[k][1];j++){var q=sk?j-(s2.substr(0,j).split('\r').length-1):j,ca=cs[q].characterAttributes;
      ca.textFont=o.hf||F.b;ca.fillColor=o.hc||NAVY;}}
  t.textRange.paragraphAttributes.justification=o.just=='c'?Justification.CENTER:(o.just=='r'?Justification.RIGHT:Justification.LEFT);
  t.top=Y(y);t.left=o.just=='c'?X(x)-t.width/2:(o.just=='r'?X(x)-t.width:X(x));return t;}
function vc(t,cy){t.top=Y(cy-t.height/2);}
function gc(g,cy){var b=g.geometricBounds;g.translate(0,Y(cy-(b[1]-b[3])/2)-b[1]);}   // centra un grupo en vertical

// ---------- componentes ----------
// Título con **negritas** sobre un peso base (o.f). o.e: emoji al final; o.bar: 'w' subraya la última palabra, 'l' barra fija a la izquierda.
function title(P,s,x,y,o){var sz=o.size,ld=Math.round(sz*1.1),f=o.f||F.b,hf=F.b,tr=-12,
  t=T(P,s,x,y,{f:f,hf:hf,hc:o.c,size:sz,c:o.c,just:o.just,w:o.w,lead:ld,tr:tr}),ls=wrap(s,f,sz,o.w,tr,hf).split('\r'),n=ls.length,b=false,k;
  for(k=0;k<n-1;k++)b=flip(ls[k],b);
  var ln=ls[n-1],lw=mwm(ln,f,hf,sz,tr,b),x0=o.just=='c'?x-lw/2:x,by=y+t.height+16;
  if(o.e)E(P,o.e,x0+lw+sz*0.75,y+(n-1)*ld+sz*0.58,sz*1.05);
  if(o.bar=='l')rr(P,x,by+6,150,10,0,RED);
  if(o.bar=='w'){var sp=ln.lastIndexOf(' '),wd=ln.substr(sp+1),wb=flip(ln.substr(0,sp+1),b);if(wd.indexOf('**')==0)wb=!wb;
    wd=wd.replace(/\*\*/g,'');var pu=(/[?!.,:]+$/.exec(wd)||[''])[0],cr=wd.substr(0,wd.length-pu.length),wf=wb?hf:f,
    pw=pu?mw(pu,wf,sz,tr):0,cw=mw(cr,wf,sz,tr);rr(P,x0+lw-pw-cw,by,cw,10,0,RED);}
  return o.bar?by+16:y+t.height;}
// Banner con emblema rojo de arcos + barra redondeada a la derecha.
function banner(P,s,x,y,o){var h=o.h||80,ew=Math.round(h*0.42),px=o.px||40,sz=o.size||38,ex=o.e?sz*1.5:0,
  t=T(P,s,0,0,{f:o.f||F.s,size:sz,c:o.c||WHITE}),w=t.width+2*px+ex;
  rr(P,x+ew,y,w,h,16,o.bg||NAVY);rr(P,x+ew,y,24,h,0,o.bg||NAVY);rr(P,x,y,ew,h,0,RED);
  for(var k=1;k<=3;k++)arc(P,x+ew,y+h,ew*0.3*k,180,270,ew*0.13,WHITE);
  if(o.e)E(P,o.e,x+ew+px+sz*0.55,y+h/2,sz*1.25);
  t.zOrder(ZOrderMethod.BRINGTOFRONT);t.left=X(x+ew+px+ex);vc(t,y+h/2);return {w:ew+w,h:h};}
function badge(P,cx,cy,R,e,es){ccard(P,cx,cy,R);var sw=R>140?12:9,ri=R-(R>140?26:20);
  circ(P,cx,cy,ri,null,TRACK,sw);arc(P,cx,cy,ri,135,372,sw,GC());
  var ka=372*Math.PI/180;circ(P,cx+ri*Math.cos(ka),cy+ri*Math.sin(ka),sw,WHITE,ORG,sw/2);E(P,e,cx,cy,R*(es||0.85));}
function calW(P,cx,y0,w,h,mes,dia){var x0=cx-w/2,band=Math.round(h*0.28);   // calendario: banda roja con el mes y número grande
  card(P,x0,y0,w,h,32);rr(P,x0,y0,w,band,32,RED);rr(P,x0,y0+band-34,w,34,0,RED);
  var m=T(P,mes,cx,0,{f:F.b,size:Math.round(band*0.36),c:WHITE,just:'c',tr:120});vc(m,y0+band/2+2);
  rr(P,x0+w*0.25-8,y0-18,16,42,8,DARK);rr(P,x0+w*0.75-8,y0-18,16,42,8,DARK);
  var n=T(P,dia,cx,0,{f:F.b,size:Math.round(h*0.52),c:NAVY,just:'c',tr:-30});vc(n,y0+band+(h-band)/2+6);}
function logo(P,x,y,h){var f=new File(LOGO),p,w;
  if(f.exists){p=P.placedItems.add();p.file=f;w=p.width*h/p.height;p.width=w;p.height=h;p.left=X(x);p.top=Y(y);p.embed();return w;}
  NOTE.push('Logo: no encontré '+LOGO+' (usé un rótulo de texto provisorio)');
  var a=T(P,'UNIVERSIDAD\rCENTRAL',x,y+6,{f:F.s,size:32,c:NAVY,lead:35,tr:30}),b=T(P,'DEL PARAGUAY',x+2,y+a.height+14,{f:F.r,size:13,c:GRAY,tr:420});
  return Math.max(a.width,b.width);}
function chip(P,x,y){var g=P.groupItems.add(),w=logo(g,x+30,y+20,96)+60,h=136;card(P,x,y,w,h,28);g.zOrder(ZOrderMethod.BRINGTOFRONT);return {w:w,h:h};}
function qr(P,x,y,s){card(P,x,y,s,s,30);var f=new File(QR),p;
  if(f.exists){p=P.placedItems.add();p.file=f;p.width=s-48;p.height=s-48;p.left=X(x+24);p.top=Y(y+24);p.name='QR';p.embed();return;}
  NOTE.push('QR: no encontré '+QR+' (dejé un recuadro para pegarlo)');
  var r=rr(P,x+26,y+26,s-52,s-52,18,null,NAVY,2.5);r.strokeDashes=[10,8];r.name='QR (reemplazar)';
  var t=T(P,'QR',x+s/2,0,{f:F.b,size:70,c:NAVY,just:'c'});vc(t,y+s/2-16);var u=T(P,'Pegá acá el código',x+s/2,0,{f:F.s,size:21,c:GRAY,just:'c'});vc(u,y+s/2+44);}
function bluebox(P,x,y,w,s,e,o){o=o||{};var u=T(P,s,x+150,0,{f:F.s,size:o.size||28,c:WHITE,w:w-190,lead:Math.round((o.size||28)*1.35)}),h=Math.max(u.height+88,150);
  card(P,x,y,w,h,32,NAVY);circ(P,x+76,y+h/2,48,WHITE);E(P,e,x+76,y+h/2,62);u.zOrder(ZOrderMethod.BRINGTOFRONT);vc(u,y+h/2);return h;}

// ---------- placas ----------
function s1(P,d){bg(P,NAVY);poly(P,[[AW,96/SL],[AW,AH],[AW+96-SL*AH,AH]],BG);   // cuña clara que sigue en la placa 2
  var c=chip(P,ML,80),n=T(P,d.ini,ML+c.w+28,0,{f:F.r,size:22,c:SKY,lead:29});vc(n,80+c.h/2);
  badge(P,830,350,140,d.ce);sat(P,830-152,350+96,50,'speech-balloon');sat(P,830+130,350-118,46,'laptop');
  var y=title(P,d.h1,ML,570,{size:70,c:WHITE,w:820,e:d.te,bar:'l'})+40;
  var p=T(P,d.proj,ML,y,{f:F.s,size:38,c:WHITE,w:800,lead:47,hc:WHITE});y+=p.height+22;
  var s=T(P,d.sub,ML,y,{f:F.r,size:30,c:SKY,w:760,lead:40,hc:WHITE});y+=s.height+48;
  banner(P,d.cl,ML,y,{size:36,h:78,bg:WHITE,c:NAVY,f:F.b});}

function s2(P,d){bg(P,BG);poly(P,[[0,0],[96,0],[0,96/SL]],NAVY);var g=P.groupItems.add();   // cuña azul que viene de la portada; contenido centrado
  var y=title(g,d.title,MX,0,{size:64,c:NAVY,f:F.r,just:'c',w:880,bar:'w'})+60,n=d.pillars.length,gap=22,cw=(880-(n-1)*gap)/n,ch=244;
  for(var i=0;i<n;i++){var x=100+i*(cw+gap),pl=d.pillars[i];card(g,x,y,cw,ch,30);circ(g,x+cw/2,y+94,60,TINT[i%2]);E(g,pl[0],x+cw/2,y+94,80);
    T(g,pl[1],x+cw/2,y+174,{f:F.b,size:31,c:NAVY,just:'c'});}
  y+=ch+56;var p=T(g,d.txt,100,y,{f:F.r,size:32,c:GRAY,w:880,lead:46,hc:NAVY});
  bluebox(g,100,y+p.height+60,880,d.cierre,d.ee);gc(g,AH/2+10);}

function s3(P,d){bg(P,NAVY);poly(P,[[0,0],[170,0],[0,AH]],BG);poly(P,[[AW,96/SL],[AW,AH],[AW+96-SL*AH,AH]],WHITE);
  var cx=585;badge(P,cx,250,124,d.ce);sat(P,cx-142,250+96,46,'compass');sat(P,cx+136,250-100,44,'link');
  var y=title(P,d.title,cx,430,{size:58,c:WHITE,f:F.r,just:'c',w:820,bar:'w'});
  var s=T(P,d.sub,cx,y+34,{f:F.s,size:32,c:SKY,just:'c'});y+=34+s.height+44;
  var x=200,w=770,pad=54,t=T(P,d.txt,x+pad,y+pad,{f:F.r,size:31,c:WHITE,w:w-2*pad,lead:44,hc:WHITE}),b=rr(P,x,y,w,t.height+2*pad,32,WHITE);
  b.opacity=12;t.zOrder(ZOrderMethod.BRINGTOFRONT);}

function s4(P,d){bg(P,WHITE);poly(P,[[0,0],[96,0],[0,96/SL]],NAVY);   // cuña azul que viene de la placa 3
  var y=title(P,d.title,ML,140,{size:64,c:NAVY,f:F.r,w:840,e:d.te,bar:'w'});
  var s=T(P,d.sub,ML,y+34,{f:F.s,size:33,c:NAVY});y+=34+s.height+40;
  var x=100,w=880,c=d.main,ar=c.areas,gw=(w-120-18)/2,gh=96,ay=y+40+80+20+40+18,h=ay-y+Math.ceil(ar.length/2)*(gh+18)+26,hy=y+40+40,i;
  scard(P,x,y,w,h,NAVY,WHITE,true);circ(P,x+100,hy,42,TINT[0]);E(P,c.e,x+100,hy,56);
  var t=T(P,c.t,x+162,0,{f:F.r,size:36,c:GRAY,hc:NAVY});vc(t,hy);T(P,c.l,x+60,y+40+80+20,{f:F.s,size:26,c:GRAY});
  for(i=0;i<ar.length;i++){var ax=x+60+(i%2)*(gw+18),yy=ay+Math.floor(i/2)*(gh+18);
    rr(P,ax,yy,gw,gh,22,TINT[(i+Math.floor(i/2))%2]);E(P,ar[i][0],ax+58,yy+gh/2,54);var u=T(P,ar[i][1],ax+104,0,{f:F.b,size:29,c:NAVY});vc(u,yy+gh/2);}
  y+=h+24;var c2=d.second,h2=124;scard(P,x,y,w,h2,RED,WHITE,true);circ(P,x+100,y+h2/2,42,TINT[1]);E(P,c2.e,x+100,y+h2/2,56);
  var t2=T(P,c2.t,x+162,0,{f:F.r,size:32,c:GRAY,hc:NAVY,w:w-200,lead:40});vc(t2,y+h2/2);
  bluebox(P,x,y+h2+40,w,d.foot,d.fe,{size:27});}

function s5(P,d){bg(P,BG2);
  var y=title(P,d.title,MX,130,{size:58,c:NAVY,f:F.r,just:'c',w:920,bar:'w'});
  var s=T(P,d.sub,MX,y+36,{f:F.s,size:33,c:NAVY,just:'c'});y+=36+s.height+50;
  var n=d.items.length,rh=148,cx=180,i;line(P,[[cx,y+rh/2],[cx,y+rh*(n-0.5)]],DOT,3,[0.5,10]);   // recorrido punteado
  for(i=0;i<n;i++){var cy=y+rh*(i+0.5);card(P,cx+86,cy-58,AW-cx-86-80,116,28);ccard(P,cx,cy,52);E(P,d.items[i][0],cx,cy,66);
    circ(P,cx-38,cy-40,18,RED,WHITE,3);var nt=T(P,String(i+1),cx-38,0,{f:F.b,size:18,c:WHITE,just:'c'});vc(nt,cy-40);
    var t=T(P,d.items[i][1],cx+126,0,{f:F.r,size:29,c:GRAY,w:AW-cx-126-120,lead:37,hc:NAVY});vc(t,cy);}}

function s6(P,d){bg(P,BG2);var g=P.groupItems.add();   // contenido centrado en vertical
  var y=title(g,d.title,MX,0,{size:68,c:NAVY,f:F.r,just:'c',w:640,bar:'w'})+60;
  E(g,'stopwatch',176,80,146,14);E(g,'pushpin',908,124,136,-14);   // emojis inclinados a los lados del título
  var x=60,w=960,h=380,i;card(g,x,y,w,h,48,NAVY);calW(g,x+215,y+56,270,h-112,d.mes,d.dia);   // entrada horizontal: calendario + fecha
  var f=g.groupItems.add(),a=T(f,d.pre,x+410,0,{f:F.s,size:33,c:SKY});T(f,d.fecha,x+410,a.height+10,{f:F.b,size:62,c:WHITE,w:520,lead:66});gc(f,y+h/2);
  y+=h+44;
  for(i=0;i<d.notes.length;i++){var u=T(g,d.notes[i][1],x+230,0,{f:F.r,size:30,c:GRAY,w:650,lead:40,hc:NAVY}),hh=Math.max(u.height+70,130);
    scard(g,x+40,y,w-80,hh,i?RED:NAVY,WHITE,true);E(g,d.notes[i][0],x+132,y+hh/2,66);u.zOrder(ZOrderMethod.BRINGTOFRONT);vc(u,y+hh/2);y+=hh+26;}
  gc(g,AH/2);}

function s7(P,d){bg(P,NAVY);poly(P,[[0,0],[170,0],[0,AH]],BG2);   // cuña gris que viene de la placa 6
  var xl=200,y=title(P,d.h1,xl,130,{size:60,c:WHITE,w:800,e:d.te,bar:'l'});
  var b=T(P,d.body,xl,y+44,{f:F.r,size:30,c:WHITE,w:790,lead:42,hc:WHITE});y+=44+b.height+64;
  var qs=330,g=P.groupItems.add();qr(P,xl,y,qs);arrowDot(P,xl+qs+56,y+qs/2,26,RED,-1);   // flecha hacia el QR
  var t=T(g,d.qr,xl+qs+104,0,{f:F.s,size:32,c:WHITE,w:380,lead:42,hc:WHITE});
  banner(g,d.cta,xl+qs+104,t.height+30,{size:30,h:72,bg:WHITE,c:NAVY,f:F.b,px:24,e:'raising-hands'});gc(g,y+qs/2);
  var ly=AH-172;line(P,[[xl,ly],[AW-100,ly]],RULE,1.6);
  var s1t=T(P,d.s1,xl,ly+30,{f:F.b,size:30,c:WHITE});T(P,d.s2,xl,ly+30+s1t.height+6,{f:F.r,size:23,c:SKY});}

// ---------- contenido ----------
var DATA=[
{name:'01 Portada',type:'s1',h1:'Un espacio de\norientación,\nescucha y apoyo',te:'blue-heart',ce:'heart-hands',
 proj:'Consultorio Universitario Psicológico **Abierto Virtual**',sub:'Orientación, consultoría y vinculación con **redes de apoyo_**',
 ini:'Una iniciativa de la\rUniversidad Central.',cl:'Postulaciones abiertas'},
{name:'02 En que consiste',type:'s2',title:'¿En qué **consiste**\neste proyecto?',pillars:[['laptop','Virtual'],['people-hugging','Comunitario'],['teacher','Supervisado']],
 txt:'Es un espacio **virtual, comunitario y supervisado** que busca brindar **orientación y consultoría psicológica inicial** a personas que necesiten acompañamiento, información confiable o conexión con redes de apoyo.',
 cierre:'Una propuesta pensada para acercar ayuda, orientar oportunamente y fortalecer el compromiso social universitario.',ee:'handshake'},
{name:'03 Objetivo',type:'s3',ce:'direct-hit',title:'Formación con\n**sentido humano** y\n**compromiso social**',sub:'Este proyecto tiene como objetivo:',
 txt:'Ofrecer un espacio virtual de **orientación y consultoría psicológica inicial** que facilite el acceso a información pertinente y la vinculación con **redes de apoyo**, articulando la formación práctica de los estudiantes con la **responsabilidad social universitaria**.'},
{name:'04 A quienes esta dirigido',type:'s4',te:'graduation-cap',title:'¿Quiénes pueden\n**formar parte?**',sub:'La convocatoria está dirigida a:',
 main:{e:'brain',t:'Estudiantes de **Psicología**',l:'Vinculados a las áreas:',
  areas:[['school','Educacional'],['magnifying-glass-tilted-left','Forense'],['speech-balloon','Clínica'],['briefcase','Laboral']]},
 second:{e:'balance-scale',t:'**Coordinación** del Consultorio de Derecho'},
 foot:'Una experiencia que permite fortalecer la práctica profesional desde una mirada interdisciplinaria y comprometida con la comunidad.',fe:'busts-in-silhouette'},
{name:'05 Por que sumarte',type:'s5',title:'Una experiencia que aporta\na tu **formación** y a la **comunidad**',sub:'Participar en este proyecto te permitirá:',items:[
 ['puzzle-piece','Vincular **la teoría con la práctica**.'],['ear','Fortalecer habilidades de **orientación y acompañamiento**.'],
 ['magnifying-glass-tilted-right','Integrarte a un **espacio supervisado** de aprendizaje.'],['raising-hands','Contribuir con acciones de **responsabilidad social universitaria**.'],
 ['globe-with-meridians','Formar parte de una **red de apoyo con impacto real**.']]},
{name:'06 Fecha importante',type:'s6',title:'**¡Atención**\na la fecha!',pre:'Cierre de postulaciones',fecha:'26 de octubre',mes:'OCTUBRE',dia:'26',notes:[
 ['writing-hand','Si te interesa formar parte de esta\niniciativa, **prepará tu postulación\ncon tiempo.**'],
 ['warning','**No dejes pasar esta oportunidad** de sumarte a una experiencia formativa con impacto social.']]},
{name:'07 Cierre',type:'s7',te:'blue-heart',h1:'Tu formación también\npuede abrir caminos\nde apoyo',
 body:'Sumate al **Consultorio Universitario Psicológico Abierto Virtual** y sé parte de un proyecto que promueve orientación, acompañamiento y vinculación con redes de apoyo.',
 qr:'Postulate escaneando el **código QR.**',cta:'¡Te esperamos!',s1:'Universidad Central',s2:'Consultorio Universitario Psicológico Abierto Virtual'}
];

// ---------- construcción (mesas pegadas, para ver la continuidad de las diagonales) ----------
var BUILD={s1:s1,s2:s2,s3:s3,s4:s4,s5:s5,s6:s6,s7:s7};
N=DATA.length;
var fo=new Folder(DIR);if(!fo.exists)fo.create();
var doc=app.documents.add(DocumentColorSpace.RGB,AW,AH,N,DocumentArtboardLayout.GridByRow,0,N);
try{var ro=doc.rasterEffectSettings;ro.resolution=150;doc.rasterEffectSettings=ro;}catch(e){ERR.push('res '+e);}
GR=doc.gradients.add();GR.name='FEaD Rojo-Naranja';GR.type=GradientType.LINEAR;GR.gradientStops[0].color=RED;GR.gradientStops[1].color=ORG;
var tmpL=doc.layers[0];tmpL.name='tmp';TMP=tmpL.textFrames.add();TMP.contents='x';
for(var i=0;i<N;i++){var d=DATA[i],ab=doc.artboards[i];ab.name=d.name;var r=ab.artboardRect;AX=r[0];AY=r[1];
  var L=doc.layers.add();L.name=d.name;
  try{BUILD[d.type](L,d);}catch(e){ERR.push(d.name+': '+e+' @'+e.line);}}
TMP.remove();tmpL.remove();
doc.saveAs(new File(DIR+OUT));
app.userInteractionLevel=UserInteractionLevel.DISPLAYALERTS;
var MSG='OK '+N+' placas'+(ERR.length?' | '+ERR.join(' || '):'')+(NOTE.length?'\r'+NOTE.join('\r'):'')+'\rGuardado en '+DIR+OUT;
alert(MSG);MSG;
