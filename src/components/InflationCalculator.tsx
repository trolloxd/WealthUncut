import { useMemo, useState } from 'react';
import { IRPF_AHORRO_BRACKETS } from '../config/finance';
import { CampoNumero, NotaCalculo, PanelResultados, Resumen, formatEuros, formatPct } from './CalculatorUI';

// Los intereses tributan cada año en la base del ahorro; para los importes habituales de una
// cuenta remunerada, en el primer tramo.
const TIPO_INTERESES = IRPF_AHORRO_BRACKETS[0].tipo;

export function poderAdquisitivo(p: { importe: number; anios: number; inflacion: number; interesBruto: number }) {
  const interesNeto = (p.interesBruto / 100) * (1 - TIPO_INTERESES);
  const nominal = p.importe * Math.pow(1 + interesNeto, p.anios);
  const deflactor = Math.pow(1 + p.inflacion / 100, p.anios);
  const real = nominal / deflactor;
  const rentabilidadReal = (1 + interesNeto) / (1 + p.inflacion / 100) - 1;
  const interesBrutoParaNoPerder = p.inflacion / 100 / (1 - TIPO_INTERESES);
  return { nominal, real, perdida: p.importe - real, rentabilidadReal, deflactor, interesBrutoParaNoPerder };
}

export default function InflationCalculator() {
  const [importe, setImporte] = useState(10000);
  const [anios, setAnios] = useState(10);
  const [inflacion, setInflacion] = useState(2);
  const [interesBruto, setInteresBruto] = useState(0);

  const r = useMemo(() => poderAdquisitivo({ importe, anios, inflacion, interesBruto }), [importe, anios, inflacion, interesBruto]);

  return (
    <div className="card not-prose grid gap-6 p-6 md:grid-cols-2">
      <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
        <CampoNumero label="Dinero que tienes hoy (€)" value={importe} onChange={setImporte} />
        <CampoNumero label="Años" value={anios} onChange={setAnios} min={1} max={60} />
        <CampoNumero
          label="Inflación media anual (%)"
          value={inflacion}
          onChange={setInflacion}
          min={-5}
          step={0.1}
          ayuda="El objetivo del BCE es el 2%. En España fue del 3,1%, 2,8% y 2,9% en 2023, 2024 y 2025 (INE)."
        />
        <CampoNumero
          label="Interés bruto que te da (%)"
          value={interesBruto}
          onChange={setInteresBruto}
          step={0.1}
          ayuda="0 si está en una cuenta corriente. El de tu cuenta remunerada o depósito si no."
        />
      </form>

      <PanelResultados>
        <Resumen etiqueta="Tendrás en la cuenta" valor={formatEuros(r.nominal)} />
        <Resumen etiqueta="Equivale en euros de hoy a" valor={formatEuros(r.real)} destacado />
        <Resumen
          etiqueta={r.perdida >= 0 ? 'Poder de compra que pierdes' : 'Poder de compra que ganas'}
          valor={formatEuros(Math.abs(r.perdida))}
          negativo={r.perdida > 0}
        />
        <Resumen etiqueta="Rentabilidad real anual" valor={formatPct(r.rentabilidadReal, 2)} negativo={r.rentabilidadReal < 0} />
        <hr className="my-1 border-border" />
        <Resumen etiqueta={`Lo que hoy cuesta ${formatEuros(importe)} costará`} valor={formatEuros(importe * r.deflactor)} />
        <Resumen etiqueta="Interés bruto mínimo para no perder" valor={formatPct(r.interesBrutoParaNoPerder, 2)} />
        <NotaCalculo>
          Supone una inflación constante y que los intereses se reinvierten tras pagar un{' '}
          {formatPct(TIPO_INTERESES, 0)} de impuestos cada año (primer tramo del IRPF del ahorro). No
          es una previsión.
        </NotaCalculo>
      </PanelResultados>
    </div>
  );
}
