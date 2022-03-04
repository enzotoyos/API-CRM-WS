## API CRM-WS

![Build API](https://github.com/enzotoyos/API-CRM-WS/workflows/Build%20API/badge.svg?branch=main)

### Technologie

- NodeJS
  - Avec une surcouche de TypeScript
  - Express
- BDD Firestore

### Lien API

> https://test.mira-ceti.ovh

### Admin par défaut

> EMAIL : admin.default@crm.ynov

> API_KEY :


### Installation

- npm i
- npm install -g ts-node
-

### Fichier de configuration

Propriétés a renseigner dans le fichier de configuration

```bash
# Port de l'application (default: 3000)
PORT=

# Phase de l'API : DEV (default)/ PROD / DEMO
NODE_ENV=

# Clé d'encodage du JWT
SECURE_KEY=

# Configuration serveur SMTP
EMAIL=
EMAIL_PASSWORD=
```