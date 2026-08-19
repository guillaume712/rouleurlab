// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// Étape 0 — configuration minimale. Le site est majoritairement statique
// (cf. Phase 6 : Astro + îlots interactifs uniquement pour les calculateurs).
//
// Étape 9 — sitemap généré à /sitemap-index.xml, mais /profil et /mon-garage
// en sont exclus : ce sont des pages d'outillage personnel (profil local,
// garage), pas du contenu à indexer — cohérent avec le futur robots.txt
// restauré au lancement (voir public/robots.txt et BaseLayout.astro pour le
// blocage noindex temporaire tant que le site tourne sur le sous-domaine
// gratuit rouleurlab.pages.dev).
export default defineConfig({
  site: 'https://rouleurlab.fr',
  output: 'static',
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes('/profil') && !page.includes('/mon-garage'),
    }),
  ],
});