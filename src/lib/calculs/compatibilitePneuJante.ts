// Compatibilité largeur pneu / largeur interne de jante (norme ETRTO).
//
// Important, et conforme à la consigne du plan (Phase 3 §7) : on affiche
// toujours une PLAGE recommandée et une PLAGE tolérée plus large, jamais une
// seule valeur présentée comme absolue.
//
// Le tableau officiel ETRTO/ISO 5775 est un document propriétaire (payant) —
// on ne peut pas le reproduire ici. On s'appuie donc sur des points de
// repère documentés par plusieurs sources indépendantes qui citent ETRTO,
// et on interpole entre eux (méthode explicitée, pas un chiffre inventé).
// Vérifié le 18/08/2026 :
//   - biketips.com (citant ETRTO) : 19 mm interne -> 23-32 mm ; 21 mm -> 25-40 mm ;
//     23 mm -> 28-45 mm ; 25 mm (jante gravel) -> 32-50 mm.
//   - renehersecycles.com : un pneu 38 mm est compatible avec toute jante 700C
//     conforme ETRTO entre 17 et 27 mm interne (recoupement cohérent).
// En dehors de 19-25 mm interne, on ne dispose pas de points vérifiés : le
// verdict est alors "hors de la couverture de cet outil" plutôt qu'un chiffre
// inventé par extrapolation.
//
// Jantes hookless (tubeless à paroi droite) : l'ISO/ETRTO fixe un minimum de
// 29 mm de largeur de pneu, quelle que soit la largeur de jante — source :
// enve.com/blogs/journal/hookless-rim-technology-101, citant ISO/ETRTO,
// vérifié le 18/08/2026. Cette règle est binaire et prévaut sur la plage
// largeur/largeur ci-dessus.
//
// Rappel non calculé ici (pas une plage, une compatibilité binaire) : le
// diamètre de jante (BSD) doit être strictement identique entre pneu et
// jante (622 mm pour 700C/29", 584 mm pour 650B/27,5", 559 mm pour 26").

export type TypeJante = 'hooked' | 'hookless';

export const SOURCE_COMPATIBILITE_PNEU_JANTE = {
  nom: 'Points de repère ETRTO recoupés (biketips.com, renehersecycles.com, enve.com)',
  urls: [
    'https://biketips.com/bike-rim-width-tire-size-chart/',
    'https://www.renehersecycles.com/rim-and-tire-standards/',
    'https://enve.com/blogs/journal/hookless-rim-technology-101',
  ],
  consultee_le: '2026-08-18',
} as const;

/** Largeur minimale de pneu (mm) imposée par l'ISO/ETRTO sur jante hookless, quelle que soit la largeur de jante. */
export const LARGEUR_PNEU_MIN_HOOKLESS_MM = 29;

/** Marge de tolérance ajoutée de part et d'autre de la plage recommandée — un choix prudent de notre part, pas un chiffre ETRTO. */
export const MARGE_TOLERANCE_MM = 4;

interface AncreLargeurJante {
  largeur_jante_mm: number;
  pneu_min_mm: number;
  pneu_max_mm: number;
}

// Points de repère vérifiés (voir sources ci-dessus), triés par largeur de jante croissante.
const ANCRES_LARGEUR_JANTE: readonly AncreLargeurJante[] = [
  { largeur_jante_mm: 19, pneu_min_mm: 23, pneu_max_mm: 32 },
  { largeur_jante_mm: 21, pneu_min_mm: 25, pneu_max_mm: 40 },
  { largeur_jante_mm: 23, pneu_min_mm: 28, pneu_max_mm: 45 },
  { largeur_jante_mm: 25, pneu_min_mm: 32, pneu_max_mm: 50 },
];

const COUVERTURE_MIN_MM = ANCRES_LARGEUR_JANTE[0].largeur_jante_mm;
const COUVERTURE_MAX_MM = ANCRES_LARGEUR_JANTE[ANCRES_LARGEUR_JANTE.length - 1].largeur_jante_mm;

export interface EntreesCompatibilitePneuJante {
  largeur_jante_interne_mm: number;
  largeur_pneu_mm: number;
  type_jante: TypeJante;
}

export type VerdictCompatibilitePneuJante = 'recommande' | 'tolere' | 'non_recommande' | 'hors_couverture';

export interface ResultatCompatibilitePneuJante {
  verdict: VerdictCompatibilitePneuJante;
  /** Absent si hors_couverture (pas de données vérifiées pour cette largeur de jante). */
  plage_recommandee_mm?: [number, number];
  plage_toleree_mm?: [number, number];
  /** Renseigné quand la règle hookless (29 mm minimum) a déterminé le verdict, indépendamment de la plage largeur/largeur. */
  regle_hookless_appliquee: boolean;
}

const PLAGES_VALIDATION = {
  largeur_jante_interne_mm: { min: 13, max: 35 },
  largeur_pneu_mm: { min: 18, max: 65 },
};

export function validerEntreesCompatibilitePneuJante(
  entrees: Partial<EntreesCompatibilitePneuJante>,
): Partial<Record<keyof EntreesCompatibilitePneuJante, string>> {
  const erreurs: Partial<Record<keyof EntreesCompatibilitePneuJante, string>> = {};
  const { largeur_jante_interne_mm, largeur_pneu_mm, type_jante } = entrees;

  if (
    typeof largeur_jante_interne_mm !== 'number' ||
    !Number.isFinite(largeur_jante_interne_mm) ||
    largeur_jante_interne_mm < PLAGES_VALIDATION.largeur_jante_interne_mm.min ||
    largeur_jante_interne_mm > PLAGES_VALIDATION.largeur_jante_interne_mm.max
  ) {
    erreurs.largeur_jante_interne_mm = `Doit être compris entre ${PLAGES_VALIDATION.largeur_jante_interne_mm.min} et ${PLAGES_VALIDATION.largeur_jante_interne_mm.max} mm.`;
  }
  if (
    typeof largeur_pneu_mm !== 'number' ||
    !Number.isFinite(largeur_pneu_mm) ||
    largeur_pneu_mm < PLAGES_VALIDATION.largeur_pneu_mm.min ||
    largeur_pneu_mm > PLAGES_VALIDATION.largeur_pneu_mm.max
  ) {
    erreurs.largeur_pneu_mm = `Doit être compris entre ${PLAGES_VALIDATION.largeur_pneu_mm.min} et ${PLAGES_VALIDATION.largeur_pneu_mm.max} mm.`;
  }
  if (type_jante !== 'hooked' && type_jante !== 'hookless') {
    erreurs.type_jante = 'Type de jante invalide.';
  }

  return erreurs;
}

/** Interpole linéairement la plage recommandée entre les deux ancres encadrant la largeur donnée. */
function interpolerPlageRecommandee(largeurJanteMm: number): [number, number] {
  let ancreBasse = ANCRES_LARGEUR_JANTE[0];
  let ancreHaute = ANCRES_LARGEUR_JANTE[ANCRES_LARGEUR_JANTE.length - 1];

  for (let i = 0; i < ANCRES_LARGEUR_JANTE.length - 1; i++) {
    if (largeurJanteMm >= ANCRES_LARGEUR_JANTE[i].largeur_jante_mm && largeurJanteMm <= ANCRES_LARGEUR_JANTE[i + 1].largeur_jante_mm) {
      ancreBasse = ANCRES_LARGEUR_JANTE[i];
      ancreHaute = ANCRES_LARGEUR_JANTE[i + 1];
      break;
    }
  }

  if (ancreBasse.largeur_jante_mm === ancreHaute.largeur_jante_mm) {
    return [ancreBasse.pneu_min_mm, ancreBasse.pneu_max_mm];
  }

  const ratio =
    (largeurJanteMm - ancreBasse.largeur_jante_mm) / (ancreHaute.largeur_jante_mm - ancreBasse.largeur_jante_mm);
  const min = ancreBasse.pneu_min_mm + ratio * (ancreHaute.pneu_min_mm - ancreBasse.pneu_min_mm);
  const max = ancreBasse.pneu_max_mm + ratio * (ancreHaute.pneu_max_mm - ancreBasse.pneu_max_mm);

  return [Math.round(min * 10) / 10, Math.round(max * 10) / 10];
}

export function calculerCompatibilitePneuJante(
  entrees: EntreesCompatibilitePneuJante,
): ResultatCompatibilitePneuJante {
  const erreurs = validerEntreesCompatibilitePneuJante(entrees);
  if (Object.keys(erreurs).length > 0) {
    throw new Error(`Entrées invalides : ${Object.values(erreurs).join(' ')}`);
  }

  const { largeur_jante_interne_mm, largeur_pneu_mm, type_jante } = entrees;

  if (largeur_jante_interne_mm < COUVERTURE_MIN_MM || largeur_jante_interne_mm > COUVERTURE_MAX_MM) {
    return { verdict: 'hors_couverture', regle_hookless_appliquee: false };
  }

  const [min, max] = interpolerPlageRecommandee(largeur_jante_interne_mm);
  const plage_recommandee_mm: [number, number] = [min, max];
  const plage_toleree_mm: [number, number] = [
    Math.max(0, min - MARGE_TOLERANCE_MM),
    max + MARGE_TOLERANCE_MM,
  ];

  if (type_jante === 'hookless' && largeur_pneu_mm < LARGEUR_PNEU_MIN_HOOKLESS_MM) {
    return {
      verdict: 'non_recommande',
      plage_recommandee_mm,
      plage_toleree_mm,
      regle_hookless_appliquee: true,
    };
  }

  let verdict: VerdictCompatibilitePneuJante;
  if (largeur_pneu_mm >= min && largeur_pneu_mm <= max) {
    verdict = 'recommande';
  } else if (largeur_pneu_mm >= plage_toleree_mm[0] && largeur_pneu_mm <= plage_toleree_mm[1]) {
    verdict = 'tolere';
  } else {
    verdict = 'non_recommande';
  }

  return { verdict, plage_recommandee_mm, plage_toleree_mm, regle_hookless_appliquee: false };
}
