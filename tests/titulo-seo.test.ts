import assert from 'node:assert/strict';
import { test } from 'node:test';
import { tituloParaBuscadores, TITULO_MAX } from '../src/lib/titulo-seo.ts';

test('un título que cabe se deja igual', () => {
  assert.equal(tituloParaBuscadores('Tramos del IRPF del ahorro 2026: tabla y ejemplos'), 'Tramos del IRPF del ahorro 2026: tabla y ejemplos');
  const justo = 'a'.repeat(TITULO_MAX);
  assert.equal(tituloParaBuscadores(justo), justo);
});

test('un título largo se recorta en una palabra entera y no pasa de 60', () => {
  const largo = '5 minutos de finanzas #5: octubre cierra en rojo y llega el calendario fiscal';
  const corto = tituloParaBuscadores(largo);
  assert.ok(corto.length <= TITULO_MAX);
  assert.ok(corto.endsWith('…'));
  assert.equal(corto, '5 minutos de finanzas #5: octubre cierra en rojo y llega…');
  assert.ok(largo.startsWith(corto.slice(0, -1)));
});

test('no deja signos de puntuación antes de los puntos suspensivos', () => {
  const t = tituloParaBuscadores('Bonos en máximos y petróleo a 108 dólares, qué pasa y cómo te afecta hoy');
  assert.ok(!/[,;:.\- ]…$/.test(t));
  assert.ok(t.length <= TITULO_MAX);
});
