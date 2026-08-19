// Compatibilité cassette / dérailleur arrière.
// Deux vérifications indépendantes, toutes les deux nécessaires :
//   1. Le plus grand pignon de la cassette ne doit pas dépasser le "cog max"
//      du dérailleur (sinon la chape peut toucher le pignon ou le rayon).
//   2. La capacité totale nécessaire (écart de plateaux + écart de pignons)
//      ne doit pas dépasser la capacité totale du dérailleur (sinon la chaîne
//      n'a plus assez de mou pour absorber le petit plateau/petit pignon).
// Formule de capacité : voir SOURCE_FORMULE_CAPACITE dans donnees/derailleurs.ts.

import { DERAILLEURS, type SpecDerailleur } from './donnees/derailleurs';

export { DERAILLEURS };
export type { SpecDerailleur };

export interface EntreesCompatibiliteCassetteDerailleur {
  plateaux_dents: number[];
  cassette_dents_min: number;
  cassette_dents_max: number;
  derailleur_id: string;
}

export interface ResultatCompatibiliteCassetteDerailleur {
  derailleur: SpecDerailleur;
  capacite_necessaire_dents: number;
  cog_ok: boolean;
  capacite_ok: boolean;
  compatible: boolean;
}

const PLAGES_VALIDATION = {
  plateau_dents: { min: 20, max: 60 },
  cassette_dents: { min: 8, max: 52 },
};

export function validerEntreesCompatibiliteCassetteDerailleur(
  entrees: Partial<EntreesCompatibiliteCassetteDerailleur>,
): Partial<Record<keyof EntreesCompatibiliteCassetteDerailleur, string>> {
  const erreurs: Partial<Record<keyof EntreesCompatibiliteCassetteDerailleur, string>> = {};
  const { plateaux_dents, cassette_dents_min, cassette_dents_max, derailleur_id } = entrees;

  if (
    !Array.isArray(plateaux_dents) ||
    plateaux_dents.length === 0 ||
    plateaux_dents.some(
      (d) =>
        !Number.isFinite(d) ||
        d < PLAGES_VALIDATION.plateau_dents.min ||
        d > PLAGES_VALIDATION.plateau_dents.max,
    )
  ) {
    erreurs.plateaux_dents = `Chaque plateau doit être compris entre ${PLAGES_VALIDATION.plateau_dents.min} et ${PLAGES_VALIDATION.plateau_dents.max} dents.`;
  }
  if (
    typeof cassette_dents_min !== 'number' ||
    !Number.isFinite(cassette_dents_min) ||
    cassette_dents_min < PLAGES_VALIDATION.cassette_dents.min ||
    cassette_dents_min > PLAGES_VALIDATION.cassette_dents.max
  ) {
    erreurs.cassette_dents_min = `Doit être compris entre ${PLAGES_VALIDATION.cassette_dents.min} et ${PLAGES_VALIDATION.cassette_dents.max} dents.`;
  }
  if (
    typeof cassette_dents_max !== 'number' ||
    !Number.isFinite(cassette_dents_max) ||
    cassette_dents_max < PLAGES_VALIDATION.cassette_dents.min ||
    cassette_dents_max > PLAGES_VALIDATION.cassette_dents.max
  ) {
    erreurs.cassette_dents_max = `Doit être compris entre ${PLAGES_VALIDATION.cassette_dents.min} et ${PLAGES_VALIDATION.cassette_dents.max} dents.`;
  }
  if (
    typeof cassette_dents_min === 'number' &&
    typeof cassette_dents_max === 'number' &&
    cassette_dents_min >= cassette_dents_max
  ) {
    erreurs.cassette_dents_max = 'Le grand pignon doit avoir plus de dents que le petit pignon.';
  }
  if (!derailleur_id || !DERAILLEURS.some((d) => d.id === derailleur_id)) {
    erreurs.derailleur_id = 'Dérailleur inconnu.';
  }

  return erreurs;
}

export function calculerCompatibiliteCassetteDerailleur(
  entrees: EntreesCompatibiliteCassetteDerailleur,
): ResultatCompatibiliteCassetteDerailleur {
  const erreurs = validerEntreesCompatibiliteCassetteDerailleur(entrees);
  if (Object.keys(erreurs).length > 0) {
    throw new Error(`Entrées invalides : ${Object.values(erreurs).join(' ')}`);
  }

  const { plateaux_dents, cassette_dents_min, cassette_dents_max, derailleur_id } = entrees;
  const derailleur = DERAILLEURS.find((d) => d.id === derailleur_id)!;

  const ecartPlateaux = Math.max(...plateaux_dents) - Math.min(...plateaux_dents);
  const ecartCassette = cassette_dents_max - cassette_dents_min;
  const capacite_necessaire_dents = ecartPlateaux + ecartCassette;

  const cog_ok = cassette_dents_max <= derailleur.cog_max_dents;
  const capacite_ok = capacite_necessaire_dents <= derailleur.capacite_totale_dents;

  return {
    derailleur,
    capacite_necessaire_dents,
    cog_ok,
    capacite_ok,
    compatible: cog_ok && capacite_ok,
  };
}
