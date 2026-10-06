// Lógica de búsqueda en el navegador, compartida por el cuadro de la cabecera y /buscar/.
export interface EntradaIndice {
  k: string;
  t: string;
  x: string;
  u: string;
}
interface EntradaPreparada extends EntradaIndice {
  _t: string;
  _x: string;
}

export const normaliza = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

let cache: Promise<EntradaPreparada[]> | null = null;

export function cargarIndice(): Promise<EntradaPreparada[]> {
  if (!cache) {
    cache = fetch('/buscador.json')
      .then((r) => (r.ok ? (r.json() as Promise<EntradaIndice[]>) : []))
      .then((lista) => lista.map((e) => ({ ...e, _t: normaliza(e.t), _x: normaliza(e.x) })))
      .catch(() => {
        cache = null;
        return [];
      });
  }
  return cache;
}

/** Todas las palabras tienen que aparecer; el título pesa más que el resto del texto. */
export function buscar(indice: EntradaPreparada[], consulta: string, max = 20): EntradaIndice[] {
  const palabras = normaliza(consulta).split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return [];
  return indice
    .filter((e) => palabras.every((p) => e._t.includes(p) || e._x.includes(p)))
    .map((e) => ({
      e,
      puntos: palabras.reduce((a, p) => a + (e._t.startsWith(p) ? 6 : e._t.includes(p) ? 4 : 1), 0),
    }))
    .sort((a, b) => b.puntos - a.puntos)
    .slice(0, max)
    .map((r) => r.e);
}
