import { describe, expect, it } from 'vitest';
import { calculerLongueurChaine, validerEntreesLongueurChaine } from './longueurChaine';

describe('calculerLongueurChaine — cas de référence', () => {
  // Valeurs recalculées indépendamment à la main (voir vérification manuelle
  // dans le commit) à partir de la formule sourcée : maillons = 2*bases/12,7
  // + (plateau_max + cassette_max)/2 + 2, arrondi au pair supérieur.

  it('route double plateau, cassette 11-32 (bases 410 mm)', () => {
    const resultat = calculerLongueurChaine({
      longueur_hauban_mm: 410,
      plateaux_dents: [50, 34],
      cassette_dents_max: 32,
    });
    expect(resultat.nombre_maillons).toBe(108);
    expect(resultat.longueur_mm).toBeCloseTo(1371.6, 1);
    expect(resultat.ajustement_mono_plateau).toBe(false);
  });

  it('route double plateau, cassette 11-28 (bases 405 mm)', () => {
    const resultat = calculerLongueurChaine({
      longueur_hauban_mm: 405,
      plateaux_dents: [50, 34],
      cassette_dents_max: 28,
    });
    expect(resultat.nombre_maillons).toBe(106);
    expect(resultat.longueur_mm).toBeCloseTo(1346.2, 1);
    expect(resultat.ajustement_mono_plateau).toBe(false);
  });

  it('gravel mono-plateau 42T, cassette 10-51 (bases 425 mm) : ajustement appliqué', () => {
    const resultat = calculerLongueurChaine({
      longueur_hauban_mm: 425,
      plateaux_dents: [42],
      cassette_dents_max: 51,
    });
    expect(resultat.nombre_maillons).toBe(118);
    expect(resultat.longueur_mm).toBeCloseTo(1498.6, 1);
    expect(resultat.ajustement_mono_plateau).toBe(true);
  });

  it('VTT mono-plateau 32T, cassette 10-50 (bases 435 mm) : ajustement appliqué', () => {
    const resultat = calculerLongueurChaine({
      longueur_hauban_mm: 435,
      plateaux_dents: [32],
      cassette_dents_max: 50,
    });
    expect(resultat.nombre_maillons).toBe(114);
    expect(resultat.longueur_mm).toBeCloseTo(1447.8, 1);
    expect(resultat.ajustement_mono_plateau).toBe(true);
  });
});

describe('calculerLongueurChaine — comportement', () => {
  it('retient uniquement le plus grand plateau pour le calcul', () => {
    const avecDeux = calculerLongueurChaine({
      longueur_hauban_mm: 410,
      plateaux_dents: [50, 34],
      cassette_dents_max: 32,
    });
    const avecUnSeul = calculerLongueurChaine({
      longueur_hauban_mm: 410,
      plateaux_dents: [50],
      cassette_dents_max: 32,
    });
    // Même plateau max (50) et cassette max < 42 : pas d'ajustement mono-plateau,
    // donc même résultat.
    expect(avecUnSeul.nombre_maillons).toBe(avecDeux.nombre_maillons);
  });

  it('le résultat est toujours un nombre pair de maillons', () => {
    for (let cassette = 28; cassette <= 34; cassette++) {
      const resultat = calculerLongueurChaine({
        longueur_hauban_mm: 415,
        plateaux_dents: [46, 30],
        cassette_dents_max: cassette,
      });
      expect(resultat.nombre_maillons % 2).toBe(0);
    }
  });

  it('n’applique pas l’ajustement mono-plateau sous le seuil de 42 dents', () => {
    const resultat = calculerLongueurChaine({
      longueur_hauban_mm: 420,
      plateaux_dents: [40],
      cassette_dents_max: 41,
    });
    expect(resultat.ajustement_mono_plateau).toBe(false);
  });

  it('lève une erreur sur des entrées hors plage', () => {
    expect(() =>
      calculerLongueurChaine({ longueur_hauban_mm: 9999, plateaux_dents: [50], cassette_dents_max: 32 }),
    ).toThrow();
  });
});

describe('validerEntreesLongueurChaine', () => {
  it('accepte des entrées valides sans erreur', () => {
    const erreurs = validerEntreesLongueurChaine({
      longueur_hauban_mm: 410,
      plateaux_dents: [50, 34],
      cassette_dents_max: 32,
    });
    expect(Object.keys(erreurs)).toHaveLength(0);
  });

  it('rejette un tableau de plateaux vide', () => {
    const erreurs = validerEntreesLongueurChaine({
      longueur_hauban_mm: 410,
      plateaux_dents: [],
      cassette_dents_max: 32,
    });
    expect(erreurs.plateaux_dents).toBeDefined();
  });
});
