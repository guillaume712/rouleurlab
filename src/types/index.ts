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

// --- Étape 6 : moteur de simulation pacing --------------------------------
// Types portés depuis models.py du moteur VéloPace (outil interne de l'auteur,
// déjà validé indépendamment sur le modèle physique Martin et al. 1998 et le
// modèle W'balance de Skiba). Les noms de champs sont conservés à l'identique
// du Python (anglais, unités SI) plutôt que traduits en français : ce sont des
// types de calcul interne, jamais affichés tels quels à l'utilisateur (voir
// EntreesPacing/ResultatPacing dans lib/calculs/pacing.ts pour la frontière
// française du domaine), et garder les noms identiques à la source permet de
// vérifier le portage fonction par fonction sans ambiguïté de correspondance.
//
// Portage volontairement partiel (MVP, Phase 7 Étape 6) : pas de champ
// `fatigue` (modèle de durabilité non porté — voir justification dans
// pacing.ts), pas de champs de fréquence cardiaque (estimation FC non portée :
// modèle individuel non vérifiable sans données réelles de l'utilisateur),
// pas de `vo2max` (non utilisé par les fonctions portées).

/** Cycliste — physiologie utile au calcul de puissance/vitesse et W'balance. */
export interface Rider {
  mass_kg: number;
  ftp_w: number;
  /** Puissance critique. `null` => déduite de ftp_w / 0.96 (voir cpEffective()). */
  cp_w: number | null;
  w_prime_j: number;
}

/** Vélo + position — paramètres mécaniques et aérodynamiques. */
export interface Bike {
  mass_kg: number;
  /** Coefficient de traînée aérodynamique × surface frontale, en m². */
  cda: number;
  /** Coefficient de résistance au roulement. */
  crr: number;
  drivetrain_eff: number;
  wheel_inertia_factor: number;
}

/** Conditions environnementales. Le vent peut être surchargé par segment. */
export interface Environment {
  temperature_c: number;
  /** Pression en hPa. `null` => déduite de l'altitude (nivellement barométrique). */
  pressure_hpa: number | null;
  /** Humidité relative, 0 à 1. */
  humidity: number;
  altitude_m: number;
  wind_speed_ms: number;
  wind_dir_deg: number;
}

/** Tronçon homogène du parcours (pente et distance constantes). */
export interface Segment {
  distance_m: number;
  /** Pente en fraction (0.05 = 5 %), positive en montée. */
  grade: number;
  heading_deg: number;
  altitude_m: number;
  wind_speed_ms: number | null;
  wind_dir_deg: number | null;
  v_max_ms: number | null;
  crr_factor: number;
}

/** Contraintes physiologiques imposées au plan de puissance. */
export interface Constraints {
  /** NP <= if_max * FTP. */
  if_max: number;
  p_min_w: number;
  /** `null` => 150 % FTP. */
  p_max_w: number | null;
  /** Fraction de W'0 à préserver en tout point du parcours. */
  w_prime_margin: number;
}

/** Résultat de simulation d'un plan de puissance sur un parcours. */
export interface SimResult {
  seg_time_s: number[];
  seg_speed_ms: number[];
  seg_power_w: number[];
  /** W'bal en FIN de segment, en joules. */
  seg_wbal_j: number[];
  total_time_s: number;
  distance_m: number;
  avg_speed_ms: number;
  avg_power_w: number;
  np_w: number;
  if_: number;
  tss: number;
  vi: number;
  energy_kj: number;
  wbal_min_j: number;
  feasible: boolean;
}
