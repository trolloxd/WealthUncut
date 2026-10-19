/**
 * Comprobaciones comunes a los formularios de /api/*. Se ejecutan en este orden para no gastar recursos con
 * peticiones ajenas: origen y tipo, tamaño del cuerpo, límite de peticiones (KV) y, solo entonces, el contenido.
 *
 * - Content-Type JSON obligatorio: sin él, un formulario de otra web podría enviar el cuerpo como
 *   `text/plain` (petición "simple", sin comprobación previa del navegador) y el servidor lo leería igual.
 * - Origin: los navegadores lo envían siempre en un POST. Si viene de otra web, se rechaza. Un script sin
 *   navegador puede omitirlo, pero eso no es CSRF (nadie lo ejecuta en nombre de otra persona).
 */

export const jsonRespuesta = (datos: unknown, status = 200, cabeceras: Record<string, string> = {}): Response =>
  new Response(JSON.stringify(datos), { status, headers: { 'Content-Type': 'application/json', ...cabeceras } });

export function rechazarPeticionAjena(request: Request): Response | null {
  const tipo = request.headers.get('Content-Type') ?? '';
  if (!tipo.toLowerCase().startsWith('application/json')) {
    return jsonRespuesta({ error: 'unsupported_media_type' }, 415);
  }
  const origen = request.headers.get('Origin');
  if (origen && origen !== new URL(request.url).origin) {
    return jsonRespuesta({ error: 'forbidden_origin' }, 403);
  }
  return null;
}

/**
 * Lee el cuerpo JSON de una petición con un tope de bytes. A diferencia de fiarse de la cabecera
 * Content-Length (que puede faltar o mentir si el cuerpo va en trozos), cuenta lo recibido de verdad y
 * corta la lectura al pasar el límite.
 */
export async function leerJsonAcotado(
  request: Request,
  maxBytes: number
): Promise<{ ok: true; cuerpo: Record<string, unknown> } | { ok: false; respuesta: Response }> {
  const declarado = Number(request.headers.get('Content-Length') ?? '0');
  if (declarado > maxBytes) return { ok: false, respuesta: jsonRespuesta({ error: 'payload_too_large' }, 413) };

  const lector = request.body?.getReader();
  if (!lector) return { ok: false, respuesta: jsonRespuesta({ error: 'invalid_json' }, 400) };
  const trozos: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await lector.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await lector.cancel();
      return { ok: false, respuesta: jsonRespuesta({ error: 'payload_too_large' }, 413) };
    }
    trozos.push(value);
  }
  const bytes = new Uint8Array(total);
  let pos = 0;
  for (const t of trozos) {
    bytes.set(t, pos);
    pos += t.byteLength;
  }
  try {
    const cuerpo = JSON.parse(new TextDecoder().decode(bytes));
    if (cuerpo === null || typeof cuerpo !== 'object' || Array.isArray(cuerpo)) throw new Error('no es un objeto');
    return { ok: true, cuerpo: cuerpo as Record<string, unknown> };
  } catch {
    return { ok: false, respuesta: jsonRespuesta({ error: 'invalid_json' }, 400) };
  }
}

/** Límite de peticiones por IP y hora, guardado en el propio KV (clave `ratelimit:<prefijo>:<ip>`, con caducidad). */
export async function dentroDelLimite(
  kv: Pick<KVNamespace, 'get' | 'put'>,
  prefijo: string,
  ip: string,
  limite = 5,
  ventanaSegundos = 60 * 60
): Promise<boolean> {
  const key = `ratelimit:${prefijo}:${ip}`;
  const actual = Number((await kv.get(key)) ?? '0');
  if (actual >= limite) return false;
  await kv.put(key, String(actual + 1), { expirationTtl: ventanaSegundos });
  return true;
}

export const respuestaLimite = (ventanaSegundos = 60 * 60): Response =>
  jsonRespuesta({ error: 'rate_limited' }, 429, { 'Retry-After': String(ventanaSegundos) });

/** El campo trampa invisible para personas: si llega relleno es un bot. */
export const esBot = (cuerpo: Record<string, unknown>): boolean => typeof cuerpo.web === 'string' && cuerpo.web.trim() !== '';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
