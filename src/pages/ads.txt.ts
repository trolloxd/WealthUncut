import { ADS, adsListos } from '../config/ads.mjs';

// ads.txt: declara quién puede vender publicidad en el dominio. Mientras la publicidad esté
// desactivada solo lleva un comentario; al activarla, sale la línea de AdSense con el identificador.
export function GET() {
  const id = ADS.publisherId?.replace(/^ca-/, '');
  const cuerpo = adsListos() && id ? `google.com, ${id}, DIRECT, f08c47fec0942fa0\n` : '# Sin publicidad programática configurada.\n';
  return new Response(cuerpo, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
