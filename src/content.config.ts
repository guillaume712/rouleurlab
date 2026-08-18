// Configuration des collections de contenu (Astro Content Layer API).
// Une seule collection pour l'instant : les articles de blog (Markdown).
// Chaque article peut référencer l'outil auquel il est lié, pour permettre
// le lien croisé outil <-> article exigé dès l'Étape 2 du plan de développement.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    datePublication: z.coerce.date(),
    // Chemin de l'outil principal auquel l'article est lié (ex. "/outils/mecanique/couple-de-serrage").
    outilLie: z.string().optional(),
  }),
});

export const collections = { blog };
