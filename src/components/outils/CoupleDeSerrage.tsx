import { useMemo, useState } from 'react';
import { TABLE_COUPLE_SERRAGE } from '@/lib/calculs/coupleSerrage';

export default function CoupleDeSerrage() {
  const [filtre, setFiltre] = useState('');

  const entrees = useMemo(() => {
    const recherche = filtre.trim().toLowerCase();
    if (!recherche) return TABLE_COUPLE_SERRAGE;
    return TABLE_COUPLE_SERRAGE.filter(
      (e) =>
        e.composant.toLowerCase().includes(recherche) || e.categorie.toLowerCase().includes(recherche),
    );
  }, [filtre]);

  return (
    <div>
      <label htmlFor="filtre-couple" className="aide" style={{ display: 'block', marginBottom: '0.35rem' }}>
        Rechercher un composant
      </label>
      <input
        id="filtre-couple"
        type="search"
        className="filtre-recherche"
        placeholder="ex. potence, cassette, disque…"
        value={filtre}
        onChange={(e) => setFiltre(e.target.value)}
      />

      <div className="table-reference-conteneur">
        <table className="table-reference">
          <caption>
            {entrees.length} composant{entrees.length > 1 ? 's' : ''} affiché{entrees.length > 1 ? 's' : ''}
          </caption>
          <thead>
            <tr>
              <th scope="col">Composant</th>
              <th scope="col">Catégorie</th>
              <th scope="col">Couple (N·m)</th>
            </tr>
          </thead>
          <tbody>
            {entrees.map((e) => (
              <tr key={e.id}>
                <td>
                  {e.composant}
                  {e.note && <span className="note">{e.note}</span>}
                </td>
                <td>{e.categorie}</td>
                <td className="valeur">
                  {e.couple_min_nm === e.couple_max_nm
                    ? `${e.couple_min_nm} N·m`
                    : `${e.couple_min_nm}–${e.couple_max_nm} N·m`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {entrees.length === 0 && <p>Aucun composant ne correspond à « {filtre} ».</p>}
      </div>
    </div>
  );
}
