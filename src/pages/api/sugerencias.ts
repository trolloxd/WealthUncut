import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

interface Env {
  SUGERENCIAS: KVNamespace;
}

export const POST: APIRoute = async ({ request }) => {
  let body: { mensaje?: unknown; email?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), { status: 400 });
  }

  const mensaje = typeof body.mensaje === 'string' ? body.mensaje.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';

  if (mensaje.length < 10 || mensaje.length > 2000) {
    return new Response(JSON.stringify({ error: 'invalid_mensaje' }), { status: 400 });
  }
  if (email.length > 200) {
    return new Response(JSON.stringify({ error: 'invalid_email' }), { status: 400 });
  }

  const receivedAt = new Date().toISOString();
  const key = `sugerencia:${receivedAt}:${crypto.randomUUID()}`;

  const { SUGERENCIAS } = env as unknown as Env;
  await SUGERENCIAS.put(key, JSON.stringify({ mensaje, email, receivedAt }));

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
