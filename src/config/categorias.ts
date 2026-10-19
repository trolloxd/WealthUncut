/**
 * Temas del blog (/blog/tema/<id>/). Cada artículo lleva `categoria: <id>` en el frontmatter; si falta,
 * se deduce de las etiquetas con `categoriaDe` (primera coincidencia en el orden de esta lista).
 * Una categoría solo se muestra cuando tiene algún artículo publicado. Para crear un tema nuevo,
 * añadirlo aquí y usar su `id` en los artículos.
 */
export const CATEGORIAS = [
  {
    id: 'fondos-indexados',
    nombre: 'Fondos indexados e inversión',
    descripcion: 'Qué son los fondos indexados, cómo montar una cartera, comisiones, ETF frente a fondos y cuánto rinde de verdad invertir.',
    intro:
      'Un fondo indexado copia un índice (por ejemplo, las grandes empresas del mundo) con costes muy bajos, sin que nadie intente adivinar qué acciones ganarán. Aquí tienes cómo funcionan, qué comisión (TER) conviene mirar, cómo montar una cartera con pocos fondos, en qué se diferencian de los ETF y cuánto rinde de verdad una aportación mensual una vez descontados costes e impuestos. Cada guía lleva cálculos propios y se complementa con el comparador de fondos y el simulador de carteras.',
    tags: ['fondos indexados', 'etf', 'carteras', 'interés compuesto', 'inversión'],
  },
  {
    id: 'impuestos',
    nombre: 'Impuestos de las inversiones',
    descripcion: 'Cómo tributan fondos, dividendos y ganancias en España: tramos del ahorro, declaraciones y modelos informativos.',
    intro:
      'Las ganancias de fondos, acciones y ETF, los dividendos y los intereses tributan en España en la base del ahorro, con tramos distintos a los del sueldo. Estas guías explican cuándo se paga (y cuándo no, como en un traspaso entre fondos), cómo se aplica el método FIFO, qué retenciones te hacen y qué declaraciones informativas hay que presentar, con ejemplos en euros y las cifras de la Agencia Tributaria.',
    tags: ['impuestos', 'brokers'],
  },
  {
    id: 'vivienda',
    nombre: 'Vivienda e hipotecas',
    descripcion: 'Alquilar o comprar, ahorrar la entrada, hipotecas fijas o variables, gastos de compra y zonas tensionadas.',
    intro:
      'Comprar o alquilar es la decisión financiera más grande de muchas personas jóvenes. Aquí comparamos las cuentas reales: cuánto hay que ahorrar para la entrada, qué impuestos y gastos se suman, qué hipoteca elegir con el euríbor actual, cuándo conviene amortizar y qué cambia en una zona tensionada. Cada guía enlaza con simuladores para probar tus números.',
    tags: ['vivienda', 'hipoteca', 'alquiler'],
  },
  {
    id: 'autonomos',
    nombre: 'Autónomos',
    descripcion: 'Cuotas, IRPF, IVA y plazos para quien trabaja por cuenta propia en España.',
    intro:
      'Trabajar por cuenta propia cambia tus impuestos: cuota de la Seguridad Social según tus ingresos reales, IVA trimestral, retenciones y pagos a cuenta del IRPF. Estas guías ordenan qué paga un autónomo y cuándo, con las cifras publicadas en el BOE, y se complementan con calculadoras de cuota y de facturas.',
    tags: ['autónomos'],
  },
  {
    id: 'criptomonedas',
    nombre: 'Criptomonedas y fiscalidad',
    descripcion: 'Cómo tributan las criptomonedas en España y qué información recibe Hacienda.',
    intro:
      'Las criptomonedas tributan en el IRPF como cualquier otra ganancia patrimonial, y Hacienda recibe información de los exchanges. Aquí se explica qué operaciones cuentan (también los cambios entre criptomonedas), cómo se calcula la ganancia con el método FIFO y qué declaraciones informativas existen. Es información fiscal, no una recomendación de invertir.',
    tags: ['criptomonedas'],
  },
  {
    id: 'jubilacion',
    nombre: 'Jubilación y pensiones',
    descripcion: 'Planes de pensiones, desgravación y cómo planificar el largo plazo.',
    intro:
      'Planificar el largo plazo empieza por entender las herramientas disponibles. Aquí revisamos los planes de pensiones, cuánto desgravan en el IRPF y cómo se comparan con invertir en fondos, siempre con cifras oficiales y ejemplos calculados.',
    tags: ['pensiones', 'jubilación'],
  },
  {
    id: 'trabajo',
    nombre: 'Nómina y trabajo',
    descripcion: 'Sueldo neto, IRPF de la nómina, despidos y bajas laborales: cuánto cobras y qué dice la ley.',
    intro:
      'Cuánto cobras de verdad y qué te corresponde cuando algo cambia: del bruto al neto de tu nómina, la indemnización por despido, el finiquito o lo que se cobra durante una baja médica. Cada guía se apoya en la ley y en una calculadora para que pongas tus números.',
    tags: ['nómina', 'empleo'],
  },
  {
    id: 'ahorro',
    nombre: 'Ahorro y finanzas básicas',
    descripcion: 'Fondo de emergencia, ahorrar frente a invertir y los primeros pasos para ordenar tu dinero.',
    intro:
      'Antes de invertir conviene tener una base: saber cuánto te sobra, un fondo de emergencia y claridad sobre la diferencia entre ahorrar e invertir. Estas guías cubren los primeros pasos para ordenar tu dinero, con datos reales y herramientas para calcularlo.',
    tags: ['ahorro', 'educación financiera'],
  },
] as const;

export type CategoriaId = (typeof CATEGORIAS)[number]['id'];

export const CATEGORIA_POR_ID = new Map<string, (typeof CATEGORIAS)[number]>(CATEGORIAS.map((c) => [c.id, c]));

/** Categoría de un artículo: la del frontmatter o, si falta o no existe, la primera cuyas etiquetas coincidan. */
export function categoriaDe(data: { categoria?: string; tags: readonly string[] }) {
  if (data.categoria && CATEGORIA_POR_ID.has(data.categoria)) return CATEGORIA_POR_ID.get(data.categoria)!;
  // Con etiquetas, gana la que aparece antes en el artículo (la principal), no la primera categoría de la lista.
  for (const tag of data.tags) {
    const c = CATEGORIAS.find((x) => (x.tags as readonly string[]).includes(tag));
    if (c) return c;
  }
  return CATEGORIAS[CATEGORIAS.length - 1];
}
