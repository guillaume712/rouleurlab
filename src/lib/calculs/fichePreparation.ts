// Fiche "Préparer ma sortie" — Étape 7 du plan de développement.
//
// Combine pacing.ts et nutrition.ts : un seul formulaire (profil, parcours,
// conditions) produit à la fois le plan de puissance et le plan nutrition,
// en dérivant automatiquement la durée et l'intensité (IF) attendues du
// plan de puissance plutôt que de les demander une deuxième fois à
// l'utilisateur. Aucune nouvelle formule physiologique ici : c'est une pure
// orchestration des deux modules déjà portés et testés indépendamment.

import type { NiveauCycliste, TypePratique } from '@/types';
import {
  calculerPlanPacing,
  validerEntreesPacing,
  type EntreeSegmentPacing,
  type EntreesPacing,
  type ResultatPacing,
} from './pacing';
import { calculerNutrition, type EntreesNutrition, type ResultatNutrition } from './nutrition';

// Bornes de calculerNutrition (voir nutrition.ts) : la durée et l'IF dérivés
// du plan de puissance peuvent en sortir (parcours très court, très facile
// ou très difficile). On les ramène dans le domaine validé plutôt que de
// laisser calculerNutrition recevoir une valeur jamais vérifiée par
// validerEntreesNutrition — avec un signalement explicite dans le résultat
// pour que l'interface prévienne l'utilisateur au lieu de masquer l'écart.
const DUREE_MIN_BORNES = { min: 15, max: 1440 };
const IF_BORNES = { min: 0.4, max: 1.1 };

export interface EntreesFiche {
  poids_kg: number;
  ftp_w: number;
  niveau: NiveauCycliste;
  type_pratique: TypePratique;
  segments: EntreeSegmentPacing[];
  w_prime_j?: number;
  masse_velo_kg?: number;
  temperature_c?: number;
  altitude_m?: number;
  vent_face_ms?: number;
  humidite_pourcent?: number;
}

export interface ResultatFiche {
  pacing: ResultatPacing;
  nutrition: ResultatNutrition;
  /** true si la durée dérivée du plan de puissance a dû être ramenée dans la
   *  plage validée du calcul nutrition (parcours très court ou très long). */
  duree_nutrition_ajustee: boolean;
  /** true si l'IF dérivé du plan de puissance a dû être ramené dans la plage
   *  validée du calcul nutrition. */
  intensite_nutrition_ajustee: boolean;
}

function borner(valeur: number, bornes: { min: number; max: number }): number {
  return Math.min(Math.max(valeur, bornes.min), bornes.max);
}

/** Valide les champs partagés (via validerEntreesPacing) et les champs
 *  propres au volet nutrition de la fiche (niveau, humidité). La durée et
 *  l'IF nutrition ne sont pas des champs saisis ici : ils sont dérivés du
 *  plan de puissance, donc pas de validation dessus (voir borner() dans
 *  calculerFiche pour la gestion des cas hors plage). */
export function validerEntreesFiche(entrees: Partial<EntreesFiche>): Partial<Record<string, string>> {
  const erreurs = validerEntreesPacing(entrees);

  if (!entrees.niveau) {
    erreurs.niveau = 'Niveau requis.';
  }
  if (
    entrees.humidite_pourcent !== undefined &&
    (!Number.isFinite(entrees.humidite_pourcent) || entrees.humidite_pourcent < 0 || entrees.humidite_pourcent > 100)
  ) {
    erreurs.humidite_pourcent = "L'humidité doit être comprise entre 0 et 100 %.";
  }

  return erreurs;
}

/** Point d'entrée de la fiche : calcule le plan de puissance, puis en dérive
 *  la durée et l'intensité pour alimenter le plan nutrition. */
export function calculerFiche(entrees: EntreesFiche): ResultatFiche {
  const entreesPacing: EntreesPacing = {
    poids_kg: entrees.poids_kg,
    ftp_w: entrees.ftp_w,
    type_pratique: entrees.type_pratique,
    segments: entrees.segments,
    w_prime_j: entrees.w_prime_j,
    masse_velo_kg: entrees.masse_velo_kg,
    temperature_c: entrees.temperature_c,
    altitude_m: entrees.altitude_m,
    vent_face_ms: entrees.vent_face_ms,
  };
  const pacing = calculerPlanPacing(entreesPacing);

  const dureeMinBrute = pacing.temps_total_s / 60;
  const dureeMinAjustee = borner(dureeMinBrute, DUREE_MIN_BORNES);
  const intensiteIfAjustee = borner(pacing.if_, IF_BORNES);

  const entreesNutrition: EntreesNutrition = {
    poids_kg: entrees.poids_kg,
    niveau: entrees.niveau,
    duree_min: dureeMinAjustee,
    intensite_if: intensiteIfAjustee,
    temperature_c: entrees.temperature_c ?? 20.0,
    humidite_pourcent: entrees.humidite_pourcent ?? 50.0,
  };
  const nutrition = calculerNutrition(entreesNutrition);

  return {
    pacing,
    nutrition,
    duree_nutrition_ajustee: dureeMinAjustee !== dureeMinBrute,
    intensite_nutrition_ajustee: intensiteIfAjustee !== pacing.if_,
  };
}
