import { useMemo, useState } from 'react';
import {
  IRPF_GENERAL_AUTONOMICO,
  IRPF_GENERAL_ESTATAL,
  IRPF_GASTO_DEDUCIBLE_TRABAJO,
  IRPF_MINIMO_CONTRIBUYENTE,
  calcularCotizacionSSMensual,
  calcularProgresivo,
  calcularReduccionTrabajo,
} from '../config/finance';
import { Campo, CampoNumero, NotaCalculo, PanelResultados, Resumen, formatEuros, formatPct } from './CalculatorUI';

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

const COMUNIDADES = Object.entries(IRPF_GENERAL_AUTONOMICO)
  .map(([id, c]) => ({ id: id as ComunidadId, nombre: c.nombre }))
  .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

export default function SalaryCalculator() {
  const [brutoAnual, setBrutoAnual] = useState(24000);
  const [comunidad, setComunidad] = useState<ComunidadId>('madrid');
  const [pagas, setPagas] = useState(14);

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
