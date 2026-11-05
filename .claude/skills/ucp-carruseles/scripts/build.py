"""Compila una plantilla JSX de ucp-carruseles: incrusta en el marcador /*XE*/ (base64) los emojis Apple que usa
y la guarda en UTF-8 con BOM (Illustrator la necesita así para leer bien los acentos).

Uso:
  python3 -I build.py <plantilla.jsx> <salida.jsx> [extra1.png ...] [--emojis <carpeta>] [--sin-auto]

Por defecto detecta todos los slugs entre comillas simples ('heart-hands', 'laptop'...) que existan como PNG en
assets/emojis-apple y los incrusta, así el .jsx funciona aunque la skill no esté instalada en la PC donde corre
Illustrator. Los PNG extra (p. ej. recién descargados) se incrustan con su nombre de archivo como slug.
--sin-auto incrusta solo los extra (el script queda liviano y lee los demás desde la carpeta EM de la PC).
"""
import base64, os, re, sys

here = os.path.dirname(os.path.abspath(__file__))
args = sys.argv[1:]
auto = True
emdir = os.path.join(here, '..', 'assets', 'emojis-apple')
if '--sin-auto' in args:
    args.remove('--sin-auto'); auto = False
if '--emojis' in args:
    i = args.index('--emojis'); emdir = args[i + 1]; del args[i:i + 2]
if len(args) < 2:
    sys.exit(__doc__)
src, out, extra = args[0], args[1], args[2:]

s = open(src, encoding='utf-8-sig').read()
if '/*XE*/' not in s:
    sys.exit('La plantilla no tiene el marcador /*XE*/ (var XE={/*XE*/};)')
pngs = {}
if auto:
    have = {f[:-4] for f in os.listdir(emdir) if f.endswith('.png')}
    for k in sorted(set(re.findall(r"'([a-z0-9]+(?:-[a-z0-9]+)*)'", s)) & have):
        pngs[k] = os.path.join(emdir, k + '.png')
for p in extra:
    pngs[os.path.splitext(os.path.basename(p))[0]] = p
xe = ",\n".join("'%s':'%s'" % (k, base64.b64encode(open(p, 'rb').read()).decode()) for k, p in sorted(pngs.items()))
s = s.replace('/*XE*/', '\n' + xe + '\n' if xe else '')
d = os.path.dirname(out)
if d:
    os.makedirs(d, exist_ok=True)
open(out, 'w', encoding='utf-8-sig').write(s)
print('ok', out, len(s.encode('utf-8')), 'bytes |', len(pngs), 'emojis:', ', '.join(sorted(pngs)))
