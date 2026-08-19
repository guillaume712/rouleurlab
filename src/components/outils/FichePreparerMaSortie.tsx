import { useEffect, useState } from 'react';
import type { NiveauCycliste, TypePratique, Velo } from '@/types';
import { getProfil, getVelos } from '@/lib/storage/profilLocal';
import { DEFAUTS_VELO_PAR_PRATIQUE, W_PRIME_PAR_DEFAUT_J } from '@/lib/calculs/pacing';
import { calculerFiche, validerEntreesFiche, type EntreesFiche, type ResultatFiche } from '@/lib/calculs/fichePreparation';

const LIBELLES_PRATIQUE: Record<TypePratique, string> = {
  route: 'Route',
  gravel: 'Gravel',
  vtt: 'VTT',
  ville: 'Ville',
};

const LIBELLES_NIVEAU: Record<NiveauCycliste, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  confirme: 'Confirmé',
  expert: 'Expert',
};

function segmentsParDefaut() {
  return [{ distance_km: 10, pente_pourcent: 0 }];
}

function formaterDuree(secondes: number): string {
  const h = Math.floor(secondes / 3600);
  const min = Math.floor((secondes % 3600) / 60);
  const s = Math.round(secondes % 60);
  if (h > 0) return `${h} h ${String(min).padStart(2, '0')} min`;
  if (min > 0) return `${min} min ${String(s).padStart(2, '0')} s`;
  return `${s} s`;
}

export default function FichePreparerMaSortie() {
  const [velos, setVelos] = useState<Velo[]>([]);
  const [poidsKg, setPoidsKg] = useState(70);
  const [ftpW, setFtpW] = useState<number | ''>('');
  const [niveau, setNiveau] = useState<NiveauCycliste>('intermediaire');
  const [typePratique, setTypePratique] = useState<TypePratique>('route');
  const [masseVeloKg, setMasseVeloKg] = useState<number | ''>('');
  const [wPrimeJ, setWPrimeJ] = useState<number>(W_PRIME_PAR_DEFAUT_J);
  const [temperatureC, setTemperatureC] = useState(20);
  const [altitudeM, setAltitudeM] = useState(0);
  const [ventFaceMs, setVentFaceMs] = useState(0);
  const [humiditePourcent, setHumiditePourcent] = useState(50);
  const [segments, setSegments] = useState(segmentsParDefaut());
  const [erreurs, setErreurs] = useState<Partial<Record<string, string>>>({});
  const [resultat, setResultat] = useState<ResultatFiche | null>(null);

  useEffect(() => {
    const profil = getProfil();
    setPoidsKg(profil.poids_kg);
    setNiveau(profil.niveau);
    if (profil.ftp_w !== null) setFtpW(profil.ftp_w);
    setVelos(getVelos());
  }, []);

  function ajouterSegment() {
    setSegments([...segments, { distance_km: 5, pente_pourcent: 0 }]);
  }

  function supprimerSegment(index: number) {
    setSegments(segments.filter((_, i) => i !== index));
  }

  function modifierSegment(index: number, champ: 'distance_km' | 'pente_pourcent', valeur: number) {
    setSegments(segments.map((s, i) => (i === index ? { ...s, [champ]: valeur } : s)));
  }

  function gererSoumission(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    const entrees: Partial<EntreesFiche> = {
      poids_kg: poidsKg,
      ftp_w: ftpW === '' ? undefined : ftpW,
      niveau,
      type_pratique: typePratique,
      masse_velo_kg: masseVeloKg === '' ? undefined : masseVeloKg,
      w_prime_j: wPrimeJ,
      temperature_c: temperatureC,
      altitude_m: altitudeM,
      vent_face_ms: ventFaceMs,
      humidite_pourcent: humiditePourcent,
      segments,
    };

    const nouvellesErreurs = validerEntreesFiche(entrees);
    setErreurs(nouvellesErreurs);
    if (Object.keys(nouvellesErreurs).length > 0) {
      setResultat(null);
      return;
    }
    setResultat(calculerFiche(entrees as EntreesFiche));
  }

  return (
    <div>
      <div className="no-print">
        {velos.length > 0 && (
          <div className="champ">
            <label htmlFor="velo-garage-fiche">Type de pratique depuis mon garage</label>
            <select
              id="velo-garage-fiche"
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
              <label htmlFor="poids-fiche">Poids (kg)</label>
              <input
                id="poids-fiche"
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
              <label htmlFor="ftp-fiche">FTP (W)</label>
              <input
                id="ftp-fiche"
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

          <div className="champ champ-double">
            <div>
              <label htmlFor="niveau-fiche">Niveau</label>
              <select id="niveau-fiche" value={niveau} onChange={(e) => setNiveau(e.target.value as NiveauCycliste)}>
                {(Object.keys(LIBELLES_NIVEAU) as NiveauCycliste[]).map((n) => (
                  <option key={n} value={n}>
                    {LIBELLES_NIVEAU[n]}
                  </option>
                ))}
              </select>
              {erreurs.niveau && (
                <p className="erreur" role="alert">
                  {erreurs.niveau}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="type-pratique-fiche">Type de pratique</label>
              <select
                id="type-pratique-fiche"
                value={typePratique}
                onChange={(e) => setTypePratique(e.target.value as TypePratique)}
              >
                {(Object.keys(LIBELLES_PRATIQUE) as TypePratique[]).map((tp) => (
                  <option key={tp} value={tp}>
                    {LIBELLES_PRATIQUE[tp]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <fieldset className="champ">
            <legend>Tronçons du parcours</legend>
            {segments.map((seg, i) => (
              <div key={i} className="champ-double" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <div>
                  <label htmlFor={`fiche-segment-distance-${i}`}>Distance (km)</label>
                  <input
                    id={`fiche-segment-distance-${i}`}
                    type="number"
                    step="0.1"
                    value={seg.distance_km}
                    onChange={(e) => modifierSegment(i, 'distance_km', Number(e.target.value))}
                  />
                </div>
                <div>
                  <label htmlFor={`fiche-segment-pente-${i}`}>Pente moyenne (%)</label>
                  <input
                    id={`fiche-segment-pente-${i}`}
                    type="number"
                    step="0.5"
                    value={seg.pente_pourcent}
                    onChange={(e) => modifierSegment(i, 'pente_pourcent', Number(e.target.value))}
                  />
                </div>
                {segments.length > 1 && (
                  <button type="button" onClick={() => supprimerSegment(i)} aria-label={`Supprimer le tronçon ${i + 1}`}>
                    Retirer
                  </button>
                )}
              </div>
            ))}
            {erreurs.segments && (
              <p className="erreur" role="alert">
                {erreurs.segments}
              </p>
            )}
            <button type="button" onClick={ajouterSegment}>
              Ajouter un tronçon
            </button>
          </fieldset>

          <details className="champ">
            <summary>Options avancées (vélo, conditions, W&apos;)</summary>
            <div className="champ champ-double" style={{ marginTop: '0.75rem' }}>
              <div>
                <label htmlFor="masse-velo-fiche">Masse du vélo (kg)</label>
                <input
                  id="masse-velo-fiche"
                  type="number"
                  placeholder={String(DEFAUTS_VELO_PAR_PRATIQUE[typePratique].mass_kg)}
                  value={masseVeloKg}
                  onChange={(e) => setMasseVeloKg(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
              <div>
                <label htmlFor="w-prime-fiche">W&apos; (J)</label>
                <input
                  id="w-prime-fiche"
                  type="number"
                  value={wPrimeJ}
                  onChange={(e) => setWPrimeJ(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="champ champ-double" style={{ marginTop: '0.75rem' }}>
              <div>
                <label htmlFor="temperature-fiche">Température (°C)</label>
                <input
                  id="temperature-fiche"
                  type="number"
                  value={temperatureC}
                  onChange={(e) => setTemperatureC(Number(e.target.value))}
                />
              </div>
              <div>
                <label htmlFor="altitude-fiche">Altitude moyenne (m)</label>
                <input
                  id="altitude-fiche"
                  type="number"
                  value={altitudeM}
                  onChange={(e) => setAltitudeM(Number(e.target.value))}
                />
              </div>
              <div>
                <label htmlFor="vent-fiche">Vent de face (m/s)</label>
                <input id="vent-fiche" type="number" value={ventFaceMs} onChange={(e) => setVentFaceMs(Number(e.target.value))} />
              </div>
              <div>
                <label htmlFor="humidite-fiche">Humidité (%)</label>
                <input
                  id="humidite-fiche"
                  type="number"
                  value={humiditePourcent}
                  onChange={(e) => setHumiditePourcent(Number(e.target.value))}
                  aria-invalid={!!erreurs.humidite_pourcent}
                />
                {erreurs.humidite_pourcent && (
                  <p className="erreur" role="alert">
                    {erreurs.humidite_pourcent}
                  </p>
                )}
              </div>
            </div>
          </details>

          <button type="submit">Générer ma fiche</button>
        </form>
      </div>

      {resultat && (
        <div className="resultat fiche-imprimable" role="status">
          <div className="fiche-entete">
            <p className="resultat-principal">{formaterDuree(resultat.pacing.temps_total_s)}</p>
            <button type="button" className="no-print" onClick={() => window.print()}>
              Imprimer cette fiche
            </button>
          </div>
          <p className="aide">
            Distance {resultat.pacing.distance_totale_km} km — vitesse moyenne{' '}
            {resultat.pacing.vitesse_moyenne_kmh} km/h — puissance moyenne {resultat.pacing.puissance_moyenne_w} W
            (NP {resultat.pacing.np_w} W, IF {resultat.pacing.if_}, TSS {resultat.pacing.tss}) — W&apos;bal minimum{' '}
            {resultat.pacing.wbal_min_kj} kJ.
          </p>

          <h2>Plan de puissance</h2>
          <div className="table-reference-conteneur">
            <table className="table-reference">
              <thead>
                <tr>
                  <th scope="col">Tronçon</th>
                  <th scope="col">Distance</th>
                  <th scope="col">Pente</th>
                  <th scope="col">Puissance cible</th>
                  <th scope="col">Vitesse est.</th>
                  <th scope="col">Temps est.</th>
                </tr>
              </thead>
              <tbody>
                {resultat.pacing.segments.map((s, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{s.distance_km} km</td>
                    <td>{s.pente_pourcent} %</td>
                    <td className="valeur">{s.puissance_w} W</td>
                    <td>{s.vitesse_kmh} km/h</td>
                    <td>{formaterDuree(s.temps_s)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Plan nutrition</h2>
          <div className="table-reference-conteneur">
            <table className="table-reference">
              <tbody>
                <tr>
                  <th scope="row">Glucides</th>
                  <td className="valeur">{resultat.nutrition.glucides_g_par_h} g/h</td>
                  <td>{resultat.nutrition.glucides_total_g} g au total</td>
                </tr>
                <tr>
                  <th scope="row">Liquide</th>
                  <td className="valeur">{resultat.nutrition.liquide_ml_par_h} ml/h</td>
                  <td>{resultat.nutrition.liquide_total_ml} ml au total</td>
                </tr>
                <tr>
                  <th scope="row">Sodium</th>
                  <td className="valeur">{resultat.nutrition.sodium_mg_par_h} mg/h</td>
                  <td>{resultat.nutrition.sodium_total_mg} mg au total</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="aide">
            Plan nutrition calculé pour la durée et l&apos;intensité de ce plan de puissance (
            {Math.round((resultat.pacing.temps_total_s / 60) * 10) / 10} min, IF {resultat.pacing.if_}).
            {(resultat.duree_nutrition_ajustee || resultat.intensite_nutrition_ajustee) &&
              ' Durée ou intensité ramenées à la plage couverte par le calcul nutrition (parcours très court, très facile ou très difficile) — à prendre avec d’autant plus de prudence.'}
          </p>

          <p className="aide no-print">
            Détails, sources et limites de chaque volet : voir les pages{' '}
            <a href="/outils/course/pacing">Plan de puissance</a> et{' '}
            <a href="/outils/course/nutrition">Plan nutrition course</a>.
          </p>
        </div>
      )}
    </div>
  );
}
