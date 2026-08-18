---
title: 'Comment on calcule la longueur d’une chaîne de vélo'
description: "Une chaîne trop courte force sur la transmission et peut casser un dérailleur ; trop longue, elle déraille. La formule qui donne le bon nombre de maillons, et ses limites."
datePublication: 2026-08-18
outilLie: '/outils/mecanique/longueur-chaine'
---

Remplacer une chaîne semble simple : on compte les maillons de l'ancienne, on coupe la neuve pareil. Le problème, c'est que si l'ancienne était déjà mal dimensionnée — ou si vous avez changé de cassette ou de plateaux entre-temps — vous reproduisez l'erreur plutôt que de la corriger.

## Pourquoi la longueur exacte compte

**Trop courte**, la chaîne empêche le dérailleur arrière de fonctionner sur toute sa course. Dans le pire des cas — grand plateau, grand pignon — elle peut littéralement arracher la patte de dérailleur ou bloquer la transmission en pleine effort.

**Trop longue**, elle a du mou que le dérailleur n'arrive plus à rattraper, surtout sur les petits plateaux/petits pignons : elle ballotte, saute, et s'use plus vite.

## La formule utilisée par ce calculateur

Notre [calculateur de longueur de chaîne](/outils/mecanique/longueur-chaine) applique une méthode reconnue et documentée par plusieurs sources indépendantes (calculateurs spécialisés vélo, eux-mêmes citant Park Tool) :

> Longueur (en pouces) = 2 × longueur des bases + (dents du plus grand plateau) / 4 + (dents du plus grand pignon) / 4 + 1

Convertie en nombre de maillons, arrondie au nombre **pair** supérieur — une chaîne referme toujours un maillon intérieur sur un maillon extérieur, donc sa longueur est nécessairement paire.

**Un cas particulier mérite d'être signalé** : sur une transmission mono-plateau (1x) avec une cassette dont le plus grand pignon fait 42 dents ou plus — courant en gravel et VTT avec les cassettes 10-51 ou 10-52 — le dérailleur à chape longue a besoin de 2 maillons de plus que ne le prédit la formule de base, pour absorber sa course plus importante. Notre calculateur applique automatiquement ce correctif quand la situation le justifie.

## Ce que la formule ne remplace pas

C'est une formule déterministe : mêmes chiffres en entrée, même résultat en sortie, à chaque fois. Ça en fait un excellent point de départ, mais deux choses restent à vérifier à l'atelier :

- **La combinaison la plus extrême** (grand plateau + grand pignon) ne doit jamais être utilisée en roulant de toute façon — mais il faut vérifier que la chaîne ne force pas dessus, même sans y rouler.
- **Le passage aux petits plateaux/petits pignons** doit rester fluide, sans mou excessif que le dérailleur ne rattrape plus.

Si vous avez déjà un vélo qui roule bien avec sa chaîne actuelle et que vous remplacez à l'identique, comptez simplement les maillons de l'ancienne — c'est plus fiable que n'importe quelle formule. Le calculateur sert surtout quand vous changez de composants (nouvelle cassette, nouveaux plateaux) ou montez un vélo neuf.
