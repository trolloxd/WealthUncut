// Pruebas de "Los datos de hoy": fecha de entrada en vigor del tipo del BCE y condiciones de la cuenta con más TAE,
// y forma del euríbor oficial (cada mes con su resolución del BOE).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { condicionesCuenta, vigenteDesde, type Obs } from '../src/lib/datos-de-hoy.ts';

test('vigenteDesde: el primer día con el valor actual, o null si no cambia en la serie', () => {
  const obs: Obs[] = [
    ['2026-09-14', 2.25],
    ['2026-09-15', 2.25],
    ['2026-09-16', 2.5],
    ['2026-09-17', 2.5],
  ];
  assert.equal(vigenteDesde(obs), '2026-09-16');
  assert.equal(vigenteDesde([['2026-09-16', 2.5], ['2026-09-17', 2.5]]), null);
  assert.equal(vigenteDesde([]), null);
});

test('condicionesCuenta: oferta de bienvenida con plazo, tope y requisitos', () => {
  assert.deepEqual(
    condicionesCuenta({
      banco: 'Revolut',
      tae: 3.51,
      importeMaximo: 25000,
      duracion: '4 meses desde el alta',
      requisitos: 'Nuevo cliente, 3 pagos con tarjeta de al menos 5 € al mes',
    }),
    ['solo nuevos clientes', '4 meses', 'hasta 25.000 €', 'con requisitos'],
  );
  assert.deepEqual(condicionesCuenta({ banco: 'X', tae: 2, duracion: 'Indefinida', requisitos: 'Ninguno' }), []);
  assert.deepEqual(condicionesCuenta({ banco: 'X', tae: 2, duracion: '3 meses', requisitos: 'Nuevo cliente de X' }), [
    'solo nuevos clientes',
    '3 meses',
  ]);
});

test('euríbor: solo valores oficiales del BOE, uno por mes y sin huecos', () => {
  const e = JSON.parse(readFileSync(new URL('../src/data/euribor/ultimo.json', import.meta.url), 'utf8'));
  assert.match(e.fuenteUrl, /^https:\/\/www\.boe\.es\//);
  assert.equal(e.historico.at(-1).mes, e.ultimoMes);
  assert.equal(e.historico.at(-1).valor, e.ultimoValor);
  for (let i = 0; i < e.historico.length; i++) {
    const p = e.historico[i];
    assert.match(p.boe, /^BOE-A-\d{4}-\d+$/, `${p.mes} sin resolución del BOE`);
    assert.equal(Math.round(p.valor * 1000) / 1000, p.valor, `${p.mes} con más de 3 decimales`);
    if (i > 0) {
      const [a, m] = e.historico[i - 1].mes.split('-').map(Number);
      const siguiente = m === 12 ? `${a + 1}-01` : `${a}-${String(m + 1).padStart(2, '0')}`;
      assert.equal(p.mes, siguiente, `hueco antes de ${p.mes}`);
    }
  }
  // Dos resoluciones comprobadas a mano el 2026-10-26 en el BOE.
  const porMes = new Map(e.historico.map((p: { mes: string }) => [p.mes, p]));
  assert.deepEqual(porMes.get('2026-09'), { mes: '2026-09', valor: 3.247, boe: 'BOE-A-2026-20519', publicado: '2026-10-02' });
  assert.deepEqual(porMes.get('2025-09'), { mes: '2025-09', valor: 2.172, boe: 'BOE-A-2025-19593', publicado: '2025-10-02' });
});
