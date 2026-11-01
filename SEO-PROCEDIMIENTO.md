# Procedimiento SEO de WealthUncut

Lo siguen todas las rutinas que crean o tocan páginas (artículos, glosario, herramientas, mantenimiento). Está adaptado del playbook de
SEO del proyecto. Regla de oro: **decidir con datos de Search Console, no con intuiciones**. Las rutinas en la nube no ven Search Console;
lo que se sabe de él vive en `KEYWORDS.md` (consultas reales y posiciones). Léelo antes de elegir qué escribir o retocar.

## Dónde estamos y qué mueve la aguja

Web joven (pocas semanas de rastreo): muy pocos clics, posición media por detrás de la página 5 y **ningún enlace externo**. Técnicamente
está sana: indexar más páginas no arregla esto. Por orden de impacto:

1. **Enlaces externos reales** (autoridad). No dependen de las rutinas: nunca los compres ni los inventes. Se consiguen con datos y
   herramientas que otros citen (`/datos/`, `/incrustar/`, `/prensa/`).
2. **Ganar donde ya estamos cerca** (posición 5 a 30): título, descripción, contenido y enlaces internos.
3. **Herramientas y cola larga con cálculo propio**, no definiciones genéricas que dominan bancos y medios.
4. **Señales de confianza**: autor real, fuentes, fechas, metodología, correcciones.
5. **Menos páginas flojas**: Google juzga el sitio entero. Mejor menos y mejor.

Las consultas de definición muy genéricas ("qué es un ETF") las ganan sitios con mucha autoridad: no gastes fuerzas en ellas, salvo para
enlazar desde ahí a la herramienta. Donde estamos cerca es en **calculadoras, simuladores y cola larga con números**.

## Antes de escribir o reescribir una página

1. **Mira la SERP** (los 5 primeros resultados de la consulta principal): si son calculadoras, haz calculadora; si son guías, guía; si es
   un comparador, comparador. Una página del tipo equivocado no sube por buena que sea.
2. **Una consulta, una página.** Si ya hay una página nuestra para esa consulta, mejórala en vez de crear otra. Si dos páginas compiten por
   lo mismo, se diferencian y se enlazan (o se funden, sin cambiar la URL de la que ya posiciona).
3. **Usa las palabras exactas de la búsqueda real** (de `KEYWORDS.md`, del autocompletado o de "Otras preguntas" de Google), no sinónimos
   bonitos. Las búsquedas dicen "calculadora" o "simulador": ponlo.

## Títulos y descripciones

- **Título: 60 caracteres como máximo**, con la búsqueda real al principio y un motivo para pulsar (año, "con tus números", "gratis").
  Sin clickbait. Calculadoras: "Calculadora de X 2026: <lo que obtienes>".
- **Descripción: 120 a 155 caracteres**, qué obtienes y un dato concreto si lo hay. Nada de frases vacías.
- En las ediciones de mercados y los números de la newsletter, el titular es editorial: escríbelo de 60 caracteres o menos (en newsletter,
  incluido el prefijo "5 minutos de finanzas #N:"). La plantilla recorta la etiqueta `<title>` si te pasas, pero un titular corto es mejor.
- **Un título cambiado no se vuelve a tocar hasta pasados 28 días**: hay que poder medir el efecto. Antes de cambiar el título de una página
  que ya existe, mira `git log -p -S"title" -- <archivo>`; si cambió hace menos de 28 días, déjalo.

## Contenido que merece posicionar

- **Respuesta directa en las primeras líneas** (sirve para fragmentos destacados y respuestas de IA). El `resumen` del frontmatter la lleva.
- **Algo que no tenga nadie**: cálculo propio, tabla con cifras verificadas, ejemplo con números, dato oficial que se actualiza solo.
- **Preguntas reales como `##`** o en "Preguntas frecuentes" (de "Otras preguntas" de Google y de las consultas de `KEYWORDS.md`).
- **Actualiza lo existente antes de crear otra página.** `updatedDate` solo con cambios reales, nunca para fingir frescura.
- Nada de contenido masivo ni páginas casi iguales. Cifras fiscales solo de `src/config/finance.ts`; sin guiones largos; sin
  recomendaciones personalizadas.

## Glosario

Cada entrada lleva: definición en una frase (la `description`), un **ejemplo con números** (cifras fiscales importadas de `finance.ts`;
si hace falta cálculo, la entrada es `.mdx`), **cuándo importa en España** (con fuente oficial si hay normativa), **error frecuente** y
enlaces a la herramienta y a la guía relacionadas. Mínimo orientativo: 300 palabras útiles. Si un término no da para eso, se funde con otro
(sin cambiar URLs que ya estén indexadas) y no se rellena con paja.

## Enlazado interno (la palanca más barata)

- **Cada página nueva recibe al menos 3 enlaces desde páginas ya publicadas**, dentro del texto, con texto descriptivo (no "aquí"). Los
  enlaces de cabecera y pie cuentan poco: importan los del cuerpo. Usa `node scripts/enlaces-internos.mjs --sugerir=<slug>` tras el build.
- **Y la nueva página enlaza al menos 3 veces hacia fuera**, incluida su herramienta.
- **Artículo y calculadora del mismo tema se enlazan siempre en los dos sentidos.** El mapa está en `src/config/guias-herramienta.ts`
  (herramienta y guía): una herramienta nueva con guía propia se añade ahí, y la guía enlaza a la herramienta en su texto. Lo comprueba
  `npm test`.
- Las páginas que ya están en posición 5 a 30 (`KEYWORDS.md`) reciben enlaces nuevos desde artículos relacionados cada vez que se publica
  algo del mismo tema.

## Datos estructurados y confianza

- Herramientas: `ToolLayout.astro` ya emite `WebApplication`, `BreadcrumbList` y `FAQPage` (pasa siempre el prop `faqs` con el mismo texto
  que las preguntas visibles). Artículos: `Article` con autor, fechas y migas de pan. Páginas con vídeo propio: `VideoObject` por vídeo.
- Fuentes citadas, autor con página propia y fecha de actualización real en cada pieza. Las correcciones van en `/correcciones/`.

## Medir sin autoengañarse

- A los 28 días de un cambio: impresiones, clics y posición frente a antes (lo hace David en Search Console). Sube: repetir el patrón. No
  sube: anotar por qué.
- Una pieza tiene tracción con más de 100 impresiones y posición por debajo de 30. A los 90 días sin impresiones: reescribir o fundir.
- No prometas posiciones ni visitas. Los datos de una semana son ruido.

## Lo que no se hace

Texto oculto, relleno de palabras clave, reseñas o datos inventados, fechas falsas, enlaces comprados o intercambios masivos, ni tocar paleta,
CSP, páginas legales o AdSense por motivos de SEO.
