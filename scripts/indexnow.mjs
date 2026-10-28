#!/usr/bin/env node
/**
 * Avisa a los buscadores que usan IndexNow (Bing, Yandex, Naver, Seznam, y por tanto ChatGPT Search y otros
 * que parten del índice de Bing) de las URLs nuevas o cambiadas. Google NO usa IndexNow: a Google se le avisa
 * con el sitemap (que ya se genera solo) y con Search Console.
 *
 * Sin cuentas ni secretos: la clave es pública a propósito. El protocolo la verifica con el archivo
 * `public/<clave>.txt` (su contenido es la propia clave), que sirve la web en la raíz.
 *
 * Uso (desde la raíz del repo, tras hacer push a main):
 *   node scripts/indexnow.mjs                  URLs de lo cambiado en el último commit (HEAD~1..HEAD)
 *   node scripts/indexnow.mjs --desde=<ref>    cambios desde otro commit (p. ej. el último lote: HEAD~7)
 *   node scripts/indexnow.mjs --esperar        espera (hasta 12 min) a que cada URL responda 200 en producción
 *   node scripts/indexnow.mjs --todas          todo el sitemap (una vez, o tras un cambio grande)
 *   node scripts/indexnow.mjs --dry-run        solo muestra qué enviaría
 *
 * Regla: solo se envían URLs que estén en el sitemap (así nunca se avisa de borradores ni de artículos
 * programados con fecha futura, que aún no existen). Si el aviso falla, el script lo cuenta y termina con
 * código 0: un fallo de IndexNow no debe tumbar la rutina que ha publicado. `--estricto` lo cambia.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITIO = 'https://wealthuncut.com';
const HOST = 'wealthuncut.com';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX_URLS = 10000; // límite del protocolo por petición

const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const valor = (n, defecto) => args.find((a) => a.startsWith(`--${n}=`))?.split('=')[1] ?? defecto;

/** Clave: el archivo public/<hex>.txt cuyo contenido es su propio nombre. */
export function leerClave(dirPublic = join(RAIZ, 'public')) {
  for (const f of readdirSync(dirPublic)) {
    const m = f.match(/^([a-f0-9]{8,128})\.txt$/i);
    if (m && readFileSync(join(dirPublic, f), 'utf8').trim() === m[1]) return m[1];
  }
  throw new Error('No hay archivo de clave IndexNow en public/ (<clave>.txt con la clave dentro).');
}

const frontmatter = (ruta) => {
  try {
    return readFileSync(join(RAIZ, ruta), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  } catch {
    return '';
  }
};

/** De un archivo cambiado del repo a las URLs públicas que afecta (todas con barra final). */
export function urlsDeArchivo(ruta) {
  const r = ruta.replace(/\\/g, '/');
  const u = new Set();
  let m;
  if ((m = r.match(/^src\/content\/blog\/(.+)\.mdx?$/))) {
    u.add(`/blog/${m[1]}/`).add('/blog/').add('/');
    const cat = frontmatter(r).match(/^categoria:\s*["']?([\w-]+)["']?/m)?.[1];
    if (cat) u.add(`/blog/tema/${cat}/`);
  } else if ((m = r.match(/^src\/content\/mercados\/(.+)\.mdx?$/))) {
    u.add(`/mercados/${m[1]}/`).add('/mercados/').add('/hoy/').add('/');
  } else if ((m = r.match(/^src\/content\/newsletter\/(.+)\.mdx?$/))) {
    u.add(`/newsletter/${m[1]}/`).add('/newsletter/');
  } else if ((m = r.match(/^src\/content\/glosario\/(.+)\.mdx?$/))) {
    u.add(`/glosario/${m[1]}/`).add('/glosario/');
  } else if ((m = r.match(/^src\/pages\/(.+)\.astro$/)) && !/\[|^api\/|^embed\//.test(m[1])) {
    const p = m[1] === 'index' ? '' : m[1].replace(/\/index$/, '') + '/';
    u.add(`/${p}`);
  } else if (/^src\/data\/euribor\//.test(r)) {
    u.add('/euribor/').add('/');
  } else if (/^src\/data\//.test(r)) {
    u.add('/hoy/').add('/');
  }
  return [...u];
}

function git(...a) {
  return execFileSync('git', a, { cwd: RAIZ, encoding: 'utf8' }).trim();
}

export function archivosCambiados(desde, hasta = 'HEAD') {
  const sal = git('diff', '--name-only', '--diff-filter=AMR', desde, hasta);
  return sal ? sal.split('\n') : [];
}

const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1]);

/** URLs del sitemap: el de dist/ si existe (acaba de compilarse) y, si no, el de producción. */
async function urlsDelSitemap() {
  const local = join(RAIZ, 'dist', 'client', 'sitemap-0.xml');
  if (existsSync(local) && !flag('sitemap-vivo')) return { urls: new Set(locs(readFileSync(local, 'utf8'))), origen: 'dist' };
  const indice = await (await fetch(`${SITIO}/sitemap-index.xml`)).text();
  const todas = new Set();
  for (const s of locs(indice)) for (const l of locs(await (await fetch(s)).text())) todas.add(l);
  return { urls: todas, origen: 'producción' };
}

async function esperar200(url) {
  for (let i = 0; i < 48; i++) {
    try {
      const r = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      if (r.status === 200) return true;
    } catch {
      /* red caída un momento: se reintenta */
    }
    await new Promise((res) => setTimeout(res, 15000));
  }
  return false;
}

async function main() {
  const clave = leerClave();
  const sitemap = await urlsDelSitemap();
  let candidatas;
  if (flag('todas')) {
    candidatas = [...sitemap.urls];
  } else {
    const desde = valor('desde', 'HEAD~1');
    const archivos = archivosCambiados(desde);
    candidatas = [...new Set(archivos.flatMap((f) => urlsDeArchivo(f)))].map((p) => SITIO + p);
    console.log(`Archivos cambiados desde ${desde}: ${archivos.length}`);
  }
  const urls = candidatas.filter((u) => sitemap.urls.has(u)).slice(0, MAX_URLS);
  const fuera = candidatas.filter((u) => !sitemap.urls.has(u));
  if (fuera.length) console.log(`Omitidas (no están en el sitemap de ${sitemap.origen}, p. ej. programadas): ${fuera.length}`);
  if (!urls.length) return console.log('IndexNow: nada que enviar.');
  console.log(`IndexNow: ${urls.length} URL(s)\n` + urls.map((u) => `  ${u}`).join('\n'));
  if (flag('dry-run')) return console.log('(dry-run: no se envía nada)');

  if (flag('esperar')) {
    const lista = urls.slice(0, 20); // basta con esperar a las primeras: se despliegan a la vez
    const listas = await Promise.all(lista.map(esperar200));
    if (!listas.every(Boolean)) console.log('Aviso: alguna URL no respondía 200 tras 12 min; se envía igualmente.');
  }

  const cuerpo = { host: HOST, key: clave, keyLocation: `${SITIO}/${clave}.txt`, urlList: urls };
  const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(cuerpo) });
  // 200 y 202 = aceptado. 422/403 = clave o URLs no válidas. 429 = demasiadas peticiones.
  console.log(`IndexNow: HTTP ${r.status}`);
  if (![200, 202].includes(r.status)) throw new Error(`IndexNow respondió ${r.status}`);
}

if (process.argv[1] && relative(process.argv[1], fileURLToPath(import.meta.url)) === '') {
  main().catch((e) => {
    console.error(`IndexNow falló: ${e.message}`);
    process.exit(flag('estricto') ? 1 : 0);
  });
}
