// Pruebas del euríbor y de la revisión de hipoteca (src/lib/calculos/euribor.ts) y de los datos de src/data/euribor/.
// Las cuotas esperadas se calcularon aparte con Python (decimal, 40 dígitos) con la fórmula del sistema francés.
// Los valores oficiales salen de las resoluciones mensuales del Banco de España en el BOE (consultadas el 2026-10-21).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import {
  combinarSeries,
  cuotaFrancesa,
  mesesAtras,
  redondear3,
  resumenAnual,
  revisarHipoteca,
  tipoAplicable,
  valorMes,
  variacion,
  type PuntoEuribor,
} from '../src/lib/calculos/euribor.ts';

const cerca = (real: number, esperado: number, margen = 0.01) =>
  assert.ok(Math.abs(real - esperado) <= margen, `esperado ${esperado}, obtenido ${real}`);

const leer = (f: string) => JSON.parse(fs.readFileSync(new URL(`../src/data/euribor/${f}`, import.meta.url), 'utf8'));
const historico: PuntoEuribor[] = leer('historico.json').historico;
const ultimo = leer('ultimo.json');

test('cuota francesa: 150.000 € a 25 años', () => {
  cerca(cuotaFrancesa(150000, 2.771, 300), 693.58); // euríbor sep-2025 (2,171) + 0,60
  cerca(cuotaFrancesa(150000, 3.847, 300), 779.14); // euríbor sep-2026 (3,247) + 0,60
  cerca(cuotaFrancesa(120000, 0, 240), 500); // sin interés: capital entre meses
  assert.equal(cuotaFrancesa(0, 3, 300), 0);
  assert.equal(cuotaFrancesa(100000, 3, 0), 0);
});

test('con el mismo tipo, recalcular con el capital pendiente da la misma cuota', () => {
  const cuota = cuotaFrancesa(200000, 3, 360);
  const i = 0.03 / 12;
  const pendiente = 200000 * (1 + i) ** 60 - cuota * (((1 + i) ** 60 - 1) / i);
  cerca(cuotaFrancesa(pendiente, 3, 300), cuota, 0.000001);
  cerca(cuota, 843.21);
});

test('tipo aplicable: euríbor + diferencial, nunca negativo (Ley 5/2019, art. 21.4)', () => {
  cerca(tipoAplicable(3.247, 0.6), 3.847, 1e-9);
  assert.equal(tipoAplicable(-0.505, 0.4), 0);
});

test('revisión anual: de 2,171 % a 3,247 % con 150.000 € y 25 años', () => {
  const r = revisarHipoteca({
    capitalPendiente: 150000,
    mesesRestantes: 300,
    diferencial: 0.6,
    euriborAnterior: 2.171,
    euriborNuevo: 3.247,
    mesesHastaSiguiente: 12,
  });
  cerca(r.cuotaAnterior, 693.58);
  cerca(r.cuotaNueva, 779.14);
  cerca(r.diferenciaMes, 85.56);
  cerca(r.diferenciaPeriodo, 1026.70);
  cerca(r.interesesPrimeraNueva, 480.88); // 150.000 x 3,847 % / 12
});

test('revisión semestral: de 2,565 % (mar-2026) a 3,247 % (sep-2026), 120.000 € y 20 años', () => {
  const r = revisarHipoteca({
    capitalPendiente: 120000,
    mesesRestantes: 240,
    diferencial: 0.6,
    euriborAnterior: 2.565,
    euriborNuevo: 3.247,
    mesesHastaSiguiente: 6,
  });
  cerca(r.cuotaAnterior, 675.47);
  cerca(r.cuotaNueva, 717.54);
  cerca(r.diferenciaPeriodo, 252.40);
  assert.equal(r.periodo, 6);
});

test('meses: restar y sumar cruzando años', () => {
  assert.equal(mesesAtras('2026-09', 12), '2025-09');
  assert.equal(mesesAtras('2026-03', 6), '2025-09');
  assert.equal(mesesAtras('2026-01', 1), '2025-12');
  assert.equal(mesesAtras('2025-12', -1), '2026-01');
});

test('datos: el histórico empieza en 1999-01, no tiene huecos y acaba donde ultimo.json', () => {
  assert.equal(historico[0].mes, '1999-01');
  for (let k = 1; k < historico.length; k++) assert.equal(historico[k].mes, mesesAtras(historico[k - 1].mes, -1));
  assert.ok(historico.at(-1)!.mes <= ultimo.ultimoMes);
});

test('datos: redondeados a 3 decimales coinciden con el índice oficial del BOE', () => {
  const serie = combinarSeries(historico, ultimo.historico);
  const oficial: [string, number][] = [
    ['2026-09', 3.247], // BOE-A-2026-20519
    ['2026-08', 2.954], // BOE-A-2026-18507
    ['2026-06', 2.798], // BOE-A-2026-14420
    ['2026-03', 2.565], // BOE-A-2026-7549
    ['2024-02', 3.671], // BOE-A-2024-4138
    ['2023-11', 4.022], // BOE-A-2023-24667
    ['2022-01', -0.477], // BOE-A-2022-1711
    ['2016-02', -0.008], // BOE-A-2016-2172
  ];
  for (const [mes, valor] of oficial) assert.equal(redondear3(valorMes(serie, mes)!), valor, mes);
});

test('combinar series: sin meses repetidos, ordenadas, manda la última', () => {
  const s = combinarSeries(
    [
      { mes: '2026-08', valor: 1 },
      { mes: '2026-07', valor: 1 },
    ],
    [{ mes: '2026-08', valor: 2 }]
  );
  assert.deepEqual(s, [
    { mes: '2026-07', valor: 1 },
    { mes: '2026-08', valor: 2 },
  ]);
});

test('variación interanual y resumen por año', () => {
  const serie = combinarSeries(historico, ultimo.historico).filter((p) => p.mes <= '2026-09');
  const anual = variacion(serie, 12)!;
  assert.equal(anual.desde.mes, '2025-09');
  assert.equal(anual.puntos, redondear3(3.247 - redondear3(valorMes(serie, '2025-09')!)));
  assert.equal(variacion(serie, 1000), undefined);

  const resumen = resumenAnual(serie);
  assert.equal(resumen[0].anio, '2026');
  assert.equal(resumen[0].meses, 9);
  assert.equal(resumen[0].maximo, 3.247);
  assert.equal(resumen[0].mesMaximo, '2026-09');
  const r2008 = resumen.find((r) => r.anio === '2008')!;
  assert.equal(r2008.meses, 12);
  assert.equal(r2008.mesMaximo, '2008-07');
});
