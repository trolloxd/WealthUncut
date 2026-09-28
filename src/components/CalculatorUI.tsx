/** Piezas visuales y de formato compartidas por todas las calculadoras del sitio. */
import type { ReactNode } from 'react';

export function formatEuros(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
    useGrouping: 'always',
  }).format(value);
}

export function formatPct(value: number, decimals = 1): string {
  return `${new Intl.NumberFormat('es-ES', { maximumFractionDigits: decimals }).format(value * 100)}%`;
}

export function Campo({ label, children, ayuda }: { label: string; children: ReactNode; ayuda?: string }) {
  return (
    <label className="grid gap-1 text-sm font-medium text-ink-muted">
      {label}
      {children}
      {ayuda && <span className="text-xs font-normal text-ink-faint">{ayuda}</span>}
    </label>
  );
}

/** Campo numérico: vacío o texto no numérico cuenta como 0, y los límites se aplican al valor. */
export function CampoNumero({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  ayuda,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  ayuda?: string;
}) {
  return (
    <Campo label={label} ayuda={ayuda}>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        inputMode={Number.isInteger(step) ? 'numeric' : 'decimal'}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          const acotado = Math.min(max ?? Infinity, Math.max(min, Number.isFinite(n) ? n : 0));
          onChange(acotado);
        }}
        className="campo-input"
      />
    </Campo>
  );
}

export function Resumen({
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

/** Panel de resultados: se anuncia a lectores de pantalla cuando cambia. */
export function PanelResultados({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col justify-center gap-3 rounded-xl bg-cream p-5" aria-live="polite">
      {children}
    </div>
  );
}

export function NotaCalculo({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-xs text-ink-faint">{children}</p>;
}

// Anchos de barra como clases de Tailwind estáticas (nunca style="width:...%" ni un atributo SVG
// calculado): la CSP del sitio no permite aplicar estilos en tiempo de ejecución, ni siquiera vía
// atributos SVG con nombre de propiedad CSS (width, height, x, rx...), que React también bloquea
// bajo 'style-src'. Redondeando a múltiplos de 5 hay solo 21 clases, todas literales aquí para que
// Tailwind las incluya en el CSS del build.
const ANCHO_BARRA_CLASE: Record<number, string> = {
  0: 'w-0',
  5: 'w-[5%]',
  10: 'w-[10%]',
  15: 'w-[15%]',
  20: 'w-[20%]',
  25: 'w-[25%]',
  30: 'w-[30%]',
  35: 'w-[35%]',
  40: 'w-[40%]',
  45: 'w-[45%]',
  50: 'w-[50%]',
  55: 'w-[55%]',
  60: 'w-[60%]',
  65: 'w-[65%]',
  70: 'w-[70%]',
  75: 'w-[75%]',
  80: 'w-[80%]',
  85: 'w-[85%]',
  90: 'w-[90%]',
  95: 'w-[95%]',
  100: 'w-[100%]',
};

/** Clase de ancho más cercana (redondeada a múltiplos de 5) para una barra de progreso simple. */
export function claseAnchoBarra(pct: number, minimo = 0): string {
  const redondeado = Math.min(100, Math.max(minimo, Math.round(pct / 5) * 5));
  return ANCHO_BARRA_CLASE[redondeado];
}
