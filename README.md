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

## Publicar o programar un artículo

1. En el `.mdx`, pon `draft: false` y en `pubDate` (y `updatedDate`) la fecha de publicación.
2. Si la fecha es hoy o anterior, haz push y se publica en el siguiente despliegue.
3. Si la fecha es futura, haz push igualmente: el artículo queda oculto y el workflow
   `publicacion-programada.yml` lo publica ese día (solo martes, viernes o domingo; para otro día,
   lánzalo a mano desde la pestaña Actions de GitHub).
4. Los enlaces de otros artículos hacia él se activan solos al publicarse.

## Stack

Astro + MDX, islas de React para las calculadoras, Tailwind CSS v4, desplegado en Cloudflare
Workers (static assets + KV para el buzón de sugerencias).
