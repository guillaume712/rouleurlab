// Métriques d'entraînement : NP (approximation rapide), IF, TSS, VI.
// Port PARTIEL et volontaire de metrics.py (moteur VéloPace de l'auteur) :
// - normalizedPowerFast : portée, c'est la seule variante utilisée par
//   is_feasible()/constant_power_feasible() (les deux fonctions dans le
//   périmètre de l'Étape 6) et par simulate_fast (régime permanent par
//   segment — le seul mode de simulation porté pour ce MVP).
// - normalized_power (NP officielle, moyenne mobile 30 s sur trace 1 Hz) :
//   NON portée. Elle n'a de sens que pour une trace de puissance à haute
//   résolution temporelle (issue de simulate(), l'intégration pas-à-pas —
//   également non portée pour ce MVP). simulate_fast() utilise toujours la
//   variante "fast" ci-dessous, y compris dans le Python source.
// - estimated_hr (fréquence cardiaque estimée) : NON portée. C'est un modèle
//   individuel (dérive cardiaque, FC repos/seuil/max propres à chaque
//   cycliste) qu'on ne peut pas valider sans données réelles de l'utilisateur ;
//   l'inclure avec des valeurs par défaut génériques donnerait un chiffre à
//   l'apparence précise mais trompeur. Voir la note affichée avec l'outil.
//
// Source des définitions NP/IF/TSS/VI : Coggan, A. & Allen, H., "Training and
// Racing with a Power Meter" (concepts largement adoptés dans l'écosystème
// cycliste, y compris francophone, sous leurs sigles anglais).

import type { Rider } from '@/types';

/**
 * Approximation de la puissance normalisée sans lissage 30 s :
 * (Σ t·P⁴ / Σ t)^¼.
 * Toujours >= NP réelle (inégalité de Jensen) : utilisée comme contrainte
 * conservatrice dans le solveur (rapide, pas de fenêtre glissante à recalculer).
 */
export function normalizedPowerFast(powersW: number[], durationsS: number[]): number {
  const tt = Math.max(
    durationsS.reduce((a, b) => a + b, 0),
    1e-9,
  );
  const sumTP4 = powersW.reduce((acc, p, i) => acc + durationsS[i] * p ** 4, 0);
  return (sumTP4 / tt) ** 0.25;
}

export interface TrainingMetrics {
  np_w: number;
  if_: number;
  tss: number;
  vi: number;
  avg_power_w: number;
  energy_kj: number;
}

/** Équivalent de training_metrics(..., fast=True) — seule variante utilisée
 *  par simulate_fast() dans le périmètre porté. */
export function trainingMetrics(powersW: number[], durationsS: number[], rider: Rider): TrainingMetrics {
  const npW = normalizedPowerFast(powersW, durationsS);
  const tTot = durationsS.reduce((a, b) => a + b, 0);
  const sumPT = powersW.reduce((acc, p, i) => acc + p * durationsS[i], 0);
  const pAvg = sumPT / Math.max(tTot, 1e-9);
  const if_ = npW / rider.ftp_w;
  return {
    np_w: npW,
    if_,
    tss: (tTot / 3600.0) * if_ ** 2 * 100.0,
    vi: npW / Math.max(pAvg, 1e-9),
    avg_power_w: pAvg,
    energy_kj: (pAvg * tTot) / 1000.0,
  };
}
