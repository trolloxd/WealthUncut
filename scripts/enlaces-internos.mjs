#!/usr/bin/env node
/**
 * Enlazado interno a partir del HTML real compilado (dist/client): necesita `npm run build` hecho antes.
 *
 *   node scripts/enlaces-internos.mjs                       resumen: páginas del sitemap con pocos enlaces entrantes
 *   node scripts/enlaces-internos.mjs --huerfanas           lista completa (por defecto, menos de 3 entrantes)
 *   node scripts/enlaces-internos.mjs --sugerir=<slug>      para un artículo: a quién debe enlazar y quién debería enlazarlo
 *   node scripts/enlaces-internos.mjs --umbral=4            cambia el mínimo de entrantes
 *
 * Qué cuenta como enlace entrante: un `<a href>` dentro de `<main>` de OTRA página (cabecera y pie no cuentan: están
 * en todas y no dicen nada). Se distingue lo que llega desde artículos (`/blog/<slug>/`), que es el enlace con
 * contexto que más pesa, de lo que llega de listados, temas y bloques automáticos.
 * Solo informa; no edita nada. Las rutinas aplican las sugerencias a mano en el cuerpo del MDX.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(RAIZ, 'dist', 'client');
const SITIO = 'https://wealthuncut.com';
const args = process.argv.slice(2);
const valor = (n) => args.find((a) => a.startsWith(`--${n}=`))?.split('=')[1];
const flag = (n) => args.includes(`--${n}`);
const UMBRAL = Number(valor('umbral') ?? 3);

if (!existsSync(DIST)) {
  console.error('Falta dist/client: ejecuta `npm run build` primero.');
  process.exit(1);
}

function* htmls(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) {
      if (f === '_astro' || f === 'embed') continue;
      yield* htmls(p);
    } else if (f === 'index.html') yield p;
  }
}

const rutaDe = (archivo) => {
  const r = archivo.slice(DIST.length).replace(/\\/g, '/').replace(/index\.html$/, '');
  return r || '/';
};

const normaliza = (href) => {
  if (!href || href.startsWith('#') || /^(mailto:|tel:|javascript:)/.test(href)) return null;
  let h = href.replace(SITIO, '');
  if (!h.startsWith('/')) return null;
  h = h.split('#')[0].split('?')[0];
  if (/\.[a-z0-9]{2,5}$/i.test(h)) return null; // archivos (xlsx, ics, csv...)
  return h.endsWith('/') ? h : h + '/';
};

// Grafo
const paginas = new Map(); // ruta -> { titulo, salientes:Set }
for (const archivo of htmls(DIST)) {
  const html = readFileSync(archivo, 'utf8');
  const ruta = rutaDe(archivo);
  const main = html.match(/<main[\s\S]*?<\/main>/)?.[0] ?? '';
  const salientes = new Set();
  for (const m of main.matchAll(/<a\s[^>]*?href="([^"]+)"/g)) {
    const h = normaliza(m[1]);
    if (h && h !== ruta) salientes.add(h);
  }
  const titulo = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? ruta;
  paginas.set(ruta, { titulo, salientes });
}

// Páginas que cuentan: las del sitemap (excluye noindex/embed/404).
const sitemap = new Set(
  [...readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITIO, ''))
);
const entrantes = new Map([...sitemap].map((r) => [r, { total: new Set(), desdeArticulos: new Set() }]));
for (const [origen, { salientes }] of paginas) {
  const esArticulo = /^\/blog\/[^/]+\/$/.test(origen) && !origen.startsWith('/blog/tema/');
  for (const destino of salientes) {
    const e = entrantes.get(destino);
    if (!e) continue;
    e.total.add(origen);
    if (esArticulo) e.desdeArticulos.add(origen);
  }
}

const articulos = [...sitemap].filter((r) => /^\/blog\/[^/]+\/$/.test(r) && r !== '/blog/');
const herramientas = [...sitemap].filter((r) => /^\/herramientas\/[^/]+\/$/.test(r));

function frontmatterDe(slug) {
  const f = join(RAIZ, 'src', 'content', 'blog', `${slug}.mdx`);
  if (!existsSync(f)) return null;
  const fm = readFileSync(f, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  const tags = [...(fm.match(/^tags:\s*\[(.*)\]/m)?.[1] ?? '').matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  return {
    title: fm.match(/^title:\s*"(.*)"/m)?.[1] ?? slug,
    description: fm.match(/^description:\s*"(.*)"/m)?.[1] ?? '',
    categoria: fm.match(/^categoria:\s*"?([\w-]+)"?/m)?.[1] ?? '',
    tags,
  };
}

const STOP = new Set('de la el los las un una y o en a que por con para del al se su es como cuanto cuánto qué cual cuál mas más tu tus 2026 guia guía impuestos impuesto espana españa ejemplo ejemplos calculo calculadora cuentas'.split(' '));
const sinTildes = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '');
const palabras = (t) => new Set(sinTildes(t.toLowerCase()).split(/[^a-z0-9ñ]+/).filter((w) => w.length > 3 && !STOP.has(w)));

function afinidad(a, b) {
  const comunes = a.tags.filter((t) => b.tags.includes(t)).length;
  const pa = palabras(`${a.title} ${a.description}`);
  const pb = palabras(`${b.title} ${b.description}`);
  let solape = 0;
  for (const w of pa) if (pb.has(w)) solape++;
  const mismoTema = a.categoria && a.categoria === b.categoria;
  // Hace falta algo más que una etiqueta genérica compartida: mismo tema o al menos una palabra con contenido en común.
  if (!mismoTema && solape === 0) return 0;
  return comunes + (mismoTema ? 2 : 0) + solape * 2;
}

const sugerir = valor('sugerir');
if (sugerir) {
  const ruta = `/blog/${sugerir}/`;
  const yo = frontmatterDe(sugerir);
  if (!yo) {
    console.error(`No existe src/content/blog/${sugerir}.mdx`);
    process.exit(1);
  }
  const enSitemap = sitemap.has(ruta);
  const info = paginas.get(ruta);
  console.log(`# ${yo.title}\nRuta ${ruta}${enSitemap ? '' : ' (aún no está en dist: programada; el cálculo usa solo el contenido)'}`);
  const candidatos = articulos
    .filter((r) => r !== ruta)
    .map((r) => ({ ruta: r, fm: frontmatterDe(r.split('/')[2]) }))
    .filter((c) => c.fm)
    .map((c) => ({ ...c, af: afinidad(yo, c.fm), entr: entrantes.get(c.ruta).desdeArticulos.size }));
  const salida = candidatos
    .filter((c) => c.af >= 3 && !(info?.salientes.has(c.ruta)))
    .sort((a, b) => b.af - a.af)
    .slice(0, 5);
  console.log('\n## El artículo debería enlazar a (aún no lo hace)');
  for (const c of salida) console.log(`- ${c.ruta}  afinidad ${c.af}  «${c.fm.title}»`);
  const entrada = candidatos
    .filter((c) => c.af >= 3 && !(paginas.get(c.ruta)?.salientes.has(ruta)))
    .sort((a, b) => a.entr - b.entr || b.af - a.af)
    .slice(0, 6);
  console.log('\n## Estos artículos deberían enlazar al nuevo (priorizados: los que menos enlaces entrantes tienen)');
  for (const c of entrada) console.log(`- en ${c.ruta}  afinidad ${c.af}, entrantes desde artículos: ${c.entr}  «${c.fm.title}»`);
  const tools = herramientas
    .map((r) => ({ r, t: paginas.get(r)?.titulo ?? r }))
    .filter((h) => [...palabras(h.t)].some((w) => palabras(`${yo.title} ${yo.description}`).has(w)) && !info?.salientes.has(h.r));
  console.log('\n## Herramientas afines sin enlazar');
  for (const h of tools.slice(0, 4)) console.log(`- ${h.r}  «${h.t}»`);
  process.exit(0);
}

// Informe de páginas con pocos entrantes
const filas = [...entrantes]
  .map(([ruta, e]) => ({ ruta, total: e.total.size, art: e.desdeArticulos.size, titulo: paginas.get(ruta)?.titulo ?? '' }))
  .filter((f) => f.ruta !== '/' && f.total < UMBRAL)
  .sort((a, b) => a.total - b.total || a.art - b.art);
console.log(`Páginas del sitemap: ${sitemap.size}. Con menos de ${UMBRAL} enlaces entrantes desde el contenido: ${filas.length}`);
console.log(`Huérfanas del todo (0): ${filas.filter((f) => f.total === 0).length}`);
for (const f of filas.slice(0, flag('huerfanas') ? 1000 : 25)) console.log(`${String(f.total).padStart(3)} entr. (${f.art} desde artículos)  ${f.ruta}`);
