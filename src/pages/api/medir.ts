import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { leerJsonAcotado, rechazarPeticionAjena } from '../../lib/api-seguridad';
import { MEDICION_TTL_SEGUNDOS, claveDelDia, leerContadores, sumarEvento, validarEvento } from '../../lib/medicion';

export const prerender = false;

interface Env {
  MEDICION: KVNamespace;
}

// Cuenta eventos de los bloques de captación (ver src/lib/medicion.ts). Responde 204 siempre que la petición sea
// del propio sitio, haya o no contado: quien mida no necesita saber si se alcanzó el tope del día.
// Los contadores del día están en una sola clave: dos eventos casi simultáneos pueden pisarse y perder alguno
// (es una medición aproximada, no contabilidad). La clave no incluye nada de la persona.
const MAX_BYTES = 300;

export const POST: APIRoute = async ({ request }) => {
  const rechazo = rechazarPeticionAjena(request);
  if (rechazo) return rechazo;

  const lectura = await leerJsonAcotado(request, MAX_BYTES);
  if (!lectura.ok) return lectura.respuesta;

  const ev = validarEvento(lectura.cuerpo);
  if (!ev) return new Response(null, { status: 204 });

  const { MEDICION } = env as unknown as Env;
  try {
    const clave = claveDelDia(new Date());
    const nuevo = sumarEvento(leerContadores(await MEDICION.get(clave)), ev);
    if (nuevo) await MEDICION.put(clave, JSON.stringify(nuevo), { expirationTtl: MEDICION_TTL_SEGUNDOS });
  } catch {
    // Si el KV falla, la medición se pierde pero la página no se entera.
  }
  return new Response(null, { status: 204 });
};
