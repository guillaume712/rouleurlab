---
title: "Route, gravel, VTT, ville : ce qui change vraiment dans les réglages"
description: "Le type de pratique ne change pas que la taille des pneus. Un tour d'horizon de ce qui diffère réellement — pression, transmission, résistance au roulement, position — et pourquoi ça compte pour vos calculs."
datePublication: 2026-08-19
outilLie: '/mon-garage'
---

"Route", "gravel", "VTT", "ville" : sur RouleurLab, ce choix n'est pas qu'une case à cocher pour trier vos vélos dans le garage — il change réellement les valeurs par défaut utilisées par certains calculateurs, notamment le [plan de puissance](/outils/course/pacing). Voici ce qui diffère concrètement d'une pratique à l'autre, et pourquoi ça a un impact mesurable.

## La résistance au roulement (Crr) : le plus grand écart

C'est le paramètre qui varie le plus selon la pratique. Un pneu route fin sur asphalte lisse tourne autour d'un Crr de 0,005 ; un pneu gravel sur chemin roulant se situe plutôt autour de 0,010 ; un pneu VTT sur terrain technique peut approcher 0,020 — quatre fois la résistance d'un pneu route, à puissance identique. Le détail est expliqué dans [Crr et CdA : ce qui pèse vraiment sur votre vitesse](/blog/crr-cda-guide).

Concrètement, ça veut dire qu'un même cycliste, à la même puissance, ira nettement moins vite en VTT qu'en route — pas seulement parce que le terrain est plus technique, mais parce que chaque tour de roue coûte objectivement plus d'énergie.

## La position et l'aérodynamisme (CdA)

Route (mains sur les cocottes ou en bas de cintre) offre la position la plus couchée et donc la plus pénétrante dans l'air. Le gravel, avec des cintres souvent plus larges et une position légèrement plus redressée pour la maniabilité sur terrain irrégulier, dégrade un peu ce facteur. Le VTT et surtout le vélo de ville, en position redressée, exposent une surface frontale nettement plus grande au vent. Sur le plat à allure modérée, cet écart pèse moins que le Crr ; il devient dominant à mesure que la vitesse augmente.

## La transmission et les développements

Un vélo de route vise des développements adaptés à une cadence soutenue sur du plat ou des pentes modérées. Le gravel et le VTT, confrontés à des pentes plus raides et des surfaces plus exigeantes, ont besoin de plus grands écarts de développement (cassettes plus larges, souvent mono-plateau) pour garder une cadence tenable en montée sans excéder la capacité du dérailleur — c'est exactement ce que vérifie notre [outil de compatibilité cassette/dérailleur](/outils/mecanique/compatibilite-cassette-derailleur).

## Le poids du vélo

Un vélo de route en carbone tourne souvent autour de 7 à 9 kg, un gravel équipé un peu plus lourd (9 à 11 kg selon les accessoires), un VTT tout-suspendu ou un vélo de ville utilitaire nettement plus (12 à 16 kg et plus). Sur du plat, ce poids compte peu ; en montée, il s'ajoute directement à l'effort à fournir à chaque mètre de dénivelé.

## Pourquoi ça compte pour vos calculs

Ces différences ne sont pas anecdotiques : elles expliquent pourquoi notre [outil de plan de puissance](/outils/course/pacing) applique des paramètres vélo différents (Crr, CdA, masse) selon le type de pratique renseigné pour votre vélo dans [votre garage](/mon-garage), plutôt qu'un seul jeu de valeurs "moyennes" qui serait faux pour à peu près tout le monde. Si vous connaissez la masse exacte de votre vélo, indiquez-la dans les options avancées de l'outil — les valeurs par défaut ne sont que des ordres de grandeur plausibles pour chaque pratique, pas votre configuration précise.

Sources : détail des valeurs de Crr et CdA par type de pratique, avec citations et dates de consultation, documenté directement dans le code source de l'outil de plan de puissance (voir aussi [Crr et CdA : ce qui pèse vraiment sur votre vitesse](/blog/crr-cda-guide)).
