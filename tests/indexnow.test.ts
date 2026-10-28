// Pruebas de scripts/indexnow.mjs: de archivo cambiado a URL pública, y la clave del repo.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { join } from 'node:path';
import { leerClave, urlsDeArchivo } from '../scripts/indexnow.mjs';

test('urlsDeArchivo: mercados, newsletter, glosario y páginas', () => {
  assert.deepEqual(urlsDeArchivo('src/content/mercados/2026-10-28.mdx').sort(), ['/', '/hoy/', '/mercados/', '/mercados/2026-10-28/'].sort());
  assert.deepEqual(urlsDeArchivo('src/content/newsletter/2026-11-01.mdx').sort(), ['/newsletter/', '/newsletter/2026-11-01/']);
  assert.ok(urlsDeArchivo('src/content/glosario/ter.mdx').includes('/glosario/ter/'));
  assert.deepEqual(urlsDeArchivo('src/pages/euribor.astro'), ['/euribor/']);
  assert.deepEqual(urlsDeArchivo('src/pages/herramientas/index.astro'), ['/herramientas/']);
  assert.deepEqual(urlsDeArchivo('src/pages/index.astro'), ['/']);
  assert.deepEqual(urlsDeArchivo('src/pages/api/newsletter.ts'), []);
  assert.deepEqual(urlsDeArchivo('src/pages/embed/[slug].astro'), []);
  assert.deepEqual(urlsDeArchivo('src/components/Header.astro'), []);
});

test('urlsDeArchivo: un artículo incluye su tema y los listados', () => {
  const u = urlsDeArchivo('src/content/blog/alquilar-o-comprar-vivienda-las-cuentas.mdx');
  assert.ok(u.includes('/blog/alquilar-o-comprar-vivienda-las-cuentas/'));
  assert.ok(u.includes('/blog/') && u.includes('/'));
  assert.ok(u.includes('/blog/tema/vivienda/'));
});

test('la clave IndexNow del repo existe y es pública (el archivo contiene su nombre)', () => {
  assert.match(leerClave(join(import.meta.dirname, '..', 'public')), /^[a-f0-9]{8,128}$/);
});
