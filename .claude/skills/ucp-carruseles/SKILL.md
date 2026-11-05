---
name: ucp-carruseles
description: Crea carruseles (placas de 1080×1350) y piezas/posts (1080×1080) para redes de la Universidad Central del Paraguay (UCP) y su Facultad de Educación a Distancia (FEaD) en Adobe Illustrator con scripts JSX, usando la línea gráfica de los carruseles UCP. Esa línea combina azul institucional #2153D0 y rojo #FA2626, diagonales que continúan de una placa a otra, títulos con peso mixto y barra roja, tarjetas blancas con sombra suave y tarjetas con filete. Suma el banner con emblema de arcos, el badge con arco degradado y emojis de Apple, sin fotos, e incluye una variante minimalista. Usala siempre que pidan un carrusel, placas, posts, piezas para redes, convocatorias o infografías cuadradas de la UCP, FEaD o Universidad Central, aunque no nombren la skill. También cuando pidan "la línea de los carruseles anteriores" o modificar esas piezas. No es para infografías de 1200×900 del manual FEaD (usar fead-infografias) ni para Central Next.
---

# UCP carruseles: línea gráfica y generador

Todo se hace con un script JSX para Illustrator. En `scripts/plantillas/` hay cuatro plantillas completas y probadas, cada una con sistema, componentes, placas y `DATA`:

| Plantilla | Formato | Qué trae |
|---|---|---|
| `carrusel_cuidadores.jsx` | 7 placas de 1080×1350 | Portada clara con banda diagonal, placa azul con datos, lista con filetes, columnas de materias, checklist con borde, fecha con calendario y cierre azul con badge |
| `carrusel_consultorio.jsx` | 7 placas de 1080×1350 | Portada azul con logo en tarjeta, 3 pilares, objetivo en caja translúcida, grilla 2×2 de áreas, recorrido numerado, fecha horizontal y cierre con QR |
| `piezas_1080.jsx` | 8 piezas de 1080×1080 (híbrida) | Árbol con ramas, dos columnas, organigrama 2×2, camino con paradas, ruta por carrera, anillos de porcentaje y tabla |
| `piezas_1080_minimal.jsx` | 8 piezas de 1080×1080 (minimalista) | El mismo contenido con fondo blanco, filetes finos, números grandes y emojis chicos sin fondo |

Las referencias visuales están en `assets/referencias/`. Miralas antes de elegir. El catálogo de placas y piezas (qué hace cada función `s1…s7`, `p1…p7`, `m1…m7`) está en [references/plantillas.md](references/plantillas.md). La API de los componentes está en [references/componentes.md](references/componentes.md).

## Preferencias del usuario (respetarlas)

- Rápido, prolijo y con pocos tokens: un script, una corrida, revisión y ajustes puntuales.
- **Emojis siempre de Apple**, nunca de Android, Google o Samsung.
- **Sin fotos**: solo diseño vectorial y emojis. Donde una referencia trae fotos, reemplazalas por elementos de la línea (badge, emojis inclinados, libros vectoriales, cajas).
- Una mesa de trabajo por placa o pieza, con el nombre `NN Título` (también es el nombre de la capa). Sin numeración de página.
- **No exportar** PNG/PDF salvo que lo pida: guardar el .ai y avisar.
- Corregir erratas obvias ("70% a 73%" en una escala de 70 a 79, "Reglamente"→"Reglamento"). Mantener el registro del texto (voseo o tuteo) tal como lo manda. No inventar contenido: si un texto está cortado, duplicado o parece copiado de otra pieza, usarlo como está y **avisar al final** para que confirme.
- Los textos para redes (copys, captions, hashtags) que vengan en el pedido no van en el diseño.
- Cuando pida "otro carrusel en la misma línea", **cambiá la estructura de las placas** para que no queden iguales, pero mantené la línea.

## Línea gráfica

**Formatos**
- Carrusel: placas de 1080×1350, RGB, mesas **pegadas** (`documents.add(RGB,AW,AH,N,GridByRow,0,N)`) para que las diagonales continúen entre placas. Margen izquierdo de 100 a 120.
- Pieza o post: 1080×1080, grilla de 4 columnas con 60 de separación. Margen de 60 (híbrida) o 72 (minimalista).
- Efectos rasterizados a 150 ppi. Degradado `FEaD Rojo-Naranja` (RED→ORG), usado solo en el arco del badge.

**Paleta** (tokens en las plantillas)

| Token | HEX | Uso |
|---|---|---|
| NAVY | `#2153D0` | Azul institucional: títulos, fondos azules, cabeceras, números |
| RED | `#FA2626` | Barra bajo el título, emblema del banner, filetes, números alternos, acentos |
| ORG | `#FF8A3D` | Final del degradado del arco y borde de la perilla |
| BG / BG2 | `#F7F7F7` / `#EEEEEE` | Fondos claros alternados |
| WHITE | `#FFFFFF` | Tarjetas y fondo minimalista |
| GRAY | `#68686A` | Texto de lectura |
| SHD | `#1B365D` | Sombras al 10 % con desenfoque gaussiano 18 |
| SKY | `#C9D7F7` | Texto secundario sobre azul |
| RULE | `#4A72DA` | Filetes sobre azul y cuña clara de la cabecera |
| TN / TR | `#E7EDF9` / `#FDECEE` | Tintes azul y rojo detrás de emojis, alternados por índice |
| TRACK / DOT / LINE / LN | `#ECEEF3` / `#B9C1D0` / `#E8EBF1` / `#E3E6ED` | Pista del arco, punteados, separadores y filetes de la versión minimalista |

**Tipografía Gotham** (`Gotham-Bold`, `Gotham-Medium`, `Gotham-Book`)
- Títulos con **peso mixto**: base Book con tramos **Bold** del mismo azul, o base Bold con el resaltado en rojo (sobre fondo claro). Tracking −12/−14, interlineado de 1.08 a 1.1.
  - Tamaños en carrusel: 58–74.
  - Tamaños en piezas: 48–56.
- **Barra roja** bajo el título. `bar:'w'` subraya la última palabra (carrusel). `bar:'l'` es una barra fija a la izquierda (110–150 × 8–10). En la versión minimalista mide 56×6.
- Texto de lectura en Book GRAY, con resaltados `**así**` en Bold NAVY. Sobre azul: blanco o SKY, con resaltado en Bold blanco. **No uses rojo sobre azul**: no tiene contraste.
- Gotham **no tiene la flecha →**: dibujala con `arrowDot`.

**Diagonales** (pendiente `SL=0.126`, inclinadas "/")
- Cuña que sale por la derecha de la placa N: `[[AW,96/SL],[AW,AH],[AW+96-SL*AH,AH]]`. Continúa en la placa N+1 como cuña superior izquierda: `[[0,0],[96,0],[0,96/SL]]`.
- Otras formas usadas:
  - Cuña izquierda completa: `[[0,0],[170,0],[0,AH]]`.
  - Banda derecha: `[[1026,0],[AW,0],[AW,AH],[1026-SL*AH,AH]]`.
- En piezas sueltas:
  - Barra superior roja y azul con corte (`topbar`).
  - Cabecera azul con filete rojo y cuña RULE (`band`).
  - Banda clara detrás del badge (`hband`).
  - En la minimalista, solo una diagonal azul fina arriba a la derecha (`corner`).

**Elementos de la línea**
- Tarjeta blanca con sombra (`card`).
- Tarjeta con filete de color a la izquierda (`scard`).
- Caja azul con emoji en círculo blanco (`bluebox`).
- Caja translúcida sobre azul: blanco al 12 %.
- Banner con emblema rojo de 3 arcos blancos (`banner`, `wbanner`).
- Badge con arco degradado y perilla, más satélites (`badge`, `sat`).
- Emojis grandes inclinados ±12–14° a los lados de un título.
- Números en círculo rojo o azul, recorridos punteados, calendario dibujado (`calW`).
- Libros vectoriales con rótulos en el lomo (`books`) y anillos de porcentaje (`donut`).
- En la minimalista: filetes finos, números grandes en Book y rótulos en mayúsculas Bold 13.5 con tracking 120.

**Logo y QR:** las rutas se configuran en `LOGO` y `QR` (cabecera del script). Si el archivo no está, el script pone un rótulo de texto provisorio o un recuadro punteado `QR (reemplazar)`, y el aviso final lo informa.

## Flujo de trabajo

1. Leé el guion: cuántas placas o piezas, el formato (1080×1350 o 1080×1080) y la variante (híbrida o minimalista; si no la piden, híbrida).
2. Copiá la plantilla más cercana y reemplazá `DATA`. Ajustá o recombiná las funciones de placa para cambiar la estructura respecto del carrusel anterior. Cambiá `DIR` y `OUT`: por defecto, `C:/Users/raulm/Claude/UCP/<Proyecto>/`.
3. Emojis: elegí slugs de `assets/emojis-apple/` (el nombre de Emojipedia). Si falta uno, bajalo con `python3 -I scripts/descargar_emoji.py slug=🌳`.
4. Compilá:

   ```
   python3 -I scripts/build.py <plantilla> <salida.jsx>
   ```

   Esto incrusta en base64 los emojis usados y guarda en UTF-8 con BOM.
5. Vista previa en la nube (no hay Illustrator):

   ```
   NODE_PATH=$(npm root -g) node scripts/preview/run_preview.js <salida.jsx> assets/emojis-apple <carpeta>
   ```

   Esto genera `01.png…`, una por mesa, con Montserrat en lugar de Gotham. Revisá cada placa (desbordes, huérfanas, choques, vacíos), corregí y repetí. Mostrale al usuario una hoja con todas.
6. Revisión ES3: no hay `let`, `const`, `=>`, comillas invertidas, `forEach` ni comas finales en arrays u objetos. Verificalo con:

   ```
   grep -nE '=>|\blet |\bconst |`|\.forEach' <salida.jsx>
   ```
7. Entregá el `.jsx` (y la hoja de vista previa). Si hay repo, commit y push.
   - Se corre con: Archivo → Secuencias de comandos → Otra secuencia de comandos… (Ctrl+F12).
   - Al terminar sale `OK N placas`, con errores, notas (logo/QR faltante) y la ruta del .ai guardado.
   - Aclarale que la vista previa es aproximada y pedile una captura si algo se ve distinto.

## Trampas conocidas

- Medí el texto con su fuente real: `wrap()` mide los tramos `**bold**` con la Bold. Si medís todo con Book, el texto se sale del margen.
- Para evitar viudas y huérfanas, usá cortes manuales `\n` en títulos y notas.
- Si queda aire vacío abajo, agrupá el contenido y centralo con `gc(g, cy)`.
- En `scard`, la base de color es angosta (`20+2r`). Si es del ancho completo, aparece un halo de color en los bordes.
- 📅 (`calendar`) de Apple muestra "JUL 17": no lo uses con otra fecha. Usá `calW()` o ⏱️/📌/⏳.
- En la vista previa, no declares variables globales llamadas `top`, `left`, `name` o `status`: chocan con `window`.
- En la nube, Emojipedia, jsDelivr y unpkg están bloqueados. raw.githubusercontent.com funciona.
- Antes de rotar un emoji, rotá y después incrustá (`E()` ya lo hace). Los textos no se rotan.
