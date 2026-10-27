import { useMemo } from 'react';
import { useEstadoUrl } from './CalculatorUI';
import { PERFILES, eventosDePerfil, type EventoFiscal, type Perfil } from '../lib/calculos/calendario-fiscal';

interface Props {
  /** Todos los eventos con fecha futura en el momento del build; el filtro por perfil se hace aquí. */
  eventos: EventoFiscal[];
  /** Fecha del build (AAAA-MM-DD, hora de Madrid), para no enseñar fechas ya pasadas. */
  desde: string;
}

const ETIQUETA_ESTADO: Record<EventoFiscal['estado'], string> = {
  oficial: 'Fecha oficial',
  norma: 'Fijada por la norma',
  previsto: 'Prevista',
};

const CLASE_ESTADO: Record<EventoFiscal['estado'], string> = {
  oficial: 'bg-brand-soft text-brand',
  norma: 'bg-brand-soft text-brand',
  previsto: 'bg-cream text-ink-muted',
};

const fechaLarga = (f: string) =>
  new Date(`${f}T12:00:00Z`).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export default function CalendarioFiscal({ eventos, desde }: Props) {
  const [perfil, setPerfil] = useEstadoUrl<Perfil>('perfil', 'asalariado', {
    validar: (v) => PERFILES.some((p) => p.id === v),
  });
  const lista = useMemo(() => eventosDePerfil(perfil, desde, eventos), [perfil, desde, eventos]);
  const conFecha = lista.filter((e) => e.fecha !== null);
  const sinFecha = lista.filter((e) => e.fecha === null);
  const actual = PERFILES.find((p) => p.id === perfil)!;

  return (
    <div className="not-prose">
      <fieldset className="mb-6">
        <legend className="mb-2 text-sm font-semibold text-ink">¿Cuál es tu perfil?</legend>
        <div className="flex flex-wrap gap-2">
          {PERFILES.map((p) => (
            <label
              key={p.id}
              className={
                perfil === p.id
                  ? 'cursor-pointer rounded-full border border-brand bg-brand px-4 py-2 text-sm font-semibold text-white has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand'
                  : 'cursor-pointer rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-ink hover:border-brand has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand'
              }
            >
              <input
                type="radio"
                name="perfil-fiscal"
                value={p.id}
                checked={perfil === p.id}
                onChange={() => setPerfil(p.id)}
                className="sr-only"
              />
              {p.nombre}
            </label>
          ))}
        </div>
        <p className="mt-2 text-sm text-ink-muted">{actual.ayuda}</p>
      </fieldset>

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl bg-cream p-4">
        <a href={`/herramientas/calendario-fiscal/${perfil}.ics`} download className="btn-primary text-sm">
          Descargar calendario (.ics) de {actual.nombre.toLowerCase()}
        </a>
        <p className="text-sm text-ink-muted">
          Se abre en Google Calendar, Apple Calendar u Outlook, con un aviso 7 días y otro 1 día antes de cada fecha.
        </p>
      </div>

      <ol className="grid gap-4" aria-live="polite">
        {conFecha.map((e) => (
          <li key={e.id} className="rounded-xl border border-border bg-white p-5">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <time dateTime={e.fecha!} className="text-sm font-semibold capitalize text-brand">
                {fechaLarga(e.fecha!)}
              </time>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${CLASE_ESTADO[e.estado]}`}>{ETIQUETA_ESTADO[e.estado]}</span>
            </div>
            <h3 className="text-base font-semibold text-ink">{e.titulo}</h3>
            <p className="mt-1 text-sm text-ink-muted">{e.detalle}</p>
            <p className="mt-2 text-xs text-ink-faint">
              Fuente:{' '}
              <a href={e.fuente.url} rel="noopener noreferrer" className="underline">
                {e.fuente.etiqueta}
              </a>
            </p>
          </li>
        ))}
      </ol>

      {sinFecha.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 text-base font-semibold text-ink">Pendiente de fecha oficial</h3>
          <ul className="grid gap-4">
            {sinFecha.map((e) => (
              <li key={e.id} className="rounded-xl border border-dashed border-border bg-white p-5">
                <h4 className="text-base font-semibold text-ink">{e.titulo}</h4>
                <p className="mt-1 text-sm text-ink-muted">{e.detalle}</p>
                <p className="mt-2 text-xs text-ink-faint">
                  Fuente:{' '}
                  <a href={e.fuente.url} rel="noopener noreferrer" className="underline">
                    {e.fuente.etiqueta}
                  </a>
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
