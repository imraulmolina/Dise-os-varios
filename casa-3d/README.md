# Casa Asunción 120

Demo de la **Ruta A / Fase 0** del documento "Casa 3D con IA: ingeniería inversa de cnvierte.com/guia-3d y plan propio" (23-oct-2026). Hace lo mismo que muestran los vídeos de la guía sin comprarla, y lo construye sobre un **único modelo paramétrico**, que es la base de la Ruta B.

## Cómo abrirlo

- **Doble clic** en `index.html` (obra 3D) o en `cad.html` (plano CAD). Necesita internet para cargar Three.js, SunCalc y las fuentes desde CDN.
- Con servidor local: `npx http-server casa-3d` y abrir `http://localhost:8080`.
- Regenerar el DXF después de tocar el modelo: `node casa-modelo.js > casa.dxf`.

## Qué hay

| Pantalla | Qué hace |
|---|---|
| `index.html` | Obra por etapas en una línea de tiempo de 8 meses (cimientos, estructura, instalaciones, envolvente, acabados), con una curva de inversión de ejemplo. Incluye rayos X con filtros por sistema (agua fría y caliente, desagüe, electricidad, aire), vista explotada, corte horizontal, sol real de Asunción por fecha y hora (SunCalc), vistas aérea, en planta, de calle y del fondo, recorrido en primera persona y ficha con superficies y cómputo. |
| `cad.html` | Interfaz oscura tipo CAD con capas, línea de comandos y orden de dibujo. Dibuja el plano en el orden de un dibujante: ejes, columnas, muros, carpintería, mobiliario, cotas y lote. Luego una ventana de selección lo levanta en 3D con el **mismo** modelo, y el botón Exportar DXF genera un DXF R12 real. |
| `casa.dxf` | El plano exportado: metros, 14 capas con color ACI y 499 entidades. Abre en AutoCAD, BricsCAD, LibreCAD o DraftSight. |

Arquitectura y alcance: [`PLAN.md`](PLAN.md). Estado y próximos pasos: [`PROGRESO.md`](PROGRESO.md).

> Diseño conceptual. No incluye cálculo estructural ni verificación de normativa: un profesional matriculado tiene que validarlo y firmarlo antes de presentarlo a la municipalidad.
