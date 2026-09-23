# WealthUncut: contexto del proyecto

Sitio de contenido y herramientas de finanzas prácticas para jóvenes en España (cuentas,
brokers, fondos indexados, impuestos sobre inversiones). Monetización: afiliación directa →
lista de correo → AdSense (solo con ~25-30 páginas sólidas y tráfico). Es un proyecto de
ingresos serio, a tiempo completo, no una web de relleno.

- Dominio: `wealthuncut.com`
- Autor: David Pérez Mitjà (Barcelona), formación en International Business, experiencia en
  finanzas. Español, catalán, inglés.
- Idioma del sitio: solo español (decisión confirmada). El contenido es específico de
  fiscalidad y productos financieros españoles; no tiene sentido traducirlo tal cual.

## Por qué no es "un sitio de IA masivo"

Google penaliza el contenido masivo sin valor añadido (scaled content abuse, updates de spam
2026) y los AI Overviews reducen los clics. Estrategia: activo propio con herramientas
interactivas (calculadoras, comparadores), datos y criterio propios, autoría real, pocas
piezas pero buenas. Ritmo máximo: 3-4 piezas/semana. Herramientas antes que volumen.

## Stack

- Astro + contenido en Markdown/MDX (content collections, `src/content.config.ts`) + islas de
  React para las calculadoras.
- Tailwind CSS v4 (`@tailwindcss/vite`) + `@tailwindcss/typography` para el contenido largo.
- Hosting: Cloudflare Workers (static assets, `wrangler.jsonc`), repo en GitHub, despliegue
  automático en cada push a `main`.

## Reglas de calidad y cumplimiento (no negociables)

- Cada artículo aporta algo que otros no tienen: dato propio, prueba de producto, calculadora,
  opinión razonada. Sin relleno.
- Autor con nombre real, página de autor, página de metodología, fecha de última actualización
  y fuentes citadas en cada artículo (ver `ArticleMeta.astro`).
- Nunca recomendaciones de inversión personalizadas, solo información y educación, con aviso
  legal visible.
- Enlaces de afiliado: `rel="sponsored nofollow"` + aviso de transparencia visible (página de
  divulgación + aviso en los artículos afectados, campo `hasAffiliateLinks` en el frontmatter).
- Páginas legales en español (aviso legal, privacidad, cookies): **borradores pendientes de
  revisión legal profesional antes de considerarlas definitivas**. NIF real ya añadido
  (36745189Z). El domicilio muestra solo "Barcelona, España" (sin dirección exacta) porque
  David no quiere su domicilio particular público; confirmar con un gestor si esto satisface el
  artículo 10 de la LSSI-CE o si hace falta una dirección de notificación (apartado de correos,
  domicilio virtual). Banner de consentimiento (CMP) real pendiente de conectar antes de activar
  AdSense o analítica no esencial en el EEE.
- **Todas las cifras fiscales y de comisiones viven en `src/config/finance.ts`**, con fuente y
  fecha, marcadas `VERIFICAR` hasta que David las confirme. Las actuales se verificaron el
  2026-09-23 contra la AEAT, el BOE y el FGD (confirmación delegada por David en Claude); hay que
  revisarlas cada año con el nuevo Manual de Renta. Nunca inventar tramos ni tipos
  nuevos sin fuente y fecha. Lo mismo aplica a cualquier dato identificativo real (NIF,
  domicilio): nunca inventarlo, dejarlo pendiente en su lugar.
- **Nunca usar guiones largos (—) en texto de cara al usuario** (artículos, páginas, UI). David
  los identifica como una señal de que el texto está escrito por IA. Usar coma, punto y seguido,
  dos puntos o paréntesis en su lugar. Aplica a todo contenido visible: artículos MDX, páginas
  Astro, copys de componentes.
- Diseño: la paleta (crema, verde oscuro, serif Fraunces + sans Inter) está confirmada y no se
  toca. Pero cuidado al inspirarse en referencias visuales de terceros (p. ej. la web de un
  amigo de David): copiar la *composición*/estructura de layout de un sitio real ajeno no vale
  aunque cambien los colores o el texto; hay que variar la disposición de los elementos.

## Cómo trabajar en este repo

- Pasos pequeños, verificar que compila (`npm run build`) y se ve bien en el navegador antes de
  dar algo por terminado.
- Explicar en una frase qué se ha hecho y qué toca ahora.
- Antes de acciones que solo David puede hacer (crear cuentas, pagar, pulsar "publicar"),
  decírselo explícitamente, no asumir.
- No añadir dependencias, abstracciones ni features que no se hayan pedido.

## Estructura actual

- `src/config/site.ts`: metadatos del sitio y del autor.
- `src/config/finance.ts`: cifras fiscales VERIFICAR (tramos del ahorro, retención, compensación,
  regla de recompra, modelo 720, FGD) y lógica de cálculo del IRPF del ahorro. Los artículos
  importan estas constantes en MDX en vez de escribir las cifras a mano.
- `src/content.config.ts` + `src/content/blog/`: artículos en MDX.
- `src/lib/posts.ts` (carpeta nueva): `isPublished()`, única regla de qué artículo está publicado
  (no borrador y `pubDate` ya alcanzada). Un artículo con `pubDate` futura queda programado.
- `.github/workflows/publicacion-programada.yml`: martes, viernes y domingo a las 05:00 UTC, si
  algún artículo tiene `pubDate` de ese día, hace un commit vacío para que Cloudflare reconstruya
  y lo publique.
- `src/layouts/BaseLayout.astro`: head, SEO, OG image, JSON-LD enlazado por `@id` (Organization,
  Person, WebSite, y Article/BreadcrumbList vía `extraJsonLd` en páginas de blog). El sufijo
  " · WealthUncut" del `<title>` solo se añade si cabe en 60 caracteres.
- `src/components/ArticleMeta.astro`: autoría, fechas, aviso de afiliación, aviso educativo,
  fuentes.
- `src/components/ArticleLink.astro`: sustituye a `<a>` en los MDX; los enlaces a borradores se
  muestran como texto (evita 404) y se activan solos al publicar.
- `src/components/TramosAhorroTabla.astro`: tabla de tramos del ahorro generada desde finance.ts.
- `src/components/IndexFundCalculator.tsx`: simulador de rentabilidad neta (primera
  herramienta).
- `src/pages/`: home, blog, autor, metodología, transparencia, legales, sugerencias (+ API con
  KV), RSS, 404.
- `public/`: favicon propio, `og-default.png`, `_headers` (cabeceras de seguridad), robots.txt.
- `KEYWORDS.md`: mapa de clusters y keywords, validado con autocompletado de Google, con el
  artículo que cubre cada keyword.
- Ojo con Astro: comprime el salto de línea entre texto y un `<a>` en la línea siguiente y se
  pierde el espacio. Terminar la línea anterior con `{' '}`.
