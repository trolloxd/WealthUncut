import { useMemo, useState } from 'react';
import { calcularImpuestoAhorro, IRPF_AHORRO_FUENTE } from '../config/finance';
import { CampoNumero, claseAnchoBarra, formatEuros } from './CalculatorUI';

interface Fondo {
  gestora: string;
  nombre: string;
  isin: string;
  indice: string;
  ter: number;
  minimoNota: string;
  traspasable: boolean;
  plataformas: string;
}

interface Props {
  fondos: Fondo[];
}

/**
 * Rentabilidad bruta anual de partida por tipo de índice: son supuestos razonables para arrancar
 * la simulación, no una previsión ni una cifra verificada como el TER. El usuario los puede
 * cambiar fondo a fondo.
 */
function rentabilidadPorDefecto(indice: string): number {
  const i = indice.toLowerCase();
  if (i.includes('s&p 500')) return 8;
  if (i.includes('emergentes')) return 6;
  return 7; // MSCI World / mercados desarrollados
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
  const [pesos, setPesos] = useState<Record<string, number>>(() => {
    // Cartera de ejemplo con tres fondos de índices distintos, para no arrancar con la
    // herramienta vacía. El usuario puede cambiar cualquier peso a 0.
    const inicial: Record<string, number> = Object.fromEntries(fondos.map((f) => [f.isin, 0]));
    const mundial = fondos.find((f) => f.indice.toLowerCase().includes('world'));
    const sp500 = fondos.find((f) => f.indice.toLowerCase().includes('s&p 500'));
    const emergentes = fondos.find((f) => f.indice.toLowerCase().includes('emergentes'));
    if (mundial) inicial[mundial.isin] = 50;
    if (sp500) inicial[sp500.isin] = 30;
    if (emergentes) inicial[emergentes.isin] = 20;
    return inicial;
  });
  const [rentabilidades, setRentabilidades] = useState<Record<string, number>>(() =>
    Object.fromEntries(fondos.map((f) => [f.isin, rentabilidadPorDefecto(f.indice)]))
  );
  const [aportacionInicial, setAportacionInicial] = useState(1000);
  const [aportacionMensual, setAportacionMensual] = useState(150);
  const [anios, setAnios] = useState(20);

  const pesoTotal = useMemo(() => Object.values(pesos).reduce((a, b) => a + b, 0), [pesos]);

  const resultado = useMemo(() => {
    const meses = Math.max(0, Math.round(anios * 12));
    const totalAportado = aportacionInicial + aportacionMensual * meses;

    if (pesoTotal <= 0) {
      return { totalAportado, valorFinalBruto: 0, ganancia: 0, impuesto: 0, valorFinalNeto: 0, porFondo: [] as ResultadoFondo[] };
    }

    const porFondo: ResultadoFondo[] = fondos
      .filter((f) => pesos[f.isin] > 0)
      .map((f) => {
        const peso = pesos[f.isin] / pesoTotal; // normalizado a 100% aunque el usuario no llegue exacto
        const aportado = aportacionInicial * peso + aportacionMensual * peso * meses;
        const valorFinalBruto = simularFondo({
          aportacionInicial: aportacionInicial * peso,
          aportacionMensual: aportacionMensual * peso,
          meses,
          rentabilidadBrutaAnual: rentabilidades[f.isin] ?? 7,
          terAnual: f.ter,
        });
        return { isin: f.isin, peso: pesos[f.isin] / pesoTotal, aportado, valorFinalBruto };
      });

    const valorFinalBruto = porFondo.reduce((a, r) => a + r.valorFinalBruto, 0);
    const ganancia = Math.max(0, valorFinalBruto - totalAportado);
    const impuesto = calcularImpuestoAhorro(ganancia);
    const valorFinalNeto = valorFinalBruto - impuesto;

    return { totalAportado, valorFinalBruto, ganancia, impuesto, valorFinalNeto, porFondo };
  }, [fondos, pesos, rentabilidades, aportacionInicial, aportacionMensual, anios, pesoTotal]);

  const maxValorFondo = Math.max(1, ...resultado.porFondo.map((r) => r.valorFinalBruto));

  function actualizarPeso(isin: string, valor: number) {
    setPesos((prev) => ({ ...prev, [isin]: Math.min(100, Math.max(0, valor)) }));
  }

  function actualizarRentabilidad(isin: string, valor: number) {
    setRentabilidades((prev) => ({ ...prev, [isin]: valor }));
  }

  return (
    <div className="card not-prose grid gap-6 p-6 lg:grid-cols-2">
      <div className="grid gap-5">
        <div className="grid gap-3">
          {fondos.map((f) => (
            <div key={f.isin} className="grid grid-cols-[1fr_4.5rem] items-start gap-3 border-b border-border/60 pb-3 last:border-0 sm:grid-cols-[1fr_4.5rem_5.5rem]">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{f.gestora}</p>
                <p className="text-xs text-ink-faint">{f.indice} · TER {f.ter.toLocaleString('es-ES', { minimumFractionDigits: 2 })}%</p>
              </div>
              <label className="grid gap-0.5 text-xs text-ink-muted">
                Peso %
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={5}
                  inputMode="numeric"
                  value={pesos[f.isin]}
                  onChange={(e) => actualizarPeso(f.isin, Number(e.target.value))}
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
                  value={rentabilidades[f.isin]}
                  onChange={(e) => actualizarRentabilidad(f.isin, Number(e.target.value))}
                  className="campo-input"
                  aria-label={`Rentabilidad bruta anual esperada de ${f.nombre}`}
                />
              </label>
            </div>
          ))}
        </div>

        <p className={`text-xs ${pesoTotal === 100 ? 'text-ink-faint' : 'text-accent'}`} aria-live="polite">
          Suma de pesos: {pesoTotal}%.{' '}
          {pesoTotal === 100
            ? 'La cartera está completa.'
            : pesoTotal === 0
              ? 'Asigna un peso a al menos un fondo.'
              : 'El cálculo normaliza estos pesos a 100% automáticamente, pero ajústalos para que la cartera refleje lo que quieres.'}
        </p>

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
          No simula reequilibrios, volatilidad ni el orden real en que llegan las rentabilidades: las
          rentabilidades por defecto son supuestos de partida razonables, no una previsión ni una
          rentabilidad histórica real de cada fondo. Cámbialas por las que tú creas más realistas. No es
          una recomendación de inversión.
        </p>
      </div>
    </div>
  );
}
