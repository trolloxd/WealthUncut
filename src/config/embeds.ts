/**
 * Herramientas que se pueden incrustar en otras webs con un iframe (/embed/<slug>/). `href` es la
 * página completa de la herramienta (la que enlaza la atribución) y `altura` la altura recomendada
 * del iframe en píxeles. Para añadir una nueva: registrarla aquí y en src/pages/embed/[slug].astro.
 */
export const EMBEDS = [
  { slug: 'rentabilidad-neta-fondo-indexado', nombre: 'Rentabilidad neta de un fondo indexado', href: '/blog/rentabilidad-neta-fondo-indexado/', altura: 760 },
  { slug: 'calculadora-impuestos-venta-fondos', nombre: 'Impuestos al vender un fondo', href: '/herramientas/calculadora-impuestos-venta-fondos/', altura: 1100 },
  { slug: 'comparador-fondo-indexado-vs-etf', nombre: 'Fondo indexado vs ETF', href: '/herramientas/comparador-fondo-indexado-vs-etf/', altura: 900 },
  { slug: 'calculadora-fondo-de-emergencia', nombre: 'Fondo de emergencia', href: '/herramientas/calculadora-fondo-de-emergencia/', altura: 1000 },
  { slug: 'calculadora-inflacion', nombre: 'Inflación y poder de compra', href: '/herramientas/calculadora-inflacion/', altura: 760 },
  { slug: 'calculadora-modelo-720', nombre: '¿Tengo que presentar el modelo 720?', href: '/herramientas/calculadora-modelo-720/', altura: 1200 },
  { slug: 'simulador-hipoteca-euribor', nombre: 'Simulador de hipoteca con el euríbor real', href: '/herramientas/simulador-hipoteca-euribor/', altura: 1000 },
  { slug: 'amortizar-hipoteca-cuanto-ahorras', nombre: 'Amortizar la hipoteca', href: '/herramientas/amortizar-hipoteca-cuanto-ahorras/', altura: 900 },
  { slug: 'alquilar-o-comprar-vivienda', nombre: '¿Alquilar o comprar?', href: '/herramientas/alquilar-o-comprar-vivienda/', altura: 1000 },
  { slug: 'plan-pensiones-vs-fondo-indexado', nombre: 'Plan de pensiones vs fondo indexado', href: '/herramientas/plan-pensiones-vs-fondo-indexado/', altura: 900 },
  { slug: 'calculadora-sueldo-neto', nombre: 'Calculadora de sueldo neto', href: '/herramientas/calculadora-sueldo-neto/', altura: 800 },
  { slug: 'ahorro-entrada-piso', nombre: '¿Cuánto ahorrar para la entrada de un piso?', href: '/herramientas/ahorro-entrada-piso/', altura: 760 },
  { slug: 'ranking-irpf-comunidades', nombre: '¿Dónde pagas menos IRPF?', href: '/herramientas/ranking-irpf-comunidades/', altura: 1000 },
] as const;

export const EMBED_POR_SLUG = new Map<string, (typeof EMBEDS)[number]>(EMBEDS.map((e) => [e.slug, e]));
