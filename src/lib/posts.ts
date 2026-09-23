/**
 * Un artículo está publicado si no es borrador y su fecha de publicación ya ha llegado en el
 * momento del build. Los artículos con fecha futura quedan programados: no se generan ni se
 * enlazan hasta que un build posterior a esa fecha los incluya (ver
 * .github/workflows/publicacion-programada.yml, que reconstruye el sitio los días de publicación).
 */
export function isPublished(data: { draft: boolean; pubDate: Date }): boolean {
  return !data.draft && data.pubDate.getTime() <= Date.now();
}
