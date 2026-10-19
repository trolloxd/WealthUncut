import { useMemo } from 'react';
import { TIPOS_EXTINCION, calcularIndemnizacion, esFecha, type TipoExtincion } from '../lib/calculos/indemnizacion.ts';
import { Campo, CampoNumero, NotaCalculo, PanelResultados, Resumen, useEstadoUrl, formatEuros2 } from './CalculatorUI';


// Compatibilidad: la lógica vive en src/lib/calculos/ (con pruebas); se reexporta aquí por si algún artículo la importa desde el componente.
export { TIPOS_EXTINCION, calcularIndemnizacion, mesesDeServicio, type TipoExtincion } from '../lib/calculos/indemnizacion.ts';

export default function SeveranceCalculator() {
  const [salarioAnual, setSalario] = useEstadoUrl<number>('sal', 24000, { max: 1000000 });
  const [inicio, setInicio] = useEstadoUrl<string>('ini', '2022-03-01', { validar: esFecha });
  const [fin, setFin] = useEstadoUrl<string>('fin', '2026-10-31', { validar: esFecha });
  const [tipo, setTipo] = useEstadoUrl<string>('tipo', 'improcedente', { validar: (v) => v in TIPOS_EXTINCION });
  const [diasVacaciones, setVac] = useEstadoUrl<number>('vac', 8, { max: 365 });
  const [diasMes, setDiasMes] = useEstadoUrl<number>('dm', 15, { max: 31 });

  const r = useMemo(
    () => calcularIndemnizacion({ salarioAnual, inicio, fin, tipo: tipo as TipoExtincion, diasVacaciones, diasMes }),
    [salarioAnual, inicio, fin, tipo, diasVacaciones, diasMes]
  );
  const anios = Math.floor(r.meses / 12);
  const mesesResto = r.meses % 12;

  return (
    <div className="card not-prose grid gap-6 p-6 md:grid-cols-2">
      <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
        <CampoNumero label="Salario bruto anual (€)" value={salarioAnual} onChange={setSalario} step={500} max={1000000} ayuda="Incluye las pagas extra, aunque estén prorrateadas, y todo lo salarial." />
        <Campo label="Fecha de inicio del contrato">
          <input type="date" value={inicio} onChange={(e) => esFecha(e.target.value) && setInicio(e.target.value)} className="campo-input" />
        </Campo>
        <Campo label="Último día de trabajo">
          <input type="date" value={fin} onChange={(e) => esFecha(e.target.value) && setFin(e.target.value)} className="campo-input" />
        </Campo>
        <Campo label="Motivo del fin del contrato">
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="campo-input">
            {Object.entries(TIPOS_EXTINCION).map(([id, t]) => (
              <option key={id} value={id}>{t.etiqueta}</option>
            ))}
          </select>
        </Campo>
        <CampoNumero label="Días de vacaciones sin disfrutar" value={diasVacaciones} onChange={setVac} max={365} ayuda="Los que te correspondan y no hayas cogido, en días naturales." />
        <CampoNumero label="Días trabajados del último mes" value={diasMes} onChange={setDiasMes} max={31} ayuda="Días del mes en curso que aún no te han pagado." />
      </form>

      <PanelResultados>
        <Resumen etiqueta="Tiempo de servicio" valor={`${anios} años y ${mesesResto} meses`} />
        <Resumen etiqueta="Salario diario" valor={formatEuros2(r.diario)} />
        <hr className="my-1 border-border" />
        <Resumen etiqueta="Indemnización" valor={formatEuros2(r.indemnizacion)} destacado />
        {r.topeAplicado && <p className="text-xs text-ink-faint">Se aplica el máximo legal de {formatEuros2(r.tope)}.</p>}
        <Resumen etiqueta="Vacaciones sin disfrutar" valor={formatEuros2(r.vacaciones)} />
        <Resumen etiqueta="Días trabajados sin cobrar" valor={formatEuros2(r.diasTrabajados)} />
        <Resumen etiqueta="Finiquito (sin la indemnización)" valor={formatEuros2(r.finiquito)} />
        <Resumen etiqueta="Total bruto estimado" valor={formatEuros2(r.total)} destacado />
        <NotaCalculo>
          Cantidades brutas. La indemnización legal por despido no tributa en el IRPF dentro del mínimo legal; el finiquito sí, como sueldo. Cálculo para contratos firmados desde el 12 de
          febrero de 2012, con la fracción de mes contada como mes completo. Si tu convenio o tu contrato mejoran estas cifras, o si tu salario tiene complementos, el resultado cambia.
        </NotaCalculo>
      </PanelResultados>
    </div>
  );
}
