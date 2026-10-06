/**
 * Retos de 2 minutos para la página /hoy/. Uno por día, rotando por día del año. Son acciones
 * educativas y genéricas (nunca recomendaciones de producto ni de inversión personalizadas) que
 * llevan a una herramienta o guía del sitio. Para añadir uno, basta con una línea nueva: la rotación
 * se ajusta sola al número de elementos.
 */
export interface Microreto {
  texto: string;
  href: string;
  enlace: string;
}

export const MICRORETOS: Microreto[] = [
  { texto: 'Calcula cuánto te queda neto de tu sueldo y compáralo con lo que crees que ingresas.', href: '/herramientas/calculadora-sueldo-neto/', enlace: 'Calculadora de sueldo neto' },
  { texto: 'Mira cuántos meses aguantarías sin ingresos con el dinero que tienes disponible.', href: '/herramientas/calculadora-fondo-de-emergencia/', enlace: 'Fondo de emergencia' },
  { texto: 'Descubre cuánto poder de compra pierde tu dinero parado en un año.', href: '/herramientas/calculadora-inflacion/', enlace: 'Calculadora de inflación' },
  { texto: 'Apunta tus gastos fijos del mes y comprueba cuántos entran en la regla 50/30/20.', href: '/herramientas/cuanto-ahorrar-al-mes/', enlace: 'Cuánto ahorrar al mes' },
  { texto: 'Lee qué es el TER de un fondo y busca el de uno que conozcas.', href: '/blog/ter-fondo-que-es/', enlace: 'Qué es el TER' },
  { texto: 'Simula 100 € al mes durante 20 años y fíjate en cuánto del resultado es ganancia.', href: '/blog/invertir-100-euros-al-mes/', enlace: 'Invertir 100 euros al mes' },
  { texto: 'Comprueba en qué cuenta tendrías hoy mejor interés para tu colchón.', href: '/herramientas/comparador-cuentas-remuneradas/', enlace: 'Cuentas remuneradas' },
  { texto: 'Descubre cuánto pagarías de IRPF en otra comunidad autónoma con tu mismo sueldo.', href: '/herramientas/ranking-irpf-comunidades/', enlace: 'Ranking de IRPF' },
  { texto: 'Aprende la diferencia entre ahorrar e invertir antes de mover un euro.', href: '/blog/diferencia-entre-ahorrar-e-invertir/', enlace: 'Ahorrar o invertir' },
  { texto: 'Mira cuánto tendrías que ahorrar al mes para la entrada de un piso.', href: '/herramientas/ahorro-entrada-piso/', enlace: 'Entrada de un piso' },
  { texto: 'Prueba cuánto cambiaría tu cuota de hipoteca si el euríbor subiera un punto.', href: '/herramientas/simulador-hipoteca-euribor/', enlace: 'Simulador de hipoteca' },
  { texto: 'Mira qué impuesto pagarías si vendieras hoy un fondo con ganancias.', href: '/herramientas/calculadora-impuestos-venta-fondos/', enlace: 'Impuestos al vender un fondo' },
  { texto: 'Entiende cómo funciona el interés compuesto con un ejemplo real.', href: '/blog/interes-compuesto-explicado-con-ejemplos/', enlace: 'Interés compuesto' },
  { texto: 'Compara fondo indexado y ETF con tus propios números.', href: '/herramientas/comparador-fondo-indexado-vs-etf/', enlace: 'Fondo indexado o ETF' },
  { texto: 'Descubre si tu situación te obliga a presentar el modelo 720.', href: '/herramientas/calculadora-modelo-720/', enlace: 'Modelo 720' },
  { texto: 'Mira cuánto desgrava un plan de pensiones según tu tipo marginal.', href: '/blog/plan-de-pensiones-cuanto-desgrava/', enlace: 'Plan de pensiones' },
  { texto: 'Descubre qué se paga de verdad al comprar una vivienda de segunda mano.', href: '/blog/gastos-comprar-vivienda-segunda-mano/', enlace: 'Gastos de compra' },
  { texto: 'Comprueba en qué comunidad pagarías menos ITP por un piso de 200.000 €.', href: '/herramientas/itp-por-comunidades/', enlace: 'ITP por comunidades' },
  { texto: 'Prueba qué pasa si amortizas parte de tu hipoteca en lugar de invertir.', href: '/blog/amortizar-hipoteca-o-invertir/', enlace: 'Amortizar o invertir' },
  { texto: 'Monta una cartera de ejemplo con tres fondos y mira el reparto por tipo de activo.', href: '/carteras/', enlace: 'Carteras' },
  { texto: 'Lee la diferencia entre S&P 500 y MSCI World y qué parte del mundo compras con cada uno.', href: '/blog/sp500-vs-msci-world/', enlace: 'S&P 500 o MSCI World' },
  { texto: 'Calcula si te sale mejor alquilar o comprar con tus supuestos.', href: '/herramientas/alquilar-o-comprar-vivienda/', enlace: 'Alquilar o comprar' },
  { texto: 'Entiende cómo tributan los dividendos y qué es la doble imposición.', href: '/herramientas/calculadora-impuesto-dividendos/', enlace: 'Impuesto de los dividendos' },
  { texto: 'Repasa los tramos del IRPF del ahorro y localiza en cuál estarías.', href: '/blog/tramos-irpf-ahorro/', enlace: 'Tramos del IRPF del ahorro' },
  { texto: 'Compara cuánto cuesta una diferencia de 1 punto de comisión a 30 años.', href: '/blog/rentabilidad-neta-fondo-indexado/', enlace: 'Rentabilidad neta' },
  { texto: 'Aprende por qué un traspaso entre fondos no tributa y un ETF sí.', href: '/blog/como-tributan-los-fondos-de-inversion-en-espana/', enlace: 'Cómo tributan los fondos' },
  { texto: 'Mira el orden de pasos que importa antes de empezar a invertir.', href: '/blog/primeros-pasos-para-invertir-en-espana/', enlace: 'Primeros pasos' },
  { texto: 'Calcula cuánto cuesta amortizar tu hipoteca reduciendo cuota o plazo.', href: '/blog/amortizar-hipoteca-reducir-cuota-o-plazo/', enlace: 'Reducir cuota o plazo' },
  { texto: 'Compara cuánto cambia la cuota entre una hipoteca fija, variable y mixta.', href: '/blog/hipoteca-fija-variable-o-mixta/', enlace: 'Fija, variable o mixta' },
  { texto: 'Lee qué es un fondo indexado sin jerga y qué hay detrás de un índice.', href: '/blog/que-es-un-fondo-indexado/', enlace: 'Qué es un fondo indexado' },
  { texto: 'Compara plan de pensiones y fondo indexado con tus datos.', href: '/herramientas/plan-pensiones-vs-fondo-indexado/', enlace: 'Plan de pensiones vs fondo' },
  { texto: 'Calcula cuántos años te faltan para vivir de tus inversiones con tu ahorro actual.', href: '/herramientas/calculadora-independencia-financiera/', enlace: 'Independencia financiera' },
  { texto: 'Convierte el TIN que anuncia un banco en TAE y mira cuánto rinde de verdad.', href: '/herramientas/calculadora-prestamo-tae/', enlace: 'TAE' },
  { texto: 'Simula tu ahorro con interés compuesto y mira qué parte del resultado son intereses.', href: '/herramientas/calculadora-interes-compuesto/', enlace: 'Interés compuesto' },
  { texto: 'Descarga la plantilla de presupuesto y apunta tus gastos de esta semana.', href: '/plantilla-presupuesto/', enlace: 'Plantilla de presupuesto' },
  { texto: 'Descarga la plantilla de seguimiento y apunta tus fondos para saber cuánto llevas ganado de verdad.', href: '/plantilla-seguimiento-inversiones/', enlace: 'Plantilla de inversiones' },
];
