import { useMemo } from 'react';
import { GASTOS_NOTARIA_REGISTRO_GESTORIA_PCT, ITP_VIVIENDA_USADA, calcularITP, calcularImpuestoAhorro } from '../config/finance';
import { Campo, CampoNumero, NotaCalculo, PanelResultados, Resumen, formatEuros, useEstadoUrl } from './CalculatorUI';

type ComunidadItpId = keyof typeof ITP_VIVIENDA_USADA;

interface Props {
  euriborInicial: number;
}

export interface ParamsAlquilerVsCompra {
  precio: number;
  entradaPct: number;
  comunidad: ComunidadItpId;
  tipoHipoteca: number;
  plazoHipoteca: number;
  mantenimientoPct: number;
  revalorizacionPct: number;
  costesVentaPct: number;
  alquilerMensual: number;
  subidaAlquilerPct: number;
  rentabilidadInversionPct: number;
  horizonte: number;
}

export interface ResultadoAlquilerVsCompra {
  desembolsoInicial: number;
  cuotaHipoteca: number;
  patrimonioComprar: number;
  patrimonioAlquilar: number;
  diferencia: number;
  anioEquilibrio: number | null;
}

const mensual = (anualPct: number) => Math.pow(1 + anualPct / 100, 1 / 12) - 1;

function patrimonioNeto(cartera: number, aportado: number): number {
  return cartera - calcularImpuestoAhorro(Math.max(0, cartera - aportado));
}

export function simularAlquilerVsCompra(p: ParamsAlquilerVsCompra): ResultadoAlquilerVsCompra {
  const meses = Math.max(1, Math.round(p.horizonte * 12));
  const plazo = Math.max(1, Math.round(p.plazoHipoteca * 12));
  const entrada = p.precio * (p.entradaPct / 100);
  const gastosCompra = calcularITP(p.precio, p.comunidad) + p.precio * GASTOS_NOTARIA_REGISTRO_GESTORIA_PCT;
  const desembolsoInicial = entrada + gastosCompra;

  const prestamo = p.precio - entrada;
  const rH = p.tipoHipoteca / 100 / 12;
  const cuota = prestamo <= 0 ? 0 : rH === 0 ? prestamo / plazo : (prestamo * rH) / (1 - Math.pow(1 + rH, -plazo));

  const gVivienda = mensual(p.revalorizacionPct);
  const gInversion = mensual(p.rentabilidadInversionPct);

  let saldo = prestamo;
  let valor = p.precio;
  let carteraCompra = 0;
  let aportadoCompra = 0;
  let carteraAlquiler = desembolsoInicial;
  let aportadoAlquiler = desembolsoInicial;
  let anioEquilibrio: number | null = null;

  for (let m = 1; m <= meses; m++) {
    let pagoCuota = 0;
    if (m <= plazo && saldo > 0) {
      const interes = saldo * rH;
      pagoCuota = cuota;
      saldo = Math.max(0, saldo + interes - cuota);
    }
    const costeComprar = pagoCuota + (valor * p.mantenimientoPct) / 1200;
    const alquiler = p.alquilerMensual * Math.pow(1 + p.subidaAlquilerPct / 100, Math.floor((m - 1) / 12));
    const presupuesto = Math.max(costeComprar, alquiler);

    carteraCompra = carteraCompra * (1 + gInversion) + (presupuesto - costeComprar);
    aportadoCompra += presupuesto - costeComprar;
    carteraAlquiler = carteraAlquiler * (1 + gInversion) + (presupuesto - alquiler);
    aportadoAlquiler += presupuesto - alquiler;
    valor *= 1 + gVivienda;

    if (m % 12 === 0 && anioEquilibrio === null) {
      const comprar = valor * (1 - p.costesVentaPct / 100) - saldo + patrimonioNeto(carteraCompra, aportadoCompra);
      const alquilar = patrimonioNeto(carteraAlquiler, aportadoAlquiler);
      if (comprar > alquilar) anioEquilibrio = m / 12;
    }
  }

  const patrimonioComprar = valor * (1 - p.costesVentaPct / 100) - saldo + patrimonioNeto(carteraCompra, aportadoCompra);
  const patrimonioAlquilar = patrimonioNeto(carteraAlquiler, aportadoAlquiler);

  return {
    desembolsoInicial,
    cuotaHipoteca: cuota,
    patrimonioComprar,
    patrimonioAlquilar,
    diferencia: patrimonioComprar - patrimonioAlquilar,
    anioEquilibrio,
  };
}

const COMUNIDADES = Object.entries(ITP_VIVIENDA_USADA)
  .map(([id, c]) => ({ id: id as ComunidadItpId, nombre: c.nombre }))
  .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

export default function AlquilerVsCompraCalculator({ euriborInicial }: Props) {
  const [precio, setPrecio] = useEstadoUrl<number>('precio', 200000);
  const [entradaPct, setEntradaPct] = useEstadoUrl<number>('entrada', 20);
  const [comunidad, setComunidad] = useEstadoUrl<ComunidadItpId>('comunidad', 'madrid', { validar: (v) => v in ITP_VIVIENDA_USADA });
  const [tipoHipoteca, setTipoHipoteca] = useEstadoUrl<number>('tipo', Number((euriborInicial + 0.6).toFixed(2)));
  const [plazoHipoteca, setPlazoHipoteca] = useEstadoUrl<number>('plazo', 30, { max: 50 });
  const [mantenimientoPct, setMantenimientoPct] = useEstadoUrl<number>('mantenimiento', 1);
  const [revalorizacionPct, setRevalorizacionPct] = useEstadoUrl<number>('revaloriza', 2);
  const [costesVentaPct, setCostesVentaPct] = useEstadoUrl<number>('costesVenta', 3);
  const [alquilerMensual, setAlquilerMensual] = useEstadoUrl<number>('alquiler', 700);
  const [subidaAlquilerPct, setSubidaAlquilerPct] = useEstadoUrl<number>('subidaAlquiler', 2);
  const [rentabilidadInversionPct, setRentabilidadInversionPct] = useEstadoUrl<number>('rentabilidad', 5);
  const [horizonte, setHorizonte] = useEstadoUrl<number>('anios', 15, { max: 50 });

  const r = useMemo(
    () =>
      simularAlquilerVsCompra({
        precio, entradaPct, comunidad, tipoHipoteca, plazoHipoteca, mantenimientoPct, revalorizacionPct,
        costesVentaPct, alquilerMensual, subidaAlquilerPct, rentabilidadInversionPct, horizonte,
      }),
    [precio, entradaPct, comunidad, tipoHipoteca, plazoHipoteca, mantenimientoPct, revalorizacionPct, costesVentaPct, alquilerMensual, subidaAlquilerPct, rentabilidadInversionPct, horizonte]
  );

  const gana = r.diferencia > 0 ? 'comprar' : 'alquilar';

  return (
    <div className="card not-prose grid gap-6 p-6 lg:grid-cols-2">
      <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
        <p className="text-sm font-semibold text-ink">Si compras</p>
        <div className="grid grid-cols-2 gap-3">
          <CampoNumero label="Precio de la vivienda (€)" value={precio} onChange={setPrecio} step={5000} />
          <CampoNumero label="Entrada (%)" value={entradaPct} onChange={setEntradaPct} min={0} max={100} />
        </div>
        <Campo label="Comunidad autónoma (para el ITP)">
          <select value={comunidad} onChange={(e) => setComunidad(e.target.value as ComunidadItpId)} className="campo-input">
            {COMUNIDADES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <div className="grid grid-cols-2 gap-3">
          <CampoNumero
            label="Interés de la hipoteca (%)"
            value={tipoHipoteca}
            onChange={setTipoHipoteca}
            step={0.05}
            ayuda={`Por defecto, euríbor actual (${euriborInicial.toLocaleString('es-ES', { maximumFractionDigits: 2 })}%) más 0,6.`}
          />
          <CampoNumero label="Plazo (años)" value={plazoHipoteca} onChange={setPlazoHipoteca} min={1} max={50} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <CampoNumero label="Mantenimiento al año (%)" value={mantenimientoPct} onChange={setMantenimientoPct} step={0.1} ayuda="IBI, comunidad, seguro, reparaciones." />
          <CampoNumero label="Revalorización anual (%)" value={revalorizacionPct} onChange={setRevalorizacionPct} step={0.5} />
          <CampoNumero label="Costes al vender (%)" value={costesVentaPct} onChange={setCostesVentaPct} step={0.5} />
        </div>

        <p className="mt-2 text-sm font-semibold text-ink">Si alquilas</p>
        <div className="grid grid-cols-2 gap-3">
          <CampoNumero label="Alquiler mensual (€)" value={alquilerMensual} onChange={setAlquilerMensual} step={50} />
          <CampoNumero label="Subida anual del alquiler (%)" value={subidaAlquilerPct} onChange={setSubidaAlquilerPct} step={0.5} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <CampoNumero
            label="Rentabilidad bruta de invertir (%)"
            value={rentabilidadInversionPct}
            onChange={setRentabilidadInversionPct}
            step={0.5}
            ayuda="Lo que podría rendir lo que no gastas en comprar."
          />
          <CampoNumero label="Horizonte (años)" value={horizonte} onChange={setHorizonte} min={1} max={50} />
        </div>
      </form>

      <PanelResultados>
        <Resumen etiqueta="Desembolso inicial al comprar (entrada, ITP y gastos)" valor={formatEuros(r.desembolsoInicial)} />
        <Resumen etiqueta="Cuota mensual de la hipoteca" valor={formatEuros(r.cuotaHipoteca)} />
        <hr className="my-1 border-border" />
        <Resumen etiqueta={`Tu patrimonio a ${horizonte} años comprando`} valor={formatEuros(r.patrimonioComprar)} />
        <Resumen etiqueta={`Tu patrimonio a ${horizonte} años alquilando e invirtiendo`} valor={formatEuros(r.patrimonioAlquilar)} />
        <hr className="my-1 border-border" />
        <Resumen
          etiqueta={`Con estos supuestos sale mejor ${gana}`}
          valor={`${r.diferencia > 0 ? '+' : '−'} ${formatEuros(Math.abs(r.diferencia))}`}
          destacado
        />
        <p className="text-sm text-ink-muted">
          {r.anioEquilibrio === null
            ? `En ${horizonte} años comprar no llega a compensar con estos supuestos.`
            : `Comprar empieza a compensar a partir del año ${r.anioEquilibrio}.`}
        </p>
        <NotaCalculo>
          En ambos casos se gasta lo mismo cada mes: quien paga menos (la cuota más el mantenimiento, o
          el alquiler) invierte la diferencia, y quien alquila empieza invirtiendo también la entrada y
          los gastos de compra. La inversión paga el IRPF del ahorro sobre la ganancia al final. No
          incluye impuestos sobre la venta de la vivienda, bonificaciones fiscales ni seguros
          vinculados a la hipoteca, y supone rentabilidades constantes, cuando en la realidad suben y
          bajan. El resultado depende mucho de la revalorización y de la rentabilidad que supongas:
          prueba varios escenarios. Es información orientativa, no una recomendación.
        </NotaCalculo>
      </PanelResultados>
    </div>
  );
}
