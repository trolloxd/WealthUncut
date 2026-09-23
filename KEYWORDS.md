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
| que es un fondo indexado (y como funciona) | `que-es-un-fondo-indexado` | Borrador | **Pilar clúster 3** |
| fondo indexado vs etf diferencias | `fondo-indexado-vs-etf-diferencias` | Borrador | Clúster 3 |
| ter que es y cuanto es razonable pagar | `ter-fondo-que-es` | Borrador | Clúster 3 |
| como tributan los fondos de inversion en españa, traspaso entre fondos tributa, irpf ahorro tramos | `como-tributan-los-fondos-de-inversion-en-espana` | Borrador | **Pilar clúster 4** |
| modelo 720 cuando es obligatorio / obligados | `modelo-720-quien-tiene-que-presentarlo` | Borrador | Clúster 4 |
| diferencia entre ahorrar e invertir | `diferencia-entre-ahorrar-e-invertir` | Borrador | Clúster 5 |
| fondo de emergencia cuanto debe ser | `fondo-de-emergencia-cuanto-necesitas` | Borrador | Clúster 5 |
| primeros pasos para invertir en españa, como empezar a invertir siendo joven | `primeros-pasos-para-invertir-en-espana` | Borrador | **Pilar clúster 5** |

Huecos sin artículo todavía (candidatos a próximas piezas, sin escribir): plan de pensiones vs
fondo indexado (clúster 6, validado), cuenta bancaria para jóvenes por edad (clúster 1, validado,
esperar a tener afiliación), mejor broker para fondos indexados (clúster 2, validado, esperar a
tener afiliación), impuesto por dividendos en España y cómo declarar ganancias de bolsa
(clúster 4, sin validar).

## Siguiente paso

Este documento ya tiene validación real (autocompletado) para 8 términos clave, pero sigue sin
cifras de volumen ni competencia. Si en algún momento decides sí crear la cuenta de Google Ads
(sabiendo que implica pasar por su asistente de campaña), retoma la validación por volumen desde
ahí. Mientras tanto, prioriza los clústeres 3, 4 y 5 con la evidencia que ya hay.
