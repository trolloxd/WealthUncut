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
    tags: ['fondos indexados', 'etf', 'carteras', 'interés compuesto', 'inversión'],
  },
  {
    id: 'impuestos',
    nombre: 'Impuestos de las inversiones',
    descripcion: 'Cómo tributan fondos, dividendos y ganancias en España: tramos del ahorro, declaraciones y modelos informativos.',
    tags: ['impuestos', 'brokers'],
  },
  {
    id: 'vivienda',
    nombre: 'Vivienda e hipotecas',
    descripcion: 'Alquilar o comprar, ahorrar la entrada, hipotecas fijas o variables, gastos de compra y zonas tensionadas.',
    tags: ['vivienda', 'hipoteca', 'alquiler'],
  },
  {
    id: 'autonomos',
    nombre: 'Autónomos',
    descripcion: 'Cuotas, IRPF, IVA y plazos para quien trabaja por cuenta propia en España.',
    tags: ['autónomos'],
  },
  {
    id: 'criptomonedas',
    nombre: 'Criptomonedas y fiscalidad',
    descripcion: 'Cómo tributan las criptomonedas en España y qué información recibe Hacienda.',
    tags: ['criptomonedas'],
  },
  {
    id: 'jubilacion',
    nombre: 'Jubilación y pensiones',
    descripcion: 'Planes de pensiones, desgravación y cómo planificar el largo plazo.',
    tags: ['pensiones', 'jubilación'],
  },
  {
    id: 'ahorro',
    nombre: 'Ahorro y finanzas básicas',
    descripcion: 'Fondo de emergencia, ahorrar frente a invertir y los primeros pasos para ordenar tu dinero.',
    tags: ['ahorro', 'educación financiera', 'empleo'],
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
