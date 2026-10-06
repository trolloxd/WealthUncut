import { useMemo } from 'react';
import { calcularImpuestoAhorro } from '../config/finance';
import {
  CampoNumero,
  NotaCalculo,
  PanelResultados,
  Resumen,
  claseAnchoBarra,
  formatEuros,
  formatPct,
  useEstadoUrl,
} from './CalculatorUI';

export interface ParamsInteres {
  capitalInicial: number;
  aportacionMensual: number;
  anios: number;
  rentabilidadPct: number;
  inflacionPct: number;
  descontarImpuestos: boolean;
}

export interface FilaAnual {
  anio: number;
  aportado: number;
  valor: number;
  intereses: number;
}

export function calcularInteresCompuesto(p: ParamsInteres) {
  const meses = Math.max(0, Math.round(p.anios * 12));
  const r = Math.pow(1 + p.rentabilidadPct / 100, 1 / 12) - 1;
  const filas: FilaAnual[] = [];
  let valor = p.capitalInicial;
  let aportado = p.capitalInicial;
  for (let m = 1; m <= meses; m++) {
    valor = valor * (1 + r) + p.aportacionMensual;
    aportado += p.aportacionMensual;
    if (m % 12 === 0 || m === meses) {
      filas.push({ anio: m / 12, aportado, valor, intereses: valor - aportado });
    }
  }
  const final = filas.length ? filas[filas.length - 1] : { anio: 0, aportado: p.capitalInicial, valor: p.capitalInicial, intereses: 0 };
  const impuesto = p.descontarImpuestos ? calcularImpuestoAhorro(Math.max(0, final.intereses)) : 0;
  const neto = final.valor - impuesto;
  const deflactor = Math.pow(1 + p.inflacionPct / 100, p.anios);
  return {
    filas,
    final,
    impuesto,
    neto,
    valorReal: neto / deflactor,
    porcentajeIntereses: final.valor > 0 ? final.intereses / final.valor : 0,
    // Años para duplicar sin aportar más: regla del 72 exacta.
    aniosDuplicar: p.rentabilidadPct > 0 ? Math.log(2) / Math.log(1 + p.rentabilidadPct / 100) : Infinity,
  };
}

export default function CompoundInterestCalculator() {
  const [capitalInicial, setCapitalInicial] = useEstadoUrl<number>('capital', 5000);
  const [aportacionMensual, setAportacionMensual] = useEstadoUrl<number>('mensual', 200);
  const [anios, setAnios] = useEstadoUrl<number>('anios', 20, { max: 80 });
  const [rentabilidadPct, setRentabilidadPct] = useEstadoUrl<number>('rent', 7, { max: 50 });
  const [inflacionPct, setInflacionPct] = useEstadoUrl<number>('infl', 2, { max: 30 });
  const [descontarImpuestos, setDescontarImpuestos] = useEstadoUrl<boolean>('imp', false);

  const r = useMemo(
    () => calcularInteresCompuesto({ capitalInicial, aportacionMensual, anios, rentabilidadPct, inflacionPct, descontarImpuestos }),
    [capitalInicial, aportacionMensual, anios, rentabilidadPct, inflacionPct, descontarImpuestos]
  );

  // Hitos para la tabla y las barras: cada 5 años (o cada año si son pocos) y el último.
  const paso = anios <= 10 ? 1 : anios <= 30 ? 5 : 10;
  const hitos = r.filas.filter((f, i) => f.anio % paso === 0 || i === r.filas.length - 1);
  const maximo = Math.max(1, ...hitos.map((h) => h.valor));

  return (
    <div className="not-prose grid gap-6">
      <div className="card grid gap-6 p-6 md:grid-cols-2">
        <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
          <CampoNumero label="Capital inicial (€)" value={capitalInicial} onChange={setCapitalInicial} step={500} />
          <CampoNumero label="Aportación mensual (€)" value={aportacionMensual} onChange={setAportacionMensual} step={50} />
          <CampoNumero label="Años" value={anios} onChange={setAnios} min={1} max={80} />
          <CampoNumero
            label="Rentabilidad anual (%)"
            value={rentabilidadPct}
            onChange={setRentabilidadPct}
            step={0.5}
            max={50}
            ayuda="Un supuesto constante, no una previsión: en la realidad cambia cada año."
          />
          <CampoNumero label="Inflación anual (%)" value={inflacionPct} onChange={setInflacionPct} step={0.5} max={30} ayuda="Para ver cuánto valdría en euros de hoy." />
          <label className="flex items-center gap-2 text-sm text-ink-muted">
            <input type="checkbox" checked={descontarImpuestos} onChange={(e) => setDescontarImpuestos(e.target.checked)} />
            Descontar el IRPF del ahorro sobre la ganancia (como si vendieras todo al final)
          </label>
        </form>

        <PanelResultados>
          <Resumen etiqueta="Tendrías al final" valor={formatEuros(r.final.valor)} destacado />
          <Resumen etiqueta="Lo que has aportado" valor={formatEuros(r.final.aportado)} />
          <Resumen etiqueta="Intereses generados" valor={formatEuros(r.final.intereses)} />
          <Resumen etiqueta="Parte del resultado que son intereses" valor={formatPct(r.porcentajeIntereses, 0)} />
          {descontarImpuestos && (
            <>
              <Resumen etiqueta="Impuesto (IRPF del ahorro)" valor={formatEuros(r.impuesto)} negativo />
              <Resumen etiqueta="Te quedan netos" valor={formatEuros(r.neto)} destacado />
            </>
          )}
          <hr className="my-1 border-border" />
          <Resumen etiqueta="En euros de hoy (con la inflación)" valor={formatEuros(r.valorReal)} />
          <Resumen etiqueta="Años para duplicar un capital sin aportar más" valor={Number.isFinite(r.aniosDuplicar) ? r.aniosDuplicar.toLocaleString('es-ES', { maximumFractionDigits: 1 }) : 'nunca'} />
          <NotaCalculo>
            Interés compuesto con capitalización mensual y rentabilidad anual constante. Las aportaciones se hacen a final de cada mes.
            Sin comisiones. La rentabilidad real de una inversión varía cada año y puede ser negativa.
          </NotaCalculo>
        </PanelResultados>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg text-ink">Cómo crece, año a año</h2>
        <div className="mt-4 grid gap-3">
          {hitos.map((h) => {
            const pctAportado = (100 * h.aportado) / maximo;
            const pctValor = (100 * h.valor) / maximo;
            return (
              <div key={h.anio} className="grid grid-cols-[3.5rem_1fr_6rem] items-center gap-3 text-xs sm:grid-cols-[4rem_1fr_7rem]">
                <span className="text-ink-muted">Año {h.anio}</span>
                <span className="relative block h-4 w-full overflow-hidden rounded-full bg-cream" aria-hidden="true">
                  <span className={`absolute left-0 top-0 block h-full rounded-full bg-accent/60 ${claseAnchoBarra(pctValor, 5)}`} />
                  <span className={`absolute left-0 top-0 block h-full rounded-full bg-brand ${claseAnchoBarra(pctAportado, 5)}`} />
                </span>
                <span className="text-right font-semibold text-ink">{formatEuros(h.valor)}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-faint">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-brand" aria-hidden="true" /> Lo aportado
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-accent/60" aria-hidden="true" /> Intereses (la parte clara)
          </span>
        </p>
      </div>
    </div>
  );
}
