# Procedimiento de actualización del catálogo de `/carteras/`

Guía del agente automático que mantiene al día `src/data/myinvestor-fondos/ultimo.json`, la lista
de fondos del buscador de carteras (`/carteras/`). Si algo choca con `CLAUDE.md`, manda
`CLAUDE.md`. Se ejecuta una vez al mes.

## Fuente

La única fuente es la propia web de MyInvestor, que es la autoridad sobre qué fondos comercializa
y qué rentabilidad publica de cada uno: <https://myinvestor.es/inversion/fondos-inversion/>
(secciones "Más vendidos" y "Fondos indexados exclusivos MyInvestor"). Lee la página con
`curl -sL -A 'Mozilla/5.0'` y extrae el texto; no inventes nada que no aparezca en ella.

## Qué hacer

1. Lee `src/data/myinvestor-fondos/ultimo.json` (formato abajo).
2. Para **cada fondo que ya está en el fichero y sigue apareciendo en la página**, actualiza
   `rentabilidadesAnuales` y `ter` con lo que publica ahora MyInvestor. Si un fondo ya no aparece en
   la página, **no lo borres** (puede seguir comercializándose; solo no está destacado): déjalo como
   está.
3. Si en "Más vendidos" o en los indexados propios aparece un **fondo indexado nuevo** (nombre, ISIN,
   TER y al menos un año de rentabilidad visibles), añádelo. Solo fondos de inversión indexados, nunca
   ETF ni fondos de gestión activa. No añadas dos clases del mismo fondo (mismo índice, TER y
   rentabilidades prácticamente idénticos): conserva la que ya estuviera.
4. Si a MyInvestor le falta la cifra exacta de TER de un fondo propio, deja el máximo publicado (0,59)
   y la `terNota` que ya hay. Nunca estimes un TER.
5. **Cambio de año**: el primer valor de `rentabilidadesAnuales` de cada fondo es siempre el año en
   curso (parcial); el componente excluye ese primer valor al calcular la media histórica. Si MyInvestor
   ya muestra un año nuevo, ponlo el primero y conserva el resto en orden descendente.
6. `fecha` y `generado` con la fecha de hoy. Si nada ha cambiado, no hagas commit.

## Formato

```json
{
  "fecha": "AAAA-MM-DD",
  "generado": "AAAA-MM-DDTHH:MM:SS.000Z",
  "fuente": "...",
  "nota": "...",
  "fondos": [
    {
      "gestora": "...", "nombre": "...", "isin": "...", "indice": "...",
      "ter": 0.10, "terNota": "(opcional)", "perfilRiesgo": 4,
      "rentabilidadesAnuales": { "2026": 16.3, "2025": 6.7 }
    }
  ]
}
```

Rentabilidades en tanto por ciento tal como las publica MyInvestor, de más reciente a más antigua.

## Después

`npm run build` sin errores y que exista `dist/client/carteras/index.html`. Si compila:
`git add src/data/myinvestor-fondos/ultimo.json`, commit `Carteras: actualización del AAAA-MM-DD`,
`git pull --rebase origin main`, `git push origin HEAD:main`. No toques ningún otro archivo. Si el build
falla, no publiques. Termina con un resumen breve: qué ha cambiado y qué has descartado por no poder
verificarlo.
