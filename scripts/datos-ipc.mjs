// Compara el IPC de España publicado en el sitio (IPC_ESPANA, src/config/finance.ts) con la API de datos del INE.
// Solo informa: no edita nada. El INE publica el dato definitivo hacia el día 12 a 15 de cada mes; si hay un mes
// nuevo, la rutina de actualización lee la nota de prensa del INE (subyacente, IPCA, fecha) y escribe IPC_ESPANA
// con su fuente (ver ACTUALIZACION-PROCEDIMIENTO.md#ipc).
//
// Uso: node scripts/datos-ipc.mjs
// Salida: 0 sin cambios o con mes nuevo disponible (se indica en el texto), 1 si cambia la serie o la API falla.
// Serie del INE: IPC290750 = Nacional, índice general, variación anual (base 2025; la base 2021 acabó en dic. 2025).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SERIE = 'IPC290750';

const fin = fs.readFileSync(path.join(REPO, 'src', 'config', 'finance.ts'), 'utf8');
const bloque = fin.match(/IPC_ESPANA = \{[\s\S]*?\} as const/)?.[0] ?? '';
const mes = bloque.match(/mes: '(\d{4}-\d{2})'/)?.[1];
const general = Number(bloque.match(/general: ([\d.]+)/)?.[1]);
if (!mes || Number.isNaN(general)) {
  console.error('No se pudo leer IPC_ESPANA de src/config/finance.ts');
  process.exit(1);
}

let datos;
for (let i = 1; i <= 3; i++) {
  try {
    const res = await fetch(`https://servicios.ine.es/wstempus/js/ES/DATOS_SERIE/${SERIE}?nult=1`, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    datos = await res.json();
    break;
  } catch (e) {
    if (i === 3) {
      console.error(`La API del INE no responde: ${e.message}`);
      process.exit(1);
    }
    await new Promise((r) => setTimeout(r, 2000 * i));
  }
}
const ultimo = datos?.Data?.at(-1);
if (!ultimo || datos.COD !== SERIE) {
  console.error('La serie del INE ha cambiado de forma: revisa el código de serie en scripts/datos-ipc.mjs');
  process.exit(1);
}
const mesApi = `${ultimo.Anyo}-${String(ultimo.FK_Periodo).padStart(2, '0')}`;
console.log(`Sitio: ${mes}, general ${general} %. INE (${SERIE}): ${mesApi}, general ${ultimo.Valor} %.`);
if (mesApi > mes) console.log(`MES NUEVO: el INE ya publicó ${mesApi}. Actualiza IPC_ESPANA con la nota de prensa (ACTUALIZACION-PROCEDIMIENTO.md#ipc).`);
else if (mesApi === mes && ultimo.Valor !== general) console.log(`DESVÍO: el INE da ${ultimo.Valor} % para ${mes} y el sitio ${general} %. Contrasta con la nota de prensa y corrige.`);
else console.log('Sin cambios: el sitio tiene el último dato del INE.');
