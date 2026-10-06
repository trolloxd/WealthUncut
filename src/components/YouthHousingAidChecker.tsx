import { useMemo } from 'react';
import { AYUDAS_VIVIENDA_JOVENES as A } from '../config/finance';
import { Campo, CampoNumero, NotaCalculo, PanelResultados, Resumen, formatEuros, useEstadoUrl } from './CalculatorUI';

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

export default function YouthHousingAidChecker() {
  const [edad, setEdad] = useEstadoUrl<number>('edad', 27, { max: 100 });
  const [ingresos, setIngresos] = useEstadoUrl<number>('ing', 24000, { max: 1000000 });
  const [tieneVivienda, setTieneVivienda] = useEstadoUrl<boolean>('prop', false);
  const [pequeno, setPequeno] = useEstadoUrl<boolean>('peq', false);
  const [habitacion, setHabitacion] = useEstadoUrl<boolean>('hab', false);
  const [renta, setRenta] = useEstadoUrl<number>('renta', 750, { max: 10000 });
  const [precioCompra, setPrecioCompra] = useEstadoUrl<number>('precio', 120000, { max: 5000000 });

  const r = useMemo(
    () => evaluarAyudasVivienda({ edad, ingresos, tieneVivienda, pequeno, tipo: habitacion ? 'habitacion' : 'vivienda', renta, precioCompra }),
    [edad, ingresos, tieneVivienda, pequeno, habitacion, renta, precioCompra]
  );
  const meses = A.alquiler.duracionAnios * 12;

  return (
    <div className="not-prose card grid gap-6 p-6 md:grid-cols-2">
      <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
        <CampoNumero label="Tu edad" value={edad} onChange={setEdad} max={100} />
        <CampoNumero label="Tus ingresos anuales (€)" value={ingresos} onChange={setIngresos} step={1000} max={1000000} ayuda="Rentas anuales de la persona solicitante." />
        <CampoNumero label="Alquiler mensual (€)" value={renta} onChange={setRenta} step={50} max={10000} />
        <CampoNumero label="Precio de la vivienda que comprarías (€)" value={precioCompra} onChange={setPrecioCompra} step={5000} max={5000000} />
        <Campo label="Tu situación">
          <span className="grid gap-2">
            <label className="flex items-center gap-2 text-sm text-ink-muted">
              <input type="checkbox" checked={habitacion} onChange={(e) => setHabitacion(e.target.checked)} /> Alquilo una habitación, no una vivienda entera
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-muted">
              <input type="checkbox" checked={pequeno} onChange={(e) => setPequeno(e.target.checked)} /> El municipio tiene 10.000 habitantes o menos
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-muted">
              <input type="checkbox" checked={tieneVivienda} onChange={(e) => setTieneVivienda(e.target.checked)} /> Soy propietario o usufructuario de una vivienda en España
            </label>
          </span>
        </Campo>
      </form>

      <PanelResultados>
        {!r.cumpleBase && <p className="text-sm text-accent">Con estos datos no cumplirías el requisito básico: {r.motivos.join(', ')}.</p>}
        <Resumen etiqueta="Límite de ingresos (5 veces el IPREM)" valor={formatEuros(r.limite)} />
        <hr className="my-1 border-border" />
        <Resumen etiqueta="Ayuda al alquiler joven" valor={r.ayudaAlquiler > 0 ? `${formatEuros(r.ayudaAlquiler)} al mes` : 'No'} destacado={r.ayudaAlquiler > 0} />
        {r.cumpleBase && !r.rentaOk && (
          <p className="text-xs text-ink-faint">Tu alquiler supera el máximo de {formatEuros(r.rentaMax)} al mes para esta ayuda (las comunidades pueden subirlo).</p>
        )}
        {r.ayudaAlquiler > 0 && <Resumen etiqueta={`Durante ${A.alquiler.duracionAnios} años (${meses} meses)`} valor={formatEuros(r.ayudaAlquiler * meses)} />}
        <Resumen
          etiqueta="Ayuda a la compra en municipio pequeño"
          valor={r.ayudaCompra > 0 ? `hasta ${formatEuros(r.ayudaCompra)}` : pequeno ? 'No' : 'Solo en municipios pequeños'}
          destacado={r.ayudaCompra > 0}
        />
        <NotaCalculo>
          Cifras del Real Decreto 326/2026 (Plan Estatal de Vivienda 2026-2030). Las ayudas las convocan y pagan las comunidades autónomas: cumplir los requisitos
          no garantiza que haya convocatoria abierta ni presupuesto. El precio máximo de la vivienda a comprar depende de tu comunidad (anexo IV del real decreto).
        </NotaCalculo>
      </PanelResultados>
    </div>
  );
}
