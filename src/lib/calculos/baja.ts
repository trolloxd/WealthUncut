import { SS_TRABAJADOR } from '../../config/finance.ts';

// Incapacidad temporal (Seguridad Social, Aula de la Seguridad Social y arts. 171 y 173 de la LGSS, BOE-A-2015-11724):
//  - Enfermedad común o accidente no laboral: sin subsidio los días 1 a 3; 60 % de la base reguladora del 4.º al 20.º día
//    (del 4.º al 15.º lo paga la empresa) y 75 % desde el 21.º.
//  - Accidente de trabajo o enfermedad profesional: 75 % desde el día siguiente a la baja; el día de la baja lo paga la empresa íntegro.
export type TipoBaja = 'comun' | 'laboral';

export function porcentajeDia(tipo: TipoBaja, dia: number): number {
  if (tipo === 'laboral') return dia === 1 ? 1 : 0.75;
  if (dia <= 3) return 0;
  return dia <= 20 ? 0.6 : 0.75;
}

export function calcularBaja(p: { brutoAnual: number; tipo: TipoBaja; dias: number; complementoPct: number }) {
  const baseMensual = Math.min(p.brutoAnual / 12, SS_TRABAJADOR.baseMaximaMensual);
  const baseDiaria = baseMensual / 30;
  const diasN = Math.max(0, Math.round(p.dias));
  let subsidio = 0;
  let complemento = 0;
  let conSubsidio = 0;
  for (let d = 1; d <= diasN; d++) {
    const pct = porcentajeDia(p.tipo, d);
    subsidio += baseDiaria * pct;
    if (pct > 0) conSubsidio++;
    // Mejora voluntaria de la empresa (convenio o pacto): completa hasta el % indicado del sueldo diario.
    complemento += Math.max(0, baseDiaria * (p.complementoPct / 100) - baseDiaria * pct);
  }
  const normal = baseDiaria * diasN;
  const total = subsidio + complemento;
  const mes = (desde: number) => {
    let s = 0;
    for (let d = desde; d < desde + 30; d++) s += baseDiaria * porcentajeDia(p.tipo, d);
    return s;
  };
  return {
    baseMensual,
    baseDiaria,
    diasN,
    subsidio,
    complemento,
    total,
    normal,
    perdida: Math.max(0, normal - total),
    primerMes: mes(1),
    mesLargo: mes(31),
    conSubsidio,
  };
}
