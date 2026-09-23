import { useMemo, useState } from 'react';
import { calcularImpuestoAhorro } from '../config/finance';
import { Campo, CampoNumero, NotaCalculo, PanelResultados, Resumen, formatEuros } from './CalculatorUI';

export interface ParamsComparador {
  aportacionMensual: number;
  anios: number;
  rentabilidadBruta: number; // % anual
  terFondo: number; // % anual
  terEtf: number; // % anual
  comisionCompraEtf: number; // € por operación
  comprasEtfAlAnio: number; // 12, 4, 2 o 1
  cambiosDeProducto: number; // veces que cambias de fondo/ETF durante el periodo
}

export interface ResultadoProducto {
  aportado: number;
  valorFinal: number;
  impuestosDuranteElCamino: number;
  impuestoFinal: number;
  comisionesCompra: number;
  neto: number;
}

const tasaMensual = (rentabilidad: number, ter: number) =>
  Math.pow(1 + Math.max(-0.99, rentabilidad / 100 - ter / 100), 1 / 12) - 1;

/**
 * Simulación mes a mes. Fondo: aporta cada mes sin comisión y cambia de producto con traspaso
 * (sin impuestos). ETF: acumula el dinero hasta cada compra (pagando la comisión por operación) y
 * cada cambio de producto es una venta que tributa por la ganancia acumulada en ese momento.
 * Al final se vende todo en los dos casos.
 */
export function comparar(p: ParamsComparador): { fondo: ResultadoProducto; etf: ResultadoProducto } {
  const meses = Math.max(0, Math.round(p.anios * 12));
  const rF = tasaMensual(p.rentabilidadBruta, p.terFondo);
  const rE = tasaMensual(p.rentabilidadBruta, p.terEtf);
  const cadaCuantosMeses = Math.max(1, Math.round(12 / Math.max(1, p.comprasEtfAlAnio)));
  const mesesDeCambio = new Set(
    Array.from({ length: p.cambiosDeProducto }, (_, i) => Math.round((meses * (i + 1)) / (p.cambiosDeProducto + 1)))
  );

  let fondo = 0;
  let costeFondo = 0;
  let etf = 0;
  let costeEtf = 0;
  let efectivoEtf = 0;
  let comisiones = 0;
  let impuestosCambios = 0;

  for (let m = 1; m <= meses; m++) {
    fondo = fondo * (1 + rF) + p.aportacionMensual;
    costeFondo += p.aportacionMensual;

    etf *= 1 + rE;
    efectivoEtf += p.aportacionMensual;
    if (m % cadaCuantosMeses === 0 && efectivoEtf > p.comisionCompraEtf) {
      comisiones += p.comisionCompraEtf;
      etf += efectivoEtf - p.comisionCompraEtf;
      costeEtf += efectivoEtf; // la comisión forma parte del coste de adquisición
      efectivoEtf = 0;
    }

    if (mesesDeCambio.has(m) && m < meses && etf > 0) {
      const impuesto = calcularImpuestoAhorro(etf - costeEtf);
      impuestosCambios += impuesto;
      const despuesDeImpuestos = etf - impuesto;
      comisiones += p.comisionCompraEtf;
      etf = Math.max(0, despuesDeImpuestos - p.comisionCompraEtf);
      costeEtf = despuesDeImpuestos;
    }
  }

  const aportado = p.aportacionMensual * meses;
  const impuestoFinalFondo = calcularImpuestoAhorro(fondo - costeFondo);
  const impuestoFinalEtf = calcularImpuestoAhorro(etf - costeEtf);

  return {
    fondo: {
      aportado,
      valorFinal: fondo,
      impuestosDuranteElCamino: 0,
      impuestoFinal: impuestoFinalFondo,
      comisionesCompra: 0,
      neto: fondo - impuestoFinalFondo,
    },
    etf: {
      aportado,
      valorFinal: etf + efectivoEtf,
      impuestosDuranteElCamino: impuestosCambios,
      impuestoFinal: impuestoFinalEtf,
      comisionesCompra: comisiones,
      neto: etf + efectivoEtf - impuestoFinalEtf,
    },
  };
}

export default function FundVsEtfCalculator() {
  const [aportacionMensual, setAportacionMensual] = useState(150);
  const [anios, setAnios] = useState(20);
  const [rentabilidadBruta, setRentabilidadBruta] = useState(7);
  const [terFondo, setTerFondo] = useState(0.2);
  const [terEtf, setTerEtf] = useState(0.2);
  const [comisionCompraEtf, setComisionCompraEtf] = useState(2);
  const [comprasEtfAlAnio, setComprasEtfAlAnio] = useState(12);
  const [cambiosDeProducto, setCambiosDeProducto] = useState(1);

  const { fondo, etf } = useMemo(
    () =>
      comparar({ aportacionMensual, anios, rentabilidadBruta, terFondo, terEtf, comisionCompraEtf, comprasEtfAlAnio, cambiosDeProducto }),
    [aportacionMensual, anios, rentabilidadBruta, terFondo, terEtf, comisionCompraEtf, comprasEtfAlAnio, cambiosDeProducto]
  );
  const diferencia = fondo.neto - etf.neto;

  return (
    <div className="card not-prose grid gap-6 p-6 md:grid-cols-2">
      <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-3">
          <CampoNumero label="Aportación mensual (€)" value={aportacionMensual} onChange={setAportacionMensual} />
          <CampoNumero label="Años" value={anios} onChange={setAnios} min={1} max={60} />
          <CampoNumero label="Rentabilidad bruta anual (%)" value={rentabilidadBruta} onChange={setRentabilidadBruta} min={-20} step={0.1} />
          <CampoNumero label="Cambios de producto" value={cambiosDeProducto} onChange={(v) => setCambiosDeProducto(Math.round(v))} max={10} ayuda="Rebalanceos o cambios de fondo/ETF" />
          <CampoNumero label="TER del fondo (%)" value={terFondo} onChange={setTerFondo} step={0.01} />
          <CampoNumero label="TER del ETF (%)" value={terEtf} onChange={setTerEtf} step={0.01} />
          <CampoNumero label="Comisión por compra del ETF (€)" value={comisionCompraEtf} onChange={setComisionCompraEtf} step={0.5} />
          <Campo label="Compras de ETF al año">
            <select value={comprasEtfAlAnio} onChange={(e) => setComprasEtfAlAnio(Number(e.target.value))} className="campo-input">
              <option value={12}>12 (cada mes)</option>
              <option value={4}>4 (cada trimestre)</option>
              <option value={2}>2 (cada semestre)</option>
              <option value={1}>1 (una al año)</option>
            </select>
          </Campo>
        </div>
      </form>

      <PanelResultados>
        <Resumen etiqueta="Total aportado" valor={formatEuros(fondo.aportado)} />
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">Fondo indexado</p>
        <Resumen etiqueta="Valor final bruto" valor={formatEuros(fondo.valorFinal)} />
        <Resumen etiqueta="Impuesto al vender al final" valor={`− ${formatEuros(fondo.impuestoFinal)}`} negativo />
        <Resumen etiqueta="Neto" valor={formatEuros(fondo.neto)} destacado />
        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">ETF</p>
        <Resumen etiqueta="Comisiones de compra pagadas" valor={`− ${formatEuros(etf.comisionesCompra)}`} negativo />
        <Resumen etiqueta="Impuestos pagados al cambiar" valor={`− ${formatEuros(etf.impuestosDuranteElCamino)}`} negativo />
        <Resumen etiqueta="Valor final bruto" valor={formatEuros(etf.valorFinal)} />
        <Resumen etiqueta="Impuesto al vender al final" valor={`− ${formatEuros(etf.impuestoFinal)}`} negativo />
        <Resumen etiqueta="Neto" valor={formatEuros(etf.neto)} destacado />
        <hr className="my-1 border-border" />
        <Resumen
          etiqueta={diferencia >= 0 ? 'Ventaja del fondo indexado' : 'Ventaja del ETF'}
          valor={formatEuros(Math.abs(diferencia))}
          destacado
        />
        <NotaCalculo>
          Simulación con rentabilidad constante, tramos del IRPF del ahorro y sin otras ganancias en
          el año de cada venta. Cada cambio de producto del ETF es una venta con impuestos; en el
          fondo es un traspaso sin impuestos. No incluye comisiones de custodia ni de cambio de
          divisa. No es una recomendación de inversión.
        </NotaCalculo>
      </PanelResultados>
    </div>
  );
}
