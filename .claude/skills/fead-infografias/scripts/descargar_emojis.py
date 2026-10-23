"""Descarga emojis de Apple (iOS, 160 px) desde el CDN de Emojipedia y los guarda como <slug>.png.

Uso:  python -I descargar_emojis.py slug1 slug2 ...      (ej. graduation-cap rocket red-heart)
      python -I descargar_emojis.py --dest <carpeta> slug1 ...
El slug es el de la URL de Emojipedia (https://emojipedia.org/<slug>). Por defecto guarda en
../assets/emojis-apple/ de la skill y saltea los que ya existen. Nunca usa diseños de Android/Google.
"""
import os, re, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
DEST = os.path.join(HERE, '..', 'assets', 'emojis-apple')
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}


def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read()


def apple_url(slug):
    # La página de Emojipedia lista la imagen de Apple más reciente: .../source/apple/<versión>/<slug>_<codepoints>.png
    html = get('https://emojipedia.org/' + slug).decode('utf-8', 'ignore')
    m = re.findall(r'source/apple/(\d+)/(' + re.escape(slug) + r'_[0-9a-f-]+\.png)', html)
    if not m:
        return None
    ver, name = max(m, key=lambda t: int(t[0]))
    return 'https://em-content.zobj.net/source/apple/%s/%s' % (ver, name)


def main(args):
    dest = DEST
    if args[:1] == ['--dest']:
        dest, args = args[1], args[2:]
    os.makedirs(dest, exist_ok=True)
    for slug in args:
        out = os.path.join(dest, slug + '.png')
        if os.path.exists(out):
            print('ya existe', slug)
            continue
        try:
            url = apple_url(slug)
            if not url:
                print('SIN APPLE', slug, '(revisar slug en emojipedia.org)')
                continue
            open(out, 'wb').write(get(url))
            print('ok', slug, url)
        except Exception as e:
            print('ERROR', slug, e)


if __name__ == '__main__':
    main(sys.argv[1:])
