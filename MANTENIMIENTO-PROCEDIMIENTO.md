# Procedimientos de mantenimiento automático

Guía de las rutinas de mantenimiento de WealthUncut. Si algo choca con `CLAUDE.md`, manda
`CLAUDE.md`. Regla común: **si algo no se puede comprobar con garantías, no se toca**, y se avisa
en el resumen. Todas terminan con un resumen breve de lo hecho y lo descartado.

## 1. Euríbor del simulador de hipoteca (mensual)

El BCE publica la media mensual del euríbor a 12 meses a principios de mes.

1. `npm ci` y `node scripts/datos-euribor.mjs` (guarda `src/data/euribor/ultimo.json`).
2. Si el fichero no ha cambiado, termina sin commit.
3. Si ha cambiado: comprueba que `ultimoMes` es el mes anterior al actual y que `ultimoValor` es un
   número razonable (entre 0 y 8). `npm run build` sin errores.
4. `git add src/data/euribor/ultimo.json`; commit `Euríbor: actualización de AAAA-MM`;
   `git pull --rebase origin main`; `git push origin HEAD:main`. No toques nada más.

## 2. Seguridad de dependencias (semanal)

1. `npm ci` y `npm audit`. Si no hay vulnerabilidades, termina sin tocar nada.
2. Si las hay: `npm audit fix` (sin `--force`). Comprueba que `npm audit` mejora y que
   `npm run build` termina sin errores y genera `dist/client/index.html`.
3. Si compila: `git add package.json package-lock.json`; commit
   `Dependencias: corrige vulnerabilidades de npm audit`; `git pull --rebase origin main`;
   `git push origin HEAD:main`. No toques ningún otro archivo.
4. Si corregirlas exige `--force` (cambios incompatibles) o el build falla, **no hagas commit**:
   explica cuáles quedan y por qué para que se revisen a mano.

## 3. Salud del sitio (semanal, solo informa)

No modifica el repositorio. Comprueba, desde la web en producción (`https://wealthuncut.com`) y
desde el repositorio:

- Responden 200: `/`, `/mercados/`, `/blog/`, `/herramientas/`, `/carteras/`, `/newsletter/`,
  `/sitemap-index.xml`, `/robots.txt`, `/rss.xml`.
- Las cabeceras de seguridad siguen en `/`: `Strict-Transport-Security`, `X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy`, `Content-Security-Policy` (cabecera y meta).
- Hay edición de `/mercados/` publicada para cada uno de los últimos 7 días (`src/content/mercados/`).
- Quedan 2 o más artículos programados en `src/content/blog/` (`pubDate` futura). Con 0 o 1, avisa
  (la rutina de reposición debería actuar).
- Frescura de datos: `src/data/cuentas-remuneradas/ultimo.json` (fecha de menos de 10 días),
  `src/data/fondos-indexados/ultimo.json` y `src/data/myinvestor-fondos/ultimo.json` (menos de 40
  días), `src/data/euribor/ultimo.json` (`generado` de menos de 45 días).
- Enlaces internos rotos: recorre las páginas del sitemap y comprueba que cada enlace interno
  (`href` que empieza por `/`) responde 200.

- Enlaces externos rotos: `npm run build` y después `node scripts/comprobar-enlaces.mjs`. Solo 404, 410
  o dominio inexistente cuentan como rotos (exit 1); los 403/5xx son medios que bloquean robots. Si hay
  rotos, inclúyelos en el aviso con la página donde están (el contenido de `/mercados/` y de las fuentes
  de artículos se corrige a mano o en la siguiente revisión, esta rutina no edita).

Resultado: envía una notificación (`PushNotification`) con el resumen. Si todo está bien, una línea
("Salud del sitio: todo correcto"); si no, la lista de problemas encontrados.

## 4. Revisión de cifras fiscales (febrero, abril y junio, solo informa)

No modifica `src/config/finance.ts`. Comprueba si hay novedades en las fuentes oficiales que
alimentan esas cifras y avisa si hay que revisarlas a mano:

- AEAT: ¿hay un Manual práctico de Renta nuevo (ejercicio siguiente al de las cifras actuales)?
  ¿Cambian los tramos del ahorro, la retención o las reglas de compensación de `finance.ts`?
- BOE: ¿hay una nueva orden de cotización a la Seguridad Social, y cambian las bases o los tipos?
- Límite de aportación a planes de pensiones y garantía del FGD: ¿han cambiado?
- ITP de vivienda usada (`ITP_VIVIENDA_USADA`): contrasta cada comunidad con Guía Fiscal ("Datos 2026") y la
  norma autonómica; el 2026-10-06 se encontraron cuatro comunidades mal (Cataluña, Castilla y León, Murcia, País
  Vasco) y un agregador que publicaba cifras erróneas. Avisa de cualquier diferencia.
- Comisión máxima por reembolso anticipado de hipotecas (Ley 5/2019, artículo 23, constante
  `COMISION_AMORTIZACION_ANTICIPADA`): ¿ha cambiado el texto consolidado del BOE?

Compara contra las constantes de `finance.ts` (con su fuente y fecha) y envía una notificación con
qué ha cambiado y dónde, o "sin novedades fiscales". Nunca edites cifras: las confirma David.

## 5. Revisión de artículos y calculadoras ya publicados (mensual)

Los datos que cambian con el tiempo envejecen: este procedimiento los revisa y actualiza. Es la única
rutina que edita contenido ya publicado, así que las reglas son estrictas.

### Qué se revisa

**Artículos** (`src/content/blog/`, solo los publicados, `pubDate` ya pasada): cada afirmación con una
cifra o situación que cambia con el tiempo y que no viene de un dato importado de `src/data/` ni de
`src/config/finance.ts` (esas ya se actualizan solas): inflación, euríbor, tipos del BCE, precios,
rentabilidades, importes de tarjetas o cuentas, "a día de hoy", fechas de cambios normativos,
estadísticas de informes (SPIVA, INE...).

**Calculadoras y herramientas** (`src/components/*.tsx`, `src/pages/herramientas/*.astro`,
`src/pages/carteras.astro`, portada): valores por defecto y textos con cifras o fechas que no salen de
`finance.ts` ni de `src/data/` (rentabilidades de ejemplo, comisiones típicas, supuestos mostrados,
frases como "con el euríbor actual"), y que los ejemplos escritos a mano (como el de la portada:
150 €/mes, 20 años, 7% bruto, TER 0,2%) siguen coincidiendo con lo que calcula la propia herramienta.

### Cómo se revisa

1. Lista las cifras y afirmaciones sujetas a cambio de cada pieza.
2. Para cada una, busca el dato **oficial más reciente** (INE, BCE, Banco de España, AEAT, BOE, CNMV,
   Eurostat, la propia gestora o banco) y compáralo.
3. **Si ha cambiado**: actualiza la cifra y su fecha en el texto ("según el INE, en septiembre de 2026"),
   ajusta lo que dependa de ella (una conclusión, una comparación) con el cambio mínimo necesario, y en
   artículos pon `updatedDate` con la fecha de hoy. Cita la fuente nueva en `sources`.
4. **Si el dato ya viene de `src/data/` o `finance.ts`**, no lo copies a mano: si el texto lo tenía
   escrito a mano, sustitúyelo por la importación del dato.
5. **Si no puedes verificarlo con garantías, no lo cambies** y anótalo en el resumen.
6. Si descubres que algo **estaba mal desde que se publicó** (no que haya cambiado), corrígelo y añade
   una entrada en `src/content/correcciones/` con el formato de las existentes (`fecha`, `pieza`,
   `url`, `resumen`). Un dato que simplemente ha cambiado NO es una corrección.

### Límites

- **Nunca edites `src/config/finance.ts`** (las cifras fiscales las confirma David). Si crees que una
  cifra de ahí está desactualizada, avisa en el resumen y en la notificación.
- No cambies la estructura, el título, la URL ni el enfoque de ninguna pieza; solo cifras, fechas y
  las frases que dependan de ellas. Sin guiones largos. Sin recomendaciones personalizadas.
- No toques nada en `src/content/mercados/` ni `src/content/newsletter/` (son ediciones fechadas).

### Después

`npm ci`, `npm run build` sin errores. Si compila: `git add` solo los archivos editados;
commit `Revisión mensual: actualiza cifras de AAAA-MM`; `git pull --rebase origin main`;
`git push origin HEAD:main`. Si no cambias nada, no hagas commit. Termina con un resumen (qué cifras
cambiaste en qué piezas, qué no pudiste verificar) y envía una notificación (`PushNotification`)
con una línea.
