// Datos de las escenas 3D (componente <Escena3D />). Todo se calcula aquí, en el servidor, y el navegador solo dibuja.
//
// - 'irpf-ahorro': los tramos del IRPF del ahorro tal como están en src/config/finance.ts (IRPF_AHORRO_BRACKETS).
// - 'interes-compuesto': aportación mensual constante con los mismos supuestos que el artículo "Interés compuesto" y la
//   calculadora de rentabilidad neta (IndexFundCalculator): 150 euros al mes, rentabilidad bruta del 7 % anual, TER del
//   0,2 % y aportaciones a final de mes. Es un ejemplo ilustrativo, no una previsión.
// - 'coste-ter': 10.000 euros invertidos una vez, rentabilidad bruta del 7 % y TER restado de la rentabilidad, a 10, 20 y
//   30 años con TER de 0,2 %, 1 % y 1,5 %. Es el mismo método y los mismos supuestos que la tabla del artículo "Qué es
//   el TER" (a 30 años: 71.968, 57.435 y 49.840 euros brutos).
// - 'cuota-euribor': cuota mensual de una hipoteca variable de 150.000 euros a 25 años con euríbor + 0,8 puntos
//   (supuestos del artículo "Hipoteca fija, variable o mixta"), con el euríbor oficial del BOE y con -1, +1 y +2 puntos.

import { IRPF_AHORRO_BRACKETS, IRPF_AHORRO_FUENTE } from '../../config/finance.ts';
import { cuotaFrancesa, tipoAplicable } from './euribor.ts';

export type TipoEscena = 'irpf-ahorro' | 'interes-compuesto' | 'coste-ter' | 'cuota-euribor';

export interface Escalon {
  desde: number;
  /** null en el último tramo (sin límite). */
  hasta: number | null;
  tipo: number;
}

export function escalonesIrpfAhorro(): Escalon[] {
  return IRPF_AHORRO_BRACKETS.map((t, i) => ({
    desde: i === 0 ? 0 : IRPF_AHORRO_BRACKETS[i - 1].hasta,
    hasta: Number.isFinite(t.hasta) ? t.hasta : null,
    tipo: t.tipo,
  }));
}

export const SUPUESTOS_INTERES = {
  aporteMensual: 150,
  rentabilidadBruta: 0.07,
  ter: 0.002,
  anios: 40,
  cadaAnios: 5,
} as const;

export interface PuntoInteres {
  anio: number;
  aportado: number;
  intereses: number;
  total: number;
}

/** Valor acumulado cada `cadaAnios` años: lo aportado y los intereses (valor futuro de una anualidad mensual). */
export function serieInteresCompuesto(s: typeof SUPUESTOS_INTERES = SUPUESTOS_INTERES): PuntoInteres[] {
  const rMensual = Math.pow(1 + s.rentabilidadBruta - s.ter, 1 / 12) - 1;
  const puntos: PuntoInteres[] = [];
  for (let anio = s.cadaAnios; anio <= s.anios; anio += s.cadaAnios) {
    const meses = anio * 12;
    const total = s.aporteMensual * ((Math.pow(1 + rMensual, meses) - 1) / rMensual);
    const aportado = s.aporteMensual * meses;
    puntos.push({ anio, aportado: Math.round(aportado), intereses: Math.round(total - aportado), total: Math.round(total) });
  }
  return puntos;
}

export const SUPUESTOS_TER = {
  inversion: 10000,
  rentabilidadBruta: 0.07,
  ters: [0.002, 0.01, 0.015],
  anios: [10, 20, 30],
} as const;

/** Valor final bruto de una inversión única: inversion * (1 + rentabilidad - TER) ^ años (el TER se resta de la rentabilidad). */
export function valorConTer(ter: number, anios: number, s: typeof SUPUESTOS_TER = SUPUESTOS_TER): number {
  return Math.round(s.inversion * Math.pow(1 + s.rentabilidadBruta - ter, anios));
}

export const SUPUESTOS_HIPOTECA = { capital: 150000, plazoAnios: 25, diferencial: 0.8, saltos: [-1, 0, 1, 2] } as const;

/** Cuota mensual (sistema francés) de la hipoteca variable para cada salto del euríbor, en puntos. */
export function cuotasPorEuribor(euribor: number, s: typeof SUPUESTOS_HIPOTECA = SUPUESTOS_HIPOTECA) {
  return s.saltos.map((salto) => ({
    salto,
    euribor: Math.round((euribor + salto) * 1000) / 1000,
    cuota: cuotaFrancesa(s.capital, tipoAplicable(euribor + salto, s.diferencial), s.plazoAnios * 12),
  }));
}

/** Tono de color de una barra agrupada: 0 verde claro, 1 verde de la marca, 2 gris, 3 terracota. */
export type Tono = 0 | 1 | 2 | 3;
export interface BarraGrupo {
  etiqueta: string;
  valor: number;
  /** Texto del valor ya formateado (p. ej. "71.968 €"). */
  texto: string;
  tono: Tono;
}
export interface GrupoBarras {
  etiqueta: string;
  barras: BarraGrupo[];
}

export interface DatosEscena {
  tipo: TipoEscena;
  titulo: string;
  /** Texto corto para lectores de pantalla (qué muestra el gráfico). */
  resumen: string;
  fuente: { etiqueta: string; url: string };
  escalones?: Escalon[];
  serie?: PuntoInteres[];
  /** Barras agrupadas ('coste-ter' y 'cuota-euribor'). */
  grupos?: GrupoBarras[];
  /** Qué significa cada tono, en el orden de aparición. */
  leyenda?: { tono: Tono; texto: string }[];
  /** Nota con los supuestos del ejemplo, visible bajo el gráfico. */
  nota?: string;
}

const euros = (n: number) => `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} euros`;
const pct = (t: number) => `${String(Math.round(t * 1000) / 10).replace('.', ',')} %`;

const eurosCorto = (n: number) => `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} €`;
const pct3 = (n: number) => `${String(Math.round(n * 1000) / 1000).replace('.', ',')} %`;

export function datosEscena(tipo: TipoEscena, opciones: { euribor?: number; euriborMes?: string; euriborUrl?: string } = {}): DatosEscena {
  if (tipo === 'coste-ter') {
    const tonos: Tono[] = [1, 2, 3];
    const grupos: GrupoBarras[] = SUPUESTOS_TER.anios.map((anio) => ({
      etiqueta: `${anio} años`,
      barras: SUPUESTOS_TER.ters.map((ter, i) => {
        const valor = valorConTer(ter, anio);
        return { etiqueta: `TER ${pct(ter)}`, valor, texto: eurosCorto(valor), tono: tonos[i] };
      }),
    }));
    const g30 = grupos[grupos.length - 1].barras;
    return {
      tipo,
      titulo: 'Cuánto cuesta el TER con el tiempo: la misma inversión con tres comisiones',
      resumen:
        `Con ${euros(SUPUESTOS_TER.inversion)} invertidos una vez y una rentabilidad bruta del ${pct(SUPUESTOS_TER.rentabilidadBruta)} anual, a ${SUPUESTOS_TER.anios[SUPUESTOS_TER.anios.length - 1]} años quedan ` +
        `${euros(g30[0].valor)} con un TER del ${pct(SUPUESTOS_TER.ters[0])}, ${euros(g30[1].valor)} con el ${pct(SUPUESTOS_TER.ters[1])} y ${euros(g30[2].valor)} con el ${pct(SUPUESTOS_TER.ters[2])}. ` +
        'Valores brutos, antes de impuestos; es un ejemplo, no una previsión.',
      nota: `Ejemplo ilustrativo, no una previsión: ${eurosCorto(SUPUESTOS_TER.inversion)} invertidos una sola vez, ${pct(SUPUESTOS_TER.rentabilidadBruta)} de rentabilidad bruta anual con el TER restado de ella; valores brutos, antes de impuestos.`,
      fuente: { etiqueta: 'Cálculo propio con los mismos supuestos que la tabla de este artículo', url: '/blog/rentabilidad-neta-fondo-indexado/' },
      grupos,
      leyenda: SUPUESTOS_TER.ters.map((ter, i) => ({ tono: tonos[i], texto: `TER ${pct(ter)}` })),
    };
  }
  if (tipo === 'cuota-euribor') {
    const euribor = opciones.euribor ?? 0;
    const filas = cuotasPorEuribor(euribor);
    const tonos: Tono[] = [0, 1, 2, 3];
    const nombre = (salto: number) => (salto === 0 ? 'hoy' : `${salto > 0 ? '+' : '-'}${Math.abs(salto)} ${Math.abs(salto) === 1 ? 'punto' : 'puntos'}`);
    return {
      tipo,
      titulo: 'Cuánto sube o baja la cuota si cambia el euríbor',
      resumen:
        `Hipoteca variable de ${euros(SUPUESTOS_HIPOTECA.capital)} a ${SUPUESTOS_HIPOTECA.plazoAnios} años con euríbor más ${String(SUPUESTOS_HIPOTECA.diferencial).replace('.', ',')} puntos. ` +
        filas.map((f) => `Con el euríbor en ${pct3(f.euribor)} (${nombre(f.salto)}), cuota de ${euros(f.cuota)} al mes`).join('; ') +
        '. Es un ejemplo con supuestos inventados, no una oferta.',
      nota: `Ejemplo con supuestos inventados, no una oferta: ${eurosCorto(SUPUESTOS_HIPOTECA.capital)} a ${SUPUESTOS_HIPOTECA.plazoAnios} años, euríbor más ${String(SUPUESTOS_HIPOTECA.diferencial).replace('.', ',')} puntos, el nuevo euríbor aplicado a todo el plazo para comparar escenarios.`,
      fuente: {
        etiqueta: `Euríbor oficial de ${opciones.euriborMes ?? 'el último mes'} (Banco de España, BOE) y cálculo propio de la cuota`,
        url: opciones.euriborUrl ?? '/euribor/',
      },
      grupos: [
        {
          etiqueta: 'Cuota mensual',
          barras: filas.map((f, i) => ({ etiqueta: `Euríbor ${pct3(f.euribor)}`, valor: f.cuota, texto: `${eurosCorto(f.cuota)}/mes`, tono: tonos[i] })),
        },
      ],
      leyenda: filas.map((f, i) => ({ tono: tonos[i], texto: `Euríbor ${pct3(f.euribor)} (${nombre(f.salto)})` })),
    };
  }
  if (tipo === 'irpf-ahorro') {
    const escalones = escalonesIrpfAhorro();
    return {
      tipo,
      titulo: 'Los tramos del IRPF del ahorro, escalón a escalón',
      resumen:
        `${escalones.length} escalones que suben con la renta del ahorro: ` +
        escalones
          .map((e) => (e.hasta === null ? `más de ${euros(e.desde)}, ${pct(e.tipo)}` : `hasta ${euros(e.hasta)}, ${pct(e.tipo)}`))
          .join('; ') +
        '. Cada tipo se aplica solo a la parte que cae en su tramo.',
      fuente: { etiqueta: IRPF_AHORRO_FUENTE.fuente, url: IRPF_AHORRO_FUENTE.url },
      escalones,
    };
  }
  const serie = serieInteresCompuesto();
  const ultimo = serie[serie.length - 1];
  return {
    tipo,
    titulo: 'Interés compuesto: lo aportado y lo que ganan los intereses',
    resumen:
      `Con ${euros(SUPUESTOS_INTERES.aporteMensual)} al mes durante ${ultimo.anio} años, aportas ${euros(ultimo.aportado)} y los intereses suman ${euros(ultimo.intereses)}, ` +
      `hasta ${euros(ultimo.total)} en total. Hipótesis: rentabilidad bruta del ${pct(SUPUESTOS_INTERES.rentabilidadBruta)} anual y TER del ${pct(SUPUESTOS_INTERES.ter)}; es un ejemplo, no una previsión.`,
    fuente: {
      etiqueta: 'Cálculo propio con el valor futuro de una anualidad mensual (mismos supuestos que la calculadora de rentabilidad neta)',
      url: '/blog/rentabilidad-neta-fondo-indexado/',
    },
    serie,
  };
}

export { euros as textoEuros, pct as textoPct };
