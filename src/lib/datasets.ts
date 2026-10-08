// Conjuntos de datos abiertos de /datos/ (JSON y CSV). Salen de las mismas constantes que usan las
// calculadoras (src/config/finance.ts y src/data/euribor), así que no pueden desincronizarse: cualquier
// revisión de cifras se refleja sola aquí. Licencia CC BY 4.0 (atribución a WealthUncut).
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

export interface Dataset {
  id: string;
  titulo: string;
  descripcion: string;
  fuente: string;
  fuenteUrl: string;
  revisado: string;
  columnas: string[];
  filas: (string | number | null)[][];
}

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
    revisado: '2026-09-24',
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
    id: 'euribor-12m',
    titulo: 'Euríbor a 12 meses, media mensual',
    descripcion: 'Serie mensual del euríbor a 12 meses (media de cierres), actualizada cada mes.',
    fuente: euribor.fuente,
    fuenteUrl: euribor.fuenteUrl,
    revisado: euribor.generado.slice(0, 10),
    columnas: ['mes', 'valor_pct'],
    filas: euribor.historico.map((h) => [h.mes, Math.round(h.valor * 1000) / 1000]),
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
    licencia: 'CC BY 4.0: https://creativecommons.org/licenses/by/4.0/ (atribución a WealthUncut, https://wealthuncut.com/datos/)',
    columnas: d.columnas,
    filas: d.filas.map((f) => Object.fromEntries(d.columnas.map((c, i) => [c, f[i]]))),
  };
}
