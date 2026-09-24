import { useMemo, useState } from 'react';
import { Campo, CampoNumero, NotaCalculo, PanelResultados, Resumen, formatEuros, formatPct } from './CalculatorUI';

export type TipoHipoteca = 'fija' | 'variable' | 'mixta';

export interface ParamsHipoteca {
  capital: number;
  plazoAnios: number;
  tipoHipoteca: TipoHipoteca;
  tipoFijo: number; // % anual: tipo fijo, o de la fase fija en una mixta
  diferencial: number; // % sobre el euríbor: variable, o fase variable de una mixta
  euribor: number; // % anual, valor de partida
  aniosFijosMixta: number;
}

export interface ResultadoHipoteca {
  cuotaFase1: number;
  cuotaFase2?: number;
  mesesFase1: number;
  mesesFase2: number;
  totalPagado: number;
  totalIntereses: number;
}

function cuotaFrancesa(capital: number, tasaAnual: number, meses: number): number {
  if (meses <= 0) return 0;
  const i = tasaAnual / 100 / 12;
  if (i === 0) return capital / meses;
  return (capital * i * Math.pow(1 + i, meses)) / (Math.pow(1 + i, meses) - 1);
}

function saldoPendiente(capital: number, tasaAnual: number, mesesTotales: number, mesesTranscurridos: number): number {
  const i = tasaAnual / 100 / 12;
  const cuota = cuotaFrancesa(capital, tasaAnual, mesesTotales);
  if (i === 0) return Math.max(0, capital - cuota * mesesTranscurridos);
  return Math.max(0, capital * Math.pow(1 + i, mesesTranscurridos) - cuota * ((Math.pow(1 + i, mesesTranscurridos) - 1) / i));
}

/** Simulación con tipo constante en cada fase (el variable no se recalcula año a año: es una foto fija para comparar escenarios). */
export function simularHipoteca(p: ParamsHipoteca, euriborEscenario?: number): ResultadoHipoteca {
  const meses = Math.max(1, Math.round(p.plazoAnios * 12));
  const euribor = euriborEscenario ?? p.euribor;

  if (p.tipoHipoteca === 'fija') {
    const cuota = cuotaFrancesa(p.capital, p.tipoFijo, meses);
    const totalPagado = cuota * meses;
    return { cuotaFase1: cuota, mesesFase1: meses, mesesFase2: 0, totalPagado, totalIntereses: totalPagado - p.capital };
  }

  if (p.tipoHipoteca === 'variable') {
    const tasa = euribor + p.diferencial;
    const cuota = cuotaFrancesa(p.capital, tasa, meses);
    const totalPagado = cuota * meses;
    return { cuotaFase1: cuota, mesesFase1: meses, mesesFase2: 0, totalPagado, totalIntereses: totalPagado - p.capital };
  }

  const mesesFijos = Math.min(meses, Math.max(0, Math.round(p.aniosFijosMixta * 12)));
  const mesesVariable = meses - mesesFijos;
  const cuota1 = cuotaFrancesa(p.capital, p.tipoFijo, meses);
  const saldoTrasFijo = mesesVariable > 0 ? saldoPendiente(p.capital, p.tipoFijo, meses, mesesFijos) : 0;
  const tasa2 = euribor + p.diferencial;
  const cuota2 = mesesVariable > 0 ? cuotaFrancesa(saldoTrasFijo, tasa2, mesesVariable) : undefined;
  const totalPagado = cuota1 * mesesFijos + (cuota2 ?? 0) * mesesVariable;
  return {
    cuotaFase1: cuota1,
    cuotaFase2: cuota2,
    mesesFase1: mesesFijos,
    mesesFase2: mesesVariable,
    totalPagado,
    totalIntereses: totalPagado - p.capital,
  };
}

const ESCENARIOS = [-1, 0, 1, 2];

interface Props {
  euriborInicial: number;
  euriborMes: string;
}

export default function MortgageCalculator({ euriborInicial, euriborMes }: Props) {
  const [capital, setCapital] = useState(200000);
  const [plazoAnios, setPlazoAnios] = useState(30);
  const [tipoHipoteca, setTipoHipoteca] = useState<TipoHipoteca>('mixta');
  const [tipoFijo, setTipoFijo] = useState(2.9);
  const [diferencial, setDiferencial] = useState(0.6);
  const [euribor, setEuribor] = useState(Number(euriborInicial.toFixed(2)));
  const [aniosFijosMixta, setAniosFijosMixta] = useState(5);

  const params: ParamsHipoteca = { capital, plazoAnios, tipoHipoteca, tipoFijo, diferencial, euribor, aniosFijosMixta };
  const r = useMemo(() => simularHipoteca(params), [capital, plazoAnios, tipoHipoteca, tipoFijo, diferencial, euribor, aniosFijosMixta]);

  const escenarios = useMemo(
    () =>
      tipoHipoteca === 'fija'
        ? []
        : ESCENARIOS.map((delta) => {
            const euriborEscenario = euribor + delta;
            const res = simularHipoteca(params, euriborEscenario);
            return { delta, euriborEscenario, cuota: res.cuotaFase2 ?? res.cuotaFase1 };
          }),
    [capital, plazoAnios, tipoHipoteca, tipoFijo, diferencial, euribor, aniosFijosMixta]
  );

  return (
    <div className="card not-prose grid gap-6 p-6 md:grid-cols-2">
      <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
        <CampoNumero label="Capital a pedir prestado (€)" value={capital} onChange={setCapital} step={1000} />
        <CampoNumero label="Plazo (años)" value={plazoAnios} onChange={setPlazoAnios} min={1} max={40} />
        <Campo label="Tipo de hipoteca">
          <select value={tipoHipoteca} onChange={(e) => setTipoHipoteca(e.target.value as TipoHipoteca)} className="campo-input">
            <option value="fija">Fija</option>
            <option value="variable">Variable</option>
            <option value="mixta">Mixta</option>
          </select>
        </Campo>

        {tipoHipoteca !== 'variable' && (
          <CampoNumero
            label={tipoHipoteca === 'mixta' ? 'Tipo fijo de la primera fase (%)' : 'Tipo fijo (%)'}
            value={tipoFijo}
            onChange={setTipoFijo}
            step={0.05}
          />
        )}
        {tipoHipoteca === 'mixta' && (
          <CampoNumero label="Años en la fase fija" value={aniosFijosMixta} onChange={setAniosFijosMixta} min={1} max={plazoAnios} />
        )}
        {tipoHipoteca !== 'fija' && (
          <>
            <CampoNumero
              label="Euríbor a 12 meses (%)"
              value={euribor}
              onChange={setEuribor}
              step={0.01}
              ayuda={`Media de ${euriborMes} según el BCE: ${formatPct(euriborInicial / 100, 2)}. Puedes cambiarlo para probar otro momento.`}
            />
            <CampoNumero label="Diferencial sobre el euríbor (%)" value={diferencial} onChange={setDiferencial} step={0.05} />
          </>
        )}
      </form>

      <PanelResultados>
        <Resumen
          etiqueta={r.mesesFase2 > 0 ? `Cuota los primeros ${Math.round(r.mesesFase1 / 12)} años` : 'Cuota mensual'}
          valor={formatEuros(r.cuotaFase1)}
          destacado={r.mesesFase2 === 0}
        />
        {r.mesesFase2 > 0 && r.cuotaFase2 !== undefined && (
          <Resumen etiqueta="Cuota el resto del plazo (con el euríbor actual)" valor={formatEuros(r.cuotaFase2)} destacado />
        )}
        <hr className="my-1 border-border" />
        <Resumen etiqueta="Total a pagar" valor={formatEuros(r.totalPagado)} />
        <Resumen etiqueta="Total en intereses" valor={formatEuros(r.totalIntereses)} negativo />

        {escenarios.length > 0 && (
          <>
            <hr className="my-1 border-border" />
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
              {r.mesesFase2 > 0 ? 'Cuota de la fase variable si el euríbor cambia' : 'Cuota si el euríbor cambia'}
            </p>
            <table className="text-sm">
              <tbody>
                {escenarios.map((e) => (
                  <tr key={e.delta} className={e.delta === 0 ? 'font-semibold text-ink' : 'text-ink-muted'}>
                    <td className="py-0.5 pr-3">
                      {e.delta === 0 ? 'Euríbor actual' : `Euríbor ${e.delta > 0 ? '+' : ''}${e.delta} pp`} ({formatPct(e.euriborEscenario / 100, 2)})
                    </td>
                    <td className="py-0.5 text-right">{formatEuros(e.cuota)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <NotaCalculo>
          Cuota constante (sistema francés), sin bonificaciones, comisiones de apertura, seguros
          vinculados ni gastos de constitución: la TAE real de una oferta concreta será distinta a
          este tipo nominal. En la fase variable, la cuota se recalcula en la realidad cada vez que
          se revisa el euríbor (normalmente cada 6 o 12 meses); aquí se muestra fija en cada
          escenario para poder comparar. No es una oferta ni una recomendación.
        </NotaCalculo>
      </PanelResultados>
    </div>
  );
}
