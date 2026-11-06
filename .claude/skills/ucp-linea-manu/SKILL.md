---
name: ucp-linea-manu
description: Crea carruseles (placas de 1080×1350) y piezas o posts (1080×1080) de la Universidad Central del Paraguay (UCP) y la FEaD en Adobe Illustrator con scripts JSX, en la "Línea Manu". Es la gráfica estilo CENTRAL Next que pidió el cliente. Fondo claro con anillos y franja azul diagonal, logos UCP y CENTRAL Next centrados y títulos en mayúsculas muy gruesas en azul oscuro, azul y rojo. Tarjetas grises con íconos planos blancos en círculos azules o rojos, caja azul oscura de fecha y caja blanca con borde rojo con botón rojo y QR. Usala cuando pidan la "línea Manu", "la línea de Central Next", "como las gráficas del cliente" o rehacer piezas UCP con esa gráfica. No es la línea de ucp-carruseles (emojis Apple, diagonales y badge) ni la de fead-infografias (1200×900).
---

# UCP — Línea Manu (gráfica estilo CENTRAL Next)

Todo se hace con un script JSX para Illustrator. En `scripts/plantillas/` hay tres scripts completos y probados. Cada uno trae colores, íconos, componentes, placas y `DATA`:

| Plantilla | Formato | Placas |
|---|---|---|
| `carrusel_cuidadores.jsx` | 7 placas de 1080×1350 | `a1…a7`: portada apilada, filas con ícono, filas de íconos, caja de fecha, cierre con firma |
| `carrusel_consultorio.jsx` | 7 placas de 1080×1350 | `b1…b7`: portada con fila de íconos y botón, objetivo en caja con borde rojo, fecha, cierre con QR |
| `piezas_1080.jsx` | 8 piezas de 1080×1080 | `q1…q7` y `qc`: árbol de reglamentos, dos columnas, organigrama 2×2, rutas, tabla de calificaciones |

Las referencias están en `assets/referencias/`. `referencia_cliente.jpg` son las dos gráficas originales del cliente; las demás imágenes son los resultados. Miralas antes de empezar. La API de componentes está en [references/componentes.md](references/componentes.md). El catálogo de placas, con qué hace cada función, está en [references/placas.md](references/placas.md).

## Preferencias del usuario (respetarlas)

- Rápido, prolijo y con pocos tokens: un script, una corrida, revisión y ajustes puntuales.
- **Íconos planos**, no emojis: blancos sobre círculos sólidos azules y rojos, alternados. Salen de Font Awesome Free (solid, CC BY 4.0) y van convertidos a trazados dentro del script.
- **Sin fotos.** La gráfica original usa fotos; acá se reemplazan por el fondo con anillos y la franja. Si el usuario pide fotos, preguntá dónde van.
- **Mantener la información exactamente como la manda**, sin resumir ni reescribir. Solo se corrigen erratas obvias y se respeta su registro (voseo o tuteo). Si algo parece cortado o duplicado, se usa tal cual y se avisa al final.
- Una mesa de trabajo por placa o pieza con nombre `NN Título` (también es el nombre de la capa). Sin numeración de página.
- No exportar PNG/PDF salvo pedido. Guardar el .ai y avisar.
- Los textos para redes (copys) que vengan en el pedido no van en el diseño.
- Para un carrusel nuevo, combiná placas distintas de las anteriores manteniendo la línea.

## Línea gráfica

**Paleta** (muestreada de las piezas del cliente)

| Token | HEX | Uso |
|---|---|---|
| INK | `#242A4B` | Azul oscuro: primera parte del título, textos, caja de fecha y cajas oscuras |
| BLUE | `#2154D0` | Azul: tramo `^así^` del título, rótulos de sección, círculos de íconos |
| RED | `#FA2527` | Rojo: tramo `~así~` del título, círculos alternos, borde de la caja blanca, botón y "Next" |
| STR | `#0151CC` | Franja azul diagonal a la izquierda |
| BG | `#F7F8FB` | Fondo claro |
| CARD / CARD2 | `#E6EAF1` / `#EEF1F6` | Tarjetas grises: la primera en carruseles, la segunda en piezas densas |
| RING | `#ECEEF4` | Anillos sutiles arriba a la derecha |
| GRAY | `#5F6268` | "CENTRAL" del sello, notas y firma |

**Tipografía Gotham**
- Títulos: **Gotham Black** en mayúsculas, con tracking −10 e interlineado 1.0. Si no está instalada, el script usa Bold y lo avisa.
  - Tamaños en carrusel: 56–104.
  - Tamaños en piezas: 44–62.
  - Colores por tramo: el texto normal va en INK, `^…^` en azul y `~…~` en rojo. Esquema típico: primera línea INK, segunda azul, tercera roja.
- Bajadas en mayúsculas espaciadas: Medium con tracking 220–280.
- Rótulos de sección: Bold azul con tracking 300 y una línea de 2 px hasta el margen.
- Texto: Book en INK, con `**resaltado**` en Bold del mismo color.
- Etiquetas de tarjeta (como "HORARIOS"): Bold con tracking 260–300, en azul o en el color de la fila.

**Elementos**
- Fondo `bgcn`:
  - Color BG.
  - 4 anillos RING recortados a la mesa (no invaden las mesas vecinas del carrusel).
  - Franja STR `[[0,0],[44,0],[0,AH*0.45–0.62]]`.
- Cabecera `header`: logo UCP y sello CENTRAL Next.
  - Apilados y centrados en las portadas; en fila centrada con separador en el resto.
  - Usa los archivos `LOGO` y `NEXT_LOGO` si existen; si no, dibuja versiones provisorias.
  - `NEXT=false` quita el sello.
- Tarjetas grises con radio 22:
  - Fila con ícono, separador vertical y texto (`rowc`).
  - Tarjeta informativa con rótulo azul (`infoc`).
  - Fila de íconos con rótulo debajo (`irow`), como "Áreas de atención".
- Caja de fecha `dbox`: INK con ícono de calendario en círculo blanco, separador, texto espaciado blanco y dato grande en Black ("26 OCT").
- Caja blanca con borde rojo de 2 px (`cbox` y `cmsg`) para llamados a la acción.
- Caja oscura (`dmsg`) para frases de cierre.
- Botón rojo redondeado con ícono (`pill`) y QR (`qrc`; si no está el archivo, deja un recuadro punteado "QR (reemplazar)").
- Firma al pie (`sign`).

**Formatos**
- Carrusel: 1080×1350 con mesas pegadas (`GAP=0`, `COLN=7`), margen 80.
- Piezas: 1080×1080, grilla de 4 columnas con separación 60, margen 64.
- El contenido de cada placa se arma en un grupo y se centra en el espacio libre (`fit`) para que no quede aire abajo.

**Configuración** (cabecera del script): `DIR`, `OUT`, `LOGO`, `NEXT_LOGO`, `NEXT` y `QR`.
- Rutas por defecto:
  - Logos en `C:/Users/raulm/Claude/UCP/` (`logo-ucp.png` y `logo-central-next.png`).
  - Salida en `C:/Users/raulm/Claude/UCP/Linea-Central-Next/`.
- Al terminar aparece `OK N placas` con errores, notas (logo, QR o Gotham Black faltantes) y la ruta del .ai.

## Flujo de trabajo

1. Leé el pedido: cuántas placas o piezas y qué formato.
2. Copiá la plantilla más cercana y reemplazá `DATA`. Usá o recombiná las funciones de placa y ajustá `DIR`, `OUT` y el nombre en la cabecera.
3. Íconos: elegí nombres de `assets/fa-svg/`. Si falta uno, buscalo en fontawesome.com (solid, gratis) y corré:

   ```
   python3 -I scripts/iconos.py <script.jsx> nombre1 nombre2
   ```

   Lo descarga y regenera el bloque `var IC={…}` del script.
4. Guardá el .jsx en **UTF-8 con BOM**. `iconos.py` ya lo hace; si editás a mano:

   ```
   python3 -c "s=open('x.jsx',encoding='utf-8-sig').read();open('x.jsx','w',encoding='utf-8-sig').write(s)"
   ```

5. Vista previa en la nube:

   ```
   NODE_PATH=$(npm root -g) node scripts/preview/run_preview.js <script.jsx> <carpeta_absoluta>
   ```

   Después, la hoja de contacto:

   ```
   python3 -I scripts/preview/hoja.py <carpeta> <n> <ancho> <alto> <columnas>
   ```

   Revisá cada placa (títulos que cortan feo, desbordes, aire), corregí y repetí.
6. Revisión ES3: no hay `let`, `const`, `=>`, comillas invertidas ni `forEach`.
7. Entregá el `.jsx` y la hoja de vista previa. Si hay repo, commit y push.
   - Se corre con: Archivo → Secuencias de comandos → Otra secuencia de comandos…
   - El .ai lo crea el script al correrlo, no antes.
   - Aclará que la vista previa es aproximada (Montserrat en lugar de Gotham).

## Trampas conocidas

- Títulos en Black: una palabra larga no se corta. Calculá unos 0.74 × tamaño por letra; por ejemplo, "COMPROMISO SOCIAL" entra en 920 px con tamaño 72 o menos. Usá cortes manuales `\n` para evitar una palabra suelta en la última línea.
- Los anillos van en un grupo con máscara (`clipped`), con el rectángulo de la mesa como último elemento del grupo. Sin eso se ven en la placa vecina.
- Los íconos son trazados compuestos con la regla de relleno no cero y los puntos en el orden del SVG. No inviertas el orden de los puntos o se rellenan los huecos.
- Gotham no tiene la flecha →: usá un ícono (`arrow-right`) o un botón.
- En la vista previa, no declares variables globales llamadas `top`, `left`, `name` o `status`.
- En la nube, raw.githubusercontent.com y Google Fonts funcionan; jsDelivr, unpkg y Emojipedia no.
