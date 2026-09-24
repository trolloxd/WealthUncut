# Procedimiento de actualización del comparador de fondos indexados

Este documento es la guía que sigue el agente automático que mantiene al día
`src/data/fondos-indexados/ultimo.json`, la fuente de datos del comparador en
`/herramientas/comparador-fondos-indexados/`. Si algo de aquí choca con `CLAUDE.md`, manda
`CLAUDE.md`.

El TER de un fondo cambia con mucha menos frecuencia que la TAE de una cuenta remunerada (a veces
pasan años sin que una gestora lo toque), así que esta actualización es mensual, no semanal. La
regla de oro es la misma que en `/mercados/` y en `CUENTAS-PROCEDIMIENTO.md`: **si un dato no se
puede verificar en al menos dos fuentes independientes, no se incluye o no se cambia**, y si esta
vez no se puede actualizar con garantías, se deja el fichero tal cual está.

## 1. Cuándo tocar el fichero

Investiga si ha cambiado algo respecto al fichero actual: TER que ha subido o bajado, un fondo que
ha dejado de estar disponible, uno nuevo relevante que se ha vuelto popular entre inversores en
España. Si no hay ningún cambio, no hace falta commitear nada: termina sin tocar el repositorio y
dilo en el resumen.

## 2. Qué fondos incluir

- Solo **fondos de inversión (FI)** de arquitectura abierta, indexados, disponibles para minoristas
  en España (registrados en la CNMV para su comercialización). **Nunca ETFs**: un ETF es
  legalmente una acción a efectos fiscales en España y NO permite traspasos entre fondos sin
  tributar, a diferencia de un fondo de inversión. No mezclar los dos aunque una gestora ofrezca
  ambos formatos del mismo índice.
- Prioriza los índices más buscados por el lector objetivo (jóvenes que empiezan a invertir): MSCI
  World, S&P 500, mercados emergentes, y como mucho algún fondo de renta fija indexada si se vuelve
  relevante.
- 5-8 fondos es suficiente: mejor pocos bien verificados que una lista larga con datos dudosos.
- Indica siempre el ISIN exacto (hay gestoras con varias clases del mismo fondo con ISIN distinto:
  Investor, Institutional, con cobertura de divisa o sin ella; asegúrate de coger la clase pensada
  para minoristas, no la institucional, salvo que una plataforma dé acceso especial a esa clase más
  barata para minoristas, en cuyo caso indícalo en `minimoNota`).

## 3. Verificación

- Cada TER e ISIN se comprueba en **al menos dos fuentes independientes**: la ficha oficial de la
  gestora (Vanguard, Fidelity, Amundi, iShares/BlackRock), o comparadores reconocidos (Rankia,
  Morningstar, Quefondos, Finect, El Economista, HelpMyCash). Si dos fuentes no coinciden en el
  TER, busca una tercera fuente de desempate; si sigue sin quedar claro, dilo explícitamente en el
  campo `nota` en vez de inventar una cifra.
- Comprueba que el ISIN corresponde exactamente al nombre y la clase del fondo que describes: dos
  ISIN parecidos pueden ser clases distintas del mismo fondo con TER distinto (ver nota del punto
  2).
- Para "en qué plataformas está", no hace falta comprobar los ISIN uno a uno en cada plataforma:
  basta con una fuente reciente (menos de 6 meses) que describa la oferta general de esa
  plataforma. Si no hay certeza, usa una frase general ("disponible en la mayoría de plataformas de
  fondos") en vez de afirmar una plataforma concreta sin haberlo comprobado.

## 4. Formato del fichero

`src/data/fondos-indexados/ultimo.json`:

```json
{
  "fecha": "AAAA-MM-DD",
  "generado": "AAAA-MM-DDTHH:MM:SS.000Z",
  "nota": "Cómo se ha verificado esta actualización.",
  "fondos": [
    {
      "gestora": "Nombre de la gestora",
      "nombre": "Nombre exacto y completo del fondo, con la clase",
      "isin": "IE00...",
      "indice": "Índice que replica",
      "ter": 0.10,
      "minimoNota": "Texto: 'Sin mínimo relevante...' o el mínimo real si es alto",
      "traspasable": true,
      "plataformas": "Texto libre sobre dónde suele estar disponible"
    }
  ]
}
```

`ter` es un número en tanto por ciento (0.10, no 0.001). `traspasable` es casi siempre `true`
porque solo se incluyen fondos (nunca ETFs); si algún día se plantea incluir un producto que no lo
sea, ponlo en `false` y explícalo bien en el texto del artículo.

## 5. Después de actualizar el fichero

1. Ejecuta `npm run build` y comprueba que termina sin errores y que existe
   `dist/client/herramientas/comparador-fondos-indexados/index.html`.
2. Si compila bien: `git add src/data/fondos-indexados/ultimo.json`, commit con el mensaje
   `Fondos indexados: actualización del AAAA-MM-DD`, `git pull --rebase origin main`,
   `git push origin main`. No toques ningún otro archivo del repositorio.
3. Si el build falla, no publiques: deja el fichero como estaba (`git checkout --
   src/data/fondos-indexados/ultimo.json`) y explica el problema en el resumen.
4. Termina con un resumen breve: qué ha cambiado (o que no había cambios), cuántos fondos se han
   verificado y en qué fuentes, y cualquier dato que se haya descartado por no poder verificarlo.
