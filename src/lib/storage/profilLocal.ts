// Persistance locale (navigateur) du profil et du garage.
// Étape 1 — aucune requête réseau, aucune dépendance à un compte.
// Toutes les fonctions sont défensives : une donnée localStorage corrompue
// ou absente retombe silencieusement sur des valeurs par défaut plausibles.

import type { NiveauCycliste, Profil, TypePratique, Velo } from '@/types';

const CLE_PROFIL = 'rouleurlab:profil';
const CLE_GARAGE = 'rouleurlab:garage';

const NIVEAUX: readonly NiveauCycliste[] = ['debutant', 'intermediaire', 'confirme', 'expert'];
const TYPES_PRATIQUE: readonly TypePratique[] = ['route', 'gravel', 'vtt', 'ville'];

// Plages plausibles utilisées pour la validation des formulaires ET des
// données relues depuis localStorage (au cas où un utilisateur les aurait
// modifiées manuellement via les devtools).
export const PLAGES = {
  poids_kg: { min: 30, max: 200 },
  ftp_w: { min: 30, max: 600 },
  plateaux_dents: { min: 20, max: 60 },
  cassette_dents: { min: 8, max: 52 },
  cassette_vitesses: { min: 6, max: 13 },
  longueur_hauban_mm: { min: 350, max: 500 },
  pneu_largeur_mm: { min: 18, max: 65 },
  jante_largeur_interne_mm: { min: 13, max: 35 },
} as const;

function localStorageDisponible(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch {
    return false;
  }
}

function horodatageActuel(): string {
  return new Date().toISOString();
}

export function genererId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Repli simple si crypto.randomUUID est indisponible (anciens navigateurs).
  return `velo-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getProfilParDefaut(): Profil {
  return {
    poids_kg: 70,
    niveau: 'intermediaire',
    ftp_w: null,
    mis_a_jour_le: horodatageActuel(),
  };
}

export function getVeloParDefaut(): Velo {
  return {
    id: genererId(),
    nom: 'Mon vélo',
    type_pratique: 'route',
    plateaux_dents: [50, 34],
    cassette_dents_min: 11,
    cassette_dents_max: 32,
    cassette_vitesses: 11,
    longueur_hauban_mm: 410,
    pneu_largeur_mm: 28,
    jante_largeur_interne_mm: 19,
    mis_a_jour_le: horodatageActuel(),
  };
}

function estNombreDansPlage(valeur: unknown, plage: { min: number; max: number }): boolean {
  return typeof valeur === 'number' && Number.isFinite(valeur) && valeur >= plage.min && valeur <= plage.max;
}

/** Valide un objet Profil potentiellement mal formé. Retourne les erreurs de champ (vide = valide). */
export function validerProfil(p: Partial<Profil>): Partial<Record<keyof Profil, string>> {
  const erreurs: Partial<Record<keyof Profil, string>> = {};

  if (!estNombreDansPlage(p.poids_kg, PLAGES.poids_kg)) {
    erreurs.poids_kg = `Le poids doit être compris entre ${PLAGES.poids_kg.min} et ${PLAGES.poids_kg.max} kg.`;
  }
  if (!p.niveau || !NIVEAUX.includes(p.niveau)) {
    erreurs.niveau = 'Niveau invalide.';
  }
  if (p.ftp_w !== null && p.ftp_w !== undefined && !estNombreDansPlage(p.ftp_w, PLAGES.ftp_w)) {
    erreurs.ftp_w = `Le FTP doit être compris entre ${PLAGES.ftp_w.min} et ${PLAGES.ftp_w.max} W (ou laissé vide).`;
  }

  return erreurs;
}

/** Valide un objet Velo potentiellement mal formé. Retourne les erreurs de champ (vide = valide). */
export function validerVelo(v: Partial<Velo>): Partial<Record<keyof Velo, string>> {
  const erreurs: Partial<Record<keyof Velo, string>> = {};

  if (!v.nom || v.nom.trim().length === 0) {
    erreurs.nom = 'Le nom du vélo est requis.';
  }
  if (!v.type_pratique || !TYPES_PRATIQUE.includes(v.type_pratique)) {
    erreurs.type_pratique = 'Type de pratique invalide.';
  }
  if (
    !Array.isArray(v.plateaux_dents) ||
    v.plateaux_dents.length === 0 ||
    v.plateaux_dents.some((d) => !estNombreDansPlage(d, PLAGES.plateaux_dents))
  ) {
    erreurs.plateaux_dents = `Chaque plateau doit être compris entre ${PLAGES.plateaux_dents.min} et ${PLAGES.plateaux_dents.max} dents.`;
  }
  if (!estNombreDansPlage(v.cassette_dents_min, PLAGES.cassette_dents)) {
    erreurs.cassette_dents_min = `Le petit pignon doit être compris entre ${PLAGES.cassette_dents.min} et ${PLAGES.cassette_dents.max} dents.`;
  }
  if (!estNombreDansPlage(v.cassette_dents_max, PLAGES.cassette_dents)) {
    erreurs.cassette_dents_max = `Le grand pignon doit être compris entre ${PLAGES.cassette_dents.min} et ${PLAGES.cassette_dents.max} dents.`;
  }
  if (
    typeof v.cassette_dents_min === 'number' &&
    typeof v.cassette_dents_max === 'number' &&
    v.cassette_dents_min >= v.cassette_dents_max
  ) {
    erreurs.cassette_dents_max = 'Le grand pignon doit avoir plus de dents que le petit pignon.';
  }
  if (!estNombreDansPlage(v.cassette_vitesses, PLAGES.cassette_vitesses)) {
    erreurs.cassette_vitesses = `Le nombre de vitesses doit être compris entre ${PLAGES.cassette_vitesses.min} et ${PLAGES.cassette_vitesses.max}.`;
  }
  if (!estNombreDansPlage(v.longueur_hauban_mm, PLAGES.longueur_hauban_mm)) {
    erreurs.longueur_hauban_mm = `Le hauban doit être compris entre ${PLAGES.longueur_hauban_mm.min} et ${PLAGES.longueur_hauban_mm.max} mm.`;
  }
  if (!estNombreDansPlage(v.pneu_largeur_mm, PLAGES.pneu_largeur_mm)) {
    erreurs.pneu_largeur_mm = `La largeur de pneu doit être comprise entre ${PLAGES.pneu_largeur_mm.min} et ${PLAGES.pneu_largeur_mm.max} mm.`;
  }
  if (!estNombreDansPlage(v.jante_largeur_interne_mm, PLAGES.jante_largeur_interne_mm)) {
    erreurs.jante_largeur_interne_mm = `La largeur interne de jante doit être comprise entre ${PLAGES.jante_largeur_interne_mm.min} et ${PLAGES.jante_largeur_interne_mm.max} mm.`;
  }

  return erreurs;
}

function estObjetValide(valeur: unknown): valeur is Record<string, unknown> {
  return typeof valeur === 'object' && valeur !== null;
}

/** Lit le profil sauvegardé. Retombe sur le profil par défaut si absent, corrompu ou invalide. */
export function getProfil(): Profil {
  if (!localStorageDisponible()) return getProfilParDefaut();

  const brut = window.localStorage.getItem(CLE_PROFIL);
  if (!brut) return getProfilParDefaut();

  try {
    const donnees: unknown = JSON.parse(brut);
    if (!estObjetValide(donnees)) return getProfilParDefaut();

    const candidat = donnees as Partial<Profil>;
    const erreurs = validerProfil(candidat);
    if (Object.keys(erreurs).length > 0) return getProfilParDefaut();

    return candidat as Profil;
  } catch {
    return getProfilParDefaut();
  }
}

/** Sauvegarde le profil. Ne fait rien (silencieusement) si localStorage est indisponible. */
export function sauvegarderProfil(profil: Profil): void {
  if (!localStorageDisponible()) return;
  const aEnregistrer: Profil = { ...profil, mis_a_jour_le: horodatageActuel() };
  window.localStorage.setItem(CLE_PROFIL, JSON.stringify(aEnregistrer));
}

/** Lit la liste des vélos du garage. Retombe sur un tableau vide si absent ou corrompu. */
export function getVelos(): Velo[] {
  if (!localStorageDisponible()) return [];

  const brut = window.localStorage.getItem(CLE_GARAGE);
  if (!brut) return [];

  try {
    const donnees: unknown = JSON.parse(brut);
    if (!Array.isArray(donnees)) return [];

    return donnees.filter((v): v is Velo => {
      if (!estObjetValide(v)) return false;
      return Object.keys(validerVelo(v as Partial<Velo>)).length === 0;
    });
  } catch {
    return [];
  }
}

export function getVelo(id: string): Velo | undefined {
  return getVelos().find((v) => v.id === id);
}

/** Ajoute ou met à jour (par id) un vélo dans le garage. */
export function sauvegarderVelo(velo: Velo): void {
  if (!localStorageDisponible()) return;
  const velos = getVelos();
  const aEnregistrer: Velo = { ...velo, mis_a_jour_le: horodatageActuel() };
  const index = velos.findIndex((v) => v.id === velo.id);

  if (index >= 0) {
    velos[index] = aEnregistrer;
  } else {
    velos.push(aEnregistrer);
  }

  window.localStorage.setItem(CLE_GARAGE, JSON.stringify(velos));
}

export function supprimerVelo(id: string): void {
  if (!localStorageDisponible()) return;
  const velos = getVelos().filter((v) => v.id !== id);
  window.localStorage.setItem(CLE_GARAGE, JSON.stringify(velos));
}
