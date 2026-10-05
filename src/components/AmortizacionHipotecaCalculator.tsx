import { useMemo } from 'react';
import { COMISION_AMORTIZACION_ANTICIPADA as COM } from '../config/finance';
import { CampoNumero, NotaCalculo, PanelResultados, Resumen, formatEuros, useEstadoUrl } from './CalculatorUI';

interface Props {
  euriborInicial: number;
}

export interface ResultadoAmortizacion {
  cuotaActual: number;
  interesesRestantes: number;
  comision: number;
  capitalNuevo: number;
  total: boolean;
  reducirPlazo: { mesesNuevos: number; mesesAhorrados: number; interesesAhorrados: number; ahorroNeto: number };
  reducirCuota: { cuotaNueva: number; ahorroMensual: number; interesesAhorrados: number; ahorroNeto: number };
}

function cuotaFrancesa(capital: number, rMensual: number, meses: number): number {
  if (capital <= 0 || meses <= 0) return 0;
  if (rMensual === 0) return capital / meses;
  return (capital * rMensual) / (1 - Math.pow(1 + rMensual, -meses));
}

export function calcularAmortizacion(p: {
  capital: number;
  tipoAnual: number;
  anios: number;
  extra: number;
  comisionPct: number;
}): ResultadoAmortizacion {
  const meses = Math.max(1, Math.round(p.anios * 12));
  const r = p.tipoAnual / 100 / 12;
  const extra = Math.min(Math.max(0, p.extra), p.capital);
  const capitalNuevo = p.capital - extra;
  const total = extra >= p.capital && p.capital > 0;
  const comision = extra * (p.comisionPct / 100);

  const cuotaActual = cuotaFrancesa(p.capital, r, meses);
  const interesesRestantes = cuotaActual * meses - p.capital;

  // Mismo importe de cuota, menos meses.
  let mesesNuevos = 0;
  if (capitalNuevo > 0) {
    if (r === 0) mesesNuevos = Math.ceil(capitalNuevo / cuotaActual);
    else {
      const x = 1 - (capitalNuevo * r) / cuotaActual;
      mesesNuevos = x > 0 ? Math.ceil(-Math.log(x) / Math.log(1 + r)) : meses;
    }
  }
  mesesNuevos = Math.min(meses, mesesNuevos);
  // El último pago es menor que una cuota entera: intereses = pagos totales - capital.
  const pagosPlazo = capitalNuevo > 0 ? ((): number => {
    if (r === 0) return capitalNuevo;
    const saldoTrasN1 = capitalNuevo * Math.pow(1 + r, mesesNuevos - 1) - cuotaActual * ((Math.pow(1 + r, mesesNuevos - 1) - 1) / r);
    return cuotaActual * (mesesNuevos - 1) + saldoTrasN1 * (1 + r);
  })() : 0;
  const interesesPlazo = Math.max(0, pagosPlazo - capitalNuevo);
  const ahorroInteresesPlazo = interesesRestantes - interesesPlazo;

  // Mismo plazo, cuota menor.
  const cuotaNueva = cuotaFrancesa(capitalNuevo, r, meses);
  const interesesCuota = Math.max(0, cuotaNueva * meses - capitalNuevo);
  const ahorroInteresesCuota = interesesRestantes - interesesCuota;

  return {
    cuotaActual,
    interesesRestantes,
    comision,
    capitalNuevo,
    total,
    reducirPlazo: {
      mesesNuevos,
      mesesAhorrados: meses - mesesNuevos,
      interesesAhorrados: ahorroInteresesPlazo,
      ahorroNeto: ahorroInteresesPlazo - comision,
    },
    reducirCuota: {
      cuotaNueva,
      ahorroMensual: cuotaActual - cuotaNueva,
      interesesAhorrados: ahorroInteresesCuota,
      ahorroNeto: ahorroInteresesCuota - comision,
    },
  };
}

function formatPlazo(meses: number): string {
  if (meses <= 0) return 'hipoteca cancelada';
  const a = Math.floor(meses / 12);
  const m = meses % 12;
  const partes: string[] = [];
  if (a > 0) partes.push(`${a} ${a === 1 ? 'año' : 'años'}`);
  if (m > 0) partes.push(`${m} ${m === 1 ? 'mes' : 'meses'}`);
  return partes.join(' y ');
}

const pct = (v: number) => `${v.toLocaleString('es-ES')}%`;

export default function AmortizacionHipotecaCalculator({ euriborInicial }: Props) {
  const [capital, setCapital] = useEstadoUrl<number>('capital', 150000);
  const [tipoAnual, setTipoAnual] = useEstadoUrl<number>('tipo', Number((euriborInicial + 0.6).toFixed(2)));
  const [anios, setAnios] = useEstadoUrl<number>('anios', 25, { max: 50 });
  const [extra, setExtra] = useEstadoUrl<number>('extra', 20000);
  const [comisionPct, setComisionPct] = useEstadoUrl<number>('comision', 0);

  const r = useMemo(
    () => calcularAmortizacion({ capital, tipoAnual, anios, extra, comisionPct }),
    [capital, tipoAnual, anios, extra, comisionPct]
  );

  return (
    <div className="card not-prose grid gap-6 p-6 md:grid-cols-2">
      <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
        <CampoNumero label="Capital pendiente de la hipoteca (€)" value={capital} onChange={setCapital} step={1000} />
        <div className="grid grid-cols-2 gap-3">
          <CampoNumero
            label="Interés anual actual (%)"
            value={tipoAnual}
            onChange={setTipoAnual}
            step={0.05}
            ayuda={`Por defecto, euríbor actual (${euriborInicial.toLocaleString('es-ES', { maximumFractionDigits: 2 })}%) más 0,6 de diferencial. Pon el tuyo.`}
          />
          <CampoNumero label="Años que te quedan" value={anios} onChange={setAnios} min={1} max={50} />
        </div>
        <CampoNumero label="Importe que quieres amortizar ahora (€)" value={extra} onChange={setExtra} step={1000} />
        <CampoNumero
          label="Comisión por amortizar (% del capital que amortizas)"
          value={comisionPct}
          onChange={setComisionPct}
          step={0.05}
          ayuda={`Límites legales máximos (Ley 5/2019): variable ${pct(COM.variable.opcionCincoAnios.limitePct)} los ${COM.variable.opcionCincoAnios.anios} primeros años o ${pct(COM.variable.opcionTresAnios.limitePct)} los ${COM.variable.opcionTresAnios.anios} primeros (según tu contrato); fijo ${pct(COM.fijo.limitePrimerosPct)} los ${COM.fijo.primerosAnios} primeros años y ${pct(COM.fijo.limiteDespuesPct)} después. Muchos contratos no cobran nada: mira el tuyo.`}
        />
      </form>

      <PanelResultados>
        <Resumen etiqueta="Cuota mensual actual" valor={formatEuros(r.cuotaActual)} />
        <Resumen etiqueta="Intereses que te quedan por pagar" valor={formatEuros(r.interesesRestantes)} />
        {r.comision > 0 && <Resumen etiqueta="Comisión por amortizar" valor={`− ${formatEuros(r.comision)}`} negativo />}
        <hr className="my-1 border-border" />
        {r.total ? (
          <Resumen etiqueta="Cancelas la hipoteca: intereses que te ahorras" valor={formatEuros(r.interesesRestantes - r.comision)} destacado />
        ) : (
          <>
            <p className="text-sm font-semibold text-ink">Si reduces el plazo (misma cuota)</p>
            <Resumen etiqueta="Nuevo plazo" valor={formatPlazo(r.reducirPlazo.mesesNuevos)} />
            <Resumen etiqueta="Te ahorras" valor={formatPlazo(r.reducirPlazo.mesesAhorrados)} />
            <Resumen etiqueta="Ahorro de intereses, tras comisión" valor={formatEuros(r.reducirPlazo.ahorroNeto)} destacado />
            <hr className="my-1 border-border" />
            <p className="text-sm font-semibold text-ink">Si reduces la cuota (mismo plazo)</p>
            <Resumen etiqueta="Nueva cuota" valor={formatEuros(r.reducirCuota.cuotaNueva)} />
            <Resumen etiqueta="Menos cada mes" valor={formatEuros(r.reducirCuota.ahorroMensual)} />
            <Resumen etiqueta="Ahorro de intereses, tras comisión" valor={formatEuros(r.reducirCuota.ahorroNeto)} destacado />
          </>
        )}
        <NotaCalculo>
          Cálculo con cuota constante (sistema francés), tipo fijo para lo que queda de préstamo y
          amortización hoy. Si tu hipoteca es variable, el ahorro real dependerá de cómo evolucione el
          euríbor. No incluye seguros vinculados ni el coste de oportunidad de lo que dejas de
          invertir o de tener como colchón. Es información orientativa, no una recomendación sobre
          qué hacer con tu dinero.
        </NotaCalculo>
      </PanelResultados>
    </div>
  );
}
