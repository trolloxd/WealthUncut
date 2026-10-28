# Mapa de clusters y keywords: HIPÓTESIS + validación parcial

Todo lo de este documento partió como hipótesis, sin datos validados. El Planificador de
Keywords de Google exige crear una cuenta de Google Ads y pasar por su asistente de campaña
(actualmente sin opción visible de "modo experto sin campaña"), y David ha decidido no crear esa
cuenta ni tocar nada relacionado con pagos o campañas. Así que la validación de este documento
se ha hecho con una vía alternativa, gratuita y sin cuenta: el autocompletado público de Google
(`suggestqueries.google.com`), que no da volúmenes exactos pero sí refleja búsquedas reales que
la gente hace ahora mismo. Se marca cada keyword confirmada así.

**Límite de este método**: el autocompletado no da cifras de volumen ni competencia, solo
confirma que una frase se busca de verdad. Además, aunque se filtró por España, algunas
sugerencias mezclan variantes de Latinoamérica (Argentina, México, Colombia); esas se han
descartado de las notas de validación de abajo.

## Clúster 1: Cuentas y neobancos para jóvenes

Pilar: qué cuenta abrir, comparativas, primeros pasos bancarios.

- mejor cuenta bancaria para jóvenes españa
- cuenta sin comisiones para estudiantes
- neobancos españa comparativa
- revolut o n26 cual es mejor
- cuenta remunerada mejor interés
- como abrir cuenta bancaria siendo menor de edad
- tarjeta de débito sin comisiones jóvenes

**Validado (autocompletado, 2026-09-23):** confirmado con más detalle del esperado. La gente
busca por edad exacta: "cuenta bancaria para jóvenes de 17/18/16/15 años", además de "sin
comisiones" y bancos concretos como La Caixa. Merece la pena un artículo específico para
menores de edad con desglose por edad, no solo un genérico "jóvenes".

## Clúster 2: Brokers e inversión

Pilar: cómo elegir dónde invertir, comparativas de brokers.

- mejor broker para invertir en españa
- degiro vs myinvestor vs indexa
- broker para empezar a invertir con poco dinero
- comisiones broker fondos indexados comparativa
- como elegir un broker para invertir
- es seguro invertir en degiro
- broker español vs broker extranjero fiscalidad

**Validado (autocompletado, 2026-09-23):** "mejor broker para invertir" y "mejor broker para
fondos indexados" son sugerencias reales y directas, confirman la hipótesis tal cual.

## Clúster 3: Fondos indexados

Pilar: qué son, cómo empezar, comparativas de producto. Encaja directamente con la
calculadora ya publicada.

- que es un fondo indexado
- como invertir en fondos indexados desde españa
- mejor fondo indexado msci world
- fondo indexado vs etf diferencias
- cuanto necesito para empezar a invertir en fondos indexados
- rentabilidad neta fondo indexado calculadora
- ter que es y cuanto es razonable pagar
- vanguard vs amundi fondo indexado comparativa

**Validado (autocompletado, 2026-09-23):** "que es un fondo indexado y como funciona" y "que es
un fondo indexado y un etf" son las variantes reales más buscadas, ya cubiertas por los
artículos publicados y en cola. Señal fuerte también en "interes compuesto calculadora"
(ver Clúster 5): la gente busca herramientas, no solo explicaciones, lo que confirma la
apuesta del sitio por calculadoras propias.

## Clúster 4: Fiscalidad del ahorro y la inversión

Pilar: impuestos, declaración de la renta, tramos del IRPF del ahorro. Usa
`src/config/finance.ts` como fuente única de cifras.

- como tributan los fondos de inversión en españa
- irpf ahorro tramos actuales
- cuando pago impuestos por vender un fondo indexado
- traspaso entre fondos tributa
- como declarar ganancias de bolsa en la renta
- modelo 720 quien tiene que presentarlo
- impuesto por dividendos españa

**Validado (autocompletado, 2026-09-23):** "modelo 720 cuando es obligatorio" y "modelo 720
obligados" son variantes reales, más orientadas a "¿me toca a mí?" que a "qué es". El artículo
ya en cola debería asegurarse de responder esa pregunta de forma explícita y pronto en el texto.

## Clúster 5: Primeros pasos / educación financiera

Pilar: contenido de entrada, menor competencia, capta a quien empieza de cero.

- como empezar a invertir siendo joven
- diferencia entre ahorrar e invertir
- interes compuesto explicado con ejemplos
- cuanto dinero ahorrar cada mes segun tu sueldo
- fondo de emergencia cuanto tiene que tener
- primeros pasos para invertir en españa

**Validado (autocompletado, 2026-09-23):** "diferencia entre ahorrar e invertir" es coincidencia
exacta y completa (la primera sugerencia literal), la keyword más confirmada de todo el mapa.
"fondo de emergencia cuanto debe ser" y "fondo de emergencia recomendado" también confirmadas.
"interes compuesto calculadora" fue la segunda sugerencia más relevante para "interes
compuesto", refuerza que este clúster funciona mejor con herramienta incluida, no solo texto.

## Clúster 6: Planes de pensiones y jubilación temprana

Pilar: relevante para jóvenes que empiezan pronto, menos saturado que los clústeres 2-3.

- plan de pensiones individual merece la pena
- jubilarse antes ahorrando e invirtiendo españa
- plan de pensiones vs fondo indexado

**Validado (autocompletado, 2026-09-23):** "plan de pensiones o fondo de inversión" es
sugerencia real, confirma que la comparación que ya teníamos en la hipótesis es una duda
genuina de la gente, no una idea forzada.

## Clúster 7: Sueldo neto y nómina

Pilar: volumen muy alto, casi ninguna calculadora existente aplica bien los tramos autonómicos.
Añadido el 2026-09-24 a raíz de una idea de David; keywords sin validar todavía con
autocompletado.

- calculadora sueldo neto
- de bruto a neto calculadora
- cuanto es mi sueldo neto españa
- irpf por comunidad autonoma comparativa
- cuanto se paga de seguridad social nomina
- retencion irpf nomina como se calcula

## Clúster 8: Vivienda: hipoteca, euríbor y entrada

Pilar: la vivienda es la preocupación económica número uno de la gente joven en España. Añadido
el 2026-09-24; keywords sin validar todavía con autocompletado.

- simulador hipoteca euribor
- cuanto tengo que ahorrar para la entrada de un piso
- itp comprar vivienda por comunidad autonoma
- hipoteca fija variable o mixta cual elegir
- euribor hoy hipoteca
- gastos de comprar una vivienda de segunda mano

## Priorización sugerida para las primeras piezas

1. Empezar por el Clúster 3 (fondos indexados) y Clúster 4 (fiscalidad), ya tenemos la
   calculadora y el `finance.ts` centralizado, así que el coste marginal de cada artículo es
   bajo y la autoridad se refuerza rápido.
2. Intercalar 1 pieza del Clúster 5 (educación básica) cada 3-4 artículos: es el clúster con
   la keyword más confirmada de todas ("diferencia entre ahorrar e invertir") y menor
   competencia, más fácil de posicionar mientras crece la autoridad del dominio.
3. Guardar Clúster 1 (cuentas/neobancos) y Clúster 2 (brokers) para cuando haya relaciones de
   afiliación activas, son los clústeres con más intención comercial.

## Qué artículo cubre cada keyword (actualizado el 2026-09-23)

| Keyword principal | Artículo | Estado | Pilar de su clúster |
|---|---|---|---|
| rentabilidad neta fondo indexado calculadora | `rentabilidad-neta-fondo-indexado` | Publicado | Herramienta central |
| interes compuesto (calculadora, ejemplos) | `interes-compuesto-explicado-con-ejemplos` | Publicado | Clúster 5 |
| que es un fondo indexado (y como funciona) | `que-es-un-fondo-indexado` | Programado | **Pilar clúster 3** |
| fondo indexado vs etf diferencias | `fondo-indexado-vs-etf-diferencias` | Programado | Clúster 3 |
| ter que es y cuanto es razonable pagar | `ter-fondo-que-es` | Programado | Clúster 3 |
| como tributan los fondos de inversion en españa, traspaso entre fondos tributa, irpf ahorro tramos | `como-tributan-los-fondos-de-inversion-en-espana` | Programado | **Pilar clúster 4** |
| modelo 720 cuando es obligatorio / obligados | `modelo-720-quien-tiene-que-presentarlo` | Programado | Clúster 4 |
| diferencia entre ahorrar e invertir | `diferencia-entre-ahorrar-e-invertir` | Programado | Clúster 5 |
| fondo de emergencia cuanto debe ser | `fondo-de-emergencia-cuanto-necesitas` | Programado | Clúster 5 |
| primeros pasos para invertir en españa, como empezar a invertir siendo joven | `primeros-pasos-para-invertir-en-espana` | Programado | **Pilar clúster 5** |
| inflacion que interes necesito para no perder dinero, ipc septiembre 2026 | `inflacion-que-interes-necesitas-para-no-perder` (26/10) | Programado | Clúster 5 |
| como declarar ganancias de bolsa en la renta, fifo acciones, compensar perdidas | `declarar-ganancias-bolsa-renta` (27/10) | Programado | Clúster 4 |
| indemnizacion por despido como se calcula, despido improcedente 33 dias | `indemnizacion-despido-como-se-calcula` (28/10) | Programado | Clúster 7 |
| ayuda alquiler jovenes requisitos, bono alquiler joven 2026 | `ayuda-alquiler-jovenes-requisitos` (29/10) | Programado | Clúster 8 |
| baja laboral cuanto se cobra, incapacidad temporal 60 75 | `baja-laboral-cuanto-se-cobra` (30/10) | Programado | Clúster 7 |
| sueldo neto 2026, de bruto a neto, cuanto se paga de seguridad social nomina | `sueldo-neto-de-bruto-a-neto` | Borrador: bloqueado hasta corregir `IRPF_GENERAL_ESTATAL` en `finance.ts` (tiene los tipos combinados, no los estatales) | Clúster 7 |
| revision hipoteca euribor, cuanto sube la cuota de la hipoteca | `revision-hipoteca-euribor-cuanto-sube` (31/10) | Programado | Clúster 8 |
| cuota autonomos 2026, tramos autonomos 2026, tarifa plana autonomos | `cuota-autonomos-2026-tramos` (1/11) | Programado | Autónomos |
| plan de pensiones o fondo indexado (Search Console) | `plan-pensiones-o-fondo-indexado` (2/11) | Programado | Clúster 6 |
| declarar alquiler renta, gastos deducibles alquiler, reduccion alquiler irpf | `declarar-alquiler-renta-gastos-reducciones` | Borrador: bloqueado hasta corregir `IRPF_GENERAL_ESTATAL` | Clúster 8 |
| irpf por comunidad autonoma comparativa, donde se paga menos irpf | `irpf-por-comunidad-autonoma-donde-se-paga-menos` | Borrador: bloqueado hasta corregir `IRPF_GENERAL_ESTATAL` | Clúster 7 |
| como hacer una factura de autonomo, retencion 15 7 factura | `como-hacer-factura-autonomo` (3/11) | Programado | Autónomos |
| cuanto ahorrar al mes segun sueldo, regla 50 30 20 | `cuanto-ahorrar-al-mes-segun-sueldo` (4/11) | Programado | Clúster 5 |
| fondo de garantia de depositos que cubre, fgd 100000 euros cuenta conjunta | `fondo-garantia-depositos-que-cubre` (5/11) | Programado | Clúster 1 |
| cambiar hipoteca variable a fija, novacion hipoteca, subrogacion hipoteca comision | `cambiar-hipoteca-variable-a-fija` (6/11) | Programado | Clúster 8 |
| prestamo personal tin tae, cuanto cuesta un prestamo, desistimiento prestamo 14 dias | `prestamo-personal-tin-tae-intereses` (7/11) | Programado | Clúster 5 |
| subida sueldo ipc, perdida poder adquisitivo, cuanto tiene que subir el sueldo | `subida-sueldo-ipc-poder-adquisitivo` (8/11) | Programado | Clúster 7 |
| intereses cuenta remunerada hacienda, como tributan los depositos, intereses renta | `intereses-cuenta-remunerada-deposito-hacienda` (9/11) | Programado | Clúster 4 |
| independencia financiera cuanto dinero necesito, regla del 4, calculadora fire | `independencia-financiera-cuanto-dinero-necesitas` (10/11) | Programado | Clúster 6 |

Herramientas (añadidas el 2026-09-23) que refuerzan clústeres con intención de "calculadora":
fondo de emergencia (clúster 5), fondo indexado vs ETF (clúster 3), impuestos al vender un fondo
(clúster 4: "cuando pago impuestos por vender un fondo indexado"), inflación (clúster 5) y
modelo 720 (clúster 4). Viven en `/herramientas/` y se enlazan desde su artículo.

Herramientas añadidas el 2026-09-24 (a partir de una lista de ideas de David, construidas y
publicadas por Claude en una sesión autónoma): simulador de hipoteca con euríbor real (clúster 8),
plan de pensiones vs fondo indexado (clúster 6, cubre el hueco que quedaba abierto), calculadora
de sueldo neto por comunidad autónoma (clúster 7, nuevo) y ahorro para la entrada de un piso
(clúster 8). Pendientes de artículo en MDX propio (de momento son solo `/herramientas/`, sin pieza
de blog que las desarrolle y enlace desde fuera).

Huecos sin artículo todavía (candidatos a próximas piezas, sin escribir): cuenta bancaria para
jóvenes por edad (clúster 1, validado, esperar a tener afiliación), mejor broker para fondos
indexados (clúster 2, validado, esperar a tener afiliación), impuesto por dividendos en España y
cómo declarar ganancias de bolsa (clúster 4, sin validar).

Herramientas añadidas el 2026-09-24, más tarde la misma sesión, tras confirmar David que no hacía
falta esperar su revisión: comparador de cuentas remuneradas y depósitos (clúster 1) y comparador
de fondos indexados disponibles en España (clúster 3). A diferencia de las calculadoras basadas en
fórmulas, estos dos mantienen tablas de productos comerciales reales (TAE de bancos, TER de
fondos), verificadas cruzando comparadores financieros independientes (no hay una fuente oficial
única como el BOE o la AEAT para esto) y con actualización automática programada: semanal para
cuentas (`CUENTAS-PROCEDIMIENTO.md`), mensual para fondos (`FONDOS-PROCEDIMIENTO.md`).

Herramienta añadida el 2026-09-25: ranking de IRPF por comunidad autónoma (clúster 7, cubre
"irpf por comunidad autonoma comparativa"), pensada como pieza diferenciadora y de posible
viralidad (nadie más compara el mismo sueldo en las 17 comunidades a la vez); reutiliza el 100%
de las cifras ya verificadas de la calculadora de sueldo neto, sin datos nuevos que verificar.

## Siguiente paso

Este documento ya tiene validación real (autocompletado) para 8 términos clave, pero sigue sin
cifras de volumen ni competencia. Si en algún momento decides sí crear la cuenta de Google Ads
(sabiendo que implica pasar por su asistente de campaña), retoma la validación por volumen desde
ahí. Mientras tanto, prioriza los clústeres 3, 4 y 5 con la evidencia que ya hay.

Herramientas añadidas el 2026-10-05 (clúster 8, vivienda): amortizar la hipoteca (cubre "amortizar hipoteca
 cuanto ahorro", "reducir cuota o plazo", "comision amortizacion anticipada") y alquilar o comprar (cubre "alquilar o
comprar", "comprar vs alquilar"). Pendientes de artículo en MDX propio; el límite legal de la comisión de
amortización vive en `finance.ts` (`COMISION_AMORTIZACION_ANTICIPADA`, verificado en el BOE el 2026-10-05).

Herramienta y artículo añadidos el 2026-10-06 (clúster 4, impuestos): calculadora del impuesto de los dividendos y guía "Cómo tributan los dividendos en España" (cubre "impuesto por dividendos españa"). Cifras en `finance.ts` (`DIVIDENDOS`, verificadas el 2026-10-06 en el Manual práctico de Renta 2025). Sigue sin artículo "cómo declarar ganancias de bolsa".

## Investigación de keywords del 2026-10-06 (autocompletado de Google, España)

Método: ~70 búsquedas semilla más ampliación a-z de 8 núcleos con `suggestqueries.google.com`
(`hl=es&gl=es`), descartando variantes de Latinoamérica. Sigue sin dar volumen, pero ordena por
demanda real (el orden de las sugerencias refleja popularidad). Qué se aplicó:

**Patrones de búsqueda dominantes en el sector**
- "[producto] + índice/plataforma": `fondo indexado sp500`, `fondo indexado msci world`, `fondos
  indexados myinvestor / trade republic`, `mejor fondo indexado ...`, `cartera de fondos indexados
  (myinvestor)`.
- "calculadora/simulador": `interes compuesto calculadora`, `calculadora sueldo neto 2026`, `simulador
  hipoteca`, `inflacion calculadora`, `regla 50 30 20 calculadora`, `cuanto ahorrar al mes calculadora`.
- El año como modificador: `2026` en `mejores cuentas remuneradas 2026`, `mejores depositos octubre
  2026`, `calculadora sueldo neto 2026`, `itp por comunidades autonomas 2026`, `dividendos tributacion
  irpf 2026`. Solo usar el año si el dato de la página es de ese año.
- "cuánto/cuál": `cuanto dinero necesito para comprar un piso`, `cuanto ahorrar al mes segun sueldo`,
  `fondo de emergencia cuanto debe ser`, `hipoteca fija o variable que es mejor`.
- Comparaciones: `comprar o alquilar vivienda`, `plan de pensiones o fondo de inversion`, `etf vs
  fondo indexado`, `amortizar hipoteca reducir cuota o plazo`, `amortizar hipoteca o invertir`.

**Aplicado a títulos y descripciones (2026-10-06)**: todas las piezas empiezan por la keyword principal
(p. ej. "Cartera de fondos indexados: ...", "Interés compuesto: qué es, fórmula y ejemplos",
"Qué es el TER de un fondo ...", "Cómo empezar a invertir desde cero ...", "Hipoteca fija, variable o
mixta: cuál elegir ...") y los títulos caben en 60 caracteres.

**Páginas nuevas creadas a partir de esta investigación**: `/herramientas/cuanto-ahorrar-al-mes/`
(regla 50/30/20 y "cuánto ahorrar al mes según sueldo"), `/herramientas/itp-por-comunidades/` (tabla de
ITP, "itp por comunidades autonomas") y `/herramientas/calculadora-impuesto-dividendos/`.

**Huecos con demanda confirmada, sin artículo todavía (los toma la rutina de reposición)**:
`sp500 vs msci world` (qué diferencia hay, sin recomendar), `invertir 100 euros al mes`, `como empezar a
invertir con poco dinero`, `gastos de comprar una vivienda de segunda mano`, `amortizar hipoteca o
invertir`, `tramos irpf ahorro` (artículo propio con la tabla), `retencion fondos de inversion`,
`plan de pensiones desgravar` y `cuanto ahorrar al mes segun sueldo` (artículo que acompañe la
calculadora). Evitar siempre titulares tipo "mejor X" que obliguen a recomendar un producto.

**Artículos escritos el 2026-10-06 a partir de esa investigación (programados)**: `invertir-100-euros-al-mes`
(27/10), `tramos-irpf-ahorro` (30/10), `gastos-comprar-vivienda-segunda-mano` (1/11),
`amortizar-hipoteca-o-invertir` (3/11), `sp500-vs-msci-world` (6/11) y `plan-de-pensiones-cuanto-desgrava`
(8/11). Siguen sin artículo: "cómo empezar a invertir con poco dinero" (solapa con
`primeros-pasos-para-invertir-en-espana` y `invertir-100-euros-al-mes`), "retención en fondos de inversión"
(solapa con `como-tributan-los-fondos-de-inversion-en-espana`) y "cuánto ahorrar al mes según el sueldo"
(la calculadora ya lo cubre).

**Herramientas creadas el 2026-10-06 a partir del informe de competencia** (sin datos externos que caduquen):
`/herramientas/calculadora-interes-compuesto/` ("interés compuesto calculadora", 2ª sugerencia de "interes
compuesto"), `/herramientas/calculadora-prestamo-tae/` ("calculadora tae", "calculadora préstamo") y
`/herramientas/calculadora-independencia-financiera/` ("calculadora independencia financiera", "calculadora fire").
Siguientes del backlog (`INFORME-COMPETENCIA-Y-AUDITORIA.md`, sección 4.1): finiquito, cuota de autónomos y despido,
que sí necesitan cifras legales verificadas en BOE/SEPE.

**Cuota de autónomos (2026-10-06)**: `/herramientas/calculadora-cuota-autonomos/` ("cuota autónomos 2026", "calculadora cuota autónomos", "tramos autónomos 2026", "tarifa plana autónomos"). Sin validar aún en autocompletado.

**Página de recurso descargable (2026-10-06)**: `/plantilla-presupuesto/` ("plantilla presupuesto mensual excel gratis",
"plantilla control de gastos excel", "excel gastos mensuales", "presupuesto mensual personal excel"; todas con demanda
confirmada en el autocompletado). Siguientes plantillas posibles con la misma fórmula: "plantilla ahorro excel",
"plantilla seguimiento de inversiones excel" (hecha el 2026-10-06, `/plantilla-seguimiento-inversiones/`) y "plantilla hipoteca excel" / "cuadro de amortización excel" (hecha el 2026-10-15, `/plantilla-hipoteca/`).


## Consultas reales de Search Console (2026-10-15, primeros 3 meses)

Google ya nos enseña en estas búsquedas (pocas impresiones todavía, posición media 51). Son prioridad para reforzar o crear la guía propia:

| Consulta | Impresiones | Página que la atiende | Acción |
|---|---|---|---|
| comparador de fondos / buscador fondos / comparador fondos de inversion | 23 / 17 / 11 | `/herramientas/comparador-fondos-indexados/` | Reforzada el 2026-10-15; vigilar posición |
| plan de pensiones o fondo indexado | 18 | `/herramientas/plan-pensiones-vs-fondo-indexado/` | Falta una guía de blog que la desarrolle (comparación fiscal con ejemplo) |
| qué es el ter / que es el ter de un etf | 13 / 9 | `/blog/ter-fondo-que-es/` | Añadir una sección sobre el TER de los ETF |
| cómo tributan los fondos de inversión / tributacion fondos de inversion | 12 / 9 | `/blog/como-tributan-los-fondos-de-inversion-en-espana/` | Cubierta; reforzar con enlaces internos |
| diferencia entre etf y fondo indexado / etf vs fondos indexados | 12 / 9 | `/blog/fondo-indexado-vs-etf-diferencias/` | Cubierta |

Revisar esta tabla cada mes con los datos nuevos de Search Console.


## Cola de temas prioritarios (2026-10-28)

Salen de un plan de 30 consultas de cola larga (sin volúmenes: orden por autocompletado, competencia y utilidad). La rutina de reposición toma **estos primero**, por este orden, antes que cualquier otro hueco. Cada artículo lleva su tabla o cálculo propio con cifras de `finance.ts` o fuente oficial verificada; los de «tabla» son **una sola página** por consulta, no una por cifra.

| Orden | Tema (consulta principal) | Formato | Qué lo hace útil | Fuente a verificar |
|---|---|---|---|---|
| 1 | sueldo neto 30.000 euros brutos (tabla de 20.000 a 50.000) | Artículo con tabla | Neto por tramo de sueldo y comunidad con la calculadora de sueldo neto | Solo `finance.ts` |
| 2 | cuota de una hipoteca de 100.000 a 250.000 euros hoy | Artículo con tabla | Cuota fija y variable con el euríbor oficial de `src/data/euribor/ultimo.json` | Fórmula de cuota; euríbor del BOE |
| 3 | finiquito: cómo se calcula (vacaciones no disfrutadas, pagas) | Artículo | Ejemplo calculado paso a paso | Estatuto de los Trabajadores (BOE) |
| 4 | a qué edad me puedo jubilar en 2027 | Artículo con tabla | Tabla oficial de edad y cotización exigida | Seguridad Social (Ley 27/2011) |
| 5 | comisión por amortización anticipada de la hipoteca | Artículo | Euros que cuesta amortizar, enlazando con la calculadora | Ley 5/2019 (BOE) |
| 6 | 14 pagas o 12 pagas: qué cambia en el neto | Artículo | Comparativa con la calculadora de sueldo neto | Solo `finance.ts` |
| 7 | gastos de formalización de la hipoteca: quién paga qué | Artículo | Quién paga notaría, registro, gestoría y tasación por ley | Ley 5/2019 (BOE) |
| 8 | letras del Tesoro: cómo tributan y rentabilidad neta | Artículo | Ejemplo neto de impuestos | AEAT; Tesoro (fecha y subasta) |
| 9 | doble imposición de dividendos extranjeros: cómo declarar | Artículo | Ejemplo con retención en origen y deducción | AEAT; convenio citado |
| 10 | impuestos al vender una vivienda (ganancia patrimonial y exenciones) | Artículo | Ejemplo con números y los casos de exención | AEAT |

Plan completo (30 consultas, herramientas a construir y cómo medir): `work/wealthuncut/crecimiento/plan.md` del Control Center. Regla: si no puedes verificar una cifra de un tema de esta lista, déjalo para el siguiente lote y escribe el siguiente de la lista; no inventes.
