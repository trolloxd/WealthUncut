# Procedimiento de la rutina diaria de actualización de datos

Guía de la rutina en la nube que, **cada día y sin el PC de David**, revisa todo dato del sitio que caduca, actualiza lo
vencido con fuente oficial y fecha, y publica directamente en `main`. Si algo choca con `CLAUDE.md`, manda `CLAUDE.md`.

Regla de oro (la misma de todas las rutinas): **nunca inventar una cifra. Si no se puede verificar con garantías, no se
toca, se deja la fecha antigua y se anota en el registro como «no pudo verificarse».** Un dato atrasado y avisado es mejor
que un dato nuevo dudoso.

## 0. De dónde sale la lista de trabajo

La lista no la decide la rutina: la da el comprobador, sin IA y sin red salvo las APIs oficiales.

- `src/config/caducidades.json` es el **registro**: una entrada por dato (id, dónde vive, fuente oficial, frecuencia, regla de
  revisión, de dónde se lee su fecha de última verificación, si es crítico y cómo se actualiza). Lógica en
  `src/lib/caducidades.ts`; lectura de fechas en `scripts/lib/caducidades-io.mjs`; pruebas en `tests/caducidades.test.ts`.
- `node scripts/comprobar-frescura.mjs --sin-rama` compara BCE, euríbor, cuentas y portada con sus fuentes y después imprime el
  registro: **VENCIDO**, **POR VENCER**, **PRÓXIMOS 14 DÍAS**, **AL DÍA** y **SIN FECHA COMPROBABLE**. Sale con código 1 si hay
  un error de frescura o un dato crítico vencido (es lo esperado cuando hay trabajo; no es un fallo de la rutina).
- `node scripts/comprobar-frescura.mjs --solo-registro` hace lo mismo sin red ni git, y se ejecuta solo antes de cada
  `npm run build` (`prebuild`). Con `FRESCURA_ESTRICTA=1` hace fallar el build si hay algo **crítico** vencido; por defecto solo
  avisa, porque parar el despliegue por un dato atrasado también pararía los artículos programados.
- Regla del registro: las entradas con fecha leída del propio dato (`json`, `regex`, `ultimo-fichero`, `mercados-serie`) se
  ponen al día solas al actualizar el dato. Las de fecha `literal` (cifras fiscales sin campo de fecha) **se actualizan a mano en
  el mismo commit**: cambia `valor` en `caducidades.json` a la fecha de hoy cuando hayas verificado la cifra, aunque no haya
  cambiado nada («verificado, sin cambios» también cuenta).
- Una constante nueva en `src/config/finance.ts` sin entrada en el registro hace fallar `npm test`. Un dato nuevo que
  caduque fuera de `finance.ts` se da de alta en el registro en el mismo commit.

## 1. Pasos de la rutina (cada día)

1. `git pull --rebase origin main`; `npm ci`.
2. `node scripts/comprobar-frescura.mjs --sin-rama` y guarda la salida: es la lista de trabajo.
3. Procesa en este orden, parando en cada punto si no se puede verificar: (a) lo determinista, (b) lo crítico vencido,
   (c) el resto de vencidos, (d) por vencer, (e) próximos 14 días que sean baratos (por ejemplo, si hoy toca el IPC, hazlo hoy).
4. Cada dato actualizado va en **su propio commit** (`Euríbor: actualización de 2026-11`, `IPC: octubre de 2026`, `Cuentas y
   depósitos: actualización del AAAA-MM-DD`...), con las fechas del registro puestas al día en ese commit.
5. Antes de publicar: `npm test` y `npm run build` sin errores; el build no debe mostrar `[frescura] ERROR` de lo que acabas de
   arreglar. Comprueba que no hay guiones largos (—) en lo que has escrito.
6. `git pull --rebase origin main`; `git push origin HEAD:main`; después `node scripts/indexnow.mjs` (avisa a Bing de las URLs
   cambiadas; un fallo no invalida nada).
7. Vuelve a ejecutar el comprobador: lo que arreglaste debe haber salido de VENCIDO.
8. Escribe el registro (apartado 4) en el mismo push o en uno posterior, y si hay datos críticos que no pudiste verificar,
   envía una notificación (`PushNotification`) con la lista.

Límites: no toques páginas legales (`aviso-legal`, `privacidad`, `cookies`), AdSense (`src/config/ads.mjs`), analítica,
proveedores de email, `wrangler.jsonc`, ajustes de Cloudflare o GitHub, ni secretos; no borres artículos publicados; no
nombres brokers como recomendación; nunca `git push --force`. Si el clasificador de permisos deniega algo, no busques otra
vía: anótalo en el registro como pendiente para David.

## 2. Inventario de datos que caducan

Detalle completo (fuente, URL, regla, quién) en `src/config/caducidades.json`. Resumen:

| id | Qué es | Dónde vive | Fuente | Frecuencia real | Cómo / quién |
|---|---|---|---|---|---|
| bce-tipo-deposito, bce-eurusd, bce-otras-series | Tipo del BCE, euro/dólar y otras series | `src/data/mercados/AAAA-MM-DD.json` | BCE Data Portal | Diaria (días hábiles TARGET) | Script `datos-mercados.mjs`; rutina de mercados y wu-frescura |
| mercados-edicion | Edición diaria y briefing de `/hoy/` | `src/content/mercados/` | BCE + 2.ª fuente | Diaria | Investigación; rutina de mercados |
| euribor-boe | Euríbor oficial | `src/data/euribor/ultimo.json` | BOE (Banco de España) | Mensual, días 2 a 4 | Script `datos-euribor.mjs`; rutina de euríbor |
| ipc-espana | IPC general, subyacente, IPCA | `finance.ts` `IPC_ESPANA` | INE | Mensual, hacia el 12 a 15 | `datos-ipc.mjs` detecta; la rutina escribe (apartado 3.3) |
| cuentas-remuneradas | TAE de cuentas y depósitos | `src/data/cuentas-remuneradas/ultimo.json` | Bancos + 2 comparadores | Semanal | Investigación (3.4); rutina semanal de cuentas |
| cuentas-ofertas-con-fecha | Ofertas con fecha límite en el texto | mismo fichero | Web del banco | Aviso 14 días antes | Investigación (3.4) |
| cuentas-historico | Histórico de TAE | `historico.json` | El propio comparador | Semanal | Script `historico-cuentas.mjs` |
| fondos-indexados | TER, ISIN, índice | `src/data/fondos-indexados/ultimo.json` | KIID + comparador | Mensual | Investigación (3.5) |
| catalogo-carteras | Catálogo MyInvestor de `/carteras/` | `src/data/myinvestor-fondos/` | MyInvestor + KID | Mensual | Investigación (3.5) |
| newsletter-semanal | Número del boletín | `src/content/newsletter/` | Lo publicado en la semana | Semanal (domingo) | Rutina de newsletter |
| cola-articulos | Artículos programados | `src/content/blog/` | `ARTICULOS-PROCEDIMIENTO.md` | Diaria (mínimo 7) | Rutina de reposición |
| articulos-antiguos | Artículos con `updatedDate` de más de un año | `src/content/blog/` | Fuente de cada artículo | Anual | Investigación (3.9) |
| keywords-search-console | Consultas reales de Search Console | `KEYWORDS.md` | Search Console (solo David) | Mensual | Manual (3.10) |
| irpf-ahorro, irpf-general, alquiler-irpf | Escalas y reducciones del IRPF | `finance.ts` | AEAT Manual de Renta, leyes autonómicas | Anual (enero y abril) | Investigación (3.6) |
| ss-trabajador, reta-autonomos | Cotizaciones de trabajador y autónomo | `finance.ts` | BOE, orden de cotización | Anual (febrero/abril) | Investigación (3.6) |
| itp-vivienda | ITP por comunidad y gastos | `finance.ts` | Normativa autonómica | Anual (enero/julio) | Investigación (3.6) |
| modelo-720-721, plan-pensiones, fgd-cobertura, comisiones-hipoteca | Umbrales, límites y comisiones | `finance.ts` | AEAT, BOE, FGD | Anual (enero) | Investigación (3.6) |
| ayudas-vivienda-jovenes | Ayudas e IPREM | `finance.ts` | BOE RD 326/2026 | Anual (enero/julio) | Investigación (3.6) |
| alquiler-rdl-29-2026 | RDL 29/2026 pendiente de convalidación | `finance.ts` | BOE y Congreso | Semanal hasta resolverse | Investigación (3.7) |
| calendario-fiscal | Fechas fiscales y `.ics` | `src/lib/calculos/calendario-fiscal.ts` | AEAT Calendario del contribuyente | Anual (20 de diciembre) | Investigación (3.8) |
| ipc-diciembre-calculadora | IPC de diciembre en la calculadora de inflación | `calculadora-inflacion.astro` | INE | Anual (20 de enero) | Investigación (3.3) |
| lssi-direccion, dependencias-npm, enlaces-externos | Sin fecha en el repo | ver registro | BOE / npm / GitHub Actions | Puntual / semanal | David / rutinas existentes |

No caducan (no están en el registro a propósito): plantillas Excel (datos de ejemplo ficticios), `microretos.ts` (rota por día
del año), términos del glosario del día, los `.ics` (se generan desde el calendario), `/datos/` (se genera desde `finance.ts` y
el euríbor), el euríbor y las TAE importadas dentro de los artículos (se leen de los JSON), las constantes de reglas del
Estatuto de los Trabajadores y del Reglamento del IRPF de las calculadoras de despido, factura y baja (cámbialas solo si hay
una reforma publicada; las vigila la revisión de cifras fiscales).

## 3. Cómo actualizar cada cosa

### 3.1 BCE (`#bce`)

`node scripts/datos-mercados.mjs` (día de hoy en UTC) descarga las series del BCE y guarda `src/data/mercados/AAAA-MM-DD.json`.
Si sale con código 1 o faltan `dfr` o `eurusd`, no guardes la instantánea. Commit `Datos: BCE del AAAA-MM-DD`. La edición
`.mdx` de `/mercados/` la escribe la rutina de mercados (`MERCADOS-PROCEDIMIENTO.md`); esta rutina solo avisa si falta.

### 3.2 Euríbor (`#euribor`)

`node scripts/datos-euribor.mjs`. Si dice «Sin meses nuevos» o «aún no está en el BOE», no hay commit. Si añade un mes,
comprueba `ultimoMes`, abre `fuenteUrl` y confirma el valor «Un año». Solo el BOE, nunca BCE ni EMMI. Pasos completos en
`MANTENIMIENTO-PROCEDIMIENTO.md` apartado 1.

### 3.3 IPC (`#ipc`)

1. `node scripts/datos-ipc.mjs` compara el sitio con la API del INE (serie `IPC290750`, índice general, variación anual). Si dice
   «MES NUEVO», sigue; si dice «DESVÍO», corrige; si «Sin cambios», nada.
2. Abre la nota de prensa del mes (`https://www.ine.es/dyngs/Prensa/IPCMMAA.htm`, por ejemplo `IPC1026.htm` para octubre de
   2026) y lee: tasa anual del IPC general, inflación subyacente, IPCA y fecha de publicación. Contrasta el general con la API.
   Si la nota no está accesible o no coincide con la API, no actualices y anótalo.
3. Edita **solo** `IPC_ESPANA` en `src/config/finance.ts` (`mes`, `mesTexto`, `general`, `subyacente`, `armonizado`, `publicado`,
   `publicadoTexto`, `url`, `verificado`). Los cuerpos de `glosario/inflacion`, `glosario/deposito-a-plazo`,
   `inflacion-que-interes-necesitas-para-no-perder`, `subida-sueldo-ipc-poder-adquisitivo` y `cuanto-ahorrar-al-mes-segun-sueldo`
   ya leen de ahí.
4. Textos fijos que no se pueden leer de la constante (frontmatter y bloques narrativos): busca el mes anterior con
   `grep -rn "septiembre de 2026" src/content src/pages` y ajusta lo que cite el IPC: `description`, `resumen` y `sources` (etiqueta,
   fecha y URL) de los cinco ficheros; en `subida-sueldo-ipc-poder-adquisitivo` añade la fila del mes a la tabla mensual y
   reescribe «lo que ha pasado» solo con lo que diga la nota del INE (por ejemplo «la más alta desde...» se comprueba en la serie).
   En `inflacion-que-interes-necesitas-para-no-perder` revisa también la frase de Eurostat (zona euro) con su nota de prensa; si no
   puedes verificarla, quita la frase en vez de dejar la antigua con el mes nuevo. Sube `updatedDate` de lo tocado.
5. No toques las ediciones de `src/content/mercados/` ni los números de la newsletter ya publicados: son fechados.
6. `npm test`, `npm run build`; commit `IPC: AAAA-MM`.
7. En enero (día 20): añade el IPC de diciembre del año que acaba a `calculadora-inflacion.astro` y al artículo
   `diferencia-entre-ahorrar-e-invertir` (fuente INE, nota de prensa de diciembre) y pon la fecha en `ipc-diciembre-calculadora`.

### 3.4 Cuentas, depósitos y ofertas con fecha (`#cuentas`)

Sigue `CUENTAS-PROCEDIMIENTO.md` entero. Lecciones del arreglo del 2026-10-30 que debes repetir:

- Fuentes de partida: HelpMyCash (cuentas y depósitos), Finect (cuentas y depósitos), Raisin (sus productos) y la web de cada banco
  cuando se deja abrir (muchas devuelven 403 o 404 al lector: úsalas como confirmación opcional, no como requisito).
- Cada cifra en **dos fuentes independientes fechadas esa semana**. Si discrepan (ejemplo: Sabadell 2 % sin nómina frente a 2,75 % con
  nómina y Bizum), describe la condición en `requisitos` y pon `vinculacion: true` si el tipo alto exige nómina; si no se aclara,
  saca la entidad.
- Fuera toda oferta que caduque en menos de 2 semanas (el comprobador avisa de las que caducan en 14 días o menos, y marca como
  vencidas las que ya pasaron) y toda oferta que ningún comparador recoja ya.
- Entran ofertas nuevas relevantes (con FGD español preferentemente). Mantén 6 a 12 cuentas sin vinculación y 2 a 3 con vinculación.
- Actualiza `fecha`, `generado` y `nota` (qué cambió) en `ultimo.json`; ejecuta `node scripts/historico-cuentas.mjs`; build; commit
  `Cuentas y depósitos: actualización del AAAA-MM-DD`. Aunque no cambie ninguna TAE, sube `fecha` y `generado` y añade la
  instantánea (el dato se ha revisado y sigue vigente).

### 3.5 Fondos y catálogo de carteras (`#fondos`)

`FONDOS-PROCEDIMIENTO.md` y `MYINVESTOR-FONDOS-PROCEDIMIENTO.md`. Avisan a los 32 días de la última revisión y vencen a los 40;
revisa cada mes, no esperes al aviso. Mismas reglas: dos fuentes, nada que no se verifique; sube `fecha` y `generado` aunque no cambie nada.

### 3.6 Cifras fiscales y de Seguridad Social (`#fiscales`)

Entradas: `irpf-ahorro`, `irpf-general`, `alquiler-irpf`, `ss-trabajador`, `reta-autonomos`, `itp-vivienda`, `modelo-720-721`,
`plan-pensiones`, `fgd-cobertura`, `comisiones-hipoteca`, `ayudas-vivienda-jovenes`. Cada una avisa cuando llega su mes (ver
registro) y vence tras su plazo de gracia. En el día en que se pone en AVISO:

1. Abre la fuente oficial de la entrada (`fuenteUrl`; para el IRPF, el Manual práctico de Renta del ejercicio nuevo; para la
   Seguridad Social y el RETA, la orden anual de cotización en el BOE; para el ITP, la normativa de cada comunidad y la guía
   fiscal que ya se usó como segunda fuente; para el plan de pensiones, el Manual y la ley de presupuestos).
2. Compara con la constante de `finance.ts`. **Sin cambios**: pon la fecha de hoy en `caducidades.json` (entrada `literal`) y en
   el comentario `Verificado el` de la constante; commit `Cifras fiscales: <id> verificado sin cambios (AAAA-MM-DD)`.
3. **Con cambios publicados en una fuente oficial inequívoca** (BOE o AEAT con el texto delante): edita solo esa constante, con
   fuente, fecha y la marca `VERIFICAR` si ya la tenía; actualiza el resto de lo que dependa (nombre `RETA_2026` si cambia el
   año, tests en `tests/calculos.test.ts` con una cifra comprobada a mano, comentario de fuente), corre `npm test` y build, y
   commit `Cifras fiscales: <id> (BOE/AEAT, AAAA-MM-DD)`. En el registro marca «CAMBIO FISCAL: revisar» para que David lo vea.
4. **Fuente ambigua, solo borrador o proyecto de ley, o no accesible**: no edites. Anótalo en el registro como pendiente y deja
   la entrada en aviso (no pongas la fecha de hoy si no verificaste).
5. Tipos autonómicos (IRPF e ITP de 17 comunidades): cambian por ley autonómica, normalmente publicada en diciembre. En enero
   comprueba las 15 comunidades de régimen común (el País Vasco y Navarra tienen régimen foral y quedan fuera del alcance del sitio);
   si no puedes comprobarlas todas, anota cuáles no verificaste y deja la entrada en aviso.

### 3.7 RDL 29/2026 (`#rdl`)

Cada semana, mientras esté pendiente: busca el estado de la iniciativa 130/000060 en el Congreso y el BOE-A-2026-20823. Si se
**convalida**: actualiza el comentario de `finance.ts`, quita «pendiente» de los textos de las herramientas afectadas y pasa la
entrada del registro a revisión anual (`anual`, abril). Si se **deroga** o caduca: no borres nada de golpe; avisa a David
(`PushNotification`) y anótalo, porque las cifras dejan de aplicarse y hay que decidir cómo se muestra. Si sigue pendiente: pon
la fecha de hoy en `fechaRegistro` de `ALQUILER_IRPF_RDL_29_2026`.

### 3.8 Calendario fiscal (`#calendario`)

Cuando la AEAT publique el Calendario del contribuyente del año siguiente (normalmente diciembre): sustituye en
`EVENTOS_FISCALES` las fechas `previsto` por las oficiales (estado `oficial`, con URL); los `.ics` salen solos del
build, no se tocan a mano. Pon `CALENDARIO_REVISADO` a hoy. `npm test` (hay pruebas del calendario). Si el día 20 de diciembre aún no está
publicado, anótalo; el aviso seguirá hasta que lo esté.

### 3.9 Artículos antiguos (`#antiguos`)

Cuando un artículo publicado supere 330 días desde su `updatedDate`: relee sus cifras, fuentes y enlaces; si algo cambió,
actualízalo (cifras de `finance.ts` o de los JSON, nunca escritas a mano) y sube `updatedDate`; si todo sigue igual, sube
`updatedDate` solo si de verdad has verificado cada fuente. Un artículo por ejecución como máximo.

### 3.10 Lo que solo puede hacer David (`#manual`)

`keywords-search-console` (pegar las consultas de Search Console en `KEYWORDS.md`), dirección LSSI del aviso legal, la
confirmación de cualquier cambio fiscal marcado «CAMBIO FISCAL: revisar», y las decisiones de AdSense/analítica/legales. La rutina
no los hace; los lista en el registro de cada día mientras estén vencidos.

## 4. Registro de cada ejecución

Escribe en `REGISTRO-ACTUALIZACIONES.md` (en la raíz del repo, lo más nuevo arriba) un bloque por día:

```
## AAAA-MM-DD
- Actualizado: <id>: qué cambió, fuente (URL) y commit.
- Verificado sin cambios: <ids>.
- No pudo verificarse: <id>: por qué (fuente inaccesible, discrepancia, borrador...).
- Pendiente de David: <lo que solo él puede hacer>.
- Estado del registro al terminar: VENCIDO/POR VENCER/AL DÍA (lista corta).
```

Si no hubo nada que hacer, una línea: «AAAA-MM-DD: todo al día, sin cambios». No cuentes como actualizado lo que solo se miró.

## 5. Cuándo falla la rutina (y qué se hace)

- El comprobador sale con código 2 (no pudo ejecutarse): registra el error y no toques datos.
- `npm test` o `npm run build` fallan tras un cambio: descarta ese cambio (`git checkout -- <ficheros>`), anótalo y sigue con el resto.
- Una fuente oficial no responde: reintenta una vez; si sigue, «no pudo verificarse» y se queda la fecha antigua.
- El push falla por conflicto: `git pull --rebase origin main` y reintenta una vez; si vuelve a fallar, anótalo y para.
