/**
 * Bloques de captación contextuales (newsletter, herramientas gratuitas, plantillas y calendario fiscal).
 *
 * Un solo sitio para: qué recurso se ofrece en cada tema, qué variantes se comparan y cómo se reparten.
 * Es `.mjs` para que lo use también `astro.config.mjs` (plugin rehype del bloque central de los artículos)
 * y las pruebas, sin pasos de compilación.
 *
 * Reparto de variantes, sin cookies ni almacenamiento en el navegador: la variante de cada artículo sale de
 * una función determinista del slug y de la semana ISO del build (`variantePara`). Como el sitio se
 * reconstruye a diario, cada semana todos los artículos rotan solos de variante y el informe semanal puede
 * recalcular qué variante vio cada artículo cada semana sin guardar nada más. Con la misma función se
 * decide la variante en el servidor (HTML estático, sin salto de maquetación) y la usa el informe.
 */

/** Variantes del bloque central del artículo. */
export const VARIANTES_MEDIO = ['herramienta', 'recurso', 'boletin'];
/** Variantes del bloque final (formulario de la newsletter): titular genérico o centrado en el tema. */
export const VARIANTES_FINAL = ['generico', 'tema'];
export const POSICIONES = ['medio', 'final', 'herramienta', 'otro'];
export const EVENTOS = ['vista', 'clic', 'envio'];

/**
 * Recurso gratuito por tema. `herramienta`: la calculadora o comparador que resuelve la duda del tema.
 * `recurso`: plantilla descargable o calendario. `boletin`: frase del tema para la newsletter.
 * Cada `href` debe existir (lo comprueba tests/cta.test.ts).
 */
export const CTA_POR_TEMA = {
  'fondos-indexados': {
    nombre: 'fondos indexados',
    herramienta: { href: '/carteras/', titulo: 'Simula tu cartera de fondos indexados', texto: 'Reparte el peso entre fondos y mira cuánto podrías tener, con costes reales.' },
    recurso: { href: '/plantilla-seguimiento-inversiones/', titulo: 'Plantilla de Excel para seguir tus inversiones', texto: 'Gratis: aportaciones, valor y rentabilidad de tus fondos en una hoja.' },
    boletin: 'Cada semana, lo que ha pasado con los fondos y los mercados, en 5 minutos.',
  },
  impuestos: {
    nombre: 'impuestos de las inversiones',
    herramienta: { href: '/herramientas/calculadora-impuestos-venta-fondos/', titulo: 'Calcula los impuestos al vender un fondo', texto: 'Qué participaciones vendes por FIFO, cuánto pagas y lo que recibes.' },
    recurso: { href: '/herramientas/calendario-fiscal/', titulo: 'Calendario fiscal con avisos en tu móvil', texto: 'Las fechas que te tocan según seas asalariado, autónomo o inversor. Descarga gratis.' },
    boletin: 'Los cambios fiscales y las fechas que importan a quien invierte, en 5 minutos a la semana.',
  },
  vivienda: {
    nombre: 'vivienda e hipotecas',
    herramienta: { href: '/herramientas/simulador-hipoteca-euribor/', titulo: 'Simula tu hipoteca con el euríbor real', texto: 'Cuota fija, variable o mixta y qué pasa si el euríbor sube o baja.' },
    recurso: { href: '/plantilla-hipoteca/', titulo: 'Plantilla de Excel de tu hipoteca', texto: 'Gratis: cuadro de amortización con revisiones de tipo y entregas extra.' },
    boletin: 'El euríbor, las hipotecas y la vivienda, resumidos cada semana en 5 minutos.',
  },
  autonomos: {
    nombre: 'autónomos',
    herramienta: { href: '/herramientas/calculadora-cuota-autonomos/', titulo: 'Calcula tu cuota de autónomo', texto: 'Qué te toca pagar según tus ingresos reales, con las tablas del BOE.' },
    recurso: { href: '/herramientas/calendario-fiscal/', titulo: 'Calendario fiscal del autónomo', texto: 'IVA, IRPF y cuotas con aviso 7 y 1 días antes. Descarga gratis.' },
    boletin: 'Plazos, cuotas y cambios que afectan a autónomos, en 5 minutos a la semana.',
  },
  criptomonedas: {
    nombre: 'criptomonedas y Hacienda',
    herramienta: { href: '/herramientas/ranking-irpf-comunidades/', titulo: '¿Dónde pagas menos IRPF?', texto: 'Ranking de las comunidades autónomas con los tramos reales.' },
    recurso: { href: '/herramientas/calendario-fiscal/', titulo: 'Calendario fiscal para inversores', texto: 'Fechas de la renta y de los modelos informativos. Descarga gratis.' },
    boletin: 'Lo que cambia en la fiscalidad de lo que inviertes, explicado en 5 minutos a la semana.',
  },
  jubilacion: {
    nombre: 'jubilación y pensiones',
    herramienta: { href: '/herramientas/plan-pensiones-vs-fondo-indexado/', titulo: 'Plan de pensiones o fondo indexado', texto: 'Cuánto te queda neto con cada opción, con tus números.' },
    recurso: { href: '/herramientas/calculadora-independencia-financiera/', titulo: 'Calcula tu número para la independencia financiera', texto: 'Cuánto necesitas ahorrar y en cuánto tiempo lo conseguirías.' },
    boletin: 'Ahorro a largo plazo y pensiones, con números, en 5 minutos a la semana.',
  },
  trabajo: {
    nombre: 'trabajo y sueldo',
    herramienta: { href: '/herramientas/calculadora-sueldo-neto/', titulo: 'Calcula tu sueldo neto', texto: 'De bruto a neto con la Seguridad Social y el IRPF de tu comunidad.' },
    recurso: { href: '/plantilla-presupuesto/', titulo: 'Plantilla de presupuesto mensual en Excel', texto: 'Gratis: movimientos, categorías y regla 50/30/20 en una hoja.' },
    boletin: 'Sueldo, impuestos y ahorro, en 5 minutos a la semana.',
  },
  ahorro: {
    nombre: 'ahorro',
    herramienta: { href: '/herramientas/cuanto-ahorrar-al-mes/', titulo: 'Cuánto ahorrar al mes según tu sueldo', texto: 'Compara lo que ahorras hoy con la regla 50/30/20.' },
    recurso: { href: '/plantilla-presupuesto/', titulo: 'Plantilla de presupuesto mensual en Excel', texto: 'Gratis: movimientos, categorías, objetivos y deudas en una hoja.' },
    boletin: 'Ahorro, cuentas y mercados, resumidos en 5 minutos a la semana.',
  },
};

/** Si un tema no tiene entrada (o es una página sin tema), se usa esta. */
export const CTA_GENERICO = CTA_POR_TEMA.ahorro;
export const TEMAS_MEDIBLES = [...Object.keys(CTA_POR_TEMA), 'herramientas', 'otro'];

export const ctaDeTema = (tema) => CTA_POR_TEMA[tema] ?? CTA_GENERICO;

/** Número de semana ISO (año y semana) de una fecha, en UTC. */
export function semanaIso(fecha) {
  const d = new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()));
  const dia = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dia);
  const inicioAnio = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const semana = Math.ceil(((d.getTime() - inicioAnio.getTime()) / 86400000 + 1) / 7);
  return { anio: d.getUTCFullYear(), semana };
}

/** Hash pequeño y estable (FNV-1a) de un texto. */
export function hash(texto) {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * Variante de un artículo en una fecha: el hash del slug fija en qué punto del ciclo está y cada semana ISO
 * avanza una variante. Así, a igualdad de semana, los artículos se reparten por igual entre variantes.
 */
export function variantePara(slug, fecha, variantes = VARIANTES_MEDIO) {
  const { anio, semana } = semanaIso(fecha);
  const idx = (hash(slug) + anio * 53 + semana) % variantes.length;
  return variantes[idx];
}
