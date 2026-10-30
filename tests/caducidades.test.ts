// Registro de caducidades (src/config/caducidades.json): reglas de vencimiento con fechas fijas, estructura del registro
// y que cada fecha de verificación se puede leer de su fichero. No usa la fecha de hoy: un dato atrasado no rompe las pruebas.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { evaluar, ofertasConFecha, proximaOcurrencia, ultimaOcurrencia, validarRegistro, type Entrada } from '../src/lib/caducidades.ts';
import { contextoFs, leerValor } from '../scripts/lib/caducidades-io.mjs';

const registro = JSON.parse(readFileSync(new URL('../src/config/caducidades.json', import.meta.url), 'utf8')) as { entradas: Entrada[] };
const base = (vence: Entrada['vence'], extra: Partial<Entrada> = {}): Entrada => ({
  id: 'x',
  descripcion: 'dato',
  donde: 'f',
  fuente: 'f',
  fuenteUrl: null,
  frecuencia: 'mensual',
  cuando: 'c',
  fecha: { tipo: 'literal', valor: '2026-01-01' },
  vence,
  critico: true,
  actualizacion: { modo: 'investigacion', procedimiento: 'p' },
  responsable: 'r',
  ...extra,
});

test('días: aviso y vencido por antigüedad; solo bloquea si es crítico', () => {
  const e = base({ tipo: 'dias', aviso: 8, error: 10 });
  assert.equal(evaluar(e, '2026-10-19', '2026-10-26').nivel, 'ok');
  assert.equal(evaluar(e, '2026-10-19', '2026-10-27').nivel, 'aviso');
  const v = evaluar(e, '2026-10-19', '2026-10-29');
  assert.equal(v.nivel, 'vencido');
  assert.equal(v.bloquea, true);
  assert.equal(evaluar({ ...e, critico: false }, '2026-10-19', '2026-10-29').bloquea, false);
  assert.equal(evaluar(e, '2026-10-19', '2026-10-20').proxima, '2026-10-27');
});

test('mes del dato: igual que el euríbor (desde el día indicado debe estar el mes anterior)', () => {
  const e = base({ tipo: 'mes-dato', dia: 18 });
  assert.equal(evaluar(e, '2026-09', '2026-11-17').nivel, 'ok');
  assert.equal(evaluar(e, '2026-09', '2026-11-18').nivel, 'vencido');
  assert.equal(evaluar(e, '2026-10', '2026-11-18').nivel, 'ok');
  assert.equal(evaluar(e, '2026-11', '2027-01-05').nivel, 'ok');
  assert.equal(evaluar(e, '2026-10', '2027-01-18').nivel, 'vencido');
  assert.equal(evaluar(e, '2026-09', '2026-10-30').proxima, '2026-11-18');
});

test('días hábiles TARGET: aviso con 2, vencido con 3', () => {
  const e = base({ tipo: 'habiles-target', aviso: 2, error: 3 });
  assert.equal(evaluar(e, '2026-10-22', '2026-10-26').nivel, 'ok');
  assert.equal(evaluar(e, '2026-10-21', '2026-10-26').nivel, 'aviso');
  assert.equal(evaluar(e, '2026-10-20', '2026-10-26').nivel, 'vencido');
});

test('anual: vence tras la fecha más una gracia, y varias fechas al año', () => {
  const e = base({ tipo: 'anual', mes: 4, dia: 15, gracia: 30 });
  assert.equal(evaluar(e, '2026-09-24', '2027-04-14').nivel, 'ok');
  assert.equal(evaluar(e, '2026-09-24', '2027-04-15').nivel, 'aviso');
  assert.equal(evaluar(e, '2026-09-24', '2027-05-15').nivel, 'vencido');
  assert.equal(evaluar(e, '2027-04-20', '2027-05-15').nivel, 'ok'); // revisado después de la fecha
  const doble = base({ tipo: 'anual', mes: 1, dia: 31, gracia: 30, tambien: [[4, 15]] });
  assert.equal(evaluar(doble, '2026-09-24', '2027-02-15').nivel, 'aviso');
  assert.equal(evaluar(doble, '2027-02-01', '2027-04-10').nivel, 'ok');
  assert.equal(evaluar(doble, '2027-02-01', '2027-04-16').nivel, 'aviso'); // ahora toca la de abril
  assert.equal(evaluar(doble, '2027-02-01', '2027-04-10').proxima, '2027-04-15');
  assert.equal(ultimaOcurrencia('2027-03-01', 4, 15), '2026-04-15');
  assert.equal(proximaOcurrencia('2027-04-15', 4, 15), '2028-04-15');
});

test('cola de artículos y ofertas con fecha', () => {
  const cola = base({ tipo: 'cola', aviso: 7, error: 2 });
  assert.equal(evaluar(cola, 7, '2026-10-30').nivel, 'ok');
  assert.equal(evaluar(cola, 6, '2026-10-30').nivel, 'aviso');
  assert.equal(evaluar(cola, 1, '2026-10-30').nivel, 'vencido');
  const json = {
    cuentas: [
      { banco: 'A', producto: 'P', duracion: '12 meses (altas hasta el 22/11/2026)', requisitos: '' },
      { banco: 'B', producto: 'Q', duracion: 'Indefinida', requisitos: 'oferta hasta 31/12/2026' },
    ],
    depositos: [],
  };
  const lista = ofertasConFecha(json);
  assert.deepEqual(lista, [
    { oferta: 'A P', fecha: '2026-11-22' },
    { oferta: 'B Q', fecha: '2026-12-31' },
  ]);
  const of = base({ tipo: 'ofertas', avisoDias: 14 });
  assert.equal(evaluar(of, lista, '2026-10-30').nivel, 'ok');
  assert.equal(evaluar(of, lista, '2026-11-10').nivel, 'aviso');
  assert.equal(evaluar(of, lista, '2026-11-23').nivel, 'vencido'); // la oferta de A ya caducó
});

test('sin fecha y fecha ilegible', () => {
  assert.equal(evaluar(base({ tipo: 'sin-fecha' }), null, '2026-10-30').informativo, true);
  assert.equal(evaluar(base({ tipo: 'dias', aviso: 8, error: 10 }), null, '2026-10-30').nivel, 'vencido');
});

test('el registro real tiene la estructura correcta', () => {
  assert.deepEqual(validarRegistro(registro.entradas), []);
  assert.ok(registro.entradas.length >= 25);
});

test('toda constante de finance.ts está en el registro (una cifra nueva obliga a darla de alta)', () => {
  const finance = readFileSync(new URL('../src/config/finance.ts', import.meta.url), 'utf8');
  const nombres = [...finance.matchAll(/^export const ([A-Z0-9_]+)/gm)].map((m) => m[1]);
  const donde = registro.entradas.map((e) => e.donde).join(' ');
  assert.deepEqual(
    nombres.filter((n) => !donde.includes(n)),
    [],
  );
});

test('la fecha de verificación de cada entrada se puede leer de su fichero', () => {
  const ctx = contextoFs(fileURLToPath(new URL('..', import.meta.url)));
  for (const e of registro.entradas) {
    if (e.vence.tipo === 'sin-fecha') continue;
    const v = leerValor(e.fecha, ctx, '2026-10-30');
    assert.ok(v !== null && v !== undefined, `${e.id}: no se pudo leer la fecha`);
    if (typeof v === 'string') assert.match(v, /^\d{4}-\d{2}(-\d{2})?$/, `${e.id}: formato de fecha`);
  }
});

test('los resultados del script de frescura que cita el registro existen', () => {
  const nombres = ['Tipo de depósito del BCE', 'Euro / dólar', 'Euríbor (BOE)', 'Cuentas remuneradas'];
  for (const e of registro.entradas) if (e.resultadoScript) assert.ok(nombres.includes(e.resultadoScript), e.id);
});
