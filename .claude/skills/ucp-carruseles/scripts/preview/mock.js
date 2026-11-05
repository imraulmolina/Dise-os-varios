// Mock mínimo del DOM de Illustrator: ejecuta el JSX en Chromium y dibuja cada mesa como SVG (Montserrat en lugar de Gotham).
(function(){
const FW={'Gotham-Bold':700,'Gotham-Medium':500,'Gotham-Book':400};
const ctx=document.createElement('canvas').getContext('2d');
function mrun(s,w,size,tr){ctx.font=w+' '+size+'px M';return ctx.measureText(s).width+(tr||0)/1000*size*s.length;}
const ASC=0.93,BOX=1.2;
Object.assign(window,{UserInteractionLevel:{DONTDISPLAYALERTS:0,DISPLAYALERTS:1},StrokeCap:{ROUNDENDCAP:1},StrokeJoin:{ROUNDENDJOIN:1},
  PointType:{SMOOTH:1},Justification:{LEFT:'l',CENTER:'c',RIGHT:'r'},ZOrderMethod:{SENDBACKWARD:'sb',BRINGTOFRONT:'bf',SENDTOBACK:'sk',BRINGFORWARD:'bw'},
  DocumentColorSpace:{RGB:1},DocumentArtboardLayout:{GridByRow:1},GradientType:{LINEAR:1}});
window.RGBColor=function(){this.red=0;this.green=0;this.blue=0;};
window.GradientColor=function(){this.gradient=null;};
window.alert=function(m){window.__alert=m;};
const WR=new Map();window.__WR=WR;
function MFile(p){this.p=String(p);this.encoding='';}
MFile.prototype={get exists(){return window.EXIST.has(this.p)||WR.has(this.p);},open(){},write(s){WR.set(this.p,s);},close(){},get fullName(){return this.p;},get fsName(){return this.p;}};
function MFolder(p){this.p=String(p);}
MFolder.prototype={get exists(){return true;},create(){},get fullName(){return this.p;},get fsName(){return this.p;},toString(){return this.p;}};
MFolder.temp='/tmp';window.File=MFile;window.Folder=MFolder;

class Item{constructor(){this.parent=null;this.opacity=100;this.blur=0;}
  zOrder(m){const a=this.parent.children,i=a.indexOf(this);a.splice(i,1);
    if(m==='sb')a.splice(Math.max(0,i-1),0,this);else if(m==='bf')a.push(this);else if(m==='sk')a.unshift(this);else a.splice(Math.min(a.length,i+1),0,this);}
  remove(){const a=this.parent.children;a.splice(a.indexOf(this),1);}
  applyEffect(x){const m=/blur ([\d.]+)/.exec(x);if(m)this.blur=+m[1];}}
class Cont extends Item{constructor(){super();this.children=[];const s=this;
  this.pathItems={roundedRectangle:(t,l,w,h,rx)=>s._a(new Shp('rect',l,t,w,h,rx)),ellipse:(t,l,w,h)=>s._a(new Shp('ell',l,t,w,h,0)),add:()=>s._a(new Pth())};
  this.textFrames={add:()=>s._a(new Txt())};this.placedItems={add:()=>s._a(new Plc())};this.groupItems={add:()=>s._a(new Grp())};}
  _a(it){it.parent=this;this.children.push(it);return it;}}
function ub(items){let l=1e9,t=-1e9,r=-1e9,b=1e9;items.forEach(c=>{const g=c.geometricBounds;l=Math.min(l,g[0]);t=Math.max(t,g[1]);r=Math.max(r,g[2]);b=Math.min(b,g[3]);});return [l,t,r,b];}
class Grp extends Cont{get geometricBounds(){return ub(this.children);}translate(dx,dy){this.children.forEach(c=>c.translate(dx,dy));}}
class Lyr extends Cont{}
class Shp extends Item{constructor(k,l,t,w,h,r){super();Object.assign(this,{k,l,t,w,h,r});}
  get geometricBounds(){return [this.l,this.t,this.l+this.w,this.t-this.h];}translate(dx,dy){this.l+=dx;this.t+=dy;}}
class Pth extends Item{constructor(){super();this.P=[];this.closed=false;const s=this;this.pathPoints={add(){const p={};s.P.push(p);return p;}};}
  setEntirePath(a){this.P=a.map(q=>({anchor:q,leftDirection:q,rightDirection:q}));}
  get geometricBounds(){const xs=this.P.map(p=>p.anchor[0]),ys=this.P.map(p=>p.anchor[1]);return [Math.min(...xs),Math.max(...ys),Math.max(...xs),Math.min(...ys)];}
  translate(dx,dy){this.P.forEach(p=>['anchor','leftDirection','rightDirection'].forEach(k=>{p[k]=[p[k][0]+dx,p[k][1]+dy];}));}}
class Txt extends Item{constructor(){super();this._c='';this.base={size:12,tracking:0};this.ov=[];this.just='l';this.l=0;this.t=0;const s=this;
  this.textRange={characterAttributes:s.base,paragraphAttributes:{set justification(v){s.just=v;},get justification(){return s.just;}},
    get characters(){const a=[];for(let i=0;i<s._c.length;i++)a.push({characterAttributes:(s.ov[i]=s.ov[i]||{})});return a;}};}
  set contents(v){this._c=String(v).replace(/\n/g,'\r');this.ov=[];} get contents(){return this._c;}
  lead(){return this.base.autoLeading===false?this.base.leading:this.base.size*1.2;}
  runs(){const out=[];let i=0;for(const ln of this._c.split('\r')){const rs=[];for(let j=0;j<ln.length;j++,i++){const o=this.ov[i]||{},
      st={w:FW[(o.textFont||this.base.textFont).name],fill:o.fillColor||this.base.fillColor};const z=rs[rs.length-1];
      if(z&&z.st.w===st.w&&z.st.fill===st.fill)z.s+=ln[j];else rs.push({s:ln[j],st});}out.push(rs);i++;}return out;}
  lw(rs){return rs.reduce((a,r)=>a+mrun(r.s,r.st.w,this.base.size,this.base.tracking),0);}
  get width(){return Math.max(0,...this.runs().map(rs=>this.lw(rs)));}
  get height(){return (this._c.split('\r').length-1)*this.lead()+BOX*this.base.size;}
  get top(){return this.t;} set top(v){this.t=v;} get left(){return this.l;} set left(v){this.l=v;}
  get geometricBounds(){return [this.l,this.t,this.l+this.width,this.t-this.height];}translate(dx,dy){this.l+=dx;this.t+=dy;}}
class Plc extends Item{constructor(){super();this.file=null;this.width=0;this.height=0;this.l=0;this.t=0;}
  get left(){return this.l;}set left(v){this.l=v;}get top(){return this.t;}set top(v){this.t=v;}embed(){}rotate(a){this.rot=(this.rot||0)+a;}
  get geometricBounds(){return [this.l,this.t,this.l+this.width,this.t-this.height];}translate(dx,dy){this.l+=dx;this.t+=dy;}}
class Doc{constructor(w,h,n,sp,cols){this.artboards=[];for(let i=0;i<n;i++){const c=i%cols,r=Math.floor(i/cols),l=c*(w+sp),t=-r*(h+sp);
    this.artboards.push({name:'',artboardRect:[l,t,l+w,t-h]});}
  const s=this;this.layers=[];this.layers.add=function(){const L=new Lyr();L.parent={children:s.layers};s.layers.unshift(L);return L;};this.layers.add();
  this.rasterEffectSettings={resolution:72};this.gradients={add(){return {gradientStops:[{},{}]};}};}
  saveAs(f){this.saved=f.p;}}
window.app={userInteractionLevel:0,textFonts:{getByName(n){if(!FW[n])throw new Error('font '+n);return {name:n};}},
  documents:{add(cs,w,h,n,lay,sp,cols){return window.__doc=new Doc(w,h,n,sp,cols);}}};

// ---------- render ----------
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
const col=c=>!c?'none':(c.gradient?'url(#grad)':'rgb('+c.red+','+c.green+','+c.blue+')');
function fx(it){let a='';if(it.opacity!==100)a+=' opacity="'+it.opacity/100+'"';if(it.blur)a+=' filter="url(#b'+it.blur+')"';return a;}
function pa(it){let a=' fill="'+(it.filled?col(it.fillColor):'none')+'"';
  if(it.stroked){a+=' stroke="'+col(it.strokeColor)+'" stroke-width="'+it.strokeWidth+'"';if(it.strokeDashes)a+=' stroke-dasharray="'+it.strokeDashes.join(' ')+'"';
    if(it.strokeCap)a+=' stroke-linecap="round" stroke-linejoin="round"';}return a;}
function href(p){if(WR.has(p))return 'data:image/png;base64,'+btoa(WR.get(p));return window.EMLOCAL+p.split('/').pop();}
function svgOf(it,L,T){const X=x=>x-L,Y=y=>T-y;
  if(it instanceof Shp){if(it.k==='rect')return '<rect x="'+X(it.l)+'" y="'+Y(it.t)+'" width="'+it.w+'" height="'+it.h+'" rx="'+Math.min(it.r,it.w/2,it.h/2)+'"'+pa(it)+fx(it)+'/>';
    return '<ellipse cx="'+X(it.l+it.w/2)+'" cy="'+Y(it.t-it.h/2)+'" rx="'+it.w/2+'" ry="'+it.h/2+'"'+pa(it)+fx(it)+'/>';}
  if(it instanceof Pth){const P=it.P,pt=q=>X(q[0])+' '+Y(q[1]);let d='M'+pt(P[0].anchor);
    for(let i=1;i<P.length;i++)d+=' C'+pt(P[i-1].rightDirection)+' '+pt(P[i].leftDirection)+' '+pt(P[i].anchor);if(it.closed)d+=' Z';
    return '<path d="'+d+'"'+pa(it)+fx(it)+'/>';}
  if(it instanceof Plc)return '<image href="'+href(it.file.p)+'" x="'+X(it.l)+'" y="'+Y(it.t)+'" width="'+it.width+'" height="'+it.height+'" preserveAspectRatio="none"'+(it.rot?' transform="rotate('+(-it.rot)+' '+X(it.l+it.width/2)+' '+Y(it.t-it.height/2)+')"':'')+fx(it)+'/>';
  if(it instanceof Txt){const W=it.width,sz=it.base.size,ls=(it.base.tracking||0)/1000*sz;let o='';
    it.runs().forEach((rs,i)=>{const lw=it.lw(rs),x=X(it.l)+(it.just==='c'?(W-lw)/2:(it.just==='r'?W-lw:0)),y=Y(it.t)+ASC*sz+i*it.lead();
      o+='<text x="'+x+'" y="'+y+'" font-family="M" font-size="'+sz+'" style="letter-spacing:'+ls+'px;white-space:pre">'+
        rs.map(r=>'<tspan font-weight="'+r.st.w+'" fill="'+col(r.st.fill)+'">'+esc(r.s)+'</tspan>').join('')+'</text>';});return o;}
  return '';}
function walk(c,els,L,T){c.children.forEach(it=>{if(it instanceof Grp)walk(it,els,L,T);else els.push(svgOf(it,L,T));});}
window.__render=function(doc){return doc.artboards.map((ab,i)=>{const [L,T,R,B]=ab.artboardRect,W=R-L,H=T-B,els=[],ly=doc.layers.find(l=>l.name===ab.name);if(ly)walk(ly,els,L,T);
  return '<svg xmlns="http://www.w3.org/2000/svg" id="ab'+i+'" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'"><defs>'+
    '<linearGradient id="grad" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#E31B2D"/><stop offset="1" stop-color="#FF8A3D"/></linearGradient>'+
    [10,16,18].map(b=>'<filter id="b'+b+'" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="'+b/2+'"/></filter>').join('')+
    '</defs>'+els.join('')+'</svg>';});};
})();
