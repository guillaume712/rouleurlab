---
title: "Crr et CdA : ce qui pèse vraiment sur votre vitesse"
description: "Au-delà de la puissance et du poids, deux paramètres décident de votre vitesse à effort égal : la résistance au roulement (Crr) et la traînée aérodynamique (CdA). Ce qu'ils sont, et comment les faire baisser."
datePublication: 2026-08-19
outilLie: '/outils/course/pacing'
---

Deux cyclistes qui développent exactement la même puissance ne roulent pas forcément à la même vitesse. Au-delà du poids et de la pente, deux paramètres physiques expliquent l'essentiel de l'écart : la résistance au roulement (Crr) et la traînée aérodynamique (CdA). Notre [outil de plan de puissance](/outils/course/pacing) les utilise directement pour convertir une puissance en vitesse estimée.

## Le Crr : ce que vos pneus vous coûtent en énergie

Le coefficient de résistance au roulement mesure l'énergie perdue par la déformation du pneu et son frottement sur la route à chaque tour de roue. Il dépend de trois choses principales : le pneu lui-même (sa gomme, sa carcasse), la surface roulée, et la pression.

**La pression n'est pas "plus c'est gonflé, mieux c'est".** C'est sans doute l'idée reçue la plus tenace en cyclisme. Des tests indépendants (notamment ceux réalisés par Silca) montrent qu'il existe un optimum, pas une relation strictement croissante : au-delà d'une certaine pression, les performances se dégradent à nouveau. Trop gonflé, un pneu rebondit sur les irrégularités de la route au lieu de les absorber — chaque micro-rebond dissipe de l'énergie en vibrations, en plus de réduire l'adhérence. Trop peu gonflé, c'est la déformation de la carcasse elle-même qui consomme de l'énergie, avec en prime un risque accru de crevaison par pincement. La pénalité de vitesse d'un pneu légèrement sous-gonflé reste généralement plus faible que celle d'un pneu trop gonflé — dans le doute, mieux vaut pécher par le bas. La pression optimale dépend du poids du cycliste, de la largeur du pneu et de l'état de la route : il n'y a pas de chiffre universel, seulement des repères de fourchette selon votre configuration.

**La surface change tout.** C'est ce qu'on utilise pour les valeurs par défaut de notre outil de pacing selon le type de pratique : un pneu route sur asphalte lisse tourne autour de 0,005, quand un pneu VTT sur terrain dégradé peut monter autour de 0,020 — quatre fois plus de résistance, à puissance égale, uniquement à cause de la surface et du pneu. Le détail des sources utilisées est documenté directement dans le code de l'outil.

## Le CdA : pourquoi l'aérodynamisme domine à haute vitesse

Le CdA combine le coefficient de traînée (la forme, plus ou moins pénétrante dans l'air) et la surface frontale exposée au vent, en m². Contrairement au Crr, qui pèse à peu près proportionnellement à la vitesse, la résistance aérodynamique augmente avec le **carré** de la vitesse de l'air relative (vitesse au sol + vent de face). Concrètement : rouler deux fois plus vite ne double pas la résistance de l'air, il la quadruple.

C'est pour ça que l'aérodynamisme devient rapidement le facteur dominant au-delà d'une certaine allure (généralement située autour de 25 à 30 km/h sur terrain plat) : à ce régime, la majorité de votre puissance ne sert plus à vaincre le poids ou le frottement des pneus, mais à fendre l'air. Une position plus couchée (mains en bas de cintre plutôt que sur les cocottes) réduit sensiblement la surface frontale exposée, souvent plus efficacement qu'un gain de puissance équivalent en watts.

## Ce que ça change concrètement

À FTP identique, un cycliste en position aérodynamique sur pneus fins bien gonflés à la bonne pression ira significativement plus vite qu'un cycliste en position redressée sur pneus larges et mal gonflés — c'est tout l'intérêt de distinguer Crr et CdA plutôt que de tout ramener à "la puissance". C'est aussi pour ça que notre [outil de plan de puissance](/outils/course/pacing) applique des valeurs par défaut différentes selon que vous roulez en route, gravel, VTT ou ville plutôt qu'un jeu de paramètres unique — voir aussi [route, gravel, VTT, ville : ce qui change vraiment dans les réglages](/blog/route-gravel-vtt-ville-reglages).

Sources : BikeRadar, "Road bike tyre pressure: how to find the best pressure" (consulté le 19/08/2026), pour l'existence d'un optimum de pression et les tests Silca cités ; sources détaillées par type de pratique (Best Bike Split, AeroX, Velodrome.shop, tests Chung Method de John Karrasch) documentées dans le code source de l'outil de plan de puissance.
