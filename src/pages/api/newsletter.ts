import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

interface Env {
  SUGERENCIAS: KVNamespace;
}

// Reutiliza el mismo KV que el buzón de sugerencias (no hace falta un namespace nuevo), con un
// prefijo de clave distinto para no mezclar las dos cosas.
const LIMITE_PETICIONES = 5;
const VENTANA_SEGUNDOS = 60 * 60;

async function dentroDelLimite(kv: KVNamespace, ip: string): Promise<boolean> {
  const key = `ratelimit:newsletter:${ip}`;
  const actual = Number((await kv.get(key)) ?? '0');
  if (actual >= LIMITE_PETICIONES) return false;
  await kv.put(key, String(actual + 1), { expirationTtl: VENTANA_SEGUNDOS });
  return true;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request }) => {
  const { SUGERENCIAS } = env as unknown as Env;
  const ip = request.headers.get('CF-Connecting-IP') ?? 'sin-ip';

  if (!(await dentroDelLimite(SUGERENCIAS, ip))) {
    return new Response(JSON.stringify({ error: 'rate_limited' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': String(VENTANA_SEGUNDOS) },
    });
  }

  const contentLength = Number(request.headers.get('Content-Length') ?? '0');
  if (contentLength > 5_000) {
    return new Response(JSON.stringify({ error: 'payload_too_large' }), { status: 413 });
  }

  let body: { email?: unknown; consentimiento?: unknown; web?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), { status: 400 });
  }

  // Honeypot: igual que en sugerencias.ts.
  if (typeof body.web === 'string' && body.web.trim() !== '') {
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (email.length > 200 || !EMAIL_RE.test(email)) {
    return new Response(JSON.stringify({ error: 'invalid_email' }), { status: 400 });
  }
  if (body.consentimiento !== true) {
    return new Response(JSON.stringify({ error: 'missing_consent' }), { status: 400 });
  }

  // Una clave por email (no por envío) para que suscribirse dos veces no duplique la entrada.
  const key = `newsletter:suscripcion:${email}`;
  const yaExistia = (await SUGERENCIAS.get(key)) !== null;
  if (!yaExistia) {
    await SUGERENCIAS.put(key, JSON.stringify({ email, suscritoEn: new Date().toISOString() }));
  }

  return new Response(JSON.stringify({ ok: true, yaExistia }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
