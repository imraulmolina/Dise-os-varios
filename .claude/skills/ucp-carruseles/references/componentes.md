# Componentes (API de las plantillas)

Coordenadas de mesa: el origen está arriba a la izquierda y la y crece hacia abajo. `X(x)` e `Y(y)` las convierten a Illustrator con el desplazamiento de la mesa actual (`AX`, `AY`). `P` es la capa o grupo donde se dibuja. Todo es ES3.

## Primitivas
| Función | Qué hace |
|---|---|
| `C('2153D0')` | Color RGB desde HEX |
| `rr(P,x,y,w,h,r,fill,stroke,sw)` | Rectángulo redondeado |
| `circ(P,cx,cy,r,fill,stroke,sw)` / `ell(...)` | Círculo y elipse |
| `poly(P,[[x,y],…],fill)` | Polígono cerrado (cuñas y diagonales) |
| `line(P,[[x,y],…],color,sw,dash)` | Trazo con puntas redondas; `dash=[0.5,10]` da un punteado redondo |
| `arc(P,cx,cy,r,a0,a1,sw,color)` | Arco en grados (0° a la derecha, en sentido horario); `GC()` es el degradado rojo→naranja |
| `bg(P,color)` | Fondo de toda la mesa |
| `blur(item,b)` | Desenfoque gaussiano en vivo |
| `E(P,slug,cx,cy,size,rot)` | Emoji Apple centrado, rotado e incrustado. Si no está en `EM`, lo toma del base64 `XE` |

## Texto
| Función | Qué hace |
|---|---|
| `T(P,s,x,y,o)` | Texto de punto. `o={f,size,c,w,lead,tr,just:'l'|'c'|'r',hf,hc}`. Con `w` corta las líneas midiendo cada tramo. `**tramo**` va en `hf` (Bold por defecto) y en el color `hc` (NAVY por defecto). `\n` fuerza un corte. Devuelve el textFrame |
| `vc(t,cy)` | Centra un texto en vertical en `cy` |
| `gc(g,cy)` | Centra un grupo en vertical en `cy`; sirve para eliminar el aire de abajo |
| `wrap`, `mw`, `mwm`, `flip`, `nl(s,f,sz,w)` | Medición: ancho de un texto, ancho con tramos en negrita y cantidad de líneas |

## Componentes híbridos
| Función | Qué hace |
|---|---|
| `title(P,s,x,y,o)` | Título con peso mixto. `o={size,c,f(base),hc(resaltado),w,just,e(emoji al final),er(rotación),bar:'w'|'l'|1}`. Devuelve la y inferior |
| `card(P,x,y,w,h,r,fill)` | Tarjeta con sombra (SHD al 10 %, desplazada 6/10, desenfoque 18) |
| `ccard(P,cx,cy,r)` / `sat(P,cx,cy,r,slug)` | Círculo blanco con sombra / satélite con emoji |
| `scard(P,x,y,w,h,colorFilete,fill,sombra)` | Tarjeta con filete de color a la izquierda |
| `badge(P,cx,cy,R,slug,escala)` | Badge con pista, arco degradado de 135° a 372° y perilla naranja |
| `banner(P,s,x,y,o)` | Emblema rojo con 3 arcos blancos y barra redondeada. `o={size,h,bg,c,f,px,e}`; `bannerW(s,o)` da su ancho antes de dibujarlo |
| `wbanner(P,s,x,y,w,h,o)` | Banner de ancho fijo con el texto centrado (pie de las piezas) |
| `bluebox(P,x,y,w,s,slug,o)` | Caja azul con emoji en círculo blanco y texto blanco. Devuelve el alto |
| `calW(P,cx,y0,w,h,mes,dia)` | Calendario dibujado: banda roja con el mes y el número grande |
| `arrowDot(P,cx,cy,r,color,dir)` | Flecha en un círculo (reemplaza la →); `dir=-1` apunta a la izquierda |
| `logo(P,x,y,h)` / `chip(P,x,y)` | Logo desde `LOGO` (si no está, un rótulo de texto) / logo dentro de una tarjeta blanca |
| `qr(P,x,y,s)` | QR desde `QR` (si no está, un recuadro punteado "QR (reemplazar)") |
| `topbar(P)` | Barra superior de 14 px roja y azul con corte (piezas) |
| `band(P,h)` | Cabecera azul con filete rojo diagonal y cuña RULE a la derecha |
| `hband(P,h)` | Banda clara diagonal y filete rojo detrás del badge (cabecera clara) |
| `hdr(P,y,oscuro)` | Pill "FEaD" y "Facultad de Educación a Distancia" |
| `tag(P,s,x,y)` | Lema en mayúsculas alineado a la derecha con una barrita roja |
| `num(P,cx,cy,r,s,color,sz)` | Número en círculo con borde blanco |
| `bul(P,items,x,y,w,o)` / `bh(...)` | Lista con puntos de color / su alto |
| `books(P,x,y,rotulos,colores)` / `fbooks(P,fy,rotulos)` | Pila de libros vectoriales / pie azul con libros a la izquierda y un corte rojo |
| `hcard(P,x,y,w,h,color,rotulo,slug,sz)` | Tarjeta con cabecera de color; devuelve la y del contenido |
| `donut(P,cx,cy,r,p,color,rotulo)` | Anillo de porcentaje (`p` entre 0 y 1) |

## Componentes minimalistas
| Función | Qué hace |
|---|---|
| `corner(P)` | Diagonal azul fina arriba a la derecha |
| `mh(P)` / `mtag(P,s,y)` | Encabezado "**FEaD** Facultad…" / lema en mayúsculas a la derecha del encabezado |
| `mt(P,s,y,o)` | Título Book y **Bold** azul con emoji opcional y barra roja de 56×6 |
| `hl(P,x1,y,x2)` / `vl(P,x,y1,y2)` | Filetes finos horizontal y vertical (LN) |
| `lab(P,s,x,y)` | Rótulo de sección en Bold 13.5 con tracking 120 |
| `lines(P,items,x,y,w,sz,ld,gap)` / `lh(...)` | Lista sin viñetas / su alto |
