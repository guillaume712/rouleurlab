import { describe, expect, it } from 'vitest';
import {
  LARGEUR_PNEU_MIN_HOOKLESS_MM,
  calculerCompatibilitePneuJante,
  validerEntreesCompatibilitePneuJante,
} from './compatibilitePneuJante';

describe('calculerCompatibilitePneuJante — points de repère vérifiés (source ETRTO)', () => {
  it('19 mm interne, pneu 28 mm (dans la plage documentée 23-32) -> recommandé', () => {
    const r = calculerCompatibilitePneuJante({
      largeur_jante_interne_mm: 19,
      largeur_pneu_mm: 28,
      type_jante: 'hooked',
    });
    expect(r.verdict).toBe('recommande');
    expect(r.plage_recommandee_mm).toEqual([23, 32]);
  });

  it('25 mm interne (jante gravel), pneu 45 mm (dans la plage documentée 32-50) -> recommandé', () => {
    const r = calculerCompatibilitePneuJante({
      largeur_jante_interne_mm: 25,
      largeur_pneu_mm: 45,
      type_jante: 'hooked',
    });
    expect(r.verdict).toBe('recommande');
    expect(r.plage_recommandee_mm).toEqual([32, 50]);
  });
});

describe('calculerCompatibilitePneuJante — interpolation (calculée à la main)', () => {
  // 20 mm interne est à mi-chemin entre les ancres 19 mm (23-32) et 21 mm (25-40) :
  // min = 23 + (25-23)*0.5 = 24 ; max = 32 + (40-32)*0.5 = 36.
  it('20 mm interne -> plage recommandée interpolée [24, 36]', () => {
    const r = calculerCompatibilitePneuJante({
      largeur_jante_interne_mm: 20,
      largeur_pneu_mm: 30,
      type_jante: 'hooked',
    });
    expect(r.plage_recommandee_mm).toEqual([24, 36]);
    expect(r.verdict).toBe('recommande');
  });

  it('20 mm interne, pneu 22 mm -> dans la plage tolérée [20, 40] mais pas recommandée', () => {
    const r = calculerCompatibilitePneuJante({
      largeur_jante_interne_mm: 20,
      largeur_pneu_mm: 22,
      type_jante: 'hooked',
    });
    expect(r.verdict).toBe('tolere');
    expect(r.plage_toleree_mm).toEqual([20, 40]);
  });

  it('20 mm interne, pneu 18 mm -> hors plage tolérée [20, 40] -> non recommandé', () => {
    const r = calculerCompatibilitePneuJante({
      largeur_jante_interne_mm: 20,
      largeur_pneu_mm: 18,
      type_jante: 'hooked',
    });
    expect(r.verdict).toBe('non_recommande');
  });
});

describe('calculerCompatibilitePneuJante — règle hookless (ISO/ETRTO, 29 mm minimum)', () => {
  it('jante hookless avec un pneu sous 29 mm -> non recommandé même si la largeur seule serait « recommandée »', () => {
    const r = calculerCompatibilitePneuJante({
      largeur_jante_interne_mm: 21,
      largeur_pneu_mm: 25, // dans la plage recommandée 25-40 pour une jante hooked
      type_jante: 'hookless',
    });
    expect(r.verdict).toBe('non_recommande');
    expect(r.regle_hookless_appliquee).toBe(true);
  });

  it('la même combinaison en jante hooked est recommandée (pas de règle hookless)', () => {
    const r = calculerCompatibilitePneuJante({
      largeur_jante_interne_mm: 21,
      largeur_pneu_mm: 25,
      type_jante: 'hooked',
    });
    expect(r.verdict).toBe('recommande');
    expect(r.regle_hookless_appliquee).toBe(false);
  });

  it('jante hookless avec un pneu au-dessus du minimum -> pas de blocage par la règle hookless', () => {
    const r = calculerCompatibilitePneuJante({
      largeur_jante_interne_mm: 25,
      largeur_pneu_mm: LARGEUR_PNEU_MIN_HOOKLESS_MM,
      type_jante: 'hookless',
    });
    expect(r.regle_hookless_appliquee).toBe(false);
  });
});

describe('calculerCompatibilitePneuJante — hors couverture', () => {
  it('largeur de jante en dehors des points de repère vérifiés (19-25 mm) -> hors_couverture, pas de plage inventée', () => {
    const r = calculerCompatibilitePneuJante({
      largeur_jante_interne_mm: 30,
      largeur_pneu_mm: 45,
      type_jante: 'hooked',
    });
    expect(r.verdict).toBe('hors_couverture');
    expect(r.plage_recommandee_mm).toBeUndefined();
  });
});

describe('validerEntreesCompatibilitePneuJante', () => {
  it('accepte des entrées valides', () => {
    const erreurs = validerEntreesCompatibilitePneuJante({
      largeur_jante_interne_mm: 21,
      largeur_pneu_mm: 32,
      type_jante: 'hooked',
    });
    expect(Object.keys(erreurs)).toHaveLength(0);
  });

  it('rejette un type de jante invalide', () => {
    const erreurs = validerEntreesCompatibilitePneuJante({
      largeur_jante_interne_mm: 21,
      largeur_pneu_mm: 32,
      // @ts-expect-error valeur volontairement invalide pour le test
      type_jante: 'autre',
    });
    expect(erreurs.type_jante).toBeDefined();
  });
});
