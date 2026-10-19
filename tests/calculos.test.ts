// Pruebas de las cuentas de las calculadoras y de finance.ts. Ejecutar con `npm test` (Node 22.6 o superior).
// Cada cifra esperada se calculó a mano o contra la fuente oficial (ver comentarios).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { RETA_2026, calcularImpuestoAhorro, calcularITP, calcularProgresivo, tramoRETA } from '../src/config/finance.ts';
import { calcularCuotaAutonomo } from '../src/lib/calculos/autonomo.ts';
import { calcularFactura } from '../src/lib/calculos/factura.ts';
import { calcularIndemnizacion, esFecha, mesesDeServicio } from '../src/lib/calculos/indemnizacion.ts';
import { calcularBaja, porcentajeDia } from '../src/lib/calculos/baja.ts';
import { calcularAlquiler } from '../src/lib/calculos/alquiler.ts';
import { evaluarAyudasVivienda } from '../src/lib/calculos/ayudas.ts';

const cerca = (real: number, esperado: number, margen = 0.01) =>
  assert.ok(Math.abs(real - esperado) <= margen, `esperado ${esperado}, obtenido ${real}`);

test('IRPF del ahorro: tramos marginales', () => {
  cerca(calcularImpuestoAhorro(4000), 760); // 19 %
  cerca(calcularImpuestoAhorro(12000), 2400); // 6.000 al 19 % + 6.000 al 21 %
  assert.equal(calcularImpuestoAhorro(0), 0);
  assert.equal(calcularImpuestoAhorro(-500), 0);
});

test('calcularProgresivo: cada tipo solo se aplica a su tramo', () => {
  const tramos = [
    { hasta: 100, tipo: 0.1 },
    { hasta: Infinity, tipo: 0.2 },
  ];
  cerca(calcularProgresivo(150, tramos), 10 + 10);
});

test('ITP: escala progresiva donde hay tramos y tipo único donde no', () => {
  cerca(calcularITP(200000, 'andalucia'), 14000); // 7 %
  assert.ok(calcularITP(500000, 'aragon') > calcularITP(400000, 'aragon'));
});

test('cuota de autónomos: cada cuota mínima es base mínima por 31,5 % (BOE, Orden PJC/297/2026)', () => {
  cerca(RETA_2026.tramos[0].baseMin * RETA_2026.tipoTotal, 205.88);
  assert.equal(RETA_2026.desglose.reduce((s, d) => s + d.tipo, 0).toFixed(3), RETA_2026.tipoTotal.toFixed(3));
  // el límite de 1.166,70 euros al mes: por debajo, tabla reducida (tramo 3); desde ahí, tabla general (tramo 1)
  assert.deepEqual([tramoRETA(1166.69).tabla, tramoRETA(1166.69).n], ['Reducida', 3]);
  assert.deepEqual([tramoRETA(1166.7).tabla, tramoRETA(1166.7).n], ['General', 1]);
  assert.equal(tramoRETA(99999).n, 12);
});

test('cuota de autónomos: ejemplo de 30.000 de ingresos y 6.000 de gastos', () => {
  const r = calcularCuotaAutonomo({ ingresosAnuales: 30000, gastosAnuales: 6000, deduccion7: true, societario: false });
  cerca(r.netoMensual, 1860); // 24.000 x 0,93 / 12
  assert.deepEqual([r.tramo.tabla, r.tramo.n], ['General', 5]);
  cerca(r.cuotaMin, 380.88);
  const sinNegativos = calcularCuotaAutonomo({ ingresosAnuales: 1000, gastosAnuales: 5000, deduccion7: true, societario: false });
  assert.equal(sinNegativos.netoMensual, 0);
});

test('factura de autónomo: total, IVA y adelanto del 20 %', () => {
  const f = calcularFactura({ base: 1000, ivaPct: 21, retencionPct: 7, pagoFraccionadoPct: 20 });
  cerca(f.total, 1140); // 1.000 + 210 - 70
  cerca(f.pago130, 130); // 200 - 70 ya retenidos
  const alta = calcularFactura({ base: 1000, ivaPct: 21, retencionPct: 15, pagoFraccionadoPct: 20 });
  cerca(alta.total, 1060);
  cerca(alta.pago130, 50);
  assert.equal(calcularFactura({ base: 1000, ivaPct: 0, retencionPct: 30, pagoFraccionadoPct: 20 }).pago130, 0);
});

test('meses de servicio: meses completos, y una fracción cuenta como mes', () => {
  assert.equal(mesesDeServicio('2026-01-01', '2026-12-31'), 12);
  assert.equal(mesesDeServicio('2026-01-01', '2026-01-15'), 1);
  assert.equal(mesesDeServicio('2022-03-01', '2026-10-31'), 56);
  assert.equal(mesesDeServicio('2026-05-01', '2026-04-01'), 0);
  assert.ok(esFecha('2026-10-15'));
  assert.ok(!esFecha('2026-13-45'));
  assert.ok(!esFecha('hoy'));
});

test('indemnización (Estatuto de los Trabajadores, arts. 56.1, 53.1.b y 49.1.c)', () => {
  const base = { salarioAnual: 24000, inicio: '2022-03-01', fin: '2026-10-31', diasVacaciones: 0, diasMes: 0 };
  cerca(calcularIndemnizacion({ ...base, tipo: 'improcedente' }).indemnizacion, 10126.03); // 33 días x 4,6667 años
  const obj = calcularIndemnizacion({ ...base, tipo: 'objetivo' }).indemnizacion;
  const temp = calcularIndemnizacion({ ...base, tipo: 'temporal' }).indemnizacion;
  assert.ok(obj < 10126.03 && temp < obj); // 20 y 12 días por año
  // tope de 24 mensualidades en el despido improcedente
  const largo = calcularIndemnizacion({ ...base, inicio: '1990-01-01', tipo: 'improcedente' });
  assert.equal(largo.topeAplicado, true);
  cerca(largo.indemnizacion, 48000);
});

test('baja laboral: 0 % los tres primeros días, 60 % hasta el 20 y 75 % desde el 21', () => {
  assert.deepEqual([1, 3, 4, 20, 21, 90].map((d) => porcentajeDia('comun', d)), [0, 0, 0.6, 0.6, 0.75, 0.75]);
  assert.deepEqual([1, 2].map((d) => porcentajeDia('laboral', d)), [1, 0.75]);
  const r = calcularBaja({ brutoAnual: 24000, tipo: 'comun', dias: 30, complementoPct: 0 });
  cerca(r.subsidio, 1180); // 17 días al 60 % y 10 al 75 % sobre 66,67 euros al día
  cerca(r.perdida, 820);
  const completa = calcularBaja({ brutoAnual: 24000, tipo: 'comun', dias: 30, complementoPct: 100 });
  cerca(completa.total, 2000);
});

test('IRPF del alquiler: más reducción, menos impuesto; sin impuesto negativo', () => {
  const caso = { ingresos: 12000, gastos: 2500, valorConstruccion: 90000, otrosIngresosNetos: 24000, comunidad: 'madrid' as const };
  const r50 = calcularAlquiler({ ...caso, reduccionPct: 0.5 });
  cerca(r50.netoPrevio, 6800); // 12.000 - 2.500 - 2.700 de amortización
  cerca(r50.netoReducido, 3400);
  cerca(r50.irpfExtra, 1455, 1);
  const r0 = calcularAlquiler({ ...caso, reduccionPct: 0 });
  const r90 = calcularAlquiler({ ...caso, reduccionPct: 0.9 });
  assert.ok(r0.irpfExtra > r50.irpfExtra && r50.irpfExtra > r90.irpfExtra);
  const perdida = calcularAlquiler({ ...caso, ingresos: 1000, reduccionPct: 0.5 });
  assert.equal(perdida.reduccion, 0);
  assert.ok(perdida.irpfExtra >= 0);
});

test('ayudas a la vivienda para jóvenes (Real Decreto 326/2026)', () => {
  const ok = { edad: 27, ingresos: 24000, tieneVivienda: false, pequeno: false, tipo: 'vivienda' as const, renta: 750, precioCompra: 120000 };
  assert.equal(evaluarAyudasVivienda(ok).ayudaAlquiler, 300); // tope de 300 euros al mes
  cerca(evaluarAyudasVivienda({ ...ok, renta: 400 }).ayudaAlquiler, 240); // 60 % de 400
  assert.equal(evaluarAyudasVivienda({ ...ok, tipo: 'habitacion', renta: 250 }).ayudaAlquiler, 150);
  assert.equal(evaluarAyudasVivienda({ ...ok, renta: 1200 }).ayudaAlquiler, 0); // por encima de 1.000 euros
  assert.equal(evaluarAyudasVivienda({ ...ok, edad: 36 }).cumpleBase, false);
  assert.equal(evaluarAyudasVivienda({ ...ok, ingresos: 42001 }).cumpleBase, false); // 5 veces el IPREM
  assert.equal(evaluarAyudasVivienda({ ...ok, tieneVivienda: true }).cumpleBase, false);
  assert.equal(evaluarAyudasVivienda({ ...ok, pequeno: true, renta: 400 }).ayudaAlquiler, 240);
  assert.equal(evaluarAyudasVivienda({ ...ok, pequeno: true, renta: 600 }).ayudaAlquiler, 0); // máximo de 500 en municipios pequeños
  assert.equal(evaluarAyudasVivienda({ ...ok, pequeno: true }).ayudaCompra, 15000); // tope de 15.000 euros
  assert.equal(evaluarAyudasVivienda({ ...ok, pequeno: true, precioCompra: 50000 }).ayudaCompra, 10000); // 20 %
});
