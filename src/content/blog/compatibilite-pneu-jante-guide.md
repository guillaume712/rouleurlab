---
title: 'Pneu et jante : pourquoi la largeur seule ne suffit pas'
description: "Un pneu qui rentre physiquement sur une jante n'est pas forcément un montage sûr. Ce qui compte vraiment : la plage recommandée, le diamètre, et une règle spécifique aux jantes modernes hookless."
datePublication: 2026-08-18
outilLie: '/outils/mecanique/compatibilite-pneu-jante'
---

Un pneu qui se monte sans forcer sur une jante ne veut pas dire que la combinaison est sûre à rouler. C'est une confusion fréquente, et elle a de vraies conséquences : un pneu trop étroit pour sa jante peut se déjanter en virage ou en cas de crevaison lente, un pneu trop large peut déformer son profil et perdre en tenue de route.

## La règle générale : une plage, pas une seule largeur

La norme ETRTO (l'organisation qui standardise les dimensions pneu/jante en Europe) définit, pour chaque largeur interne de jante, une plage de largeurs de pneu recommandées — pas un chiffre unique. Une jante de 21 mm de large en interne, par exemple, est documentée compatible avec des pneus allant grossièrement de 25 à 40 mm : en dessous, le pneu manque de soutien latéral ; au-dessus, son profil s'aplatit et perd de son efficacité.

Notre [calculateur de compatibilité pneu/jante](/outils/mecanique/compatibilite-pneu-jante) applique cette logique à partir de plusieurs points de repère documentés (nous n'avons pas accès au tableau officiel ETRTO, qui est un document payant), et affiche toujours une plage recommandée et une plage tolérée plus large — jamais une seule valeur présentée comme la seule bonne réponse.

## Le cas des jantes hookless

Une évolution récente et importante : de plus en plus de jantes, notamment en carbone, sont conçues sans le petit crochet qui retenait traditionnellement le talon du pneu (on parle de jantes "hookless" ou "tubeless à paroi droite"). Sur ce type de jante, la norme ISO/ETRTO impose une largeur de pneu minimale de 29 mm, **quelle que soit la largeur de la jante** — en dessous, le risque de déjantage sous pression est jugé trop élevé.

C'est une règle binaire qui prime sur la plage largeur/largeur habituelle : notre calculateur l'applique automatiquement dès que vous indiquez une jante hookless.

## Ce que la largeur ne couvre pas : le diamètre

Complètement indépendamment de la largeur, le diamètre de la jante (ce qu'on appelle le BSD, "bead seat diameter") doit être **strictement identique** entre le pneu et la jante : 622 mm pour du 700C/29 pouces, 584 mm pour du 650B/27,5 pouces, 559 mm pour du 26 pouces. Ce n'est pas une question de plage tolérée — un écart de diamètre empêche le pneu de se monter correctement, point final. Notre outil ne vérifie pas ce critère (il n'est pas encore collecté dans le profil de vélo) ; c'est un point à vérifier vous-même en comparant les inscriptions ETRTO gravées sur le pneu et sur la jante (par exemple "28-622" pour un pneu 700x28c).

En cas de doute sur une combinaison précise, les spécifications du fabricant — imprimées sur le pneu ou publiées par le fabricant de la jante — prévalent toujours sur un outil générique comme celui-ci.
