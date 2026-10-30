// Páginas de tema (/blog/tema/<id>/) con muy poco contenido: una página de tema con un solo artículo es casi un
// duplicado del propio artículo y Google tiende a no indexarla. Mientras un tema tenga menos de MIN_ARTICULOS_TEMA
// artículos publicados, su página lleva `noindex, follow` y no entra en el sitemap; en cuanto llega al mínimo, se
// indexa sola en el siguiente build. El recuento lee el frontmatter (`categoria`, `draft`, `pubDate`) con la misma
// regla que `isPublished` (src/lib/posts.ts). Se usa en astro.config.mjs (sitemap) y en la página del tema.
import fs from 'node:fs';
import path from 'node:path';

export const MIN_ARTICULOS_TEMA = 2;

/** @returns {Set<string>} ids de tema con menos de MIN_ARTICULOS_TEMA artículos publicados (y al menos uno). */
export function temasFinos(dirBlog = './src/content/blog') {
  const cuenta = new Map();
  if (!fs.existsSync(dirBlog)) return new Set();
  for (const file of fs.readdirSync(dirBlog)) {
    if (!/\.mdx?$/.test(file)) continue;
    const fm = fs.readFileSync(path.join(dirBlog, file), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    if (/^draft:\s*true/m.test(fm)) continue;
    const fecha = fm.match(/^pubDate:\s*(.+)$/m)?.[1]?.trim();
    if (!fecha || new Date(fecha).getTime() > Date.now()) continue;
    const cat = fm.match(/^categoria:\s*"?([a-z-]+)"?/m)?.[1];
    if (cat) cuenta.set(cat, (cuenta.get(cat) ?? 0) + 1);
  }
  return new Set([...cuenta].filter(([, n]) => n < MIN_ARTICULOS_TEMA).map(([id]) => id));
}
