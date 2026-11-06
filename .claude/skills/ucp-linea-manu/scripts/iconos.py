"""Íconos planos de la línea Manu (Font Awesome Free 6, estilo solid; licencia CC BY 4.0).

1) Descarga los íconos que falten a assets/fa-svg/ desde raw.githubusercontent.com (FortAwesome/Font-Awesome, rama 6.x).
2) Convierte TODOS los SVG de assets/fa-svg/ en trazados bezier y reemplaza el bloque `var IC={...};` del script indicado,
   así el .jsx sigue siendo autónomo (sin archivos externos) y los íconos quedan como trazados compuestos editables.

Uso:
  python3 -I iconos.py <script.jsx> [nombre-fa ...]        p. ej.  iconos.py mi_carrusel.jsx stethoscope bus
Los nombres son los de fontawesome.com/icons (solid, gratis). Requiere: pip install svgpathtools
Guarda el script en UTF-8 con BOM (Illustrator lo necesita para los acentos).
"""
import math, os, re, subprocess, sys, urllib.request

try:
    from svgpathtools import parse_path, Line, CubicBezier, QuadraticBezier, Arc
except ImportError:
    sys.exit('Falta svgpathtools: pip install svgpathtools')

here = os.path.dirname(os.path.abspath(__file__))
svgdir = os.path.join(here, '..', 'assets', 'fa-svg')
BASE = 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/'


def bajar(nm):
    url = BASE + nm + '.svg'
    try:
        with urllib.request.urlopen(url, timeout=30) as r:
            return r.read()
    except Exception:
        p = subprocess.run(['curl', '-sSf', url], capture_output=True)
        return p.stdout if p.returncode == 0 else None


def cubics(seg):
    if isinstance(seg, CubicBezier):
        return [(seg.start, seg.control1, seg.control2, seg.end)]
    if isinstance(seg, Line):
        return [(seg.start, seg.start, seg.end, seg.end)]
    if isinstance(seg, QuadraticBezier):
        p0, q, p2 = seg.start, seg.control, seg.end
        return [(p0, p0 + 2 / 3 * (q - p0), p2 + 2 / 3 * (q - p2), p2)]
    if isinstance(seg, Arc):
        dr = math.radians(seg.delta)
        n = max(1, math.ceil(abs(seg.delta) / 90))
        k = 4 / 3 * math.tan(dr / n / 4) / dr
        o = []
        for i in range(n):
            t0, t1 = i / n, (i + 1) / n
            p0, p3 = seg.point(t0), seg.point(t1)
            o.append((p0, p0 + k * seg.derivative(t0), p3 - k * seg.derivative(t1), p3))
        return o
    raise ValueError(type(seg))


def icono(nm):
    s = open(os.path.join(svgdir, nm + '.svg'), encoding='utf-8').read()
    vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', s).group(1).split()]
    sc = 1000 / max(vb[2], vb[3])
    cx, cy = vb[0] + vb[2] / 2, vb[1] + vb[3] / 2
    f = lambda z: (round((z.real - cx) * sc), round((z.imag - cy) * sc))
    subs = []
    for d in re.findall(r'<path[^>]*\sd="([^"]+)"', s):
        for sp in parse_path(d).continuous_subpaths():
            cs = []
            for seg in sp:
                if seg.length() > 1e-9:
                    cs += cubics(seg)
            if not cs:
                continue
            if abs(cs[-1][3] - cs[0][0]) > 1e-6:
                cs.append((cs[-1][3], cs[-1][3], cs[0][0], cs[0][0]))
            pts = []
            for i, c in enumerate(cs):
                a, l, r = f(c[0]), f(cs[i - 1][2]), f(c[1])
                pts += [a[0], a[1], l[0], l[1], r[0], r[1]]
            subs.append('[' + ','.join(str(v) for v in pts) + ']')
    return "'%s':[%s]" % (nm, ','.join(subs))


if len(sys.argv) < 2:
    sys.exit(__doc__)
jsx, nuevos = sys.argv[1], sys.argv[2:]
os.makedirs(svgdir, exist_ok=True)
for nm in nuevos:
    if not os.path.exists(os.path.join(svgdir, nm + '.svg')):
        b = bajar(nm)
        if b and b.lstrip().startswith(b'<svg'):
            open(os.path.join(svgdir, nm + '.svg'), 'wb').write(b)
            print('descargado', nm)
        else:
            print('NO EXISTE en Font Awesome Free solid:', nm)
names = sorted(f[:-4] for f in os.listdir(svgdir) if f.endswith('.svg'))
block = 'var IC={\n' + ',\n'.join(icono(n) for n in names) + '\n};\n'
src = open(jsx, encoding='utf-8-sig').read()
if not re.search(r'var IC=\{.*?\n\};\n', src, re.S):
    sys.exit('No encontré el bloque var IC={...}; en ' + jsx)
src = re.sub(r'var IC=\{.*?\n\};\n', lambda m: block, src, count=1, flags=re.S)
open(jsx, 'w', encoding='utf-8-sig').write(src)
print('ok', jsx, '|', len(names), 'íconos disponibles')
