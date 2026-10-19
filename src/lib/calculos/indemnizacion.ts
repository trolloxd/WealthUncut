
// Estatuto de los Trabajadores (BOE-A-2015-11430): art. 56.1 (despido improcedente: 33 días por año, máximo 24
// mensualidades), art. 53.1.b (causas objetivas: 20 días por año, máximo 12 mensualidades) y art. 49.1.c (fin de
// contrato temporal: parte proporcional de 12 días por año). Contratos firmados desde el 12-02-2012.
export const TIPOS_EXTINCION = {
  improcedente: { etiqueta: 'Despido improcedente (33 días por año, máximo 24 mensualidades)', dias: 33, topeMensualidades: 24 },
  objetivo: { etiqueta: 'Despido objetivo, por ejemplo económico (20 días por año, máximo 12 mensualidades)', dias: 20, topeMensualidades: 12 },
  temporal: { etiqueta: 'Fin de un contrato temporal (12 días por año)', dias: 12, topeMensualidades: Infinity },
} as const;
export type TipoExtincion = keyof typeof TIPOS_EXTINCION;

/** Suma meses a una fecha sin desbordar al mes siguiente (31 de enero + 1 mes = 28 o 29 de febrero). */
function sumaMeses(d: Date, n: number): Date {
  const total = d.getUTCFullYear() * 12 + d.getUTCMonth() + n;
  const anio = Math.floor(total / 12);
  const mes = total % 12;
  const ultimoDia = new Date(Date.UTC(anio, mes + 1, 0)).getUTCDate();
  return new Date(Date.UTC(anio, mes, Math.min(d.getUTCDate(), ultimoDia)));
}

/** Meses de servicio: meses completos, y una fracción de mes cuenta como un mes (criterio habitual). El último día trabajado cuenta. */
export function mesesDeServicio(inicio: string, fin: string): number {
  const a = new Date(inicio + 'T00:00:00Z');
  const hasta = new Date(new Date(fin + 'T00:00:00Z').getTime() + 86400000);
  if (!(hasta > a)) return 0;
  let meses = 0;
  while (sumaMeses(a, meses + 1) <= hasta) meses++;
  return meses + (sumaMeses(a, meses) < hasta ? 1 : 0);
}

export function calcularIndemnizacion(p: { salarioAnual: number; inicio: string; fin: string; tipo: TipoExtincion; diasVacaciones: number; diasMes: number }) {
  const t = TIPOS_EXTINCION[p.tipo];
  const diario = p.salarioAnual / 365;
  const mensual = p.salarioAnual / 12;
  const meses = mesesDeServicio(p.inicio, p.fin);
  const anios = meses / 12;
  const bruta = diario * t.dias * anios;
  const tope = t.topeMensualidades * mensual;
  const indemnizacion = Math.min(bruta, tope);
  const vacaciones = diario * p.diasVacaciones;
  const diasTrabajados = diario * p.diasMes;
  return { diario, meses, anios, bruta, tope, topeAplicado: bruta > tope, indemnizacion, vacaciones, diasTrabajados, finiquito: vacaciones + diasTrabajados, total: indemnizacion + vacaciones + diasTrabajados };
}


/** Fecha ISO válida (AAAA-MM-DD), para el estado en la URL y los campos de fecha. */
export const esFecha = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(new Date(v).getTime());
