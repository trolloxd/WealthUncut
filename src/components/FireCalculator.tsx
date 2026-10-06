import { useMemo } from 'react';
import { CampoNumero, NotaCalculo, PanelResultados, Resumen, claseAnchoBarra, formatEuros, formatPct, useEstadoUrl } from './CalculatorUI';

export interface ParamsFire {
  gastosAnuales: number;
  patrimonio: number;
  ahorroMensual: number;
  rentabilidadRealPct: number; // ya descontada la inflación
  tasaRetiradaPct: number;
  edad: number;
}

/** Meses hasta alcanzar el número FIRE ahorrando cada mes (tope: 80 años). */
export function mesesHastaFire(p: ParamsFire, objetivo: number): number | null {
  if (p.patrimonio >= objetivo) return 0;
  const r = Math.pow(1 + p.rentabilidadRealPct / 100, 1 / 12) - 1;
  let valor = p.patrimonio;
  for (let m = 1; m <= 80 * 12; m++) {
    valor = valor * (1 + r) + p.ahorroMensual;
    if (valor >= objetivo) return m;
  }
  return null;
}

export function calcularFire(p: ParamsFire) {
  const objetivo = p.tasaRetiradaPct > 0 ? p.gastosAnuales / (p.tasaRetiradaPct / 100) : Infinity;
  const meses = Number.isFinite(objetivo) ? mesesHastaFire(p, objetivo) : null;
  const sensibilidad = [0.5, 1, 1.5, 2].map((f) => ({
    factor: f,
    ahorro: p.ahorroMensual * f,
    meses: Number.isFinite(objetivo) ? mesesHastaFire({ ...p, ahorroMensual: p.ahorroMensual * f }, objetivo) : null,
  }));
  return { objetivo, meses, progreso: Number.isFinite(objetivo) && objetivo > 0 ? Math.min(1, p.patrimonio / objetivo) : 0, sensibilidad };
}

const formatoTiempo = (meses: number | null) => {
  if (meses === null) return 'más de 80 años';
  if (meses === 0) return 'ya lo has alcanzado';
  const a = Math.floor(meses / 12);
  const m = meses % 12;
  const partes = [];
  if (a > 0) partes.push(`${a} ${a === 1 ? 'año' : 'años'}`);
  if (m > 0) partes.push(`${m} ${m === 1 ? 'mes' : 'meses'}`);
  return partes.join(' y ');
};

export default function FireCalculator() {
  const [gastosAnuales, setGastosAnuales] = useEstadoUrl<number>('gastos', 20000, { max: 1_000_000 });
  const [patrimonio, setPatrimonio] = useEstadoUrl<number>('patrimonio', 10000, { max: 100_000_000 });
  const [ahorroMensual, setAhorroMensual] = useEstadoUrl<number>('ahorro', 600, { max: 100_000 });
  const [rentabilidadRealPct, setRentabilidadRealPct] = useEstadoUrl<number>('rent', 4, { max: 20 });
  const [tasaRetiradaPct, setTasaRetiradaPct] = useEstadoUrl<number>('retirada', 4, { max: 20 });
  const [edad, setEdad] = useEstadoUrl<number>('edad', 25, { max: 100 });

  const p = { gastosAnuales, patrimonio, ahorroMensual, rentabilidadRealPct, tasaRetiradaPct, edad };
  const r = useMemo(() => calcularFire(p), [gastosAnuales, patrimonio, ahorroMensual, rentabilidadRealPct, tasaRetiradaPct, edad]);
  const edadFire = r.meses !== null ? edad + r.meses / 12 : null;

  return (
    <div className="not-prose grid gap-6">
      <div className="card grid gap-6 p-6 md:grid-cols-2">
        <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
          <CampoNumero label="Gastos anuales que quieres cubrir (€)" value={gastosAnuales} onChange={setGastosAnuales} step={1000} ayuda="Lo que gastarías al año ya independiente, en euros de hoy." />
          <CampoNumero label="Patrimonio invertido hoy (€)" value={patrimonio} onChange={setPatrimonio} step={1000} />
          <CampoNumero label="Ahorro mensual (€)" value={ahorroMensual} onChange={setAhorroMensual} step={50} />
          <CampoNumero label="Edad actual" value={edad} onChange={setEdad} min={16} max={100} />
          <CampoNumero
            label="Rentabilidad real anual (%)"
            value={rentabilidadRealPct}
            onChange={setRentabilidadRealPct}
            step={0.5}
            max={20}
            ayuda="Descontada la inflación, así todo queda en euros de hoy. Un supuesto, no una previsión."
          />
          <CampoNumero
            label="Tasa de retirada anual (%)"
            value={tasaRetiradaPct}
            onChange={setTasaRetiradaPct}
            step={0.25}
            min={0.5}
            max={20}
            ayuda="Qué parte del patrimonio retirarías cada año. El 4% es una referencia popular, no una garantía."
          />
        </form>

        <PanelResultados>
          <Resumen etiqueta="Tu número de independencia financiera" valor={Number.isFinite(r.objetivo) ? formatEuros(r.objetivo) : 'sin tasa válida'} destacado />
          <Resumen etiqueta="Progreso" valor={formatPct(r.progreso, 0)} />
          <span className="block h-3 w-full overflow-hidden rounded-full bg-cream" aria-hidden="true">
            <span className={`block h-full rounded-full bg-brand ${claseAnchoBarra(r.progreso * 100, 0)}`} />
          </span>
          <hr className="my-1 border-border" />
          <Resumen etiqueta="Tiempo hasta alcanzarlo" valor={formatoTiempo(r.meses)} destacado />
          {edadFire !== null && r.meses !== 0 && <Resumen etiqueta="Edad a la que lo alcanzarías" valor={`${(Math.round(edadFire * 10) / 10).toLocaleString('es-ES')} años`} />}
          <NotaCalculo>
            Número FIRE = gastos anuales ÷ tasa de retirada. Se supone una rentabilidad real constante y que sigues ahorrando lo mismo cada mes.
            Ignora impuestos, la volatilidad del mercado y el orden de las caídas (riesgo de secuencia). Es una referencia, no un plan.
          </NotaCalculo>
        </PanelResultados>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg text-ink">Cuánto cambia el tiempo según lo que ahorres</h2>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-ink-muted">
              <th scope="col" className="py-2 pr-3 font-medium">Ahorro mensual</th>
              <th scope="col" className="py-2 font-medium">Tiempo hasta la independencia</th>
            </tr>
          </thead>
          <tbody>
            {r.sensibilidad.map((s) => (
              <tr key={s.factor} className="border-b border-border/60">
                <td className="py-2 pr-3 text-ink">
                  {formatEuros(s.ahorro)} {s.factor === 1 && <span className="text-xs text-ink-faint">(el tuyo)</span>}
                </td>
                <td className="py-2 font-semibold text-brand">{formatoTiempo(s.meses)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
