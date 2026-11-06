// Tabla de /datos/ "Sueldo neto 2026 por comunidad autónoma" (src/lib/calculos/sueldo.ts): sale de la misma función que la
// calculadora de sueldo neto, así que basta comprobar que cuadra fila a fila y que las cifras son coherentes.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BRUTOS_SUELDO_NETO, calcularSueldoNeto, filasSueldoNeto } from '../src/lib/calculos/sueldo.ts';
import { IRPF_GENERAL_AUTONOMICO } from '../src/config/finance.ts';

const filas = filasSueldoNeto();
const nComunidades = Object.keys(IRPF_GENERAL_AUTONOMICO).length - 1; // sin Ceuta y Melilla

test('una fila por comunidad y sueldo bruto', () => {
  assert.equal(filas.length, nComunidades * BRUTOS_SUELDO_NETO.length);
});

test('escala estatal corregida: 30.000 euros brutos en Madrid, unos 23.417 euros netos', () => {
  const r = calcularSueldoNeto({ brutoAnual: 30000, comunidad: 'madrid', pagas: 14 });
  assert.ok(Math.abs(r.netoAnual - 23417.42) < 1, String(r.netoAnual));
});

test('cada fila cuadra: bruto = Seguridad Social + IRPF + neto, y netos mensuales', () => {
  for (const [, bruto, ss, irpf, neto, n14, n12, tipo] of filas as number[][]) {
    assert.ok(Math.abs(bruto - (ss + irpf + neto)) < 0.05, `cuadre ${bruto}`);
    assert.ok(Math.abs(n14 * 14 - neto) < 0.1 && Math.abs(n12 * 12 - neto) < 0.1);
    assert.ok(Math.abs(tipo - (irpf / bruto) * 100) < 0.01);
  }
});

test('coincide con la calculadora y el neto sube con el bruto en cada comunidad', () => {
  const [ccaa] = Object.keys(IRPF_GENERAL_AUTONOMICO) as (keyof typeof IRPF_GENERAL_AUTONOMICO)[];
  const r = calcularSueldoNeto({ brutoAnual: 30000, comunidad: ccaa, pagas: 14 });
  const fila = filas.find((f) => f[0] === IRPF_GENERAL_AUTONOMICO[ccaa].nombre && f[1] === 30000)!;
  assert.equal(fila[4], Math.round(r.netoAnual * 100) / 100);
  assert.ok(!filas.some((f) => f[0] === 'Ceuta y Melilla'));
  for (const c of Object.values(IRPF_GENERAL_AUTONOMICO).filter((c) => c.nombre !== 'Ceuta y Melilla')) {
    const netos = filas.filter((f) => f[0] === c.nombre).map((f) => f[4] as number);
    netos.forEach((n, i) => i && assert.ok(n > netos[i - 1], `${c.nombre} no sube`));
  }
});
