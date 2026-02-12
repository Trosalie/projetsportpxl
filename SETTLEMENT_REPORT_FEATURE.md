# Fonctionnalité de Relevé d'Encaissement - Documentation

## Description

Cette fonctionnalité permet de préremplir automatiquement le champ "Montant total des ventes" (Chiffre d'affaires) dans le formulaire de relevé d'encaissement en récupérant les données des factures de versement.

## Fonctionnement

1. **Sélection du photographe** : Lorsqu'un photographe est sélectionné dans le formulaire
2. **Récupération du dernier relevé** : Le système récupère automatiquement le dernier relevé d'encaissement pour ce photographe
3. **Calcul du CA** : Le système calcule le chiffre d'affaires depuis la date du dernier relevé jusqu'à aujourd'hui
4. **Préremplissage** : Le champ "Montant total des ventes" est automatiquement prérempli avec cette valeur

## Implémentation

### Backend (Laravel)

#### Nouveau Contrôleur : `SettlementReportController.php`

Trois nouvelles méthodes API :

1. **`getLastSettlementReport(Request $request)`**
   - Route : `POST /api/settlement-report/last`
   - Paramètres : `photographer_id`
   - Retourne le dernier relevé d'encaissement pour un photographe

2. **`calculateTurnoverSinceDate(Request $request)`**
   - Route : `POST /api/settlement-report/calculate-turnover`
   - Paramètres : `photographer_id`, `start_date`
   - Calcule le CA total des factures de versement depuis une date donnée

3. **`createSettlementReport(Request $request)`**
   - Route : `POST /api/settlement-report/create`
   - Paramètres : `photographer_id`, `amount`, `commission`, `period_start_date`, `period_end_date`, `status`
   - Crée un nouveau relevé d'encaissement

#### Routes ajoutées dans `api.php`

```php
Route::post('/settlement-report/last', [SettlementReportController::class, 'getLastSettlementReport']);
Route::post('/settlement-report/calculate-turnover', [SettlementReportController::class, 'calculateTurnoverSinceDate']);
Route::post('/settlement-report/create', [SettlementReportController::class, 'createSettlementReport']);
```

### Frontend (Angular)

#### Nouveau Service : `settlement-report-service.ts`

Trois méthodes principales :

1. **`getLastSettlementReport(photographerId: number)`**
   - Récupère le dernier relevé d'encaissement

2. **`calculateTurnoverSinceDate(photographerId: number, startDate: string)`**
   - Calcule le CA depuis une date donnée

3. **`createSettlementReport(report: SettlementReport)`**
   - Crée un nouveau relevé

#### Mise à jour du composant : `settlement-report-form.ts`

Nouvelles fonctionnalités ajoutées :

1. **Map des photographes** : `photographersMap: Map<string, number>`
   - Associe les noms des photographes à leurs IDs

2. **`loadLastReportAndCalculateTurnover(photographerId: number)`**
   - Charge le dernier relevé et calcule le CA
   - Met à jour automatiquement la date de début de période
   - Appelle la méthode de calcul du CA

3. **`calculateAndFillTurnover(photographerId: number, startDate: string)`**
   - Calcule le CA depuis une date donnée
   - Prérempli le champ `totalSalesAmount` avec la valeur calculée

## Flux de données

```
Utilisateur sélectionne un photographe
    ↓
Frontend récupère l'ID du photographe
    ↓
Appel API : getLastSettlementReport(photographer_id)
    ↓
Si un relevé existe :
    - Récupère la date de fin (period_end_date)
    - Met à jour le champ "Début" avec cette date
    ↓
Appel API : calculateTurnoverSinceDate(photographer_id, start_date)
    ↓
Backend récupère toutes les factures de versement (InvoicePayment)
depuis la date de début
    ↓
Calcul de la somme des montants HT (raw_value)
    ↓
Retour du montant calculé au frontend
    ↓
Préremplissage du champ "Montant total des ventes"
```

## Modèles de données

### SettlementReport (Backend)

```php
{
    id: integer,
    photographer_id: integer,
    amount: decimal(10,2),
    commission: decimal(10,2),
    period_start_date: date,
    period_end_date: date,
    status: string, // 'pending', 'validated', 'rejected'
    created_at: timestamp,
    updated_at: timestamp
}
```

### InvoicePayment (Backend)

Les factures utilisées pour calculer le CA :

```php
{
    id: integer,
    number: string,
    issue_date: date,
    raw_value: decimal(10,2), // Montant HT utilisé pour le calcul
    commission: decimal(10,2),
    photographer_id: integer,
    ...
}
```

## Cas d'usage

### Cas 1 : Premier relevé d'encaissement

- Aucun relevé précédent n'existe
- Le système calcule le CA depuis le début (2020-01-01)
- Toutes les factures du photographe sont prises en compte

### Cas 2 : Relevés suivants

- Un ou plusieurs relevés précédents existent
- Le système récupère la date de fin du dernier relevé
- Le CA est calculé uniquement depuis cette date jusqu'à aujourd'hui
- Évite la double comptabilisation

## Notes techniques

- Les requêtes utilisent l'authentification Sanctum (token requis)
- Les erreurs sont loggées via le service `LogService`
- Les calculs utilisent la colonne `raw_value` (montant HT) des factures
- Les dates sont au format ISO (YYYY-MM-DD)
- La gestion des erreurs affiche un message en console mais n'empêche pas l'utilisation du formulaire

## Tests recommandés

1. Sélectionner un photographe sans relevé précédent
2. Sélectionner un photographe avec un ou plusieurs relevés
3. Vérifier que le CA calculé correspond aux factures de la période
4. Vérifier que les dates sont correctement préremplies
5. Tester la gestion des erreurs (photographe inexistant, problème réseau)
