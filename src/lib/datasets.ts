// Conjuntos de datos abiertos de /datos/ (JSON y CSV). Salen de las mismas constantes que usan las
// calculadoras (src/config/finance.ts y src/data/euribor), así que no pueden desincronizarse: cualquier
// revisión de cifras se refleja sola aquí. Licencia CC BY 4.0 (atribución a WealthUncut), salvo los conjuntos con
// `licenciaPropia: false` (el euríbor: es el valor oficial publicado en el BOE y se reproduce citando la fuente,
// sin licenciarlo como propio).
import {
  IRPF_AHORRO_BRACKETS,
  IRPF_AHORRO_FUENTE,
  IRPF_GENERAL_AUTONOMICO,
  IRPF_GENERAL_ESTATAL,
  ITP_VIVIENDA_USADA,
  ITP_VIVIENDA_USADA_FUENTES,
  RETA_2026,
} from '../config/finance';
import euribor from '../data/euribor/ultimo.json';
import { filasSueldoNeto } from './calculos/sueldo';

export interface Dataset {
  id: string;
  titulo: string;
  descripcion: string;
  fuente: string;
  fuenteUrl: string;
  revisado: string;
  columnas: string[];
  filas: (string | number | null)[][];
  /** false si el dato no es de elaboración propia y no se licencia bajo CC BY (por defecto, true). */
  licenciaPropia?: boolean;
  /** Condiciones de uso cuando licenciaPropia es false. */
  aviso?: string;
}

export const LICENCIA_CC_BY = 'CC BY 4.0: https://creativecommons.org/licenses/by/4.0/ (atribución a WealthUncut, https://wealthuncut.com/datos/)';
export const AVISO_EURIBOR =
  'Valor oficial del euríbor a un año publicado cada mes en el BOE por el Banco de España (tipos de interés oficiales de referencia del mercado hipotecario). No es un dato de WealthUncut ni se ofrece bajo CC BY: se reproduce con su fuente, indicando en cada mes la resolución del BOE. Euribor® es una marca registrada del European Money Market Institute (EMMI).';

type Tramo = { hasta: number; tipo: number };
const limpia = (n: number) => (Number.isFinite(n) ? n : null);
const escala = (nombre: string, brackets: readonly Tramo[]) => {
  let desde = 0;
  return brackets.map((b) => {
    const fila = [nombre, desde, limpia(b.hasta), Math.round(b.tipo * 10000) / 100];
    desde = b.hasta;
    return fila;
  });
};

export const DATASETS: Dataset[] = [
  {
    id: 'irpf-ahorro-tramos',
    titulo: 'Tramos del IRPF del ahorro (estatal más autonómico)',
    descripcion: 'Escala del IRPF aplicable a intereses, dividendos y ganancias patrimoniales por venta de fondos, acciones o criptomonedas.',
    fuente: IRPF_AHORRO_FUENTE.fuente,
    fuenteUrl: IRPF_AHORRO_FUENTE.url,
    revisado: IRPF_AHORRO_FUENTE.fechaRegistro,
    columnas: ['base_desde_eur', 'base_hasta_eur', 'tipo_pct'],
    filas: escala('', IRPF_AHORRO_BRACKETS).map(([, d, h, t]) => [d, h, t]),
  },
  {
    id: 'irpf-escala-general',
    titulo: 'Escalas del IRPF general: estatal y de cada comunidad autónoma',
    descripcion: 'Tramos de la base liquidable general (sueldos, autónomos, alquileres). El tipo final es la escala estatal más la autonómica.',
    fuente: 'AEAT, Manual práctico de Renta 2025, gravamen estatal y autonómico',
    fuenteUrl: IRPF_GENERAL_ESTATAL.url,
    revisado: '2026-11-06',
    columnas: ['ambito', 'base_desde_eur', 'base_hasta_eur', 'tipo_pct'],
    filas: [
      ...escala('Estatal', IRPF_GENERAL_ESTATAL.brackets),
      ...Object.values(IRPF_GENERAL_AUTONOMICO).flatMap((c) => escala(c.nombre, c.brackets)),
    ],
  },
  {
    id: 'itp-vivienda-usada',
    titulo: 'ITP de la vivienda usada por comunidad autónoma (tipo general)',
    descripcion: 'Tipos del Impuesto de Transmisiones Patrimoniales en la compra de vivienda usada, sin bonificaciones. Escala progresiva donde hay tramos.',
    fuente: ITP_VIVIENDA_USADA_FUENTES.map((f) => f.label).join('; '),
    fuenteUrl: ITP_VIVIENDA_USADA_FUENTES[0].url,
    revisado: '2026-10-06',
    columnas: ['comunidad', 'precio_desde_eur', 'precio_hasta_eur', 'tipo_pct'],
    filas: Object.values(ITP_VIVIENDA_USADA).flatMap((c) => escala(c.nombre, c.brackets)),
  },
  {
    id: 'cuota-autonomos-2026',
    titulo: 'Tramos de cotización de autónomos 2026 y cuotas',
    descripcion: 'Bases mínima y máxima por tramo de rendimientos netos mensuales y cuota resultante al 31,5 %.',
    fuente: RETA_2026.fuentes[0].label,
    fuenteUrl: RETA_2026.fuentes[0].url,
    revisado: '2026-10-06',
    columnas: ['tabla', 'tramo', 'rendimiento_neto_mensual_hasta_eur', 'base_min_eur', 'base_max_eur', 'cuota_min_eur', 'cuota_max_eur'],
    filas: RETA_2026.tramos.map((t) => [
      t.tabla,
      t.n,
      limpia(t.hasta),
      t.baseMin,
      t.baseMax,
      Math.round(t.baseMin * RETA_2026.tipoTotal * 100) / 100,
      Math.round(t.baseMax * RETA_2026.tipoTotal * 100) / 100,
    ]),
  },
  {
    id: 'sueldo-neto-comunidades-2026',
    titulo: 'Sueldo neto 2026 por comunidad autónoma y sueldo bruto',
    descripcion:
      'Cuánto queda neto de 15 sueldos brutos anuales (de 20.000 a 100.000 €) en cada una de las 15 comunidades de régimen común (sin País Vasco ni Navarra, que tienen IRPF foral, ni Ceuta y Melilla, con una deducción del 60 % que no se modela): Seguridad Social, IRPF anual, neto anual, neto mensual en 14 y en 12 pagas y tipo efectivo de IRPF. Cálculo propio con la misma fórmula que la calculadora de sueldo neto. Supuestos: trabajador por cuenta ajena con contrato indefinido, menor de 65 años, sin hijos ni otras rentas, mínimo personal general y todo el año en la misma comunidad. Es el IRPF del año, no la retención mensual de la nómina.',
    fuente: 'Cálculo de WealthUncut con las escalas del IRPF de la AEAT (Manual práctico de Renta 2025) y las cotizaciones del trabajador de la Orden PJC/297/2026 (BOE)',
    fuenteUrl: IRPF_GENERAL_ESTATAL.url,
    revisado: '2026-11-06',
    columnas: ['comunidad', 'bruto_anual_eur', 'seguridad_social_anual_eur', 'irpf_anual_eur', 'neto_anual_eur', 'neto_mensual_14_pagas_eur', 'neto_mensual_12_pagas_eur', 'tipo_efectivo_irpf_pct'],
    filas: filasSueldoNeto(),
  },
  {
    id: 'euribor-12m',
    titulo: 'Euríbor a un año, valor oficial de cada mes (BOE)',
    descripcion: `Euríbor a un año oficial de cada mes desde ${euribor.historico[0].mes}, tal como lo publica el Banco de España en el BOE, con el identificador de cada resolución.`,
    fuente: euribor.fuente,
    fuenteUrl: euribor.fuenteUrl,
    revisado: euribor.generado.slice(0, 10),
    columnas: ['mes', 'valor_pct', 'boe'],
    filas: euribor.historico.map((h) => [h.mes, h.valor, h.boe]),
    licenciaPropia: false,
    aviso: AVISO_EURIBOR,
  },
];

export const DATASET_POR_ID = new Map(DATASETS.map((d) => [d.id, d]));

export function aCsv(d: Dataset): string {
  const celda = (v: string | number | null) => (v === null ? '' : typeof v === 'number' ? String(v) : /[",\n;]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return [d.columnas.join(','), ...d.filas.map((f) => f.map(celda).join(','))].join('\n') + '\n';
}

export function aJson(d: Dataset) {
  return {
    titulo: d.titulo,
    descripcion: d.descripcion,
    fuente: d.fuente,
    fuenteUrl: d.fuenteUrl,
    revisado: d.revisado,
    licencia: d.licenciaPropia === false ? d.aviso : LICENCIA_CC_BY,
    columnas: d.columnas,
    filas: d.filas.map((f) => Object.fromEntries(d.columnas.map((c, i) => [c, f[i]]))),
  };
}
