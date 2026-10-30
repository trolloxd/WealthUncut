// Registro de caducidades: qué datos del sitio caducan, cuándo toca revisarlos y si ya vencieron. Sin dependencias,
// sin red y sin IA: lo usan scripts/comprobar-frescura.mjs, el aviso del build (npm run build, vía prebuild) y
// tests/caducidades.test.ts. El registro vive en src/config/caducidades.json; la lectura de las fechas desde los
// ficheros, en scripts/lib/caducidades-io.mjs. Los umbrales de los datos "de hoy" (BCE, euríbor, cuentas) son los de
// src/lib/frescura.ts.

import { diasNaturales, frescuraBCE } from './frescura.ts';

export type Nivel = 'ok' | 'aviso' | 'vencido';

export type Regla =
  | { tipo: 'dias'; aviso: number; error: number }
  | { tipo: 'habiles-target'; aviso: number; error: number }
  | { tipo: 'mes-dato'; dia: number }
  | { tipo: 'anual'; mes: number; dia: number; gracia: number; tambien?: [number, number][] }
  | { tipo: 'cola'; aviso: number; error: number }
  | { tipo: 'ofertas'; avisoDias: number }
  | { tipo: 'sin-fecha' };

export type Lectura =
  | { tipo: 'json'; fichero: string; clave: string }
  | { tipo: 'regex'; fichero: string; patron: string }
  | { tipo: 'ultimo-fichero'; carpeta: string; patron: string }
  | { tipo: 'fechas-max'; fichero: string }
  | { tipo: 'mercados-serie'; serie: string }
  | { tipo: 'literal'; valor: string }
  | { tipo: 'ofertas-en-json'; fichero: string }
  | { tipo: 'articulo-mas-antiguo' }
  | { tipo: 'cola-articulos' }
  | { tipo: 'ninguna' };

export interface Entrada {
  id: string;
  descripcion: string;
  donde: string;
  fuente: string;
  fuenteUrl: string | null;
  frecuencia: 'diaria' | 'semanal' | 'mensual' | 'trimestral' | 'anual' | 'puntual';
  /** La regla en lenguaje llano ("día 18 de cada mes tras el IPC del INE", "enero"...). */
  cuando: string;
  fecha: Lectura;
  vence: Regla;
  /** Si está vencido, bloquea (código de salida 1 y, con FRESCURA_ESTRICTA=1, el build). */
  critico: boolean;
  actualizacion: { modo: 'script' | 'investigacion' | 'manual'; comando?: string; procedimiento: string };
  responsable: string;
  /** Nombre del resultado de comprobar-frescura.mjs que ya comprueba este dato contra su API (evita duplicarlo). */
  resultadoScript?: string;
  notas?: string;
}

export interface Evaluacion {
  id: string;
  descripcion: string;
  nivel: Nivel;
  detalle: string;
  ultima: string | null;
  /** Fecha (AAAA-MM-DD) a partir de la cual toca revisarlo, si se puede calcular. */
  proxima: string | null;
  critico: boolean;
  bloquea: boolean;
  informativo: boolean;
  modo: Entrada['actualizacion']['modo'];
  comando: string | null;
  procedimiento: string;
  responsable: string;
}

const pad = (n: number) => String(n).padStart(2, '0');
const dia = (f: string) => new Date(`${f}T00:00:00Z`);
export const sumarDias = (f: string, n: number) => new Date(dia(f).getTime() + n * 86400000).toISOString().slice(0, 10);
const mesAnterior = (m: string, n = 1) => {
  const [a, mm] = m.split('-').map(Number);
  const t = a * 12 + (mm - 1) - n;
  return `${Math.floor(t / 12)}-${pad((t % 12) + 1)}`;
};

/** Ocurrencia anual (mes, día) más reciente que no pasa de hoy. */
export function ultimaOcurrencia(hoy: string, mes: number, d: number): string {
  const y = Number(hoy.slice(0, 4));
  const f = `${y}-${pad(mes)}-${pad(d)}`;
  return f <= hoy ? f : `${y - 1}-${pad(mes)}-${pad(d)}`;
}
export function proximaOcurrencia(hoy: string, mes: number, d: number): string {
  const y = Number(hoy.slice(0, 4));
  const f = `${y}-${pad(mes)}-${pad(d)}`;
  return f > hoy ? f : `${y + 1}-${pad(mes)}-${pad(d)}`;
}

/** Ofertas con fecha límite escritas en el texto de un comparador ("altas hasta el 22/11/2026"). */
export function ofertasConFecha(json: { cuentas?: Record<string, unknown>[]; depositos?: Record<string, unknown>[] }): { oferta: string; fecha: string }[] {
  const salida: { oferta: string; fecha: string }[] = [];
  for (const p of [...(json.cuentas ?? []), ...(json.depositos ?? [])]) {
    for (const campo of ['duracion', 'requisitos']) {
      const txt = String(p[campo] ?? '');
      for (const m of txt.matchAll(/hasta (?:el )?(\d{2})\/(\d{2})\/(\d{4})/g)) {
        salida.push({ oferta: `${p.banco} ${p.producto}`, fecha: `${m[3]}-${m[2]}-${m[1]}` });
      }
    }
  }
  return salida;
}

export type Valor = string | number | { oferta: string; fecha: string }[] | null;

export function evaluar(e: Entrada, valor: Valor, hoy: string): Evaluacion {
  const base = {
    id: e.id,
    descripcion: e.descripcion,
    critico: e.critico,
    informativo: false,
    modo: e.actualizacion.modo,
    comando: e.actualizacion.comando ?? null,
    procedimiento: e.actualizacion.procedimiento,
    responsable: e.responsable,
  };
  const fin = (nivel: Nivel, detalle: string, ultima: string | null, proxima: string | null, extra: Partial<Evaluacion> = {}): Evaluacion => ({
    ...base,
    nivel,
    detalle,
    ultima,
    proxima,
    bloquea: e.critico && nivel === 'vencido',
    ...extra,
  });
  const r = e.vence;

  if (r.tipo === 'sin-fecha') {
    return fin('ok', 'sin fecha comprobable en el repositorio (se revisa por su procedimiento)', null, null, { informativo: true });
  }
  if (valor === null || valor === undefined || valor === '') {
    return fin('vencido', 'no se pudo leer la fecha de última verificación', null, null);
  }

  if (r.tipo === 'ofertas') {
    const lista = valor as { oferta: string; fecha: string }[];
    const vencidas = lista.filter((o) => o.fecha < hoy);
    const cerca = lista.filter((o) => o.fecha >= hoy && diasNaturales(hoy, o.fecha) <= r.avisoDias);
    const futuras = lista.filter((o) => o.fecha >= hoy).map((o) => o.fecha).sort();
    if (vencidas.length) return fin('vencido', `oferta(s) ya caducada(s) en el comparador: ${vencidas.map((o) => `${o.oferta} (${o.fecha})`).join('; ')}`, null, null);
    if (cerca.length) return fin('aviso', `caduca(n) en ${r.avisoDias} días o menos: ${cerca.map((o) => `${o.oferta} (${o.fecha})`).join('; ')}`, null, futuras[0] ?? null);
    return fin('ok', `${lista.length} oferta(s) con fecha límite, ninguna caduca en ${r.avisoDias} días`, null, futuras[0] ? sumarDias(futuras[0], -r.avisoDias) : null);
  }

  if (r.tipo === 'cola') {
    const n = Number(valor);
    const nivel: Nivel = n < r.error ? 'vencido' : n < r.aviso ? 'aviso' : 'ok';
    return fin(nivel, `${n} programado(s); la reposición actúa con menos de ${r.aviso}`, null, null);
  }

  const ultima = String(valor);

  if (r.tipo === 'mes-dato') {
    const mesHoy = hoy.slice(0, 7);
    const exigido = Number(hoy.slice(8, 10)) >= r.dia ? mesAnterior(mesHoy) : mesAnterior(mesHoy, 2);
    const nivel: Nivel = ultima >= exigido ? 'ok' : 'vencido';
    // Fecha desde la que será obligatorio el mes siguiente al último: día `dia` del mes que va dos por delante.
    const [a, m] = ultima.split('-').map(Number);
    const t = a * 12 + (m - 1) + 2;
    const proxima = `${Math.floor(t / 12)}-${pad((t % 12) + 1)}-${pad(r.dia)}`;
    return fin(nivel, `último mes ${ultima}; hoy debe estar al menos ${exigido}`, ultima, proxima);
  }

  if (r.tipo === 'habiles-target') {
    const x = frescuraBCE(e.descripcion, ultima, hoy);
    const nivel: Nivel = x.estado === 'error' ? 'vencido' : x.estado;
    return fin(nivel, x.detalle, ultima, null);
  }

  if (r.tipo === 'dias') {
    const n = diasNaturales(ultima, hoy);
    const nivel: Nivel = n >= r.error ? 'vencido' : n >= r.aviso ? 'aviso' : 'ok';
    return fin(nivel, `última verificación el ${ultima}, hace ${n} día(s) (aviso a los ${r.aviso}, vencido a los ${r.error})`, ultima, sumarDias(ultima, r.aviso));
  }

  // anual: una o varias fechas al año ([mes, día]). El retraso se mide desde la revisión más antigua que sigue sin hacer
  // (si hubo una en febrero sin hacer, el retraso no se reinicia cuando llega la de abril).
  const fechas: [number, number][] = [[r.mes, r.dia], ...(r.tambien ?? [])];
  const siguiente = fechas.map(([m, d]) => proximaOcurrencia(hoy, m, d)).sort()[0];
  const ocurrencias: string[] = [];
  for (let y = Number(ultima.slice(0, 4)); y <= Number(hoy.slice(0, 4)); y++) {
    for (const [m, d] of fechas) ocurrencias.push(`${y}-${pad(m)}-${pad(d)}`);
  }
  const pendientes = ocurrencias.filter((o) => o > ultima && o <= hoy).sort();
  if (!pendientes.length) {
    return fin('ok', `verificado el ${ultima}; no ha llegado ninguna revisión anual posterior`, ultima, siguiente);
  }
  const due = pendientes[0];
  const tarde = diasNaturales(due, hoy);
  const nivel: Nivel = tarde >= r.gracia ? 'vencido' : 'aviso';
  return fin(nivel, `revisión del ${due} sin hacer (última verificación ${ultima}); lleva ${tarde} día(s) de retraso, vence a los ${r.gracia}`, ultima, due);
}

/** Comprobación de estructura del registro (la usa tests/caducidades.test.ts). Devuelve la lista de problemas. */
export function validarRegistro(entradas: Entrada[]): string[] {
  const problemas: string[] = [];
  const ids = new Set<string>();
  const lecturas = ['json', 'regex', 'ultimo-fichero', 'fechas-max', 'mercados-serie', 'literal', 'ofertas-en-json', 'articulo-mas-antiguo', 'cola-articulos', 'ninguna'];
  const reglas = ['dias', 'habiles-target', 'mes-dato', 'anual', 'cola', 'ofertas', 'sin-fecha'];
  for (const e of entradas) {
    if (!/^[a-z0-9-]+$/.test(e.id)) problemas.push(`${e.id}: id no válido`);
    if (ids.has(e.id)) problemas.push(`${e.id}: id repetido`);
    ids.add(e.id);
    for (const c of ['descripcion', 'donde', 'fuente', 'cuando', 'responsable'] as const) if (!e[c]) problemas.push(`${e.id}: falta ${c}`);
    if (e.fuenteUrl !== null && !/^https:\/\//.test(e.fuenteUrl)) problemas.push(`${e.id}: fuenteUrl no es https`);
    if (!lecturas.includes(e.fecha?.tipo)) problemas.push(`${e.id}: lectura de fecha no válida`);
    if (!reglas.includes(e.vence?.tipo)) problemas.push(`${e.id}: regla no válida`);
    if (!['script', 'investigacion', 'manual'].includes(e.actualizacion?.modo)) problemas.push(`${e.id}: modo de actualización no válido`);
    if (e.actualizacion?.modo === 'script' && !e.actualizacion.comando) problemas.push(`${e.id}: modo script sin comando`);
    if (!e.actualizacion?.procedimiento) problemas.push(`${e.id}: falta procedimiento`);
    if (e.fecha?.tipo === 'literal' && !/^\d{4}-\d{2}(-\d{2})?$/.test(e.fecha.valor)) problemas.push(`${e.id}: fecha literal no válida`);
  }
  return problemas;
}

export const peorNivel = (xs: Evaluacion[]): Nivel => (xs.some((x) => x.nivel === 'vencido') ? 'vencido' : xs.some((x) => x.nivel === 'aviso') ? 'aviso' : 'ok');
