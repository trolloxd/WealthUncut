import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { EMAIL_RE, dentroDelLimite, esBot, jsonRespuesta, leerJsonAcotado, rechazarPeticionAjena, respuestaLimite } from '../../lib/api-seguridad';

export const prerender = false;

interface Env {
  SUGERENCIAS: KVNamespace;
}

// Reutiliza el mismo KV que el buzón de sugerencias (no hace falta un namespace nuevo), con un
// prefijo de clave distinto para no mezclar las dos cosas.
const MAX_BYTES = 5_000;

export const POST: APIRoute = async ({ request }) => {
  const { SUGERENCIAS } = env as unknown as Env;
  const rechazo = rechazarPeticionAjena(request);
  if (rechazo) return rechazo;

  const lectura = await leerJsonAcotado(request, MAX_BYTES);
  if (!lectura.ok) return lectura.respuesta;
  const body = lectura.cuerpo;

  const ip = request.headers.get('CF-Connecting-IP') ?? 'sin-ip';
  if (!(await dentroDelLimite(SUGERENCIAS, 'newsletter', ip))) return respuestaLimite();

  // Honeypot: igual que en sugerencias.ts.
  if (esBot(body)) return jsonRespuesta({ ok: true });

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (email.length > 200 || !EMAIL_RE.test(email)) return jsonRespuesta({ error: 'invalid_email' }, 400);
  if (body.consentimiento !== true) return jsonRespuesta({ error: 'missing_consent' }, 400);

  // Una clave por email (no por envío) para que suscribirse dos veces no duplique la entrada. La
  // respuesta es idéntica exista o no ya el email, para que nadie pueda comprobar quién está
  // suscrito probando direcciones.
  const key = `newsletter:suscripcion:${email}`;
  if ((await SUGERENCIAS.get(key)) === null) {
    await SUGERENCIAS.put(key, JSON.stringify({ email, suscritoEn: new Date().toISOString() }));
  }

  return jsonRespuesta({ ok: true });
};
