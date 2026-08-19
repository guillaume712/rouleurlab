---
title: "La réserve W' : pourquoi on ne roule pas à puissance constante indéfiniment"
description: "Le modèle W'balance explique pourquoi un sprint de 500 W tient 20 secondes mais pas 20 minutes, et pourquoi partir trop fort vide une réserve qu'on ne récupère qu'en levant le pied."
datePublication: 2026-08-19
outilLie: '/outils/course/pacing'
---

Vous pouvez rouler indéfiniment (ou presque) à 200 W si c'est sous votre seuil. Vous ne pouvez tenir 500 W que quelques dizaines de secondes. Entre les deux, ce n'est pas juste "plus c'est haut, moins ça dure" de façon vague : il existe un modèle physiologique précis qui décrit cette relation, et c'est ce que notre [outil de plan de puissance](/outils/course/pacing) utilise pour vérifier qu'un plan reste tenable.

## Une réserve, pas juste un seuil

Au-delà de votre puissance critique (CP, une valeur proche de votre FTP), vous disposez d'une réserve d'énergie finie, appelée **W'** (prononcé "w prime"), exprimée en joules. Chaque watt développé au-dessus de la CP puise dans cette réserve ; chaque watt développé en dessous la laisse se reconstituer, mais pas instantanément.

C'est le modèle décrit par Philip Skiba et ses collègues en 2012 (connu sous le nom de "W'balance" ou W'bal), qui formalise mathématiquement une intuition que tout cycliste expérimenté connaît empiriquement : après un effort violent (une côte raide, une attaque, un sprint), il faut du temps à jambes légères pour "recharger" avant de pouvoir refournir un effort intense.

## Pourquoi partir trop fort coûte cher plus tard

L'erreur classique du cycliste qui découvre un nouveau parcours : partir sur une sensation de forme excellente en début de sortie, à une puissance qui semble confortable au bout de 5 minutes — et découvrir, une heure plus tard, qu'il ne reste plus rien dans les jambes pour la dernière difficulté.

Ce qui s'est passé : chaque portion roulée au-dessus de la CP (même modérément) a grignoté la réserve W', et si la récupération sous CP n'a pas été suffisante entre chaque effort, la réserve a fini par s'épuiser. Une fois à zéro, il devient extrêmement difficile de développer une puissance supérieure à la CP, même brièvement — c'est la sensation bien connue de "jambes coupées" en fin d'effort, ou dans le jargon anglophone, "hitting the wall" ou "bonking" côté énergie musculaire pure (à distinguer de l'hypoglycémie, qui est un phénomène nutritionnel différent — voir notre [plan nutrition course](/outils/course/nutrition)).

## Comment le modèle sert concrètement à planifier un effort

Notre [outil de plan de puissance](/outils/course/pacing) simule, tronçon par tronçon, l'évolution de votre W'bal (le niveau de réserve restant) le long du parcours — en tenant compte des relances en montée et de la récupération en descente ou sur le plat. Par défaut, il vise à ne jamais laisser tomber la réserve sous 10 % de sa capacité totale, une marge de sécurité qui laisse une capacité de réaction en cas d'imprévu (regroupement, accélération collective, dernière difficulté plus dure que prévu).

Le W' varie beaucoup d'un individu à l'autre — généralement entre 15 000 et 30 000 joules chez un cycliste entraîné — et ne se mesure fiablement qu'avec un protocole de test dédié. Sans mesure personnelle, notre outil utilise une valeur par défaut de 20 000 J, une moyenne plausible mais pas votre chiffre réel : si vos sensations sur le terrain (vous videz votre réserve plus vite ou plus lentement que prévu par l'outil) s'écartent nettement de l'estimation, ajustez cette valeur dans les options avancées.

Sources : Skiba, P.F. et al. (2012), "Modeling the expenditure and reconstitution of work capacity above critical power", *Medicine &amp; Science in Sports &amp; Exercise* (modèle W'balance) ; Monod, M. &amp; Scherrer, J. (1965), pour le concept fondateur de puissance critique dont dérive le modèle — voir aussi [comment estimer son FTP](/blog/estimer-son-ftp-guide) pour la distinction entre FTP et puissance critique.
