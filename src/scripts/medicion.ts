/**
 * Medición de los bloques `[data-cta]` (ver src/lib/medicion.ts y src/config/cta.mjs).
 * Sin cookies ni almacenamiento; se desactiva con "No rastrear" (DNT) o Global Privacy Control, y en navegadores
 * automatizados. Eventos: vista (el bloque se ve al menos un 50 % durante la visita), clic (en un enlace del bloque) y
 * envío (alta correcta en el formulario de la newsletter del bloque). No envía nada que identifique a la persona.
 */
const nav = navigator as Navigator & { globalPrivacyControl?: boolean; doNotTrack?: string | null };
const noMedir = nav.doNotTrack === '1' || nav.globalPrivacyControl === true || nav.webdriver === true;

function enviar(bloque: HTMLElement, e: 'vista' | 'clic' | 'envio') {
  const cuerpo = JSON.stringify({ e, p: bloque.dataset.ctaPos, v: bloque.dataset.ctaVar, t: bloque.dataset.ctaTema });
  const datos = new Blob([cuerpo], { type: 'application/json' });
  if (!(navigator.sendBeacon && navigator.sendBeacon('/api/medir', datos))) {
    fetch('/api/medir', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: cuerpo, keepalive: true }).catch(() => {});
  }
}

if (!noMedir) {
  const bloques = Array.from(document.querySelectorAll<HTMLElement>('[data-cta]'));
  if (bloques.length && 'IntersectionObserver' in window) {
    const visto = new WeakSet<Element>();
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const en of entradas) {
          if (en.isIntersecting && !visto.has(en.target)) {
            visto.add(en.target);
            obs.unobserve(en.target);
            enviar(en.target as HTMLElement, 'vista');
          }
        }
      },
      { threshold: 0.5 }
    );
    bloques.forEach((b) => obs.observe(b));
  }
  document.addEventListener('click', (ev) => {
    const a = (ev.target as Element | null)?.closest('a');
    const bloque = a?.closest<HTMLElement>('[data-cta]');
    if (a && bloque) enviar(bloque, 'clic');
  });
  document.addEventListener('wu-suscrito', (ev) => {
    const bloque = (ev.target as Element | null)?.closest<HTMLElement>('[data-cta]');
    if (bloque) enviar(bloque, 'envio');
  });
}
