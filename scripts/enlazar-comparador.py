import re, os
base = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'content', 'blog')
textos = {
 'que-es-un-fondo-indexado': 'Si ya sabes qué índice quieres seguir, puedes ver los fondos indexados disponibles en España, ordenados por coste, en el [comparador de fondos indexados](/herramientas/comparador-fondos-indexados/).',
 'ter-fondo-que-es': 'Para comparar el TER de los fondos indexados que se pueden contratar desde España, ordenados de menor a mayor, usa el [comparador de fondos indexados](/herramientas/comparador-fondos-indexados/).',
 'primeros-pasos-para-invertir-en-espana': 'Cuando llegues al momento de elegir producto, el [comparador de fondos indexados](/herramientas/comparador-fondos-indexados/) te enseña el TER, el índice y la plataforma de cada fondo, sin ranking pagado.',
 'como-montar-cartera-fondos-indexados': 'Para elegir los fondos de cada pieza de tu cartera, compara su TER, ISIN y plataforma en el [comparador de fondos indexados](/herramientas/comparador-fondos-indexados/).',
 'fondo-indexado-vs-etf-diferencias': 'Si te decides por fondos, tienes los disponibles en España, con su TER y su plataforma, en el [comparador de fondos indexados](/herramientas/comparador-fondos-indexados/).',
}
for slug, frase in textos.items():
    p = os.path.join(base, slug + '.mdx')
    t = open(p, encoding='utf8').read()
    if 'comparador-fondos-indexados' in t:
        print('ya enlazado', slug); continue
    m = re.search(r'^## Preguntas frecuentes', t, re.M)
    if not m:
        print('sin FAQ', slug); continue
    t = t[:m.start()] + frase + '\n\n' + t[m.start():]
    t = re.sub(r'^updatedDate: \S+', 'updatedDate: 2026-10-15', t, count=1, flags=re.M)
    open(p, 'w', encoding='utf8', newline='').write(t)
    print('enlazado', slug)
