// Pruebas del alta y la baja del boletín y de sus avisos de correo (src/lib/newsletter-suscripciones.ts).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AVISO_TTL_SEGUNDOS, CLAVE_AVISO, darDeAlta, darDeBaja } from '../src/lib/newsletter-suscripciones.ts';

/** KV de mentira en memoria. Con `falloAvisos` cualquier escritura o borrado de un aviso lanza un error. */
function kvFalso({ falloAvisos = false } = {}) {
  const datos = new Map<string, { valor: string; opciones?: { expirationTtl?: number; metadata?: unknown } }>();
  const kv = {
    datos,
    async get(clave: string) {
      return datos.get(clave)?.valor ?? null;
    },
    async put(clave: string, valor: string, opciones?: { expirationTtl?: number; metadata?: unknown }) {
      if (falloAvisos && clave.startsWith(CLAVE_AVISO)) throw new Error('KV caído');
      datos.set(clave, { valor, opciones });
    },
    async delete(clave: string) {
      if (falloAvisos && clave.startsWith(CLAVE_AVISO)) throw new Error('KV caído');
      datos.delete(clave);
    },
  };
  return kv as typeof kv & KVNamespace;
}

const EMAIL = 'ana@example.com';
const AHORA = new Date('2026-10-21T10:00:00Z');

test('un alta nueva guarda la suscripción y deja un aviso de bienvenida que caduca solo', async () => {
  const kv = kvFalso();
  assert.deepEqual(await darDeAlta(kv, EMAIL, AHORA), { nueva: true, aviso: true });
  assert.equal(JSON.parse((await kv.get(`newsletter:suscripcion:${EMAIL}`))!).suscritoEn, AHORA.toISOString());
  const aviso = kv.datos.get(`newsletter:aviso:bienvenida:${EMAIL}`);
  assert.ok(aviso);
  assert.equal(aviso.opciones?.expirationTtl, AVISO_TTL_SEGUNDOS);
  assert.deepEqual(aviso.opciones?.metadata, { at: AHORA.toISOString() });
});

test('repetir el alta no duplica la suscripción ni la bienvenida', async () => {
  const kv = kvFalso();
  await darDeAlta(kv, EMAIL, AHORA);
  kv.datos.delete(`newsletter:aviso:bienvenida:${EMAIL}`); // el PC ya lo recogió
  assert.deepEqual(await darDeAlta(kv, EMAIL, new Date('2026-10-21T11:00:00Z')), { nueva: false, aviso: false });
  assert.equal(kv.datos.has(`newsletter:aviso:bienvenida:${EMAIL}`), false);
  assert.equal(JSON.parse((await kv.get(`newsletter:suscripcion:${EMAIL}`))!).suscritoEn, AHORA.toISOString());
});

test('si el aviso falla, el alta y la baja se hacen igual', async () => {
  const kv = kvFalso({ falloAvisos: true });
  assert.deepEqual(await darDeAlta(kv, EMAIL, AHORA), { nueva: true, aviso: false });
  assert.notEqual(await kv.get(`newsletter:suscripcion:${EMAIL}`), null);
  assert.deepEqual(await darDeBaja(kv, EMAIL, AHORA), { estaba: true, aviso: false });
  assert.equal(await kv.get(`newsletter:suscripcion:${EMAIL}`), null);
});

test('la baja de un suscriptor borra su email de la lista y deja un aviso de baja', async () => {
  const kv = kvFalso();
  await darDeAlta(kv, EMAIL, AHORA);
  assert.deepEqual(await darDeBaja(kv, EMAIL, AHORA), { estaba: true, aviso: true });
  assert.equal(await kv.get(`newsletter:suscripcion:${EMAIL}`), null);
  assert.ok(kv.datos.has(`newsletter:aviso:baja:${EMAIL}`));
  // la bienvenida que aún no había salido se anula: solo recibe la confirmación de baja
  assert.equal(kv.datos.has(`newsletter:aviso:bienvenida:${EMAIL}`), false);
});

test('la baja de un email que no estaba no deja aviso (nadie puede usarla para mandar correos)', async () => {
  const kv = kvFalso();
  assert.deepEqual(await darDeBaja(kv, 'nunca@example.com', AHORA), { estaba: false, aviso: false });
  assert.equal(kv.datos.size, 0);
});

test('volver a suscribirse anula la confirmación de baja pendiente', async () => {
  const kv = kvFalso();
  await darDeAlta(kv, EMAIL, AHORA);
  await darDeBaja(kv, EMAIL, AHORA);
  assert.deepEqual(await darDeAlta(kv, EMAIL, AHORA), { nueva: true, aviso: true });
  assert.equal(kv.datos.has(`newsletter:aviso:baja:${EMAIL}`), false);
  assert.ok(kv.datos.has(`newsletter:aviso:bienvenida:${EMAIL}`));
});
