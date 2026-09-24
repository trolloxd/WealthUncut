import { useMemo, useState } from 'react';
import { calcularImpuestoAhorro, PLAN_PENSIONES } from '../config/finance';
import { CampoNumero, NotaCalculo, PanelResultados, Resumen, formatEuros, formatPct } from './CalculatorUI';

export interface ParamsPensionVsFondo {
  aportacionAnual: number;
  anios: number;
  rentabilidadBruta: number; // % anual, igual para los dos productos
  terPlan: number; // % anual
  terFondo: number; // % anual
  tipoMarginalHoy: number; // % que te ahorras hoy por la reducción del plan
  tipoMarginalJubilacion: number; // % al que tributa el rescate como rendimiento del trabajo
}

function valorFinalAnualidad(aportacion: number, tasa: number, anios: number): number {
  if (anios <= 0 || aportacion <= 0) return 0;
  if (Math.abs(tasa) < 1e-9) return aportacion * anios;
  return aportacion * ((Math.pow(1 + tasa, anios) - 1) / tasa);
}

export interface ResultadoPensionVsFondo {
  plan: { valorFinalBruto: number; impuestoRescate: number; neto: number };
  ahorroFiscalReinvertido: { aportado: number; valorFinalBruto: number; impuesto: number; neto: number };
  totalPlan: number;
  fondo: { aportado: number; valorFinalBruto: number; impuesto: number; neto: number };
  diferencia: number; // totalPlan - fondo.neto
}

/**
 * Compara aportar cada año la misma cantidad a un plan de pensiones o directamente a un fondo
 * indexado, con el mismo esfuerzo de ahorro: lo que el plan de pensiones te deja de ahorro fiscal
 * cada año (por la reducción en la base imponible) se invierte también en el fondo indexado, para
 * que el desembolso total sea comparable.
 */
export function compararPensionVsFondo(p: ParamsPensionVsFondo): ResultadoPensionVsFondo {
  const tasaPlan = p.rentabilidadBruta / 100 - p.terPlan / 100;
  const tasaFondo = p.rentabilidadBruta / 100 - p.terFondo / 100;

  const valorFinalPlanBruto = valorFinalAnualidad(p.aportacionAnual, tasaPlan, p.anios);
  const impuestoRescate = valorFinalPlanBruto * (p.tipoMarginalJubilacion / 100);
  const netoPlan = valorFinalPlanBruto - impuestoRescate;

  const ahorroFiscalAnual = p.aportacionAnual * (p.tipoMarginalHoy / 100);
  const aportadoAhorroFiscal = ahorroFiscalAnual * p.anios;
  const valorFinalAhorroFiscalBruto = valorFinalAnualidad(ahorroFiscalAnual, tasaFondo, p.anios);
  const gananciaAhorroFiscal = valorFinalAhorroFiscalBruto - aportadoAhorroFiscal;
  const impuestoAhorroFiscal = calcularImpuestoAhorro(gananciaAhorroFiscal);
  const netoAhorroFiscal = valorFinalAhorroFiscalBruto - impuestoAhorroFiscal;

  const aportadoFondo = p.aportacionAnual * p.anios;
  const valorFinalFondoBruto = valorFinalAnualidad(p.aportacionAnual, tasaFondo, p.anios);
  const gananciaFondo = valorFinalFondoBruto - aportadoFondo;
  const impuestoFondo = calcularImpuestoAhorro(gananciaFondo);
  const netoFondo = valorFinalFondoBruto - impuestoFondo;

  const totalPlan = netoPlan + netoAhorroFiscal;

  return {
    plan: { valorFinalBruto: valorFinalPlanBruto, impuestoRescate, neto: netoPlan },
    ahorroFiscalReinvertido: { aportado: aportadoAhorroFiscal, valorFinalBruto: valorFinalAhorroFiscalBruto, impuesto: impuestoAhorroFiscal, neto: netoAhorroFiscal },
    totalPlan,
    fondo: { aportado: aportadoFondo, valorFinalBruto: valorFinalFondoBruto, impuesto: impuestoFondo, neto: netoFondo },
    diferencia: totalPlan - netoFondo,
  };
}

export default function PensionVsFundCalculator() {
  const [aportacionAnual, setAportacionAnual] = useState(1500);
  const [anios, setAnios] = useState(25);
  const [rentabilidadBruta, setRentabilidadBruta] = useState(7);
  const [terPlan, setTerPlan] = useState(1.2);
  const [terFondo, setTerFondo] = useState(0.2);
  const [tipoMarginalHoy, setTipoMarginalHoy] = useState(30);
  const [tipoMarginalJubilacion, setTipoMarginalJubilacion] = useState(19);

  const r = useMemo(
    () => compararPensionVsFondo({ aportacionAnual, anios, rentabilidadBruta, terPlan, terFondo, tipoMarginalHoy, tipoMarginalJubilacion }),
    [aportacionAnual, anios, rentabilidadBruta, terPlan, terFondo, tipoMarginalHoy, tipoMarginalJubilacion]
  );

  return (
    <div className="card not-prose grid gap-6 p-6 md:grid-cols-2">
      <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
        <CampoNumero
          label="Aportación anual (€)"
          value={aportacionAnual}
          onChange={setAportacionAnual}
          step={100}
          ayuda={
            aportacionAnual > PLAN_PENSIONES.limiteIndividual
              ? `Por encima de ${formatEuros(PLAN_PENSIONES.limiteIndividual)}, el plan de pensiones individual ya no te deduce nada extra (salvo que tengas plan de empleo).`
              : `El plan de pensiones individual se puede deducir hasta ${formatEuros(PLAN_PENSIONES.limiteIndividual)} al año.`
          }
        />
        <CampoNumero label="Años hasta que lo rescatas" value={anios} onChange={setAnios} min={1} max={60} />
        <CampoNumero label="Rentabilidad bruta anual (%)" value={rentabilidadBruta} onChange={setRentabilidadBruta} min={-20} step={0.1} ayuda="La misma para los dos, antes de comisiones." />
        <div className="grid grid-cols-2 gap-3">
          <CampoNumero label="Comisión (TER) del plan (%)" value={terPlan} onChange={setTerPlan} step={0.05} />
          <CampoNumero label="Comisión (TER) del fondo (%)" value={terFondo} onChange={setTerFondo} step={0.05} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <CampoNumero
            label="Tu tipo marginal de IRPF hoy (%)"
            value={tipoMarginalHoy}
            onChange={setTipoMarginalHoy}
            max={54}
            ayuda="Lo que te ahorras de impuesto por cada euro aportado. Depende de tu renta y tu comunidad."
          />
          <CampoNumero
            label="Tu tipo marginal en la jubilación (%)"
            value={tipoMarginalJubilacion}
            onChange={setTipoMarginalJubilacion}
            max={54}
            ayuda="Al rescatarlo tributa como sueldo, a tu tipo marginal de ese momento."
          />
        </div>
      </form>

      <PanelResultados>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Plan de pensiones</p>
        <Resumen etiqueta="Valor final bruto" valor={formatEuros(r.plan.valorFinalBruto)} />
        <Resumen etiqueta="Impuesto al rescatarlo" valor={`− ${formatEuros(r.plan.impuestoRescate)}`} negativo />
        <Resumen etiqueta="+ Ahorro fiscal invertido cada año, ya neto" valor={formatEuros(r.ahorroFiscalReinvertido.neto)} />
        <Resumen etiqueta="Total neto" valor={formatEuros(r.totalPlan)} destacado />
        <hr className="my-1 border-border" />
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Fondo indexado</p>
        <Resumen etiqueta="Valor final bruto" valor={formatEuros(r.fondo.valorFinalBruto)} />
        <Resumen etiqueta="Impuesto al venderlo" valor={`− ${formatEuros(r.fondo.impuesto)}`} negativo />
        <Resumen etiqueta="Total neto" valor={formatEuros(r.fondo.neto)} destacado />
        <hr className="my-1 border-border" />
        <Resumen
          etiqueta={r.diferencia >= 0 ? 'Ventaja del plan de pensiones' : 'Ventaja del fondo indexado'}
          valor={formatEuros(Math.abs(r.diferencia))}
          destacado
        />
        <NotaCalculo>
          Compara aportar cada año la misma cantidad a un producto o al otro: lo que el plan de
          pensiones te ahorra de impuestos cada año se invierte también en el fondo indexado, para
          que el esfuerzo de ahorro sea el mismo en los dos casos. El fondo indexado, además, lo
          puedes vender cuando quieras; el plan de pensiones solo se puede rescatar en jubilación u
          otros supuestos legales (paro de larga duración, enfermedad grave, entre otros). No es una
          recomendación de inversión.
        </NotaCalculo>
      </PanelResultados>
    </div>
  );
}
