// Schéma pédagogique de la coupe de jante — ajouté suite au retour
// utilisateur du 21/08/2026 : deux besoins couverts par un seul schéma
// pour rester lisible :
//  1. Montrer où se mesure la largeur interne (flèche entre les parois),
//     pour les visiteurs qui ne savent pas où placer leur pied à coulisse.
//  2. Faire apparaître visuellement la différence crochet / hookless quand
//     on change le type de jante dans le formulaire, pour que les moins
//     initiés comprennent de quoi il s'agit sans avoir à chercher ailleurs.
// Schéma volontairement simplifié et non côté à l'échelle — voir la légende.

interface Props {
  typeJante: 'hooked' | 'hookless';
}

export default function SchemaJante({ typeJante }: Props) {
  const hooked = typeJante === 'hooked';

  return (
    <figure className="schema-jante">
      <svg
        viewBox="0 0 240 170"
        role="img"
        aria-label={
          hooked
            ? 'Coupe de jante à crochet : la largeur interne se mesure entre les parois, sous les crochets qui retiennent le talon du pneu.'
            : 'Coupe de jante hookless : parois droites sans crochet, la largeur interne se mesure directement entre les parois.'
        }
      >
        <text x="120" y="20" textAnchor="middle" className="schema-jante-titre">
          {hooked ? 'Jante à crochet (hooked)' : 'Jante hookless'}
        </text>
        <text x="120" y="34" textAnchor="middle" className="schema-jante-sous-titre">
          {hooked ? 'Le crochet retient le talon du pneu.' : 'Paroi droite — pneu tubeless requis (29 mm mini).'}
        </text>

        {/* Fond de jante (lit de rayons) */}
        <path className="schema-jante-trait" d="M95,140 L145,140" />
        {/* Parois */}
        <path className="schema-jante-trait" d="M95,140 L55,55" />
        <path className="schema-jante-trait" d="M145,140 L185,55" />

        {hooked ? (
          <>
            <path className="schema-jante-trait" d="M55,55 C50,40 75,38 75,52 C75,60 62,60 60,52" />
            <path className="schema-jante-trait" d="M185,55 C190,40 165,38 165,52 C165,60 178,60 180,52" />
          </>
        ) : (
          <>
            <circle className="schema-jante-embout" cx="55" cy="55" r="4" />
            <circle className="schema-jante-embout" cx="185" cy="55" r="4" />
          </>
        )}

        {/* Cote de largeur interne */}
        <line className="schema-jante-cote" x1="64" y1="79" x2="176" y2="79" />
        <path className="schema-jante-fleche" d="M64,79 l9,-5 l0,10 Z" />
        <path className="schema-jante-fleche" d="M176,79 l-9,-5 l0,10 Z" />
        <text x="120" y="72" textAnchor="middle" className="schema-jante-label">
          Largeur interne (ici)
        </text>
      </svg>
      <figcaption className="aide">Schéma illustratif (coupe de jante), pas à l’échelle.</figcaption>
    </figure>
  );
}
