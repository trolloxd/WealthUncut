// Pruebas del calendario fiscal y de su exportación .ics (src/lib/calculos/calendario-fiscal.ts).
// Los días de la semana de 2027 se comprobaron aparte: 20-ene-2027 miércoles, 30-ene sábado, 1-feb lunes,
// 31-mar miércoles, 20-abr martes, 20-jul martes.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  EVENTOS_FISCALES,
  PERFILES,
  escaparTexto,
  eventosDePerfil,
  generarIcs,
  plegarLinea,
} from '../src/lib/calculos/calendario-fiscal.ts';

const diaSemana = (f: string) => new Date(`${f}T12:00:00Z`).getUTCDay(); // 0 domingo ... 6 sábado
const octetos = (l: string) => new TextEncoder().encode(l).length;

test('cada evento tiene fuente https, perfiles y un id único', () => {
  const ids = new Set<string>();
  for (const e of EVENTOS_FISCALES) {
    assert.ok(e.fuente.url.startsWith('https://'), e.id);
    assert.ok(e.fuente.etiqueta.length > 5, e.id);
    assert.ok(e.perfiles.length > 0, e.id);
    assert.ok(!ids.has(e.id), `id repetido ${e.id}`);
    ids.add(e.id);
  }
});

test('los plazos de presentación no caen en fin de semana', () => {
  const cierres = new Set(['cierre-2026', 'regimen-autonomo-2027', 'saldo-extranjero-2026']);
  for (const e of EVENTOS_FISCALES) {
    if (!e.fecha || cierres.has(e.id)) continue;
    const d = diaSemana(e.fecha);
    assert.ok(d >= 1 && d <= 5, `${e.id} cae en el día ${d}`);
  }
});

test('el 30 de enero de 2027 es sábado y el cuarto trimestre se prevé el lunes 1 de febrero', () => {
  assert.equal(diaSemana('2027-01-30'), 6);
  const e = EVENTOS_FISCALES.find((x) => x.id === 'pago-fraccionado-4t-2026')!;
  assert.equal(e.fecha, '2027-02-01');
  assert.equal(diaSemana(e.fecha!), 1);
  assert.equal(e.estado, 'previsto');
});

test('estados de las fechas conocidas', () => {
  const segundoPlazo = EVENTOS_FISCALES.find((x) => x.id === 'renta-2025-segundo-plazo')!;
  assert.equal(segundoPlazo.fecha, '2026-11-05');
  assert.equal(segundoPlazo.estado, 'oficial');
  assert.equal(EVENTOS_FISCALES.find((x) => x.id === 'trimestre-1-2027')!.estado, 'previsto');
  assert.equal(EVENTOS_FISCALES.find((x) => x.id === 'modelos-720-721-2027')!.fecha, '2027-03-31');
});

test('filtro por perfil: ordenado, sin pasadas y con las pendientes de fecha al final', () => {
  const todos = eventosDePerfil('autonomo');
  const fechas = todos.filter((e) => e.fecha).map((e) => e.fecha!);
  assert.deepEqual(fechas, [...fechas].sort());
  assert.equal(todos.at(-1)!.fecha, null);
  const desdeEnero = eventosDePerfil('autonomo', '2027-01-01');
  assert.ok(desdeEnero.every((e) => e.fecha === null || e.fecha >= '2027-01-01'));
  assert.ok(!eventosDePerfil('asalariado').some((e) => e.id === 'pago-fraccionado-4t-2026'));
  assert.ok(eventosDePerfil('inversor').some((e) => e.id === 'modelos-720-721-2027'));
});

test('escapado y plegado de líneas iCalendar', () => {
  assert.equal(escaparTexto('a, b; c\\d\ne'), 'a\\, b\\; c\\\\d\\ne');
  const larga = 'DESCRIPTION:' + 'á'.repeat(100);
  const plegada = plegarLinea(larga).split('\r\n');
  assert.ok(plegada.length > 1);
  for (const [i, l] of plegada.entries()) {
    assert.ok(octetos(l) <= 75, `línea ${i}`);
    if (i > 0) assert.ok(l.startsWith(' '));
  }
  assert.equal(plegada.map((l, i) => (i ? l.slice(1) : l)).join(''), larga);
});

test('el .ics es válido: CRLF, eventos de día completo, avisos y UID únicos', () => {
  for (const p of PERFILES) {
    const ics = generarIcs(p.id, '2026-10-27');
    assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n') && ics.endsWith('END:VCALENDAR\r\n'));
    assert.ok(!/(^|[^\r])\n/.test(ics), 'solo CRLF');
    for (const l of ics.split('\r\n')) assert.ok(octetos(l) <= 75);
    const esperados = eventosDePerfil(p.id, '2026-10-27').filter((e) => e.fecha).length;
    assert.equal((ics.match(/BEGIN:VEVENT/g) ?? []).length, esperados);
    assert.equal((ics.match(/BEGIN:VALARM/g) ?? []).length, esperados * 2);
    const uids = ics.match(/^UID:.*$/gm) ?? [];
    assert.equal(new Set(uids).size, uids.length);
  }
  const ics = generarIcs('autonomo', '2026-10-27');
  assert.ok(ics.includes('DTSTART;VALUE=DATE:20270201\r\nDTEND;VALUE=DATE:20270202'));
  assert.ok(ics.includes('SUMMARY:(Previsto) '));
  assert.ok(!ics.includes('renta-2026-campana')); // el evento sin fecha no se exporta
});

test('el texto público no lleva guiones largos', () => {
  const texto = JSON.stringify(EVENTOS_FISCALES) + generarIcs('inversor');
  assert.ok(!/[—–]/.test(texto));
});
