import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { EMAIL_RE, dentroDelLimite, esBot, jsonRespuesta, leerJsonAcotado, rechazarPeticionAjena, respuestaLimite } from '../../lib/api-seguridad';

export const prerender = false;

interface Env {
  SUGERENCIAS: KVNamespace;
}

// Límite de peticiones por IP (5 por hora, ver api-seguridad.ts): evita que un script pueda machacar la API
// (llenar el KV de basura, o saturar la ruta) sin afectar a un uso normal del formulario, que nunca envía más
// de un puñado de sugerencias por hora. Los campos válidos no llegan ni a 10 KB.
const MAX_BYTES = 10_000;

export const POST: APIRoute = async ({ request }) => {
  const { SUGERENCIAS } = env as unknown as Env;
  const rechazo = rechazarPeticionAjena(request);
  if (rechazo) return rechazo;

  const lectura = await leerJsonAcotado(request, MAX_BYTES);
  if (!lectura.ok) return lectura.respuesta;
  const body = lectura.cuerpo;

  const ip = request.headers.get('CF-Connecting-IP') ?? 'sin-ip';
  if (!(await dentroDelLimite(SUGERENCIAS, 'sugerencias', ip))) return respuestaLimite();

  // Campo trampa invisible para personas: si llega relleno, es un bot. Se responde como si
  // hubiera ido bien para no darle pistas, pero no se guarda nada.
  if (esBot(body)) return jsonRespuesta({ ok: true });

  const mensaje = typeof body.mensaje === 'string' ? body.mensaje.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';

  if (mensaje.length < 10 || mensaje.length > 2000) return jsonRespuesta({ error: 'invalid_mensaje' }, 400);
  if (email.length > 200 || (email !== '' && !EMAIL_RE.test(email))) return jsonRespuesta({ error: 'invalid_email' }, 400);

  const receivedAt = new Date().toISOString();
  const key = `sugerencia:${receivedAt}:${crypto.randomUUID()}`;

  // Se borra sola a los 12 meses: es el plazo de conservación que declara la política de privacidad.
  await SUGERENCIAS.put(key, JSON.stringify({ mensaje, email, receivedAt }), { expirationTtl: 60 * 60 * 24 * 365 });

  return jsonRespuesta({ ok: true });
};
