import { useMemo } from 'react';
import { RETA_2026, tramoRETA } from '../config/finance';
import { CampoNumero, NotaCalculo, PanelResultados, Resumen, formatPct, useEstadoUrl } from './CalculatorUI';

const formatEuros = (v: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: 'always' }).format(v);

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

export default function SelfEmployedFeeCalculator() {
  const [ingresosAnuales, setIngresos] = useEstadoUrl<number>('ingresos', 30000, { max: 5000000 });
  const [gastosAnuales, setGastos] = useEstadoUrl<number>('gastos', 6000, { max: 5000000 });
  const [deduccion7, setDeduccion7] = useEstadoUrl<boolean>('ded', true);
  const [societario, setSocietario] = useEstadoUrl<boolean>('soc', false);

  const r = useMemo(() => calcularCuotaAutonomo({ ingresosAnuales, gastosAnuales, deduccion7, societario }), [ingresosAnuales, gastosAnuales, deduccion7, societario]);

  const quedaMin = r.beneficioMensual - r.cuotaMax;
  const quedaMax = r.beneficioMensual - r.cuotaMin;

  return (
    <div className="not-prose grid gap-6">
      <div className="card grid gap-6 p-6 md:grid-cols-2">
        <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
          <CampoNumero label="Ingresos al año (€)" value={ingresosAnuales} onChange={setIngresos} step={1000} max={5000000} ayuda="Facturación anual sin IVA." />
          <CampoNumero label="Gastos deducibles al año (€)" value={gastosAnuales} onChange={setGastos} step={500} max={5000000} ayuda="Los gastos de tu actividad que puedes deducir (herramientas, gestoría, suministros afectos...)." />
          <label className="flex items-center gap-2 text-sm text-ink-muted">
            <input type="checkbox" checked={deduccion7} onChange={(e) => setDeduccion7(e.target.checked)} />
            Aplicar la deducción por gastos genéricos (7 %)
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-muted">
            <input type="checkbox" checked={societario} onChange={(e) => setSocietario(e.target.checked)} />
            Soy autónomo societario (la deducción es del 3 %)
          </label>
        </form>

        <PanelResultados>
          <Resumen etiqueta="Rendimiento neto mensual para cotizar" valor={formatEuros(r.netoMensual)} />
          <Resumen etiqueta="Tu tramo" valor={`${r.tramo.tabla} ${r.tramo.n}`} />
          <Resumen etiqueta="Base de cotización (mín. a máx.)" valor={`${formatEuros(r.tramo.baseMin)} a ${formatEuros(r.tramo.baseMax)}`} />
          <hr className="my-1 border-border" />
          <Resumen etiqueta="Cuota mensual mínima" valor={formatEuros(r.cuotaMin)} destacado />
          <Resumen etiqueta="Cuota mensual máxima" valor={formatEuros(r.cuotaMax)} />
          <Resumen etiqueta="Cuota mínima sobre tu beneficio" valor={r.beneficioMensual > 0 ? formatPct(r.cuotaMin / r.beneficioMensual, 1) : '-'} />
          <Resumen etiqueta="Te quedaría al mes antes de IRPF" valor={`${formatEuros(Math.max(0, quedaMin))} a ${formatEuros(Math.max(0, quedaMax))}`} />
          <NotaCalculo>
            Cuota = base de cotización x {formatPct(RETA_2026.tipoTotal, 1)} (tipos 2026 de la Orden PJC/297/2026). Dentro de tu tramo eliges la base entre el mínimo y el máximo.
            Si eres nuevo autónomo, la tarifa plana es de {RETA_2026.tarifaPlanaMensual} € al mes los primeros 12 meses (más el MEI). El IRPF no está incluido.
          </NotaCalculo>
        </PanelResultados>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg text-ink">Los tramos de 2026</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="text-xs text-ink-faint">
              <tr>
                <th className="py-2 pr-3 font-medium">Tramo</th>
                <th className="py-2 pr-3 font-medium">Rendimientos netos hasta (€/mes)</th>
                <th className="py-2 pr-3 text-right font-medium">Cuota mínima</th>
                <th className="py-2 text-right font-medium">Cuota máxima</th>
              </tr>
            </thead>
            <tbody>
              {RETA_2026.tramos.map((t) => {
                const activo = t.tabla === r.tramo.tabla && t.n === r.tramo.n;
                return (
                  <tr key={t.tabla + t.n} className={activo ? 'bg-cream font-semibold text-brand' : 'text-ink'}>
                    <td className="py-1.5 pr-3">{t.tabla} {t.n}</td>
                    <td className="py-1.5 pr-3">{Number.isFinite(t.hasta) ? t.hasta.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : 'Más de 6.000'}</td>
                    <td className="py-1.5 pr-3 text-right">{formatEuros(t.baseMin * RETA_2026.tipoTotal)}</td>
                    <td className="py-1.5 text-right">{formatEuros(t.baseMax * RETA_2026.tipoTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
