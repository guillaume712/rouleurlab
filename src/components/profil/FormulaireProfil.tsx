import { useEffect, useState } from 'react';
import type { NiveauCycliste, Profil } from '@/types';
import { getProfil, sauvegarderProfil, validerProfil } from '@/lib/storage/profilLocal';

const LIBELLES_NIVEAU: Record<NiveauCycliste, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  confirme: 'Confirmé',
  expert: 'Expert',
};

export default function FormulaireProfil() {
  const [profil, setProfil] = useState<Profil | null>(null);
  const [erreurs, setErreurs] = useState<Partial<Record<keyof Profil, string>>>({});
  const [enregistre, setEnregistre] = useState(false);

  // Chargé côté client uniquement (localStorage n'existe pas au moment du rendu serveur).
  useEffect(() => {
    setProfil(getProfil());
  }, []);

  if (!profil) {
    return <p aria-live="polite">Chargement de votre profil…</p>;
  }

  function gererSoumission(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profil) return;

    const nouvellesErreurs = validerProfil(profil);
    setErreurs(nouvellesErreurs);
    if (Object.keys(nouvellesErreurs).length > 0) {
      setEnregistre(false);
      return;
    }

    sauvegarderProfil(profil);
    setEnregistre(true);
  }

  return (
    <form onSubmit={gererSoumission} noValidate>
      <div className="champ">
        <label htmlFor="poids_kg">Poids (kg)</label>
        <input
          id="poids_kg"
          type="number"
          min={30}
          max={200}
          step={0.5}
          value={profil.poids_kg}
          onChange={(e) => setProfil({ ...profil, poids_kg: Number(e.target.value) })}
          aria-invalid={!!erreurs.poids_kg}
          aria-describedby={erreurs.poids_kg ? 'erreur-poids' : undefined}
        />
        {erreurs.poids_kg && (
          <p id="erreur-poids" className="erreur" role="alert">
            {erreurs.poids_kg}
          </p>
        )}
      </div>

      <div className="champ">
        <label htmlFor="niveau">Niveau</label>
        <select
          id="niveau"
          value={profil.niveau}
          onChange={(e) => setProfil({ ...profil, niveau: e.target.value as NiveauCycliste })}
        >
          {Object.entries(LIBELLES_NIVEAU).map(([valeur, libelle]) => (
            <option key={valeur} value={valeur}>
              {libelle}
            </option>
          ))}
        </select>
        <p className="aide">Utilisé pour adapter les plafonds de glucides en course.</p>
      </div>

      <div className="champ">
        <label htmlFor="ftp_w">FTP (watts, facultatif)</label>
        <input
          id="ftp_w"
          type="number"
          min={30}
          max={600}
          value={profil.ftp_w ?? ''}
          onChange={(e) =>
            setProfil({ ...profil, ftp_w: e.target.value === '' ? null : Number(e.target.value) })
          }
          aria-invalid={!!erreurs.ftp_w}
          aria-describedby={erreurs.ftp_w ? 'erreur-ftp' : undefined}
        />
        {erreurs.ftp_w && (
          <p id="erreur-ftp" className="erreur" role="alert">
            {erreurs.ftp_w}
          </p>
        )}
        <p className="aide">Si vous ne le connaissez pas, laissez vide — l’outil de pacing proposera une estimation.</p>
      </div>

      <button type="submit">Enregistrer</button>
      {enregistre && (
        <p role="status" className="confirmation">
          Profil enregistré dans votre navigateur.
        </p>
      )}
      <p className="aide">
        Ces données restent dans votre navigateur (aucun compte requis, aucune donnée envoyée à un serveur).
      </p>
    </form>
  );
}
