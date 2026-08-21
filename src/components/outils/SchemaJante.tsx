// Schéma pédagogique de la coupe de jante — ajouté suite au retour
// utilisateur du 21/08/2026, puis retravaillé le même jour car la première
// version (traits fins non remplis) ne ressemblait à rien de concret.
// Version actuelle : une jante (gris métal) et un pneu monté dessus (foncé),
// pour que la coupe se lise comme "une roue", pas comme une forme abstraite.
// Deux besoins couverts par un seul schéma :
//  1. Montrer où se mesure la largeur interne (cote avec lignes d'attache,
//     comme un plan technique), pour qui ne sait pas où placer son pied à
//     coulisse.
//  2. Faire apparaître visuellement la différence crochet / hookless quand
//     on change le type de jante dans le formulaire : le petit crochet qui
//     vient capter le talon du pneu apparaît ou disparaît en direct.
// Schéma volontairement simplifié et non côté à l'échelle — voir la légende.

interface Props {
  typeJante: 'hooked' | 'hookless';
}

export default function SchemaJante({ typeJante }: Props) {
  const hooked = typeJante === 'hooked';

  return (
    <figure className="schema-jante">
      <svg
        viewBox="0 0 240 178"
        role="img"
        aria-label={
          hooked
            ? 'Coupe de jante à crochet, avec un pneu monté dessus : le crochet capte le talon du pneu par-dessus. La largeur interne se mesure entre les deux parois, au niveau du siège du talon.'
            : 'Coupe de jante hookless, avec un pneu monté dessus : parois droites, sans crochet — le talon repose simplement dessus. La largeur interne se mesure entre les deux parois.'
        }
      >
        <text x="120" y="13" textAnchor="middle" className="schema-jante-titre">
          {hooked ? 'Jante à crochet (hooked)' : 'Jante hookless'}
        </text>

        {/* Cote de largeur interne, façon plan technique : lignes d'attache + ligne de cote fléchée. */}
        <line className="schema-jante-attache" x1="58" y1="40" x2="58" y2="93" />
        <line className="schema-jante-attache" x1="182" y1="40" x2="182" y2="93" />
        <line className="schema-jante-cote" x1="58" y1="40" x2="182" y2="40" />
        <path className="schema-jante-fleche" d="M58,40 l10,-4 l0,8 Z" />
        <path className="schema-jante-fleche" d="M182,40 l-10,-4 l0,8 Z" />
        <text x="120" y="30" textAnchor="middle" className="schema-jante-label">
          Largeur interne
        </text>

        {/* Pneu (dessous des crochets, dessus des parois) */}
        <path
          className="schema-jante-pneu"
          d="M70,97 C60,90 58,70 65,65 Q120,50 175,65 C182,70 180,90 170,97 Q120,109 70,97 Z"
        />
        <path className="schema-jante-pneu-reflet" d="M83,68 Q120,57 157,68" />

        {/* Jante (corps) */}
        <path
          className="schema-jante-rim"
          d="M80,165 C65,165 58,145 58,95 Q120,113 182,95 C182,145 175,165 160,165 Z"
        />

        {/* Crochet, uniquement sur jante à crochet — vient se refermer par-dessus le talon du pneu. */}
        {hooked && (
          <>
            <path className="schema-jante-rim" d="M58,95 C52,84 68,77 77,87 C81,93 75,101 68,99 Z" />
            <path className="schema-jante-rim" d="M182,95 C188,84 172,77 163,87 C159,93 165,101 172,99 Z" />
          </>
        )}
      </svg>
      <figcaption className="aide">
        {hooked
          ? 'Le crochet vient se refermer par-dessus le talon du pneu pour le retenir.'
          : 'Paroi droite, sans crochet — nécessite un pneu tubeless conçu pour l’hookless (29 mm mini).'}{' '}
        Schéma illustratif, pas à l’échelle.
      </figcaption>
    </figure>
  );
}
