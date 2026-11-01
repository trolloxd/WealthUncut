import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import { GUIA_DE_HERRAMIENTA } from '../src/config/guias-herramienta.ts';

test('cada herramienta y cada guía del mapa existen', () => {
  for (const [herramienta, guia] of Object.entries(GUIA_DE_HERRAMIENTA)) {
    assert.ok(fs.existsSync(`src/pages/herramientas/${herramienta}.astro`), `falta la herramienta ${herramienta}`);
    assert.ok(fs.existsSync(`src/content/blog/${guia}.mdx`), `falta la guía ${guia}`);
  }
});

test('cada guía enlaza a su herramienta dentro del texto (enlace en los dos sentidos)', () => {
  for (const [herramienta, guia] of Object.entries(GUIA_DE_HERRAMIENTA)) {
    const texto = fs.readFileSync(`src/content/blog/${guia}.mdx`, 'utf8');
    assert.ok(texto.includes(`/herramientas/${herramienta}/`), `${guia} no enlaza a /herramientas/${herramienta}/`);
  }
});
