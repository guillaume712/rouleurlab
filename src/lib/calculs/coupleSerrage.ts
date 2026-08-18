// Table de référence des couples de serrage courants en cyclisme.
// Source unique et citée : Park Tool, "Torque Specifications and Concepts"
// (référence largement utilisée par les mécaniciens cycles, consultée le 18/08/2026).
// Park Tool le précise elle-même : ce sont des repères généraux, pas des
// spécifications constructeur exactes — voir l'avertissement affiché avec
// le tableau (Phase 3 : distinction estimation vs. prescription obligatoire).

export const SOURCE_COUPLE_SERRAGE = {
  nom: 'Park Tool — Torque Specifications and Concepts',
  url: 'https://www.parktool.com/en-us/blog/repair-help/torque-specifications-and-concepts',
  consultee_le: '2026-08-18',
} as const;

export type CategorieCoupleSerrage =
  | 'Roues & moyeux'
  | 'Freins à disque'
  | 'Direction & potence'
  | 'Cintre & selle'
  | 'Pédalier & pédales'
  | 'Dérailleurs'
  | 'Freins';

export const CATEGORIES_COUPLE_SERRAGE: readonly CategorieCoupleSerrage[] = [
  'Roues & moyeux',
  'Freins à disque',
  'Direction & potence',
  'Cintre & selle',
  'Pédalier & pédales',
  'Dérailleurs',
  'Freins',
];

export interface EntreeCoupleSerrage {
  id: string;
  categorie: CategorieCoupleSerrage;
  composant: string;
  /** Couple minimum recommandé, en newton-mètres. */
  couple_min_nm: number;
  /** Couple maximum recommandé, en newton-mètres. */
  couple_max_nm: number;
  /** Précision affichée avec l'entrée quand la plage est large ou le contexte important. */
  note?: string;
}

export const TABLE_COUPLE_SERRAGE: readonly EntreeCoupleSerrage[] = [
  {
    id: 'axe-roue-ecrou',
    categorie: 'Roues & moyeux',
    composant: 'Écrous d’axe (roue à écrous, non à blocage rapide)',
    couple_min_nm: 29,
    couple_max_nm: 44,
  },
  {
    id: 'bague-cassette-shimano',
    categorie: 'Roues & moyeux',
    composant: 'Bague de blocage de cassette (Shimano)',
    couple_min_nm: 29,
    couple_max_nm: 49,
  },
  {
    id: 'bague-cassette-sram',
    categorie: 'Roues & moyeux',
    composant: 'Bague de blocage de cassette (SRAM)',
    couple_min_nm: 40,
    couple_max_nm: 40,
  },
  {
    id: 'bague-cassette-campagnolo',
    categorie: 'Roues & moyeux',
    composant: 'Bague de blocage de cassette (Campagnolo)',
    couple_min_nm: 50,
    couple_max_nm: 50,
  },
  {
    id: 'rotor-centerlock',
    categorie: 'Freins à disque',
    composant: 'Bague de blocage du rotor (fixation Center Lock)',
    couple_min_nm: 40,
    couple_max_nm: 40,
  },
  {
    id: 'rotor-6-trous',
    categorie: 'Freins à disque',
    composant: 'Vis de rotor 6 trous (par vis)',
    couple_min_nm: 2,
    couple_max_nm: 6,
  },
  {
    id: 'etrier-disque',
    categorie: 'Freins à disque',
    composant: 'Vis de fixation d’étrier de frein à disque',
    couple_min_nm: 6,
    couple_max_nm: 12,
  },
  {
    id: 'compression-direction',
    categorie: 'Direction & potence',
    composant: 'Vis de compression du jeu de direction (bouchon de potence)',
    couple_min_nm: 5,
    couple_max_nm: 10,
  },
  {
    id: 'faceplate-potence',
    categorie: 'Direction & potence',
    composant: 'Vis de serrage cintre/potence (faceplate)',
    couple_min_nm: 5,
    couple_max_nm: 29,
    note: 'Plage très large : dépend fortement du nombre de vis et du matériau (alu/carbone). Vérifiez toujours la valeur imprimée sur la potence ou le cintre.',
  },
  {
    id: 'collier-tige-selle',
    categorie: 'Cintre & selle',
    composant: 'Collier de tige de selle',
    couple_min_nm: 4,
    couple_max_nm: 7,
  },
  {
    id: 'rails-selle',
    categorie: 'Cintre & selle',
    composant: 'Boulon(s) de rails de selle',
    couple_min_nm: 5,
    couple_max_nm: 34,
    note: 'Plage très large selon le type de tête de selle (mono ou double boulon). Les rails carbone tolèrent généralement le bas de la plage.',
  },
  {
    id: 'pedale-manivelle',
    categorie: 'Pédalier & pédales',
    composant: 'Pédale dans la manivelle',
    couple_min_nm: 31,
    couple_max_nm: 40,
  },
  {
    id: 'plateau-acier',
    categorie: 'Pédalier & pédales',
    composant: 'Vis de plateau (acier)',
    couple_min_nm: 8,
    couple_max_nm: 14,
  },
  {
    id: 'plateau-alu',
    categorie: 'Pédalier & pédales',
    composant: 'Vis de plateau (aluminium)',
    couple_min_nm: 5,
    couple_max_nm: 10,
  },
  {
    id: 'cuvettes-boitier',
    categorie: 'Pédalier & pédales',
    composant: 'Cuvettes de boîtier de pédalier (filetées)',
    couple_min_nm: 27,
    couple_max_nm: 69,
  },
  {
    id: 'derailleur-avant',
    categorie: 'Dérailleurs',
    composant: 'Fixation du dérailleur avant (collier)',
    couple_min_nm: 5,
    couple_max_nm: 7,
  },
  {
    id: 'derailleur-arriere',
    categorie: 'Dérailleurs',
    composant: 'Fixation du dérailleur arrière (patte de dérailleur)',
    couple_min_nm: 8,
    couple_max_nm: 15,
  },
  {
    id: 'etau-levier',
    categorie: 'Freins',
    composant: 'Étau de levier de frein/vitesses (cintre route)',
    couple_min_nm: 6,
    couple_max_nm: 10,
  },
] as const;
