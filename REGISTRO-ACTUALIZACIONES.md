# Registro de actualizaciones de datos

Lo escribe la rutina diaria de actualización (`ACTUALIZACION-PROCEDIMIENTO.md`, apartado 4), lo más nuevo arriba. Una entrada por día:
qué se actualizó (con fuente y commit), qué se verificó sin cambios, qué no pudo verificarse y qué queda para David.

## 2026-10-30
- Actualizado: `cuentas-remuneradas`: comparador revisado con HelpMyCash (28 y 23 de octubre), Finect (29 y 26), Raisin (14) y las webs de EBN y MyInvestor. Salen Sabadell (su 2,75 % exige nómina y Bizum y el alta cierra el 12/11), el depósito de MyInvestor (oferta válida solo hasta el 31/10) y el de HoistSpar (ningún comparador lo recoge). También sale Bank B (7-10 años, solo Raisin). Entran Openbank (3,25 %, hasta el 16/11), WiZink, EBN y Mano Bank (vía Raisin). Bankinter Cuenta Digital no se incluye (fecha límite discrepante entre fuentes, 28/10 o 11/11).
- Refactor, verificado sin cambios: `ipc-espana`: el IPC de septiembre de 2026 (4,9 %, subyacente 3,1 %, IPCA 5,0 %, INE, 14 de octubre) pasa a `IPC_ESPANA` en `src/config/finance.ts`; cinco textos lo leen de ahí. Contrastado con la API del INE (serie IPC290750).
- Verificado parcialmente: `ipc-diciembre-calculadora` (solo diciembre de 2025 contra la API del INE; 2023 y 2024 por contrastar).
- Verificado sin cambios: ninguna cifra fiscal (no tocaba: próximas revisiones en enero y abril).
- No pudo verificarse: la oferta de Revolut (3,51 %) no tiene fecha límite en HelpMyCash ni en Finect y su web daba 403; se mantiene con la condición de «nuevo cliente». Self Bank: importe máximo y MyInvestor Premium no confirmados. Webs de Deutsche Bank y Bankinter no accesibles.
- Pendiente de David: la newsletter del 25 de octubre no se generó (último número 2026-10-18; el registro la marca vencida); el catálogo de carteras de MyInvestor (28/09) vence el 2026-11-07; `keywords-search-console` (pegar consultas de Search Console).
