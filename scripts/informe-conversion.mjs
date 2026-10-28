#!/usr/bin/env node
/**
 * Informe de conversión de los bloques de captación (src/config/cta.mjs), con los contadores reales del KV.
 * Sin IA y sin inventar nada: solo suma lo que el sitio ha medido (ver src/lib/medicion.ts).
 *
 *   node scripts/informe-conversion.mjs                      últimos 7 días completos, se imprime
 *   node scripts/informe-conversion.mjs --salida=<carpeta>   además lo guarda como AAAA-Www.md y ultimo.md
 *   node scripts/informe-conversion.mjs --dias=28            otra ventana
 *   node scripts/informe-conversion.mjs --fichero=<json>     lee contadores de un fichero {"AAAA-MM-DD": {n, c}} (pruebas)
 *
 * Necesita el token de SOLO lectura del KV (CF_KV_READ_TOKEN) y el id de cuenta (CF_ACCOUNT_ID), de las
 * variables de entorno (en Windows también las de usuario). Sin ellos termina con un mensaje claro.
 *
 * Qué es cada cosa: "vista" = el bloque estuvo al menos medio visible en pantalla; "clic" = clic en un enlace del
 * bloque; "envío" = alta correcta en el formulario de la newsletter del bloque. Las tasas son sobre vistas.
 * Una variante solo se declara ganadora con 200 vistas o más por variante y sin solape de los intervalos de
 * confianza de Wilson al 95 %. Antes de eso el informe dice "sin datos suficientes" y no concluye.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { semanaIso } from '../src/config/cta.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const valor = (n) => args.find((a) => a.startsWith(`--${n}=`))?.split('=')[1];
const DIAS = Number(valor('dias') ?? 7);
const MIN_VISTAS = 200;

function userEnv(nombre) {
  if (process.env[nombre]) return process.env[nombre];
  if (process.platform !== 'win32') return '';
  try {
    const out = execFileSync('reg', ['query', 'HKCU\\Environment', '/v', nombre], { encoding: 'utf8', windowsHide: true });
    return (out.match(new RegExp(`${nombre}\\s+REG_\\w+\\s+(.+)`)) || [])[1]?.trim() || '';
  } catch {
    return '';
  }
}

/** Intervalo de Wilson al 95 % de una proporción. */
export function wilson(exitos, n) {
  if (n === 0) return { p: 0, lo: 0, hi: 0 };
  exitos = Math.min(exitos, n); // por si un bloque registra más clics que vistas
  const z = 1.96;
  const p = exitos / n;
  const d = 1 + (z * z) / n;
  const c = p + (z * z) / (2 * n);
  const m = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return { p, lo: (c - m) / d, hi: (c + m) / d };
}

/** Suma los contadores de varios días: { 'evento|pos|var|tema': n } */
export function sumar(dias) {
  const total = {};
  for (const d of dias) for (const [k, n] of Object.entries(d.c ?? {})) total[k] = (total[k] ?? 0) + n;
  return total;
}

/** Agrupa por (posición, variante) o (posición, tema) y calcula vistas, clics y envíos. */
export function agrupar(total, por) {
  const filas = new Map();
  for (const [k, n] of Object.entries(total)) {
    const [e, p, v, t] = k.split('|');
    const clave = por === 'variante' ? `${p}|${v}` : `${p}|${t}`;
    const f = filas.get(clave) ?? { clave, vista: 0, clic: 0, envio: 0 };
    f[e] += n;
    filas.set(clave, f);
  }
  return [...filas.values()].sort((a, b) => a.clave.localeCompare(b.clave));
}

const pct = (x) => `${Math.max(0, x * 100).toFixed(1).replace('.', ',')} %`;
const celda = (exitos, n) => {
  if (n === 0) return 'sin vistas';
  const w = wilson(exitos, n);
  return `${exitos}/${n} = ${pct(w.p)} (${pct(w.lo)} a ${pct(w.hi)})`;
};

/** Veredicto de una posición: compara variantes por clic (medio) o por envío (final). */
export function veredicto(filas, metrica) {
  if (filas.length < 2) return 'una sola variante con datos: no hay comparación posible.';
  if (filas.some((f) => f.vista < MIN_VISTAS)) return `sin datos suficientes (hacen falta ${MIN_VISTAS} vistas por variante; la menor tiene ${Math.min(...filas.map((f) => f.vista))}). No se concluye nada.`;
  const w = filas.map((f) => ({ f, ...wilson(f[metrica], f.vista) })).sort((a, b) => b.p - a.p);
  if (w[0].lo > w[1].hi) return `ventaja clara de «${w[0].f.clave.split('|')[1]}» (su intervalo no solapa con el siguiente). Sigue siendo una semana: confirmar otra antes de fijarla.`;
  return 'diferencias dentro del margen de error: no hay ganadora.';
}

function informe(dias, desde, hasta) {
  const semana = semanaIso(new Date(`${hasta}T12:00:00Z`));
  const total = sumar(dias);
  const sinDatos = Object.keys(total).length === 0;
  const topeAlcanzado = dias.filter((d) => d.n >= 300).length;
  const L = [];
  L.push(`# Informe de conversión, semana ${semana.anio}-W${String(semana.semana).padStart(2, '0')}`);
  L.push('', `Periodo: ${desde} a ${hasta} (${DIAS} días). Fuente: contadores propios del sitio (sin cookies, sin terceros). Eventos totales contados: ${dias.reduce((s, d) => s + (d.n ?? 0), 0)}.`);
  if (sinDatos) {
    L.push('', 'No hay ningún evento medido en este periodo. Posibles causas: aún no hay tráfico, el despliegue con la medición no está en producción, o los visitantes tienen activado "No rastrear". No hay nada que comparar.');
    return L.join('\n') + '\n';
  }
  if (topeAlcanzado) L.push('', `Aviso: ${topeAlcanzado} día(s) llegaron al tope de 300 eventos diarios; los datos de esos días están recortados.`);

  const porVariante = agrupar(total, 'variante');
  for (const pos of ['medio', 'final', 'herramienta', 'otro']) {
    const filas = porVariante.filter((f) => f.clave.startsWith(`${pos}|`));
    if (!filas.length) continue;
    const titulo = { medio: 'Bloque central del artículo', final: 'Formulario al final del artículo', herramienta: 'Formulario al final de las herramientas', otro: 'Otros formularios (portada, boletín...)' }[pos];
    L.push('', `## ${titulo}`, '', '| Variante | Vistas | Clics (sobre vistas) | Envíos (sobre vistas) |', '|---|---|---|---|');
    for (const f of filas) L.push(`| ${f.clave.split('|')[1]} | ${f.vista} | ${celda(f.clic, f.vista)} | ${celda(f.envio, f.vista)} |`);
    if (pos === 'medio' || pos === 'final') L.push('', `Veredicto (${pos === 'medio' ? 'clics' : 'envíos'}): ${veredicto(filas, pos === 'medio' ? 'clic' : 'envio')}`);
  }

  const porTema = agrupar(total, 'tema').filter((f) => f.vista > 0);
  L.push('', '## Por tema (todas las variantes)', '', '| Posición | Tema | Vistas | Clics | Envíos |', '|---|---|---|---|---|');
  for (const f of porTema) L.push(`| ${f.clave.split('|')[0]} | ${f.clave.split('|')[1]} | ${f.vista} | ${f.clic} | ${f.envio} |`);

  L.push(
    '',
    '## Cómo leerlo',
    '',
    '- Las variantes rotan solas cada semana ISO (`variantePara` en `src/config/cta.mjs`), así que cada artículo pasa por todas y la comparación de una semana no depende de qué artículos tocaron.',
    '- Con poco tráfico los porcentajes bailan: mira el intervalo entre paréntesis, no solo la cifra. Si el intervalo es enorme, no hay conclusión.',
    '- Un envío es un alta en el formulario (no confirma que el correo exista ni que siga suscrito). No se guarda quién fue.',
    '- La medición se pierde con "No rastrear" / GPC activados y con bloqueadores; es una cifra de mínimos.',
  );
  return L.join('\n') + '\n';
}

async function leerKV() {
  const token = userEnv('CF_KV_READ_TOKEN');
  const cuenta = userEnv('CF_ACCOUNT_ID');
  if (!token || !cuenta) throw new Error('Faltan CF_KV_READ_TOKEN o CF_ACCOUNT_ID en las variables de entorno.');
  const ns = readFileSync(join(RAIZ, 'wrangler.jsonc'), 'utf8').match(/"id":\s*"([a-f0-9]{32})"/)?.[1];
  const base = `https://api.cloudflare.com/client/v4/accounts/${cuenta}/storage/kv/namespaces/${ns}`;
  const h = { Authorization: `Bearer ${token}` };
  const dias = {};
  let cursor = '';
  do {
    const r = await fetch(`${base}/keys?prefix=medicion:&limit=1000${cursor ? `&cursor=${cursor}` : ''}`, { headers: h });
    const j = await r.json();
    if (!j.success) throw new Error(`Cloudflare: ${(j.errors || []).map((e) => e.message).join(', ') || r.status}`);
    for (const k of j.result) {
      const v = await fetch(`${base}/values/${encodeURIComponent(k.name)}`, { headers: h });
      if (v.ok) dias[k.name.slice('medicion:'.length)] = await v.json();
    }
    cursor = j.result_info?.cursor ?? '';
  } while (cursor);
  return dias;
}

async function main() {
  const fichero = valor('fichero');
  const todos = fichero ? JSON.parse(readFileSync(fichero, 'utf8')) : await leerKV();
  const hoy = new Date();
  const fin = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate() - 1));
  const ini = new Date(fin.getTime() - (DIAS - 1) * 86400000);
  const f = (d) => d.toISOString().slice(0, 10);
  const dias = Object.entries(todos).filter(([d]) => d >= f(ini) && d <= f(fin)).map(([, v]) => v);
  const texto = informe(dias, f(ini), f(fin));
  console.log(texto);
  const salida = valor('salida');
  if (salida) {
    if (!existsSync(salida)) mkdirSync(salida, { recursive: true });
    const s = semanaIso(fin);
    writeFileSync(join(salida, `${s.anio}-W${String(s.semana).padStart(2, '0')}.md`), texto);
    writeFileSync(join(salida, 'ultimo.md'), texto);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((e) => {
    console.error(`Informe de conversión: ${e.message}`);
    process.exit(1);
  });
}
