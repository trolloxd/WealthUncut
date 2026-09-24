import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

interface Env {
  SUGERENCIAS: KVNamespace;
}

// Límite de peticiones por IP: evita que un script pueda machacar la API a base de peticiones
// (llenar el KV de basura, o simplemente saturar la ruta) sin afectar a un uso normal del
// formulario, que nunca envía más de un puñado de sugerencias por hora.
const LIMITE_PETICIONES = 5;
const VENTANA_SEGUNDOS = 60 * 60;

async function dentroDelLimite(kv: KVNamespace, ip: string): Promise<boolean> {
  const key = `ratelimit:sugerencias:${ip}`;
  const actual = Number((await kv.get(key)) ?? '0');
  if (actual >= LIMITE_PETICIONES) return false;
  await kv.put(key, String(actual + 1), { expirationTtl: VENTANA_SEGUNDOS });
  return true;
}

export const POST: APIRoute = async ({ request }) => {
  const { SUGERENCIAS } = env as unknown as Env;
  const ip = request.headers.get('CF-Connecting-IP') ?? 'sin-ip';

  if (!(await dentroDelLimite(SUGERENCIAS, ip))) {
    return new Response(JSON.stringify({ error: 'rate_limited' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': String(VENTANA_SEGUNDOS) },
    });
  }

  // Rechaza cuerpos grandes antes de intentar parsearlos (los campos válidos no llegan ni a 10 KB).
  const contentLength = Number(request.headers.get('Content-Length') ?? '0');
  if (contentLength > 10_000) {
    return new Response(JSON.stringify({ error: 'payload_too_large' }), { status: 413 });
  }

  let body: { mensaje?: unknown; email?: unknown; web?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), { status: 400 });
  }

  // Campo trampa invisible para personas: si llega relleno, es un bot. Se responde como si
  // hubiera ido bien para no darle pistas, pero no se guarda nada.
  if (typeof body.web === 'string' && body.web.trim() !== '') {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const mensaje = typeof body.mensaje === 'string' ? body.mensaje.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';

  if (mensaje.length < 10 || mensaje.length > 2000) {
    return new Response(JSON.stringify({ error: 'invalid_mensaje' }), { status: 400 });
  }
  if (email.length > 200 || (email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    return new Response(JSON.stringify({ error: 'invalid_email' }), { status: 400 });
  }

  const receivedAt = new Date().toISOString();
  const key = `sugerencia:${receivedAt}:${crypto.randomUUID()}`;

  await SUGERENCIAS.put(key, JSON.stringify({ mensaje, email, receivedAt }));

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
