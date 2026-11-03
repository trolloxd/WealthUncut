// Pruebas de la calculadora en vivo de la portada (src/lib/calculos/portada.ts): con 150 euros al mes debe dar las
// mismas cifras que el titular histórico de la portada (8.522 euros de IRPF y 69.630 netos).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calcularPortada, euros, irpfAhorro } from '../src/lib/calculos/portada.ts';

test('portada: 150 euros al mes durante 20 años', () => {
  const r = calcularPortada(150);
  assert.equal(r.aportado, 37000);
  assert.equal(r.bruto, 78151);
  assert.equal(r.impuesto, 8522);
  assert.equal(r.neto, 69630);
  assert.equal(r.porAnio.length, 20);
  assert.equal(r.porAnio.at(-1), r.bruto);
});

test('IRPF del ahorro por tramos', () => {
  assert.equal(irpfAhorro(0), 0);
  assert.equal(irpfAhorro(6000), 1140);
  assert.equal(Math.round(irpfAhorro(10000)), 1140 + 840);
  assert.equal(Math.round(irpfAhorro(-500)), 0);
});

test('más aportación, más neto', () => {
  let anterior = 0;
  for (let m = 50; m <= 1000; m += 50) {
    const n = calcularPortada(m).neto;
    assert.ok(n > anterior);
    anterior = n;
  }
  assert.equal(euros(69630), '69.630 €');
});
