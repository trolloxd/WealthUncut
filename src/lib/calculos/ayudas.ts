import { AYUDAS_VIVIENDA_JOVENES as A } from '../../config/finance.ts';

export function evaluarAyudasVivienda(p: {
  edad: number;
  ingresos: number;
  tieneVivienda: boolean;
  pequeno: boolean;
  tipo: 'vivienda' | 'habitacion';
  renta: number;
  precioCompra: number;
}) {
  const limite = A.limiteIngresosVecesIprem * A.iprem14PagasAnual;
  const motivos: string[] = [];
  if (p.edad > A.edadMaxima) motivos.push(`tener más de ${A.edadMaxima} años`);
  if (p.ingresos > limite) motivos.push(`superar los ${limite.toLocaleString('es-ES')} € de ingresos anuales`);
  if (p.tieneVivienda) motivos.push('ser propietario de una vivienda en España');
  const cumpleBase = motivos.length === 0;

  const al = A.alquiler;
  const rentaMax =
    p.tipo === 'vivienda'
      ? p.pequeno ? al.rentaMaxViviendaMesMunicipioPequeno : al.rentaMaxViviendaMes
      : p.pequeno ? al.rentaMaxHabitacionMesMunicipioPequeno : al.rentaMaxHabitacionMes;
  const tope = p.tipo === 'vivienda' ? al.ayudaMaxViviendaMes : al.ayudaMaxHabitacionMes;
  const rentaOk = p.renta > 0 && p.renta <= rentaMax;
  const ayudaAlquiler = cumpleBase && rentaOk ? Math.min(tope, al.porcentajeMaxRenta * p.renta) : 0;

  const c = A.compraMunicipioPequeno;
  const ayudaCompra = cumpleBase && p.pequeno && p.precioCompra > 0 ? Math.min(c.ayudaMax, c.porcentajeMaxCoste * p.precioCompra) : 0;

  return { limite, motivos, cumpleBase, rentaMax, rentaOk, ayudaAlquiler, ayudaCompra };
}
