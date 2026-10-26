// Lógica de "Los datos de hoy" (portada y /hoy/), aparte para poder probarla: desde cuándo está en vigor un tipo
// del BCE y qué condiciones tiene la cuenta con más TAE. Sin dependencias de Astro.

export type Obs = [string, number];

/**
 * Fecha desde la que la serie tiene su valor actual (el último cambio). Si no cambia en toda la serie descargada,
 * devuelve null: no se sabe desde cuándo rige y es mejor no inventarlo.
 */
export function vigenteDesde(obs: readonly Obs[]): string | null {
  if (obs.length === 0) return null;
  const actual = obs[obs.length - 1][1];
  let i = obs.length - 1;
  while (i > 0 && obs[i - 1][1] === actual) i--;
  return i === 0 ? null : obs[i][0];
}

export interface Cuenta {
  banco: string;
  tae: number;
  importeMaximo?: number | null;
  duracion?: string;
  requisitos?: string;
  vinculacion?: boolean;
}

const euros = (v: number) => `${v.toLocaleString('es-ES', { maximumFractionDigits: 0, useGrouping: true })} €`;

/**
 * Condiciones de la oferta en pocas palabras, sacadas de los campos del comparador: si es solo para clientes
 * nuevos, cuánto dura el tipo, hasta qué saldo y si pide algo más. Lista vacía si no tiene letra pequeña.
 */
export function condicionesCuenta(c: Cuenta): string[] {
  const out: string[] = [];
  const req = (c.requisitos ?? '').trim();
  const nuevo = /nuevos? clientes?/i.test(req) || /nuevos clientes/i.test(c.duracion ?? '');
  if (nuevo) out.push('solo nuevos clientes');
  const meses = (c.duracion ?? '').match(/^(\d+)\s*mes(es)?/i);
  if (meses) out.push(`${meses[1]} ${Number(meses[1]) === 1 ? 'mes' : 'meses'}`);
  else if (/variable/i.test(c.duracion ?? '')) out.push('tipo variable');
  if (c.importeMaximo) out.push(`hasta ${euros(c.importeMaximo)}`);
  const resto = req
    .replace(/nuevos? clientes?( digital)?( de [^,]+)?/i, '')
    .replace(/^[\s,.;]+|[\s,.;]+$/g, '');
  if (resto && !/^ningun[oa]?$/i.test(resto)) out.push('con requisitos');
  return out;
}
