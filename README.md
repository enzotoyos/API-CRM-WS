## API CRM-WS

[![Build API](https://github.com/enzotoyos/API-CRM-WS/actions/workflows/main.yml/badge.svg)](https://github.com/enzotoyos/API-CRM-WS/actions/workflows/main.yml)
[![Deploy API](https://github.com/enzotoyos/API-CRM-WS/actions/workflows/main.yml/badge.svg?event=deployment)](https://github.com/enzotoyos/API-CRM-WS/actions/workflows/main.yml)

### Technologie

- NodeJS
  - Avec une surcouche de TypeScript
  - Express
- BDD Firestore

### Lien API

> https://test.mira-ceti.ovh

### Lien APIDOC

> https://apidoc.mira-ceti.ovh

### Lien Documentation Server

> https://doc.mira-ceti.ovh

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

# Clé de déchiffrage du fichier de conf de Firebase
KEY_ENCRYPT_FIREBASE=
```
