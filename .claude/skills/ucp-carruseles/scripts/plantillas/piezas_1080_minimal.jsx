#target illustrator
// Piezas institucionales FEaD — versión MINIMALISTA: 8 piezas de 1080×1080, sin fotos.
// Fondo blanco, filetes finos, números grandes, emojis Apple chicos sin fondo, títulos con peso mixto en azul #2153D0,
// barra roja #FA2626 como único acento y una diagonal azul fina arriba a la derecha.
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
// ===== CONFIG: carpeta de salida, nombre del .ai y emojis Apple (slug.png) =====
var DIR = 'C:/Users/raulm/Claude/UCP/Piezas-FEaD/', OUT = 'Piezas_FEaD_1080x1080_minimal.ai';
var EM = 'C:/Users/raulm/.claude/skills/ucp-carruseles/assets/emojis-apple/', ERR = [], NOTE = [];
var AW = 1080, AH = 1080, M = 60, MX = AW/2, SL = 0.126;   // mesa, margen, centro y pendiente de las diagonales
function C(h){var c=new RGBColor();c.red=parseInt(h.substr(0,2),16);c.green=parseInt(h.substr(2,2),16);c.blue=parseInt(h.substr(4,2),16);return c;}
var NAVY=C('2153D0'),RED=C('FA2626'),ORG=C('FF8A3D'),BG=C('F7F7F7'),WHITE=C('FFFFFF'),GRAY=C('68686A'),DARK=C('3E3F43'),
    SHD=C('1B365D'),TRACK=C('ECEEF3'),SKY=C('C9D7F7'),RULE=C('4A72DA'),DOT=C('B9C1D0'),LINE=C('E8EBF1'),
    TN=C('E7EDF9'),TR=C('FDECEE'),PAGE=C('F4EEE2'),ROAD=C('DCE4F6');
var TINT=[TN,TR];
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
// Título con **resaltado** (o.hc) sobre un peso base (o.f). o.e: emoji al final de la última línea; o.bar: barra roja debajo.
function title(P,s,x,y,o){var sz=o.size,ld=Math.round(sz*1.08),f=o.f||F.b,hf=F.b,tr=-12,
  t=T(P,s,x,y,{f:f,hf:hf,hc:o.hc||o.c,size:sz,c:o.c,w:o.w,lead:ld,tr:tr}),ls=wrap(s,f,sz,o.w,tr,hf).split('\r'),n=ls.length,b=false,k;
  for(k=0;k<n-1;k++)b=flip(ls[k],b);
  var lw=mwm(ls[n-1],f,hf,sz,tr,b),by=y+t.height+14;
  if(o.e)E(P,o.e,x+lw+sz*0.74,y+(n-1)*ld+sz*0.56,sz*1.08,o.er||0);
  if(o.bar){rr(P,x,by,110,8,0,RED);return by+8;}
  return y+t.height;}
function topbar(P){poly(P,[[0,0],[452,0],[440,14],[0,14]],RED);poly(P,[[460,0],[AW,0],[AW,14],[448,14]],NAVY);}
function band(P,h){rr(P,0,0,AW,h,0,NAVY);   // cabecera azul con filete rojo y cuña diagonal a la derecha
  poly(P,[[AW-152,0],[AW-132,0],[AW-132-SL*h,h],[AW-152-SL*h,h]],RED);poly(P,[[AW-112,0],[AW,0],[AW,h],[AW-112-SL*h,h]],RULE);}
function hband(P,h){var k=SL*(h-14);   // banda diagonal clara + filete rojo detrás del badge
  poly(P,[[AW-196,14],[AW-92,14],[AW-92-k,h],[AW-196-k,h]],TN);poly(P,[[AW-74,14],[AW-62,14],[AW-62-k,h],[AW-74-k,h]],RED);}
function hdr(P,y,dk){rr(P,M,y,82,34,17,dk?WHITE:NAVY);var t=T(P,'FEaD',M+41,0,{f:F.b,size:17,c:dk?NAVY:WHITE,just:'c'});vc(t,y+17);
  var u=T(P,'Facultad de Educación a Distancia',M+98,0,{f:F.s,size:16,c:dk?SKY:GRAY});vc(u,y+17);}
function tag(P,s,x,y,c){var t=T(P,s,x,y,{f:F.s,size:14,c:c||NAVY,just:'r',tr:120,lead:19});rr(P,x-56,y+t.height+10,56,6,0,RED);return t;}
function num(P,cx,cy,r,s,f,sz){circ(P,cx,cy,r,f,WHITE,r>20?3:2.5);var t=T(P,s,cx,0,{f:F.b,size:sz,c:WHITE,just:'c'});vc(t,cy);}
function nl(s,f,sz,w){return wrap(s,f,sz,w,0,F.b).split('\r').length;}
function bh(a,w,sz,ld,gp){var h=0;for(var i=0;i<a.length;i++)h+=nl(a[i],F.r,sz,w-16)*ld+(i?gp:0);return h;}
function bul(P,a,x,y,w,o){var sz=o.size,ld=o.lead,gp=o.gap||0,yy=y;   // lista con puntos de color
  for(var i=0;i<a.length;i++){circ(P,x+3.5,yy+sz*0.62,3,o.dc||RED);T(P,a[i],x+16,yy,{f:F.r,size:sz,c:o.c||GRAY,w:w-16,lead:ld,hc:NAVY});
    yy+=nl(a[i],F.r,sz,w-16)*ld+gp;}return yy-y;}
function books(P,x,y,ls,cs){var ws=[238,220,250],dx=[0,16,6],h=34,i;   // pila de libros vectoriales con rótulo en el lomo
  for(i=0;i<ls.length;i++){var xx=x+dx[i],yy=y+i*(h+4),w=ws[i],s=rr(P,xx+4,yy+6,w-8,h-2,7,SHD);s.opacity=18;blur(s,8);
    rr(P,xx,yy,w,h,7,cs[i]);rr(P,xx+w-18,yy+5,13,h-10,3,PAGE);var l=line(P,[[xx+18,yy+5],[xx+18,yy+h-5]],WHITE,1.4);l.opacity=45;
    var t=T(P,ls[i],xx+32,0,{f:F.b,size:14,c:WHITE,tr:160});vc(t,yy+h/2);}}
function fbooks(P,fy,ls){var fh=AH-fy,cx=366;rr(P,0,fy,AW,fh,0,NAVY);poly(P,[[0,fy],[cx,fy],[cx-SL*fh,AH],[0,AH]],TN);
  poly(P,[[cx,fy],[cx+18,fy],[cx+18-SL*fh,AH],[cx-SL*fh,AH]],RED);books(P,M-8,fy+(fh-110)/2,ls,[NAVY,SHD,RED]);return cx+40;}
function hcard(P,x,y,w,h,col,s,e,sz){card(P,x,y,w,h,24);rr(P,x,y,w,52,24,col);rr(P,x,y+26,w,26,0,col);var tx=x+24;   // tarjeta con cabecera de color
  if(e){circ(P,x+40,y+26,17,WHITE);E(P,e,x+40,y+26,24);tx=x+68;}var t=T(P,s,tx,0,{f:F.b,size:sz||16,c:WHITE,tr:30});vc(t,y+26);return y+52;}
function donut(P,cx,cy,r,p,col,lb){circ(P,cx,cy,r,null,TRACK,15);arc(P,cx,cy,r,-90,-90+360*p,15,col);
  var t=T(P,lb,cx,0,{f:F.b,size:27,c:NAVY,just:'c',tr:-20});vc(t,cy);}
function wbanner(P,s,x,y,w,h,o){var ew=Math.round(h*0.42),sh=rr(P,x+8,y+10,w-16,h-6,18,SHD);sh.opacity=12;blur(sh,16);   // banner ancho con emblema
  rr(P,x+ew,y,w-ew,h,18,NAVY);rr(P,x+ew,y,24,h,0,NAVY);rr(P,x,y,ew,h,0,RED);
  for(var k=1;k<=3;k++)arc(P,x+ew,y+h,ew*0.3*k,180,270,ew*0.13,WHITE);
  var sz=o.size||24,t=T(P,s,x+ew+(w-ew)/2,0,{f:F.s,size:sz,c:WHITE,hc:WHITE,just:'c',w:w-ew-80,lead:Math.round(sz*1.3)});vc(t,y+h/2);}
function banner(P,s,x,y,o){var h=o.h||80,ew=Math.round(h*0.42),px=o.px||40,sz=o.size||38,ex=o.e?sz*1.5:0,
  t=T(P,s,0,0,{f:o.f||F.s,size:sz,c:o.c||WHITE}),w=t.width+2*px+ex;
  rr(P,x+ew,y,w,h,16,o.bg||NAVY);rr(P,x+ew,y,24,h,0,o.bg||NAVY);rr(P,x,y,ew,h,0,RED);
  for(var k=1;k<=3;k++)arc(P,x+ew,y+h,ew*0.3*k,180,270,ew*0.13,WHITE);
  if(o.e)E(P,o.e,x+ew+px+sz*0.55,y+h/2,sz*1.25);
  t.zOrder(ZOrderMethod.BRINGTOFRONT);t.left=X(x+ew+px+ex);vc(t,y+h/2);return {w:ew+w,h:h};}
function bannerW(s,o){var h=o.h||80;return Math.round(h*0.42)+mw(s,o.f||F.s,o.size||38,0)+2*(o.px||40)+(o.e?(o.size||38)*1.5:0);}
function badge(P,cx,cy,R,e,es){ccard(P,cx,cy,R);var sw=R>140?12:9,ri=R-(R>140?26:20);
  circ(P,cx,cy,ri,null,TRACK,sw);arc(P,cx,cy,ri,135,372,sw,GC());
  var ka=372*Math.PI/180;circ(P,cx+ri*Math.cos(ka),cy+ri*Math.sin(ka),sw,WHITE,ORG,sw/2);E(P,e,cx,cy,R*(es||0.85));}

// ---------- componentes (versión minimalista: fondo blanco, filetes finos, sin tarjetas ni sombras) ----------
var LN=C('E3E6ED');
function corner(P){poly(P,[[AW-44,0],[AW,0],[AW,44/SL]],NAVY);}   // diagonal fina, la firma de la línea
function mh(P){T(P,'**FEaD**   Facultad de Educación a Distancia',M,56,{f:F.r,size:15,c:GRAY,hc:NAVY,tr:20});}
function mtag(P,s,y){return T(P,s.replace(/\r/g,' '),AW-M-30,y,{f:F.s,size:12.5,c:GRAY,just:'r',tr:140});}
function mt(P,s,y,o){var sz=o.size||54,ld=Math.round(sz*1.08),tr=-14,w=o.w||860,t=T(P,s,M,y,{f:F.r,hf:F.b,c:NAVY,hc:NAVY,size:sz,w:w,lead:ld,tr:tr});
  if(o.e){var ls=wrap(s,F.r,sz,w,tr,F.b).split('\r'),n=ls.length,b=false,k;for(k=0;k<n-1;k++)b=flip(ls[k],b);
    E(P,o.e,M+mwm(ls[n-1],F.r,F.b,sz,tr,b)+sz*0.68,y+(n-1)*ld+sz*0.56,sz*0.92);}
  var by=y+t.height+18;rr(P,M,by,56,6,0,RED);return by+6;}
function hl(P,x1,y,x2){return line(P,[[x1,y],[x2,y]],LN,1.2);}
function vl(P,x,y1,y2){return line(P,[[x,y1],[x,y2]],LN,1.2);}
function lab(P,s,x,y,c){return T(P,s,x,y,{f:F.b,size:13.5,c:c||NAVY,tr:120});}
function lh(a,w,sz,ld,gp){var h=0;for(var i=0;i<a.length;i++)h+=nl(a[i],F.r,sz,w)*ld+(i?gp:0);return h;}
function lines(P,a,x,y,w,sz,ld,gp){var yy=y;for(var i=0;i<a.length;i++){T(P,a[i],x,yy,{f:F.r,size:sz,c:GRAY,w:w,lead:ld,hc:NAVY});
  yy+=nl(a[i],F.r,sz,w)*ld+gp;}return yy-y-gp;}

// ---------- piezas ----------
// 01 Árbol reglamentario: tres columnas numeradas separadas por filetes; pie con enlace.
function m1(P,d){bg(P,WHITE);corner(P);mh(P);mtag(P,d.tag,58);
  var y=mt(P,d.title,118,{size:52,w:900,e:d.te}),s=T(P,d.sub,M,y+26,{f:F.r,size:19,c:GRAY,w:700,lead:27,hc:NAVY});
  var y0=y+26+s.height+54,gp=48,cw=(AW-2*M-2*gp)/3,tw=cw-36,hh=0,H=0,i,j,h,r,g;
  for(i=0;i<3;i++){hh=Math.max(hh,60+nl(d.rows[i].t,F.b,14,cw)*18+6+18+30);}
  for(i=0;i<3;i++){h=hh;for(j=0;j<3;j++){g=d.rows[i].g[j];h+=nl(g[1],F.b,17,tw)*21+8+lh(g[2],tw,15,20,6)+(j<2?30:0);}H=Math.max(H,h);}
  for(i=0;i<3;i++){r=d.rows[i];var x=M+i*(cw+gp),yy=y0;if(i)vl(P,x-gp/2,y0,y0+H);
    T(P,'0'+(i+1),x,yy-6,{f:F.r,size:44,c:i%2?RED:NAVY,tr:-20});
    var a=T(P,r.t,x,yy+56,{f:F.b,size:14,c:NAVY,w:cw,lead:18,tr:80});T(P,r.s,x,yy+56+a.height+6,{f:F.r,size:14,c:GRAY});yy+=hh;
    for(j=0;j<3;j++){g=r.g[j];E(P,g[0],x+13,yy+11,26);T(P,g[1],x+36,yy,{f:F.b,size:17,c:NAVY,w:tw,lead:21});
      yy+=nl(g[1],F.b,17,tw)*21+8;yy+=lines(P,g[2],x+36,yy,tw,15,20,6)+30;}}
  var fy=AH-160;hl(P,M,fy,AW-M);
  var q=T(P,d.cq,M,fy+32,{f:F.r,size:19,c:NAVY,hc:NAVY,w:580,lead:25});T(P,d.cd,M,fy+32+q.height+8,{f:F.r,size:15,c:GRAY,w:580,lead:21,hc:NAVY});
  arrowDot(P,AW-M-20,fy+66,20,RED);var lt=T(P,d.btn,AW-M-54,0,{f:F.b,size:18,c:NAVY,just:'r'});vc(lt,fy+66);}

// 02 Derechos y deberes: dos columnas con filetes entre filas y una línea vertical al centro.
function m2(P,d){bg(P,WHITE);corner(P);mh(P);mtag(P,d.tag,58);
  var y=mt(P,d.title,118,{size:48,w:800,e:d.te}),s=T(P,d.sub,M,y+24,{f:F.r,size:17,c:GRAY,w:AW-2*M,lead:25,hc:NAVY});
  var y0=y+24+s.height+40,gp=56,w=(AW-2*M-gp)/2,tw=w-40,rh=[],H=0,i,c,m,it;
  for(i=0;i<6;i++){m=0;for(c=0;c<2;c++){it=d.cols[c].items[i];m=Math.max(m,nl(it[1],F.b,15.5,tw)*19+4+nl(it[2],F.r,13.5,tw)*17.5);}rh.push(m+26);H+=m+26;}
  vl(P,MX,y0,y0+50+H);
  for(c=0;c<2;c++){var co=d.cols[c],x=M+c*(w+gp),yy=y0+50;T(P,co.t,x,y0,{f:F.b,size:21,c:NAVY});rr(P,x,y0+34,36,4,0,c?RED:NAVY);
    for(i=0;i<6;i++){it=co.items[i];hl(P,x,yy,x+w);E(P,it[0],x+12,yy+23,24);
      T(P,it[1],x+40,yy+13,{f:F.b,size:15.5,c:NAVY,w:tw,lead:19});T(P,it[2],x+40,yy+13+nl(it[1],F.b,15.5,tw)*19+4,{f:F.r,size:13.5,c:GRAY,w:tw,lead:17.5});yy+=rh[i];}}
  var fy=y0+50+H+24;hl(P,M,fy,AW-M);var f=T(P,d.foot,M,fy+26,{f:F.r,size:19,c:NAVY,hc:NAVY,w:AW-2*M,lead:25});
  var v=[];for(i=0;i<d.chips.length;i++)v.push(d.chips[i][1].toUpperCase());T(P,v.join('   ·   '),M,fy+26+f.height+12,{f:F.s,size:12,c:GRAY,tr:120});}

// 03 Dirección académica: grilla 2×2 separada por filetes en cruz.
function m3(P,d){bg(P,WHITE);corner(P);mh(P);
  var y=mt(P,d.title,118,{size:54,w:860,e:d.ce}),s=T(P,d.sub,M,y+22,{f:F.r,size:18,c:GRAY,w:AW-2*M,lead:26,hc:NAVY});
  var gy=y+22+s.height+42,gp=56,w=(AW-2*M-gp)/2,uw=w-34,ar=d.areas;
  function aH(a){var h=60,k;for(k=0;k<a.u.length;k++)h+=nl(a.u[k][1],F.b,15,uw)*19+5+lh(a.u[k][2],uw,13.5,17.5,0)+(k?16:0);return h;}
  var h1=Math.max(aH(ar[0]),aH(ar[1])),h2=Math.max(aH(ar[2]),aH(ar[3])),y2=gy+h1+32;
  vl(P,MX,gy,y2+h2);hl(P,M,gy+h1+16,AW-M);
  function area(x,y,a,n){T(P,'0'+n,x,y-6,{f:F.r,size:36,c:n%2?NAVY:RED,tr:-20});
    var g=P.groupItems.add(),a1=T(g,a.t,x+62,0,{f:F.b,size:13.5,c:NAVY,tr:100});T(g,a.s,x+62,a1.height+4,{f:F.r,size:13.5,c:GRAY,w:w-62});gc(g,y+15);
    var yy=y+60,k;for(k=0;k<a.u.length;k++){var u=a.u[k],nh=nl(u[1],F.b,15,uw)*19;E(P,u[0],x+11,yy+10,22);
      T(P,u[1],x+34,yy,{f:F.b,size:15,c:NAVY,w:uw,lead:19});yy+=nh+5;yy+=lines(P,u[2],x+34,yy,uw,13.5,17.5,0)+16;}}
  area(M,gy,ar[0],1);area(M+w+gp,gy,ar[1],2);area(M,y2,ar[2],3);area(M+w+gp,y2,ar[3],4);}

// 04 Ruta del estudiante FEaD: riel vertical con puntos; etapa a la izquierda y lista a dos columnas a la derecha.
function m4(P,d){bg(P,WHITE);corner(P);mh(P);
  var y=mt(P,d.title,118,{size:56,w:860,e:d.ce}),s=T(P,d.sub,M,y+24,{f:F.s,size:19,c:NAVY,w:860,lead:25});
  var p=T(P,d.p,M,y+24+s.height+10,{f:F.r,size:15.5,c:GRAY,w:820,lead:22,hc:NAVY}),y0=y+24+s.height+10+p.height+40;
  var lx=M+40,bx=M+356,bw=282,rh=[],i,k,yy=y0;
  for(i=0;i<5;i++){var st=d.st[i],lft=24+4+nl(st.s,F.r,15,236)*19,rgt=0,c2=Math.ceil(st.b.length/2);
    for(k=0;k<2;k++)rgt=Math.max(rgt,lh(st.b.slice(k*c2,(k+1)*c2),bw-14,14.5,19,4));rh.push(Math.max(lft,rgt)+34);}
  var ye=y0;for(i=0;i<4;i++)ye+=rh[i];line(P,[[M+8,y0+28],[M+8,ye+28]],LN,2);
  for(i=0;i<5;i++){st=d.st[i];var col=i%2?RED:NAVY;if(i)hl(P,lx,yy,AW-M);circ(P,M+8,yy+28,6,col,WHITE,2);
    E(P,st.e,lx+14,yy+28,28);T(P,st.t,lx+38,yy+16,{f:F.b,size:18,c:NAVY,tr:60});T(P,st.s,lx,yy+46,{f:F.r,size:15,c:GRAY,w:236,lead:19});
    c2=Math.ceil(st.b.length/2);var q;
    for(q=0;q<2;q++){var by=yy+19;for(k=q*c2;k<Math.min(st.b.length,(q+1)*c2);k++){var b=st.b[k];circ(P,bx+q*bw+3,by+9,2.6,col);
        T(P,b,bx+q*bw+14,by,{f:F.r,size:14.5,c:GRAY,w:bw-14,lead:19});by+=nl(b,F.r,14.5,bw-14)*19+4;}}
    yy+=rh[i];}
  var cy=yy+18,cwk=(AW-2*M)/4;for(i=0;i<4;i++){var ch=d.chips[i];E(P,ch[0],M+11+i*cwk,cy+11,22);T(P,ch[1],M+30+i*cwk,cy+1,{f:F.s,size:14.5,c:NAVY});}
  var fy=cy+58;hl(P,M,fy,AW-M);var qt=T(P,d.q,M,fy+28,{f:F.b,size:22,c:NAVY,w:AW-2*M,lead:28});T(P,d.qp,M,fy+28+qt.height+10,{f:F.r,size:15,c:GRAY,w:AW-2*M,lead:21});}

// 05/06/08 Ruta por carrera: cinco filas con número grande, etapa y emoji; filetes entre filas.
function mc(P,d){bg(P,WHITE);corner(P);mh(P);E(P,d.ce,AW-M-46,168,86);
  var t=T(P,'Ruta del **estudiante**',M,118,{f:F.r,hf:F.b,c:NAVY,hc:NAVY,size:56,w:800,lead:60,tr:-14});
  var c=T(P,d.car,M,118+t.height+8,{f:F.r,size:22,c:NAVY,hc:NAVY,w:820,lead:28}),y=118+t.height+8+c.height+18;rr(P,M,y,56,6,0,RED);y+=6;
  var s=T(P,d.sub,M,y+24,{f:F.r,size:18,c:GRAY,w:AW-2*M,lead:26,hc:NAVY}),y0=y+24+s.height+36,rh=106,i;
  for(i=0;i<5;i++){var st=d.st[i],yy=y0+i*rh,my=yy+rh/2;hl(P,M,yy,AW-M);
    var n=T(P,'0'+(i+1),M,0,{f:F.r,size:42,c:i%2?RED:NAVY,tr:-20});vc(n,my);
    var g=P.groupItems.add(),a=T(g,st[1].toUpperCase(),M+96,0,{f:F.b,size:14,c:NAVY,tr:120});T(g,st[2],M+96,a.height+8,{f:F.r,size:17.5,c:GRAY,w:690,lead:23,hc:NAVY});gc(g,my);
    E(P,st[0],AW-M-26,my,46);}
  hl(P,M,y0+5*rh,AW-M);T(P,d.foot,M,y0+5*rh+40,{f:F.r,size:22,c:NAVY,hc:NAVY,w:AW-2*M,lead:28});}

// 07 Sistema de evaluación: barra segmentada 40/20/40, tabla con filetes, requisitos y etapas en línea.
function m7(P,d){bg(P,WHITE);corner(P);mh(P);mtag(P,d.tag,58);
  var y=mt(P,d.title,118,{size:50,w:900,e:'direct-hit'}),yA=y+58,k,q,i,j;
  lab(P,d.a.t,M,yA);var ts=T(P,d.a.s,AW-M,yA-2,{f:F.r,size:15,c:GRAY,just:'r',hc:NAVY});
  var by=yA+42,tw=AW-2*M-16,sx=M,cs=[NAVY,RED,SKY];
  for(k=0;k<3;k++){q=d.a.d[k];var sw=tw*q[0];rr(P,sx,by,sw,14,7,cs[k]);T(P,q[1],sx,by+30,{f:F.b,size:42,c:k==1?RED:NAVY,tr:-20});
    var lb=T(P,q[2].replace('\n',' '),sx,by+88,{f:F.b,size:14.5,c:NAVY,w:sw-12,lead:18});if(q[3])T(P,q[3],sx,by+88+lb.height+4,{f:F.r,size:13.5,c:GRAY,w:sw-12});sx+=sw+8;}
  var yB=by+186,cz=[220,190,150],tx=M,xr=M+624,wr=AW-M-xr;hl(P,M,yB-24,AW-M);vl(P,M+592,yB,yB+244);
  lab(P,d.tb.t,M,yB);var ry=yB+40;
  for(i=0;i<6;i++){var row=i?d.tb.r[i-1]:d.tb.h,cx=tx;if(i)hl(P,M,ry,M+560);
    for(j=0;j<3;j++){var bad=row[j]=='Reprobado',t=T(P,i?row[j]:row[j].toUpperCase(),cx,0,
      {f:i==0?F.s:((j==0||bad)?F.b:F.r),size:i?15:11.5,c:i==0?GRAY:(bad?RED:(j?GRAY:NAVY)),tr:i?0:100});vc(t,ry+(i?18:9));cx+=cz[j];}
    ry+=i?36:24;}
  lab(P,d.r.t,xr,yB);T(P,d.r.s,xr,yB+24,{f:F.r,size:14,c:RED});var iy=yB+64;
  for(k=0;k<2;k++){q=d.r.it[k];if(k)hl(P,xr,iy-14,AW-M);E(P,q[0],xr+13,iy+11,26);var u=T(P,q[1],xr+40,iy,{f:F.r,size:15,c:GRAY,hc:NAVY,w:wr-40,lead:21});iy+=u.height+30;}
  var yC=yB+282;hl(P,M,yC-24,AW-M);lab(P,d.et.t,M,yC);var sw2=(AW-2*M)/4,cy=yC+58;line(P,[[M+15,cy],[M+3*sw2+15,cy]],LN,2);
  for(k=0;k<4;k++){var kx=M+k*sw2;num(P,kx+15,cy,15,String(k+1),k<2?NAVY:RED,14);T(P,d.et.s[k],kx,cy+30,{f:F.s,size:14,c:NAVY,w:sw2-30,lead:18});}
  var fy=cy+122;hl(P,M,fy,AW-M);T(P,d.foot,M,fy+28,{f:F.r,size:19,c:NAVY,hc:NAVY,w:AW-2*M,lead:25});}

// ---------- contenido ----------
var DATA=[
{name:'01 Árbol reglamentario',type:'p1',title:'Árbol reglamentario **FEaD**',te:'deciduous-tree',
 sub:'Conocé las **normativas institucionales y académicas** que acompañan tu trayectoria universitaria.',
 tag:'CONOCER LAS NORMAS\rEXPANDE TUS\rOPORTUNIDADES',
 rows:[{t:'NORMATIVAS INSTITUCIONALES',s:'Marco general',g:[
   ['classical-building','Reglamentos Generales',['Reglamento de Admisión','Reglamento General Académico Administrativo']],
   ['balance-scale','Convivencia y Ética',['Reglamento de Faltas','Reglamento del Comité de Ética en la Investigación']],
   ['heart-hands','Bienestar y Accesibilidad',['Reglamento de Bienestar Estudiantil','Reglamento de Accesibilidad y Ajustes Razonables']]]},
  {t:'NORMATIVAS ACADÉMICAS',s:'Desarrollo del aprendizaje',g:[
   ['graduation-cap','Aprendizaje y Evaluación',['Reglamento Específico de Evaluación de Grado']],
   ['laptop','Entorno Virtual',['Reglamento Específico del Campus Virtual']],
   ['clipboard','Procesos Académicos',['Reglamento de Trabajo Final de Grado','Reglamento de Convalidaciones']]]},
  {t:'DESARROLLO ACADÉMICO Y PROFESIONAL',s:'Experiencias formativas',g:[
   ['briefcase','Pasantías y Vinculación',['Reglamento de Pasantías Supervisadas','Reglamento de Seguimiento de Egresados']],
   ['seedling','Investigación y Semilleros',['Reglamento de Extensión e Investigación','Reglamento de Semilleros de Investigación']],
   ['globe-with-meridians','Movilidad y Desarrollo Académico',['Reglamento de Movilidad e Internacionalización','Reglamento de Posgrado']]]}],
 cq:'¿Querés consultar los **Reglamentos vigentes?**',cd:'Accedé a la sección de **Normativa Online** desde la página web institucional y encontrá todo lo que necesitás.',
 btn:'Normativa Online',books:['NORMATIVA','APRENDIZAJE','FUTURO']},
{name:'02 Derechos y deberes',type:'p2',title:'Tus derechos y deberes\n**como estudiante FEaD**',te:'balance-scale',
 sub:'Conocer tus derechos y deberes fortalece tu participación, protege tu avance académico y contribuye a construir un entorno universitario de **excelencia, ética y respeto mutuo.**',
 tag:'APRENDER HOY\rCONSTRUYE UN\rMEJOR MAÑANA',
 cols:[{t:'Derechos del estudiante',e:'busts-in-silhouette',items:[
   ['graduation-cap','Educación de Calidad','Acceso a programas actualizados, docentes cualificados y recursos digitales eficaces.'],
   ['magnifying-glass-tilted-left','Información Académica Transparente','Conocer programas de estudio, criterios de evaluación y calificaciones oportunamente.'],
   ['locked','Confidencialidad y Protección de Datos','Resguardo estricto de tu historial académico y datos personales conforme a la ley.'],
   ['compass','Orientación y Acompañamiento','Tutorías académicas, asistencia técnica y servicios de Bienestar Estudiantil.'],
   ['megaphone','Canales de Reclamo y Debido Proceso','Garantía de ser escuchado, revisar evaluaciones y recibir respuesta formal a solicitudes.'],
   ['person-raising-hand','Participación Estudiantil','Involucramiento activo en actividades de investigación, extensión y vida universitaria.']]},
  {t:'Deberes del estudiante',e:'student',items:[
   ['scroll','Cumplir las Normas Institucionales','Respetar los reglamentos, estatutos y normas vigentes en la Facultad y Universidad.'],
   ['shield','Honestidad e Integridad Académica','Presentar trabajos de autoría propia y evitar el plagio o fraude en evaluaciones.'],
   ['handshake','Respeto a la Comunidad','Mantener un trato respetuoso y constructivo en foros, entornos virtuales y tutorías.'],
   ['laptop','Participación Responsable','Ingresar activamente a la plataforma, entregar tareas y cumplir con el calendario.'],
   ['books','Uso Adecuado de Recursos','Utilizar la plataforma, biblioteca y canales institucionales exclusivamente con fines académicos.'],
   ['gear','Cumplimiento Administrativo','Mantener al día las gestiones documentales y compromisos administrativos requeridos.']]}],
 foot:'El respeto, la responsabilidad y la participación **fortalecen nuestra comunidad.**',
 chips:[['person-raising-hand','Participación'],['locked','Confidencialidad'],['megaphone','Canales de Reclamo'],['page-facing-up','Debido Proceso']]},
{name:'03 Dirección académica',type:'p3',ce:'classical-building',title:'Dirección **Académica**',
 sub:'Una estructura académica integral para **acompañarte desde tu ingreso hasta tu graduación.**',
 areas:[{t:'ÁREAS ACADÉMICAS',s:'Formación disciplinar con visión de futuro',u:[
   ['balance-scale','Ciencias Jurídicas y Administración Pública',['Programas del área jurídica y administrativa.','Formación ética y profesional.']],
   ['brain','Ciencias Humanas y de la Educación',['Educación, Psicología y Humanidades.','Desarrollo humano y social.']],
   ['chart-increasing','Ciencias Económicas y Empresariales',['Administración, Economía y Negocios.','Gestión organizacional y emprendimiento.']]]},
  {t:'APOYO AL ESTUDIANTE',s:'Tu bienestar también es parte de tu formación',u:[
   ['teacher','Tutoría y Acompañamiento Académico',['Acompañamiento durante la trayectoria académica.','Resolución de consultas.','Seguimiento al estudiante.']],
   ['heart-hands','Bienestar Estudiantil',['Atención integral al estudiante.','Apoyo psicológico y pedagógico.','Actividades de bienestar y acompañamiento.']],
   ['headphone','Centro de Atención al Estudiante',['Consultas administrativas.','Orientación sobre trámites.','Seguimiento de gestiones estudiantiles.','Canal institucional de atención.']]]},
  {t:'GESTIÓN ACADÉMICA',s:'Procesos que acompañan tu trayectoria universitaria',u:[
   ['memo','Secretaría Académica',['Expedientes académicos.','Certificados y constancias.','Actas académicas.','Gestión documental académica.']],
   ['check-mark-button','Calidad Educativa',['Autoevaluación institucional.','Seguimiento de procesos.','Mejora continua académica.']]]},
  {t:'ÁREAS ESPECIALIZADAS',s:'Innovación y proyección para una mejor educación',u:[
   ['microscope','Investigación, Extensión y Vinculación',['Investigación científica.','Proyectos de extensión.','Vinculación con la comunidad.']],
   ['desktop-computer','Tecnología Educativa',['Plataformas virtuales.','Soporte tecnológico.','Innovación para el aprendizaje.']],
   ['clapper-board','Producción y Gestión de Contenidos Académicos',['Desarrollo de materiales educativos.','Producción de recursos multimedia.','Contenidos para el aprendizaje digital.']]]}]},
{name:'04 Ruta del estudiante FEaD',type:'p4',ce:'compass',title:'Ruta del **estudiante**',
 sub:'Tu recorrido académico desde el ingreso hasta tu desarrollo profesional.',
 p:'Conoce las principales etapas que forman parte de tu trayectoria universitaria y prepárate para avanzar con éxito desde tu ingreso hasta tu incorporación a la **comunidad Alumni.**',
 st:[{e:'rocket',t:'INGRESO',s:'El inicio de tu camino',b:['Información sobre la carrera.','Inscripción y admisión.','Inducción institucional.','Acceso a la plataforma virtual.']},
  {e:'books',t:'TRAYECTORIA',s:'Aprender, crecer y avanzar',b:['Desarrollo de asignaturas.','Evaluaciones y actividades académicas.','Investigación y extensión.','Prácticas y actividades formativas.']},
  {e:'graduation-cap',t:'EGRESO',s:'Culminación de tu formación',b:['Finalización del plan de estudios.','Cumplimiento de créditos académicos.','Requisitos académicos y administrativos.']},
  {e:'scroll',t:'TITULACIÓN',s:'Tu esfuerzo se convierte en profesión',b:['Trabajo Final de Grado.','Defensa y aprobación.','Obtención del título profesional.']},
  {e:'people-hugging',t:'ALUMNI',s:'Una comunidad para toda la vida',b:['Red de egresados.','Formación continua.','Desarrollo profesional.','Vinculación con la comunidad universitaria.']}],
 chips:[['chart-increasing','Gestión empresarial'],['light-bulb','Innovación'],['handshake','Liderazgo'],['globe-with-meridians','Visión estratégica']],
 q:'“Lidera organizaciones y transforma\noportunidades en resultados.”',
 qp:'Prepárate para desarrollar competencias que te permitan liderar organizaciones, generar valor y contribuir al desarrollo sostenible de los sectores público y privado.'},
{name:'05 Ruta Derecho',type:'pc',ce:'classical-building',car:'**Derecho**',
 sub:'Desde tu ingreso hasta tu desarrollo profesional, construye una trayectoria conectada con\n**las leyes, la justicia y la sociedad.**',
 st:[['laptop','Ingreso','Conoce la carrera, su plan de estudios y las herramientas para comenzar tu formación.'],
  ['open-book','Trayectoria','Aprende y profundiza en las ciencias jurídicas, complementando tu formación con actividades académicas.'],
  ['balance-scale','Egreso','Integra tus conocimientos y demuestra tus competencias para responder a los desafíos profesionales.'],
  ['scroll','Titulación','Concreta tu proyecto académico y prepárate para ejercer en el ámbito legal y social.'],
  ['busts-in-silhouette','Comunidad Alumni','Mantén el vínculo con tu carrera y sé parte de una comunidad que construye una sociedad más justa.']],
 foot:'Conecta tu pasión por el **Derecho** y transforma tu futuro.'},
{name:'06 Ruta Ingeniería en Marketing',type:'pc',ce:'megaphone',car:'**Ingeniería en Marketing** | Modalidad Educación a Distancia',
 sub:'Desde tu ingreso hasta tu desarrollo profesional, construye una trayectoria conectada con **las marcas, las audiencias y la innovación.**',
 st:[['laptop','Ingreso','Conoce la modalidad EaD, la plataforma virtual y las herramientas para comenzar tu formación.'],
  ['bar-chart','Trayectoria','Aprende investigación de mercados, estrategia, branding, comunicación y marketing digital.'],
  ['graduation-cap','Egreso','Integra tus aprendizajes y demuestra tus competencias para responder a desafíos de marketing.'],
  ['scroll','Titulación','Concreta tu proyecto académico y prepárate para ejercer en el campo profesional.'],
  ['handshake','Comunidad Alumni','Conecta con otros profesionales y continúa creciendo a través de una comunidad para toda la vida.']],
 foot:'Conecta marcas con personas y **transforma ideas en valor.**'},
{name:'07 Sistema de evaluación',type:'p7',title:'Sistema de **evaluación FEaD**',tag:'TU FORMACIÓN, NUESTRO COMPROMISO',
 a:{t:'¿CÓMO SE CALCULA TU NOTA FINAL?',s:'La nota final suma **100 puntos:**',
  d:[[0.4,'40%','Evaluaciones\nparciales','Dos de 20 puntos'],[0.2,'20%','Actividades\nde proceso','Cuatro de 5 puntos'],[0.4,'40%','Examen final\nintegrador','']]},
 r:{t:'REQUISITOS PARA EXÁMENES',s:'Parciales y finales',
  it:[['memo','**20 puntos mínimos de proceso** (Trabajos prácticos y evaluaciones parciales)'],['check-mark-button','Estar al día con los **compromisos administrativos**']]},
 tb:{t:'ESCALA DE CALIFICACIONES',h:['Concepto','Rango porcentual','Puntos'],
  r:[['Excelente (5)','90% a 100%','90 a 100'],['Muy Bueno (4)','80% a 89%','80 a 89'],['Bueno (3)','70% a 79%','70 a 79'],['Aceptable (2)','60% a 69%','60 a 69'],['Insuficiente (1)','0% a 59%','Reprobado']]},
 et:{t:'ETAPAS DEL PROCESO EVALUATIVO',s:['Proceso y parciales','Recuperatorios para parciales','Examen Final','Extraordinario como segunda oportunidad para el examen final']},
 foot:'Tu aprendizaje es un proceso continuo de **participación, esfuerzo y honestidad académica.**',books:['CONOCIMIENTO','DISCIPLINA','OPORTUNIDADES']},
{name:'08 Ruta Ingeniería Comercial',type:'pc',ce:'briefcase',car:'**Ingeniería Comercial** | Modalidad Educación a Distancia',
 sub:'Desde tu ingreso hasta tu desarrollo profesional, construye una trayectoria conectada con **los negocios, la gestión y la sostenibilidad empresarial.**',
 st:[['laptop','Ingreso','Conoce la modalidad EaD, la plataforma virtual y las herramientas clave para gestionar tu formación.'],
  ['chart-increasing','Trayectoria','Aprende gestión empresarial, análisis de mercados, finanzas corporativas y sostenibilidad organizacional.'],
  ['graduation-cap','Egreso','Integra tus aprendizajes y demuestra tus competencias para liderar y tomar decisiones empresariales.'],
  ['scroll','Titulación','Concreta tu proyecto académico y prepárate para dirigir y asesorar en el campo comercial y gerencial.'],
  ['handshake','Comunidad Alumni','Conecta con líderes empresariales y continúa tu crecimiento profesional en una red para toda la vida.']],
 foot:'Conecta marcas con personas y **transforma ideas en valor.**'}
];

// ---------- construcción: una mesa de 1080×1080 por pieza (grilla 4×2) ----------
var BUILD={p1:m1,p2:m2,p3:m3,p4:m4,pc:mc,p7:m7};
N=DATA.length;
var fo=new Folder(DIR);if(!fo.exists)fo.create();
var doc=app.documents.add(DocumentColorSpace.RGB,AW,AH,N,DocumentArtboardLayout.GridByRow,60,4);
try{var ro=doc.rasterEffectSettings;ro.resolution=150;doc.rasterEffectSettings=ro;}catch(e){ERR.push('res '+e);}
GR=doc.gradients.add();GR.name='FEaD Rojo-Naranja';GR.type=GradientType.LINEAR;GR.gradientStops[0].color=RED;GR.gradientStops[1].color=ORG;
var tmpL=doc.layers[0];tmpL.name='tmp';TMP=tmpL.textFrames.add();TMP.contents='x';
for(var i=0;i<N;i++){var d=DATA[i],ab=doc.artboards[i];ab.name=d.name;var r=ab.artboardRect;AX=r[0];AY=r[1];
  var L=doc.layers.add();L.name=d.name;
  try{BUILD[d.type](L,d);}catch(e){ERR.push(d.name+': '+e+' @'+e.line);}}
TMP.remove();tmpL.remove();
doc.saveAs(new File(DIR+OUT));
app.userInteractionLevel=UserInteractionLevel.DISPLAYALERTS;
var MSG='OK '+N+' piezas'+(ERR.length?' | '+ERR.join(' || '):'')+(NOTE.length?'\r'+NOTE.join('\r'):'')+'\rGuardado en '+DIR+OUT;
alert(MSG);MSG;
