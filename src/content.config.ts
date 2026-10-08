import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('David Pérez Mitjà'),
    tags: z.array(z.string()).default([]),
    // Tema del blog (ver src/config/categorias.ts). Si falta, se deduce de las etiquetas.
    categoria: z.string().optional(),
    sources: z
      .array(
        z.object({
          label: z.string(),
          url: z.url(),
        })
      )
      .default([]),
    hasAffiliateLinks: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

// Artículos diarios de /mercados/. Se escriben automáticamente cada mañana (ver
// MERCADOS-PROCEDIMIENTO.md); el nombre del archivo es la fecha: AAAA-MM-DD.mdx.
const mercados = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/mercados' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('David Pérez Mitjà'),
    tags: z.array(z.string()).default([]),
    sources: z
      .array(
        z.object({
          label: z.string(),
          url: z.url(),
        })
      )
      .min(3),
    draft: z.boolean().default(false),
  }),
});

// Boletín semanal "5 minutos de finanzas": recopila lo publicado esa semana (mercados, artículo y
// herramienta destacados). Nunca contiene datos o afirmaciones nuevas, solo enlaza y resume lo que
// ya está publicado y verificado en otra parte del sitio. Archivo: AAAA-MM-DD.mdx (fecha de envío).
const newsletter = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/newsletter' }),
  schema: z.object({
    numero: z.number(),
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

// Registro público de correcciones: qué se ha corregido y cuándo, en cualquier artículo o
// herramienta ya publicado. Ver /correcciones/ y "Correcciones y actualizaciones" en metodologia.astro.
const correcciones = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/correcciones' }),
  schema: z.object({
    fecha: z.coerce.date(),
    pieza: z.string(), // título del artículo o herramienta corregido
    url: z.string(), // ruta a esa pieza, p. ej. /blog/slug/ o /herramientas/slug/
    resumen: z.string(), // qué se corrigió, en una frase
  }),
});

// Glosario de finanzas: una entrada por término (src/content/glosario/<slug>.md). Definiciones
// cortas y sin cifras que cambian con el tiempo; las herramientas y guías relacionadas se enlazan en
// "relacionados". Procedimiento para ampliarlo en ARTICULOS-PROCEDIMIENTO.md.
const glosario = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/glosario' }),
  schema: z.object({
    termino: z.string(), // cómo aparece en el índice, p. ej. "TER"
    titulo: z.string(), // H1 y title de la página, p. ej. "Qué es el TER de un fondo"
    description: z.string().max(170), // definición en una frase (meta description)
    relacionados: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
  }),
});

export const collections = { blog, mercados, newsletter, correcciones, glosario };
