import { useMemo, useState } from 'react';
import { calcularImpuestoAhorro, IRPF_AHORRO_BRACKETS, RETENCION_REEMBOLSO_FONDOS } from '../config/finance';
import { CampoNumero, NotaCalculo, PanelResultados, Resumen, formatEuros, formatPct } from './CalculatorUI';

export interface Lote {
  id: number;
  importe: number; // € invertidos en esa compra
  precio: number; // valor liquidativo de compra
}

export interface LoteVendido {
  id: number;
  participaciones: number;
  coste: number;
  valor: number;
}

/** Vende por FIFO (primero las participaciones más antiguas) el importe pedido al precio actual. */
export function venderFifo(lotes: Lote[], precioActual: number, importeARetirar: number) {
  const total = lotes.reduce((s, l) => s + (l.precio > 0 ? l.importe / l.precio : 0), 0);
  const aVender = precioActual > 0 ? Math.min(total, importeARetirar / precioActual) : 0;
  let pendiente = aVender;
  const vendidos: LoteVendido[] = [];
  for (const l of lotes) {
    if (pendiente <= 1e-9) break;
    if (l.precio <= 0 || l.importe <= 0) continue;
    const participaciones = l.importe / l.precio;
    const p = Math.min(participaciones, pendiente);
    vendidos.push({ id: l.id, participaciones: p, coste: p * l.precio, valor: p * precioActual });
    pendiente -= p;
  }
  const coste = vendidos.reduce((s, v) => s + v.coste, 0);
  const valor = vendidos.reduce((s, v) => s + v.valor, 0);
  return { totalParticipaciones: total, vendidos, coste, valor, ganancia: valor - coste };
}

/** Impuesto que añade esta venta a lo que ya pagarías por tus otras ganancias del año. */
export function impuestoIncremental(ganancia: number, otrasGanancias: number): number {
  return calcularImpuestoAhorro(otrasGanancias + ganancia) - calcularImpuestoAhorro(otrasGanancias);
}

let siguienteId = 4;

export default function FundSaleTaxCalculator() {
  const [lotes, setLotes] = useState<Lote[]>([
    { id: 1, importe: 3000, precio: 10 },
    { id: 2, importe: 3000, precio: 12.5 },
    { id: 3, importe: 3000, precio: 15 },
  ]);
  const [precioActual, setPrecioActual] = useState(18);
  const [importeARetirar, setImporteARetirar] = useState(6000);
  const [otrasGanancias, setOtrasGanancias] = useState(0);

  const actualizar = (id: number, campo: 'importe' | 'precio', v: number) =>
    setLotes((ls) => ls.map((l) => (l.id === id ? { ...l, [campo]: v } : l)));

  const r = useMemo(() => {
    const venta = venderFifo(lotes, precioActual, importeARetirar);
    const valorTotal = venta.totalParticipaciones * precioActual;
    const impuesto = Math.max(0, impuestoIncremental(venta.ganancia, otrasGanancias));
    const retencion = Math.max(0, venta.ganancia) * RETENCION_REEMBOLSO_FONDOS;
    // Máximo que se puede retirar sin que la ganancia del año pase del primer tramo.
    const limitePrimerTramo = IRPF_AHORRO_BRACKETS[0].hasta;
    let lo = 0;
    let hi = valorTotal;
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      const g = venderFifo(lotes, precioActual, mid).ganancia;
      if (otrasGanancias + g <= limitePrimerTramo) lo = mid;
      else hi = mid;
    }
    return { ...venta, valorTotal, impuesto, retencion, maxPrimerTramo: otrasGanancias >= limitePrimerTramo ? 0 : lo };
  }, [lotes, precioActual, importeARetirar, otrasGanancias]);

  const tipoMedio = r.ganancia > 0 ? r.impuesto / r.ganancia : 0;
  const diferenciaDeclaracion = r.impuesto - r.retencion;

  return (
    <div className="card not-prose grid gap-6 p-6 md:grid-cols-2">
      <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="grid gap-2">
          <legend className="mb-1 text-sm font-semibold text-ink">Tus compras, de la más antigua a la más reciente</legend>
          {lotes.map((l, i) => (
            <div key={l.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-end gap-2">
              <CampoNumero label={`Compra ${i + 1}: importe (€)`} value={l.importe} onChange={(v) => actualizar(l.id, 'importe', v)} />
              <CampoNumero label="Precio de compra" value={l.precio} onChange={(v) => actualizar(l.id, 'precio', v)} step={0.01} />
              <button
                type="button"
                onClick={() => setLotes((ls) => ls.filter((x) => x.id !== l.id))}
                disabled={lotes.length === 1}
                className="mb-1 rounded-full px-2 py-1 text-sm text-ink-faint hover:text-accent disabled:opacity-30"
                aria-label={`Quitar la compra ${i + 1}`}
              >
                ✕
              </button>
            </div>
          ))}
          {lotes.length < 12 && (
            <button
              type="button"
              onClick={() => setLotes((ls) => [...ls, { id: siguienteId++, importe: 1000, precio: precioActual }])}
              className="btn-secondary justify-self-start text-xs"
            >
              Añadir compra
            </button>
          )}
          <p className="text-xs text-ink-faint">
            El precio es el valor liquidativo (o la cotización) de cada participación el día de la
            compra. Lo encontrarás en el historial de operaciones de tu entidad.
          </p>
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <CampoNumero label="Precio actual" value={precioActual} onChange={setPrecioActual} step={0.01} />
          <CampoNumero label="Quiero retirar (€)" value={importeARetirar} onChange={setImporteARetirar} />
        </div>
        <CampoNumero
          label="Otras ganancias netas del ahorro este año (€)"
          value={otrasGanancias}
          onChange={setOtrasGanancias}
          min={-1000000}
          ayuda="Otras ventas con ganancia, intereses, dividendos. Negativo si has tenido pérdidas."
        />
      </form>

      <PanelResultados>
        <Resumen etiqueta="Valor de todas tus participaciones" valor={formatEuros(r.valorTotal)} />
        <Resumen etiqueta="Importe que vendes" valor={formatEuros(r.valor)} />
        <Resumen etiqueta="Lo que te costó (por FIFO)" valor={formatEuros(r.coste)} />
        <Resumen etiqueta={r.ganancia >= 0 ? 'Ganancia' : 'Pérdida'} valor={formatEuros(r.ganancia)} negativo={r.ganancia < 0} />
        <hr className="my-1 border-border" />
        <Resumen etiqueta="Impuesto por esta venta" valor={`− ${formatEuros(r.impuesto)}`} negativo />
        <Resumen etiqueta="Tipo medio sobre la ganancia" valor={formatPct(tipoMedio)} />
        <Resumen etiqueta="Retención el día de la venta" valor={`− ${formatEuros(r.retencion)}`} negativo />
        <Resumen etiqueta="Recibes en tu cuenta" valor={formatEuros(r.valor - r.retencion)} destacado />
        <Resumen
          etiqueta={diferenciaDeclaracion >= 0 ? 'A pagar además en la renta' : 'A devolver en la renta'}
          valor={formatEuros(Math.abs(diferenciaDeclaracion))}
        />
        <hr className="my-1 border-border" />
        <Resumen etiqueta={`Máximo a retirar sin pasar del tramo del ${formatPct(IRPF_AHORRO_BRACKETS[0].tipo, 0)}`} valor={formatEuros(r.maxPrimerTramo)} />

        {r.vendidos.length > 0 && (
          <details className="mt-2 text-xs text-ink-muted">
            <summary className="cursor-pointer font-medium text-ink">Qué compras se venden (FIFO)</summary>
            <ul className="mt-2 grid gap-1">
              {r.vendidos.map((v) => (
                <li key={v.id}>
                  Compra {lotes.findIndex((l) => l.id === v.id) + 1}:{' '}
                  {v.participaciones.toLocaleString('es-ES', { maximumFractionDigits: 2 })} participaciones, costaron{' '}
                  {formatEuros(v.coste)}, valen {formatEuros(v.valor)}.
                </li>
              ))}
            </ul>
          </details>
        )}
        <NotaCalculo>
          La retención ({formatPct(RETENCION_REEMBOLSO_FONDOS, 0)} de la ganancia) la practica la entidad
          si es española; es un adelanto que se regulariza en la declaración. El impuesto usa los tramos
          del IRPF del ahorro y tus otras ganancias del año. No contempla la compensación con
          rendimientos de otros tipos, ni fondos adquiridos antes de 1995. No es asesoramiento fiscal.
        </NotaCalculo>
      </PanelResultados>
    </div>
  );
}
