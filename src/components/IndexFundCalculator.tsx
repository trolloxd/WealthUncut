import { useMemo, useState } from 'react';
import { calcularImpuestoAhorro, IRPF_AHORRO_FUENTE_VERIFICAR } from '../config/finance';

function formatEuros(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

interface Resultado {
  valorFinalBruto: number;
  totalAportado: number;
  ganancia: number;
  impuesto: number;
  valorFinalNeto: number;
}

function simular(params: {
  aportacionInicial: number;
  aportacionMensual: number;
  anios: number;
  rentabilidadBrutaAnual: number;
  terAnual: number;
  comisionBrokerAnual: number;
}): Resultado {
  const { aportacionInicial, aportacionMensual, anios, rentabilidadBrutaAnual, terAnual, comisionBrokerAnual } = params;

  const rentabilidadNetaAnual = Math.max(
    0,
    rentabilidadBrutaAnual / 100 - terAnual / 100 - comisionBrokerAnual / 100
  );
  const meses = Math.round(anios * 12);
  const rMensual = Math.pow(1 + rentabilidadNetaAnual, 1 / 12) - 1;

  let valorFinalBruto: number;
  if (rMensual === 0) {
    valorFinalBruto = aportacionInicial + aportacionMensual * meses;
  } else {
    valorFinalBruto =
      aportacionInicial * Math.pow(1 + rMensual, meses) +
      aportacionMensual * ((Math.pow(1 + rMensual, meses) - 1) / rMensual);
  }

  const totalAportado = aportacionInicial + aportacionMensual * meses;
  const ganancia = Math.max(0, valorFinalBruto - totalAportado);
  const impuesto = calcularImpuestoAhorro(ganancia);
  const valorFinalNeto = valorFinalBruto - impuesto;

  return { valorFinalBruto, totalAportado, ganancia, impuesto, valorFinalNeto };
}

export default function IndexFundCalculator() {
  const [aportacionInicial, setAportacionInicial] = useState(1000);
  const [aportacionMensual, setAportacionMensual] = useState(150);
  const [anios, setAnios] = useState(20);
  const [rentabilidadBrutaAnual, setRentabilidadBrutaAnual] = useState(7);
  const [terAnual, setTerAnual] = useState(0.2);
  const [comisionBrokerAnual, setComisionBrokerAnual] = useState(0);

  const resultado = useMemo(
    () =>
      simular({
        aportacionInicial,
        aportacionMensual,
        anios,
        rentabilidadBrutaAnual,
        terAnual,
        comisionBrokerAnual,
      }),
    [aportacionInicial, aportacionMensual, anios, rentabilidadBrutaAnual, terAnual, comisionBrokerAnual]
  );

  return (
    <div className="card not-prose grid gap-6 p-6 md:grid-cols-2">
      <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
        <Campo label="Aportación inicial (€)">
          <input
            type="number"
            min={0}
            value={aportacionInicial}
            onChange={(e) => setAportacionInicial(Number(e.target.value))}
            className="campo-input"
          />
        </Campo>
        <Campo label="Aportación mensual (€)">
          <input
            type="number"
            min={0}
            value={aportacionMensual}
            onChange={(e) => setAportacionMensual(Number(e.target.value))}
            className="campo-input"
          />
        </Campo>
        <Campo label="Años invertidos">
          <input
            type="number"
            min={1}
            max={60}
            value={anios}
            onChange={(e) => setAnios(Number(e.target.value))}
            className="campo-input"
          />
        </Campo>
        <Campo label="Rentabilidad bruta anual esperada (%)">
          <input
            type="number"
            step={0.1}
            value={rentabilidadBrutaAnual}
            onChange={(e) => setRentabilidadBrutaAnual(Number(e.target.value))}
            className="campo-input"
          />
        </Campo>
        <Campo label="Comisión del fondo, TER (%)">
          <input
            type="number"
            step={0.01}
            value={terAnual}
            onChange={(e) => setTerAnual(Number(e.target.value))}
            className="campo-input"
          />
        </Campo>
        <Campo label="Comisión anual del broker (%)">
          <input
            type="number"
            step={0.01}
            value={comisionBrokerAnual}
            onChange={(e) => setComisionBrokerAnual(Number(e.target.value))}
            className="campo-input"
          />
        </Campo>
      </form>

      <div className="flex flex-col justify-center gap-3 rounded-xl bg-cream p-5">
        <Resumen etiqueta="Total aportado" valor={formatEuros(resultado.totalAportado)} />
        <Resumen etiqueta="Valor final bruto" valor={formatEuros(resultado.valorFinalBruto)} />
        <Resumen etiqueta="Ganancia" valor={formatEuros(resultado.ganancia)} />
        <Resumen etiqueta="Impuesto estimado (IRPF ahorro)" valor={`− ${formatEuros(resultado.impuesto)}`} negativo />
        <hr className="my-1 border-border" />
        <Resumen
          etiqueta="Valor final NETO"
          valor={formatEuros(resultado.valorFinalNeto)}
          destacado
        />
        <p className="mt-2 text-xs text-ink-faint">
          Cálculo aproximado: TER y comisión de broker se restan directamente de la
          rentabilidad bruta anual, e impuesto de la venta se aplica de una sola vez sobre
          la ganancia total al final del periodo, con los tramos del IRPF del ahorro{' '}
          {!IRPF_AHORRO_FUENTE_VERIFICAR.verificado && (
            <strong className="text-accent">(pendiente de verificar)</strong>
          )}
          . No es una recomendación de inversión ni tiene en cuenta tu situación fiscal
          personal.
        </p>
      </div>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-sm font-medium text-ink-muted">
      {label}
      {children}
    </label>
  );
}

function Resumen({
  etiqueta,
  valor,
  destacado = false,
  negativo = false,
}: {
  etiqueta: string;
  valor: string;
  destacado?: boolean;
  negativo?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-sm text-ink-muted">{etiqueta}</span>
      <span
        className={
          destacado
            ? 'font-display text-xl font-semibold text-brand'
            : negativo
              ? 'text-base font-semibold text-accent'
              : 'text-base font-semibold text-ink'
        }
      >
        {valor}
      </span>
    </div>
  );
}
