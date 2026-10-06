/**
 * Comprobaciones previas comunes a los formularios de /api/*. Se ejecutan ANTES del límite de peticiones
 * para que una petición ajena no gaste escrituras del KV.
 *
 * - Content-Type JSON obligatorio: sin él, un formulario de otra web podría enviar el cuerpo como
 *   `text/plain` (petición "simple", sin comprobación previa del navegador) y el servidor lo leería igual.
 * - Origin: los navegadores lo envían siempre en un POST. Si viene de otra web, se rechaza. Un script sin
 *   navegador puede omitirlo, pero eso no es CSRF (nadie lo ejecuta en nombre de otra persona).
 */
export function rechazarPeticionAjena(request: Request): Response | null {
  const tipo = request.headers.get('Content-Type') ?? '';
  if (!tipo.toLowerCase().startsWith('application/json')) {
    return new Response(JSON.stringify({ error: 'unsupported_media_type' }), { status: 415 });
  }
  const origen = request.headers.get('Origin');
  if (origen && origen !== new URL(request.url).origin) {
    return new Response(JSON.stringify({ error: 'forbidden_origin' }), { status: 403 });
  }
  return null;
}
