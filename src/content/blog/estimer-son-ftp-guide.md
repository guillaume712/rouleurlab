---
title: "Comment estimer son FTP sans laboratoire (et pourquoi ce chiffre bouge)"
description: "Test de 20 minutes, test de 8 minutes, test en rampe : trois protocoles de terrain pour estimer sa FTP, leurs coefficients, leurs limites, et pourquoi ce n'est jamais un chiffre définitif."
datePublication: 2026-08-19
outilLie: '/outils/course/pacing'
---

La FTP (puissance seuil fonctionnelle) ne se mesure directement qu'en laboratoire, avec un protocole d'effort incrémental et des prélèvements sanguins pour repérer précisément le seuil physiologique. Sur le terrain, on ne fait qu'une chose : on l'**estime**, à partir d'un effort maximal plus court, corrigé par un coefficient. Trois protocoles dominent, avec des compromis différents entre durée, fiabilité et facilité.

## Le test de 20 minutes

Après un échauffement complet, on roule 20 minutes à la puissance maximale soutenable, en gérant son effort comme un contre-la-montre (pas un sprint suivi d'un effondrement). La puissance moyenne de ces 20 minutes est ensuite multipliée par **0,95** pour estimer la FTP.

C'est le protocole le plus répandu et le plus documenté, mais il demande une vraie préparation mentale : mal géré (départ trop rapide), il sous-estime la FTP réelle.

## Le test de 8 minutes (× 2)

Après échauffement, deux efforts maximaux de 8 minutes chacun, séparés par 10 minutes de récupération facile. On retient la puissance moyenne du meilleur des deux (ou la moyenne des deux, selon les logiciels), multipliée par **0,90**.

Plus court et donc plus reproductible pour beaucoup de cyclistes, mais le coefficient 0,90 est une estimation plus grossière que le test de 20 minutes — les deux protocoles ne donnent pas toujours exactement le même résultat pour un même cycliste.

## Le test en rampe ("ramp test")

Démarrage à 100 W, puis palier de puissance augmenté de 20 W chaque minute jusqu'à l'échec (impossibilité de tenir la cadence cible). La FTP est estimée par un algorithme (intégré à des plateformes comme Zwift ou TrainerRoad) à partir de la puissance et de la durée du dernier palier tenu ; en calcul manuel simplifié, on multiplie la puissance du dernier palier complet par **0,75**.

Le plus court des trois (une quinzaine de minutes en général) et le moins exigeant mentalement — mais aussi le moins directement comparable aux deux autres, car il sollicite des filières énergétiques différentes.

## Pourquoi ce chiffre n'est jamais gravé dans le marbre

Trois raisons concrètes de ne pas traiter votre FTP comme une constante :

**Ce n'est pas la même chose que la puissance critique (CP).** La FTP est un concept pragmatique, pensé pour être mesurable sur le terrain. La puissance critique est un concept plus théorique, issu du modèle hyperbolique de la relation puissance-durée décrit par Monod et Scherrer dès 1965 : elle correspond au débit métabolique le plus élevé qu'un corps peut maintenir en équilibre physiologique stable. Chez un même cycliste, CP et FTP peuvent différer sensiblement — chez certains, la CP est même supérieure à la FTP. Notre [outil de plan de puissance](/outils/course/pacing) utilise FTP ÷ 0,96 comme approximation de la CP quand elle n'est pas connue précisément, une simplification pragmatique, pas une équivalence exacte.

**Elle change avec la forme du moment.** Un pic de forme après un bloc de travail spécifique, une période de fatigue accumulée, une contre-performance liée à une mauvaise nuit ou une chaleur inhabituelle : chacun de ces éléments influence le résultat d'un test ponctuel. Trois tests à trois moments différents de la saison peuvent légitimement donner trois chiffres différents.

**Le protocole choisi influence le résultat.** Les trois tests ci-dessus ne mesurent pas exactement la même chose ni avec la même marge d'erreur — comparer une FTP issue d'un test en rampe à une FTP issue d'un test de 20 minutes, sans le préciser, revient à comparer deux mesures partiellement différentes.

En pratique : retestez régulièrement (toutes les 6 à 8 semaines en période d'entraînement structuré est une fréquence courante), gardez toujours le même protocole d'un test à l'autre pour rester comparable avec vous-même, et traitez le chiffre obtenu comme une estimation utile pour caler un plan de puissance — pas comme une vérité physiologique absolue.

## Où renseigner votre FTP

Une fois estimée, indiquez-la dans [votre profil](/profil) : elle est reprise automatiquement par notre [outil de plan de puissance](/outils/course/pacing) et par la [fiche Préparer ma sortie](/outils/course/preparer-ma-sortie).

Sources : Chris Carmichael / CTS, "FTP Tests: How to perform 20-Minute, 8-Minute, and Ramp Tests" (trainright.com, consulté le 19/08/2026) pour les protocoles et coefficients ; TrainingPeaks, "FTP vs. Critical Power" (consulté le 19/08/2026) pour la distinction FTP/CP et la référence à Monod &amp; Scherrer (1965).
