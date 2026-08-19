import { describe, expect, it } from 'vitest';
import { wbalStep, wbalTrajectory } from './wbal';

// Valeurs de référence calculées en exécutant directement wbal.py (moteur
// VéloPace de l'auteur) via un script Python indépendant. CP = 260.4166...
// = 250 / 0.96 (FTP 250 W, cp_w non renseigné — voir models.py Rider.cp).

const CP = 260.4166666666667;
const W_PRIME = 20000.0;

describe('wbalStep — référence Python', () => {
  it('déplétion : 300 W (> CP) pendant 60 s depuis W\'bal plein', () => {
    expect(wbalStep(20000.0, 300.0, CP, W_PRIME, 60.0)).toBeCloseTo(17625.0, 6);
  });

  it('recouvrement : 150 W (< CP) pendant 120 s depuis W\'bal à 15000 J', () => {
    expect(wbalStep(15000.0, 150.0, CP, W_PRIME, 120.0)).toBeCloseTo(17422.19590014618, 5);
  });
});

describe('wbalTrajectory — référence Python (300W/60s, 150W/120s, 320W/30s)', () => {
  it('trajectoire en 3 points', () => {
    const traj = wbalTrajectory([300.0, 150.0, 320.0], [60.0, 120.0, 30.0], CP, W_PRIME);
    expect(traj[0]).toBeCloseTo(17625.0, 6);
    expect(traj[1]).toBeCloseTo(18775.543052569436, 4);
    expect(traj[2]).toBeCloseTo(16988.043052569436, 4);
  });
});
