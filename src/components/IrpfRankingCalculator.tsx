import { useMemo, useState } from 'react';
import { IRPF_GENERAL_AUTONOMICO } from '../config/finance';
import { calcularSueldoNeto, type ComunidadId } from './SalaryCalculator';
import { CampoNumero, formatEuros } from './CalculatorUI';

const COMUNIDADES = Object.entries(IRPF_GENERAL_AUTONOMICO).map(([id, c]) => ({ id: id as ComunidadId, nombre: c.nombre }));

export interface FilaRanking {
  id: ComunidadId;
  nombre: string;
  netoAnual: number;
  irpfAnual: number;
}

// Anchos de barra como clases de Tailwind estáticas (nunca style="width:...%" ni un atributo SVG
// calculado): la CSP del sitio no permite aplicar estilos en tiempo de ejecución, ni siquiera vía
// atributos SVG con nombre de propiedad CSS (width, height, x, rx...), que React también bloquea
// bajo 'style-src'. Redondeando a múltiplos de 5 hay solo 18 clases, todas literales aquí para que
// Tailwind las incluya en el CSS del build.
const ANCHO_CLASE: Record<number, string> = {
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

function claseAncho(pct: number): string {
  const redondeado = Math.min(100, Math.max(15, Math.round(pct / 5) * 5));
  return ANCHO_CLASE[redondeado];
}

export function calcularRanking(brutoAnual: number): FilaRanking[] {
  return COMUNIDADES.map(({ id, nombre }) => {
    const r = calcularSueldoNeto({ brutoAnual, comunidad: id, pagas: 14 });
    return { id, nombre, netoAnual: r.netoAnual, irpfAnual: r.irpfAnual };
  }).sort((a, b) => b.netoAnual - a.netoAnual);
}

export default function IrpfRankingCalculator() {
  const [brutoAnual, setBrutoAnual] = useState(30000);
  const ranking = useMemo(() => calcularRanking(brutoAnual), [brutoAnual]);
  const mejor = ranking[0];
  const peor = ranking[ranking.length - 1];
  const diferencia = mejor.netoAnual - peor.netoAnual;
  const max = mejor.netoAnual;
  const min = Math.min(...ranking.map((f) => f.netoAnual));
  const rango = max - min || 1;

  return (
    <div className="card not-prose p-6">
      <div className="max-w-xs">
        <CampoNumero label="Sueldo bruto anual (€)" value={brutoAnual} onChange={setBrutoAnual} step={500} />
      </div>

      <p className="mt-5 rounded-xl bg-cream p-4 text-sm text-ink" aria-live="polite">
        Con {formatEuros(brutoAnual)} brutos al año, la diferencia entre vivir en{' '}
        <strong className="text-brand">{mejor.nombre}</strong> (donde más neto queda) y en{' '}
        <strong className="text-accent">{peor.nombre}</strong> (donde menos) es de{' '}
        <strong>{formatEuros(diferencia)} al año</strong>, solo por la comunidad autónoma en la que resides.
      </p>

      <div className="mt-6 grid gap-2">
        {ranking.map((f, i) => {
          const anchoBarra = 15 + (85 * (f.netoAnual - min)) / rango; // mínimo 15% para que siempre se vea algo
          const color = i === 0 ? 'bg-brand' : i === ranking.length - 1 ? 'bg-accent/70' : 'bg-brand/40';
          return (
            <div key={f.id} className="grid grid-cols-[1.75rem_9rem_1fr_5.5rem] items-center gap-2 text-sm sm:grid-cols-[1.75rem_11rem_1fr_6rem]">
              <span className="text-right text-xs text-ink-faint">{i + 1}</span>
              <span className="truncate text-ink">{f.nombre}</span>
              <span className="block h-4 w-full overflow-hidden rounded-full bg-cream" aria-hidden="true">
                <span className={`block h-full rounded-full ${color} ${claseAncho(anchoBarra)}`} />
              </span>
              <span className="text-right font-semibold text-ink">{formatEuros(f.netoAnual)}</span>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-ink-faint">
        Neto anual estimado (sueldo bruto menos Seguridad Social e IRPF), para un trabajador residente todo el
        año en cada comunidad, menor de 65 años, sin hijos ni ascendientes a cargo, sin otras rentas. No incluye
        País Vasco ni Navarra, que tienen un sistema foral propio. Mismos supuestos que la{' '}
        <a href="/herramientas/calculadora-sueldo-neto/" className="underline hover:text-ink">
          calculadora de sueldo neto
        </a>
        .
      </p>
    </div>
  );
}
