import { useMemo, useState } from 'react';
import { calcularImpuestoAhorro, IRPF_AHORRO_FUENTE } from '../config/finance';
import { CampoNumero, claseAnchoBarra, formatEuros } from './CalculatorUI';

interface Fondo {
  gestora: string;
  nombre: string;
  isin: string;
  indice: string;
  ter: number;
  terNota?: string;
  perfilRiesgo: number;
  rentabilidadesAnuales: Record<string, number>;
}

interface Props {
  fondos: Fondo[];
}

/** Media de los años completos (todos menos el más reciente, que es el año en curso, parcial). */
function mediaHistorica(rentabilidades: Record<string, number>): number {
  const valores = Object.values(rentabilidades).slice(1);
  if (valores.length === 0) return 0;
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

function ultimoAnioCompleto(rentabilidades: Record<string, number>): { anio: string; valor: number } | null {
  const entradas = Object.entries(rentabilidades).slice(1);
  return entradas.length > 0 ? { anio: entradas[0][0], valor: entradas[0][1] } : null;
}

interface ResultadoFondo {
  isin: string;
  peso: number;
  aportado: number;
  valorFinalBruto: number;
}

function simularFondo(params: {
  aportacionInicial: number;
  aportacionMensual: number;
  meses: number;
  rentabilidadBrutaAnual: number;
  terAnual: number;
}): number {
  const { aportacionInicial, aportacionMensual, meses, rentabilidadBrutaAnual, terAnual } = params;
  const rentabilidadNetaAnual = Math.max(-0.99, rentabilidadBrutaAnual / 100 - terAnual / 100);
  const rMensual = Math.pow(1 + rentabilidadNetaAnual, 1 / 12) - 1;

  if (rMensual === 0) return aportacionInicial + aportacionMensual * meses;
  return (
    aportacionInicial * Math.pow(1 + rMensual, meses) +
    aportacionMensual * ((Math.pow(1 + rMensual, meses) - 1) / rMensual)
  );
}

export default function FundPortfolioSimulator({ fondos }: Props) {
  const [busqueda, setBusqueda] = useState('');
  const [isinsEnCartera, setIsinsEnCartera] = useState<string[]>(() => {
    // Cartera de ejemplo con tres fondos de índices distintos, para no arrancar vacío.
    const candidatos = ['IE00BYX5NX33', 'IE0031786696', 'IE0032620787'];
    return candidatos.filter((isin) => fondos.some((f) => f.isin === isin));
  });
  const [pesos, setPesos] = useState<Record<string, number>>({});
  const [rentabilidades, setRentabilidades] = useState<Record<string, number>>({});
  const [aportacionInicial, setAportacionInicial] = useState(1000);
  const [aportacionMensual, setAportacionMensual] = useState(150);
  const [anios, setAnios] = useState(20);

  function pesoDe(isin: string): number {
    return pesos[isin] ?? Math.round(100 / Math.max(1, isinsEnCartera.length));
  }
  function rentabilidadDe(isin: string): number {
    if (rentabilidades[isin] !== undefined) return rentabilidades[isin];
    const fondo = fondos.find((f) => f.isin === isin);
    return fondo ? Math.round(mediaHistorica(fondo.rentabilidadesAnuales) * 10) / 10 : 7;
  }

  const resultadosBusqueda = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return [];
    return fondos
      .filter((f) => !isinsEnCartera.includes(f.isin))
      .filter(
        (f) =>
          f.nombre.toLowerCase().includes(q) ||
          f.gestora.toLowerCase().includes(q) ||
          f.indice.toLowerCase().includes(q) ||
          f.isin.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [busqueda, fondos, isinsEnCartera]);

  function anadirFondo(isin: string) {
    setIsinsEnCartera((prev) => (prev.includes(isin) ? prev : [...prev, isin]));
    setBusqueda('');
  }

  function quitarFondo(isin: string) {
    setIsinsEnCartera((prev) => prev.filter((i) => i !== isin));
    setPesos((prev) => {
      const { [isin]: _, ...resto } = prev;
      return resto;
    });
  }

  const fondosEnCartera = isinsEnCartera.map((isin) => fondos.find((f) => f.isin === isin)!).filter(Boolean);
  const pesoTotal = fondosEnCartera.reduce((a, f) => a + pesoDe(f.isin), 0);

  const resultado = useMemo(() => {
    const meses = Math.max(0, Math.round(anios * 12));
    const totalAportado = aportacionInicial + aportacionMensual * meses;

    if (pesoTotal <= 0 || fondosEnCartera.length === 0) {
      return { totalAportado, valorFinalBruto: 0, ganancia: 0, impuesto: 0, valorFinalNeto: 0, porFondo: [] as ResultadoFondo[] };
    }

    const porFondo: ResultadoFondo[] = fondosEnCartera.map((f) => {
      const peso = pesoDe(f.isin) / pesoTotal;
      const aportado = aportacionInicial * peso + aportacionMensual * peso * meses;
      const valorFinalBruto = simularFondo({
        aportacionInicial: aportacionInicial * peso,
        aportacionMensual: aportacionMensual * peso,
        meses,
        rentabilidadBrutaAnual: rentabilidadDe(f.isin),
        terAnual: f.ter,
      });
      return { isin: f.isin, peso, aportado, valorFinalBruto };
    });

    const valorFinalBruto = porFondo.reduce((a, r) => a + r.valorFinalBruto, 0);
    const ganancia = Math.max(0, valorFinalBruto - totalAportado);
    const impuesto = calcularImpuestoAhorro(ganancia);
    const valorFinalNeto = valorFinalBruto - impuesto;

    return { totalAportado, valorFinalBruto, ganancia, impuesto, valorFinalNeto, porFondo };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fondosEnCartera, pesos, rentabilidades, aportacionInicial, aportacionMensual, anios, pesoTotal]);

  const maxValorFondo = Math.max(1, ...resultado.porFondo.map((r) => r.valorFinalBruto));

  return (
    <div className="card not-prose grid gap-6 p-6 lg:grid-cols-2">
      <div className="grid gap-5">
        <div className="grid gap-2">
          <label className="grid gap-1 text-sm font-medium text-ink-muted">
            Buscar fondo (nombre, gestora o índice)
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Ej. emergentes, Vanguard, Nasdaq..."
              className="campo-input"
              aria-label="Buscar fondo para añadir a la cartera"
            />
          </label>
          {resultadosBusqueda.length > 0 && (
            <ul className="grid gap-1 rounded-xl border border-border bg-cream p-2">
              {resultadosBusqueda.map((f) => (
                <li key={f.isin}>
                  <button
                    type="button"
                    onClick={() => anadirFondo(f.isin)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-white"
                  >
                    <span>
                      <span className="font-medium text-ink">{f.gestora}</span>{' '}
                      <span className="text-ink-faint">({f.indice})</span>
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-brand">+ Añadir</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {busqueda.trim() !== '' && resultadosBusqueda.length === 0 && (
            <p className="text-xs text-ink-faint">Ningún fondo de la lista coincide con "{busqueda}".</p>
          )}
        </div>

        <div className="grid gap-3">
          {fondosEnCartera.length === 0 && (
            <p className="rounded-xl bg-cream p-4 text-sm text-ink-muted">
              Busca arriba y añade al menos un fondo para empezar tu cartera.
            </p>
          )}
          {fondosEnCartera.map((f) => {
            const ultimo = ultimoAnioCompleto(f.rentabilidadesAnuales);
            return (
              <div key={f.isin} className="grid grid-cols-[1fr_4.5rem] items-start gap-3 border-b border-border/60 pb-3 last:border-0 sm:grid-cols-[1fr_4.5rem_5.5rem_1.5rem]">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{f.gestora}</p>
                  <p className="text-xs text-ink-faint">
                    {f.indice} · TER {f.ter.toLocaleString('es-ES', { minimumFractionDigits: 2 })}%
                    {ultimo && ` · ${ultimo.anio}: ${ultimo.valor > 0 ? '+' : ''}${ultimo.valor.toLocaleString('es-ES')}%`}
                  </p>
                </div>
                <label className="grid gap-0.5 text-xs text-ink-muted">
                  Peso %
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={5}
                    inputMode="numeric"
                    value={pesoDe(f.isin)}
                    onChange={(e) => setPesos((prev) => ({ ...prev, [f.isin]: Math.min(100, Math.max(0, Number(e.target.value))) }))}
                    className="campo-input"
                    aria-label={`Peso en la cartera de ${f.nombre}`}
                  />
                </label>
                <label className="hidden gap-0.5 text-xs text-ink-muted sm:grid">
                  Rent. % anual
                  <input
                    type="number"
                    step={0.5}
                    inputMode="decimal"
                    value={rentabilidadDe(f.isin)}
                    onChange={(e) => setRentabilidades((prev) => ({ ...prev, [f.isin]: Number(e.target.value) }))}
                    className="campo-input"
                    aria-label={`Rentabilidad bruta anual esperada de ${f.nombre}`}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => quitarFondo(f.isin)}
                  className="mt-4 text-ink-faint hover:text-accent sm:mt-5"
                  aria-label={`Quitar ${f.nombre} de la cartera`}
                  title="Quitar de la cartera"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>

        {fondosEnCartera.length > 0 && (
          <p className={`text-xs ${pesoTotal === 100 ? 'text-ink-faint' : 'text-accent'}`} aria-live="polite">
            Suma de pesos: {pesoTotal}%.{' '}
            {pesoTotal === 100
              ? 'La cartera está completa.'
              : 'El cálculo normaliza estos pesos a 100% automáticamente, pero ajústalos para que la cartera refleje lo que quieres.'}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <CampoNumero label="Aportación inicial (€)" value={aportacionInicial} onChange={setAportacionInicial} step={100} />
          <CampoNumero label="Aportación mensual (€)" value={aportacionMensual} onChange={setAportacionMensual} step={10} />
          <CampoNumero label="Años invertido" value={anios} onChange={setAnios} min={1} max={60} />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col justify-center gap-3 rounded-xl bg-cream p-5" aria-live="polite">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-ink-muted">Total aportado</span>
            <span className="text-base font-semibold text-ink">{formatEuros(resultado.totalAportado)}</span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-ink-muted">Valor final bruto</span>
            <span className="text-base font-semibold text-ink">{formatEuros(resultado.valorFinalBruto)}</span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-ink-muted">Ganancia</span>
            <span className="text-base font-semibold text-ink">{formatEuros(resultado.ganancia)}</span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-ink-muted">Impuesto estimado (IRPF ahorro)</span>
            <span className="text-base font-semibold text-accent">− {formatEuros(resultado.impuesto)}</span>
          </div>
          <hr className="my-1 border-border" />
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-ink-muted">Valor final NETO</span>
            <span className="font-display text-xl font-semibold text-brand">{formatEuros(resultado.valorFinalNeto)}</span>
          </div>
        </div>

        {resultado.porFondo.length > 0 && (
          <div className="grid gap-2">
            <p className="text-xs font-medium text-ink-muted">Valor final bruto por fondo</p>
            {resultado.porFondo
              .slice()
              .sort((a, b) => b.valorFinalBruto - a.valorFinalBruto)
              .map((r) => {
                const fondo = fondos.find((f) => f.isin === r.isin)!;
                const anchoPct = (100 * r.valorFinalBruto) / maxValorFondo;
                return (
                  <div key={r.isin} className="grid grid-cols-[7rem_1fr_5.5rem] items-center gap-2 text-xs sm:grid-cols-[9rem_1fr_6rem]">
                    <span className="truncate text-ink-muted">{fondo.gestora}</span>
                    <span className="block h-3 w-full overflow-hidden rounded-full bg-white" aria-hidden="true">
                      <span className={`block h-full rounded-full bg-brand/70 ${claseAnchoBarra(anchoPct, 10)}`} />
                    </span>
                    <span className="text-right font-semibold text-ink">{formatEuros(r.valorFinalBruto)}</span>
                  </div>
                );
              })}
          </div>
        )}

        <p className="text-xs text-ink-faint">
          Simulación simplificada: cada fondo compone por separado con la rentabilidad bruta anual que
          le asignes menos su TER, sin comisión de custodia, y el impuesto se calcula una sola vez sobre
          la ganancia total al final del periodo con los tramos del IRPF del ahorro{' '}
          {!IRPF_AHORRO_FUENTE.verificado && <strong className="text-accent">(pendiente de verificar)</strong>}.
          No simula reequilibrios, volatilidad ni el orden real en que llegan las rentabilidades. Los
          valores de partida son la media de los años completos que MyInvestor publica para cada fondo,
          no una previsión: cámbialos por el criterio que prefieras. No es una recomendación de inversión.
        </p>
      </div>
    </div>
  );
}
