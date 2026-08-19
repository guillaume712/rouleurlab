// W'balance — modèle de Skiba (forme différentielle, exacte par morceaux).
// Port direct de wbal.py (moteur VéloPace de l'auteur).
// Source du modèle : Skiba, P.F. et al. (2012), "Modeling the expenditure and
// reconstitution of work capacity above critical power", Medicine & Science
// in Sports & Exercise.
//
// Au-dessus de CP :  dW'/dt = -(P - CP)                   (déplétion linéaire)
// Sous CP        :  dW'/dt = (W'0 - W'bal)(CP - P)/W'0     (recouvrement exponentiel)
//
// Les deux formes admettent une solution fermée à puissance constante, ce qui
// permet un calcul exact segment par segment sans pas de temps.

/** W'bal après dt secondes à puissance constante (solution fermée). */
export function wbalStep(wbal: number, powerW: number, cpW: number, wPrimeJ: number, dtS: number): number {
  let next: number;
  if (powerW > cpW) {
    next = wbal - (powerW - cpW) * dtS;
  } else {
    const deficit = wPrimeJ - wbal;
    next = wPrimeJ - deficit * Math.exp((-(cpW - powerW) * dtS) / wPrimeJ);
  }
  return Math.min(Math.max(next, -wPrimeJ), wPrimeJ); // borne numérique
}

/** W'bal en fin de chaque tronçon (puissance constante par tronçon). */
export function wbalTrajectory(
  powersW: number[],
  durationsS: number[],
  cpW: number,
  wPrimeJ: number,
  wbal0: number | null = null,
): number[] {
  let wbal = wbal0 === null ? wPrimeJ : wbal0;
  const out: number[] = [];
  for (let i = 0; i < powersW.length; i++) {
    wbal = wbalStep(wbal, powersW[i], cpW, wPrimeJ, durationsS[i]);
    out.push(wbal);
  }
  return out;
}
