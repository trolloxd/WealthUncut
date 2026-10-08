"""Escribe `categoria:` en el frontmatter de los artículos que no la tienen (una sola vez)."""
import os
import re

MAPA = {
    'fondos-indexados': ['rentabilidad-neta-fondo-indexado', 'interes-compuesto-explicado-con-ejemplos', 'que-es-un-fondo-indexado', 'ter-fondo-que-es',
                         'fondo-indexado-vs-etf-diferencias', 'primeros-pasos-para-invertir-en-espana', 'como-montar-cartera-fondos-indexados',
                         'invertir-100-euros-al-mes', 'sp500-vs-msci-world'],
    'impuestos': ['como-tributan-los-fondos-de-inversion-en-espana', 'modelo-720-quien-tiene-que-presentarlo', 'impuesto-dividendos-espana', 'tramos-irpf-ahorro'],
    'vivienda': ['amortizar-hipoteca-reducir-cuota-o-plazo', 'alquilar-o-comprar-vivienda-las-cuentas', 'cuanto-ahorrar-entrada-piso', 'hipoteca-fija-variable-o-mixta',
                 'gastos-comprar-vivienda-segunda-mano', 'amortizar-hipoteca-o-invertir', 'zonas-tensionadas-que-cambia-inquilinos-propietarios'],
    'autonomos': ['impuestos-autonomo-nuevo-irpf-iva-plazos'],
    'criptomonedas': ['criptomonedas-hacienda-como-tributan-espana'],
    'jubilacion': ['plan-de-pensiones-cuanto-desgrava'],
    'ahorro': ['diferencia-entre-ahorrar-e-invertir', 'fondo-de-emergencia-cuanto-necesitas'],
}
carpeta = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'content', 'blog')
for cat, slugs in MAPA.items():
    for slug in slugs:
        f = os.path.join(carpeta, slug + '.mdx')
        t = open(f, encoding='utf8').read()
        if re.search(r'^categoria:', t, re.M):
            continue
        t = re.sub(r'^(tags: .*)$', r'\1\ncategoria: "' + cat + '"', t, count=1, flags=re.M)
        open(f, 'w', encoding='utf8', newline='').write(t)
        print(cat, slug)
