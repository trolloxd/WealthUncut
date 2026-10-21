/**
 * Alta y baja del boletín en el KV, y aviso para el correo de bienvenida o de confirmación de baja.
 *
 * El correo no sale del Worker: aquí solo se deja un aviso en el KV (clave `newsletter:aviso:<tipo>:<email>`, que
 * caduca sola a las 72 horas) y lo recoge cada pocos minutos `automation/newsletter-avisos.js` en el PC de David,
 * que lo envía por su Gmail como contacto@wealthuncut.com (el mismo camino que el boletín). Así la contraseña de
 * Gmail nunca está en Cloudflare.
 *
 * Reglas:
 * - Si el aviso no se puede guardar, el alta o la baja siguen adelante igual (el correo es secundario).
 * - Solo un alta nueva deja aviso de bienvenida: repetir el alta con un email que ya está no envía nada.
 * - Solo la baja de un email que estaba en la lista deja aviso de baja: así nadie puede usar el formulario de
 *   baja para mandar correos a direcciones que nunca se suscribieron.
 * - Alta y baja se anulan entre sí: si alguien se suscribe y se da de baja antes de que salga la bienvenida, solo
 *   recibe la confirmación de baja (y al revés).
 */

export const CLAVE_SUSCRIPCION = 'newsletter:suscripcion:';
export const CLAVE_AVISO = 'newsletter:aviso:';
/** Caducidad del aviso en el KV: pasado este tiempo se borra solo, se haya enviado el correo o no. */
export const AVISO_TTL_SEGUNDOS = 72 * 60 * 60;

export type TipoAviso = 'bienvenida' | 'baja';
type KV = Pick<KVNamespace, 'get' | 'put' | 'delete'>;

const claveAviso = (tipo: TipoAviso, email: string) => `${CLAVE_AVISO}${tipo}:${email}`;

async function dejarAviso(kv: KV, tipo: TipoAviso, email: string, ahora: Date): Promise<boolean> {
  const at = ahora.toISOString();
  try {
    await kv.put(claveAviso(tipo, email), JSON.stringify({ tipo, at }), { expirationTtl: AVISO_TTL_SEGUNDOS, metadata: { at } });
    return true;
  } catch {
    return false;
  }
}

async function quitarAviso(kv: KV, tipo: TipoAviso, email: string): Promise<void> {
  try {
    await kv.delete(claveAviso(tipo, email));
  } catch {
    // Si no se puede borrar, caduca solo; el script del PC comprueba además si la suscripción sigue viva.
  }
}

/** Guarda la suscripción (una clave por email, sin duplicados) y, si es nueva, deja el aviso de bienvenida. */
export async function darDeAlta(kv: KV, email: string, ahora = new Date()): Promise<{ nueva: boolean; aviso: boolean }> {
  const clave = `${CLAVE_SUSCRIPCION}${email}`;
  if ((await kv.get(clave)) !== null) return { nueva: false, aviso: false };
  await kv.put(clave, JSON.stringify({ email, suscritoEn: ahora.toISOString() }));
  await quitarAviso(kv, 'baja', email);
  return { nueva: true, aviso: await dejarAviso(kv, 'bienvenida', email, ahora) };
}

/** Borra la suscripción y, si el email estaba en la lista, deja el aviso de confirmación de baja. */
export async function darDeBaja(kv: KV, email: string, ahora = new Date()): Promise<{ estaba: boolean; aviso: boolean }> {
  const clave = `${CLAVE_SUSCRIPCION}${email}`;
  const estaba = (await kv.get(clave)) !== null;
  await kv.delete(clave);
  if (!estaba) return { estaba: false, aviso: false };
  await quitarAviso(kv, 'bienvenida', email);
  return { estaba: true, aviso: await dejarAviso(kv, 'baja', email, ahora) };
}
