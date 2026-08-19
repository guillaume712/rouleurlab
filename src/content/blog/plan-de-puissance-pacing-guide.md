---
title: "Pourquoi un plan de puissance n'est pas une prédiction"
description: "FTP, W', puissance normalisée : ce que mesure vraiment un plan de pacing, pourquoi c'est une heuristique et pas un optimum, et ce qu'il ne peut pas prévoir."
datePublication: 2026-08-19
outilLie: '/outils/course/pacing'
---

Un plan de puissance vous dit "roulez à tant de watts sur ce tronçon" comme s'il s'agissait d'une certitude. Ce n'est pas le cas : c'est une estimation construite sur un modèle physique et physiologique, avec des hypothèses qu'il vaut mieux connaître avant de s'y fier à 100 %.

## Ce que le calcul modélise réellement

Le cœur du calcul est un modèle physique publié (Martin et al., 1998) qui relie la puissance que vous développez à la vitesse que vous pouvez tenir, en fonction de la pente, du poids (vous + vélo), de la résistance de l'air (traînée aérodynamique, notée CdA) et de la résistance au roulement de vos pneus (Crr). À partir de là, l'outil cherche la puissance constante la plus élevée que vous pourriez tenir sur l'ensemble du parcours sans dépasser deux limites : votre puissance normalisée (une moyenne qui pénalise les efforts irréguliers) ne doit pas dépasser un pourcentage de votre FTP, et votre réserve d'effort au-dessus du seuil — le **W'** (prononcé "w prime"), popularisé par le modèle de Skiba — ne doit jamais tomber à sec.

Une fois cette puissance de base trouvée, l'outil la module : un peu plus dans les montées, un peu moins dans le plat et les descentes, selon une heuristique simple ("plus la pente est raide par rapport à la moyenne, plus on pousse"). C'est une bonne approximation de ce que font intuitivement les cyclistes expérimentés, mais ce n'est pas un optimum mathématique au watt près.

## Pourquoi ce n'est pas une prédiction météo

Trois choses distinguent volontairement ce plan d'une promesse chiffrée :

**Le W' par défaut est une moyenne, pas la vôtre.** Le calcul part de 20 000 joules si vous ne renseignez rien, une valeur plausible pour un cycliste entraîné — mais le W' réel varie énormément d'un individu à l'autre (souvent entre 15 000 et 30 000 J) et ne se mesure fiablement qu'avec un protocole de test dédié (puissance critique). Si votre W' réel est très différent, le plan sera trop optimiste ou trop prudent.

**Le modèle de fatigue cumulative n'est pas inclus dans cette version.** Sur les efforts très longs, la littérature récente montre que la puissance soutenable décline progressivement après un certain volume de travail accumulé. Cette version de l'outil suppose une puissance critique constante du début à la fin — raisonnable sur une sortie de quelques heures, plus optimiste sur un ultra-effort de plusieurs dizaines d'heures.

**Le vent n'est qu'une valeur unique.** Contrairement à un vrai tracé GPS, l'outil ne connaît pas le cap suivi à chaque instant : le vent "de face" que vous indiquez est appliqué uniformément sur tout le parcours, pas recalculé virage par virage.

## À quoi ça sert quand même

Malgré ces limites, ce type de calcul reste utile pour une chose précise : éviter l'erreur classique du départ trop rapide. Beaucoup de cyclistes partent à une puissance intuitive qui semble confortable au kilomètre 5 et qui vide leur réserve bien avant l'arrivée. Voir, tronçon par tronçon, où votre W'bal (la réserve restante) est censé descendre le plus bas donne un repère concret pour lever le pied à temps — même si le chiffre exact affiché n'est pas à prendre au watt près.

Notre [calculateur de plan de puissance](/outils/course/pacing) applique ce modèle à votre parcours découpé en tronçons, avec le détail (sources, formules, limites) affiché directement avec le résultat.
