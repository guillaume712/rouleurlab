import { useEffect, useState } from 'react';
import type { Velo } from '@/types';
import { getVelos } from '@/lib/storage/profilLocal';
import {
  calculerCompatibilitePneuJante,
  validerEntreesCompatibilitePneuJante,
  type EntreesCompatibilitePneuJante,
  type ResultatCompatibilitePneuJante,
  type TypeJante,
} from '@/lib/calculs/compatibilitePneuJante';

const VALEURS_PAR_DEFAUT: EntreesCompatibilitePneuJante = {
  largeur_jante_interne_mm: 21,
  largeur_pneu_mm: 32,
  type_jante: 'hooked',
};

const LIBELLES_VERDICT: Record<ResultatCompatibilitePneuJante['verdict'], string> = {
  recommande: 'Recommandé',
  tolere: 'Toléré — à vérifier',
  non_recommande: 'Non recommandé',
  hors_couverture: 'Hors de la couverture de cet outil',
};

const CLASSES_VERDICT: Record<ResultatCompatibilitePneuJante['verdict'], string> = {
  recommande: 'resultat--recommande',
  tolere: 'resultat--tolere',
  non_recommande: 'resultat--non-recommande',
  hors_couverture: 'resultat--hors-couverture',
};

export default function CompatibilitePneuJante() {
  const [velos, setVelos] = useState<Velo[]>([]);
  const [veloSelectionneId, setVeloSelectionneId] = useState('');
  const [entrees, setEntrees] = useState<EntreesCompatibilitePneuJante>(VALEURS_PAR_DEFAUT);
  const [erreurs, setErreurs] = useState<Partial<Record<keyof EntreesCompatibilitePneuJante, string>>>({});
  const [resultat, setResultat] = useState<ResultatCompatibilitePneuJante | null>(null);

  useEffect(() => {
    setVelos(getVelos());
  }, []);

  function appliquerVelo(id: string) {
    setVeloSelectionneId(id);
    if (!id) return;
    const velo = velos.find((v) => v.id === id);
    if (!velo) return;
    setEntrees({
      ...entrees,
      largeur_jante_interne_mm: velo.jante_largeur_interne_mm,
      largeur_pneu_mm: velo.pneu_largeur_mm,
    });
    setResultat(null);
    setErreurs({});
  }

  function gererSoumission(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const nouvellesErreurs = validerEntreesCompatibilitePneuJante(entrees);
    setErreurs(nouvellesErreurs);
    if (Object.keys(nouvellesErreurs).length > 0) {
      setResultat(null);
      return;
    }
    setResultat(calculerCompatibilitePneuJante(entrees));
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
          <p className="aide">
            Le type de jante (à crochet / hookless) n’est pas enregistré dans le garage — à choisir
            ci-dessous à chaque fois.
          </p>
        </div>
      )}
      {velos.length === 0 && (
        <p className="aide">
          Aucun vélo enregistré dans <a href="/mon-garage">votre garage</a> — saisissez les valeurs
          manuellement ci-dessous.
        </p>
      )}

      <form onSubmit={gererSoumission} noValidate>
        <div className="champ champ-double">
          <div>
            <label htmlFor="largeur-jante">Largeur interne de jante (mm)</label>
            <input
              id="largeur-jante"
              type="number"
              value={entrees.largeur_jante_interne_mm}
              onChange={(e) =>
                setEntrees({ ...entrees, largeur_jante_interne_mm: Number(e.target.value) })
              }
              aria-invalid={!!erreurs.largeur_jante_interne_mm}
            />
            {erreurs.largeur_jante_interne_mm && (
              <p className="erreur" role="alert">
                {erreurs.largeur_jante_interne_mm}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="largeur-pneu">Largeur de pneu (mm)</label>
            <input
              id="largeur-pneu"
              type="number"
              value={entrees.largeur_pneu_mm}
              onChange={(e) => setEntrees({ ...entrees, largeur_pneu_mm: Number(e.target.value) })}
              aria-invalid={!!erreurs.largeur_pneu_mm}
            />
            {erreurs.largeur_pneu_mm && (
              <p className="erreur" role="alert">
                {erreurs.largeur_pneu_mm}
              </p>
            )}
          </div>
        </div>

        <div className="champ">
          <label htmlFor="type-jante">Type de jante</label>
          <select
            id="type-jante"
            value={entrees.type_jante}
            onChange={(e) => setEntrees({ ...entrees, type_jante: e.target.value as TypeJante })}
          >
            <option value="hooked">À crochet (hooked) — le standard historique</option>
            <option value="hookless">Hookless (tubeless à paroi droite)</option>
          </select>
        </div>

        <button type="submit">Vérifier</button>
      </form>

      {resultat && (
        <div className={`resultat ${CLASSES_VERDICT[resultat.verdict]}`} role="status">
          <p className="resultat-principal">{LIBELLES_VERDICT[resultat.verdict]}</p>

          {resultat.verdict === 'hors_couverture' && (
            <p className="aide">
              Cet outil ne couvre que les jantes dont la largeur interne est comprise entre 19 et 25
              mm (données vérifiées). En dehors de cette plage, vérifiez les spécifications du
              fabricant de votre jante.
            </p>
          )}

          {resultat.regle_hookless_appliquee && (
            <p className="aide">
              Règle ISO/ETRTO : sur jante hookless, la largeur minimale de pneu est de 29 mm, quelle
              que soit la largeur de la jante. C’est cette règle qui détermine le verdict ici, avant
              même de regarder la plage largeur/largeur.
            </p>
          )}

          {resultat.plage_recommandee_mm && resultat.plage_toleree_mm && (
            <p className="aide">
              Plage recommandée : {resultat.plage_recommandee_mm[0]}–{resultat.plage_recommandee_mm[1]}{' '}
              mm. Plage tolérée (à vérifier davantage) : {resultat.plage_toleree_mm[0]}–
              {resultat.plage_toleree_mm[1]} mm.
            </p>
          )}

          <p className="aide">
            Rappel indépendant de la largeur : le diamètre de jante (BSD) doit être strictement
            identique entre le pneu et la jante (622 mm pour 700C/29″, 584 mm pour 650B/27,5″, 559 mm
            pour 26″) — ce n’est pas une plage, c’est une compatibilité binaire à vérifier séparément.
          </p>
        </div>
      )}
    </div>
  );
}
