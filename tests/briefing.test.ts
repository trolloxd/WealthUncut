// Pruebas de las utilidades de /hoy/ (src/lib/briefing.ts), que procesan texto escrito por una rutina automática.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { diaDelAnio, elementosDeSeccion, inlineAHtml, minutosDeLectura, parrafoDeSeccion } from '../src/lib/briefing.ts';

test('inlineAHtml escapa HTML y comillas, y convierte negrita, cursiva y enlaces seguros', () => {
  assert.equal(inlineAHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
  assert.equal(inlineAHtml('**hola** y *adiós*'), '<strong>hola</strong> y <em>adiós</em>');
  assert.equal(inlineAHtml('[BCE](https://www.ecb.europa.eu/)'), '<a href="https://www.ecb.europa.eu/">BCE</a>');
  assert.equal(inlineAHtml('[interno](/blog/)'), '<a href="/blog/">interno</a>');
  // un enlace javascript: no se convierte en enlace
  assert.ok(!inlineAHtml('[x](javascript:alert(1))').includes('<a '));
  // una comilla dentro de la URL no puede cerrar el atributo href
  const raro = inlineAHtml('[x](https://a.com/"onmouseover="alert(1))');
  const etiqueta = raro.match(/<a [^>]*>/)?.[0] ?? '';
  assert.equal((etiqueta.match(/"/g) ?? []).length, 2, raro); // solo las comillas del propio href
});

test('elementosDeSeccion y parrafoDeSeccion leen la sección por su título', () => {
  const md = ['## Qué vigilar', '- Euríbor', '- Inflación', '  que sube', '', '## Otra', '- no', '', '## Resumen', '', 'Primer párrafo', 'sigue aquí.', '', 'Segundo.'].join('\n');
  assert.deepEqual(elementosDeSeccion(md, /vigilar/i), ['Euríbor', 'Inflación que sube']);
  assert.deepEqual(elementosDeSeccion(md, /no existe/i), []);
  assert.equal(parrafoDeSeccion(md, /resumen/i), 'Primer párrafo sigue aquí.');
  assert.equal(parrafoDeSeccion(md, /vigilar/i), null); // es una lista, no un párrafo
});

test('minutos de lectura y día del año', () => {
  assert.equal(minutosDeLectura('palabra '.repeat(10)), 1);
  assert.equal(minutosDeLectura('palabra '.repeat(1000)), 5);
  assert.equal(diaDelAnio(new Date('2026-01-01T12:00:00Z')), 1);
  assert.equal(diaDelAnio(new Date('2026-12-31T12:00:00Z')), 365);
});
