import { describe, expect, it } from 'vitest';
import type { Rider } from '@/types';
import { normalizedPowerFast, trainingMetrics } from './metrics';

// Valeurs de référence calculées en exécutant directement metrics.py (moteur
// VéloPace de l'auteur) via un script Python indépendant.

describe('normalizedPowerFast / trainingMetrics — référence Python', () => {
  const rider: Rider = { mass_kg: 75.0, ftp_w: 250.0, cp_w: null, w_prime_j: 20000.0 };
  const powers = [200.0, 300.0, 250.0];
  const durations = [600.0, 300.0, 900.0];

  it('NP rapide (approximation Jensen)', () => {
    expect(normalizedPowerFast(powers, durations)).toBeCloseTo(248.87577272025513, 5);
  });

  it('métriques d’entraînement complètes', () => {
    const m = trainingMetrics(powers, durations, rider);
    expect(m.np_w).toBeCloseTo(248.87577272025513, 5);
    expect(m.if_).toBeCloseTo(0.9955030908810205, 6);
    expect(m.tss).toBeCloseTo(49.55132019768327, 4);
    expect(m.vi).toBeCloseTo(1.0298307836700213, 6);
    expect(m.avg_power_w).toBeCloseTo(241.66666666666666, 6);
    expect(m.energy_kj).toBeCloseTo(435.0, 6);
  });
});
