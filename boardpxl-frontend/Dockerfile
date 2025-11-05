FROM node:20

# Dossier de travail
WORKDIR /app

# Copier uniquement les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Exposer le port Angular
EXPOSE 4200

# Lancer Angular automatiquement au démarrage
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--poll=2000"]
