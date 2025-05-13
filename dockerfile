# Étape 1 : Build
FROM node:18 AS builder

# Crée un répertoire de travail
WORKDIR /app

# Copie les fichiers nécessaires
COPY ./app/package*.json ./

# Injecte les variables d'environnement si nécessaire (ex. via ARG)
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Installe les dépendances, y compris le repo privé
RUN npm install

# Copie le reste de l'app
COPY /app .

# Étape 2 : Image finale (plus légère)
FROM node:18-slim

WORKDIR /app

# Copie uniquement les fichiers nécessaires depuis l'étape de build
COPY --from=builder /app ./

# Expose le port (ajuste selon ton app)
EXPOSE 3000

# Commande de démarrage
CMD ["node", "server.js"]
