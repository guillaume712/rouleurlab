import { useEffect, useRef, useState } from 'react';

// Menu déroulant personnalisé — remplace <select> là où l'apparence du
// panneau ouvert compte (le popup d'un <select> natif est dessiné par le
// système et n'accepte quasiment aucun style CSS : pas de coins arrondis,
// pas d'ombre, pas d'espacement). Reproduit le comportement clavier/souris
// standard d'un menu déroulant (patron ARIA "listbox" piloté par un bouton) :
// flèches pour naviguer, Entrée/Espace pour valider, Échap pour fermer, clic
// extérieur pour fermer, focus rendu au bouton après sélection.
//
// Volontairement limité aux besoins actuels (une seule valeur, liste de
// libellés courts) plutôt qu'un composant générique tous usages — plus
// simple à auditer et à maintenir correct côté accessibilité.

export interface OptionSelectPerso {
  value: string;
  label: string;
}

interface Props {
  id: string;
  value: string;
  onChange: (valeur: string) => void;
  options: OptionSelectPerso[];
  ariaInvalide?: boolean;
}

export default function SelectPerso({ id, value, onChange, options, ariaInvalide }: Props) {
  const [ouvert, setOuvert] = useState(false);
  const [indexActif, setIndexActif] = useState(0);
  const conteneurRef = useRef<HTMLDivElement>(null);
  const listeRef = useRef<HTMLUListElement>(null);

  const indexSelectionne = options.findIndex((o) => o.value === value);
  const libelleAffiche = indexSelectionne >= 0 ? options[indexSelectionne].label : '';

  useEffect(() => {
    function surClicExterieur(e: MouseEvent) {
      if (conteneurRef.current && !conteneurRef.current.contains(e.target as Node)) {
        setOuvert(false);
      }
    }
    document.addEventListener('mousedown', surClicExterieur);
    return () => document.removeEventListener('mousedown', surClicExterieur);
  }, []);

  useEffect(() => {
    if (!ouvert) return;
    setIndexActif(indexSelectionne >= 0 ? indexSelectionne : 0);
    // On ne dépend volontairement que de `ouvert` : on ne veut resynchroniser
    // l'option active sur la sélection courante qu'à l'ouverture du panneau,
    // pas à chaque déplacement clavier à l'intérieur.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ouvert]);

  useEffect(() => {
    if (!ouvert || !listeRef.current) return;
    const optionActive = listeRef.current.children[indexActif] as HTMLElement | undefined;
    optionActive?.scrollIntoView({ block: 'nearest' });
  }, [ouvert, indexActif]);

  function choisir(i: number) {
    onChange(options[i].value);
    setOuvert(false);
  }

  function surClavier(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (!ouvert) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOuvert(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndexActif((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndexActif((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      choisir(indexActif);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOuvert(false);
    } else if (e.key === 'Tab') {
      setOuvert(false);
    }
  }

  return (
    <div className="select-perso" ref={conteneurRef}>
      <button
        type="button"
        id={id}
        className="select-perso__bouton"
        aria-haspopup="listbox"
        aria-expanded={ouvert}
        aria-controls={`${id}-panneau`}
        aria-activedescendant={ouvert ? `${id}-option-${indexActif}` : undefined}
        aria-invalid={ariaInvalide || undefined}
        onClick={() => setOuvert((o) => !o)}
        onKeyDown={surClavier}
      >
        <span>{libelleAffiche}</span>
        <svg
          className={`select-perso__chevron${ouvert ? ' select-perso__chevron--ouvert' : ''}`}
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M5 7.5 10 12.5 15 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {ouvert && (
        <ul id={`${id}-panneau`} className="select-perso__panneau" role="listbox" ref={listeRef}>
          {options.map((o, i) => (
            <li
              key={o.value}
              id={`${id}-option-${i}`}
              role="option"
              aria-selected={o.value === value}
              className={`select-perso__option${i === indexActif ? ' select-perso__option--actif' : ''}${
                o.value === value ? ' select-perso__option--selectionne' : ''
              }`}
              onMouseMove={() => setIndexActif(i)}
              onClick={() => choisir(i)}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
