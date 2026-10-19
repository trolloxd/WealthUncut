// Pruebas del enlazado automático entre artículos y glosario (src/lib/glosario-enlaces.ts).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { contarTermino, formaBuscada, normaliza, terminosEnTexto, textoPlano } from '../src/lib/glosario-enlaces.ts';

test('normaliza quita tildes y mayúsculas', () => {
  assert.equal(normaliza('Euríbor Ñandú'), 'euribor nandu');
});

test('la forma buscada ignora el paréntesis aclaratorio', () => {
  assert.equal(formaBuscada('Base del ahorro (IRPF)'), 'base del ahorro');
  assert.equal(formaBuscada('Fondo cubierto de divisa (hedged)'), 'fondo cubierto de divisa');
});

test('cuenta palabras completas, no trozos de otras palabras', () => {
  const t = normaliza('El TER del fondo. Un termino raro, otro TER, y matter o aterrizar no cuentan');
  assert.equal(contarTermino(t, 'TER'), 2);
  assert.equal(contarTermino(normaliza('el euríbor sube'), 'Euríbor'), 1);
  assert.equal(contarTermino(t, 'IA'), 0); // demasiado corto
});

test('textoPlano deja el texto visible de los enlaces y quita importaciones', () => {
  const md = "import x from './x';\n\nLee [el TER](/blog/ter/) y <strong>FIFO</strong>.";
  const p = textoPlano(md);
  assert.ok(p.includes('el TER') && p.includes('FIFO') && !p.includes('import') && !p.includes('/blog/ter/'));
});

test('terminosEnTexto ordena por menciones y respeta el máximo', () => {
  const terminos = [{ termino: 'FIFO' }, { termino: 'TER' }, { termino: 'ISIN' }, { termino: 'Euríbor' }];
  const r = terminosEnTexto('El TER y el TER otra vez; FIFO una vez. El euribor.', terminos, 2);
  assert.deepEqual(r.map((x) => x.termino), ['TER', 'FIFO']);
});
