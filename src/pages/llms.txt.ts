import { getCollection } from 'astro:content';
import { isPublished } from '../lib/posts';
import { TOOLS } from '../config/tools';
import { SITE } from '../config/site';

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
    '## Guías',
    ...guias.map((p) => l(p.data.title, `/blog/${p.id}/`, p.data.description)),
    '',
    '## Datos y recursos',
    l('Datos abiertos (CSV y JSON, CC BY 4.0)', '/datos/', 'Tramos de IRPF, ITP por comunidad, cuota de autónomos y euríbor, con fuente y fecha.'),
    l('Plantillas de Excel gratis', '/plantillas/', 'Presupuesto mensual y seguimiento de inversiones.'),
    l('Glosario', '/glosario/', 'Definiciones cortas de términos financieros.'),
    l('Metodología', '/metodologia/', 'Cómo se verifican y corrigen los datos.'),
    l('Prensa', '/prensa/', 'Quién está detrás y cómo citar el sitio.'),
    '',
  ];
  return new Response(cuerpo.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
