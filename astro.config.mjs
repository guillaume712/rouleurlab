// @ts-check
import { defineConfig } from 'astro/config';

// Étape 0 — configuration minimale. Le site est majoritairement statique
// (cf. Phase 6 : Astro + îlots interactifs uniquement pour les calculateurs).
export default defineConfig({
  site: 'https://velojauge.fr',
  output: 'static',
});
