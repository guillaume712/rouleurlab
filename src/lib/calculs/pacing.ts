// Outil "Plan de puissance" (pacing) — Étape 6 du plan de développement.
//
// Port des deux fonctions du solveur VéloPace explicitement dans le périmètre
// du MVP : constant_power_feasible() et slope_modulated_init() (optimizer.py),
// plus la logique de faisabilité minimale dont elles dépendent (is_feasible(),
// via normalizedPowerFast et une trajectoire W'balance). Les solveurs avancés
// (SLSQP, programmation dynamique, algorithme génétique, recuit simulé,
// Monte Carlo) et le modèle de fatigue/durabilité ne sont PAS portés :
//
// - Fatigue/durabilité : le code source (fatigue.py) est un no-op quand
//   `rider.fatigue is None`, ce qui est le défaut implicite du moteur. Le
//   portage sans ce modèle est donc rigoureusement équivalent au comportement
//   par défaut de VéloPace, pas une simplification qui changerait le résultat.
// - Solveurs avancés : `constant_power_feasible` (puissance constante
//   maximale faisable) suivi de `slope_modulated_init` (heuristique de Gordon :
//   monter la puissance dans les pentes, la baisser dans le plat/descente,
//   ramené dans le domaine faisable) donne déjà un plan de puissance réaliste
//   et exploitable. Les solveurs d'optimisation fine (gain de quelques
//   dizaines de secondes sur un plan déjà faisable) sont hors périmètre MVP.
//
// Modèle physique : physics.ts (Martin et al. 1998). Modèle W'balance :
// wbal.ts (Skiba et al. 2012).

import type { Bike, Constraints, Environment, Rider, Segment, SimResult } from '@/types';
import type { TypePratique } from '@/types';
import { speedFromPower } from './physics';
import { wbalTrajectory } from './wbal';
import { normalizedPowerFast, trainingMetrics } from './metrics';
import { PLAGES } from '@/lib/storage/profilLocal';

// --------------------------------------------------------------- constantes

/** Puissance critique effective — port de la propriété Rider.cp de models.py. */
export function cpEffective(rider: Rider): number {
  return rider.cp_w ?? rider.ftp_w / 0.96;
}

/** Bornes de puissance — port de Constraints.p_bounds() de models.py. */
export function pBounds(constraints: Constraints, rider: Rider): [number, number] {
  const hi = constraints.p_max_w ?? 1.5 * rider.ftp_w;
  return [constraints.p_min_w, hi];
}

/** Contraintes par défaut — mêmes valeurs que Constraints() dans models.py.
 *  Non exposées à l'utilisateur dans ce MVP (voir "Sources et limites" de
 *  la page outil) : IF max 95 % FTP et 10 % de W' préservés en tout point,
 *  des repères prudents et largement utilisés pour un objectif "terminer
 *  fort", pas des valeurs individualisées. */
export const CONTRAINTES_PAR_DEFAUT: Constraints = {
  if_max: 0.95,
  p_min_w: 0,
  p_max_w: null,
  w_prime_margin: 0.1,
};

/** W' par défaut (joules) — même valeur que Rider.w_prime_j dans models.py.
 *  C'est une moyenne plausible pour un cycliste entraîné ; la valeur réelle
 *  varie beaucoup d'un individu à l'autre (typiquement 15 000 à 30 000 J) et
 *  n'est fiable que mesurée (test de puissance critique). Éditable dans le
 *  formulaire, avec cet avertissement affiché. */
export const W_PRIME_PAR_DEFAUT_J = 20_000;

/**
 * Paramètres vélo/aéro par défaut selon le type de pratique.
 *
 * Crr (résistance au roulement) :
 * - route : 0.005 — dans la plage 0.002–0.007 documentée pour des pneus route
 *   sur asphalte (Best Bike Split, "Rolling Resistance in Cycling &
 *   Triathlon", consulté le 19/08/2026), cohérente avec la plage 0.003–0.005
 *   mesurée sur pistes extérieures béton/asphalte (Velodrome.shop,
 *   "Coefficient of Rolling Resistance (Crr) in Track Cycling", consulté le
 *   19/08/2026).
 * - vtt : 0.020 — plage gravier très dégradé "proche des pistes VTT" selon
 *   les tests Chung Method de John Karrasch (johnkarrasch.com, "Gravel and
 *   mtb tires… what is fastest and why?", consulté le 19/08/2026).
 * - gravel : 0.010 — ESTIMATION interpolée entre route et VTT (pas de valeur
 *   directement mesurée trouvée pour un revêtement gravier "roulant"
 *   intermédiaire) ; à prendre comme un ordre de grandeur, pas une mesure.
 * - ville : 0.007 — ESTIMATION, légèrement au-dessus d'un pneu route
 *   d'entraînement (0.006, Continental Gatorskin, source Best Bike Split
 *   ci-dessus) pour refléter des revêtements urbains plus irréguliers.
 *
 * CdA (traînée aérodynamique × surface frontale, m²) :
 * - route : 0.32 — milieu de la plage 0.30–0.35 m² documentée pour une
 *   position route mains sur cocottes (AeroX, "CdA in cycling: definition,
 *   values and performance impact", consulté le 19/08/2026).
 * - ville : 0.45 — milieu de la plage 0.40–0.50 m² documentée pour une
 *   position vélo de ville droite (même source AeroX).
 * - gravel : 0.35, vtt : 0.40 — ESTIMATIONS (position plus droite, cintre
 *   plus large ; aucune valeur mesurée trouvée dans les sources consultées),
 *   positionnées entre route et ville par cohérence de posture.
 */
export const DEFAUTS_VELO_PAR_PRATIQUE: Record<TypePratique, Pick<Bike, 'mass_kg' | 'cda' | 'crr'>> = {
  route: { mass_kg: 8.0, cda: 0.32, crr: 0.005 },
  gravel: { mass_kg: 9.5, cda: 0.35, crr: 0.01 },
  vtt: { mass_kg: 12.5, cda: 0.4, crr: 0.02 },
  ville: { mass_kg: 14.0, cda: 0.45, crr: 0.007 },
};

/** Rendement de transmission et facteur d'inertie des roues — mêmes valeurs
 *  par défaut que Bike() dans models.py, considérées comme constantes
 *  physiques peu variables entre types de pratique (non retunées ici). */
const DRIVETRAIN_EFF = 0.976;
const WHEEL_INERTIA_FACTOR = 1.01;

export function construireVelo(typePratique: TypePratique, masseVeloKgPersonnalisee?: number): Bike {
  const defauts = DEFAUTS_VELO_PAR_PRATIQUE[typePratique];
  return {
    mass_kg: masseVeloKgPersonnalisee ?? defauts.mass_kg,
    cda: defauts.cda,
    crr: defauts.crr,
    drivetrain_eff: DRIVETRAIN_EFF,
    wheel_inertia_factor: WHEEL_INERTIA_FACTOR,
  };
}

// ----------------------------------------------------- évaluation faisabilité

function tempsSegments(segments: Segment[], powersW: number[], rider: Rider, bike: Bike, env: Environment): number[] {
  return segments.map((seg, i) => seg.distance_m / speedFromPower(powersW[i], seg, rider, bike, env));
}

/** Port de _Evaluator.is_feasible() (optimizer.py), sans le modèle de
 *  fatigue (voir justification en tête de fichier : no-op par défaut). */
function estFaisable(
  segments: Segment[],
  powersW: number[],
  rider: Rider,
  bike: Bike,
  env: Environment,
  constraints: Constraints,
): boolean {
  const temps = tempsSegments(segments, powersW, rider, bike, env);
  const npCap = constraints.if_max * rider.ftp_w;
  const wFloor = constraints.w_prime_margin * rider.w_prime_j;

  const npW = normalizedPowerFast(powersW, temps);
  if (npW > npCap * 1.001) return false;

  const traj = wbalTrajectory(powersW, temps, cpEffective(rider), rider.w_prime_j);
  const wMin = traj.length > 0 ? Math.min(...traj) : rider.w_prime_j;
  return wMin >= wFloor - 1.0;
}

/** Port de constant_power_feasible() (optimizer.py) : plus haute puissance
 *  constante faisable, par bissection sur NP et W'. */
export function constantPowerFeasible(
  segments: Segment[],
  rider: Rider,
  bike: Bike,
  env: Environment,
  constraints: Constraints,
): number {
  let [lo, hi] = pBounds(constraints, rider);
  lo = Math.max(lo, 30.0);
  const n = segments.length;
  for (let i = 0; i < 40; i++) {
    const mid = 0.5 * (lo + hi);
    const powers = new Array(n).fill(mid);
    if (estFaisable(segments, powers, rider, bike, env, constraints)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return lo;
}

/** Port de slope_modulated_init() (optimizer.py) : heuristique de Gordon —
 *  monter la puissance quand la pente augmente, la baisser sinon, puis
 *  ramener le plan dans le domaine faisable par homothétie si besoin. */
export function slopeModulatedInit(
  segments: Segment[],
  rider: Rider,
  bike: Bike,
  env: Environment,
  constraints: Constraints,
  pBase: number,
  gain = 600.0,
): number[] {
  const grades = segments.map((s) => s.grade);
  const moyenneGrade = grades.reduce((a, b) => a + b, 0) / grades.length;
  const [lo, hi] = pBounds(constraints, rider);

  let p = grades.map((g) => {
    const facteur = Math.min(Math.max((gain * (g - moyenneGrade)) / 100.0, -0.25), 0.25);
    const valeur = pBase * (1.0 + facteur);
    return Math.min(Math.max(valeur, lo), hi);
  });

  for (let i = 0; i < 30; i++) {
    if (estFaisable(segments, p, rider, bike, env, constraints)) break;
    p = p.map((x) => x * 0.98);
  }
  return p;
}

/** Port de simulate_fast() + _finalize() (simulator.py), sans fatigue ni FC
 *  estimée (voir en tête de fichier et metrics.ts pour les justifications). */
export function simulerPlan(
  segments: Segment[],
  powersW: number[],
  rider: Rider,
  bike: Bike,
  env: Environment,
  constraints: Constraints,
): SimResult {
  const cp = cpEffective(rider);
  const seg_speed_ms = segments.map((seg, i) => speedFromPower(powersW[i], seg, rider, bike, env));
  const seg_time_s = segments.map((seg, i) => seg.distance_m / seg_speed_ms[i]);
  const seg_power_w = [...powersW];
  const seg_wbal_j = wbalTrajectory(seg_power_w, seg_time_s, cp, rider.w_prime_j);

  const m = trainingMetrics(seg_power_w, seg_time_s, rider);
  const total_time_s = seg_time_s.reduce((a, b) => a + b, 0);
  const distance_m = segments.reduce((a, s) => a + s.distance_m, 0);
  const wbal_min_j = seg_wbal_j.length > 0 ? Math.min(...seg_wbal_j) : rider.w_prime_j;

  const feasible =
    m.if_ <= constraints.if_max + 1e-6 && wbal_min_j >= constraints.w_prime_margin * rider.w_prime_j - 1e-6;

  return {
    seg_time_s,
    seg_speed_ms,
    seg_power_w,
    seg_wbal_j,
    total_time_s,
    distance_m,
    avg_speed_ms: distance_m / Math.max(total_time_s, 1e-9),
    avg_power_w: m.avg_power_w,
    np_w: m.np_w,
    if_: m.if_,
    tss: m.tss,
    vi: m.vi,
    energy_kj: m.energy_kj,
    wbal_min_j,
    feasible,
  };
}

// ------------------------------------------------------- frontière française

export interface EntreeSegmentPacing {
  /** Longueur du tronçon, en km. */
  distance_km: number;
  /** Pente moyenne du tronçon, en % (5 = 5 %, -3 = descente à 3 %). */
  pente_pourcent: number;
}

export interface EntreesPacing {
  poids_kg: number;
  ftp_w: number;
  type_pratique: TypePratique;
  segments: EntreeSegmentPacing[];
  /** W' en joules. Optionnel : W_PRIME_PAR_DEFAUT_J si non renseigné. */
  w_prime_j?: number;
  /** Masse du vélo en kg. Optionnel : valeur par défaut du type de pratique. */
  masse_velo_kg?: number;
  temperature_c?: number;
  altitude_m?: number;
  /** Vent, en m/s : positif = de face, négatif = dans le dos. */
  vent_face_ms?: number;
}

export interface ResultatSegmentPacing {
  distance_km: number;
  pente_pourcent: number;
  puissance_w: number;
  vitesse_kmh: number;
  temps_s: number;
  wbal_fin_kj: number;
}

export interface ResultatPacing {
  /** Puissance constante maximale faisable sur tout le parcours (repère). */
  puissance_constante_max_w: number;
  segments: ResultatSegmentPacing[];
  temps_total_s: number;
  distance_totale_km: number;
  vitesse_moyenne_kmh: number;
  puissance_moyenne_w: number;
  np_w: number;
  if_: number;
  tss: number;
  vi: number;
  energie_kj: number;
  wbal_min_kj: number;
  faisable: boolean;
}

const PLAGE_DISTANCE_SEGMENT_KM = { min: 0.05, max: 250 };
const PLAGE_PENTE_POURCENT = { min: -25, max: 25 };
const PLAGE_TEMPERATURE_C = { min: -20, max: 50 };
const PLAGE_ALTITUDE_M = { min: 0, max: 5000 };
const PLAGE_VENT_MS = { min: -15, max: 15 };
const PLAGE_W_PRIME_J = { min: 5_000, max: 40_000 };
const PLAGE_MASSE_VELO_KG = { min: 5, max: 25 };

function estNombreDansPlage(valeur: unknown, plage: { min: number; max: number }): boolean {
  return typeof valeur === 'number' && Number.isFinite(valeur) && valeur >= plage.min && valeur <= plage.max;
}

export function validerEntreesPacing(entrees: Partial<EntreesPacing>): Partial<Record<string, string>> {
  const erreurs: Partial<Record<string, string>> = {};

  if (!estNombreDansPlage(entrees.poids_kg, PLAGES.poids_kg)) {
    erreurs.poids_kg = `Le poids doit être compris entre ${PLAGES.poids_kg.min} et ${PLAGES.poids_kg.max} kg.`;
  }
  if (!estNombreDansPlage(entrees.ftp_w, PLAGES.ftp_w)) {
    erreurs.ftp_w = `Le FTP doit être compris entre ${PLAGES.ftp_w.min} et ${PLAGES.ftp_w.max} W — indispensable pour ce calcul.`;
  }
  if (!entrees.segments || entrees.segments.length === 0) {
    erreurs.segments = 'Importez le fichier GPX de votre parcours.';
  } else {
    const segmentInvalide = entrees.segments.some(
      (s) =>
        !estNombreDansPlage(s.distance_km, PLAGE_DISTANCE_SEGMENT_KM) ||
        !estNombreDansPlage(s.pente_pourcent, PLAGE_PENTE_POURCENT),
    );
    if (segmentInvalide) {
      erreurs.segments = `Chaque tronçon doit avoir une distance entre ${PLAGE_DISTANCE_SEGMENT_KM.min} et ${PLAGE_DISTANCE_SEGMENT_KM.max} km et une pente entre ${PLAGE_PENTE_POURCENT.min} et ${PLAGE_PENTE_POURCENT.max} %.`;
    }
  }
  if (entrees.w_prime_j !== undefined && !estNombreDansPlage(entrees.w_prime_j, PLAGE_W_PRIME_J)) {
    erreurs.w_prime_j = `W' doit être compris entre ${PLAGE_W_PRIME_J.min} et ${PLAGE_W_PRIME_J.max} J (ou laissé vide).`;
  }
  if (entrees.masse_velo_kg !== undefined && !estNombreDansPlage(entrees.masse_velo_kg, PLAGE_MASSE_VELO_KG)) {
    erreurs.masse_velo_kg = `La masse du vélo doit être comprise entre ${PLAGE_MASSE_VELO_KG.min} et ${PLAGE_MASSE_VELO_KG.max} kg (ou laissée vide).`;
  }
  if (entrees.temperature_c !== undefined && !estNombreDansPlage(entrees.temperature_c, PLAGE_TEMPERATURE_C)) {
    erreurs.temperature_c = `La température doit être comprise entre ${PLAGE_TEMPERATURE_C.min} et ${PLAGE_TEMPERATURE_C.max} °C.`;
  }
  if (entrees.altitude_m !== undefined && !estNombreDansPlage(entrees.altitude_m, PLAGE_ALTITUDE_M)) {
    erreurs.altitude_m = `L'altitude doit être comprise entre ${PLAGE_ALTITUDE_M.min} et ${PLAGE_ALTITUDE_M.max} m.`;
  }
  if (entrees.vent_face_ms !== undefined && !estNombreDansPlage(entrees.vent_face_ms, PLAGE_VENT_MS)) {
    erreurs.vent_face_ms = `Le vent doit être compris entre ${PLAGE_VENT_MS.min} et ${PLAGE_VENT_MS.max} m/s.`;
  }

  return erreurs;
}

/** Construit un Segment[] du moteur à partir des tronçons saisis. Le cap
 *  (heading_deg) est fixé à 0° pour tous les tronçons et le vent réglé en
 *  conséquence (wind_dir_deg = 0°) : avec cette convention, un vent "de face"
 *  saisi positif se traduit directement en vent contraire (voir headwindMs
 *  dans physics.ts), sans exposer la notion de cap/direction météo dans le
 *  formulaire — simplification volontaire pour ce MVP (pas de tracé GPX). */
function construireSegments(entrees: EntreeSegmentPacing[]): Segment[] {
  return entrees.map((s) => ({
    distance_m: s.distance_km * 1000,
    grade: s.pente_pourcent / 100,
    heading_deg: 0,
    altitude_m: 0,
    wind_speed_ms: null,
    wind_dir_deg: null,
    v_max_ms: null,
    crr_factor: 1.0,
  }));
}

function construireEnvironnement(entrees: EntreesPacing): Environment {
  return {
    temperature_c: entrees.temperature_c ?? 20.0,
    pressure_hpa: null,
    humidity: 0.5,
    altitude_m: entrees.altitude_m ?? 0,
    wind_speed_ms: entrees.vent_face_ms ?? 0,
    wind_dir_deg: 0,
  };
}

/** Point d'entrée de l'outil : construit le plan de puissance (puissance
 *  constante faisable, puis modulation par pente) et simule le résultat. */
export function calculerPlanPacing(entrees: EntreesPacing): ResultatPacing {
  const rider: Rider = {
    mass_kg: entrees.poids_kg,
    ftp_w: entrees.ftp_w,
    cp_w: null,
    w_prime_j: entrees.w_prime_j ?? W_PRIME_PAR_DEFAUT_J,
  };
  const bike = construireVelo(entrees.type_pratique, entrees.masse_velo_kg);
  const env = construireEnvironnement(entrees);
  const segments = construireSegments(entrees.segments);
  const constraints = CONTRAINTES_PAR_DEFAUT;

  const pConst = constantPowerFeasible(segments, rider, bike, env, constraints);
  const plan = slopeModulatedInit(segments, rider, bike, env, constraints, pConst);
  const sim = simulerPlan(segments, plan, rider, bike, env, constraints);

  return {
    puissance_constante_max_w: Math.round(pConst),
    segments: entrees.segments.map((s, i) => ({
      distance_km: s.distance_km,
      pente_pourcent: s.pente_pourcent,
      puissance_w: Math.round(sim.seg_power_w[i]),
      vitesse_kmh: Math.round(sim.seg_speed_ms[i] * 3.6 * 10) / 10,
      temps_s: Math.round(sim.seg_time_s[i]),
      wbal_fin_kj: Math.round((sim.seg_wbal_j[i] / 1000) * 10) / 10,
    })),
    temps_total_s: Math.round(sim.total_time_s),
    distance_totale_km: Math.round((sim.distance_m / 1000) * 100) / 100,
    vitesse_moyenne_kmh: Math.round(sim.avg_speed_ms * 3.6 * 10) / 10,
    puissance_moyenne_w: Math.round(sim.avg_power_w),
    np_w: Math.round(sim.np_w),
    if_: Math.round(sim.if_ * 1000) / 1000,
    tss: Math.round(sim.tss * 10) / 10,
    vi: Math.round(sim.vi * 1000) / 1000,
    energie_kj: Math.round(sim.energy_kj),
    wbal_min_kj: Math.round((sim.wbal_min_j / 1000) * 10) / 10,
    faisable: sim.feasible,
  };
}
