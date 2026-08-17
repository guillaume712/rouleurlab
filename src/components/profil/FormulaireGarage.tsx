import { useEffect, useState } from 'react';
import type { TypePratique, Velo } from '@/types';
import {
  getVeloParDefaut,
  getVelos,
  sauvegarderVelo,
  supprimerVelo,
  validerVelo,
} from '@/lib/storage/profilLocal';

const LIBELLES_TYPE: Record<TypePratique, string> = {
  route: 'Route',
  gravel: 'Gravel',
  vtt: 'VTT',
  ville: 'Ville',
};

/** Brouillon de formulaire : les plateaux sont saisis en texte ("50, 34") puis parsés à la validation. */
interface Brouillon extends Omit<Velo, 'plateaux_dents'> {
  plateaux_dents_texte: string;
}

function veloVersBrouillon(velo: Velo): Brouillon {
  const { plateaux_dents, ...reste } = velo;
  return { ...reste, plateaux_dents_texte: plateaux_dents.join(', ') };
}

function brouillonVersVelo(brouillon: Brouillon): Velo {
  const { plateaux_dents_texte, ...reste } = brouillon;
  const plateaux_dents = plateaux_dents_texte
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
  return { ...reste, plateaux_dents };
}

export default function FormulaireGarage() {
  const [velos, setVelos] = useState<Velo[] | null>(null);
  const [brouillon, setBrouillon] = useState<Brouillon | null>(null);
  const [erreurs, setErreurs] = useState<Partial<Record<keyof Velo, string>>>({});

  useEffect(() => {
    setVelos(getVelos());
  }, []);

  if (!velos) {
    return <p aria-live="polite">Chargement de votre garage…</p>;
  }

  function ouvrirNouveauVelo() {
    setBrouillon(veloVersBrouillon(getVeloParDefaut()));
    setErreurs({});
  }

  function ouvrirEdition(velo: Velo) {
    setBrouillon(veloVersBrouillon(velo));
    setErreurs({});
  }

  function gererSuppression(id: string) {
    supprimerVelo(id);
    setVelos(getVelos());
    if (brouillon && brouillon.id === id) setBrouillon(null);
  }

  function gererSoumission(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!brouillon) return;

    const velo = brouillonVersVelo(brouillon);
    const nouvellesErreurs = validerVelo(velo);
    setErreurs(nouvellesErreurs);
    if (Object.keys(nouvellesErreurs).length > 0) return;

    sauvegarderVelo(velo);
    setVelos(getVelos());
    setBrouillon(null);
  }

  return (
    <div>
      <ul className="liste-velos">
        {velos.length === 0 && <p>Aucun vélo enregistré pour l’instant.</p>}
        {velos.map((velo) => (
          <li key={velo.id}>
            <span>
              {velo.nom} — {LIBELLES_TYPE[velo.type_pratique]}
            </span>
            <button type="button" onClick={() => ouvrirEdition(velo)}>
              Modifier
            </button>
            <button type="button" onClick={() => gererSuppression(velo.id)}>
              Supprimer
            </button>
          </li>
        ))}
      </ul>

      {!brouillon && (
        <button type="button" onClick={ouvrirNouveauVelo}>
          Ajouter un vélo
        </button>
      )}

      {brouillon && (
        <form onSubmit={gererSoumission} noValidate>
          <div className="champ">
            <label htmlFor="nom">Nom du vélo</label>
            <input
              id="nom"
              type="text"
              value={brouillon.nom}
              onChange={(e) => setBrouillon({ ...brouillon, nom: e.target.value })}
              aria-invalid={!!erreurs.nom}
            />
            {erreurs.nom && <p className="erreur" role="alert">{erreurs.nom}</p>}
          </div>

          <div className="champ">
            <label htmlFor="type_pratique">Type de pratique</label>
            <select
              id="type_pratique"
              value={brouillon.type_pratique}
              onChange={(e) =>
                setBrouillon({ ...brouillon, type_pratique: e.target.value as TypePratique })
              }
            >
              {Object.entries(LIBELLES_TYPE).map(([valeur, libelle]) => (
                <option key={valeur} value={valeur}>
                  {libelle}
                </option>
              ))}
            </select>
          </div>

          <div className="champ">
            <label htmlFor="plateaux_dents_texte">Plateaux (dents, séparés par une virgule)</label>
            <input
              id="plateaux_dents_texte"
              type="text"
              placeholder="ex. 50, 34"
              value={brouillon.plateaux_dents_texte}
              onChange={(e) => setBrouillon({ ...brouillon, plateaux_dents_texte: e.target.value })}
              aria-invalid={!!erreurs.plateaux_dents}
            />
            {erreurs.plateaux_dents && <p className="erreur" role="alert">{erreurs.plateaux_dents}</p>}
            <p className="aide">Utilisé par l’outil de longueur de chaîne.</p>
          </div>

          <div className="champ champ-double">
            <div>
              <label htmlFor="cassette_dents_min">Cassette — petit pignon</label>
              <input
                id="cassette_dents_min"
                type="number"
                value={brouillon.cassette_dents_min}
                onChange={(e) =>
                  setBrouillon({ ...brouillon, cassette_dents_min: Number(e.target.value) })
                }
                aria-invalid={!!erreurs.cassette_dents_min}
              />
              {erreurs.cassette_dents_min && (
                <p className="erreur" role="alert">{erreurs.cassette_dents_min}</p>
              )}
            </div>
            <div>
              <label htmlFor="cassette_dents_max">Cassette — grand pignon</label>
              <input
                id="cassette_dents_max"
                type="number"
                value={brouillon.cassette_dents_max}
                onChange={(e) =>
                  setBrouillon({ ...brouillon, cassette_dents_max: Number(e.target.value) })
                }
                aria-invalid={!!erreurs.cassette_dents_max}
              />
              {erreurs.cassette_dents_max && (
                <p className="erreur" role="alert">{erreurs.cassette_dents_max}</p>
              )}
            </div>
          </div>

          <div className="champ">
            <label htmlFor="cassette_vitesses">Nombre de vitesses</label>
            <input
              id="cassette_vitesses"
              type="number"
              value={brouillon.cassette_vitesses}
              onChange={(e) =>
                setBrouillon({ ...brouillon, cassette_vitesses: Number(e.target.value) })
              }
              aria-invalid={!!erreurs.cassette_vitesses}
            />
            {erreurs.cassette_vitesses && (
              <p className="erreur" role="alert">{erreurs.cassette_vitesses}</p>
            )}
            <p className="aide">Utilisé par l’outil de compatibilité cassette/dérailleur.</p>
          </div>

          <div className="champ">
            <label htmlFor="longueur_hauban_mm">Longueur du hauban (mm)</label>
            <input
              id="longueur_hauban_mm"
              type="number"
              value={brouillon.longueur_hauban_mm}
              onChange={(e) =>
                setBrouillon({ ...brouillon, longueur_hauban_mm: Number(e.target.value) })
              }
              aria-invalid={!!erreurs.longueur_hauban_mm}
            />
            {erreurs.longueur_hauban_mm && (
              <p className="erreur" role="alert">{erreurs.longueur_hauban_mm}</p>
            )}
            <p className="aide">Se trouve souvent dans la fiche technique du cadre. Utilisé par l’outil de longueur de chaîne.</p>
          </div>

          <div className="champ champ-double">
            <div>
              <label htmlFor="pneu_largeur_mm">Largeur de pneu (mm)</label>
              <input
                id="pneu_largeur_mm"
                type="number"
                value={brouillon.pneu_largeur_mm}
                onChange={(e) =>
                  setBrouillon({ ...brouillon, pneu_largeur_mm: Number(e.target.value) })
                }
                aria-invalid={!!erreurs.pneu_largeur_mm}
              />
              {erreurs.pneu_largeur_mm && (
                <p className="erreur" role="alert">{erreurs.pneu_largeur_mm}</p>
              )}
            </div>
            <div>
              <label htmlFor="jante_largeur_interne_mm">Largeur interne de jante (mm)</label>
              <input
                id="jante_largeur_interne_mm"
                type="number"
                value={brouillon.jante_largeur_interne_mm}
                onChange={(e) =>
                  setBrouillon({ ...brouillon, jante_largeur_interne_mm: Number(e.target.value) })
                }
                aria-invalid={!!erreurs.jante_largeur_interne_mm}
              />
              {erreurs.jante_largeur_interne_mm && (
                <p className="erreur" role="alert">{erreurs.jante_largeur_interne_mm}</p>
              )}
            </div>
          </div>
          <p className="aide">Utilisées par l’outil de compatibilité pneu/jante (norme ETRTO).</p>

          <button type="submit">Enregistrer ce vélo</button>
          <button type="button" onClick={() => setBrouillon(null)}>
            Annuler
          </button>
        </form>
      )}

      <p className="aide">
        Ces données restent dans votre navigateur (aucun compte requis, aucune donnée envoyée à un serveur).
      </p>
    </div>
  );
}
