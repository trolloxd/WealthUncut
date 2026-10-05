import { useMemo } from 'react';
import { DIVIDENDOS, calcularImpuestoAhorro } from '../config/finance';
import { CampoNumero, NotaCalculo, PanelResultados, Resumen, formatEuros, formatPct, useEstadoUrl } from './CalculatorUI';

export interface ParamsDividendos {
  dividendosEspana: number; // brutos, de empresas españolas
  dividendosExtranjero: number; // brutos, antes de la retención del país de origen
  retencionOrigenPct: number; // % que retiene el país de origen sobre los dividendos extranjeros
  otrasRentasAhorro: number; // otros intereses y ganancias netas del año en la base del ahorro
}

export interface ResultadoDividendos {
  dividendosBrutos: number;
  impuestoDividendos: number; // cuota del ahorro atribuible a los dividendos, antes de deducciones
  tipoMedioAhorro: number; // cuota total del ahorro / base total del ahorro
  retencionEspana: number;
  retencionOrigen: number;
  deduccionDobleImposicion: number;
  aPagarOaDevolver: number; // por los dividendos, en la declaración (positivo = pagar)
  netoFinal: number;
}

/** Impuesto de los dividendos integrados en la base del ahorro, con retención y doble imposición. */
export function calcularDividendos(p: ParamsDividendos): ResultadoDividendos {
  const dEs = Math.max(0, p.dividendosEspana);
  const dExt = Math.max(0, p.dividendosExtranjero);
  const otras = Math.max(0, p.otrasRentasAhorro);
  const brutos = dEs + dExt;
  const baseTotal = brutos + otras;

  const cuotaTotal = calcularImpuestoAhorro(baseTotal);
  const impuestoDividendos = cuotaTotal - calcularImpuestoAhorro(otras);
  const tipoMedioAhorro = baseTotal > 0 ? cuotaTotal / baseTotal : 0;

  const retencionEspana = dEs * DIVIDENDOS.retencionEspana;
  const retencionOrigen = dExt * (Math.max(0, p.retencionOrigenPct) / 100);
  // Límite: la menor de lo pagado fuera y lo que en España correspondería por esa renta.
  const limiteEspana = dExt * tipoMedioAhorro;
  const deduccionDobleImposicion = Math.min(retencionOrigen, limiteEspana);

  const aPagarOaDevolver = impuestoDividendos - deduccionDobleImposicion - retencionEspana;
  const netoFinal = brutos - retencionOrigen - retencionEspana - Math.max(aPagarOaDevolver, 0) + Math.max(-aPagarOaDevolver, 0);
  return {
    dividendosBrutos: brutos,
    impuestoDividendos,
    tipoMedioAhorro,
    retencionEspana,
    retencionOrigen,
    deduccionDobleImposicion,
    aPagarOaDevolver,
    netoFinal,
  };
}

export default function DividendTaxCalculator() {
  const [dividendosEspana, setDividendosEspana] = useEstadoUrl<number>('es', 1000);
  const [dividendosExtranjero, setDividendosExtranjero] = useEstadoUrl<number>('ext', 0);
  const [retencionOrigenPct, setRetencionOrigenPct] = useEstadoUrl<number>('orig', 15, { max: 100 });
  const [otrasRentasAhorro, setOtrasRentasAhorro] = useEstadoUrl<number>('otras', 0);

  const r = useMemo(
    () => calcularDividendos({ dividendosEspana, dividendosExtranjero, retencionOrigenPct, otrasRentasAhorro }),
    [dividendosEspana, dividendosExtranjero, retencionOrigenPct, otrasRentasAhorro]
  );

  return (
    <div className="card not-prose grid gap-6 p-6 md:grid-cols-2">
      <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
        <CampoNumero
          label="Dividendos brutos de empresas españolas (€/año)"
          value={dividendosEspana}
          onChange={setDividendosEspana}
          step={100}
          ayuda={`Antes de la retención. Quien los paga retiene el ${DIVIDENDOS.retencionEspana * 100}% a cuenta.`}
        />
        <CampoNumero
          label="Dividendos brutos extranjeros (€/año)"
          value={dividendosExtranjero}
          onChange={setDividendosExtranjero}
          step={100}
          ayuda="Antes de la retención del país de origen."
        />
        <CampoNumero
          label="Retención del país de origen (%)"
          value={retencionOrigenPct}
          onChange={setRetencionOrigenPct}
          min={0}
          max={100}
          step={0.5}
          ayuda="Depende de cada país y del convenio con España: mira el extracto de tu bróker. Solo afecta a los dividendos extranjeros."
        />
        <CampoNumero
          label="Otras rentas del ahorro del año (€)"
          value={otrasRentasAhorro}
          onChange={setOtrasRentasAhorro}
          step={100}
          ayuda="Intereses de cuentas y depósitos y ganancias netas por vender fondos o acciones. Hacen que los dividendos caigan en un tramo más alto."
        />
      </form>

      <PanelResultados>
        <Resumen etiqueta="Dividendos brutos" valor={formatEuros(r.dividendosBrutos)} />
        <Resumen etiqueta="IRPF del ahorro por los dividendos" valor={formatEuros(r.impuestoDividendos)} negativo />
        <Resumen etiqueta="Tipo medio del ahorro" valor={formatPct(r.tipoMedioAhorro, 1)} />
        <Resumen etiqueta="Retención en España (ya pagada)" valor={formatEuros(r.retencionEspana)} />
        <Resumen etiqueta="Retención del país de origen" valor={formatEuros(r.retencionOrigen)} />
        <Resumen etiqueta="Deducción por doble imposición" valor={formatEuros(r.deduccionDobleImposicion)} />
        <hr className="my-1 border-border" />
        <Resumen
          etiqueta={r.aPagarOaDevolver >= 0 ? 'A pagar en la renta por los dividendos' : 'A devolver en la renta'}
          valor={formatEuros(Math.abs(r.aPagarOaDevolver))}
          negativo={r.aPagarOaDevolver > 0}
        />
        <Resumen etiqueta="Te quedan netos" valor={formatEuros(r.netoFinal)} destacado />
        <NotaCalculo>
          Supone que los dividendos tributan en la base del ahorro junto con las otras rentas que indiques,
          con los tramos de la tabla de abajo, y que no tienes pérdidas que compensar. La deducción por
          doble imposición es la menor de lo retenido fuera y lo que en España correspondería por esa
          renta. No incluye casos especiales (cuentas en el extranjero sin retención, fondos o ETF de
          distribución con otras reglas, ni comunidades con deducciones propias).
        </NotaCalculo>
      </PanelResultados>
    </div>
  );
}
