// Euríbor a un año oficial: la resolución mensual del Banco de España publicada en el BOE ("por la que se
// publican determinados tipos de interés oficiales de referencia del mercado hipotecario").
//
// Solo usa los datos abiertos del BOE (https://www.boe.es/datosabiertos/): el sumario de cada día y el XML de
// cada disposición. No usa el BCE ni EMMI. Lo comparten scripts/datos-euribor.mjs (actualización mensual) y
// scripts/comprobar-frescura.mjs (comprobación diaria, sin IA).

const UA = { 'User-Agent': 'WealthUncut (datos abiertos del BOE; contacto@wealthuncut.com)' };
const TITULO = /Banco de España.*(tipos de interés oficiales de referencia del mercado hipotecario|índices de referencia oficiales)/i;
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

async function pedir(url, accept) {
  for (let intento = 1; intento <= 3; intento++) {
    try {
      const res = await fetch(url, { headers: { ...UA, Accept: accept }, signal: AbortSignal.timeout(30000) });
      if (res.status === 404) return null; // día sin BOE (domingos, festivos)
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      if (intento === 3) throw new Error(`${url}: ${e.message}`);
      await new Promise((r) => setTimeout(r, 1500 * intento));
    }
  }
}

/** Mes siguiente en formato AAAA-MM. */
export const mesSiguiente = (mes) => {
  const [a, m] = mes.split('-').map(Number);
  return m === 12 ? `${a + 1}-01` : `${a}-${String(m + 1).padStart(2, '0')}`;
};

/** Identificadores y títulos de las disposiciones del Banco de España en el sumario de un día (AAAAMMDD). */
async function disposicionesDelDia(fecha) {
  const txt = await pedir(`https://www.boe.es/datosabiertos/api/boe/sumario/${fecha}`, 'application/json');
  if (!txt) return [];
  let json;
  try {
    json = JSON.parse(txt);
  } catch {
    return [];
  }
  const out = [];
  const recorrer = (o) => {
    if (Array.isArray(o)) return o.forEach(recorrer);
    if (o && typeof o === 'object') {
      if (typeof o.identificador === 'string' && typeof o.titulo === 'string' && TITULO.test(o.titulo)) {
        out.push({ id: o.identificador, titulo: o.titulo });
      }
      Object.values(o).forEach(recorrer);
    }
  };
  recorrer(json);
  return out;
}

/** Lee el euríbor "Un año" y el mes al que corresponde del XML de una resolución. */
export async function leerResolucion(id) {
  const xml = await pedir(`https://www.boe.es/diario_boe/xml.php?id=${id}`, 'application/xml');
  if (!xml) throw new Error(`${id}: no existe`);
  const publicado = xml.match(/<fecha_publicacion>(\d{4})(\d{2})(\d{2})<\/fecha_publicacion>/);
  // El mes del dato es el primer "Mes de AAAA" (o "Mes AAAA") del texto, con o sin cursiva según el año.
  const texto = (xml.match(/<texto>([\s\S]*)<\/texto>/)?.[1] ?? '').replace(/<[^>]+>/g, ' ');
  const caption = texto.match(new RegExp(`(${MESES.join('|')})\\s+(?:de\\s+)?(\\d{4})`, 'i'));
  // Dos formatos del BOE: "6. Euríbor a un año." (hasta 2023) o "– Un año." dentro de "1. Euríbor. Plazos:".
  const VALOR = '([–−-]?\\s*\\d+,\\d+)';
  let fila = xml.match(new RegExp(`Euríbor a un año\\.?\\s*</td>\\s*<td[^>]*>\\s*${VALOR}\\s*<`));
  if (!fila) {
    const bloque = xml.match(/Euríbor\. Plazos:([\s\S]*?)(Permuta|<\/tbody>)/);
    fila = bloque && bloque[1].match(new RegExp(`Un año\\.?\\s*</td>\\s*<td[^>]*>\\s*${VALOR}\\s*<`));
  }
  // Algunas resoluciones del mismo tipo solo publican otro índice (p. ej. la deuda pública): se saltan.
  if (!/<texto>[\s\S]*Euríbor/.test(xml)) return null;
  if (!publicado || !caption || !fila) throw new Error(`${id}: formato no reconocido`);
  const iMes = MESES.indexOf(caption[1].toLowerCase());
  if (iMes < 0) throw new Error(`${id}: mes "${caption[1]}" no reconocido`);
  const valor = Number(fila[1].replace(/[–−]/, '-').replace(/\s/g, '').replace(',', '.'));
  if (!Number.isFinite(valor) || valor < -2 || valor > 10) throw new Error(`${id}: valor fuera de rango (${fila[1]})`);
  return {
    mes: `${caption[2]}-${String(iMes + 1).padStart(2, '0')}`,
    valor,
    boe: id,
    publicado: `${publicado[1]}-${publicado[2]}-${publicado[3]}`,
    url: `https://www.boe.es/diario_boe/txt.php?id=${id}`,
  };
}

/**
 * Busca en el BOE la resolución con el euríbor de `mes` (AAAA-MM). Sale en los primeros días hábiles del mes
 * siguiente: se miran los sumarios del día 1 al `hastaDia`. Devuelve null si todavía no se ha publicado.
 */
export async function buscarEuriborBOE(mes, { hastaDia = 12, hoy = new Date() } = {}) {
  const publicacion = mesSiguiente(mes);
  const [a, m] = publicacion.split('-');
  for (let d = 1; d <= hastaDia; d++) {
    const fecha = `${a}${m}${String(d).padStart(2, '0')}`;
    if (new Date(`${a}-${m}-${String(d).padStart(2, '0')}T00:00:00Z`) > hoy) break;
    for (const disp of await disposicionesDelDia(fecha)) {
      const dato = await leerResolucion(disp.id);
      if (dato && dato.mes === mes) return dato;
    }
  }
  return null;
}
