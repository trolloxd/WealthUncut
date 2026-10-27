// Pruebas de los datos de las escenas 3D (src/lib/calculos/escena3d.ts).
// El valor final del interés compuesto (351.843 euros a 40 años) coincide con el ejemplo del artículo
// "Interés compuesto" y se comprobó aparte con la fórmula del valor futuro de una anualidad.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { IRPF_AHORRO_BRACKETS } from '../src/config/finance.ts';
import { datosEscena, escalonesIrpfAhorro, serieInteresCompuesto } from '../src/lib/calculos/escena3d.ts';

test('los escalones del IRPF del ahorro salen de finance.ts', () => {
  const e = escalonesIrpfAhorro();
  assert.equal(e.length, IRPF_AHORRO_BRACKETS.length);
  assert.deepEqual(e.map((x) => x.tipo), IRPF_AHORRO_BRACKETS.map((t) => t.tipo));
  assert.equal(e[0].desde, 0);
  assert.equal(e[0].hasta, 6000);
  assert.equal(e.at(-1)!.hasta, null);
  for (let i = 1; i < e.length; i++) assert.equal(e[i].desde, e[i - 1].hasta);
});

test('interés compuesto: 150 euros al mes, 7 % bruto y TER 0,2 % durante 40 años', () => {
  const serie = serieInteresCompuesto();
  assert.equal(serie.length, 8);
  assert.deepEqual(serie.map((p) => p.anio), [5, 10, 15, 20, 25, 30, 35, 40]);
  const final = serie.at(-1)!;
  assert.equal(final.aportado, 72000);
  assert.equal(final.total, 351843);
  assert.equal(final.intereses, 351843 - 72000);
  assert.equal(serie.find((p) => p.anio === 30)!.total, 169084);
  assert.equal(serie.find((p) => p.anio === 20)!.total, 74424);
  for (const p of serie) assert.ok(Math.abs(p.aportado + p.intereses - p.total) <= 1);
});

test('los intereses superan lo aportado solo con el tiempo', () => {
  const serie = serieInteresCompuesto();
  assert.ok(serie[0].intereses < serie[0].aportado);
  assert.ok(serie.at(-1)!.intereses > serie.at(-1)!.aportado);
});

test('los textos de las escenas no llevan guiones largos y citan una fuente', () => {
  for (const t of ['irpf-ahorro', 'interes-compuesto'] as const) {
    const d = datosEscena(t);
    assert.ok(!/[—–]/.test(JSON.stringify(d)));
    assert.ok(d.fuente.url.length > 5);
    assert.ok(d.resumen.length > 40);
  }
  assert.ok(datosEscena('irpf-ahorro').resumen.includes('19 %'));
  assert.ok(datosEscena('irpf-ahorro').resumen.includes('30 %'));
});
