// @ts-check
/**
 * Publicidad (Google AdSense). PREPARADO PERO DESACTIVADO: mientras `activo` sea false el sitio no
 * carga nada de Google, no abre la CSP y no pinta huecos. Procedimiento completo y orden de
 * activación en ADSENSE-PROCEDIMIENTO.md (no activar sin el banner de consentimiento funcionando,
 * sin actualizar privacidad y cookies, y sin revisar la CSP: ver ese documento).
 *
 * Es un .mjs para poder importarlo también desde astro.config.mjs.
 */
export const ADS = {
  /** Interruptor general. Debe seguir en false hasta que David tenga la cuenta aprobada. */
  activo: false,
  /** Identificador de editor de AdSense, p. ej. 'ca-pub-1234567890123456'. Lo da la cuenta de AdSense. */
  publisherId: /** @type {string | null} */ (null),
  /** Identificadores de bloque (data-ad-slot) creados en AdSense, por posición. */
  slots: /** @type {Record<string, string | null>} */ ({
    articulo: null,
    herramienta: null,
  }),
};

/** true solo si todo lo necesario está relleno: evita activarlo a medias. */
export const adsListos = () => ADS.activo && Boolean(ADS.publisherId);
