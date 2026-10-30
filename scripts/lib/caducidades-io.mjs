// Lectura de las fechas de última verificación del registro de caducidades (src/config/caducidades.json).
// La lógica de qué está vencido vive en src/lib/caducidades.ts; aquí solo se lee de los ficheros.
// `ctx` permite leer de otra fuente (comprobar-frescura.mjs lee de origin/main): leer(ruta) -> texto y listar(carpeta) -> nombres.

import fs from 'node:fs';
import path from 'node:path';
import { ofertasConFecha } from '../../src/lib/caducidades.ts';

export function contextoFs(repo) {
  return {
    leer: (ruta) => fs.readFileSync(path.join(repo, ruta), 'utf8'),
    listar: (carpeta) => fs.readdirSync(path.join(repo, carpeta)),
  };
}

const porClave = (obj, clave) =>
  clave.split('.').reduce((acc, k) => (acc == null ? acc : Array.isArray(acc) && /^-?\d+$/.test(k) ? acc.at(Number(k)) : acc[k]), obj);

const campo = (texto, nombre) => texto.match(new RegExp('^' + nombre + String.raw`:\s*["']?(\d{4}-\d{2}-\d{2})`, 'm'))?.[1] ?? null;

function articulos(ctx) {
  return ctx
    .listar('src/content/blog')
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => {
      const cab = ctx.leer(`src/content/blog/${f}`).split(/^---\s*$/m)[1] ?? '';
      return { f, pubDate: campo(cab, 'pubDate'), updatedDate: campo(cab, 'updatedDate'), draft: /^draft:\s*true/m.test(cab) };
    })
    .filter((a) => a.pubDate && !a.draft);
}

/** Devuelve el valor que espera evaluar() para la lectura dada (fecha, mes, número o lista de ofertas) o null. */
export function leerValor(lectura, ctx, hoy) {
  switch (lectura.tipo) {
    case 'literal':
      return lectura.valor;
    case 'ninguna':
      return null;
    case 'json':
      return porClave(JSON.parse(ctx.leer(lectura.fichero)), lectura.clave) ?? null;
    case 'regex':
      return ctx.leer(lectura.fichero).match(new RegExp(lectura.patron))?.[1] ?? null;
    case 'fechas-max':
      return (ctx.leer(lectura.fichero).match(/\d{4}-\d{2}-\d{2}/g) ?? []).sort().at(-1) ?? null;
    case 'ultimo-fichero': {
      const re = new RegExp(lectura.patron);
      return ctx.listar(lectura.carpeta).map((n) => n.match(re)?.[1]).filter(Boolean).sort().at(-1) ?? null;
    }
    case 'mercados-serie': {
      const ficheros = ctx.listar('src/data/mercados').filter((n) => /^\d{4}-\d{2}-\d{2}\.json$/.test(n)).sort().reverse();
      for (const n of ficheros) {
        const obs = JSON.parse(ctx.leer(`src/data/mercados/${n}`)).series?.[lectura.serie]?.obs;
        if (Array.isArray(obs) && obs.length) return obs.at(-1)[0];
      }
      return null;
    }
    case 'ofertas-en-json':
      return ofertasConFecha(JSON.parse(ctx.leer(lectura.fichero)));
    case 'cola-articulos':
      return articulos(ctx).filter((a) => a.pubDate > hoy).length;
    case 'articulo-mas-antiguo':
      return articulos(ctx).filter((a) => a.pubDate <= hoy).map((a) => a.updatedDate ?? a.pubDate).sort()[0] ?? null;
    default:
      throw new Error(`lectura desconocida: ${lectura.tipo}`);
  }
}
