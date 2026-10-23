/* Casa Asunción 120: escena Three.js construida a partir de casa-modelo.js.
 *
 * CASA3D.construir(THREE, CASA, { estilo: 'obra' | 'maqueta' }) devuelve la escena y los controles
 * de la línea de tiempo. Cada malla lleva en userData:
 *   etapa   0..4 (índice en CASA.ETAPAS) o -1 para el contexto, que siempre se ve
 *   orden   0..1, cuándo empieza dentro de su etapa
 *   anim    'subir' | 'caer' | 'aparecer' | 'tapa'
 *   sistema id de instalación (aguaFria, electricidad...) o null
 *   fijo    true si no se separa en la vista explotada
 * Es un script clásico (no módulo) para que index.html y cad.html funcionen también abiertos con doble clic.
 */
(function (raiz) {
  'use strict';

  function construir(THREE, CASA, opciones) {
    opciones = opciones || {};
    var maqueta = opciones.estilo === 'maqueta';
    var M = CASA.modelo, nv = M.niveles;
    var PISO = nv.piso, CIELO = nv.piso + nv.alturaLibre, TECHO = CIELO + nv.losa;
    var CX = M.lote.ancho / 2, CY = M.lote.fondo / 2;
    var OX = M.casa.origen[0], OY = M.casa.origen[1];

    function V(x, y, h) { return new THREE.Vector3(x - CX, h, y - CY); }
    function VC(x, y, h) { return V(x + OX, y + OY, h); }

    var raizGrupo = new THREE.Group();
    raizGrupo.name = 'casa';
    var elementos = [];
    var lucesInteriores = [];

    // -------------------------------------------------------------------------
    // Texturas procedurales (unidades de UV = metros)
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

    function ruido(ctx, w, h, alpha) {
      for (var i = 0; i < w * h / 18; i++) {
        ctx.fillStyle = 'rgba(0,0,0,' + (Math.random() * alpha) + ')';
        ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
      }
    }

    var texLadrillo = maqueta ? null : texturaCanvas(256, 136, function (g, w, h) {
      g.fillStyle = '#cfc4b6'; g.fillRect(0, 0, w, h);
      var filas = 4, fh = h / filas;
      for (var f = 0; f < filas; f++) {
        var desf = (f % 2) * (w / 4);
        for (var k = -1; k < 3; k++) {
          var x = k * (w / 2) + desf;
          var tono = 150 + Math.floor(Math.random() * 30);
          g.fillStyle = 'rgb(' + (tono + 30) + ',' + (tono - 55) + ',' + (tono - 90) + ')';
          g.fillRect(x + 3, f * fh + 3, w / 2 - 6, fh - 6);
        }
      }
      ruido(g, w, h, 0.18);
    }, 0.5, 0.26);

    var texMadera = maqueta ? null : texturaCanvas(256, 256, function (g, w, h) {
      var n = 8;
      for (var k = 0; k < n; k++) {
        var t = 120 + Math.floor(Math.random() * 30);
        g.fillStyle = 'rgb(' + (t + 50) + ',' + (t + 10) + ',' + (t - 35) + ')';
        g.fillRect(0, k * h / n, w, h / n);
        g.fillStyle = 'rgba(60,35,15,0.5)';
        g.fillRect(0, k * h / n, w, 1.5);
        g.fillRect(((k * 97) % w), k * h / n, 1.5, h / n);
      }
      ruido(g, w, h, 0.12);
    }, 1.2, 1.2);

    function texBaldosa(base, junta, tile) {
      return maqueta ? null : texturaCanvas(128, 128, function (g, w, h) {
        g.fillStyle = base; g.fillRect(0, 0, w, h);
        ruido(g, w, h, 0.05);
        g.fillStyle = junta; g.fillRect(0, 0, w, 2); g.fillRect(0, 0, 2, h);
      }, tile, tile);
    }

    var texPorcelanato = texBaldosa('#dcd8d0', '#b9b3a8', 0.6);
    var texCeramica = texBaldosa('#d6dfe2', '#9fb0b5', 0.3);
    var texCesped = maqueta ? null : texturaCanvas(128, 128, function (g, w, h) {
      g.fillStyle = '#6c9a45'; g.fillRect(0, 0, w, h);
      for (var i = 0; i < 900; i++) {
        var v = Math.random();
        g.fillStyle = v > 0.5 ? 'rgba(40,80,20,0.35)' : 'rgba(150,190,90,0.3)';
        g.fillRect(Math.random() * w, Math.random() * h, 1.5, 3);
      }
    }, 2, 2);

    // -------------------------------------------------------------------------
    // Materiales
    // -------------------------------------------------------------------------

    function mat(color, extra) {
      var p = { color: color, roughness: 0.85, metalness: 0 };
      for (var k in extra || {}) p[k] = extra[k];
      return new THREE.MeshStandardMaterial(p);
    }

    var MA = {
      tierra: mat('#7b5b40'),
      concreto: mat('#a8a49c'),
      concretoOscuro: mat('#8f8b83'),
      ladrillo: texLadrillo ? mat('#ffffff', { map: texLadrillo }) : mat('#b5643c'),
      revoque: mat('#f1eee8', { roughness: 0.95 }),
      losa: mat('#b7b3aa'),
      cielorraso: mat('#f6f4f0', { roughness: 1, emissive: new THREE.Color('#fffaf0'), emissiveIntensity: 0.18 }),
      viga: mat('#9e9a91'),
      marco: mat('#2c2e31', { roughness: 0.5, metalness: 0.4 }),
      vidrio: mat('#a9d0de', { transparent: true, opacity: 0.32, roughness: 0.05, metalness: 0.1, depthWrite: false }),
      puerta: mat('#b8895d', { roughness: 0.6 }),
      madera: texMadera ? mat('#ffffff', { map: texMadera, roughness: 0.7 }) : mat('#a87a4f'),
      porcelanato: texPorcelanato ? mat('#ffffff', { map: texPorcelanato, roughness: 0.35 }) : mat('#d9d6cf'),
      ceramica: texCeramica ? mat('#ffffff', { map: texCeramica, roughness: 0.4 }) : mat('#c9d3d6'),
      cesped: texCesped ? mat('#ffffff', { map: texCesped, roughness: 1 }) : mat('#6c9a45', { roughness: 1 }),
      vereda: mat('#cbc7be'),
      calle: mat('#45474a', { roughness: 0.95 }),
      solado: mat('#bdb8ae'),
      deck: mat('#9a6a44', { roughness: 0.75 }),
      agua: mat('#2ba7cc', { transparent: true, opacity: 0.78, roughness: 0.08, metalness: 0.1 }),
      azulejo: mat('#bfe4ec', { roughness: 0.3 }),
      borde: mat('#e9e3d6'),
      blanco: mat('#f5f4f1', { roughness: 0.4 }),
      sanitario: mat('#fbfbfa', { roughness: 0.2 }),
      metal: mat('#a3a8ad', { roughness: 0.35, metalness: 0.7 }),
      oscuro: mat('#26282b', { roughness: 0.3 }),
      granito: mat('#3a3a3c', { roughness: 0.25 }),
      maderaClara: mat('#c9a47c', { roughness: 0.6 }),
      maderaOscura: mat('#5d4030', { roughness: 0.6 }),
      tela: mat('#6f7c88', { roughness: 1 }),
      telaClara: mat('#e8e3d9', { roughness: 1 }),
      acento: mat('#b5643c', { roughness: 1 }),
      verdeManta: mat('#6f8566', { roughness: 1 }),
      alfombra: mat('#c9bba6', { roughness: 1 }),
      tronco: mat('#6b4f3a'),
      hojaPindo: mat('#4f8040', { roughness: 0.9, side: THREE.DoubleSide }),
      lapacho: mat('#e2689f', { roughness: 0.9, flatShading: true }),
      copa: mat('#3f7a3a', { roughness: 0.9, flatShading: true }),
      vecino: mat('#d9d5cd', { roughness: 0.95 }),
      vecinoTecho: mat('#bdb7ad', { roughness: 0.95 }),
      muroPerimetral: mat('#ebe7df'),
      membrana: mat('#dedbd3', { roughness: 0.9 }),
      luz: mat('#fff7e0', { emissive: new THREE.Color('#fff2cc'), emissiveIntensity: 0.0 })
    };

    var MS = {};
    Object.keys(CASA.SISTEMAS).forEach(function (k) {
      var c = CASA.SISTEMAS[k].color;
      MS[k] = mat(c, { roughness: 0.35, metalness: 0.2, emissive: new THREE.Color(c), emissiveIntensity: 0.15 });
    });

    if (maqueta) {
      ['concreto', 'concretoOscuro', 'ladrillo', 'revoque', 'losa', 'viga', 'puerta', 'madera', 'porcelanato', 'ceramica',
        'solado', 'deck', 'borde', 'blanco', 'sanitario', 'metal', 'granito', 'maderaClara', 'maderaOscura', 'tela', 'telaClara',
        'acento', 'verdeManta', 'alfombra', 'muroPerimetral', 'tronco', 'oscuro', 'marco', 'vecino', 'vecinoTecho', 'cielorraso', 'membrana'
      ].forEach(function (k) { MA[k].color.set('#f3f1ec'); MA[k].map = null; });
      MA.marco.color.set('#d9d6cf');
      MA.cesped.color.set('#dfe6d6');
      MA.hojaPindo.color.set('#cfdcc4');
      MA.lapacho.color.set('#f0d6e2');
      MA.copa.color.set('#cfdcc4');
      MA.calle.color.set('#c9c7c2');
      MA.vereda.color.set('#e4e1da');
      MA.tierra.color.set('#d8cfc4');
    }

    // Materiales que se vuelven translúcidos en rayos X y que se cortan con el plano de corte.
    var materialesObra = ['tierra', 'concreto', 'concretoOscuro', 'ladrillo', 'revoque', 'losa', 'cielorraso', 'viga', 'marco', 'puerta',
      'madera', 'porcelanato', 'ceramica', 'blanco', 'sanitario', 'metal', 'oscuro', 'granito', 'maderaClara', 'maderaOscura',
      'tela', 'telaClara', 'acento', 'verdeManta', 'alfombra', 'luz', 'membrana'].map(function (k) { return MA[k]; });
    var materialesTerreno = ['cesped', 'vereda', 'calle', 'solado', 'deck', 'agua', 'azulejo', 'borde', 'muroPerimetral'].map(function (k) { return MA[k]; });
    var materialesCortables = materialesObra.concat([MA.vidrio]).concat(Object.keys(MS).map(function (k) { return MS[k]; }));

    // -------------------------------------------------------------------------
    // Helpers de geometría
    // -------------------------------------------------------------------------

    // UV en metros para que ladrillos y baldosas no se estiren.
    function uvMundo(geo, lx, ly, lz) {
      var uv = geo.attributes.uv;
      var dims = [[lz, ly], [lz, ly], [lx, lz], [lx, lz], [lx, ly], [lx, ly]];
      for (var f = 0; f < 6; f++) {
        for (var v = 0; v < 4; v++) {
          var i = f * 4 + v;
          uv.setXY(i, uv.getX(i) * dims[f][0], uv.getY(i) * dims[f][1]);
        }
      }
      uv.needsUpdate = true;
      return geo;
    }

    // Caja con la base en su origen (para animar creciendo desde abajo).
    function cajaBase(lx, ly, lz, material) {
      var geo = uvMundo(new THREE.BoxGeometry(lx, ly, lz), lx, ly, lz);
      geo.translate(0, ly / 2, 0);
      return new THREE.Mesh(geo, material);
    }

    function reg(obj, meta, padre) {
      obj.userData = Object.assign({ etapa: 0, orden: 0, anim: 'aparecer', sistema: null, fijo: false }, meta);
      obj.userData.base = obj.position.clone();
      obj.traverse(function (o) {
        if (o.isMesh) {
          o.castShadow = meta.sombra !== false; o.receiveShadow = true;
          if (meta.sistema) o.renderOrder = 5;
        }
      });
      (padre || raizGrupo).add(obj);
      elementos.push(obj);
      return obj;
    }

    // Caja definida por un rectángulo en planta [x0,y0,x1,y1] (coordenadas de lote) y alturas h0..h1.
    function cajaLote(r, h0, h1, material, meta) {
      var lx = r[2] - r[0], lz = r[3] - r[1], ly = h1 - h0;
      var m = cajaBase(lx, ly, lz, material);
      m.position.copy(V((r[0] + r[2]) / 2, (r[1] + r[3]) / 2, h0));
      return reg(m, meta);
    }
    function cajaCasa(r, h0, h1, material, meta) {
      return cajaLote([r[0] + OX, r[1] + OY, r[2] + OX, r[3] + OY], h0, h1, material, meta);
    }

    function cilindroEntre(a, b, radio, material) {
      var dir = new THREE.Vector3().subVectors(b, a);
      var len = dir.length();
      var geo = new THREE.CylinderGeometry(radio, radio, len, 8, 1);
      geo.translate(0, len / 2, 0);
      var m = new THREE.Mesh(geo, material);
      m.position.copy(a);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      return m;
    }

    var E = { cim: 0, est: 1, ins: 2, env: 3, aca: 4 };

    // -------------------------------------------------------------------------
    // Contexto: terreno con huecos, calle, vereda y vecinos (siempre visible)
    // -------------------------------------------------------------------------

    function hueco(r) {
      var p = new THREE.Path();
      p.moveTo(r[0] - CX, -(r[1] - CY));
      p.lineTo(r[0] - CX, -(r[3] - CY));
      p.lineTo(r[2] - CX, -(r[3] - CY));
      p.lineTo(r[2] - CX, -(r[1] - CY));
      p.lineTo(r[0] - CX, -(r[1] - CY));
      return p;
    }
    var excav = [OX - 0.3, OY - 0.3, OX + M.casa.ancho + 0.3, OY + M.casa.fondo + 0.3];
    var pis = M.exterior.piscina.r;
    var forma = new THREE.Shape();
    var T = 90;
    forma.moveTo(-T, -T); forma.lineTo(T, -T); forma.lineTo(T, T); forma.lineTo(-T, T); forma.lineTo(-T, -T);
    forma.holes.push(hueco(excav));
    forma.holes.push(hueco(pis));
    var geoTerreno = new THREE.ShapeGeometry(forma);
    geoTerreno.rotateX(-Math.PI / 2);
    var terreno = new THREE.Mesh(geoTerreno, MA.cesped);
    terreno.receiveShadow = true;
    terreno.userData = { etapa: -1, fijo: true, terreno: true };
    raizGrupo.add(terreno);

    // Tapas de césped que se retiran al excavar
    cajaLote(excav, -0.001, 0.0, MA.cesped, { etapa: E.cim, orden: 0, anim: 'tapa', fijo: true, sombra: false });
    cajaLote(pis, -0.001, 0.0, MA.cesped, { etapa: E.aca, orden: 0.55, anim: 'tapa', fijo: true, sombra: false });

    // Pozo de excavación de la casa
    var prof = 1.3, ex = excav;
    [[ex[0], ex[1], ex[2], ex[1] + 0.02], [ex[0], ex[3] - 0.02, ex[2], ex[3]], [ex[0], ex[1], ex[0] + 0.02, ex[3]], [ex[2] - 0.02, ex[1], ex[2], ex[3]]]
      .forEach(function (r) { cajaLote(r, -prof, 0, MA.tierra, { etapa: -1, fijo: true, sombra: false, terreno: true }); });
    cajaLote(ex, -prof - 0.02, -prof, MA.tierra, { etapa: -1, fijo: true, sombra: false, terreno: true });

    var EXT = M.exterior;
    cajaLote([-40, EXT.calle.y0, 52, EXT.calle.y1], 0, 0.01, MA.calle, { etapa: -1, fijo: true, sombra: false, terreno: true });
    cajaLote([-40, EXT.vereda.y0, 52, EXT.vereda.y1], 0, 0.1, MA.vereda, { etapa: -1, fijo: true, terreno: true });
    cajaLote([-40, EXT.vereda.y0, 52, EXT.vereda.y0 + 0.15], 0, 0.14, MA.borde, { etapa: -1, fijo: true, terreno: true });
    // Línea discontinua de la calle
    for (var lx = -38; lx < 50; lx += 4) {
      cajaLote([lx, -6.05, lx + 2, -5.95], 0.01, 0.015, MA.borde, { etapa: -1, fijo: true, sombra: false, terreno: true });
    }

    // Vecinos (volúmenes de contexto)
    [
      { r: [-10.5, 4.5, -1.5, 17], h: 3.2 }, { r: [-10.5, 17, -6, 22], h: 3.0 },
      { r: [14.5, 8, 21.5, 18], h: 3.4 }, { r: [14.5, 18, 19, 22], h: 3.0 },
      { r: [-9, -24, 2, -14], h: 3.4 }, { r: [5, -25, 16, -14], h: 3.3 }, { r: [19, -23, 28, -14], h: 3.2 },
      { r: [-22, 5, -13.5, 18], h: 3.2 }, { r: [25.5, 5, 34, 17], h: 3.4 }
    ].forEach(function (v) {
      cajaLote(v.r, 0, v.h, MA.vecino, { etapa: -1, fijo: true, terreno: true });
      cajaLote([v.r[0] - 0.1, v.r[1] - 0.1, v.r[2] + 0.1, v.r[3] + 0.1], v.h, v.h + 0.12, MA.vecinoTecho, { etapa: -1, fijo: true, terreno: true });
    });

    // -------------------------------------------------------------------------
    // Etapa 1: cimientos
    // -------------------------------------------------------------------------

    var c2 = M.columna / 2;
    var nCol = 0;
    M.ejes.x.forEach(function (ejx) {
      M.ejes.y.forEach(function (ejy) {
        var o = 0.05 + (nCol++) * 0.025;
        cajaCasa([ejx.v - 0.5, ejy.v - 0.5, ejx.v + 0.5, ejy.v + 0.5], -1.25, -0.85, MA.concretoOscuro, { etapa: E.cim, orden: o, anim: 'subir', sistema: null });
        cajaCasa([ejx.v - 0.15, ejy.v - 0.15, ejx.v + 0.15, ejy.v + 0.15], -0.85, -0.05, MA.concretoOscuro, { etapa: E.cim, orden: o + 0.05, anim: 'subir' });
      });
    });
    // Vigas de fundación bajo cada muro
    M.muros.forEach(function (m, i) {
      var inf = CASA.infoMuro(m), e = 0.2;
      var r = inf.eje === 'x' ? [inf.ini, inf.c - e / 2, inf.fin, inf.c + e / 2] : [inf.c - e / 2, inf.ini, inf.c + e / 2, inf.fin];
      cajaCasa(r, -0.35, 0.05, MA.concreto, { etapa: E.cim, orden: 0.4 + i * 0.015, anim: 'subir' });
    });
    // Relleno compactado sobre las fundaciones y contrapiso
    cajaLote([excav[0] + 0.02, excav[1] + 0.02, excav[2] - 0.02, excav[3] - 0.02], -prof, -0.02, MA.tierra, { etapa: E.cim, orden: 0.62, anim: 'subir', fijo: true, sombra: false });
    cajaCasa([0, 0, M.casa.ancho, M.casa.fondo], 0.03, PISO - 0.008, MA.concreto, { etapa: E.cim, orden: 0.72, anim: 'subir' });

    // -------------------------------------------------------------------------
    // Etapa 2: estructura (columnas, vigas, losa)
    // -------------------------------------------------------------------------

    nCol = 0;
    M.ejes.x.forEach(function (ejx) {
      M.ejes.y.forEach(function (ejy) {
        cajaCasa([ejx.v - c2, ejy.v - c2, ejx.v + c2, ejy.v + c2], 0.05, CIELO, MA.concreto,
          { etapa: E.est, orden: 0.02 + (nCol++) * 0.03, anim: 'subir' });
      });
    });
    var vb = M.viga.ancho + 0.02, vh = M.viga.alto;
    var lineasViga = [];
    M.ejes.y.forEach(function (ejy) { lineasViga.push([M.ejes.x[0].v, ejy.v - vb / 2, M.ejes.x[M.ejes.x.length - 1].v, ejy.v + vb / 2]); });
    M.ejes.x.forEach(function (ejx) { lineasViga.push([ejx.v - vb / 2, M.ejes.y[0].v, ejx.v + vb / 2, M.ejes.y[M.ejes.y.length - 1].v]); });
    lineasViga.forEach(function (r, i) {
      cajaCasa(r, CIELO - vh, CIELO, MA.viga, { etapa: E.est, orden: 0.4 + i * 0.03, anim: 'caer' });
    });
    cajaCasa([0, 0, M.casa.ancho, M.casa.fondo], CIELO, TECHO, MA.losa, { etapa: E.est, orden: 0.7, anim: 'caer' });

    // -------------------------------------------------------------------------
    // Etapa 3: instalaciones
    // -------------------------------------------------------------------------

    var ordenSistema = { aguaFria: 0, aguaCaliente: 0.14, desague: 0.28, electricidad: 0.42, aire: 0.62 };
    var cuentaSistema = {};
    CASA.tramos().forEach(function (t) {
      var sis = CASA.SISTEMAS[t.sistema];
      cuentaSistema[t.sistema] = (cuentaSistema[t.sistema] || 0) + 1;
      var base = ordenSistema[t.sistema] + Math.min(cuentaSistema[t.sistema] * 0.012, 0.16);
      var n = t.puntos.length - 1;
      for (var i = 0; i < n; i++) {
        var a = VC(t.puntos[i][0], t.puntos[i][1], t.puntos[i][2]);
        var b = VC(t.puntos[i + 1][0], t.puntos[i + 1][1], t.puntos[i + 1][2]);
        if (a.distanceTo(b) < 1e-4) continue;
        var cil = cilindroEntre(a, b, sis.radio, MS[t.sistema]);
        reg(cil, { etapa: E.ins, orden: Math.min(base + i * 0.025, 0.92), anim: 'subir', sistema: t.sistema, sombra: false });
        if (i > 0) {
          var codo = new THREE.Mesh(new THREE.SphereGeometry(sis.radio * 1.15, 8, 6), MS[t.sistema]);
          codo.position.copy(a);
          reg(codo, { etapa: E.ins, orden: Math.min(base + i * 0.025, 0.92), anim: 'aparecer', sistema: t.sistema, sombra: false });
        }
      }
    });
    CASA.equipos.forEach(function (q, i) {
      var obj;
      if (q.cil) {
        obj = new THREE.Mesh(new THREE.CylinderGeometry(q.cil, q.cil, q.alto, 16), MA.blanco);
        obj.geometry.translate(0, q.alto / 2, 0);
        obj.position.copy(VC(q.p[0], q.p[1], q.p[2] - q.alto / 2));
      } else {
        var d = q.dim;
        obj = cajaBase(d[0], d[2], d[1], q.sistema === 'desague' ? MA.concretoOscuro : (q.id === 'medidores' ? MA.muroPerimetral : MA.blanco));
        obj.position.copy(VC(q.p[0], q.p[1], q.p[2] - d[2] / 2));
      }
      var franja = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.03), MS[q.sistema]);
      franja.position.set(0, q.cil ? q.alto + 0.02 : q.dim[2] + 0.02, 0);
      obj.add(franja);
      reg(obj, { etapa: E.ins, orden: 0.78 + i * 0.015, anim: 'aparecer', sistema: q.sistema });
    });

    // -------------------------------------------------------------------------
    // Etapa 4: envolvente (mampostería, parapeto, aberturas)
    // -------------------------------------------------------------------------

    var piezas = CASA.piezasMuro();
    var ordenMuro = {};
    M.muros.forEach(function (m, i) { ordenMuro[m.id] = i * 0.035; });
    piezas.forEach(function (p) {
      cajaCasa(p.rect, p.h0, p.h1, MA.ladrillo, { etapa: E.env, orden: ordenMuro[p.muro], anim: 'subir', frente: [PISO, CIELO], categoria: 'muro' });
    });
    // Parapeto sobre los muros exteriores
    M.muros.filter(function (m) { return m.ext; }).forEach(function (m, i) {
      var inf = CASA.infoMuro(m), e = M.muro;
      var r = inf.eje === 'x' ? [inf.ini, inf.c - e / 2, inf.fin, inf.c + e / 2] : [inf.c - e / 2, inf.ini - 0.075, inf.c + e / 2, inf.fin + 0.075];
      cajaCasa(r, TECHO, TECHO + nv.parapeto, MA.ladrillo, { etapa: E.env, orden: 0.42 + i * 0.03, anim: 'subir', categoria: 'muro' });
    });

    // Aberturas: marcos y vidrios
    M.aberturas.forEach(function (op, i) {
      var m = CASA.muroPorId(op.muro), inf = CASA.infoMuro(m);
      var h0 = PISO + op.antepecho, h1 = h0 + op.alto;
      var g = new THREE.Group();
      var largo = op.hasta - op.desde, prof = 0.07, pf = 0.05;
      var centro = (op.desde + op.hasta) / 2;
      var pos = inf.eje === 'x' ? VC(centro, inf.c, h0) : VC(inf.c, centro, h0);
      g.position.copy(pos);
      if (inf.eje === 'y') g.rotation.y = Math.PI / 2;
      function barra(x0, y0, x1, y1, z, d, material) {
        var b = cajaBase(x1 - x0, y1 - y0, d, material);
        b.position.set((x0 + x1) / 2, y0, z || 0);
        g.add(b);
      }
      var W2 = largo / 2, H = op.alto;
      if (op.tipo === 'puerta') {
        barra(-W2, 0, -W2 + pf, H, 0, M.muro + 0.04, MA.marco);
        barra(W2 - pf, 0, W2, H, 0, M.muro + 0.04, MA.marco);
        barra(-W2, H - pf, W2, H, 0, M.muro + 0.04, MA.marco);
      } else {
        barra(-W2, 0, -W2 + pf, H, 0, prof, MA.marco);
        barra(W2 - pf, 0, W2, H, 0, prof, MA.marco);
        barra(-W2, 0, W2, pf, 0, prof, MA.marco);
        barra(-W2, H - pf, W2, H, 0, prof, MA.marco);
        if (op.tipo === 'corrediza') {
          barra(-0.03, 0, 0.03, H, 0.03, 0.03, MA.marco);
          barra(-W2 + pf, pf, 0.03, H - pf, -0.015, 0.012, MA.vidrio);
          barra(-0.03, pf, W2 - pf, H - pf, 0.015, 0.012, MA.vidrio);
        } else {
          if (largo > 1.4) barra(-0.025, pf, 0.025, H - pf, 0, prof * 0.8, MA.marco);
          barra(-W2 + pf, pf, W2 - pf, H - pf, 0, 0.012, MA.vidrio);
        }
      }
      reg(g, { etapa: E.env, orden: 0.6 + i * 0.025, anim: 'aparecer', categoria: 'abertura' });

      // Hoja de puerta (acabados), abierta 80° hacia su lado
      if (op.tipo === 'puerta') {
        var ancho = largo - 0.04;
        var hoja = new THREE.Group();
        var geo = new THREE.BoxGeometry(ancho, op.alto - 0.03, 0.04);
        geo.translate(ancho / 2, (op.alto - 0.03) / 2, 0);
        var mh = new THREE.Mesh(geo, op.id === 'P1' ? MA.maderaOscura : MA.puerta);
        hoja.add(mh);
        var manija = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.06), MA.metal);
        manija.position.set(ancho - 0.08, 1.0, 0);
        hoja.add(manija);
        var dh = op.bisagra === 'desde' ? op.desde + 0.02 : op.hasta - 0.02;
        var cara = op.lado * M.muro / 2;
        var piv = inf.eje === 'x' ? VC(dh, inf.c + cara, PISO) : VC(inf.c + cara, dh, PISO);
        hoja.position.copy(piv);
        var sgn = op.bisagra === 'desde' ? 1 : -1;
        var dc = inf.eje === 'x' ? new THREE.Vector2(sgn, 0) : new THREE.Vector2(0, sgn);
        var dop = inf.eje === 'x' ? new THREE.Vector2(0, op.lado) : new THREE.Vector2(op.lado, 0);
        var a80 = 80 * Math.PI / 180;
        var dir = new THREE.Vector2(dc.x * Math.cos(a80) + dop.x * Math.sin(a80), dc.y * Math.cos(a80) + dop.y * Math.sin(a80));
        hoja.rotation.y = Math.atan2(-dir.y, dir.x);
        reg(hoja, { etapa: E.aca, orden: 0.4 + i * 0.01, anim: 'aparecer', categoria: 'puerta' });
      }
    });

    // -------------------------------------------------------------------------
    // Etapa 5: acabados
    // -------------------------------------------------------------------------

    // Revoque: capa blanca que sube sobre cada tramo de ladrillo
    var rv = 0.025;
    piezas.forEach(function (p) {
      var inf = CASA.infoMuro(CASA.muroPorId(p.muro)), r = p.rect.slice();
      if (p.eje === 'x') {
        r[1] -= rv; r[3] += rv;
        if (Math.abs(r[0] - inf.ini) < 1e-6) r[0] -= rv;
        if (Math.abs(r[2] - inf.fin) < 1e-6) r[2] += rv;
      } else {
        r[0] -= rv; r[2] += rv;
        if (Math.abs(r[1] - inf.ini) < 1e-6) r[1] -= rv;
        if (Math.abs(r[3] - inf.fin) < 1e-6) r[3] += rv;
      }
      cajaCasa(r, p.h0, p.h1, MA.revoque, { etapa: E.aca, orden: 0.02 + ordenMuro[p.muro] * 0.5, anim: 'subir', frente: [PISO, CIELO], categoria: 'revoque' });
    });
    M.muros.filter(function (m) { return m.ext; }).forEach(function (m, i) {
      var inf = CASA.infoMuro(m), e = M.muro + 2 * rv;
      var r = inf.eje === 'x' ? [inf.ini - rv, inf.c - e / 2, inf.fin + rv, inf.c + e / 2] : [inf.c - e / 2, inf.ini - 0.075, inf.c + e / 2, inf.fin + 0.075];
      cajaCasa(r, TECHO - 0.001, TECHO + nv.parapeto + 0.03, MA.revoque, { etapa: E.aca, orden: 0.22 + i * 0.02, anim: 'subir', categoria: 'revoque' });
    });
    // Impermeabilización de la azotea
    cajaCasa([0.15, 0.15, M.casa.ancho - 0.15, M.casa.fondo - 0.15], TECHO, TECHO + 0.025, MA.membrana, { etapa: E.aca, orden: 0.3, anim: 'caer' });
    // Cielorraso
    cajaCasa([0.15, 0.15, M.casa.ancho - 0.15, M.casa.fondo - 0.15], CIELO - 0.012, CIELO - 0.002, MA.cielorraso, { etapa: E.aca, orden: 0.32, anim: 'aparecer', sombra: false });
    // Césped que vuelve a cubrir el borde de la excavación
    cajaLote(excav, -0.001, 0.0005, MA.cesped, { etapa: E.aca, orden: 0.58, anim: 'aparecer', fijo: true, sombra: false });

    // Pisos por ambiente
    M.ambientes.forEach(function (a, i) {
      var sh = new THREE.Shape();
      a.poli.forEach(function (q, k) {
        var X = q[0] + OX - CX, Z = q[1] + OY - CY;
        if (k === 0) sh.moveTo(X, -Z); else sh.lineTo(X, -Z);
      });
      var geo = new THREE.ShapeGeometry(sh);
      geo.rotateX(-Math.PI / 2);
      var material = MA[a.piso] || MA.porcelanato;
      var piso = new THREE.Mesh(geo, material);
      piso.position.y = PISO + 0.001;
      reg(piso, { etapa: E.aca, orden: 0.12 + i * 0.02, anim: 'aparecer', categoria: 'piso', sombra: false });

      // Luz de techo y luz nocturna
      var l = CASA.luzAmbiente(a);
      var plafon = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.03, 20), MA.luz);
      plafon.position.copy(VC(l[0], l[1], CIELO - 0.03));
      reg(plafon, { etapa: E.aca, orden: 0.36, anim: 'aparecer', sombra: false });
      var pl = new THREE.PointLight('#ffd9a0', 0, 7, 1.6);
      pl.position.copy(VC(l[0], l[1], CIELO - 0.35));
      raizGrupo.add(pl);
      lucesInteriores.push(pl);
    });

    // Muebles
    M.muebles.forEach(function (mb, i) {
      var g = mueble3D(mb);
      g.position.copy(VC(mb.x, mb.y, PISO));
      g.rotation.y = { S: 0, E: Math.PI / 2, N: Math.PI, O: -Math.PI / 2 }[mb.frente || 'S'];
      reg(g, { etapa: E.aca, orden: 0.45 + (i / M.muebles.length) * 0.35, anim: 'caer', categoria: 'mueble' });
    });

    function mueble3D(mb) {
      var g = new THREE.Group();
      var w = mb.w, d = mb.d;
      function caja(x, y, z, sx, sy, sz, material) {
        var m = cajaBase(sx, sy, sz, material);
        m.position.set(x, y, z);
        g.add(m);
        return m;
      }
      function cil(x, y, z, r, h, material, seg) {
        var m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg || 16), material);
        m.geometry.translate(0, h / 2, 0);
        m.position.set(x, y, z);
        g.add(m);
        return m;
      }
      function patas(x0, x1, z0, z1, h, r, material) {
        [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].forEach(function (p) { cil(p[0], 0, p[1], r, h, material, 6); });
      }
      switch (mb.tipo) {
        case 'cama':
          caja(0, 0, 0, w, 0.32, d, MA.maderaClara);
          caja(0, 0.32, 0.04, w - 0.04, 0.2, d - 0.1, MA.telaClara);
          caja(0, 0, -d / 2 + 0.03, w + 0.04, 0.95, 0.06, MA.maderaOscura);
          var nAlm = w > 1.5 ? 2 : 1;
          for (var k = 0; k < nAlm; k++) {
            var ax = nAlm === 1 ? 0 : (k === 0 ? -w / 4 : w / 4);
            caja(ax, 0.52, -d / 2 + 0.28, (w - 0.2) / nAlm, 0.12, 0.38, MA.blanco);
          }
          caja(0, 0.5, d * 0.18, w + 0.02, 0.05, d * 0.62, w > 1.5 ? MA.acento : MA.verdeManta);
          break;
        case 'mesaLuz':
          caja(0, 0, 0, w, 0.5, d, MA.maderaClara);
          cil(0, 0.5, 0, 0.06, 0.25, MA.blanco, 10);
          break;
        case 'placard':
          caja(0, 0, 0, w, 2.4, d, MA.telaClara);
          for (var p = 1; p < Math.round(w / 0.5); p++) caja(-w / 2 + p * 0.5, 0.02, d / 2, 0.01, 2.35, 0.005, MA.maderaClara);
          break;
        case 'escritorio':
          caja(0, 0.72, 0, w, 0.03, d, MA.maderaClara);
          caja(-w / 2 + 0.02, 0, 0, 0.03, 0.72, d, MA.maderaClara);
          caja(w / 2 - 0.02, 0, 0, 0.03, 0.72, d, MA.maderaClara);
          caja(0, 0.75, -d / 2 + 0.1, 0.5, 0.32, 0.02, MA.oscuro);
          break;
        case 'ducha':
          caja(0, 0, 0, w, 0.05, d, MA.sanitario);
          caja(0, 0.05, d / 2 - 0.01, w, 1.95, 0.01, MA.vidrio);
          caja(w / 2 - 0.01, 0.05, 0, 0.01, 1.95, d, MA.vidrio);
          cil(-w / 2 + 0.2, 1.95, -d / 2 + 0.2, 0.1, 0.02, MA.metal);
          break;
        case 'inodoro':
          caja(0, 0.38, -d / 2 + 0.09, w, 0.4, 0.18, MA.sanitario);
          var taza = cil(0, 0, 0.06, 0.18, 0.4, MA.sanitario, 20);
          taza.scale.z = 1.35;
          break;
        case 'lavatorio':
          caja(0, 0, 0, w, 0.78, d, MA.maderaClara);
          caja(0, 0.78, 0, w + 0.02, 0.06, d + 0.02, MA.sanitario);
          cil(0, 0.84, -d / 2 + 0.06, 0.015, 0.2, MA.metal, 8);
          caja(0, 1.0, -d / 2 + 0.01, w, 0.7, 0.01, MA.vidrio);
          break;
        case 'piletaLavadero':
          caja(0, 0, 0, w, 0.88, d, MA.concreto);
          break;
        case 'lavarropas':
          caja(0, 0, 0, w, 0.86, d, MA.blanco);
          var vent = cil(0, 0.45, d / 2, 0.19, 0.02, MA.oscuro, 24);
          vent.rotation.x = Math.PI / 2;
          break;
        case 'consola':
          caja(0, 0, 0, w, 0.8, d, MA.maderaOscura);
          break;
        case 'mesada':
        case 'isla':
          caja(0, 0.08, 0, w - 0.04, 0.78, d - 0.04, MA.blanco);
          caja(0, 0.86, 0, w, 0.04, d, MA.granito);
          if (mb.tipo === 'isla') caja(0, 0, 0, w - 0.1, 0.08, d - 0.12, MA.oscuro);
          break;
        case 'bacha':
          caja(0, 0.9, 0, w, 0.01, d, MA.metal);
          cil(0, 0.9, -d / 2 + 0.02, 0.015, 0.3, MA.metal, 8);
          break;
        case 'anafe':
          caja(0, 0.9, 0, w, 0.008, d, MA.oscuro);
          break;
        case 'heladera':
          caja(0, 0, 0, w, 1.85, d, MA.metal);
          caja(0, 1.2, d / 2, w - 0.02, 0.01, 0.01, MA.oscuro);
          break;
        case 'banqueta':
          cil(0, 0, 0, 0.03, 0.62, MA.metal, 8);
          cil(0, 0.62, 0, 0.19, 0.05, MA.maderaOscura);
          break;
        case 'mesa':
          caja(0, 0.72, 0, w, 0.04, d, MA.maderaClara);
          patas(-w / 2 + 0.08, w / 2 - 0.08, -d / 2 + 0.08, d / 2 - 0.08, 0.72, 0.025, MA.maderaOscura);
          break;
        case 'silla':
          caja(0, 0.44, 0, w, 0.04, d, MA.maderaOscura);
          caja(0, 0.48, -d / 2 + 0.02, w, 0.42, 0.03, MA.maderaOscura);
          patas(-w / 2 + 0.04, w / 2 - 0.04, -d / 2 + 0.04, d / 2 - 0.04, 0.44, 0.015, MA.maderaOscura);
          break;
        case 'alfombra':
          caja(0, 0, 0, w, 0.012, d, MA.alfombra);
          break;
        case 'rack':
          caja(0, 0.1, 0, w, 0.4, d, MA.maderaOscura);
          caja(0, 1.05, -d / 2 + 0.03, 1.45, 0.82, 0.04, MA.oscuro);
          break;
        case 'sofa':
          caja(0, 0.08, 0.05, w - 0.36, 0.36, d - 0.1, MA.tela);
          caja(0, 0.08, -d / 2 + 0.11, w, 0.72, 0.22, MA.tela);
          caja(-w / 2 + 0.09, 0.08, 0, 0.18, 0.55, d, MA.tela);
          caja(w / 2 - 0.09, 0.08, 0, 0.18, 0.55, d, MA.tela);
          caja(-0.5, 0.44, 0.0, 0.45, 0.1, 0.42, MA.telaClara);
          caja(0.5, 0.44, 0.0, 0.45, 0.1, 0.42, MA.acento);
          break;
        case 'sillon':
          caja(0, 0.08, 0.05, w - 0.3, 0.36, d - 0.1, MA.acento);
          caja(0, 0.08, -d / 2 + 0.1, w, 0.7, 0.2, MA.acento);
          caja(-w / 2 + 0.075, 0.08, 0, 0.15, 0.52, d, MA.acento);
          caja(w / 2 - 0.075, 0.08, 0, 0.15, 0.52, d, MA.acento);
          break;
        case 'mesaRatona':
          caja(0, 0, 0, w, 0.36, d, MA.maderaClara);
          break;
        case 'maceta':
          cil(0, 0, 0, w / 2, 0.45, MA.concreto, 16);
          var planta = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 1), MA.copa);
          planta.position.set(0, 0.95, 0);
          g.add(planta);
          break;
        default:
          caja(0, 0, 0, w, 0.5, d, MA.blanco);
      }
      return g;
    }

    // Exterior: muro perimetral, solados, galería, piscina, vegetación
    var L = M.lote, mp = EXT.muroPerimetral;
    var ext = [
      [0, 0, 0.15, L.fondo], [L.ancho - 0.15, 0, L.ancho, L.fondo], [0.15, L.fondo - 0.15, L.ancho - 0.15, L.fondo]
    ];
    ext.forEach(function (r, i) {
      cajaLote(r, 0, mp, MA.muroPerimetral, { etapa: E.aca, orden: 0.55 + i * 0.02, anim: 'subir', fijo: true, categoria: 'exterior' });
    });
    [[0.15, 0, 5.6, 0.15], [6.8, 0, 6.85, 0.15], [7.45, 0, 7.4, 0.15], [11.6, 0, L.ancho - 0.15, 0.15]].forEach(function (r, i) {
      if (r[2] - r[0] <= 0) return;
      cajaLote(r, 0, 0.6, MA.muroPerimetral, { etapa: E.aca, orden: 0.6 + i * 0.01, anim: 'subir', fijo: true, categoria: 'exterior' });
    });
    // Pilar de medidores
    cajaLote(EXT.pilar, 0, 1.75, MA.muroPerimetral, { etapa: E.ins, orden: 0.0, anim: 'subir', fijo: true, categoria: 'exterior' });

    cajaLote(EXT.camino, 0, 0.03, MA.solado, { etapa: E.aca, orden: 0.62, anim: 'aparecer', fijo: true, sombra: false });
    cajaLote(EXT.cochera, 0, 0.03, MA.solado, { etapa: E.aca, orden: 0.62, anim: 'aparecer', fijo: true, sombra: false });
    cajaLote(EXT.galeria, 0, PISO - 0.01, MA.deck, { etapa: E.aca, orden: 0.64, anim: 'aparecer', fijo: true });

    // Pérgola de la galería
    var gl = EXT.galeria, pergola = new THREE.Group();
    [gl[0] + 0.1, (gl[0] + gl[2]) / 2, gl[2] - 0.1].forEach(function (x) {
      var poste = cajaBase(0.12, CIELO - 0.1, 0.12, MA.maderaOscura);
      poste.position.copy(V(x, gl[3] - 0.1, 0.0)).sub(V(gl[0], gl[1], 0));
      pergola.add(poste);
    });
    var vigaP = cajaBase(gl[2] - gl[0], 0.18, 0.12, MA.maderaOscura);
    vigaP.position.copy(V((gl[0] + gl[2]) / 2, gl[3] - 0.1, CIELO - 0.1)).sub(V(gl[0], gl[1], 0));
    pergola.add(vigaP);
    for (var sx = gl[0] + 0.2; sx < gl[2] - 0.1; sx += 0.45) {
      var list = cajaBase(0.06, 0.14, gl[3] - gl[1], MA.maderaOscura);
      list.position.copy(V(sx, (gl[1] + gl[3]) / 2, CIELO + 0.08)).sub(V(gl[0], gl[1], 0));
      pergola.add(list);
    }
    pergola.position.copy(V(gl[0], gl[1], 0));
    reg(pergola, { etapa: E.aca, orden: 0.7, anim: 'caer', fijo: true, categoria: 'exterior' });

    // Mesa de galería
    var mg = mueble3D({ tipo: 'mesa', w: 1.8, d: 0.9 });
    mg.position.copy(V(EXT.mesaGaleria.x, EXT.mesaGaleria.y, PISO - 0.01));
    reg(mg, { etapa: E.aca, orden: 0.84, anim: 'caer', fijo: true, categoria: 'mueble' });
    [[-0.5, -0.65, 0], [0.5, -0.65, 0], [-0.5, 0.65, Math.PI], [0.5, 0.65, Math.PI]].forEach(function (s) {
      var silla = mueble3D({ tipo: 'silla', w: 0.45, d: 0.45 });
      silla.position.copy(V(EXT.mesaGaleria.x + s[0], EXT.mesaGaleria.y + s[1], PISO - 0.01));
      silla.rotation.y = s[2];
      reg(silla, { etapa: E.aca, orden: 0.85, anim: 'caer', fijo: true, categoria: 'mueble' });
    });

    // Piscina: deck con hueco, borde, vaso y agua
    var dk = EXT.deck;
    [[dk[0], dk[1], dk[2], pis[1]], [dk[0], pis[3], dk[2], dk[3]], [dk[0], pis[1], pis[0], pis[3]], [pis[2], pis[1], dk[2], pis[3]]]
      .forEach(function (r) { cajaLote(r, 0, 0.04, MA.borde, { etapa: E.aca, orden: 0.66, anim: 'aparecer', fijo: true, sombra: false }); });
    var pp = EXT.piscina.prof;
    [[pis[0], pis[1], pis[2], pis[1] + 0.05], [pis[0], pis[3] - 0.05, pis[2], pis[3]], [pis[0], pis[1], pis[0] + 0.05, pis[3]], [pis[2] - 0.05, pis[1], pis[2], pis[3]]]
      .forEach(function (r) { cajaLote(r, -pp, 0, MA.azulejo, { etapa: E.aca, orden: 0.6, anim: 'subir', fijo: true, sombra: false }); });
    cajaLote(pis, -pp - 0.02, -pp, MA.azulejo, { etapa: E.aca, orden: 0.6, anim: 'aparecer', fijo: true, sombra: false });
    cajaLote([pis[0] + 0.05, pis[1] + 0.05, pis[2] - 0.05, pis[3] - 0.05], -pp, -0.12, MA.agua, { etapa: E.aca, orden: 0.68, anim: 'subir', fijo: true, sombra: false, categoria: 'agua' });

    EXT.reposeras.forEach(function (rp) {
      var g = new THREE.Group();
      var b = cajaBase(0.65, 0.3, 1.9, MA.blanco); g.add(b);
      var resp = cajaBase(0.65, 0.05, 0.6, MA.telaClara);
      resp.position.set(0, 0.3, -0.75); resp.rotation.x = 0.7; g.add(resp);
      g.position.copy(V(rp.x, rp.y, 0.04));
      reg(g, { etapa: E.aca, orden: 0.86, anim: 'caer', fijo: true, categoria: 'mueble' });
    });

    // Vegetación
    EXT.arboles.forEach(function (a, i) {
      var g = new THREE.Group();
      if (a.tipo === 'pindo') {
        var tr = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.2, a.alto, 10), MA.tronco);
        tr.geometry.translate(0, a.alto / 2, 0);
        g.add(tr);
        for (var k = 0; k < 11; k++) {
          var hoja = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 6), MA.hojaPindo);
          hoja.scale.set(1.5, 0.06, 0.32);
          hoja.geometry.translate(1, 0, 0);
          var pivot = new THREE.Group();
          pivot.position.set(0, a.alto, 0);
          pivot.rotation.y = k / 11 * Math.PI * 2 + i;
          hoja.rotation.z = -0.35 - (k % 3) * 0.18;
          pivot.add(hoja);
          g.add(pivot);
        }
      } else {
        var tr2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, a.alto * 0.55, 8), MA.tronco);
        tr2.geometry.translate(0, a.alto * 0.275, 0);
        g.add(tr2);
        var matCopa = a.tipo === 'lapacho' ? MA.lapacho : MA.copa;
        for (var q = 0; q < 6; q++) {
          var blob = new THREE.Mesh(new THREE.IcosahedronGeometry(a.r * (0.55 + (q % 3) * 0.12), 1), matCopa);
          var t = q / 6 * Math.PI * 2;
          blob.position.set(Math.cos(t) * a.r * 0.45, a.alto * 0.7 + (q % 2) * 0.5, Math.sin(t) * a.r * 0.45);
          g.add(blob);
        }
        var top = new THREE.Mesh(new THREE.IcosahedronGeometry(a.r * 0.7, 1), matCopa);
        top.position.set(0, a.alto * 0.85, 0);
        g.add(top);
      }
      g.position.copy(V(a.x, a.y, 0));
      reg(g, { etapa: E.aca, orden: 0.74 + i * 0.03, anim: 'aparecer', fijo: true, categoria: 'vegetacion' });
    });

    // -------------------------------------------------------------------------
    // Estado: línea de tiempo, explotar, rayos X, corte, filtros
    // -------------------------------------------------------------------------

    var estado = { t: 5, explotar: 0, rayos: false, filtros: {}, corte: null };
    Object.keys(CASA.SISTEMAS).forEach(function (k) { estado.filtros[k] = true; });

    function suave(k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }

    function progreso(u, t) {
      if (u.etapa < 0) return 1;
      return Math.max(0, Math.min(1, (t - u.etapa - u.orden * 0.75) / 0.25));
    }

    function actualizar(t, explotar) {
      estado.t = t;
      if (explotar !== undefined) estado.explotar = explotar;
      for (var i = 0; i < elementos.length; i++) {
        var el = elementos[i], u = el.userData;
        var k = progreso(u, t), e = suave(k);
        var visible = k > 0;
        if (u.sistema && !estado.filtros[u.sistema]) visible = false;
        var dy = (!u.fijo && u.etapa >= 0) ? estado.explotar * u.etapa * 1.6 : 0;
        el.position.copy(u.base);
        el.position.y += dy;
        el.scale.set(1, 1, 1);
        if (u.anim === 'tapa') {
          visible = k <= 0;
        } else if (u.anim === 'subir') {
          var f = e;
          if (u.frente) {
            var H = u.frente[0] + e * (u.frente[1] - u.frente[0]);
            var h0 = u.base.y, h1 = h0 + altura(el);
            f = Math.max(0, Math.min(1, (H - h0) / (h1 - h0)));
            visible = visible && f > 0;
          }
          el.scale.y = Math.max(f, 0.0001);
        } else if (u.anim === 'caer') {
          el.position.y += (1 - e) * 2.2;
        } else {
          var s = Math.max(e, 0.0001);
          el.scale.set(s, s, s);
        }
        el.visible = visible;
      }
    }

    function altura(el) {
      if (el.userData.alto === undefined) {
        var g = el.geometry;
        if (g) { g.computeBoundingBox(); el.userData.alto = g.boundingBox.max.y - g.boundingBox.min.y; }
        else el.userData.alto = 1;
      }
      return el.userData.alto;
    }

    function guardarOriginal(m) {
      if (!m.userData.orig) m.userData.orig = { transparent: m.transparent, opacity: m.opacity, depthWrite: m.depthWrite };
    }

    function setRayosX(on) {
      estado.rayos = on;
      materialesObra.forEach(function (m) {
        guardarOriginal(m);
        var o = m.userData.orig;
        m.transparent = on ? true : o.transparent;
        m.opacity = on ? 0.1 : o.opacity;
        m.depthWrite = on ? false : o.depthWrite;
        m.needsUpdate = true;
      });
      // Las cañerías se ven a través de todo, también bajo tierra.
      Object.keys(MS).forEach(function (k) {
        MS[k].emissiveIntensity = on ? 0.9 : 0.15;
        MS[k].depthTest = !on;
        MS[k].needsUpdate = true;
      });
    }

    function setFiltro(sistema, on) { estado.filtros[sistema] = on; actualizar(estado.t); }

    var planoCorte = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1.2);
    function setCorte(h) {
      estado.corte = h;
      if (h === null || h === undefined) {
        materialesCortables.forEach(function (m) { m.clippingPlanes = null; m.needsUpdate = true; });
      } else {
        planoCorte.constant = h;
        materialesCortables.forEach(function (m) { if (!m.clippingPlanes) { m.clippingPlanes = [planoCorte]; m.needsUpdate = true; } });
      }
    }

    function setNoche(f) {
      lucesInteriores.forEach(function (l) { l.intensity = f * 2.2; });
      MA.luz.emissiveIntensity = f * 1.4;
    }

    actualizar(5, 0);

    return {
      raiz: raizGrupo,
      elementos: elementos,
      materiales: MA,
      materialesSistema: MS,
      lucesInteriores: lucesInteriores,
      actualizar: actualizar,
      setRayosX: setRayosX,
      setFiltro: setFiltro,
      setCorte: setCorte,
      setNoche: setNoche,
      estado: estado,
      aMundo: V,
      casaAMundo: VC,
      niveles: { piso: PISO, cielo: CIELO, techo: TECHO }
    };
  }

  raiz.CASA3D = { construir: construir };
})(this);
