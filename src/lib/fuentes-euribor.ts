// Las fuentes de los artículos (frontmatter `sources`) son texto fijo, pero el euríbor que muestran sale de
// src/data/euribor/ultimo.json y cambia cada mes. Si una fuente enlaza la resolución del BOE de un mes anterior,
// se cambia por la del último mes publicado (enlace, código BOE-A y nombre del mes), para que la cifra y su fuente
// coincidan siempre sin tocar cada artículo.

export interface Fuente {
  label: string;
  url: string;
}

interface DatosEuribor {
  fuenteUrl: string;
  ultimoMes: string; // AAAA-MM
  ultimoBoe: string;
  historico: { mes: string; boe: string }[];
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const mesEnTexto = (aaaamm: string) => {
  const [a, m] = aaaamm.split('-').map(Number);
  return `${MESES[m - 1]} de ${a}`;
};

export function fuentesConEuriborVigente(fuentes: Fuente[], e: DatosEuribor): Fuente[] {
  const porBoe = new Map(e.historico.map((h) => [h.boe, h.mes]));
  return fuentes.map((f) => {
    const boe = f.url.match(/BOE-A-\d{4}-\d+/)?.[0];
    if (!boe || boe === e.ultimoBoe || !porBoe.has(boe)) return f;
    const mesViejo = mesEnTexto(porBoe.get(boe)!);
    const label = f.label.replaceAll(boe, e.ultimoBoe).replaceAll(mesViejo, mesEnTexto(e.ultimoMes));
    return { label, url: e.fuenteUrl };
  });
}
