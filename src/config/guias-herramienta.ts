/**
 * Guía del blog que explica el cálculo de cada herramienta (slug de /herramientas/<slug>/ → id del artículo).
 * `ToolLayout.astro` pone un enlace a la guía dentro del texto de la herramienta, y el artículo enlaza a
 * su calculadora: así las dos páginas del mismo tema se refuerzan en los dos sentidos.
 * Una herramienta nueva con artículo propio se añade aquí (lo comprueba tests/guias-herramienta.test.ts).
 */
export const GUIA_DE_HERRAMIENTA: Record<string, string> = {
  'calculadora-impuesto-dividendos': 'impuesto-dividendos-espana',
  'calculadora-impuestos-venta-fondos': 'como-tributan-los-fondos-de-inversion-en-espana',
  'calculadora-irpf-alquiler': 'declarar-alquiler-renta-gastos-reducciones',
  'calculadora-baja-laboral': 'baja-laboral-cuanto-se-cobra',
  'calculadora-inflacion': 'inflacion-que-interes-necesitas-para-no-perder',
  'simulador-hipoteca-euribor': 'hipoteca-fija-variable-o-mixta',
  'calculadora-sueldo-neto': 'sueldo-neto-de-bruto-a-neto',
  'calculadora-fondo-de-emergencia': 'fondo-de-emergencia-cuanto-necesitas',
  'calculadora-modelo-720': 'modelo-720-quien-tiene-que-presentarlo',
  'ranking-irpf-comunidades': 'irpf-por-comunidad-autonoma-donde-se-paga-menos',
  'comparador-fondos-indexados': 'que-es-un-fondo-indexado',
  'calculadora-cuota-autonomos': 'cuota-autonomos-2026-tramos',
  'calculadora-indemnizacion-despido': 'indemnizacion-despido-como-se-calcula',
  'calculadora-factura-autonomo': 'como-hacer-factura-autonomo',
  'calculadora-prestamo-tae': 'prestamo-personal-tin-tae-intereses',
  'calculadora-revision-hipoteca': 'revision-hipoteca-euribor-cuanto-sube',
  'cuanto-ahorrar-al-mes': 'cuanto-ahorrar-al-mes-segun-sueldo',
  'calculadora-independencia-financiera': 'independencia-financiera-cuanto-dinero-necesitas',
  'calculadora-interes-compuesto': 'interes-compuesto-explicado-con-ejemplos',
  'amortizar-hipoteca-cuanto-ahorras': 'amortizar-hipoteca-reducir-cuota-o-plazo',
  'ahorro-entrada-piso': 'cuanto-ahorrar-entrada-piso',
  'alquilar-o-comprar-vivienda': 'alquilar-o-comprar-vivienda-las-cuentas',
  'plan-pensiones-vs-fondo-indexado': 'plan-pensiones-o-fondo-indexado',
  'comparador-fondo-indexado-vs-etf': 'fondo-indexado-vs-etf-diferencias',
  'ayudas-vivienda-jovenes': 'ayuda-alquiler-jovenes-requisitos',
};
