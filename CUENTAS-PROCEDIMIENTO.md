# Procedimiento de actualización del comparador de cuentas remuneradas y depósitos

Este documento es la guía que sigue el agente automático que mantiene al día
`src/data/cuentas-remuneradas/ultimo.json`, la fuente de datos del comparador en
`/herramientas/comparador-cuentas-remuneradas/`. Si algo de aquí choca con `CLAUDE.md`, manda
`CLAUDE.md`.

A diferencia de las cifras fiscales de `src/config/finance.ts` (que tienen una fuente oficial
única: AEAT, BOE), las TAE de cuentas y depósitos son ofertas comerciales que no publica ningún
organismo oficial centralizado. Por eso la regla de oro es la misma que en `/mercados/`: **si una
cifra no se puede verificar en al menos dos comparadores financieros independientes (o en la
página oficial del banco), no se incluye**, y si esta vez no se puede actualizar con garantías, se
deja el fichero tal cual está (con su fecha antigua) en vez de arriesgar un dato inventado o
desactualizado.

## 1. Cuándo tocar el fichero

Actualizar `src/data/cuentas-remuneradas/ultimo.json` solo si hay cambios reales que verificar:
TAE que han subido o bajado, ofertas que han caducado, ofertas nuevas relevantes. Si tras
investigar no hay ningún cambio respecto al fichero actual, no hace falta commitear nada: termina
sin tocar el repositorio y dilo en el resumen.

## 2. Qué cuentas y depósitos incluir

- **Cuentas remuneradas sin vinculación** (sin domiciliar nómina ni otros requisitos fuertes): son
  las más relevantes para el lector objetivo del sitio (jóvenes). Prioriza 8-12 cuentas de bancos
  con presencia real en España (incluidos neobancos y bancos accesibles vía plataformas como
  Raisin).
- Como mucho 2-3 **cuentas con vinculación** (nómina domiciliada u otro requisito fuerte) para que
  el lector vea la diferencia de TAE que ofrece atarse a un banco, dejando claro en el campo
  `requisitos` cuál es esa condición.
- **Depósitos a plazo fijo**: prioriza los de bancos con cobertura del FGD español, y añade como
  mucho 3-4 de bancos extranjeros accesibles vía Raisin u otras plataformas similares si su TAE es
  claramente más alta, marcando siempre `cobertura` como del país de origen del banco, no España.
- No incluyas ofertas que caduquen en menos de 2 semanas desde la fecha de la actualización: para
  cuando alguien lea el artículo, puede que ya no existan.

## 3. Verificación

- Cada TAE, importe máximo/mínimo y duración de la oferta se comprueba en **al menos dos fuentes
  independientes**: comparadores financieros reconocidos (Rankia, Kelisto, El Economista, Finect,
  HelpMyCash, Raisin) o, mejor aún, la página oficial del banco. Si dos fuentes no coinciden en una
  cifra, busca una tercera fuente de desempate o excluye esa entidad de la actualización.
- Comprueba también la fecha de publicación o de última actualización de cada fuente: si un
  artículo tiene más de 2-3 meses, puede estar desactualizado; prioriza fuentes fechadas en el mes
  en curso.
- No copies literalmente el texto de ningún comparador: reescribe los datos en la estructura del
  JSON y, si el artículo tiene texto explicativo, redáctalo con tus propias palabras.

## 4. Formato del fichero

`src/data/cuentas-remuneradas/ultimo.json`:

```json
{
  "fecha": "AAAA-MM-DD",
  "generado": "AAAA-MM-DDTHH:MM:SS.000Z",
  "nota": "Breve nota sobre cómo se ha verificado esta actualización.",
  "cuentas": [
    {
      "banco": "Nombre del banco",
      "producto": "Nombre de la cuenta",
      "tae": 3.51,
      "importeMaximo": 25000,
      "duracion": "Texto: '4 meses desde el alta', 'Indefinida', 'Hasta 30/06/2027', etc.",
      "requisitos": "Texto: 'Nuevo cliente', 'Ninguno', 'Domiciliar la nómina', etc.",
      "vinculacion": false
    }
  ],
  "depositos": [
    {
      "banco": "Nombre del banco",
      "producto": "Nombre del depósito",
      "plazoMeses": 12,
      "tae": 3.10,
      "importeMinimo": 10000,
      "importeMaximo": 100000,
      "requisitos": "Texto o 'Ninguno'.",
      "cobertura": "'FGD España' o 'Fondo de garantía del país de origen del banco (no el FGD español)'"
    }
  ]
}
```

`importeMaximo`/`importeMinimo` van en `null` si la fuente no da una cifra concreta. Los importes
son números sin formatear (el componente los formatea). Las TAE son números en tanto por ciento
(3.51, no 0.0351).

## 5. Después de actualizar el fichero

1. Ejecuta `npm run build` y comprueba que termina sin errores y que existe
   `dist/client/herramientas/comparador-cuentas-remuneradas/index.html`.
2. Si compila bien: `git add src/data/cuentas-remuneradas/ultimo.json`, commit con el mensaje
   `Cuentas y depósitos: actualización del AAAA-MM-DD`, `git pull --rebase origin main`,
   `git push origin main`. No toques ningún otro archivo del repositorio.
3. Si el build falla, no publiques: deja el fichero como estaba antes (`git checkout --
   src/data/cuentas-remuneradas/ultimo.json`) y explica el problema en el resumen.
4. Termina con un resumen breve: qué ha cambiado (o que no había cambios), cuántas entidades se han
   verificado y en qué fuentes, y cualquier oferta que se haya descartado por no poder verificarla.
