// Outil "Plan nutrition course" — Étape 6 du plan de développement.
//
// Port direct des fonctions de src/race_fuel_planner/analysis/ (moteur
// RaceFuelPlanner de l'auteur) : carbs.py, hydration.py, electrolytes.py.
// Noms et formules conservés à l'identique ; seul le mapping des niveaux est
// adapté (voir NIVEAU_VERS_LEVEL ci-dessous).
//
// Sources citées directement dans le code source Python porté :
// - Glucides : Jeukendrup (2014) — recommandations 30 à 90 g/h selon la durée,
//   jusqu'à 90-120 g/h en ultra-endurance avec mélange multi-glucides ;
//   ACSM Position Stand (2016) sur la nutrition en endurance.
// - Hydratation : Cheuvront & Kenefick (2014), Sawka et al., ACSM (2007).
// - Électrolytes : ACSM Position Stand (300-700 mg sodium/L pour un effort
//   >1h) ; protocoles ultra (Hoffman, jusqu'à 1000-1500 mg/h en chaleur
//   extrême).
//
// Ce sont des repères généraux de littérature sportive, pas une prescription
// individualisée — un professionnel de santé ou un diététicien du sport doit
// être consulté pour un plan personnalisé, en particulier en cas de trouble
// digestif, de pathologie ou d'effort extrême. C'est rappelé sur la page outil.

import type { NiveauCycliste } from '@/types';
import { PLAGES } from '@/lib/storage/profilLocal';

// Python's built-in round() uses "round half to even" (banker's rounding),
// unlike JS's Math.round() which always rounds half away from zero (up for
// positive numbers). All values ported here go through Python's round() at
// least once, so a naive Math.round() would silently disagree with the
// source engine exactly at .5 boundaries (e.g. round(22.5): Python -> 22,
// Math.round -> 23). This replicates Python's semantics on the same IEEE 754
// double representation used by both languages.
function arrondiPython(x: number): number {
  const base = Math.floor(x);
  const diff = x - base;
  if (diff < 0.5) return base;
  if (diff > 0.5) return base + 1;
  return base % 2 === 0 ? base : base + 1;
}

// -------------------------------------------------------------- carbs.py

type NiveauRaceFuelPlanner = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE' | 'PRO';

/** Le moteur source distingue 5 niveaux (BEGINNER/INTERMEDIATE/ADVANCED/
 *  ELITE/PRO), RouleurLab n'en collecte que 4 (voir NiveauCycliste). ELITE et
 *  PRO ayant le même plafond (120 g/h) dans la source, "expert" est mappé
 *  sur ELITE sans perte d'information. */
const NIVEAU_VERS_LEVEL: Record<NiveauCycliste, NiveauRaceFuelPlanner> = {
  debutant: 'BEGINNER',
  intermediaire: 'INTERMEDIATE',
  confirme: 'ADVANCED',
  expert: 'ELITE',
};

const LEVEL_CAP: Record<NiveauRaceFuelPlanner, number> = {
  BEGINNER: 70,
  INTERMEDIATE: 90,
  ADVANCED: 110,
  ELITE: 120,
  PRO: 120,
};

/** Quantité de glucides par heure recommandée (en grammes). Port de
 *  recommend_carbs_per_hour (carbs.py). */
export function recommandationGlucidesParHeure(
  dureeMin: number,
  intensiteIf: number,
  niveau: NiveauCycliste,
  temperatureC = 20.0,
): number {
  const dureeH = dureeMin / 60.0;

  let base: number;
  if (dureeH < 1.0) {
    base = 30;
  } else if (dureeH < 2.0) {
    base = 45 + 15 * intensiteIf;
  } else if (dureeH < 3.0) {
    base = 60 + 20 * intensiteIf;
  } else if (dureeH < 5.0) {
    base = 80 + 20 * intensiteIf;
  } else {
    base = 90 + 20 * intensiteIf;
  }

  // Ajustement chaleur : >30 °C on baisse un peu (vidange gastrique plus
  // lente), >35 °C : -10 %.
  if (temperatureC >= 35.0) {
    base *= 0.85;
  } else if (temperatureC >= 30.0) {
    base *= 0.92;
  }

  const cap = LEVEL_CAP[NIVEAU_VERS_LEVEL[niveau]];
  return arrondiPython(Math.min(Math.max(base, 25), cap) / 5.0) * 5;
}

/** Quantité totale de glucides à viser sur l'effort (en grammes). Port de
 *  total_carbs_target (carbs.py). */
export function glucidesTotalCible(dureeMin: number, glucidesParH: number): number {
  const heures = dureeMin / 60.0;
  return arrondiPython(glucidesParH * heures);
}

// ----------------------------------------------------------- hydration.py

/** Estimation du taux de sudation, en ml/h. `humiditePct` est un pourcentage
 *  (0-100), pas une fraction. Port de estimate_sweat_rate_ml_per_h
 *  (hydration.py). */
export function estimationTauxSudationMlParH(
  poidsKg: number,
  temperatureC: number,
  humiditePct: number,
  intensiteIf: number,
): number {
  const base = 8.5 * poidsKg;
  const facteurTemp = 1.0 + 0.06 * Math.max(0.0, temperatureC - 18.0);
  const facteurHumidite = 1.0 + 0.004 * Math.max(0.0, humiditePct - 40.0);
  const facteurIntensite = 0.75 + intensiteIf;
  return base * facteurTemp * facteurHumidite * (facteurIntensite / 1.5);
}

/** Volume de boisson recommandé par heure (ml). Port de
 *  recommend_fluid_ml_per_h (hydration.py). */
export function recommandationLiquideMlParH(
  poidsKg: number,
  temperatureC: number,
  humiditePct: number,
  intensiteIf: number,
): number {
  const sueur = estimationTauxSudationMlParH(poidsKg, temperatureC, humiditePct, intensiteIf);
  const cible = Math.min(Math.max(sueur * 0.85, 400.0), 1200.0);
  return arrondiPython(cible / 50.0) * 50;
}

// --------------------------------------------------------- electrolytes.py

/** Recommandation sodium (mg/h). Port de recommend_sodium_mg_per_h
 *  (electrolytes.py). */
export function recommandationSodiumMgParH(fluideMlParH: number, temperatureC: number, dureeMin: number): number {
  let concentration: number;
  if (temperatureC >= 32.0) {
    concentration = 900;
  } else if (temperatureC >= 26.0) {
    concentration = 700;
  } else {
    concentration = 500;
  }

  let base = (fluideMlParH / 1000.0) * concentration;
  if (dureeMin >= 240) {
    base *= 1.1;
  }
  return arrondiPython(base / 50.0) * 50;
}

// ------------------------------------------------------- frontière française

export interface EntreesNutrition {
  poids_kg: number;
  niveau: NiveauCycliste;
  /** Durée prévue de l'effort, en minutes. */
  duree_min: number;
  /** Facteur d'intensité prévu (IF, 0-1+). 0.7 = allure sportive, 0.9 = seuil. */
  intensite_if: number;
  temperature_c: number;
  /** Humidité relative en %, 0 à 100. */
  humidite_pourcent: number;
}

export interface ResultatNutrition {
  glucides_g_par_h: number;
  glucides_total_g: number;
  taux_sudation_estime_ml_par_h: number;
  liquide_ml_par_h: number;
  liquide_total_ml: number;
  sodium_mg_par_h: number;
  sodium_total_mg: number;
}

const PLAGE_DUREE_MIN = { min: 15, max: 1440 };
const PLAGE_IF = { min: 0.4, max: 1.1 };
const PLAGE_TEMPERATURE_C = { min: -10, max: 50 };
const PLAGE_HUMIDITE_POURCENT = { min: 0, max: 100 };

function estNombreDansPlage(valeur: unknown, plage: { min: number; max: number }): boolean {
  return typeof valeur === 'number' && Number.isFinite(valeur) && valeur >= plage.min && valeur <= plage.max;
}

export function validerEntreesNutrition(entrees: Partial<EntreesNutrition>): Partial<Record<string, string>> {
  const erreurs: Partial<Record<string, string>> = {};

  if (!estNombreDansPlage(entrees.poids_kg, PLAGES.poids_kg)) {
    erreurs.poids_kg = `Le poids doit être compris entre ${PLAGES.poids_kg.min} et ${PLAGES.poids_kg.max} kg.`;
  }
  if (!entrees.niveau) {
    erreurs.niveau = 'Niveau requis.';
  }
  if (!estNombreDansPlage(entrees.duree_min, PLAGE_DUREE_MIN)) {
    erreurs.duree_min = `La durée doit être comprise entre ${PLAGE_DUREE_MIN.min} et ${PLAGE_DUREE_MIN.max} minutes.`;
  }
  if (!estNombreDansPlage(entrees.intensite_if, PLAGE_IF)) {
    erreurs.intensite_if = `Le facteur d'intensité doit être compris entre ${PLAGE_IF.min} et ${PLAGE_IF.max}.`;
  }
  if (!estNombreDansPlage(entrees.temperature_c, PLAGE_TEMPERATURE_C)) {
    erreurs.temperature_c = `La température doit être comprise entre ${PLAGE_TEMPERATURE_C.min} et ${PLAGE_TEMPERATURE_C.max} °C.`;
  }
  if (!estNombreDansPlage(entrees.humidite_pourcent, PLAGE_HUMIDITE_POURCENT)) {
    erreurs.humidite_pourcent = `L'humidité doit être comprise entre ${PLAGE_HUMIDITE_POURCENT.min} et ${PLAGE_HUMIDITE_POURCENT.max} %.`;
  }

  return erreurs;
}

/** Point d'entrée de l'outil : enchaîne glucides, hydratation, électrolytes. */
export function calculerNutrition(entrees: EntreesNutrition): ResultatNutrition {
  const glucidesParH = recommandationGlucidesParHeure(
    entrees.duree_min,
    entrees.intensite_if,
    entrees.niveau,
    entrees.temperature_c,
  );
  const glucidesTotal = glucidesTotalCible(entrees.duree_min, glucidesParH);

  const sudation = estimationTauxSudationMlParH(
    entrees.poids_kg,
    entrees.temperature_c,
    entrees.humidite_pourcent,
    entrees.intensite_if,
  );
  const liquideParH = recommandationLiquideMlParH(
    entrees.poids_kg,
    entrees.temperature_c,
    entrees.humidite_pourcent,
    entrees.intensite_if,
  );
  const liquideTotal = Math.round(liquideParH * (entrees.duree_min / 60.0));

  const sodiumParH = recommandationSodiumMgParH(liquideParH, entrees.temperature_c, entrees.duree_min);
  const sodiumTotal = Math.round(sodiumParH * (entrees.duree_min / 60.0));

  return {
    glucides_g_par_h: glucidesParH,
    glucides_total_g: glucidesTotal,
    taux_sudation_estime_ml_par_h: Math.round(sudation),
    liquide_ml_par_h: liquideParH,
    liquide_total_ml: liquideTotal,
    sodium_mg_par_h: sodiumParH,
    sodium_total_mg: sodiumTotal,
  };
}
