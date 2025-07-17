# Eco-Bliss-Bath V2

## Prérequis

- Node.js (version recommandée : 18.x ou supérieure)
- npm (installé avec Node.js)
- Docker & Docker Compose (pour la base de données et l'API si besoin)
- (Optionnel) MySQL/MariaDB local si vous ne souhaitez pas utiliser Docker

## Installation du projet

1. **Cloner le dépôt**

```bash
git clone <url-du-repo>
cd Eco-Bliss-Bath-V2
```

2. **Installer les dépendances du frontend**

```bash
cd frontend/frontend
npm install
```

3. **Configurer l'environnement**

- Vérifiez les fichiers `frontend/frontend/src/environments/environment.ts` et `cypress.config.js` pour les URLs de l'API et du frontend.
- Par défaut :
  - Frontend : http://localhost:4200
  - API : http://localhost:8081

4. **Lancer la base de données et l'API (via Docker Compose)**

Depuis la racine du projet :

```bash
docker-compose up -d
```

Cela démarre la base de données et l'API (vérifiez le fichier `docker-compose.yml` pour les détails).

5. **Lancer le frontend Angular**

```bash
cd frontend/frontend
npm start
```

Le site sera accessible sur http://localhost:4200

## Lancer les tests Cypress

1. **Installer Cypress** (si ce n'est pas déjà fait)

```bash
cd cypress
npm install cypress --save-dev
```

2. **Lancer les tests en mode interface graphique**

```bash
npx cypress open
```

- Sélectionnez le fichier de test à exécuter (ex : `e2e/api.cy.js` ou `e2e/login.cy.js`)

3. **Lancer les tests en mode headless (console)**

```bash
npx cypress run
```

- Pour exécuter un fichier de test spécifique :

```bash
npx cypress run --spec "cypress/e2e/api.cy.js"
```

## Structure des dossiers principaux

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

## Bonnes pratiques pour les tests

- Les tests Cypress sont situés dans `cypress/e2e/`
- Utilisez les commandes personnalisées dans `cypress/support/commands.js` pour factoriser le code
- Les données de test peuvent être placées dans `cypress/fixtures/`
- Les tests API vérifient les codes de retour et la structure des réponses

## Exemple de workflow complet

1. Démarrer la base de données et l'API :
   ```bash
   docker-compose up -d
   ```
2. Démarrer le frontend :
   ```bash
   cd frontend/frontend
   npm start
   ```
3. Lancer les tests Cypress :
   ```bash
   cd cypress
   npx cypress run
   ```

---

Pour toute question ou problème, consultez la documentation du projet ou contactez l'équipe de développement.
