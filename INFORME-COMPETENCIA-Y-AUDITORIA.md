# Informe de competencia, SEO y auditoría técnica de WealthUncut

Fecha: 2026-10-06. Autor: Claude. Documento interno (no se publica en la web).

Método: búsquedas reales de los términos clave y lectura página a página de los competidores que
posicionan hoy; autocompletado de Google España (~2.600 sugerencias, ver `KEYWORDS.md`); Lighthouse
sobre producción; revisión de las 87 páginas indexables compiladas (metadatos, JSON-LD, enlaces,
accesibilidad); comprobación de 125 enlaces externos; revisión del código (frontend, API, workflows,
dependencias, `astro check`); verificación comunidad por comunidad de los tipos del ITP contra fuentes
2026. Lo que **ya he arreglado** durante la auditoría está marcado con ✅.

---

## 1. Resumen ejecutivo

**Lo más importante, por orden de impacto:**

1. **El dominio parece no estar indexado (o casi).** Búsquedas de `wealthuncut.com` y `site:wealthuncut.com`
   no devuelven nada del sitio. Con el motor que tengo no es concluyente, pero encaja con un dominio de
   semanas. Sin Google Search Console y sin Bing Webmaster Tools no hay forma de saberlo ni de pedir la
   indexación. **Es lo primero que hay que hacer** (acciones de David, sección 8).
2. **Error de datos encontrado y corregido ✅:** 4 de las 19 filas de la tabla del ITP estaban mal (Cataluña,
   Castilla y León, Murcia, País Vasco) y dos páginas tenían un texto con una cifra errónea. Es justo la
   promesa de "cero errores" del sitio. Registrado en `/correcciones/` y en `finance.ts`.
3. **Cloudflare no redirige HTTP a HTTPS y `www.wealthuncut.com` no existe.** `http://wealthuncut.com/`
   responde 200 sin redirigir; `www.` ni resuelve. Dos ajustes de panel (sección 8).
4. **La competencia fuerte (Taxdown, HelpMyCash, Rankia, Finect) tiene 3-5 veces más texto, más fuentes y
   marca.** No se les gana con volumen, se les gana con **herramientas que ellos no tienen** y con datos
   propios. Hay 12 herramientas con demanda confirmada que aún no existen aquí (sección 4).
5. **Sin señales de entidad (E-E-A-T) externas:** Twitter y LinkedIn vacíos (`site.ts`, `TODO`), sin foto de
   autor, ninguna imagen en todo el sitio, sin `sameAs`. Google y los buscadores de IA verifican personas.
6. **Técnicamente el sitio está muy bien:** Lighthouse 91-96 / 100 / 92 / 100 (rendimiento, accesibilidad,
   buenas prácticas, SEO), CLS 0, JSON-LD completo y válido (0 errores en 87 páginas), 0 errores de TypeScript
   ✅, 0 vulnerabilidades ✅.

---

## 2. Estado actual del sitio (medido)

| Métrica | Valor |
|---|---|
| Páginas indexables | 87 (+ 12 embeds `noindex`) |
| Guías publicadas / programadas | 11 / 16 (hasta el 8 de noviembre) |
| Herramientas | 19 (incluye Carteras) |
| Términos de glosario | 32 |
| Lighthouse móvil (producción) | rendimiento 91-96, accesibilidad 100, buenas prácticas 92, SEO 100 |
| LCP / CLS / TBT | 2,6-3,3 s / 0 / 0-90 ms |
| Peso por página | 185-280 KB (casi todo fuentes) |
| JavaScript compartido | `client.js` 213 KB (66 KB gzip) + 3-16 KB por herramienta |
| JSON-LD | Organization, Person, WebSite, Article/NewsArticle, BreadcrumbList, FAQPage (17), WebApplication (18), ItemList, DefinedTermSet: 0 errores |
| Palabras por página (principales) | guías 1.500-2.200; herramientas 800-1.400 |
| Enlaces externos | 125; 0 rotos tras la limpieza ✅ (16 fallaban al empezar, 9 eran enlaces muertos reales) |
| Imágenes | 0 (solo OG por defecto 1200×630) |
| Páginas huérfanas | 0 (todas reciben enlaces desde el contenido) |

---

## 3. La competencia, por clúster

Lo que sigue sale de leer las páginas que hoy ocupan los primeros resultados para tus búsquedas centrales.

### 3.1 Quién compite

| Competidor | Dónde gana | Cómo monetiza |
|---|---|---|
| **Taxdown** | Calculadora de sueldo neto: 3.500-4.000 palabras, 9 entradas (edad, hijos, discapacidad, contrato, pagas), 18 fuentes oficiales, FAQPage + Article, actualizada a diario | Suscripciones propias (35-65 €/año) |
| **HelpMyCash** | Cuentas remuneradas: 17 productos con TAE, saldo máximo, nómina, valoraciones de apps, sección "Integridad editorial" y "¿Por qué es gratis?", asistente de IA, botones con tracking | Afiliación (botones "Solicitar") |
| **Rankia** | Guías largas (4.500-5.000 palabras) de fondos indexados con tabla fondo vs ETF, test "¿con cuánto llegarías a los 65?", comunidad y foros enormes | Afiliación (MyInvestor, Indexa) |
| **Finect** | Comparador de cuentas con veredicto editorial, pros y contras, simulación con 20.000 €, "novedades" mensuales, fechas de revisión visibles, carteras y comunidad | Afiliación y patrocinios |
| **Fondosindexados.net** | Nicho: ~900 palabras, calculadora de interés compuesto, 15 enlaces internos, comparativas MSCI World / S&P 500 | Afiliación |
| **Bankinter, BBVA, Openbank, Mercado Pago** | Guías de marca (autoridad del dominio) | Producto propio |
| **Javi Linares, Financer, Bolsamanía, Morningstar, El Club de Inversión** | Autoridad personal y larga cola | Libros, afiliación, publicidad |
| **OIE, Turnozo, HacerCuentas, NettoCalc, Billeo** | Calculadoras de sueldo/IRPF (muchas, y pequeñas) | Publicidad |

### 3.2 Qué hacen mejor que tú (hoy)

- **Profundidad y cobertura por página:** 3.500-5.000 palabras en los términos de cabecera, con tabla de contenidos y 9-11 FAQ.
- **Fuentes visibles:** Taxdown cita 18; tus guías citan 2-5.
- **Autoridad de dominio y enlaces:** años de antigüedad, miles de enlaces. Es lo que más pesa y lo que no se compra con contenido.
- **Señales de confianza:** equipos con nombre, "integridad editorial", premios, comunidades, apps.
- **Frescura visible:** "Actualizado 6/10/2026" en cada página y mes a mes.
- **Interactividad:** simuladores de carteras (Finect MyPortfolio), tests (Rankia), asistentes de IA (HelpMyCash).
- **Variables de entrada:** su calculadora de sueldo pide edad, hijos, discapacidad, contrato y pagas; la tuya no.

### 3.3 Qué haces mejor que ellos (tu ventaja real)

- **Hay pocas calculadoras de inversión con fiscalidad española completa.** HelpMyCash no tiene calculadora fiscal de fondos ("no hay calculadora propia", comprobado en su página); Fondosindexados.net no tiene "simuladores tributarios ni comparadores de costes fiscales". Tu calculadora de venta de fondos con FIFO, la de fondo indexado vs ETF, plan de pensiones vs fondo, dividendos y Carteras no tienen equivalente directo.
- **Honestidad verificable:** `/correcciones/`, fecha y fuente de cada cifra, "sin ranking pagado". Es diferenciador de marca cuando todos los comparadores son afiliados.
- **Cero ruido comercial** (todavía), buena velocidad y accesibilidad, que Google premia.
- **Herramientas encadenadas**: de la nómina al ahorro, a la inversión, a los impuestos y a la vivienda, con "Empieza aquí".
- **Datos propios actualizados por rutina** (cuentas, fondos, euríbor, mercados): ningún competidor pequeño lo hace.

### 3.4 Dónde son vulnerables (tus oportunidades de ganar posiciones)

| Búsqueda | Líder hoy | Su punto débil | Tu jugada |
|---|---|---|---|
| calculadora sueldo neto 2026 | Taxdown | Quiere venderte su servicio; poco rigor sobre retención vs impuesto real | Añadir las variables que faltan (sección 4) y explicar retención vs IRPF real con ejemplos |
| qué es un fondo indexado | Rankia, BBVA, Openbank | Texto largo, genérico, con CTA a un broker | Mantener tu enfoque con datos (SPIVA) y añadir la calculadora dentro de la guía |
| cómo tributan fondos | HelpMyCash, Rankia | Sin calculadora; ejemplos de 5.000 € | Tu calculadora con FIFO ya lo supera: **subir la página de la herramienta en el contenido** |
| mejores cuentas remuneradas | Finect, HelpMyCash | Todo es afiliado; datos que cambian cada semana | Tu comparador sin ranking pagado, con histórico de TAE (ya lo tienes) |
| impuesto dividendos | Rankia, Finect | Artículos largos sin calculadora | Tu calculadora de dividendos con doble imposición |
| ITP por comunidades | Gibobs, Hipotecas.me, Idealista | Tablas con errores (comprobado: Gibobs publica Galicia y Valencia al 10 %, mal) | Tu tabla corregida, con fuente, fecha y simulación |
| calculadora interés compuesto | Fondosindexados.net, Javi Linares | Herramientas simples | **Falta página dedicada** (sección 4) |

---

## 4. Qué añadir: backlog priorizado

Cada línea trae la evidencia de demanda (autocompletado de Google España, orden = popularidad).

### 4.1 Herramientas nuevas (alta prioridad)

| # | Herramienta | Evidencia | Datos que requiere | Esfuerzo |
|---|---|---|---|---|
| 1 | **Calculadora de interés compuesto** (página propia, no solo artículo) | "interés compuesto calculadora" es la 2ª sugerencia de "interes compuesto"; 10 variantes | Ninguno (fórmula) | Bajo |
| 2 | **Calculadora de independencia financiera / FIRE** | "calculadora independencia financiera" con "dividendos", "Javi Linares" | Ninguno (regla del 4 % como supuesto editable) | Medio |
| 3 | **Calculadora de finiquito** | 10 variantes, "baja voluntaria 2026", "fin de contrato" | Estatuto de los Trabajadores (vacaciones, prorrata pagas) | Medio |
| 4 | **Calculadora de paro (prestación por desempleo)** | "calculadora paro 2026", "SEPE", "neto" | Base reguladora, topes y escala del SEPE 2026 (verificar en SEPE/BOE) | Medio-alto |
| 5 | **Cuota de autónomos 2026** | "calculadora cuota autonomos 2026" | Tabla por rendimientos netos (BOE, verificar) | Medio |
| 6 | **Calculadora de despido / indemnización** | "improcedente", "CGPJ" | 33 días/año, 45 días antes de 2012 (BOE) | Medio |
| 7 | **Plusvalía municipal** | "madrid", "barcelona", "alicante": búsqueda muy local | Coeficientes por ayuntamiento: no escalable; hacerla como guía + método general | Alto |
| 8 | **Calculadora de préstamos / TAE** | "calculadora prestamo", "calculadora tae" | Ninguno | Bajo |
| 9 | **Jubilación / pensión estimada** | "calculadora jubilación" | Reglas de la Seguridad Social (verificar) | Alto |
| 10 | **IRPF de la renta** (estimación de la declaración) | "calculadora irpf renta 2025/2026" | Ya tienes escalas, faltan deducciones | Alto |
| 11 | **Bruto a neto de autónomo** | "calculadora bruto neto autonomo" | Cuota + IRPF módulos/estimación directa | Medio |
| 12 | **Test de perfil: "¿con cuánto llegarías a los 65?"** | Lo usa Rankia como gancho | Ninguno (usa interés compuesto) | Medio |

Orden sugerido para empezar: **1, 8, 2** (sin datos que caduquen) y después **3, 5, 6** (relevantes para jóvenes que empiezan a trabajar, con cifras legales verificables).

### 4.2 Mejoras a lo que ya existe

1. **Calculadora de sueldo neto:** añadir pagas (12/14), edad, hijos, discapacidad y tipo de contrato; mostrar el reparto en un gráfico. Es tu página de mayor volumen potencial y Taxdown pide 9 entradas.
2. **Carteras:** guardar carteras (en la URL ya se puede), mostrar rentabilidad histórica año a año por fondo, añadir correlación entre dos fondos y el coste anual en euros. Añadir TER real de los fondos de MyInvestor (hoy solo 10 con TER).
3. **Comparador de cuentas remuneradas:** filtros (con/sin nómina, saldo máximo) y botón "avísame cuando cambie" ligado al boletín. Hoy es una tabla fija.
4. **Fondo de emergencia, inflación, 720:** añadir ejemplos por perfil y "qué hacer después" enlazando a la siguiente herramienta.
5. **Más fuentes por página:** pasar de 2-5 a 8-15 en las guías de cabecera (Taxdown cita 18). Cada cifra con su enlace oficial.
6. **Tabla de contenidos** al inicio de las guías largas (estructura que Google usa para enlaces de salto y que HelpMyCash/Rankia tienen).
7. **Un resumen de 3 líneas arriba** ("respuesta directa") en cada guía, para ganar el fragmento destacado y las citas de IA.
8. **Gráficos propios** (SVG sin librerías, como ya haces en mercados) en cada guía: hoy hay 0 imágenes; mejora engagement y permite imágenes OG específicas.

### 4.3 Contenido (guías) que aún falta

Ya programadas hasta el 8 de noviembre: invertir 100 €/mes, tramos del ahorro, gastos de compra, amortizar o invertir, S&P 500 vs MSCI World, plan de pensiones. Siguen sin cubrir:

- **Campaña de la renta** (abril-junio, el pico de tráfico del año): cómo declarar fondos, ETF, dividendos, criptomonedas ("como declarar criptomonedas" es sugerencia de primer nivel, y cripto no tiene contenido aquí), deducciones por comunidad ("deducciones renta 2025 madrid/andalucía"). **Publicar en febrero-marzo** para que tenga tiempo de posicionar.
- **Marca y producto con intención alta** (esperan a la afiliación): "myinvestor opiniones", "indexa capital opiniones", "trade republic opiniones", "como abrir cuenta myinvestor", "mejores brokers españa". Son las que más convierten; hay que escribirlas con el sistema de transparencia ya montado.
- **Cuenta bancaria por edad** ("cuenta para jóvenes de 16/17/18 años"): ya validado en `KEYWORDS.md`.
- **Cómo funciona un robo-advisor frente a carteras propias** (Indexa, Finizens): comparativa sin recomendar.
- **ETF por tema** (MSCI World ETF, S&P 500 ETF): "mejores etf msci world".

### 4.4 Estrategia de enlaces (la gran palanca que falta)

El contenido no basta sin enlaces entrantes. Con un dominio nuevo:

1. **Las calculadoras incrustables** (`/embed/`) ya son un gancho de enlaces: ofrécelas a blogs de finanzas y a universidades (el código ya incluye atribución).
2. **Datos propios citables:** el ranking de IRPF por comunidad y la tabla de ITP son piezas de prensa regional ("Dónde pagas menos IRPF"). Enviar un resumen a medios regionales y a Maldita/Newtral no hace falta: sí a periodistas económicos.
3. **Foros y comunidades** (Rankia, Reddit, Finect, ForoCoches): ya tienes el kit en `PROMOCION.md`.
4. **Digital PR de bajo coste:** HARO/Qwoted/SOS en español, entrevistas, podcasts de finanzas.
5. **Directorios:** Google Business no aplica; sí listas de recursos de educación financiera (CNMV tiene un portal para inversores).

---

## 5. Auditoría del frontend

### 5.1 Ya está bien

- Accesibilidad 100 en todas las páginas medidas; enlace de salto, `main`, jerarquía H1/H2, etiquetas en formularios.
- Cero desplazamiento de maquetación (fuentes con `font-display: optional` y precarga).
- CSP estricta con hashes por página, sin `unsafe-inline`; 22 páginas probadas a 375 px sin desborde horizontal.
- URL como estado (`useEstadoUrl`): los resultados se comparten con un enlace.
- Estructura semántica, `lang="es"`, canonical, Open Graph y Twitter Card en todas las páginas (0 faltas).

### 5.2 Hallazgos y qué hacer

| # | Hallazgo | Gravedad | Estado |
|---|---|---|---|
| F1 | 4 errores de TypeScript (`astro check`): 3 en `buscar.astro` (conflicto de tipos de `@cloudflare/workers-types` con `Element.append`) y 1 en `carteras.astro` (años de rentabilidad `undefined` en el JSON) | Media (rompería un chequeo en CI) | ✅ Corregido: `appendChild` y normalización de datos |
| F2 | 0 imágenes en todo el sitio: sin foto de autor, sin gráficos, una sola imagen OG para las 87 páginas | Media (E-E-A-T, CTR en redes y Discover) | Pendiente: foto del autor + OG por herramienta (requiere generar imágenes; con SVG propio es posible sin dependencias) |
| F3 | Fuentes: ~100 KB de Inter (4 pesos) + Fraunces cursiva (3 ficheros, 175 KB en `dist` aunque solo se descarga lo que se usa). El peso por página es casi todo fuentes | Baja | Opcional: usar Inter variable (1 fichero) y revisar si la cursiva de Fraunces se usa de verdad |
| F4 | React completo (213 KB, 66 KB gzip) cargado en cada herramienta con `client:load`. Es la causa de que las herramientas rindan 91-92 en vez de 96 | Baja-media | Opcional: pasar a Preact (compat. React, ~4 KB) cortaría ~60 KB gzip; solo vale la pena si se llega a muchas herramientas |
| F5 | Sin tabla de contenidos ni "respuesta directa" al inicio en las guías largas | Media (SEO) | Pendiente (sección 4.2) |
| F6 | `/buscar/`: ahora fuera del sitemap y `noindex` (correcto), pero no figura en la cabecera | Baja | Opcional |
| F7 | Sin favicon PNG de 192/512 ni `manifest.webmanifest` | Muy baja | Opcional |
| F8 | El menú tiene 5 elementos; "Empieza aquí" solo está en pie y portada | Baja | Valorar subirlo al menú si se ve poco |
| F9 | Los componentes de herramientas repiten patrones (estado en URL, resultados) en 19 ficheros | Mantenimiento | Aceptable; si crecen a 30+ conviene un componente base |
| F10 | El 307 (en vez de 301) de `/ruta` a `/ruta/` lo hace Cloudflare Workers; no afecta porque los enlaces internos llevan barra | Muy baja | Sin acción |

---

## 6. Auditoría del backend e infraestructura

### 6.1 Ya está bien

- Cabeceras de seguridad completas (HSTS, nosniff, Referrer-Policy, Permissions-Policy, COOP/CORP, X-Frame-Options) y caché inmutable para `/_astro/`.
- API con honeypot, límite por IP y hora, tamaño máximo, validación de longitud y de correo, y claves en KV sin endpoint de lectura.
- Rutinas en la nube para mantener datos, seguridad de dependencias y salud del sitio.
- `robots.txt` correcto, `sitemap-index.xml` válido, IndexNow automático al publicar (clave verificada).

### 6.2 Hallazgos

| # | Hallazgo | Gravedad | Estado / acción |
|---|---|---|---|
| B1 | **`http://wealthuncut.com/` responde 200 sin redirigir a HTTPS** | Media (contenido duplicado, seguridad) | **David (panel Cloudflare):** SSL/TLS > Edge Certificates > "Always Use HTTPS" activado |
| B2 | **`www.wealthuncut.com` no resuelve** | Media (quien escriba www no entra) | **David:** DNS: CNAME `www` apuntando a `wealthuncut.com` (con proxy) + regla de redirección 301 `www` → raíz |
| B3 | **Sin doble confirmación (double opt-in) en el boletín.** Cualquiera puede suscribir cualquier correo. Cuando se empiece a enviar emails, es un riesgo legal (RGPD/LSSI) y de reputación (spam, bajas) | **Alta cuando se active el envío** | Antes de enviar el primer correo: confirmación por enlace. Cloudflare Email Service permite enviarlo |
| B4 | Las API no comprobaban `Origin`: un formulario de otra web podía suscribir un correo (el servidor leía JSON aunque llegara como `text/plain`) | Baja-media | ✅ Corregido: `src/lib/api-seguridad.ts` exige `Content-Type: application/json` (415) y rechaza `Origin` ajeno (403) antes de tocar el KV. Probado en local |
| B5 | Límite de peticiones en KV: cada llamada hace una escritura (el plan gratuito de KV tiene un tope diario de escrituras). Un ataque lento podría agotarlo y romper los formularios | Baja | Mejor una regla de **Rate Limiting de Cloudflare** (WAF) sobre `/api/*`, que no consume KV; o Turnstile |
| B6 | Las sugerencias solo se leen entrando al panel de Cloudflare: no hay aviso cuando llega una | Usabilidad | Enviar un correo a David al recibir una (Email Routing + Worker) |
| B7 | `publicacion-programada.yml` hacía `git push` sin `pull --rebase`: si una rutina empujaba justo antes, el commit vacío fallaba y el artículo no se publicaba ese día | Media | ✅ Corregido: `git pull --rebase origin main` antes del `push` |
| B8 | La hora del flujo de publicación es 05:00 UTC; el workflow compara con la fecha UTC | Baja | Correcto hoy; documentarlo |
| B9 | Los dos workflows usan `actions/checkout@v4` (aviso de Node 20 obsoleto de GitHub) | Muy baja | Subir a la versión vigente cuando GitHub lo exija |
| B10 | `npm audit`: 1 vulnerabilidad alta (`source-map-js`, DoS al compilar) | Baja (solo desarrollo) | ✅ Corregida con `npm audit fix` (0 vulnerabilidades) |
| B11 | Astro y `@cloudflare/workers-types` tienen actualización menor disponible; TypeScript 7 disponible | Muy baja | La rutina semanal de dependencias lo cubre; no subir TS a 7 sin probar |
| B12 | No hay `security.txt` | Muy baja | ✅ Añadido en `/.well-known/security.txt` |
| B13 | Sitemap: solo 18 de 85 URLs tenían `lastmod` | Baja | ✅ Ahora 35 (se añaden las herramientas con su fecha) |
| B14 | No hay verificación de Google Search Console ni de Bing en el HTML | Alta (para medir y pedir indexación) | **David** (sección 8); después se añade la etiqueta o el fichero |

### 6.3 Calidad de datos

- ✅ **ITP:** corregidas Cataluña (tramos desde 600.000 €), Castilla y León (10 % desde 250.000 €), Murcia (7,75 %) y País Vasco (4 %). Las otras 13 comunidades y Ceuta/Melilla verificadas. Lección: un agregador (Gibobs) publica Galicia y Valencia al 10 %, que es incorrecto; **no fiarse de un solo comparador**. El ITP se revisa ahora cada año en la rutina fiscal.
- ✅ **Fuentes caídas:** Hipotips (404), Rankia cuentas (410), cuatro páginas de "euríbor hoy" de Rankia y un directo de Expansión (404/410) retirados o sustituidos. Se ha añadido `scripts/comprobar-enlaces.mjs` y la regla en `MERCADOS-PROCEDIMIENTO.md` para no enlazar páginas efímeras.
- **IRPF autonómico:** las escalas salen del Manual de Renta **2025** de la AEAT y el título de la calculadora dice "2026" porque las cotizaciones son de 2026. Es defendible, pero conviene que la propia página diga "IRPF: escalas del ejercicio 2025; Seguridad Social: 2026". Hay que reverificar cuando la AEAT publique el manual 2026 (la rutina de febrero lo cubre).
- **Contraste de mi cálculo con la calculadora de Taxdown:** el sueldo neto para 25.000 € brutos (Madrid, soltero) es 18.280 € en tu herramienta; mi cálculo manual con la escala y el mínimo personal sale en 18.260 €, cuadra. Las calculadoras que dan más neto suelen usar la retención de nómina, no el impuesto real: tu página lo explica.

---

## 7. Cómo posicionar primero: estrategia

La ventaja se construye en este orden:

1. **Indexación y medición** (semana 1): Search Console + Bing Webmaster, sitemaps enviados, comprobar cobertura.
2. **Una herramienta ganadora por clúster, no 100 guías.** Cada clúster necesita una herramienta que no tenga el competidor y una guía que la explique.
3. **Contenido que gane el fragmento destacado:** respuesta directa de 40-60 palabras bajo cada H1/H2 de pregunta, tablas, listas numeradas.
4. **E-E-A-T real:** página del autor con foto, trayectoria, perfil de LinkedIn y enlaces; revisión de cada guía; método ("Cómo trabajamos") y correcciones públicas (ya tienes lo más raro).
5. **Enlaces:** embeds, datos citables, PR digital, foros (sección 4.4).
6. **Frescura:** "Actualizado" visible, rutinas ya montadas, actualizaciones mensuales de las guías de cabecera.
7. **GEO (buscadores de IA):** tus páginas ya tienen estructura clara y cifras citables; añade `Person.sameAs`, datos propios y fecha. `llms.txt` es opcional y Google lo ignora.
8. **Después, monetización:** afiliación primero (sin tocar la neutralidad: declarada ya), email después, AdSense al final.

---

## 8. Lo que solo puedes hacer tú (checklist)

**Esta semana (impacto alto, 30 minutos):**
- [ ] Crear cuenta en **Google Search Console**, añadir `wealthuncut.com` como propiedad de dominio (verificación por DNS en Cloudflare) y enviar `https://wealthuncut.com/sitemap-index.xml`.
- [ ] Crear **Bing Webmaster Tools** (importa desde Search Console) para IndexNow y para los buscadores de IA que usan Bing.
- [ ] Cloudflare: activar **Always Use HTTPS** (SSL/TLS > Edge Certificates).
- [ ] Cloudflare: añadir **CNAME `www`** y redirección 301 de `www` a la raíz.
- [ ] Cloudflare: crear una **regla de Rate Limiting** para `/api/*` (p. ej. 20 peticiones por minuto por IP).

**Próximas semanas:**
- [ ] Rellenar Twitter/X y LinkedIn en `src/config/site.ts` (hoy vacíos) y crear los perfiles si no existen.
- [ ] Una foto de autor (o ilustración) para la página `/autor/`.
- [ ] Dirección para el aviso legal (LSSI, art. 10): oficina virtual o coworking.
- [ ] Solicitar programas de afiliación (MyInvestor, Indexa, Trade Republic, bancos de cuentas remuneradas) y proveedor de email marketing.
- [ ] Decidir si quieres que desarrolle las herramientas 1-3 de la sección 4.1 (no necesitan datos externos).

---

## 9. Plan sugerido

| Plazo | Objetivo | Acciones |
|---|---|---|
| **0-7 días** | Que Google nos vea | Search Console, Bing, HTTPS, www; nada más que las acciones de la sección 8 |
| **Semanas 2-4** | Ganar la cabecera de 3 búsquedas | Calculadora de interés compuesto, de préstamos/TAE y FIRE; ampliar sueldo neto con las variables de Taxdown; tabla de contenidos y respuesta directa en las 12 guías más importantes |
| **Mes 2** | Entidad y enlaces | Perfiles sociales, foto de autor, `sameAs`; 3 envíos de datos a medios (ranking IRPF, ITP, dividendos); embeds a 10 blogs |
| **Mes 3** | Intención comercial | Afiliación activa, guías "opiniones" y "cómo abrir cuenta", doble opt-in y primer boletín |
| **Enero-marzo** | Campaña de la renta | Guías de cripto, ETF, fondos y dividendos en la renta; calculadora de IRPF de la declaración |
| **Abril-junio** | Cosechar | Actualizar todas las guías fiscales con los nuevos manuales de la AEAT; reverificar `finance.ts` entero |

---

## 10. Cambios aplicados durante esta auditoría

- Corrección del ITP (4 comunidades), fuentes sustituidas y nota en `/correcciones/` (`finance.ts`, 3 guías, 2 herramientas).
- 4 errores de TypeScript corregidos (`buscar.astro`, `carteras.astro`).
- Enlaces rotos de fuentes retirados (`mercados`, comparador de cuentas) y comprobador de enlaces externos (`scripts/comprobar-enlaces.mjs`), añadido a la rutina de salud del sitio.
- `npm audit fix` (0 vulnerabilidades).
- Filtro de origen y tipo en las tres API (B4) y `pull --rebase` en el flujo de publicación (B7).
- `security.txt`; sitemap con `lastmod` para herramientas; fechas de actualización en las dos herramientas corregidas.
- Procedimientos actualizados: `MERCADOS-PROCEDIMIENTO.md` (no enlazar páginas efímeras), `MANTENIMIENTO-PROCEDIMIENTO.md` (enlaces externos e ITP).
