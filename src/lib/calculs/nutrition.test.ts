import { describe, expect, it } from 'vitest';
import {
  calculerNutrition,
  estimationTauxSudationMlParH,
  glucidesTotalCible,
  recommandationGlucidesParHeure,
  recommandationLiquideMlParH,
  recommandationSodiumMgParH,
  validerEntreesNutrition,
} from './nutrition';

// Valeurs de référence calculées en exécutant directement carbs.py,
// hydration.py et electrolytes.py (moteur RaceFuelPlanner de l'auteur) via
// un script Python indépendant.

describe('recommandationGlucidesParHeure / glucidesTotalCible — référence Python', () => {
  const cas: [number, number, 'debutant' | 'intermediaire' | 'confirme' | 'expert', number, number, number][] = [
    [45, 0.7, 'debutant', 20.0, 30, 22],
    [90, 0.75, 'intermediaire', 20.0, 55, 82],
    [150, 0.8, 'confirme', 20.0, 75, 188],
    [240, 0.75, 'expert', 32.0, 85, 340],
    [600, 0.65, 'expert', 36.0, 90, 900],
    [30, 0.6, 'debutant', 20.0, 30, 15],
  ];

  it.each(cas)(
    'durée=%i if=%s niveau=%s temp=%s => %i g/h, %i g total',
    (dureeMin, if_, niveau, temp, attenduParH, attenduTotal) => {
      const parH = recommandationGlucidesParHeure(dureeMin, if_, niveau, temp);
      expect(parH).toBe(attenduParH);
      expect(glucidesTotalCible(dureeMin, parH)).toBe(attenduTotal);
    },
  );
});

describe('estimationTauxSudationMlParH / recommandationLiquideMlParH — référence Python', () => {
  const cas: [number, number, number, number, number, number][] = [
    [70, 20.0, 50.0, 0.75, 693.0560000000002, 600],
    [70, 30.0, 70.0, 0.8, 1184.4149333333335, 1000],
    [70, 35.0, 70.0, 0.85, 1435.869866666667, 1200],
    [60, 15.0, 40.0, 0.6, 459.0, 400],
    [90, 38.0, 80.0, 0.9, 2147.508, 1200],
  ];

  it.each(cas)('poids=%i temp=%s humidite=%s if=%s => sueur %s ml/h, liquide %i ml/h', (poids, temp, hum, if_, sueurAttendue, liquideAttendu) => {
    expect(estimationTauxSudationMlParH(poids, temp, hum, if_)).toBeCloseTo(sueurAttendue, 4);
    expect(recommandationLiquideMlParH(poids, temp, hum, if_)).toBe(liquideAttendu);
  });
});

describe('recommandationSodiumMgParH — référence Python', () => {
  const cas: [number, number, number, number][] = [
    [700, 20.0, 90, 350],
    [700, 28.0, 90, 500],
    [900, 33.0, 90, 800],
    [750, 30.0, 300, 600],
  ];

  it.each(cas)('liquide=%i temp=%s durée=%i => %i mg/h', (fluide, temp, duree, attendu) => {
    expect(recommandationSodiumMgParH(fluide, temp, duree)).toBe(attendu);
  });
});

describe('calculerNutrition — orchestration complète', () => {
  it('enchaîne glucides, hydratation, sodium avec des totaux cohérents', () => {
    const resultat = calculerNutrition({
      poids_kg: 70,
      niveau: 'intermediaire',
      duree_min: 90,
      intensite_if: 0.75,
      temperature_c: 20.0,
      humidite_pourcent: 50.0,
    });

    expect(resultat.glucides_g_par_h).toBe(55);
    expect(resultat.glucides_total_g).toBe(82);
    expect(resultat.liquide_ml_par_h).toBe(600);
    expect(resultat.liquide_total_ml).toBe(900); // 600 ml/h * 1.5 h
    expect(resultat.sodium_mg_par_h).toBe(300); // concentration 500 mg/L (temp < 26°C) * 0.6 L/h
    expect(resultat.sodium_total_mg).toBe(450); // 300 mg/h * 1.5 h
  });
});

describe('validerEntreesNutrition', () => {
  it('signale une durée hors plage', () => {
    const erreurs = validerEntreesNutrition({
      poids_kg: 70,
      niveau: 'intermediaire',
      duree_min: 5,
      intensite_if: 0.75,
      temperature_c: 20,
      humidite_pourcent: 50,
    });
    expect(erreurs.duree_min).toBeDefined();
  });

  it('aucune erreur pour des entrées valides', () => {
    const erreurs = validerEntreesNutrition({
      poids_kg: 70,
      niveau: 'intermediaire',
      duree_min: 90,
      intensite_if: 0.75,
      temperature_c: 20,
      humidite_pourcent: 50,
    });
    expect(Object.keys(erreurs)).toHaveLength(0);
  });
});
