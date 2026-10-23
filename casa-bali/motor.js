/* Motor de proyecto: deriva todo de un modelo de varias plantas (modelo.js).
 *
 * MOTOR.crear(modelo) devuelve la misma API que casa-3d/casa-modelo.js, generalizada a niveles:
 * piezas de muro por nivel, columnas, instalaciones trazadas automáticamente desde los artefactos,
 * plano por pasos (implantación, planta baja y planta alta lado a lado), DXF R12 y cómputo.
 *
 * Navegador: window.MOTOR.  Node: require('./motor.js').
 * CLI: node motor.js > casa.dxf   (usa ./modelo.js)
 */
(function (raiz, fabrica) {
  var MOTOR = fabrica();
  if (typeof module === 'object' && module.exports) {
    module.exports = MOTOR;
    if (typeof require === 'function' && require.main === module) {
      var P = MOTOR.crear(require('./modelo.js'));
      process.stdout.write(Buffer.from(P.exportarDXF(), 'latin1'));
    }
  } else {
    raiz.MOTOR = MOTOR;
  }
})(this, function () {
  'use strict';

  var SISTEMAS = {
    aguaFria: { nombre: 'Agua fría', color: '#2f7fe0', radio: 0.022 },
    aguaCaliente: { nombre: 'Agua caliente', color: '#e0442f', radio: 0.022 },
    electricidad: { nombre: 'Electricidad', color: '#f2b705', radio: 0.014 },
    desague: { nombre: 'Desagüe', color: '#8a6f55', radio: 0.045 },
    aire: { nombre: 'Aire acondicionado', color: '#22c3c9', radio: 0.02 }
  };

  var CAPAS = [
    { id: 'EJES', color: '#ff3b3b', aci: 1, tipo: 'CENTER' },
    { id: 'COLUMNAS', color: '#ffffff', aci: 7 },
    { id: 'MUROS', color: '#ffffff', aci: 7 },
    { id: 'MUROS-RELLENO', color: '#808080', aci: 8 },
    { id: 'CARPINTERIA', color: '#00ffff', aci: 4 },
    { id: 'ESCALERA', color: '#ff7f00', aci: 30 },
    { id: 'BARANDAS', color: '#00bfff', aci: 140 },
    { id: 'TRAGALUCES', color: '#00ffff', aci: 4, tipo: 'DASHED' },
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

  var ETAPAS = [
    { id: 'cimientos', nombre: 'Cimientos', meses: 2, peso: 0.10, color: '#8d8a83' },
    { id: 'estructura', nombre: 'Estructura', meses: 4, peso: 0.24, color: '#4f6d8f' },
    { id: 'instalaciones', nombre: 'Instalaciones', meses: 2, peso: 0.14, color: '#c9813b' },
    { id: 'envolvente', nombre: 'Envolvente', meses: 3, peso: 0.22, color: '#b25a3c' },
    { id: 'acabados', nombre: 'Acabados', meses: 3, peso: 0.30, color: '#4f8a5b' }
  ];

  var SANITARIOS = /^(inodoro|lavatorio|ducha|tina|bacha|piletaLavadero|lavarropas)$/;
  var CALIENTE = /^(lavatorio|ducha|tina|bacha)$/;

  function r6(v) { return Math.round(v * 1e6) / 1e6; }
  function fmt(v) { return v.toFixed(2).replace('.', ','); }
  function uniq(a) {
    return a.sort(function (p, q) { return p - q; })
      .filter(function (v, k, arr) { return k === 0 || Math.abs(v - arr[k - 1]) > 1e-7; });
  }
  function areaPoligono(p) {
    var s = 0;
    for (var i = 0; i < p.length; i++) { var a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; }
    return Math.abs(s) / 2;
  }
  function centroide(p) {
    var x = 0, y = 0;
    p.forEach(function (q) { x += q[0]; y += q[1]; });
    return [x / p.length, y / p.length];
  }
  function ang(a, b) { return Math.round(Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI + 360) % 360; }

  // Unión de rectángulos ortogonales: contorno (segmentos) y franjas de relleno.
  function unionRects(rects) {
    var xs = [], ys = [];
    rects.forEach(function (r) { xs.push(r6(r[0]), r6(r[2])); ys.push(r6(r[1]), r6(r[3])); });
    xs = uniq(xs); ys = uniq(ys);
    var nx = xs.length - 1, ny = ys.length - 1, lleno = [], i, j;
    for (j = 0; j < ny; j++) {
      lleno.push([]);
      for (i = 0; i < nx; i++) {
        var cx = (xs[i] + xs[i + 1]) / 2, cy = (ys[j] + ys[j + 1]) / 2;
        lleno[j].push(rects.some(function (r) { return cx > r[0] && cx < r[2] && cy > r[1] && cy < r[3]; }));
      }
    }
    function L(a, b) { return a >= 0 && b >= 0 && a < nx && b < ny && lleno[b][a]; }
    var segs = [], abierto, borde;
    for (j = 0; j <= ny; j++) {
      abierto = null;
      for (i = 0; i <= nx; i++) {
        borde = i < nx && L(i, j - 1) !== L(i, j);
        if (borde && abierto === null) abierto = xs[i];
        if (!borde && abierto !== null) { segs.push([[abierto, ys[j]], [xs[i], ys[j]]]); abierto = null; }
      }
    }
    for (i = 0; i <= nx; i++) {
      abierto = null;
      for (j = 0; j <= ny; j++) {
        borde = j < ny && L(i - 1, j) !== L(i, j);
        if (borde && abierto === null) abierto = ys[j];
        if (!borde && abierto !== null) { segs.push([[xs[i], abierto], [xs[i], ys[j]]]); abierto = null; }
      }
    }
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

  var GIROS = { S: 0, O: 90, N: 180, E: 270 };
  function transformador(mb) {
    var t = GIROS[mb.frente || 'S'] * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
    return function (x, y) { return [r6(mb.x + x * c - y * s), r6(mb.y + x * s + y * c)]; };
  }

  // Convierte una cota en líneas y texto. off: +y en cotas horizontales, +x en verticales.
  function expandirCota(c) {
    var a = c.a, b = c.b, dx = b[0] - a[0], dy = b[1] - a[1], len = Math.sqrt(dx * dx + dy * dy);
    var u = [dx / len, dy / len], n = Math.abs(u[0]) > 0.5 ? [0, 1] : [1, 0], off = c.off;
    function add(p, v, k) { return [r6(p[0] + v[0] * k), r6(p[1] + v[1] * k)]; }
    var s = off >= 0 ? 1 : -1, a2 = add(a, n, off), b2 = add(b, n, off), out = [];
    out.push({ t: 'linea', capa: c.capa, p: [add(a, n, s * 0.12), add(a2, n, s * 0.12)] });
    out.push({ t: 'linea', capa: c.capa, p: [add(b, n, s * 0.12), add(b2, n, s * 0.12)] });
    out.push({ t: 'linea', capa: c.capa, p: [add(a2, u, -0.12), add(b2, u, 0.12)] });
    [a2, b2].forEach(function (p) {
      var v = [(u[0] + n[0]) * 0.07, (u[1] + n[1]) * 0.07];
      out.push({ t: 'linea', capa: c.capa, p: [[r6(p[0] - v[0]), r6(p[1] - v[1])], [r6(p[0] + v[0]), r6(p[1] + v[1])]] });
    });
    var vertical = Math.abs(u[0]) < 0.5, mid = [(a2[0] + b2[0]) / 2, (a2[1] + b2[1]) / 2];
    var tp = vertical ? [r6(mid[0] - 0.11), mid[1]] : [mid[0], r6(mid[1] - 0.11)];
    out.push({ t: 'texto', capa: c.capa, p: tp, h: 0.13, s: c.s || fmt(len), rot: vertical ? 90 : 0 });
    return out;
  }

  function crear(M) {
    var O = M.casa.origen;
    var niveles = {};
    M.niveles.forEach(function (n, i) {
      niveles[n.id] = Object.assign({}, n, { indice: i, cielo: n.cota + n.alturaLibre, techo: n.cota + n.alturaLibre + n.losa });
    });
    var listaNiveles = M.niveles.map(function (n) { return niveles[n.id]; });
    var superior = listaNiveles[listaNiveles.length - 1];
    var AZOTEA = superior.techo;

    function espesor(m) { return m.e || (m.ext ? M.muroExterior : M.muroInterior); }
    function aLote(p) { return [r6(p[0] + O[0]), r6(p[1] + O[1])]; }
    function muroPorId(id) { return M.muros.filter(function (m) { return m.id === id; })[0]; }
    function infoMuro(m) {
      var h = Math.abs(m.a[1] - m.b[1]) < 1e-9;
      return {
        eje: h ? 'x' : 'y',
        ini: h ? Math.min(m.a[0], m.b[0]) : Math.min(m.a[1], m.b[1]),
        fin: h ? Math.max(m.a[0], m.b[0]) : Math.max(m.a[1], m.b[1]),
        c: h ? m.a[1] : m.a[0],
        e: espesor(m)
      };
    }
    function aberturasDe(id) {
      return M.aberturas.filter(function (o) { return o.muro === id; }).sort(function (a, b) { return a.desde - b.desde; });
    }
    function rectPieza(inf, d0, d1, extra) {
      var e = inf.e + (extra || 0) * 2;
      return inf.eje === 'x' ? [d0, inf.c - e / 2, d1, inf.c + e / 2] : [inf.c - e / 2, d0, inf.c + e / 2, d1];
    }

    function piezasMuro() {
      var piezas = [];
      M.muros.forEach(function (m) {
        var n = niveles[m.nivel], inf = infoMuro(m), piso = n.cota, cielo = n.cielo, cursor = inf.ini;
        function add(d0, d1, h0, h1, tipo, op) {
          piezas.push({ muro: m.id, nivel: m.nivel, ext: !!m.ext, tipo: tipo, eje: inf.eje, rect: rectPieza(inf, d0, d1), h0: h0, h1: h1, abertura: op ? op.id : null, ini: d0 === inf.ini, fin: d1 === inf.fin });
        }
        aberturasDe(m.id).forEach(function (o) {
          if (o.desde > cursor + 1e-9) add(cursor, o.desde, piso, cielo, 'macizo');
          if (o.antepecho > 0) add(o.desde, o.hasta, piso, piso + o.antepecho, 'antepecho', o);
          if (piso + o.antepecho + o.alto < cielo - 1e-9) add(o.desde, o.hasta, piso + o.antepecho + o.alto, cielo, 'dintel', o);
          cursor = o.hasta;
        });
        if (inf.fin > cursor + 1e-9) add(cursor, inf.fin, piso, cielo, 'macizo');
      });
      return piezas;
    }

    function columnas(nivelId) {
      var omitir = (M.sinColumna && M.sinColumna[nivelId]) || [];
      var out = [];
      M.ejes.x.forEach(function (ex) {
        M.ejes.y.forEach(function (ey) {
          var id = ex.id + ey.id;
          if (omitir.indexOf(id) >= 0) return;
          var huella = niveles[nivelId].huella, maxY = Math.max.apply(null, huella.map(function (q) { return q[1]; }));
          if (ey.v > maxY) return;
          out.push({ id: id, x: ex.v, y: ey.v });
        });
      });
      return out;
    }

    function luzAmbiente(a) { return a.luz || a.etiqueta || centroide(a.poli); }

    // -------------------------------------------------------------------------
    // Instalaciones trazadas desde los artefactos sanitarios, el tablero y los splits
    // -------------------------------------------------------------------------
    function tramos() {
      var t = [], Q = M.equipos;
      function add(sistema, pts) { t.push({ sistema: sistema, puntos: pts.map(function (p) { return [r6(p[0]), r6(p[1]), r6(p[2])]; }) }); }
      function rutaL(a, b, h) { return [[a[0], a[1], h], [a[0], b[1], h], [b[0], b[1], h]]; }
      var mont = Q.montante, baj = Q.bajada, pb = listaNiveles[0];
      var artefactos = M.muebles.filter(function (mb) { return SANITARIOS.test(mb.tipo); });

      // Montantes de agua desde el tanque y el termotanque solar en la azotea
      var hTanque = AZOTEA + 0.35;
      add('aguaFria', [[Q.tanque[0], Q.tanque[1], hTanque], [mont[0], Q.tanque[1], hTanque], [mont[0], mont[1], hTanque], [mont[0], mont[1], pb.cota - 0.06]]);
      add('aguaCaliente', [[Q.solar[0], Q.solar[1], AZOTEA + 0.3], [mont[0] + 0.12, Q.solar[1], AZOTEA + 0.3], [mont[0] + 0.12, mont[1], AZOTEA + 0.3], [mont[0] + 0.12, mont[1], pb.cota - 0.03]]);
      add('aguaFria', [[Q.tanque[0], Q.tanque[1], hTanque], [Q.solar[0], Q.tanque[1], hTanque], [Q.solar[0], Q.solar[1], AZOTEA + 0.25]]);

      artefactos.forEach(function (mb) {
        var n = niveles[mb.nivel], T = transformador(mb);
        var atras = T(0, -mb.d / 2 + 0.06);
        var hF = n.cota - 0.06, hC = n.cota - 0.03;
        add('aguaFria', rutaL([mont[0], mont[1]], atras, hF).concat([[atras[0], atras[1], n.cota + 0.55]]));
        if (CALIENTE.test(mb.tipo)) {
          var a2 = T(0.08, -mb.d / 2 + 0.06);
          add('aguaCaliente', rutaL([mont[0] + 0.12, mont[1]], a2, hC).concat([[a2[0], a2[1], n.cota + 0.6]]));
        }
        // Desagüe: baja del artefacto y corre por el contrapiso (PB) o dentro de la losa (PA) hasta la bajada
        var hD = mb.nivel === pb.id ? -0.3 : n.cota - 0.13;
        var destino = mb.nivel === pb.id ? [baj[0], mb.y] : baj;
        add('desague', [[mb.x, mb.y, n.cota + 0.1], [mb.x, mb.y, hD]].concat(rutaL([mb.x, mb.y], destino, hD).slice(1)));
      });
      var yMax = Math.max.apply(null, artefactos.filter(function (mb) { return mb.nivel === pb.id; }).map(function (mb) { return mb.y; }).concat([baj[1]]));
      add('desague', [[baj[0], baj[1], superior.cota - 0.13], [baj[0], baj[1], -0.3]]);
      add('desague', [[baj[0], yMax, -0.28], [baj[0], -0.6, -0.45], [Q.camara[0], Q.camara[1], -0.5], [Q.camara[0], -5.6, -0.65]]);

      // Electricidad: acometida, tablero y una boca de luz por ambiente
      var tab = Q.tablero, pil = Q.pilar;
      add('electricidad', [[pil[0], pil[1], -0.3], [tab[0], pil[1], -0.3], [tab[0], tab[1], -0.3], [tab[0], tab[1], pb.cota + 1.3]]);
      M.ambientes.filter(function (a) { return !a.vacio; }).forEach(function (a) {
        var n = niveles[a.nivel], hL = n.techo - 0.1, l = luzAmbiente(a);
        add('electricidad', [[tab[0], tab[1], pb.cota + 1.85], [tab[0], tab[1], hL]].concat(rutaL(tab, l, hL).slice(1)).concat([[l[0], l[1], n.cielo - 0.02]]));
      });

      // Aire: del split a la losa, al pleno técnico y a su condensadora en la azotea
      var pleno = [mont[0], mont[1] + 0.85];
      (Q.splits || []).forEach(function (sp, i) {
        var n = niveles[sp.nivel], h = sp.alto || n.cielo - 0.3, hL = n.techo - 0.1, cd = Q.condensadoras[i % Q.condensadoras.length];
        add('aire', [[sp.p[0], sp.p[1], h], [sp.p[0], sp.p[1], hL]].concat(rutaL(sp.p, pleno, hL).slice(1))
          .concat([[pleno[0], pleno[1], AZOTEA + 0.15]]).concat(rutaL(pleno, cd, AZOTEA + 0.15).slice(1)));
      });
      return t;
    }

    function equipos() {
      var Q = M.equipos, out = [], pb = listaNiveles[0];
      out.push({ id: 'tanque', sistema: 'aguaFria', nombre: 'Tanque de agua', p: [Q.tanque[0], Q.tanque[1], AZOTEA + 0.75], cil: 0.6, alto: 1.1, techo: true });
      out.push({ id: 'solar', sistema: 'aguaCaliente', nombre: 'Termotanque solar', p: [Q.solar[0], Q.solar[1], AZOTEA + 0.5], solar: true, techo: true });
      out.push({ id: 'tablero', sistema: 'electricidad', nombre: 'Tablero', p: [Q.tablero[0], Q.tablero[1], pb.cota + 1.6], dim: [0.1, 0.4, 0.5] });
      out.push({ id: 'pilar', sistema: 'electricidad', nombre: 'Pilar de medidores', p: [Q.pilar[0], Q.pilar[1], 0.8], dim: [0.6, 0.4, 1.6], exterior: true });
      out.push({ id: 'camara', sistema: 'desague', nombre: 'Cámara de inspección', p: [Q.camara[0], Q.camara[1], -0.25], dim: [0.6, 0.6, 0.5] });
      (Q.splits || []).forEach(function (sp, i) {
        var n = niveles[sp.nivel], h = sp.alto || n.cielo - 0.3;
        out.push({ id: 'split' + i, sistema: 'aire', nombre: 'Split', p: [sp.p[0], sp.p[1], h + 0.05], dim: sp.eje === 'x' ? [0.9, 0.22, 0.3] : [0.22, 0.9, 0.3] });
      });
      Q.condensadoras.forEach(function (c, i) {
        if (i >= (Q.splits || []).length) return;
        out.push({ id: 'cond' + i, sistema: 'aire', nombre: 'Condensadora', p: [c[0], c[1], AZOTEA + 0.35], dim: [0.75, 0.32, 0.6], techo: true });
      });
      return out;
    }

    // -------------------------------------------------------------------------
    // Plano: implantación (izquierda), planta baja y planta alta lado a lado
    // -------------------------------------------------------------------------
    var DX = { sitio: 0, PB: M.lote.ancho + 7, PA: M.lote.ancho + 7 + M.casa.ancho + 7 };
    function P(nivel, p) { return [r6(p[0] + O[0] + DX[nivel]), r6(p[1] + O[1])]; }

    function simboloMueble(mb, desplazar) {
      var T = transformador(mb);
      function Q(x, y) { var q = T(x, y); return desplazar(q); }
      var w = mb.w / 2, d = mb.d / 2;
      var capa = SANITARIOS.test(mb.tipo) ? 'SANITARIOS' : 'MOBILIARIO';
      var out = [];
      function rect(x0, y0, x1, y1, c) { out.push({ t: 'poli', capa: c || capa, cerrada: true, p: [Q(x0, y0), Q(x1, y0), Q(x1, y1), Q(x0, y1)] }); }
      function lin(x0, y0, x1, y1) { out.push({ t: 'linea', capa: capa, p: [Q(x0, y0), Q(x1, y1)] }); }
      function circ(x, y, r) { out.push({ t: 'circulo', capa: capa, c: Q(x, y), r: r }); }
      function elipse(x, y, rx, ry) {
        var pts = [];
        for (var k = 0; k < 16; k++) { var t = k / 16 * Math.PI * 2; pts.push(Q(x + Math.cos(t) * rx, y + Math.sin(t) * ry)); }
        out.push({ t: 'poli', capa: capa, cerrada: true, p: pts });
      }
      switch (mb.tipo) {
        case 'cama':
          rect(-w, -d, w, d);
          rect(-w + 0.08, -d + 0.06, (mb.w > 1.5 ? -0.04 : w - 0.08), -d + 0.4);
          if (mb.w > 1.5) rect(0.04, -d + 0.06, w - 0.08, -d + 0.4);
          lin(-w, -d + 0.65, w, -d + 0.55);
          break;
        case 'sofa': case 'sillon':
          rect(-w, -d, w, d); lin(-w + 0.18, -d + 0.22, w - 0.18, -d + 0.22);
          lin(-w + 0.18, -d + 0.22, -w + 0.18, d); lin(w - 0.18, -d + 0.22, w - 0.18, d);
          break;
        case 'mesada':
          rect(-w, -d, w, d); lin(-w, d - 0.03, w, d - 0.03);
          break;
        case 'rack':
          rect(-w, -d, w, d); rect(-w * 0.75, -d, w * 0.75, -d + 0.08);
          break;
        case 'silla':
          rect(-w, -d, w, d); lin(-w, -d + 0.07, w, -d + 0.07);
          break;
        case 'banqueta': case 'maceta':
          circ(0, 0, w);
          break;
        case 'placard':
          rect(-w, -d, w, d);
          lin(-w + 0.05, 0, w - 0.05, 0);
          if (!mb.abierto) for (var k = 1; k < Math.round(mb.w / 0.5); k++) lin(-w + k * 0.5, -d, -w + k * 0.5, d);
          break;
        case 'alfombra':
          rect(-w, -d, w, d); rect(-w + 0.08, -d + 0.08, w - 0.08, d - 0.08);
          break;
        case 'heladera':
          rect(-w, -d, w, d); lin(-w, -d, w, d);
          break;
        case 'anafe':
          rect(-w, -d, w, d);
          circ(-0.14, -0.11, 0.08); circ(0.14, -0.11, 0.08); circ(-0.14, 0.11, 0.08); circ(0.14, 0.11, 0.08);
          break;
        case 'bacha':
          rect(-w, -d, w, d); rect(-w + 0.05, -d + 0.05, w - 0.05, d - 0.05);
          break;
        case 'inodoro':
          rect(-w, -d, w, -d + 0.2); elipse(0, -d + 0.42, 0.18, 0.24);
          break;
        case 'lavatorio':
          rect(-w, -d, w, d);
          if (mb.w > 1.2) { elipse(-w / 2, 0.02, 0.18, 0.13); elipse(w / 2, 0.02, 0.18, 0.13); } else elipse(0, 0.02, 0.18, 0.13);
          break;
        case 'ducha':
          rect(-w, -d, w, d); lin(-w, -d, w, d); lin(-w, d, w, -d); circ(0, 0, 0.04);
          break;
        case 'tina':
          rect(-w, -d, w, d); elipse(0, 0, w - 0.1, d - 0.1); circ(-w + 0.22, 0, 0.03);
          break;
        case 'piletaLavadero':
          rect(-w, -d, w, d); rect(-w + 0.05, -d + 0.05, w - 0.05, d - 0.12);
          break;
        case 'lavarropas':
          rect(-w, -d, w, d); circ(0, 0.02, 0.2);
          break;
        case 'jardinInterior':
          rect(-w, -d, w, d, 'VEGETACION'); circ(0, 0.1, 0.45); circ(-0.2, -0.9, 0.3); circ(0.25, 1.0, 0.35);
          break;
        case 'jardinera':
          rect(-w, -d, w, d, 'VEGETACION');
          for (var q = 0; q < Math.floor(mb.w / 0.6); q++) circ(-w + 0.3 + q * 0.6, 0, 0.18);
          break;
        case 'reposera':
          rect(-w, -d, w, d); lin(-w, -d + 0.45, w, -d + 0.45);
          break;
        default:
          rect(-w, -d, w, d);
      }
      return out;
    }

    function planoPorPasos() {
      var pasos = [];
      var L = M.lote, W = M.casa.ancho;
      function linea(capa, a, b) { return { t: 'linea', capa: capa, p: [a, b] }; }
      function poli(capa, pts, cerrada) { return { t: 'poli', capa: capa, cerrada: cerrada !== false, p: pts }; }
      function rectN(capa, nivel, r) { return poli(capa, [P(nivel, [r[0], r[1]]), P(nivel, [r[2], r[1]]), P(nivel, [r[2], r[3]]), P(nivel, [r[0], r[3]])]); }
      function texto(capa, p, h, s, rot) { return { t: 'texto', capa: capa, p: p, h: h, s: s, rot: rot || 0 }; }
      function fondoDe(nid) { return Math.max.apply(null, niveles[nid].huella.map(function (q) { return q[1]; })); }
      var plantas = listaNiveles.map(function (n) { return n.id; });

      // 1. Ejes de ambas plantas
      var ejes = [];
      plantas.forEach(function (nid) {
        var F = fondoDe(nid), Y0 = -2.4, Y1 = F + 1.2, X0 = -2.4, X1 = W + 1.2;
        M.ejes.x.forEach(function (e) {
          ejes.push(linea('EJES', P(nid, [e.v, Y0 + 0.35]), P(nid, [e.v, Y1])));
          ejes.push({ t: 'circulo', capa: 'EJES', c: P(nid, [e.v, Y0]), r: 0.35 });
          ejes.push(texto('EJES', P(nid, [e.v, Y0]), 0.3, e.id));
        });
        M.ejes.y.filter(function (e) { return e.v <= F; }).forEach(function (e) {
          ejes.push(linea('EJES', P(nid, [X0 + 0.35, e.v]), P(nid, [X1, e.v])));
          ejes.push({ t: 'circulo', capa: 'EJES', c: P(nid, [X0, e.v]), r: 0.35 });
          ejes.push(texto('EJES', P(nid, [X0, e.v]), 0.3, e.id));
        });
      });
      pasos.push({ id: 'ejes', nombre: 'Ejes', comando: 'LINEA', entidades: ejes });

      // 2. Columnas
      var cols = [], c2 = M.columna / 2;
      plantas.forEach(function (nid) {
        columnas(nid).forEach(function (c) {
          var r = [c.x - c2, c.y - c2, c.x + c2, c.y + c2];
          cols.push(rectN('COLUMNAS', nid, r));
          var a = P(nid, [r[0], r[1]]), b = P(nid, [r[2], r[3]]);
          cols.push({ t: 'relleno', capa: 'COLUMNAS', r: [a[0], a[1], b[0], b[1]] });
        });
      });
      pasos.push({ id: 'columnas', nombre: 'Columnas', comando: 'RECTANG', entidades: cols });

      plantas.forEach(function (nid) {
        var n = niveles[nid];
        // Muros
        var rects = [];
        M.muros.filter(function (m) { return m.nivel === nid; }).forEach(function (m) {
          var inf = infoMuro(m), cursor = inf.ini;
          aberturasDe(m.id).forEach(function (op) { if (op.desde > cursor) rects.push(rectPieza(inf, cursor, op.desde)); cursor = op.hasta; });
          if (inf.fin > cursor) rects.push(rectPieza(inf, cursor, inf.fin));
        });
        var u = unionRects(rects.map(function (r) { var a = P(nid, [r[0], r[1]]), b = P(nid, [r[2], r[3]]); return [a[0], a[1], b[0], b[1]]; }));
        var muros = u.segmentos.map(function (s) { return linea('MUROS', s[0], s[1]); });
        u.franjas.forEach(function (f) { muros.push({ t: 'relleno', capa: 'MUROS-RELLENO', r: f }); });
        pasos.push({ id: 'muros' + nid, nombre: 'Muros ' + n.nombre.toLowerCase(), comando: 'POLILINEA', entidades: muros, nivel: nid });

        // Carpintería, escalera, barandas, vacíos y tragaluces
        var carp = [];
        M.aberturas.forEach(function (op) {
          var m = muroPorId(op.muro);
          if (m.nivel !== nid) return;
          var inf = infoMuro(m), e = inf.e;
          function Q(d, k) { return P(nid, inf.eje === 'x' ? [d, inf.c + k] : [inf.c + k, d]); }
          var esPuerta = op.tipo === 'puerta' || op.tipo === 'pivotante';
          if (esPuerta) {
            var bisagra = op.bisagra || 'desde', lado = op.lado || 1;
            var dh = bisagra === 'desde' ? op.desde : op.hasta, dl = bisagra === 'desde' ? op.hasta : op.desde;
            var ancho = op.hasta - op.desde, cara = lado * e / 2;
            if (op.tipo === 'pivotante') { dh = op.desde + 0.3; ancho = op.hasta - op.desde - 0.3; dl = op.hasta; }
            var bis = Q(dh, cara), hoja = Q(dh, cara + lado * ancho);
            carp.push(linea('CARPINTERIA', bis, hoja));
            var aH = ang(bis, hoja), aJ = ang(bis, Q(dl, cara));
            var arco = ((aJ - aH + 360) % 360) === 90 ? [aH, aJ] : [aJ, aH];
            carp.push({ t: 'arco', capa: 'CARPINTERIA', c: bis, r: ancho, a0: arco[0], a1: arco[1] });
            carp.push(linea('CARPINTERIA', Q(op.desde, -e / 2), Q(op.hasta, -e / 2)));
            carp.push(linea('CARPINTERIA', Q(op.desde, e / 2), Q(op.hasta, e / 2)));
          } else if (op.tipo === 'corrediza') {
            var mid = (op.desde + op.hasta) / 2;
            carp.push(linea('CARPINTERIA', Q(op.desde, -e / 2), Q(op.hasta, -e / 2)));
            carp.push(linea('CARPINTERIA', Q(op.desde, e / 2), Q(op.hasta, e / 2)));
            carp.push(linea('CARPINTERIA', Q(op.desde, -0.025), Q(mid + 0.05, -0.025)));
            carp.push(linea('CARPINTERIA', Q(mid - 0.05, 0.025), Q(op.hasta, 0.025)));
          } else {
            carp.push(linea('CARPINTERIA', Q(op.desde, -e / 2), Q(op.hasta, -e / 2)));
            carp.push(linea('CARPINTERIA', Q(op.desde, e / 2), Q(op.hasta, e / 2)));
            carp.push(linea('CARPINTERIA', Q(op.desde, -0.015), Q(op.hasta, -0.015)));
            if (op.tipo !== 'fijo') carp.push(linea('CARPINTERIA', Q(op.desde, 0.015), Q(op.hasta, 0.015)));
          }
          if (op.celosia) {
            var afuera = (inf.eje === 'x' ? (inf.c < 1 ? -1 : 1) : (inf.c < 1 ? -1 : 1));
            carp.push(linea('CARPINTERIA', Q(op.desde - 0.1, afuera * (e / 2 + 0.12)), Q(op.hasta + 0.1, afuera * (e / 2 + 0.12))));
            carp.push(texto('TEXTO', Q((op.desde + op.hasta) / 2, afuera * (e / 2 + 0.32)), 0.1, 'CELOSÍA DE MADERA'));
          }
        });
        M.escaleras.forEach(function (es) {
          var h = es.huella, nT = es.escalones - 1;
          var corte = nid === es.desde ? 7 : 0;
          for (var k = 0; k <= nT; k++) {
            var y = es.y0 + k * h;
            if (nid === es.desde && k > corte) break;
            if (nid === es.hasta && k < 6) continue;
            carp.push(linea('ESCALERA', P(nid, [es.x0, y]), P(nid, [es.x1, y])));
          }
          var yc = es.y0 + corte * h;
          if (nid === es.desde) {
            carp.push(linea('ESCALERA', P(nid, [es.x0, yc + 0.25]), P(nid, [es.x1, yc - 0.15])));
            carp.push(poli('ESCALERA', [P(nid, [es.x0, es.y0]), P(nid, [es.x1, es.y0]), P(nid, [es.x1, yc + 0.1]), P(nid, [es.x0, yc + 0.35])], false));
            var xm = (es.x0 + es.x1) / 2;
            carp.push(poli('ESCALERA', [P(nid, [xm, es.y0 + 0.1]), P(nid, [xm, yc - 0.3])], false));
            carp.push(poli('ESCALERA', [P(nid, [xm - 0.12, yc - 0.5]), P(nid, [xm, yc - 0.3]), P(nid, [xm + 0.12, yc - 0.5])], false));
            carp.push(texto('TEXTO', P(nid, [xm - 0.45, es.y0 + 0.9]), 0.13, 'SUBE', 90));
          } else {
            var yf = es.y0 + nT * h;
            carp.push(linea('ESCALERA', P(nid, [es.x0, es.y0 + 6 * h]), P(nid, [es.x0, yf])));
            carp.push(linea('ESCALERA', P(nid, [es.x1, es.y0 + 6 * h]), P(nid, [es.x1, yf])));
          }
        });
        M.barandas.filter(function (b) { return b.nivel === nid; }).forEach(function (b) {
          carp.push(linea('BARANDAS', P(nid, b.a), P(nid, b.b)));
        });
        M.ambientes.filter(function (a) { return a.nivel === nid && a.vacio; }).forEach(function (a) {
          var xs = a.poli.map(function (q) { return q[0]; }), ys = a.poli.map(function (q) { return q[1]; });
          var r = [Math.min.apply(null, xs), Math.min.apply(null, ys), Math.min(Math.max.apply(null, xs), M.escaleras[0].x0), Math.max.apply(null, ys)];
          carp.push(linea('BARANDAS', P(nid, [r[0], r[1]]), P(nid, [r[2], r[3]])));
          carp.push(linea('BARANDAS', P(nid, [r[0], r[3]]), P(nid, [r[2], r[1]])));
        });
        if (nid === superior.id) {
          M.tragaluces.forEach(function (tr) {
            carp.push(rectN('TRAGALUCES', nid, tr.r));
            carp.push(texto('TRAGALUCES', P(nid, [(tr.r[0] + tr.r[2]) / 2, tr.r[1] + 0.2]), 0.11, tr.id));
          });
        }
        pasos.push({ id: 'carpinteria' + nid, nombre: 'Aberturas ' + n.nombre.toLowerCase(), comando: 'INSERT', entidades: carp, nivel: nid });
      });

      // Mobiliario y sanitarios
      var mob = [];
      M.muebles.forEach(function (mb) {
        simboloMueble(mb, function (q) { return P(mb.nivel, q); }).forEach(function (en) { mob.push(en); });
      });
      pasos.push({ id: 'mobiliario', nombre: 'Mobiliario', comando: 'INSERT', entidades: mob });

      // Cotas y textos
      var cot = [];
      function cadena(nid, pts, eje, pos, off) {
        for (var k = 0; k < pts.length - 1; k++) {
          var a = eje === 'x' ? [pts[k], pos] : [pos, pts[k]], b = eje === 'x' ? [pts[k + 1], pos] : [pos, pts[k + 1]];
          cot.push({ t: 'cota', capa: 'COTAS', a: P(nid, a), b: P(nid, b), off: off });
        }
      }
      cadena('PB', [0, 3.6, 6.0, W], 'x', 0, -0.9); cadena('PB', [0, W], 'x', 0, -1.5);
      cadena('PB', [0, 3.8, 5.8, 7.6, 11.6, 15], 'y', 0, -0.9); cadena('PB', [0, 15], 'y', 0, -1.5);
      cadena('PB', [0, 4.0, 7.6, 15], 'y', W, 0.9);
      cadena('PA', [0, 4.6, W], 'x', 0, -0.9); cadena('PA', [0, W], 'x', 0, -1.5);
      cadena('PA', [0, 3.8, 6.3, 8.8, 13, 15], 'y', 0, -0.9); cadena('PA', [0, 13], 'y', 0, -1.5);
      cadena('PA', [0, 3.4, 5.4, W], 'x', 13, 0.9);
      M.ambientes.forEach(function (a) {
        var p = P(a.nivel, a.etiqueta || centroide(a.poli)), rot = a.rotEtiqueta || 0;
        var dy = rot ? 0 : 0.13, dx = rot ? -0.13 : 0;
        cot.push(texto('TEXTO', [p[0] + dx, p[1] - dy], a.nombre.length > 14 ? 0.14 : 0.16, a.nombre.toUpperCase(), rot));
        var sub = a.vacio ? 'VACÍO' : fmt(areaPoligono(a.poli)) + ' m²';
        cot.push(texto('TEXTO', [p[0] - dx, p[1] + dy + 0.04], 0.11, sub, rot));
      });
      plantas.forEach(function (nid) {
        var n = niveles[nid], F = fondoDe(nid);
        var sup = M.ambientes.filter(function (a) { return a.nivel === nid && !a.vacio && !a.exterior; }).reduce(function (s, a) { return s + areaPoligono(a.poli); }, 0);
        cot.push(texto('TEXTO', P(nid, [W / 2, F + 2.6]), 0.34, n.nombre.toUpperCase()));
        cot.push(texto('TEXTO', P(nid, [W / 2, F + 3.1]), 0.16, 'ESC. 1:50 - NPT ' + (n.cota >= 0 ? '+' : '') + fmt(n.cota) + ' - SUP. CUBIERTA ' + fmt(sup) + ' m²'));
      });
      pasos.push({ id: 'cotas', nombre: 'Cotas y textos', comando: 'ACOTAR', entidades: cot });

      // Implantación: lote, retiros, huella de la casa, exteriores y vegetación
      var lot = [], ex = M.exterior;
      function S(p) { return [r6(p[0] + DX.sitio), r6(p[1])]; }
      function rectS(capa, r) { return poli(capa, [S([r[0], r[1]]), S([r[2], r[1]]), S([r[2], r[3]]), S([r[0], r[3]])]); }
      lot.push(rectS('LOTE', [0, 0, L.ancho, L.fondo]));
      var pbF = fondoDe('PB'), paF = fondoDe('PA');
      lot.push(rectS('MUROS', [O[0], O[1], O[0] + W, O[1] + pbF]));
      lot.push(rectS('RETIROS', [O[0] + 0.1, O[1] + 0.1, O[0] + W - 0.1, O[1] + paF]));
      lot.push(texto('TEXTO', S([O[0] + W / 2, O[1] + 6.5]), 0.3, 'CASA'));
      lot.push(texto('TEXTO', S([O[0] + W / 2, O[1] + 7.1]), 0.16, '2 PLANTAS - ' + fmt(computo().superficieCubierta) + ' m²'));
      lot.push(texto('TEXTO', S([O[0] + W / 2, O[1] + paF - 0.4]), 0.12, 'LÍNEA DE PLANTA ALTA'));
      lot.push(linea('RETIROS', S([0, O[1]]), S([L.ancho, O[1]])));
      lot.push(linea('SOLADOS', S([-4, ex.vereda.y0]), S([L.ancho + 4, ex.vereda.y0])));
      lot.push(texto('TEXTO', S([L.ancho / 2, -1.25]), 0.2, 'VEREDA'));
      lot.push(texto('TEXTO', S([L.ancho / 2, -6.0]), 0.3, 'CALLE'));
      lot.push(rectS('SOLADOS', ex.cochera));
      lot.push(texto('TEXTO', S([(ex.cochera[0] + ex.cochera[2]) / 2, 2.5]), 0.15, 'COCHERA 2 AUTOS'));
      ex.pasos.forEach(function (p) { lot.push(rectS('SOLADOS', [p[0] - 0.45, p[1] - 0.3, p[0] + 0.45, p[1] + 0.3])); });
      lot.push(rectS('PISCINA', ex.espejoAgua));
      lot.push(texto('TEXTO', S([(ex.espejoAgua[0] + ex.espejoAgua[2]) / 2, (ex.espejoAgua[1] + ex.espejoAgua[3]) / 2]), 0.14, 'ESPEJO DE AGUA'));
      for (var yS = ex.senderoEste.y0; yS < ex.senderoEste.y1; yS += 0.9) lot.push(rectS('SOLADOS', [ex.senderoEste.x - 0.3, yS, ex.senderoEste.x + 0.3, yS + 0.5]));
      lot.push(rectS('SOLADOS', ex.galeria));
      lot.push(texto('TEXTO', S([(ex.galeria[0] + ex.galeria[2]) / 2, ex.galeria[1] + 1.2]), 0.15, 'GALERÍA'));
      lot.push(rectS('SOLADOS', ex.deck));
      var pr = ex.piscina.r;
      lot.push(rectS('PISCINA', pr));
      lot.push(rectS('PISCINA', [pr[0] + 0.25, pr[1] + 0.25, pr[2] - 0.25, pr[3] - 0.25]));
      lot.push(texto('TEXTO', S([(pr[0] + pr[2]) / 2, (pr[1] + pr[3]) / 2]), 0.17, 'PISCINA ' + fmt(pr[2] - pr[0]) + ' x ' + fmt(pr[3] - pr[1])));
      var bl = ex.bale.r;
      lot.push(rectS('MUROS', bl));
      lot.push(linea('MUROS', S([bl[0], bl[1]]), S([bl[2], bl[3]])));
      lot.push(linea('MUROS', S([bl[0], bl[3]]), S([bl[2], bl[1]])));
      lot.push(texto('TEXTO', S([(bl[0] + bl[2]) / 2, bl[1] - 0.3]), 0.14, 'BALE-QUINCHO'));
      ex.bambu.forEach(function (b) {
        var n = Math.max(1, Math.round(Math.hypot(b[2] - b[0], b[3] - b[1]) / 0.5));
        for (var k = 0; k <= n; k++) lot.push({ t: 'circulo', capa: 'VEGETACION', c: S([b[0] + (b[2] - b[0]) * k / n, b[1] + (b[3] - b[1]) * k / n]), r: 0.12 });
      });
      ex.arboles.forEach(function (a) {
        if (a.tipo === 'pindo') {
          for (var q = 0; q < 8; q++) { var t = q * Math.PI / 4; lot.push(linea('VEGETACION', S([a.x, a.y]), S([r6(a.x + Math.cos(t) * 1.3), r6(a.y + Math.sin(t) * 1.3)]))); }
        } else {
          lot.push({ t: 'circulo', capa: 'VEGETACION', c: S([a.x, a.y]), r: a.r });
        }
        lot.push({ t: 'circulo', capa: 'VEGETACION', c: S([a.x, a.y]), r: 0.15 });
      });
      var NX = L.ancho + 2.4, NY = 1.6;
      lot.push({ t: 'circulo', capa: 'TEXTO', c: S([NX, NY]), r: 0.7 });
      lot.push(poli('TEXTO', [S([NX, NY - 0.65]), S([NX + 0.25, NY + 0.4]), S([NX, NY + 0.2]), S([NX - 0.25, NY + 0.4])]));
      lot.push(texto('TEXTO', S([NX, NY - 1.0]), 0.3, 'N'));
      lot.push({ t: 'cota', capa: 'COTAS', a: S([0, 0]), b: S([L.ancho, 0]), off: -3.6 });
      lot.push({ t: 'cota', capa: 'COTAS', a: S([L.ancho, 0]), b: S([L.ancho, L.fondo]), off: 1.4 });
      lot.push({ t: 'cota', capa: 'COTAS', a: S([0, 0]), b: S([0, O[1]]), off: -1.4 });
      lot.push({ t: 'cota', capa: 'COTAS', a: S([0, O[1] + pbF]), b: S([0, L.fondo]), off: -1.4 });
      lot.push({ t: 'cota', capa: 'COTAS', a: S([0, 6]), b: S([O[0], 6]), off: 0 });
      lot.push({ t: 'cota', capa: 'COTAS', a: S([O[0] + W, 6]), b: S([L.ancho, 6]), off: 0 });
      lot.push(texto('TEXTO', S([L.ancho / 2, L.fondo + 1.4]), 0.34, 'IMPLANTACIÓN'));
      lot.push(texto('TEXTO', S([L.ancho / 2, L.fondo + 1.9]), 0.16, 'LOTE 12,00 x 30,00 - 360,00 m² - ESC. 1:100'));
      pasos.push({ id: 'lote', nombre: 'Implantación', comando: 'POLILINEA', entidades: lot });
      return pasos;
    }

    // -------------------------------------------------------------------------
    // DXF R12 (cadena Latin-1, Y hacia el norte)
    // -------------------------------------------------------------------------
    function exportarDXF() {
      var out = [];
      function g(code, val) { out.push(String(code), String(val)); }
      function n(v) { return (Math.round(v * 10000) / 10000).toString(); }
      function X(p) { return n(p[0]); }
      function Y(p) { return n(-p[1]); }
      function txt(s) { return String(s).split('').map(function (ch) { return ch.charCodeAt(0) < 256 ? ch : '?'; }).join(''); }
      var ents = [];
      planoPorPasos().forEach(function (p) {
        p.entidades.forEach(function (e) { if (e.t === 'cota') expandirCota(e).forEach(function (x) { ents.push(x); }); else ents.push(e); });
      });
      var minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
      function ext(p) { minx = Math.min(minx, p[0]); maxx = Math.max(maxx, p[0]); miny = Math.min(miny, -p[1]); maxy = Math.max(maxy, -p[1]); }
      ents.forEach(function (e) {
        if (e.t === 'texto') ext(e.p); else if (e.p) e.p.forEach(ext);
        if (e.c) { ext([e.c[0] - e.r, e.c[1] - e.r]); ext([e.c[0] + e.r, e.c[1] + e.r]); }
        if (e.t === 'relleno') { ext([e.r[0], e.r[1]]); ext([e.r[2], e.r[3]]); }
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

    // -------------------------------------------------------------------------
    // Cómputo y ficha
    // -------------------------------------------------------------------------
    function largo(pts) {
      var s = 0;
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1], b = pts[i];
        s += Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2) + Math.pow(b[2] - a[2], 2));
      }
      return s;
    }
    function computo() {
      var porNivel = {}, total = 0;
      listaNiveles.forEach(function (n) {
        var s = M.ambientes.filter(function (a) { return a.nivel === n.id && !a.vacio && !a.exterior; }).reduce(function (acc, a) { return acc + areaPoligono(a.poli); }, 0);
        porNivel[n.id] = s; total += s;
      });
      var muroM2 = 0;
      piezasMuro().forEach(function (p) { var r = p.rect; muroM2 += Math.max(r[2] - r[0], r[3] - r[1]) * (p.h1 - p.h0); });
      var losaM2 = 0, huecosM2 = 0;
      M.losas.forEach(function (l) { losaM2 += areaPoligono(l.poli); (l.huecos || []).forEach(function (h) { huecosM2 += areaPoligono(h); }); });
      var vidrioCenital = M.tragaluces.reduce(function (s, t) { return s + (t.r[2] - t.r[0]) * (t.r[3] - t.r[1]); }, 0);
      losaM2 -= huecosM2 + vidrioCenital;
      var nCol = 0, hormigonCol = 0;
      listaNiveles.forEach(function (n) {
        var c = columnas(n.id);
        nCol += c.length;
        hormigonCol += c.length * M.columna * M.columna * (n.techo - n.cota + (n.indice === 0 ? n.cota : 0));
      });
      var nZap = columnas(listaNiveles[0].id).length;
      var hormigon = losaM2 * 0.2 + hormigonCol + nZap * (1.2 * 1.2 * 0.45);
      var cañerias = {};
      tramos().forEach(function (t) { cañerias[t.sistema] = (cañerias[t.sistema] || 0) + largo(t.puntos); });
      var lote = M.lote.ancho * M.lote.fondo;
      var huellaPB = areaPoligono(listaNiveles[0].huella);
      return {
        superficieCubierta: total,
        porNivel: porNivel,
        terrazas: M.ambientes.filter(function (a) { return a.exterior; }).reduce(function (s, a) { return s + areaPoligono(a.poli); }, 0),
        lote: lote,
        fos: huellaPB / lote,
        fot: total / lote,
        muroM2: muroM2,
        losaM2: losaM2,
        vidrioCenitalM2: vidrioCenital,
        hormigonM3: hormigon,
        columnas: nCol,
        aberturas: M.aberturas.length,
        tragaluces: M.tragaluces.length,
        cañerias: cañerias,
        retiros: {
          frente: O[1], oeste: O[0],
          este: M.lote.ancho - O[0] - M.casa.ancho,
          fondo: M.lote.fondo - O[1] - M.casa.fondo
        }
      };
    }

    return {
      modelo: M,
      niveles: niveles,
      listaNiveles: listaNiveles,
      azotea: AZOTEA,
      SISTEMAS: SISTEMAS,
      ETAPAS: ETAPAS,
      CAPAS: CAPAS,
      equipos: equipos(),
      tramos: tramos,
      piezasMuro: piezasMuro,
      columnas: columnas,
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
      espesor: espesor,
      transformador: transformador,
      luzAmbiente: luzAmbiente,
      desplazamientoPlano: DX,
      fmt: fmt,
      costoM2Ejemplo: 850
    };
  }

  return { crear: crear, SISTEMAS: SISTEMAS, CAPAS: CAPAS, ETAPAS: ETAPAS };
});
