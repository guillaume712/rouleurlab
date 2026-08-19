// Modèle physique : densité de l'air, forces résistantes, vitesse stationnaire.
// Port direct de physics.py (moteur VéloPace de l'auteur), modèle de
// Martin et al. (1998) : P = [F_aero + F_roll + F_grav + F_acc] * v / eta.
// Source du modèle : Martin, J.C. et al. (1998), "Validation of a
// Mathematical Model for Road Cycling Power", Journal of Applied Biomechanics.
// Fonctions et constantes conservées à l'identique (mêmes noms, mêmes valeurs,
// mêmes formules) pour permettre une vérification directe contre la source
// Python — voir les tests physics.test.ts pour la comparaison chiffrée.

import type { Bike, Environment, Rider, Segment } from '@/types';

export const G = 9.80665; // m/s²
export const R_DRY = 287.058; // J/(kg·K) air sec
export const R_VAP = 461.495; // J/(kg·K) vapeur d'eau
export const P0_PA = 101_325.0; // pression standard au niveau de la mer
export const T0_K = 288.15;

export const V_FLOOR = 0.5; // m/s — plancher numérique (singularité P/v au départ)
export const V_CEIL = 40.0; // m/s — borne haute de recherche (144 km/h)

/** Pression de vapeur saturante (formule de Tetens), en Pa. */
export function saturationVaporPressurePa(tempC: number): number {
  return 610.78 * Math.exp((17.27 * tempC) / (tempC + 237.3));
}

/** Nivellement barométrique isotherme. */
export function pressureAtAltitudePa(altitudeM: number, p0Pa: number = P0_PA): number {
  return p0Pa * Math.exp((-G * 0.0289644 * altitudeM) / (8.31447 * T0_K));
}

/** Densité de l'air humide (CIPM simplifiée), en kg/m³. */
export function airDensity(
  tempC: number,
  pressurePa: number | null = null,
  humidity = 0.5,
  altitudeM = 0.0,
): number {
  const pPa = pressurePa ?? pressureAtAltitudePa(altitudeM);
  const tK = tempC + 273.15;
  const pVap = humidity * saturationVaporPressurePa(tempC);
  const pDry = pPa - pVap;
  return pDry / (R_DRY * tK) + pVap / (R_VAP * tK);
}

export function rhoForSegment(seg: Segment, env: Environment): number {
  const pPa = env.pressure_hpa !== null ? env.pressure_hpa * 100.0 : null;
  const alt = seg.altitude_m ? seg.altitude_m : env.altitude_m;
  return airDensity(env.temperature_c, pPa, env.humidity, alt);
}

/**
 * Composante de vent de face (>0 = vent contraire).
 * Convention météo : wind_dir = direction d'où VIENT le vent.
 * Vent du nord (0°) + cap au nord (0°) => plein vent de face.
 */
export function headwindMs(seg: Segment, env: Environment): number {
  const w = seg.wind_speed_ms ?? env.wind_speed_ms;
  const d = seg.wind_dir_deg ?? env.wind_dir_deg;
  return w * Math.cos(((d - seg.heading_deg) * Math.PI) / 180);
}

function sinTheta(seg: Segment): number {
  return seg.grade / Math.sqrt(1.0 + seg.grade ** 2);
}

function cosTheta(seg: Segment): number {
  return 1.0 / Math.sqrt(1.0 + seg.grade ** 2);
}

/** Somme des forces résistantes (N) à vitesse sol v (m/s). */
export function resistiveForce(
  v: number,
  headwind: number,
  rho: number,
  totalMass: number,
  seg: Segment,
  bike: Bike,
): number {
  const vAir = v + headwind;
  const fAero = 0.5 * rho * bike.cda * vAir * Math.abs(vAir);
  const fRoll = bike.crr * seg.crr_factor * totalMass * G * cosTheta(seg);
  const fGrav = totalMass * G * sinTheta(seg);
  return fAero + fRoll + fGrav;
}

/** Puissance pédale (W) requise pour tenir la vitesse v en régime permanent. */
export function powerRequired(v: number, seg: Segment, rider: Rider, bike: Bike, env: Environment): number {
  const m = rider.mass_kg + bike.mass_kg;
  const rho = rhoForSegment(seg, env);
  const hw = headwindMs(seg, env);
  return (resistiveForce(v, hw, rho, m, seg, bike) * v) / bike.drivetrain_eff;
}

/**
 * Vitesse stationnaire (m/s) pour une puissance donnée.
 * Résout eta*P = F_resist(v)*v par bissection robuste (la fonction est
 * strictement croissante en v pour v assez grand ; en descente, la solution
 * est la vitesse terminale).
 */
export function speedFromPower(powerW: number, seg: Segment, rider: Rider, bike: Bike, env: Environment): number {
  const m = rider.mass_kg + bike.mass_kg;
  const rho = rhoForSegment(seg, env);
  const hw = headwindMs(seg, env);
  const etaP = bike.drivetrain_eff * Math.max(powerW, 0.0);

  const f = (v: number): number => etaP - resistiveForce(v, hw, rho, m, seg, bike) * v;

  let lo = 1e-3;
  let hi = V_CEIL;
  if (f(hi) > 0) {
    // même à 144 km/h la puissance suffit (descente extrême)
    return hi;
  }
  if (f(lo) < 0) {
    // même à l'arrêt les forces dominent (montée, P trop faible)
    return V_FLOOR;
  }
  for (let i = 0; i < 80; i++) {
    const mid = 0.5 * (lo + hi);
    if (f(mid) > 0) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  let v = 0.5 * (lo + hi);
  if (seg.v_max_ms !== null) {
    v = Math.min(v, seg.v_max_ms);
  }
  return Math.max(v, V_FLOOR);
}

/** dv/dt (m/s²) pour l'intégration temporelle. Non utilisé par le MVP (pas de
 *  simulation à pas de temps, seulement le régime permanent par segment),
 *  mais porté pour rester fidèle à la source et disponible pour V2. */
export function accel(
  v: number,
  powerW: number,
  headwind: number,
  rho: number,
  rider: Rider,
  bike: Bike,
  seg: Segment,
): number {
  const m = rider.mass_kg + bike.mass_kg;
  const mEff = m * bike.wheel_inertia_factor;
  const vSafe = Math.max(v, V_FLOOR);
  const fProp = (bike.drivetrain_eff * powerW) / vSafe;
  return (fProp - resistiveForce(v, headwind, rho, m, seg, bike)) / mEff;
}
