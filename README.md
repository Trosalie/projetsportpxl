# 💻 BoardPxl

**BoardPxl (1)** est une application web destinée à centraliser et simplifier la gestion des flux financiers pour les photographes.
##### *(1) BoardPxl est un surnom donné à l'application pour signifier Tableau de bord SportPxl*
---

## 🌍 Contexte

**SportPXL** est une plateforme permettant aux photographes et aux organisateurs d’évènements sportifs de :
- Stocker leurs photos en ligne
- Les proposer à la vente
- Identifier automatiquement les sportifs sur les clichés (via reconnaissance faciale, numéro de dossard, ou identification du véhicule : voiture, moto, vélo, bateau, etc.)

La publication d’une photo nécessite des **crédits** :
- Chaque publication consomme un crédit.
- Les utilisateurs peuvent recharger leurs crédits via :
  - Un **abonnement Stripe (1)**
  - Un **achat direct de crédits** (géré manuellement via l'outil **ForestAdmin (2)** de la part des administrateurs)

A la fin de chaque mois ou sur demande de photographe, un versement de chiffre d'affaires est effectué de la part de SportPxl vers les photographes individuellement.

 Ces trois opérations engendrent chacune une génération de facture (de façon automatique pour Stripe, et manuellement pour l'achat direct de crédits et le versement de chiffre d'affaires) pris en charge via l'outil **Pennylane (3)**

##### *(1) Stripe est une plateforme de paiement en ligne qui permet aux entreprises d'accepter et de gérer des transactions sur Internet*
##### *(2) ForestAdmin est une plateforme d'administration low-code qui permet de créer rapidement des interfaces internes pour gérer les données et opérations d'une application*
##### *(3) Pennylane est une plateforme de gestion financière et comptable qui centralise comptabilité, facturation et pilotage pour les entreprises et leurs experts-comptables*
---

## ⚙️ Problématique

La multiplicité des outils et des générations de factures rend complexe l'expérience utilisateur :

- Pour les photographes qui n'ont pas de trace de leurs factures.
- Pour les administrateurs qui doivent générer manuellement des factures sur Pennylane lors de l’ajout de crédits et de versement de chiffre d'affaires.
- Aucun suivi clair n’existe sur les flux financiers internes pour les administrateurs et les photographes.

---

## 🎯 Objectif du projet

Proposer une **application web** offrant une interface **tableau de bord** pour centraliser et visualiser tous les flux financiers de SportPXL et permettre :
- Aux administrateurs de :
	- Générer les factures de versement de chiffre d'affaires
	- Générer les factures d'ajout de crédits
	- Visualiser la liste des utilisateurs
	- Visualiser par photographe l'historique des factures
- Aux photographes de :
	- Visualiser l'historique des factures
	- Visualiser leur solde de crédits
	- Demander un versement de chiffre d'affaires

---
## 📂 Hiérarchisation du projet
