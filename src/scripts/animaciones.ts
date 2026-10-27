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
 * - [data-rv]: aparición escalonada de los bloques de cada página al entrar en pantalla (sistema común, ver
 *   `prepararAparicion` y src/styles/movimiento.css). Se aplica sola a los hijos de <main> que quedan bajo la
 *   primera pantalla y a las tarjetas de sus rejillas; no hace falta marcar nada en cada página.
 * - [data-barra]: barras que se dibujan al entrar en pantalla (de izquierda a derecha, o de abajo arriba con
 *   data-barra-eje="y").
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

/** Qué partes de un bloque aparecen por separado: si lleva una rejilla (ul.grid), sus hijos y las tarjetas de la rejilla. */
function unidadesDe(bloque: Element): Element[] {
  const hijos = [...bloque.children];
  const rejilla = hijos.find((h) => h.matches('ul.grid, ol.grid'));
  if (!rejilla) return [bloque];
  return hijos.flatMap((h) => (h === rejilla ? [...h.children] : [h]));
}

/** Bloques que no entran en el sistema: ya tienen su propia entrada, son fijos o son texto largo del artículo. */
const EXCLUIDOS = 'article, .prose, .barra-lectura, [data-escalona], .aparece, .entra, [data-sin-rv], [hidden], script, style';

function prepararAparicion() {
  const altoPantalla = window.innerHeight;
  // Un div.grid directo de <main> (p. ej. las letras del glosario) cuenta como contenedor: sus hijos son los bloques.
  const hijosDeMain = [...document.querySelectorAll('main > *')].flatMap((b) => (b.matches('div.grid') ? [...b.children] : [b]));
  const bloques = hijosDeMain.filter((b) => !b.matches(EXCLUIDOS) && !b.querySelector('article, .prose'));
  const unidades = bloques
    .flatMap(unidadesDe)
    .filter((u) => !u.matches(EXCLUIDOS) && !u.closest('[data-escalona], .aparece') && u.getBoundingClientRect().top > altoPantalla);
  unidades.forEach((u) => u.setAttribute('data-rv', 'espera'));

  const mostrar = (u: Element, indice: number) => {
    if (indice > 0) u.setAttribute('data-rv-d', String(Math.min(indice, 6)));
    u.setAttribute('data-rv', 'lista');
    // Cuando termina la entrada se quitan los atributos, para que el hover y el foco de la tarjeta vuelvan a ser los suyos.
    window.setTimeout(() => {
      u.removeAttribute('data-rv');
      u.removeAttribute('data-rv-d');
    }, 650 + Math.min(indice, 6) * 70 + 150);
  };

  const orden = (a: Element, b: Element) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
  const io = new IntersectionObserver(
    (entradas) => {
      const visibles = entradas.filter((e) => e.isIntersecting).map((e) => e.target);
      visibles.sort(orden).forEach((u, i) => {
        io.unobserve(u);
        mostrar(u, i);
      });
    },
    { rootMargin: '0px 0px -8% 0px' }
  );
  unidades.forEach((u) => io.observe(u));

  // Quien navega con teclado puede llegar a algo que aún no ha aparecido: se muestra al recibir el foco.
  document.addEventListener('focusin', (e) => {
    const u = (e.target as Element).closest('[data-rv="espera"]');
    if (u) {
      io.unobserve(u);
      mostrar(u, 0);
    }
  });
}

if (!reducido && 'IntersectionObserver' in window) {
  prepararAparicion();

  // Barras que se dibujan: ocultas (escala 0) hasta que entran en pantalla, las de una misma lista una tras otra.
  const barras = [...document.querySelectorAll<HTMLElement>('[data-barra]')].filter((b) => b.getBoundingClientRect().top > window.innerHeight);
  barras.forEach((b) => b.setAttribute('data-barra', 'espera'));
  const ioBarras = new IntersectionObserver(
    (entradas) => {
      entradas
        .filter((e) => e.isIntersecting)
        .forEach((e, i) => {
          ioBarras.unobserve(e.target);
          if (i > 0) e.target.setAttribute('data-rv-d', String(Math.min(i, 6)));
          e.target.setAttribute('data-barra', 'lista');
        });
    },
    { rootMargin: '0px 0px -8% 0px' }
  );
  barras.forEach((b) => ioBarras.observe(b));

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

  // Secciones con entrada escalonada (Últimos artículos de la portada). Solo se ocultan si hay JS
  // y la sección todavía está por debajo de la pantalla; si ya se ve (o se ha pasado), se queda
  // visible sin animar para que no parpadee. Se muestran al entrar en pantalla (estilos en global.css).
  const escalonadas = [...document.querySelectorAll('[data-escalona]')].filter(
    (s) => s.getBoundingClientRect().top > window.innerHeight
  );
  escalonadas.forEach((s) => s.setAttribute('data-escalona', 'espera'));
  alAparecer(escalonadas, (s) => s.setAttribute('data-escalona', 'lista'));
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
