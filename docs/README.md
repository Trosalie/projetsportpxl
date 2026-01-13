# Documentation BoardPxl

Cette documentation a été générée automatiquement avec Doxygen.

## Contenu

La documentation couvre :
- **Backend Laravel** : Models, Controllers, Services et Middlewares
- **Frontend Angular** : Services et composants principaux

## Consultation

Pour consulter la documentation :

1. Ouvrez le fichier `index.html` dans votre navigateur :
   ```
   docs/html/index.html
   ```

2. Vous aurez accès à :
   - La liste des classes
   - La liste des fichiers
   - Les diagrammes de relations
   - La documentation complète de chaque méthode

## Regénération

Pour regénérer la documentation après des modifications du code :

```bash
cd projetsportpxl
doxygen Doxyfile
```

## Structure de la documentation

- **Models** : Classes de données Eloquent (Laravel)
- **Controllers** : Contrôleurs HTTP gérant les routes API
- **Services** : Logique métier réutilisable
- **Frontend Services** : Services Angular pour les appels API
- **Composants** : Composants Angular de l'interface

## Notes

- Les commentaires Doxygen utilisent le format `@brief`, `@param`, `@return`
- Tous les fichiers PHP et TypeScript principaux sont documentés
- La documentation est en français pour correspondre au contexte du projet
