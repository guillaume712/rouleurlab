// Base de spécifications des dérailleurs arrière.
// Fichier séparé du composant et du calcul, exprès (Phase 7, Étape 5) :
// c'est la base la plus dense à maintenir dans le temps (nouveaux modèles
// chaque année), donc elle doit rester facile à éditer sans toucher au code
// de calcul. Ajouter un modèle = ajouter une entrée ici.
//
// Volontairement NON exhaustive : un point de départ vérifié plutôt qu'une
// tentative de tout couvrir (qui serait obsolète en quelques mois). Chaque
// entrée cite sa source et sa date de vérification.
//
// Deux façons dont "capacite_totale_dents" a été obtenue :
//   - "fabricant" : chiffre publié tel quel par le fabricant (fiche produit officielle).
//   - "calculee"  : pas de chiffre publié trouvé pour ce modèle précis ; calculée
//     avec la formule officielle SRAM (source ci-dessous), valable pour toute
//     transmission : capacité = (grand plateau - petit plateau) + (grand pignon - petit pignon).
//     Sur les transmissions mono-plateau (1x), le premier terme est nul.

export type MarqueDerailleur = 'Shimano' | 'SRAM';
export type CategorieDerailleur = 'route' | 'gravel' | 'vtt';
export type TransmissionDerailleur = '1x' | '2x';
export type OrigineCapacite = 'fabricant' | 'calculee';

export interface SpecDerailleur {
  id: string;
  nom: string;
  marque: MarqueDerailleur;
  categorie: CategorieDerailleur;
  vitesses: number;
  transmission: TransmissionDerailleur;
  /** Plus grand pignon supporté, en dents — dépasser cette valeur peut casser le dérailleur ou le cadre. */
  cog_max_dents: number;
  /** Capacité totale de la chape, en dents. */
  capacite_totale_dents: number;
  origine_capacite: OrigineCapacite;
  source_url: string;
  consultee_le: string;
}

export const SOURCE_FORMULE_CAPACITE = {
  nom: 'SRAM — définition officielle de la capacité totale ("What is the total drivetrain tooth capacity...")',
  url: 'https://support.sram.com/hc/en-us/articles/6496373326619-What-is-the-total-drivetrain-tooth-capacity-of-the-Force-eTap-AXS-36t-max-rear-derailleur',
  consultee_le: '2026-08-18',
} as const;

export const DERAILLEURS: readonly SpecDerailleur[] = [
  {
    id: 'shimano-ultegra-r8000-gs',
    nom: 'Shimano Ultegra RD-R8000-GS',
    marque: 'Shimano',
    categorie: 'route',
    vitesses: 11,
    transmission: '2x',
    cog_max_dents: 34,
    capacite_totale_dents: 39,
    origine_capacite: 'fabricant',
    source_url: 'https://barquebike.com/products/shimano-ultegra-rd-r8000-rear-derailleur-11-speed',
    consultee_le: '2026-08-18',
  },
  {
    id: 'shimano-grx-rx822-sgs',
    nom: 'Shimano GRX RD-RX822-SGS (1x)',
    marque: 'Shimano',
    categorie: 'gravel',
    vitesses: 12,
    transmission: '1x',
    cog_max_dents: 51,
    capacite_totale_dents: 41, // calculée : 51 - 10 (cassette 10-51T)
    origine_capacite: 'calculee',
    source_url: 'https://bike.shimano.com/en-SG/products/components/pdp.P-RD-RX822-SGS.html',
    consultee_le: '2026-08-18',
  },
  {
    id: 'shimano-xt-m8100-sgs',
    nom: 'Shimano XT RD-M8100-SGS (1x)',
    marque: 'Shimano',
    categorie: 'vtt',
    vitesses: 12,
    transmission: '1x',
    cog_max_dents: 51,
    capacite_totale_dents: 41,
    origine_capacite: 'fabricant',
    source_url: 'https://worldwidecyclery.com/products/shimano-xt-rd-m8100-sgs-rear-derailleur-12-speed-long-cage-black-for-1x',
    consultee_le: '2026-08-18',
  },
  {
    id: 'sram-force-axs-36',
    nom: 'SRAM Force eTap AXS (36T max)',
    marque: 'SRAM',
    categorie: 'route',
    vitesses: 12,
    transmission: '2x',
    cog_max_dents: 36,
    capacite_totale_dents: 39,
    origine_capacite: 'fabricant',
    source_url: 'https://support.sram.com/hc/en-us/articles/6496373326619-What-is-the-total-drivetrain-tooth-capacity-of-the-Force-eTap-AXS-36t-max-rear-derailleur',
    consultee_le: '2026-08-18',
  },
  {
    id: 'sram-force-xplr-axs',
    nom: 'SRAM Force XPLR AXS (1x)',
    marque: 'SRAM',
    categorie: 'gravel',
    vitesses: 12,
    transmission: '1x',
    cog_max_dents: 44,
    capacite_totale_dents: 34, // calculée : 44 - 10 (cassette 10-44T)
    origine_capacite: 'calculee',
    source_url: 'https://support.sram.com/hc/en-us/articles/13302982407835-What-is-the-max-cog-size-that-is-compatible-with-new-Force-AXS-rear-derailleurs',
    consultee_le: '2026-08-18',
  },
  {
    id: 'sram-eagle-axs',
    nom: 'SRAM Eagle AXS (XX1/X01/GX, 1x)',
    marque: 'SRAM',
    categorie: 'vtt',
    vitesses: 12,
    transmission: '1x',
    cog_max_dents: 52,
    capacite_totale_dents: 42, // calculée : 52 - 10 (cassette 10-52T)
    origine_capacite: 'calculee',
    source_url: 'https://support.sram.com/hc/en-us/articles/6053889056411-What-is-the-max-cog-size-that-is-compatible-with-Eagle-AXS-rear-derailleurs',
    consultee_le: '2026-08-18',
  },
] as const;
