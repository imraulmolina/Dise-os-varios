#target illustrator
// Genera las infografías FEaD con emojis de Apple — una mesa de trabajo por infografía.
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
// ===== CONFIG: carpeta de salida, nombre del .ai y carpeta de emojis Apple (slug.png) =====
var DIR = 'C:/Users/raulm/Claude/UCP/FEaD-infografias/', OUT = 'FEaD_infografias.ai';
var EM = 'C:/Users/raulm/.claude/skills/fead-infografias/assets/emojis-apple/', ERR = [];
function C(h){var c=new RGBColor();c.red=parseInt(h.substr(0,2),16);c.green=parseInt(h.substr(2,2),16);c.blue=parseInt(h.substr(4,2),16);return c;}
var NAVY=C('1B365D'),RED=C('E31B2D'),ORG=C('FF8A3D'),BG=C('F2F3F7'),WHITE=C('FFFFFF'),INK=C('1C2536'),GRAY=C('646C7C'),
    LINE=C('E8EBF1'),TRACK=C('ECEEF3'),DOT=C('C2C9D6'),PILLG=C('E3E6ED'),SOFT=C('F3F4F8'),TBLUE=C('2153D0');
var TH={navy:{m:NAVY,t:C('E9EEF6')},red:{m:RED,t:C('FDECEE')},blue:{m:C('2F6FD6'),t:C('E8F1FD')}};
var TINT=[TH.navy.t,TH.red.t];
var F={b:app.textFonts.getByName('Gotham-Bold'),s:app.textFonts.getByName('Gotham-Medium'),
       m:app.textFonts.getByName('Gotham-Book'),r:app.textFonts.getByName('Gotham-Book')};
var AX=0,AY=0,TMP,GR,N;
function X(x){return AX+x;} function Y(y){return AY-y;}

// ---------- primitivas ----------
function paint(p,f,s,sw){if(f){p.filled=true;p.fillColor=f;}else p.filled=false;if(s){p.stroked=true;p.strokeColor=s;p.strokeWidth=sw||1;}else p.stroked=false;return p;}
function rr(P,x,y,w,h,r,f,s,sw){return paint(P.pathItems.roundedRectangle(Y(y),X(x),w,h,r,r),f,s,sw);}
function ell(P,cx,cy,rx,ry,f,s,sw){return paint(P.pathItems.ellipse(Y(cy-ry),X(cx-rx),rx*2,ry*2),f,s,sw);}
function circ(P,cx,cy,r,f,s,sw){return ell(P,cx,cy,r,r,f,s,sw);}
function blur(p,b){try{p.applyEffect('<LiveEffect name="Adobe PSL Gaussian Blur"><Dict data="R blur '+b+'"/></LiveEffect>');}catch(e){ERR.push('blur '+e);}}
function card(P,x,y,w,h,r,f){var s=rr(P,x+6,y+10,w-12,h-6,r,NAVY);s.opacity=10;blur(s,18);return rr(P,x,y,w,h,r,f||WHITE);}
function ccard(P,cx,cy,r){var s=circ(P,cx,cy+9,r-3,NAVY);s.opacity=11;blur(s,16);return circ(P,cx,cy,r,WHITE);}
function pts(a){var o=[];for(var i=0;i<a.length;i++)o.push([X(a[i][0]),Y(a[i][1])]);return o;}
function line(P,a,s,sw,dash){var p=P.pathItems.add();p.setEntirePath(pts(a));p.filled=false;p.stroked=true;p.strokeColor=s;p.strokeWidth=sw;
  p.strokeCap=StrokeCap.ROUNDENDCAP;p.strokeJoin=StrokeJoin.ROUNDENDJOIN;if(dash)p.strokeDashes=dash;return p;}
function poly(P,a,f){var p=P.pathItems.add();p.setEntirePath(pts(a));p.closed=true;return paint(p,f);}
function tri(P,px,py,ux,uy,s,f){var nx=-uy,ny=ux;return poly(P,[[px+ux*s,py+uy*s],[px-ux*s*0.6+nx*s*0.75,py-uy*s*0.6+ny*s*0.75],[px-ux*s*0.6-nx*s*0.75,py-uy*s*0.6-ny*s*0.75]],f);}
function E(P,k,cx,cy,sz){var f=new File(EM+k+'.png');if(!f.exists){ERR.push('emoji '+k);return;}
  var p=P.placedItems.add();p.file=f;p.width=sz;p.height=sz;p.left=X(cx-sz/2);p.top=Y(cy-sz/2);p.name=k;p.embed();}
function arc(P,cx,cy,r,a0,a1,sw,col){var n=Math.ceil(Math.abs(a1-a0)/90),da=(a1-a0)/n,k=4/3*Math.tan(da*Math.PI/720)*r,p=P.pathItems.add();
  for(var i=0;i<=n;i++){var a=(a0+da*i)*Math.PI/180,x=cx+r*Math.cos(a),y=cy+r*Math.sin(a),tx=-Math.sin(a),ty=Math.cos(a),pp=p.pathPoints.add();
    pp.anchor=[X(x),Y(y)];pp.leftDirection=[X(x-tx*k),Y(y-ty*k)];pp.rightDirection=[X(x+tx*k),Y(y+ty*k)];pp.pointType=PointType.SMOOTH;}
  p.closed=false;p.filled=false;p.stroked=true;p.strokeWidth=sw;p.strokeColor=col;p.strokeCap=StrokeCap.ROUNDENDCAP;return p;}
function GC(){var g=new GradientColor();g.gradient=GR;return g;}

// ---------- texto ----------
function sty(t,f,sz,c,ld,tr){var a=t.textRange.characterAttributes;a.textFont=f;a.size=sz;a.fillColor=c;if(ld){a.autoLeading=false;a.leading=ld;}a.tracking=tr||0;}
function mw(s,f,sz,tr){TMP.contents=s;sty(TMP,f,sz,INK,0,tr);return TMP.width;}
function wrap(s,f,sz,w,tr){if(!w)return s;var o=[],ps=s.split('\n');for(var i=0;i<ps.length;i++){var ws=ps[i].split(' '),cur='';
  for(var j=0;j<ws.length;j++){var t=cur?cur+' '+ws[j]:ws[j];if(cur&&mw(t,f,sz,tr)>w){o.push(cur);cur=ws[j];}else cur=t;}o.push(cur);}return o.join('\r');}
function T(P,s,x,y,o){var t=P.textFrames.add();t.contents=wrap(s,o.f,o.size,o.w,o.tr);sty(t,o.f,o.size,o.c,o.lead||Math.round(o.size*1.3),o.tr);
  t.textRange.paragraphAttributes.justification=o.just=='c'?Justification.CENTER:(o.just=='r'?Justification.RIGHT:Justification.LEFT);
  t.top=Y(y);t.left=o.just=='c'?X(x)-t.width/2:(o.just=='r'?X(x)-t.width:X(x));return t;}
function vc(t,cy){t.top=Y(cy-t.height/2);}
function center(g,y,h){var b=g.geometricBounds,gh=b[1]-b[3];g.translate(0,Y(y+(h-gh)/2)-b[1]);}
function pill(P,s,x,y,o){var sz=o.size||14,h=o.h||Math.round(sz*2.2),px=o.px||14,ew=o.e?sz*1.7:0;
  var t=T(P,s,0,0,{f:o.f||F.s,size:sz,c:o.c||WHITE,tr:o.tr}),w=t.width+2*px+ew,x0=o.anchor=='c'?x-w/2:(o.anchor=='r'?x-w:x);
  if(o.sh){var sd=rr(P,x0+4,y+6,w-8,h-2,h/2,NAVY);sd.opacity=14;blur(sd,10);sd.zOrder(ZOrderMethod.SENDBACKWARD);}
  var r=rr(P,x0,y,w,h,h/2,o.bg||NAVY,o.st,o.sw);r.zOrder(ZOrderMethod.SENDBACKWARD);
  if(o.e)E(P,o.e,x0+px+sz*0.65,y+h/2,sz*1.4);
  t.left=X(x0+px+ew);vc(t,y+h/2);return {w:w,h:h,x:x0};}
function arrowDot(P,cx,cy,r,bg){circ(P,cx,cy,r,bg||NAVY);var s=r*0.42,w=r*0.17;line(P,[[cx-s,cy],[cx+s,cy]],WHITE,w);line(P,[[cx+s*0.15,cy-s*0.8],[cx+s,cy],[cx+s*0.15,cy+s*0.8]],WHITE,w);}

// ---------- estructura común ----------
function header(P,d,i){var p=pill(P,'FEaD',50,36,{f:F.b,size:15,bg:NAVY,c:WHITE,h:34,px:16});
  var t0=T(P,'Facultad de Educación a Distancia',50+p.w+12,0,{f:F.m,size:14,c:GRAY});vc(t0,53);
  var ts=d.ts||36,t=T(P,d.title,600,96,{f:F.b,size:ts,c:TBLUE,just:'c',w:d.tw||980,lead:Math.round(ts*1.12),tr:-12});
  var y=96+t.height+14;rr(P,572,y,56,6,0,RED);y+=6;
  if(d.sub){y+=14;var s=T(P,d.sub,600,y,{f:F.r,size:17,c:GRAY,just:'c',w:820,lead:22});y+=s.height;}
  return y+28;}
function footer(P,d){if(!d.foot)return 862;var x=100,w=1000,s=(d.fl?d.fl+' ':'')+d.foot;
  var t=T(P,s,x+88,0,{f:F.r,size:16.5,c:INK,w:w-120,lead:22});
  if(d.fl)for(var c=0;c<d.fl.length;c++){var a=t.textRange.characters[c].characterAttributes;a.fillColor=RED;a.textFont=F.b;}
  var h=Math.max(76,t.height+36),y=900-34-h;card(P,x,y,w,h,Math.min(26,h/2));
  circ(P,x+46,y+h/2,25,TH.navy.t);E(P,d.fe||'light-bulb',x+46,y+h/2,32);
  vc(t,y+h/2);t.zOrder(ZOrderMethod.BRINGTOFRONT);return y-24;}
function badge(P,cx,cy,R,e,label,sub){ccard(P,cx,cy,R);var ri=R-18;circ(P,cx,cy,ri,null,TRACK,8);arc(P,cx,cy,ri,135,372,8,GC());
  var ka=372*Math.PI/180;circ(P,cx+ri*Math.cos(ka),cy+ri*Math.sin(ka),8,WHITE,ORG,4);
  E(P,e,cx,cy-4,R*0.95);
  var p=pill(P,label,cx,cy+R-20,{f:F.s,size:16,bg:NAVY,c:WHITE,h:38,px:18,anchor:'c',sh:true});
  if(sub)T(P,sub,cx,cy+R-20+p.h+10,{f:F.r,size:14,c:GRAY,just:'c',w:290,lead:18});}

// ---------- plantillas ----------
function hubCard(P,x,y,w,h,c,i,compact){card(P,x,y,w,h,26);var g=P.groupItems.add(),tint=TINT[i%2];
  if(c.items){circ(g,x+46,y+44,24,tint);E(g,c.e,x+46,y+44,32);var t=T(g,c.t,x+82,0,{f:F.b,size:21,c:NAVY});vc(t,y+44);
    line(g,[[x+22,y+82],[x+w-22,y+82]],LINE,1.2);
    for(var j=0;j<c.items.length;j++){var iy=y+109+j*29;E(g,c.items[j][0],x+38,iy,24);var u=T(g,c.items[j][1],x+60,0,{f:F.m,size:15,c:INK,w:w-80});vc(u,iy);}
  }else{var tw=w-112,ts=compact?18:19.5,ds=compact?14:15,t=T(g,c.t,x+92,y+20,{f:F.s,size:ts,c:NAVY,w:tw,lead:Math.round(ts*1.18)}),bh=t.height;
    if(c.d){var u=T(g,c.d,x+92,y+20+bh+7,{f:F.r,size:ds,c:GRAY,w:tw,lead:Math.round(ds*1.3)});bh+=7+u.height;}
    circ(g,x+50,y+20+bh/2,28,tint);E(g,c.e,x+50,y+20+bh/2,36);}
  center(g,y,h);}
function hub(P,d,T0,B0){var cs=d.cards,n=cs.length,nl=Math.ceil(n/2),cw=d.cw||372,gap=16,H=B0-T0,R=d.R||112,i;
  var ch=Math.min((H-(nl-1)*gap)/nl,d.maxH||260),pos=[];
  for(i=0;i<n;i++){var left=i<nl,k=left?i:i-nl,m=left?nl:n-nl,tot=m*ch+(m-1)*gap;pos.push({x:left?50:1150-cw,y:T0+(H-tot)/2+k*(ch+gap),l:left});}
  var cy=T0+(H-(2*R+18+(d.cs?52:0)))/2+R;
  for(i=0;i<n;i++)line(P,[[pos[i].l?pos[i].x+cw:pos[i].x,pos[i].y+ch/2],[600,cy]],DOT,2.4,[0.5,7]);
  badge(P,600,cy,R,d.ce,d.cl,d.cs);
  for(i=0;i<n;i++)hubCard(P,pos[i].x,pos[i].y,cw,ch,cs[i],i,nl>3);
  for(i=0;i<n;i++)circ(P,pos[i].l?pos[i].x+cw:pos[i].x,pos[i].y+ch/2,6,RED,WHITE,2.5);}

function gridV(P,x,y,w,h,c,i){card(P,x,y,w,h,28);var g=P.groupItems.add(),cx=x+w/2;circ(g,cx,y+48,46,TINT[i%2]);E(g,c.e,cx,y+48,62);
  var t=T(g,c.t,cx,y+112,{f:F.b,size:22,c:NAVY,just:'c',w:w-40,lead:26});
  if(c.d)T(g,c.d,cx,y+112+t.height+8,{f:F.r,size:15.5,c:GRAY,just:'c',w:w-60,lead:20});center(g,y,h);}
function gridS(P,x,y,w,h,c,i){card(P,x,y,w,h,24);var cx=x+w/2;
  pill(P,(i<9?'0':'')+(i+1),x+14,y+16,{f:F.b,size:13,bg:RED,c:WHITE,h:26,px:11});
  T(P,c.t,x+16,y+54,{f:F.b,size:17,c:NAVY,w:w-30,lead:20});
  var sy=y+106,sh=(h-106-10-10)/2;
  for(var j=0;j<c.subs.length;j++){var yy=sy+j*(sh+10);rr(P,x+10,yy,w-20,sh,18,SOFT);var g=P.groupItems.add();
    E(g,c.subs[j][0],cx,yy+40,58);T(g,c.subs[j][1],cx,yy+80,{f:F.s,size:14.5,c:INK,just:'c',w:w-40,lead:18});center(g,yy,sh);}}
function gridH(P,x,y,w,h,c,i){card(P,x,y,w,h,26);var g=P.groupItems.add(),tx=x+92,tw=w-112;
  var t=T(g,c.t,tx,y,{f:F.b,size:18,c:NAVY,w:tw,lead:21}),yy=y+t.height+5;
  if(c.q){var q=T(g,c.q,tx,yy,{f:F.s,size:14,c:RED,w:tw,lead:17});yy+=q.height+7;}
  for(var j=0;j<(c.b||[]).length;j++){var b=T(g,'\u2022  '+c.b[j],tx,yy,{f:F.r,size:14,c:GRAY,w:tw,lead:18});yy+=b.height+2;}
  circ(g,x+50,y+28,30,TINT[i%2]);E(g,c.e,x+50,y+28,38);center(g,y,h);}
function strip(P,s,y,h){var x=100,w=1000,r=rr(P,x,y,w,h,24,TH.red.t,RED,1.5);r.strokeDashes=[6,5];
  var n=s.items.length,cw=w/n;
  for(var i=0;i<n;i++){var g=P.groupItems.add(),it=s.items[i],cy=y+h/2+6,x0=x+cw*i;
    E(g,it[0],x0+30,cy,40);E(g,'cross-mark',x0+46,cy+14,18);var t=T(g,it[1],x0+62,0,{f:F.s,size:16,c:INK,w:170,lead:19});vc(t,cy);
    var b=g.geometricBounds;g.translate(X(x0+cw/2)-(b[0]+b[2])/2,0);
    if(i>0)line(P,[[x0,y+26],[x0,y+h-16]],C('F5C6CB'),1.2);}
  pill(P,s.t,600,y-17,{f:F.b,size:14,bg:RED,c:WHITE,h:34,px:16,anchor:'c',e:'prohibited',tr:40});}
function grid(P,d,T0,B0){var cs=d.cards,cols=d.cols,rows=Math.ceil(cs.length/cols),gap=d.gap||18,B=B0;
  if(d.strip)B=B0-(d.stripH||90)-24;
  var cw=(1100-(cols-1)*gap)/cols,ch=Math.min((B-T0-(rows-1)*gap)/rows,d.maxH||9999),tot=rows*ch+(rows-1)*gap,oy=T0+(B-T0-tot)/2;
  var fn={v:gridV,s:gridS,h:gridH}[d.card];
  for(var i=0;i<cs.length;i++)fn(P,50+(i%cols)*(cw+gap),oy+Math.floor(i/cols)*(ch+gap),cw,ch,cs[i],i);
  if(d.strip)strip(P,d.strip,B+24,d.stripH||90);}

function columns(P,d,T0,B0){var cs=d.cols,n=cs.length,gap=d.link?70:22,ws=0,i,j;for(i=0;i<n;i++)ws+=(cs[i].wt||1);
  var avail=1100-(n-1)*gap,H=B0-T0,x=50,mr=0,hh=62,tts=[],xs=[];
  for(i=0;i<n;i++){mr=Math.max(mr,cs[i].rows.length);var w0=avail*(cs[i].wt||1)/ws;
    var t=T(P,cs[i].t,0,0,{f:F.b,size:cs[i].ts||18,c:WHITE,w:w0-100,lead:21});tts.push(t);hh=Math.max(hh,t.height+26);}
  var rt=d.rt||16.5,rd=d.rd||14,rowH=Math.min((H-hh-26)/mr,d.maxRow||130);
  for(i=0;i<n;i++){var c=cs[i],w=avail*(c.wt||1)/ws,th=TH[c.c||'navy'];xs.push([x,w]);
    card(P,x,T0,w,H,28);rr(P,x+10,T0+10,w-20,hh,20,th.m);circ(P,x+43,T0+10+hh/2,21,WHITE);E(P,c.e,x+43,T0+10+hh/2,28);
    tts[i].zOrder(ZOrderMethod.BRINGTOFRONT);tts[i].left=X(x+76);vc(tts[i],T0+10+hh/2);
    var ry=T0+hh+20,cr=Math.min(24,rowH*0.36);if(d.vcenter)ry+=(H-hh-26-rowH*c.rows.length)/2;
    for(j=0;j<c.rows.length;j++){var r=c.rows[j],cy=ry+rowH*(j+0.5),cx=x+26+cr;
      if(j>0)line(P,[[x+24,ry+rowH*j],[x+w-24,ry+rowH*j]],LINE,1.2);
      circ(P,cx,cy,cr,th.t);E(P,r[0],cx,cy,cr*1.3);
      var tx=cx+cr+16,tw=w-(tx-x)-(c.mark?74:24),g=P.groupItems.add();
      var a=T(g,r[1],tx,cy,{f:r[2]?F.s:F.m,size:rt,c:INK,w:tw,lead:Math.round(rt*1.22)});
      if(r[2])T(g,r[2],tx,cy+a.height+6,{f:F.r,size:rd,c:GRAY,w:tw,lead:Math.round(rd*1.3)});
      center(g,cy-rowH/2,rowH);if(c.mark)E(P,c.mark,x+w-38,cy,24);}
    x+=w+gap;}
  if(d.link)for(i=0;i<n-1;i++){var gx=xs[i][0]+xs[i][1]+gap/2,gy=T0+H/2;
    if(d.link=='arrow'){ccard(P,gx,gy,22);arrowDot(P,gx,gy,17,NAVY);}else{ccard(P,gx,gy,42);E(P,d.link,gx,gy,52);}}}

function steps(P,d,T0,B0){var s=d.steps,n=s.length,per=Math.ceil(n/2),gx=44,rg=70,cw=(1100-(per-1)*gx)/per,H=B0-T0,
  ch=Math.min((H-rg)/2,240),oy=T0+(H-2*ch-rg)/2,pos=[],i,runs=d.runs||[],lab=[];
  for(i=0;i<n;i++)pos.push([50+(i%per)*(cw+gx),oy+Math.floor(i/per)*(ch+rg)]);
  for(i=0;i<runs.length;i++){var a=pos[runs[i][0]],b=pos[runs[i][1]],x0=a[0]-12,y0=a[1]-12,w=b[0]+cw+12-x0,h=ch+24;
    var r=rr(P,x0,y0,w,h,32,TH.red.t,RED,1.6);r.strokeDashes=[7,5];lab.push([x0+w/2,i==0?y0-15:y0+h-15]);}
  var e=pos[per-1],f=pos[per],x1=e[0]+cw/2,y1=e[1]+ch,x2=f[0]+cw/2,y2=f[1],my=(y1+y2)/2;
  line(P,[[x1,y1],[x1,my],[x2,my],[x2,y2]],DOT,2.6,[0.5,7]);
  for(i=0;i<n;i++){var x=pos[i][0],y=pos[i][1],last=i==n-1;card(P,x,y,cw,ch,26,last?NAVY:WHITE);var g=P.groupItems.add(),cx=x+cw/2;
    pill(g,'Paso '+(i<9?'0':'')+(i+1),cx,y,{f:F.s,size:12.5,bg:last?WHITE:PILLG,c:NAVY,h:26,px:12,anchor:'c'});
    E(g,s[i][0],cx,y+26+22+42,84);T(g,s[i][1],cx,y+26+22+84+16,{f:F.b,size:19,c:last?WHITE:NAVY,just:'c',w:cw-20});center(g,y,ch);
    if(i%per<per-1)arrowDot(P,x+cw+gx/2,y+ch/2,14,RED);}
  for(i=0;i<lab.length;i++)pill(P,'En simultáneo',lab[i][0],lab[i][1],{f:F.b,size:13,bg:RED,c:WHITE,h:30,px:14,anchor:'c'});}

function node(P,x,y,w,h,c,i){card(P,x,y,w,h,Math.min(28,h/2));var g=P.groupItems.add(),tx=x+80,tw=w-100;
  var t=T(g,c[1],tx,y,{f:F.s,size:17.5,c:NAVY,w:tw,lead:21}),bh=t.height;
  if(c[2]){var u=T(g,c[2],tx,y+bh+6,{f:F.r,size:13.5,c:GRAY,w:tw,lead:17});bh+=6+u.height;}
  circ(g,x+42,y+bh/2,26,TINT[i%2]);E(g,c[0],x+42,y+bh/2,34);center(g,y,h);
  circ(P,x+14,y+8,13,NAVY,WHITE,2.5);var nt=T(P,String(i+1),x+14,0,{f:F.b,size:12.5,c:WHITE,just:'c'});vc(nt,y+8);}
function cycle(P,d,T0,B0){var ns=d.nodes,n=ns.length,H=B0-T0,cy=T0+H/2,rx=d.rx||388,ry=Math.min(210,(H-100)/2),a0=d.a0,nw=d.nw||296,nh=d.nh||84,i,K=Math.PI/180;
  var el=ell(P,600,cy,rx,ry,null,DOT,3);el.strokeCap=StrokeCap.ROUNDENDCAP;el.strokeDashes=[0.5,9];
  for(i=0;i<n;i++){var am=(a0+360/n*(i+0.5))*K,ux=-rx*Math.sin(am),uy=ry*Math.cos(am),l=Math.sqrt(ux*ux+uy*uy);
    tri(P,600+rx*Math.cos(am),cy+ry*Math.sin(am),ux/l,uy/l,10,RED);}
  badge(P,600,cy-(d.cs?26:10),d.R||100,d.ce,d.cl,d.cs);
  for(i=0;i<n;i++){var a=(a0+360/n*i)*K;node(P,600+rx*Math.cos(a)-nw/2,cy+ry*Math.sin(a)-nh/2,nw,nh,ns[i],i);}}

function route(P,d,T0,B0){var rs=d.rows,n=rs.length,gap=16,H=B0-T0,rh=Math.min((H-(n-1)*gap)/n,d.maxH||128),y=T0+(H-n*rh-(n-1)*gap)/2;
  for(var i=0;i<n;i++){var r=rs[i];card(P,50,y,1100,rh,26);rr(P,58,y+8,330,rh-16,20,NAVY);circ(P,104,y+rh/2,27,WHITE);E(P,r.e,104,y+rh/2,36);
    var t=T(P,r.t,148,0,{f:F.b,size:19,c:WHITE,w:225,lead:22});vc(t,y+rh/2);
    var cx=438,cwid=r.to.length>1?200:300;
    for(var j=0;j<r.to.length;j++){arrowDot(P,cx-25,y+rh/2,14,RED);rr(P,cx,y+14,cwid,rh-28,18,SOFT);
      E(P,r.to[j][0],cx+36,y+rh/2,40);var u=T(P,r.to[j][1],cx+66,0,{f:F.s,size:15.5,c:INK,w:cwid-80,lead:19});vc(u,y+rh/2);cx+=cwid+46;}
    y+=rh+gap;}}

// ---------- contenido (reemplazar DATA por el contenido nuevo; ver SKILL.md) ----------
var DATA=[
{name:'01 Tu experiencia',type:'hub',title:'Tu experiencia de formación estudiando a distancia',ts:34,ce:'graduation-cap',cl:'Estudiante FEaD',cs:'Protagonista de su aprendizaje',cards:[
 {e:'books',t:'Aprende',items:[['open-book','Asignaturas'],['laptop','Aula Virtual'],['classical-building','Biblioteca Virtual'],['memo','Evaluaciones']]},
 {e:'globe-with-meridians',t:'Conecta',items:[['teacher','Docentes'],['technologist','Tutores'],['card-index-dividers','Coordinación Académica'],['busts-in-silhouette','Comunidad universitaria']]},
 {e:'raising-hands',t:'Participa',items:[['speech-balloon','Foros'],['handshake','Actividades colaborativas'],['party-popper','Vida universitaria'],['ballot-box-with-ballot','Representación estudiantil']]},
 {e:'rocket',t:'Avanza',items:[['microscope','Investigación'],['seedling','Extensión'],['airplane','Movilidad'],['page-facing-up','TFG / Tesis'],['scroll','Titulación']]}],
 foot:'Estudiar a distancia no significa estudiar solo. Significa formar parte de una comunidad universitaria que te acompaña en cada etapa de tu trayectoria académica.',fe:'blue-heart'},
{name:'02 Que hace diferente a la EaD',type:'grid',card:'v',cols:3,maxH:300,title:'¿Qué hace diferente a la Educación a distancia?',cards:[
 {e:'globe-showing-americas',t:'Acceso permanente',d:'Recursos educativos digitales disponibles en todo momento.'},
 {e:'spiral-calendar',t:'Flexibilidad',d:'Organización de horarios según las necesidades del estudiante.'},
 {e:'heart-hands',t:'Acompañamiento',d:'Apoyo académico durante toda la trayectoria formativa.'},
 {e:'speech-balloon',t:'Interacción',d:'Comunicación constante mediante distintos canales.'},
 {e:'mobile-phone',t:'Competencias digitales',d:'Desarrollo de habilidades digitales y aprendizaje autónomo.'},
 {e:'chart-increasing',t:'Evaluación continua',d:'Orientada a la mejora permanente del aprendizaje.'}]},
{name:'03 Principios de la modalidad',type:'grid',card:'v',cols:3,maxH:300,title:'Principios de la Modalidad',cards:[
 {e:'alarm-clock',t:'Flexibilidad',d:'Organiza tus actividades según tus propias prioridades y ritmos.'},
 {e:'brain',t:'Aprendizaje autónomo',d:'Participás activamente en la construcción de tu conocimiento.'},
 {e:'speaking-head',t:'Interacción',d:'Comunicación permanente con docentes, tutores y compañeros.'},
 {e:'people-hugging',t:'Inclusión',d:'Acceso a la formación sin importar tu contexto.'},
 {e:'robot',t:'Innovación',d:'Recursos tecnológicos y metodologías activas.'},
 {e:'trophy',t:'Calidad educativa',d:'Mejora continua y logro de resultados de aprendizaje.'}]},
{name:'04 Modelo educativo',type:'hub',title:'Modelo educativo de la FEaD',ce:'student',cl:'Sos el protagonista',maxH:190,cards:[
 {e:'briefcase',t:'Competencias profesionales',d:'Desarrollo de habilidades y conocimientos para el mundo laboral.'},
 {e:'desktop-computer',t:'Tecnologías digitales',d:'Integración de herramientas modernas en el aprendizaje.'},
 {e:'light-bulb',t:'Innovación educativa',d:'Nuevas metodologías y enfoques pedagógicos.'},
 {e:'handshake',t:'Acompañamiento permanente',d:'Apoyo continuo de tutores y docentes.'},
 {e:'clipboard',t:'Evaluación para el aprendizaje',d:'Medición del progreso para mejorar el rendimiento.'},
 {e:'counterclockwise-arrows-button',t:'Mejora continua',d:'Proceso constante de retroalimentación y optimización.'}]},
{name:'05 Perfil del estudiante',type:'grid',card:'s',cols:6,gap:14,title:'Perfil del Estudiante EaD',cards:[
 {t:'Autonomía',subs:[['compass','Autogestión de aprendizaje'],['fire','Motivación intrínseca']]},
 {t:'Organización',subs:[['hourglass-not-done','Gestión del tiempo'],['check-mark-button','Planificación de tareas']]},
 {t:'Comunicación',subs:[['speech-balloon','Asertividad en línea'],['open-book','Comprensión lectora']]},
 {t:'Competencias digitales',subs:[['computer-mouse','Manejo de plataformas'],['locked','Seguridad y privacidad']]},
 {t:'Trabajo colaborativo',subs:[['woman-technologist','Trabajo en equipo virtual'],['light-bulb','Intercambio de ideas']]},
 {t:'Ética académica',subs:[['magnifying-glass-tilted-left','Integridad en la investigación'],['writing-hand','Respeto a la autoría']]}],
 foot:'Estas competencias son fundamentales para el éxito en la Educación a Distancia (EaD).',fe:'direct-hit'},
{name:'06 Recorrido del estudiante',type:'steps',title:'Recorrido del estudiante EaD',runs:[[3,4],[5,6]],steps:[
 ['identification-card','Admisión'],['receipt','Matrícula'],['compass','Inducción'],['books','Asignaturas'],['memo','Evaluaciones'],
 ['microscope','Investigación'],['seedling','Extensión'],['briefcase','Pasantías'],['bookmark-tabs','TFG / Tesis'],['graduation-cap','Titulación']],
 foot:'Una trayectoria formativa lineal que acompaña al estudiante desde el ingreso hasta la obtención del título, con actividades simultáneas clave.',fe:'chequered-flag'},
{name:'07 Componentes de una asignatura',type:'grid',card:'s',cols:6,gap:14,title:'Componentes de una Asignatura',cards:[
 {t:'Objetivos de aprendizaje',subs:[['direct-hit','Comprender conceptos clave'],['hammer-and-wrench','Aplicar conocimientos']]},
 {t:'Unidades o módulos',subs:[['puzzle-piece','Estructura temática'],['ladder','Secuencia de estudio']]},
 {t:'Recursos de aprendizaje',subs:[['headphone','Materiales multimedia'],['open-file-folder','Acceso a contenidos']]},
 {t:'Actividades académicas',subs:[['person-raising-hand','Participación activa'],['handshake','Trabajo colaborativo']]},
 {t:'Evaluaciones',subs:[['memo','Pruebas de conocimiento'],['speech-balloon','Retroalimentación detallada']]},
 {t:'Calendario académico',subs:[['calendar','Fechas clave'],['alarm-clock','Seguimiento de plazos']]}]},
{name:'08 Ruta de organizacion semanal',type:'cols',title:'Ruta de organización semanal',sub:'Planifica tu semana y mantén una participación constante.',cols:[
 {t:'Tu semana',e:'spiral-calendar',c:'navy',wt:1.12,rows:[['clipboard','Lunes','Revisión de avisos y planificación semanal'],['open-book','Martes','Lectura de materiales y revisión de contenidos'],
  ['speech-balloon','Miércoles','Participación en foros y actividades colaborativas'],['pencil','Jueves','Desarrollo de tareas y ejercicios prácticos'],
  ['thinking-face','Viernes','Consulta de dudas con docentes o tutores'],['outbox-tray','Sábado','Finalización y entrega de actividades'],
  ['repeat-button','Domingo','Repaso de contenidos y organización de la próxima semana']]},
 {t:'Recomendaciones para organizarte mejor',e:'light-bulb',c:'red',wt:0.88,rows:[['alarm-clock','Establece horarios regulares de estudio.'],['calendar','Revisa periódicamente el calendario académico.'],
  ['pushpin','Prioriza actividades según sus fechas de entrega.'],['potted-plant','Mantén un espacio adecuado para el estudio.'],
  ['bell-with-slash','Evita interrupciones durante los momentos de aprendizaje.'],['notebook','Registra tareas y fechas importantes en una agenda.']]}],
 foot:'Cada estudiante podrá adaptar esta planificación a sus circunstancias particulares, procurando mantener una participación constante durante todo el periodo académico.',fe:'student'},
{name:'09 Las 5 claves del exito',type:'hub',title:'Las 5 claves del éxito en la EaD',ce:'trophy',cl:'Éxito académico',cs:'Aprende con organización, compromiso y responsabilidad.',maxH:150,cards:[
 {e:'spiral-calendar',t:'Planificar',d:'Organiza tus actividades y fechas importantes.'},
 {e:'person-raising-hand',t:'Participar activamente',d:'Interactúa en clases, foros y actividades.'},
 {e:'balance-scale',t:'Integridad académica',d:'Actúa con honestidad y responsabilidad.'},
 {e:'stopwatch',t:'Organizar el tiempo',d:'Distribuye tus horas de estudio de forma equilibrada.'},
 {e:'ring-buoy',t:'Solicitar apoyo a tiempo',d:'Consulta a docentes y coordinadores cuando lo necesites.'}],
 foot:'La constancia y la organización son fundamentales para alcanzar tus metas académicas.',fe:'light-bulb'},
{name:'10 Red de apoyo',type:'hub',title:'Red de apoyo al estudiante',ce:'student',cl:'Estudiante',maxH:104,cw:340,cards:[
 {e:'teacher',t:'Docente'},{e:'technologist',t:'Tutor'},{e:'books',t:'Biblioteca'},{e:'card-index-dividers',t:'Coordinación académica'},
 {e:'headphone',t:'Soporte tecnológico'},{e:'seedling',t:'Extensión'},{e:'microscope',t:'Investigación'},{e:'person-in-lotus-position',t:'Bienestar estudiantil'}],
 foot:'El estudiante cuenta con acompañamiento académico, administrativo y tecnológico durante toda su formación.',fe:'heart-hands'},
{name:'11 Derechos y responsabilidades',type:'cols',title:'Equilibrio entre derechos y responsabilidades',sub:'Tu experiencia académica se construye con equilibrio y compromiso.',link:'balance-scale',cols:[
 {t:'Derechos',e:'shield',c:'navy',rows:[['teacher','Recibir acompañamiento','Tienes derecho a recibir guía y orientación académica.'],['books','Acceder a recursos','Tienes derecho a recursos y materiales para tu aprendizaje.'],
  ['speech-balloon','Recibir retroalimentación','Tienes derecho a recibir retroalimentación oportuna sobre tu desempeño.'],['classical-building','Recibir atención institucional','Tienes derecho a recibir atención eficiente y respetuosa.']]},
 {t:'Responsabilidades',e:'flexed-biceps',c:'red',rows:[['person-raising-hand','Participar activamente','Participa en clases, foros y actividades propuestas.'],['alarm-clock','Cumplir plazos','Entrega tus actividades en los tiempos establecidos.'],
  ['check-mark-button','Mantener integridad académica','Realiza tus trabajos con honestidad y respeta las normas académicas.'],['red-heart','Respetar la comunidad','Trata con respeto a todos los actores de la comunidad académica.']]}],
 fl:'Recuerda:',foot:'Los derechos y las responsabilidades contribuyen a una convivencia académica basada en el respeto, la participación y la calidad educativa.',fe:'light-bulb'},
{name:'12 Canales oficiales',type:'grid',card:'h',cols:3,gap:16,title:'Canales oficiales de comunicación',sub:'Utilizá siempre los medios institucionales para garantizar una atención adecuada.',cards:[
 {e:'e-mail',t:'Correo Institucional',q:'¿Recibiste una comunicación oficial?',b:['Comunicaciones institucionales','Avisos importantes']},
 {e:'laptop',t:'Aula Virtual',q:'¿Necesitás acceder a materiales o actividades?',b:['Materiales de estudio','Actividades y evaluaciones']},
 {e:'headphone',t:'Mesa de Ayuda',q:'¿Tenés problemas técnicos?',b:['Soporte técnico','Problemas de acceso']},
 {e:'teacher',t:'Tutoría y Acompañamiento Académico',q:'¿Necesitás guía académica?',b:['Orientación académica','Seguimiento del progreso']},
 {e:'person-raising-hand',t:'Centro de Atención al Estudiante',q:'¿Consultas generales o de gestión?',b:['Información general','Gestiones administrativas']},
 {e:'open-file-folder',t:'Secretaría Académica',q:'¿Necesitás realizar un trámite académico?',b:['Certificados','Trámites académicos']}],
 strip:{t:'NO SON CANALES OFICIALES',items:[['mobile-phone','WhatsApp personal'],['selfie','Redes sociales personales'],['envelope','Correos no institucionales']]},stripH:84,
 fl:'Recuerda:',foot:'Las consultas realizadas por canales oficiales permiten trazabilidad, seguimiento y una atención más eficiente.',fe:'light-bulb'},
{name:'13 Normas de convivencia digital',type:'cols',title:'Normas de convivencia en la comunicación digital',sub:'La modalidad de Educación a Distancia requiere mantener comportamientos adecuados en los diferentes espacios virtuales de interacción.',cols:[
 {t:'Se espera que los estudiantes:',e:'check-mark-button',c:'navy',mark:'check-mark-button',rows:[['left-speech-bubble','Utilicen un lenguaje respetuoso.'],['thumbs-up','Participen de manera constructiva.'],
  ['ear','Respeten las opiniones y puntos de vista de los demás.'],['glowing-star','Contribuyan al desarrollo de un ambiente académico positivo.'],['handshake','Mantengan una actitud ética y profesional en sus interacciones.']]},
 {t:'Asimismo, se recomienda evitar:',e:'cross-mark',c:'red',mark:'cross-mark',rows:[['face-with-symbols-on-mouth','Mensajes ofensivos o irrespetuosos.'],['prohibited','Comentarios discriminatorios.'],
  ['newspaper','Difusión de información falsa o no verificada.'],['no-mobile-phones','Publicación de contenido ajeno al propósito académico de los espacios institucionales.'],['locked-with-key','Compartir información confidencial de terceros sin autorización.']]}]},
{name:'14 Ciclo de evaluacion',type:'cycle',title:'Ciclo de evaluación del aprendizaje',a0:-120,ce:'repeat-button',cl:'Evaluación continua',nh:78,nodes:[
 ['memo','Actividad'],['speech-balloon','Retroalimentación'],['bookmark-tabs','Nueva evidencia'],['control-knobs','Ajuste de estrategias'],['direct-hit','Mejoras identificadas'],['sports-medal','Logro de competencias']],
 foot:'La evaluación es un proceso continuo orientado al aprendizaje.',fe:'light-bulb'},
{name:'15 Uso responsable de la IA',type:'cols',title:'Uso responsable de la Inteligencia Artificial',rt:15.5,rd:13.5,cols:[
 {t:'Usos adecuados',e:'check-mark-button',c:'navy',rows:[['light-bulb','Generar ideas','Obtener inspiración y nuevas perspectivas.'],['card-index-dividers','Organizar información','Clasificar, resumir y estructurar contenidos.'],
  ['open-book','Comprender conceptos','Obtener explicaciones y aclarar dudas.'],['pencil','Mejorar producciones propias','Revisar redacción, estructura y claridad.'],['magnifying-glass-tilted-left','Explorar conceptos','Investigar y ampliar tu conocimiento.']]},
 {t:'Usos inadecuados',e:'cross-mark',c:'red',rows:[['clipboard','Copiar textos sin citar','Presentar contenido ajeno como propio.'],['outbox-tray','Presentar contenido ajeno como propio','Entregar trabajos de IA sin elaboración personal.'],
  ['see-no-evil-monkey','Omitir referencias','Usar información sin indicar las fuentes.'],['performing-arts','Suplantar la autoría','Hacer pasar contenido generado por IA como propio.'],['warning','Usar IA para fraude académico','Utilizar IA para engañar en evaluaciones o tareas.']]},
 {t:'Buenas prácticas',e:'star',c:'blue',rows:[['magnifying-glass-tilted-right','Verificar información','Comprobar la precisión y confiabilidad de los datos.'],['books','Citar fuentes','Reconocer las fuentes utilizadas para dar crédito.'],
  ['writing-hand','Mantener autoría','La IA es una herramienta; tu trabajo es tuyo.'],['balance-scale','Respetar la integridad académica','Actuar con honestidad, ética y responsabilidad.']]}],
 foot:'La IA es una herramienta de apoyo; la responsabilidad académica siempre es del estudiante.',fe:'graduation-cap'},
{name:'16 Ruta de resolucion de problemas',type:'route',title:'Ruta rápida de resolución de problemas',sub:'¿Tienes una dificultad? Sigue la ruta adecuada.',rows:[
 {e:'books',t:'Problema académico',to:[['teacher','Docente'],['technologist','Tutor'],['card-index-dividers','Coordinación']]},
 {e:'laptop',t:'Problema tecnológico',to:[['headphone','Mesa de Ayuda']]},
 {e:'file-folder',t:'Gestión de documentos',to:[['office-building','Secretaría Académica']]},
 {e:'receipt',t:'Problema administrativo',to:[['person-raising-hand','Centro de Atención al Estudiante (CAE)']]}],
 foot:'Identificar correctamente el tipo de problema permite una atención más rápida y efectiva.',fe:'light-bulb'},
{name:'17 Normativa EaD',type:'cols',title:'Normativa de la modalidad de Educación a Distancia',sub:'Un marco normativo específico orienta la gestión académica, administrativa y tecnológica de la modalidad EaD.',link:'arrow',vcenter:true,rt:15.5,cols:[
 {t:'Marco institucional',e:'classical-building',c:'navy',wt:0.8,rows:[['scroll','Estatuto y normativa institucional.']]},
 {t:'Reglamentos que regulan la trayectoria académica',e:'blue-book',c:'blue',wt:1.1,ts:17,rows:[['card-index-dividers','Reglamento General Académico Administrativo.'],['memo','Reglamento Específico de Evaluación de Grado.'],
  ['graduation-cap','Reglamento de Trabajo Final de Grado.'],['briefcase','Reglamento de Pasantías Supervisadas.']]},
 {t:'Normativa específica para la experiencia estudiantil en EaD',e:'laptop',c:'navy',wt:1.1,ts:17,rows:[['identification-card','Reglamento de Admisión.'],['warning','Reglamento de Faltas.'],
  ['wheelchair-symbol','Reglamento de Accesibilidad y Ajustes Razonables.'],['globe-with-meridians','Reglamento Específico del Campus Virtual.']]}],
 foot:'La normativa de la FEaD integra las disposiciones institucionales con los reglamentos que orientan la trayectoria académica y la experiencia estudiantil en la modalidad de educación a distancia.',fe:'direct-hit'},
{name:'18 Participacion en la calidad',type:'cycle',title:'Participación del estudiante en la calidad',sub:'El ciclo de mejora continua institucional',a0:-90,ce:'counterclockwise-arrows-button',cl:'Mejora continua',
 cs:'La participación estudiantil impulsa el mejoramiento institucional.',nh:92,nodes:[
 ['person-raising-hand','Opinión del estudiante'],['clipboard','Encuestas','Recopilamos tu opinión.'],['bar-chart','Análisis institucional','Analizamos los resultados para identificar oportunidades.'],
 ['pencil','Acciones de mejora','Diseñamos acciones para resolver lo identificado.'],['chart-increasing','Evaluación de resultados'],['rocket','Implementación','Ponemos en marcha las acciones de mejora.']],
 foot:'Tu participación ayuda a mejorar continuamente la calidad de la experiencia educativa.',fe:'light-bulb'},
{name:'19 Felicitaciones',type:'hub',title:'¡Felicitaciones por dar un paso más en tu camino de formación universitaria!',ts:32,sub:'Facultad de Educación a Distancia de la Universidad Central del Paraguay',
 ce:'partying-face',cl:'¡Éxitos!',cs:'Acompañándote en tu trayectoria académica',R:104,cards:[
 {e:'brain',t:'Consolida y aplica',d:'Tus conocimientos adquiridos son la base de tu éxito.'},
 {e:'link',t:'Sigue usando recursos y servicios',d:'Tu conexión con la universidad continúa.'},
 {e:'busts-in-silhouette',t:'Participa en la comunidad',d:'Únete a la Red de Conexión con FEaD.'},
 {e:'school',t:'Continúa tu vida universitaria',d:'Nuevas oportunidades para crecer.'},
 {e:'chart-increasing',t:'Mantén tu crecimiento profesional',d:'Aplica tu integridad y mejora continua.'},
 {e:'sports-medal',t:'Honra tu compromiso',d:'Ejerce con integridad y aprendizaje.'},
 {e:'trophy',t:'Vive tu éxito personal y profesional',d:'Logra tus metas como egresado.'}],
 foot:'Esperamos que este manual sea una guía útil durante tu trayectoria académica. ¡Te deseamos muchos éxitos en esta etapa de aprendizaje y crecimiento profesional!',fe:'four-leaf-clover'}
];

// ---------- construcción ----------
var BUILD={hub:hub,grid:grid,cols:columns,steps:steps,cycle:cycle,route:route};
N=DATA.length;
var doc=app.documents.add(DocumentColorSpace.RGB,1200,900,N,DocumentArtboardLayout.GridByRow,100,4);
try{var ro=doc.rasterEffectSettings;ro.resolution=150;doc.rasterEffectSettings=ro;}catch(e){ERR.push('res '+e);}
GR=doc.gradients.add();GR.name='FEaD Rojo-Naranja';GR.type=GradientType.LINEAR;GR.gradientStops[0].color=RED;GR.gradientStops[1].color=ORG;
var tmpL=doc.layers[0];tmpL.name='tmp';TMP=tmpL.textFrames.add();TMP.contents='x';
for(var i=0;i<N;i++){var d=DATA[i],ab=doc.artboards[i];ab.name=d.name;var r=ab.artboardRect;AX=r[0];AY=r[1];
  var L=doc.layers.add();L.name=d.name;
  try{rr(L,0,0,1200,900,0,BG);var top=header(L,d,i),bot=footer(L,d);BUILD[d.type](L,d,top,bot);}catch(e){ERR.push(d.name+': '+e+' @'+e.line);}}
TMP.remove();tmpL.remove();
doc.saveAs(new File(DIR+OUT));
'OK '+N+' | '+ERR.join(' || ');
