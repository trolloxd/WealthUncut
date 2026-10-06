// Comprueba que los enlaces EXTERNOS de la web compilada (dist/client) siguen vivos.
// Uso: npm run build && node scripts/comprobar-enlaces.mjs
// Sale con código 1 si hay enlaces rotos (404 o 410). Lo demás se lista como "no concluyente":
// muchos medios bloquean a los robots aunque la página exista.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const RAIZ = 'dist/client';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36';

function* html(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) yield* html(p);
    else if (f.endsWith('.html')) yield p;
  }
}

const enlaces = new Map();
for (const p of html(RAIZ)) {
  const pagina = p.slice(RAIZ.length).replace(/\\/g, '/').replace(/index\.html$/, '');
  for (const m of readFileSync(p, 'utf8').matchAll(/href="(https?:\/\/[^"#]+)/g)) {
    const url = m[1].replaceAll('&amp;', '&');
    if (url.includes('wealthuncut.com')) continue;
    if (!enlaces.has(url)) enlaces.set(url, new Set());
    enlaces.get(url).add(pagina);
  }
}

async function comprobar(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const r = await fetch(url, { method, redirect: 'follow', headers: { 'User-Agent': UA, Accept: 'text/html,*/*' }, signal: AbortSignal.timeout(20000) });
      if (method === 'HEAD' && [400, 403, 404, 405, 501].includes(r.status)) continue;
      return r.status;
    } catch (e) {
      if (method === 'GET') return `error de red (${e.cause?.code ?? e.name})`;
    }
  }
  return 'sin respuesta';
}

const urls = [...enlaces.keys()].sort();
const resultados = [];
const cola = [...urls];
await Promise.all(
  Array.from({ length: 10 }, async () => {
    while (cola.length) {
      const url = cola.shift();
      resultados.push([url, await comprobar(url)]);
    }
  })
);

// Solo 404/410 y dominios que ya no existen son concluyentes. El resto (403, 429, 5xx, cortes de red)
// suele ser el servidor del medio rechazando a un robot, así que se lista como no concluyente.
const esRoto = (s) => s === 404 || s === 410 || (typeof s === 'string' && s.includes('ENOTFOUND'));
const rotos = resultados.filter(([, s]) => esRoto(s));
const inconcluyentes = resultados.filter(([, s]) => s !== 200 && !esRoto(s));
console.log(`${urls.length} enlaces externos revisados: ${rotos.length} rotos, ${inconcluyentes.length} no concluyentes (bloquean robots o fallo puntual).`);
for (const [url, s] of rotos) console.log(`ROTO ${s}  ${url}
     en: ${[...enlaces.get(url)].slice(0, 3).join(', ')}`);
for (const [url, s] of inconcluyentes) console.log(`?    ${s}  ${url}`);
if (rotos.length) process.exit(1);
