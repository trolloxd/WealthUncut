# Changelog nocturno (noche del 22 al 23 de septiembre de 2026)

Trabajo hecho sin supervisión según el alcance acordado: ampliar borradores, SEO técnico, SEO de
contenido y arreglos generales. Nada de monetización (solo la checklist del final). Cada bloque
tiene su propio commit; `git log` muestra el detalle.

## Resumen rápido

(se completa al final de la noche)

## 1. Cifras fiscales (`src/config/finance.ts`)

- **Corregido el último tramo del IRPF del ahorro: 28% → 30%.** La Ley 7/2024, de 20 de
  diciembre, lo subió con efectos desde el 1 de enero de 2025. Comprobado en el Manual práctico
  de Renta 2025 de la AEAT (escala estatal 15% + autonómica 15% por encima de 300.000 €). Sigue
  marcado `VERIFICAR` / `verificado: false` hasta que lo confirmes tú.
- La fuente ahora apunta a la página concreta del manual, no a la portada de la sede.
- Añadidas nuevas constantes, todas marcadas `VERIFICAR` con fuente y fecha, para que los
  artículos no tengan números escritos a mano: retención del 19% en reembolsos de fondos,
  reglas de compensación de pérdidas (25% y 4 años) y umbrales del modelo 720 (50.000 € por
  bloque, 20.000 € de incremento para volver a presentarlo, plazo 1 de enero a 31 de marzo).
- Recalculadas con un script todas las cifras publicadas (portada, ejemplo de la calculadora,
  tabla de TER, tabla de edades del interés compuesto): **todas cuadran al euro** y el cambio al
  30% no afecta a ninguna, porque ninguna ganancia de ejemplo supera los 300.000 €.

## 2. SEO técnico y errores visibles

- **Enlaces rotos en producción arreglados.** "Cuánto te queda realmente de un fondo indexado"
  enlazaba a tres borradores (TER, fiscalidad de fondos, fondo vs ETF) que daban 404 en
  wealthuncut.com. Nuevo componente `src/components/ArticleLink.astro`: sustituye a los `<a>` de
  los artículos y, si el destino es un borrador, muestra el texto sin enlace. Cuando publiques un
  borrador (`draft: false`), todos los enlaces hacia él aparecen solos en el siguiente build. No
  hace falta tocar nada más.
  - Nota de stack: primero lo intenté como plugin rehype, pero Astro 7 usa el procesador
    Sätteri y lo ignora; la alternativa habría sido añadir `@astrojs/markdown-remark` como
    dependencia. El componente hace lo mismo sin dependencias nuevas.
- **Espacios que faltaban entre texto y enlaces** (ya visibles en producción): el pie de página
  decía "Consulta lametodología", la metodología "a través de lapágina de autor", la línea de
  autor "David Pérez Mitjà· Publicado", etc. Astro comprime el salto de línea antes de un enlace.
  Corregido en 7 sitios y comprobado con un escaneo de todo el HTML generado.
- **Barras finales en enlaces internos** (`/blog` → `/blog/`, etc.): cada clic del menú provocaba
  una redirección 307 antes de cargar la página. 17 enlaces corregidos. Los canonicals ya estaban
  bien.
- **Favicon propio.** El favicon era el logo por defecto de Astro. Nuevo monograma "W" con la
  paleta confirmada (verde oscuro sobre crema): `favicon.svg`, `favicon.ico` y
  `apple-touch-icon.png`.
- **Imagen para redes sociales** (`public/og-default.png`, 1200×630). Antes no había ninguna, así
  que al compartir un enlace en WhatsApp, X o LinkedIn salía sin imagen. Tarjeta de X cambiada a
  `summary_large_image`.
- **JSON-LD**: Organization, Person, WebSite y Article ahora están enlazados por `@id` (Google
  entiende que el autor de cada artículo es la misma persona de la página de autor). Article
  incluye imagen, idioma, palabras clave y `isPartOf`. Person incluye idiomas y ciudad (datos que
  ya están en CLAUDE.md, nada inventado). Logo en Organization.
- **Sitemap**: excluye el 404 y añade `lastmod` a cada artículo a partir de `updatedDate`.
- **404 con `noindex`**, `robots.txt` bloquea `/api/`, RSS ordenado por fecha, con idioma y
  categorías.
- **Cabeceras de seguridad** (`public/_headers`): `nosniff`, `Referrer-Policy`,
  `X-Frame-Options`, `Permissions-Policy`. El adaptador de Cloudflare añade además la caché
  inmutable de `/_astro/*`.
- **Rendimiento**: Fraunces pasa de la variante `full` (121 KB) a `opsz` (67 KB) con el mismo
  aspecto (los ejes SOFT y WONK no se usaban). La calculadora del artículo de interés compuesto,
  que está al final, se carga al hacer scroll (`client:visible`) en vez de al abrir la página.
- **Bloque "Sigue leyendo"** al final de cada artículo: hasta 3 artículos publicados que
  comparten etiquetas. Enlazado interno automático, nunca apunta a borradores.
- **Aviso educativo visible al final de cada artículo** (no es asesoramiento personalizado,
  enlace a metodología). Refuerza el cumplimiento; no sustituye a ningún aviso existente.
- **Fechas con `<time datetime>`** y enlace de autor con `rel="author"`. Fuentes oficiales
  enlazadas sin `nofollow` (citar a la AEAT o la CNMV es una señal de confianza, no hay motivo
  para ocultarlo).
- **Menú**: indica la página actual (`aria-current`) y tiene etiqueta accesible.
- **Calculadora**:
  - Si las comisiones superaban la rentabilidad, mostraba "sin cambios" (la rentabilidad neta se
    fijaba en 0%). Ahora muestra la pérdida real. Probado: TER 9% con rentabilidad 7% da 30.308 €
    sobre 37.000 € aportados.
  - Años negativos ya no rompen el cálculo.
  - El bloque de resultados se anuncia a lectores de pantalla (`aria-live`).
- Avisos del build que quedan: `"use astro:head-inject" may not be preserved` en los MDX. Es
  ruido interno de Astro 7 + Rolldown, no afecta al resultado y no se puede arreglar desde el
  proyecto.

## Pendiente de David

(se completa a lo largo de la noche)

## Checklist de monetización para mañana

(se completa al final de la noche)
