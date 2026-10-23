/* Casa Asunción 120: modelo paramétrico único.
 *
 * Todo lo que muestran index.html (obra 3D) y cad.html (plano) sale de este objeto:
 * piezas de muro, plano 2D por pasos, DXF, cómputo y ficha. Nada se dibuja a mano en otra parte.
 *
 * Convenciones
 *   - Unidades: metros.
 *   - Coordenadas de lote: x de oeste a este (0..12), y del frente (norte, calle) al fondo (sur) (0..30).
 *   - Coordenadas de casa: igual que las de lote pero con origen en la esquina noroeste de la casa
 *     (casa.origen). Muros, aberturas, ambientes, muebles e instalaciones usan coordenadas de casa.
 *   - h: altura sobre el terreno natural (0). El piso terminado está en niveles.piso.
 *
 * Navegador: window.CASA.  Node: require('./casa-modelo.js').  CLI: node casa-modelo.js > casa.dxf
 */
(function (raiz, fabrica) {
  var CASA = fabrica();
  if (typeof module === 'object' && module.exports) {
    module.exports = CASA;
    if (typeof require === 'function' && require.main === module) {
      process.stdout.write(Buffer.from(CASA.exportarDXF(), 'latin1'));
    }
  } else {
    raiz.CASA = CASA;
  }
})(this, function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Modelo
  // ---------------------------------------------------------------------------

  var modelo = {
    nombre: 'Casa Asunción 120',
    ubicacion: { ciudad: 'Asunción, Paraguay', lat: -25.2867, lon: -57.647, utc: -3 },
    lote: { ancho: 12, fondo: 30 },
    casa: { origen: [1, 5], ancho: 10, fondo: 12 },
    niveles: { piso: 0.15, alturaLibre: 2.70, losa: 0.12, parapeto: 0.55, contrapiso: 0.10 },
    muro: 0.15,
    columna: 0.18,
    viga: { ancho: 0.15, alto: 0.25 },

    ejes: {
      x: [{ id: 'A', v: 0.1 }, { id: 'B', v: 4.0 }, { id: 'C', v: 9.9 }],
      y: [{ id: '1', v: 0.1 }, { id: '2', v: 6.0 }, { id: '3', v: 11.9 }]
    },

    // Muros por eje (centro del muro). ext = muro exterior (lleva parapeto).
    muros: [
      { id: 'M1', a: [0, 0.075], b: [10, 0.075], ext: true },
      { id: 'M2', a: [0, 11.925], b: [10, 11.925], ext: true },
      { id: 'M3', a: [0.075, 0.15], b: [0.075, 11.85], ext: true },
      { id: 'M4', a: [9.925, 0.15], b: [9.925, 11.85], ext: true },
      { id: 'M5', a: [4.0, 0.15], b: [4.0, 11.85] },
      { id: 'M6', a: [0.15, 3.6], b: [3.925, 3.6] },
      { id: 'M7', a: [0.15, 6.0], b: [2.725, 6.0] },
      { id: 'M8', a: [2.8, 3.675], b: [2.8, 7.525] },
      { id: 'M9', a: [0.15, 7.6], b: [3.925, 7.6] },
      { id: 'M10', a: [6.4, 0.15], b: [6.4, 2.6] }
    ],

    // desde/hasta: medidos sobre el eje del muro (x en muros horizontales, y en verticales).
    // Puertas: bisagra en 'desde' o 'hasta'; lado +1/-1 = hacia +y (o +x) / -y (o -x).
    aberturas: [
      { id: 'V1', muro: 'M1', tipo: 'ventana', desde: 1.0, hasta: 3.0, antepecho: 0.9, alto: 1.3 },
      { id: 'P1', muro: 'M1', tipo: 'puerta', desde: 4.7, hasta: 5.7, antepecho: 0, alto: 2.2, bisagra: 'desde', lado: 1, nombre: 'Entrada' },
      { id: 'V2', muro: 'M1', tipo: 'ventana', desde: 7.4, hasta: 9.2, antepecho: 1.05, alto: 1.0 },
      { id: 'V3', muro: 'M2', tipo: 'ventana', desde: 0.9, hasta: 3.1, antepecho: 0.6, alto: 1.6 },
      { id: 'V4', muro: 'M2', tipo: 'corrediza', desde: 4.9, hasta: 9.3, antepecho: 0, alto: 2.4 },
      { id: 'V5', muro: 'M3', tipo: 'ventana', desde: 4.2, hasta: 4.8, antepecho: 1.6, alto: 0.6 },
      { id: 'V6', muro: 'M3', tipo: 'ventana', desde: 6.5, hasta: 7.2, antepecho: 1.5, alto: 0.7 },
      { id: 'V7', muro: 'M4', tipo: 'ventana', desde: 6.8, hasta: 9.6, antepecho: 0.9, alto: 1.5 },
      { id: 'P2', muro: 'M5', tipo: 'puerta', desde: 4.45, hasta: 5.35, antepecho: 0, alto: 2.1, bisagra: 'desde', lado: 1 },
      { id: 'P3', muro: 'M6', tipo: 'puerta', desde: 3.0, hasta: 3.8, antepecho: 0, alto: 2.1, bisagra: 'hasta', lado: -1 },
      { id: 'P4', muro: 'M8', tipo: 'puerta', desde: 4.4, hasta: 5.1, antepecho: 0, alto: 2.1, bisagra: 'desde', lado: -1 },
      { id: 'P5', muro: 'M8', tipo: 'puerta', desde: 6.6, hasta: 7.3, antepecho: 0, alto: 2.1, bisagra: 'hasta', lado: -1 },
      { id: 'P6', muro: 'M9', tipo: 'puerta', desde: 3.0, hasta: 3.8, antepecho: 0, alto: 2.1, bisagra: 'hasta', lado: 1 }
    ],

    ambientes: [
      { id: 'D2', nombre: 'Dormitorio 2', piso: 'madera', poli: [[0, 0], [4, 0], [4, 3.6], [0, 3.6]], etiqueta: [2.0, 2.9], toma: [3.925, 2.4] },
      { id: 'BA', nombre: 'Baño', piso: 'ceramica', poli: [[0, 3.6], [2.8, 3.6], [2.8, 6], [0, 6]], etiqueta: [1.75, 4.75], toma: [2.2, 3.675] },
      { id: 'LV', nombre: 'Lavadero', piso: 'ceramica', poli: [[0, 6], [2.8, 6], [2.8, 7.6], [0, 7.6]], etiqueta: [1.65, 6.85], toma: [0.15, 6.85] },
      { id: 'PA', nombre: 'Pasillo', piso: 'porcelanato', poli: [[2.8, 3.6], [4, 3.6], [4, 7.6], [2.8, 7.6]], etiqueta: [3.4, 6.3], rotEtiqueta: 90 },
      { id: 'D1', nombre: 'Dormitorio principal', piso: 'madera', poli: [[0, 7.6], [4, 7.6], [4, 12], [0, 12]], etiqueta: [2.6, 11.2], toma: [3.925, 9.75] },
      { id: 'EN', nombre: 'Entrada', piso: 'porcelanato', poli: [[4, 0], [6.4, 0], [6.4, 2.6], [4, 2.6]], etiqueta: [5.2, 1.75], luz: [5.2, 1.6] },
      { id: 'CO', nombre: 'Cocina', piso: 'porcelanato', poli: [[6.4, 0], [10, 0], [10, 4], [6.4, 4]], etiqueta: [7.9, 1.45], luz: [7.9, 2.0], toma: [9.85, 1.2] },
      { id: 'LI', nombre: 'Living-comedor', piso: 'porcelanato', poli: [[4, 2.6], [6.4, 2.6], [6.4, 4], [10, 4], [10, 12], [4, 12]], etiqueta: [8.5, 7.35], luz: [7.0, 8.0], toma: [4.075, 10.3] }
    ],

    // frente: hacia dónde mira el mueble (N = -y, S = +y, E = +x, O = -x). w = ancho, d = profundidad.
    muebles: [
      { tipo: 'cama', x: 1.15, y: 1.9, w: 1.4, d: 1.95, frente: 'E' },
      { tipo: 'mesaLuz', x: 0.38, y: 0.95, w: 0.45, d: 0.4, frente: 'E' },
      { tipo: 'mesaLuz', x: 0.38, y: 2.85, w: 0.45, d: 0.4, frente: 'E' },
      { tipo: 'placard', x: 3.625, y: 0.95, w: 1.5, d: 0.6, frente: 'O' },
      { tipo: 'escritorio', x: 2.0, y: 0.45, w: 1.2, d: 0.5, frente: 'S' },

      { tipo: 'cama', x: 1.175, y: 9.75, w: 1.6, d: 2.0, frente: 'E' },
      { tipo: 'mesaLuz', x: 0.38, y: 8.65, w: 0.45, d: 0.4, frente: 'E' },
      { tipo: 'mesaLuz', x: 0.38, y: 10.85, w: 0.45, d: 0.4, frente: 'E' },
      { tipo: 'placard', x: 1.45, y: 7.975, w: 2.5, d: 0.6, frente: 'S' },

      { tipo: 'ducha', x: 0.6, y: 5.475, w: 0.9, d: 0.9, frente: 'E' },
      { tipo: 'inodoro', x: 0.5, y: 4.3, w: 0.4, d: 0.7, frente: 'E' },
      { tipo: 'lavatorio', x: 1.6, y: 3.9, w: 0.6, d: 0.45, frente: 'S' },

      { tipo: 'piletaLavadero', x: 0.45, y: 6.4, w: 0.55, d: 0.6, frente: 'E' },
      { tipo: 'lavarropas', x: 0.45, y: 7.15, w: 0.6, d: 0.6, frente: 'E' },

      { tipo: 'consola', x: 6.125, y: 1.5, w: 1.0, d: 0.35, frente: 'O' },

      { tipo: 'mesada', x: 8.1625, y: 0.45, w: 3.375, d: 0.6, frente: 'S' },
      { tipo: 'bacha', x: 8.3, y: 0.45, w: 0.8, d: 0.45, frente: 'S' },
      { tipo: 'anafe', x: 7.1, y: 0.45, w: 0.6, d: 0.5, frente: 'S' },
      { tipo: 'mesada', x: 9.55, y: 1.75, w: 2.0, d: 0.6, frente: 'O' },
      { tipo: 'heladera', x: 9.5, y: 3.3, w: 0.75, d: 0.7, frente: 'O' },
      { tipo: 'isla', x: 7.9, y: 2.55, w: 2.0, d: 0.9, frente: 'S' },
      { tipo: 'banqueta', x: 7.3, y: 3.35, w: 0.4, d: 0.4, frente: 'N' },
      { tipo: 'banqueta', x: 7.9, y: 3.35, w: 0.4, d: 0.4, frente: 'N' },
      { tipo: 'banqueta', x: 8.5, y: 3.35, w: 0.4, d: 0.4, frente: 'N' },

      { tipo: 'mesa', x: 7.0, y: 5.7, w: 2.0, d: 1.0, frente: 'S' },
      { tipo: 'silla', x: 6.4, y: 4.88, w: 0.45, d: 0.45, frente: 'S' },
      { tipo: 'silla', x: 7.0, y: 4.88, w: 0.45, d: 0.45, frente: 'S' },
      { tipo: 'silla', x: 7.6, y: 4.88, w: 0.45, d: 0.45, frente: 'S' },
      { tipo: 'silla', x: 6.4, y: 6.52, w: 0.45, d: 0.45, frente: 'N' },
      { tipo: 'silla', x: 7.0, y: 6.52, w: 0.45, d: 0.45, frente: 'N' },
      { tipo: 'silla', x: 7.6, y: 6.52, w: 0.45, d: 0.45, frente: 'N' },
      { tipo: 'alfombra', x: 5.7, y: 9.0, w: 3.0, d: 2.4, frente: 'O' },
      { tipo: 'rack', x: 4.3, y: 9.0, w: 2.0, d: 0.45, frente: 'E' },
      { tipo: 'sofa', x: 6.9, y: 9.0, w: 2.6, d: 0.95, frente: 'O' },
      { tipo: 'mesaRatona', x: 5.6, y: 9.0, w: 1.1, d: 0.6, frente: 'O' },
      { tipo: 'sillon', x: 5.6, y: 10.95, w: 0.85, d: 0.85, frente: 'N' },
      { tipo: 'maceta', x: 9.45, y: 11.45, w: 0.5, d: 0.5, frente: 'O' }
    ],

    // Exterior, en coordenadas de lote.
    exterior: {
      vereda: { y0: -2.5, y1: 0 },
      calle: { y0: -9.5, y1: -2.5 },
      camino: [5.6, 0, 6.8, 5],
      cochera: [7.4, 0, 11.6, 5],
      galeria: [1, 17, 11, 20],
      deck: [3, 21, 11, 27],
      piscina: { r: [3.5, 21.5, 10.5, 25], prof: 1.4 },
      pilar: [6.85, 0.05, 7.45, 0.45],
      muroPerimetral: 1.8,
      reposeras: [{ x: 5.2, y: 26.05 }, { x: 6.4, y: 26.05 }],
      mesaGaleria: { x: 5.5, y: 18.5 },
      arboles: [
        { tipo: 'lapacho', x: 2.6, y: 2.4, r: 2.1, alto: 6.5 },
        { tipo: 'pindo', x: 1.3, y: 22.6, alto: 7.5 },
        { tipo: 'pindo', x: 1.4, y: 28.4, alto: 8.5 },
        { tipo: 'pindo', x: 10.9, y: 28.6, alto: 7.0 },
        { tipo: 'copa', x: 7.6, y: 28.6, r: 1.5, alto: 4.2 }
      ]
    }
  };

  // ---------------------------------------------------------------------------
  // Instalaciones (coordenadas de casa, h absoluta). Exageradas en diámetro para que se lean.
  // ---------------------------------------------------------------------------

  var SISTEMAS = {
    aguaFria: { nombre: 'Agua fría', color: '#2f7fe0', radio: 0.022, dxf: 150 },
    aguaCaliente: { nombre: 'Agua caliente', color: '#e0442f', radio: 0.022, dxf: 1 },
    electricidad: { nombre: 'Electricidad', color: '#f2b705', radio: 0.014, dxf: 2 },
    desague: { nombre: 'Desagüe', color: '#8a6f55', radio: 0.045, dxf: 30 },
    aire: { nombre: 'Aire acondicionado', color: '#22c3c9', radio: 0.02, dxf: 4 }
  };

  function tramos() {
    var t = [];
    function add(sistema, pts) { t.push({ sistema: sistema, puntos: pts }); }
    var ps = modelo.niveles.piso;
    var losa = ps + modelo.niveles.alturaLibre + 0.07; // dentro de la losa

    // Agua fría: pilar de medidores → retiro oeste (enterrado) → lavadero → baño → cocina (bajo contrapiso)
    add('aguaFria', [[6.15, -4.65, -0.35], [6.15, -4.4, -0.35], [-0.45, -4.4, -0.35], [-0.45, 6.3, -0.35], [-0.45, 6.3, 0.45], [0.075, 6.3, 0.45]]);
    add('aguaFria', [[0.075, 7.15, 0.45], [0.075, 3.6, 0.45], [1.6, 3.6, 0.45], [3.9, 3.6, 0.45], [3.9, 3.6, -0.15], [8.3, 3.6, -0.15], [8.3, 0.075, -0.15], [8.3, 0.075, 0.6]]);
    add('aguaFria', [[0.075, 7.15, 0.45], [0.075, 7.15, 1.0]]);   // lavarropas
    add('aguaFria', [[0.075, 6.4, 0.45], [0.075, 6.4, 0.95]]);    // pileta lavadero
    add('aguaFria', [[0.075, 6.95, 0.45], [0.075, 6.95, 1.55]]);  // termocalefón
    add('aguaFria', [[0.075, 5.6, 0.45], [0.075, 5.6, 1.1]]);     // ducha
    add('aguaFria', [[0.075, 4.3, 0.45], [0.075, 4.3, 0.25]]);    // inodoro
    add('aguaFria', [[1.6, 3.6, 0.45], [1.6, 3.6, 0.6]]);         // lavatorio

    // Agua caliente: termocalefón → baño y cocina, en paralelo a la fría
    add('aguaCaliente', [[0.075, 7.25, 1.55], [0.075, 7.25, 0.55], [0.075, 3.6, 0.55], [1.75, 3.6, 0.55], [3.85, 3.6, 0.55], [3.85, 3.6, -0.08], [8.45, 3.6, -0.08], [8.45, 0.075, -0.08], [8.45, 0.075, 0.6]]);
    add('aguaCaliente', [[0.075, 5.35, 0.55], [0.075, 5.35, 1.1]]);
    add('aguaCaliente', [[1.75, 3.6, 0.55], [1.75, 3.6, 0.6]]);
    add('aguaCaliente', [[0.075, 6.6, 0.55], [0.075, 6.6, 0.95]]);

    // Desagüe cloacal: colector bajo contrapiso hacia la cámara de inspección del frente
    add('desague', [[1.2, 7.2, -0.28], [1.2, -4.4, -0.55], [1.2, -5.6, -0.6]]);
    add('desague', [[0.45, 7.15, 0.2], [0.45, 7.15, -0.28], [1.2, 7.15, -0.28]]);
    add('desague', [[0.45, 6.4, 0.6], [0.45, 6.4, -0.3], [1.2, 6.4, -0.3]]);
    add('desague', [[0.6, 5.475, 0.15], [0.6, 5.475, -0.32], [1.2, 5.475, -0.32]]);
    add('desague', [[0.35, 4.3, 0.2], [0.35, 4.3, -0.36], [1.2, 4.3, -0.36]]);
    add('desague', [[1.6, 3.85, 0.5], [1.6, 3.85, -0.38], [1.2, 3.85, -0.38]]);
    add('desague', [[8.3, 0.45, 0.6], [8.3, 0.45, -0.3], [8.3, -3.2, -0.45], [1.2, -3.2, -0.5]]);

    // Electricidad: acometida desde el pilar al tablero, circuitos por la losa a cada ambiente
    add('electricidad', [[6.15, -4.7, -0.3], [4.0, -4.7, -0.3], [4.0, 0.8, -0.3], [4.0, 0.8, 1.45]]);
    add('electricidad', [[4.0, 0.8, 1.75], [4.0, 0.8, losa]]);
    modelo.ambientes.forEach(function (a) {
      var l = luzAmbiente(a);
      add('electricidad', [[4.0, 0.8, losa], [4.0, l[1], losa], [l[0], l[1], losa], [l[0], l[1], losa - 0.1]]);
      if (a.toma) {
        add('electricidad', [[l[0], l[1], losa], [a.toma[0], l[1], losa], [a.toma[0], a.toma[1], losa], [a.toma[0], a.toma[1], 0.45]]);
      }
    });

    // Aire acondicionado: líneas frigoríficas de cada split a su condensadora exterior
    add('aire', [[9.85, 7.4, 2.4], [10.35, 7.4, 2.4], [10.35, 7.4, 0.75]]);
    add('aire', [[0.15, 9.75, 2.4], [-0.35, 9.75, 2.4], [-0.35, 9.75, 0.75]]);
    add('aire', [[0.15, 1.9, 2.4], [-0.35, 1.9, 2.4], [-0.35, 1.9, 0.75]]);
    return t;
  }

  // Equipos: objetos con forma de caja o cilindro asociados a un sistema.
  var equipos = [
    { id: 'tablero', sistema: 'electricidad', nombre: 'Tablero', p: [4.12, 0.8, 1.6], dim: [0.1, 0.4, 0.5] },
    { id: 'medidores', sistema: 'electricidad', nombre: 'Pilar de medidores', p: [6.15, -4.75, 0.8], dim: [0.6, 0.4, 1.6], exterior: true },
    { id: 'termo', sistema: 'aguaCaliente', nombre: 'Termocalefón', p: [0.4, 7.1, 1.85], cil: 0.22, alto: 0.75 },
    { id: 'camara', sistema: 'desague', nombre: 'Cámara de inspección', p: [1.2, -4.4, -0.25], dim: [0.6, 0.6, 0.5] },
    { id: 'split1', sistema: 'aire', nombre: 'Split living', p: [9.75, 7.4, 2.45], dim: [0.22, 0.95, 0.3] },
    { id: 'split2', sistema: 'aire', nombre: 'Split dormitorio principal', p: [0.25, 9.75, 2.45], dim: [0.22, 0.85, 0.3] },
    { id: 'split3', sistema: 'aire', nombre: 'Split dormitorio 2', p: [0.25, 1.9, 2.45], dim: [0.22, 0.85, 0.3] },
    { id: 'cond1', sistema: 'aire', nombre: 'Condensadora', p: [10.45, 7.4, 0.4], dim: [0.32, 0.8, 0.6] },
    { id: 'cond2', sistema: 'aire', nombre: 'Condensadora', p: [-0.45, 9.75, 0.4], dim: [0.32, 0.8, 0.6] },
    { id: 'cond3', sistema: 'aire', nombre: 'Condensadora', p: [-0.45, 1.9, 0.4], dim: [0.32, 0.8, 0.6] }
  ];

  // ---------------------------------------------------------------------------
  // Utilidades geométricas
  // ---------------------------------------------------------------------------

  function r6(v) { return Math.round(v * 1e6) / 1e6; }
  function aLote(p) { return [r6(p[0] + modelo.casa.origen[0]), r6(p[1] + modelo.casa.origen[1])]; }
  function muroPorId(id) { return modelo.muros.filter(function (m) { return m.id === id; })[0]; }
  function horizontal(m) { return Math.abs(m.a[1] - m.b[1]) < 1e-9; }

  function areaPoligono(p) {
    var s = 0;
    for (var i = 0; i < p.length; i++) {
      var a = p[i], b = p[(i + 1) % p.length];
      s += a[0] * b[1] - b[0] * a[1];
    }
    return Math.abs(s) / 2;
  }

  function centroide(p) {
    var x = 0, y = 0;
    p.forEach(function (q) { x += q[0]; y += q[1]; });
    return [x / p.length, y / p.length];
  }

  function luzAmbiente(a) { return a.luz || a.etiqueta || centroide(a.poli); }

  // Datos de un muro: eje ('x' u 'y'), rango sobre el eje y coordenada del centro.
  function infoMuro(m) {
    var h = horizontal(m);
    return {
      eje: h ? 'x' : 'y',
      ini: h ? Math.min(m.a[0], m.b[0]) : Math.min(m.a[1], m.b[1]),
      fin: h ? Math.max(m.a[0], m.b[0]) : Math.max(m.a[1], m.b[1]),
      c: h ? m.a[1] : m.a[0]
    };
  }

  function aberturasDe(id) {
    return modelo.aberturas.filter(function (o) { return o.muro === id; })
      .sort(function (a, b) { return a.desde - b.desde; });
  }

  // Piezas de muro en 3D: tramos macizos de piso a cielo y, en cada abertura, antepecho y dintel.
  function piezasMuro() {
    var piso = modelo.niveles.piso;
    var cielo = piso + modelo.niveles.alturaLibre;
    var piezas = [];
    modelo.muros.forEach(function (m) {
      var inf = infoMuro(m);
      var cursor = inf.ini;
      aberturasDe(m.id).forEach(function (o) {
        if (o.desde > cursor + 1e-9) piezas.push(pieza(m, inf, cursor, o.desde, piso, cielo, 'macizo'));
        if (o.antepecho > 0) piezas.push(pieza(m, inf, o.desde, o.hasta, piso, piso + o.antepecho, 'antepecho', o));
        if (piso + o.antepecho + o.alto < cielo - 1e-9) piezas.push(pieza(m, inf, o.desde, o.hasta, piso + o.antepecho + o.alto, cielo, 'dintel', o));
        cursor = o.hasta;
      });
      if (inf.fin > cursor + 1e-9) piezas.push(pieza(m, inf, cursor, inf.fin, piso, cielo, 'macizo'));
    });
    return piezas;
  }

  function pieza(m, inf, d0, d1, h0, h1, tipo, abertura) {
    var e = modelo.muro;
    var rect = inf.eje === 'x'
      ? [d0, inf.c - e / 2, d1, inf.c + e / 2]
      : [inf.c - e / 2, d0, inf.c + e / 2, d1];
    return { muro: m.id, ext: !!m.ext, tipo: tipo, eje: inf.eje, rect: rect, h0: h0, h1: h1, abertura: abertura ? abertura.id : null };
  }

  // Unión de rectángulos ortogonales: devuelve el contorno (segmentos) y franjas de relleno.
  function unionRects(rects) {
    var xs = [], ys = [];
    rects.forEach(function (r) { xs.push(r6(r[0]), r6(r[2])); ys.push(r6(r[1]), r6(r[3])); });
    xs = uniq(xs); ys = uniq(ys);
    var nx = xs.length - 1, ny = ys.length - 1;
    var lleno = [];
    for (var j = 0; j < ny; j++) {
      lleno.push([]);
      for (var i = 0; i < nx; i++) {
        var cx = (xs[i] + xs[i + 1]) / 2, cy = (ys[j] + ys[j + 1]) / 2;
        lleno[j].push(rects.some(function (r) { return cx > r[0] && cx < r[2] && cy > r[1] && cy < r[3]; }));
      }
    }
    function L(i, j) { return i >= 0 && j >= 0 && i < nx && j < ny && lleno[j][i]; }
    var segs = [];
    // Bordes horizontales
    for (j = 0; j <= ny; j++) {
      var abierto = null;
      for (i = 0; i <= nx; i++) {
        var borde = i < nx && L(i, j - 1) !== L(i, j);
        if (borde && abierto === null) abierto = xs[i];
        if (!borde && abierto !== null) { segs.push([[abierto, ys[j]], [xs[i], ys[j]]]); abierto = null; }
      }
    }
    // Bordes verticales
    for (i = 0; i <= nx; i++) {
      abierto = null;
      for (j = 0; j <= ny; j++) {
        borde = j < ny && L(i - 1, j) !== L(i, j);
        if (borde && abierto === null) abierto = ys[j];
        if (!borde && abierto !== null) { segs.push([[xs[i], abierto], [xs[i], ys[j]]]); abierto = null; }
      }
    }
    // Relleno: franjas horizontales de celdas llenas
    var franjas = [];
    for (j = 0; j < ny; j++) {
      var desde = null;
      for (i = 0; i <= nx; i++) {
        var f = i < nx && lleno[j][i];
        if (f && desde === null) desde = xs[i];
        if (!f && desde !== null) { franjas.push([desde, ys[j], xs[i], ys[j + 1]]); desde = null; }
      }
    }
    return { segmentos: segs, franjas: franjas };
  }

  function uniq(a) {
    return a.sort(function (p, q) { return p - q; })
      .filter(function (v, k, arr) { return k === 0 || Math.abs(v - arr[k - 1]) > 1e-7; });
  }

  // Rota un punto local de mueble (frente hacia +y) según su orientación.
  var GIROS = { S: 0, O: 90, N: 180, E: 270 };
  function transformador(mb) {
    var t = GIROS[mb.frente || 'S'] * Math.PI / 180;
    var c = Math.cos(t), s = Math.sin(t);
    return function (x, y) { return [r6(mb.x + x * c - y * s), r6(mb.y + x * s + y * c)]; };
  }

  // ---------------------------------------------------------------------------
  // Plano 2D por pasos (coordenadas de lote, y hacia el fondo)
  // ---------------------------------------------------------------------------

  var CAPAS = [
    { id: 'EJES', color: '#ff3b3b', aci: 1, tipo: 'CENTER' },
    { id: 'COLUMNAS', color: '#ffffff', aci: 7 },
    { id: 'MUROS', color: '#ffffff', aci: 7 },
    { id: 'MUROS-RELLENO', color: '#808080', aci: 8 },
    { id: 'CARPINTERIA', color: '#00ffff', aci: 4 },
    { id: 'MOBILIARIO', color: '#ff00ff', aci: 6 },
    { id: 'SANITARIOS', color: '#00bfff', aci: 140 },
    { id: 'COTAS', color: '#00ff00', aci: 3 },
    { id: 'TEXTO', color: '#ffff00', aci: 2 },
    { id: 'LOTE', color: '#ff7f00', aci: 30, tipo: 'DASHED' },
    { id: 'RETIROS', color: '#ffbf00', aci: 40, tipo: 'DASHED' },
    { id: 'SOLADOS', color: '#c0c0c0', aci: 9 },
    { id: 'PISCINA', color: '#007fff', aci: 150 },
    { id: 'VEGETACION', color: '#00a500', aci: 92 }
  ];

  function fmt(v) { return v.toFixed(2).replace('.', ','); }

  function planoPorPasos() {
    var o = modelo.casa.origen;
    var pasos = [];
    function P(p) { return aLote(p); }
    function linea(capa, a, b) { return { t: 'linea', capa: capa, p: [a, b] }; }
    function rectPoli(capa, r) { return { t: 'poli', capa: capa, cerrada: true, p: [[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]] }; }
    function rectCasa(capa, r) { var a = P([r[0], r[1]]), b = P([r[2], r[3]]); return rectPoli(capa, [a[0], a[1], b[0], b[1]]); }
    function texto(capa, p, h, s, rot) { return { t: 'texto', capa: capa, p: p, h: h, s: s, rot: rot || 0 }; }

    // 1. Ejes
    var ejes = [];
    var X0 = -2.4, X1 = modelo.casa.ancho + 1.6, Y0 = -2.4, Y1 = modelo.casa.fondo + 1.6;
    modelo.ejes.x.forEach(function (e) {
      ejes.push(linea('EJES', P([e.v, Y0 + 0.35]), P([e.v, Y1])));
      ejes.push({ t: 'circulo', capa: 'EJES', c: P([e.v, Y0]), r: 0.35 });
      ejes.push(texto('EJES', P([e.v, Y0]), 0.3, e.id));
    });
    modelo.ejes.y.forEach(function (e) {
      ejes.push(linea('EJES', P([X0 + 0.35, e.v]), P([X1, e.v])));
      ejes.push({ t: 'circulo', capa: 'EJES', c: P([X0, e.v]), r: 0.35 });
      ejes.push(texto('EJES', P([X0, e.v]), 0.3, e.id));
    });
    pasos.push({ id: 'ejes', nombre: 'Ejes', comando: 'LINEA', entidades: ejes });

    // 2. Columnas
    var cols = [], c2 = modelo.columna / 2;
    modelo.ejes.x.forEach(function (ex) {
      modelo.ejes.y.forEach(function (ey) {
        var r = [ex.v - c2, ey.v - c2, ex.v + c2, ey.v + c2];
        cols.push(rectCasa('COLUMNAS', r));
        var a = P([r[0], r[1]]), b = P([r[2], r[3]]);
        cols.push({ t: 'relleno', capa: 'COLUMNAS', r: [a[0], a[1], b[0], b[1]] });
      });
    });
    pasos.push({ id: 'columnas', nombre: 'Columnas', comando: 'RECTANG', entidades: cols });

    // 3. Muros: contorno de la unión de los tramos macizos (las aberturas quedan como vanos)
    var rects = [];
    modelo.muros.forEach(function (m) {
      var inf = infoMuro(m), cursor = inf.ini;
      aberturasDe(m.id).forEach(function (op) {
        if (op.desde > cursor) rects.push(pieza(m, inf, cursor, op.desde, 0, 1, 'macizo').rect);
        cursor = op.hasta;
      });
      if (inf.fin > cursor) rects.push(pieza(m, inf, cursor, inf.fin, 0, 1, 'macizo').rect);
    });
    var u = unionRects(rects.map(function (r) { var a = P([r[0], r[1]]), b = P([r[2], r[3]]); return [a[0], a[1], b[0], b[1]]; }));
    var muros = u.segmentos.map(function (s) { return linea('MUROS', s[0], s[1]); });
    u.franjas.forEach(function (f) { muros.push({ t: 'relleno', capa: 'MUROS-RELLENO', r: f }); });
    pasos.push({ id: 'muros', nombre: 'Muros', comando: 'POLILINEA', entidades: muros });

    // 4. Carpintería
    var carp = [], e = modelo.muro;
    modelo.aberturas.forEach(function (op) {
      var m = muroPorId(op.muro), inf = infoMuro(m);
      function Q(d, n) { return P(inf.eje === 'x' ? [d, inf.c + n] : [inf.c + n, d]); }
      if (op.tipo === 'puerta') {
        var dh = op.bisagra === 'desde' ? op.desde : op.hasta;
        var dl = op.bisagra === 'desde' ? op.hasta : op.desde;
        var ancho = op.hasta - op.desde;
        var cara = op.lado * e / 2;
        var bis = Q(dh, cara), hoja = Q(dh, cara + op.lado * ancho);
        carp.push(linea('CARPINTERIA', bis, hoja));
        var aHoja = ang(bis, hoja), aJamba = ang(bis, Q(dl, cara));
        var arco = ((aJamba - aHoja + 360) % 360) === 90 ? [aHoja, aJamba] : [aJamba, aHoja];
        carp.push({ t: 'arco', capa: 'CARPINTERIA', c: bis, r: ancho, a0: arco[0], a1: arco[1] });
        carp.push(linea('CARPINTERIA', Q(op.desde, -e / 2), Q(op.hasta, -e / 2)));
        carp.push(linea('CARPINTERIA', Q(op.desde, e / 2), Q(op.hasta, e / 2)));
      } else if (op.tipo === 'corrediza') {
        var mid = (op.desde + op.hasta) / 2;
        carp.push(linea('CARPINTERIA', Q(op.desde, -e / 2), Q(op.hasta, -e / 2)));
        carp.push(linea('CARPINTERIA', Q(op.desde, e / 2), Q(op.hasta, e / 2)));
        carp.push(linea('CARPINTERIA', Q(op.desde, -0.02), Q(mid + 0.05, -0.02)));
        carp.push(linea('CARPINTERIA', Q(mid - 0.05, 0.02), Q(op.hasta, 0.02)));
      } else {
        carp.push(linea('CARPINTERIA', Q(op.desde, -e / 2), Q(op.hasta, -e / 2)));
        carp.push(linea('CARPINTERIA', Q(op.desde, e / 2), Q(op.hasta, e / 2)));
        carp.push(linea('CARPINTERIA', Q(op.desde, -0.015), Q(op.hasta, -0.015)));
        carp.push(linea('CARPINTERIA', Q(op.desde, 0.015), Q(op.hasta, 0.015)));
      }
    });
    pasos.push({ id: 'carpinteria', nombre: 'Carpintería', comando: 'INSERT', entidades: carp });

    // 5. Mobiliario y sanitarios
    var mob = [];
    modelo.muebles.forEach(function (mb) { simboloMueble(mb).forEach(function (en) { mob.push(en); }); });
    pasos.push({ id: 'mobiliario', nombre: 'Mobiliario', comando: 'INSERT', entidades: mob });

    // 6. Cotas y textos
    var cot = [];
    function cotaCadena(puntos, eje, pos, off) {
      for (var k = 0; k < puntos.length - 1; k++) {
        var a = eje === 'x' ? [puntos[k], pos] : [pos, puntos[k]];
        var b = eje === 'x' ? [puntos[k + 1], pos] : [pos, puntos[k + 1]];
        cot.push({ t: 'cota', capa: 'COTAS', a: P(a), b: P(b), off: off });
      }
    }
    var W = modelo.casa.ancho, F = modelo.casa.fondo;
    cotaCadena([0, 4.0, 6.4, W], 'x', 0, -0.9);
    cotaCadena([0, W], 'x', 0, -1.5);
    cotaCadena([0, 3.6, 6.0, 7.6, F], 'y', 0, -0.9);
    cotaCadena([0, F], 'y', 0, -1.5);
    cotaCadena([0, 4.0, F], 'y', W, 0.9);
    cotaCadena([0, 2.8, 4.0, W], 'x', F, 0.9);
    modelo.ambientes.forEach(function (a) {
      var p = P(a.etiqueta || centroide(a.poli));
      var rot = a.rotEtiqueta || 0;
      var dy = rot ? 0 : 0.14;
      var dx = rot ? -0.14 : 0;
      cot.push(texto('TEXTO', [p[0] + dx, p[1] - dy], a.nombre.length > 14 ? 0.15 : 0.17, a.nombre.toUpperCase(), rot));
      cot.push(texto('TEXTO', [p[0] - dx, p[1] + dy + 0.04], 0.12, fmt(areaPoligono(a.poli)) + ' m²', rot));
    });
    cot.push(texto('TEXTO', P([W + 4.2, 1.2]), 0.32, 'PLANTA BAJA'));
    cot.push(texto('TEXTO', P([W + 4.2, 1.7]), 0.18, 'ESC. 1:50 - SUP. CUBIERTA 120,00 m²'));
    cot.push(texto('TEXTO', P([W + 4.2, 2.1]), 0.18, 'NPT +0,15'));
    pasos.push({ id: 'cotas', nombre: 'Cotas y textos', comando: 'ACOTAR', entidades: cot });

    // 7. Lote, retiros, solados, piscina y vegetación
    var lot = [], L = modelo.lote, ex = modelo.exterior;
    lot.push(rectPoli('LOTE', [0, 0, L.ancho, L.fondo]));
    lot.push(rectPoli('RETIROS', [o[0], o[1], o[0] + W, o[1] + F]));
    lot.push(linea('RETIROS', [0, o[1]], [L.ancho, o[1]]));
    lot.push(linea('SOLADOS', [-4, ex.vereda.y0], [L.ancho + 4, ex.vereda.y0]));
    lot.push(texto('TEXTO', [L.ancho / 2, -1.25], 0.2, 'VEREDA'));
    lot.push(texto('TEXTO', [L.ancho / 2, -6.0], 0.3, 'CALLE'));
    lot.push(rectPoli('SOLADOS', ex.camino));
    lot.push(rectPoli('SOLADOS', ex.cochera));
    lot.push(texto('TEXTO', [(ex.cochera[0] + ex.cochera[2]) / 2, 2.5], 0.16, 'COCHERA DESCUBIERTA'));
    lot.push(rectPoli('SOLADOS', ex.galeria));
    lot.push(texto('TEXTO', [(ex.galeria[0] + ex.galeria[2]) / 2, 18.6], 0.16, 'GALERÍA'));
    lot.push(rectPoli('SOLADOS', ex.deck));
    var pr = ex.piscina.r;
    lot.push(rectPoli('PISCINA', pr));
    lot.push(rectPoli('PISCINA', [pr[0] + 0.25, pr[1] + 0.25, pr[2] - 0.25, pr[3] - 0.25]));
    for (var k = 0; k < 6; k++) {
      var yy = pr[1] + 0.8 + k * 0.4, xx = pr[0] + 1 + (k % 2) * 0.7;
      lot.push({ t: 'arco', capa: 'PISCINA', c: [xx + 0.6, yy + 0.35], r: 0.42, a0: 215, a1: 325 });
    }
    lot.push(texto('TEXTO', [(pr[0] + pr[2]) / 2, (pr[1] + pr[3]) / 2 + 0.4], 0.18, 'PISCINA 7,00 x 3,50'));
    ex.arboles.forEach(function (a) {
      if (a.tipo === 'pindo') {
        for (var q = 0; q < 8; q++) {
          var t = q * Math.PI / 4;
          lot.push(linea('VEGETACION', [a.x, a.y], [r6(a.x + Math.cos(t) * 1.3), r6(a.y + Math.sin(t) * 1.3)]));
        }
        lot.push({ t: 'circulo', capa: 'VEGETACION', c: [a.x, a.y], r: 0.18 });
      } else {
        lot.push({ t: 'circulo', capa: 'VEGETACION', c: [a.x, a.y], r: a.r });
        lot.push({ t: 'circulo', capa: 'VEGETACION', c: [a.x, a.y], r: 0.15 });
        if (a.tipo === 'lapacho') lot.push(texto('TEXTO', [a.x, a.y + a.r + 0.35], 0.16, 'LAPACHO'));
      }
    });
    var NX = L.ancho + 2.2, NY = 1.6;
    lot.push({ t: 'circulo', capa: 'TEXTO', c: [NX, NY], r: 0.7 });
    lot.push({ t: 'poli', capa: 'TEXTO', cerrada: true, p: [[NX, NY - 0.65], [NX + 0.25, NY + 0.4], [NX, NY + 0.2], [NX - 0.25, NY + 0.4]] });
    lot.push(texto('TEXTO', [NX, NY - 1.0], 0.3, 'N'));
    lot.push({ t: 'cota', capa: 'COTAS', a: [0, 0], b: [L.ancho, 0], off: -3.6 });
    lot.push({ t: 'cota', capa: 'COTAS', a: [L.ancho, 0], b: [L.ancho, L.fondo], off: 1.4 });
    lot.push({ t: 'cota', capa: 'COTAS', a: [0, 0], b: [0, o[1]], off: -2.4 });
    lot.push({ t: 'cota', capa: 'COTAS', a: [0, o[1] + F], b: [0, L.fondo], off: -2.4 });
    lot.push(texto('TEXTO', [L.ancho / 2, L.fondo + 1.2], 0.3, 'LOTE 12,00 x 30,00 - 360,00 m²'));
    pasos.push({ id: 'lote', nombre: 'Lote', comando: 'POLILINEA', entidades: lot });

    return pasos;
  }

  function ang(a, b) { return Math.round(Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI + 360) % 360; }

  // Símbolo en planta de cada mueble, en coordenadas de lote.
  function simboloMueble(mb) {
    var T = transformador(mb), o = modelo.casa.origen;
    function P(x, y) { var q = T(x, y); return [r6(q[0] + o[0]), r6(q[1] + o[1])]; }
    var w = mb.w / 2, d = mb.d / 2;
    var capa = /inodoro|lavatorio|ducha|bacha|piletaLavadero|lavarropas/.test(mb.tipo) ? 'SANITARIOS' : 'MOBILIARIO';
    var out = [];
    function rect(x0, y0, x1, y1) { out.push({ t: 'poli', capa: capa, cerrada: true, p: [P(x0, y0), P(x1, y0), P(x1, y1), P(x0, y1)] }); }
    function lin(x0, y0, x1, y1) { out.push({ t: 'linea', capa: capa, p: [P(x0, y0), P(x1, y1)] }); }
    function circ(x, y, r) { out.push({ t: 'circulo', capa: capa, c: P(x, y), r: r }); }
    function elipse(x, y, rx, ry) {
      var pts = [];
      for (var k = 0; k < 16; k++) { var t = k / 16 * Math.PI * 2; pts.push(P(x + Math.cos(t) * rx, y + Math.sin(t) * ry)); }
      out.push({ t: 'poli', capa: capa, cerrada: true, p: pts });
    }
    switch (mb.tipo) {
      case 'cama':
        rect(-w, -d, w, d);
        rect(-w + 0.08, -d + 0.06, (mb.w > 1.5 ? -0.04 : w - 0.08), -d + 0.4);
        if (mb.w > 1.5) rect(0.04, -d + 0.06, w - 0.08, -d + 0.4);
        lin(-w, -d + 0.65, w, -d + 0.55);
        break;
      case 'sofa':
        rect(-w, -d, w, d); lin(-w + 0.2, -d + 0.25, w - 0.2, -d + 0.25);
        lin(-w + 0.2, -d + 0.25, -w + 0.2, d); lin(w - 0.2, -d + 0.25, w - 0.2, d);
        lin(0, -d + 0.25, 0, d);
        break;
      case 'sillon':
        rect(-w, -d, w, d); lin(-w + 0.15, -d + 0.2, w - 0.15, -d + 0.2);
        lin(-w + 0.15, -d + 0.2, -w + 0.15, d); lin(w - 0.15, -d + 0.2, w - 0.15, d);
        break;
      case 'mesa': case 'mesaRatona': case 'escritorio': case 'consola': case 'mesaLuz': case 'isla':
        rect(-w, -d, w, d);
        break;
      case 'mesada':
        rect(-w, -d, w, d); lin(-w, d - 0.03, w, d - 0.03);
        break;
      case 'rack':
        rect(-w, -d, w, d); rect(-w * 0.8, -d, w * 0.8, -d + 0.08);
        break;
      case 'silla':
        rect(-w, -d, w, d); lin(-w, -d + 0.07, w, -d + 0.07);
        break;
      case 'banqueta': case 'maceta':
        circ(0, 0, w);
        break;
      case 'placard':
        rect(-w, -d, w, d);
        out.push({ t: 'linea', capa: capa, p: [P(-w + 0.05, 0), P(w - 0.05, 0)] });
        for (var k = 1; k < Math.round(mb.w / 0.5); k++) lin(-w + k * 0.5, -d, -w + k * 0.5, d);
        break;
      case 'alfombra':
        rect(-w, -d, w, d); rect(-w + 0.08, -d + 0.08, w - 0.08, d - 0.08);
        break;
      case 'heladera':
        rect(-w, -d, w, d); lin(-w, -d, w, d); lin(-w, d - 0.05, w, d - 0.05);
        break;
      case 'anafe':
        rect(-w, -d, w, d);
        circ(-0.14, -0.11, 0.08); circ(0.14, -0.11, 0.08); circ(-0.14, 0.11, 0.08); circ(0.14, 0.11, 0.08);
        break;
      case 'bacha':
        rect(-w, -d, w, d); rect(-w + 0.05, -d + 0.05, w - 0.05, d - 0.05); circ(0, -d + 0.1, 0.02);
        break;
      case 'inodoro':
        rect(-w, -d, w, -d + 0.2); elipse(0, -d + 0.42, 0.18, 0.24);
        break;
      case 'lavatorio':
        rect(-w, -d, w, d); elipse(0, 0.02, 0.2, 0.14);
        break;
      case 'ducha':
        rect(-w, -d, w, d); lin(-w, -d, w, d); lin(-w, d, w, -d); circ(0, 0, 0.04);
        break;
      case 'piletaLavadero':
        rect(-w, -d, w, d); rect(-w + 0.05, -d + 0.05, w - 0.05, d - 0.12);
        break;
      case 'lavarropas':
        rect(-w, -d, w, d); circ(0, 0.02, 0.2);
        break;
      default:
        rect(-w, -d, w, d);
    }
    return out;
  }

  // Convierte una cota en líneas y texto (lo usan el SVG y el DXF).
  function expandirCota(c) {
    var a = c.a, b = c.b;
    var dx = b[0] - a[0], dy = b[1] - a[1], len = Math.sqrt(dx * dx + dy * dy);
    // off desplaza la línea de cota hacia +y (cotas horizontales) o hacia +x (cotas verticales).
    var u = [dx / len, dy / len], n = Math.abs(u[0]) > 0.5 ? [0, 1] : [1, 0];
    var off = c.off;
    function add(p, v, k) { return [r6(p[0] + v[0] * k), r6(p[1] + v[1] * k)]; }
    var s = off >= 0 ? 1 : -1;
    var a2 = add(a, n, off), b2 = add(b, n, off);
    var out = [];
    out.push({ t: 'linea', capa: c.capa, p: [add(a, n, s * 0.12), add(a2, n, s * 0.12)] });
    out.push({ t: 'linea', capa: c.capa, p: [add(b, n, s * 0.12), add(b2, n, s * 0.12)] });
    out.push({ t: 'linea', capa: c.capa, p: [add(a2, u, -0.12), add(b2, u, 0.12)] });
    [a2, b2].forEach(function (p) {
      var v = [(u[0] + n[0]) * 0.07, (u[1] + n[1]) * 0.07];
      out.push({ t: 'linea', capa: c.capa, p: [[r6(p[0] - v[0]), r6(p[1] - v[1])], [r6(p[0] + v[0]), r6(p[1] + v[1])]] });
    });
    var vertical = Math.abs(u[0]) < 0.5;
    // El texto va sobre la línea: arriba en pantalla, o a la izquierda si la cota es vertical.
    var mid = [(a2[0] + b2[0]) / 2, (a2[1] + b2[1]) / 2];
    var tp = vertical ? [r6(mid[0] - 0.11), mid[1]] : [mid[0], r6(mid[1] - 0.11)];
    out.push({ t: 'texto', capa: c.capa, p: tp, h: 0.13, s: c.s || fmt(len), rot: vertical ? 90 : 0 });
    return out;
  }

  // ---------------------------------------------------------------------------
  // DXF R12 (ASCII). Coordenadas en metros con Y hacia el norte (Y_dxf = -y).
  // Devuelve una cadena Latin-1 (ANSI_1252); escribirla como bytes de 8 bits.
  // ---------------------------------------------------------------------------

  function exportarDXF() {
    var out = [];
    function g(code, val) { out.push(String(code), String(val)); }
    function n(v) { return (Math.round(v * 10000) / 10000).toString(); }
    function X(p) { return n(p[0]); }
    function Y(p) { return n(-p[1]); }
    function txt(s) {
      return String(s).split('').map(function (ch) { return ch.charCodeAt(0) < 256 ? ch : '?'; }).join('');
    }
    var pasos = planoPorPasos();
    var ents = [];
    pasos.forEach(function (p) {
      p.entidades.forEach(function (e) {
        if (e.t === 'cota') expandirCota(e).forEach(function (x) { ents.push(x); });
        else ents.push(e);
      });
    });
    var minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
    function ext(p) { minx = Math.min(minx, p[0]); maxx = Math.max(maxx, p[0]); miny = Math.min(miny, -p[1]); maxy = Math.max(maxy, -p[1]); }
    ents.forEach(function (e) {
      if (e.p && e.t !== 'texto') e.p.forEach(ext); else if (e.p) ext(e.p);
      if (e.c) { ext([e.c[0] - e.r, e.c[1] - e.r]); ext([e.c[0] + e.r, e.c[1] + e.r]); }
      if (e.r && e.t === 'relleno') { ext([e.r[0], e.r[1]]); ext([e.r[2], e.r[3]]); }
    });

    g(0, 'SECTION'); g(2, 'HEADER');
    g(9, '$ACADVER'); g(1, 'AC1009');
    g(9, '$DWGCODEPAGE'); g(3, 'ANSI_1252');
    g(9, '$EXTMIN'); g(10, n(minx)); g(20, n(miny)); g(30, 0);
    g(9, '$EXTMAX'); g(10, n(maxx)); g(20, n(maxy)); g(30, 0);
    g(9, '$LTSCALE'); g(40, 1);
    g(0, 'ENDSEC');

    g(0, 'SECTION'); g(2, 'TABLES');
    g(0, 'TABLE'); g(2, 'LTYPE'); g(70, 3);
    g(0, 'LTYPE'); g(2, 'CONTINUOUS'); g(70, 0); g(3, 'Solid line'); g(72, 65); g(73, 0); g(40, 0);
    g(0, 'LTYPE'); g(2, 'DASHED'); g(70, 0); g(3, '__ __ __ __'); g(72, 65); g(73, 2); g(40, 0.45); g(49, 0.3); g(49, -0.15);
    g(0, 'LTYPE'); g(2, 'CENTER'); g(70, 0); g(3, '____ _ ____ _'); g(72, 65); g(73, 4); g(40, 1.0); g(49, 0.6); g(49, -0.15); g(49, 0.1); g(49, -0.15);
    g(0, 'ENDTAB');
    g(0, 'TABLE'); g(2, 'LAYER'); g(70, CAPAS.length + 1);
    g(0, 'LAYER'); g(2, '0'); g(70, 0); g(62, 7); g(6, 'CONTINUOUS');
    CAPAS.forEach(function (c) { g(0, 'LAYER'); g(2, c.id); g(70, 0); g(62, c.aci); g(6, c.tipo || 'CONTINUOUS'); });
    g(0, 'ENDTAB');
    g(0, 'ENDSEC');

    g(0, 'SECTION'); g(2, 'ENTITIES');
    ents.forEach(function (e) {
      if (e.t === 'linea') {
        g(0, 'LINE'); g(8, e.capa); g(10, X(e.p[0])); g(20, Y(e.p[0])); g(30, 0); g(11, X(e.p[1])); g(21, Y(e.p[1])); g(31, 0);
      } else if (e.t === 'poli') {
        g(0, 'POLYLINE'); g(8, e.capa); g(66, 1); g(10, 0); g(20, 0); g(30, 0); g(70, e.cerrada ? 1 : 0);
        e.p.forEach(function (p) { g(0, 'VERTEX'); g(8, e.capa); g(10, X(p)); g(20, Y(p)); g(30, 0); });
        g(0, 'SEQEND'); g(8, e.capa);
      } else if (e.t === 'circulo') {
        g(0, 'CIRCLE'); g(8, e.capa); g(10, X(e.c)); g(20, Y(e.c)); g(30, 0); g(40, n(e.r));
      } else if (e.t === 'arco') {
        // En el plano y crece hacia el fondo; al invertir Y los ángulos cambian de signo y de orden.
        g(0, 'ARC'); g(8, e.capa); g(10, X(e.c)); g(20, Y(e.c)); g(30, 0); g(40, n(e.r));
        g(50, n((360 - e.a1) % 360)); g(51, n((360 - e.a0) % 360));
      } else if (e.t === 'texto') {
        g(0, 'TEXT'); g(8, e.capa); g(10, X(e.p)); g(20, Y(e.p)); g(30, 0); g(40, n(e.h)); g(1, txt(e.s));
        if (e.rot) g(50, e.rot);
        g(72, 1); g(11, X(e.p)); g(21, Y(e.p)); g(31, 0); g(73, 2);
      } else if (e.t === 'relleno') {
        var r = e.r;
        g(0, 'SOLID'); g(8, e.capa);
        g(10, n(r[0])); g(20, n(-r[1])); g(30, 0);
        g(11, n(r[2])); g(21, n(-r[1])); g(31, 0);
        g(12, n(r[0])); g(22, n(-r[3])); g(32, 0);
        g(13, n(r[2])); g(23, n(-r[3])); g(33, 0);
      }
    });
    g(0, 'ENDSEC');
    g(0, 'EOF');
    return out.join('\r\n') + '\r\n';
  }

  // ---------------------------------------------------------------------------
  // Cómputo y ficha (todo derivado del modelo)
  // ---------------------------------------------------------------------------

  function largo(pts) {
    var s = 0;
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i];
      s += Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2) + Math.pow(b[2] - a[2], 2));
    }
    return s;
  }

  function computo() {
    var nv = modelo.niveles;
    var muroM2 = 0;
    piezasMuro().forEach(function (p) {
      var r = p.rect, l = Math.max(r[2] - r[0], r[3] - r[1]);
      muroM2 += l * (p.h1 - p.h0);
    });
    var losaM2 = modelo.casa.ancho * modelo.casa.fondo;
    var nCol = modelo.ejes.x.length * modelo.ejes.y.length;
    var hCol = nv.piso + nv.alturaLibre;
    var hormigon = losaM2 * nv.losa + nCol * (modelo.columna * modelo.columna * hCol) + nCol * (1.0 * 1.0 * 0.4);
    var cañerias = {};
    tramos().forEach(function (t) { cañerias[t.sistema] = (cañerias[t.sistema] || 0) + largo(t.puntos); });
    var pisos = {};
    modelo.ambientes.forEach(function (a) { pisos[a.piso] = (pisos[a.piso] || 0) + areaPoligono(a.poli); });
    return {
      superficieCubierta: losaM2,
      lote: modelo.lote.ancho * modelo.lote.fondo,
      fos: losaM2 / (modelo.lote.ancho * modelo.lote.fondo),
      muroM2: muroM2,
      losaM2: losaM2,
      hormigonM3: hormigon,
      columnas: nCol,
      aberturas: modelo.aberturas.length,
      cañerias: cañerias,
      pisos: pisos,
      retiros: {
        frente: modelo.casa.origen[1],
        oeste: modelo.casa.origen[0],
        este: modelo.lote.ancho - modelo.casa.origen[0] - modelo.casa.ancho,
        fondo: modelo.lote.fondo - modelo.casa.origen[1] - modelo.casa.fondo
      }
    };
  }

  // Etapas de obra con meses y peso de inversión de ejemplo.
  var ETAPAS = [
    { id: 'cimientos', nombre: 'Cimientos', meses: 1, peso: 0.12, color: '#8d8a83' },
    { id: 'estructura', nombre: 'Estructura', meses: 2, peso: 0.22, color: '#4f6d8f' },
    { id: 'instalaciones', nombre: 'Instalaciones', meses: 1, peso: 0.16, color: '#c9813b' },
    { id: 'envolvente', nombre: 'Envolvente', meses: 2, peso: 0.24, color: '#b25a3c' },
    { id: 'acabados', nombre: 'Acabados', meses: 2, peso: 0.26, color: '#4f8a5b' }
  ];

  return {
    modelo: modelo,
    SISTEMAS: SISTEMAS,
    ETAPAS: ETAPAS,
    CAPAS: CAPAS,
    equipos: equipos,
    tramos: tramos,
    piezasMuro: piezasMuro,
    planoPorPasos: planoPorPasos,
    expandirCota: expandirCota,
    exportarDXF: exportarDXF,
    computo: computo,
    areaPoligono: areaPoligono,
    centroide: centroide,
    aLote: aLote,
    infoMuro: infoMuro,
    muroPorId: muroPorId,
    aberturasDe: aberturasDe,
    transformador: transformador,
    luzAmbiente: luzAmbiente,
    fmt: fmt,
    costoM2Ejemplo: 720
  };
});
