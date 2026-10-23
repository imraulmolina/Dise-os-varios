# Progreso

## Ronda 1 (23-oct-2026)

**Hecho**
- `casa-modelo.js` es el modelo paramétrico: 10 muros, 13 aberturas, 8 ambientes, 37 muebles, 38 tramos de instalaciones, equipos y exterior. Las superficies de los ambientes suman 120,00 m² y el FOS es del 33 %.
- `casa-3d.js` construye la escena Three.js. Cada objeto lleva su etapa, su sistema y su animación.
- `index.html` es el visor de obra: línea de tiempo por meses, rayos X, explotar, corte, sol real, cuatro vistas, recorrido y ficha.
- `cad.html` es la pantalla tipo CAD: dibujo animado en 7 pasos, ventana de selección, 3D estilo maqueta y exportación DXF.
- `casa.dxf` es el plano generado desde el modelo.

**Verificado**
- Las dos páginas se abrieron en Chromium sin interfaz, por servidor local y con doble clic (file://), sin errores de consola. Se revisaron capturas de cada etapa, de rayos X, explotar, planta, noche, recorrido, celular y modo oscuro.
- `casa.dxf` se auditó con ezdxf 1.4.5: 0 errores y 0 correcciones, 499 entidades en 14 capas. También se dibujó con el motor de ezdxf para revisarlo a ojo.
- **No probado:** abrir el DXF en un AutoCAD real.

**Decisiones**
- WebGL en lugar de WebGPU, para que funcione en más equipos.
- Todos los muros miden 15 cm, como pide el prompt del documento. En Paraguay el muro exterior suele ser de 30 cm: es un parámetro del modelo.
- Las cifras de la curva de inversión (US$ 720/m²) y de los meses de obra son de ejemplo.
- Los retiros (frente 5 m, laterales 1 m, fondo 13 m) son de ejemplo y no se verificaron contra la ordenanza de Asunción.

## Próximos pasos

1. Abrir `casa.dxf` en AutoCAD o BricsCAD y anotar lo que haya que corregir.
2. **Fase 0, validar:** cambiar el brief de ejemplo por el plano real de una constructora o inmobiliaria local (Prompt 3 del documento) y cobrarlo como servicio.
3. Exportar un vídeo cuadro por cuadro (Playwright + ffmpeg) del recorrido y de la obra por etapas, para usarlo en redes.
4. Pasar los datos de `casa-modelo.js` a un `casa.json` editable y sumar un validador de reglas: retiros, FOS/FOT y medidas mínimas.
5. Reemplazar los precios de ejemplo por una tabla de precios unitarios locales.
