// Calcul de la longueur de chaîne pour un vélo à dérailleur(s).
// Formule (méthode dite "de la potence" / formule Park Tool, largement
// documentée y compris par Bike Gremlin) : vérifiée par recoupement de deux
// sources indépendantes le 18/08/2026 (voir SOURCE_LONGUEUR_CHAINE).
//
//   Longueur (pouces) = 2 × longueur de bases (pouces) + Plateau/4 + Cassette/4 + 1
//
// Convertie en nombre de maillons (pas de 12,7 mm = 1/2 pouce) :
//
//   maillons = (2 × bases_mm / 12,7) + (plateau_max + cassette_max) / 2 + 2
//
// Le résultat est arrondi au nombre PAIR de maillons supérieur (une chaîne
// referme un maillon intérieur sur un maillon extérieur, sa longueur est
// donc toujours paire).
//
// Cas particulier documenté : sur une transmission mono-plateau (1x) avec une
// cassette dont le plus grand pignon fait 42 dents ou plus, la course du
// dérailleur à chape longue nécessite 2 maillons de plus que la formule de
// base — ce n'est pas une nuance qu'on invente, c'est un correctif documenté
// par les mêmes sources.

export const SOURCE_LONGUEUR_CHAINE = {
  nom: "Formule de longueur de chaîne (méthode Park Tool / Sheldon Brown, recoupée sur deux sources)",
  urls: ['https://www.omnicalculator.com/sports/chain-length', 'https://bikecalcs.uk/maintenance/chain-length-calculator/'],
  consultee_le: '2026-08-18',
} as const;

/** Pas d'une chaîne de vélo standard (1/2 pouce), en millimètres. */
export const PAS_MAILLON_MM = 12.7;

/** Seuil (dents) au-delà duquel une cassette mono-plateau nécessite 2 maillons de marge. */
const SEUIL_CASSETTE_MONO_PLATEAU = 42;

export interface EntreesLongueurChaine {
  /** Longueur du hauban (bases), en mm. */
  longueur_hauban_mm: number;
  /** Denture de chaque plateau (ex. [50, 34]). Seul le plus grand compte pour le calcul. */
  plateaux_dents: number[];
  /** Denture du plus grand pignon de la cassette. */
  cassette_dents_max: number;
}

export interface ResultatLongueurChaine {
  nombre_maillons: number;
  longueur_mm: number;
  plateau_max_dents: number;
  /** Vrai si le correctif mono-plateau/grande cassette a été appliqué. */
  ajustement_mono_plateau: boolean;
}

const PLAGES_LONGUEUR_CHAINE = {
  longueur_hauban_mm: { min: 350, max: 500 },
  plateau_dents: { min: 20, max: 60 },
  cassette_dents_max: { min: 8, max: 52 },
};

export function validerEntreesLongueurChaine(
  entrees: Partial<EntreesLongueurChaine>,
): Partial<Record<keyof EntreesLongueurChaine, string>> {
  const erreurs: Partial<Record<keyof EntreesLongueurChaine, string>> = {};
  const { longueur_hauban_mm, plateaux_dents, cassette_dents_max } = entrees;

  if (
    typeof longueur_hauban_mm !== 'number' ||
    !Number.isFinite(longueur_hauban_mm) ||
    longueur_hauban_mm < PLAGES_LONGUEUR_CHAINE.longueur_hauban_mm.min ||
    longueur_hauban_mm > PLAGES_LONGUEUR_CHAINE.longueur_hauban_mm.max
  ) {
    erreurs.longueur_hauban_mm = `Doit être compris entre ${PLAGES_LONGUEUR_CHAINE.longueur_hauban_mm.min} et ${PLAGES_LONGUEUR_CHAINE.longueur_hauban_mm.max} mm.`;
  }

  if (
    !Array.isArray(plateaux_dents) ||
    plateaux_dents.length === 0 ||
    plateaux_dents.some(
      (d) =>
        !Number.isFinite(d) ||
        d < PLAGES_LONGUEUR_CHAINE.plateau_dents.min ||
        d > PLAGES_LONGUEUR_CHAINE.plateau_dents.max,
    )
  ) {
    erreurs.plateaux_dents = `Chaque plateau doit être compris entre ${PLAGES_LONGUEUR_CHAINE.plateau_dents.min} et ${PLAGES_LONGUEUR_CHAINE.plateau_dents.max} dents.`;
  }

  if (
    typeof cassette_dents_max !== 'number' ||
    !Number.isFinite(cassette_dents_max) ||
    cassette_dents_max < PLAGES_LONGUEUR_CHAINE.cassette_dents_max.min ||
    cassette_dents_max > PLAGES_LONGUEUR_CHAINE.cassette_dents_max.max
  ) {
    erreurs.cassette_dents_max = `Doit être compris entre ${PLAGES_LONGUEUR_CHAINE.cassette_dents_max.min} et ${PLAGES_LONGUEUR_CHAINE.cassette_dents_max.max} dents.`;
  }

  return erreurs;
}

/**
 * Calcule la longueur de chaîne nécessaire.
 * Lève une erreur si les entrées sont hors plage plausible — à valider en
 * amont côté formulaire avec `validerEntreesLongueurChaine`.
 */
export function calculerLongueurChaine(entrees: EntreesLongueurChaine): ResultatLongueurChaine {
  const erreurs = validerEntreesLongueurChaine(entrees);
  if (Object.keys(erreurs).length > 0) {
    throw new Error(`Entrées invalides : ${Object.values(erreurs).join(' ')}`);
  }

  const { longueur_hauban_mm, plateaux_dents, cassette_dents_max } = entrees;
  const plateau_max_dents = Math.max(...plateaux_dents);

  const maillonsBruts =
    (2 * longueur_hauban_mm) / PAS_MAILLON_MM + (plateau_max_dents + cassette_dents_max) / 2 + 2;

  let nombre_maillons = Math.ceil(maillonsBruts);
  if (nombre_maillons % 2 !== 0) nombre_maillons += 1;

  const ajustement_mono_plateau =
    plateaux_dents.length === 1 && cassette_dents_max >= SEUIL_CASSETTE_MONO_PLATEAU;
  if (ajustement_mono_plateau) nombre_maillons += 2;

  return {
    nombre_maillons,
    longueur_mm: nombre_maillons * PAS_MAILLON_MM,
    plateau_max_dents,
    ajustement_mono_plateau,
  };
}
