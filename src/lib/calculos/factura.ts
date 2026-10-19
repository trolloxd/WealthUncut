
export function calcularFactura(p: { base: number; ivaPct: number; retencionPct: number; pagoFraccionadoPct: number }) {
  const iva = p.base * (p.ivaPct / 100);
  const retencion = p.base * (p.retencionPct / 100);
  const total = p.base + iva - retencion;
  // Lo que conviene apartar de lo cobrado: el IVA es de Hacienda; el 20 % del modelo 130 se descuenta de lo ya retenido.
  const pago130 = Math.max(0, p.base * (p.pagoFraccionadoPct / 100) - retencion);
  const apartar = iva + pago130;
  return { iva, retencion, total, pago130, apartar, tuyoAntesDeGastos: total - apartar };
}
