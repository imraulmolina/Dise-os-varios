# Casa Asunción 120: plan

Continuación de la investigación "Casa 3D con IA: ingeniería inversa de cnvierte.com/guia-3d y plan propio" (23-oct-2026).
Este proyecto corresponde a la **Ruta A / Fase 0** de ese documento: replicar sin comprar la guía lo que muestran sus vídeos, pero sobre la base de la **Ruta B**, es decir, con un único modelo de datos del que se deriva todo.

## Brief de la demo

- Casa de **2 dormitorios, 120 m²**, estilo contemporáneo de techo plano.
- Lote de **12 × 30 m** en **Asunción, Paraguay**, con el frente al norte.
- Medidas de obra: muros de 15 cm, losa de 12 cm, 2,70 m de piso a techo.

## Arquitectura

```
casa-modelo.js   Modelo paramétrico único (muros, aberturas, ambientes, muebles, instalaciones, lote)
                 + derivados: piezas de muro, plano 2D por pasos, DXF, cómputo, ficha.
                 Funciona en el navegador (window.CASA) y en Node (require / `node casa-modelo.js > casa.dxf`).
casa-3d.js       Construye la escena Three.js a partir del modelo. Cada objeto lleva etapa, sistema y animación.
index.html       Visor de obra: línea de tiempo por etapas, rayos X por sistema, corte, sol real, explotar, recorrido.
cad.html         Pantalla tipo CAD: capas, línea de comandos y pasos. Dibuja el plano en orden de dibujante,
                 lo levanta en 3D con el MISMO modelo y exporta un DXF real.
casa.dxf         Plano exportado (R12, en metros, capas con color ACI).
```

Ninguna de las dos pantallas duplica geometría: las dos leen `casa-modelo.js`.

## Etapas de obra (línea de tiempo)

| # | Etapa | Contenido | Meses (ejemplo) |
|---|---|---|---|
| 1 | Cimientos | Excavación, zapatas, vigas de fundación, contrapiso | 1 |
| 2 | Estructura | Columnas, vigas de encadenado, losa | 2 |
| 3 | Instalaciones | Agua fría y caliente, desagüe, electricidad, aire | 1 |
| 4 | Envolvente | Mampostería, aberturas, parapeto | 2 |
| 5 | Acabados | Revoque y pintura, pisos, muebles, jardín, piscina | 2 |

## Fuera de alcance (a propósito)

- Cálculo estructural, verificación de normativa municipal y planos para permiso: un profesional matriculado tiene que validarlos y firmarlos.
- Render fotorrealista: la escena es en tiempo real (WebGL).
- Los montos de la curva de inversión son de ejemplo y no constituyen un presupuesto.
