// @ts-check
import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import path from 'node:path';

import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

/** Fecha de última actualización de cada artículo ("seccion/slug" → fecha), para el lastmod del sitemap. */
function leerFechasArticulos() {
  const fechas = new Map();
  for (const seccion of ['blog', 'mercados']) {
    const dir = `./src/content/${seccion}`;
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!/\.mdx?$/.test(file)) continue;
      const frontmatter = fs.readFileSync(path.join(dir, file), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
      const fecha = frontmatter.match(/^updatedDate:\s*(.+)$/m)?.[1] ?? frontmatter.match(/^pubDate:\s*(.+)$/m)?.[1];
      if (fecha) fechas.set(`${seccion}/${file.replace(/\.mdx?$/, '')}`, fecha.trim());
    }
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
  // Astro calcula el hash SHA-256 de cada <script>/<style> propios (inline, por el
  // inlineStylesheets de arriba y la hidratación de las islas) y los mete en una etiqueta
  // <meta http-equiv="Content-Security-Policy">, distinta en cada página. No usamos
  // 'unsafe-inline': solo se ejecuta lo que Astro ha generado en el build, nada inyectado luego.
  // Si se añade Turnstile (formulario de sugerencias) hay que sumar aquí
  // https://challenges.cloudflare.com a scriptDirective.resources, frame-src y connect-src.
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        // frame-ancestors no se puede entregar por <meta> (solo por cabecera HTTP, spec de CSP):
        // la protección contra clickjacking real la da X-Frame-Options en public/_headers.
        "frame-src 'none'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        'upgrade-insecure-requests',
      ],
    },
  },
  adapter: cloudflare(),
  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/404'),
      serialize(item) {
        const clave = item.url.match(/\/((?:blog|mercados)\/[^/]+)\/$/)?.[1];
        const fecha = clave ? fechasArticulos.get(clave) : undefined;
        if (fecha) item.lastmod = new Date(fecha).toISOString();
        return item;
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()]
  }
});
