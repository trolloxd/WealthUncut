# Procedimiento del boletín semanal "5 minutos de finanzas"

Este documento es la guía que sigue el agente automático que escribe cada número de
`/newsletter/`. Si algo de aquí choca con `CLAUDE.md`, manda `CLAUDE.md`.

Regla de oro, la misma que en `/mercados/` y en los comparadores: **el boletín nunca contiene
datos ni afirmaciones nuevas**. Es una recopilación de lo que ya está publicado y verificado en
otra parte del sitio esa semana: mercados, un artículo y una herramienta. Si no hay nada nuevo que
merezca la pena esa semana, no se publica número: un boletín de relleno es peor que no enviarlo.

## 1. Cuándo escribir un número

Un domingo por la tarde, comprueba qué se ha publicado desde el último número (o desde el
lanzamiento del sitio, si es el primero):

- Ediciones de `/mercados/` de la semana (lunes a domingo).
- Artículos de `/blog/` publicados esa semana (`pubDate` dentro de la semana, `draft: false`).
- Herramientas nuevas en `/herramientas/` esa semana, si las hay.

Si no hay ninguna edición de mercados nueva, ni artículo nuevo, ni herramienta nueva desde el
último número, **no publiques nada esa semana** y termina explicándolo en el resumen.

## 2. Qué destacar

- **Mercados**: no repitas cada edición de la semana. Elige el hecho o el hilo más relevante (o
  el resumen del sábado/domingo si lo hay) y enlázalo, con una frase de por qué importa.
- **Herramienta de la semana**: si hay una herramienta nueva esa semana, es la elegida casi
  siempre. Si no hay ninguna nueva, elige una ya existente que conecte con lo que ha pasado en
  mercados esa semana (por ejemplo, el simulador de hipoteca si el euríbor se ha movido).
- **Artículo de la semana**: el artículo nuevo más relevante de la semana. Si no hay ninguno
  nuevo, se puede omitir esta sección esa semana en vez de repetir uno antiguo.
- Nunca escribas una cifra, un dato o una afirmación que no esté ya en la pieza enlazada. El
  boletín resume y engancha, no informa por sí mismo.

## 3. Estilo

- Mismas reglas que el resto del sitio: español de España, sin guiones largos, cifras en formato
  español si las hay (aunque lo normal es que el boletín casi no lleve cifras propias).
- Corto: 300-500 palabras. Es un boletín de "5 minutos", no un artículo.
- Cada sección enlaza a la pieza completa en el sitio; el boletín no sustituye la lectura, la
  resume para decidir si merece la pena.

## 4. Formato del archivo

`src/content/newsletter/AAAA-MM-DD.mdx` (fecha de envío, normalmente domingo):

```mdx
---
numero: N
title: "5 minutos de finanzas #N: <lo más llamativo de la semana>"
description: "Resumen en una frase de 140-160 caracteres."
pubDate: AAAA-MM-DD
---

Entradilla breve.

## Esta semana en mercados
...

## Herramienta de la semana: <nombre>
...

## Artículo de la semana: <título>
...
```

`numero` incrementa uno respecto al último número publicado (consulta
`src/content/newsletter/` para saber cuál es el último).

## 5. Después de escribir el número

1. Ejecuta `npm run build` y comprueba que termina sin errores y que existe
   `dist/client/newsletter/<fecha>/index.html`.
2. Si compila bien: `git add src/content/newsletter/<fecha>.mdx`, commit con el mensaje
   `Newsletter: número N del AAAA-MM-DD`, `git pull --rebase origin main`, `git push origin main`.
   No toques ningún otro archivo del repositorio.
3. Si el build falla, no publiques: arréglalo si puedes; si no, no hagas commit y explica el
   problema en el resumen.
4. Termina con un resumen breve: número publicado (o por qué no se ha publicado ninguno esa
   semana), qué se destacó de mercados, herramienta y artículo.

## 6. Envío real por email

De momento este procedimiento solo genera la página pública del número; no envía ningún email.
El sitio ya tiene un formulario de suscripción (`/api/newsletter`) que guarda los emails en el KV
de Cloudflare a la espera de que se active un proveedor de email marketing (ver `privacidad.astro`
y la nota en `CLAUDE.md`, sección "Newsletter"). Cuando David active ese proveedor, este paso 6
se actualizará con cómo enviar el número (probablemente reenviando el contenido de este mismo
archivo mediante la API de ese proveedor) y con quién tiene acceso a la lista de suscriptores.
