import { useMemo } from 'react';
import { IRPF_GENERAL_AUTONOMICO } from '../config/finance';
import { Campo, CampoNumero, NotaCalculo, PanelResultados, Resumen, formatEuros, formatPct, useEstadoUrl } from './CalculatorUI';

export { calcularSueldoNeto } from '../lib/calculos/sueldo';
export type { ComunidadId, ParamsSueldoNeto, ResultadoSueldoNeto } from '../lib/calculos/sueldo';
import { calcularSueldoNeto, type ComunidadId } from '../lib/calculos/sueldo';

const COMUNIDADES = Object.entries(IRPF_GENERAL_AUTONOMICO)
  .map(([id, c]) => ({ id: id as ComunidadId, nombre: c.nombre }))
  .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

export default function SalaryCalculator() {
  const [brutoAnual, setBrutoAnual] = useEstadoUrl<number>('brutoAnual', 24000);
  const [comunidad, setComunidad] = useEstadoUrl<ComunidadId>('comunidad', 'madrid', { validar: (v) => v in IRPF_GENERAL_AUTONOMICO });
  const [pagas, setPagas] = useEstadoUrl<number>('pagas', 14);

  const r = useMemo(() => calcularSueldoNeto({ brutoAnual, comunidad, pagas }), [brutoAnual, comunidad, pagas]);

  return (
    <div className="card not-prose grid gap-6 p-6 md:grid-cols-2">
      <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
        <CampoNumero label="Sueldo bruto anual (€)" value={brutoAnual} onChange={setBrutoAnual} step={500} />
        <Campo label="Comunidad autónoma">
          <select value={comunidad} onChange={(e) => setComunidad(e.target.value as ComunidadId)} className="campo-input">
            {COMUNIDADES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Pagas al año">
          <select value={pagas} onChange={(e) => setPagas(Number(e.target.value))} className="campo-input">
            <option value={14}>14 (12 mensuales + 2 extras)</option>
            <option value={12}>12 (pagas extra prorrateadas)</option>
          </select>
        </Campo>
      </form>

      <PanelResultados>
        <Resumen etiqueta="Sueldo bruto anual" valor={formatEuros(brutoAnual)} />
        <Resumen etiqueta="Seguridad Social (tu parte)" valor={`− ${formatEuros(r.cotizacionSSAnual)}`} negativo />
        <Resumen etiqueta="IRPF (retención estimada)" valor={`− ${formatEuros(r.irpfAnual)}`} negativo />
        <hr className="my-1 border-border" />
        <Resumen etiqueta="Neto anual" valor={formatEuros(r.netoAnual)} destacado />
        <Resumen etiqueta={`Neto por paga (${pagas} pagas)`} valor={formatEuros(r.netoMensual)} destacado />
        <Resumen etiqueta="Tipo efectivo de IRPF" valor={formatPct(r.tipoEfectivo, 1)} />
        <NotaCalculo>
          Estimación para un trabajador residente todo el año en la comunidad elegida, menor de 65
          años, sin hijos ni ascendientes a cargo, sin otras rentas y sin retribución en especie. Es
          el IRPF anual aproximado, no necesariamente lo que verás retenido cada mes en la nómina
          (la retención sigue otro procedimiento y se regulariza en la declaración). No incluye
          País Vasco ni Navarra, que tienen un sistema foral propio.
        </NotaCalculo>
      </PanelResultados>
    </div>
  );
}
