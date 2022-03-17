## API CRM-WS

[![Build API](https://github.com/enzotoyos/API-CRM-WS/actions/workflows/main.yml/badge.svg)](https://github.com/enzotoyos/API-CRM-WS/actions/workflows/main.yml)

### Technologie

- NodeJS
  - Avec une surcouche de TypeScript
  - Express
- BDD Firestore
- Bucket image (Google Cloud)

### Lien API

- API : https://test.mira-ceti.ovh
- API DOC : https://apidoc.mira-ceti.ovh
- DOC SERVEUR : https://doc.mira-ceti.ovh

### API DOC Exemple

<img src="https://user-images.githubusercontent.com/58291299/157634327-baaa8e67-7936-4c1c-b028-b2414fd0d34b.png" alt="drawing" width="400"/>

### Admin par défaut

> EMAIL : admin.default@crm.ynov
> API_KEY : wNSm5i8MCU3shqKtgeSE

### Installation

- npm i
- npm install -g ts-node

### Fichier de configuration

Propriétés à renseigner dans le fichier de configuration

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
