/**
 * Dónde va el bloque de captación central de un artículo: delante del `##` que cae hacia la mitad del texto.
 * Se decide con los encabezados que devuelve `render()` (`headings`), sin tocar el MDX de cada artículo.
 */
export interface Encabezado {
  depth: number;
  slug: string;
  text: string;
}

/** `id` del `h2` delante del cual va el bloque, o null si el artículo tiene menos de 4 secciones. */
export function idH2Medio(headings: readonly Encabezado[]): string | null {
  const h2 = headings.filter((h) => h.depth === 2);
  if (h2.length < 4) return null;
  let k = Math.floor(h2.length / 2);
  while (k > 1 && /preguntas frecuentes|fuentes|conclusi/i.test(h2[k].text)) k--;
  return h2[k].slug;
}
