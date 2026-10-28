// Pruebas de los bloques de captación: reparto de variantes, validación de la medición y destinos que existen.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';
import { join } from 'node:path';
import { CTA_POR_TEMA, VARIANTES_FINAL, VARIANTES_MEDIO, semanaIso, variantePara } from '../src/config/cta.mjs';
import { CATEGORIAS } from '../src/config/categorias.ts';
import { TOPE_EVENTOS_DIA, leerContadores, sumarEvento, validarEvento } from '../src/lib/medicion.ts';
import { idH2Medio } from '../src/lib/cta-medio.ts';

test('semanaIso: casos conocidos (1 de enero de 2027 es semana 53 de 2026)', () => {
  assert.deepEqual(semanaIso(new Date('2026-10-28T10:00:00Z')), { anio: 2026, semana: 44 });
  assert.deepEqual(semanaIso(new Date('2027-01-01T10:00:00Z')), { anio: 2026, semana: 53 });
  assert.deepEqual(semanaIso(new Date('2027-01-04T10:00:00Z')), { anio: 2027, semana: 1 });
});

test('variantePara es estable en la semana, rota entre semanas y reparte por igual', () => {
  const lunes = new Date('2026-10-26T08:00:00Z');
  const domingo = new Date('2026-11-01T22:00:00Z');
  assert.equal(variantePara('a', lunes), variantePara('a', domingo));
  const conteo = Object.fromEntries(VARIANTES_MEDIO.map((v) => [v, 0]));
  for (let i = 0; i < 300; i++) conteo[variantePara(`articulo-${i}`, lunes)]++;
  for (const n of Object.values(conteo)) assert.ok(n > 60 && n < 140, `reparto desigual: ${JSON.stringify(conteo)}`);
  // Con las semanas, un mismo artículo recorre todas las variantes.
  const vistas = new Set<string>();
  for (let s = 0; s < 3; s++) vistas.add(variantePara('un-articulo', new Date(lunes.getTime() + s * 7 * 86400000)));
  assert.equal(vistas.size, VARIANTES_MEDIO.length);
});

test('todos los temas del blog tienen recurso y todos los destinos existen', () => {
  for (const c of CATEGORIAS) assert.ok(CTA_POR_TEMA[c.id as keyof typeof CTA_POR_TEMA], `falta CTA para el tema ${c.id}`);
  const raiz = join(import.meta.dirname, '..', 'src', 'pages');
  for (const [tema, cta] of Object.entries(CTA_POR_TEMA)) {
    for (const r of [cta.herramienta, cta.recurso]) {
      assert.match(r.href, /^\/.*\/$/, `${tema}: href sin barra final`);
      const ruta = r.href.slice(1, -1);
      const existe = ['.astro', '/index.astro'].some((f) => existsSync(join(raiz, ruta + f)));
      assert.ok(existe, `${tema}: no existe la página ${r.href}`);
      assert.ok(!/—/.test(r.titulo + r.texto), 'sin guiones largos');
    }
    assert.ok(!/—/.test(cta.boletin));
  }
});

test('validarEvento solo acepta valores de las listas cerradas', () => {
  assert.deepEqual(validarEvento({ e: 'vista', p: 'medio', v: 'herramienta', t: 'vivienda' }), { e: 'vista', p: 'medio', v: 'herramienta', t: 'vivienda' });
  assert.equal(validarEvento({ e: 'vista', p: 'medio', v: 'herramienta', t: '<script>' }), null);
  assert.equal(validarEvento({ e: 'borrar', p: 'medio', v: 'herramienta', t: 'vivienda' }), null);
  assert.equal(validarEvento({ e: 'clic', p: 'final', v: 'tema', t: 'otro' })?.v, 'tema');
  assert.equal(validarEvento({ e: 'clic', p: 'final', v: 1, t: 'otro' }), null);
  assert.ok(VARIANTES_FINAL.length === 2);
});

test('sumarEvento acumula, no muta y respeta el tope diario', () => {
  const ev = { e: 'clic', p: 'medio', v: 'recurso', t: 'ahorro' };
  const a = sumarEvento(null, ev)!;
  const b = sumarEvento(a, ev)!;
  assert.equal(a.c['clic|medio|recurso|ahorro'], 1);
  assert.equal(b.c['clic|medio|recurso|ahorro'], 2);
  assert.equal(b.n, 2);
  assert.equal(sumarEvento({ n: TOPE_EVENTOS_DIA, c: {} }, ev), null);
  assert.equal(leerContadores('no es json'), null);
  assert.equal(leerContadores(null), null);
  assert.deepEqual(leerContadores(JSON.stringify(b)), b);
});

test('idH2Medio: delante del h2 central, nunca en FAQ y no en artículos cortos', () => {
  const h = (slug: string, text = slug, depth = 2) => ({ depth, slug, text });
  assert.equal(idH2Medio([h('a'), h('b'), h('c')]), null);
  assert.equal(idH2Medio([h('a'), h('b'), h('c'), h('d')]), 'c');
  assert.equal(idH2Medio([h('a'), h('x', 'sub', 3), h('b'), h('c'), h('d'), h('e'), h('f')]), 'd');
  assert.equal(idH2Medio([h('a'), h('b'), h('c', 'Preguntas frecuentes'), h('d', 'Fuentes')]), 'b');
});
