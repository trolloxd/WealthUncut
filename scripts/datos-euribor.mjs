// Euríbor a un año oficial, mes a mes, desde las resoluciones del Banco de España publicadas en el BOE, y lo
// guarda en src/data/euribor/ultimo.json (lo usan la portada, /euribor/, las calculadoras de hipoteca y /datos/).
//
// Uso: node scripts/datos-euribor.mjs            (añade los meses que falten hasta el último publicado)
//      node scripts/datos-euribor.mjs --rehacer  (vuelve a leer todos los meses desde DESDE)
//
// Fuente única: BOE, "Resolución ... del Banco de España, por la que se publican determinados tipos de interés
// oficiales de referencia del mercado hipotecario" (sale hacia el día 2 de cada mes con el dato del mes
// anterior). Cada mes guarda el identificador BOE-A de su resolución. No se usa la serie del BCE ni la de EMMI:
// Euribor® es una marca de EMMI y aquí solo se reproduce el valor oficial publicado en el BOE.

import fs from 'node:fs';
import path from 'node:path';
import { buscarEuriborBOE, mesSiguiente } from './lib/euribor-boe.mjs';

const DESDE = '2021-01';
const fichero = path.join('src', 'data', 'euribor', 'ultimo.json');
const rehacer = process.argv.includes('--rehacer');

let previo = [];
try {
  const actual = JSON.parse(fs.readFileSync(fichero, 'utf8'));
  // Solo se reaprovechan meses que ya vienen del BOE (con su identificador).
  if (!rehacer) previo = (actual.historico ?? []).filter((p) => typeof p.boe === 'string');
} catch {
  // sin fichero previo: se descarga todo
}

const porMes = new Map(previo.map((p) => [p.mes, p]));
const hoy = new Date();
const mesActual = hoy.toISOString().slice(0, 7);
let nuevos = 0;
for (let mes = DESDE; mes < mesActual; mes = mesSiguiente(mes)) {
  if (porMes.has(mes)) continue;
  const dato = await buscarEuriborBOE(mes, { hoy });
  if (!dato) {
    // Todavía sin publicar (solo puede pasar con el mes anterior al actual).
    if (mesSiguiente(mes) !== mesActual) {
      console.error(`No se encuentra en el BOE la resolución del euríbor de ${mes}. No se actualiza el fichero.`);
      process.exit(1);
    }
    console.log(`El euríbor de ${mes} aún no está en el BOE.`);
    break;
  }
  porMes.set(mes, { mes: dato.mes, valor: dato.valor, boe: dato.boe, publicado: dato.publicado });
  nuevos++;
  console.log(`${dato.mes}: ${dato.valor.toFixed(3)} % (${dato.boe}, BOE del ${dato.publicado})`);
}

const historico = [...porMes.values()].sort((a, b) => a.mes.localeCompare(b.mes));
if (historico.length === 0) {
  console.error('Sin datos del euríbor en el BOE, no se actualiza el fichero existente.');
  process.exit(1);
}
if (nuevos === 0 && previo.length > 0) {
  console.log('Sin meses nuevos: el fichero no cambia.');
  process.exit(0);
}

const ultimo = historico.at(-1);
const salida = {
  generado: new Date().toISOString(),
  fuente: 'Banco de España, tipos de interés oficiales de referencia del mercado hipotecario, publicados en el BOE',
  fuenteUrl: `https://www.boe.es/diario_boe/txt.php?id=${ultimo.boe}`,
  ultimoMes: ultimo.mes,
  ultimoValor: ultimo.valor,
  ultimoBoe: ultimo.boe,
  ultimoPublicado: ultimo.publicado,
  historico,
};
fs.mkdirSync(path.dirname(fichero), { recursive: true });
// Escritura atómica: primero a un temporal y luego se renombra, para no dejar nunca el fichero a medias.
fs.writeFileSync(`${fichero}.tmp`, JSON.stringify(salida, null, 1) + '\n');
fs.renameSync(`${fichero}.tmp`, fichero);
console.log(`Euríbor oficial de ${ultimo.mes}: ${ultimo.valor.toFixed(3)} % (${ultimo.boe}). Guardado ${fichero} (${historico.length} meses).`);
