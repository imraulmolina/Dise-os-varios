# Progreso

## Ronda 1 (23-oct-2026)

**Hecho**
- **Motor de varias plantas (`motor.js` + `escena.js`):** maneja losas con huecos, doble altura, escalera, tragaluces, terraza, barandas, materiales que se cambian en vivo e instalaciones trazadas automáticamente desde los artefactos.
- **Modelo de la casa (`modelo.js`):** 20 muros, 31 aberturas, 19 ambientes (incluidas la doble altura y la terraza), 67 muebles y el exterior completo (cochera, espejo de agua, sendero, galería, piscina, bale, vegetación).
- **Visor (`index.html`):** obra en 14 meses, rayos X, explotar por planta, cortes de cada planta, materiales, sol, vecinos, seis vistas y un recorrido que entra por la puerta pivotante, baja al jardín y a la piscina, sube la escalera y termina en la terraza.
- **Planos (`cad.html` + `casa.dxf`):** implantación, planta baja y planta alta.

**Verificado**
- Las páginas se abrieron en Chromium sin interfaz, sin errores de consola. Se revisaron capturas de cada vista, del recorrido, de los cortes, de rayos X, de la vista explotada, de los cambios de material, de la noche y del celular en modo oscuro.
- `casa.dxf` se auditó con ezdxf: 0 errores, 1.103 entidades y 17 capas más la 0 y Defpoints. También se dibujó con el motor de ezdxf para revisarlo.
- Las superficies se calculan desde los polígonos: planta baja 135,00 m², planta alta 105,60 m², 240,60 m² en total.

**No resuelto todavía**
- No pude ver el tablero de Pinterest: el enlace es de invitación (tablero secreto) y Pinterest redirige a su portada a quien no inició sesión.
- La orientación, los retiros y la ubicación de la habitación 4 son supuestos (ver `PLAN.md`).
- El DXF no se probó todavía en AutoCAD.

## Próximos pasos

1. Recibir las imágenes del tablero (capturas, o el tablero hecho público) y ajustar materiales, proporciones y detalles.
2. Confirmar la orientación del frente, el presupuesto y si la habitación 4 va arriba.
3. Ronda 2 de diseño con los cambios pedidos.
4. Con el diseño cerrado: anteproyecto técnico para el ingeniero (planta de fundaciones, estructura, planillas) y renders 8K en Blender Cycles.
