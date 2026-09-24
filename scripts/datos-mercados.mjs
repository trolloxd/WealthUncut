// Descarga los datos oficiales del Banco Central Europeo que usan los artículos de /mercados/ y
// los guarda en src/data/mercados/AAAA-MM-DD.json (una instantánea por día, para que cada
// artículo muestre siempre los datos con los que se escribió).
//
// Uso: node scripts/datos-mercados.mjs [AAAA-MM-DD]   (por defecto, hoy en UTC)
//
// Fuente: BCE, ECB Data Portal (https://data.ecb.europa.eu). Los datos del BCE se pueden
// reutilizar citando la fuente. Solo se usan series del BCE a propósito: las cotizaciones de
// índices bursátiles tienen licencia y no se reproducen en gráficas.

import fs from 'node:fs';
import path from 'node:path';

const SERIES = {
  eurusd: { flow: 'EXR', key: 'D.USD.EUR.SP00.A', nombre: 'Euro / dólar', unidad: 'dólares por euro', decimales: 4, obs: 130 },
  eurgbp: { flow: 'EXR', key: 'D.GBP.EUR.SP00.A', nombre: 'Euro / libra', unidad: 'libras por euro', decimales: 4, obs: 130 },
  eurjpy: { flow: 'EXR', key: 'D.JPY.EUR.SP00.A', nombre: 'Euro / yen', unidad: 'yenes por euro', decimales: 2, obs: 130 },
  dfr: { flow: 'FM', key: 'D.U2.EUR.4F.KR.DFR.LEV', nombre: 'Tipo de la facilidad de depósito del BCE', unidad: '%', decimales: 2, obs: 400 },
  estr: { flow: 'EST', key: 'B.EU000A2X2A25.WT', nombre: '€STR (tipo a un día del euro)', unidad: '%', decimales: 3, obs: 130 },
  bono2a: { flow: 'YC', key: 'B.U2.EUR.4F.G_N_A.SV_C_YM.SR_2Y', nombre: 'Rentabilidad a 2 años (curva AAA zona euro)', unidad: '%', decimales: 2, obs: 130 },
  bono10a: { flow: 'YC', key: 'B.U2.EUR.4F.G_N_A.SV_C_YM.SR_10Y', nombre: 'Rentabilidad a 10 años (curva AAA zona euro)', unidad: '%', decimales: 2, obs: 130 },
};

async function descargar(flow, key, n) {
  const url = `https://data-api.ecb.europa.eu/service/data/${flow}/${key}?lastNObservations=${n}&format=csvdata`;
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
      if (intento === 3) throw new Error(`${flow}/${key}: ${e.message}`);
      await new Promise((r) => setTimeout(r, 2000 * intento));
    }
  }
}

const fecha = process.argv[2] ?? new Date().toISOString().slice(0, 10);
const salida = { fecha, generado: new Date().toISOString(), fuente: 'Banco Central Europeo, ECB Data Portal', fuenteUrl: 'https://data.ecb.europa.eu', series: {} };

const errores = [];
for (const [id, s] of Object.entries(SERIES)) {
  try {
    const obs = await descargar(s.flow, s.key, s.obs);
    // El tipo de depósito solo publica cambios: se deja la serie tal cual (escalones).
    salida.series[id] = { nombre: s.nombre, unidad: s.unidad, decimales: s.decimales, url: `https://data.ecb.europa.eu/data/datasets/${s.flow}/${s.flow}.${s.key}`, obs };
    const ultimo = obs.at(-1);
    console.log(`${id.padEnd(10)} ${ultimo?.[0]} ${ultimo?.[1]}`);
  } catch (e) {
    errores.push(e.message);
    console.error(`ERROR ${id}: ${e.message}`);
  }
}

const dir = path.join('src', 'data', 'mercados');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, `${fecha}.json`), JSON.stringify(salida, null, 1) + '\n');
console.log(`Guardado ${path.join(dir, `${fecha}.json`)}${errores.length ? ` con ${errores.length} series fallidas` : ''}`);
if (Object.keys(salida.series).length === 0) process.exit(1);
