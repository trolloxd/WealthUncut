// Pruebas de src/lib/fuentes-euribor.ts: una fuente con el BOE del euríbor de un mes anterior pasa al último mes publicado.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import { fuentesConEuriborVigente } from '../src/lib/fuentes-euribor.ts';

const datos = {
  fuenteUrl: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-23168',
  ultimoMes: '2026-10',
  ultimoBoe: 'BOE-A-2026-23168',
  historico: [
    { mes: '2026-09', boe: 'BOE-A-2026-20519' },
    { mes: '2026-10', boe: 'BOE-A-2026-23168' },
  ],
};

test('una fuente del euríbor de septiembre pasa a octubre (enlace, código y mes)', () => {
  const [f] = fuentesConEuriborVigente(
    [{ label: 'BOE: tipos oficiales de septiembre de 2026 (Banco de España, BOE-A-2026-20519)', url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20519' }],
    datos,
  );
  assert.equal(f.url, datos.fuenteUrl);
  assert.equal(f.label, 'BOE: tipos oficiales de octubre de 2026 (Banco de España, BOE-A-2026-23168)');
});

test('las demás fuentes no cambian', () => {
  const otras = [
    { label: 'BOE: Ley 5/2019', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2019-3814' },
    { label: 'Euríbor ya vigente', url: datos.fuenteUrl },
    { label: 'AEAT', url: 'https://sede.agenciatributaria.gob.es/' },
  ];
  assert.deepEqual(fuentesConEuriborVigente(otras, datos), otras);
});

test('con los datos reales, ningún BOE del histórico distinto del último queda enlazado', () => {
  const real = JSON.parse(fs.readFileSync(new URL('../src/data/euribor/ultimo.json', import.meta.url), 'utf8'));
  const viejas = real.historico.filter((h: { boe: string }) => h.boe !== real.ultimoBoe).slice(-3)
    .map((h: { boe: string }) => ({ label: h.boe, url: `https://www.boe.es/diario_boe/txt.php?id=${h.boe}` }));
  for (const f of fuentesConEuriborVigente(viejas, real)) assert.equal(f.url, real.fuenteUrl);
});
