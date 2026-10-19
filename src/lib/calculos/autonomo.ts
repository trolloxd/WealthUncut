import { RETA_2026, tramoRETA } from '../../config/finance.ts';

export interface ParamsAutonomo {
  ingresosAnuales: number;
  gastosAnuales: number;
  deduccion7: boolean;
  societario: boolean;
}

export function calcularCuotaAutonomo(p: ParamsAutonomo) {
  const deduccion = p.societario ? 0.03 : RETA_2026.deduccionGastosGenericos;
  const beneficioAnual = Math.max(0, p.ingresosAnuales - p.gastosAnuales);
  const netoAnual = p.deduccion7 ? beneficioAnual * (1 - deduccion) : beneficioAnual;
  const netoMensual = netoAnual / 12;
  const tramo = tramoRETA(netoMensual);
  const cuotaMin = tramo.baseMin * RETA_2026.tipoTotal;
  const cuotaMax = tramo.baseMax * RETA_2026.tipoTotal;
  return { netoMensual, tramo, cuotaMin, cuotaMax, beneficioMensual: beneficioAnual / 12 };
}
