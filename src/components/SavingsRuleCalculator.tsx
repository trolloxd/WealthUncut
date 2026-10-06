import { useMemo } from 'react';
import { CampoNumero, NotaCalculo, PanelResultados, Resumen, formatEuros, formatPct, useEstadoUrl } from './CalculatorUI';

// Regla 50/30/20: referencia popular de reparto del sueldo neto, no una norma.
const REGLA = { necesidades: 0.5, deseos: 0.3, ahorro: 0.2 } as const;

export interface ParamsAhorro {
  sueldoNeto: number;
  necesidades: number;
  deseos: number;
  anios: number;
  rentabilidadPct: number;
}

export function calcularAhorro(p: ParamsAhorro) {
  const sueldo = Math.max(0, p.sueldoNeto);
  const ahorroMensual = sueldo - Math.max(0, p.necesidades) - Math.max(0, p.deseos);
  const pctAhorro = sueldo > 0 ? ahorroMensual / sueldo : 0;
  const objetivoAhorro = sueldo * REGLA.ahorro;
  const meses = Math.max(0, Math.round(p.anios * 12));
  const r = Math.pow(1 + p.rentabilidadPct / 100, 1 / 12) - 1;
  const aportado = Math.max(0, ahorroMensual) * meses;
  const conRentabilidad =
    ahorroMensual <= 0 ? 0 : r === 0 ? aportado : ahorroMensual * ((Math.pow(1 + r, meses) - 1) / r);
  return {
    ahorroMensual,
    pctAhorro,
    objetivoAhorro,
    diferenciaObjetivo: ahorroMensual - objetivoAhorro,
    reglaNecesidades: sueldo * REGLA.necesidades,
    reglaDeseos: sueldo * REGLA.deseos,
    aportado,
    conRentabilidad,
  };
}

export default function SavingsRuleCalculator() {
  const [sueldoNeto, setSueldoNeto] = useEstadoUrl<number>('sueldo', 1800);
  const [necesidades, setNecesidades] = useEstadoUrl<number>('necesidades', 900);
  const [deseos, setDeseos] = useEstadoUrl<number>('deseos', 500);
  const [anios, setAnios] = useEstadoUrl<number>('anios', 10, { max: 60 });
  const [rentabilidadPct, setRentabilidadPct] = useEstadoUrl<number>('rent', 4, { max: 30 });

  const r = useMemo(
    () => calcularAhorro({ sueldoNeto, necesidades, deseos, anios, rentabilidadPct }),
    [sueldoNeto, necesidades, deseos, anios, rentabilidadPct]
  );

  return (
    <div className="card not-prose grid gap-6 p-6 md:grid-cols-2">
      <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
        <CampoNumero label="Sueldo neto al mes (€)" value={sueldoNeto} onChange={setSueldoNeto} step={50} ayuda="Lo que te ingresan, después de impuestos y Seguridad Social." />
        <CampoNumero
          label="Gastos necesarios al mes (€)"
          value={necesidades}
          onChange={setNecesidades}
          step={50}
          ayuda="Vivienda, comida, transporte, suministros, seguros, deudas: lo que no puedes dejar de pagar."
        />
        <CampoNumero
          label="Gustos y ocio al mes (€)"
          value={deseos}
          onChange={setDeseos}
          step={50}
          ayuda="Restaurantes, viajes, ropa, suscripciones, caprichos."
        />
        <CampoNumero label="Años ahorrando" value={anios} onChange={setAnios} min={1} max={60} />
        <CampoNumero
          label="Rentabilidad anual supuesta (%)"
          value={rentabilidadPct}
          onChange={setRentabilidadPct}
          step={0.5}
          ayuda="Un supuesto para ver el efecto del interés compuesto, no una previsión. Pon 0 si lo guardas sin invertir."
        />
      </form>

      <PanelResultados>
        <Resumen
          etiqueta="Ahorras al mes"
          valor={formatEuros(r.ahorroMensual)}
          destacado
          negativo={r.ahorroMensual < 0}
        />
        <Resumen etiqueta="Porcentaje de tu sueldo que ahorras" valor={formatPct(r.pctAhorro, 1)} negativo={r.pctAhorro < 0} />
        <hr className="my-1 border-border" />
        <Resumen etiqueta="Regla 50/30/20: necesidades (50%)" valor={formatEuros(r.reglaNecesidades)} />
        <Resumen etiqueta="Regla 50/30/20: gustos (30%)" valor={formatEuros(r.reglaDeseos)} />
        <Resumen etiqueta="Regla 50/30/20: ahorro (20%)" valor={formatEuros(r.objetivoAhorro)} />
        <Resumen
          etiqueta={r.diferenciaObjetivo >= 0 ? 'Ahorras por encima de la regla' : 'Te falta para llegar a la regla'}
          valor={formatEuros(Math.abs(r.diferenciaObjetivo))}
          negativo={r.diferenciaObjetivo < 0}
        />
        <hr className="my-1 border-border" />
        <Resumen etiqueta={`Aportado en ${anios} años`} valor={formatEuros(r.aportado)} />
        <Resumen etiqueta={`Tendrías con un ${rentabilidadPct.toLocaleString('es-ES')}% anual`} valor={formatEuros(r.conRentabilidad)} destacado />
        <NotaCalculo>
          La regla 50/30/20 es una referencia popular, no una norma: con alquileres altos puede ser
          imposible cumplirla, y con ingresos altos puedes ahorrar más del 20%. El resultado con
          rentabilidad supone un rendimiento constante, sin impuestos ni inflación. No es una previsión.
        </NotaCalculo>
      </PanelResultados>
    </div>
  );
}
