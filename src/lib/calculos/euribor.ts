// Euríbor a 12 meses y revisión de una hipoteca variable.
//
// Datos: media mensual del BCE (src/data/euribor/). Redondeada a 3 decimales coincide con el euríbor "Un año"
// que el Banco de España publica cada mes en el BOE como tipo oficial de referencia del mercado hipotecario
// (anejo 8 de la Circular 5/2012); comprobado en 8 meses entre 2016 y 2026 el 2026-10-21 (p. ej. septiembre de
// 2026: 3,247 %, BOE-A-2026-20519).
//
// Revisión: sistema francés (cuota constante). En cada revisión el banco recalcula la cuota con el capital que
// queda, los meses que faltan y el nuevo tipo (euríbor + diferencial). El tipo no puede ser negativo en los
// préstamos de la Ley 5/2019 (art. 21.4, BOE-A-2019-3814; en vigor desde el 16-06-2019).

export interface PuntoEuribor {
  /** Mes en formato AAAA-MM. */
  mes: string;
  /** Porcentaje anual (3.247 = 3,247 %). */
  valor: number;
}

/** Redondeo a 3 decimales, el mismo con el que el Banco de España publica el índice oficial. */
export function redondear3(v: number): number {
  return Math.round(v * 1000) / 1000;
}

/** Cuota mensual constante (sistema francés). Tipo en % anual nominal, liquidación mensual. */
export function cuotaFrancesa(capital: number, tipoAnualPct: number, meses: number): number {
  if (meses <= 0 || capital <= 0) return 0;
  const i = tipoAnualPct / 100 / 12;
  if (i === 0) return capital / meses;
  const f = Math.pow(1 + i, meses);
  return (capital * i * f) / (f - 1);
}

/** Tipo que paga el préstamo: euríbor + diferencial, nunca negativo (Ley 5/2019, art. 21.4). */
export function tipoAplicable(euribor: number, diferencial: number): number {
  return Math.max(0, euribor + diferencial);
}

export interface ParamsRevision {
  capitalPendiente: number;
  mesesRestantes: number;
  diferencial: number;
  euriborAnterior: number;
  euriborNuevo: number;
  /** Meses que durará la cuota nueva hasta la siguiente revisión (12 si es anual, 6 si es semestral). */
  mesesHastaSiguiente: number;
}

export function revisarHipoteca(p: ParamsRevision) {
  const meses = Math.max(0, Math.round(p.mesesRestantes));
  const tipoAnterior = tipoAplicable(p.euriborAnterior, p.diferencial);
  const tipoNuevo = tipoAplicable(p.euriborNuevo, p.diferencial);
  const cuotaAnterior = cuotaFrancesa(p.capitalPendiente, tipoAnterior, meses);
  const cuotaNueva = cuotaFrancesa(p.capitalPendiente, tipoNuevo, meses);
  const diferenciaMes = cuotaNueva - cuotaAnterior;
  const periodo = Math.min(meses, Math.max(0, Math.round(p.mesesHastaSiguiente)));
  return {
    tipoAnterior,
    tipoNuevo,
    cuotaAnterior,
    cuotaNueva,
    diferenciaMes,
    /** Diferencia acumulada hasta la siguiente revisión. */
    diferenciaPeriodo: diferenciaMes * periodo,
    periodo,
    /** Intereses de la primera cuota con cada tipo (el resto de la cuota amortiza capital). */
    interesesPrimeraAnterior: (p.capitalPendiente * tipoAnterior) / 100 / 12,
    interesesPrimeraNueva: (p.capitalPendiente * tipoNuevo) / 100 / 12,
  };
}

/** Une varias series (p. ej. histórico completo y último dato), sin meses repetidos: manda la última. */
export function combinarSeries(...series: PuntoEuribor[][]): PuntoEuribor[] {
  const porMes = new Map<string, number>();
  for (const s of series) for (const p of s) porMes.set(p.mes, p.valor);
  return [...porMes.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([mes, valor]) => ({ mes, valor }));
}

/** El mes AAAA-MM que hay n meses antes (o después, si n es negativo). */
export function mesesAtras(mes: string, n: number): string {
  const [a, m] = mes.split('-').map(Number);
  const total = a * 12 + (m - 1) - n;
  const anio = Math.floor(total / 12);
  const mm = (total % 12) + 1;
  return `${anio}-${String(mm).padStart(2, '0')}`;
}

export function valorMes(serie: PuntoEuribor[], mes: string): number | undefined {
  return serie.find((p) => p.mes === mes)?.valor;
}

/** Cambio entre el último mes de la serie y el de n meses antes, en puntos porcentuales (redondeados a 3 decimales). */
export function variacion(serie: PuntoEuribor[], n: number) {
  const hasta = serie.at(-1);
  if (!hasta) return undefined;
  const mesDesde = mesesAtras(hasta.mes, n);
  const valorDesde = valorMes(serie, mesDesde);
  if (valorDesde === undefined) return undefined;
  return {
    desde: { mes: mesDesde, valor: valorDesde },
    hasta,
    puntos: redondear3(redondear3(hasta.valor) - redondear3(valorDesde)),
  };
}

/** Media, mínimo y máximo de cada año, sobre las medias mensuales redondeadas a 3 decimales. */
export function resumenAnual(serie: PuntoEuribor[]) {
  const porAnio = new Map<string, PuntoEuribor[]>();
  for (const p of serie) {
    const anio = p.mes.slice(0, 4);
    porAnio.set(anio, [...(porAnio.get(anio) ?? []), p]);
  }
  return [...porAnio.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([anio, puntos]) => {
      const valores = puntos.map((p) => redondear3(p.valor));
      const minimo = Math.min(...valores);
      const maximo = Math.max(...valores);
      return {
        anio,
        meses: puntos.length,
        media: redondear3(valores.reduce((s, v) => s + v, 0) / valores.length),
        minimo,
        maximo,
        mesMinimo: puntos[valores.indexOf(minimo)].mes,
        mesMaximo: puntos[valores.indexOf(maximo)].mes,
      };
    });
}
