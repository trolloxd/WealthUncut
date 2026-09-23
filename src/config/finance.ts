/**
 * Cifras fiscales centralizadas, con fuente y fecha de verificación.
 *
 * Verificadas el 2026-09-23 contra la fuente oficial enlazada en cada constante (Manual práctico
 * de Renta 2025 de la AEAT, preguntas frecuentes del modelo 720, BOE y FGD). La verificación la
 * hizo Claude a petición expresa de David, que delegó la confirmación. Son las cifras del
 * ejercicio 2025; revisarlas cada año cuando la AEAT publique el manual del ejercicio siguiente.
 * No añadir tramos ni tipos nuevos sin fuente + fecha; cualquier cifra nueva sin verificar se
 * marca VERIFICAR hasta confirmarla.
 */

// Tramos del IRPF del ahorro (rendimientos del capital mobiliario y ganancias patrimoniales).
// Suma de la escala estatal (9,5/10,5/11,5/13,5/15%) y la autonómica (misma escala, fijada en el
// art. 76 Ley 35/2006, igual en todas las comunidades). El último tramo sube del 28% al 30% desde
// el 1 de enero de 2025 (Ley 7/2024, disposición final séptima). Verificado el 2026-09-23 en las
// páginas "Gravamen estatal" y "Gravamen autonómico" del Manual práctico de Renta 2025.
export const IRPF_AHORRO_BRACKETS = [
  { hasta: 6000, tipo: 0.19 },
  { hasta: 50000, tipo: 0.21 },
  { hasta: 200000, tipo: 0.23 },
  { hasta: 300000, tipo: 0.27 },
  { hasta: Infinity, tipo: 0.3 },
] as const;

export const IRPF_AHORRO_FUENTE = {
  fuente: 'Agencia Tributaria, Manual práctico de Renta 2025, gravamen de la base liquidable del ahorro (estatal + autonómico)',
  url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c15-calculo-impuesto-determinacion-cuotas-integras/gravamen-base-liquidable-ahorro.html',
  fechaRegistro: '2026-09-23',
  verificado: true,
} as const;

// Retención (pago a cuenta) que practica la gestora al reembolsar participaciones de fondos con
// ganancia. No es el impuesto final: se regulariza en la declaración de la renta. Verificado el
// 2026-09-23: AEAT, Manual práctico de Renta 2025, ganancias patrimoniales sujetas a retención
// ("retención o ingreso a cuenta del 19 por 100 en el ejercicio 2025").
export const RETENCION_REEMBOLSO_FONDOS = 0.19;

// Reglas de compensación dentro de la base del ahorro (art. 49 Ley 35/2006).
// Las pérdidas patrimoniales pueden compensar hasta este porcentaje del saldo
// positivo de rendimientos del capital mobiliario (y viceversa), y lo que no se
// compense puede arrastrarse durante estos años. Fuente: AEAT, Manual práctico
// de Renta 2025, capítulo 12. Verificado el 2026-09-23.
export const COMPENSACION_AHORRO = {
  limiteCruzado: 0.25,
  aniosArrastre: 4,
  url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c12-integracion-compensacion-rentas/reglas-integracion-compensacion-rentas.html',
} as const;

// Regla antiaplicación de pérdidas por recompra de valores homogéneos
// (art. 33.5 f y g Ley 35/2006). Si vendes con pérdidas y recompras lo mismo dentro
// de este plazo (antes o después), la pérdida no se computa hasta que vendas lo
// recomprado. Las participaciones de fondos no cotizados entran en el plazo largo.
// Fuente: AEAT, Manual práctico de Renta 2025, pérdidas que no se computan ("dos meses" para
// valores admitidos a negociación, "un año" para los no admitidos). Verificado el 2026-09-23.
export const REGLA_RECOMPRA = {
  valoresCotizados: 'dos meses',
  valoresNoCotizados: 'un año',
  url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c11-ganancias-perdidas-patrimoniales/ganancias-perdidas-patrimoniales-que-no-bi/perdidas-patrimoniales-que-no-se-tales.html',
} as const;

// Modelo 720 (declaración informativa de bienes y derechos en el extranjero). Umbral por cada
// uno de los tres bloques, incremento que obliga a volver a presentarlo y plazo: AEAT, preguntas
// frecuentes del modelo 720, y Orden HAP/72/2013. Sanciones: tras la sentencia del TJUE de
// 27/01/2022 (C-788/19) y la Ley 5/2022 se aplica el régimen general, art. 198 Ley 58/2003 (BOE):
// 20 € por dato, mínimo 300 €, máximo 20.000 €, a la mitad si se presenta fuera de plazo sin
// requerimiento previo; se aplica por separado a cada bloque. Verificado el 2026-09-23.
export const MODELO_720 = {
  umbralPorBloque: 50000,
  incrementoParaRepetir: 20000,
  plazo: 'del 1 de enero al 31 de marzo del año siguiente',
  sancionPorDato: 20,
  sancionMinima: 300,
  sancionMaxima: 20000,
  url: 'https://sede.agenciatributaria.gob.es/Sede/todas-gestiones/impuestos-tasas/declaraciones-informativas/modelo-720-decla_____sobre-bienes-derechos-extranjero_/preguntas-frecuentes.html',
} as const;

// Cobertura del Fondo de Garantía de Depósitos de Entidades de Crédito para depósitos dinerarios,
// por titular y entidad. Fuente: fgd.es ("hasta 100.000 € por titular y entidad"). Verificado el
// 2026-09-23.
export const FGD_COBERTURA = {
  importe: 100000,
  url: 'https://www.fgd.es/informacion-general/que-es-el-fgd/depositos-dinerarios/',
} as const;

// Artículos con ejemplos resueltos que usan los tipos del ahorro (19%, 21%, 23%) escritos en el
// texto: si cambian los tramos, revisar como-tributan-los-fondos-de-inversion-en-espana,
// ter-fondo-que-es, rentabilidad-neta-fondo-indexado, interes-compuesto-explicado-con-ejemplos
// y la portada (src/pages/index.astro), además de este archivo.

/** Calcula el impuesto total sobre una ganancia aplicando los tramos progresivos del ahorro. */
export function calcularImpuestoAhorro(ganancia: number): number {
  if (ganancia <= 0) return 0;

  let restante = ganancia;
  let impuesto = 0;
  let limiteAnterior = 0;

  for (const tramo of IRPF_AHORRO_BRACKETS) {
    const anchoTramo = tramo.hasta - limiteAnterior;
    const baseTramo = Math.min(restante, anchoTramo);
    if (baseTramo <= 0) break;
    impuesto += baseTramo * tramo.tipo;
    restante -= baseTramo;
    limiteAnterior = tramo.hasta;
    if (restante <= 0) break;
  }

  return impuesto;
}
