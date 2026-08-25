import { describe, expect, it } from 'vitest';
import { analyserFichierGpx } from './gpx';

// Petit tracé synthétique : 3 points espacés d'environ 1 km chacun (le long
// d'un méridien, pour un calcul de distance simple à vérifier à la main),
// avec une montée de 100 m puis une descente de 50 m.
const GPX_SIMPLE = `<?xml version="1.0"?>
<gpx version="1.1">
  <trk>
    <trkseg>
      <trkpt lat="45.0000" lon="5.0000"><ele>200</ele></trkpt>
      <trkpt lat="45.0090" lon="5.0000"><ele>300</ele></trkpt>
      <trkpt lat="45.0180" lon="5.0000"><ele>250</ele></trkpt>
    </trkseg>
  </trk>
</gpx>`;

const GPX_SANS_ALTITUDE = `<?xml version="1.0"?>
<gpx version="1.1">
  <trk>
    <trkseg>
      <trkpt lat="45.0000" lon="5.0000"></trkpt>
      <trkpt lat="45.0090" lon="5.0000"></trkpt>
      <trkpt lat="45.0180" lon="5.0000"></trkpt>
    </trkseg>
  </trk>
</gpx>`;

describe('analyserFichierGpx', () => {
  it('calcule une distance totale cohérente (~2 km) à partir des coordonnées', () => {
    const resultat = analyserFichierGpx(GPX_SIMPLE);
    expect(resultat.distance_totale_km).toBeGreaterThan(1.9);
    expect(resultat.distance_totale_km).toBeLessThan(2.1);
  });

  it('détecte la montée et la descente', () => {
    const resultat = analyserFichierGpx(GPX_SIMPLE);
    expect(resultat.denivele_positif_m).toBeGreaterThan(90);
    expect(resultat.denivele_negatif_m).toBeGreaterThan(40);
    expect(resultat.altitude_disponible).toBe(true);
  });

  it('produit des tronçons dont la somme des distances reconstitue le total', () => {
    const resultat = analyserFichierGpx(GPX_SIMPLE);
    const sommeKm = resultat.segments.reduce((acc, s) => acc + s.distance_km, 0);
    expect(sommeKm).toBeCloseTo(resultat.distance_totale_km, 1);
    expect(resultat.segments.length).toBeGreaterThan(0);
  });

  it('signale une trace sans altitude et renvoie une pente nulle', () => {
    const resultat = analyserFichierGpx(GPX_SANS_ALTITUDE);
    expect(resultat.altitude_disponible).toBe(false);
    expect(resultat.segments.every((s) => s.pente_pourcent === 0)).toBe(true);
  });

  it('rejette un fichier sans points de trace exploitables', () => {
    expect(() => analyserFichierGpx('<gpx></gpx>')).toThrow();
  });

  it('rejette un XML invalide', () => {
    expect(() => analyserFichierGpx('<gpx><trk>')).toThrow();
  });

  it('plafonne à 300 tronçons pour un très long parcours', () => {
    // Génère ~600 points espacés de 500 m environ (≈300 km au total).
    const pts: string[] = [];
    for (let i = 0; i < 600; i++) {
      const lat = (45 + i * 0.0045).toFixed(5);
      pts.push(`<trkpt lat="${lat}" lon="5.0000"><ele>${200 + (i % 20) * 5}</ele></trkpt>`);
    }
    const gpxLong = `<gpx><trk><trkseg>${pts.join('')}</trkseg></trk></gpx>`;
    const resultat = analyserFichierGpx(gpxLong);
    expect(resultat.segments.length).toBeLessThanOrEqual(300);
  });
});
