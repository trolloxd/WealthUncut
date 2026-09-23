import { useMemo, useState } from 'react';
import { Campo, CampoNumero, NotaCalculo, PanelResultados, Resumen, formatEuros } from './CalculatorUI';

type Ingresos = 'indefinido' | 'temporal' | 'variable';

/**
 * Criterio propio (explicado en la página): se parte de 3 meses de gastos esenciales y se suma un
 * mes por cada factor que hace más probable o más largo quedarse sin ingresos.
 */
export function mesesRecomendados(f: {
  ingresos: Ingresos;
  personasACargo: boolean;
  unicaFuente: boolean;
  gastosGrandesPosibles: boolean;
}): number {
  let meses = 3;
  if (f.ingresos === 'temporal') meses += 1;
  if (f.ingresos === 'variable') meses += 2;
  if (f.personasACargo) meses += 1;
  if (f.unicaFuente) meses += 1;
  if (f.gastosGrandesPosibles) meses += 1;
  return meses;
}

function aniosYMeses(meses: number): string {
  if (meses <= 0) return 'ya lo tienes';
  if (meses < 12) return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  const a = Math.floor(meses / 12);
  const m = meses % 12;
  return `${a} ${a === 1 ? 'año' : 'años'}${m ? ` y ${m} ${m === 1 ? 'mes' : 'meses'}` : ''}`;
}

export default function EmergencyFundCalculator() {
  const [vivienda, setVivienda] = useState(550);
  const [suministros, setSuministros] = useState(90);
  const [comida, setComida] = useState(250);
  const [transporte, setTransporte] = useState(60);
  const [seguros, setSeguros] = useState(30);
  const [otrosFijos, setOtrosFijos] = useState(0);
  const [ingresos, setIngresos] = useState<Ingresos>('indefinido');
  const [personasACargo, setPersonasACargo] = useState(false);
  const [unicaFuente, setUnicaFuente] = useState(true);
  const [gastosGrandesPosibles, setGastosGrandesPosibles] = useState(false);
  const [ahorroActual, setAhorroActual] = useState(1000);
  const [aporteMensual, setAporteMensual] = useState(200);

  const r = useMemo(() => {
    const gastosMes = vivienda + suministros + comida + transporte + seguros + otrosFijos;
    const meses = mesesRecomendados({ ingresos, personasACargo, unicaFuente, gastosGrandesPosibles });
    const objetivo = gastosMes * meses;
    const falta = Math.max(0, objetivo - ahorroActual);
    const mesesParaCompletar = falta === 0 ? 0 : aporteMensual > 0 ? Math.ceil(falta / aporteMensual) : Infinity;
    const cobertura = gastosMes > 0 ? ahorroActual / gastosMes : 0;
    return { gastosMes, meses, objetivo, falta, mesesParaCompletar, cobertura };
  }, [vivienda, suministros, comida, transporte, seguros, otrosFijos, ingresos, personasACargo, unicaFuente, gastosGrandesPosibles, ahorroActual, aporteMensual]);

  const check = (label: string, value: boolean, set: (v: boolean) => void) => (
    <label className="flex items-start gap-2 text-sm text-ink-muted">
      <input type="checkbox" checked={value} onChange={(e) => set(e.target.checked)} className="mt-1 accent-brand" />
      {label}
    </label>
  );

  return (
    <div className="card not-prose grid gap-6 p-6 md:grid-cols-2">
      <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="grid gap-3">
          <legend className="mb-1 text-sm font-semibold text-ink">Gastos esenciales al mes</legend>
          <div className="grid grid-cols-2 gap-3">
            <CampoNumero label="Vivienda (€)" value={vivienda} onChange={setVivienda} ayuda="Alquiler o hipoteca, comunidad" />
            <CampoNumero label="Suministros (€)" value={suministros} onChange={setSuministros} ayuda="Luz, agua, gas, internet, móvil" />
            <CampoNumero label="Comida (€)" value={comida} onChange={setComida} />
            <CampoNumero label="Transporte (€)" value={transporte} onChange={setTransporte} />
            <CampoNumero label="Seguros (€)" value={seguros} onChange={setSeguros} ayuda="Parte mensual" />
            <CampoNumero label="Otros pagos fijos (€)" value={otrosFijos} onChange={setOtrosFijos} ayuda="Préstamos, medicación..." />
          </div>
        </fieldset>

        <fieldset className="grid gap-2">
          <legend className="mb-1 text-sm font-semibold text-ink">Tu situación</legend>
          <Campo label="Tus ingresos">
            <select value={ingresos} onChange={(e) => setIngresos(e.target.value as Ingresos)} className="campo-input">
              <option value="indefinido">Sueldo fijo, contrato indefinido</option>
              <option value="temporal">Contrato temporal o de prácticas</option>
              <option value="variable">Autónomo o ingresos variables</option>
            </select>
          </Campo>
          {check('Tengo personas a mi cargo', personasACargo, setPersonasACargo)}
          {check('Soy la única fuente de ingresos de mi hogar', unicaFuente, setUnicaFuente)}
          {check('Tengo coche, vivienda en propiedad u otras cosas que pueden dar un gasto grande de golpe', gastosGrandesPosibles, setGastosGrandesPosibles)}
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <CampoNumero label="Ya tengo ahorrado (€)" value={ahorroActual} onChange={setAhorroActual} />
          <CampoNumero label="Puedo apartar al mes (€)" value={aporteMensual} onChange={setAporteMensual} />
        </div>
      </form>

      <PanelResultados>
        <Resumen etiqueta="Gastos esenciales al mes" valor={formatEuros(r.gastosMes)} />
        <Resumen etiqueta="Meses de colchón orientativos" valor={`${r.meses} meses`} />
        <Resumen etiqueta="Tu fondo de emergencia" valor={formatEuros(r.objetivo)} destacado />
        <hr className="my-1 border-border" />
        <Resumen etiqueta="Ya cubres" valor={`${r.cobertura.toLocaleString('es-ES', { maximumFractionDigits: 1 })} meses`} />
        <Resumen etiqueta="Te falta" valor={formatEuros(r.falta)} negativo={r.falta > 0} />
        <Resumen
          etiqueta="Tiempo para completarlo"
          valor={Number.isFinite(r.mesesParaCompletar) ? aniosYMeses(r.mesesParaCompletar) : 'aparta algo cada mes'}
        />
        <hr className="my-1 border-border" />
        <p className="text-xs text-ink-muted">
          Como referencia: con 3 meses serían {formatEuros(r.gastosMes * 3)} y con 6 meses,{' '}
          {formatEuros(r.gastosMes * 6)}.
        </p>
        <NotaCalculo>
          Los meses salen de un criterio orientativo explicado debajo de la calculadora (3 meses de
          base más uno por cada factor de riesgo), no de ninguna norma. No es una recomendación
          personalizada.
        </NotaCalculo>
      </PanelResultados>
    </div>
  );
}
