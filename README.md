# Task Manager Enterprise

Application complète de gestion de tâches : API REST sécurisée par JWT (Spring Boot) et interface web moderne (React + Vite + TypeScript).

## Sommaire

- [Architecture](#architecture)
- [Stack technique](#stack-technique)
- [Démarrage rapide (Docker Compose)](#démarrage-rapide-docker-compose)
- [Démarrage en local (sans Docker)](#démarrage-en-local-sans-docker)
- [Documentation de l'API](#documentation-de-lapi)
- [Variables d'environnement](#variables-denvironnement)
- [Tests](#tests)
- [CI/CD](#cicd)
- [Structure du projet](#structure-du-projet)
- [Captures d'écran](#captures-décran)

## Architecture

```
task-manager-enterprise/
├── backend/    API REST Spring Boot (Java 21)
├── frontend/   Application React + Vite + TypeScript
└── docker-compose.yml
```

**Backend** — architecture en couches, sans logique métier dans les controllers :

```
controller  → endpoints HTTP, validation des requêtes
service     → logique métier
repository  → accès aux données (Spring Data JPA)
entity      → modèle de persistance
dto         → contrats d'entrée/sortie de l'API (jamais l'entité exposée directement)
mapper      → conversion entity <-> DTO
security    → JWT, filtre d'authentification, configuration Spring Security
exception   → gestion centralisée des erreurs (@RestControllerAdvice)
config      → configuration OpenAPI/Swagger
```

**Choix techniques principaux :**
- **JWT stateless** (Spring Security 6, filtre `OncePerRequestFilter`) : pas de session serveur, adapté à un client web/mobile.
- **DTO systématiques** : le mot de passe (même hashé) ou les détails internes de l'entité `User` ne sont jamais exposés en JSON.
- **`@RestControllerAdvice` global** : toutes les erreurs (404, 400 de validation, 401, 409, 500) renvoient un format JSON cohérent (`timestamp`, `status`, `error`, `message`, `path`).
- **Profil de test dédié (H2 en mémoire)** : les tests d'intégration tournent sans dépendance externe, MySQL n'est utilisé qu'en dev/production.
- **Isolation des données par utilisateur** : chaque requête sur `/api/tasks` est filtrée par l'utilisateur authentifié (`findByIdAndUserId`), empêchant l'accès aux tâches d'un autre compte.

**Frontend** — organisation par responsabilité :

```
api        → client Axios + appels HTTP typés vers le backend
context    → AuthContext (session, token JWT persistés en localStorage)
components → briques UI réutilisables (formulaire, liste, carte de tâche, garde de route)
pages      → écrans (connexion, inscription, tableau des tâches)
types      → types TypeScript partagés (Task, AuthUser, ...)
```

## Stack technique

| Domaine       | Technologies |
|---------------|--------------|
| Backend       | Java 21, Spring Boot 4.1, Spring Data JPA, Spring Security 6, JWT (jjwt), MySQL 8, Maven |
| Frontend      | React 18, Vite, TypeScript, Tailwind CSS 4, Axios, React Router, react-hot-toast |
| Tests         | JUnit 5, Mockito, AssertJ, Spring MockMvc, base H2 en mémoire |
| Documentation | springdoc-openapi (Swagger UI) |
| DevOps        | Docker (multi-stage), Docker Compose, GitHub Actions |

> **Note technique :** au moment de la réalisation de ce test, Spring Initializr ne propose plus Spring Boot 3.x (plage de compatibilité `>=4.0.0`). Le projet utilise donc Spring Boot 4.1, dont le modèle de programmation (Spring Web MVC, Spring Data JPA, Spring Security par filtre) est directement équivalent à celui de Spring Boot 3.x demandé dans l'énoncé.

## Démarrage rapide (Docker Compose)

Prérequis : Docker et Docker Compose.

```bash
git clone https://github.com/DavidDef04/task-manager-enterprise.git
cd task-manager-enterprise
docker compose up --build
```

- Frontend : http://localhost:5173
- API : http://localhost:8081/api
- Documentation Swagger : http://localhost:8081/swagger-ui.html
- MySQL exposé sur le port 3306 (utilisateur `taskmanager` / mot de passe `taskmanager`)

## Démarrage en local (sans Docker)

### Backend

Prérequis : JDK 21, MySQL 8 (ou modifier `application.yml` pour pointer vers votre instance).

```bash
cd backend
./mvnw spring-boot:run
```

L'API démarre sur `http://localhost:8081`. Par défaut elle se connecte à `jdbc:mysql://localhost:3306/taskmanager` (base créée automatiquement). Ces valeurs sont surchargeables via les variables d'environnement `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`.

### Frontend

Prérequis : Node.js 22+.

```bash
cd frontend
cp .env.example .env   # ajuster VITE_API_URL si besoin
npm install
npm run dev
```

L'application démarre sur `http://localhost:5173` et consomme l'API définie par `VITE_API_URL`.

## Documentation de l'API

Une fois le backend démarré, la documentation interactive Swagger est disponible sur `/swagger-ui.html`.

| Méthode | Endpoint              | Description                              | Authentification |
|---------|------------------------|-------------------------------------------|-------------------|
| POST    | `/api/auth/register`  | Inscription d'un utilisateur              | Non               |
| POST    | `/api/auth/login`     | Connexion, retourne un token JWT          | Non               |
| GET     | `/api/tasks`          | Liste des tâches de l'utilisateur connecté (`status`, `search` en query params optionnels) | Oui |
| POST    | `/api/tasks`          | Création d'une tâche                      | Oui               |
| PUT     | `/api/tasks/{id}`     | Modification d'une tâche                  | Oui               |
| DELETE  | `/api/tasks/{id}`     | Suppression d'une tâche                   | Oui               |

Les routes protégées attendent l'en-tête `Authorization: Bearer <token>`.

## Variables d'environnement

### Backend

| Variable            | Défaut (dev)                                              | Description |
|---------------------|-------------------------------------------------------------|--------------|
| `DB_HOST`           | `localhost`                                                 | Hôte MySQL |
| `DB_PORT`           | `3306`                                                       | Port MySQL |
| `DB_NAME`           | `taskmanager`                                                | Nom de la base |
| `DB_USERNAME`       | `taskmanager`                                                | Utilisateur MySQL |
| `DB_PASSWORD`       | `taskmanager`                                                | Mot de passe MySQL |
| `JWT_SECRET`        | valeur de développement fournie                              | Clé de signature JWT (à changer en production) |
| `JWT_EXPIRATION_MS` | `86400000` (24h)                                             | Durée de validité du token |

### Frontend

| Variable        | Défaut                          | Description |
|------------------|----------------------------------|--------------|
| `VITE_API_URL`  | `http://localhost:8081/api`      | URL de base de l'API consommée par le frontend |

## Tests

### Backend

```bash
cd backend
./mvnw test
```

Couverture : tests unitaires des services (`AuthService`, `TaskService` avec Mockito) et tests d'intégration des controllers (`MockMvc` + base H2), incluant des cas limites : email/username déjà utilisés, identifiants invalides, tâche inexistante ou appartenant à un autre utilisateur, champs de validation manquants.

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

## CI/CD

Le pipeline GitHub Actions (`.github/workflows/ci.yml`) s'exécute à chaque push/PR sur `main` :
1. **backend** : compilation et tests Maven.
2. **frontend** : lint et build Vite.
3. **docker** : build des images Docker backend et frontend (validation, sans push) une fois les deux jobs précédents réussis.

## Structure du projet

```
task-manager-enterprise/
├── backend/
│   ├── src/main/java/com/taskmanager/backend/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── entity/
│   │   ├── dto/
│   │   ├── mapper/
│   │   ├── security/
│   │   ├── exception/
│   │   └── config/
│   ├── src/test/java/...
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── context/
│   │   ├── components/
│   │   ├── pages/
│   │   └── types/
│   └── Dockerfile
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## Captures d'écran

_À ajouter après le premier lancement local (pages de connexion, d'inscription et tableau des tâches)._
