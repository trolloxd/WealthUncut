import type { APIRoute, GetStaticPaths } from 'astro';
import { PERFILES, generarIcs, type Perfil } from '../../../lib/calculos/calendario-fiscal';

// Un .ics estático por perfil (/herramientas/calendario-fiscal/<perfil>.ics), generado en el build con las
// fechas de src/lib/calculos/calendario-fiscal.ts. Sin JavaScript en el navegador y sin tocar la CSP.
export const getStaticPaths: GetStaticPaths = () => PERFILES.map((p) => ({ params: { perfil: p.id } }));

export const GET: APIRoute = ({ params }) => {
  const hoy = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
  return new Response(generarIcs(params.perfil as Perfil, hoy), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
};
