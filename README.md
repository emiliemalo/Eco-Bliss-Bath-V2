#  Tests automatisés – Eco Bliss Bath

Ce dépôt contient l'automatisation de tests pour le site e-commerce écoresponsable **Eco Bliss Bath**, dont le produit phare est le savon solide.

Suite à une première campagne de tests manuels, plusieurs axes ont été identifiés comme prioritaires pour automatisation.

##  Objectifs du projet

En tant que QA Engineer, ma mission a été de mettre en place une suite de tests avec Cypress :

* Tests **API** (statuts, données, sécurité)
*  **Smoke tests** (tests critiques interface)
*  2 scénarios **fonctionnels métiers critiques** sélectionnés
* 1 Test de **faille XSS**

## Technologies utilisées

* **Cypress** (JavaScript) - Framework de tests E2E
* **Angular** - Framework frontend
* **Node.js** (version recommandée : 18.x ou supérieure)
* **Docker & Docker Compose** - Containerisation des services
* **MySQL/MariaDB** - Base de données


## 🚀 Installation et configuration

### Prérequis

* Node.js (version 18.x ou supérieure)
* npm (installé avec Node.js)
* Docker & Docker Compose
* (Optionnel) MySQL/MariaDB local si vous ne souhaitez pas utiliser Docker

### 1. Cloner le dépôt

```bash
git clone https://github.com/emiliemalo/Eco-Bliss-Bath-V2.git
cd Eco-Bliss-Bath-V2
```

### 2. Installer les dépendances du frontend

```bash
cd frontend/frontend
npm install
```

### 3. Configurer l'environnement

Vérifiez les fichiers de configuration pour les URLs :
* `frontend/frontend/src/environments/environment.ts`
* `cypress.config.js`

**Configuration par défaut :**
* Frontend : `http://localhost:4200`
* API : `http://localhost:8081`

### 4. Lancer la base de données et l'API

Depuis la racine du projet :

```bash
docker-compose up -d
```

Cela démarre la base de données et l'API (vérifiez le fichier `docker-compose.yml` pour les détails).

### 5. Lancer le frontend Angular

```bash
cd frontend/frontend
npm start
```

Le site sera accessible sur `http://localhost:4200`

##  Lancement des tests Cypress

### Installation de Cypress

```bash
cd cypress
npm install cypress --save-dev
```

### Lancer les tests en mode interface graphique

```bash
npx cypress open
```

Cette commande ouvre l'interface graphique de Cypress où vous pouvez sélectionner et exécuter vos tests (ex : `e2e/api.cy.js` ou `e2e/login.cy.js`).

### Autres commandes utiles

```bash
# Exécuter les tests en mode headless (sans interface graphique)
npx cypress run

# Exécuter un test spécifique
npx cypress run --spec "cypress/e2e/api.cy.js"
```

## 📁 Structure des dossiers

```
Eco-Bliss-Bath-V2/
├── cypress/                # Tests end-to-end (E2E)
│   ├── e2e/                # Fichiers de tests Cypress
│   ├── fixtures/           # Données de test (JSON)
│   ├── support/            # Commandes personnalisées Cypress
│   └── cypress.config.js   # Configuration Cypress
├── frontend/               # Application Angular
│   └── frontend/           # Code source Angular
├── mysql/                  # Données et scripts de la base MySQL/MariaDB
├── docker-compose.yml      # Lancement des services via Docker
└── README.md               # Ce fichier
```



## 🔄 Workflow complet d'exécution

### 1. Démarrer la base de données et l'API
```bash
docker-compose up -d
```

### 2. Démarrer le frontend
```bash
cd frontend/frontend
npm start
```

### 3. Lancer les tests Cypress
```bash
cd cypress
npx cypress run
```

---

**Note :** Assurez-vous que tous les services sont démarrés avant d'exécuter les tests pour éviter les erreurs de connexion.
