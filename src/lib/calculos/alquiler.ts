import {
  ALQUILER_IRPF,
  IRPF_GENERAL_AUTONOMICO,
  IRPF_GENERAL_ESTATAL,
  IRPF_MINIMO_CONTRIBUYENTE,
  calcularProgresivo,
} from '../../config/finance.ts';

export type ComunidadId = keyof typeof IRPF_GENERAL_AUTONOMICO;

export interface ParamsAlquiler {
  ingresos: number;
  gastos: number;
  valorConstruccion: number;
  otrosIngresosNetos: number;
  comunidad: ComunidadId;
  reduccionPct: number;
}

/** Cuota íntegra de la base general con mínimo personal (misma mecánica que la calculadora de sueldo neto). */
function cuotaGeneral(base: number, comunidad: ComunidadId): number {
  const minimo = IRPF_MINIMO_CONTRIBUYENTE.general;
  const auto = IRPF_GENERAL_AUTONOMICO[comunidad].brackets;
  const est = Math.max(0, calcularProgresivo(base, IRPF_GENERAL_ESTATAL.brackets) - calcularProgresivo(minimo, IRPF_GENERAL_ESTATAL.brackets));
  const aut = Math.max(0, calcularProgresivo(base, auto) - calcularProgresivo(minimo, auto));
  return est + aut;
}

export function calcularAlquiler(p: ParamsAlquiler) {
  const amortizacion = p.valorConstruccion * ALQUILER_IRPF.amortizacion;
  const netoPrevio = p.ingresos - p.gastos - amortizacion;
  const reduccion = netoPrevio > 0 ? netoPrevio * p.reduccionPct : 0;
  const netoReducido = netoPrevio - reduccion;
  const base = Math.max(0, p.otrosIngresosNetos);
  const irpfExtra = Math.max(0, cuotaGeneral(base + netoReducido, p.comunidad) - cuotaGeneral(base, p.comunidad));
  const enBolsillo = p.ingresos - p.gastos - irpfExtra;
  return { amortizacion, netoPrevio, reduccion, netoReducido, irpfExtra, enBolsillo, tipoSobreIngresos: p.ingresos > 0 ? irpfExtra / p.ingresos : 0 };
}

