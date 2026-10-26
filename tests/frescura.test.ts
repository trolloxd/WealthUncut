// Frescura de "Los datos de hoy": umbrales (src/lib/frescura.ts) y aviso claro sobre los datos actuales.
// El aviso sobre los datos de hoy no hace fallar las pruebas (un dato atrasado no debe bloquear la publicación de
// artículos): sale en la salida como "AVISO FRESCURA" o "ERROR FRESCURA". La comprobación diaria contra las
// fuentes es scripts/comprobar-frescura.mjs.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { esHabilTarget, frescuraBCE, frescuraCuentas, frescuraEuribor, habilesSinDato, peor } from '../src/lib/frescura.ts';

test('días hábiles TARGET: fines de semana y cierres de TARGET no cuentan', () => {
  assert.equal(esHabilTarget('2026-10-24'), false); // sábado
  assert.equal(esHabilTarget('2026-12-25'), false);
  assert.equal(esHabilTarget('2026-04-03'), false); // Viernes Santo de 2026 (Pascua el 5 de abril)
  assert.equal(esHabilTarget('2026-04-06'), false); // Lunes de Pascua
  assert.equal(esHabilTarget('2026-10-26'), true);
  assert.equal(habilesSinDato('2026-10-23', '2026-10-26'), 0); // viernes a lunes
  assert.equal(habilesSinDato('2026-10-22', '2026-10-26'), 1); // falta el viernes
  assert.equal(habilesSinDato('2026-04-02', '2026-04-07'), 0); // Semana Santa
});

test('umbrales del BCE: aviso con 2 días hábiles sin dato, error con 3', () => {
  assert.equal(frescuraBCE('x', '2026-10-22', '2026-10-26').estado, 'ok');
  assert.equal(frescuraBCE('x', '2026-10-21', '2026-10-26').estado, 'aviso');
  assert.equal(frescuraBCE('x', '2026-10-20', '2026-10-26').estado, 'error');
});

test('umbrales de cuentas: aviso a los 8 días, error a los 10', () => {
  assert.equal(frescuraCuentas('2026-10-19', '2026-10-26').estado, 'ok');
  assert.equal(frescuraCuentas('2026-10-19', '2026-10-27').estado, 'aviso');
  assert.equal(frescuraCuentas('2026-10-19', '2026-10-29').estado, 'error');
});

test('euríbor: desde el día 4 debe estar el mes anterior', () => {
  assert.equal(frescuraEuribor('2026-09', '2026-11-03').estado, 'ok');
  assert.equal(frescuraEuribor('2026-09', '2026-11-04').estado, 'error');
  assert.equal(frescuraEuribor('2026-10', '2026-11-04').estado, 'ok');
  assert.equal(frescuraEuribor('2026-11', '2027-01-02').estado, 'ok');
  assert.equal(frescuraEuribor('2026-10', '2027-01-02').estado, 'error');
});

test('frescura de los datos actuales (avisa, no falla)', (t) => {
  const hoy = new Date().toISOString().slice(0, 10);
  const dir = new URL('../src/data/', import.meta.url);
  const mercados = readdirSync(new URL('mercados/', dir)).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort().reverse();
  // Última fecha de una serie, buscando hacia atrás si al fichero más reciente le falta (como la portada).
  const ultima = (id: string): string | null => {
    for (const f of mercados) {
      const obs = JSON.parse(readFileSync(new URL(`mercados/${f}`, dir), 'utf8')).series?.[id]?.obs;
      if (Array.isArray(obs) && obs.length) return obs.at(-1)[0];
    }
    return null;
  };
  const e = JSON.parse(readFileSync(new URL('euribor/ultimo.json', dir), 'utf8'));
  const c = JSON.parse(readFileSync(new URL('cuentas-remuneradas/ultimo.json', dir), 'utf8'));
  const dfr = ultima('dfr');
  const eurusd = ultima('eurusd');
  const rs = [
    dfr ? frescuraBCE('Tipo de depósito del BCE', dfr, hoy) : { dato: 'Tipo de depósito del BCE', estado: 'error' as const, detalle: 'sin datos' },
    eurusd ? frescuraBCE('Euro / dólar', eurusd, hoy) : { dato: 'Euro / dólar', estado: 'error' as const, detalle: 'sin datos' },
    frescuraEuribor(e.ultimoMes, hoy),
    frescuraCuentas(c.fecha, hoy),
  ];
  for (const r of rs) if (r.estado !== 'ok') t.diagnostic(`${r.estado === 'error' ? 'ERROR' : 'AVISO'} FRESCURA ${r.dato}: ${r.detalle}`);
  assert.ok(['ok', 'aviso', 'error'].includes(peor(rs)));
});
