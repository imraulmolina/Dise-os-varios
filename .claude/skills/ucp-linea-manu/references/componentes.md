# Componentes de la Línea Manu (API)

Coordenadas de mesa: el origen está arriba a la izquierda y la y crece hacia abajo. `X()` e `Y()` las pasan a Illustrator. `P` es la capa o el grupo donde se dibuja. Todo es ES3. También existen las primitivas `rr`, `circ`, `poly`, `line`, `arc`, `T`, `vc`, `gc`, `wrap` y `mw`, iguales a las de ucp-carruseles.

| Función | Qué hace |
|---|---|
| `bgcn(P,{sh,rx,ry,r0,dr,rw,sw})` | Fondo BG, anillos recortados a la mesa (centro `rx,ry`, radio inicial `r0`, paso `dr`, grosor `rw`) y franja STR de ancho `sw` y alto `sh` |
| `header(P,y,apilado,escala)` | Logo UCP y sello CENTRAL Next centrados. Apilado (portada) o en fila con separador. Devuelve la y inferior |
| `logoUCP(P,x,y,h)` / `nextLock(P,x,y,h)` | Logo (archivo `LOGO` o versión dibujada) / sello (archivo `NEXT_LOGO` o dibujado). Devuelven el ancho |
| `ct(P,s,x,y,{size,w,just,ld,tr})` | Título Black en mayúsculas con colores por tramo: `^azul^`, `~rojo~` y el resto en INK. `\n` fuerza un corte |
| `spc(P,s,x,y,{size,c,f,tr,w})` | Texto espaciado en mayúsculas |
| `slab(P,s,x,y,w,color,sz)` | Rótulo de sección Bold con tracking 300 y línea hasta `x+w`. Devuelve la y inferior |
| `txt(P,s,x,y,w,sz,{f,c,just,lead})` | Texto Book INK con `**negrita**` |
| `cardc(P,x,y,w,h,fill,r)` | Tarjeta gris redondeada |
| `cbox(P,x,y,w,h)` | Caja blanca con borde rojo |
| `ico(P,nombre,cx,cy,lado,color)` / `ic(P,cx,cy,r,color,nombre)` | Ícono plano como trazado compuesto / círculo de color con el ícono blanco |
| `rowc(P,x,y,w,h,color,ícono,texto,{lab,ls,ts,tf,d,ds,r,f})` | Fila: ícono, separador y texto. `lab` agrega un rótulo espaciado arriba y `d` una descripción debajo |
| `infoc(P,x,y,w,h,color,ícono,rótulo,texto,{ts,ls,lc,r})` | Tarjeta como "HORARIOS": rótulo azul espaciado y texto Bold |
| `infoc2(P,x,y,w,texto,ícono,{size,r,col,minh})` | Tarjeta gris con ícono y texto; devuelve el alto |
| `irow(P,x,y,w,items,{r,ls,pad,c})` | Tarjeta con N íconos en fila y su rótulo debajo; devuelve el alto |
| `dbox(P,x,y,w,h,pre,dato,{k,ps,bs})` | Caja INK de fecha: ícono en círculo blanco, separador, texto espaciado y dato grande |
| `cmsg(...)` / `dmsg(P,x,y,w,texto,ícono,{size,r,f,col,minh})` | Mensaje en caja blanca con borde rojo / en caja oscura; devuelven el alto |
| `pill(P,s,x,y,{h,size,k,bg})` / `pillW(s,o)` | Botón redondeado con ícono / su ancho antes de dibujarlo |
| `qrc(P,x,y,lado)` | QR desde `QR` o recuadro punteado "QR (reemplazar)" |
| `bl(P,items,x,y,w,{size,lead,gap,dc})` / `bh2(...)` | Lista con puntos de color / su alto |
| `sign(P,y,s1,s2)` | Filete, firma espaciada y bajada centradas |
| `inner(P,o)` / `sq(P,o)` | Fondo y cabecera de placa interna (carrusel) o de pieza cuadrada; devuelven la y libre |
| `fit(g,y0,y1)` | Centra en vertical el grupo de contenido entre `y0` e `y1` |
| `tr2(P,ícono,cx,cy,r,color)` / `num2(P,cx,cy,r,texto,color)` | Círculo con ícono / con número |
