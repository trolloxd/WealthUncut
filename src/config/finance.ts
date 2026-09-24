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

// Límite de reducción en la base imponible general del IRPF por aportaciones a un plan de
// pensiones individual (sistema individual, sin aportación de empresa): 1.500 €/año desde la Ley
// 11/2020. Con aportación empresarial a un plan de empleo el límite conjunto sube hasta 8.500 €
// adicionales; para autónomos que aportan a su propio plan de empleo simplificado, hasta 4.250 €
// adicionales. Al rescatarlo, todo lo cobrado (aportaciones y rendimiento) tributa como rendimiento
// del trabajo en la base general, no en la del ahorro. Fuente: AEAT, Manual práctico de Renta 2025,
// capítulo 13, reducciones por aportaciones a sistemas de previsión social. Verificado el 2026-09-24.
export const PLAN_PENSIONES = {
  limiteIndividual: 1500,
  limiteAdicionalEmpleo: 8500,
  limiteAdicionalAutonomos: 4250,
  tributaComo: 'rendimiento del trabajo en la base general del IRPF (no en la base del ahorro)',
  url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c13-determinacion-renta-contribuyente-sujeta-gravamen/reducciones-base-imponible-general/reducciones-aportaciones-contribuciones-sistemas-prevision-social/normas-comunes-aplicables-aportaciones-sistemas-social/cuadro-reducciones-aportaciones-contribuciones-sps.html',
  fechaRegistro: '2026-09-24',
  verificado: true,
} as const;

// Escala general del IRPF (estatal), aplicable a los rendimientos del trabajo entre otros. Vigente
// desde 2021 (Ley 11/2020). Fuente: AEAT, Manual práctico de Renta 2025, "Gravamen estatal".
// Verificado el 2026-09-24.
export const IRPF_GENERAL_ESTATAL = {
  brackets: [
    { hasta: 12450, tipo: 0.19 },
    { hasta: 20200, tipo: 0.24 },
    { hasta: 35200, tipo: 0.3 },
    { hasta: 60000, tipo: 0.37 },
    { hasta: 300000, tipo: 0.45 },
    { hasta: Infinity, tipo: 0.47 },
  ],
  url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c15-calculo-impuesto-determinacion-cuotas-integras/gravamen-base-liquidable-general/gravamen-estatal.html',
} as const;

/**
 * Escala autonómica del IRPF (parte que cede el Estado a cada comunidad, sobre la misma base
 * liquidable general), ejercicio 2025. Cada comunidad de régimen común fija la suya; el resultado
 * final es la escala estatal más la autonómica de donde resida el contribuyente a 31 de diciembre.
 * No incluye País Vasco ni Navarra: tienen un sistema foral propio (Diputaciones Forales y
 * Hacienda Foral de Navarra), con normativa e importes distintos que no siguen este esquema.
 * Ceuta y Melilla no tienen comunidad autónoma propia: el art. 65 de la Ley del IRPF les aplica la
 * misma escala general estatal también como escala "autonómica".
 *
 * Fuente: AEAT, Manual práctico de Renta 2025, páginas de "Gravamen autonómico" de cada comunidad
 * (una URL por comunidad, más abajo). Cada tramo se ha reconstruido a partir de la cuota íntegra
 * acumulada y el ancho de cada tramo que publica la propia AEAT, verificando que los importes
 * cuadran entre sí. Verificado el 2026-09-24.
 */
export const IRPF_GENERAL_AUTONOMICO = {
  andalucia: {
    nombre: 'Andalucía',
    brackets: [
      { hasta: 13000, tipo: 0.095 },
      { hasta: 21100, tipo: 0.12 },
      { hasta: 35200, tipo: 0.15 },
      { hasta: 60000, tipo: 0.185 },
      { hasta: Infinity, tipo: 0.225 },
    ],
    url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c15-calculo-impuesto-determinacion-cuotas-integras/gravamen-base-liquidable-general/gravamen-autonomico/comunidad-autonoma-andalucia.html',
  },
  aragon: {
    nombre: 'Aragón',
    brackets: [
      { hasta: 13072.5, tipo: 0.095 },
      { hasta: 21210, tipo: 0.12 },
      { hasta: 36960, tipo: 0.15 },
      { hasta: 52500, tipo: 0.185 },
      { hasta: 60000, tipo: 0.205 },
      { hasta: 80000, tipo: 0.23 },
      { hasta: 90000, tipo: 0.24 },
      { hasta: 130000, tipo: 0.25 },
      { hasta: Infinity, tipo: 0.255 },
    ],
    url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c15-calculo-impuesto-determinacion-cuotas-integras/gravamen-base-liquidable-general/gravamen-autonomico/comunidad-autonoma-aragon.html',
  },
  asturias: {
    nombre: 'Asturias',
    brackets: [
      { hasta: 12450, tipo: 0.09 },
      { hasta: 17707.2, tipo: 0.12 },
      { hasta: 33007.2, tipo: 0.14 },
      { hasta: 53407.2, tipo: 0.192 },
      { hasta: 70000, tipo: 0.215 },
      { hasta: 90000, tipo: 0.225 },
      { hasta: 175000, tipo: 0.25 },
      { hasta: Infinity, tipo: 0.26 },
    ],
    url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c15-calculo-impuesto-determinacion-cuotas-integras/gravamen-base-liquidable-general/gravamen-autonomico/comunidad-autonoma-principado-asturias.html',
  },
  baleares: {
    nombre: 'Illes Balears',
    brackets: [
      { hasta: 10000, tipo: 0.09 },
      { hasta: 18000, tipo: 0.1125 },
      { hasta: 30000, tipo: 0.1425 },
      { hasta: 48000, tipo: 0.175 },
      { hasta: 70000, tipo: 0.19 },
      { hasta: 90000, tipo: 0.2175 },
      { hasta: 120000, tipo: 0.2275 },
      { hasta: 175000, tipo: 0.2375 },
      { hasta: Infinity, tipo: 0.2475 },
    ],
    url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c15-calculo-impuesto-determinacion-cuotas-integras/gravamen-base-liquidable-general/gravamen-autonomico/comunidad-autonoma-illes-balears.html',
  },
  canarias: {
    nombre: 'Canarias',
    brackets: [
      { hasta: 13748, tipo: 0.09 },
      { hasta: 19422, tipo: 0.115 },
      { hasta: 35924, tipo: 0.14 },
      { hasta: 57566, tipo: 0.185 },
      { hasta: 93268, tipo: 0.235 },
      { hasta: 123745, tipo: 0.25 },
      { hasta: Infinity, tipo: 0.26 },
    ],
    url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c15-calculo-impuesto-determinacion-cuotas-integras/gravamen-base-liquidable-general/gravamen-autonomico/comunidad-autonoma-canarias.html',
  },
  cantabria: {
    nombre: 'Cantabria',
    brackets: [
      { hasta: 13000, tipo: 0.085 },
      { hasta: 21000, tipo: 0.11 },
      { hasta: 35200, tipo: 0.145 },
      { hasta: 60000, tipo: 0.18 },
      { hasta: 90000, tipo: 0.225 },
      { hasta: Infinity, tipo: 0.245 },
    ],
    url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c15-calculo-impuesto-determinacion-cuotas-integras/gravamen-base-liquidable-general/gravamen-autonomico/comunidad-autonoma-cantabria.html',
  },
  castillaLaMancha: {
    nombre: 'Castilla-La Mancha',
    brackets: [
      { hasta: 12450, tipo: 0.095 },
      { hasta: 20200, tipo: 0.12 },
      { hasta: 35200, tipo: 0.15 },
      { hasta: 60000, tipo: 0.185 },
      { hasta: Infinity, tipo: 0.225 },
    ],
    url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c15-calculo-impuesto-determinacion-cuotas-integras/gravamen-base-liquidable-general/gravamen-autonomico/comunidad-autonoma-castilla-mancha.html',
  },
  castillaYLeon: {
    nombre: 'Castilla y León',
    brackets: [
      { hasta: 12450, tipo: 0.09 },
      { hasta: 20200, tipo: 0.12 },
      { hasta: 35200, tipo: 0.14 },
      { hasta: 53407.2, tipo: 0.185 },
      { hasta: Infinity, tipo: 0.215 },
    ],
    url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c15-calculo-impuesto-determinacion-cuotas-integras/gravamen-base-liquidable-general/gravamen-autonomico/comunidad-castilla-leon.html',
  },
  cataluna: {
    nombre: 'Cataluña',
    brackets: [
      { hasta: 12500, tipo: 0.095 },
      { hasta: 22000, tipo: 0.125 },
      { hasta: 33000, tipo: 0.16 },
      { hasta: 53000, tipo: 0.19 },
      { hasta: 90000, tipo: 0.215 },
      { hasta: 120000, tipo: 0.235 },
      { hasta: 175000, tipo: 0.245 },
      { hasta: Infinity, tipo: 0.255 },
    ],
    url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c15-calculo-impuesto-determinacion-cuotas-integras/gravamen-base-liquidable-general/gravamen-autonomico/comunidad-autonoma-cataluna.html',
  },
  extremadura: {
    nombre: 'Extremadura',
    brackets: [
      { hasta: 12450, tipo: 0.08 },
      { hasta: 20200, tipo: 0.1 },
      { hasta: 24200, tipo: 0.16 },
      { hasta: 35200, tipo: 0.175 },
      { hasta: 60000, tipo: 0.21 },
      { hasta: 80200, tipo: 0.235 },
      { hasta: 99200, tipo: 0.24 },
      { hasta: 120200, tipo: 0.245 },
      { hasta: Infinity, tipo: 0.25 },
    ],
    url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c15-calculo-impuesto-determinacion-cuotas-integras/gravamen-base-liquidable-general/gravamen-autonomico/comunidad-autonoma-extremadura.html',
  },
  galicia: {
    nombre: 'Galicia',
    brackets: [
      { hasta: 12985.35, tipo: 0.09 },
      { hasta: 21068.6, tipo: 0.1165 },
      { hasta: 35200, tipo: 0.149 },
      { hasta: 60000, tipo: 0.184 },
      { hasta: Infinity, tipo: 0.225 },
    ],
    url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c15-calculo-impuesto-determinacion-cuotas-integras/gravamen-base-liquidable-general/gravamen-autonomico/comunidad-autonoma-galicia.html',
  },
  madrid: {
    nombre: 'Madrid',
    brackets: [
      { hasta: 13362.22, tipo: 0.085 },
      { hasta: 19004.63, tipo: 0.107 },
      { hasta: 35425.68, tipo: 0.128 },
      { hasta: 57320.4, tipo: 0.174 },
      { hasta: Infinity, tipo: 0.205 },
    ],
    url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c15-calculo-impuesto-determinacion-cuotas-integras/gravamen-base-liquidable-general/gravamen-autonomico/comunidad-madrid.html',
  },
  murcia: {
    nombre: 'Murcia',
    brackets: [
      { hasta: 12450, tipo: 0.095 },
      { hasta: 20200, tipo: 0.112 },
      { hasta: 34000, tipo: 0.133 },
      { hasta: 60000, tipo: 0.179 },
      { hasta: Infinity, tipo: 0.225 },
    ],
    url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c15-calculo-impuesto-determinacion-cuotas-integras/gravamen-base-liquidable-general/gravamen-autonomico/comunidad-autonoma-region-murcia.html',
  },
  laRioja: {
    nombre: 'La Rioja',
    brackets: [
      { hasta: 12450, tipo: 0.08 },
      { hasta: 20200, tipo: 0.106 },
      { hasta: 35200, tipo: 0.136 },
      { hasta: 40000, tipo: 0.178 },
      { hasta: 50000, tipo: 0.183 },
      { hasta: 60000, tipo: 0.19 },
      { hasta: 120000, tipo: 0.245 },
      { hasta: Infinity, tipo: 0.27 },
    ],
    url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c15-calculo-impuesto-determinacion-cuotas-integras/gravamen-base-liquidable-general/gravamen-autonomico/comunidad-autonoma-rioja.html',
  },
  valencia: {
    nombre: 'Comunitat Valenciana',
    brackets: [
      { hasta: 12000, tipo: 0.09 },
      { hasta: 22000, tipo: 0.12 },
      { hasta: 32000, tipo: 0.15 },
      { hasta: 42000, tipo: 0.175 },
      { hasta: 52000, tipo: 0.2 },
      { hasta: 62000, tipo: 0.225 },
      { hasta: 72000, tipo: 0.25 },
      { hasta: 100000, tipo: 0.265 },
      { hasta: 150000, tipo: 0.275 },
      { hasta: 200000, tipo: 0.285 },
      { hasta: Infinity, tipo: 0.295 },
    ],
    url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c15-calculo-impuesto-determinacion-cuotas-integras/gravamen-base-liquidable-general/gravamen-autonomico/comunitat-valenciana.html',
  },
  ceutaMelilla: {
    nombre: 'Ceuta y Melilla',
    // Art. 65 Ley IRPF: se aplica la misma escala general estatal también como escala "autonómica".
    brackets: [
      { hasta: 12450, tipo: 0.19 },
      { hasta: 20200, tipo: 0.24 },
      { hasta: 35200, tipo: 0.3 },
      { hasta: 60000, tipo: 0.37 },
      { hasta: 300000, tipo: 0.45 },
      { hasta: Infinity, tipo: 0.47 },
    ],
    url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c15-calculo-impuesto-determinacion-cuotas-integras/gravamen-base-liquidable-general/gravamen-autonomico/especialidad-escala-autonomica-contribuyentes.html',
  },
} as const;

// Mínimo del contribuyente: parte de la base liquidable general que no tributa (contribuyente
// general, menor de 65 años, sin ascendientes ni descendientes a cargo). Con 65 o más años sube a
// 6.700 €, y con 75 o más a 8.100 €; hay importes adicionales por descendientes, ascendientes y
// discapacidad que esta calculadora no contempla. Fuente: AEAT, Manual práctico de Renta 2025,
// "Mínimo del contribuyente". Verificado el 2026-09-24.
export const IRPF_MINIMO_CONTRIBUYENTE = {
  general: 5550,
  desde65: 6700,
  desde75: 8100,
  url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/manual-especifico-irpf-2025-personas-anos/minimos/minimo-personal-familiar.html',
} as const;

// Gasto deducible genérico de los rendimientos del trabajo (art. 19.2.f Ley IRPF), aplicable a
// todos los trabajadores por cuenta ajena además de las cotizaciones a la Seguridad Social. Hay
// importes mayores para movilidad geográfica o discapacidad que esta calculadora no contempla.
// Fuente: AEAT, Manual práctico de Renta 2025. Verificado el 2026-09-24.
export const IRPF_GASTO_DEDUCIBLE_TRABAJO = 2000;

/**
 * Reducción por obtención de rendimientos del trabajo (art. 20 Ley IRPF): baja el rendimiento neto
 * de quienes cobran menos, hasta desaparecer en 19.747,5 €. Solo se aplica si no se tienen otras
 * rentas (distintas del trabajo) superiores a 6.500 €. Fuente: AEAT, Manual práctico de Renta 2025,
 * "Determinación del rendimiento neto reducido". Verificado el 2026-09-24.
 */
export const IRPF_REDUCCION_TRABAJO = {
  umbral1: 14852,
  importeFijo: 7302,
  umbral2: 17673.52,
  importeUmbral2: 2364.34,
  umbralMaximo: 19747.5,
  url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c03-rendimientos-trabajo/rendimiento-neto-trabajo-integrar-base-imponible/fase-3-determinacion-rendimiento-neto-reducido.html',
} as const;

/** Reducción por obtención de rendimientos del trabajo, art. 20 Ley IRPF. Nunca da un resultado negativo. */
export function calcularReduccionTrabajo(rendimientoNeto: number): number {
  const r = IRPF_REDUCCION_TRABAJO;
  if (rendimientoNeto <= r.umbral1) return r.importeFijo;
  if (rendimientoNeto <= r.umbral2) return Math.max(0, r.importeFijo - 1.75 * (rendimientoNeto - r.umbral1));
  if (rendimientoNeto <= r.umbralMaximo) return Math.max(0, r.importeUmbral2 - 1.14 * (rendimientoNeto - r.umbral2));
  return 0;
}

/** Cuota resultante de aplicar unos tramos progresivos (mismo formato que IRPF_AHORRO_BRACKETS) a una base. */
export function calcularProgresivo(base: number, brackets: readonly { hasta: number; tipo: number }[]): number {
  if (base <= 0) return 0;
  let restante = base;
  let impuesto = 0;
  let limiteAnterior = 0;
  for (const tramo of brackets) {
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

/**
 * Cotizaciones a la Seguridad Social a cargo del trabajador, Régimen General, 2026: contingencias
 * comunes, desempleo (contrato indefinido), formación profesional y el Mecanismo de Equidad
 * Intergeneracional (MEI), sobre la base de cotización mensual hasta el tope máximo. Por encima del
 * tope máximo se aplica además la cotización adicional de solidaridad (tramos progresivos, Ley
 * 21/2021 y desarrollo anual), a cargo también mayoritariamente de la empresa.
 * Fuente: BOE, Orden PJC/297/2026, de 30 de marzo (contingencias comunes, MEI, solidaridad y tope
 * máximo); desempleo y formación profesional mantienen los tipos de años anteriores al no haberse
 * aprobado una ley de Presupuestos para 2026 (verificado también contra una segunda fuente, Gábilos,
 * tablas de cotización 2026). Verificado el 2026-09-24.
 */
export const SS_TRABAJADOR = {
  contingenciasComunes: 0.047,
  desempleoIndefinido: 0.0155,
  formacionProfesional: 0.001,
  mei: 0.0015,
  baseMaximaMensual: 5101.2,
  solidaridad: [
    { hastaExceso: 510.12, tipo: 0.0019 },
    { hastaExceso: 2550.6, tipo: 0.0021 },
    { hastaExceso: Infinity, tipo: 0.0024 },
  ],
  url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-7296',
} as const;

/** Cotización mensual del trabajador (Régimen General) para un salario bruto mensual dado. */
export function calcularCotizacionSSMensual(brutoMensual: number): number {
  const s = SS_TRABAJADOR;
  const tipoBase = s.contingenciasComunes + s.desempleoIndefinido + s.formacionProfesional + s.mei;
  const baseCotizable = Math.min(brutoMensual, s.baseMaximaMensual);
  let cuota = baseCotizable * tipoBase;

  const exceso = Math.max(0, brutoMensual - s.baseMaximaMensual);
  let restante = exceso;
  let limiteAnterior = 0;
  for (const tramo of s.solidaridad) {
    const anchoTramo = tramo.hastaExceso - limiteAnterior;
    const baseTramo = Math.min(restante, anchoTramo);
    if (baseTramo <= 0) break;
    cuota += baseTramo * tramo.tipo;
    restante -= baseTramo;
    limiteAnterior = tramo.hastaExceso;
    if (restante <= 0) break;
  }
  return cuota;
}

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
