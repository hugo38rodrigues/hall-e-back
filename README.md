<div align="center">

# 🍻 Hall-E — API 🎮

### *Le cœur de Hall-E.*

L'API qui relie les bars, les diffusions de matchs et les fêtards.
Elle alimente l'application mobile et s'appuie sur la base de données partagée.

![Node](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)
![Port](https://img.shields.io/badge/port-3000-informational)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)

</div>

---

## 🎉 Présentation

**Hall-E API** est le service back-end central de Hall-E. Il expose les données
(bars, diffusions, utilisateurs, favoris…) à l'**application mobile**, gère
l'**authentification** et s'appuie sur :

- le package partagé **`@hall-e/bdd`** pour l'accès aux données ;
- le **service de récupération des matchs** qui alimente la base en diffusions.

### ✨ Ce que fait l'API

- 🔐 **Authentification** — inscription, connexion, gestion des comptes.
- 📍 **Recherche de bars** — par géolocalisation.
- 🎮 **Diffusions** — exposition des matchs de jeux vidéo diffusés par les bars ou sur plateforme de stream.
- ⭐ **Favoris** — gestion des favoris compétitions, équipes, jeux, bars.

---

## 🛠️ Partie Dev

### 🧱 Stack

- **Node.js**
- Framework HTTP : Express
- Package partagé **`@hall-e/bdd`**
- **Docker** pour le build / déploiement

### ✅ Prérequis

- Node.js `>= 18` et `npm`
- Un **token GitHub** (`GITHUB_TOKEN`, scope `read:packages`) pour le package privé
- Docker

### ⚙️ Installation

Le package `@hall-e/bdd` provient de **GitHub Packages**. Crée un `.npmrc` :

```ini
@hall-e:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Puis :

```bash
export GITHUB_TOKEN=<GH_TOKEN>
npm install
```


### ▶️ Lancement

```bash
npm run dev      # développement (hot reload)
npm run build    # build de production
npm start        # production
```

L'API écoute sur `http://localhost:3000`.

### 🐳 Docker

**Build** — le `GITHUB_TOKEN` est passé en build-arg pour installer `@hall-e/bdd` :

```bash
docker build \
  --build-arg GITHUB_TOKEN=<GH_TOKEN> \
  -t api-hall-e .
```

**Run** :

```bash
docker run \
  -p 3000:3000 \
  --env-file ./env/prod/.env \
  --name api-hall-e-v1 \
  api-hall-e
