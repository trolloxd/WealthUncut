/**
 * Título de la etiqueta <title> y de las vistas previas (og:title, twitter:title).
 * Google corta los títulos de más de unos 60 caracteres: en las ediciones de mercados y los números de
 * la newsletter, cuyo titular lo escribe una rutina, se recorta aquí en el último espacio y se añade
 * "…", en vez de reescribir cada pieza a mano. El H1 de la página conserva el titular completo.
 */
export const TITULO_MAX = 60;

// Palabras que no pueden quedar al final de un título recortado («…roza los…», «…subidas de…»).
const COLA_VACIA = /\s+(a|al|ante|con|de|del|desde|e|el|en|entre|hasta|la|las|lo|los|mientras|o|para|por|que|se|sin|sobre|su|sus|tras|un|una|y)$/i;

export function tituloParaBuscadores(title: string, max: number = TITULO_MAX): string {
  if (title.length <= max) return title;
  const corte = title.slice(0, max - 1);
  const ultimoEspacio = corte.lastIndexOf(' ');
  let base = ultimoEspacio > max / 2 ? corte.slice(0, ultimoEspacio) : corte;
  for (let i = 0; i < 4; i++) {
    const limpio = base.replace(/[\s,;:\-–]+$/, '').replace(COLA_VACIA, '');
    if (limpio === base) break;
    base = limpio;
  }
  // El punto final solo se quita si no es el de una abreviatura como «EE. UU.».
  base = /\bUU\.$/.test(base) ? base : base.replace(/\.+$/, '');
  return `${base}…`;
}
