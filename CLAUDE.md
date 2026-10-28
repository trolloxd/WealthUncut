# WealthUncut: contexto del proyecto

Sitio de contenido y herramientas de finanzas prácticas para jóvenes en España (cuentas,
brokers, fondos indexados, impuestos sobre inversiones). Monetización: afiliación directa →
lista de correo → AdSense (solo con ~25-30 páginas sólidas y tráfico). Es un proyecto de
ingresos serio, a tiempo completo, no una web de relleno.

- Dominio: `wealthuncut.com`
- Autor: Alex Serra Rodríguez. No añadir formación, experiencia ni ciudad suya sin que lo confirme.
- Idioma del sitio: solo español (decisión confirmada). El contenido es específico de
  fiscalidad y productos financieros españoles; no tiene sentido traducirlo tal cual.

## Por qué no es "un sitio de IA masivo"

Google penaliza el contenido masivo sin valor añadido (scaled content abuse, updates de spam
2026) y los AI Overviews reducen los clics. Estrategia: activo propio con herramientas
interactivas (calculadoras, comparadores), datos y criterio propios, autoría real, pocas
piezas pero buenas. Ritmo de artículos: uno al día (decisión de David, 2026-10-08, sabiendo que sube el riesgo de "contenido masivo": cada pieza debe seguir aportando cifras verificadas y cálculo propio). Herramientas antes que volumen.

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
- Páginas legales en español (aviso legal, privacidad, cookies): revisadas y completadas el 2026-10-06
  por Claude (no por un abogado) y publicadas sin marcas de borrador: RGPD completo (bases legales,
  conservación de sugerencias 12 meses con `expirationTtl` en `sugerencias.ts`, IP del límite de peticiones
  1 hora, Cloudflare como encargado con SCC y Marco UE-EE. UU.), cookies (ninguna) y exenciones de
  responsabilidad. NIF real ya añadido (36745189Z). **Pendiente que solo David puede resolver:** el
  art. 10.1.a LSSI-CE exige "residencia o domicilio o, en su defecto, la dirección de uno de sus
  establecimientos permanentes en España" (verificado en el BOE el 2026-10-06), y el aviso legal solo
  muestra "Barcelona, España" porque David no quiere su domicilio particular público. Para cumplirlo
  hace falta una dirección (p. ej. domicilio de oficina virtual o coworking). Cuando exista, ponerla en
  `aviso-legal.astro`. Al activar un proveedor de email marketing, publicidad o analítica con cookies,
  actualizar `privacidad.astro` y `cookies.astro` ANTES de activarlo; banner de consentimiento (CMP)
  real obligatorio antes de AdSense o analítica no esencial en el EEE.
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

## Newsletter "5 minutos de finanzas" (decisión de David, 2026-09-25)

`/newsletter/` recopila cada semana lo publicado esa semana (mercados, artículo y herramienta
destacados), nunca datos nuevos: content collection `newsletter` en `src/content/newsletter/`
(`AAAA-MM-DD.mdx`, fecha de envío). Procedimiento y reglas de qué destacar en
`NEWSLETTER-PROCEDIMIENTO.md`; lo ejecuta una rutina semanal en la nube (domingo), misma
infraestructura que `/mercados/`. `NewsletterSignup.astro` es el formulario de suscripción
(portada, índice del boletín y pie de cada número); `src/pages/api/newsletter.ts` y
`newsletter-baja.ts` guardan y borran el email en el mismo KV que `sugerencias.ts` (prefijo
`newsletter:`, sin namespace nuevo), con el mismo honeypot y límite de peticiones, a través de
`src/lib/newsletter-suscripciones.ts` (con pruebas). El envío no sale del Worker ni de ningún
proveedor: el boletín lo envía el PC de David por su Gmail como contacto@wealthuncut.com
(`automation/newsletter.js` del Control Center). Para el correo de bienvenida y el de confirmación
de baja, el Worker deja un aviso en el KV (`newsletter:aviso:<tipo>:<email>`, caduca a las 72 h) y
`automation/newsletter-avisos.js` lo recoge cada 5 minutos y lo envía por el mismo Gmail. Si cambia
qué se guarda o cuánto, actualizar `privacidad.astro` antes de publicarlo.

## Reposición automática de artículos (decisión de David, 2026-10-04)

Los artículos de `/blog/` se publican **uno cada día** (decisión de David, 2026-10-08) con `pubDate` futura (ver
`publicacion-programada.yml`). Cuando quedan **menos de 7 programados**, una rutina en la nube (cada día,
la comprobación casi siempre termina sin hacer nada) escribe un lote de 7 y los deja al final de la cola. Cada
artículo lleva `categoria` en el frontmatter (`src/config/categorias.ts`): `/blog/` los agrupa por tema y
hay una página por tema en `/blog/tema/<id>/`. Procedimiento, reglas de calidad y verificación en
`ARTICULOS-PROCEDIMIENTO.md`; mismas reglas de este documento (cifras fiscales solo de
`finance.ts`, sin guiones largos, sin recomendaciones personalizadas).

## Cookies y banner de consentimiento (revisado el 2026-10-05)

Hoy la web no pone ninguna cookie ni carga recursos de terceros (comprobado en cabeceras y HTML de
producción), y Cloudflare Web Analytics es sin cookies, así que **no hace falta banner todavía**.
Cuando llegue AdSense (o afiliación/analítica con seguimiento): usar el CMP gratuito de Google
("Funding Choices", dentro de la cuenta de AdSense, certificado para el EEE) en vez de contratar uno
aparte, añadir los dominios de Google a `scriptDirective`/`connect-src`/`frame-src` en
`astro.config.mjs` (la CSP los bloquea por defecto), actualizar `cookies.astro` y `privacidad.astro`, y
no activar nada antes de que el banner funcione.

## Rutinas de mantenimiento (decisión de David, 2026-10-05)

David pidió automatizar todo lo automatizable. Además de mercados, cuentas, fondos, newsletter y
reposición de artículos, hay rutinas en la nube para: euríbor (mensual), catálogo de `/carteras/`
(mensual, `MYINVESTOR-FONDOS-PROCEDIMIENTO.md`), seguridad de dependencias (semanal), salud del sitio
(semanal, solo informa) y revisión de cifras fiscales (feb/abr/jun, solo informa y nunca edita
`finance.ts`). Detalle en `MANTENIMIENTO-PROCEDIMIENTO.md`. El kit de promoción que publica David a
mano está en `PROMOCION.md`. Los enlaces internos entre artículos y herramientas salen solos de las
etiquetas (`tags` en `src/config/tools.ts` y en el frontmatter de cada artículo).

## Seguridad (2026-09-24)

- **Cabeceras** en `public/_headers`: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`,
  `Permissions-Policy`, `Strict-Transport-Security` (HSTS), `Cross-Origin-Opener-Policy` y
  `Cross-Origin-Resource-Policy`. Cloudflare las sirve tal cual junto a los assets estáticos.
- **CSP estricta** vía `security.csp` en `astro.config.mjs`: Astro calcula el hash SHA-256 de cada
  `<script>`/`<style>` propio (inline, por el `inlineStylesheets: 'always'` y la hidratación de las
  islas) y genera una etiqueta `<meta http-equiv="Content-Security-Policy">` distinta por página,
  sin `'unsafe-inline'`. `frame-ancestors` no se incluye ahí a propósito (la spec de CSP no permite
  esa directiva por `<meta>`, solo por cabecera HTTP): la protección de esa directiva ya la da
  `X-Frame-Options`. Si se añade algún script de terceros (p. ej. Turnstile), hay que sumar su
  origen a `scriptDirective.resources`/`connect-src`/`frame-src` en `astro.config.mjs`.
- **Importante para cualquier componente React nuevo con un tamaño/posición calculado en tiempo
  real** (barras de progreso, gráficas, anchos dinámicos...): la CSP bloquea `style={{...}}` en
  cuanto se aplica en el navegador, y también bloquea atributos SVG con nombre de propiedad CSS
  fijados dinámicamente (`width`, `height`, `x`, `rx`... en un `<rect>` que React actualiza), no
  solo `style=`. La única forma que funciona sin abrir la CSP es usar clases de Tailwind estáticas
  (literales en el código, para que el build las genere) y elegir la clase que toque según el
  valor calculado, redondeando a un número manejable de pasos si el valor es continuo. Ver
  `IrpfRankingCalculator.tsx` (`claseAncho`) como ejemplo ya resuelto así.
- **`src/pages/api/sugerencias.ts`** (único endpoint que escribe datos): límite de 5 peticiones por
  IP y hora contra el propio KV (clave `ratelimit:sugerencias:<ip>`, con `expirationTtl`), rechazo
  de cuerpos de más de 10 KB antes de parsear el JSON, honeypot invisible, y validación de longitud
  del mensaje y del email. No hay ningún endpoint que lea el KV públicamente: las sugerencias solo
  se pueden escribir, nunca listar ni leer desde fuera.
- Las tres rutas de `/api/` pasan primero por `src/lib/api-seguridad.ts` (Content-Type JSON obligatorio y
  rechazo de `Origin` ajeno, antes de gastar escrituras de KV). Una ruta nueva de escritura debe hacer lo mismo.
- El resto del sitio es HTML estático servido por la red de Cloudflare, lo que ya da una protección
  fuerte contra ataques volumétricos (DDoS de capa 3/4) sin configuración adicional.
- David ya activó a mano en el panel de Cloudflare (2026-09-24): Bot Fight Mode y SSL/TLS en modo
  "Full (strict)". Confirmado que el sitio sigue respondiendo bien tras el cambio.

## Rendimiento, fuentes y analítica (2026-10-06)

- Las fuentes (Fraunces y Inter) se declaran en `src/styles/global.css` con `font-display: optional` y
  se precargan en `BaseLayout.astro`: con `swap` Lighthouse medía un salto de maquetación (CLS 0,325);
  ahora es 0. Si se añade un peso o una fuente nueva, declararla igual y precargarla si se ve en el
  primer pintado. Medir con `npx lighthouse <url>` (usa el Chrome local; la API gratuita de PageSpeed
  se queda sin cuota).
- Cloudflare inyecta solo el contador de Web Analytics (sin cookies): su origen
  (`static.cloudflareinsights.com` / `cloudflareinsights.com`) está permitido en la CSP de
  `astro.config.mjs`. Cloudflare inyecta además un script inline de detección de bots (Bot Fight
  Mode) que la CSP bloquea y deja un error en consola; es inofensivo.
- `/embed/<slug>/` (calculadoras incrustables, `src/config/embeds.ts`) es la única ruta sin cabeceras
  anti-iframe (`public/_headers`). Nueva herramienta incrustable: registrarla en `embeds.ts` y en
  `src/pages/embed/[slug].astro`.
- Glosario en `src/content/glosario/` (se amplía en cada lote de la rutina de artículos).
- `/hoy/` (`src/pages/hoy.astro`): briefing de cada mañana. Se reconstruye con cada edición de `/mercados/`:
  resumen de 30 segundos y "Qué vigilar" sacados del cuerpo de la última edición (`src/lib/briefing.ts`; dependen
  de los títulos de sección fijados en `MERCADOS-PROCEDIMIENTO.md`), datos vivos, reto de 2 minutos
  (`src/config/microretos.ts`, rota por día del año) y término del glosario del día. `public/manifest.webmanifest`
  permite instalarla como app (inicio en `/hoy/`).
- `/plantilla-presupuesto/` (`src/pages/plantilla-presupuesto.astro`): guía con imágenes y vídeos y, al final, la descarga
  de `public/descargas/Plantilla-presupuesto-mensual-WealthUncut.xlsx`. El Excel se genera con
  `scripts/plantilla-presupuesto/crear_plantilla.py` (xlsxwriter; ver su cabecera para regenerarlo con los valores
  calculados por Excel). Las imágenes y los vídeos (`public/plantilla/`) son capturas reales de la plantilla renderizadas
  por Excel; si cambias la plantilla hay que rehacerlos. Origen: plantilla personal de David (en inglés, una sola hoja),
  rehecha en español con movimientos, presupuesto por categorías, regla 50/30/20, vista anual, objetivos y deudas.
- `/plantilla-seguimiento-inversiones/` (`src/pages/plantilla-seguimiento-inversiones.astro`): igual que la de presupuesto, con
  `public/descargas/Plantilla-seguimiento-inversiones-WealthUncut.xlsx`, generada por `scripts/plantilla-inversiones/crear_plantilla.py`.
  Fondos y operaciones de ejemplo ficticios; el impuesto estimado usa precio medio (no FIFO) y remite a la calculadora FIFO.
- `/herramientas/calculadora-cuota-autonomos/`: cuota de autónomos por ingresos reales. Tablas y tipos en `RETA_2026`
  (`finance.ts`, verificados contra el BOE el 2026-10-06); revisar cada enero con la nueva orden de cotización.
- `/herramientas/ayudas-vivienda-jovenes/`: comprobador de ayudas estatales para jóvenes (alquiler, compra en pueblos, opción a
  compra). Cifras en `AYUDAS_VIVIENDA_JOVENES` (`finance.ts`, BOE RD 326/2026, verificadas el 2026-10-06); las convocatorias
  son autonómicas, revisar cuando salgan. El aval ICO solo se enlaza, sin cifras (sin fuente oficial verificada).
- `/herramientas/calculadora-irpf-alquiler/`: IRPF del propietario que alquila vivienda. Reducciones y amortización en `ALQUILER_IRPF`
  (`finance.ts`, AEAT Manual Renta 2025, verificadas el 2026-10-08); revisar cada año con el manual nuevo. Estimación sin deducciones autonómicas.
- Visibilidad (2026-10-08): `/datos/` (CSV y JSON de IRPF, ITP, cuota de autónomos y euríbor, generados desde `finance.ts` por
  `src/lib/datasets.ts`, nunca editar a mano; marcado `Dataset`; CC BY 4.0 salvo el euríbor, que es el valor oficial del BOE y lleva
  `licenciaPropia: false` con su aviso y la marca de EMMI), `/incrustar/` (todas las calculadoras incrustables),
  `/prensa/`, `/llms.txt` y robots `max-image-preview:large`. Al añadir una calculadora incrustable o un dato nuevo, añadirlo ahí.
- `/herramientas/calculadora-indemnizacion-despido/` y `calculadora-factura-autonomo/`: reglas del Estatuto de los Trabajadores (arts. 49.1.c,
  53.1.b, 56.1) y del Reglamento del IRPF (arts. 101 y 110), verificadas en el BOE el 2026-10-08. Las constantes viven en cada componente
  (no hay cifras revisables cada año); si el Gobierno cambia el despido (hay debate abierto), actualizar `TIPOS_EXTINCION`.
- `/herramientas/calculadora-baja-laboral/`: incapacidad temporal (60 % días 4 a 20, 75 % desde el 21, accidente laboral 75 %), reglas en
  `SickLeaveCalculator.tsx` verificadas el 2026-10-08 (Aula de la Seguridad Social y LGSS arts. 171 y 173). Base reguladora estimada con bruto/12.
- Publicidad: AdSense está **preparado y apagado** (`src/config/ads.mjs`, `activo: false`; `AdSlot.astro`, `ads.txt.ts`, CSP condicional).
  Orden de activación, CSP y textos legales en `ADSENSE-PROCEDIMIENTO.md`. No encender sin banner de consentimiento ni sin actualizar
  `cookies.astro` y `privacidad.astro` en el mismo commit.
- `/plantilla-hipoteca/` (`src/pages/plantilla-hipoteca.astro`): cuadro de amortización con revisiones de tipo y entregas extra, generada por
  `scripts/plantilla-hipoteca/crear_plantilla.py` (misma mecánica de caché que las otras plantillas). Datos de ejemplo ficticios; sin seguros ni TAE.
- Pruebas (`npm test`, Node 22.6+, sin dependencias nuevas): `tests/*.test.ts` cubren `finance.ts`, la lógica de las calculadoras nuevas
  (`src/lib/calculos/*.ts`, que los componentes React solo pintan), las protecciones de `/api/*` (`src/lib/api-seguridad.ts`) y `briefing.ts`.
  La acción `.github/workflows/pruebas.yml` las ejecuta con `astro check` y la compilación en cada cambio de código. **Antes de tocar una cifra
  o una fórmula, correr `npm test`; al añadir una calculadora, poner su lógica en `src/lib/calculos/` y una prueba con una cifra comprobada.**
- SEO de contenido (2026-10-19): cada artículo lleva `resumen` (caja "En breve" y `abstract` en el JSON-LD; obligatorio, ver
  `ARTICULOS-PROCEDIMIENTO.md`). Cada tema (`categorias.ts`) tiene `intro` propia. Los enlaces entre artículos y glosario se generan solos
  (`src/lib/glosario-enlaces.ts`: "Términos de este artículo" y "Guías donde se explica"; con pruebas). `/herramientas/` agrupa las calculadoras
  por tema; la portada enlaza a los temas. Las consultas reales de Search Console viven en `KEYWORDS.md`: revisarlas cada mes.
- `/herramientas/calendario-fiscal/` (2026-10-27): calendario por perfil (asalariado, autónomo, inversor) con descarga `.ics`. Las fechas viven en
  `src/lib/calculos/calendario-fiscal.ts` (`EVENTOS_FISCALES`, con fuente y un estado: `oficial` del Calendario del contribuyente 2026 de la AEAT,
  `norma` o `previsto`; las de 2027 son previstas hasta que la AEAT publique su calendario, normalmente a final de año: **sustituirlas por las
  oficiales y actualizar `CALENDARIO_REVISADO`**). Los `.ics` (`/herramientas/calendario-fiscal/<perfil>.ics`) son estáticos, generados en el build
  (`[perfil].ics.ts`), con avisos 7 y 1 días antes; la página oculta las fechas ya pasadas con la fecha del build. Pruebas en
  `tests/calendario-fiscal.test.ts`. Acompaña a la guía `/blog/antes-del-31-de-diciembre-decisiones-fiscales/` (cifras de `finance.ts`; revisar cada diciembre).
- **Escenas 3D, `<Escena3D />`** (2026-10-27, three.js): componente reutilizable `src/components/Escena3D.astro` para artículos MDX
  (`import Escena3D from '../../components/Escena3D.astro';` y `<Escena3D escena="irpf-ahorro" />` o `escena="interes-compuesto"`). Hay solo
  dos escenas a propósito: `irpf-ahorro` (los tramos del IRPF del ahorro como escalones, desde `IRPF_AHORRO_BRACKETS` de `finance.ts`) e
  `interes-compuesto` (aportado e intereses cada 5 años, 150 €/mes, 7 % bruto, TER 0,2 %, los mismos supuestos que el artículo de interés
  compuesto; es un ejemplo, no una previsión). Los datos se calculan en el servidor (`src/lib/calculos/escena3d.ts`, con pruebas en
  `tests/escena3d.test.ts`). El HTML lleva siempre una versión 2D con barras y una tabla (`<details>`); es la que ve quien no tiene JavaScript ni
  WebGL o ha pedido menos movimiento (`prefers-reduced-motion`). Solo cuando la figura entra en pantalla (IntersectionObserver, 200 px de margen)
  y hay WebGL se descarga `src/scripts/escena3d.ts` con three.js (chunk de ~530 KB, 130 KB comprimido, nunca en la carga inicial) y el 3D
  sustituye al 2D dentro de la misma caja de altura fija (CLS 0). Reglas para tocarlo: sin estilos en línea (el canvas se dimensiona con clases de
  Tailwind y `renderer.setSize(w, h, false)`), sin terceros, paleta de la marca, teclado (el canvas recibe foco; flechas giran, `+`/`-` acercan, `Inicio`
  reinicia) y texto alternativo con los datos. Una escena nueva: añadir su tipo en `escena3d.ts` (datos y prueba), su 2D y su tabla en
  `Escena3D.astro` y su dibujo en `src/scripts/escena3d.ts`. Comprobado el 2026-10-27 en Edge con WebGL (sin errores de consola ni de CSP) y con
  movimiento reducido (se queda el 2D y no se descarga three.js).
- **Escenas 3D nuevas** (2026-10-27): además de `irpf-ahorro` e `interes-compuesto` hay `coste-ter` (10.000 € invertidos una vez, 7 % bruto, TER 0,2 %, 1 % y 1,5 % a 10, 20 y 30 años; mismos supuestos y resultados que la tabla del artículo del TER, con prueba) y `cuota-euribor` (hipoteca variable de 150.000 € a 25 años, euríbor + 0,8 con el euríbor oficial de `src/data/euribor/ultimo.json` y -1, +1 y +2 puntos; se actualiza sola cada mes). Comparten el tipo de datos `grupos` (barras agrupadas con `tono`, `leyenda` y `nota`) en `src/lib/calculos/escena3d.ts`. Están en `ter-fondo-que-es` y `hipoteca-fija-variable-o-mixta`.
- **Sistema de movimiento y tarjetas** (2026-10-27): `src/styles/movimiento.css` y `tarjetas.css` (en `@layer components`) y `src/scripts/animaciones.ts`. El script marca solo, sin tocar cada página, los hijos de `<main>` y las tarjetas de `ul.grid` que quedan bajo la primera pantalla (`data-rv`, aparición escalonada con retardo por atributo `data-rv-d`, sin estilos en línea) y quita los atributos al terminar; excluye artículos (`.prose`), lo que ya tiene `.aparece` o `data-escalona` y `data-sin-rv`. `data-barra` dibuja barras (anchos con `claseAnchoBarra`), `data-cuenta` cuenta cifras. Todo desactivado con `prefers-reduced-motion`. Listados de artículos: `TarjetaArticulo`, `ListadoTarjetas` (primero destacado) e `IlustracionTema` (SVG estático por tema de `categorias.ts`; un tema nuevo necesita su dibujo ahí, si no usa el de ahorro). `ArticulosEditorial` (portada y "Lo último") usa las mismas ilustraciones.
- `/empieza-aqui/` (`src/pages/empieza-aqui.astro`): recorrido por objetivos (ahorrar, invertir, impuestos,
  vivienda) con las guías y herramientas en orden. Los pasos son una lista escrita a mano en esa página:
  **al añadir una herramienta o guía importante, añadirla también ahí**. Los artículos programados se
  omiten solos hasta su fecha (igual que en los `relacionados` del glosario).

## Crecimiento y captación automáticos (2026-10-28, sin cuentas ni redes)

- **IndexNow**: `scripts/indexnow.mjs` avisa a Bing y compañía (no a Google) de las URLs nuevas o cambiadas del último commit, solo si están en el sitemap;
  la clave es pública (`public/<clave>.txt`). Los procedimientos de artículos y mercados lo ejecutan tras publicar; los workflows de `.github/` ya avisan
  por su cuenta de artículos programados y mercados. Un fallo no invalida nada (sale con código 0).
- **Enlazado interno**: `scripts/enlaces-internos.mjs` (tras `npm run build`) lee el HTML real y lista páginas con pocos enlaces entrantes o, con
  `--sugerir=<slug>`, a quién enlazar y quién debería enlazar a un artículo nuevo. Solo informa; las rutinas aplican a mano las sugerencias en el cuerpo del MDX.
  Feeds RSS por tema en `/blog/tema/<tema>/rss.xml` (`<link rel="alternate">` en cada página de tema) y `/llms.txt` agrupado por tema.
- **Bloques de captación contextuales** (`src/config/cta.mjs`, un recurso por tema): bloque central en cada artículo (`SeccionH2.astro` + `BloqueCtaMedio.astro`,
  delante del `##` del medio; HTML estático, CLS 0) con tres variantes (herramienta, plantilla o calendario, newsletter) y titular del formulario final
  (`NewsletterSignup.astro`, genérico o por tema). La variante sale de `variantePara(slug, fecha)` y **rota cada semana ISO** sola con el build diario.
  Un tema nuevo en `categorias.ts` necesita su entrada en `CTA_POR_TEMA` (lo comprueba `tests/cta.test.ts`).
- **Medición propia sin cookies** (`src/scripts/medicion.ts`, `src/lib/medicion.ts`, `/api/medir`): solo contadores agregados por día en el KV
  (`medicion:AAAA-MM-DD`: evento, posición, variante y tema; tope de 300 eventos/día (el KV gratuito admite 1.000 escrituras al día y lo comparten el buzón y la newsletter; sin límite por IP); sin IP, sin identificador). Respeta DNT y Global Privacy Control.
  Informe semanal sin IA: `scripts/informe-conversion.mjs`, lanzado los lunes por la tarea `wu-conversion-informe` del Control Center, que lo deja en
  `work/wealthuncut/crecimiento/informes/`. **Antes de que haya tráfico significativo, añadir a `privacidad.astro` una frase sobre estos contadores anónimos (David decide; las páginas legales no se han tocado).**
- Plan de consultas de cola larga: `work/wealthuncut/crecimiento/plan.md` (Control Center); sus 10 mejores temas están en `KEYWORDS.md` («Cola de temas prioritarios») y la rutina de artículos los toma primero.

## Correcciones públicas (decisión de David, 2026-09-25)

`/correcciones/` es el registro público de errores encontrados y arreglados en contenido ya
publicado, para reforzar la promesa de cero errores con transparencia en vez de fingir que nunca
falla nada. Vive como content collection en `src/content/correcciones/` (`correccion` en
`content.config.ts`: `fecha`, `pieza`, `url`, `resumen`, más el cuerpo del archivo con el detalle).
Está vacía a propósito hasta que haga falta la primera entrada; no crear una de ejemplo. Se
diferencia de las actualizaciones rutinarias de `/mercados/` o de los comparadores de cuentas/
fondos (que cambian porque el dato real ha cambiado, no porque algo estuviera mal escrito): aquí
solo va lo que estaba mal cuando se publicó. Enlazada desde el footer y desde "Correcciones y
actualizaciones" en `metodologia.astro`.

## Estructura actual

- `src/config/site.ts`: metadatos del sitio y del autor.
- `src/config/afiliados.ts` + `src/components/AfiliadoCTA.astro`: enlaces de afiliado. Con `url: null` no se
  muestra nada; al poner el enlace del programa aparece el botón (rel="sponsored nofollow") y se activa el
  aviso de `ArticleMeta` vía `hayAfiliado()`. Hoy solo cableado en `/carteras/`; no hay ningún programa aún.
- `src/config/finance.ts`: cifras fiscales VERIFICAR (tramos del ahorro, retención, compensación,
  regla de recompra, modelo 720, FGD) y lógica de cálculo del IRPF del ahorro. Los artículos
  importan estas constantes en MDX en vez de escribir las cifras a mano.
- `src/content.config.ts` + `src/content/blog/`: artículos en MDX.
- `src/content/mercados/AAAA-MM-DD.mdx`: ediciones diarias de mercados; `src/data/mercados/` (carpeta
  nueva): datos oficiales del BCE de cada día, generados por `scripts/datos-mercados.mjs` (carpeta
  nueva); `MarketSnapshot.astro` y `MarketChart.astro` (gráficas SVG sin librerías) los muestran.
- `src/lib/posts.ts` (carpeta nueva): `isPublished()`, única regla de qué artículo está publicado
  (no borrador y `pubDate` ya alcanzada). Un artículo con `pubDate` futura queda programado.
- `.github/workflows/publicacion-programada.yml`: todos los días a las 05:00 UTC, si
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
  `src/layouts/ToolLayout.astro`, que acepta un prop `faqs` (pregunta/respuesta en texto plano,
  sin HTML) para generar el FAQPage JSON-LD a partir de las mismas preguntas frecuentes que ya
  llevan escritas en el slot: toda herramienta nueva con sección de preguntas frecuentes debe
  pasar también ese prop, con el mismo texto (sin enlaces) que la versión visible. Piezas
  visuales comunes en `src/components/CalculatorUI.tsx`.
  El listado (índice, portada) sale de `src/config/tools.ts`: una herramienta nueva se añade ahí.
  Todas leen las cifras fiscales de `finance.ts` (tramos IRPF estatal y autonómico de las 15 CCAA
  de régimen común + Ceuta/Melilla, cotizaciones SS, ITP por comunidad, límites de plan de
  pensiones). Los dos comparadores con datos comerciales (`CuentasRemuneradasTabla.astro`,
  `FondosIndexadosTabla.astro`) son componentes Astro sin interactividad que leen directamente
  `src/data/cuentas-remuneradas/ultimo.json` y `src/data/fondos-indexados/ultimo.json` (ver
  sección de arriba).
- Frescura de "Los datos de hoy" (2026-10-26, sin IA): `src/lib/frescura.ts` tiene los umbrales (BCE y euro/dólar: aviso
  con 2 días hábiles TARGET sin dato nuevo y error con 3; cuentas: 8 y 10 días; euríbor: desde el día 4 debe estar el
  mes anterior). `scripts/comprobar-frescura.mjs` lo compara cada noche con la API del BCE, el BOE y la portada en
  producción (se lanza a mano con `node scripts/comprobar-frescura.mjs --sin-rama`; la tarea diaria local `wu-frescura`
  del Control Center aún no está registrada: la registra David, no usa IA) y, si
  el BCE o el BOE tienen un dato más nuevo, deja el arreglo en una rama local `auto/frescura-AAAA-MM-DD` sin publicar.
  `tests/frescura.test.ts` y el build (`[frescura]` en la salida) avisan, pero no fallan por un dato atrasado.
- `src/data/euribor/ultimo.json`, generado por `scripts/datos-euribor.mjs` desde los datos abiertos del BOE
  (resolución mensual del Banco de España; cada mes lleva su `BOE-A-...`, desde 2021-01). Decisión de David
  (2026-10-26): sin licencia de EMMI, así que **solo el valor oficial publicado en el BOE**, nunca la serie del
  BCE ni de EMMI, y nunca bajo CC BY. Euribor® es marca de EMMI: citarlo así donde se muestre el histórico.
- `src/pages/`: home, blog, autor, metodología, transparencia, legales, sugerencias (+ API con
  KV), RSS, 404.
- `public/`: favicon propio, `og-default.png`, `_headers` (cabeceras de seguridad), robots.txt.
- `KEYWORDS.md`: mapa de clusters y keywords, validado con autocompletado de Google, con el
  artículo que cubre cada keyword.
- Ojo con Astro: comprime el salto de línea entre texto y un `<a>` en la línea siguiente y se
  pierde el espacio. Terminar la línea anterior con `{' '}`.
