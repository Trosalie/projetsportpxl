<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Issues][issues-shield]][issues-url]
[![Pull Requests][pr-shield]][pr-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/Trosalie/projetsportpxl">
    <img src="https://www.app.sportpxl.com/static/media/logo-white.0384baa8e9b61cb89ab649fee1da120f.svg" alt="Logo Sportpxl" height="80">
  </a>
  <h3 align="center">BoardPxl</h3>

  <p align="center">
    Tableau de bord financier pour SportPXL
    <br />
    <a href="https://trosalie.github.io/projetsportpxl/"><strong>Explorer la documentation »</strong></a>
    <br />
    <br />
    <a href="https://github.com/Trosalie/projetsportpxl/issues">Reporter un Bug</a>
    ·
    <a href="https://github.com/Trosalie/projetsportpxl/issues">Proposer une Fonctionnalité</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table des matières</summary>
  <ol>
    <li>
      <a href="#à-propos-du-projet">À propos du projet</a>
      <ul>
        <li><a href="#construit-avec">Technologies principales</a></li>
      </ul>
    </li>
    <li>
      <a href="#pour-commencer">Pour commencer</a>
      <ul>
        <li><a href="#prérequis">Prérequis</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#utilisation">Utilisation</a></li>
    <!-- <li><a href="#roadmap">Roadmap</a></li> -->
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## À propos du projet

BoardPxl est une application web conçue pour centraliser la gestion des flux financiers de la plateforme SportPXL. Elle permet aux photographes et administrateurs de suivre leurs transactions, gérer leurs crédits et consulter leur historique financier de manière claire et efficace.

**Fonctionnalités principales :**
* Gestion centralisée des factures et transactions
* Suivi des crédits photographes
* Intégration avec Stripe, Pennylane et ForestAdmin
* Tableau de bord intuitif pour photographes et administrateurs

<p align="right">(<a href="#readme-top">retour en haut</a>)</p>

### Technologies principales

Les technologies principales utilisées pour développer BoardPxl :

* [![Angular][Angular.io]][Angular-url]
* [![Laravel][Laravel.com]][Laravel-url]
* [![TypeScript][TypeScript]][TypeScript-url]
* [![Docker][Docker]][Docker-url]
* [![MySQL][MySQL]][MySQL-url]

<p align="right">(<a href="#readme-top">retour en haut</a>)</p>

<!-- GETTING STARTED -->
## Pour commencer

Pour obtenir une copie locale et la faire fonctionner, suivez ces étapes simples.

### Prérequis

Assurez-vous d'avoir les outils suivants installés sur votre machine :

* Docker et Docker Compose
  ```sh
  # Vérifier l'installation de Docker
  docker --version
  docker-compose --version
  ```
* Node.js 18+
  ```sh
  node --version
  npm --version
  ```
* PHP 7.4+ et Composer
  ```sh
  php --version
  composer --version
  ```

### Installation

1. Cloner le repository
   ```sh
   git clone https://github.com/Trosalie/projetsportpxl.git
   cd projetsportpxl
   ```

2. Démarrer les services avec Docker
   ```sh
   docker-compose up -d
   ```

3. Configurer le Backend (Laravel)
   ```sh
   cd boardpxl-backend
   cp .env.example .env
   composer install
   php artisan key:generate
   php artisan migrate
   php artisan db:seed
   ```

4. Configurer le Frontend (Angular)
   ```sh
   cd ../boardpxl-frontend
   npm install
   ```

5. Configurer les variables d'environnement
   
   **Backend** - Modifier `.env` :
   ```env
   DB_CONNECTION=mysql
   DB_HOST=db
   DB_DATABASE=boardpxl
   
   STRIPE_KEY=your_stripe_key
   STRIPE_SECRET=your_stripe_secret
   PENNYLANE_API_KEY=your_pennylane_key
   ```

6. Lancer l'application
   ```sh
   # Le frontend sera accessible sur http://localhost:4200
   ```

<p align="right">(<a href="#readme-top">retour en haut</a>)</p>

<!-- USAGE -->
## Utilisation

BoardPxl propose deux espaces utilisateur distincts :

### Espace Photographe
- Consulter l'historique des factures
- Visualiser le solde de crédits
- Demander un versement de chiffre d'affaires

### Espace Administrateur
- Gérer les utilisateurs de la plateforme
- Générer des factures (crédits, versements)
- Consulter les flux financiers globaux
- Accéder à l'historique complet des transactions

**Commandes utiles :**

```sh
# Démarrer/Arrêter les services
docker-compose up -d
docker-compose down

# Voir les logs
docker-compose logs -f

# Tests Backend
cd boardpxl-backend
php artisan test
```

### Tests & rapport de couverture (backend)

Les tests backend (Laravel) s'exécutent depuis le dossier `boardpxl-backend`.

Exécuter tous les tests :

```sh
cd boardpxl-backend
php artisan test
```

Générer un résumé de couverture (console) :

```sh
php artisan test --coverage
```

Générer un rapport HTML de couverture (dossier `coverage`) :

```sh
# en local (via PHPUnit)
vendor/bin/phpunit --coverage-html coverage

# ou via Artisan (si configuré) :
php artisan test --coverage-html coverage
```

Le rapport HTML est écrit dans `boardpxl-backend/coverage/index.html` — ouvrez-le dans votre navigateur pour une vue complète.

Exécuter les tests depuis le conteneur Docker (si vous utilisez Docker Compose) :

```sh
docker compose exec backend php artisan test
```

Conseils :
- Utilisez `php artisan test --filter ClassName::methodName` pour lancer un test spécifique.
- Si la génération du rapport HTML échoue, utilisez `vendor/bin/phpunit --coverage-html coverage`.


<p align="right">(<a href="#readme-top">retour en haut</a>)</p>

<!-- ROADMAP
## Roadmap

/!\ WORK IN PROGRESS /!\

Consultez les [issues ouvertes](https://github.com/Trosalie/projetsportpxl/issues) pour la liste complète des fonctionnalités proposées et problèmes connus. -->

<!-- <p align="right">(<a href="#readme-top">retour en haut</a>)</p> -->

<!-- CONTACT -->
## Contact

Mail : projetsportpxl@gmail.com

Lien du projet: [https://github.com/Trosalie/projetsportpxl](https://github.com/Trosalie/projetsportpxl)

<p align="right">(<a href="#readme-top">retour en haut</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/Trosalie/projetsportpxl.svg?style=for-the-badge
[contributors-url]: https://github.com/Trosalie/projetsportpxl/graphs/contributors
[issues-shield]: https://img.shields.io/github/issues/Trosalie/projetsportpxl.svg?style=for-the-badge
[issues-url]: https://github.com/Trosalie/projetsportpxl/issues
[pr-shield]: https://img.shields.io/github/issues-pr/Trosalie/projetsportpxl.svg?style=for-the-badge
[pr-url]: https://github.com/Trosalie/projetsportpxl/pulls

[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/
[Laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[Laravel-url]: https://laravel.com
[TypeScript]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Docker]: https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white
[Docker-url]: https://www.docker.com/
[MySQL]: https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white
[MySQL-url]: https://www.mysql.com/
