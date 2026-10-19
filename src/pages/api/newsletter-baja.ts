import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { EMAIL_RE, dentroDelLimite, esBot, jsonRespuesta, leerJsonAcotado, rechazarPeticionAjena, respuestaLimite } from '../../lib/api-seguridad';

export const prerender = false;

interface Env {
  SUGERENCIAS: KVNamespace;
}

const MAX_BYTES = 5_000;

// Siempre responde ok, exista o no el email, para que nadie pueda comprobar quién está suscrito.
// PENDIENTE al activar el envío real de correos: cualquiera que conozca un email puede darlo de baja desde
// aquí. Cuando haya proveedor de email, la baja debe hacerse con un enlace firmado (token en el correo).
export const POST: APIRoute = async ({ request }) => {
  const { SUGERENCIAS } = env as unknown as Env;
  const rechazo = rechazarPeticionAjena(request);
  if (rechazo) return rechazo;

  const lectura = await leerJsonAcotado(request, MAX_BYTES);
  if (!lectura.ok) return lectura.respuesta;
  const body = lectura.cuerpo;

  const ip = request.headers.get('CF-Connecting-IP') ?? 'sin-ip';
  if (!(await dentroDelLimite(SUGERENCIAS, 'newsletter-baja', ip))) return respuestaLimite();

  if (esBot(body)) return jsonRespuesta({ ok: true });

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (email.length > 200 || !EMAIL_RE.test(email)) return jsonRespuesta({ error: 'invalid_email' }, 400);

  await SUGERENCIAS.delete(`newsletter:suscripcion:${email}`);

  return jsonRespuesta({ ok: true });
};
