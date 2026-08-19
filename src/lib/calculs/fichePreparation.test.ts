import { describe, expect, it } from 'vitest';
import { calculerFiche, validerEntreesFiche, type EntreesFiche } from './fichePreparation';
import { calculerPlanPacing } from './pacing';
import { calculerNutrition } from './nutrition';

// fichePreparation.ts n'introduit aucune nouvelle formule physique ou
// nutritionnelle : c'est une orchestration de pacing.ts et nutrition.ts, déjà
// vérifiés indépendamment contre le moteur Python source (voir pacing.test.ts
// et nutrition.test.ts). Ce qu'on vérifie ici, c'est le branchement : que la
// fiche dérive bien la durée et l'IF nutrition du plan de puissance calculé,
// et gère correctement les cas hors plage.

const ENTREES_BASE: EntreesFiche = {
  poids_kg: 75.0,
  ftp_w: 250.0,
  niveau: 'intermediaire',
  type_pratique: 'route',
  masse_velo_kg: 8.0,
  temperature_c: 20.0,
  altitude_m: 0.0,
  vent_face_ms: 0.0,
  humidite_pourcent: 50.0,
  segments: [
    { distance_km: 3.0, pente_pourcent: 0.0 },
    { distance_km: 2.0, pente_pourcent: 8.0 },
    { distance_km: 4.0, pente_pourcent: -3.0 },
    { distance_km: 1.0, pente_pourcent: 2.0 },
  ],
};

describe('calculerFiche — dérivation durée/IF depuis le plan de puissance', () => {
  it('le volet pacing est identique à un appel direct de calculerPlanPacing', () => {
    const fiche = calculerFiche(ENTREES_BASE);
    const pacingDirect = calculerPlanPacing({
      poids_kg: ENTREES_BASE.poids_kg,
      ftp_w: ENTREES_BASE.ftp_w,
      type_pratique: ENTREES_BASE.type_pratique,
      segments: ENTREES_BASE.segments,
      masse_velo_kg: ENTREES_BASE.masse_velo_kg,
      temperature_c: ENTREES_BASE.temperature_c,
      altitude_m: ENTREES_BASE.altitude_m,
      vent_face_ms: ENTREES_BASE.vent_face_ms,
    });
    expect(fiche.pacing).toEqual(pacingDirect);
  });

  it('le volet nutrition utilise la durée et l’IF réels du plan de puissance (pas de valeurs par défaut arbitraires)', () => {
    const fiche = calculerFiche(ENTREES_BASE);
    const dureeMinAttendue = fiche.pacing.temps_total_s / 60;
    const nutritionAttendue = calculerNutrition({
      poids_kg: ENTREES_BASE.poids_kg,
      niveau: ENTREES_BASE.niveau,
      duree_min: dureeMinAttendue,
      intensite_if: fiche.pacing.if_,
      temperature_c: ENTREES_BASE.temperature_c!,
      humidite_pourcent: ENTREES_BASE.humidite_pourcent!,
    });
    expect(fiche.nutrition).toEqual(nutritionAttendue);
    expect(fiche.duree_nutrition_ajustee).toBe(false);
    expect(fiche.intensite_nutrition_ajustee).toBe(false);
  });

  it('ramène une durée très courte à la borne minimale du calcul nutrition (15 min) et le signale', () => {
    const fiche = calculerFiche({
      ...ENTREES_BASE,
      segments: [{ distance_km: 1.0, pente_pourcent: 0.0 }], // quelques minutes à peine
    });
    expect(fiche.pacing.temps_total_s / 60).toBeLessThan(15);
    expect(fiche.duree_nutrition_ajustee).toBe(true);

    const nutritionAttendue = calculerNutrition({
      poids_kg: ENTREES_BASE.poids_kg,
      niveau: ENTREES_BASE.niveau,
      duree_min: 15,
      intensite_if: fiche.pacing.if_,
      temperature_c: ENTREES_BASE.temperature_c!,
      humidite_pourcent: ENTREES_BASE.humidite_pourcent!,
    });
    expect(fiche.nutrition).toEqual(nutritionAttendue);
  });
});

describe('validerEntreesFiche', () => {
  it('reprend les erreurs de validerEntreesPacing (ex. FTP manquant)', () => {
    const erreurs = validerEntreesFiche({ poids_kg: 70, niveau: 'intermediaire', segments: ENTREES_BASE.segments });
    expect(erreurs.ftp_w).toBeDefined();
  });

  it('signale un niveau manquant', () => {
    const erreurs = validerEntreesFiche({ poids_kg: 70, ftp_w: 250, segments: ENTREES_BASE.segments });
    expect(erreurs.niveau).toBeDefined();
  });

  it('signale une humidité hors plage', () => {
    const erreurs = validerEntreesFiche({
      poids_kg: 70,
      ftp_w: 250,
      niveau: 'intermediaire',
      segments: ENTREES_BASE.segments,
      humidite_pourcent: 150,
    });
    expect(erreurs.humidite_pourcent).toBeDefined();
  });

  it('aucune erreur pour des entrées valides', () => {
    const erreurs = validerEntreesFiche(ENTREES_BASE);
    expect(Object.keys(erreurs)).toHaveLength(0);
  });
});
