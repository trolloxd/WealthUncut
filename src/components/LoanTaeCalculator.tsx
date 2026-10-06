import { useMemo } from 'react';
import { calcularImpuestoAhorro } from '../config/finance';
import { Campo, CampoNumero, NotaCalculo, PanelResultados, Resumen, formatEuros, formatPct, useEstadoUrl } from './CalculatorUI';

export interface ParamsPrestamo {
  importe: number;
  meses: number;
  tinPct: number;
  comisionAperturaPct: number;
  gastoMensual: number; // seguro u otros cobros mensuales ligados al préstamo
}

function cuotaFrancesa(capital: number, tinMensual: number, meses: number): number {
  if (capital <= 0 || meses <= 0) return 0;
  if (tinMensual === 0) return capital / meses;
  return (capital * tinMensual) / (1 - Math.pow(1 + tinMensual, -meses));
}

/** TAE por bisección: tipo mensual que iguala lo recibido con lo pagado, llevado a un año. */
function taeDeFlujos(recibido: number, pagoMensual: number, meses: number): number {
  if (recibido <= 0 || meses <= 0 || pagoMensual * meses <= recibido) return 0;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    const vp = (pagoMensual * (1 - Math.pow(1 + mid, -meses))) / mid;
    if (vp > recibido) lo = mid;
    else hi = mid;
  }
  const i = (lo + hi) / 2;
  return Math.pow(1 + i, 12) - 1;
}

export function calcularPrestamo(p: ParamsPrestamo) {
  const r = p.tinPct / 100 / 12;
  const cuota = cuotaFrancesa(p.importe, r, p.meses);
  const comision = p.importe * (p.comisionAperturaPct / 100);
  const pagoMensual = cuota + p.gastoMensual;
  const totalPagado = pagoMensual * p.meses + comision;
  const intereses = cuota * p.meses - p.importe;
  return {
    cuota,
    comision,
    intereses,
    costeTotal: totalPagado - p.importe,
    totalPagado,
    tae: taeDeFlujos(p.importe - comision, pagoMensual, p.meses),
  };
}

export function taeDeDeposito(tinPct: number, pagosAlAnio: number): number {
  if (pagosAlAnio <= 0) return tinPct / 100;
  return Math.pow(1 + tinPct / 100 / pagosAlAnio, pagosAlAnio) - 1;
}

type Modo = 'prestamo' | 'deposito';

export default function LoanTaeCalculator() {
  const [modo, setModo] = useEstadoUrl<string>('modo', 'prestamo', { validar: (v) => v === 'prestamo' || v === 'deposito' });
  const [importe, setImporte] = useEstadoUrl<number>('importe', 10000, { max: 5_000_000 });
  const [meses, setMeses] = useEstadoUrl<number>('meses', 60, { max: 600 });
  const [tin, setTin] = useEstadoUrl<number>('tin', 7.5, { max: 60 });
  const [comision, setComision] = useEstadoUrl<number>('comision', 1, { max: 20 });
  const [gastoMensual, setGastoMensual] = useEstadoUrl<number>('gasto', 0, { max: 10000 });
  const [pagosAlAnio, setPagosAlAnio] = useEstadoUrl<number>('pagos', 12, { validar: (v) => [1, 2, 4, 12].includes(v) });

  const prestamo = useMemo(
    () => calcularPrestamo({ importe, meses, tinPct: tin, comisionAperturaPct: comision, gastoMensual }),
    [importe, meses, tin, comision, gastoMensual]
  );
  const taeDep = useMemo(() => taeDeDeposito(tin, pagosAlAnio), [tin, pagosAlAnio]);
  const interesDeposito = importe * (Math.pow(1 + taeDep, meses / 12) - 1);
  const impuestoDeposito = calcularImpuestoAhorro(interesDeposito);
  const esPrestamo = (modo as Modo) === 'prestamo';

  return (
    <div className="card not-prose grid gap-6 p-6 md:grid-cols-2">
      <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
        <div className="flex gap-2" role="group" aria-label="Qué quieres calcular">
          <button
            type="button"
            onClick={() => setModo('prestamo')}
            aria-pressed={esPrestamo}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${esPrestamo ? 'bg-brand text-white' : 'bg-cream text-ink-muted'}`}
          >
            Préstamo
          </button>
          <button
            type="button"
            onClick={() => setModo('deposito')}
            aria-pressed={!esPrestamo}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${!esPrestamo ? 'bg-brand text-white' : 'bg-cream text-ink-muted'}`}
          >
            Depósito o cuenta
          </button>
        </div>

        <CampoNumero label={esPrestamo ? 'Importe del préstamo (€)' : 'Dinero que ingresas (€)'} value={importe} onChange={setImporte} step={500} />
        <CampoNumero label={esPrestamo ? 'Plazo (meses)' : 'Plazo (meses)'} value={meses} onChange={setMeses} min={1} max={600} />
        <CampoNumero label="TIN (%)" value={tin} onChange={setTin} step={0.1} max={60} ayuda="Tipo de interés nominal anual, tal como lo anuncia el banco." />

        {esPrestamo ? (
          <>
            <CampoNumero label="Comisión de apertura (%)" value={comision} onChange={setComision} step={0.25} max={20} ayuda="Se cobra al principio y encarece la TAE." />
            <CampoNumero label="Seguro u otros cobros mensuales (€/mes)" value={gastoMensual} onChange={setGastoMensual} step={5} max={10000} ayuda="Si el banco te lo exige para dar el préstamo, cuenta en la TAE." />
          </>
        ) : (
          <Campo label="Cada cuánto se pagan los intereses" ayuda="Cuanto más a menudo, más pequeña es la ventaja del interés sobre interés.">
            <select value={pagosAlAnio} onChange={(e) => setPagosAlAnio(Number(e.target.value))} className="campo-input">
              <option value={12}>Cada mes</option>
              <option value={4}>Cada trimestre</option>
              <option value={2}>Cada semestre</option>
              <option value={1}>Una vez al año o al vencimiento</option>
            </select>
          </Campo>
        )}
      </form>

      <PanelResultados>
        {esPrestamo ? (
          <>
            <Resumen etiqueta="Cuota mensual del préstamo" valor={formatEuros(prestamo.cuota + gastoMensual)} destacado />
            <Resumen etiqueta="TAE real" valor={formatPct(prestamo.tae, 2)} destacado />
            <Resumen etiqueta="TIN anunciado" valor={formatPct(tin / 100, 2)} />
            <hr className="my-1 border-border" />
            <Resumen etiqueta="Intereses totales" valor={formatEuros(prestamo.intereses)} />
            <Resumen etiqueta="Comisión de apertura" valor={formatEuros(prestamo.comision)} />
            <Resumen etiqueta="Coste total del préstamo" valor={formatEuros(prestamo.costeTotal)} negativo />
            <Resumen etiqueta="Total que devuelves" valor={formatEuros(prestamo.totalPagado)} />
            <NotaCalculo>
              Amortización francesa (cuota constante). La TAE incluye intereses, comisión de apertura y el cobro mensual que indiques.
              Es una estimación: el banco debe darte la TAE oficial en su ficha de información precontractual.
            </NotaCalculo>
          </>
        ) : (
          <>
            <Resumen etiqueta="TAE" valor={formatPct(taeDep, 3)} destacado />
            <Resumen etiqueta="TIN" valor={formatPct(tin / 100, 3)} />
            <hr className="my-1 border-border" />
            <Resumen etiqueta={`Intereses brutos en ${meses} meses`} valor={formatEuros(interesDeposito)} />
            <Resumen etiqueta="IRPF del ahorro (estimado)" valor={formatEuros(impuestoDeposito)} negativo />
            <Resumen etiqueta="Intereses netos" valor={formatEuros(interesDeposito - impuestoDeposito)} destacado />
            <NotaCalculo>
              TAE = (1 + TIN / n)^n − 1, con n pagos al año. Los intereses tributan en la base del ahorro; aquí se calcula como si fueran
              tu única renta del ahorro del año. No incluye la retención adelantada ni otras rentas tuyas.
            </NotaCalculo>
          </>
        )}
      </PanelResultados>
    </div>
  );
}
