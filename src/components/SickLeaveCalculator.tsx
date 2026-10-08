import { useMemo } from 'react';
import { SS_TRABAJADOR } from '../config/finance';
import { Campo, CampoNumero, NotaCalculo, PanelResultados, Resumen, formatPct, useEstadoUrl } from './CalculatorUI';

const eur = (v: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: 'always' }).format(v);

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

export default function SickLeaveCalculator() {
  const [brutoAnual, setBruto] = useEstadoUrl<number>('bruto', 24000, { max: 1000000 });
  const [tipo, setTipo] = useEstadoUrl<string>('tipo', 'comun', { validar: (v) => v === 'comun' || v === 'laboral' });
  const [dias, setDias] = useEstadoUrl<number>('dias', 30, { max: 545 });
  const [complementoPct, setComplemento] = useEstadoUrl<number>('comp', 0, { max: 100 });

  const r = useMemo(() => calcularBaja({ brutoAnual, tipo: tipo as TipoBaja, dias, complementoPct }), [brutoAnual, tipo, dias, complementoPct]);
  const pctNormal = r.normal > 0 ? r.total / r.normal : 0;

  return (
    <div className="card not-prose grid gap-6 p-6 md:grid-cols-2">
      <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
        <CampoNumero label="Sueldo bruto anual (€)" value={brutoAnual} onChange={setBruto} step={500} max={1000000} ayuda="Con las pagas extra incluidas. Se usa como base de cotización mensual (bruto entre 12), hasta el tope máximo." />
        <Campo label="Motivo de la baja">
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="campo-input">
            <option value="comun">Enfermedad común o accidente no laboral</option>
            <option value="laboral">Accidente de trabajo o enfermedad profesional</option>
          </select>
        </Campo>
        <CampoNumero label="Días de baja" value={dias} onChange={setDias} max={545} ayuda="Duración máxima habitual: 365 días, prorrogables 180 más." />
        <CampoNumero label="Mejora de la empresa (% del sueldo)" value={complementoPct} onChange={setComplemento} max={100} step={5} ayuda="Si tu convenio o contrato completa la baja (por ejemplo, hasta el 100 %). Si no lo sabes, déjalo en 0." />
      </form>

      <PanelResultados>
        <Resumen etiqueta="Base de cotización mensual" valor={eur(r.baseMensual)} />
        <Resumen etiqueta="Base reguladora diaria (entre 30)" valor={eur(r.baseDiaria)} />
        <hr className="my-1 border-border" />
        <Resumen etiqueta={`Prestación en ${r.diasN} días`} valor={eur(r.subsidio)} destacado />
        {r.complemento > 0 && <Resumen etiqueta="Mejora de la empresa" valor={eur(r.complemento)} />}
        <Resumen etiqueta="Total que cobras (bruto)" valor={eur(r.total)} />
        <Resumen etiqueta="Habrías cobrado trabajando" valor={eur(r.normal)} />
        <Resumen etiqueta="Dejas de cobrar" valor={eur(r.perdida)} negativo />
        <Resumen etiqueta="Cobras el" valor={formatPct(pctNormal, 0) + ' de tu sueldo'} />
        <hr className="my-1 border-border" />
        <Resumen etiqueta="Primer mes de baja (30 días)" valor={eur(r.primerMes)} />
        <Resumen etiqueta="Cada mes a partir del día 31" valor={eur(r.mesLargo)} />
        <NotaCalculo>
          Cantidades brutas, antes de IRPF y Seguridad Social, sin horas extra ni complementos variables. La base reguladora real se calcula con la base de cotización del mes anterior a la baja
          y puede ser algo distinta. En enfermedad común, los días 4 a 15 los paga la empresa y desde el 16 la Seguridad Social (o la mutua). Muchos convenios mejoran estas cifras.
        </NotaCalculo>
      </PanelResultados>
    </div>
  );
}
