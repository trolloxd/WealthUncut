// Frescura de "Los datos de hoy": cuánto lleva sin actualizarse cada dato y si toca avisar. Sin dependencias
// (lo usan DatosDeHoy.astro en el build, tests/frescura.test.ts y scripts/comprobar-frescura.mjs, sin IA).
//
// Umbrales decididos (2026-10-26):
// - Tipo de depósito del BCE y euro/dólar: aviso con 2 días hábiles TARGET sin dato nuevo, error con 3.
// - Cuentas remuneradas: aviso a los 8 días naturales desde la última revisión, error a los 10.
// - Euríbor (BOE): desde el día 4 de cada mes debe estar el del mes anterior; antes, basta el de hace dos meses.

export type Estado = 'ok' | 'aviso' | 'error';
export interface Resultado {
  dato: string;
  estado: Estado;
  detalle: string;
}

const UMBRAL_BCE = { aviso: 2, error: 3 };
const UMBRAL_CUENTAS = { aviso: 8, error: 10 };
const DIA_EURIBOR = 4;

const iso = (d: Date) => d.toISOString().slice(0, 10);
const dia = (f: string) => new Date(`${f}T00:00:00Z`);

/** Domingo de Pascua (algoritmo de Meeus/Butcher, calendario gregoriano), en UTC. */
function pascua(anio: number): Date {
  const a = anio % 19;
  const b = Math.floor(anio / 100);
  const c = anio % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const diaMes = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(anio, mes - 1, diaMes));
}

/** Días de cierre de TARGET (sin cambios de referencia del BCE): 1-ene, Viernes Santo, Lunes de Pascua, 1-may, 25 y 26-dic. */
export function esFestivoTarget(fecha: string): boolean {
  const md = fecha.slice(5);
  if (['01-01', '05-01', '12-25', '12-26'].includes(md)) return true;
  const p = pascua(Number(fecha.slice(0, 4))).getTime();
  const t = dia(fecha).getTime();
  return t === p - 2 * 86400000 || t === p + 86400000;
}

export function esHabilTarget(fecha: string): boolean {
  const s = dia(fecha).getUTCDay();
  return s !== 0 && s !== 6 && !esFestivoTarget(fecha);
}

/**
 * Días hábiles TARGET estrictamente entre el último dato y hoy (sin contar ninguno de los dos): los días en los
 * que el BCE debería haber publicado un dato nuevo que no tenemos. El de hoy no cuenta porque sale por la tarde.
 */
export function habilesSinDato(ultimo: string, hoy: string): number {
  let n = 0;
  for (let t = dia(ultimo).getTime() + 86400000; t < dia(hoy).getTime(); t += 86400000) {
    if (esHabilTarget(iso(new Date(t)))) n++;
  }
  return n;
}

export const diasNaturales = (desde: string, hoy: string) => Math.round((dia(hoy).getTime() - dia(desde).getTime()) / 86400000);

const mesAnterior = (mes: string, n = 1) => {
  const [a, m] = mes.split('-').map(Number);
  const t = a * 12 + (m - 1) - n;
  return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, '0')}`;
};

export function frescuraBCE(dato: string, ultimaFecha: string, hoy: string): Resultado {
  const n = habilesSinDato(ultimaFecha, hoy);
  const estado: Estado = n >= UMBRAL_BCE.error ? 'error' : n >= UMBRAL_BCE.aviso ? 'aviso' : 'ok';
  return { dato, estado, detalle: `último dato del ${ultimaFecha}; ${n} día(s) hábil(es) del BCE sin dato nuevo` };
}

export function frescuraCuentas(fechaRevision: string, hoy: string): Resultado {
  const n = diasNaturales(fechaRevision, hoy);
  const estado: Estado = n >= UMBRAL_CUENTAS.error ? 'error' : n >= UMBRAL_CUENTAS.aviso ? 'aviso' : 'ok';
  return { dato: 'Cuentas remuneradas', estado, detalle: `comparador revisado el ${fechaRevision}, hace ${n} día(s)` };
}

export function frescuraEuribor(ultimoMes: string, hoy: string): Resultado {
  const mesHoy = hoy.slice(0, 7);
  const exigido = Number(hoy.slice(8, 10)) >= DIA_EURIBOR ? mesAnterior(mesHoy) : mesAnterior(mesHoy, 2);
  const estado: Estado = ultimoMes >= exigido ? 'ok' : 'error';
  return { dato: 'Euríbor (BOE)', estado, detalle: `último mes ${ultimoMes}; hoy debe estar al menos ${exigido}` };
}

export const peor = (rs: Resultado[]): Estado =>
  rs.some((r) => r.estado === 'error') ? 'error' : rs.some((r) => r.estado === 'aviso') ? 'aviso' : 'ok';
