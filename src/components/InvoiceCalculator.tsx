import { useMemo } from 'react';
import { calcularFactura } from '../lib/calculos/factura.ts';
import { Campo, CampoNumero, NotaCalculo, PanelResultados, Resumen, formatPct, useEstadoUrl, formatEuros2 } from './CalculatorUI';


// Compatibilidad: la lógica vive en src/lib/calculos/ (con pruebas); se reexporta aquí por si algún artículo la importa desde el componente.
export { calcularFactura } from '../lib/calculos/factura.ts';

export default function InvoiceCalculator() {
  const [base, setBase] = useEstadoUrl<number>('base', 1000, { max: 10000000 });
  const [ivaPct, setIvaPct] = useEstadoUrl<number>('iva', 21);
  const [retencionPct, setRetencionPct] = useEstadoUrl<number>('ret', 7);

  const r = useMemo(() => calcularFactura({ base, ivaPct, retencionPct, pagoFraccionadoPct: 20 }), [base, ivaPct, retencionPct]);

  return (
    <div className="card not-prose grid gap-6 p-6 md:grid-cols-2">
      <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
        <CampoNumero label="Base imponible de la factura (€)" value={base} onChange={setBase} step={100} max={10000000} ayuda="Lo que cobras por tu trabajo, sin IVA." />
        <Campo label="IVA">
          <select value={ivaPct} onChange={(e) => setIvaPct(Number(e.target.value))} className="campo-input">
            <option value={21}>21 % (tipo general)</option>
            <option value={10}>10 % (tipo reducido)</option>
            <option value={4}>4 % (superreducido)</option>
            <option value={0}>0 % (exenta o sin IVA)</option>
          </select>
        </Campo>
        <Campo label="Retención de IRPF">
          <select value={retencionPct} onChange={(e) => setRetencionPct(Number(e.target.value))} className="campo-input">
            <option value={7}>7 % (profesional que empieza, 3 años)</option>
            <option value={15}>15 % (profesional, tipo general)</option>
            <option value={0}>0 % (cliente particular o sin retención)</option>
          </select>
        </Campo>
      </form>

      <PanelResultados>
        <Resumen etiqueta="Base imponible" valor={formatEuros2(base)} />
        <Resumen etiqueta={`+ IVA (${ivaPct} %)`} valor={formatEuros2(r.iva)} />
        <Resumen etiqueta={`− Retención IRPF (${retencionPct} %)`} valor={formatEuros2(r.retencion)} negativo />
        <Resumen etiqueta="Total a cobrar del cliente" valor={formatEuros2(r.total)} destacado />
        <hr className="my-1 border-border" />
        <Resumen etiqueta="IVA que debes ingresar" valor={formatEuros2(r.iva)} />
        <Resumen etiqueta="Adelanto de IRPF (modelo 130)" valor={formatEuros2(r.pago130)} />
        <Resumen etiqueta="Conviene apartar de esta factura" valor={formatEuros2(r.apartar)} />
        <Resumen etiqueta="Queda tuyo antes de gastos y cuota" valor={formatEuros2(r.tuyoAntesDeGastos)} />
        <NotaCalculo>
          Estimación por factura: el modelo 130 real se calcula con el rendimiento acumulado del año (ingresos menos gastos), así que el adelanto efectivo
          será menor si tienes gastos. El IVA soportado de tus gastos también se resta del que ingresas. Retención: {formatPct(retencionPct / 100, 0)} sobre la base.
        </NotaCalculo>
      </PanelResultados>
    </div>
  );
}
