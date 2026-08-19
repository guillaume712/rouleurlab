import { describe, expect, it } from 'vitest';
import type { Bike, Constraints, Environment, Rider, Segment } from '@/types';
import {
  calculerPlanPacing,
  constantPowerFeasible,
  cpEffective,
  simulerPlan,
  slopeModulatedInit,
  validerEntreesPacing,
} from './pacing';

// Valeurs de référence calculées en exécutant directement optimizer.py et
// simulator.py (moteur VéloPace de l'auteur, périmètre exact du portage
// Étape 6 : constant_power_feasible + slope_modulated_init + simulate_fast,
// sans solveurs avancés ni modèle de fatigue) via un script Python
// indépendant. C'est la comparaison la plus rigoureuse possible pour un
// portage : contre le moteur source réel, pas contre une formule recopiée.

const rider: Rider = { mass_kg: 75.0, ftp_w: 250.0, cp_w: null, w_prime_j: 20000.0 };
const bike: Bike = { mass_kg: 8.0, cda: 0.32, crr: 0.005, drivetrain_eff: 0.976, wheel_inertia_factor: 1.01 };
const env: Environment = {
  temperature_c: 20.0,
  pressure_hpa: null,
  humidity: 0.5,
  altitude_m: 0.0,
  wind_speed_ms: 0.0,
  wind_dir_deg: 0.0,
};
const constraints: Constraints = { if_max: 0.95, p_min_w: 0, p_max_w: null, w_prime_margin: 0.1 };
const segBase = { heading_deg: 0, altitude_m: 0, wind_speed_ms: null, wind_dir_deg: null, v_max_ms: null, crr_factor: 1.0 };
const segments: Segment[] = [
  { ...segBase, distance_m: 3000.0, grade: 0.0 },
  { ...segBase, distance_m: 2000.0, grade: 0.08 },
  { ...segBase, distance_m: 4000.0, grade: -0.03 },
  { ...segBase, distance_m: 1000.0, grade: 0.02 },
];

describe('cpEffective', () => {
  it('déduit CP de FTP/0.96 quand cp_w est null', () => {
    expect(cpEffective(rider)).toBeCloseTo(260.4166666666667, 6);
  });

  it('utilise cp_w directement quand renseigné', () => {
    expect(cpEffective({ ...rider, cp_w: 280 })).toBe(280);
  });
});

describe('constantPowerFeasible / slopeModulatedInit / simulerPlan — référence Python', () => {
  it('puissance constante maximale faisable', () => {
    const pConst = constantPowerFeasible(segments, rider, bike, env, constraints);
    expect(pConst).toBeCloseTo(237.73749999973006, 3);
  });

  it('plan modulé par pente puis simulation complète', () => {
    const pConst = constantPowerFeasible(segments, rider, bike, env, constraints);
    const plan = slopeModulatedInit(segments, rider, bike, env, constraints, pConst);

    expect(plan[0]).toBeCloseTo(196.25694289178713, 2);
    expect(plan[1]).toBeCloseTo(274.10187554718874, 2);
    expect(plan[2]).toBeCloseTo(164.46112532831327, 2);
    expect(plan[3]).toBeCloseTo(222.57072294431725, 2);

    const sim = simulerPlan(segments, plan, rider, bike, env, constraints);
    expect(sim.seg_time_s[0]).toBeCloseTo(322.9605849215997, 1);
    expect(sim.seg_time_s[1]).toBeCloseTo(535.5818863733045, 1);
    expect(sim.seg_time_s[2]).toBeCloseTo(306.61894761672033, 1);
    expect(sim.seg_time_s[3]).toBeCloseTo(139.21573636719089, 1);

    expect(sim.total_time_s).toBeCloseTo(1304.3771552788155, 1);
    expect(sim.avg_speed_ms).toBeCloseTo(7.666494280070753, 3);
    expect(sim.avg_power_w).toBeCloseTo(223.55459056889902, 2);
    expect(sim.np_w).toBeCloseTo(236.32136316159523, 2);
    expect(sim.if_).toBeCloseTo(0.9452854526463809, 3);
    expect(sim.tss).toBeCloseTo(32.37625650081163, 2);
    expect(sim.vi).toBeCloseTo(1.0571080761983347, 3);
    expect(sim.energy_kj).toBeCloseTo(291.5995008957808, 1);
    expect(sim.wbal_min_j).toBeCloseTo(12670.450012357298, 1);
    expect(sim.feasible).toBe(true);
  });
});

describe('calculerPlanPacing — API façade française (même scénario)', () => {
  it('retourne un résultat cohérent avec le portage bas niveau', () => {
    const resultat = calculerPlanPacing({
      poids_kg: 75.0,
      ftp_w: 250.0,
      type_pratique: 'route',
      masse_velo_kg: 8.0,
      temperature_c: 20.0,
      altitude_m: 0.0,
      vent_face_ms: 0.0,
      segments: [
        { distance_km: 3.0, pente_pourcent: 0.0 },
        { distance_km: 2.0, pente_pourcent: 8.0 },
        { distance_km: 4.0, pente_pourcent: -3.0 },
        { distance_km: 1.0, pente_pourcent: 2.0 },
      ],
    });

    expect(resultat.puissance_constante_max_w).toBe(238);
    expect(resultat.distance_totale_km).toBeCloseTo(10.0, 6);
    expect(resultat.temps_total_s).toBe(1304);
    expect(resultat.faisable).toBe(true);
    expect(resultat.if_).toBeCloseTo(0.945, 2);
    expect(resultat.segments).toHaveLength(4);
    expect(resultat.segments[1].puissance_w).toBeGreaterThan(resultat.segments[2].puissance_w); // plus de puissance en montée qu'en descente
  });
});

describe('validerEntreesPacing', () => {
  it('signale un FTP manquant', () => {
    const erreurs = validerEntreesPacing({ poids_kg: 70, segments: [{ distance_km: 1, pente_pourcent: 0 }] });
    expect(erreurs.ftp_w).toBeDefined();
  });

  it('signale une liste de tronçons vide', () => {
    const erreurs = validerEntreesPacing({ poids_kg: 70, ftp_w: 250, segments: [] });
    expect(erreurs.segments).toBeDefined();
  });

  it('aucune erreur pour des entrées valides', () => {
    const erreurs = validerEntreesPacing({
      poids_kg: 70,
      ftp_w: 250,
      segments: [{ distance_km: 10, pente_pourcent: 2 }],
    });
    expect(Object.keys(erreurs)).toHaveLength(0);
  });
});
