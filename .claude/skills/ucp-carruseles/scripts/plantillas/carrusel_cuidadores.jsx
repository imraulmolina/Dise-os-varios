#target illustrator
// Carrusel "Proyecto Comunitario de Apoyo Psicoeducativo a Cuidadores" — 7 placas de 1080×1350.
// Híbrido: línea del carrusel Central Next de referencia (fondos alternados, diagonales que continúan entre placas, títulos con
// peso mixto y subrayado rojo, banner con emblema, tarjetas con filete, checklist con borde, caja translúcida) + skill
// fead-infografias (emojis Apple, badge con arco degradado, satélites, sombras suaves, tintes). Azul institucional #2153D0.
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
// ===== CONFIG: carpeta de salida, nombre del .ai, emojis Apple (slug.png) y logo =====
var DIR = 'C:/Users/raulm/Claude/UCP/Carrusel-cuidadores/', OUT = 'Carrusel_Apoyo_Cuidadores.ai';
var EM = 'C:/Users/raulm/.claude/skills/ucp-carruseles/assets/emojis-apple/', ERR = [], NOTE = [];
var LOGO = DIR+'logo-ucp.png';   // logo UCP a color (png, ai, svg o pdf); si no está, la portada usa un rótulo de texto provisorio
var AW = 1080, AH = 1350, ML = 120, MX = AW/2, SL = 0.126;   // mesa, margen izquierdo, centro y pendiente de las diagonales
function C(h){var c=new RGBColor();c.red=parseInt(h.substr(0,2),16);c.green=parseInt(h.substr(2,2),16);c.blue=parseInt(h.substr(4,2),16);return c;}
var NAVY=C('2153D0'),RED=C('FA2626'),ORG=C('FF8A3D'),BG=C('F7F7F7'),BG2=C('EEEEEE'),WHITE=C('FFFFFF'),GRAY=C('68686A'),DARK=C('3E3F43'),
    SHD=C('1B365D'),TRACK=C('ECEEF3'),SKY=C('C9D7F7'),RULE=C('4A72DA'),LINE2=C('D5D8DE');
var TH={navy:{m:NAVY,t:C('E7EDF9')},red:{m:RED,t:C('FDECEE')}},TINT=[TH.navy.t,TH.red.t];
var F={b:app.textFonts.getByName('Gotham-Bold'),s:app.textFonts.getByName('Gotham-Medium'),r:app.textFonts.getByName('Gotham-Book')};
var AX=0,AY=0,TMP,GR,N;
function X(x){return AX+x;} function Y(y){return AY-y;}

// ---------- emojis Apple: los que todavía no están en la skill van incrustados y se escriben en %TEMP%/fead_emojis ----------
var XE={/*XE*/};
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
function scard(P,x,y,w,h,sc,fc,sh){var r=24;   // tarjeta con filete de color a la izquierda (referencia)
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
// Banner "Convocatoria abierta" de la referencia: emblema rojo con arcos + barra redondeada a la derecha.
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

// ---------- placas ----------
function s1(P,d){bg(P,BG);poly(P,[[1026,0],[AW,0],[AW,AH],[1026-SL*AH,AH]],NAVY);   // banda diagonal que sigue en la placa 2
  var lw=logo(P,ML,92,104);line(P,[[ML+lw+34,96],[ML+lw+34,192]],LINE2,2);
  var m=T(P,d.marca,ML+lw+66,0,{f:F.s,size:23,c:GRAY,lead:29});vc(m,144);
  var y=title(P,d.h1,ML,330,{size:74,c:NAVY,w:800,e:d.te})+50;
  banner(P,d.cl,ML,y,{size:38,h:80});y+=80+58;
  T(P,d.sub,ML,y,{f:F.s,size:40,c:NAVY,w:720,lead:50,hc:NAVY});
  T(P,d.ini,ML,1182,{f:F.r,size:24,c:GRAY,w:560,lead:32});
  badge(P,876,1060,130,d.ce);sat(P,876+112,1060-118,48,'people-hugging');}

function s2(P,d){bg(P,NAVY);poly(P,[[AW,96/SL],[AW,AH],[AW+96-SL*AH,AH]],WHITE);   // cuña blanca que sigue en la placa 3
  var y=title(P,d.title,ML,150,{size:68,c:WHITE,w:840,e:d.te,bar:'l'});
  var p=T(P,d.txt,ML,y+56,{f:F.r,size:34,c:WHITE,w:820,lead:48,hc:WHITE});y+=56+p.height+56;
  for(var i=0;i<d.facts.length;i++){var ft=T(P,d.facts[i][1],0,0,{f:F.r,size:32,c:GRAY,hc:NAVY}),fw=ft.width+190;   // tarjetas de dato (referencia)
    scard(P,ML,y,fw,100,RED,WHITE,false);E(P,d.facts[i][0],ML+86,y+50,58);ft.zOrder(ZOrderMethod.BRINGTOFRONT);ft.left=X(ML+140);vc(ft,y+50);y+=120;}
  var u=T(P,d.cierre,ML+150,0,{f:F.s,size:31,c:WHITE,w:650,lead:41}),h=Math.max(u.height+96,170),by=AH-110-h;
  var bx=rr(P,ML-10,by,850,h,32,WHITE);bx.opacity=12;circ(P,ML+66,by+h/2,50,WHITE);E(P,d.ee,ML+66,by+h/2,64);
  u.zOrder(ZOrderMethod.BRINGTOFRONT);vc(u,by+h/2);}

function s3(P,d){bg(P,WHITE);poly(P,[[0,0],[96,0],[0,96/SL]],NAVY);
  var y=title(P,d.title,MX,150,{size:66,c:NAVY,f:F.r,just:'c',w:900,bar:'w'});
  var s=T(P,d.sub,MX,y+42,{f:F.s,size:34,c:NAVY,just:'c'});y+=42+s.height+54;
  for(var i=0;i<d.items.length;i++){var it=d.items[i],ch=164,x=110,w=860,cy=y+ch/2;scard(P,x,y,w,ch,RED,WHITE,true);
    rr(P,x+54,cy-48,96,96,24,TINT[i%2]);E(P,it[0],x+102,cy,64);
    var g=P.groupItems.add(),a=T(g,it[1],x+186,0,{f:F.r,size:33,c:GRAY,w:w-220,lead:40,hc:NAVY});
    T(g,it[2],x+186,a.height+8,{f:F.r,size:26,c:GRAY,w:w-220,lead:33});gc(g,cy);y+=ch+26;}
  T(P,d.foot,MX,y+44,{f:F.s,size:30,c:NAVY,just:'c',w:900,lead:40,hc:NAVY});}

function s4(P,d){bg(P,WHITE);
  var y=title(P,d.title,MX,130,{size:66,c:NAVY,f:F.r,just:'c',w:900,bar:'w'})+64;
  for(var i=0;i<d.cols.length;i++){var c=d.cols[i],n=c.rows.length,rh=64,x=80,w=920,h=44+80+14+n*rh+36,hy=y+44+40;
    scard(P,x,y,w,h,TH[c.c].m,BG2,false);circ(P,x+98,hy,40,WHITE);E(P,c.e,x+98,hy,54);
    var t=T(P,c.t,x+158,0,{f:F.b,size:40,c:NAVY});vc(t,hy);
    for(var j=0;j<n;j++){var cy=y+44+80+14+rh*(j+0.5);E(P,c.rows[j][0],x+178,cy,42);var u=T(P,c.rows[j][1],x+222,0,{f:F.r,size:31,c:GRAY});vc(u,cy);}
    y+=h+32;}}

function s5(P,d){bg(P,BG);
  var y=title(P,d.title,ML,130,{size:56,c:NAVY,f:F.r,w:860,e:d.te,bar:'w'});
  var s=T(P,d.sub,ML,y+40,{f:F.s,size:33,c:NAVY,w:840,lead:43});y+=40+s.height+50;
  var n=d.items.length,rh=108,pad=38,h=2*pad+n*rh,x=80,w=920,b=card(P,x,y,w,h,40);b.stroked=true;b.strokeColor=NAVY;b.strokeWidth=1.6;
  for(var i=0;i<n;i++){var cy=y+pad+rh*(i+0.5);rr(P,x+62,cy-42,84,84,22,TINT[0]);E(P,d.items[i][0],x+104,cy,58);
    var t=T(P,d.items[i][1],x+186,0,{f:F.r,size:33,c:GRAY});vc(t,cy);}
  T(P,d.foot,ML,y+h+60,{f:F.b,size:32,c:NAVY,w:860,lead:42});}

function s6(P,d){bg(P,BG2);
  var y=title(P,d.title,MX,110,{size:62,c:NAVY,f:F.r,just:'c',w:700,bar:'w'});
  E(P,'hourglass-not-done',178,200,150,14);E(P,'alarm-clock',905,250,150,-12);   // emojis inclinados a los lados, como los calendarios de la referencia
  var top=y+60,x=60,w=960,pad=56,cw=300,chh=330,g=P.groupItems.add();
  var a=T(g,d.pre,MX,0,{f:F.s,size:34,c:WHITE,just:'c'}),yy=a.height+54,cal=yy;yy+=chh+52;
  var c=T(g,d.txt,MX,yy,{f:F.r,size:30,c:WHITE,just:'c',w:860,lead:42,hc:WHITE});yy+=c.height+46;
  var wy=yy,h=yy+112+2*pad;card(P,x,top,w,h,56,NAVY);g.translate(0,-(top+pad));g.zOrder(ZOrderMethod.BRINGTOFRONT);
  calW(P,MX,top+pad+cal,cw,chh,d.mes,d.dia);
  var ay=top+pad+wy,ax=130;scard(P,ax,ay,820,112,RED,WHITE,false);E(P,'warning',ax+104,ay+56,72);
  var t=T(P,d.cta,ax+176,0,{f:F.r,size:35,c:NAVY,hc:NAVY});vc(t,ay+56);}

function s7(P,d){bg(P,NAVY);poly(P,[[0,0],[170,0],[0,AH]],BG2);   // cuña gris que viene de la placa 6
  var xl=200;badge(P,810,290,150,d.ce);sat(P,810+140,290-120,52,'graduation-cap');sat(P,810-148,290+118,46,'heart-hands');
  var y=title(P,d.h1,xl,500,{size:62,c:WHITE,w:780,bar:'l'});
  var b=T(P,d.body,xl,y+50,{f:F.r,size:32,c:WHITE,w:800,lead:44,hc:WHITE});y+=50+b.height+50;
  banner(P,d.cta,xl,y,{size:30,h:78,bg:WHITE,c:NAVY,f:F.b,px:30,e:'writing-hand'});
  var ly=1165;line(P,[[xl,ly],[AW-100,ly]],RULE,1.6);
  var s1t=T(P,d.s1,xl,ly+30,{f:F.b,size:28,c:WHITE});T(P,d.s2,xl,ly+30+s1t.height+6,{f:F.r,size:24,c:SKY});}

// ---------- contenido ----------
var DATA=[
{name:'01 Portada',type:'s1',marca:'Consultorio Psicológico\rUniversitario',h1:'Cuidar a otros\ntambién merece\nacompañamiento',te:'blue-heart',
 cl:'¡Convocatoria abierta!',sub:'Proyecto Comunitario de **Apoyo Psicoeducativo a Cuidadores_**',
 ini:'Una iniciativa del Consultorio Psicológico Universitario de la Universidad Central.',ce:'heart-hands'},
{name:'02 De que se trata',type:'s2',te:'handshake',title:'Un espacio\npara acompañar\na quienes cuidan',
 txt:'El proyecto busca brindar **acompañamiento psicoeducativo**, a través de un **espacio virtual**, a personas que tienen a su cargo el cuidado de familiares o de quienes necesitan asistencia.',
 cierre:'Una propuesta que pone en el centro el bienestar de quienes dedican parte de su vida a cuidar de otros.',ee:'blue-heart',facts:[['brain','Acompañamiento **psicoeducativo**'],['laptop','A través de un **espacio virtual**']]},
{name:'03 A quienes esta dirigido',type:'s3',title:'¿Quiénes pueden\n**sumarse** al proyecto?',sub:'La convocatoria está dirigida a:',items:[
 ['brain','Estudiantes de **Psicología**','De los últimos años de la carrera.'],
 ['teacher','Estudiantes de **Educación**','De los últimos años de la carrera.'],
 ['briefcase','Estudiantes **en prácticas**','En cualquiera de estas carreras.']],
 foot:'Una oportunidad para vincular tu formación académica con una iniciativa de **apoyo a la comunidad.**'},
{name:'04 Asignaturas vinculadas',type:'s4',title:'¿Qué **materias** forman\nparte del proyecto?',cols:[
 {t:'Psicología',e:'brain',c:'navy',rows:[['clipboard','Evaluación Psicológica'],['school','Práctica 1 Educacional'],['speech-balloon','Práctica 2 Clínica'],['magnifying-glass-tilted-left','Psicodiagnóstico']]},
 {t:'Educación',e:'teacher',c:'red',rows:[['open-book','Psicología General'],['student','Psicología de la Educación'],['people-hugging','Educación Inclusiva']]}]},
{name:'05 A quienes buscamos acompanar',type:'s5',te:'blue-heart',title:'Detrás de cada persona que necesita cuidados, **hay alguien que también necesita apoyo**',
 sub:'Este espacio está pensado para quienes cuidan a personas que requieren asistencia por:',items:[
 ['face-with-thermometer','Enfermedad.'],['wheelchair-symbol','Discapacidad.'],['crutch','Dependencia funcional.'],['older-person','Envejecimiento.']],
 foot:'Porque quienes cuidan también necesitan sentirse acompañados.'},
{name:'06 Fechas importantes',type:'s6',title:'**¡Todavía estás**\n**a tiempo** de\nsumarte!',pre:'Inscripciones abiertas hasta el',mes:'OCTUBRE',dia:'26',
 txt:'Si estudiás **Psicología** o **Educación**\ny cumplís con el perfil de la convocatoria,\nesta es tu oportunidad de participar.',cta:'**¡No dejes pasar** la fecha!'},
{name:'07 Cierre',type:'s7',ce:'blue-heart',h1:'Tu formación también puede marcar una diferencia',
 body:'Sumate al **Proyecto Comunitario de Apoyo\nPsicoeducativo a Cuidadores** y formá\nparte de una iniciativa que busca\nacompañar a quienes cuidan.',
 cta:'¡Inscribite y sé parte del proyecto!',s1:'Universidad Central del Paraguay',s2:'Consultorio Psicológico Universitario'}
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
