import { getCollection } from 'astro:content';
import { isPublished } from '../lib/posts';
import { TOOLS } from '../config/tools';

// Índice de búsqueda del sitio (lo usan el cuadro de la cabecera y /buscar/). Se genera en el build.
// t = título, x = texto buscable, k = tipo, u = URL.
const limpia = (s: string) =>
  s
    .replace(/^import .*$/gm, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#*_`>|\[\]()]/g, ' ')
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export async function GET() {
  const [guias, glosario, mercados] = await Promise.all([
    getCollection('blog', ({ data }) => isPublished(data)),
    getCollection('glosario'),
    getCollection('mercados', ({ data }) => isPublished(data)),
  ]);

  const entradas = [
    ...TOOLS.map((t) => ({ k: 'Herramienta', t: t.name, x: `${t.description} ${t.tags.join(' ')}`, u: t.href })),
    ...guias.map((p) => ({
      k: 'Guía',
      t: p.data.title,
      x: `${p.data.description} ${p.data.tags.join(' ')} ${limpia(p.body ?? '').slice(0, 2500)}`,
      u: `/blog/${p.id}/`,
    })),
    ...glosario.map((g) => ({ k: 'Glosario', t: g.data.titulo, x: `${g.data.termino} ${g.data.description}`, u: `/glosario/${g.id}/` })),
    ...mercados
      .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())
      .slice(0, 14)
      .map((m) => ({ k: 'Noticias', t: m.data.title, x: `${m.data.description} ${m.data.tags.join(' ')}`, u: `/mercados/${m.id}/` })),
    { k: 'Plantilla', t: 'Plantillas de Excel gratis', x: 'presupuesto inversiones seguimiento excel descargar', u: '/plantillas/' },
    { k: 'Página', t: 'Empieza aquí', x: 'por dónde empezar recorrido ahorrar invertir impuestos vivienda', u: '/empieza-aqui/' },
    { k: 'Página', t: 'Carteras de fondos', x: 'fondos simulador cartera catálogo', u: '/carteras/' },
    { k: 'Página', t: 'Newsletter: 5 minutos de finanzas', x: 'boletín semanal suscripción', u: '/newsletter/' },
  ];

  return new Response(JSON.stringify(entradas), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
