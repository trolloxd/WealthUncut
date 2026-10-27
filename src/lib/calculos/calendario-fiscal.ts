// Calendario fiscal por perfil y su exportación a .ics (RFC 5545).
//
// Cada fecha lleva su fuente y un estado:
//  - 'oficial': publicada en el Calendario del contribuyente 2026 de la AEAT (consultado el 2026-10-27).
//  - 'norma': fijada por la norma y no por el calendario de cada año (p. ej. 720 y 721, del 1 de enero al 31 de marzo).
//  - 'previsto': el calendario de 2027 aún no está publicado; la fecha sale de aplicar el mismo plazo que el calendario
//    de 2026 (cuarto trimestre de 2025 y trimestres siguientes) y la regla de que, si el último día es inhábil, el plazo
//    termina el primer día hábil siguiente. Se revisa cuando la AEAT publique el calendario de 2027.
// Las cifras (límites, umbrales) no se escriben aquí: salen de src/config/finance.ts.

import { MODELO_720, MODELO_721, PLAN_PENSIONES } from '../../config/finance.ts';

const eur = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export type Perfil = 'asalariado' | 'autonomo' | 'inversor';
export type EstadoFecha = 'oficial' | 'norma' | 'previsto';

export const PERFILES: { id: Perfil; nombre: string; ayuda: string }[] = [
  { id: 'asalariado', nombre: 'Asalariado', ayuda: 'Nómina, y como mucho una cuenta o un plan de pensiones.' },
  { id: 'autonomo', nombre: 'Autónomo', ayuda: 'Actividad económica propia, con pagos trimestrales.' },
  { id: 'inversor', nombre: 'Inversor', ayuda: 'Fondos, acciones, cripto o cuentas en el extranjero.' },
];

export interface EventoFiscal {
  id: string;
  /** AAAA-MM-DD, o null si la AEAT aún no ha fijado la fecha. */
  fecha: string | null;
  titulo: string;
  detalle: string;
  perfiles: Perfil[];
  estado: EstadoFecha;
  fuente: { etiqueta: string; url: string };
}

const CAL = 'https://sede.agenciatributaria.gob.es/Sede/ayuda/calendario-contribuyente/calendario-contribuyente-2026';
const DOMICILIACION = `${CAL}/plazos-presentacion-autoliquidaciones-domiciliacion-bancaria.html`;
const fuenteCal = (etiqueta: string, ruta: string) => ({ etiqueta, url: `${CAL}/calendario-anual/${ruta}.html` });

/** Fecha de la última revisión de las fechas de esta lista (se muestra en la página y va en el .ics). */
export const CALENDARIO_REVISADO = '2026-10-27';

export const EVENTOS_FISCALES: EventoFiscal[] = [
  {
    id: 'renta-2025-segundo-plazo',
    fecha: '2026-11-05',
    titulo: 'Renta 2025: segundo plazo si fraccionaste el pago (modelo 102)',
    detalle:
      'Solo si al presentar la declaración elegiste fraccionar el pago: la parte que quedó para el segundo plazo se ingresa hasta hoy. Si no fraccionaste, no tienes nada que hacer.',
    perfiles: ['asalariado', 'autonomo', 'inversor'],
    estado: 'oficial',
    fuente: fuenteCal('AEAT, Calendario del contribuyente 2026: hasta el 5 de noviembre', 'noviembre/hasta-5-noviembre'),
  },
  {
    id: 'cierre-2026',
    fecha: '2026-12-31',
    titulo: 'Cierre del año fiscal 2026',
    detalle: `Lo que cuenta para la Renta 2026 se decide hasta hoy: aportaciones a planes de pensiones (límite individual de ${eur(PLAN_PENSIONES.limiteIndividual)} euros al año), ventas con ganancias o pérdidas y la regla de los dos meses si piensas recomprar. Guía completa en "Antes del 31 de diciembre".`,
    perfiles: ['asalariado', 'autonomo', 'inversor'],
    estado: 'norma',
    fuente: { etiqueta: 'AEAT, Manual práctico de Renta 2025: reducciones por aportaciones a sistemas de previsión social', url: PLAN_PENSIONES.url },
  },
  {
    id: 'regimen-autonomo-2027',
    fecha: '2026-12-31',
    titulo: 'Autónomos: renuncia o revocación de estimación directa simplificada y de estimación objetiva para 2027 (modelo 036)',
    detalle:
      'Si quieres cambiar el método con el que tributas tu actividad a partir de 2027 y sucesivos, la comunicación en el modelo 036 se presenta hasta hoy.',
    perfiles: ['autonomo'],
    estado: 'oficial',
    fuente: fuenteCal('AEAT, Calendario del contribuyente 2026: hasta el 31 de diciembre', 'diciembre/hasta-31-diciembre'),
  },
  {
    id: 'saldo-extranjero-2026',
    fecha: '2026-12-31',
    titulo: 'Foto a 31 de diciembre: saldos en el extranjero y monedas virtuales',
    detalle: `Para los modelos 720 y 721 se mira el saldo a 31 de diciembre. El umbral es de ${eur(MODELO_720.umbralPorBloque)} euros por bloque en el 720 y de ${eur(MODELO_721.umbralConjunto)} euros en conjunto en el 721. Anota hoy esos saldos para presentarlos en el primer trimestre.`,
    perfiles: ['inversor'],
    estado: 'norma',
    fuente: { etiqueta: 'AEAT, preguntas frecuentes del modelo 720', url: MODELO_720.url },
  },
  {
    id: 'retenciones-4t-2026',
    fecha: '2027-01-20',
    titulo: 'Cuarto trimestre: retenciones e ingresos a cuenta (modelos 111 y 115)',
    detalle:
      'Para autónomos que pagan nóminas, facturas de profesionales con retención o el alquiler de un local. Fecha prevista: el cuarto trimestre de 2025 venció el 20 de enero de 2026 y el 20 de enero de 2027 es miércoles.',
    perfiles: ['autonomo'],
    estado: 'previsto',
    fuente: fuenteCal('AEAT, Calendario del contribuyente 2026: hasta el 20 de enero (cuarto trimestre de 2025)', 'enero/hasta-20-enero'),
  },
  {
    id: 'pago-fraccionado-4t-2026',
    fecha: '2027-02-01',
    titulo: 'Cuarto trimestre: pago fraccionado del IRPF, IVA y resumen anual del IVA (modelos 130, 303 y 390)',
    detalle:
      'El cuarto trimestre de 2025 venció el 30 de enero de 2026. El 30 de enero de 2027 es sábado y, si el último día es inhábil, el plazo termina el primer día hábil siguiente: lunes 1 de febrero. Fecha prevista hasta que la AEAT publique el calendario de 2027; la domiciliación bancaria tiene un plazo más corto.',
    perfiles: ['autonomo'],
    estado: 'previsto',
    fuente: fuenteCal('AEAT, Calendario del contribuyente 2026: hasta el 30 de enero (cuarto trimestre de 2025)', 'enero/hasta-30-enero'),
  },
  {
    id: 'modelos-720-721-2027',
    fecha: '2027-03-31',
    titulo: 'Último día para los modelos 720 y 721 (bienes y criptomonedas en el extranjero)',
    detalle: `El plazo es ${MODELO_720.plazo}. Solo hay que presentarlos si el saldo a 31 de diciembre supera el umbral de cada modelo, o si ha subido más de ${eur(MODELO_720.incrementoParaRepetir)} euros desde la última declaración. Usa la calculadora del 720 para comprobarlo.`,
    perfiles: ['inversor'],
    estado: 'norma',
    fuente: { etiqueta: 'AEAT, preguntas frecuentes del modelo 721: plazo de presentación', url: MODELO_721.urlPlazo },
  },
  {
    id: 'renta-2026-campana',
    fecha: null,
    titulo: 'Campaña de la Renta 2026 (abril a junio de 2027)',
    detalle:
      'La AEAT anuncia las fechas de cada campaña poco antes de empezar. La de la Renta 2025 fue del 8 de abril al 30 de junio de 2026, con domiciliación hasta el 25 de junio. Cuando se publiquen las de 2027, se añadirán aquí.',
    perfiles: ['asalariado', 'autonomo', 'inversor'],
    estado: 'previsto',
    fuente: fuenteCal('AEAT, Calendario del contribuyente 2026: campaña de Renta y Patrimonio 2025', 'abril/8-abril-hasta-30-junio'),
  },
  {
    id: 'trimestre-1-2027',
    fecha: '2027-04-20',
    titulo: 'Primer trimestre: retenciones y pago fraccionado (modelos 111, 115, 130 y 303)',
    detalle:
      'Fecha prevista: el primer trimestre de 2026 venció el 20 de abril y el 20 de abril de 2027 es martes. Se confirmará con el calendario de 2027.',
    perfiles: ['autonomo'],
    estado: 'previsto',
    fuente: fuenteCal('AEAT, Calendario del contribuyente 2026: hasta el 20 de abril', 'abril/hasta-20-abril'),
  },
  {
    id: 'trimestre-2-2027',
    fecha: '2027-07-20',
    titulo: 'Segundo trimestre: retenciones y pago fraccionado (modelos 111, 115, 130 y 303)',
    detalle:
      'Fecha prevista: el segundo trimestre de 2026 venció el 20 de julio y el 20 de julio de 2027 es martes. Se confirmará con el calendario de 2027.',
    perfiles: ['autonomo'],
    estado: 'previsto',
    fuente: fuenteCal('AEAT, Calendario del contribuyente 2026: hasta el 20 de julio', 'julio/hasta-20-julio'),
  },
];

export const FUENTE_REGLA_DIA_INHABIL = {
  etiqueta: 'AEAT, Calendario del contribuyente 2026: plazos y domiciliación bancaria',
  url: DOMICILIACION,
};

/** Eventos de un perfil, con fecha a partir de `desde` (AAAA-MM-DD, inclusive), ordenados; sin fecha al final. */
export function eventosDePerfil(perfil: Perfil, desde = '0000-00-00', eventos = EVENTOS_FISCALES): EventoFiscal[] {
  const propios = eventos.filter((e) => e.perfiles.includes(perfil));
  const conFecha = propios.filter((e) => e.fecha !== null && e.fecha >= desde).sort((a, b) => a.fecha!.localeCompare(b.fecha!));
  const sinFecha = propios.filter((e) => e.fecha === null);
  return [...conFecha, ...sinFecha];
}

const CRLF = '\r\n';

/** Escapa un valor TEXT de iCalendar (RFC 5545, 3.3.11). */
export function escaparTexto(t: string): string {
  return t.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Pliega una línea a un máximo de 75 octetos UTF-8 sin partir caracteres (RFC 5545, 3.1). */
export function plegarLinea(linea: string): string {
  const enc = new TextEncoder();
  const salida: string[] = [];
  let actual = '';
  let octetos = 0;
  let limite = 75;
  for (const c of linea) {
    const n = enc.encode(c).length;
    if (octetos + n > limite) {
      salida.push(actual);
      actual = '';
      octetos = 0;
      limite = 74; // las líneas de continuación empiezan con un espacio
    }
    actual += c;
    octetos += n;
  }
  salida.push(actual);
  return salida.join(CRLF + ' ');
}

const compacta = (f: string) => f.replaceAll('-', '');

function diaSiguiente(f: string): string {
  const d = new Date(`${f}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Calendario .ics del perfil: eventos de día completo con dos avisos (7 días y 1 día antes). */
export function generarIcs(perfil: Perfil, desde = '0000-00-00', eventos = EVENTOS_FISCALES): string {
  const nombre = PERFILES.find((p) => p.id === perfil)!.nombre;
  const sello = `${compacta(CALENDARIO_REVISADO)}T000000Z`;
  const lineas: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//WealthUncut//Calendario fiscal//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escaparTexto(`Calendario fiscal WealthUncut (${nombre})`)}`,
    'X-WR-TIMEZONE:Europe/Madrid',
  ];
  for (const e of eventosDePerfil(perfil, desde, eventos)) {
    if (e.fecha === null) continue;
    const prefijo = e.estado === 'previsto' ? '(Previsto) ' : '';
    const descripcion = `${e.detalle}\n\nFuente: ${e.fuente.etiqueta}\n${e.fuente.url}\n\nInformación educativa, no asesoramiento. Comprueba siempre la fecha en la sede de la AEAT.`;
    lineas.push(
      'BEGIN:VEVENT',
      `UID:${e.id}-${perfil}@wealthuncut.com`,
      `DTSTAMP:${sello}`,
      `DTSTART;VALUE=DATE:${compacta(e.fecha)}`,
      `DTEND;VALUE=DATE:${compacta(diaSiguiente(e.fecha))}`,
      `SUMMARY:${escaparTexto(prefijo + e.titulo)}`,
      `DESCRIPTION:${escaparTexto(descripcion)}`,
      `URL:${e.fuente.url}`,
      'TRANSP:TRANSPARENT',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escaparTexto(e.titulo)}`,
      'TRIGGER:-P7D',
      'END:VALARM',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escaparTexto(e.titulo)}`,
      'TRIGGER:-P1D',
      'END:VALARM',
      'END:VEVENT'
    );
  }
  lineas.push('END:VCALENDAR');
  return lineas.map(plegarLinea).join(CRLF) + CRLF;
}
