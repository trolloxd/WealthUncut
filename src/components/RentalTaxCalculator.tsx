import { useMemo } from 'react';
import { calcularAlquiler, type ComunidadId } from '../lib/calculos/alquiler.ts';
import { ALQUILER_IRPF, IRPF_GENERAL_AUTONOMICO } from '../config/finance';
import { Campo, CampoNumero, NotaCalculo, PanelResultados, Resumen, formatEuros, formatPct, useEstadoUrl } from './CalculatorUI';



const COMUNIDADES = Object.entries(IRPF_GENERAL_AUTONOMICO)
  .map(([id, c]) => ({ id: id as ComunidadId, nombre: c.nombre }))
  .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

// Compatibilidad: la lógica vive en src/lib/calculos/ (con pruebas); se reexporta aquí por si algún artículo la importa desde el componente.
export { calcularAlquiler } from '../lib/calculos/alquiler.ts';

export default function RentalTaxCalculator() {
  const [ingresos, setIngresos] = useEstadoUrl<number>('ing', 12000, { max: 1000000 });
  const [gastos, setGastos] = useEstadoUrl<number>('gas', 2500, { max: 1000000 });
  const [valorConstruccion, setValorConstruccion] = useEstadoUrl<number>('cons', 90000, { max: 10000000 });
  const [otros, setOtros] = useEstadoUrl<number>('otros', 24000, { max: 1000000 });
  const [comunidad, setComunidad] = useEstadoUrl<ComunidadId>('comunidad', 'madrid', { validar: (v) => v in IRPF_GENERAL_AUTONOMICO });
  const [reduccionId, setReduccionId] = useEstadoUrl<string>('red', 'r50', { validar: (v) => ALQUILER_IRPF.reducciones.some((r) => r.id === v) });

  const reduccion = ALQUILER_IRPF.reducciones.find((r) => r.id === reduccionId) ?? ALQUILER_IRPF.reducciones[1];
  const base = { ingresos, gastos, valorConstruccion, otrosIngresosNetos: otros, comunidad };
  const r = useMemo(() => calcularAlquiler({ ...base, reduccionPct: reduccion.pct }), [ingresos, gastos, valorConstruccion, otros, comunidad, reduccion.pct]);
  const comparativa = useMemo(
    () => ALQUILER_IRPF.reducciones.map((x) => ({ x, irpf: calcularAlquiler({ ...base, reduccionPct: x.pct }).irpfExtra })),
    [ingresos, gastos, valorConstruccion, otros, comunidad]
  );

  return (
    <div className="not-prose grid gap-6">
      <div className="card grid gap-6 p-6 md:grid-cols-2">
        <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
          <CampoNumero label="Alquiler cobrado al año (€)" value={ingresos} onChange={setIngresos} step={500} max={1000000} />
          <CampoNumero
            label="Gastos deducibles al año (€)"
            value={gastos}
            onChange={setGastos}
            step={100}
            max={1000000}
            ayuda="IBI, comunidad, seguro, reparaciones, intereses de la hipoteca de ese piso, gestión... No incluye la amortización: la calculamos aparte."
          />
          <CampoNumero
            label="Valor de la construcción, sin el suelo (€)"
            value={valorConstruccion}
            onChange={setValorConstruccion}
            step={5000}
            max={10000000}
            ayuda="Para la amortización del 3 %. Se toma el mayor entre lo que pagaste por la construcción y su valor catastral."
          />
          <CampoNumero
            label="Tus otros ingresos netos al año (€)"
            value={otros}
            onChange={setOtros}
            step={1000}
            max={1000000}
            ayuda="Por ejemplo, tu sueldo bruto menos Seguridad Social y 2.000 € de gastos. El alquiler se suma a esto."
          />
          <Campo label="Comunidad autónoma">
            <select value={comunidad} onChange={(e) => setComunidad(e.target.value as ComunidadId)} className="campo-input">
              {COMUNIDADES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="Reducción por alquilar vivienda">
            <select value={reduccionId} onChange={(e) => setReduccionId(e.target.value)} className="campo-input">
              {ALQUILER_IRPF.reducciones.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.etiqueta}
                </option>
              ))}
            </select>
          </Campo>
        </form>

        <PanelResultados>
          <Resumen etiqueta="Alquiler cobrado" valor={formatEuros(ingresos)} />
          <Resumen etiqueta="Gastos deducibles" valor={`− ${formatEuros(gastos)}`} negativo />
          <Resumen etiqueta="Amortización (3 %)" valor={`− ${formatEuros(r.amortizacion)}`} negativo />
          <Resumen etiqueta="Rendimiento neto previo" valor={formatEuros(r.netoPrevio)} />
          <Resumen etiqueta={`Reducción del ${Math.round(reduccion.pct * 100)} %`} valor={`− ${formatEuros(r.reduccion)}`} negativo />
          <Resumen etiqueta="Rendimiento neto que tributa" valor={formatEuros(r.netoReducido)} />
          <hr className="my-1 border-border" />
          <Resumen etiqueta="IRPF extra por el alquiler" valor={formatEuros(r.irpfExtra)} destacado />
          <Resumen etiqueta="Sobre lo que cobras de alquiler" valor={formatPct(r.tipoSobreIngresos, 1)} />
          <Resumen etiqueta="Te queda al año (sin amortización)" valor={formatEuros(r.enBolsillo)} />
          <NotaCalculo>
            El alquiler se suma a tu base general y tributa a los tipos del IRPF general (estatal más autonómico). Cálculo sin hijos, sin deducciones
            autonómicas por alquiler y para menores de 65 años. Es una estimación, no tu declaración.
          </NotaCalculo>
        </PanelResultados>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg text-ink">Cuánto cambia según la reducción</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead className="text-xs text-ink-faint">
              <tr>
                <th className="py-2 pr-3 font-medium">Reducción</th>
                <th className="py-2 text-right font-medium">IRPF extra al año</th>
              </tr>
            </thead>
            <tbody>
              {comparativa.map(({ x, irpf }) => (
                <tr key={x.id} className={x.id === reduccionId ? 'bg-cream font-semibold text-brand' : 'text-ink'}>
                  <td className="py-1.5 pr-3">{x.pct === 0 ? 'Ninguna' : `${Math.round(x.pct * 100)} %`}</td>
                  <td className="py-1.5 text-right">{formatEuros(irpf)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
