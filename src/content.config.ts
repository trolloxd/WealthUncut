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

export const collections = { blog, mercados };
