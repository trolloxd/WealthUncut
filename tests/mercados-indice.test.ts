// Regla de indexación de /mercados/ (src/config/mercados-indice.mjs): diarias 14 días, resúmenes semanales siempre.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { edicionIndexable, esResumenSemanal, edicionesNoIndexables, tagsDelFrontmatter } from '../src/config/mercados-indice.mjs';

const ahora = Date.parse('2026-11-04T12:00:00Z');

test('edición diaria: indexada 14 días, después no', () => {
  assert.equal(edicionIndexable('2026-10-25', ['mercados'], ahora), true);
  assert.equal(edicionIndexable('2026-10-22', ['mercados'], ahora), true);
  assert.equal(edicionIndexable('2026-10-20', ['mercados'], ahora), false);
});

test('resumen semanal: siempre indexado', () => {
  assert.equal(esResumenSemanal(['mercados', 'resumen semanal']), true);
  assert.equal(esResumenSemanal(['mercados', 'resumen-semanal']), true);
  assert.equal(esResumenSemanal(['mercados', 'semanal']), false);
  assert.equal(edicionIndexable('2026-09-01', ['mercados', 'resumen semanal'], ahora), true);
});

test('lee las ediciones reales sin fallar y nunca saca un resumen semanal', () => {
  const fuera = edicionesNoIndexables('./src/content/mercados', ahora);
  assert.ok(fuera.size > 0);
  assert.ok(!fuera.has('2026-10-17'));
});

test('las etiquetas se leen en línea y en bloque (un resumen semanal en bloque no pasa a noindex)', () => {
  assert.deepEqual(tagsDelFrontmatter('title: "x"\ntags: ["mercados", "resumen semanal"]\n'), ['mercados', 'resumen semanal']);
  assert.deepEqual(tagsDelFrontmatter('title: "x"\ntags:\n  - mercados\n  - "resumen semanal"\nauthor: "A"'), ['mercados', 'resumen semanal']);
  assert.deepEqual(tagsDelFrontmatter('title: "x"\r\ntags:\r\n  - resumen-semanal\r\n'), ['resumen-semanal']);
  assert.deepEqual(tagsDelFrontmatter('title: "x"\n'), []);
  assert.ok(esResumenSemanal(tagsDelFrontmatter('tags:\n  - resumen semanal\n')));
});
