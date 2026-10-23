---
name: fead-infografias
description: Crea infografías de la FEaD (Facultad de Educación a Distancia, Universidad Central del Paraguay) en Adobe Illustrator con su línea gráfica estilo widget iOS — tarjetas blancas redondeadas con sombra suave, emojis de Apple grandes, badge central con arco degradado rojo→naranja, tipografía Gotham, títulos azul #2153D0 con línea roja. Genera una mesa de trabajo por infografía mediante un script JSX con plantillas (hub, grilla, columnas, pasos, ciclo, ruta). Usala siempre que el pedido mencione FEaD, Educación a Distancia de la UCP, manual o guía del estudiante EaD, o infografías con emojis de Apple en esta línea, aunque no diga "skill"; también para modificar o revisar esas infografías. No es para Central Next (esa marca tiene su propia skill).
---

# Infografías FEaD — línea gráfica y generador

El trabajo se hace en Illustrator. El script [scripts/generar_infografias.jsx](scripts/generar_infografias.jsx) contiene todo el sistema: primitivas, componentes, 6 plantillas y un `DATA` de ejemplo con las 19 infografías originales del manual del estudiante. Para piezas nuevas no dibujes a mano: copiá el script, reemplazá `DATA` y ejecutalo.

Referencias visuales en `assets/referencias/`: `vista_general_19.jpg` (las 19) y una por plantilla (`hub_01.jpg`, `grid-v_02.jpg`, `grid-s_05.jpg`, `grid-h-strip_12.jpg`, `steps_06.jpg`, `cols_08.jpg`, `cycle_14.jpg`, `route_16.jpg`). Miralas antes de elegir plantilla.

## Preferencias del usuario (respetarlas)

- Rápido, prolijo y con pocos tokens: un script, una corrida, revisión, ajustes puntuales.
- **Emojis siempre de Apple**, nunca Android/Google/Samsung.
- Cada infografía en su propia mesa de trabajo. Sin numeración de página.
- **No exportar** PNG/PDF salvo que lo pida: guardar el .ai y avisar cuando esté listo.
- Corregir erratas obvias del contenido ("Eonexión"→"Conexión", "¿Tenes"→"¿Tenés") y quitar duplicados, sin inventar contenido. Mantener el registro (tuteo/voseo) del texto que manda.

## Línea gráfica

**Formato:** mesa 1200×900 pt, RGB, una capa por infografía con el nombre `NN Título` (también nombre de la mesa). Márgenes laterales de 50 pt (el contenido ocupa x 50–1150).

**Paleta**

| Token | HEX | Uso |
|---|---|---|
| TBLUE | `#2153D0` | Título principal (solo ese) |
| NAVY | `#1B365D` | Títulos de tarjeta, pills, cabeceras de columna, sombras |
| RED | `#E31B2D` | Línea bajo el título, flechas de pasos, puntos de conexión, "Recuerda:", strips de advertencia |
| ORG | `#FF8A3D` | Final del degradado del arco y borde de la perilla |
| BG | `#F2F3F7` | Fondo de la mesa |
| WHITE | `#FFFFFF` | Tarjetas |
| INK | `#1C2536` | Texto de lectura principal |
| GRAY | `#646C7C` | Descripciones, subtítulo, rótulo "Facultad de…" |
| Tinte navy / rojo | `#E9EEF6` / `#FDECEE` | Círculos detrás de emojis, alternando por índice |
| LINE / TRACK / DOT | `#E8EBF1` / `#ECEEF3` / `#C2C9D6` | Separadores, pista del arco, conectores punteados |
| SOFT / PILLG | `#F3F4F8` / `#E3E6ED` | Sub-cajas internas, pill "Paso NN" |

Degradado "FEaD Rojo-Naranja": lineal RED→ORG, solo en el arco del badge.

**Tipografía Gotham** (nombres PostScript: `Gotham-Bold`, `Gotham-Medium`, `Gotham-Book`)
- Título: Bold 36 (34 si es largo), TBLUE, centrado, ancho máx. 980, interlineado 1.12, tracking −12.
- Subtítulo opcional: Book 17, GRAY, centrado, ancho 820.
- Título de tarjeta: Bold 17–22 o Medium 18–19.5, NAVY. Descripción: Book 13.5–15.5, GRAY, interlineado ≈1.3.
- Pills: Bold/Medium 12.5–16, blanco sobre NAVY o RED, alto 26–38, totalmente redondeadas.
- Gotham **no tiene la flecha →**: las flechas se dibujan en vector (`arrowDot`). Antes de usar otro símbolo poco común, verificá el glifo.

**Encabezado (todas):** pill navy "FEaD" (Bold 15) + "Facultad de Educación a Distancia" (Medium 14, GRAY) arriba a la izquierda; título centrado; línea **roja sólida** 56×6 centrada 14 pt debajo; subtítulo opcional.

**Tarjetas:** blancas, radio 24–28. Sombra = copia navy al 10 % de opacidad, desplazada (6, 10), con desenfoque gaussiano 18 (efecto en vivo). Las tarjetas circulares usan 11 % y desenfoque 16.

**Emojis:** PNG de Apple 160 px, incrustados (`embed`). Van sobre un círculo de tinte (el emoji mide ≈1.3× el radio del círculo) o sueltos y grandes (62–84 pt en grillas y pasos).

**Badge central (hub y ciclo):** círculo blanco con sombra; pista TRACK de 8 pt; arco degradado de 135° a 372°; perilla blanca con borde naranja en el extremo; emoji grande en el centro; pill navy con el rótulo sobre el borde inferior y bajada gris opcional debajo.

**Conectores:** punteado redondo DOT 2.4–3 pt (guiones `[0.5,7]`). En el hub terminan en puntos rojos con borde blanco. En el ciclo llevan triángulos rojos indicando el sentido.

**Pie (opcional):** tarjeta blanca a 34 pt del borde inferior (x 100–1000), círculo de tinte con emoji (💡 `light-bulb` por defecto) y texto Book 16.5 INK. Prefijo opcional en rojo Bold, p. ej. "Recuerda:".

**Strip de advertencia (grilla):** caja con tinte rojo y borde rojo punteado, pill roja con 🚫 arriba al centro, y cada ítem con su emoji y una ❌ superpuesta.

## Plantillas y esquema de DATA

Cada entrada lleva campos comunes: `name` ('NN Título', nombre de la mesa y de la capa), `type`, `title`, `ts` (tamaño del título, opcional), `tw` (ancho del título, opcional), `sub`, `foot`, `fe` (emoji del pie), `fl` (prefijo rojo del pie). Los emojis se indican por su **slug de Emojipedia**, que es también el nombre del archivo en `assets/emojis-apple/`.

| type | Úsalo para | Campos propios |
|---|---|---|
| `hub` | Concepto central con 4–8 aspectos alrededor | `ce` (emoji central), `cl` (rótulo), `cs` (bajada), `R`, `cw`, `maxH`, `cards:[{e,t,d}]` o `cards:[{e,t,items:[[emoji,texto],…]}]` (lista con ítems) |
| `grid` | Conjunto de ítems paralelos | `cols`, `gap`, `maxH`, `card:'v'` (vertical `{e,t,d}`), `'s'` (columna numerada `{t,subs:[[e,txt],[e,txt]]}`), `'h'` (horizontal `{e,t,q,b:[…]}`), `strip:{t,items:[[e,txt]]}`, `stripH` |
| `cols` | Comparaciones, listas por categoría, semana | `cols:[{t,e,c:'navy'|'red'|'blue',wt,ts,mark,rows:[[e,título,desc?]]}]`, `link:'arrow'` o emoji entre columnas, `vcenter`, `rt`, `rd`, `maxRow` |
| `steps` | Recorrido lineal de 6–10 pasos en 2 filas | `steps:[[e,txt]]`, `runs:[[i0,i1]]` (marca pasos "En simultáneo"); el último paso va en navy |
| `cycle` | Proceso circular de 4–8 etapas | `nodes:[[e,título,desc?]]`, `a0` (ángulo del primer nodo, p. ej. −120 o −90), `ce`, `cl`, `cs`, `R`, `rx`, `nw`, `nh` |
| `route` | "Si te pasa X → acudí a Y" | `rows:[{e,t,to:[[e,txt],…]}]` |

Ejemplos reales de cada una están en el `DATA` del script (entradas 01–19).

## Flujo de trabajo

1. **Contenido:** leé el material y asigná una plantilla a cada infografía (mirá las referencias). Corregí erratas y duplicados.
2. **Emojis:** elegí slugs de Emojipedia (`https://emojipedia.org/<slug>`). Revisá los 105 que ya están con `ls assets/emojis-apple`. Descargá los que falten en Apple:
   ```
   python -I scripts/descargar_emojis.py slug1 slug2 ...
   ```
   Si responde "SIN APPLE", buscá otro slug.
3. **Script:** copiá `scripts/generar_infografias.jsx` a la carpeta del proyecto. Editá el bloque CONFIG (`DIR` = carpeta de salida con `/` final, `OUT` = nombre del .ai) y reemplazá `DATA`. Guardalo en **UTF-8 con BOM**, o los acentos se rompen.
4. **Ejecutar** (si un documento con el mismo nombre está abierto, cerralo antes):
   ```
   powershell -File scripts/correr_jsx.ps1 "C:\ruta\generar_infografias.jsx"
   ```
   Devuelve `OK N | errores`. Lo que aparezca después de `|` hay que resolverlo: `emoji <slug>` significa que falta el PNG; `<nombre>: <error> @línea` es un fallo de plantilla.
5. **Revisar:** corré `scripts/revisar_png.jsx` (exporta al 50 % en `%TEMP%\fead_revision\`) y mirá las imágenes. Controlá:
   - textos que se cortan o se superponen con emojis o marcas;
   - columnas vacías (usá `vcenter`);
   - títulos de más de dos líneas (bajá `ts` o subí `tw`).

   Ajustá parámetros en `DATA` y volvé a generar.
6. **Entregar:** el script ya guarda el .ai. Avisale al usuario. Solo si lo pide, corré `scripts/exportar_png.jsx`, que exporta PNG 2x en `<carpeta del .ai>/png/`.

## Modo nube (claude.ai, sin acceso a Illustrator)

Si no podés ejecutar PowerShell ni controlar Illustrator (por ejemplo, en un chat de claude.ai), el flujo cambia:

1. Armá el script igual que en los pasos 1–3, partiendo de `scripts/generar_infografias.jsx`.
   - Dejá `EM` apuntando a `C:/Users/raulm/.claude/skills/fead-infografias/assets/emojis-apple/`: es donde están los emojis en la PC del usuario.
   - Poné en `DIR` una carpeta de su PC, por ejemplo `C:/Users/raulm/Claude/UCP/FEaD-infografias/`.
2. Usá solo emojis que ya estén en `assets/emojis-apple/`. Si necesitás otros, pasale al usuario el comando de descarga con los slugs para que lo corra en su PC:
   ```
   python -I C:/Users/raulm/.claude/skills/fead-infografias/scripts/descargar_emojis.py slug1 slug2
   ```
3. Entregá el `.jsx` como archivo descargable, en UTF-8 con BOM.
4. El usuario lo corre en Illustrator con *Archivo → Secuencias de comandos → Otra secuencia de comandos…*. El script genera las mesas y guarda el .ai en `DIR`.
5. Pedile una captura para revisar y ajustar.

## Construir una variante a mano (layout nuevo)

Si ninguna plantilla sirve, agregá una función `miPlantilla(P,d,T0,B0)` al script y registrala en `BUILD`. Recibe el área libre vertical de `T0` (debajo del encabezado) a `B0` (encima del pie). Reutilizá los componentes:

- **Coordenadas:** `X()`/`Y()` convierten coordenadas de la mesa (origen arriba a la izquierda, y hacia abajo) a las de Illustrator (y hacia arriba).
- **Formas:** `rr`, `circ`, `ell`, `line(P,pts,color,ancho,dash)`, `poly`, `tri`, `arc`.
- **Componentes:**
  - `card(P,x,y,w,h,r)`: tarjeta con sombra.
  - `ccard`: versión circular.
  - `E(P,slug,cx,cy,tam)`: emoji.
  - `T(P,txt,x,y,{f,size,c,w,just,lead,tr})`: texto con ajuste de líneas medido.
  - `vc(t,cy)`: centra un texto en vertical.
  - `center(grupo,y,h)`: centra un grupo en una caja.
  - `pill(P,txt,x,y,{bg,c,size,h,px,anchor,e,sh})`.
  - `badge(P,cx,cy,R,emoji,rótulo,bajada)`.
  - `arrowDot(P,cx,cy,r,color)`.

Mantené la jerarquía: título TBLUE, texto NAVY/INK/GRAY, acentos RED, nada de colores fuera de la paleta.

## Notas técnicas

- Illustrator se controla por COM: `New-Object -ComObject Illustrator.Application` y luego `.DoJavaScriptFile(ruta)`. ExtendScript es ES3: nada de `let`, arrow functions ni `forEach`.
- Generar las 19 mesas tarda 1–2 minutos y el .ai pesa ≈ 22 MB (emojis incrustados y efectos de desenfoque, rasterizados a 150 ppp).
- La sombra es un efecto en vivo (`Adobe PSL Gaussian Blur`), no un PNG, así que la sombra sigue siendo editable.
