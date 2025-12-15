## BoardPxl
BoardPxl est une application web interne conçue pour centraliser, structurer et simplifier la gestion des flux financiers liés à l’activité des photographes utilisant la plateforme SportPXL.
BoardPxl est le nom donné au tableau de bord financier de SportPXL.

## Contexte
SportPXL est une plateforme permettant aux photographes et aux organisateurs d’évènements sportifs de :
Stocker leurs photos en ligne
Les proposer à la vente
Identifier automatiquement les sportifs sur les clichés (reconnaissance faciale, numéro de dossard ou identification du véhicule : voiture, moto, vélo, bateau, etc.)
La publication d’une photo nécessite des crédits : Chaque publication consomme un crédit.
Les crédits peuvent être rechargés via :
Un abonnement Stripe
Un achat direct de crédits, géré manuellement par les administrateurs via ForestAdmin
À la fin de chaque mois, ou sur demande d’un photographe, un versement de chiffre d’affaires est effectué par SportPXL vers le photographe concerné.
Ces différentes opérations (abonnements, achats de crédits, versements) génèrent chacune des factures, prises en charge par l’outil de gestion comptable Pennylane.


## Problématique
La multiplication des outils (Stripe, ForestAdmin, Pennylane) et des types de facturation rend le suivi financier complexe :
Les photographes ne disposent pas d’une vision claire et centralisée de leurs factures et revenus
Les administrateurs doivent gérer manuellement certaines factures, sans outil de suivi global
Aucun tableau de bord unique ne permet de visualiser l’ensemble des flux financiers

## Objectif du projet
L’objectif de BoardPxl est de proposer une application web de type tableau de bord permettant de centraliser, visualiser et suivre l’ensemble des flux financiers de SportPXL.
L’application vise à améliorer :
-La lisibilité des informations financières
-Le suivi des factures
-L’expérience utilisateur des photographes et des administrateurs

## Fonctionnalités principale
Administrateurs:
Visualisation de la liste des utilisateurs
Consultation des flux financiers globaux
Génération des factures d’ajout de crédits
Génération des factures de versement de chiffre d’affaires
Consultation de l’historique des factures par photographe

Photographes:
Consultation de l’historique des factures
Visualisation du solde de crédits
Demande de versement de chiffre d’affaires


## Rôles utilisateurs
BoardPxl repose sur deux rôles distincts :
Administrateur SportPXL : gestion des utilisateurs, des factures et des flux financiers
Photographe : consultation de ses données financières et demandes de versement

## Flux financiers gérés
BoardPxl permet de suivre et centraliser :
Les abonnements Stripe
Les achats directs de crédits
Les versements de chiffre d’affaires
Les factures associées à chaque opération

## Périmètre et limites
BoardPxl ne gère pas :
Les paiements directs
La vente de photos
Le stockage ou la gestion des images
L’application se concentre exclusivement sur le suivi et la visualisation des données financières.

## Architecture & technologies
Frontend : Application web (React, Next.js ou équivalent)
Backend : API applicative (Node.js, NestJS, Laravel ou équivalent)
Base de données : PostgreSQL / MySQL / MongoDB
Outils externes : Stripe, Pennylane, ForestAdmin

## Hiérarchisation du projet
Le projet est organisé autour de :
Une séparation claire entre logique métier et interface utilisateur
Une gestion centralisée des données financières
Une distinction des fonctionnalités selon les rôles utilisateurs
Cette structuration vise à garantir la lisibilité, la maintenabilité et l’évolutivité de l’application.

## Conclusion
BoardPxl s’inscrit comme un outil interne stratégique pour SportPXL, permettant de fiabiliser et simplifier la gestion financière tout en offrant une meilleure transparence aux photographes.
Le projet répond à un besoin concret de centralisation et de clarté des données financières dans un environnement multi-outils.



