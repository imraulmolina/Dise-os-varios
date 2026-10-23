# Casa Bali (ronda 1)

Primera propuesta para la casa propia: lote de 12 × 30 m, 4 habitaciones (la principal con walk-in closet y tina), estilo balinés con fachada contemporánea minimalista, piscina, dos plantas, mucha luz cenital y baños ventilados con vidrio.

## Cómo abrirlo

- **Doble clic** en `index.html` (obra y casa en 3D) o en `cad.html` (planos). Necesita internet para cargar Three.js, SunCalc y las fuentes.
- Regenerar el DXF después de tocar el modelo: `node motor.js > casa.dxf`.

## Archivos

| Archivo | Qué es |
|---|---|
| `modelo.js` | **Solo datos** del proyecto: plantas, muros, aberturas, ambientes, muebles, tragaluces, escalera, exterior y materiales elegibles. Es lo único que se edita en cada ronda. |
| `motor.js` | Deriva todo del modelo: piezas de muro por planta, columnas, instalaciones trazadas desde los artefactos, plano por pasos, DXF y cómputo. Sirve para cualquier casa de varias plantas. |
| `escena.js` | Construye la escena 3D por etapas de obra. |
| `index.html` | Visor: construir por etapas, rayos X, explotar plantas, cortes de planta baja y planta alta, materiales en vivo, sol real, vecinos, recorrido y ficha. |
| `cad.html` | Pantalla tipo CAD: implantación, planta baja y planta alta dibujadas en orden, ventana de selección, maqueta 3D y exportación DXF. |
| `casa.dxf` | Planos en DXF R12: implantación 1:100, planta baja y planta alta 1:50, en 17 capas. |

Decisiones de diseño y supuestos: [`PLAN.md`](PLAN.md). Estado y próximos pasos: [`PROGRESO.md`](PROGRESO.md).

> Anteproyecto conceptual. La estructura está predimensionada para dibujarla, no calculada. Antes de construir hacen falta un estudio de suelo y el cálculo y la firma de un ingeniero civil matriculado, y la normativa municipal está sin verificar.
