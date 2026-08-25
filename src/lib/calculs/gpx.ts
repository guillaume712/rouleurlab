// Import GPX pour l'outil "Plan de puissance" (pacing) — remplace la saisie
// manuelle de tronçons (distance + pente) par un tracé réel.
//
// Fonctionnement : on extrait les points de trace (trkpt, ou rtept en repli
// pour un fichier "itinéraire" plutôt que "trace") avec latitude/longitude et
// altitude, on calcule la distance cumulée point à point (formule de
// haversine, terre sphérique — approximation standard suffisante à cette
// échelle), puis on rééchantillonne le tracé en tronçons de longueur fixe
// pour limiter leur nombre sur les parcours longs (voir
// LONGUEUR_SEGMENT_CIBLE_M / NB_SEGMENTS_MAX ci-dessous). La pente de chaque
// tronçon est la pente moyenne entre son point de départ et son point
// d'arrivée (altitude interpolée linéairement entre les deux points de trace
// encadrants), pas une régression lissée sur le tronçon entier.
//
// Limites assumées : pas de lissage du bruit d'altitude (GPS ou baromètre
// selon l'appareil source) au-delà du rééchantillonnage par tronçon ; un
// fichier sans données d'altitude produit des tronçons à pente nulle
// (signalé à l'appelant via `altitude_disponible: false`) plutôt qu'une
// erreur bloquante.

import type { EntreeSegmentPacing } from './pacing';

/** Longueur cible d'un tronçon rééchantillonné, en mètres. */
const LONGUEUR_SEGMENT_CIBLE_M = 250;
/** Nombre maximal de tronçons générés, quelle que soit la longueur du
 *  parcours — au-delà, la longueur de tronçon est augmentée en conséquence
 *  (ex. un parcours de 300 km produit des tronçons d'environ 1 km, pas 1200
 *  tronçons de 250 m). */
const NB_SEGMENTS_MAX = 300;

const PENTE_POURCENT_BORNE = 25;

interface PointTrace {
  distance_m: number;
  altitude_m: number;
}

export interface ResultatImportGpx {
  segments: EntreeSegmentPacing[];
  distance_totale_km: number;
  denivele_positif_m: number;
  denivele_negatif_m: number;
  altitude_disponible: boolean;
  longueur_segment_m: number;
}

function versRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Distance en mètres entre deux points lat/lon (formule de haversine). */
function distanceHaversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6_371_000;
  const dLat = versRadians(lat2 - lat1);
  const dLon = versRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(versRadians(lat1)) * Math.cos(versRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function extrairePoints(doc: Document): { lat: number; lon: number; ele: number | null }[] {
  let noeuds = Array.from(doc.getElementsByTagName('trkpt'));
  if (noeuds.length === 0) {
    noeuds = Array.from(doc.getElementsByTagName('rtept'));
  }
  const points: { lat: number; lon: number; ele: number | null }[] = [];
  for (const noeud of noeuds) {
    const lat = parseFloat(noeud.getAttribute('lat') ?? '');
    const lon = parseFloat(noeud.getAttribute('lon') ?? '');
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const eleTexte = noeud.getElementsByTagName('ele')[0]?.textContent ?? '';
    const ele = parseFloat(eleTexte);
    points.push({ lat, lon, ele: Number.isFinite(ele) ? ele : null });
  }
  return points;
}

/** Construit la trace cumulée (distance, altitude) à partir des points bruts.
 *  Si aucune altitude n'est disponible, altitude_m vaut 0 pour tous les
 *  points (signalé séparément à l'appelant). */
function construireTrace(points: { lat: number; lon: number; ele: number | null }[]): {
  trace: PointTrace[];
  altitudeDisponible: boolean;
} {
  const altitudeDisponible = points.some((p) => p.ele !== null);
  const trace: PointTrace[] = [];
  let distanceCumulee = 0;
  for (let i = 0; i < points.length; i++) {
    if (i > 0) {
      distanceCumulee += distanceHaversineM(points[i - 1].lat, points[i - 1].lon, points[i].lat, points[i].lon);
    }
    trace.push({ distance_m: distanceCumulee, altitude_m: altitudeDisponible ? points[i].ele ?? 0 : 0 });
  }
  return { trace, altitudeDisponible };
}

/** Altitude interpolée linéairement à une distance donnée le long de la trace. */
function altitudeADistance(trace: PointTrace[], distanceCible: number): number {
  if (distanceCible <= trace[0].distance_m) return trace[0].altitude_m;
  const dernier = trace[trace.length - 1];
  if (distanceCible >= dernier.distance_m) return dernier.altitude_m;
  for (let i = 1; i < trace.length; i++) {
    if (trace[i].distance_m >= distanceCible) {
      const a = trace[i - 1];
      const b = trace[i];
      const portee = b.distance_m - a.distance_m;
      const t = portee > 0 ? (distanceCible - a.distance_m) / portee : 0;
      return a.altitude_m + t * (b.altitude_m - a.altitude_m);
    }
  }
  return dernier.altitude_m;
}

/** Parse un fichier GPX (contenu texte brut) et produit des tronçons
 *  utilisables par calculerPlanPacing, ainsi que quelques repères sur le
 *  parcours (distance, dénivelé). Lève une Error avec un message en
 *  français si le fichier n'est pas exploitable. */
export function analyserFichierGpx(contenuXml: string): ResultatImportGpx {
  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(contenuXml, 'application/xml');
  } catch {
    throw new Error("Impossible de lire ce fichier — ce n'est pas un GPX valide.");
  }
  if (doc.getElementsByTagName('parsererror').length > 0) {
    throw new Error("Ce fichier n'est pas un GPX valide (XML mal formé).");
  }

  const pointsBruts = extrairePoints(doc);
  if (pointsBruts.length < 2) {
    throw new Error('Ce fichier GPX ne contient pas assez de points de trace (trkpt) exploitables.');
  }

  const { trace, altitudeDisponible } = construireTrace(pointsBruts);
  const distanceTotaleM = trace[trace.length - 1].distance_m;
  if (distanceTotaleM < 50) {
    throw new Error('La distance totale du tracé est trop courte pour être exploitée (moins de 50 m).');
  }

  const nbSegmentsCible = distanceTotaleM / LONGUEUR_SEGMENT_CIBLE_M;
  const nbSegments = Math.max(1, Math.min(NB_SEGMENTS_MAX, Math.round(nbSegmentsCible)));
  const longueurSegmentM = distanceTotaleM / nbSegments;

  const segments: EntreeSegmentPacing[] = [];
  let deniveleP = 0;
  let deniveleN = 0;

  for (let i = 0; i < nbSegments; i++) {
    const dDebut = (distanceTotaleM * i) / nbSegments;
    const dFin = (distanceTotaleM * (i + 1)) / nbSegments;
    const altDebut = altitudeADistance(trace, dDebut);
    const altFin = altitudeADistance(trace, dFin);
    const distanceSegM = dFin - dDebut;
    let pente = distanceSegM > 0 ? ((altFin - altDebut) / distanceSegM) * 100 : 0;
    // Clamp : le bruit d'altitude (GPS notamment) peut ponctuellement produire
    // des pentes irréalistes sur un tronçon court — on ramène dans la plage
    // couverte par le moteur de calcul plutôt que de la laisser fausser le plan.
    pente = Math.max(-PENTE_POURCENT_BORNE, Math.min(PENTE_POURCENT_BORNE, pente));

    segments.push({
      distance_km: Math.round((distanceSegM / 1000) * 1000) / 1000,
      pente_pourcent: Math.round(pente * 10) / 10,
    });

    if (altFin > altDebut) deniveleP += altFin - altDebut;
    else deniveleN += altDebut - altFin;
  }

  return {
    segments,
    distance_totale_km: Math.round((distanceTotaleM / 1000) * 100) / 100,
    denivele_positif_m: Math.round(deniveleP),
    denivele_negatif_m: Math.round(deniveleN),
    altitude_disponible: altitudeDisponible,
    longueur_segment_m: Math.round(longueurSegmentM),
  };
}
