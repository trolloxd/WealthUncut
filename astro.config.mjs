// @ts-check
import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import path from 'node:path';

import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

/** Fecha de última actualización de cada artículo (slug → fecha), para el lastmod del sitemap. */
function leerFechasArticulos() {
  const dir = './src/content/blog';
  const fechas = new Map();
  for (const file of fs.readdirSync(dir)) {
    if (!/\.mdx?$/.test(file)) continue;
    const frontmatter = fs.readFileSync(path.join(dir, file), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    const fecha = frontmatter.match(/^updatedDate:\s*(.+)$/m)?.[1] ?? frontmatter.match(/^pubDate:\s*(.+)$/m)?.[1];
    if (fecha) fechas.set(file.replace(/\.mdx?$/, ''), fecha.trim());
  }
  return fechas;
}

const fechasArticulos = leerFechasArticulos();

// https://astro.build/config
export default defineConfig({
  site: 'https://wealthuncut.com',
  // El CSS completo pesa ~9 KB comprimido: incrustarlo evita un viaje de red que bloquea el
  // primer pintado (medido con Lighthouse en móvil).
  build: { inlineStylesheets: 'always' },
  adapter: cloudflare(),
  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/404'),
      serialize(item) {
        const slug = item.url.match(/\/blog\/([^/]+)\/$/)?.[1];
        const fecha = slug ? fechasArticulos.get(slug) : undefined;
        if (fecha) item.lastmod = new Date(fecha).toISOString();
        return item;
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()]
  }
});
