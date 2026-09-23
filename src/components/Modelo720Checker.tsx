import { useMemo, useState } from 'react';
import { MODELO_720 } from '../config/finance';
import { CampoNumero, NotaCalculo, PanelResultados, formatEuros } from './CalculatorUI';

export interface Bloque {
  valor: number; // valor que cuenta este año
  declaradoAntes: boolean;
  valorUltimaDeclaracion: number;
  extinguido: boolean; // dejaste de ser titular de algo declarado
}

export function evaluarBloque(b: Bloque): { obligado: boolean; motivo: string } {
  const { umbralPorBloque: umbral, incrementoParaRepetir: incremento } = MODELO_720;
  if (b.declaradoAntes && b.extinguido) {
    return { obligado: true, motivo: 'Dejaste de ser titular de algo que ya habías declarado: hay que comunicarlo.' };
  }
  if (!b.declaradoAntes) {
    return b.valor > umbral
      ? { obligado: true, motivo: `Supera ${formatEuros(umbral)} y no lo has declarado antes.` }
      : { obligado: false, motivo: `No supera ${formatEuros(umbral)}.` };
  }
  const subida = b.valor - b.valorUltimaDeclaracion;
  return subida > incremento
    ? { obligado: true, motivo: `Sube ${formatEuros(subida)} respecto a tu última declaración (más de ${formatEuros(incremento)}).` }
    : {
        obligado: false,
        motivo: `Ya lo declaraste y ha subido ${formatEuros(Math.max(0, subida))}, sin pasar de ${formatEuros(incremento)} más.`,
      };
}

const vacio: Bloque = { valor: 0, declaradoAntes: false, valorUltimaDeclaracion: 0, extinguido: false };

export default function Modelo720Checker() {
  const [saldoCuentas31, setSaldoCuentas31] = useState(3000);
  const [saldoCuentasMedio, setSaldoCuentasMedio] = useState(3000);
  const [cuentas, setCuentas] = useState<Bloque>(vacio);
  const [valores, setValores] = useState<Bloque>({ ...vacio, valor: 55000 });
  const [inmuebles, setInmuebles] = useState<Bloque>(vacio);

  const bloques = useMemo(() => {
    const valorCuentas = Math.max(saldoCuentas31, saldoCuentasMedio);
    return [
      { nombre: 'Cuentas en el extranjero', r: evaluarBloque({ ...cuentas, valor: valorCuentas }) },
      { nombre: 'Valores, fondos, ETF y seguros en el extranjero', r: evaluarBloque(valores) },
      { nombre: 'Inmuebles en el extranjero', r: evaluarBloque(inmuebles) },
    ];
  }, [saldoCuentas31, saldoCuentasMedio, cuentas, valores, inmuebles]);
  const alguno = bloques.some((b) => b.r.obligado);

  const historial = (b: Bloque, set: (b: Bloque) => void, nombre: string) => (
    <div className="grid gap-2 rounded-lg bg-cream p-3">
      <label className="flex items-center gap-2 text-sm text-ink-muted">
        <input type="checkbox" checked={b.declaradoAntes} onChange={(e) => set({ ...b, declaradoAntes: e.target.checked })} className="accent-brand" />
        Ya presenté este bloque algún año
      </label>
      {b.declaradoAntes && (
        <>
          <CampoNumero
            label="Valor en tu última declaración (€)"
            value={b.valorUltimaDeclaracion}
            onChange={(v) => set({ ...b, valorUltimaDeclaracion: v })}
          />
          <label className="flex items-start gap-2 text-sm text-ink-muted">
            <input type="checkbox" checked={b.extinguido} onChange={(e) => set({ ...b, extinguido: e.target.checked })} className="mt-1 accent-brand" />
            Este año vendí o cancelé algo de {nombre} que ya había declarado
          </label>
        </>
      )}
    </div>
  );

  return (
    <div className="card not-prose grid gap-6 p-6 md:grid-cols-2">
      <form className="grid gap-5" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="grid gap-2">
          <legend className="mb-1 text-sm font-semibold text-ink">1. Cuentas en entidades extranjeras</legend>
          <div className="grid grid-cols-2 gap-3">
            <CampoNumero label="Saldo a 31 de diciembre (€)" value={saldoCuentas31} onChange={setSaldoCuentas31} />
            <CampoNumero label="Saldo medio del 4.º trimestre (€)" value={saldoCuentasMedio} onChange={setSaldoCuentasMedio} />
          </div>
          {historial(cuentas, setCuentas, 'cuentas')}
        </fieldset>
        <fieldset className="grid gap-2">
          <legend className="mb-1 text-sm font-semibold text-ink">2. Valores, fondos y ETF en el extranjero</legend>
          <CampoNumero
            label="Valor a 31 de diciembre (€)"
            value={valores.valor}
            onChange={(v) => setValores({ ...valores, valor: v })}
            ayuda="Lo que tengas en un broker o entidad extranjera, al precio de ese día."
          />
          {historial(valores, setValores, 'valores')}
        </fieldset>
        <fieldset className="grid gap-2">
          <legend className="mb-1 text-sm font-semibold text-ink">3. Inmuebles en el extranjero</legend>
          <CampoNumero label="Valor (€)" value={inmuebles.valor} onChange={(v) => setInmuebles({ ...inmuebles, valor: v })} ayuda="Valor de adquisición." />
          {historial(inmuebles, setInmuebles, 'inmuebles')}
        </fieldset>
      </form>

      <PanelResultados>
        <p className={alguno ? 'font-display text-xl font-semibold text-accent' : 'font-display text-xl font-semibold text-brand'}>
          {alguno ? 'Parece que tienes que presentar el modelo 720' : 'Con estos datos, no tendrías que presentarlo'}
        </p>
        <ul className="grid gap-3">
          {bloques.map((b) => (
            <li key={b.nombre} className="text-sm">
              <span className="font-semibold text-ink">{b.nombre}:</span>{' '}
              <span className={b.r.obligado ? 'text-accent' : 'text-ink-muted'}>
                {b.r.obligado ? 'hay que declararlo. ' : 'no hace falta. '}
                {b.r.motivo}
              </span>
            </li>
          ))}
        </ul>
        {alguno && (
          <p className="text-sm text-ink-muted">
            Plazo: {MODELO_720.plazo}. Si ya ha pasado y nadie te lo ha requerido, presentarlo cuanto
            antes reduce la sanción a la mitad.
          </p>
        )}
        <NotaCalculo>
          Orientativo. No valora casos especiales (cotitularidad, activos registrados en la
          contabilidad de una empresa, fondos extranjeros depositados en entidades españolas). Ante
          la duda, consulta a un asesor fiscal o la sede de la Agencia Tributaria.
        </NotaCalculo>
      </PanelResultados>
    </div>
  );
}
