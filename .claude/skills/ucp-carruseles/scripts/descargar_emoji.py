"""Descarga emojis de Apple (PNG 160 px) del set iamcal/emoji-data (raw.githubusercontent.com) a assets/emojis-apple.

Uso:
  python3 -I descargar_emoji.py deciduous-tree=🌳 megaphone=📣 gear=2699-fe0f

Cada argumento es slug=emoji o slug=código (hex separado por guiones). El slug es el nombre de Emojipedia en
minúsculas con guiones y será el nombre del archivo (slug.png) que usan las plantillas. Emojipedia bloquea las
descargas desde la nube; este repositorio no. Solo emojis de Apple, nunca de Android/Google/Samsung.
"""
import os, subprocess, sys, urllib.request

BASE = 'https://raw.githubusercontent.com/iamcal/emoji-data/master/img-apple-160/'
here = os.path.dirname(os.path.abspath(__file__))
out = os.path.join(here, '..', 'assets', 'emojis-apple')


def candidatos(v):
    v = v.strip()
    if v and all(c in '0123456789abcdefABCDEF-' for c in v):
        return [v.lower()]
    cps = ['%x' % ord(c) for c in v]
    sin = [c for c in cps if c != 'fe0f']
    o = []
    for c in ('-'.join(cps), '-'.join(sin), '-'.join(sin + ['fe0f'])):
        if c and c not in o:
            o.append(c)
    return o


def bajar(url):
    try:
        with urllib.request.urlopen(url, timeout=30) as r:
            return r.read()
    except Exception:
        p = subprocess.run(['curl', '-sSf', url], capture_output=True)   # usa el proxy y certificados del sistema
        return p.stdout if p.returncode == 0 else None


if len(sys.argv) < 2:
    sys.exit(__doc__)
os.makedirs(out, exist_ok=True)
for a in sys.argv[1:]:
    slug, v = a.split('=', 1)
    for c in candidatos(v):
        b = bajar(BASE + c + '.png')
        if b and b[:4] == b'\x89PNG':
            open(os.path.join(out, slug + '.png'), 'wb').write(b)
            print('ok', slug, c, len(b), 'bytes')
            break
    else:
        print('NO ENCONTRADO', slug, v, '(probá con el código exacto, p. ej. 2699-fe0f)')
