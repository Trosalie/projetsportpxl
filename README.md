# 🏆 SportPXL Dashboard

**SportPXL Dashboard** est une application web destinée à centraliser et simplifier la gestion des flux financiers entre les photographes et l’organisation d’évènements de la plateforme **SportPXL**.

---

## 🌍 Contexte

**SportPXL** est une plateforme permettant aux photographes et aux organisateurs d’évènements sportifs de :
- Stocker leurs photos en ligne
- Les proposer à la vente
- Identifier automatiquement les sportifs sur les clichés (via reconnaissance faciale, numéro de dossard, ou identification du véhicule : voiture, moto, vélo, bateau, etc.)

La publication d’une photo nécessite des **crédits** :
- Chaque publication consomme un crédit.
- Les utilisateurs peuvent recharger leurs crédits via :
  - Un **abonnement Stripe**
  - Un **achat direct de crédits**, générant une **facture Pennylane**, avant ajout des crédits via **ForestAdmin**

---

## ⚙️ Problématique

La gestion multi-outils (Stripe, Pennylane, ForestAdmin) rend l’expérience utilisateur confuse et peu traçable :

- Les utilisateurs ne savent pas où retrouver leurs factures.
- Les administrateurs doivent générer manuellement des factures sur Pennylane lors de l’ajout de crédits.
- Aucun suivi clair n’existe sur les flux financiers internes.

---

## 🎯 Objectif du projet

Développer une **application web unifiée** offrant une interface **dashboard** pour centraliser et visualiser tous les flux financiers de SportPXL.

---

## 🧩 Périmètre fonctionnel

Le produit final devra permettre :

### 👤 Gestion des utilisateurs et des rôles
- Système d’authentification et de gestion des droits d’accès.
- Deux types d’utilisateurs :
  - **Photographe**
  - **Administrateur**

### 📸 Côté Photographe
- Consulter ses **flux financiers** : crédits, factures, abonnements.
- Visualiser et **filtrer ses factures**.

### 🧾 Côté Administrateur
- Accéder aux informations financières de chaque photographe.
- **Ajouter des crédits** à un photographe via un formulaire dédié.
- **Effectuer un versement de chiffre d’affaires (CA)** à un photographe.
- **Suivre l’historique** des ajouts de crédits et des versements.
