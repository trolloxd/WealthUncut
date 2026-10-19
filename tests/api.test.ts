// Pruebas de las protecciones comunes de /api/* (src/lib/api-seguridad.ts). Ejecutar con `npm test`.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { dentroDelLimite, esBot, leerJsonAcotado, rechazarPeticionAjena } from '../src/lib/api-seguridad.ts';

const post = (cuerpo: BodyInit | null, cabeceras: Record<string, string> = {}) =>
  new Request('https://wealthuncut.com/api/sugerencias', { method: 'POST', body: cuerpo, headers: cabeceras });

test('rechaza lo que no es JSON y los orígenes ajenos', async () => {
  assert.equal(rechazarPeticionAjena(post('{}', { 'Content-Type': 'text/plain' }))?.status, 415);
  assert.equal(rechazarPeticionAjena(post('{}', { 'Content-Type': 'application/json', Origin: 'https://otra-web.com' }))?.status, 403);
  assert.equal(rechazarPeticionAjena(post('{}', { 'Content-Type': 'application/json', Origin: 'https://wealthuncut.com' })), null);
  assert.equal(rechazarPeticionAjena(post('{}', { 'Content-Type': 'application/json; charset=utf-8' })), null); // sin Origin: script, no CSRF
});

test('lee un JSON normal', async () => {
  const r = await leerJsonAcotado(post('{"mensaje":"hola, qué tal"}', { 'Content-Type': 'application/json' }), 1000);
  assert.ok(r.ok);
  if (r.ok) assert.equal(r.cuerpo.mensaje, 'hola, qué tal'); // con tilde: se decodifica en UTF-8
});

test('corta los cuerpos grandes, también cuando no declaran su tamaño', async () => {
  const declarado = await leerJsonAcotado(post('{"a":1}', { 'Content-Length': '99999' }), 100);
  assert.ok(!declarado.ok);
  if (!declarado.ok) assert.equal(declarado.respuesta.status, 413);

  // cuerpo en trozos, sin Content-Length: lo que cuenta es lo recibido de verdad
  const trozo = new TextEncoder().encode('x'.repeat(60));
  const flujo = new ReadableStream({
    start(c) {
      c.enqueue(trozo);
      c.enqueue(trozo);
      c.close();
    },
  });
  const sinCabecera = new Request('https://wealthuncut.com/api/sugerencias', { method: 'POST', body: flujo, duplex: 'half' } as RequestInit);
  const r = await leerJsonAcotado(sinCabecera, 100);
  assert.ok(!r.ok);
  if (!r.ok) assert.equal(r.respuesta.status, 413);
});

test('JSON inválido o que no es un objeto da 400', async () => {
  for (const malo of ['{no es json', '[1,2]', 'null', '"texto"', '']) {
    const r = await leerJsonAcotado(post(malo), 1000);
    assert.ok(!r.ok, malo);
    if (!r.ok) assert.equal(r.respuesta.status, 400, malo);
  }
});

test('límite de peticiones: 5 por IP y hora, y cada IP va por separado', async () => {
  const datos = new Map<string, string>();
  const kv = {
    get: async (k: string) => datos.get(k) ?? null,
    put: async (k: string, v: string) => void datos.set(k, v),
  };
  const resultados = [];
  for (let i = 0; i < 7; i++) resultados.push(await dentroDelLimite(kv as never, 'prueba', '1.2.3.4'));
  assert.deepEqual(resultados, [true, true, true, true, true, false, false]);
  assert.equal(await dentroDelLimite(kv as never, 'prueba', '5.6.7.8'), true);
  assert.equal(await dentroDelLimite(kv as never, 'otra-ruta', '1.2.3.4'), true);
});

test('campo trampa', () => {
  assert.equal(esBot({ web: 'http://spam' }), true);
  assert.equal(esBot({ web: '   ' }), false);
  assert.equal(esBot({}), false);
});
