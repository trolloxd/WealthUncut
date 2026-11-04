// Ediciones de /mercados/ que Google debe indexar (decisión de David, 2026-11-04).
// Las ediciones diarias son noticia del día: pasado un tiempo nadie las busca, y muchas páginas casi efímeras hechas
// en serie restan confianza al sitio y gastan rastreo (en Search Console eran la mitad de las URL sin indexar).
// Regla: una edición diaria se indexa durante DIAS_INDEXADA días desde su fecha; después lleva `noindex, follow`
// y sale del sitemap (la página sigue publicada y enlazada). Los resúmenes semanales (etiqueta "resumen semanal" o
// "resumen-semanal") se indexan siempre. Se calcula en cada build; la web se reconstruye a diario con la edición nueva.
// Se usa en astro.config.mjs (sitemap) y en src/pages/mercados/[id]/index.astro (meta robots).
import fs from 'node:fs';
import path from 'node:path';

export const DIAS_INDEXADA = 14;

/** @param {string[]} tags */
export const esResumenSemanal = (tags) => tags.some((t) => /^resumen[\s-]semanal$/i.test(String(t).trim()));

/**
 * @param {string | Date} fecha pubDate de la edición
 * @param {string[]} tags
 * @param {number} [ahora]
 */
export function edicionIndexable(fecha, tags, ahora = Date.now()) {
  if (esResumenSemanal(tags)) return true;
  const t = new Date(fecha).getTime();
  if (Number.isNaN(t)) return true;
  return (ahora - t) / 864e5 <= DIAS_INDEXADA;
}

/** @returns {Set<string>} ids (AAAA-MM-DD) de las ediciones que llevan noindex hoy. */
export function edicionesNoIndexables(dir = './src/content/mercados', ahora = Date.now()) {
  const fuera = new Set();
  if (!fs.existsSync(dir)) return fuera;
  for (const file of fs.readdirSync(dir)) {
    if (!/\.mdx?$/.test(file)) continue;
    const fm = fs.readFileSync(path.join(dir, file), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    const fecha = fm.match(/^pubDate:\s*(.+)$/m)?.[1]?.trim();
    const tags = (fm.match(/^tags:\s*\[(.*)\]/m)?.[1] ?? '').split(',').map((s) => s.trim().replace(/^["']|["']$/g, ''));
    if (fecha && !edicionIndexable(fecha, tags, ahora)) fuera.add(file.replace(/\.mdx?$/, ''));
  }
  return fuera;
}
