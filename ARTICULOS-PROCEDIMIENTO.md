# Procedimiento de reposición de artículos programados

Guía que sigue el agente automático que mantiene la cola de artículos de `/blog/`. Si algo de aquí
choca con `CLAUDE.md`, manda `CLAUDE.md`.

Decisión de David (2026-10-04): cuando quede **un solo artículo programado o ninguno**, escribir
unos cuantos más y dejarlos programados para que se publiquen solos. La rutina se ejecuta varias
veces por semana, pero casi siempre termina sin hacer nada.

## 1. Cuándo actuar

1. Calcula la fecha de hoy en Europe/Madrid (`TZ=Europe/Madrid date +%F`).
2. Cuenta los archivos de `src/content/blog/` con `draft: false` y `pubDate` **posterior a hoy**
   (son los programados; uno con `pubDate` de hoy ya cuenta como publicado).
3. Si hay **2 o más**, termina sin tocar nada y dilo en el resumen.
4. Si hay 0 o 1, escribe un lote de **4 artículos**.

## 2. Calendario

- Los artículos se publican **martes, viernes y domingo** (el workflow
  `.github/workflows/publicacion-programada.yml` reconstruye el sitio esos días). Ritmo máximo del
  proyecto: 3-4 piezas por semana, nunca más.
- La primera fecha del lote es el primer martes, viernes o domingo posterior a la `pubDate` del
  último artículo ya programado (o posterior a hoy si no hay ninguno). Las siguientes, la
  siguiente fecha de esos tres días. Nunca dos artículos en la misma fecha.
- `pubDate` y `updatedDate` iguales a la fecha de publicación, `draft: false`.

## 3. Qué escribir

- Elige temas de `KEYWORDS.md` que **no tengan artículo todavía** (tabla "Qué artículo cubre cada
  keyword" y "Huecos sin artículo"). Prioridad: las herramientas que aún no tienen pieza de blog
  que las desarrolle (simulador de hipoteca y euríbor, plan de pensiones vs fondo indexado,
  sueldo neto y retención de IRPF, ahorro para la entrada de un piso, ITP por comunidad, ranking
  de IRPF por comunidad), después fiscalidad (dividendos, declarar ganancias de bolsa) y educación
  financiera (cuánto ahorrar cada mes según el sueldo).
- Salvo que `CLAUDE.md` diga lo contrario, no escribir sobre cuentas bancarias por producto ni
  brokers concretos: son los clústeres con intención comercial y esperan a tener afiliación.
- **Cada artículo aporta algo que otros no tienen**: un cálculo propio con las cifras de
  `finance.ts`, una herramienta del sitio enlazada y explicada, una comparación con números, una
  opinión razonada. Si un tema solo se puede rellenar con generalidades, elige otro.
- Mejor 3 buenos que 4 flojos: si no hay 4 temas con valor real, escribe solo los que lo tengan.
- Nunca recomendaciones personalizadas ni "qué debes comprar". Información y educación.

## 4. Formato

Copia la estructura de un artículo existente (por ejemplo `primeros-pasos-para-invertir-en-espana.mdx`):

```mdx
---
title: "..."            # máx. ~70 caracteres, con la keyword principal
description: "..."      # 140-160 caracteres
pubDate: AAAA-MM-DD
updatedDate: AAAA-MM-DD
author: "David Pérez Mitjà"
tags: ["...", "..."]
sources:                # mínimo 2, enlaces reales a fuentes oficiales; compruébalos
  - label: "Organismo: título"
    url: "https://..."
hasAffiliateLinks: false
draft: false
---
```

- **Etiquetas (`tags`)**: usa solo este vocabulario, porque de ellas salen solos los enlaces
  internos (bloque "Pruébalo con tus números" con herramientas afines y "Sigue leyendo" con
  artículos afines): `fondos indexados`, `impuestos`, `educación financiera`, `etf`, `brokers`,
  `interés compuesto`, `calculadoras`, `ahorro`, `vivienda`, `hipoteca`, `pensiones`, `nómina`,
  `cuentas`. Entre 2 y 3 por artículo, y que al menos una coincida con la herramienta que enlazas.
- En el cuerpo, enlaza (en Markdown, con la ruta completa) a la herramienta principal y a 2-4
  artículos ya existentes.
- 1.400-2.000 palabras, español de España, frases cortas, sin jerga (o explicada en la misma frase).
- Respuesta directa a la pregunta del título en las primeras líneas, tabla o ejemplo calculado en el
  cuerpo, enlaces internos a 2-4 artículos o herramientas relacionados (solo a los que ya existan
  en `src/content/blog/` o `src/config/tools.ts`), y al final una sección breve de preguntas
  frecuentes si encaja.
- Si hay herramienta propia relacionada, enlázala en el cuerpo (`/herramientas/<slug>/`). Si el
  artículo necesita una calculadora incrustada, reutiliza una isla de `src/components/` ya
  existente; no crees componentes nuevos.
- **Nunca guiones largos (—)** en el texto. Usa coma, punto, dos puntos o paréntesis.
- Cifras en formato español: 1.234,5; 2,5%; 10.000 €.

## 5. Verificación (innegociable)

- **Toda cifra fiscal, tramo, tipo o límite viene de `src/config/finance.ts`**, importada en el MDX
  como hacen los artículos existentes (`import { ... } from '../../config/finance'`) o mostrada
  con `TramosAhorroTabla`. Si necesitas un dato fiscal que no está ahí, **no lo escribas**: busca
  otro enfoque para el artículo o descártalo.
- Todo dato externo (inflación, euríbor, precios de vivienda, etc.) se comprueba en la fuente
  oficial (INE, BCE, Banco de España, AEAT, BOE, CNMV, Eurostat) y se cita en `sources`. Si no se
  puede comprobar, no se escribe. Si una cifra cambia con el tiempo, redáctala con su fecha
  ("según el INE, en agosto de 2026").
- Ejemplos numéricos: calcúlalos de verdad (con script o con la misma lógica de las calculadoras),
  no los estimes a ojo. Reutiliza los supuestos ya usados en el sitio (150 €/mes, 7% bruto, TER 0,2%)
  salvo que el tema pida otros, y dilos explícitamente.
- Ninguna predicción presentada como hecho, ningún consejo de compra o venta.
- Relee cada artículo como un revisor externo: cada número contra su fuente, subidas frente a
  bajadas, nombres, fechas, y busca y elimina guiones largos.

## 6. Después de escribir

1. Añade a `KEYWORDS.md` (tabla "Qué artículo cubre cada keyword") una fila por artículo con estado
   "Programado".
2. `npm run build` sin errores. Comprueba que los artículos con fecha futura **no** aparecen aún en
   `dist/client/blog/` y que ningún enlace interno apunta a una ruta que no existe (los enlaces a
   artículos programados los gestiona `ArticleLink`; en Markdown plano, enlaza solo a artículos ya
   existentes en el repositorio).
3. Si compila: `git add` solo los archivos nuevos de `src/content/blog/` y `KEYWORDS.md`; commit
   `Artículos programados: <fecha primera> a <fecha última>`; `git pull --rebase origin main`;
   `git push origin main`. No toques ningún otro archivo.
4. Si el build falla y no puedes arreglarlo, no hagas commit.
5. Termina con un resumen breve: cuántos programados había, qué artículos has escrito, con qué
   fechas, y qué datos descartaste por no poder verificarlos.
