import { useEffect, useState } from 'react';
import type { Velo } from '@/types';
import { getVelos } from '@/lib/storage/profilLocal';
import {
  calculerLongueurChaine,
  validerEntreesLongueurChaine,
  type EntreesLongueurChaine,
  type ResultatLongueurChaine,
} from '@/lib/calculs/longueurChaine';

const VALEURS_PAR_DEFAUT: EntreesLongueurChaine = {
  longueur_hauban_mm: 410,
  plateaux_dents: [50, 34],
  cassette_dents_max: 32,
};

export default function LongueurChaine() {
  const [velos, setVelos] = useState<Velo[]>([]);
  const [veloSelectionneId, setVeloSelectionneId] = useState<string>('');
  const [entrees, setEntrees] = useState<EntreesLongueurChaine>(VALEURS_PAR_DEFAUT);
  const [plateauxTexte, setPlateauxTexte] = useState('50, 34');
  const [erreurs, setErreurs] = useState<Partial<Record<keyof EntreesLongueurChaine, string>>>({});
  const [resultat, setResultat] = useState<ResultatLongueurChaine | null>(null);

  // Chargé côté client uniquement : on propose le garage s'il existe, sans
  // jamais bloquer l'outil si aucun vélo n'est enregistré (Étape 3, critère
  // d'acceptation : dégradation propre sans garage renseigné).
  useEffect(() => {
    setVelos(getVelos());
  }, []);

  function appliquerVelo(id: string) {
    setVeloSelectionneId(id);
    if (!id) return;
    const velo = velos.find((v) => v.id === id);
    if (!velo) return;
    setEntrees({
      longueur_hauban_mm: velo.longueur_hauban_mm,
      plateaux_dents: velo.plateaux_dents,
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
    const nouvellesErreurs = validerEntreesLongueurChaine(entrees);
    setErreurs(nouvellesErreurs);
    if (Object.keys(nouvellesErreurs).length > 0) {
      setResultat(null);
      return;
    }
    setResultat(calculerLongueurChaine(entrees));
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
          manuellement ci-dessous, ou renseignez votre garage pour pré-remplir ce formulaire la
          prochaine fois.
        </p>
      )}

      <form onSubmit={gererSoumission} noValidate>
        <div className="champ">
          <label htmlFor="hauban">Longueur du hauban (mm)</label>
          <input
            id="hauban"
            type="number"
            value={entrees.longueur_hauban_mm}
            onChange={(e) => setEntrees({ ...entrees, longueur_hauban_mm: Number(e.target.value) })}
            aria-invalid={!!erreurs.longueur_hauban_mm}
          />
          {erreurs.longueur_hauban_mm && (
            <p className="erreur" role="alert">
              {erreurs.longueur_hauban_mm}
            </p>
          )}
        </div>

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

        <div className="champ">
          <label htmlFor="cassette-max">Cassette — plus grand pignon (dents)</label>
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

        <button type="submit">Calculer</button>
      </form>

      {resultat && (
        <div className="resultat" role="status">
          <p className="resultat-principal">
            {resultat.nombre_maillons} maillons ({resultat.longueur_mm.toFixed(1)} mm)
          </p>
          {resultat.ajustement_mono_plateau && (
            <p className="aide">
              Ajustement de +2 maillons appliqué : transmission mono-plateau avec un pignon de 42
              dents ou plus, ce qui nécessite une course de dérailleur plus longue.
            </p>
          )}
          <p className="aide">
            Méthodologie : cette formule (2 × bases + plateau/4 + cassette/4 + 1, en pouces, arrondi
            au nombre pair de maillons supérieur) est un point de départ fiable, mais un réglage
            fin en atelier reste recommandé — en particulier pour vérifier que la chaîne passe sans
            forcer sur la combinaison plateau + pignon la plus extrême.
          </p>
        </div>
      )}
    </div>
  );
}
