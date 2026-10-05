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

Resultado: envía una notificación (`PushNotification`) con el resumen. Si todo está bien, una línea
("Salud del sitio: todo correcto"); si no, la lista de problemas encontrados.

## 4. Revisión de cifras fiscales (febrero, abril y junio, solo informa)

No modifica `src/config/finance.ts`. Comprueba si hay novedades en las fuentes oficiales que
alimentan esas cifras y avisa si hay que revisarlas a mano:

- AEAT: ¿hay un Manual práctico de Renta nuevo (ejercicio siguiente al de las cifras actuales)?
  ¿Cambian los tramos del ahorro, la retención o las reglas de compensación de `finance.ts`?
- BOE: ¿hay una nueva orden de cotización a la Seguridad Social, y cambian las bases o los tipos?
- Límite de aportación a planes de pensiones y garantía del FGD: ¿han cambiado?

Compara contra las constantes de `finance.ts` (con su fuente y fecha) y envía una notificación con
qué ha cambiado y dónde, o "sin novedades fiscales". Nunca edites cifras: las confirma David.
