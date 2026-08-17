// Types partagés du projet.
// Règle Phase 5 : chaque champ collecté doit être réutilisé par au moins un
// outil dès le MVP. Ne pas ajouter de champ "au cas où".

/** Niveau déclaré par le cycliste — utilisé pour les plafonds glucides (nutrition)
 *  et les hypothèses de puissance (pacing). Source plafonds : Jeukendrup 2014 / ACSM 2016. */
export type NiveauCycliste = 'debutant' | 'intermediaire' | 'confirme' | 'expert';

export interface Profil {
  /** Poids du cycliste en kg. Utilisé par : pacing (physique), nutrition (sueur/glucides). */
  poids_kg: number;
  /** Niveau déclaré. Utilisé par : nutrition (plafond glucides/h), pacing (puissance par défaut). */
  niveau: NiveauCycliste;
  /** FTP en watts, optionnel (beaucoup de cyclistes ne le connaissent pas).
   *  Utilisé par : pacing (approximation de la puissance critique). */
  ftp_w: number | null;
  /** Horodatage de dernière modification (ISO 8601), pour affichage uniquement. */
  mis_a_jour_le: string;
}

/** Type de pratique — utilisé pour proposer des coefficients de résistance
 *  par défaut (Crr) dans l'outil de pacing, et pour filtrer les articles de blog. */
export type TypePratique = 'route' | 'gravel' | 'vtt' | 'ville';

export interface Velo {
  /** Identifiant local unique (généré côté client). */
  id: string;
  /** Nom donné par l'utilisateur, ex. "Cannondale SuperSix". Affichage uniquement. */
  nom: string;
  type_pratique: TypePratique;
  /** Denture des plateaux, ex. [50, 34]. Utilisé par : longueur de chaîne. */
  plateaux_dents: number[];
  /** Plus petit pignon de la cassette. Utilisé par : longueur de chaîne, compat cassette/dérailleur. */
  cassette_dents_min: number;
  /** Plus grand pignon de la cassette. Utilisé par : longueur de chaîne, compat cassette/dérailleur. */
  cassette_dents_max: number;
  /** Nombre de vitesses de la cassette (8 à 13). Utilisé par : compat cassette/dérailleur. */
  cassette_vitesses: number;
  /** Longueur de bras de manivelle... non : longueur du hauban (chainstay) en mm.
   *  Utilisé par : longueur de chaîne (formule Bike Gremlin). */
  longueur_hauban_mm: number;
  /** Largeur du pneu monté, en mm. Utilisé par : compatibilité pneu/jante (ETRTO). */
  pneu_largeur_mm: number;
  /** Largeur interne de la jante, en mm. Utilisé par : compatibilité pneu/jante (ETRTO). */
  jante_largeur_interne_mm: number;
  mis_a_jour_le: string;
}
