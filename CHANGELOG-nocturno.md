# Changelog nocturno (noche del 22 al 23 de septiembre de 2026)

Trabajo hecho sin supervisión según el alcance acordado: ampliar borradores, SEO técnico, SEO de
contenido y arreglos generales. Nada de monetización (solo la checklist del final). Cada bloque
tiene su propio commit; `git log` muestra el detalle.

## Resumen rápido

- **Arreglado en producción**: 3 enlaces que daban 404, espacios que faltaban entre texto y
  enlaces (el pie de página decía "Consulta lametodología"), redirecciones 307 en el menú, favicon
  de Astro en vez del tuyo, y la portada mostraba una cifra de rentabilidad sin decir sus supuestos.
- **Cifra fiscal corregida**: el último tramo del IRPF del ahorro es 30% desde 2025, no 28%.
  Comprobado en el Manual de Renta 2025 de la AEAT. Sigue marcado VERIFICAR para que lo confirmes.
- **8 borradores ampliados** de 474-622 palabras a 1.261-1.796, con datos oficiales nuevos (INE,
  SPIVA, MSCI, AEAT, CNMV) y cifras calculadas con script. Siguen como borrador: publicarlos es
  decisión tuya.
- **SEO técnico**: imagen para redes, JSON-LD enlazado, sitemap con fechas, títulos ≤60 caracteres,
  descripciones ≤160, cabeceras de seguridad, fuente más ligera, enlazado interno automático.
- **Cumplimiento**: la política de privacidad ahora menciona el buzón de sugerencias (antes no), el
  formulario da la información básica del RGPD y tiene protección anti-spam.
- Todo compila (`npm run build` y `npm run check` sin errores), 0 enlaces internos rotos en 223
  comprobados, y cada bloque se ha verificado en producción tras el despliegue.
- **Lo primero que tienes que hacer tú** está en "Pendiente de David", ordenado por prioridad.

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

## 3. Los 8 borradores, ampliados

Todos siguen en `draft: true`: **publicar es decisión tuya** (cambiar a `draft: false` y hacer
push). Los enlaces entre ellos ya están puestos y se activan solos al publicar cada uno. Antes de
dar esto por bueno los generé todos en local, revisé encabezados, tablas y cifras calculadas y los
volví a dejar como borrador.

Palabras de cuerpo (sin frontmatter). Nota: en algunos mensajes de commit puse una estimación
redondeada; las cifras buenas son estas.

| Artículo | Antes | Después | Qué aporta que no tenía |
|---|---|---|---|
| Cómo tributan los fondos (pilar fiscal) | 579 | 1.796 | Retención del 19% paso a paso, FIFO, compensación de pérdidas, regla de recompra, requisitos del traspaso, cómo se declara. **Dato propio**: cuánto vale en euros traspasar frente a vender y recomprar (175 € / 976 € / 2.431 € a 5 / 15 / 25 años) |
| Fondo indexado vs ETF | 622 | 1.445 | Tabla del coste de las comisiones por compra sobre aportaciones pequeñas, cuándo importa el traspaso y cuándo no, por qué no se pueden comprar ETF de EE. UU. (PRIIPs), guía de decisión |
| TER | 496 | 1.366 | Qué incluye y qué no, TER vs gastos corrientes vs comisión de gestión, tabla a 30 años con 6 niveles de TER, **dato propio**: de la diferencia final, cuánto son comisiones pagadas y cuánto rentabilidad perdida, tracking difference |
| Modelo 720 | 605 | 1.261 | Umbral real (50.000 € por bloque) en vez de "pendiente", ejemplos por bloque, tabla de 4 años de cuándo repetirlo, cómo se valora, régimen sancionador actual (tras la sentencia del TJUE y la Ley 5/2022), cómo comprobar dónde tiene tus activos el broker |
| Qué es un fondo indexado (pilar fondos) | 594 | 1.428 | Cómo funciona por dentro, **datos SPIVA** (98% de los fondos activos globales en euros por detrás del índice a 10 años), composición real del MSCI World a agosto de 2026, guía paso a paso desde España |
| Diferencia entre ahorrar e invertir | 562 | 1.354 | **Inflación real del INE** 2023-2025 (9,1% acumulado: 10.000 € parados valen 9.169 €), tabla de poder adquisitivo al 2/2,5/3%, ejemplo de invertir el colchón, dónde va cada tipo de dinero, regla 50/30/20 |
| Fondo de emergencia | 577 | 1.293 | **Gasto medio real del INE** (EPF 2025: 14.066 €/persona/año; 15.017 € en Cataluña) como referencia, cálculo paso a paso, casos para estudiantes y primer trabajo, tabla de meses para construirlo |
| Primeros pasos (pilar educación) | 474 | 1.364 | 9 pasos con tabla resumen, nuevo paso sobre comprobar la entidad en la CNMV y detectar chiringuitos, tabla de cuánto se necesita para empezar, errores más caros |

Criterios aplicados en todos:

- **Ninguna cifra fiscal escrita a mano donde se pueda evitar**: la tabla de tramos se genera desde
  `finance.ts` (componente nuevo `TramosAhorroTabla.astro`) y la retención, la compensación, la
  regla de recompra, los umbrales del 720 y la cobertura del FGD son expresiones que leen las
  constantes `VERIFICAR`. Si cambias una cifra en `finance.ts`, cambia en todos los artículos.
  Los ejemplos resueltos con tipos concretos (19%, 21%...) están listados en un comentario de
  `finance.ts` para revisarlos si cambian los tramos.
- **Todas las cifras calculadas con script**, con la misma lógica que la calculadora, no
  estimadas. Encontré y corregí dos errores míos antes del commit (una celda estimada en
  "primeros pasos" y una pérdida mal calculada en "ahorrar vs invertir").
- **Fuentes concretas** (página exacta del Manual de Renta 2025 de la AEAT, preguntas frecuentes del
  720, guías de la CNMV, INE, BCE, FGD, SPIVA, MSCI, EUR-Lex), todas comprobadas con respuesta 200.
  Antes varios artículos citaban solo la portada de la sede de la AEAT o no citaban nada.
- **Keywords del mapa** en título, descripción, encabezados y preguntas frecuentes, sin repetirlas
  de forma forzada (p. ej. "cuándo es obligatorio el modelo 720", "cuánto debe ser el fondo de
  emergencia", "cómo empezar a invertir siendo joven", "cuánto necesito para empezar a invertir en
  fondos indexados").
- **Enlazado interno hacia los pilares**: cada artículo enlaza a su pilar y a la calculadora;
  los tres pilares enlazan a todo su clúster.
- Sin recomendaciones de productos concretos ni personalizadas; avisos explícitos donde tocaba.
- Cero guiones largos (comprobado con búsqueda en todo `src/`).

## 4. SEO de contenido en los dos artículos publicados

- "Cuánto te queda realmente de un fondo indexado": el enlace "este artículo" pasa a "qué es el TER
  de un fondo y qué incluye" (texto ancla descriptivo), y la keyword "calculadora de rentabilidad
  neta" aparece en la introducción.
- "Interés compuesto explicado": la sección de la calculadora se titula ahora "Calculadora de
  interés compuesto con tus propios números" ("interés compuesto calculadora" es la segunda
  sugerencia real de Google según `KEYWORDS.md`).
- Ambos citan la página concreta de la AEAT, no la portada.
- **Títulos**: el sufijo " · WealthUncut" solo se añade si el total cabe en 60 caracteres (antes
  había títulos de 88 que Google cortaba). La portada pasa de "WealthUncut" a "WealthUncut:
  finanzas prácticas para jóvenes en España".
- **Descripciones** de los 8 borradores recortadas a 141-157 caracteres (antes hasta 208).
- **Portada**: la cifra grande ("150 €/mes durante 20 años son 69.630 € netos") ahora indica sus
  supuestos debajo (1.000 € iniciales, 7% bruto, TER 0,2%...). Antes no los decía en ningún sitio,
  y una cifra de rentabilidad sin supuestos puede leerse como una promesa.

## 5. Privacidad y buzón de sugerencias

- La política de privacidad no mencionaba que el buzón de sugerencias guarda el mensaje y, si se
  deja, el email (en Cloudflare KV). Añadida la finalidad y una sección propia, con un
  `[PENDIENTE]` para el plazo de conservación y las transferencias internacionales. El aviso de
  "borrador pendiente de revisión legal" sigue tal cual.
- El formulario muestra ahora la información básica del RGPD (responsable, finalidad, derecho a
  pedir el borrado, enlace a la política).
- Campo trampa invisible anti-bots (el bot recibe un "ok" falso y no se guarda nada) y validación
  del formato del email en el servidor. Probado con el runtime de Cloudflare en local (4 casos) y
  en producción (solo con envíos que no se guardan, para no ensuciar tus sugerencias reales).

## 6. Autor, metodología, índice del blog y documentación

- **Autor**: el TODO de contacto se sustituye por el email que ya era público en el aviso legal;
  añadidos principios de trabajo, lista de artículos publicados, idiomas y ciudad (datos que ya
  estaban en el proyecto, nada inventado) y schema `ProfilePage`.
- **Metodología**: qué fuentes se usan, cómo se calculan los ejemplos, qué significa "pendiente de
  verificación" y cómo se actualiza el contenido cuando cambia la normativa.
- **Índice del blog**: introducción con enlace a la calculadora y descripción más completa.
- **Contraste de colores** revisado: todos los textos de la paleta cumplen WCAG AA (mínimo 4,58:1).
  No he tocado la paleta.
- **Documentación**: `CLAUDE.md` (estructura actualizada y el truco de los espacios en Astro),
  `KEYWORDS.md` (qué artículo cubre cada keyword y qué huecos quedan) y `README.md` (el de la
  plantilla de Astro sustituido por uno del proyecto, con cómo publicar un borrador).

## 7. Segunda tanda: rendimiento medido y artículos publicados

- **Medición real con Lighthouse (móvil) sobre producción.** Antes: portada 97, calculadora 89;
  accesibilidad, buenas prácticas y SEO a 100. Problemas encontrados: CSS que bloqueaba el primer
  pintado (hasta 940 ms en la calculadora) y un desplazamiento de diseño de 0,072 en la portada
  porque Fraunces llegaba tarde y el titular cambiaba de líneas.
- Arreglos: precarga de las dos fuentes principales (mismos archivos que usa el CSS, sin doble
  descarga), Inter solo en el subconjunto latino (cubre español y catalán) y CSS incrustado en el
  HTML (~9 KB comprimido). Resultado: **desplazamiento de diseño 0,072 → 0,001** en la portada y
  primer pintado de la calculadora 2,7 s → 2,3 s. Puntuación de rendimiento en móvil después:
  **portada 97 → 99** (LCP 1,8 s), **calculadora 89 → 91**, interés compuesto 95. Lighthouse
  varía unos puntos entre ejecuciones; lo que no depende del ruido es el desplazamiento de diseño.
  Lo que queda en la calculadora es sobre todo el JavaScript de React de la herramienta, que es
  necesario para que funcione.
- Validado en producción: todos los bloques JSON-LD se leen sin errores, el sitemap tiene fechas y
  no incluye el 404, y ninguna tabla desborda en móvil.
- **"Interés compuesto explicado"**: 752 → 1.348 palabras. Tabla de interés simple vs compuesto,
  regla del 72 comparada con el cálculo exacto, el ejemplo de las edades en euros de hoy (con el 2%
  del BCE) y preguntas frecuentes ("cuánto se gana con 100 € al mes"). Todo calculado.
- **"Cuánto te queda realmente de un fondo indexado"**: 678 → 1.012 palabras. Tabla de sensibilidad
  a la rentabilidad bruta (3% a 8%, que es el dato que más mueve el resultado), cómo pasarlo a euros
  de hoy y por qué vender por partes puede pagar algo menos de impuestos que el cálculo de la
  calculadora.
- **404**: ahora sugiere los artículos publicados en vez de solo "volver al inicio".
- **Calculadora en móvil**: teclado numérico/decimal en los campos.

## Pendiente de David

Ordenado por prioridad. Nada de esto lo he hecho yo porque requiere tu decisión, tu cuenta o una
validación profesional.

### Urgente (5-15 minutos cada una)

1. **Confirmar las cifras `VERIFICAR` de `src/config/finance.ts`** contra las fuentes enlazadas en
   cada constante. Cuando estén confirmadas, cambia `verificado: false` a `true` en
   `IRPF_AHORRO_FUENTE_VERIFICAR` y desaparece el aviso "pendiente de verificar" de la calculadora
   y de la tabla de tramos. Lista:
   - Tramos del ahorro 19/21/23/27/**30%** (el 30% es el cambio de esta noche).
   - Retención del 19% en reembolsos de fondos.
   - Compensación de pérdidas: 25% cruzado, 4 años de arrastre.
   - Regla de recompra: 2 meses (cotizados) / 1 año (no cotizados, como los fondos).
   - Modelo 720: 50.000 € por bloque, 20.000 € de incremento, plazo de enero a marzo.
   - Fondo de Garantía de Depósitos: 100.000 €.
2. **Dar de alta el sitio en Google Search Console** (no es monetización, pero sin esto no sabrás
   si Google te indexa): search.google.com/search-console → Añadir propiedad → "Dominio" →
   `wealthuncut.com` → copia el registro TXT → Cloudflare → wealthuncut.com → DNS → Añadir
   registro TXT → Verificar. Después, en "Sitemaps", envía `https://wealthuncut.com/sitemap-index.xml`.
   Opcional: Bing Webmaster Tools permite importar la propiedad desde Search Console en un clic.
3. **Autorizar el conector de Cloudflare** en Claude (aparece como pendiente de autenticación en
   esta sesión). Esta noche verifiqué cada despliegue mirando la web en producción, pero sin el
   conector no puedo leer los logs de build de Cloudflare si algún día falla uno.

### Decisiones de contenido

4. **Publicar los 8 borradores, a tu ritmo.** La regla de `CLAUDE.md` es máximo 3-4 piezas por
   semana. Propuesta de orden (primero los que ya enlaza la calculadora publicada, que ahora mismo
   salen como texto sin enlace):
   - Semana 1: qué es un fondo indexado, cómo tributan los fondos, TER.
   - Semana 2: fondo indexado vs ETF, primeros pasos, ahorrar vs invertir.
   - Semana 3: fondo de emergencia, modelo 720.
   Al publicar: `draft: false`, pon en `pubDate` y `updatedDate` la fecha real de publicación
   (ahora todos tienen el 23 de septiembre) y haz push.
5. **Revisar estas afirmaciones** de los artículos nuevos; están basadas en fuentes oficiales pero
   son matices legales que conviene que confirmes (o tu gestor):
   - Que la escala autonómica del ahorro es igual en toda España (la fija la ley estatal).
   - Que la regla de recompra de 1 año se aplica a participaciones de fondos no cotizados.
   - Que presentar el 720 fuera de plazo sin requerimiento tiene un tratamiento más favorable.
   - El caso de fondos extranjeros (Irlanda, Luxemburgo) comprados a través de entidades españolas
     y el 720: el artículo lo deja como "compruébalo con tu entidad", sin afirmar nada.
6. **Tus perfiles sociales** (LinkedIn, X): están vacíos en `src/config/site.ts`. Si los añades,
   conviene incluirlos también en el schema `Person` como `sameAs`; refuerza la autoría ante Google.

### Legales (para el gestor o abogado)

7. Lo que ya estaba pendiente: si "Barcelona, España" sin dirección exacta cumple el art. 10 de la
   LSSI-CE, o si hace falta una dirección de notificación.
8. **El aviso legal y la página de transparencia dicen en presente que el sitio participa en
   programas de afiliación**, pero todavía no tienes ninguno. No lo he cambiado porque son textos
   legales pendientes de revisión, pero conviene que digan "puede participar" hasta que haya
   afiliados reales.
9. Plazo de conservación de las sugerencias y transferencias internacionales de Cloudflare (el
   `[PENDIENTE]` nuevo de la política de privacidad).
10. **Tu gmail personal es público** en el aviso legal, la privacidad y ahora la página de autor
    (ya lo era antes de esta noche). Si prefieres un email del dominio (`contacto@wealthuncut.com`),
    Cloudflare Email Routing es gratuito: Cloudflare → wealthuncut.com → Email → Email Routing →
    activar → dirección de destino (tu gmail) → crear `contacto@`. Después dime y lo cambio en todo
    el sitio.

### Ideas para cuando quieras (no las he hecho porque son funcionalidades nuevas, no arreglos)

- Imagen para redes distinta por artículo (ahora todos comparten `og-default.png`).
- Que la calculadora muestre también el resultado en euros de hoy (descontando inflación); ahora el
  artículo lo explica con un ejemplo, pero la herramienta no lo calcula.
- Próximos artículos con keyword ya validada y sin cubrir: plan de pensiones vs fondo indexado,
  dividendos y cómo declarar ganancias de bolsa (ver `KEYWORDS.md`).

### Notas técnicas (no requieren acción)

- `.claude/launch.json` lo modifiqué en local para poder previsualizar (había otro servidor de
  desarrollo abierto en esta carpeta) y lo he dejado como estaba; no va en ningún commit.
- Los avisos `"use astro:head-inject" may not be preserved` del build son ruido interno de Astro 7,
  no un fallo.

## Checklist de monetización para mañana

Nada de esto está hecho ni configurado. Sigue el orden de `CLAUDE.md`: afiliación → lista de
correo → AdSense (este último todavía no toca).

### 0. Antes de ganar el primer euro (imprescindible)

- [ ] **Hablar con un gestor sobre el alta fiscal** antes de cobrar la primera comisión: alta
      censal en Hacienda (modelo 036/037, con el epígrafe que te indique), si procede alta en
      autónomos, IVA de las comisiones y si necesitas el Registro de Operadores Intracomunitarios
      (ROI) para cobrar de empresas de otros países de la UE. No doy cifras ni epígrafes porque no
      los he podido verificar y dependen de tu caso.
- [ ] Llevar las páginas legales a revisión (puntos 7-9 de arriba) y cambiar "participa" por
      "puede participar" en aviso legal y transparencia hasta tener afiliados.

### 1. Afiliación directa (prioridad 1)

- [ ] **Publicar primero al menos los 3 pilares** (fondo indexado, fiscalidad, primeros pasos): la
      mayoría de programas revisan el sitio antes de aceptarte y un sitio con 2 artículos se
      rechaza con facilidad.
- [ ] Hacer una lista de brokers y neobancos relevantes para los clústeres 1 y 2 de `KEYWORDS.md`
      y comprobar en la web de cada uno si tiene programa de afiliados propio o está en una red
      de afiliación (Awin, por ejemplo).
- [ ] **Comprobar que cada proveedor está autorizado** (registros de la CNMV o del Banco de
      España) antes de enlazarlo. Es coherente con lo que el sitio recomienda a los lectores.
- [ ] Leer las condiciones de cada programa: qué exige sobre la forma de anunciarlos, si prohíbe
      pujar por su marca, cómo paga y desde qué país (relevante para el IVA).
- [ ] Solicitar el alta con tus datos (esto solo lo puedes hacer tú).
- [ ] Cuando te aprueben alguno, dímelo y lo integro: enlaces con `rel="sponsored nofollow"`,
      `hasAffiliateLinks: true` en el frontmatter del artículo (el aviso de afiliación aparece
      solo) y actualizar la página de transparencia con la lista de programas.
- [ ] Contenido que encaja con afiliación (ahora mismo no existe): "mejor broker para fondos
      indexados" y "cuenta bancaria para jóvenes por edad" (ambas keywords validadas). Escribirlos
      cuando haya programas activos, con comparativa real y no solo con los que pagan comisión.

### 2. Lista de correo (prioridad 2)

- [ ] Elegir proveedor. Criterios: servidores en la UE o garantías de transferencia claras, doble
      opt-in, plan gratuito para empezar. Ejemplos con sede en la UE: MailerLite, Brevo.
      Compruébalo tú en sus condiciones actuales.
- [ ] Crear la cuenta (tú) y verificar el dominio: el proveedor te dará registros DNS (SPF, DKIM y
      a veces DMARC) que se añaden en Cloudflare → wealthuncut.com → DNS.
- [ ] Activar el **doble opt-in** y preparar el email de bienvenida.
- [ ] Decidir el incentivo para suscribirse (por ejemplo, una checklist en PDF de "primeros pasos"
      basada en el artículo pilar, o avisos cuando cambien los tramos fiscales).
- [ ] Rellenar el `[PENDIENTE]` de la política de privacidad con el proveedor y si transfiere
      datos fuera del EEE.
- [ ] Pásame el código del formulario o la API del proveedor y lo integro en el sitio (casilla de
      consentimiento sin marcar por defecto, enlace a privacidad, sin cookies de terceros si se
      puede evitar).

### 3. AdSense (prioridad 3, todavía no)

- [ ] **No solicitarlo aún.** El criterio de `CLAUDE.md` es tener unas 25-30 páginas sólidas y
      tráfico; ahora hay 2 publicadas y 8 en borrador.
- [ ] Cuando toque: necesitarás una **plataforma de consentimiento (CMP) certificada por Google**
      para el EEE (Google ofrece la suya, "Privacidad y mensajes", dentro de AdSense) conectada
      antes de mostrar anuncios.
- [ ] Actualizar la política de cookies con las cookies reales de AdSense y del CMP.
- [ ] Añadir `ads.txt` en `public/` con la línea que te dé AdSense (te lo preparo cuando la tengas).
- [ ] Revisar que los anuncios no se confundan con recomendaciones del sitio (separarlos
      visualmente y etiquetarlos como publicidad).
