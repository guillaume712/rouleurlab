import { describe, expect, it } from 'vitest';
import type { Bike, Environment, Rider, Segment } from '@/types';
import { airDensity, pressureAtAltitudePa, saturationVaporPressurePa, speedFromPower } from './physics';

// Valeurs de référence calculées en exécutant directement le code source
// Python (physics.py, moteur VéloPace de l'auteur) via un script indépendant
// — pas de recopie manuelle de formule, comparaison directe avec la source
// portée. Voir le message de commit pour le script utilisé.

describe('saturationVaporPressurePa / pressureAtAltitudePa / airDensity — référence Python', () => {
  it('pression de vapeur saturante à 20°C', () => {
    expect(saturationVaporPressurePa(20.0)).toBeCloseTo(2338.2047063802643, 6);
  });

  it('pression au niveau de la mer (altitude 0)', () => {
    expect(pressureAtAltitudePa(0.0)).toBeCloseTo(101325.0, 6);
  });

  it('pression à 1500 m d’altitude', () => {
    expect(pressureAtAltitudePa(1500.0)).toBeCloseTo(84816.9750588114, 4);
  });

  it('densité de l’air à 20°C, niveau de la mer, humidité 50%', () => {
    expect(airDensity(20.0, null, 0.5, 0.0)).toBeCloseTo(1.1988334859595364, 8);
  });

  it('densité de l’air à 30°C, 500 m, humidité 70%', () => {
    expect(airDensity(30.0, null, 0.7, 500.0)).toBeCloseTo(1.0844484649590034, 8);
  });
});

describe('speedFromPower — référence Python (rider 75kg/250W FTP, vélo route 8kg)', () => {
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
  const segBase: Omit<Segment, 'distance_m' | 'grade'> = {
    heading_deg: 0,
    altitude_m: 0,
    wind_speed_ms: null,
    wind_dir_deg: null,
    v_max_ms: null,
    crr_factor: 1.0,
  };

  it('200 W en plat', () => {
    const seg: Segment = { ...segBase, distance_m: 10000.0, grade: 0.0 };
    expect(speedFromPower(200.0, seg, rider, bike, env)).toBeCloseTo(9.356605852212645, 6);
  });

  it('200 W en montée à 6%', () => {
    const seg: Segment = { ...segBase, distance_m: 5000.0, grade: 0.06 };
    expect(speedFromPower(200.0, seg, rider, bike, env)).toBeCloseTo(3.5356122569383874, 6);
  });

  it('200 W en descente à 5%', () => {
    const seg: Segment = { ...segBase, distance_m: 5000.0, grade: -0.05 };
    expect(speedFromPower(200.0, seg, rider, bike, env)).toBeCloseTo(15.953279611274858, 5);
  });

  it('300 W en plat (vitesse plus élevée)', () => {
    const seg: Segment = { ...segBase, distance_m: 10000.0, grade: 0.0 };
    expect(speedFromPower(300.0, seg, rider, bike, env)).toBeCloseTo(10.900493614122052, 6);
  });
});
