import { getCollection } from 'astro:content';
import { isPublished } from '../lib/posts';
import { TOOLS } from '../config/tools';
import { SITE } from '../config/site';
import { CATEGORIAS, categoriaDe } from '../config/categorias';

// Resumen del sitio para asistentes de IA (convención llms.txt). Se genera en el build con lo publicado.
export async function GET() {
  const guias = (await getCollection('blog', ({ data }) => isPublished(data))).sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
  const l = (t: string, u: string, d: string) => `- [${t}](${SITE.url}${u}): ${d}`;
  const cuerpo = [
    `# ${SITE.name}`,
    '',
    `> ${SITE.description} Sitio independiente en español sobre finanzas personales e impuestos en España. Todas las cifras fiscales citan su fuente oficial (AEAT, BOE) y su fecha de revisión. Información educativa, no asesoramiento.`,
    '',
    '## Herramientas',
    ...TOOLS.map((t) => l(t.name, t.href, t.description)),
    '',
    '## Guías por tema',
    ...CATEGORIAS.flatMap((c) => {
      const delTema = guias.filter((p) => categoriaDe(p.data).id === c.id);
      if (delTema.length === 0) return [];
      return ['', `### ${c.nombre}`, l('Todas las guías del tema', `/blog/tema/${c.id}/`, c.descripcion), ...delTema.map((p) => l(p.data.title, `/blog/${p.id}/`, p.data.description))];
    }),
    '',
    '## Actualidad y novedades',
    l('Los datos de hoy', '/hoy/', 'Briefing diario con resumen de mercados, datos oficiales del día y un término del glosario.'),
    l('Mercados', '/mercados/', 'Una edición diaria con datos oficiales del BCE verificados en dos fuentes.'),
    l('Boletín 5 minutos de finanzas', '/newsletter/', 'Resumen semanal de lo publicado.'),
    l('Empieza aquí', '/empieza-aqui/', 'Recorrido por objetivos (ahorrar, invertir, impuestos, vivienda) con las guías y herramientas en orden.'),
    l('RSS general', '/rss.xml', 'Artículos, ediciones de mercados y boletines. Cada tema tiene además su feed en /blog/tema/<tema>/rss.xml.'),
    '',
    '## Datos y recursos',
    l('Euríbor oficial mes a mes', '/euribor/', 'Euríbor a un año oficial de cada mes publicado en el BOE por el Banco de España, variación y resumen por año.'),
    l('Datos abiertos (CSV y JSON)', '/datos/', 'Tramos de IRPF, ITP por comunidad y cuota de autónomos (CC BY 4.0), y el euríbor oficial del BOE, con fuente y fecha.'),
    l('Plantillas de Excel gratis', '/plantillas/', 'Presupuesto mensual y seguimiento de inversiones.'),
    l('Glosario', '/glosario/', 'Definiciones cortas de términos financieros.'),
    l('Metodología', '/metodologia/', 'Cómo se verifican y corrigen los datos.'),
    l('Prensa', '/prensa/', 'Quién está detrás y cómo citar el sitio.'),
    '',
  ];
  return new Response(cuerpo.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
