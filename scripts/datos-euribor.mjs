// Descarga la media mensual del euríbor a 12 meses (índice de referencia hipotecario) del Banco
// Central Europeo y la guarda en src/data/euribor/ultimo.json.
//
// Uso: node scripts/datos-euribor.mjs
//
// Fuente: BCE, ECB Data Portal (https://data.ecb.europa.eu), serie FM.M.U2.EUR.RT.MM.EURIBOR1YD_.HSTA
// (media de cierres diarios de Refinitiv). No es exactamente el mismo dato que publica el Banco de
// España como "índice de referencia euríbor a un año" (que usa las cifras oficiales de EMMI), pero
// es la aproximación mensual más próxima disponible en el BCE con licencia de reutilización.

import fs from 'node:fs';
import path from 'node:path';

const FLOW = 'FM';
const KEY = 'M.U2.EUR.RT.MM.EURIBOR1YD_.HSTA';
const N_MESES = 37; // 36 meses de histórico + el mes actual si ya está publicado

async function descargar() {
  const url = `https://data-api.ecb.europa.eu/service/data/${FLOW}/${KEY}?lastNObservations=${N_MESES}&format=csvdata`;
  for (let intento = 1; intento <= 3; intento++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const csv = await res.text();
      const [cabecera, ...filas] = csv.trim().split('\n');
      const cols = cabecera.split(',');
      const iFecha = cols.indexOf('TIME_PERIOD');
      const iValor = cols.indexOf('OBS_VALUE');
      return filas
        .map((f) => f.split(','))
        .filter((c) => c[iValor] !== '' && !Number.isNaN(Number(c[iValor])))
        .map((c) => [c[iFecha], Number(c[iValor])]);
    } catch (e) {
      if (intento === 3) throw new Error(`${FLOW}/${KEY}: ${e.message}`);
      await new Promise((r) => setTimeout(r, 2000 * intento));
    }
  }
}

const obs = await descargar();
if (!obs || obs.length === 0) {
  console.error('Sin datos del euríbor, no se actualiza el fichero existente.');
  process.exit(1);
}

const ultimo = obs.at(-1);
const salida = {
  generado: new Date().toISOString(),
  fuente: 'Banco Central Europeo, ECB Data Portal (media mensual de cierres, Refinitiv)',
  fuenteUrl: `https://data.ecb.europa.eu/data/datasets/${FLOW}/${FLOW}.${KEY}`,
  ultimoMes: ultimo[0],
  ultimoValor: ultimo[1],
  historico: obs.map(([mes, valor]) => ({ mes, valor })),
};

const dir = path.join('src', 'data', 'euribor');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'ultimo.json'), JSON.stringify(salida, null, 1) + '\n');
console.log(`Euríbor 12 meses, ${ultimo[0]}: ${ultimo[1].toFixed(3)}%`);
console.log(`Guardado src/data/euribor/ultimo.json`);
