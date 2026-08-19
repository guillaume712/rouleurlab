import { useEffect, useMemo, useState } from 'react';
import type { Velo } from '@/types';
import { getVelos } from '@/lib/storage/profilLocal';
import {
  DERAILLEURS,
  calculerCompatibiliteCassetteDerailleur,
  validerEntreesCompatibiliteCassetteDerailleur,
  type EntreesCompatibiliteCassetteDerailleur,
  type ResultatCompatibiliteCassetteDerailleur,
} from '@/lib/calculs/compatibiliteCassetteDerailleur';

const VALEURS_PAR_DEFAUT: EntreesCompatibiliteCassetteDerailleur = {
  plateaux_dents: [50, 34],
  cassette_dents_min: 11,
  cassette_dents_max: 32,
  derailleur_id: DERAILLEURS[0].id,
};

export default function CompatibiliteCassetteDerailleur() {
  const [velos, setVelos] = useState<Velo[]>([]);
  const [veloSelectionneId, setVeloSelectionneId] = useState('');
  const [entrees, setEntrees] = useState<EntreesCompatibiliteCassetteDerailleur>(VALEURS_PAR_DEFAUT);
  const [plateauxTexte, setPlateauxTexte] = useState('50, 34');
  const [erreurs, setErreurs] = useState<Partial<Record<keyof EntreesCompatibiliteCassetteDerailleur, string>>>(
    {},
  );
  const [resultat, setResultat] = useState<ResultatCompatibiliteCassetteDerailleur | null>(null);

  useEffect(() => {
    setVelos(getVelos());
  }, []);

  const derailleursTries = useMemo(
    () => [...DERAILLEURS].sort((a, b) => a.nom.localeCompare(b.nom)),
    [],
  );

  function appliquerVelo(id: string) {
    setVeloSelectionneId(id);
    if (!id) return;
    const velo = velos.find((v) => v.id === id);
    if (!velo) return;
    setEntrees({
      ...entrees,
      plateaux_dents: velo.plateaux_dents,
      cassette_dents_min: velo.cassette_dents_min,
      cassette_dents_max: velo.cassette_dents_max,
    });
    setPlateauxTexte(velo.plateaux_dents.join(', '));
    setResultat(null);
    setErreurs({});
  }

  function gererChangementPlateaux(texte: string) {
    setPlateauxTexte(texte);
    const dents = texte
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    setEntrees({ ...entrees, plateaux_dents: dents });
  }

  function gererSoumission(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const nouvellesErreurs = validerEntreesCompatibiliteCassetteDerailleur(entrees);
    setErreurs(nouvellesErreurs);
    if (Object.keys(nouvellesErreurs).length > 0) {
      setResultat(null);
      return;
    }
    setResultat(calculerCompatibiliteCassetteDerailleur(entrees));
  }

  return (
    <div>
      {velos.length > 0 && (
        <div className="champ">
          <label htmlFor="velo-garage">Pré-remplir depuis mon garage</label>
          <select id="velo-garage" value={veloSelectionneId} onChange={(e) => appliquerVelo(e.target.value)}>
            <option value="">— Saisie manuelle —</option>
            {velos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nom}
              </option>
            ))}
          </select>
        </div>
      )}
      {velos.length === 0 && (
        <p className="aide">
          Aucun vélo enregistré dans <a href="/mon-garage">votre garage</a> — saisissez les valeurs
          manuellement ci-dessous.
        </p>
      )}

      <form onSubmit={gererSoumission} noValidate>
        <div className="champ">
          <label htmlFor="plateaux">Plateaux (dents, séparés par une virgule)</label>
          <input
            id="plateaux"
            type="text"
            value={plateauxTexte}
            onChange={(e) => gererChangementPlateaux(e.target.value)}
            aria-invalid={!!erreurs.plateaux_dents}
          />
          {erreurs.plateaux_dents && (
            <p className="erreur" role="alert">
              {erreurs.plateaux_dents}
            </p>
          )}
        </div>

        <div className="champ champ-double">
          <div>
            <label htmlFor="cassette-min">Cassette — petit pignon</label>
            <input
              id="cassette-min"
              type="number"
              value={entrees.cassette_dents_min}
              onChange={(e) => setEntrees({ ...entrees, cassette_dents_min: Number(e.target.value) })}
              aria-invalid={!!erreurs.cassette_dents_min}
            />
            {erreurs.cassette_dents_min && (
              <p className="erreur" role="alert">
                {erreurs.cassette_dents_min}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="cassette-max">Cassette — grand pignon</label>
            <input
              id="cassette-max"
              type="number"
              value={entrees.cassette_dents_max}
              onChange={(e) => setEntrees({ ...entrees, cassette_dents_max: Number(e.target.value) })}
              aria-invalid={!!erreurs.cassette_dents_max}
            />
            {erreurs.cassette_dents_max && (
              <p className="erreur" role="alert">
                {erreurs.cassette_dents_max}
              </p>
            )}
          </div>
        </div>

        <div className="champ">
          <label htmlFor="derailleur">Dérailleur arrière</label>
          <select
            id="derailleur"
            value={entrees.derailleur_id}
            onChange={(e) => setEntrees({ ...entrees, derailleur_id: e.target.value })}
          >
            {derailleursTries.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nom} — pignon max {d.cog_max_dents}T, capacité {d.capacite_totale_dents}T
              </option>
            ))}
          </select>
          {erreurs.derailleur_id && (
            <p className="erreur" role="alert">
              {erreurs.derailleur_id}
            </p>
          )}
          <p className="aide">
            Liste volontairement non exhaustive (voir la note en bas de page) — dites-nous si votre
            modèle manque.
          </p>
        </div>

        <button type="submit">Vérifier</button>
      </form>

      {resultat && (
        <div className="resultat" role="status">
          <p className="resultat-principal">
            {resultat.compatible ? 'Compatible' : 'Non compatible'}
          </p>
          <p className="aide">
            Capacité nécessaire : {resultat.capacite_necessaire_dents} dents — capacité du{' '}
            {resultat.derailleur.nom} : {resultat.derailleur.capacite_totale_dents} dents (
            {resultat.capacite_ok ? 'suffisante' : 'dépassée'}).
          </p>
          <p className="aide">
            Grand pignon : {entrees.cassette_dents_max} dents — maximum supporté :{' '}
            {resultat.derailleur.cog_max_dents} dents ({resultat.cog_ok ? 'dans la limite' : 'dépassé'}).
          </p>
          {!resultat.compatible && (
            <p className="aide">
              Une transmission qui dépasse ces limites peut ne pas passer certains rapports, ou dans
              le pire cas endommager le dérailleur ou la patte de dérailleur.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
