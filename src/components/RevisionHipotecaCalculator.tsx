import { useMemo } from 'react';
import { Campo, CampoNumero, NotaCalculo, Resumen, claseAnchoBarra, formatEuros, formatEuros2, useEstadoUrl } from './CalculatorUI';
import { mesesAtras, redondear3, revisarHipoteca, valorMes, type PuntoEuribor } from '../lib/calculos/euribor';

type Periodicidad = 'anual' | 'semestral';
const MESES_PERIODO: Record<Periodicidad, number> = { anual: 12, semestral: 6 };

interface Props {
  /** Serie mensual (al menos los últimos 13 meses), de src/data/euribor/. */
  serie: PuntoEuribor[];
}

const nombreMes = (mes: string) =>
  new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${mes}-01T00:00:00Z`));

const pct = (v: number) => `${v.toLocaleString('es-ES', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} %`;

const ESCENARIOS = [-1, -0.5, 0.5, 1];

export default function RevisionHipotecaCalculator({ serie }: Props) {
  const ultimo = serie.at(-1)!;
  const euriborHace = (periodicidad: Periodicidad) => {
    const mes = mesesAtras(ultimo.mes, MESES_PERIODO[periodicidad]);
    const v = valorMes(serie, mes);
    return v === undefined ? undefined : { mes, valor: redondear3(v) };
  };
  const anteriorAnual = euriborHace('anual');

  const [capital, setCapital] = useEstadoUrl<number>('capital', 150000);
  const [anios, setAnios] = useEstadoUrl<number>('anios', 25, { max: 40 });
  const [diferencial, setDiferencial] = useEstadoUrl<number>('diferencial', 0.6);
  const [periodicidad, setPeriodicidad] = useEstadoUrl<Periodicidad>('revision', 'anual', {
    validar: (v) => v === 'anual' || v === 'semestral',
  });
  const [euriborAnterior, setEuriborAnterior] = useEstadoUrl<number>('anterior', anteriorAnual?.valor ?? redondear3(ultimo.valor));
  const [euriborNuevo, setEuriborNuevo] = useEstadoUrl<number>('nuevo', redondear3(ultimo.valor));

  const referenciaAnterior = euriborHace(periodicidad);

  const cambiarPeriodicidad = (p: Periodicidad) => {
    setPeriodicidad(p);
    // Propone el euríbor de hace 12 o 6 meses; quien conoce el suyo lo puede cambiar después.
    const ref = euriborHace(p);
    if (ref) setEuriborAnterior(ref.valor);
  };

  const r = useMemo(
    () =>
      revisarHipoteca({
        capitalPendiente: capital,
        mesesRestantes: anios * 12,
        diferencial,
        euriborAnterior,
        euriborNuevo,
        mesesHastaSiguiente: MESES_PERIODO[periodicidad],
      }),
    [capital, anios, diferencial, euriborAnterior, euriborNuevo, periodicidad]
  );

  const escenarios = useMemo(
    () =>
      ESCENARIOS.map((delta) => {
        const euribor = euriborNuevo + delta;
        const e = revisarHipoteca({
          capitalPendiente: capital,
          mesesRestantes: anios * 12,
          diferencial,
          euriborAnterior: euriborNuevo,
          euriborNuevo: euribor,
          mesesHastaSiguiente: MESES_PERIODO[periodicidad],
        });
        return { delta, euribor, cuota: e.cuotaNueva, diferencia: e.diferenciaMes };
      }),
    [capital, anios, diferencial, euriborNuevo, periodicidad]
  );

  const sube = r.diferenciaMes > 0.005;
  const baja = r.diferenciaMes < -0.005;
  const maxCuota = Math.max(r.cuotaAnterior, r.cuotaNueva, 1);
  const periodoTexto = r.periodo === 12 ? 'los próximos 12 meses' : r.periodo === 6 ? 'los próximos 6 meses' : `los próximos ${r.periodo} meses`;
  const tipoEnCero = r.tipoNuevo === 0 || r.tipoAnterior === 0;

  return (
    <div className="card not-prose p-6">
      <p className="mb-6 rounded-xl bg-brand-soft p-4 text-base text-ink sm:text-lg" aria-live="polite">
        {capital <= 0 || anios <= 0 ? (
          'Indica el capital que te queda por pagar y los años que faltan.'
        ) : sube ? (
          <>
            Con estos datos, tu cuota <strong className="text-accent">sube {formatEuros2(r.diferenciaMes)} al mes</strong>: de{' '}
            {formatEuros2(r.cuotaAnterior)} a {formatEuros2(r.cuotaNueva)}. Son {formatEuros(r.diferenciaPeriodo)} más en {periodoTexto}.
          </>
        ) : baja ? (
          <>
            Con estos datos, tu cuota <strong className="text-brand">baja {formatEuros2(-r.diferenciaMes)} al mes</strong>: de{' '}
            {formatEuros2(r.cuotaAnterior)} a {formatEuros2(r.cuotaNueva)}. Son {formatEuros(-r.diferenciaPeriodo)} menos en {periodoTexto}.
          </>
        ) : (
          <>Con estos datos, tu cuota no cambia: {formatEuros2(r.cuotaNueva)} al mes.</>
        )}
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
          <CampoNumero
            label="Capital que te queda por pagar (€)"
            value={capital}
            onChange={setCapital}
            step={1000}
            ayuda="Lo ves en el recibo o en la banca online. Ejemplo: cámbialo por el tuyo."
          />
          <CampoNumero label="Años que faltan" value={anios} onChange={setAnios} min={1} max={40} />
          <CampoNumero label="Diferencial sobre el euríbor (%)" value={diferencial} onChange={setDiferencial} step={0.05} ayuda="El de tu escritura, sin bonificaciones si ya no las cumples." />
          <Campo label="Cada cuánto se revisa">
            <select value={periodicidad} onChange={(e) => cambiarPeriodicidad(e.target.value as Periodicidad)} className="campo-input">
              <option value="anual">Cada 12 meses</option>
              <option value="semestral">Cada 6 meses</option>
            </select>
          </Campo>
          <CampoNumero
            label="Euríbor de tu revisión anterior (%)"
            value={euriborAnterior}
            onChange={setEuriborAnterior}
            min={-2}
            step={0.001}
            ayuda={
              referenciaAnterior
                ? `Propuesto: media de ${nombreMes(referenciaAnterior.mes)}, ${pct(referenciaAnterior.valor)}. Pon el que figure en tu última carta de revisión.`
                : 'Pon el que figure en tu última carta de revisión.'
            }
          />
          <CampoNumero
            label="Euríbor de esta revisión (%)"
            value={euriborNuevo}
            onChange={setEuriborNuevo}
            min={-2}
            step={0.001}
            ayuda={`Último publicado: media de ${nombreMes(ultimo.mes)}, ${pct(redondear3(ultimo.valor))}.`}
          />
        </form>

        <div className="flex flex-col gap-3 rounded-xl bg-cream p-5">
          <div className="grid gap-2" aria-hidden="true">
            <div>
              <div className="mb-1 flex justify-between text-xs text-ink-muted">
                <span>Antes</span>
                <span>{formatEuros2(r.cuotaAnterior)}</span>
              </div>
              <div className="h-2.5 rounded-full bg-border">
                <div className={`h-2.5 rounded-full bg-ink-faint ${claseAnchoBarra((r.cuotaAnterior / maxCuota) * 100, 5)}`} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-ink-muted">
                <span>Después</span>
                <span>{formatEuros2(r.cuotaNueva)}</span>
              </div>
              <div className="h-2.5 rounded-full bg-border">
                <div className={`h-2.5 rounded-full ${sube ? 'bg-accent' : 'bg-brand'} ${claseAnchoBarra((r.cuotaNueva / maxCuota) * 100, 5)}`} />
              </div>
            </div>
          </div>

          <hr className="my-1 border-border" />
          <Resumen etiqueta="Tipo que pagabas" valor={pct(r.tipoAnterior)} />
          <Resumen etiqueta="Tipo que pagarás" valor={pct(r.tipoNuevo)} />
          <Resumen etiqueta="Cuota nueva" valor={formatEuros2(r.cuotaNueva)} destacado />
          <Resumen etiqueta={`Diferencia en ${periodoTexto}`} valor={`${r.diferenciaPeriodo > 0 ? '+' : ''}${formatEuros(r.diferenciaPeriodo)}`} negativo={sube} />
          <Resumen etiqueta="Intereses de la primera cuota nueva" valor={formatEuros2(r.interesesPrimeraNueva)} />

          <hr className="my-1 border-border" />
          <p className="text-sm font-semibold text-ink">Si en la siguiente revisión el euríbor fuera otro</p>
          <table className="text-sm">
            <caption className="sr-only">Cuota con otros valores del euríbor, a partir del de esta revisión</caption>
            <thead>
              <tr className="text-left text-xs text-ink-muted">
                <th scope="col" className="pb-1 font-normal">Euríbor</th>
                <th scope="col" className="pb-1 text-right font-normal">Cuota</th>
                <th scope="col" className="pb-1 text-right font-normal">Cambio al mes</th>
              </tr>
            </thead>
            <tbody>
              {escenarios.map((e) => (
                <tr key={e.delta} className="text-ink-muted">
                  <td className="py-0.5 pr-3">
                    {pct(redondear3(e.euribor))} ({e.delta > 0 ? '+' : ''}
                    {e.delta.toLocaleString('es-ES')} pp)
                  </td>
                  <td className="py-0.5 text-right tabular-nums">{formatEuros2(e.cuota)}</td>
                  <td className="py-0.5 text-right tabular-nums">
                    {e.diferencia > 0 ? '+' : ''}
                    {formatEuros2(e.diferencia)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-ink-faint">No es una previsión: sirve para ver cuánto pesa cada medio punto en tu cuota.</p>

          <NotaCalculo>
            Sistema francés: en cada revisión la cuota se recalcula con el capital que queda, los meses que faltan y el nuevo
            tipo (euríbor más diferencial). Si tu cuota actual no coincide con la de "antes", puede deberse a bonificaciones,
            amortizaciones anticipadas o redondeos de tu banco. Sin seguros ni comisiones.
            {tipoEnCero && ' El tipo se ha dejado en 0 %: en los préstamos de la Ley 5/2019 el interés no puede ser negativo.'}
          </NotaCalculo>
        </div>
      </div>
    </div>
  );
}
