import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

interface Env {
  SUGERENCIAS: KVNamespace;
}

const LIMITE_PETICIONES = 5;
const VENTANA_SEGUNDOS = 60 * 60;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function dentroDelLimite(kv: KVNamespace, ip: string): Promise<boolean> {
  const key = `ratelimit:newsletter-baja:${ip}`;
  const actual = Number((await kv.get(key)) ?? '0');
  if (actual >= LIMITE_PETICIONES) return false;
  await kv.put(key, String(actual + 1), { expirationTtl: VENTANA_SEGUNDOS });
  return true;
}

// Siempre responde ok, exista o no el email, para que nadie pueda comprobar quién está suscrito.
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

  let body: { email?: unknown; web?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), { status: 400 });
  }

  if (typeof body.web === 'string' && body.web.trim() !== '') {
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (email.length > 200 || !EMAIL_RE.test(email)) {
    return new Response(JSON.stringify({ error: 'invalid_email' }), { status: 400 });
  }

  await SUGERENCIAS.delete(`newsletter:suscripcion:${email}`);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
