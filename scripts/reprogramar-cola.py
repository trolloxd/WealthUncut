"""Reprograma la cola de artículos: un artículo por día a partir de mañana.

Orden: primero lo que ya estaba programado (por fecha), después los artículos nuevos que se indican.
Uso: python scripts/reprogramar-cola.py AAAA-MM-DD [slug-nuevo ...]
 - El primer argumento es "hoy" (los artículos con pubDate posterior cuentan como programados).
 - Los slugs nuevos (artículos ya escritos) se colocan al final de la cola.
"""
import datetime
import glob
import os
import re
import sys

hoy = sys.argv[1]
nuevos = sys.argv[2:]
carpeta = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'content', 'blog')

arts = []
for f in glob.glob(os.path.join(carpeta, '*.mdx')):
    t = open(f, encoding='utf8').read()
    d = re.search(r'^pubDate: (\S+)', t, re.M).group(1)
    arts.append((d, f))

cola = [f for d, f in sorted(arts) if d > hoy]
for slug in nuevos:
    f = os.path.join(carpeta, slug + '.mdx')
    if f not in cola:
        cola.append(f)

dia = datetime.date.fromisoformat(hoy) + datetime.timedelta(days=1)
for f in cola:
    t = open(f, encoding='utf8').read()
    s = dia.isoformat()
    t = re.sub(r'^pubDate: \S+', 'pubDate: ' + s, t, count=1, flags=re.M)
    t = re.sub(r'^updatedDate: \S+', 'updatedDate: ' + s, t, count=1, flags=re.M)
    open(f, 'w', encoding='utf8', newline='').write(t)
    print(s, os.path.basename(f))
    dia += datetime.timedelta(days=1)
