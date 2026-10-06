/**
 * Utilidades de la página /hoy/: sacan trozos de la última edición de /mercados/ (el cuerpo en Markdown
 * que escribe la rutina diaria) y rotan, sin ningún servidor, el reto y el término del día.
 */

/** Escapa HTML y convierte el Markdown en línea más simple (negrita, cursiva y enlaces). */
export function inlineAHtml(texto: string): string {
  const esc = texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*(?!\*)(.+?)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)\s]+)\)/g, '<a href="$2">$1</a>');
}

/** Elementos de lista (`- ...`) de la sección cuyo título (`## ...`) cumple el patrón. */
export function elementosDeSeccion(cuerpo: string, titulo: RegExp, max = 8): string[] {
  const lineas = cuerpo.replace(/\r\n/g, '\n').split('\n');
  const inicio = lineas.findIndex((l) => /^##\s/.test(l) && titulo.test(l));
  if (inicio === -1) return [];
  const items: string[] = [];
  for (let i = inicio + 1; i < lineas.length; i++) {
    const l = lineas[i];
    if (/^##\s/.test(l)) break;
    if (/^[-*]\s+/.test(l)) items.push(l.replace(/^[-*]\s+/, '').trim());
    else if (/^\s+\S/.test(l) && items.length > 0) items[items.length - 1] += ` ${l.trim()}`;
  }
  return items.slice(0, max);
}

/** Primer párrafo de la sección (para cuando no hay lista). */
export function parrafoDeSeccion(cuerpo: string, titulo: RegExp): string | null {
  const lineas = cuerpo.replace(/\r\n/g, '\n').split('\n');
  const inicio = lineas.findIndex((l) => /^##\s/.test(l) && titulo.test(l));
  if (inicio === -1) return null;
  const parrafo: string[] = [];
  for (let i = inicio + 1; i < lineas.length; i++) {
    const l = lineas[i];
    if (/^##\s/.test(l)) break;
    if (l.trim() === '') {
      if (parrafo.length) break;
      continue;
    }
    if (/^[-*]\s/.test(l)) return null;
    parrafo.push(l.trim());
  }
  return parrafo.length ? parrafo.join(' ') : null;
}

/** Minutos de lectura de un texto (200 palabras por minuto, mínimo 1). */
export function minutosDeLectura(cuerpo: string): number {
  const palabras = cuerpo
    .replace(/^---[\s\S]*?---/, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#*_>`\-|]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(palabras / 200));
}

/** Día del año (1-366) en UTC: sirve para rotar contenido de forma estable durante todo el día. */
export function diaDelAnio(fecha: Date): number {
  const inicio = Date.UTC(fecha.getUTCFullYear(), 0, 0);
  return Math.floor((fecha.getTime() - inicio) / 86_400_000);
}
