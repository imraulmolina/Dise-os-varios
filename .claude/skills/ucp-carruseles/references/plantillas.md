# Catálogo de placas y piezas

Combiná y adaptá estas funciones. Para un carrusel nuevo, cambiá la estructura de varias placas respecto del anterior y mantené la línea. Cada entrada de `DATA` lleva `name` ('NN Título', nombre de la mesa y de la capa) y `type` (la función). Los demás campos son los que usa esa función: mirá el `DATA` de la plantilla.

## Carrusel 1080×1350: `carrusel_cuidadores.jsx`
| Placa | Fondo / diagonal | Estructura |
|---|---|---|
| `s1` Portada | BG + banda azul derecha (continúa en la 2) | Logo, línea vertical y marca. Título 74 con emoji, banner con emblema, bajada Medium 40, iniciativa abajo y badge con satélite abajo a la derecha |
| `s2` Qué es | Azul + cuña blanca abajo a la derecha (continúa en la 3) | Título blanco con `bar:'l'` y texto. Tarjetas de dato con filete rojo y emoji. Caja translúcida al pie con emoji en círculo |
| `s3` A quién | Blanco + cuña azul arriba a la izquierda | Título centrado con `bar:'w'`. Lista de tarjetas con filete rojo, emoji en cuadrado de tinte, título y descripción. Pie centrado |
| `s4` Columnas | Blanco | Título centrado. Bloques con filete (azul y rojo) sobre BG2, cabecera con emoji y filas emoji + texto |
| `s5` Checklist | BG | Título con emoji. Tarjeta con borde azul, filas con emoji en tinte y frase final Bold |
| `s6` Fecha | BG2 | Título centrado entre emojis inclinados. Tarjeta azul con calendario `calW`, texto y aviso con filete rojo |
| `s7` Cierre | Azul + cuña gris izquierda (viene de la 6) | Badge con 2 satélites, título blanco, texto, banner blanco con emoji, filete y firma |

## Carrusel 1080×1350: `carrusel_consultorio.jsx`
| Placa | Fondo / diagonal | Estructura |
|---|---|---|
| `s1` Portada | Azul + cuña clara abajo a la derecha | Logo en tarjeta blanca (`chip`) e iniciativa al lado. Badge con 2 satélites arriba a la derecha. Título blanco con 💙, nombre del proyecto, bajada en SKY y banner blanco |
| `s2` Qué es | BG + cuña azul (viene de la 1) | Grupo centrado: título, 3 tarjetas pilar (emoji en tinte y rótulo), texto y `bluebox` |
| `s3` Objetivo | Azul + cuña BG izquierda + cuña blanca derecha | Badge 🎯 con satélites, título blanco centrado, bajada SKY y caja translúcida con el objetivo |
| `s4` Quiénes | Blanco + cuña azul | Título con 🎓. Tarjeta con filete azul y grilla 2×2 de áreas en tintes. Tarjeta con filete rojo y `bluebox` |
| `s5` Beneficios | BG2 | Título centrado. Recorrido punteado vertical con emojis en círculos blancos, número rojo y tarjetas a la derecha |
| `s6` Fecha | BG2 | Grupo centrado: título entre ⏱️ y 📌 inclinados, tarjeta azul horizontal con `calW` y fecha grande, y dos notas con filete |
| `s7` Cierre | Azul + cuña BG2 izquierda | Título con 💙, texto, `qr` con `arrowDot`, frase, banner "¡Te esperamos!", filete y firma |

## Piezas 1080×1080 híbridas: `piezas_1080.jsx`
| Función | Estructura |
|---|---|
| `p1` Árbol | `topbar`, título con emoji, bajada y lema. Tronco con 3 ramas numeradas, cada una con 3 tarjetas (emoji, título y lista). Pie `fbooks` con texto y banner-botón |
| `p2` Dos columnas | Título de 2 líneas (la segunda en rojo) y lema. Dos tarjetas con cabecera azul y roja y 6 filas alineadas. Pie azul con un corte rojo, frase y 4 valores |
| `p3` Organigrama | Cabecera `band` con badge y satélite. Conectores desde la cabecera. Grilla 2×2 de áreas con número rojo, cabecera azul y unidades con lista |
| `p4` Camino | `topbar` y badge. Camino vertical con 5 paradas (emoji en círculo y número), tarjetas alternadas, chips y bandera 🏁. Pie azul con la cita |
| `pc` Ruta por carrera | Badge con `hband`, título, carrera y bajada. 5 filas: número en círculo con flechas, tarjeta con filete, pill de etapa, descripción y emoji en tinte. `wbanner` al pie |
| `p7` Datos | Cabecera `band` con emoji inclinado. 2×2: `donut` 40/20/40 con pills, requisitos, tabla de calificaciones y etapas numeradas. Pie `fbooks` |

## Piezas 1080×1080 minimalistas: `piezas_1080_minimal.jsx`
Fondo blanco, `corner`, `mh` y `mt`. Sin tarjetas ni sombras: solo filetes `hl` y `vl`, números grandes en Book y emojis chicos sin fondo.

| Función | Estructura |
|---|---|
| `m1` | 3 columnas numeradas separadas por filetes verticales. Pie con frase y enlace con `arrowDot` |
| `m2` | 2 columnas con filete central y filetes entre filas. Pie con frase y valores en mayúsculas |
| `m3` | Grilla 2×2 con filetes en cruz y números grandes alternados azul y rojo |
| `m4` | Riel vertical con puntos. Etapa a la izquierda y lista a 2 columnas a la derecha. Competencias en una fila y cita al pie |
| `mc` | 5 filas: número grande, etapa en mayúsculas, descripción y emoji. Frase final |
| `m7` | Barra segmentada 40/20/40, tabla con filetes, requisitos y etapas en línea numeradas |
