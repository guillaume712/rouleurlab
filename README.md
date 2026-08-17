# VéloJauge

Outils gratuits et sourcés pour cyclistes (compatibilité mécanique, pacing, nutrition course) + blog, sans compte obligatoire.

Contexte complet du projet (étude de marché, positionnement, architecture, plan de développement) : voir les documents Phase 1 à 7 fournis séparément.

## Démarrage

```bash
npm install
npm run dev       # serveur de développement
npm run build     # build de production (inclut la vérification de types)
npm test          # tests unitaires (Vitest)
```

## Stack

Astro (TypeScript strict) + îlots interactifs pour les calculateurs · Cloudflare Pages (hébergement) · Supabase (compte optionnel, V1) · Vitest.

## Structure

- `src/lib/calculs/` — logique de calcul pure, sans dépendance UI, testée unitairement. Chaque formule cite sa source.
- `src/lib/storage/` — persistance (localStorage par défaut, Supabase en option).
- `src/pages/outils/` — pages outils (mécanique, course).
- `src/content/blog/` — articles (Markdown/MDX).

## Conventions

Code en anglais, contenu utilisateur en français. Voir le plan de développement (Phase 7) pour le détail des étapes et des critères d'acceptation.
