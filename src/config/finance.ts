/**
 * Cifras fiscales centralizadas. Cualquier dato marcado VERIFICAR no debe
 * usarse en producción hasta que David lo confirme contra la fuente oficial.
 * No añadir tramos ni tipos nuevos sin fuente + fecha.
 */

// VERIFICAR: tramos del IRPF del ahorro (rendimientos del capital mobiliario
// y ganancias patrimoniales). Fuente: Agencia Tributaria (agenciatributaria.es).
// Registrado el 2026-09-23 a partir de los tramos publicados en ejercicios
// recientes; confirmar que siguen vigentes para el ejercicio fiscal actual
// antes de publicar cualquier calculadora que los use.
export const IRPF_AHORRO_BRACKETS_VERIFICAR = [
  { hasta: 6000, tipo: 0.19 },
  { hasta: 50000, tipo: 0.21 },
  { hasta: 200000, tipo: 0.23 },
  { hasta: 300000, tipo: 0.27 },
  { hasta: Infinity, tipo: 0.28 },
] as const;

export const IRPF_AHORRO_FUENTE_VERIFICAR = {
  fuente: 'Agencia Tributaria, Impuesto sobre la Renta de las Personas Físicas, base del ahorro',
  url: 'https://sede.agenciatributaria.gob.es/',
  fechaRegistro: '2026-09-23',
  verificado: false,
} as const;

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
