/**
 * Cifras fiscales centralizadas. Cualquier dato marcado VERIFICAR no debe
 * usarse en producción hasta que David lo confirme contra la fuente oficial.
 * No añadir tramos ni tipos nuevos sin fuente + fecha.
 */

// VERIFICAR: tramos del IRPF del ahorro (rendimientos del capital mobiliario
// y ganancias patrimoniales). Suma de la escala estatal y la autonómica
// (art. 66 y 76 Ley 35/2006), según el Manual práctico de Renta 2025 de la AEAT.
// Registrado el 2026-09-23. El último tramo sube del 28% al 30% desde el
// 1 de enero de 2025 (Ley 7/2024, de 20 de diciembre, disposición final séptima).
// Confirmar que siguen vigentes para el ejercicio fiscal actual antes de dar
// la marca por buena.
export const IRPF_AHORRO_BRACKETS_VERIFICAR = [
  { hasta: 6000, tipo: 0.19 },
  { hasta: 50000, tipo: 0.21 },
  { hasta: 200000, tipo: 0.23 },
  { hasta: 300000, tipo: 0.27 },
  { hasta: Infinity, tipo: 0.3 },
] as const;

export const IRPF_AHORRO_FUENTE_VERIFICAR = {
  fuente: 'Agencia Tributaria, Manual práctico de Renta 2025, gravamen de la base liquidable del ahorro (estatal + autonómico)',
  url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c15-calculo-impuesto-determinacion-cuotas-integras/gravamen-base-liquidable-ahorro.html',
  fechaRegistro: '2026-09-23',
  verificado: false,
} as const;

// VERIFICAR: retención (pago a cuenta) que practica la gestora al reembolsar
// participaciones de fondos con ganancia. No es el impuesto final: se regulariza
// en la declaración de la renta. Fuente: AEAT, Manual práctico de Renta 2025,
// ganancias patrimoniales sujetas a retención. Registrado el 2026-09-23.
export const RETENCION_REEMBOLSO_FONDOS_VERIFICAR = 0.19;

// VERIFICAR: reglas de compensación dentro de la base del ahorro (art. 49 Ley 35/2006).
// Las pérdidas patrimoniales pueden compensar hasta este porcentaje del saldo
// positivo de rendimientos del capital mobiliario (y viceversa), y lo que no se
// compense puede arrastrarse durante estos años. Fuente: AEAT, Manual práctico
// de Renta 2025, capítulo 12. Registrado el 2026-09-23.
export const COMPENSACION_AHORRO_VERIFICAR = {
  limiteCruzado: 0.25,
  aniosArrastre: 4,
  url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c12-integracion-compensacion-rentas/reglas-integracion-compensacion-rentas.html',
} as const;

// VERIFICAR: regla antiaplicación de pérdidas por recompra de valores homogéneos
// (art. 33.5 f y g Ley 35/2006). Si vendes con pérdidas y recompras lo mismo dentro
// de este plazo (antes o después), la pérdida no se computa hasta que vendas lo
// recomprado. Las participaciones de fondos no cotizados entran en el plazo largo.
// Fuente: AEAT, Manual práctico de Renta 2025, pérdidas que no se computan.
// Registrado el 2026-09-23.
export const REGLA_RECOMPRA_VERIFICAR = {
  valoresCotizados: 'dos meses',
  valoresNoCotizados: 'un año',
  url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c11-ganancias-perdidas-patrimoniales/ganancias-perdidas-patrimoniales-que-no-bi/perdidas-patrimoniales-que-no-se-tales.html',
} as const;

// VERIFICAR: modelo 720 (declaración informativa de bienes y derechos en el
// extranjero). Umbral por cada uno de los tres bloques, incremento que obliga a
// volver a presentarlo y plazo. Fuente: AEAT, preguntas frecuentes del modelo 720,
// y Orden HAP/72/2013. Registrado el 2026-09-23.
export const MODELO_720_VERIFICAR = {
  umbralPorBloque: 50000,
  incrementoParaRepetir: 20000,
  plazo: 'del 1 de enero al 31 de marzo del año siguiente',
  url: 'https://sede.agenciatributaria.gob.es/Sede/todas-gestiones/impuestos-tasas/declaraciones-informativas/modelo-720-decla_____sobre-bienes-derechos-extranjero_/preguntas-frecuentes.html',
} as const;

// VERIFICAR: cobertura del Fondo de Garantía de Depósitos de Entidades de Crédito
// para depósitos dinerarios, por titular y entidad. Fuente: fgd.es. Registrado el 2026-09-23.
export const FGD_COBERTURA_VERIFICAR = {
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

  for (const tramo of IRPF_AHORRO_BRACKETS_VERIFICAR) {
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
