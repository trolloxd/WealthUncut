// Dibujo de las escenas 3D (componente <Escena3D />). Este módulo es el único que importa three.js y solo se descarga
// cuando la figura entra en pantalla, hay WebGL y la persona no ha pedido menos movimiento (ver Escena3D.astro).
//
// Reglas del sitio que cumple:
// - Sin estilos en línea: el tamaño del <canvas> lo da el contenedor (clases de Tailwind) y se llama a
//   renderer.setSize(ancho, alto, false) para que three.js no escriba style="..." en el canvas.
// - Sin terceros: three.js va empaquetado con el sitio; las etiquetas se dibujan en un canvas 2D propio.
// - Accesible: el canvas se enfoca con el teclado (flechas giran, + y - acercan, Inicio reinicia) y tiene un texto
//   alternativo; los mismos datos están en la tabla de debajo.
// - Paleta de la marca (crema, verde oscuro, rojo de acento) y datos ya calculados en el servidor (src/lib/calculos/escena3d.ts).

import {
  AmbientLight,
  BoxGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three';
import type { DatosEscena } from '../lib/calculos/escena3d';

const VERDE = 0x1e4a3a;
const ROJO = 0xb3402a;
const GRIS = 0x6b6355;
const TINTA = '#1c1b17';

const numero = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const pct = (t: number) => `${String(Math.round(t * 1000) / 10).replace('.', ',')} %`;

function etiqueta(lineas: string[], escala = 1): Sprite {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const g = c.getContext('2d')!;
  g.textAlign = 'center';
  g.fillStyle = TINTA;
  lineas.forEach((t, i) => {
    g.font = `${i === 0 ? 'bold 46px' : '30px'} Inter, system-ui, sans-serif`;
    g.fillText(t, 128, 52 + i * 40);
  });
  const textura = new CanvasTexture(c);
  textura.colorSpace = SRGBColorSpace;
  const sprite = new Sprite(new SpriteMaterial({ map: textura, transparent: true, depthTest: false }));
  sprite.scale.set(2 * escala, escala, 1);
  sprite.renderOrder = 10;
  return sprite;
}

/** Caja con la base en y = 0 (para animarla creciendo con scale.y). */
function caja(ancho: number, alto: number, fondo: number, color: number, x: number, y0: number): Mesh {
  const geo = new BoxGeometry(ancho, alto, fondo);
  geo.translate(0, alto / 2, 0);
  const malla = new Mesh(geo, new MeshStandardMaterial({ color: new Color(color), roughness: 0.65, metalness: 0.05 }));
  malla.position.set(x, y0, 0);
  return malla;
}

interface Barra {
  malla: Mesh;
  etiqueta?: Sprite;
  y0: number;
  alto: number;
}

function construirIrpf(datos: DatosEscena, grupo: Group): { barras: Barra[]; ancho: number; alto: number } {
  const escalones = datos.escalones ?? [];
  const ancho = 1.7;
  const hueco = 0.12;
  const total = escalones.length * ancho + (escalones.length - 1) * hueco;
  const colores = [0x6f9a82, 0x4d7f66, 0x2f6450, VERDE, ROJO];
  const barras: Barra[] = [];
  escalones.forEach((e, i) => {
    const alto = e.tipo * 12;
    const x = -total / 2 + ancho / 2 + i * (ancho + hueco);
    const malla = caja(ancho, alto, 1.7, colores[i % colores.length], x, 0);
    const nombre = e.hasta === null ? `+${numero(e.desde)} €` : `hasta ${numero(e.hasta)} €`;
    const sprite = etiqueta([pct(e.tipo), nombre], 0.9);
    sprite.position.set(x, alto + 0.95, 0.9);
    grupo.add(malla, sprite);
    barras.push({ malla, etiqueta: sprite, y0: 0, alto });
  });
  return { barras, ancho: total, alto: 4.4 };
}

function construirInteres(datos: DatosEscena, grupo: Group): { barras: Barra[]; ancho: number; alto: number } {
  const serie = datos.serie ?? [];
  const max = Math.max(...serie.map((p) => p.total), 1);
  const altoMax = 6;
  const ancho = 0.95;
  const hueco = 0.3;
  const total = serie.length * ancho + (serie.length - 1) * hueco;
  const barras: Barra[] = [];
  serie.forEach((p, i) => {
    const x = -total / 2 + ancho / 2 + i * (ancho + hueco);
    const altoAportado = Math.max(0.05, (p.aportado / max) * altoMax);
    const altoIntereses = Math.max(0.05, (p.intereses / max) * altoMax);
    const base = caja(ancho, altoAportado, ancho, GRIS, x, 0);
    const cima = caja(ancho, altoIntereses, ancho, VERDE, x, altoAportado);
    const nombre = etiqueta([`${p.anio} años`], 0.8);
    nombre.position.set(x, -0.35, 0.9);
    const valor = etiqueta([`${numero(Math.round(p.total / 1000))} mil €`], 0.8);
    valor.position.set(x, altoAportado + altoIntereses + 0.45, 0);
    grupo.add(base, cima, nombre, valor);
    barras.push({ malla: base, y0: 0, alto: altoAportado });
    barras.push({ malla: cima, etiqueta: valor, y0: altoAportado, alto: altoIntereses });
  });
  return { barras, ancho: total, alto: altoMax + 1 };
}

const COLORES_TONO = [0x6f9a82, VERDE, GRIS, ROJO];

/** Barras agrupadas ('coste-ter' y 'cuota-euribor'): cada grupo es una fila de barras con su etiqueta debajo. */
function construirGrupos(datos: DatosEscena, grupo: Group): { barras: Barra[]; ancho: number; alto: number } {
  const grupos = datos.grupos ?? [];
  const max = Math.max(...grupos.flatMap((g) => g.barras.map((b) => b.valor)), 1);
  const altoMax = 6;
  const ancho = 1.15;
  const hueco = 0.35;
  const huecoGrupo = 0.7;
  const anchoDe = (n: number) => n * ancho + (n - 1) * hueco;
  const total = grupos.reduce((t, g) => t + anchoDe(g.barras.length), 0) + (grupos.length - 1) * huecoGrupo;
  const barras: Barra[] = [];
  let x0 = -total / 2;
  for (const g of grupos) {
    const anchoGrupo = anchoDe(g.barras.length);
    g.barras.forEach((b, i) => {
      const x = x0 + ancho / 2 + i * (ancho + hueco);
      const alto = Math.max(0.05, (b.valor / max) * altoMax);
      const malla = caja(ancho, alto, ancho, COLORES_TONO[b.tono], x, 0);
      const valor = etiqueta([b.texto], 0.7);
      valor.position.set(x, alto + 0.4, 0);
      grupo.add(malla, valor);
      barras.push({ malla, etiqueta: valor, y0: 0, alto });
    });
    // Con una sola fila (cuota por euríbor) la etiqueta de cada barra va debajo; con varias, la del grupo.
    if (grupos.length > 1) {
      const nombre = etiqueta([g.etiqueta], 0.9);
      nombre.position.set(x0 + anchoGrupo / 2, -0.4, 0.9);
      grupo.add(nombre);
    } else {
      g.barras.forEach((b, i) => {
        const nombre = etiqueta([b.etiqueta.replace('Euríbor ', '')], 0.75);
        nombre.position.set(x0 + ancho / 2 + i * (ancho + hueco), -0.4, 0.9);
        grupo.add(nombre);
      });
    }
    x0 += anchoGrupo + huecoGrupo;
  }
  return { barras, ancho: total, alto: altoMax + 1 };
}

export async function montar(figura: HTMLElement): Promise<void> {
  const lienzo = figura.querySelector<HTMLElement>('[data-lienzo]');
  const plano = figura.querySelector<HTMLElement>('[data-plano]');
  if (!lienzo || !plano || !figura.dataset.datos) return;
  const datos = JSON.parse(figura.dataset.datos) as DatosEscena;

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    return; // sin WebGL se queda la versión en 2D y la tabla
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const escena = new Scene();
  escena.add(new AmbientLight(0xffffff, 1.15));
  const sol = new DirectionalLight(0xffffff, 1.6);
  sol.position.set(-4, 9, 7);
  escena.add(sol);

  const grupo = new Group();
  escena.add(grupo);
  const { barras, ancho, alto } =
    datos.tipo === 'irpf-ahorro' ? construirIrpf(datos, grupo) : datos.grupos ? construirGrupos(datos, grupo) : construirInteres(datos, grupo);

  const camara = new PerspectiveCamera(32, 1.6, 0.1, 100);
  const objetivo = new Vector3(0, alto / 2.3, 0);
  const estadoInicial = { yaw: -0.5, pitch: 0.32, zoom: datos.grupos ? 0.75 : 1 };
  const estado = { ...estadoInicial };

  let pintando = false;
  const pintar = () => {
    if (pintando) return;
    pintando = true;
    requestAnimationFrame(() => {
      pintando = false;
      const aspecto = camara.aspect;
      // Distancia para que el gráfico quepa a lo ancho también en pantallas estrechas.
      const base = (Math.max(ancho * 1.05, alto * 1.5) / (2 * Math.tan((camara.fov * Math.PI) / 360))) * Math.max(1, 1.5 / aspecto);
      const r = base * estado.zoom;
      camara.position.set(
        objetivo.x + r * Math.sin(estado.yaw) * Math.cos(estado.pitch),
        objetivo.y + r * Math.sin(estado.pitch),
        objetivo.z + r * Math.cos(estado.yaw) * Math.cos(estado.pitch)
      );
      camara.lookAt(objetivo);
      renderer.render(escena, camara);
    });
  };

  const ajustar = () => {
    const w = Math.max(1, lienzo.clientWidth);
    const h = Math.max(1, lienzo.clientHeight);
    renderer.setSize(w, h, false); // false: no escribe estilos en línea (CSP)
    camara.aspect = w / h;
    camara.updateProjectionMatrix();
    pintar();
  };

  const canvas = renderer.domElement;
  canvas.className =
    'absolute inset-0 block h-full w-full cursor-grab touch-pan-y touch-pinch-zoom focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand';
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', `${datos.resumen} Gráfico en 3D: con el gráfico seleccionado, gíralo con las flechas del teclado.`);
  canvas.setAttribute('aria-keyshortcuts', 'ArrowLeft ArrowRight ArrowUp ArrowDown Plus - Home');
  lienzo.appendChild(canvas);
  plano.hidden = true;
  figura.dataset.escena3dLista = 'true';

  // Giro con el ratón o el dedo (en táctil solo en horizontal: el scroll vertical sigue funcionando).
  let arrastre: { x: number; y: number } | null = null;
  canvas.addEventListener('pointerdown', (e) => {
    arrastre = { x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!arrastre) return;
    estado.yaw = Math.max(-1.45, Math.min(1.45, estado.yaw - (e.clientX - arrastre.x) * 0.006));
    estado.pitch = Math.max(0.05, Math.min(1.2, estado.pitch + (e.clientY - arrastre.y) * 0.004));
    arrastre = { x: e.clientX, y: e.clientY };
    pintar();
  });
  const soltar = () => {
    arrastre = null;
  };
  canvas.addEventListener('pointerup', soltar);
  canvas.addEventListener('pointercancel', soltar);

  canvas.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return; // no robar el zoom del navegador ni "atrás"
    const paso = 0.12;
    let cambio = true;
    if (e.key === 'ArrowLeft') estado.yaw = Math.max(-1.45, estado.yaw - paso);
    else if (e.key === 'ArrowRight') estado.yaw = Math.min(1.45, estado.yaw + paso);
    else if (e.key === 'ArrowUp') estado.pitch = Math.min(1.2, estado.pitch + paso);
    else if (e.key === 'ArrowDown') estado.pitch = Math.max(0.05, estado.pitch - paso);
    else if (e.key === '+' || e.key === '=') estado.zoom = Math.max(0.5, estado.zoom - 0.1);
    else if (e.key === '-') estado.zoom = Math.min(1.4, estado.zoom + 0.1);
    else if (e.key === 'Home') Object.assign(estado, estadoInicial);
    else cambio = false;
    if (cambio) {
      e.preventDefault();
      pintar();
    }
  });

  new ResizeObserver(ajustar).observe(lienzo);
  ajustar();

  // Entrada: las barras crecen en unos 0,7 s (solo llega aquí quien no ha pedido menos movimiento).
  const inicio = performance.now();
  const duracion = 700;
  const crecer = (ahora: number) => {
    const t = Math.min(1, (ahora - inicio) / duracion);
    const suave = 1 - Math.pow(1 - t, 3);
    for (const b of barras) {
      b.malla.scale.y = Math.max(0.001, suave);
      b.malla.position.y = b.y0 * suave;
      if (b.etiqueta) b.etiqueta.position.y = (b.y0 + b.alto) * suave + (datos.tipo === 'irpf-ahorro' ? 0.95 : datos.grupos ? 0.4 : 0.45);
    }
    pintar();
    if (t < 1) requestAnimationFrame(crecer);
  };
  requestAnimationFrame(crecer);

  // Si el navegador pierde el contexto WebGL (habitual en móvil con muchas pestañas), vuelve la versión 2D.
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    canvas.hidden = true;
    plano.hidden = false;
    // Las barras de la versión plana pueden haberse quedado ocultas (se dibujan al entrar en pantalla): se muestran ya.
    plano.querySelectorAll('[data-barra]').forEach((b) => b.setAttribute('data-barra', 'lista'));
  });
  canvas.addEventListener('webglcontextrestored', () => {
    canvas.hidden = false;
    plano.hidden = true;
    pintar();
  });
  addEventListener('pagehide', (e) => {
    if (!e.persisted) renderer.dispose();
  });
}
