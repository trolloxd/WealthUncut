import { useMemo } from 'react';
import { Campo, CampoNumero, NotaCalculo, PanelResultados, Resumen, useEstadoUrl } from './CalculatorUI';

const eur = (v: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: 'always' }).format(v);

// Estatuto de los Trabajadores (BOE-A-2015-11430): art. 56.1 (despido improcedente: 33 días por año, máximo 24
// mensualidades), art. 53.1.b (causas objetivas: 20 días por año, máximo 12 mensualidades) y art. 49.1.c (fin de
// contrato temporal: parte proporcional de 12 días por año). Contratos firmados desde el 12-02-2012.
export const TIPOS_EXTINCION = {
  improcedente: { etiqueta: 'Despido improcedente (33 días por año, máximo 24 mensualidades)', dias: 33, topeMensualidades: 24 },
  objetivo: { etiqueta: 'Despido objetivo, por ejemplo económico (20 días por año, máximo 12 mensualidades)', dias: 20, topeMensualidades: 12 },
  temporal: { etiqueta: 'Fin de un contrato temporal (12 días por año)', dias: 12, topeMensualidades: Infinity },
} as const;
export type TipoExtincion = keyof typeof TIPOS_EXTINCION;

/** Suma meses a una fecha sin desbordar al mes siguiente (31 de enero + 1 mes = 28 o 29 de febrero). */
function sumaMeses(d: Date, n: number): Date {
  const total = d.getUTCFullYear() * 12 + d.getUTCMonth() + n;
  const anio = Math.floor(total / 12);
  const mes = total % 12;
  const ultimoDia = new Date(Date.UTC(anio, mes + 1, 0)).getUTCDate();
  return new Date(Date.UTC(anio, mes, Math.min(d.getUTCDate(), ultimoDia)));
}

/** Meses de servicio: meses completos, y una fracción de mes cuenta como un mes (criterio habitual). El último día trabajado cuenta. */
export function mesesDeServicio(inicio: string, fin: string): number {
  const a = new Date(inicio + 'T00:00:00Z');
  const hasta = new Date(new Date(fin + 'T00:00:00Z').getTime() + 86400000);
  if (!(hasta > a)) return 0;
  let meses = 0;
  while (sumaMeses(a, meses + 1) <= hasta) meses++;
  return meses + (sumaMeses(a, meses) < hasta ? 1 : 0);
}

export function calcularIndemnizacion(p: { salarioAnual: number; inicio: string; fin: string; tipo: TipoExtincion; diasVacaciones: number; diasMes: number }) {
  const t = TIPOS_EXTINCION[p.tipo];
  const diario = p.salarioAnual / 365;
  const mensual = p.salarioAnual / 12;
  const meses = mesesDeServicio(p.inicio, p.fin);
  const anios = meses / 12;
  const bruta = diario * t.dias * anios;
  const tope = t.topeMensualidades * mensual;
  const indemnizacion = Math.min(bruta, tope);
  const vacaciones = diario * p.diasVacaciones;
  const diasTrabajados = diario * p.diasMes;
  return { diario, meses, anios, bruta, tope, topeAplicado: bruta > tope, indemnizacion, vacaciones, diasTrabajados, finiquito: vacaciones + diasTrabajados, total: indemnizacion + vacaciones + diasTrabajados };
}

const esFecha = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(new Date(v).getTime());

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
        <Resumen etiqueta="Salario diario" valor={eur(r.diario)} />
        <hr className="my-1 border-border" />
        <Resumen etiqueta="Indemnización" valor={eur(r.indemnizacion)} destacado />
        {r.topeAplicado && <p className="text-xs text-ink-faint">Se aplica el máximo legal de {eur(r.tope)}.</p>}
        <Resumen etiqueta="Vacaciones sin disfrutar" valor={eur(r.vacaciones)} />
        <Resumen etiqueta="Días trabajados sin cobrar" valor={eur(r.diasTrabajados)} />
        <Resumen etiqueta="Finiquito (sin la indemnización)" valor={eur(r.finiquito)} />
        <Resumen etiqueta="Total bruto estimado" valor={eur(r.total)} destacado />
        <NotaCalculo>
          Cantidades brutas. La indemnización legal por despido no tributa en el IRPF dentro del mínimo legal; el finiquito sí, como sueldo. Cálculo para contratos firmados desde el 12 de
          febrero de 2012, con la fracción de mes contada como mes completo. Si tu convenio o tu contrato mejoran estas cifras, o si tu salario tiene complementos, el resultado cambia.
        </NotaCalculo>
      </PanelResultados>
    </div>
  );
}
