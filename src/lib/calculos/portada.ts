// Calculadora en vivo de la portada (HeroPortada.astro). La usan el servidor (cifras iniciales del HTML) y el navegador
// (al mover la aportación), así que es TypeScript puro sin dependencias del DOM.
//
// Supuestos, los mismos que el titular de siempre de la portada: 1.000 euros iniciales, aportación mensual a final de
// mes durante 20 años, rentabilidad bruta del 7 % anual, TER del 0,2 % y venta de todo al final con los tramos del IRPF
// del ahorro de src/config/finance.ts. Con 150 euros al mes: 78.151 brutos, 8.522 de IRPF y 69.630 netos.
// Es una simulación ilustrativa, no una previsión.

import { IRPF_AHORRO_BRACKETS } from '../../config/finance.ts';

export const SUPUESTOS_PORTADA = { inicial: 1000, rentabilidadBruta: 0.07, ter: 0.002, anios: 20 } as const;
export const APORTACION_MIN = 50;
export const APORTACION_MAX = 1000;
export const APORTACION_PASO = 50;
export const APORTACION_INICIAL = 150;

export interface ResultadoPortada {
  mensual: number;
  aportado: number;
  bruto: number;
  impuesto: number;
  neto: number;
  /** Capital bruto al final de cada año (para las barras). */
  porAnio: number[];
}

/** Cuota del IRPF del ahorro sobre una ganancia, tramo a tramo. */
export function irpfAhorro(ganancia: number): number {
  let resto = Math.max(0, ganancia);
  let desde = 0;
  let cuota = 0;
  for (const t of IRPF_AHORRO_BRACKETS) {
    const trozo = Math.max(0, Math.min(resto, t.hasta - desde));
    cuota += trozo * t.tipo;
    resto -= trozo;
    desde = t.hasta;
    if (resto <= 0) break;
  }
  return cuota;
}

export function calcularPortada(mensual: number, s: typeof SUPUESTOS_PORTADA = SUPUESTOS_PORTADA): ResultadoPortada {
  const r = Math.pow(1 + s.rentabilidadBruta - s.ter, 1 / 12) - 1;
  const capital = (meses: number) => s.inicial * Math.pow(1 + r, meses) + mensual * ((Math.pow(1 + r, meses) - 1) / r);
  const porAnio = Array.from({ length: s.anios }, (_, i) => Math.round(capital((i + 1) * 12)));
  const bruto = capital(s.anios * 12);
  const aportado = s.inicial + mensual * s.anios * 12;
  const impuesto = irpfAhorro(bruto - aportado);
  return {
    mensual,
    aportado: Math.round(aportado),
    bruto: Math.round(bruto),
    impuesto: Math.round(impuesto),
    neto: Math.round(bruto - impuesto),
    porAnio,
  };
}

/** Formato español con punto de miles siempre y el símbolo del euro. */
export const euros = (n: number) => `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} €`;
