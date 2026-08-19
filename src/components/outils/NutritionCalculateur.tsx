import { useEffect, useState } from 'react';
import type { NiveauCycliste } from '@/types';
import { getProfil } from '@/lib/storage/profilLocal';
import {
  calculerNutrition,
  validerEntreesNutrition,
  type EntreesNutrition,
  type ResultatNutrition,
} from '@/lib/calculs/nutrition';

const LIBELLES_NIVEAU: Record<NiveauCycliste, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  confirme: 'Confirmé',
  expert: 'Expert',
};

export default function NutritionCalculateur() {
  const [poidsKg, setPoidsKg] = useState(70);
  const [niveau, setNiveau] = useState<NiveauCycliste>('intermediaire');
  const [dureeMin, setDureeMin] = useState(120);
  const [intensiteIf, setIntensiteIf] = useState(0.7);
  const [temperatureC, setTemperatureC] = useState(20);
  const [humiditePourcent, setHumiditePourcent] = useState(50);
  const [erreurs, setErreurs] = useState<Partial<Record<string, string>>>({});
  const [resultat, setResultat] = useState<ResultatNutrition | null>(null);

  useEffect(() => {
    const profil = getProfil();
    setPoidsKg(profil.poids_kg);
    setNiveau(profil.niveau);
  }, []);

  function gererSoumission(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const entrees: Partial<EntreesNutrition> = {
      poids_kg: poidsKg,
      niveau,
      duree_min: dureeMin,
      intensite_if: intensiteIf,
      temperature_c: temperatureC,
      humidite_pourcent: humiditePourcent,
    };
    const nouvellesErreurs = validerEntreesNutrition(entrees);
    setErreurs(nouvellesErreurs);
    if (Object.keys(nouvellesErreurs).length > 0) {
      setResultat(null);
      return;
    }
    setResultat(calculerNutrition(entrees as EntreesNutrition));
  }

  return (
    <div>
      <form onSubmit={gererSoumission} noValidate>
        <div className="champ champ-double">
          <div>
            <label htmlFor="poids-nutrition">Poids (kg)</label>
            <input
              id="poids-nutrition"
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
            <label htmlFor="niveau-nutrition">Niveau</label>
            <select id="niveau-nutrition" value={niveau} onChange={(e) => setNiveau(e.target.value as NiveauCycliste)}>
              {(Object.keys(LIBELLES_NIVEAU) as NiveauCycliste[]).map((n) => (
                <option key={n} value={n}>
                  {LIBELLES_NIVEAU[n]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="champ champ-double">
          <div>
            <label htmlFor="duree">Durée prévue (minutes)</label>
            <input
              id="duree"
              type="number"
              value={dureeMin}
              onChange={(e) => setDureeMin(Number(e.target.value))}
              aria-invalid={!!erreurs.duree_min}
            />
            {erreurs.duree_min && (
              <p className="erreur" role="alert">
                {erreurs.duree_min}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="if">Intensité prévue (IF, 0.4 à 1.1)</label>
            <input
              id="if"
              type="number"
              step="0.05"
              value={intensiteIf}
              onChange={(e) => setIntensiteIf(Number(e.target.value))}
              aria-invalid={!!erreurs.intensite_if}
            />
            {erreurs.intensite_if && (
              <p className="erreur" role="alert">
                {erreurs.intensite_if}
              </p>
            )}
            <p className="aide">Ex. 0.6-0.7 sortie tranquille, 0.75-0.85 allure sportive, 0.9+ seuil/course.</p>
          </div>
        </div>

        <div className="champ champ-double">
          <div>
            <label htmlFor="temperature-nutrition">Température prévue (°C)</label>
            <input
              id="temperature-nutrition"
              type="number"
              value={temperatureC}
              onChange={(e) => setTemperatureC(Number(e.target.value))}
              aria-invalid={!!erreurs.temperature_c}
            />
          </div>
          <div>
            <label htmlFor="humidite">Humidité prévue (%)</label>
            <input
              id="humidite"
              type="number"
              value={humiditePourcent}
              onChange={(e) => setHumiditePourcent(Number(e.target.value))}
              aria-invalid={!!erreurs.humidite_pourcent}
            />
          </div>
        </div>

        <button type="submit">Calculer le plan nutrition</button>
      </form>

      {resultat && (
        <div className="resultat" role="status">
          <p className="resultat-principal">{resultat.glucides_g_par_h} g de glucides / h</p>
          <p className="aide">
            Soit environ {resultat.glucides_total_g} g de glucides au total sur la durée prévue.
          </p>

          <div className="table-reference-conteneur">
            <table className="table-reference">
              <caption>Plan nutrition/hydratation estimé</caption>
              <tbody>
                <tr>
                  <th scope="row">Glucides</th>
                  <td className="valeur">{resultat.glucides_g_par_h} g/h</td>
                  <td>{resultat.glucides_total_g} g au total</td>
                </tr>
                <tr>
                  <th scope="row">Liquide</th>
                  <td className="valeur">{resultat.liquide_ml_par_h} ml/h</td>
                  <td>{resultat.liquide_total_ml} ml au total</td>
                </tr>
                <tr>
                  <th scope="row">Sodium</th>
                  <td className="valeur">{resultat.sodium_mg_par_h} mg/h</td>
                  <td>{resultat.sodium_total_mg} mg au total</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="aide">
            Taux de sudation estimé : environ {resultat.taux_sudation_estime_ml_par_h} ml/h (avant plafonnement à la
            capacité gastrique). Ce sont des repères de littérature sportive, pas une prescription individualisée —
            voir « Sources et limites » ci-dessous.
          </p>
        </div>
      )}
    </div>
  );
}
