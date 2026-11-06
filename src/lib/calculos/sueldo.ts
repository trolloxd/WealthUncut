// Sueldo neto de un trabajador por cuenta ajena (IRPF anual y Seguridad Social). Lo usan la calculadora de sueldo
// neto, el ranking de comunidades y la tabla de /datos/ (src/lib/datasets.ts).
import {
  IRPF_GENERAL_AUTONOMICO,
  IRPF_GENERAL_ESTATAL,
  IRPF_GASTO_DEDUCIBLE_TRABAJO,
  IRPF_MINIMO_CONTRIBUYENTE,
  calcularCotizacionSSMensual,
  calcularProgresivo,
  calcularReduccionTrabajo,
} from '../../config/finance.ts';

export type ComunidadId = keyof typeof IRPF_GENERAL_AUTONOMICO;

export interface ParamsSueldoNeto {
  brutoAnual: number;
  comunidad: ComunidadId;
  pagas: number;
}

export interface ResultadoSueldoNeto {
  cotizacionSSAnual: number;
  rendimientoNeto: number;
  reduccionTrabajo: number;
  baseLiquidable: number;
  cuotaEstatal: number;
  cuotaAutonomica: number;
  irpfAnual: number;
  netoAnual: number;
  netoMensual: number;
  tipoEfectivo: number;
}

/**
 * Estimación del sueldo neto de un trabajador por cuenta ajena, residente todo el año en la misma
 * comunidad, menor de 65 años, sin hijos ni ascendientes a cargo, sin otras rentas y sin
 * retribución en especie. Con esas circunstancias, el resultado debería acercarse bastante al IRPF
 * real del año (no a la retención mes a mes, que sigue otro procedimiento y se regulariza en la
 * declaración).
 */
export function calcularSueldoNeto(p: ParamsSueldoNeto): ResultadoSueldoNeto {
  const brutoMensual = p.brutoAnual / 12;
  const cotizacionSSAnual = calcularCotizacionSSMensual(brutoMensual) * 12;

  const rendimientoNeto = Math.max(0, p.brutoAnual - cotizacionSSAnual - IRPF_GASTO_DEDUCIBLE_TRABAJO);
  const reduccionTrabajo = calcularReduccionTrabajo(rendimientoNeto);
  const baseLiquidable = Math.max(0, rendimientoNeto - reduccionTrabajo);

  const minimo = IRPF_MINIMO_CONTRIBUYENTE.general;
  const escalaAutonomica = IRPF_GENERAL_AUTONOMICO[p.comunidad].brackets;

  const cuotaEstatal = Math.max(
    0,
    calcularProgresivo(baseLiquidable, IRPF_GENERAL_ESTATAL.brackets) - calcularProgresivo(minimo, IRPF_GENERAL_ESTATAL.brackets)
  );
  const cuotaAutonomica = Math.max(0, calcularProgresivo(baseLiquidable, escalaAutonomica) - calcularProgresivo(minimo, escalaAutonomica));

  const irpfAnual = cuotaEstatal + cuotaAutonomica;
  const netoAnual = p.brutoAnual - cotizacionSSAnual - irpfAnual;

  return {
    cotizacionSSAnual,
    rendimientoNeto,
    reduccionTrabajo,
    baseLiquidable,
    cuotaEstatal,
    cuotaAutonomica,
    irpfAnual,
    netoAnual,
    netoMensual: netoAnual / p.pagas,
    tipoEfectivo: p.brutoAnual > 0 ? irpfAnual / p.brutoAnual : 0,
  };
}

/** Sueldos brutos anuales de la tabla de sueldo neto por comunidad (desde 20.000 €: por debajo influyen deducciones
 * ligadas al SMI que la calculadora no modela). */
export const BRUTOS_SUELDO_NETO = [20000, 22000, 24000, 26000, 28000, 30000, 32000, 35000, 40000, 45000, 50000, 60000, 70000, 80000, 100000];
const r2 = (n: number) => Math.round(n * 100) / 100;

/** Filas de la tabla: una por comunidad y sueldo bruto, con la misma función que la calculadora de sueldo neto. */
export function filasSueldoNeto(): (string | number)[][] {
  // Sin Ceuta y Melilla: allí se aplica una deducción del 60 % (art. 68.4 Ley IRPF) que esta fórmula no modela.
  const comunidades = Object.entries(IRPF_GENERAL_AUTONOMICO)
    .filter(([id]) => id !== 'ceutaMelilla')
    .map(([id, c]) => ({ id: id as ComunidadId, nombre: c.nombre }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  return comunidades.flatMap((c) =>
    BRUTOS_SUELDO_NETO.map((bruto) => {
      const r = calcularSueldoNeto({ brutoAnual: bruto, comunidad: c.id, pagas: 14 });
      return [c.nombre, bruto, r2(r.cotizacionSSAnual), r2(r.irpfAnual), r2(r.netoAnual), r2(r.netoAnual / 14), r2(r.netoAnual / 12), r2(r.tipoEfectivo * 100)];
    })
  );
}
