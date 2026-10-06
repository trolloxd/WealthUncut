/**
 * Listado de herramientas del sitio: lo usan la página /herramientas/, la portada, el menú y los
 * bloques de enlaces relacionados. `tags` usa el mismo vocabulario que las etiquetas de los
 * artículos del blog, para enlazar cada artículo con las herramientas y guías que le encajan.
 */
export const TOOLS = [
  {
    href: '/blog/rentabilidad-neta-fondo-indexado/',
    name: 'Rentabilidad neta de un fondo indexado',
    description: 'Cuánto te queda de verdad después de TER, comisiones e IRPF del ahorro.',
    tags: ['fondos indexados', 'calculadoras', 'impuestos'],
  },
  {
    href: '/herramientas/calculadora-impuestos-venta-fondos/',
    name: 'Impuestos al vender un fondo',
    description: 'Qué participaciones vendes por FIFO, cuánto pagas, la retención y lo que recibes.',
    tags: ['impuestos', 'fondos indexados'],
  },
  {
    href: '/herramientas/comparador-fondo-indexado-vs-etf/',
    name: 'Fondo indexado vs ETF',
    description: 'Comisiones por compra, TER e impuestos al cambiar de producto, con tus números.',
    tags: ['fondos indexados', 'etf', 'impuestos'],
  },
  {
    href: '/herramientas/calculadora-fondo-de-emergencia/',
    name: 'Fondo de emergencia',
    description: 'Cuánto colchón necesitas según tus gastos y tu situación, y cuándo lo tendrás.',
    tags: ['educación financiera', 'ahorro'],
  },
  {
    href: '/herramientas/calculadora-inflacion/',
    name: 'Inflación y poder de compra',
    description: 'Cuánto pierde tu dinero parado o en una cuenta, y qué interés necesitas para no perder.',
    tags: ['educación financiera', 'ahorro', 'interés compuesto'],
  },
  {
    href: '/herramientas/calculadora-modelo-720/',
    name: '¿Tengo que presentar el modelo 720?',
    description: 'Comprobación bloque a bloque si tienes cuentas, fondos o ETF en el extranjero.',
    tags: ['impuestos', 'brokers'],
  },
  {
    href: '/herramientas/simulador-hipoteca-euribor/',
    name: 'Simulador de hipoteca con el euríbor real',
    description: 'Cuota de una hipoteca fija, variable o mixta con el euríbor real y escenarios de subida y bajada.',
    tags: ['vivienda', 'hipoteca'],
  },
  {
    href: '/herramientas/plan-pensiones-vs-fondo-indexado/',
    name: 'Plan de pensiones vs fondo indexado',
    description: 'Cuánto te queda neto con la reducción fiscal de la aportación y los impuestos al rescatarlo o venderlo.',
    tags: ['pensiones', 'fondos indexados', 'impuestos'],
  },
  {
    href: '/herramientas/calculadora-sueldo-neto/',
    name: 'Calculadora de sueldo neto',
    description: 'De bruto a neto con la Seguridad Social y el IRPF real de tu comunidad autónoma, no solo la escala estatal.',
    tags: ['nómina', 'impuestos', 'educación financiera'],
  },
  {
    href: '/herramientas/amortizar-hipoteca-cuanto-ahorras/',
    name: 'Amortizar la hipoteca',
    description: 'Cuántos intereses te ahorras al amortizar parte de tu hipoteca, reduciendo plazo o cuota, y qué te costaría la comisión.',
    tags: ['vivienda', 'hipoteca', 'ahorro'],
  },
  {
    href: '/herramientas/alquilar-o-comprar-vivienda/',
    name: '¿Alquilar o comprar?',
    description: 'Compara tu patrimonio dentro de unos años comprando con hipoteca o alquilando e invirtiendo la diferencia.',
    tags: ['vivienda', 'hipoteca', 'ahorro'],
  },
  {
    href: '/herramientas/ahorro-entrada-piso/',
    name: '¿Cuánto ahorrar para la entrada de un piso?',
    description: 'Entrada, impuesto de compra (ITP) de tu comunidad y gastos, y cuánto tardarás en ahorrarlo.',
    tags: ['vivienda', 'ahorro'],
  },
  {
    href: '/herramientas/comparador-cuentas-remuneradas/',
    name: 'Comparador de cuentas remuneradas y depósitos',
    description: 'Las TAE reales de ahora mismo, actualizado, sin ranking pagado ni afiliación.',
    tags: ['ahorro', 'cuentas'],
  },
  {
    href: '/herramientas/comparador-fondos-indexados/',
    name: 'Comparador de fondos indexados',
    description: 'TER, índice y dónde está cada fondo disponible en España, ordenado por coste.',
    tags: ['fondos indexados'],
  },
  {
    href: '/herramientas/ranking-irpf-comunidades/',
    name: '¿Dónde pagas menos IRPF?',
    description: 'Ranking de las 17 comunidades autónomas con tu mismo sueldo, de la que más neto deja a la que menos.',
    tags: ['impuestos', 'nómina'],
  },
  {
    href: '/herramientas/calculadora-impuesto-dividendos/',
    name: 'Impuesto de los dividendos',
    description: 'IRPF, retención y doble imposición si cobras dividendos, y lo que te queda neto.',
    tags: ['impuestos', 'fondos indexados', 'etf'],
  },
  {
    href: '/herramientas/cuanto-ahorrar-al-mes/',
    name: 'Cuánto ahorrar al mes (regla 50/30/20)',
    description: 'Cuánto ahorras hoy frente a la regla 50/30/20 y cuánto tendrías en unos años.',
    tags: ['educación financiera', 'ahorro', 'interés compuesto'],
  },
  {
    href: '/herramientas/itp-por-comunidades/',
    name: 'ITP por comunidades autónomas',
    description: 'Tabla del impuesto de compra de vivienda usada en cada comunidad y cuánto pagas por un piso.',
    tags: ['vivienda', 'ahorro', 'impuestos'],
  },
  {
    href: '/herramientas/calculadora-interes-compuesto/',
    name: 'Calculadora de interés compuesto',
    description: 'Cuánto tendrías con aportaciones mensuales, en euros de hoy y tras impuestos.',
    tags: ['interés compuesto', 'educación financiera', 'calculadoras', 'ahorro'],
  },
  {
    href: '/herramientas/calculadora-prestamo-tae/',
    name: 'Calculadora de préstamo y TAE',
    description: 'Cuota, intereses y TAE real de un préstamo, o del TIN de un depósito a su TAE.',
    tags: ['ahorro', 'cuentas', 'educación financiera'],
  },
  {
    href: '/herramientas/calculadora-independencia-financiera/',
    name: 'Independencia financiera (FIRE)',
    description: 'Tu número para vivir de tus inversiones y cuántos años te faltan.',
    tags: ['educación financiera', 'ahorro', 'interés compuesto'],
  },
  {
    href: '/plantilla-presupuesto/',
    name: 'Plantilla de presupuesto mensual (Excel)',
    description: 'Descarga gratis una plantilla para controlar gastos, ahorro y deudas, con gráficos y vídeos.',
    tags: ['ahorro', 'educación financiera', 'calculadoras'],
  },
  {
    href: '/plantilla-seguimiento-inversiones/',
    name: 'Plantilla de seguimiento de inversiones (Excel)',
    description: 'Descarga gratis una plantilla para seguir tus fondos indexados: rentabilidad, TIR, costes, reequilibrio e impuesto estimado.',
    tags: ['fondos indexados', 'carteras', 'calculadoras'],
  },
  {
    href: '/carteras/',
    name: 'Carteras de fondos',
    description: 'Busca entre más de 1.600 fondos, reparte pesos y simula tu cartera bruta y neta de impuestos.',
    tags: ['fondos indexados', 'carteras', 'calculadoras'],
  },
] as const;

/** Herramientas más afines a un conjunto de etiquetas (las que comparten más), con relleno por orden. */
export function herramientasRelacionadas(tags: readonly string[], excluirHref?: string, max = 3) {
  return TOOLS.filter((t) => t.href !== excluirHref)
    .map((t, i) => ({ t, i, shared: t.tags.filter((x) => tags.includes(x)).length }))
    .sort((a, b) => b.shared - a.shared || a.i - b.i)
    .slice(0, max)
    .map((r) => r.t);
}
