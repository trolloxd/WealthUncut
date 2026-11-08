# Registro de actualizaciones de datos

Lo escribe la rutina diaria de actualización (`ACTUALIZACION-PROCEDIMIENTO.md`, apartado 4), lo más nuevo arriba. Una entrada por día:
qué se actualizó (con fuente y commit), qué se verificó sin cambios, qué no pudo verificarse y qué queda para David.

## 2026-11-08
- Actualizado: nada. Comprobador: BCE, euríbor (2026-10), cuentas (revisadas el 2026-11-02) y portada al día.
- No pudo verificarse: `catalogo-carteras` (VENCIDO, 41 días) y `fondos-indexados` (38 días, vence el 2026-11-10): HelpMyCash devuelve 404 y las fichas de fondos de Finect devuelven 404 al lector; sin dos fuentes accesibles no se toca el dato. `cuentas-ofertas-con-fecha`: Openbank (hasta el 2026-11-16, openbank.es inaccesible) y Kutxabank (hasta el 2026-11-22) sin verificar; la revisión de cuentas del 2026-11-10 las resolverá.
- Pendiente de David: `catalogo-carteras` (vencido) y `fondos-indexados` (antes del 2026-11-10), con navegador; `keywords-search-console`. Revisar el 12 o 13/11 el resultado de la votación sobre el RDL 29/2026.
- Estado del registro al terminar: VENCIDO (catalogo-carteras); POR VENCER (cuentas-ofertas-con-fecha, fondos-indexados).

## 2026-11-07
- Actualizado: nada. El comprobador no encontró dato nuevo que aplicar (BCE al día, euríbor 2026-10 al día, cuentas revisadas el 2026-11-02, portada correcta).
- No pudo verificarse: `catalogo-carteras` (VENCIDO desde hoy, 40 días) y `fondos-indexados` (37 días, vence el 2026-11-10): MyInvestor no responde al lector (conexión bloqueada) y HelpMyCash y Finect devuelven 404 en las URLs de partida; sin dos fuentes accesibles no se toca el dato. `cuentas-ofertas-con-fecha`: oferta de Openbank (hasta el 2026-11-16) sin verificar por la misma razón (openbank.es inaccesible); la revisión de cuentas del 2026-11-10 la resolverá.
- Pendiente de David: `catalogo-carteras` (vencido) y `fondos-indexados` (antes del 2026-11-10), con navegador; `keywords-search-console`. Revisar el 12 o 13/11 el resultado de la votación sobre el RDL 29/2026.
- Estado del registro al terminar: VENCIDO (catalogo-carteras); POR VENCER (cuentas-ofertas-con-fecha, fondos-indexados).

## 2026-11-06
- Actualizado: `bce-otras-series`: instantánea `src/data/mercados/2026-11-06.json` con `node scripts/datos-mercados.mjs` (BCE Data Portal; dfr 2,50 de 2026-11-06, euro/dólar 1,1224 de 2026-11-05, €STR y bonos de 2026-11-04).
- No pudo verificarse: `fondos-indexados` (36 días, vence el 2026-11-10) y `catalogo-carteras` (39 días, vence el 2026-11-07): siguen sin dos fuentes accesibles para el lector (ver 2026-11-02). No se tocan.
- Aviso: oferta de Openbank (hasta el 2026-11-16) la resolverá la revisión de cuentas del 7 al 10/11.
- Pendiente de David: `catalogo-carteras` (antes del 2026-11-07) y `fondos-indexados` (antes del 2026-11-10), con navegador; `keywords-search-console`.
- Estado del registro al terminar: POR VENCER (cuentas-ofertas-con-fecha, fondos-indexados, catalogo-carteras). Nada vencido.

## 2026-11-05
- Actualizado: `euribor-boe`: euríbor oficial de 2026-10 = 3,239 % (BOE-A-2026-23168, publicado el 2026-11-04), con `node scripts/datos-euribor.mjs` y comprobado en el texto del BOE (https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-23168, «Un año» 3,239). `npm test` y build sin errores. Commit `Euríbor: actualización de 2026-10`.
- No pudo verificarse: `fondos-indexados` (35 días, vence el 2026-11-10) y `catalogo-carteras` (38 días, vence el 2026-11-07): siguen sin dos fuentes accesibles para el lector (ver 2026-11-02). No se tocan.
- Aviso: oferta de Openbank (hasta el 2026-11-16) la resolverá la revisión de cuentas del 7 al 10/11.
- Pendiente de David: `catalogo-carteras` (antes del 2026-11-07) y `fondos-indexados` (antes del 2026-11-10), con navegador; `keywords-search-console`.
- Estado del registro al terminar: POR VENCER (cuentas-ofertas-con-fecha, fondos-indexados, catalogo-carteras). Nada vencido.

## 2026-11-04
- Actualizado: `bce-otras-series`: instantánea `src/data/mercados/2026-11-04.json` con `node scripts/datos-mercados.mjs` (BCE Data Portal; dfr 2,50 de 2026-11-04, euro/dólar 1,1179 de 2026-11-03, €STR y bonos de 2026-11-02).
- No pudo verificarse: `euribor-boe` (crítico, vencido): `node scripts/datos-euribor.mjs` dice que el euríbor de 2026-10 aún no está en el BOE; se reintentará mañana, no se toca el dato. `fondos-indexados` (34 días, vence el 2026-11-10) y `catalogo-carteras` (37 días, vence el 2026-11-07): siguen sin dos fuentes accesibles para el lector (ver 2026-11-02). `datos-ipc.mjs`: la API del INE no respondió (el IPC no toca hasta el 2026-11-18).
- Fuera de esta rutina: `mercados-edicion` vencido (última verificación 2026-11-01), la escribe la rutina de mercados.
- Pendiente de David: `catalogo-carteras` (antes del 2026-11-07) y `fondos-indexados` (antes del 2026-11-10), con navegador; `keywords-search-console`.
- Estado del registro al terminar: VENCIDO (euribor-boe a la espera del BOE, mercados-edicion); POR VENCER (cuentas-ofertas-con-fecha, fondos-indexados, catalogo-carteras).

## 2026-11-03
- Actualizado: `bce-otras-series`: instantánea `src/data/mercados/2026-11-03.json` con `node scripts/datos-mercados.mjs` (BCE Data Portal; dfr 2,50 de 2026-11-03, euro/dólar 1,1216 de 2026-11-02).
- No pudo verificarse: `fondos-indexados` (33 días, vence el 2026-11-10) y `catalogo-carteras` (36 días, vence el 2026-11-07): siguen sin haber dos fuentes accesibles para el lector (ver 2026-11-02). No se tocan. La oferta de Openbank (hasta el 2026-11-16) la resolverá la revisión de cuentas del 7 al 10/11.
- Fuera de esta rutina: `mercados-edicion` por vencer (última verificación 2026-11-01), la escribe la rutina de mercados.
- Pendiente de David: `catalogo-carteras` (antes del 2026-11-07) y `fondos-indexados` (antes del 2026-11-10), con navegador; `keywords-search-console`.
- Estado del registro al terminar: POR VENCER (mercados-edicion, cuentas-ofertas-con-fecha, fondos-indexados, catalogo-carteras). Nada vencido.

## 2026-11-02
- Verificado sin cambios: `alquiler-rdl-29-2026`: sigue pendiente de convalidación. Prensa (Moncloa 17/10, Democrata, Maldita) sitúa la votación de la Diputación Permanente el 12/11/2026 (Cortes disueltas, elecciones el 29/11); no hay resultado aún. `fechaRegistro` pasa a 2026-11-02. El Congreso no es accesible desde la rutina (host fuera de la red permitida), así que el estado oficial se contrastó solo con prensa y análisis jurídicos: revisar el 12/11 o 13/11 el resultado y, si se deroga, avisar a David. Hay una discrepancia de numeración entre fuentes sobre qué decreto (28 o 29/2026) lleva la prórroga de alquileres; no afecta a las cifras fiscales del 29/2026.
- No pudo verificarse: `fondos-indexados` (aviso, 32 días; vence el 2026-11-10) y `catalogo-carteras` (aviso, 35 días; vence el 2026-11-07): no hay dos fuentes accesibles para el lector (MyInvestor carga los fondos por JavaScript). Se dejan con su fecha.
- Aviso: oferta de Openbank del comparador de cuentas caduca el 2026-11-16; la sacará la revisión de cuentas del 7 al 10/11.
- Pendiente de David: `catalogo-carteras` (antes del 2026-11-07) y `fondos-indexados` (antes del 2026-11-10), con navegador; `keywords-search-console`.
- Estado del registro al terminar: POR VENCER (cuentas-ofertas-con-fecha, fondos-indexados, catalogo-carteras). Nada vencido.

## 2026-11-01
- Actualizado: nada.
- No pudo verificarse: `catalogo-carteras` (por vencer, 34 días): sigue sin haber fuente verificable accesible para el lector (la web de MyInvestor carga los fondos por JavaScript, ver 2026-10-31). Se deja `ultimo.json` con fecha 2026-09-28. Vence el 2026-11-07.
- Pendiente de David: `catalogo-carteras` (revisar a mano o con navegador antes del 2026-11-07); `keywords-search-console`.
- Estado del registro al terminar: POR VENCER (catalogo-carteras). Frescura de datos de hoy OK. Próximos 14 días: fondos-indexados y RDL 29/2026 (2/11), mercados (3/11), euríbor (4/11), cuentas (7/11).

## 2026-10-31
- Actualizado: nada.
- No pudo verificarse: `catalogo-carteras` (por vencer, 33 días): la página de fondos de MyInvestor carga la lista por JavaScript y el HTML que recibe el lector no contiene ningún fondo ni ISIN (ni los 10 del catálogo actual), así que no hay rentabilidades ni TER que contrastar. Se deja `ultimo.json` con fecha 2026-09-28. Vence el 2026-11-07.
- Pendiente de David: newsletter semanal vencida (último número 2026-10-18; faltan los del 25/10 y posiblemente el de hoy); `catalogo-carteras` (revisar a mano o con navegador antes del 2026-11-07); `keywords-search-console`.
- Estado del registro al terminar: VENCIDO (newsletter-semanal); POR VENCER (catalogo-carteras). Próximos 14 días: mercados, euríbor (desde el 4/11), cuentas (7/11), fondos-indexados (2/11), RDL 29/2026 (2/11).

## 2026-10-30
- Actualizado: `cuentas-remuneradas`: comparador revisado con HelpMyCash (28 y 23 de octubre), Finect (29 y 26), Raisin (14) y las webs de EBN y MyInvestor. Salen Sabadell (su 2,75 % exige nómina y Bizum y el alta cierra el 12/11), el depósito de MyInvestor (oferta válida solo hasta el 31/10) y el de HoistSpar (ningún comparador lo recoge). También sale Bank B (7-10 años, solo Raisin). Entran Openbank (3,25 %, hasta el 16/11), WiZink, EBN y Mano Bank (vía Raisin). Bankinter Cuenta Digital no se incluye (fecha límite discrepante entre fuentes, 28/10 o 11/11).
- Refactor, verificado sin cambios: `ipc-espana`: el IPC de septiembre de 2026 (4,9 %, subyacente 3,1 %, IPCA 5,0 %, INE, 14 de octubre) pasa a `IPC_ESPANA` en `src/config/finance.ts`; cinco textos lo leen de ahí. Contrastado con la API del INE (serie IPC290750).
- Verificado parcialmente: `ipc-diciembre-calculadora` (solo diciembre de 2025 contra la API del INE; 2023 y 2024 por contrastar).
- Verificado sin cambios: ninguna cifra fiscal (no tocaba: próximas revisiones en enero y abril).
- No pudo verificarse: la oferta de Revolut (3,51 %) no tiene fecha límite en HelpMyCash ni en Finect y su web daba 403; se mantiene con la condición de «nuevo cliente». Self Bank: importe máximo y MyInvestor Premium no confirmados. Webs de Deutsche Bank y Bankinter no accesibles.
- Pendiente de David: la newsletter del 25 de octubre no se generó (último número 2026-10-18; el registro la marca vencida); el catálogo de carteras de MyInvestor (28/09) vence el 2026-11-07; `keywords-search-console` (pegar consultas de Search Console).
