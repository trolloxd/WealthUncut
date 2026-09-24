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

## Sección /mercados/ (decisión de David, 2026-09-24)

David decidió publicar cada día un artículo de mercados escrito y publicado automáticamente, sin
revisión humana previa, sabiendo que choca con la regla de "pocas piezas" y que Google puede
penalizar contenido automatizado. La condición es cero errores: el procedimiento completo, con la
verificación en dos fuentes y la regla de no publicar si algo no se puede verificar, está en
`MERCADOS-PROCEDIMIENTO.md`. Lo ejecuta cada mañana una rutina en la nube de Claude Code.

## Herramientas con datos que caducan (decisión de David, 2026-09-24)

Además de las calculadoras basadas en fórmulas sobre cifras oficiales (IRPF, Seguridad Social,
ITP, todas en `finance.ts`), hay dos comparadores con datos comerciales que cambian con el tiempo:
cuentas remuneradas/depósitos y fondos indexados. David pidió expresamente que esto se mantenga
actualizado solo, con la misma filosofía que `/mercados/`: verificar en al menos dos fuentes
independientes y no tocar el dato si no se puede verificar con garantías. El procedimiento de cada
uno está en `CUENTAS-PROCEDIMIENTO.md` y `FONDOS-PROCEDIMIENTO.md`, y lo ejecutan sendas rutinas en
la nube de Claude Code (semanal la de cuentas, mensual la de fondos, gestionadas con la misma
infraestructura que la rutina de mercados; ver `RemoteTrigger`/la skill `schedule` para verlas o
cambiarlas). A diferencia de las cifras fiscales, aquí no hay una fuente oficial única (BOE, AEAT):
son ofertas y productos de bancos y gestoras, así que la verificación es cruzar comparadores
financieros reconocidos, nunca inventar.

## Estructura actual

- `src/config/site.ts`: metadatos del sitio y del autor.
- `src/config/finance.ts`: cifras fiscales VERIFICAR (tramos del ahorro, retención, compensación,
  regla de recompra, modelo 720, FGD) y lógica de cálculo del IRPF del ahorro. Los artículos
  importan estas constantes en MDX en vez de escribir las cifras a mano.
- `src/content.config.ts` + `src/content/blog/`: artículos en MDX.
- `src/content/mercados/AAAA-MM-DD.mdx`: ediciones diarias de mercados; `src/data/mercados/` (carpeta
  nueva): datos oficiales del BCE de cada día, generados por `scripts/datos-mercados.mjs` (carpeta
  nueva); `MarketSnapshot.astro` y `MarketChart.astro` (gráficas SVG sin librerías) los muestran.
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
  herramienta, vive en el artículo `rentabilidad-neta-fondo-indexado`).
- Herramientas en `/herramientas/` (carpeta nueva `src/pages/herramientas/`): cada una es una isla
  React en `src/components/` (`EmergencyFundCalculator`, `FundVsEtfCalculator`,
  `FundSaleTaxCalculator`, `InflationCalculator`, `Modelo720Checker`, `MortgageCalculator`,
  `PensionVsFundCalculator`, `SalaryCalculator`, `HomeDepositCalculator`) con su página basada en
  `src/layouts/ToolLayout.astro`. Piezas visuales comunes en `src/components/CalculatorUI.tsx`.
  El listado (índice, portada) sale de `src/config/tools.ts`: una herramienta nueva se añade ahí.
  Todas leen las cifras fiscales de `finance.ts` (tramos IRPF estatal y autonómico de las 15 CCAA
  de régimen común + Ceuta/Melilla, cotizaciones SS, ITP por comunidad, límites de plan de
  pensiones). Los dos comparadores con datos comerciales (`CuentasRemuneradasTabla.astro`,
  `FondosIndexadosTabla.astro`) son componentes Astro sin interactividad que leen directamente
  `src/data/cuentas-remuneradas/ultimo.json` y `src/data/fondos-indexados/ultimo.json` (ver
  sección de arriba).
- `src/data/euribor/ultimo.json`, generado por `scripts/datos-euribor.mjs` (BCE, euríbor a 12
  meses, media mensual): lo usa el simulador de hipoteca como valor de partida.
- `src/pages/`: home, blog, autor, metodología, transparencia, legales, sugerencias (+ API con
  KV), RSS, 404.
- `public/`: favicon propio, `og-default.png`, `_headers` (cabeceras de seguridad), robots.txt.
- `KEYWORDS.md`: mapa de clusters y keywords, validado con autocompletado de Google, con el
  artículo que cubre cada keyword.
- Ojo con Astro: comprime el salto de línea entre texto y un `<a>` en la línea siguiente y se
  pierde el espacio. Terminar la línea anterior con `{' '}`.
