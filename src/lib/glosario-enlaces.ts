/**
 * Enlaces automáticos entre artículos y glosario: dado el texto de un artículo, qué términos del glosario
 * aparecen (para enlazarlos en "Términos de este artículo") y, al revés, qué artículos mencionan un término.
 * Así cada artículo y cada término nuevo se conectan solos, sin mantener listas a mano.
 */

export const normaliza = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/** Texto plano de un cuerpo MDX: sin importaciones, etiquetas ni sintaxis de enlaces (queda el texto visible). */
export function textoPlano(mdx: string): string {
  return mdx
    .replace(/^import .*$/gm, ' ')
    .replace(/^export .*$/gm, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*_>#|]/g, ' ');
}

const escapa = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Quita el paréntesis aclaratorio: "Base del ahorro (IRPF)" se busca como "base del ahorro". */
export const formaBuscada = (termino: string): string => normaliza(termino.replace(/\s*\([^)]*\)/g, '').trim());

/** Cuántas veces aparece el término como palabra completa (sin tildes ni mayúsculas) en un texto ya normalizado. */
export function contarTermino(textoNormalizado: string, termino: string): number {
  const forma = formaBuscada(termino);
  if (forma.length < 3) return 0;
  const re = new RegExp(`(?<![a-z0-9])${escapa(forma)}(?![a-z0-9])`, 'g');
  return (textoNormalizado.match(re) ?? []).length;
}

/** Términos que aparecen en el texto, de más a menos menciones (mínimo `minimo`), hasta `max`. */
export function terminosEnTexto<T extends { termino: string }>(texto: string, terminos: T[], max = 6, minimo = 1): T[] {
  const n = normaliza(textoPlano(texto));
  return terminos
    .map((t) => ({ t, veces: contarTermino(n, t.termino) }))
    .filter((x) => x.veces >= minimo)
    .sort((a, b) => b.veces - a.veces)
    .slice(0, max)
    .map((x) => x.t);
}
