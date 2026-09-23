# WealthUncut

Sitio de finanzas prácticas para jóvenes en España: artículos y calculadoras sobre fondos
indexados, impuestos de la inversión y primeros pasos. En producción en
[wealthuncut.com](https://wealthuncut.com).

El contexto completo del proyecto (estrategia, reglas de contenido y cumplimiento, estructura)
está en [`CLAUDE.md`](CLAUDE.md). El mapa de keywords, en [`KEYWORDS.md`](KEYWORDS.md).

## Comandos

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias |
| `npm run dev` | Servidor local en `localhost:4321` |
| `npm run build` | Genera el sitio en `./dist/` |
| `npm run check` | Comprobación de tipos |
| `npm run preview` | Sirve el build con el runtime de Cloudflare |

## Publicar un borrador

1. En el `.mdx` del artículo, cambia `draft: true` por `draft: false` (y actualiza `updatedDate`
   si has cambiado el contenido).
2. `npm run build` para comprobar que compila.
3. Commit y push a `main`: Cloudflare despliega solo. Los enlaces de otros artículos hacia el que
   acabas de publicar se activan automáticamente.

## Stack

Astro + MDX, islas de React para las calculadoras, Tailwind CSS v4, desplegado en Cloudflare
Workers (static assets + KV para el buzón de sugerencias).
