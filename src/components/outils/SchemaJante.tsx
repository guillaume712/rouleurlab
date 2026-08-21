// Schéma pédagogique de la coupe de jante — retours utilisateur du
// 21/08/2026 :
//  1. Version initiale (traits fins) ne ressemblait à rien de concret ->
//     remplacée par une jante (gris métal) et un pneu monté dessus (foncé).
//  2. La cote alors appelée "largeur interne" touchait en réalité les deux
//     points les plus larges du profil (l'extérieur de la paroi) : sans
//     épaisseur de paroi modélisée, il n'y avait pas de vraie différence
//     entre "dedans" et "dehors" sur le dessin. Corrigé ici en donnant à la
//     jante une vraie épaisseur : une cavité (canal où loge le pneu/la
//     chambre) creusée à l'intérieur du profil plein. La largeur interne
//     est désormais mesurée entre les parois de cette cavité, et la largeur
//     externe entre les bords extérieurs du profil — les deux sont
//     visuellement différentes, comme sur une vraie jante.
// Le crochet (jante hooked) apparaît/disparaît en direct selon le type de
// jante sélectionné dans le formulaire.
// Schéma volontairement simplifié et non côté à l'échelle — voir la légende.

interface Props {
  typeJante: 'hooked' | 'hookless';
}

export default function SchemaJante({ typeJante }: Props) {
  const hooked = typeJante === 'hooked';

  return (
    <figure className="schema-jante">
      <svg
        viewBox="0 0 240 182"
        role="img"
        aria-label={
          hooked
            ? "Coupe de jante à crochet, avec un pneu monté dessus : le crochet capte le talon du pneu par-dessus. La largeur interne se mesure entre les parois du canal intérieur ; la largeur externe se mesure entre les bords extérieurs de la jante, plus large."
            : "Coupe de jante hookless, avec un pneu monté dessus : parois droites, sans crochet. La largeur interne se mesure entre les parois du canal intérieur ; la largeur externe se mesure entre les bords extérieurs de la jante, plus large."
        }
      >
        <text x="120" y="12" textAnchor="middle" className="schema-jante-titre">
          {hooked ? 'Jante à crochet (hooked)' : 'Jante hookless'}
        </text>

        {/* Cote de largeur externe (bords extérieurs de la jante). */}
        <text x="120" y="23" textAnchor="middle" className="schema-jante-label-externe">
          Largeur externe
        </text>
        <line className="schema-jante-attache-externe" x1="50" y1="28" x2="50" y2="95" />
        <line className="schema-jante-attache-externe" x1="190" y1="28" x2="190" y2="95" />
        <line className="schema-jante-cote-externe" x1="50" y1="28" x2="190" y2="28" />
        <path className="schema-jante-fleche-externe" d="M50,28 l10,-4 l0,8 Z" />
        <path className="schema-jante-fleche-externe" d="M190,28 l-10,-4 l0,8 Z" />

        {/* Cote de largeur interne (parois du canal, à l'intérieur de la jante). */}
        <text x="120" y="45" textAnchor="middle" className="schema-jante-label">
          Largeur interne
        </text>
        <line className="schema-jante-attache" x1="70" y1="50" x2="70" y2="104" />
        <line className="schema-jante-attache" x1="170" y1="50" x2="170" y2="104" />
        <line className="schema-jante-cote" x1="70" y1="50" x2="170" y2="50" />
        <path className="schema-jante-fleche" d="M70,50 l10,-4 l0,8 Z" />
        <path className="schema-jante-fleche" d="M170,50 l-10,-4 l0,8 Z" />

        {/* Jante : profil plein (bord extérieur) */}
        <path
          className="schema-jante-rim"
          d="M78,168 C63,168 50,148 50,95 Q120,113 190,95 C190,148 177,168 162,168 Z"
        />
        {/* Canal intérieur (creusé dans le profil plein — sépare largeur interne et externe) */}
        <path
          className="schema-jante-canal"
          d="M95,156 C86,156 70,146 70,104 Q120,118 170,104 C170,146 154,156 145,156 Z"
        />

        {/* Pneu (dessous des crochets, dessus du canal intérieur) */}
        <path
          className="schema-jante-pneu"
          d="M82,106 C72,99 70,79 77,74 Q120,59 163,74 C170,79 168,99 158,106 Q120,118 82,106 Z"
        />
        <path className="schema-jante-pneu-reflet" d="M93,77 Q120,66 147,77" />

        {/* Crochet, uniquement sur jante à crochet — vient se refermer par-dessus le talon du pneu, depuis le bord extérieur. */}
        {hooked && (
          <>
            <path className="schema-jante-rim" d="M50,95 C44,84 60,77 69,87 C73,93 67,101 60,99 Z" />
            <path className="schema-jante-rim" d="M190,95 C196,84 180,77 171,87 C167,93 173,101 180,99 Z" />
          </>
        )}
      </svg>
      <figcaption className="aide">
        {hooked
          ? 'Le crochet vient se refermer par-dessus le talon du pneu pour le retenir.'
          : 'Paroi droite, sans crochet — nécessite un pneu tubeless conçu pour l’hookless (29 mm mini).'}{' '}
        Largeur interne (orange) : entre les parois du canal — c’est cette valeur qui est demandée
        ci-dessous. Schéma illustratif, pas à l’échelle.
      </figcaption>
    </figure>
  );
}
