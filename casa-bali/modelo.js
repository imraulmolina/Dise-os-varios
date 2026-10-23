/* Casa Bali: datos del proyecto (ronda 1).
 *
 * Solo datos. motor.js deriva de acá el plano, el DXF, el 3D, el cómputo y las instalaciones.
 * Coordenadas como en casa-3d: x de oeste a este, y del frente (calle) al fondo, en metros.
 * Muros, aberturas, ambientes y muebles van en coordenadas de casa (origen en la esquina
 * frontal oeste de la planta baja) y llevan el nivel al que pertenecen.
 */
(function (raiz) {
  'use strict';

  var MODELO = {
    nombre: 'Casa Bali',
    ronda: 1,
    ubicacion: { ciudad: 'Asunción, Paraguay', lat: -25.2867, lon: -57.647, utc: -3, frente: 'norte' },
    lote: { ancho: 12, fondo: 30 },
    casa: { origen: [1.2, 5], ancho: 9, fondo: 15 },
    muroExterior: 0.25,
    muroInterior: 0.15,
    columna: 0.20,
    viga: { ancho: 0.2, alto: 0.4 },

    niveles: [
      { id: 'PB', nombre: 'Planta baja', cota: 0.15, alturaLibre: 3.0, losa: 0.20, huella: [[0, 0], [9, 0], [9, 15], [0, 15]] },
      { id: 'PA', nombre: 'Planta alta', cota: 3.35, alturaLibre: 2.8, losa: 0.20, huella: [[0, 0], [9, 0], [9, 13], [0, 13]], parapeto: 0.6 }
    ],

    // Losa sobre cada nivel con sus huecos (doble altura, escalera, tragaluces).
    losas: [
      { sobre: 'PB', poli: [[0, 0], [9, 0], [9, 15], [0, 15]], huecos: [[[6.0, 3.8], [8.875, 3.8], [8.875, 7.6], [6.0, 7.6]]] },
      { sobre: 'PA', poli: [[0, 0], [9, 0], [9, 13], [0, 13]], techo: true }
    ],

    tragaluces: [
      { id: 'T1', nombre: 'Tragaluz de la doble altura', r: [6.3, 4.1, 8.6, 7.3] },
      { id: 'T2', nombre: 'Tragaluz baño compartido', r: [0.6, 4.3, 2.8, 5.8] },
      { id: 'T3', nombre: 'Tragaluz de la tina', r: [0.6, 10.5, 2.9, 12.3] },
      { id: 'T4', nombre: 'Tragaluz del walk-in', r: [3.9, 9.4, 4.9, 12.4] },
      { id: 'T5', nombre: 'Tragaluz del estar', r: [3.9, 5.0, 5.7, 7.0] }
    ],

    ejes: {
      x: [{ id: 'A', v: 0.125 }, { id: 'B', v: 3.6 }, { id: 'C', v: 6.0 }, { id: 'D', v: 8.875 }],
      y: [{ id: '1', v: 0.125 }, { id: '2', v: 3.8 }, { id: '3', v: 7.6 }, { id: '4', v: 12.875 }, { id: '5', v: 14.875 }]
    },
    // Columnas que no se construyen en cada nivel (el resto de las intersecciones sí).
    sinColumna: { PA: ['A5', 'B5', 'C5', 'D5'] },

    escaleras: [
      { id: 'E1', desde: 'PB', hasta: 'PA', x0: 7.6, x1: 8.75, y0: 2.75, huella: 0.285, escalones: 18, sube: 1 }
    ],

    barandas: [
      { nivel: 'PA', a: [6.0, 3.875], b: [6.0, 7.6] },
      { nivel: 'PA', a: [6.0, 7.6], b: [7.6, 7.6] },
      { nivel: 'PA', a: [0.15, 14.85], b: [8.85, 14.85], terraza: true },
      { nivel: 'PA', a: [8.85, 13.0], b: [8.85, 14.85], terraza: true },
      { nivel: 'PA', a: [0.15, 13.0], b: [0.15, 14.85], terraza: true }
    ],

    muros: [
      // Planta baja: exteriores
      { id: 'B1', nivel: 'PB', a: [0, 0.125], b: [9, 0.125], ext: true, revestimiento: [0, 3.6] },
      { id: 'B2', nivel: 'PB', a: [0, 14.875], b: [9, 14.875], ext: true },
      { id: 'B3', nivel: 'PB', a: [0.125, 0.25], b: [0.125, 14.75], ext: true },
      { id: 'B4', nivel: 'PB', a: [8.875, 0.25], b: [8.875, 14.75], ext: true },
      // Planta baja: interiores
      { id: 'B5', nivel: 'PB', a: [3.6, 0.25], b: [3.6, 3.875] },
      { id: 'B6', nivel: 'PB', a: [0.25, 3.8], b: [3.525, 3.8] },
      { id: 'B7', nivel: 'PB', a: [2.4, 3.875], b: [2.4, 7.675] },
      { id: 'B8', nivel: 'PB', a: [0.25, 5.8], b: [2.325, 5.8] },
      { id: 'B9', nivel: 'PB', a: [0.25, 7.6], b: [2.325, 7.6] },
      // Planta alta: exteriores
      { id: 'A1', nivel: 'PA', a: [0, 0.125], b: [9, 0.125], ext: true },
      { id: 'A2', nivel: 'PA', a: [0, 12.875], b: [9, 12.875], ext: true },
      { id: 'A3', nivel: 'PA', a: [0.125, 0.25], b: [0.125, 12.75], ext: true },
      { id: 'A4', nivel: 'PA', a: [8.875, 0.25], b: [8.875, 12.75], ext: true },
      // Planta alta: interiores
      { id: 'A5', nivel: 'PA', a: [4.6, 0.25], b: [4.6, 3.725] },
      { id: 'A6', nivel: 'PA', a: [0.25, 3.8], b: [8.75, 3.8] },
      { id: 'A7', nivel: 'PA', a: [3.6, 3.875], b: [3.6, 8.725] },
      { id: 'A8', nivel: 'PA', a: [0.25, 6.3], b: [3.525, 6.3] },
      { id: 'A9', nivel: 'PA', a: [0.25, 8.8], b: [8.75, 8.8] },
      { id: 'A10', nivel: 'PA', a: [3.4, 8.875], b: [3.4, 12.75] },
      { id: 'A11', nivel: 'PA', a: [5.4, 8.875], b: [5.4, 12.75] }
    ],

    // desde/hasta sobre el eje del muro. Puertas: bisagra 'desde'|'hasta', lado +1/-1 hacia +y (o +x).
    // celosia: listones de madera delante de la ventana (lado exterior).
    aberturas: [
      // PB frente
      { id: 'VB1', muro: 'B1', tipo: 'ventana', desde: 0.8, hasta: 2.8, antepecho: 0.9, alto: 1.6, celosia: true },
      { id: 'PB1', muro: 'B1', tipo: 'pivotante', desde: 3.9, hasta: 5.3, antepecho: 0, alto: 2.8, nombre: 'Puerta pivotante de teca' },
      { id: 'VB2', muro: 'B1', tipo: 'ventana', desde: 6.3, hasta: 6.7, antepecho: 0.3, alto: 2.4 },
      { id: 'VB3', muro: 'B1', tipo: 'ventana', desde: 7.3, hasta: 8.6, antepecho: 0.9, alto: 1.6, celosia: true },
      // PB fondo: tres paños corredizos entre columnas
      { id: 'VB4', muro: 'B2', tipo: 'corrediza', desde: 0.35, hasta: 3.45, antepecho: 0, alto: 2.8 },
      { id: 'VB5', muro: 'B2', tipo: 'corrediza', desde: 3.75, hasta: 5.85, antepecho: 0, alto: 2.8 },
      { id: 'VB6', muro: 'B2', tipo: 'corrediza', desde: 6.15, hasta: 8.65, antepecho: 0, alto: 2.8 },
      // PB oeste (lado del vecino): altas o de servicio
      { id: 'VB7', muro: 'B3', tipo: 'ventana', desde: 4.4, hasta: 5.4, antepecho: 1.9, alto: 0.6 },
      { id: 'PB2', muro: 'B3', tipo: 'puerta', desde: 5.95, hasta: 6.75, antepecho: 0, alto: 2.1, bisagra: 'desde', lado: 1 },
      { id: 'VB8', muro: 'B3', tipo: 'ventana', desde: 8.6, hasta: 10.6, antepecho: 1.2, alto: 1.0 },
      // PB este (jardín lateral): vidrio de piso a techo junto a la escalera y al living
      { id: 'VB9', muro: 'B4', tipo: 'fijo', desde: 4.0, hasta: 7.3, antepecho: 0.0, alto: 3.0 },
      { id: 'VB10', muro: 'B4', tipo: 'fijo', desde: 8.4, hasta: 12.4, antepecho: 0.0, alto: 3.0 },
      // PB interiores
      { id: 'PB3', muro: 'B6', tipo: 'puerta', desde: 2.6, hasta: 3.4, antepecho: 0, alto: 2.2, bisagra: 'hasta', lado: -1 },
      { id: 'PB4', muro: 'B7', tipo: 'puerta', desde: 4.3, hasta: 5.0, antepecho: 0, alto: 2.2, bisagra: 'desde', lado: -1 },
      { id: 'PB5', muro: 'B7', tipo: 'puerta', desde: 6.0, hasta: 6.75, antepecho: 0, alto: 2.2, bisagra: 'desde', lado: -1 },

      // PA frente: dos volúmenes con celosía
      { id: 'VA1', muro: 'A1', tipo: 'ventana', desde: 0.8, hasta: 3.4, antepecho: 0.9, alto: 1.6, celosia: true },
      { id: 'VA2', muro: 'A1', tipo: 'ventana', desde: 6.3, hasta: 8.4, antepecho: 0.9, alto: 1.6, celosia: true },
      // PA fondo: baño con tina hacia la jardinera y corrediza del dormitorio principal a la terraza
      { id: 'VA3', muro: 'A2', tipo: 'ventana', desde: 0.5, hasta: 2.6, antepecho: 0.55, alto: 1.9 },
      { id: 'VA4', muro: 'A2', tipo: 'corrediza', desde: 6.3, hasta: 8.5, antepecho: 0, alto: 2.5 },
      // PA oeste (vecino): solo ventilación alta
      { id: 'VA5', muro: 'A3', tipo: 'ventana', desde: 4.4, hasta: 5.6, antepecho: 1.8, alto: 0.6 },
      { id: 'VA6', muro: 'A3', tipo: 'ventana', desde: 9.5, hasta: 10.5, antepecho: 1.8, alto: 0.6 },
      // PA este
      { id: 'VA7', muro: 'A4', tipo: 'ventana', desde: 1.0, hasta: 2.8, antepecho: 1.6, alto: 0.8 },
      { id: 'VA8', muro: 'A4', tipo: 'fijo', desde: 4.2, hasta: 7.3, antepecho: 0.3, alto: 2.4 },
      { id: 'VA9', muro: 'A4', tipo: 'ventana', desde: 9.6, hasta: 12.0, antepecho: 0.9, alto: 1.5, celosia: true },
      // PA interiores
      { id: 'PA1', muro: 'A6', tipo: 'puerta', desde: 3.75, hasta: 4.5, antepecho: 0, alto: 2.2, bisagra: 'desde', lado: -1 },
      { id: 'PA2', muro: 'A6', tipo: 'puerta', desde: 4.75, hasta: 5.55, antepecho: 0, alto: 2.2, bisagra: 'desde', lado: -1 },
      { id: 'PA3', muro: 'A7', tipo: 'puerta', desde: 4.4, hasta: 5.1, antepecho: 0, alto: 2.2, bisagra: 'desde', lado: -1 },
      { id: 'PA4', muro: 'A7', tipo: 'puerta', desde: 7.4, hasta: 8.1, antepecho: 0, alto: 2.2, bisagra: 'desde', lado: -1 },
      { id: 'PA5', muro: 'A9', tipo: 'puerta', desde: 6.2, hasta: 7.0, antepecho: 0, alto: 2.2, bisagra: 'desde', lado: 1 },
      { id: 'PA6', muro: 'A10', tipo: 'puerta', desde: 9.0, hasta: 9.8, antepecho: 0, alto: 2.2, bisagra: 'desde', lado: -1 },
      { id: 'PA7', muro: 'A11', tipo: 'puerta', desde: 9.0, hasta: 9.8, antepecho: 0, alto: 2.2, bisagra: 'hasta', lado: -1 }
    ],

    ambientes: [
      { id: 'D4', nivel: 'PB', nombre: 'Habitación 4', sub: 'huéspedes / estudio', piso: 'madera', poli: [[0, 0], [3.6, 0], [3.6, 3.8], [0, 3.8]], etiqueta: [1.9, 1.05] },
      { id: 'BV', nivel: 'PB', nombre: 'Baño', piso: 'piedra', poli: [[0, 3.8], [2.4, 3.8], [2.4, 5.8], [0, 5.8]], etiqueta: [1.6, 4.65] },
      { id: 'LV', nivel: 'PB', nombre: 'Lavadero', piso: 'ceramica', poli: [[0, 5.8], [2.4, 5.8], [2.4, 7.6], [0, 7.6]], etiqueta: [1.5, 6.45] },
      { id: 'GA', nivel: 'PB', nombre: 'Galería', piso: 'porcelanato', poli: [[2.4, 3.8], [3.6, 3.8], [3.6, 4.0], [6.0, 4.0], [6.0, 7.6], [2.4, 7.6]], etiqueta: [4.4, 5.8] },
      { id: 'HA', nivel: 'PB', nombre: 'Hall de entrada', piso: 'porcelanato', poli: [[3.6, 0], [9, 0], [9, 4.0], [3.6, 4.0]], etiqueta: [5.6, 2.2] },
      { id: 'JI', nivel: 'PB', nombre: 'Jardín interior', piso: 'canto', dobleAltura: true, poli: [[6.0, 4.0], [9, 4.0], [9, 7.6], [6.0, 7.6]], etiqueta: [6.8, 5.8], rotEtiqueta: 90 },
      { id: 'CO', nivel: 'PB', nombre: 'Cocina', piso: 'porcelanato', poli: [[0, 7.6], [3.6, 7.6], [3.6, 11.6], [0, 11.6]], etiqueta: [2.1, 8.2] },
      { id: 'LI', nivel: 'PB', nombre: 'Living-comedor', piso: 'porcelanato', poli: [[3.6, 7.6], [9, 7.6], [9, 15], [0, 15], [0, 11.6], [3.6, 11.6]], etiqueta: [7.4, 10.4] },

      { id: 'H2', nivel: 'PA', nombre: 'Habitación 2', piso: 'madera', poli: [[0, 0], [4.6, 0], [4.6, 3.8], [0, 3.8]], etiqueta: [2.2, 0.9] },
      { id: 'H3', nivel: 'PA', nombre: 'Habitación 3', piso: 'madera', poli: [[4.6, 0], [9, 0], [9, 3.8], [4.6, 3.8]], etiqueta: [7.0, 1.0] },
      { id: 'B2', nivel: 'PA', nombre: 'Baño compartido', piso: 'piedra', poli: [[0, 3.8], [3.6, 3.8], [3.6, 6.3], [0, 6.3]], etiqueta: [1.8, 4.75] },
      { id: 'DE', nivel: 'PA', nombre: 'Ropería', piso: 'madera', poli: [[0, 6.3], [3.6, 6.3], [3.6, 8.8], [0, 8.8]], etiqueta: [2.2, 7.4] },
      { id: 'ES', nivel: 'PA', nombre: 'Estar familiar', piso: 'madera', poli: [[3.6, 3.8], [6.0, 3.8], [6.0, 8.8], [3.6, 8.8]], etiqueta: [4.8, 4.4] },
      { id: 'VA', nivel: 'PA', nombre: 'Doble altura', vacio: true, poli: [[6.0, 3.8], [9, 3.8], [9, 7.6], [6.0, 7.6]], etiqueta: [7.0, 5.2] },
      { id: 'PS', nivel: 'PA', nombre: 'Pasillo', piso: 'madera', poli: [[6.0, 7.6], [9, 7.6], [9, 8.8], [6.0, 8.8]], etiqueta: [7.4, 8.4] },
      { id: 'BP', nivel: 'PA', nombre: 'Baño principal', piso: 'piedra', poli: [[0, 8.8], [3.4, 8.8], [3.4, 13], [0, 13]], etiqueta: [1.7, 11.0] },
      { id: 'WI', nivel: 'PA', nombre: 'Walk-in closet', piso: 'madera', poli: [[3.4, 8.8], [5.4, 8.8], [5.4, 13], [3.4, 13]], etiqueta: [4.4, 10.3], rotEtiqueta: 90 },
      { id: 'DP', nivel: 'PA', nombre: 'Habitación principal', piso: 'madera', poli: [[5.4, 8.8], [9, 8.8], [9, 13], [5.4, 13]], etiqueta: [7.6, 9.4] },
      { id: 'TE', nivel: 'PA', nombre: 'Terraza', exterior: true, piso: 'deck', poli: [[0, 13], [9, 13], [9, 15], [0, 15]], etiqueta: [5.4, 13.6] }
    ],

    // frente: hacia dónde mira el mueble (N = -y, S = +y, E = +x, O = -x).
    muebles: [
      // PB · habitación 4
      { nivel: 'PB', tipo: 'cama', x: 1.15, y: 2.6, w: 1.4, d: 1.95, frente: 'E' },
      { nivel: 'PB', tipo: 'mesaLuz', x: 0.45, y: 1.55, w: 0.45, d: 0.4, frente: 'E' },
      { nivel: 'PB', tipo: 'escritorio', x: 2.1, y: 0.55, w: 1.3, d: 0.55, frente: 'S' },
      { nivel: 'PB', tipo: 'placard', x: 3.225, y: 1.5, w: 1.9, d: 0.6, frente: 'O' },
      // PB · baño
      { nivel: 'PB', tipo: 'ducha', x: 0.75, y: 5.25, w: 0.9, d: 1.0, frente: 'E' },
      { nivel: 'PB', tipo: 'inodoro', x: 0.6, y: 4.2, w: 0.4, d: 0.7, frente: 'E' },
      { nivel: 'PB', tipo: 'lavatorio', x: 1.75, y: 5.5, w: 0.6, d: 0.45, frente: 'N' },
      // PB · lavadero
      { nivel: 'PB', tipo: 'piletaLavadero', x: 0.6, y: 7.2, w: 0.6, d: 0.6, frente: 'N' },
      { nivel: 'PB', tipo: 'lavarropas', x: 1.3, y: 7.2, w: 0.6, d: 0.6, frente: 'N' },
      // PB · hall, galería y jardín interior
      { nivel: 'PB', tipo: 'consola', x: 3.85, y: 1.9, w: 1.2, d: 0.35, frente: 'E' },
      { nivel: 'PB', tipo: 'jardinInterior', x: 6.8, y: 5.8, w: 3.4, d: 1.5, frente: 'E' },
      // PB · cocina
      { nivel: 'PB', tipo: 'mesada', x: 0.55, y: 9.175, w: 2.85, d: 0.6, frente: 'E' },
      { nivel: 'PB', tipo: 'bacha', x: 0.55, y: 9.7, w: 0.8, d: 0.45, frente: 'E' },
      { nivel: 'PB', tipo: 'anafe', x: 0.55, y: 8.35, w: 0.6, d: 0.5, frente: 'E' },
      { nivel: 'PB', tipo: 'heladera', x: 0.6, y: 11.0, w: 0.75, d: 0.7, frente: 'E' },
      { nivel: 'PB', tipo: 'isla', x: 2.25, y: 9.4, w: 2.2, d: 0.95, frente: 'E' },
      { nivel: 'PB', tipo: 'banqueta', x: 3.05, y: 8.7, w: 0.4, d: 0.4, frente: 'O' },
      { nivel: 'PB', tipo: 'banqueta', x: 3.05, y: 9.4, w: 0.4, d: 0.4, frente: 'O' },
      { nivel: 'PB', tipo: 'banqueta', x: 3.05, y: 10.1, w: 0.4, d: 0.4, frente: 'O' },
      // PB · comedor
      { nivel: 'PB', tipo: 'mesa', x: 5.0, y: 9.6, w: 2.2, d: 1.0, frente: 'S' },
      { nivel: 'PB', tipo: 'silla', x: 4.3, y: 8.7, w: 0.45, d: 0.45, frente: 'S' },
      { nivel: 'PB', tipo: 'silla', x: 5.0, y: 8.7, w: 0.45, d: 0.45, frente: 'S' },
      { nivel: 'PB', tipo: 'silla', x: 5.7, y: 8.7, w: 0.45, d: 0.45, frente: 'S' },
      { nivel: 'PB', tipo: 'silla', x: 4.3, y: 10.5, w: 0.45, d: 0.45, frente: 'N' },
      { nivel: 'PB', tipo: 'silla', x: 5.0, y: 10.5, w: 0.45, d: 0.45, frente: 'N' },
      { nivel: 'PB', tipo: 'silla', x: 5.7, y: 10.5, w: 0.45, d: 0.45, frente: 'N' },
      // PB · living
      { nivel: 'PB', tipo: 'alfombra', x: 1.9, y: 13.25, w: 3.0, d: 2.6, frente: 'O' },
      { nivel: 'PB', tipo: 'rack', x: 0.5, y: 13.25, w: 2.2, d: 0.45, frente: 'E' },
      { nivel: 'PB', tipo: 'sofa', x: 2.95, y: 13.25, w: 2.8, d: 0.95, frente: 'O' },
      { nivel: 'PB', tipo: 'mesaRatona', x: 1.75, y: 13.25, w: 1.1, d: 0.6, frente: 'O' },
      { nivel: 'PB', tipo: 'sillon', x: 7.7, y: 12.2, w: 0.85, d: 0.85, frente: 'O' },
      { nivel: 'PB', tipo: 'sillon', x: 7.7, y: 13.7, w: 0.85, d: 0.85, frente: 'O' },
      { nivel: 'PB', tipo: 'mesaRatona', x: 6.75, y: 12.95, w: 0.6, d: 0.6, frente: 'O' },
      { nivel: 'PB', tipo: 'maceta', x: 8.35, y: 14.35, w: 0.55, d: 0.55, frente: 'O' },
      { nivel: 'PB', tipo: 'maceta', x: 3.15, y: 14.35, w: 0.5, d: 0.5, frente: 'O' },

      // PA · habitación 2
      { nivel: 'PA', tipo: 'cama', x: 2.2, y: 2.65, w: 1.6, d: 2.0, frente: 'N' },
      { nivel: 'PA', tipo: 'mesaLuz', x: 1.15, y: 3.45, w: 0.45, d: 0.4, frente: 'N' },
      { nivel: 'PA', tipo: 'mesaLuz', x: 3.25, y: 3.45, w: 0.45, d: 0.4, frente: 'N' },
      { nivel: 'PA', tipo: 'placard', x: 0.55, y: 1.75, w: 2.6, d: 0.6, frente: 'E' },
      { nivel: 'PA', tipo: 'escritorio', x: 4.25, y: 1.0, w: 1.2, d: 0.55, frente: 'O' },
      // PA · habitación 3
      { nivel: 'PA', tipo: 'cama', x: 6.8, y: 2.65, w: 1.6, d: 2.0, frente: 'N' },
      { nivel: 'PA', tipo: 'mesaLuz', x: 5.75, y: 3.45, w: 0.45, d: 0.4, frente: 'N' },
      { nivel: 'PA', tipo: 'mesaLuz', x: 7.85, y: 3.45, w: 0.45, d: 0.4, frente: 'N' },
      { nivel: 'PA', tipo: 'placard', x: 8.45, y: 1.75, w: 2.6, d: 0.6, frente: 'O' },
      { nivel: 'PA', tipo: 'escritorio', x: 5.3, y: 0.55, w: 1.1, d: 0.55, frente: 'S' },
      // PA · baño compartido (con tragaluz)
      { nivel: 'PA', tipo: 'ducha', x: 0.8, y: 5.65, w: 1.0, d: 1.1, frente: 'E' },
      { nivel: 'PA', tipo: 'lavatorio', x: 1.6, y: 4.1, w: 1.0, d: 0.45, frente: 'S' },
      { nivel: 'PA', tipo: 'inodoro', x: 2.6, y: 5.85, w: 0.4, d: 0.7, frente: 'N' },
      // PA · ropería
      { nivel: 'PA', tipo: 'placard', x: 0.55, y: 7.55, w: 2.3, d: 0.6, frente: 'E' },
      // PA · estar familiar
      { nivel: 'PA', tipo: 'alfombra', x: 4.8, y: 6.2, w: 1.9, d: 2.4, frente: 'E' },
      { nivel: 'PA', tipo: 'sofa', x: 4.15, y: 6.2, w: 2.2, d: 0.9, frente: 'E' },
      { nivel: 'PA', tipo: 'mesaRatona', x: 5.25, y: 6.2, w: 0.9, d: 0.5, frente: 'E' },
      { nivel: 'PA', tipo: 'maceta', x: 5.65, y: 8.4, w: 0.5, d: 0.5, frente: 'O' },
      // PA · baño principal: tina bajo tragaluz, ducha vidriada, doble bacha
      { nivel: 'PA', tipo: 'tina', x: 1.55, y: 12.05, w: 1.7, d: 0.8, frente: 'N' },
      { nivel: 'PA', tipo: 'ducha', x: 0.8, y: 9.6, w: 1.3, d: 1.1, frente: 'E' },
      { nivel: 'PA', tipo: 'lavatorio', x: 3.05, y: 10.9, w: 1.4, d: 0.55, frente: 'O' },
      { nivel: 'PA', tipo: 'inodoro', x: 3.0, y: 12.3, w: 0.4, d: 0.7, frente: 'O' },
      // PA · walk-in closet
      { nivel: 'PA', tipo: 'placard', x: 3.725, y: 11.35, w: 2.7, d: 0.5, frente: 'E', abierto: true },
      { nivel: 'PA', tipo: 'placard', x: 5.075, y: 11.35, w: 2.7, d: 0.5, frente: 'O', abierto: true },
      // PA · habitación principal
      { nivel: 'PA', tipo: 'cama', x: 6.475, y: 11.2, w: 1.8, d: 2.0, frente: 'E' },
      { nivel: 'PA', tipo: 'mesaLuz', x: 5.7, y: 9.95, w: 0.45, d: 0.4, frente: 'E' },
      { nivel: 'PA', tipo: 'mesaLuz', x: 5.7, y: 12.45, w: 0.45, d: 0.4, frente: 'E' },
      { nivel: 'PA', tipo: 'sillon', x: 8.2, y: 9.55, w: 0.8, d: 0.8, frente: 'S' },
      // PA · terraza
      { nivel: 'PA', tipo: 'jardinera', x: 4.5, y: 14.6, w: 8.6, d: 0.45, frente: 'N' },
      { nivel: 'PA', tipo: 'jardinera', x: 1.7, y: 13.35, w: 2.6, d: 0.45, frente: 'N' },
      { nivel: 'PA', tipo: 'reposera', x: 6.6, y: 13.75, w: 0.65, d: 1.2, frente: 'S' },
      { nivel: 'PA', tipo: 'reposera', x: 7.6, y: 13.75, w: 0.65, d: 1.2, frente: 'S' }
    ],

    // Exterior en coordenadas de lote.
    exterior: {
      vereda: { y0: -2.5, y1: 0 },
      calle: { y0: -9.5, y1: -2.5 },
      cochera: [6.5, 0, 11.8, 5],
      pasos: [[5.8, 0.35], [5.8, 1.25], [5.8, 2.15], [5.8, 3.05], [5.8, 3.95]],
      espejoAgua: [1.4, 0.8, 4.7, 4.3],
      senderoEste: { x: 11.0, y0: 5.4, y1: 20.5 },
      galeria: [1.2, 20, 10.2, 22.4],
      deck: [3.9, 22.4, 11.85, 27.6],
      piscina: { r: [4.4, 23.0, 11.2, 26.6], prof: 1.4 },
      bale: { r: [0.6, 25.2, 4.0, 29.2], alto: 2.6, techo: 2.2, nombre: 'Bale-quincho con parrilla' },
      ducha: [11.3, 22.9],
      reposeras: [{ x: 6.2, y: 28.3 }, { x: 7.6, y: 28.3 }],
      mesaGaleria: { x: 5.7, y: 21.2 },
      muroPerimetral: 2.4,
      bambu: [[11.75, 5.5, 11.75, 19.5], [0.25, 22.5, 0.25, 24.8], [4.6, 29.75, 11.6, 29.75]],
      arboles: [
        { tipo: 'frangipani', x: 2.2, y: 23.6, r: 1.5, alto: 4.0 },
        { tipo: 'frangipani', x: 11.0, y: 28.6, r: 1.4, alto: 3.8 },
        { tipo: 'pindo', x: 5.0, y: 29.1, alto: 7.5 },
        { tipo: 'pindo', x: 8.8, y: 29.2, alto: 6.5 },
        { tipo: 'frangipani', x: 0.9, y: 1.4, r: 1.2, alto: 3.4 }
      ],
      faroles: [[5.0, 4.6], [10.6, 8.0], [10.6, 14.0], [10.6, 20.0], [4.1, 24.0], [11.4, 27.4]]
    },

    // Equipos sobre la azotea y puntos fijos de instalaciones (coordenadas de casa).
    equipos: {
      tanque: [1.8, 7.6],
      solar: [1.8, 3.0],
      montante: [0.35, 6.45],
      bajada: [0.35, 6.95],
      tablero: [3.75, 0.7],
      camara: [-0.6, -0.8],
      pilar: [3.7, -4.7],
      condensadoras: [[2.6, 10.6], [2.6, 11.4], [2.6, 12.2], [5.0, 10.6], [5.0, 11.4], [5.0, 12.2]],
      splits: [
        { nivel: 'PB', p: [3.475, 2.2], eje: 'y', amb: 'D4' },
        { nivel: 'PB', p: [0.3, 13.25], eje: 'y', amb: 'LI', alto: 2.6 },
        { nivel: 'PA', p: [2.2, 3.675], eje: 'x', amb: 'H2' },
        { nivel: 'PA', p: [6.8, 3.675], eje: 'x', amb: 'H3' },
        { nivel: 'PA', p: [5.525, 11.2], eje: 'y', amb: 'DP' },
        { nivel: 'PA', p: [3.725, 5.4], eje: 'y', amb: 'ES' }
      ]
    },

    // Materiales elegibles: el visor 3D los aplica en vivo.
    materiales: {
      fachada: { nombre: 'Fachada', elegido: 'blanco', opciones: { blanco: { nombre: 'Revoque blanco', color: '#f1eee8' }, arena: { nombre: 'Revoque arena', color: '#e3d6c1' }, gris: { nombre: 'Gris cálido', color: '#cfcac1' } } },
      revestimiento: { nombre: 'Revestimiento', elegido: 'piedra', opciones: { piedra: { nombre: 'Piedra volcánica', color: '#5d5a55' }, teca: { nombre: 'Madera teca', color: '#9a6a40' }, ladrillo: { nombre: 'Ladrillo visto', color: '#b0623e' } } },
      madera: { nombre: 'Celosías y puertas', elegido: 'teca', opciones: { teca: { nombre: 'Teca', color: '#9a6a40' }, nogal: { nombre: 'Nogal oscuro', color: '#5b3d2a' }, bambu: { nombre: 'Bambú claro', color: '#c9a66b' } } },
      pisoSocial: { nombre: 'Piso social', elegido: 'piedra', opciones: { piedra: { nombre: 'Porcelanato símil piedra', color: '#d8d2c6' }, madera: { nombre: 'Madera', color: '#b3825a' }, microcemento: { nombre: 'Microcemento', color: '#bdb8b0' } } },
      piscina: { nombre: 'Piscina', elegido: 'sukabumi', opciones: { sukabumi: { nombre: 'Piedra verde (sukabumi)', color: '#3a9f99' }, azul: { nombre: 'Venecita azul', color: '#2b8fd6' }, oscura: { nombre: 'Piedra oscura', color: '#2c5d63' } } }
    }
  };

  raiz.MODELO_CASA = MODELO;
  if (typeof module === 'object' && module.exports) module.exports = MODELO;
})(this);
