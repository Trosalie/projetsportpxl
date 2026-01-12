[![Contributors][contributors-shield]][https://github.com/Trosalie/projetsportpxl/settings/access]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![Unlicense License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]
![Laravel](https://img.shields.io/badge/laravel-%23FF2D20.svg?style=for-the-badge&logo=laravel&logoColor=white) ![Angular](https://img.shields.io/badge/angular-%23DD0031.svg?style=for-the-badge&logo=angular&logoColor=white) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white) ![Jira](https://img.shields.io/badge/jira-%230A0FFF.svg?style=for-the-badge&logo=jira&logoColor=white)
# BoardPxl

Tableau de bord financier pour la plateforme SportPXL permettant aux photographes et administrateurs de gérer leurs factures, crédits et versements de manière centralisée.

## 📋 À propos

BoardPxl centralise la gestion des flux financiers de SportPXL :
- Suivi des abonnements Stripe
- Gestion des crédits photographes
- Historique des factures
- Versements de chiffre d'affaires

## 🚀 Technologies

- **Frontend**: Angular
- **Backend**: Laravel (PHP)
- **Base de données**: MySQL/PostgreSQL
- **Intégrations**: Stripe, Pennylane, ForestAdmin
- **Conteneurisation**: Docker

## 📦 Prérequis

- Docker et Docker Compose
- Node.js 18+ (pour le développement frontend)
- PHP 8.1+ (pour le développement backend)
- Composer

## 🛠️ Installation

### 1. Cloner le projet

```bash
git clone <repository-url>
cd projetsportpxl
```

### 2. Configuration avec Docker

Le projet utilise Docker Compose pour orchestrer les services frontend et backend.

```bash
# Lancer tous les services
docker-compose up -d

# Vérifier que les conteneurs sont actifs
docker-compose ps
```

### 3. Configuration du Backend (Laravel)

```bash
# Accéder au répertoire backend
cd boardpxl-backend

# Copier le fichier d'environnement
cp .env.example .env

# Installer les dépendances
composer install

# Générer la clé d'application
php artisan key:generate

# Lancer les migrations
php artisan migrate

# (Optionnel) Charger les données de test
php artisan db:seed
```

### 4. Configuration du Frontend (Angular)

```bash
# Accéder au répertoire frontend
cd boardpxl-frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm start
```

### 5. Variables d'environnement

#### Backend (.env)
```env
APP_NAME=BoardPxl
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=boardpxl
DB_USERNAME=root
DB_PASSWORD=

STRIPE_KEY=
STRIPE_SECRET=
PENNYLANE_API_KEY=
```

#### Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

## 🚀 Utilisation

Une fois les services lancés :

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8000
- **Base de données**: localhost:3306

## 👥 Rôles utilisateurs

### Administrateur
- Gestion des utilisateurs
- Génération de factures (crédits, versements)
- Vue globale des flux financiers
- Consultation des historiques

### Photographe
- Consultation de l'historique des factures
- Visualisation du solde de crédits
- Demande de versement

## 📝 Commandes utiles

### Docker
```bash
# Démarrer les services
docker-compose up -d

# Arrêter les services
docker-compose down

# Voir les logs
docker-compose logs -f

# Rebuild les images
docker-compose build
```

### Backend
```bash
# Tests
php artisan test

# Générer des données de test
php artisan db:seed

# Clear cache
php artisan cache:clear
```

### Frontend
```bash
# Build production
npm run build

# Tests
npm test

# Linter
npm run lint
```

## 📁 Structure du projet

```
projetsportpxl/
├── boardpxl-backend/     # API Laravel
│   ├── app/              # Logique métier
│   ├── database/         # Migrations & seeders
│   └── routes/           # Routes API
├── boardpxl-frontend/    # Application Angular
│   └── src/
│       └── app/          # Composants & services
└── docker-compose.yml    # Configuration Docker
```

## 🔧 Développement

### Installation locale sans Docker

#### Backend
```bash
cd boardpxl-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

#### Frontend
```bash
cd boardpxl-frontend
npm install
npm start
```

## 🐛 Dépannage

### Problèmes courants

**Erreur de connexion à la base de données**
```bash
# Vérifier que le conteneur MySQL est actif
docker-compose ps

# Vérifier les logs
docker-compose logs db
```

**Port déjà utilisé**
```bash
# Modifier les ports dans docker-compose.yml
# ou arrêter les services qui utilisent les ports 4200, 8000, 3306
```

**Permissions Docker (Linux/Mac)**
```bash
sudo usermod -aG docker $USER
# Redémarrer la session
```

## 🤝 Contribution

1. Créer une branche depuis `develop`
2. Faire vos modifications
3. Créer une Pull Request

### Convention de nommage des branches
- `feature/nom-feature` : Nouvelle fonctionnalité
- `fix/nom-bug` : Correction de bug
- `refactor/nom-refactor` : Refactorisation

## 📄 Licence

Projet interne SportPXL
