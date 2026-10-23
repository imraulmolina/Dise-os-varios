/* Escena Three.js de un proyecto de varias plantas (motor.js + modelo.js).
 *
 * ESCENA.construir(THREE, P, { estilo: 'obra' | 'maqueta' }) donde P = MOTOR.crear(MODELO_CASA).
 * Cada objeto lleva en userData: etapa (0..4, -1 contexto), orden (0..1 dentro de la etapa),
 * anim ('subir' | 'caer' | 'aparecer' | 'tapa'), sistema, nivel (índice de planta para explotar),
 * techo (elementos de la azotea), fijo (no se separa al explotar) y categoria.
 * Script clásico: funciona también con doble clic (file://).
 */
(function (raiz) {
  'use strict';

  function construir(THREE, P, opciones) {
    opciones = opciones || {};
    var maqueta = opciones.estilo === 'maqueta';
    var M = P.modelo, N = P.niveles, LN = P.listaNiveles;
    var PB = LN[0], SUP = LN[LN.length - 1], AZOTEA = P.azotea;
    var CX = M.lote.ancho / 2, CY = M.lote.fondo / 2;
    var OX = M.casa.origen[0], OY = M.casa.origen[1];
    var IDX_TECHO = LN.length;

    function V(x, y, h) { return new THREE.Vector3(x - CX, h, y - CY); }
    function VC(x, y, h) { return V(x + OX, y + OY, h); }

    var raizGrupo = new THREE.Group();
    var elementos = [], lucesInteriores = [], vecinos = new THREE.Group();
    raizGrupo.add(vecinos);

    // -------------------------------------------------------------------------
    // Texturas procedurales (UV en metros)
    // -------------------------------------------------------------------------
    function texturaCanvas(ancho, alto, dibujar, tileX, tileY) {
      var c = document.createElement('canvas');
      c.width = ancho; c.height = alto;
      dibujar(c.getContext('2d'), ancho, alto);
      var t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(1 / tileX, 1 / tileY);
      t.anisotropy = 4;
      return t;
    }
    function ruido(g, w, h, a) {
      for (var i = 0; i < w * h / 18; i++) { g.fillStyle = 'rgba(0,0,0,' + (Math.random() * a) + ')'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    }
    function tablas(base, n, vertical) {
      return function (g, w, h) {
        for (var k = 0; k < n; k++) {
          var v = Math.floor(Math.random() * 24) - 12;
          g.fillStyle = 'rgb(' + Math.min(255, base[0] + v) + ',' + Math.min(255, base[1] + v) + ',' + Math.min(255, base[2] + v) + ')';
          if (vertical) g.fillRect(k * w / n, 0, w / n, h); else g.fillRect(0, k * h / n, w, h / n);
          g.fillStyle = 'rgba(40,25,10,0.45)';
          if (vertical) g.fillRect(k * w / n, 0, 1.5, h); else g.fillRect(0, k * h / n, w, 1.5);
        }
        ruido(g, w, h, 0.1);
      };
    }
    var TX = {};
    if (!maqueta) {
      TX.ladrillo = texturaCanvas(256, 136, function (g, w, h) {
        g.fillStyle = '#cfc4b6'; g.fillRect(0, 0, w, h);
        for (var f = 0; f < 4; f++) for (var k = -1; k < 3; k++) {
          var t = 150 + Math.floor(Math.random() * 30), x = k * (w / 2) + (f % 2) * (w / 4);
          g.fillStyle = 'rgb(' + (t + 30) + ',' + (t - 55) + ',' + (t - 90) + ')';
          g.fillRect(x + 3, f * h / 4 + 3, w / 2 - 6, h / 4 - 6);
        }
        ruido(g, w, h, 0.18);
      }, 0.5, 0.26);
      TX.madera = texturaCanvas(256, 256, tablas([168, 128, 88], 8, false), 1.2, 1.2);
      TX.deck = texturaCanvas(256, 256, tablas([150, 104, 66], 6, false), 0.9, 0.9);
      TX.tablasV = texturaCanvas(256, 256, tablas([210, 210, 210], 10, true), 1.0, 1.0);
      TX.piedra = texturaCanvas(256, 256, function (g, w, h) {
        g.fillStyle = '#6f6b64'; g.fillRect(0, 0, w, h);
        var y = 0;
        while (y < h) {
          var fh = 26 + Math.random() * 30, x = -Math.random() * 40;
          while (x < w) {
            var fw = 40 + Math.random() * 70, t = 180 + Math.floor(Math.random() * 60);
            g.fillStyle = 'rgb(' + t + ',' + (t - 4) + ',' + (t - 10) + ')';
            g.fillRect(x + 2, y + 2, fw - 4, fh - 4);
            x += fw;
          }
          y += fh;
        }
        ruido(g, w, h, 0.25);
      }, 1.2, 1.2);
      TX.baldosa = function (base, junta, tile) {
        return texturaCanvas(128, 128, function (g, w, h) {
          g.fillStyle = base; g.fillRect(0, 0, w, h); ruido(g, w, h, 0.05);
          g.fillStyle = junta; g.fillRect(0, 0, w, 2); g.fillRect(0, 0, 2, h);
        }, tile, tile);
      };
      TX.porcelanato = TX.baldosa('#ffffff', '#c7c1b6', 0.8);
      TX.ceramica = TX.baldosa('#d6dfe2', '#9fb0b5', 0.3);
      TX.piedraBano = TX.baldosa('#cdc6ba', '#a59d90', 0.6);
      TX.canto = texturaCanvas(128, 128, function (g, w, h) {
        g.fillStyle = '#d9d6cf'; g.fillRect(0, 0, w, h);
        for (var i = 0; i < 260; i++) {
          var t = 170 + Math.floor(Math.random() * 70);
          g.fillStyle = 'rgb(' + t + ',' + t + ',' + (t - 6) + ')';
          g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 3 + Math.random() * 4, 2 + Math.random() * 3, Math.random() * 3, 0, 7); g.fill();
        }
      }, 0.5, 0.5);
      TX.cesped = texturaCanvas(128, 128, function (g, w, h) {
        g.fillStyle = '#6c9a45'; g.fillRect(0, 0, w, h);
        for (var i = 0; i < 900; i++) { g.fillStyle = Math.random() > 0.5 ? 'rgba(40,80,20,0.35)' : 'rgba(150,190,90,0.3)'; g.fillRect(Math.random() * w, Math.random() * h, 1.5, 3); }
      }, 2, 2);
      TX.paja = texturaCanvas(128, 128, function (g, w, h) {
        g.fillStyle = '#a98552'; g.fillRect(0, 0, w, h);
        for (var i = 0; i < 700; i++) { var t = Math.random(); g.strokeStyle = t > 0.5 ? 'rgba(70,45,20,0.35)' : 'rgba(220,190,130,0.35)'; g.beginPath(); var x = Math.random() * w, y = Math.random() * h; g.moveTo(x, y); g.lineTo(x + Math.random() * 3 - 1.5, y + 10 + Math.random() * 10); g.stroke(); }
      }, 1, 1);
    }

    // -------------------------------------------------------------------------
    // Materiales
    // -------------------------------------------------------------------------
    function mat(color, extra) {
      var p = { color: color, roughness: 0.85, metalness: 0 };
      for (var k in extra || {}) p[k] = extra[k];
      return new THREE.MeshStandardMaterial(p);
    }
    function conMapa(t, color, extra) { return t ? mat('#ffffff', Object.assign({ map: t }, extra || {})) : mat(color, extra); }
    var SEL = {};
    Object.keys(M.materiales).forEach(function (k) { var s = M.materiales[k]; SEL[k] = s.opciones[s.elegido].color; });

    var MA = {
      tierra: mat('#7b5b40'), concreto: mat('#a8a49c'), concretoOscuro: mat('#8f8b83'),
      ladrillo: conMapa(TX.ladrillo, '#b5643c'),
      revoque: mat('#f3f0ea', { roughness: 0.95 }),
      revoqueExt: mat(SEL.fachada, { roughness: 0.95 }),
      revestimiento: mat(SEL.revestimiento, { roughness: 0.9 }),
      maderaFachada: mat(SEL.madera, { roughness: 0.6 }),
      pisoSocial: conMapa(TX.porcelanato, SEL.pisoSocial, { roughness: 0.4 }),
      losa: mat('#b7b3aa'), viga: mat('#9e9a91'),
      cielorraso: mat('#f6f4f0', { roughness: 1, emissive: new THREE.Color('#fffaf0'), emissiveIntensity: 0.16 }),
      marco: mat('#2c2e31', { roughness: 0.5, metalness: 0.4 }),
      vidrio: mat('#a9d0de', { transparent: true, opacity: 0.3, roughness: 0.05, metalness: 0.1, depthWrite: false }),
      vidrioCenital: mat('#cfe8f2', { transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0.1, depthWrite: false }),
      puerta: mat('#c49a6c', { roughness: 0.6 }),
      madera: conMapa(TX.madera, '#a87a4f', { roughness: 0.7 }),
      ceramica: conMapa(TX.ceramica, '#c9d3d6', { roughness: 0.4 }),
      piedraBano: conMapa(TX.piedraBano, '#cdc6ba', { roughness: 0.5 }),
      canto: conMapa(TX.canto, '#d9d6cf', { roughness: 1 }),
      deck: conMapa(TX.deck, '#9a6a44', { roughness: 0.75 }),
      cesped: conMapa(TX.cesped, '#6c9a45', { roughness: 1 }),
      vereda: mat('#cbc7be'), calle: mat('#45474a', { roughness: 0.95 }), solado: mat('#bdb8ae'),
      pasoPiedra: mat('#55534f', { roughness: 0.9 }),
      agua: mat(SEL.piscina, { transparent: true, opacity: 0.82, roughness: 0.06, metalness: 0.1 }),
      azulejo: mat(SEL.piscina, { roughness: 0.35 }),
      espejo: mat('#2f5f66', { transparent: true, opacity: 0.85, roughness: 0.05, metalness: 0.2 }),
      borde: mat('#e6dfd2'),
      blanco: mat('#f5f4f1', { roughness: 0.4 }), sanitario: mat('#fbfbfa', { roughness: 0.2 }),
      metal: mat('#a3a8ad', { roughness: 0.35, metalness: 0.7 }), oscuro: mat('#26282b', { roughness: 0.3 }),
      granito: mat('#3a3a3c', { roughness: 0.25 }), maderaClara: mat('#c9a47c', { roughness: 0.6 }),
      maderaOscura: mat('#5d4030', { roughness: 0.6 }), tela: mat('#8a8070', { roughness: 1 }),
      telaClara: mat('#ece6db', { roughness: 1 }), acento: mat('#7c8f6e', { roughness: 1 }),
      terracota: mat('#b5643c', { roughness: 1 }), alfombra: mat('#cdbfa8', { roughness: 1 }),
      tronco: mat('#6b4f3a'), troncoClaro: mat('#9c8a72'),
      hoja: mat('#4f8040', { roughness: 0.9, side: THREE.DoubleSide }),
      hojaClara: mat('#7fae58', { roughness: 0.9, flatShading: true }),
      flor: mat('#fff6e6', { roughness: 0.8, emissive: new THREE.Color('#ffe9a8'), emissiveIntensity: 0.05 }),
      copa: mat('#3f7a3a', { roughness: 0.9, flatShading: true }),
      bambu: mat('#7a9a3c', { roughness: 0.7 }),
      paja: conMapa(TX.paja, '#a98552', { roughness: 1, flatShading: true }),
      vecino: mat('#d9d5cd', { roughness: 0.95 }), vecinoTecho: mat('#bdb7ad', { roughness: 0.95 }),
      muroPerimetral: mat('#ebe7df'), membrana: mat('#dedbd3', { roughness: 0.9 }), coronamiento: mat('#e2ddd3', { roughness: 0.7 }),
      panelSolar: mat('#1d2a44', { roughness: 0.25, metalness: 0.6 }),
      luz: mat('#fff7e0', { emissive: new THREE.Color('#fff2cc'), emissiveIntensity: 0 }),
      farol: mat('#fff3d6', { emissive: new THREE.Color('#ffd58a'), emissiveIntensity: 0 })
    };
    var TEX_REV = {};
    if (!maqueta) { TEX_REV.piedra = TX.piedra; TEX_REV.teca = TX.tablasV; TEX_REV.ladrillo = TX.ladrillo; }
    function aplicarRevestimiento(op) {
      var t = TEX_REV[op];
      MA.revestimiento.map = t || null;
      MA.revestimiento.color.set(t ? (op === 'teca' ? SEL.madera : '#ffffff') : SEL.revestimiento);
      if (op === 'teca' && t) MA.revestimiento.color.set(M.materiales.revestimiento.opciones.teca.color).lerp(new THREE.Color('#ffffff'), 0.25);
      MA.revestimiento.needsUpdate = true;
    }
    aplicarRevestimiento(M.materiales.revestimiento.elegido);
    if (MA.pisoSocial.map) MA.pisoSocial.color.set(SEL.pisoSocial).lerp(new THREE.Color('#ffffff'), 0.35);

    var MS = {};
    Object.keys(P.SISTEMAS).forEach(function (k) {
      var c = P.SISTEMAS[k].color;
      MS[k] = mat(c, { roughness: 0.35, metalness: 0.2, emissive: new THREE.Color(c), emissiveIntensity: 0.15 });
    });

    if (maqueta) {
      Object.keys(MA).forEach(function (k) {
        if (/vidrio|agua|espejo|cesped|hoja|copa|bambu|flor|calle|luz|farol/.test(k)) return;
        MA[k].color.set('#f3f1ec'); MA[k].map = null;
      });
      MA.marco.color.set('#d9d6cf');
      MA.cesped.color.set('#dfe6d6');
      ['hoja', 'hojaClara', 'copa', 'bambu'].forEach(function (k) { MA[k].color.set('#cfdcc4'); });
      MA.calle.color.set('#c9c7c2');
    }

    var materialesObra = ['tierra', 'concreto', 'concretoOscuro', 'ladrillo', 'revoque', 'revoqueExt', 'revestimiento', 'maderaFachada',
      'pisoSocial', 'losa', 'viga', 'cielorraso', 'marco', 'puerta', 'madera', 'ceramica', 'piedraBano', 'canto', 'blanco', 'sanitario',
      'metal', 'oscuro', 'granito', 'maderaClara', 'maderaOscura', 'tela', 'telaClara', 'acento', 'terracota', 'alfombra', 'membrana',
      'panelSolar', 'luz', 'coronamiento'].map(function (k) { return MA[k]; });
    var materialesCortables = materialesObra.concat([MA.vidrio, MA.vidrioCenital, MA.deck, MA.hojaClara]).concat(Object.keys(MS).map(function (k) { return MS[k]; }));

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------
    function uvMundo(geo, lx, ly, lz) {
      var uv = geo.attributes.uv, dims = [[lz, ly], [lz, ly], [lx, lz], [lx, lz], [lx, ly], [lx, ly]];
      for (var f = 0; f < 6; f++) for (var v = 0; v < 4; v++) { var i = f * 4 + v; uv.setXY(i, uv.getX(i) * dims[f][0], uv.getY(i) * dims[f][1]); }
      uv.needsUpdate = true;
      return geo;
    }
    function cajaBase(lx, ly, lz, material) {
      var geo = uvMundo(new THREE.BoxGeometry(lx, ly, lz), lx, ly, lz);
      geo.translate(0, ly / 2, 0);
      return new THREE.Mesh(geo, material);
    }
    // Une las mallas de un grupo por material (menos llamadas de dibujo, misma apariencia).
    function fusionar(grupo) {
      grupo.updateMatrixWorld(true);
      var inv = new THREE.Matrix4().copy(grupo.matrixWorld).invert(), cubetas = new Map(), quitar = [];
      grupo.traverse(function (o) {
        if (!o.isMesh || o.isInstancedMesh) return;
        var g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
        g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld));
        if (!cubetas.has(o.material)) cubetas.set(o.material, []);
        cubetas.get(o.material).push(g);
        quitar.push(o);
      });
      if (quitar.length < 2) return;
      quitar.forEach(function (o) { o.parent.remove(o); });
      cubetas.forEach(function (geos, material) {
        var n = 0, off = 0;
        geos.forEach(function (g) { n += g.attributes.position.count; });
        var pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2);
        geos.forEach(function (g) {
          pos.set(g.attributes.position.array, off * 3);
          nor.set(g.attributes.normal.array, off * 3);
          if (g.attributes.uv) uv.set(g.attributes.uv.array, off * 2);
          off += g.attributes.position.count;
          g.dispose();
        });
        var mg = new THREE.BufferGeometry();
        mg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        mg.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
        mg.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
        mg.computeBoundingSphere();
        grupo.add(new THREE.Mesh(mg, material));
      });
    }
    function reg(obj, meta, padre) {
      if (obj.isGroup && !meta.sinFusion) fusionar(obj);
      obj.userData = Object.assign({ etapa: 0, orden: 0, anim: 'aparecer', sistema: null, fijo: false, nivel: 0 }, meta);
      obj.userData.base = obj.position.clone();
      obj.traverse(function (o) {
        if (o.isMesh) {
          o.castShadow = meta.sombra !== false; o.receiveShadow = true;
          if (meta.sistema) o.renderOrder = 5;
        }
      });
      (padre || raizGrupo).add(obj);
      if (padre !== vecinos) elementos.push(obj);
      return obj;
    }
    function cajaLote(r, h0, h1, material, meta, padre) {
      var m = cajaBase(r[2] - r[0], h1 - h0, r[3] - r[1], material);
      m.position.copy(V((r[0] + r[2]) / 2, (r[1] + r[3]) / 2, h0));
      return reg(m, meta, padre);
    }
    function cajaCasa(r, h0, h1, material, meta) { return cajaLote([r[0] + OX, r[1] + OY, r[2] + OX, r[3] + OY], h0, h1, material, meta); }
    function cilindroEntre(a, b, radio, material) {
      var dir = new THREE.Vector3().subVectors(b, a), len = dir.length();
      var geo = new THREE.CylinderGeometry(radio, radio, len, 8, 1);
      geo.translate(0, len / 2, 0);
      var m = new THREE.Mesh(geo, material);
      m.position.copy(a);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      return m;
    }
    function forma(poli, huecos, dx, dy) {
      var s = new THREE.Shape();
      poli.forEach(function (q, k) { var X = q[0] + dx - CX, Z = q[1] + dy - CY; if (k === 0) s.moveTo(X, -Z); else s.lineTo(X, -Z); });
      (huecos || []).forEach(function (h) {
        var p = new THREE.Path();
        h.forEach(function (q, k) { var X = q[0] + dx - CX, Z = q[1] + dy - CY; if (k === 0) p.moveTo(X, -Z); else p.lineTo(X, -Z); });
        s.holes.push(p);
      });
      return s;
    }
    function losa(poli, huecos, h0, espesorL, material, meta) {
      var geo = new THREE.ExtrudeGeometry(forma(poli, huecos, OX, OY), { depth: espesorL, bevelEnabled: false });
      geo.rotateX(-Math.PI / 2);
      var m = new THREE.Mesh(geo, material);
      m.position.y = h0;
      return reg(m, meta);
    }
    function plano(poli, h, material, meta, dx, dy) {
      var geo = new THREE.ShapeGeometry(forma(poli, [], dx === undefined ? OX : dx, dy === undefined ? OY : dy));
      geo.rotateX(-Math.PI / 2);
      var m = new THREE.Mesh(geo, material);
      m.position.y = h;
      return reg(m, meta);
    }
    // Plano horizontal mirando hacia abajo (cielorrasos)
    function planoAbajo(poli, h, material, meta) {
      var s = new THREE.Shape();
      poli.forEach(function (q, k) { var X = q[0] + OX - CX, Z = q[1] + OY - CY; if (k === 0) s.moveTo(X, Z); else s.lineTo(X, Z); });
      var geo = new THREE.ShapeGeometry(s);
      geo.rotateX(Math.PI / 2);
      var m = new THREE.Mesh(geo, material);
      m.position.y = h;
      return reg(m, meta);
    }
    function rectAPoli(r) { return [[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]]; }
    var E = { cim: 0, est: 1, ins: 2, env: 3, aca: 4 };
    function idx(nivelId) { return nivelId === 'techo' ? IDX_TECHO : N[nivelId].indice; }

    // -------------------------------------------------------------------------
    // Contexto: terreno, calle, vecinos
    // -------------------------------------------------------------------------
    var EX = M.exterior;
    var huellaPB = PB.huella;
    var excav = [OX - 0.3, OY - 0.3, OX + M.casa.ancho + 0.3, OY + M.casa.fondo + 0.3];
    var pis = EX.piscina.r, esp = EX.espejoAgua;
    var T = 90;
    var geoT = new THREE.ShapeGeometry(forma([[-T + CX, -T + CY], [T + CX, -T + CY], [T + CX, T + CY], [-T + CX, T + CY]], [rectAPoli(excav), rectAPoli(pis), rectAPoli(esp)], 0, 0));
    geoT.rotateX(-Math.PI / 2);
    var terreno = new THREE.Mesh(geoT, MA.cesped);
    terreno.receiveShadow = true;
    terreno.userData = { etapa: -1, fijo: true };
    raizGrupo.add(terreno);

    cajaLote(excav, -0.001, 0, MA.cesped, { etapa: E.cim, orden: 0, anim: 'tapa', fijo: true, sombra: false });
    cajaLote(pis, -0.001, 0, MA.cesped, { etapa: E.aca, orden: 0.5, anim: 'tapa', fijo: true, sombra: false });
    cajaLote(esp, -0.001, 0, MA.cesped, { etapa: E.aca, orden: 0.6, anim: 'tapa', fijo: true, sombra: false });
    var prof = 1.5;
    [[excav[0], excav[1], excav[2], excav[1] + 0.02], [excav[0], excav[3] - 0.02, excav[2], excav[3]], [excav[0], excav[1], excav[0] + 0.02, excav[3]], [excav[2] - 0.02, excav[1], excav[2], excav[3]]]
      .forEach(function (r) { cajaLote(r, -prof, 0, MA.tierra, { etapa: -1, fijo: true, sombra: false }); });
    cajaLote(excav, -prof - 0.02, -prof, MA.tierra, { etapa: -1, fijo: true, sombra: false });

    cajaLote([-40, EX.calle.y0, 52, EX.calle.y1], 0, 0.01, MA.calle, { etapa: -1, fijo: true, sombra: false });
    cajaLote([-40, EX.vereda.y0, 52, EX.vereda.y1], 0, 0.1, MA.vereda, { etapa: -1, fijo: true });
    cajaLote([-40, EX.vereda.y0, 52, EX.vereda.y0 + 0.15], 0, 0.14, MA.borde, { etapa: -1, fijo: true });
    for (var lx = -38; lx < 50; lx += 4) cajaLote([lx, -6.05, lx + 2, -5.95], 0.01, 0.015, MA.borde, { etapa: -1, fijo: true, sombra: false });

    [
      { r: [-10.8, 4, -1.5, 18], h: 6.6 }, { r: [-10.8, 18, -6, 23], h: 3.0 },
      { r: [13.5, 6, 21.5, 19], h: 3.4 }, { r: [13.5, 19, 18, 23], h: 3.0 },
      { r: [-9, -25, 2, -14], h: 3.4 }, { r: [5, -25, 16, -14], h: 6.4 }, { r: [19, -23, 28, -14], h: 3.2 },
      { r: [-22.5, 5, -14, 18], h: 3.2 }, { r: [25.5, 5, 34, 17], h: 6.4 }
    ].forEach(function (v) {
      cajaLote(v.r, 0, v.h, MA.vecino, { etapa: -1, fijo: true }, vecinos);
      cajaLote([v.r[0] - 0.1, v.r[1] - 0.1, v.r[2] + 0.1, v.r[3] + 0.1], v.h, v.h + 0.12, MA.vecinoTecho, { etapa: -1, fijo: true }, vecinos);
    });
    // Muros de los vecinos sobre la medianera
    cajaLote([-0.15, 0, 0, 30], 0, 2.4, MA.vecino, { etapa: -1, fijo: true }, vecinos);
    cajaLote([12, 0, 12.15, 30], 0, 2.4, MA.vecino, { etapa: -1, fijo: true }, vecinos);

    // -------------------------------------------------------------------------
    // Etapa 1: cimientos
    // -------------------------------------------------------------------------
    var colsPB = P.columnas(PB.id);
    colsPB.forEach(function (c, i) {
      var o = 0.04 + i * 0.012;
      cajaCasa([c.x - 0.6, c.y - 0.6, c.x + 0.6, c.y + 0.6], -1.45, -1.0, MA.concretoOscuro, { etapa: E.cim, orden: o, anim: 'subir' });
      cajaCasa([c.x - 0.15, c.y - 0.15, c.x + 0.15, c.y + 0.15], -1.0, -0.05, MA.concretoOscuro, { etapa: E.cim, orden: o + 0.05, anim: 'subir' });
    });
    M.muros.filter(function (m) { return m.nivel === PB.id; }).forEach(function (m, i) {
      var inf = P.infoMuro(m), e = 0.25;
      var r = inf.eje === 'x' ? [inf.ini, inf.c - e / 2, inf.fin, inf.c + e / 2] : [inf.c - e / 2, inf.ini, inf.c + e / 2, inf.fin];
      cajaCasa(r, -0.4, 0.05, MA.concreto, { etapa: E.cim, orden: 0.4 + i * 0.012, anim: 'subir' });
    });
    cajaLote([excav[0] + 0.02, excav[1] + 0.02, excav[2] - 0.02, excav[3] - 0.02], -prof, -0.02, MA.tierra, { etapa: E.cim, orden: 0.6, anim: 'subir', fijo: true, sombra: false });
    losa(huellaPB, [], 0.03, PB.cota - 0.04, MA.concreto, { etapa: E.cim, orden: 0.72, anim: 'subir', nivel: 0 });

    // -------------------------------------------------------------------------
    // Etapa 2: estructura (por planta: columnas, vigas, losa) y escalera
    // -------------------------------------------------------------------------
    var c2 = M.columna / 2, vb = M.viga.ancho, vh = M.viga.alto;
    LN.forEach(function (n, k) {
      var base = k * 0.36;
      var cols = P.columnas(n.id);
      cols.forEach(function (c, i) {
        cajaCasa([c.x - c2, c.y - c2, c.x + c2, c.y + c2], k === 0 ? 0.05 : n.cota, n.cielo, MA.concreto, { etapa: E.est, orden: base + i * 0.006, anim: 'subir', nivel: k });
      });
      var losaN = M.losas.filter(function (l) { return l.sobre === n.id; })[0];
      var ys = M.ejes.y.map(function (e) { return e.v; }).filter(function (y) { return y <= Math.max.apply(null, losaN.poli.map(function (q) { return q[1]; })) + 0.01; });
      var xs = M.ejes.x.map(function (e) { return e.v; });
      var nv = k + (n === SUP ? 1 : 1);
      ys.forEach(function (y, i) { cajaCasa([xs[0], y - vb / 2, xs[xs.length - 1], y + vb / 2], n.cielo - vh, n.cielo, MA.viga, { etapa: E.est, orden: base + 0.16 + i * 0.01, anim: 'caer', nivel: nv, techo: n === SUP }); });
      xs.forEach(function (x, i) { cajaCasa([x - vb / 2, ys[0], x + vb / 2, ys[ys.length - 1]], n.cielo - vh, n.cielo, MA.viga, { etapa: E.est, orden: base + 0.2 + i * 0.01, anim: 'caer', nivel: nv, techo: n === SUP }); });
      var huecos = (losaN.huecos || []).slice();
      if (losaN.techo) M.tragaluces.forEach(function (t) { huecos.push(rectAPoli(t.r)); });
      losa(losaN.poli, huecos, n.cielo, n.losa, MA.losa, { etapa: E.est, orden: base + 0.26, anim: 'caer', nivel: nv, techo: !!losaN.techo, categoria: 'losa' });
    });
    // Escalera: zanca de acero en estructura, peldaños flotantes de madera en acabados
    M.escaleras.forEach(function (es) {
      var a = N[es.desde], b = N[es.hasta], n = es.escalones, cr = (b.cota - a.cota) / n, run = (n - 1) * es.huella;
      var largoZ = Math.sqrt(run * run + (b.cota - a.cota) * (b.cota - a.cota));
      var zanca = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, largoZ), MA.oscuro);
      var xm = (es.x0 + es.x1) / 2;
      zanca.position.copy(VC(xm, es.y0 + run / 2, (a.cota + b.cota) / 2 - 0.12));
      zanca.rotation.x = Math.atan2(b.cota - a.cota, run);
      reg(zanca, { etapa: E.est, orden: 0.32, anim: 'aparecer', nivel: idx(es.desde) });
      for (var k = 1; k < n; k++) {
        var pel = cajaCasa([es.x0 + 0.02, es.y0 + (k - 1) * es.huella, es.x1 - 0.02, es.y0 + k * es.huella + 0.02], a.cota + k * cr - 0.05, a.cota + k * cr, MA.maderaFachada,
          { etapa: E.aca, orden: 0.4 + k * 0.006, anim: 'caer', nivel: idx(es.desde), categoria: 'escalera' });
        void pel;
      }
      // Baranda de vidrio del lado abierto
      var g = new THREE.Group();
      var y1 = es.y0 + 1.2, y2 = es.y0 + run;
      var h1 = a.cota + (1.2 / es.huella) * cr, h2 = b.cota;
      var geo = new THREE.BufferGeometry();
      var p0 = VC(es.x0 + 0.03, y1, h1), p1 = VC(es.x0 + 0.03, y2, h2), p2 = VC(es.x0 + 0.03, y2, h2 + 0.95), p3 = VC(es.x0 + 0.03, y1, h1 + 0.95);
      geo.setAttribute('position', new THREE.Float32BufferAttribute([p0.x, p0.y, p0.z, p1.x, p1.y, p1.z, p2.x, p2.y, p2.z, p0.x, p0.y, p0.z, p2.x, p2.y, p2.z, p3.x, p3.y, p3.z], 3));
      geo.computeVertexNormals();
      g.add(new THREE.Mesh(geo, MA.vidrio));
      g.add(cilindroEntre(p3, p2, 0.02, MA.metal));
      reg(g, { etapa: E.aca, orden: 0.6, anim: 'aparecer', nivel: idx(es.desde), sombra: false });
    });

    // -------------------------------------------------------------------------
    // Etapa 3: instalaciones
    // -------------------------------------------------------------------------
    var ordenSistema = { aguaFria: 0, aguaCaliente: 0.14, desague: 0.28, electricidad: 0.42, aire: 0.62 };
    var cuenta = {};
    P.tramos().forEach(function (t) {
      var sis = P.SISTEMAS[t.sistema];
      cuenta[t.sistema] = (cuenta[t.sistema] || 0) + 1;
      var base = ordenSistema[t.sistema] + Math.min(cuenta[t.sistema] * 0.006, 0.14);
      var hm = t.puntos.reduce(function (s, p) { return s + p[2]; }, 0) / t.puntos.length;
      var nivel = hm > AZOTEA ? IDX_TECHO : (hm > LN[1 % LN.length].cota - 0.25 && LN.length > 1 ? 1 : 0);
      for (var i = 0; i < t.puntos.length - 1; i++) {
        var a = VC(t.puntos[i][0], t.puntos[i][1], t.puntos[i][2]), b = VC(t.puntos[i + 1][0], t.puntos[i + 1][1], t.puntos[i + 1][2]);
        if (a.distanceTo(b) < 1e-4) continue;
        reg(cilindroEntre(a, b, sis.radio, MS[t.sistema]), { etapa: E.ins, orden: Math.min(base + i * 0.02, 0.92), anim: 'subir', sistema: t.sistema, sombra: false, nivel: nivel, tuberia: true });
        if (i > 0) {
          var codo = new THREE.Mesh(new THREE.SphereGeometry(sis.radio * 1.15, 8, 6), MS[t.sistema]);
          codo.position.copy(a);
          reg(codo, { etapa: E.ins, orden: Math.min(base + i * 0.02, 0.92), anim: 'aparecer', sistema: t.sistema, sombra: false, nivel: nivel, tuberia: true });
        }
      }
    });
    P.equipos.forEach(function (q, i) {
      var obj;
      if (q.cil) {
        obj = new THREE.Group();
        var tq = new THREE.Mesh(new THREE.CylinderGeometry(q.cil, q.cil, q.alto, 20), MA.oscuro);
        tq.position.y = 0.35 + q.alto / 2;
        obj.add(tq);
        var base = cajaBase(q.cil * 2, 0.35, q.cil * 2, MA.metal); obj.add(base);
        obj.position.copy(VC(q.p[0], q.p[1], AZOTEA));
      } else if (q.solar) {
        obj = new THREE.Group();
        var panel = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.05, 1.1), MA.panelSolar);
        panel.position.set(0, 0.55, 0.15); panel.rotation.x = -0.5;
        obj.add(panel);
        var term = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 2.0, 16), MA.blanco);
        term.rotation.z = Math.PI / 2; term.position.set(0, 0.95, 0.55);
        obj.add(term);
        var pata = cajaBase(1.9, 0.1, 1.0, MA.metal); obj.add(pata);
        obj.position.copy(VC(q.p[0], q.p[1], AZOTEA));
      } else {
        var d = q.dim;
        obj = cajaBase(d[0], d[2], d[1], q.sistema === 'desague' ? MA.concretoOscuro : (q.id === 'pilar' ? MA.muroPerimetral : MA.blanco));
        obj.position.copy(VC(q.p[0], q.p[1], q.p[2] - d[2] / 2));
        var franja = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.04), MS[q.sistema]);
        franja.position.set(0, d[2] + 0.02, 0);
        obj.add(franja);
      }
      var nvq = q.techo ? IDX_TECHO : (q.p[2] > LN[LN.length - 1].cota ? LN.length - 1 : 0);
      reg(obj, { etapa: E.ins, orden: 0.78 + i * 0.008, anim: 'aparecer', sistema: q.sistema, nivel: nvq, techo: !!q.techo, fijo: !!q.exterior });
    });

    // -------------------------------------------------------------------------
    // Etapa 4: envolvente
    // -------------------------------------------------------------------------
    var piezas = P.piezasMuro();
    var ordenMuro = {};
    M.muros.forEach(function (m, i) { ordenMuro[m.id] = (N[m.nivel].indice * 0.25) + (i % 12) * 0.012; });
    piezas.forEach(function (p) {
      var n = N[p.nivel];
      cajaCasa(p.rect, p.h0, p.h1, MA.ladrillo, { etapa: E.env, orden: ordenMuro[p.muro], anim: 'subir', frente: [n.cota, n.cielo], nivel: n.indice, categoria: 'muro' });
    });
    // Parapetos de la azotea
    M.muros.filter(function (m) { return m.ext && m.nivel === SUP.id; }).forEach(function (m, i) {
      var inf = P.infoMuro(m), e = inf.e;
      var r = inf.eje === 'x' ? [inf.ini, inf.c - e / 2, inf.fin, inf.c + e / 2] : [inf.c - e / 2, inf.ini - e / 2, inf.c + e / 2, inf.fin + e / 2];
      cajaCasa(r, SUP.techo, SUP.techo + (SUP.parapeto || 0.6), MA.ladrillo, { etapa: E.env, orden: 0.55 + i * 0.02, anim: 'subir', nivel: IDX_TECHO, techo: true, categoria: 'muro' });
    });
    // Borde de losa de la terraza
    var ancho = M.casa.ancho, fondoPB = M.casa.fondo;
    // Aberturas
    M.aberturas.forEach(function (op, i) {
      var m = P.muroPorId(op.muro), inf = P.infoMuro(m), n = N[m.nivel];
      var h0 = n.cota + op.antepecho, H = op.alto;
      var g = new THREE.Group(), largo = op.hasta - op.desde, W2 = largo / 2, pf = 0.05, prof = 0.07;
      g.position.copy(inf.eje === 'x' ? VC((op.desde + op.hasta) / 2, inf.c, h0) : VC(inf.c, (op.desde + op.hasta) / 2, h0));
      if (inf.eje === 'y') g.rotation.y = Math.PI / 2;
      function barra(x0, y0, x1, y1, z, d, material) { var b = cajaBase(x1 - x0, y1 - y0, d, material); b.position.set((x0 + x1) / 2, y0, z || 0); g.add(b); }
      var esPuerta = op.tipo === 'puerta' || op.tipo === 'pivotante';
      if (esPuerta) {
        barra(-W2, 0, -W2 + pf, H, 0, inf.e + 0.04, MA.marco); barra(W2 - pf, 0, W2, H, 0, inf.e + 0.04, MA.marco); barra(-W2, H - pf, W2, H, 0, inf.e + 0.04, MA.marco);
      } else {
        barra(-W2, 0, -W2 + pf, H, 0, prof, MA.marco); barra(W2 - pf, 0, W2, H, 0, prof, MA.marco);
        barra(-W2, 0, W2, pf, 0, prof, MA.marco); barra(-W2, H - pf, W2, H, 0, prof, MA.marco);
        if (op.tipo === 'corrediza') {
          barra(-0.03, 0, 0.03, H, 0.03, 0.03, MA.marco);
          barra(-W2 + pf, pf, 0.03, H - pf, -0.015, 0.012, MA.vidrio);
          barra(-0.03, pf, W2 - pf, H - pf, 0.015, 0.012, MA.vidrio);
        } else {
          if (largo > 1.8 && op.tipo !== 'fijo') barra(-0.025, pf, 0.025, H - pf, 0, prof * 0.8, MA.marco);
          barra(-W2 + pf, pf, W2 - pf, H - pf, 0, 0.012, MA.vidrio);
        }
      }
      reg(g, { etapa: E.env, orden: 0.62 + (i % 20) * 0.015, anim: 'aparecer', nivel: n.indice, categoria: 'abertura' });

      if (esPuerta) {
        var pivot = op.tipo === 'pivotante';
        var anchoH = largo - 0.04, hoja = new THREE.Group();
        var gh = new THREE.BoxGeometry(anchoH, op.alto - 0.03, pivot ? 0.06 : 0.04);
        var off = pivot ? -0.3 : 0;
        gh.translate(anchoH / 2 + off, (op.alto - 0.03) / 2, 0);
        hoja.add(new THREE.Mesh(gh, pivot ? MA.maderaFachada : MA.puerta));
        var manija = new THREE.Mesh(pivot ? new THREE.BoxGeometry(0.03, 1.2, 0.08) : new THREE.BoxGeometry(0.12, 0.02, 0.06), MA.metal);
        manija.position.set(anchoH - 0.12 + off, pivot ? 0.6 : 1.0, 0);
        hoja.add(manija);
        var lado = op.lado || 1, bisagra = op.bisagra || 'desde';
        var dh = pivot ? op.desde + 0.32 : (bisagra === 'desde' ? op.desde + 0.02 : op.hasta - 0.02);
        var cara = pivot ? 0 : lado * inf.e / 2;
        hoja.position.copy(inf.eje === 'x' ? VC(dh, inf.c + cara, n.cota) : VC(inf.c + cara, dh, n.cota));
        var sgn = (pivot || bisagra === 'desde') ? 1 : -1;
        var dc = inf.eje === 'x' ? new THREE.Vector2(sgn, 0) : new THREE.Vector2(0, sgn);
        var dop = inf.eje === 'x' ? new THREE.Vector2(0, lado) : new THREE.Vector2(lado, 0);
        var a = (pivot ? 70 : 80) * Math.PI / 180;
        var dir = new THREE.Vector2(dc.x * Math.cos(a) + dop.x * Math.sin(a), dc.y * Math.cos(a) + dop.y * Math.sin(a));
        hoja.rotation.y = Math.atan2(-dir.y, dir.x);
        reg(hoja, { etapa: E.aca, orden: 0.42 + (i % 20) * 0.008, anim: 'aparecer', nivel: n.indice, categoria: 'puerta' });
      }
      // Celosía de listones de madera por fuera de la ventana
      if (op.celosia) {
        var cel = new THREE.Group();
        var afuera = inf.c < 1 ? -1 : 1, z = afuera * (inf.e / 2 + 0.14);
        for (var x = -W2 - 0.1; x <= W2 + 0.1; x += 0.11) {
          var l = cajaBase(0.045, H + 0.4, 0.07, MA.maderaFachada);
          l.position.set(x, -0.2, inf.eje === 'x' ? z : -z);
          cel.add(l);
        }
        cel.position.copy(g.position);
        cel.rotation.y = g.rotation.y;
        reg(cel, { etapa: E.aca, orden: 0.36 + (i % 10) * 0.01, anim: 'aparecer', nivel: n.indice, categoria: 'celosia' });
      }
    });
    // Tragaluces: cupertina, marco y vidrio
    M.tragaluces.forEach(function (t, i) {
      var r = t.r, g = new THREE.Group(), h = 0.18;
      [[r[0] - 0.08, r[1] - 0.08, r[2] + 0.08, r[1]], [r[0] - 0.08, r[3], r[2] + 0.08, r[3] + 0.08], [r[0] - 0.08, r[1], r[0], r[3]], [r[2], r[1], r[2] + 0.08, r[3]]]
        .forEach(function (q) {
          var c = cajaBase(q[2] - q[0], h, q[3] - q[1], MA.revoqueExt);
          c.position.copy(VC((q[0] + q[2]) / 2, (q[1] + q[3]) / 2, 0));
          g.add(c);
        });
      var vid = cajaBase(r[2] - r[0] + 0.12, 0.025, r[3] - r[1] + 0.12, MA.vidrioCenital);
      vid.position.copy(VC((r[0] + r[2]) / 2, (r[1] + r[3]) / 2, h));
      g.add(vid);
      g.position.y = SUP.techo;
      reg(g, { etapa: E.env, orden: 0.82 + i * 0.02, anim: 'aparecer', nivel: IDX_TECHO, techo: true, categoria: 'tragaluz', sombra: false });
    });

    // -------------------------------------------------------------------------
    // Etapa 5: acabados
    // -------------------------------------------------------------------------
    var rv = 0.025;
    var centroCasa = [M.casa.ancho / 2, M.casa.fondo / 2];
    piezas.forEach(function (p) {
      var n = N[p.nivel], r = p.rect.slice(), meta = { etapa: E.aca, orden: 0.02 + ordenMuro[p.muro] * 0.4, anim: 'subir', frente: [n.cota, n.cielo], nivel: n.indice, categoria: 'revoque' };
      function extremos(q) {
        if (p.eje === 'x') { if (p.ini) q[0] -= rv; if (p.fin) q[2] += rv; } else { if (p.ini) q[1] -= rv; if (p.fin) q[3] += rv; }
        return q;
      }
      if (!p.ext) {
        if (p.eje === 'x') { r[1] -= rv; r[3] += rv; } else { r[0] -= rv; r[2] += rv; }
        cajaCasa(extremos(r), p.h0, p.h1, MA.revoque, meta);
        return;
      }
      // Muro exterior: piel exterior (color de fachada) y piel interior (blanca)
      var afuera = p.eje === 'x' ? (r[1] < centroCasa[1] ? -1 : 1) : (r[0] < centroCasa[0] ? -1 : 1);
      var ext = r.slice(), int = r.slice();
      if (p.eje === 'x') {
        if (afuera < 0) { ext[3] = r[1]; ext[1] = r[1] - rv; int[1] = r[3]; int[3] = r[3] + rv; } else { ext[1] = r[3]; ext[3] = r[3] + rv; int[3] = r[1]; int[1] = r[1] - rv; }
      } else {
        if (afuera < 0) { ext[2] = r[0]; ext[0] = r[0] - rv; int[0] = r[2]; int[2] = r[2] + rv; } else { ext[0] = r[2]; ext[2] = r[2] + rv; int[2] = r[0]; int[0] = r[0] - rv; }
      }
      cajaCasa(extremos(ext), p.h0, p.h1, MA.revoqueExt, meta);
      cajaCasa(int, p.h0, p.h1, MA.revoque, meta);
    });
    // Borde de losas, parapetos y piel de fachada entre plantas
    LN.forEach(function (n, k) {
      var l = M.losas.filter(function (q) { return q.sobre === n.id; })[0];
      var xs = l.poli.map(function (q) { return q[0]; }), ys = l.poli.map(function (q) { return q[1]; });
      var r = [Math.min.apply(null, xs), Math.min.apply(null, ys), Math.max.apply(null, xs), Math.max.apply(null, ys)];
      var nv = k + 1, hh0 = n.cielo, hh1 = n.techo + (l.techo ? (n.parapeto || 0.6) + 0.03 : 0);
      [[r[0] - rv, r[1] - rv, r[2] + rv, r[1]], [r[0] - rv, r[3], r[2] + rv, r[3] + rv], [r[0] - rv, r[1], r[0], r[3]], [r[2], r[1], r[2] + rv, r[3]]].forEach(function (q) {
        cajaCasa(q, hh0, hh1, MA.revoqueExt, { etapa: E.aca, orden: 0.24, anim: 'subir', nivel: nv, techo: !!l.techo, categoria: 'revoque' });
      });
      if (l.techo) {
        // Coronamiento del parapeto (anillo perimetral)
        var cw = M.muroExterior + 2 * rv + 0.02;
        [[r[0] - rv - 0.01, r[1] - rv - 0.01, r[2] + rv + 0.01, r[1] - rv + cw], [r[0] - rv - 0.01, r[3] + rv - cw, r[2] + rv + 0.01, r[3] + rv + 0.01],
          [r[0] - rv - 0.01, r[1], r[0] - rv + cw, r[3]], [r[2] + rv - cw, r[1], r[2] + rv + 0.01, r[3]]].forEach(function (q) {
          cajaCasa(q, hh1, hh1 + 0.04, MA.coronamiento, { etapa: E.aca, orden: 0.26, anim: 'aparecer', nivel: nv, techo: true, sombra: false });
        });
        cajaCasa([r[0] + 0.25, r[1] + 0.25, r[2] - 0.25, r[3] - 0.25], n.techo, n.techo + 0.03, MA.membrana, { etapa: E.aca, orden: 0.28, anim: 'caer', nivel: nv, techo: true, sombra: false });
      }
    });
    // Revestimiento de piedra (u otra opción) en el frente de la habitación 4 y en el bale
    M.muros.filter(function (m) { return m.revestimiento; }).forEach(function (m) {
      var inf = P.infoMuro(m), n = N[m.nivel], rr = m.revestimiento, e = 0.05;
      var r = inf.eje === 'x' ? [rr[0] - 0.03, inf.c - inf.e / 2 - e, rr[1], inf.c - inf.e / 2] : [inf.c - inf.e / 2 - e, rr[0], inf.c - inf.e / 2, rr[1]];
      cajaCasa(r, 0.0, n.techo + 0.02, MA.revestimiento, { etapa: E.aca, orden: 0.3, anim: 'subir', nivel: n.indice, categoria: 'revestimiento' });
    });
    // Cielorrasos y pisos
    var MAT_PISO = { madera: MA.madera, porcelanato: MA.pisoSocial, ceramica: MA.ceramica, piedra: MA.piedraBano, canto: MA.canto, deck: MA.deck };
    M.ambientes.forEach(function (a, i) {
      var n = N[a.nivel];
      if (a.vacio) return;
      plano(a.poli, n.cota + 0.002, MAT_PISO[a.piso] || MA.pisoSocial, { etapa: E.aca, orden: 0.12 + (i % 10) * 0.012, anim: 'aparecer', nivel: n.indice, categoria: 'piso', sombra: false });
      if (a.exterior || a.dobleAltura) return;
      planoAbajo(a.poli, n.cielo - 0.006, MA.cielorraso, { etapa: E.aca, orden: 0.32, anim: 'aparecer', nivel: n.indice, sombra: false });
      var l = P.luzAmbiente(a), area = P.areaPoligono(a.poli);
      var plafon = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.03, 20), MA.luz);
      plafon.position.copy(VC(l[0], l[1], n.cielo - 0.03));
      reg(plafon, { etapa: E.aca, orden: 0.36, anim: 'aparecer', nivel: n.indice, sombra: false });
      if (area > 9) {
        var pl = new THREE.PointLight('#ffd9a0', 0, 7, 1.6);
        pl.visible = false;
        pl.position.copy(VC(l[0], l[1], n.cielo - 0.4));
        pl.userData = { nivel: n.indice };
        raizGrupo.add(pl);
        lucesInteriores.push(pl);
      }
    });
    // Barandas de vidrio
    M.barandas.forEach(function (b, i) {
      var n = N[b.nivel], g = new THREE.Group();
      var a = VC(b.a[0], b.a[1], n.cota), c = VC(b.b[0], b.b[1], n.cota);
      var largo = a.distanceTo(c);
      var vid = cajaBase(largo, 1.0, 0.015, MA.vidrio);
      vid.position.copy(a.clone().add(c).multiplyScalar(0.5));
      vid.rotation.y = Math.atan2(-(c.z - a.z), c.x - a.x);
      g.add(vid);
      g.add(cilindroEntre(a.clone().setY(n.cota + 1.02), c.clone().setY(n.cota + 1.02), 0.022, MA.metal));
      reg(g, { etapa: E.aca, orden: 0.6 + i * 0.01, anim: 'aparecer', nivel: n.indice, sombra: false });
    });

    // Muebles
    M.muebles.forEach(function (mb, i) {
      var n = N[mb.nivel], g = mueble3D(mb);
      g.position.copy(VC(mb.x, mb.y, n.cota));
      g.rotation.y = { S: 0, E: Math.PI / 2, N: Math.PI, O: -Math.PI / 2 }[mb.frente || 'S'];
      reg(g, { etapa: E.aca, orden: 0.45 + (i / M.muebles.length) * 0.35, anim: 'caer', nivel: n.indice, categoria: 'mueble', sombra: false });
    });

    function planta(alto, ancho, verde) {
      var g = new THREE.Group();
      for (var k = 0; k < 7; k++) {
        var h = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), verde || MA.hoja);
        h.scale.set(ancho * 0.5, 0.04, ancho * 0.16);
        h.geometry.translate(1, 0, 0);
        var p = new THREE.Group();
        p.position.y = alto * (0.55 + (k % 3) * 0.15);
        p.rotation.y = k / 7 * Math.PI * 2;
        h.rotation.z = 0.5 + (k % 2) * 0.35;
        p.add(h);
        g.add(p);
      }
      var tallo = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, alto * 0.7, 6), MA.hoja);
      tallo.position.y = alto * 0.35;
      g.add(tallo);
      return g;
    }

    function mueble3D(mb) {
      var g = new THREE.Group(), w = mb.w, d = mb.d;
      function caja(x, y, z, sx, sy, sz, material) { var m = cajaBase(sx, sy, sz, material); m.position.set(x, y, z); g.add(m); return m; }
      function cil(x, y, z, r, h, material, seg) { var m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg || 16), material); m.geometry.translate(0, h / 2, 0); m.position.set(x, y, z); g.add(m); return m; }
      function patas(x0, x1, z0, z1, h, r, material) { [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].forEach(function (p) { cil(p[0], 0, p[1], r, h, material, 6); }); }
      switch (mb.tipo) {
        case 'cama':
          caja(0, 0, 0, w, 0.3, d, MA.maderaClara);
          caja(0, 0.3, 0.04, w - 0.04, 0.2, d - 0.1, MA.telaClara);
          caja(0, 0, -d / 2 + 0.03, w + 0.3, 1.05, 0.06, MA.maderaFachada);
          var nA = w > 1.5 ? 2 : 1;
          for (var k = 0; k < nA; k++) caja(nA === 1 ? 0 : (k === 0 ? -w / 4 : w / 4), 0.5, -d / 2 + 0.28, (w - 0.2) / nA, 0.12, 0.38, MA.blanco);
          caja(0, 0.48, d * 0.2, w + 0.02, 0.05, d * 0.58, w > 1.5 ? MA.acento : MA.telaClara);
          break;
        case 'mesaLuz': caja(0, 0, 0, w, 0.48, d, MA.maderaClara); cil(0, 0.48, 0, 0.07, 0.3, MA.telaClara, 10); break;
        case 'placard':
          if (mb.abierto) {
            caja(0, 0, -d / 2 + 0.02, w, 2.4, 0.04, MA.maderaClara);
            [0.3, 1.0, 1.7, 2.35].forEach(function (y) { caja(0, y, 0, w, 0.03, d, MA.maderaClara); });
            cil(0, 1.85, 0, 0.012, 0.01, MA.metal);
            for (var q = 0; q < Math.floor(w / 0.12); q++) caja(-w / 2 + 0.08 + q * 0.12, 1.15, 0, 0.05, 0.6, d * 0.7, q % 3 ? MA.telaClara : MA.acento);
          } else {
            caja(0, 0, 0, w, 2.4, d, MA.telaClara);
            for (var p = 1; p < Math.round(w / 0.5); p++) caja(-w / 2 + p * 0.5, 0.02, d / 2, 0.01, 2.35, 0.005, MA.maderaClara);
          }
          break;
        case 'escritorio':
          caja(0, 0.72, 0, w, 0.03, d, MA.maderaClara); caja(-w / 2 + 0.02, 0, 0, 0.03, 0.72, d, MA.maderaClara); caja(w / 2 - 0.02, 0, 0, 0.03, 0.72, d, MA.maderaClara);
          caja(0, 0.75, -d / 2 + 0.1, 0.5, 0.32, 0.02, MA.oscuro);
          break;
        case 'ducha':
          caja(0, 0, 0, w, 0.04, d, MA.piedraBano);
          caja(0, 0.04, d / 2 - 0.01, w, 2.0, 0.012, MA.vidrio);
          cil(0, 2.05, -d / 2 + 0.25, 0.12, 0.015, MA.metal);
          break;
        case 'tina':
          var tina = cil(0, 0, 0, 0.5, 0.55, MA.sanitario, 28); tina.scale.set(w / 1.0, 1, d / 1.0);
          var agua = cil(0, 0.42, 0, 0.44, 0.01, MA.espejo, 28); agua.scale.set(w / 1.0, 1, d / 1.0);
          cil(-w / 2 + 0.05, 0.55, 0, 0.015, 0.35, MA.metal, 8);
          break;
        case 'inodoro':
          caja(0, 0.38, -d / 2 + 0.09, w, 0.4, 0.18, MA.sanitario);
          var taza = cil(0, 0, 0.06, 0.18, 0.4, MA.sanitario, 20); taza.scale.z = 1.35;
          break;
        case 'lavatorio':
          caja(0, 0.25, 0, w, 0.55, d, MA.maderaFachada);
          caja(0, 0.8, 0, w + 0.02, 0.04, d + 0.02, MA.granito);
          var nb = w > 1.2 ? 2 : 1;
          for (var b = 0; b < nb; b++) { var bx = nb === 1 ? 0 : (b === 0 ? -w / 4 : w / 4); var cu = cil(bx, 0.84, 0.03, 0.2, 0.12, MA.sanitario, 20); void cu; cil(bx, 0.84, -d / 2 + 0.05, 0.012, 0.25, MA.metal, 8); }
          caja(0, 1.15, -d / 2 + 0.01, w, 0.8, 0.012, MA.vidrio);
          break;
        case 'piletaLavadero': caja(0, 0, 0, w, 0.88, d, MA.concreto); break;
        case 'lavarropas': caja(0, 0, 0, w, 0.86, d, MA.blanco); var vent = cil(0, 0.45, d / 2, 0.19, 0.02, MA.oscuro, 24); vent.rotation.x = Math.PI / 2; break;
        case 'consola': caja(0, 0, 0, w, 0.8, d, MA.maderaFachada); var pl2 = planta(0.5, 0.5, MA.hojaClara); pl2.position.set(w / 3, 0.8, 0); g.add(pl2); break;
        case 'mesada': case 'isla':
          caja(0, 0.08, 0, w - 0.04, 0.78, d - 0.04, MA.maderaFachada);
          caja(0, 0.86, 0, w, 0.04, d, MA.granito);
          if (mb.tipo === 'isla') caja(0, 0, 0, w - 0.1, 0.08, d - 0.12, MA.oscuro);
          break;
        case 'bacha': caja(0, 0.9, 0, w, 0.01, d, MA.metal); cil(0, 0.9, -d / 2 + 0.02, 0.015, 0.3, MA.metal, 8); break;
        case 'anafe': caja(0, 0.9, 0, w, 0.008, d, MA.oscuro); break;
        case 'heladera': caja(0, 0, 0, w, 1.85, d, MA.metal); break;
        case 'banqueta': cil(0, 0, 0, 0.03, 0.62, MA.metal, 8); cil(0, 0.62, 0, 0.19, 0.05, MA.maderaOscura); break;
        case 'mesa':
          caja(0, 0.72, 0, w, 0.05, d, MA.maderaFachada);
          caja(-w / 2 + 0.25, 0, 0, 0.12, 0.72, d - 0.2, MA.maderaFachada); caja(w / 2 - 0.25, 0, 0, 0.12, 0.72, d - 0.2, MA.maderaFachada);
          break;
        case 'silla':
          caja(0, 0.44, 0, w, 0.04, d, MA.telaClara); caja(0, 0.48, -d / 2 + 0.02, w, 0.4, 0.03, MA.maderaOscura);
          patas(-w / 2 + 0.04, w / 2 - 0.04, -d / 2 + 0.04, d / 2 - 0.04, 0.44, 0.015, MA.maderaOscura);
          break;
        case 'alfombra': caja(0, 0, 0, w, 0.012, d, MA.alfombra); break;
        case 'rack': caja(0, 0.15, 0, w, 0.42, d, MA.maderaFachada); caja(0, 1.1, -d / 2 + 0.03, 1.5, 0.85, 0.04, MA.oscuro); break;
        case 'sofa':
          caja(0, 0.08, 0.05, w - 0.36, 0.36, d - 0.1, MA.telaClara); caja(0, 0.08, -d / 2 + 0.11, w, 0.72, 0.22, MA.telaClara);
          caja(-w / 2 + 0.09, 0.08, 0, 0.18, 0.55, d, MA.telaClara); caja(w / 2 - 0.09, 0.08, 0, 0.18, 0.55, d, MA.telaClara);
          caja(0, 0, 0, w, 0.08, d, MA.maderaFachada);
          caja(-0.5, 0.44, 0.0, 0.45, 0.12, 0.42, MA.acento); caja(0.5, 0.44, 0.0, 0.45, 0.12, 0.42, MA.terracota);
          break;
        case 'sillon':
          caja(0, 0.08, 0.05, w - 0.3, 0.36, d - 0.1, MA.tela); caja(0, 0.08, -d / 2 + 0.1, w, 0.7, 0.2, MA.tela);
          caja(-w / 2 + 0.075, 0.08, 0, 0.15, 0.52, d, MA.tela); caja(w / 2 - 0.075, 0.08, 0, 0.15, 0.52, d, MA.tela);
          caja(0, 0, 0, w, 0.08, d, MA.maderaFachada);
          break;
        case 'mesaRatona': caja(0, 0, 0, w, 0.36, d, MA.maderaFachada); break;
        case 'maceta': cil(0, 0, 0, w / 2, 0.5, MA.terracota, 16); var pm = planta(1.3, 0.9); pm.position.y = 0.45; g.add(pm); break;
        case 'jardinInterior':
          caja(0, 0, 0, w, 0.06, d, MA.canto);
          caja(0, 0, d / 2 - 0.03, w, 0.12, 0.06, MA.revestimiento);
          var ave = planta(2.2, 1.6); ave.position.set(0.1, 0.06, 0); g.add(ave);
          var a1 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 1), MA.copa); a1.position.set(-1.1, 0.35, -0.3); g.add(a1);
          var a2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 1), MA.hojaClara); a2.position.set(1.2, 0.3, 0.2); g.add(a2);
          var cuenco = cil(-0.5, 0.06, 0.35, 0.35, 0.3, MA.revestimiento, 24); void cuenco;
          cil(-0.5, 0.33, 0.35, 0.3, 0.02, MA.espejo, 24);
          break;
        case 'jardinera':
          caja(0, 0, 0, w, 0.45, d, MA.revoqueExt);
          for (var j = 0; j < Math.floor(w / 0.55); j++) { var ar = new THREE.Mesh(new THREE.IcosahedronGeometry(0.26 + (j % 2) * 0.06, 1), j % 3 ? MA.copa : MA.hojaClara); ar.position.set(-w / 2 + 0.3 + j * 0.55, 0.62, 0); g.add(ar); }
          break;
        case 'reposera':
          caja(0, 0, 0, w, 0.3, d, MA.maderaFachada); var res = cajaBase(w, 0.06, 0.55, MA.telaClara); res.position.set(0, 0.3, -d / 2 + 0.25); res.rotation.x = 0.7; g.add(res);
          break;
        default: caja(0, 0, 0, w, 0.5, d, MA.blanco);
      }
      return g;
    }

    // Exterior --------------------------------------------------------------
    var L = M.lote, mp = EX.muroPerimetral;
    [[0, 0.15, 0.15, L.fondo], [L.ancho - 0.15, 0.15, L.ancho, L.fondo], [0.15, L.fondo - 0.15, L.ancho - 0.15, L.fondo]].forEach(function (r, i) {
      cajaLote(r, 0, mp, MA.muroPerimetral, { etapa: E.aca, orden: 0.52 + i * 0.02, anim: 'subir', fijo: true, categoria: 'exterior' });
    });
    [[0, 0, 5.3, 0.2], [11.8, 0, 12, 0.2]].forEach(function (r) {
      cajaLote(r, 0, 0.9, MA.revestimiento, { etapa: E.aca, orden: 0.56, anim: 'subir', fijo: true, categoria: 'exterior' });
    });
    cajaLote(EX.cochera, 0, 0.03, MA.solado, { etapa: E.aca, orden: 0.6, anim: 'aparecer', fijo: true, sombra: false });
    cajaLote([5.3, 0, 6.3, 5], 0, 0.02, MA.canto, { etapa: E.aca, orden: 0.6, anim: 'aparecer', fijo: true, sombra: false });
    EX.pasos.forEach(function (p, i) { cajaLote([p[0] - 0.45, p[1] - 0.3, p[0] + 0.45, p[1] + 0.3], 0, 0.06, MA.pasoPiedra, { etapa: E.aca, orden: 0.62 + i * 0.01, anim: 'aparecer', fijo: true }); });
    // Espejo de agua frente a la habitación 4
    [[esp[0], esp[1], esp[2], esp[1] + 0.12], [esp[0], esp[3] - 0.12, esp[2], esp[3]], [esp[0], esp[1], esp[0] + 0.12, esp[3]], [esp[2] - 0.12, esp[1], esp[2], esp[3]]]
      .forEach(function (r) { cajaLote(r, -0.4, 0.08, MA.revestimiento, { etapa: E.aca, orden: 0.6, anim: 'subir', fijo: true }); });
    cajaLote([esp[0] + 0.12, esp[1] + 0.12, esp[2] - 0.12, esp[3] - 0.12], -0.42, -0.4, MA.oscuro, { etapa: E.aca, orden: 0.6, anim: 'aparecer', fijo: true, sombra: false });
    cajaLote([esp[0] + 0.12, esp[1] + 0.12, esp[2] - 0.12, esp[3] - 0.12], -0.4, -0.04, MA.espejo, { etapa: E.aca, orden: 0.66, anim: 'subir', fijo: true, sombra: false, categoria: 'agua' });
    // Sendero lateral este sobre canto rodado
    var se = EX.senderoEste;
    cajaLote([M.casa.origen[0] + M.casa.ancho + 0.03, se.y0 - 0.4, L.ancho - 0.15, se.y1], 0, 0.02, MA.canto, { etapa: E.aca, orden: 0.62, anim: 'aparecer', fijo: true, sombra: false });
    for (var ys = se.y0; ys < se.y1; ys += 0.9) cajaLote([se.x - 0.3, ys, se.x + 0.3, ys + 0.5], 0, 0.05, MA.pasoPiedra, { etapa: E.aca, orden: 0.64, anim: 'aparecer', fijo: true });
    // Galería con pérgola
    var gl = EX.galeria;
    cajaLote(gl, 0, PB.cota - 0.01, MA.deck, { etapa: E.aca, orden: 0.66, anim: 'aparecer', fijo: true });
    var perg = new THREE.Group();
    [gl[0] + 0.1, (gl[0] + gl[2]) / 2, gl[2] - 0.1].forEach(function (x) { var po = cajaBase(0.14, PB.cielo - 0.1, 0.14, MA.maderaFachada); po.position.copy(V(x, gl[3] - 0.1, 0).sub(V(gl[0], gl[1], 0))); perg.add(po); });
    var vp = cajaBase(gl[2] - gl[0], 0.2, 0.14, MA.maderaFachada); vp.position.copy(V((gl[0] + gl[2]) / 2, gl[3] - 0.1, PB.cielo - 0.1).sub(V(gl[0], gl[1], 0))); perg.add(vp);
    for (var sx = gl[0] + 0.2; sx < gl[2] - 0.1; sx += 0.32) { var li = cajaBase(0.05, 0.16, gl[3] - gl[1], MA.maderaFachada); li.position.copy(V(sx, (gl[1] + gl[3]) / 2, PB.cielo + 0.1).sub(V(gl[0], gl[1], 0))); perg.add(li); }
    perg.position.copy(V(gl[0], gl[1], 0));
    reg(perg, { etapa: E.aca, orden: 0.7, anim: 'caer', fijo: true, categoria: 'exterior' });
    var mg = mueble3D({ tipo: 'mesa', w: 2.0, d: 1.0 });
    mg.position.copy(V(EX.mesaGaleria.x, EX.mesaGaleria.y, PB.cota - 0.01));
    reg(mg, { etapa: E.aca, orden: 0.84, anim: 'caer', fijo: true, categoria: 'mueble' });
    [[-0.6, -0.7, 0], [0, -0.7, 0], [0.6, -0.7, 0], [-0.6, 0.7, Math.PI], [0, 0.7, Math.PI], [0.6, 0.7, Math.PI]].forEach(function (s) {
      var si = mueble3D({ tipo: 'silla', w: 0.45, d: 0.45 });
      si.position.copy(V(EX.mesaGaleria.x + s[0], EX.mesaGaleria.y + s[1], PB.cota - 0.01));
      si.rotation.y = s[2];
      reg(si, { etapa: E.aca, orden: 0.85, anim: 'caer', fijo: true, categoria: 'mueble' });
    });
    // Piscina con borde, deck y muro de agua de piedra
    var dk = EX.deck;
    [[dk[0], dk[1], dk[2], pis[1]], [dk[0], pis[3], dk[2], dk[3]], [dk[0], pis[1], pis[0], pis[3]], [pis[2], pis[1], dk[2], pis[3]]]
      .forEach(function (r) { cajaLote(r, 0, 0.05, MA.deck, { etapa: E.aca, orden: 0.66, anim: 'aparecer', fijo: true, sombra: false }); });
    var pp = EX.piscina.prof;
    [[pis[0], pis[1], pis[2], pis[1] + 0.05], [pis[0], pis[3] - 0.05, pis[2], pis[3]], [pis[0], pis[1], pis[0] + 0.05, pis[3]], [pis[2] - 0.05, pis[1], pis[2], pis[3]]]
      .forEach(function (r) { cajaLote(r, -pp, 0.0, MA.azulejo, { etapa: E.aca, orden: 0.55, anim: 'subir', fijo: true, sombra: false }); });
    cajaLote(pis, -pp - 0.02, -pp, MA.azulejo, { etapa: E.aca, orden: 0.55, anim: 'aparecer', fijo: true, sombra: false });
    [[pis[0] - 0.3, pis[1] - 0.3, pis[2] + 0.3, pis[1]], [pis[0] - 0.3, pis[3], pis[2] + 0.3, pis[3] + 0.3], [pis[0] - 0.3, pis[1], pis[0], pis[3]], [pis[2], pis[1], pis[2] + 0.05, pis[3]]]
      .forEach(function (r) { cajaLote(r, 0, 0.07, MA.borde, { etapa: E.aca, orden: 0.6, anim: 'aparecer', fijo: true, sombra: false }); });
    cajaLote([pis[0] + 0.05, pis[1] + 0.05, pis[2] - 0.05, pis[3] - 0.05], -pp, -0.1, MA.agua, { etapa: E.aca, orden: 0.68, anim: 'subir', fijo: true, sombra: false, categoria: 'agua' });
    var mw = new THREE.Group();
    var muroAgua = cajaBase(0.35, 1.25, pis[3] - pis[1], MA.revestimiento); mw.add(muroAgua);
    for (var c = 0; c < 3; c++) {
      var ca = cajaBase(0.25, 0.04, 0.2, MA.metal); ca.position.set(-0.28, 1.0, (c - 1) * 1.1); mw.add(ca);
      var ch = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 1.05), MA.espejo); ch.position.set(-0.42, 0.48, (c - 1) * 1.1); ch.rotation.y = Math.PI / 2; mw.add(ch);
    }
    mw.position.copy(V(pis[2] + 0.22, (pis[1] + pis[3]) / 2, 0));
    reg(mw, { etapa: E.aca, orden: 0.7, anim: 'subir', fijo: true, categoria: 'exterior' });
    // Ducha exterior
    var du = new THREE.Group();
    var poste = cajaBase(0.12, 2.3, 0.12, MA.maderaFachada); du.add(poste);
    var cab = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 16), MA.metal); cab.position.set(-0.25, 2.2, 0); du.add(cab);
    var brazo = cajaBase(0.3, 0.03, 0.03, MA.metal); brazo.position.set(-0.12, 2.22, 0); du.add(brazo);
    du.position.copy(V(EX.ducha[0], EX.ducha[1], 0.05));
    reg(du, { etapa: E.aca, orden: 0.74, anim: 'aparecer', fijo: true });
    EX.reposeras.forEach(function (rp) {
      var g = mueble3D({ tipo: 'reposera', w: 0.7, d: 1.9 });
      g.position.copy(V(rp.x, rp.y, 0)); g.rotation.y = Math.PI;
      reg(g, { etapa: E.aca, orden: 0.86, anim: 'caer', fijo: true, categoria: 'mueble' });
    });
    // Bale (pabellón balinés) con techo de paja y parrilla
    var bl = EX.bale.r, bale = new THREE.Group(), bw = bl[2] - bl[0], bd = bl[3] - bl[1];
    var plat = cajaBase(bw, 0.45, bd, MA.revestimiento); bale.add(plat);
    var tapa = cajaBase(bw + 0.1, 0.06, bd + 0.1, MA.deck); tapa.position.y = 0.45; bale.add(tapa);
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) { var po = cajaBase(0.16, EX.bale.alto, 0.16, MA.maderaFachada); po.position.set(s[0] * (bw / 2 - 0.15), 0.5, s[1] * (bd / 2 - 0.15)); bale.add(po); });
    var ct = new THREE.ConeGeometry(1, EX.bale.techo, 4, 1);
    ct.rotateY(Math.PI / 4);
    var techoBale = new THREE.Mesh(ct, MA.paja);
    techoBale.scale.set((bw + 1.2) / Math.SQRT2, 1, (bd + 1.2) / Math.SQRT2);
    techoBale.position.y = 0.5 + EX.bale.alto + EX.bale.techo / 2;
    bale.add(techoBale);
    var colchon = cajaBase(bw - 1.2, 0.18, 1.6, MA.telaClara); colchon.position.set(0.3, 0.51, 0.6); bale.add(colchon);
    var parrilla = cajaBase(1.4, 0.95, 0.7, MA.ladrillo); parrilla.position.set(-bw / 2 + 0.95, 0.51, -bd / 2 + 0.45); bale.add(parrilla);
    var campana = cajaBase(1.0, 0.9, 0.55, MA.revestimiento); campana.position.set(-bw / 2 + 0.95, 1.8, -bd / 2 + 0.42); bale.add(campana);
    bale.position.copy(V((bl[0] + bl[2]) / 2, (bl[1] + bl[3]) / 2, 0));
    reg(bale, { etapa: E.aca, orden: 0.72, anim: 'caer', fijo: true, categoria: 'exterior' });
    // Bambú en las medianeras
    EX.bambu.forEach(function (b, i) {
      var n = Math.max(2, Math.round(Math.hypot(b[2] - b[0], b[3] - b[1]) / 0.28));
      var culm = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.04, 1, 6).translate(0, 0.5, 0), MA.bambu, n);
      var hojas = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.45, 0), MA.copa, n * 2);
      var m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), pos = new THREE.Vector3();
      for (var k = 0; k < n; k++) {
        var f = k / (n - 1), alto = 4.2 + ((k * 37) % 10) / 10 * 1.6;
        pos.copy(V(b[0] + (b[2] - b[0]) * f + ((k * 13) % 7 - 3) * 0.02, b[1] + (b[3] - b[1]) * f, 0));
        q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), ((k % 5) - 2) * 0.03);
        m4.compose(pos, q, s.set(1, alto, 1)); culm.setMatrixAt(k, m4);
        for (var h = 0; h < 2; h++) {
          var p2 = pos.clone(); p2.y = alto * (0.65 + h * 0.25); p2.x += (h ? 0.15 : -0.15);
          m4.compose(p2, new THREE.Quaternion(), s.set(0.8, 1.3, 0.8)); hojas.setMatrixAt(k * 2 + h, m4);
        }
      }
      var g = new THREE.Group(); g.add(culm); g.add(hojas);
      reg(g, { etapa: E.aca, orden: 0.76 + i * 0.02, anim: 'aparecer', fijo: true, categoria: 'vegetacion' });
    });
    // Árboles: frangipani (plumeria) y pindó
    EX.arboles.forEach(function (a, i) {
      var g = new THREE.Group();
      if (a.tipo === 'pindo') {
        var tr = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.2, a.alto, 10), MA.tronco); tr.geometry.translate(0, a.alto / 2, 0); g.add(tr);
        for (var k = 0; k < 11; k++) {
          var hoja = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 6), MA.hoja);
          hoja.scale.set(1.5, 0.06, 0.32); hoja.geometry.translate(1, 0, 0);
          var pv = new THREE.Group(); pv.position.set(0, a.alto, 0); pv.rotation.y = k / 11 * Math.PI * 2 + i;
          hoja.rotation.z = -0.35 - (k % 3) * 0.18; pv.add(hoja); g.add(pv);
        }
      } else {
        // Frangipani: tronco gris ramificado, copa aplanada y flores blancas
        var t0 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, a.alto * 0.45, 8), MA.troncoClaro); t0.geometry.translate(0, a.alto * 0.225, 0); g.add(t0);
        for (var r = 0; r < 5; r++) {
          var ang = r / 5 * Math.PI * 2 + i, br = new THREE.Group();
          var rama = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, a.alto * 0.45, 6), MA.troncoClaro); rama.geometry.translate(0, a.alto * 0.225, 0);
          br.add(rama); br.position.y = a.alto * 0.42; br.rotation.z = 0.55; br.rotation.y = ang; g.add(br);
          var tip = new THREE.Vector3(Math.cos(ang) * a.r * 0.55, a.alto * 0.82, -Math.sin(ang) * a.r * 0.55);
          var copa = new THREE.Mesh(new THREE.IcosahedronGeometry(a.r * 0.42, 1), MA.hojaClara); copa.scale.y = 0.55; copa.position.copy(tip); g.add(copa);
          for (var fl = 0; fl < 4; fl++) { var flor = new THREE.Mesh(new THREE.IcosahedronGeometry(0.09, 0), MA.flor); flor.position.copy(tip).add(new THREE.Vector3(Math.cos(fl * 1.7) * a.r * 0.3, a.r * 0.2, Math.sin(fl * 1.7) * a.r * 0.3)); g.add(flor); }
        }
      }
      g.position.copy(V(a.x, a.y, 0));
      reg(g, { etapa: E.aca, orden: 0.78 + i * 0.02, anim: 'aparecer', fijo: true, categoria: 'vegetacion' });
    });
    // Faroles de piedra
    EX.faroles.forEach(function (f, i) {
      var g = new THREE.Group();
      var pie = cajaBase(0.18, 0.55, 0.18, MA.revestimiento); g.add(pie);
      var caja = cajaBase(0.28, 0.22, 0.28, MA.farol); caja.position.y = 0.55; g.add(caja);
      var sombrero = cajaBase(0.36, 0.05, 0.36, MA.revestimiento); sombrero.position.y = 0.77; g.add(sombrero);
      g.position.copy(V(f[0], f[1], 0));
      reg(g, { etapa: E.aca, orden: 0.88 + i * 0.01, anim: 'aparecer', fijo: true });
    });
    // Luz de la piscina
    var luzPiscina = new THREE.PointLight('#7fe3ff', 0, 9, 1.4);
    luzPiscina.visible = false;
    luzPiscina.position.copy(V((pis[0] + pis[2]) / 2, (pis[1] + pis[3]) / 2, -0.6));
    raizGrupo.add(luzPiscina);
    // Césped que vuelve a cubrir el borde de la excavación
    cajaLote(excav, -0.001, 0.0005, MA.cesped, { etapa: E.aca, orden: 0.58, anim: 'aparecer', fijo: true, sombra: false });

    // -------------------------------------------------------------------------
    // Estado
    // -------------------------------------------------------------------------
    var estado = { t: 5, explotar: 0, rayos: false, filtros: {}, corte: null };
    Object.keys(P.SISTEMAS).forEach(function (k) { estado.filtros[k] = true; });
    function suave(k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
    function progreso(u, t) { return u.etapa < 0 ? 1 : Math.max(0, Math.min(1, (t - u.etapa - u.orden * 0.75) / 0.25)); }
    function altura(el) {
      if (el.userData.alto === undefined) {
        var g = el.geometry;
        if (g) { g.computeBoundingBox(); el.userData.alto = g.boundingBox.max.y - g.boundingBox.min.y; } else el.userData.alto = 1;
      }
      return el.userData.alto;
    }
    function actualizar(t, explotar) {
      estado.t = t;
      if (explotar !== undefined) estado.explotar = explotar;
      for (var i = 0; i < elementos.length; i++) {
        var el = elementos[i], u = el.userData, k = progreso(u, t), e = suave(k), visible = k > 0;
        if (u.sistema && !estado.filtros[u.sistema]) visible = false;
        // Terminada la obra las cañerías quedan embutidas: solo se ven en rayos X.
        if (u.tuberia && !estado.rayos && t >= 4.6) visible = false;
        el.position.copy(u.base);
        if (!u.fijo && u.etapa >= 0) el.position.y += estado.explotar * u.nivel * 3.4;
        el.scale.set(1, 1, 1);
        if (u.anim === 'tapa') visible = k <= 0;
        else if (u.anim === 'subir') {
          var f = e;
          if (u.frente) {
            var H = u.frente[0] + e * (u.frente[1] - u.frente[0]), h0 = u.base.y, h1 = h0 + altura(el);
            f = Math.max(0, Math.min(1, (H - h0) / (h1 - h0)));
            visible = visible && f > 0;
          }
          el.scale.y = Math.max(f, 0.0001);
        } else if (u.anim === 'caer') el.position.y += (1 - e) * 2.2;
        else { var s = Math.max(e, 0.0001); el.scale.set(s, s, s); }
        el.visible = visible;
      }
      lucesInteriores.forEach(function (l) { l.position.y = l.userData.base === undefined ? (l.userData.base = l.position.y) : l.userData.base; l.position.y += estado.explotar * l.userData.nivel * 3.4; });
    }
    function setRayosX(on) {
      estado.rayos = on;
      actualizar(estado.t);
      materialesObra.forEach(function (m) {
        if (!m.userData.orig) m.userData.orig = { transparent: m.transparent, opacity: m.opacity, depthWrite: m.depthWrite };
        var o = m.userData.orig;
        m.transparent = on ? true : o.transparent; m.opacity = on ? 0.1 : o.opacity; m.depthWrite = on ? false : o.depthWrite; m.needsUpdate = true;
      });
      Object.keys(MS).forEach(function (k) { MS[k].emissiveIntensity = on ? 0.9 : 0.15; MS[k].depthTest = !on; MS[k].needsUpdate = true; });
    }
    function setFiltro(s, on) { estado.filtros[s] = on; actualizar(estado.t); }
    var planoCorte = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1.4);
    function setCorte(h) {
      estado.corte = h;
      if (h === null || h === undefined) materialesCortables.forEach(function (m) { m.clippingPlanes = null; m.needsUpdate = true; });
      else { planoCorte.constant = h; materialesCortables.forEach(function (m) { if (!m.clippingPlanes) { m.clippingPlanes = [planoCorte]; m.needsUpdate = true; } }); }
    }
    function setNoche(f) {
      // Las luces apagadas se sacan de la escena: cada luz activa encarece todos los materiales.
      lucesInteriores.forEach(function (l) { l.intensity = f * 2.4; l.visible = f > 0.02; });
      luzPiscina.visible = f > 0.02;
      MA.luz.emissiveIntensity = f * 1.4;
      MA.farol.emissiveIntensity = f * 2.2;
      luzPiscina.intensity = f * 6;
    }
    function setMaterial(slot, opcion) {
      var def = M.materiales[slot];
      if (!def || !def.opciones[opcion]) return;
      def.elegido = opcion;
      var color = def.opciones[opcion].color;
      if (slot === 'fachada') MA.revoqueExt.color.set(color);
      if (slot === 'revestimiento') aplicarRevestimiento(opcion);
      if (slot === 'madera') { MA.maderaFachada.color.set(color); if (M.materiales.revestimiento.elegido === 'teca') aplicarRevestimiento('teca'); }
      if (slot === 'pisoSocial') { MA.pisoSocial.color.set(color); if (MA.pisoSocial.map) MA.pisoSocial.color.lerp(new THREE.Color('#ffffff'), 0.35); }
      if (slot === 'piscina') { MA.agua.color.set(color); MA.azulejo.color.set(color); }
    }
    function setVecinos(on) { vecinos.visible = on; }

    actualizar(5, 0);
    return {
      raiz: raizGrupo, elementos: elementos, materiales: MA, materialesSistema: MS, lucesInteriores: lucesInteriores,
      actualizar: actualizar, setRayosX: setRayosX, setFiltro: setFiltro, setCorte: setCorte, setNoche: setNoche,
      setMaterial: setMaterial, setVecinos: setVecinos, estado: estado,
      aMundo: V, casaAMundo: VC, niveles: N, azotea: AZOTEA, indiceTecho: IDX_TECHO
    };
  }

  raiz.ESCENA = { construir: construir };
})(this);
