import { useMemo, useState } from 'react';
import { GASTOS_NOTARIA_REGISTRO_GESTORIA_PCT, ITP_VIVIENDA_USADA, calcularITP } from '../config/finance';
import { Campo, CampoNumero, NotaCalculo, PanelResultados, Resumen, formatEuros, formatPct } from './CalculatorUI';

export type ComunidadItpId = keyof typeof ITP_VIVIENDA_USADA;

export interface ParamsEntradaPiso {
  precioVivienda: number;
  porcentajeEntrada: number; // % que no financia el banco
  comunidad: ComunidadItpId;
  ahorroActual: number;
  ahorroMensual: number;
}

export interface ResultadoEntradaPiso {
  entrada: number;
  itp: number;
  gastos: number;
  totalNecesario: number;
  faltante: number;
  meses: number;
}

export function calcularEntradaPiso(p: ParamsEntradaPiso): ResultadoEntradaPiso {
  const entrada = p.precioVivienda * (p.porcentajeEntrada / 100);
  const itp = calcularITP(p.precioVivienda, p.comunidad);
  const gastos = p.precioVivienda * GASTOS_NOTARIA_REGISTRO_GESTORIA_PCT;
  const totalNecesario = entrada + itp + gastos;
  const faltante = Math.max(0, totalNecesario - p.ahorroActual);
  const meses = p.ahorroMensual > 0 ? Math.ceil(faltante / p.ahorroMensual) : Infinity;
  return { entrada, itp, gastos, totalNecesario, faltante, meses };
}

const COMUNIDADES = Object.entries(ITP_VIVIENDA_USADA)
  .map(([id, c]) => ({ id: id as ComunidadItpId, nombre: c.nombre }))
  .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

function formatMeses(meses: number): string {
  if (!Number.isFinite(meses)) return 'nunca, con 0 € de ahorro mensual';
  if (meses <= 0) return 'ya lo tienes ahorrado';
  const anios = Math.floor(meses / 12);
  const resto = meses % 12;
  const partes = [];
  if (anios > 0) partes.push(`${anios} ${anios === 1 ? 'año' : 'años'}`);
  if (resto > 0) partes.push(`${resto} ${resto === 1 ? 'mes' : 'meses'}`);
  return partes.join(' y ');
}

export default function HomeDepositCalculator() {
  const [precioVivienda, setPrecioVivienda] = useState(180000);
  const [porcentajeEntrada, setPorcentajeEntrada] = useState(20);
  const [comunidad, setComunidad] = useState<ComunidadItpId>('madrid');
  const [ahorroActual, setAhorroActual] = useState(5000);
  const [ahorroMensual, setAhorroMensual] = useState(300);

  const r = useMemo(
    () => calcularEntradaPiso({ precioVivienda, porcentajeEntrada, comunidad, ahorroActual, ahorroMensual }),
    [precioVivienda, porcentajeEntrada, comunidad, ahorroActual, ahorroMensual]
  );

  return (
    <div className="card not-prose grid gap-6 p-6 md:grid-cols-2">
      <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
        <CampoNumero label="Precio de la vivienda (€)" value={precioVivienda} onChange={setPrecioVivienda} step={1000} />
        <CampoNumero
          label="Entrada (% que no te financia el banco)"
          value={porcentajeEntrada}
          onChange={setPorcentajeEntrada}
          min={0}
          max={100}
          ayuda="Lo habitual es que los bancos financien hasta el 80% del precio (o de tasación, la que sea menor)."
        />
        <Campo label="Comunidad autónoma">
          <select value={comunidad} onChange={(e) => setComunidad(e.target.value as ComunidadItpId)} className="campo-input">
            {COMUNIDADES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <div className="grid grid-cols-2 gap-3">
          <CampoNumero label="Ahorro actual (€)" value={ahorroActual} onChange={setAhorroActual} step={500} />
          <CampoNumero label="Ahorro mensual (€)" value={ahorroMensual} onChange={setAhorroMensual} step={50} />
        </div>
      </form>

      <PanelResultados>
        <Resumen etiqueta="Entrada" valor={formatEuros(r.entrada)} />
        <Resumen etiqueta="ITP (impuesto de compra, tipo general)" valor={formatEuros(r.itp)} />
        <Resumen etiqueta="Notaría, registro y gestoría (estimado)" valor={formatEuros(r.gastos)} />
        <hr className="my-1 border-border" />
        <Resumen etiqueta="Total que necesitas ahorrado" valor={formatEuros(r.totalNecesario)} destacado />
        <Resumen etiqueta="Te falta" valor={formatEuros(r.faltante)} negativo={r.faltante > 0} />
        <Resumen etiqueta="Tiempo para conseguirlo" valor={formatMeses(r.meses)} destacado />
        <NotaCalculo>
          El ITP es el tipo general de la comunidad, sin las bonificaciones para vivienda habitual,
          jóvenes, familia numerosa o discapacidad que casi todas ofrecen y que pueden bajarlo
          bastante: comprueba si cumples los requisitos de tu comunidad antes de dar el ITP de aquí
          por definitivo. Notaría, registro y gestoría son una estimación orientativa, no una tarifa
          oficial: el importe real depende del precio, de si hay hipoteca y de cada caso. Vivienda
          nueva no lleva ITP, sino IVA y AJD, no calculados aquí.
        </NotaCalculo>
      </PanelResultados>
    </div>
  );
}
