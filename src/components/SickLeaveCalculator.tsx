import { useMemo } from 'react';
import { calcularBaja, type TipoBaja } from '../lib/calculos/baja.ts';
import { Campo, CampoNumero, NotaCalculo, PanelResultados, Resumen, formatPct, useEstadoUrl, formatEuros2 } from './CalculatorUI';


// Compatibilidad: la lógica vive en src/lib/calculos/ (con pruebas); se reexporta aquí por si algún artículo la importa desde el componente.
export { calcularBaja, porcentajeDia, type TipoBaja } from '../lib/calculos/baja.ts';

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
        <Resumen etiqueta="Base de cotización mensual" valor={formatEuros2(r.baseMensual)} />
        <Resumen etiqueta="Base reguladora diaria (entre 30)" valor={formatEuros2(r.baseDiaria)} />
        <hr className="my-1 border-border" />
        <Resumen etiqueta={`Prestación en ${r.diasN} días`} valor={formatEuros2(r.subsidio)} destacado />
        {r.complemento > 0 && <Resumen etiqueta="Mejora de la empresa" valor={formatEuros2(r.complemento)} />}
        <Resumen etiqueta="Total que cobras (bruto)" valor={formatEuros2(r.total)} />
        <Resumen etiqueta="Habrías cobrado trabajando" valor={formatEuros2(r.normal)} />
        <Resumen etiqueta="Dejas de cobrar" valor={formatEuros2(r.perdida)} negativo />
        <Resumen etiqueta="Cobras el" valor={formatPct(pctNormal, 0) + ' de tu sueldo'} />
        <hr className="my-1 border-border" />
        <Resumen etiqueta="Primer mes de baja (30 días)" valor={formatEuros2(r.primerMes)} />
        <Resumen etiqueta="Cada mes a partir del día 31" valor={formatEuros2(r.mesLargo)} />
        <NotaCalculo>
          Cantidades brutas, antes de IRPF y Seguridad Social, sin horas extra ni complementos variables. La base reguladora real se calcula con la base de cotización del mes anterior a la baja
          y puede ser algo distinta. En enfermedad común, los días 4 a 15 los paga la empresa y desde el 16 la Seguridad Social (o la mutua). Muchos convenios mejoran estas cifras.
        </NotaCalculo>
      </PanelResultados>
    </div>
  );
}
