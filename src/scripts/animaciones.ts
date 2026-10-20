/**
 * Animaciones ligeras del sitio (sin librerías). Todo es mejora progresiva: sin JS, o con
 * movimiento reducido, se ve el contenido final tal cual. No usa `style` (lo bloquea la CSP):
 * solo cambia texto, clases y atributos.
 *
 * - [data-cuenta]: la cifra cuenta desde 0 hasta su valor al entrar en pantalla. El texto final
 *   se queda en una copia invisible que reserva el ancho, así no se mueve nada (CLS 0).
 * - [data-grafica]: el trazo de la gráfica SVG se dibuja al aparecer (clases .grafica-espera y
 *   .grafica-dibuja de global.css).
 * - [data-indice]: marca en el índice del artículo la sección que se está leyendo.
 */

const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Formato español con punto de miles siempre (Intl no agrupa los números de 4 cifras). */
function formatear(valor: number, decimales: number): string {
  const [entero, dec] = valor.toFixed(decimales).split('.');
  const conPuntos = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return dec ? `${conPuntos},${dec}` : conPuntos;
}

const NUMERO = /\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+(?:,\d+)?/;

function prepararCifra(el: HTMLElement): (() => void) | null {
  const final = el.textContent ?? '';
  const m = final.match(NUMERO);
  if (!m || m.index === undefined) return null;
  const antes = final.slice(0, m.index);
  const despues = final.slice(m.index + m[0].length);
  const decimales = m[0].includes(',') ? m[0].split(',')[1].length : 0;
  const objetivo = Number(m[0].replace(/\./g, '').replace(',', '.'));
  if (!Number.isFinite(objetivo)) return null;

  // Copia invisible con el texto final (reserva el ancho y el alto) y, encima, la cifra que
  // cuenta. Los lectores de pantalla solo leen el valor final.
  const pila = document.createElement('span');
  pila.className = 'cifra-pila';
  pila.setAttribute('aria-hidden', 'true');
  const fantasma = document.createElement('span');
  fantasma.className = 'cifra-fantasma';
  fantasma.textContent = final;
  const viva = document.createElement('span');
  viva.className = 'cifra-viva';
  viva.textContent = final;
  pila.appendChild(fantasma);
  pila.appendChild(viva);
  const lector = document.createElement('span');
  lector.className = 'sr-only';
  lector.textContent = final;
  el.textContent = '';
  el.appendChild(pila);
  el.appendChild(lector);

  return () => {
    const duracion = 1100;
    const inicio = performance.now();
    const paso = (ahora: number) => {
      const t = Math.min(1, (ahora - inicio) / duracion);
      const suave = 1 - Math.pow(1 - t, 3);
      viva.textContent = t < 1 ? `${antes}${formatear(objetivo * suave, decimales)}${despues}` : final;
      if (t < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  };
}

function alAparecer(elementos: Element[], accion: (el: Element) => void) {
  if (elementos.length === 0) return;
  const io = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        accion(e.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px' }
  );
  elementos.forEach((el) => io.observe(el));
}

if (!reducido && 'IntersectionObserver' in window) {
  // Cifras que cuentan.
  const arranques = new Map<Element, () => void>();
  document.querySelectorAll<HTMLElement>('[data-cuenta]').forEach((el) => {
    const arrancar = prepararCifra(el);
    if (arrancar) arranques.set(el, arrancar);
  });
  alAparecer([...arranques.keys()], (el) => arranques.get(el)?.());

  // Gráficas que se dibujan.
  const graficas = [...document.querySelectorAll('[data-grafica]')];
  graficas.forEach((g) => g.classList.add('grafica-espera'));
  alAparecer(graficas, (g) => {
    g.classList.add('grafica-dibuja');
    g.classList.remove('grafica-espera');
  });
}

// Índice del artículo: marca la sección visible (no es animación, va también con movimiento reducido).
const enlacesIndice = document.querySelectorAll<HTMLAnchorElement>('[data-indice] a[href^="#"]');
if (enlacesIndice.length > 0 && 'IntersectionObserver' in window) {
  const enlaces = new Map<string, HTMLAnchorElement[]>();
  enlacesIndice.forEach((a) => {
    const id = decodeURIComponent(a.hash.slice(1));
    enlaces.set(id, [...(enlaces.get(id) ?? []), a]);
  });
  const titulos = [...enlaces.keys()].map((id) => document.getElementById(id)).filter((t): t is HTMLElement => !!t);
  const visibles = new Set<string>();
  let actual = '';
  const marcar = (id: string) => {
    if (id === actual) return;
    enlaces.get(actual)?.forEach((a) => a.removeAttribute('aria-current'));
    enlaces.get(id)?.forEach((a) => a.setAttribute('aria-current', 'location'));
    actual = id;
  };
  const io = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (e.isIntersecting) visibles.add(e.target.id);
        else visibles.delete(e.target.id);
      }
      // La primera sección visible manda; si no hay ninguna, la última que quedó por encima.
      const primera = titulos.find((t) => visibles.has(t.id));
      if (primera) return marcar(primera.id);
      const porEncima = titulos.filter((t) => t.getBoundingClientRect().top < 0).at(-1);
      if (porEncima) marcar(porEncima.id);
    },
    { rootMargin: '0px 0px -60% 0px' }
  );
  titulos.forEach((t) => io.observe(t));
}
