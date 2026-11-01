/**
 * Título de la etiqueta <title> y de las vistas previas (og:title, twitter:title).
 * Google corta los títulos de más de unos 60 caracteres: en las ediciones de mercados y los números de
 * la newsletter, cuyo titular lo escribe una rutina, se recorta aquí en el último espacio y se añade
 * "…", en vez de reescribir cada pieza a mano. El H1 de la página conserva el titular completo.
 */
export const TITULO_MAX = 60;

export function tituloParaBuscadores(title: string, max: number = TITULO_MAX): string {
  if (title.length <= max) return title;
  const corte = title.slice(0, max - 1);
  const ultimoEspacio = corte.lastIndexOf(' ');
  const base = ultimoEspacio > max / 2 ? corte.slice(0, ultimoEspacio) : corte;
  return `${base.replace(/[\s,;:.\-–]+$/, '')}…`;
}
