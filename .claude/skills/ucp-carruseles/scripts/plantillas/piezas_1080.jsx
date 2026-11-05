#target illustrator
// Piezas institucionales FEaD — 8 piezas de 1080×1080, sin fotos (solo diseño vectorial + emojis Apple).
// Línea del último carrusel: azul #2153D0 y rojo #FA2626, diagonales, títulos con peso mixto y barra roja, tarjetas blancas
// con sombra suave, tarjetas con filete, badge con arco degradado, banner con emblema de arcos y libros vectoriales.
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
// ===== CONFIG: carpeta de salida, nombre del .ai y emojis Apple (slug.png) =====
var DIR = 'C:/Users/raulm/Claude/UCP/Piezas-FEaD/', OUT = 'Piezas_FEaD_1080x1080.ai';
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

// ---------- piezas ----------
// 01 Árbol reglamentario: tronco con 3 ramas numeradas, cada una con 3 tarjetas; pie con libros y botón.
function p1(P,d){bg(P,BG);topbar(P);hdr(P,44);
  var y=title(P,d.title,M,96,{size:52,c:NAVY,hc:RED,w:900,e:d.te,er:-8,bar:1});
  var s=T(P,d.sub,M,y+16,{f:F.r,size:19,c:GRAY,w:640,lead:25,hc:NAVY});tag(P,d.tag,AW-M,y+18);
  var y0=y+16+s.height+28,x0=122,gap=16,cw=(AW-M-x0-2*gap)/3,tw=cw-44,rows=d.rows,ch=[],ty=[],yy=y0,i,j,m;
  for(i=0;i<3;i++){m=0;for(j=0;j<3;j++)m=Math.max(m,bh(rows[i].g[j][2],tw,15,19,4));ch.push(76+m+18);ty.push(yy);yy+=32+ch[i]+16;}
  line(P,[[82,ty[0]+14],[82,ty[2]+32+ch[2]/2]],SKY,4);   // tronco
  for(i=0;i<3;i++){var r=rows[i],col=i%2?RED:NAVY,cy=ty[i]+32,mid=cy+ch[i]/2;
    line(P,[[82,mid],[x0-4,mid]],SKY,4);circ(P,82,mid,6,col,WHITE,2);   // rama
    num(P,82,ty[i]+14,20,String(i+1),col,19);
    var l=T(P,'**'+r.t+'**   '+r.s,x0,0,{f:F.r,size:15,c:GRAY,hc:col,tr:40});vc(l,ty[i]+14);
    for(j=0;j<3;j++){var g=r.g[j],x=x0+j*(cw+gap);card(P,x,cy,cw,ch[i],22);circ(P,x+42,cy+42,25,TINT[i%2]);E(P,g[0],x+42,cy+42,35);
      var tt=T(P,g[1],x+78,0,{f:F.b,size:16,c:NAVY,w:cw-92,lead:19});vc(tt,cy+42);
      bul(P,g[2],x+22,cy+78,tw,{size:15,lead:19,gap:4,dc:col});}}
  var fy=AH-140,fx=fbooks(P,fy,d.books),bo={size:18,h:56,bg:WHITE,c:NAVY,f:F.b,px:18,e:'link'},bw=bannerW(d.btn,bo),g2=P.groupItems.add();
  var q=T(g2,d.cq,fx,0,{f:F.s,size:18,c:WHITE,hc:WHITE,w:AW-M-bw-fx-30,lead:23});T(g2,d.cd,fx,q.height+8,{f:F.r,size:14.5,c:SKY,hc:WHITE,w:AW-M-bw-fx-30,lead:19});
  gc(g2,fy+70);banner(P,d.btn,AW-M-bw,fy+42,bo);}

// 02 Derechos y deberes: dos columnas (azul / roja) con 6 filas alineadas; pie con frase y 4 valores.
function p2(P,d){bg(P,BG);topbar(P);hdr(P,44);
  var y=title(P,d.title,M,96,{size:48,c:NAVY,hc:RED,w:780,e:d.te,er:8,bar:1});tag(P,d.tag,AW-M,104);
  var s=T(P,d.sub,M,y+16,{f:F.r,size:18,c:GRAY,w:AW-2*M,lead:24,hc:NAVY});
  var y0=y+16+s.height+24,gp=24,w=(AW-2*M-gp)/2,hh=56,tw=w-76-18,rh=[],H=hh,i,c,m,it;
  for(i=0;i<6;i++){m=0;for(c=0;c<2;c++){it=d.cols[c].items[i];m=Math.max(m,nl(it[1],F.b,16,tw)*19.5+4+nl(it[2],F.r,14,tw)*17.5);}rh.push(m+32);H+=m+32;}
  for(c=0;c<2;c++){var co=d.cols[c],x=M+c*(w+gp),k=c?RED:NAVY,yy=y0+hh;card(P,x,y0,w,H,24);rr(P,x,y0,w,hh,24,k);rr(P,x,y0+28,w,hh-28,0,k);
    circ(P,x+38,y0+hh/2,20,WHITE);E(P,co.e,x+38,y0+hh/2,28);var t=T(P,co.t,x+70,0,{f:F.b,size:21,c:WHITE});vc(t,y0+hh/2);
    for(i=0;i<6;i++){it=co.items[i];var my=yy+rh[i]/2;if(i)line(P,[[x+22,yy],[x+w-22,yy]],LINE,1.2);
      circ(P,x+42,my,23,TINT[c]);E(P,it[0],x+42,my,32);
      var g=P.groupItems.add(),a=T(g,it[1],x+76,0,{f:F.b,size:16,c:NAVY,w:tw,lead:19.5});T(g,it[2],x+76,a.height+4,{f:F.r,size:14,c:GRAY,w:tw,lead:17.5});
      gc(g,my);yy+=rh[i];}}
  var fy=y0+H+26,fh=AH-fy,cx=540;rr(P,0,fy,AW,fh,0,NAVY);poly(P,[[cx,fy],[cx+18,fy],[cx+18-SL*fh,AH],[cx-SL*fh,AH]],RED);
  var f=T(P,d.foot,M,0,{f:F.s,size:21,c:WHITE,hc:WHITE,w:420,lead:28});vc(f,fy+fh/2);
  for(i=0;i<4;i++){var q=d.chips[i],qx=cx+48+(i%2)*226,qy=fy+fh/2+(i<2?-28:28);circ(P,qx+20,qy,20,WHITE);E(P,q[0],qx+20,qy,28);
    var u=T(P,q[1],qx+50,0,{f:F.s,size:15,c:WHITE});vc(u,qy);}}

// 03 Dirección académica: cabecera azul con badge; organigrama 2×2 con conectores desde la cabecera.
function p3(P,d){bg(P,BG);var gb=P.groupItems.add();hdr(P,44,true);badge(P,826,128,64,d.ce,0.84);sat(P,748,90,26,'graduation-cap');
  var y=title(P,d.title,M,96,{size:54,c:WHITE,f:F.r,hc:WHITE,w:700,bar:1});
  var s=T(P,d.sub,M,y+16,{f:F.s,size:17,c:SKY,hc:WHITE,w:900,lead:23}),hb=y+16+s.height+30;band(gb,hb);
  var gy=hb+40,w=(AW-2*M-20)/2,ar=d.areas,uw=w-72-20;
  function aH(a){var h=64+18,k;for(k=0;k<a.u.length;k++)h+=nl(a.u[k][1],F.b,15.5,uw)*19+4+bh(a.u[k][2],uw,13.5,17,0)+(k?12:0);return h+18;}
  var h1=Math.max(aH(ar[0]),aH(ar[1])),h2=Math.max(aH(ar[2]),aH(ar[3])),c0=M+w/2,c1=M+w+20+w/2,ly=hb+20,y2=gy+h1+20;
  line(P,[[MX,hb],[MX,y2+32]],RULE,2.5);line(P,[[c0,gy],[c0,ly],[c1,ly],[c1,gy]],RULE,2.5);
  circ(P,MX,hb,8,RED,WHITE,2.5);circ(P,MX,y2+32,6,RED,WHITE,2);
  function area(x,y,h,a,n){card(P,x,y,w,h,22);rr(P,x,y,w,64,22,NAVY);rr(P,x,y+32,w,32,0,NAVY);
    rr(P,x,y,64,64,22,RED);rr(P,x+32,y,32,64,0,RED);rr(P,x,y+32,64,32,0,RED);
    var nt=T(P,String(n),x+32,0,{f:F.b,size:32,c:WHITE,just:'c'});vc(nt,y+32);
    var g=P.groupItems.add(),a1=T(g,a.t,x+80,0,{f:F.b,size:17,c:WHITE,tr:20});T(g,a.s,x+80,a1.height+3,{f:F.r,size:13.5,c:SKY,w:w-96,lead:17});gc(g,y+32);
    var sp=(h-aH(a))/(a.u.length+1),yy=y+64+18+sp,k;   // reparte el espacio sobrante
    for(k=0;k<a.u.length;k++){var u=a.u[k],nh=nl(u[1],F.b,15.5,uw)*19;circ(P,x+40,yy+15,21,TINT[k%2]);E(P,u[0],x+40,yy+15,30);
      T(P,u[1],x+72,yy,{f:F.b,size:15.5,c:NAVY,w:uw,lead:19});var bb=bul(P,u[2],x+72,yy+nh+4,uw,{size:13.5,lead:17,dc:n%2?RED:NAVY});
      yy+=nh+4+bb+12+sp;}}
  area(M,gy,h1,ar[0],1);area(M+w+20,gy,h1,ar[1],2);area(M,y2,h2,ar[2],3);area(M+w+20,y2,h2,ar[3],4);}

// 04 Ruta del estudiante FEaD: camino vertical con 5 paradas y tarjetas alternadas; pie azul con la cita.
function p4(P,d){bg(P,BG);var gb=P.groupItems.add();topbar(P);hdr(P,44);badge(P,935,140,70,d.ce,0.85);sat(P,858,204,28,'pushpin');
  var y=title(P,d.title,M,96,{size:56,c:NAVY,hc:RED,w:760,bar:1});
  var s=T(P,d.sub,M,y+16,{f:F.s,size:19,c:NAVY,w:760,lead:25});hband(gb,y+6);
  var y0=y+16+s.height+28,cw=428,ch=180,xr=AW-M-cw,i;
  line(P,[[MX,y0-6],[MX,y0+596]],ROAD,30);line(P,[[MX,y0-6],[MX,y0+596]],WHITE,3,[12,12]);   // camino
  T(P,d.p,xr,y0+2,{f:F.r,size:15.5,c:GRAY,w:cw,lead:21,hc:NAVY});
  for(i=0;i<5;i++){var st=d.st[i],L=i%2==0,x=L?M:xr,cy=y0+(L?0:100)+Math.floor(i/2)*200,col=i%2?RED:NAVY,my=cy+ch/2;
    card(P,x,cy,cw,ch,24);rr(P,L?x+cw-7:x+1,cy+36,6,ch-72,3,col);   // filete hacia el camino
    ccard(P,MX,my,40);circ(P,MX,my,38,null,col,4);E(P,st.e,MX,my,50);num(P,MX+30,my-30,14,String(i+1),col,14);
    var g=P.groupItems.add(),a=T(g,st.t,x+30,0,{f:F.b,size:22,c:col,tr:40}),b=T(g,st.s,x+30,a.height+4,{f:F.b,size:16,c:NAVY,w:cw-60,lead:20});
    bul(g,st.b,x+30,a.height+4+b.height+10,cw-56,{size:14.5,lead:19.5,dc:col});gc(g,my);}
  var qy=y0+500,qw=cw/2-6;for(i=0;i<4;i++){var c=d.chips[i],qx=xr+(i%2)*(qw+12),yy=qy+Math.floor(i/2)*46;
    rr(P,qx,yy,qw,38,19,WHITE,LINE,1.2);E(P,c[0],qx+24,yy+19,26);var u=T(P,c[1],qx+44,0,{f:F.s,size:14.5,c:NAVY});vc(u,yy+19);}
  ccard(P,MX,y0+604,28);E(P,'chequered-flag',MX,y0+604,36);
  var fy=y0+656,fh=AH-fy;rr(P,0,fy,AW,fh,0,NAVY);
  poly(P,[[AW-152,fy],[AW-132,fy],[AW-132-SL*fh,AH],[AW-152-SL*fh,AH]],RED);poly(P,[[AW-112,fy],[AW,fy],[AW,AH],[AW-112-SL*fh,AH]],RULE);
  var g3=P.groupItems.add(),qt=T(g3,d.q,M,0,{f:F.b,size:25,c:WHITE,w:800,lead:31});T(g3,d.qp,M,qt.height+12,{f:F.r,size:16,c:SKY,w:800,lead:22});gc(g3,fy+fh/2);}

// 05/06/08 Ruta por carrera: 5 etapas numeradas con flechas, tarjetas con filete y emoji; banner con emblema.
function pc(P,d){bg(P,BG);var gb=P.groupItems.add();topbar(P);hdr(P,44);badge(P,935,140,70,d.ce,0.85);
  var y=title(P,'Ruta del **estudiante**',M,96,{size:56,c:NAVY,hc:RED,w:760});
  var c=T(P,d.car,M,y+10,{f:F.r,size:25,c:NAVY,w:790,lead:31});y+=10+c.height+14;rr(P,M,y,110,8,0,RED);hband(gb,y+12);
  var s=T(P,d.sub,M,y+24,{f:F.r,size:18.5,c:GRAY,w:AW-2*M,lead:24,hc:NAVY}),y0=y+24+s.height+24,rh=112,gp=12,x=150,w=AW-M-x,i;
  line(P,[[96,y0+rh/2],[96,y0+4*(rh+gp)+rh/2]],SKY,3);
  for(i=0;i<5;i++){var st=d.st[i],cy=y0+i*(rh+gp),my=cy+rh/2,col=i%2?RED:NAVY,ay=cy-gp/2;
    if(i)poly(P,[[89,ay-5],[103,ay-5],[96,ay+4]],col);   // flecha entre etapas
    num(P,96,my,30,'0'+(i+1),col,20);scard(P,x,cy,w,rh,col,WHITE,true);
    var g=P.groupItems.add(),lb=st[1].toUpperCase(),lw=mw(lb,F.b,15,60)+36;rr(g,x+44,0,lw,30,15,col);
    var lt=T(g,lb,x+44+lw/2,0,{f:F.b,size:15,c:WHITE,just:'c',tr:60});vc(lt,15);
    T(g,st[2],x+44,42,{f:F.r,size:17.5,c:GRAY,w:w-44-140,lead:22.5,hc:NAVY});gc(g,my);
    circ(P,x+w-74,my,40,TINT[i%2]);E(P,st[0],x+w-74,my,58,i%2?8:-8);}
  wbanner(P,d.foot,M,AH-46-84,AW-2*M,84,{size:23});}

// 07 Sistema de evaluación: cabecera azul; 2×2 con anillos de porcentaje, requisitos, tabla y etapas; pie con libros.
function p7(P,d){bg(P,BG);var gb=P.groupItems.add();hdr(P,44,true);
  var y=title(P,d.title,M,96,{size:50,c:WHITE,f:F.r,hc:WHITE,w:860,bar:1});
  var tg=T(P,d.tag,M,y+14,{f:F.s,size:16,c:SKY,tr:120}),hb=y+14+tg.height+26;band(gb,hb);E(P,'direct-hit',846,124,104,-10);
  var y0=hb+20,wl=572,wr=AW-2*M-20-wl,xr=M+wl+20,h1=300,k,q;
  var cy=hcard(P,M,y0,wl,h1,NAVY,d.a.t,'bar-chart');T(P,d.a.s,M+wl/2,cy+16,{f:F.s,size:18,c:NAVY,just:'c',hc:RED});
  for(k=0;k<3;k++){q=d.a.d[k];var dx=M+wl*(2*k+1)/6,dy=cy+100;if(k)line(P,[[M+wl*k/3,dy-44],[M+wl*k/3,dy+136]],LINE,1.5);
    donut(P,dx,dy,48,q[0],k==1?NAVY:GC(),q[1]);rr(P,dx-78,dy+60,156,44,14,k==1?RED:NAVY);
    var pl=T(P,q[2],dx,0,{f:F.b,size:14,c:WHITE,just:'c',w:150,lead:17});vc(pl,dy+82);
    if(q[3])T(P,q[3],dx,dy+114,{f:F.r,size:14,c:GRAY,just:'c',w:170});}
  var ry=hcard(P,xr,y0,wr,h1,RED,d.r.t),sb=T(P,d.r.s,xr+24,ry+16,{f:F.s,size:16,c:RED}),iy=ry+16+sb.height+12,ih=(y0+h1-16-iy)/2;
  for(k=0;k<2;k++){q=d.r.it[k];var my=iy+ih*k+ih/2;if(k)line(P,[[xr+24,iy+ih],[xr+wr-24,iy+ih]],LINE,1.2);
    circ(P,xr+52,my,28,TINT[k]);E(P,q[0],xr+52,my,38);var u=T(P,q[1],xr+96,0,{f:F.r,size:16,c:GRAY,hc:NAVY,w:wr-96-18,lead:21});vc(u,my);}
  var y2=y0+h1+18,h2=310,ty=hcard(P,M,y2,wl,h2,NAVY,d.tb.t,'trophy'),cz=[214,172,138],tx=M+24,rH=34,yy=ty+14,i,j,cx;
  rr(P,tx,yy,wl-48,rH,10,TN);
  for(i=0;i<6;i++){var row=i?d.tb.r[i-1]:d.tb.h;if(i&&i%2==0)rr(P,tx,yy,wl-48,rH,10,BG);cx=tx;
    for(j=0;j<3;j++){var bad=row[j]=='Reprobado',t=T(P,row[j],j?cx+cz[j]/2:cx+18,0,{f:(i==0||j==0||bad)?F.b:F.r,size:i?15:14,c:bad?RED:(i&&j?GRAY:NAVY),just:j?'c':'l'});
      vc(t,yy+rH/2);if(j)line(P,[[cx,yy+7],[cx,yy+rH-7]],i?LINE:WHITE,1.2);cx+=cz[j];}
    yy+=rH+4;}
  var ey=hcard(P,xr,y2,wr,h2,RED,d.et.t,null,15),sh=50,sg=(h2-52-28-4*sh)/3,y3=ey+14;
  for(k=0;k<4;k++){q=d.et.s[k];var kc=k<2?NAVY:RED;rr(P,xr+20,y3,wr-40,sh,16,TINT[k<2?0:1]);num(P,xr+46,y3+sh/2,16,String(k+1),kc,16);
    var v=T(P,q,xr+74,0,{f:F.s,size:14,c:NAVY,w:wr-40-70,lead:17.5});vc(v,y3+sh/2);
    if(k<3){var ay=y3+sh+sg/2;poly(P,[[xr+wr/2-8,ay-4],[xr+wr/2+8,ay-4],[xr+wr/2,ay+5]],DOT);}y3+=sh+sg;}
  var fy=y2+h2+24,fx=fbooks(P,fy,d.books),f=T(P,d.foot,fx,0,{f:F.s,size:22,c:WHITE,hc:WHITE,w:AW-M-fx,lead:29});vc(f,fy+(AH-fy)/2);}

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
var BUILD={p1:p1,p2:p2,p3:p3,p4:p4,pc:pc,p7:p7};
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
