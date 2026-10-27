// Datos de las escenas 3D (componente <Escena3D />). Todo se calcula aquí, en el servidor, y el navegador solo dibuja.
//
// - 'irpf-ahorro': los tramos del IRPF del ahorro tal como están en src/config/finance.ts (IRPF_AHORRO_BRACKETS).
// - 'interes-compuesto': aportación mensual constante con los mismos supuestos que el artículo "Interés compuesto" y la
//   calculadora de rentabilidad neta (IndexFundCalculator): 150 euros al mes, rentabilidad bruta del 7 % anual, TER del
//   0,2 % y aportaciones a final de mes. Es un ejemplo ilustrativo, no una previsión.

import { IRPF_AHORRO_BRACKETS, IRPF_AHORRO_FUENTE } from '../../config/finance.ts';

export type TipoEscena = 'irpf-ahorro' | 'interes-compuesto';

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

export interface DatosEscena {
  tipo: TipoEscena;
  titulo: string;
  /** Texto corto para lectores de pantalla (qué muestra el gráfico). */
  resumen: string;
  fuente: { etiqueta: string; url: string };
  escalones?: Escalon[];
  serie?: PuntoInteres[];
}

const euros = (n: number) => `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} euros`;
const pct = (t: number) => `${String(Math.round(t * 1000) / 10).replace('.', ',')} %`;

export function datosEscena(tipo: TipoEscena): DatosEscena {
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
