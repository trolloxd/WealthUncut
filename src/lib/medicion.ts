/**
 * Medición propia de los bloques de captación, respetuosa con la privacidad: sin cookies, sin almacenamiento en el
 * navegador, sin terceros y sin guardar IP, correo ni identificador alguno. Solo contadores agregados por día:
 * qué evento (vista, clic, envío), en qué posición del artículo, con qué variante y en qué tema.
 *
 * El navegador manda cada evento a `/api/medir` y el Worker suma 1 a un contador de una clave del KV por día
 * (`medicion:AAAA-MM-DD`). El informe semanal (`scripts/informe-conversion.mjs`) lee esas claves.
 */
import { EVENTOS, POSICIONES, TEMAS_MEDIBLES, VARIANTES_FINAL, VARIANTES_MEDIO } from '../config/cta.mjs';

export const CLAVE_MEDICION = 'medicion:';
/** Tope de eventos contados por día: acota las escrituras en el KV (límite gratuito de Cloudflare: 1.000 escrituras al día en todo el KV, que comparten el buzón y la newsletter) y el efecto de un abuso. */
export const TOPE_EVENTOS_DIA = 300;
/** Los contadores se conservan 400 días y luego caducan solos. */
export const MEDICION_TTL_SEGUNDOS = 400 * 24 * 60 * 60;

export interface EventoMedicion {
  e: string;
  p: string;
  v: string;
  t: string;
}

export interface ContadoresDia {
  /** Eventos contados hoy (sirve para aplicar el tope). */
  n: number;
  /** "evento|posicion|variante|tema" -> veces. */
  c: Record<string, number>;
}

const VARIANTES = new Set<string>([...VARIANTES_MEDIO, ...VARIANTES_FINAL]);

/** Valida un evento contra listas cerradas: nada del cuerpo se guarda tal cual, solo claves conocidas. */
export function validarEvento(cuerpo: Record<string, unknown>): EventoMedicion | null {
  const { e, p, v, t } = cuerpo;
  if (typeof e !== 'string' || typeof p !== 'string' || typeof v !== 'string' || typeof t !== 'string') return null;
  if (!EVENTOS.includes(e) || !POSICIONES.includes(p) || !VARIANTES.has(v) || !TEMAS_MEDIBLES.includes(t)) return null;
  return { e, p, v, t };
}

export const claveDelDia = (ahora: Date): string => `${CLAVE_MEDICION}${ahora.toISOString().slice(0, 10)}`;

/** Suma el evento a los contadores del día. Devuelve null si el día ya llegó al tope. */
export function sumarEvento(actual: ContadoresDia | null, ev: EventoMedicion): ContadoresDia | null {
  const dia: ContadoresDia = actual ?? { n: 0, c: {} };
  if (dia.n >= TOPE_EVENTOS_DIA) return null;
  const k = `${ev.e}|${ev.p}|${ev.v}|${ev.t}`;
  return { n: dia.n + 1, c: { ...dia.c, [k]: (dia.c[k] ?? 0) + 1 } };
}

export function leerContadores(texto: string | null): ContadoresDia | null {
  if (!texto) return null;
  try {
    const j = JSON.parse(texto);
    if (j && typeof j.n === 'number' && j.c && typeof j.c === 'object') return j as ContadoresDia;
  } catch {
    /* clave corrupta: se empieza de cero */
  }
  return null;
}
