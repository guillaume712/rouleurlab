import { useEffect, useState } from 'react';
import type { TypePratique, Velo } from '@/types';
import { getProfil, getVelos } from '@/lib/storage/profilLocal';
import {
  DEFAUTS_VELO_PAR_PRATIQUE,
  W_PRIME_PAR_DEFAUT_J,
  calculerPlanPacing,
  validerEntreesPacing,
  type EntreesPacing,
  type EntreeSegmentPacing,
  type ResultatPacing,
} from '@/lib/calculs/pacing';
import { analyserFichierGpx, type ResultatImportGpx } from '@/lib/calculs/gpx';

const LIBELLES_PRATIQUE: Record<TypePratique, string> = {
  route: 'Route',
  gravel: 'Gravel',
  vtt: 'VTT',
  ville: 'Ville',
};

function formaterDuree(secondes: number): string {
  const h = Math.floor(secondes / 3600);
  const min = Math.floor((secondes % 3600) / 60);
  const s = Math.round(secondes % 60);
  if (h > 0) return `${h} h ${String(min).padStart(2, '0')} min`;
  if (min > 0) return `${min} min ${String(s).padStart(2, '0')} s`;
  return `${s} s`;
}

export default function PacingCalculateur() {
  const [velos, setVelos] = useState<Velo[]>([]);
  const [poidsKg, setPoidsKg] = useState(70);
  const [ftpW, setFtpW] = useState<number | ''>('');
  const [typePratique, setTypePratique] = useState<TypePratique>('route');
  const [masseVeloKg, setMasseVeloKg] = useState<number | ''>('');
  const [wPrimeJ, setWPrimeJ] = useState<number>(W_PRIME_PAR_DEFAUT_J);
  const [temperatureC, setTemperatureC] = useState(20);
  const [altitudeM, setAltitudeM] = useState(0);
  const [ventFaceMs, setVentFaceMs] = useState(0);
  const [segments, setSegments] = useState<EntreeSegmentPacing[]>([]);
  const [infoTrace, setInfoTrace] = useState<ResultatImportGpx | null>(null);
  const [nomFichier, setNomFichier] = useState<string | null>(null);
  const [erreurFichier, setErreurFichier] = useState<string | null>(null);
  const [erreurs, setErreurs] = useState<Partial<Record<string, string>>>({});
  const [resultat, setResultat] = useState<ResultatPacing | null>(null);

  useEffect(() => {
    const profil = getProfil();
    setPoidsKg(profil.poids_kg);
    if (profil.ftp_w !== null) setFtpW(profil.ftp_w);
    setVelos(getVelos());
  }, []);

  function gererFichierGpx(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    setNomFichier(fichier.name);
    setResultat(null);

    const lecteur = new FileReader();
    lecteur.onload = () => {
      try {
        const contenu = String(lecteur.result ?? '');
        const analyse = analyserFichierGpx(contenu);
        setSegments(analyse.segments);
        setInfoTrace(analyse);
        setErreurFichier(null);
        setErreurs((prev) => ({ ...prev, segments: undefined }));
      } catch (err) {
        setSegments([]);
        setInfoTrace(null);
        setErreurFichier(err instanceof Error ? err.message : 'Fichier GPX illisible.');
      }
    };
    lecteur.onerror = () => {
      setSegments([]);
      setInfoTrace(null);
      setErreurFichier('Impossible de lire ce fichier.');
    };
    lecteur.readAsText(fichier);
  }

  function gererSoumission(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    const entrees: Partial<EntreesPacing> = {
      poids_kg: poidsKg,
      ftp_w: ftpW === '' ? undefined : ftpW,
      type_pratique: typePratique,
      masse_velo_kg: masseVeloKg === '' ? undefined : masseVeloKg,
      w_prime_j: wPrimeJ,
      temperature_c: temperatureC,
      altitude_m: altitudeM,
      vent_face_ms: ventFaceMs,
      segments,
    };

    const nouvellesErreurs = validerEntreesPacing(entrees);
    setErreurs(nouvellesErreurs);
    if (Object.keys(nouvellesErreurs).length > 0) {
      setResultat(null);
      return;
    }
    setResultat(calculerPlanPacing(entrees as EntreesPacing));
  }

  return (
    <div>
      {velos.length > 0 && (
        <div className="champ">
          <label htmlFor="velo-garage-pacing">Type de pratique depuis mon garage</label>
          <select
            id="velo-garage-pacing"
            value=""
            onChange={(e) => {
              const velo = velos.find((v) => v.id === e.target.value);
              if (velo) setTypePratique(velo.type_pratique);
            }}
          >
            <option value="">— Choisir un type de pratique manuellement ci-dessous —</option>
            {velos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nom} ({LIBELLES_PRATIQUE[v.type_pratique]})
              </option>
            ))}
          </select>
        </div>
      )}

      <form onSubmit={gererSoumission} noValidate>
        <div className="champ champ-double">
          <div>
            <label htmlFor="poids">Poids (kg)</label>
            <input
              id="poids"
              type="number"
              value={poidsKg}
              onChange={(e) => setPoidsKg(Number(e.target.value))}
              aria-invalid={!!erreurs.poids_kg}
            />
            {erreurs.poids_kg && (
              <p className="erreur" role="alert">
                {erreurs.poids_kg}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="ftp">FTP (W)</label>
            <input
              id="ftp"
              type="number"
              value={ftpW}
              onChange={(e) => setFtpW(e.target.value === '' ? '' : Number(e.target.value))}
              aria-invalid={!!erreurs.ftp_w}
            />
            {erreurs.ftp_w && (
              <p className="erreur" role="alert">
                {erreurs.ftp_w}
              </p>
            )}
          </div>
        </div>

        <div className="champ">
          <label htmlFor="type-pratique">Type de pratique (paramètres vélo par défaut)</label>
          <select
            id="type-pratique"
            value={typePratique}
            onChange={(e) => setTypePratique(e.target.value as TypePratique)}
          >
            {(Object.keys(LIBELLES_PRATIQUE) as TypePratique[]).map((tp) => (
              <option key={tp} value={tp}>
                {LIBELLES_PRATIQUE[tp]} (Crr {DEFAUTS_VELO_PAR_PRATIQUE[tp].crr}, CdA{' '}
                {DEFAUTS_VELO_PAR_PRATIQUE[tp].cda} m²)
              </option>
            ))}
          </select>
          <p className="aide">Voir « Sources et limites » plus bas pour l’origine de ces valeurs par défaut.</p>
        </div>

        <fieldset className="champ">
          <legend>Parcours</legend>
          <label htmlFor="fichier-gpx">Fichier GPX de votre parcours</label>
          <input id="fichier-gpx" type="file" accept=".gpx,application/gpx+xml" onChange={gererFichierGpx} />
          <p className="aide">
            Export GPX d'un parcours (Strava, Komoot, RideWithGPS, Garmin Connect…) — pas un fichier
            d'activité enregistrée (.fit) ni un fichier de plusieurs sorties.
          </p>

          {erreurFichier && (
            <p className="erreur" role="alert">
              {erreurFichier}
            </p>
          )}
          {erreurs.segments && !erreurFichier && (
            <p className="erreur" role="alert">
              {erreurs.segments}
            </p>
          )}

          {infoTrace && !erreurFichier && (
            <p className="aide">
              <strong>{nomFichier}</strong> — {infoTrace.distance_totale_km} km, D+ {infoTrace.denivele_positif_m} m
              / D- {infoTrace.denivele_negatif_m} m, découpé en {segments.length} tronçons d'environ{' '}
              {infoTrace.longueur_segment_m} m pour le calcul.
              {!infoTrace.altitude_disponible &&
                " Ce fichier ne contient pas de données d'altitude : la pente est supposée nulle sur tout le parcours."}
            </p>
          )}
        </fieldset>

        <details className="champ">
          <summary>Options avancées (vélo, conditions, W')</summary>
          <div className="champ champ-double" style={{ marginTop: '0.75rem' }}>
            <div>
              <label htmlFor="masse-velo">Masse du vélo (kg)</label>
              <input
                id="masse-velo"
                type="number"
                placeholder={String(DEFAUTS_VELO_PAR_PRATIQUE[typePratique].mass_kg)}
                value={masseVeloKg}
                onChange={(e) => setMasseVeloKg(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="w-prime">W&apos; (J)</label>
              <input id="w-prime" type="number" value={wPrimeJ} onChange={(e) => setWPrimeJ(Number(e.target.value))} />
              {erreurs.w_prime_j && (
                <p className="erreur" role="alert">
                  {erreurs.w_prime_j}
                </p>
              )}
            </div>
          </div>
          <div className="champ champ-double" style={{ marginTop: '0.75rem' }}>
            <div>
              <label htmlFor="temperature">Température (°C)</label>
              <input
                id="temperature"
                type="number"
                value={temperatureC}
                onChange={(e) => setTemperatureC(Number(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="altitude">Altitude moyenne (m)</label>
              <input id="altitude" type="number" value={altitudeM} onChange={(e) => setAltitudeM(Number(e.target.value))} />
            </div>
            <div>
              <label htmlFor="vent">Vent de face (m/s, négatif = favorable)</label>
              <input id="vent" type="number" value={ventFaceMs} onChange={(e) => setVentFaceMs(Number(e.target.value))} />
            </div>
          </div>
        </details>

        <button type="submit">Calculer le plan de puissance</button>
      </form>

      {resultat && (
        <div className="resultat" role="status">
          <p className="resultat-principal">{formaterDuree(resultat.temps_total_s)}</p>
          <p className="aide">
            Distance {resultat.distance_totale_km} km — vitesse moyenne {resultat.vitesse_moyenne_kmh} km/h —
            puissance moyenne {resultat.puissance_moyenne_w} W (NP {resultat.np_w} W, IF {resultat.if_}, TSS{' '}
            {resultat.tss}, VI {resultat.vi}) — énergie {resultat.energie_kj} kJ.
          </p>
          <p className="aide">
            W&apos;bal minimum atteint : {resultat.wbal_min_kj} kJ.{' '}
            {resultat.faisable
              ? 'Plan jugé tenable avec la marge de sécurité par défaut (10 % de W\' préservés, IF ≤ 0.95).'
              : 'Ce plan dépasse la marge de sécurité par défaut — à prendre comme un majorant optimiste, pas une garantie.'}
          </p>

          <div className="table-reference-conteneur">
            <table className="table-reference">
              <caption>Puissance cible par tronçon (repère de pacing modulé par pente)</caption>
              <thead>
                <tr>
                  <th scope="col">Tronçon</th>
                  <th scope="col">Distance</th>
                  <th scope="col">Pente</th>
                  <th scope="col">Puissance cible</th>
                  <th scope="col">Vitesse est.</th>
                  <th scope="col">Temps est.</th>
                  <th scope="col">W&apos;bal fin</th>
                </tr>
              </thead>
              <tbody>
                {resultat.segments.map((s, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{s.distance_km} km</td>
                    <td>{s.pente_pourcent} %</td>
                    <td className="valeur">{s.puissance_w} W</td>
                    <td>{s.vitesse_kmh} km/h</td>
                    <td>{formaterDuree(s.temps_s)}</td>
                    <td>{s.wbal_fin_kj} kJ</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="aide">
            Repère de puissance constante maximale jugée tenable sur tout le parcours (avant modulation
            par pente) : {resultat.puissance_constante_max_w} W.
          </p>
        </div>
      )}
    </div>
  );
}
