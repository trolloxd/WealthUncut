// Comprobación diaria de "Los datos de hoy", sin IA y sin créditos: compara lo que hay publicado con su fuente.
//
// Uso: node scripts/comprobar-frescura.mjs [--log <carpeta>] [--sin-rama] [--probar-rama] [--solo-registro]
// (--probar-rama: prepara la rama aunque no haya desvío, para probar el mecanismo; no publica nada)
// (--solo-registro: sin red ni git; solo lee el registro de caducidades del árbol de trabajo y lista lo vencido. Es lo
//  que corre antes de cada `npm run build`; solo falla con FRESCURA_ESTRICTA=1 o --estricto y algo crítico vencido)
//
// Registro de caducidades (src/config/caducidades.json, lógica en src/lib/caducidades.ts): cada dato del sitio que
// caduca, con su fuente, su regla y cómo se actualiza. Tras las comprobaciones de arriba, el script lista qué está
// vencido, qué está por vencer y qué toca en los próximos 14 días. Procedimiento: ACTUALIZACION-PROCEDIMIENTO.md.
//
// 1. Lee los datos de origin/main (lo que está publicado), no los de la copia local.
// 2. Fuentes: API de datos del BCE (tipo de depósito y euro/dólar), BOE (euríbor, scripts/lib/euribor-boe.mjs) y
//    el comparador de cuentas del propio sitio (src/data/cuentas-remuneradas/ultimo.json, fecha de revisión).
// 3. Umbrales en src/lib/frescura.ts. Comprueba también que la portada de wealthuncut.com enseña esas cifras.
// 4. Si hay desvío que se pueda arreglar con un script fijo (BCE o BOE con un dato más nuevo), prepara el arreglo
//    en una rama local `auto/frescura-AAAA-MM-DD` (nunca publica ni hace push). Las cuentas no se tocan solas:
//    se revisan a mano o con su rutina.
// 5. Escribe el resultado en <carpeta>/AAAA-MM-DD.json (si se pasa --log) y en la salida. Código de salida:
//    0 todo bien o solo avisos, 1 si hay algún error de frescura o de desvío, 2 si la propia comprobación falla.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buscarEuriborBOE } from './lib/euribor-boe.mjs';
import { frescuraBCE, frescuraCuentas, frescuraEuribor, peor } from '../src/lib/frescura.ts';
import { evaluar, peorNivel, sumarDias } from '../src/lib/caducidades.ts';
import { contextoFs, leerValor } from './lib/caducidades-io.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (n) => (process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : null);
const LOG = arg('--log');
const SIN_RAMA = process.argv.includes('--sin-rama');
const PROBAR_RAMA = process.argv.includes('--probar-rama');
const SOLO_REGISTRO = process.argv.includes('--solo-registro');
const ESTRICTO = process.argv.includes('--estricto') || process.env.FRESCURA_ESTRICTA === '1';
const hoy = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });

const git = (...a) => execFileSync('git', a, { cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const leerMain = (ruta) => JSON.parse(git('show', `origin/main:${ruta}`));

async function ecb(flow, key) {
  const url = `https://data-api.ecb.europa.eu/service/data/${flow}/${key}?lastNObservations=1&format=csvdata`;
  for (let i = 1; i <= 3; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const [cab, fila] = (await res.text()).trim().split('\n');
      const c = cab.split(',');
      const v = fila.split(',');
      return [v[c.indexOf('TIME_PERIOD')], Number(v[c.indexOf('OBS_VALUE')])];
    } catch (e) {
      if (i === 3) throw new Error(`BCE ${flow}/${key}: ${e.message}`);
      await new Promise((r) => setTimeout(r, 2000 * i));
    }
  }
}

const num = (v, d) => v.toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d });

const NIVEL_DE_ESTADO = { ok: 'ok', aviso: 'aviso', error: 'vencido' };

/** Evalúa todo el registro. `resultadosScript` (opcional) aporta el estado ya comprobado contra la API de los datos que lo declaran. */
function evaluarRegistro(ctx, resultadosScript = []) {
  const registro = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'config', 'caducidades.json'), 'utf8'));
  return registro.entradas.map((e) => {
    let ev;
    try {
      ev = evaluar(e, leerValor(e.fecha, ctx, hoy), hoy);
    } catch (err) {
      ev = { ...evaluar({ ...e, vence: { tipo: 'sin-fecha' } }, null, hoy), nivel: 'vencido', detalle: `no se pudo leer: ${err.message.split('\n')[0]}`, informativo: false };
      ev.bloquea = e.critico;
    }
    const rs = e.resultadoScript && resultadosScript.find((r) => r.dato === e.resultadoScript);
    if (rs) {
      ev.nivel = NIVEL_DE_ESTADO[rs.estado];
      ev.detalle = rs.detalle;
      ev.bloquea = e.critico && ev.nivel === 'vencido';
    }
    return ev;
  });
}

function imprimirRegistro(evs) {
  const como = (x) => `${x.modo === 'script' && x.comando ? `script: ${x.comando}` : x.modo}; ${x.procedimiento}`;
  const grupo = (titulo, lista, linea) => {
    if (!lista.length) return;
    console.log(`${titulo} (${lista.length})`);
    for (const x of lista) console.log(`  - ${linea(x)}`);
  };
  const reales = evs.filter((x) => !x.informativo);
  console.log(`\n== Registro de caducidades (${hoy}) ==`);
  grupo('VENCIDO', reales.filter((x) => x.nivel === 'vencido'), (x) => `[${x.id}]${x.bloquea ? ' CRÍTICO' : ''} ${x.descripcion}: ${x.detalle}. Cómo: ${como(x)}. Quién: ${x.responsable}`);
  grupo('POR VENCER', reales.filter((x) => x.nivel === 'aviso'), (x) => `[${x.id}] ${x.descripcion}: ${x.detalle}. Cómo: ${como(x)}`);
  const limite = sumarDias(hoy, 14);
  grupo('PRÓXIMOS 14 DÍAS', reales.filter((x) => x.nivel === 'ok' && x.proxima && x.proxima >= hoy && x.proxima <= limite), (x) => `[${x.id}] ${x.descripcion}: toca desde el ${x.proxima}`);
  const alDia = reales.filter((x) => x.nivel === 'ok');
  console.log(`AL DÍA (${alDia.length}): ${alDia.map((x) => x.id).join(', ') || 'ninguno'}`);
  const sinFecha = evs.filter((x) => x.informativo);
  if (sinFecha.length) console.log(`SIN FECHA COMPROBABLE (${sinFecha.length}): ${sinFecha.map((x) => x.id).join(', ')}`);
  const bloquean = evs.filter((x) => x.bloquea);
  console.log(`Registro de caducidades: ${peorNivel(reales).toUpperCase()}${bloquean.length ? `; críticos vencidos: ${bloquean.map((x) => x.id).join(', ')}` : ''}`);
  return bloquean;
}

async function soloRegistro() {
  try {
    const bloquean = imprimirRegistro(evaluarRegistro(contextoFs(REPO)));
    process.exit(ESTRICTO && bloquean.length ? 1 : 0);
  } catch (e) {
    console.error(`El registro de caducidades no se pudo evaluar: ${e.message}`);
    process.exit(ESTRICTO ? 2 : 0); // un fallo de esta lista nunca debe parar un build normal
  }
}

async function main() {
  if (SOLO_REGISTRO) return soloRegistro();
  git('fetch', '-q', 'origin', 'main');
  const resultados = [];
  const arreglos = [];

  // Datos publicados (origin/main).
  const ficherosMercados = git('ls-tree', '--name-only', 'origin/main', 'src/data/mercados/')
    .split('\n')
    .filter((f) => /\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort();
  // Última observación de una serie, buscando hacia atrás si al fichero más reciente le falta (como la portada).
  const ultimaObs = (id) => {
    for (const f of [...ficherosMercados].reverse()) {
      const obs = leerMain(f).series?.[id]?.obs;
      if (Array.isArray(obs) && obs.length) return obs.at(-1);
    }
    throw new Error(`ningún fichero de src/data/mercados tiene la serie ${id}`);
  };
  const euribor = leerMain('src/data/euribor/ultimo.json');
  const cuentas = leerMain('src/data/cuentas-remuneradas/ultimo.json');

  // BCE: frescura por días hábiles y desvío frente a la API.
  let bceDesviado = PROBAR_RAMA;
  for (const [id, nombre, flow, key, dec] of [
    ['dfr', 'Tipo de depósito del BCE', 'FM', 'D.U2.EUR.4F.KR.DFR.LEV', 2],
    ['eurusd', 'Euro / dólar', 'EXR', 'D.USD.EUR.SP00.A', 4],
  ]) {
    const [fecha, valor] = ultimaObs(id);
    const r = frescuraBCE(nombre, fecha, hoy);
    const [fFuente, vFuente] = await ecb(flow, key);
    if (fFuente > fecha) {
      r.detalle += `; el BCE ya tiene el del ${fFuente} (${num(vFuente, dec)})`;
      if (id === 'dfr') {
        // La serie del tipo de depósito tiene un dato cada día natural: solo importa si cambia el valor.
        if (vFuente !== valor) {
          r.estado = 'error';
          r.detalle += `: el tipo ha cambiado de ${num(valor, dec)} a ${num(vFuente, dec)}`;
          bceDesviado = true;
        }
      } else if (r.estado !== 'ok') {
        bceDesviado = true; // euro/dólar atrasado por encima del umbral: toca rama de arreglo
      }
    } else if (fFuente === fecha && vFuente !== valor) {
      r.estado = 'error';
      r.detalle += `; no coincide con el BCE (${num(vFuente, dec)})`;
      bceDesviado = true;
    }
    resultados.push(r);
  }

  // Euríbor: regla del día 4 y si el BOE ya tiene un mes más nuevo.
  const rEur = frescuraEuribor(euribor.ultimoMes, hoy);
  const [a, m] = hoy.split('-').map(Number);
  const mesPrevio = m === 1 ? `${a - 1}-12` : `${a}-${String(m - 1).padStart(2, '0')}`;
  let euriborNuevo = null;
  if (euribor.ultimoMes < mesPrevio) {
    euriborNuevo = await buscarEuriborBOE(mesPrevio);
    if (euriborNuevo) {
      // Dentro del plazo (días 1 a 3) es solo un aviso; desde el día 4 ya era error.
      if (rEur.estado === 'ok') rEur.estado = 'aviso';
      rEur.detalle += `; el BOE ya publicó ${mesPrevio}: ${num(euriborNuevo.valor, 3)} % (${euriborNuevo.boe})`;
    }
  }
  resultados.push(rEur);

  // Cuentas: fecha de revisión del comparador.
  resultados.push(frescuraCuentas(cuentas.fecha, hoy));

  // Producción: la portada enseña las cifras de origin/main (si no, el despliegue se ha atascado).
  try {
    const res = await fetch(`https://wealthuncut.com/?frescura=${Date.now()}`, { signal: AbortSignal.timeout(30000) });
    const html = await res.text();
    const mejor = cuentas.cuentas.filter((c) => !c.vinculacion).sort((x, y) => y.tae - x.tae)[0];
    const esperado = [
      `${num(euribor.ultimoValor, 3)}%`,
      `${num(ultimaObs('dfr')[1], 2)}%`,
      `${num(ultimaObs('eurusd')[1], 4)}`,
      mejor ? `${num(mejor.tae, 2)}% TAE` : null,
    ].filter(Boolean);
    const faltan = esperado.filter((t) => !html.includes(t));
    resultados.push({
      dato: 'Portada en producción',
      estado: res.ok && faltan.length === 0 ? 'ok' : 'error',
      detalle: res.ok ? (faltan.length ? `no muestra: ${faltan.join(', ')}` : 'muestra las cifras publicadas') : `HTTP ${res.status}`,
    });
  } catch (e) {
    resultados.push({ dato: 'Portada en producción', estado: 'aviso', detalle: `no se pudo consultar: ${e.message}` });
  }

  // Arreglo en una rama local, solo con los scripts fijos y sin publicar.
  if (!SIN_RAMA && (bceDesviado || euriborNuevo)) {
    // Nombre libre (nunca se reinicia una rama que ya exista) y sin seguimiento de origin: no se puede empujar sin querer.
    let rama = `auto/frescura-${hoy}`;
    for (let n = 2; git('branch', '--list', rama); n++) rama = `auto/frescura-${hoy}-${n}`;
    git('worktree', 'prune');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wu-frescura-'));
    let guardado = false;
    try {
      git('worktree', 'add', '-q', '--no-track', '-b', rama, dir, 'origin/main');
      const run = (script, ...a) => execFileSync(process.execPath, [script, ...a], { cwd: dir, stdio: 'pipe', encoding: 'utf8' });
      if (bceDesviado) {
        run('scripts/datos-mercados.mjs', hoy);
        // No se guarda una instantánea incompleta (datos-mercados.mjs sale con 0 aunque falle una serie).
        const nuevo = JSON.parse(fs.readFileSync(path.join(dir, 'src', 'data', 'mercados', `${hoy}.json`), 'utf8'));
        if (!nuevo.series?.dfr?.obs?.length || !nuevo.series?.eurusd?.obs?.length) throw new Error('la descarga del BCE ha llegado incompleta');
        arreglos.push(`datos del BCE del ${hoy} (scripts/datos-mercados.mjs)`);
      }
      if (euriborNuevo) {
        run('scripts/datos-euribor.mjs');
        arreglos.push(`euríbor de ${mesPrevio} del BOE (scripts/datos-euribor.mjs)`);
      }
      const g = (...a) => execFileSync('git', a, { cwd: dir, encoding: 'utf8', stdio: 'pipe' }).trim();
      g('add', 'src/data');
      if (g('status', '--porcelain')) {
        g('commit', '-q', '-m', `Datos de hoy: actualización de la comprobación diaria (${arreglos.join('; ')})`);
        arreglos.push(`rama local ${rama}, commit ${g('rev-parse', '--short', 'HEAD')}, sin publicar`);
        guardado = true;
      } else {
        arreglos.push('sin cambios que guardar');
      }
    } catch (e) {
      arreglos.push(`no se pudo preparar la rama: ${e.message.split('\n')[0]}`);
      resultados.push({ dato: 'Rama de arreglo', estado: 'aviso', detalle: `no se pudo preparar: ${e.message.split('\n')[0]}` });
    } finally {
      try {
        git('worktree', 'remove', '--force', dir);
      } catch {
        git('worktree', 'prune');
      }
      if (!guardado) {
        try {
          git('branch', '-D', rama); // sin commit, la rama no sirve de nada
        } catch {
          // no llegó a crearse
        }
      }
    }
  }

  // Registro de caducidades: lee de origin/main, como el resto de comprobaciones.
  let caducidades = [];
  let bloquean = [];
  try {
    const ctxMain = {
      leer: (ruta) => git('show', `origin/main:${ruta}`),
      listar: (carpeta) => git('ls-tree', '--name-only', 'origin/main', `${carpeta}/`).split(/\r?\n/).filter(Boolean).map((f) => path.posix.basename(f)),
    };
    caducidades = evaluarRegistro(ctxMain, resultados);
  } catch (e) {
    resultados.push({ dato: 'Registro de caducidades', estado: 'aviso', detalle: `no se pudo evaluar: ${e.message.split(/\r?\n/)[0]}` });
  }

  const estado = peor(resultados);
  const informe = { fecha: hoy, generado: new Date().toISOString(), estado, resultados, arreglos, caducidades };
  for (const r of resultados) console.log(`${r.estado === 'ok' ? 'OK   ' : r.estado === 'aviso' ? 'AVISO' : 'ERROR'} ${r.dato}: ${r.detalle}`);
  for (const x of arreglos) console.log(`ARREGLO ${x}`);
  console.log(`Frescura de los datos de hoy: ${estado.toUpperCase()}`);
  if (caducidades.length) bloquean = imprimirRegistro(caducidades);
  if (LOG) {
    fs.mkdirSync(LOG, { recursive: true });
    fs.writeFileSync(path.join(LOG, `${hoy}.json`), JSON.stringify(informe, null, 2) + '\n');
  }
  process.exit(estado === 'error' || bloquean.length ? 1 : 0);
}

main().catch((e) => {
  console.error(`La comprobación de frescura ha fallado: ${e.message}`);
  if (LOG) {
    fs.mkdirSync(LOG, { recursive: true });
    fs.writeFileSync(path.join(LOG, `${hoy}.json`), JSON.stringify({ fecha: hoy, estado: 'fallo', error: e.message }, null, 2) + '\n');
  }
  process.exit(2);
});
