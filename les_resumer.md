# Résumé du Projet de Gestion des Tickets

## Architecture Globale

Ce projet est une application web de gestion de tickets d'assistance développée avec Angular pour le frontend et une API REST pour le backend. L'application permet la gestion complète des demandes d'assistance, depuis leur création jusqu'à leur clôture, en passant par leur traitement par des intervenants.

## Structure du Projet

L'application suit une architecture modulaire avec une séparation claire des responsabilités :

- **Composants** : Interface utilisateur et logique de présentation
- **Services** : Logique métier et communication avec l'API
- **Modèles** : Définition des structures de données
- **Gardes** : Sécurisation des routes selon les rôles

## Organisation des Fichiers et Dossiers

Le projet suit une structure organisée par fonctionnalité et par rôle, ce qui facilite la navigation et la maintenance du code :

```
mon-pfe-Frontend/
├── src/
│   ├── app/
│   │   ├── admin/                 # Composants pour les administrateurs
│   │   │   ├── admin-dashboard/   # Tableau de bord admin
│   │   │   ├── users/             # Gestion des utilisateurs
│   │   │   ├── groups/            # Gestion des groupes
│   │   │   └── subgroups/         # Gestion des sous-groupes
│   │   │
│   │   ├── user/                  # Composants pour les utilisateurs standards
│   │   │   ├── user-dashboard/    # Tableau de bord utilisateur
│   │   │   ├── create-ticket/     # Création de tickets
│   │   │   ├── my-tickets/        # Liste des tickets de l'utilisateur
│   │   │   └── view-ticket/       # Visualisation d'un ticket
│   │   │
│   │   ├── intervenant/           # Composants pour les intervenants
│   │   │   ├── intervenant-dashboard/  # Tableau de bord intervenant
│   │   │   └── tickets-to-handle/      # Tickets à traiter
│   │   │
│   │   ├── shared/                # Composants et services partagés
│   │   │   ├── navbar/            # Barre de navigation
│   │   │   ├── sidebar/           # Barre latérale
│   │   │   ├── header/            # En-tête
│   │   │   └── footer/            # Pied de page
│   │   │
│   │   ├── models/                # Modèles de données
│   │   │   ├── ticket.model.ts    # Interface du ticket
│   │   │   └── user.model.ts      # Interface de l'utilisateur
│   │   │
│   │   ├── services/              # Services partagés
│   │   │   ├── auth.service.ts    # Service d'authentification
│   │   │   ├── ticket.service.ts  # Service de gestion des tickets
│   │   │   ├── email.service.ts   # Service d'envoi d'emails
│   │   │   └── token.interceptor.ts # Intercepteur pour les tokens JWT
│   │   │
│   │   ├── guards/                # Gardes de routes
│   │   │   └── role.guard.ts      # Protection des routes par rôle
│   │   │
│   │   ├── app-routing.module.ts  # Configuration des routes
│   │   └── app.module.ts          # Module principal
│   │
│   ├── assets/                    # Ressources statiques
│   │   ├── images/                # Images
│   │   └── icons/                 # Icônes
│   │
│   ├── environments/              # Configurations par environnement
│   │   ├── environment.ts         # Développement
│   │   └── environment.prod.ts    # Production
│   │
│   ├── styles.css                 # Styles globaux
│   └── index.html                 # Page HTML principale
│
├── package.json                   # Dépendances et scripts
└── angular.json                   # Configuration Angular
```

### Explication des Principaux Dossiers

1. **app/admin/** : Contient tous les composants destinés aux administrateurs, comme la gestion des utilisateurs, des groupes et le tableau de bord administratif.

2. **app/user/** : Regroupe les composants accessibles aux utilisateurs standard, notamment la création et la consultation de tickets.

3. **app/intervenant/** : Contient les composants spécifiques aux intervenants, comme la liste des tickets à traiter et leur tableau de bord.

4. **app/shared/** : Rassemble les composants communs à toutes les parties de l'application, comme la barre de navigation et le pied de page.

5. **app/models/** : Définit les interfaces TypeScript qui représentent les structures de données utilisées dans l'application.

6. **app/services/** : Contient tous les services qui gèrent la logique métier et la communication avec l'API backend.

7. **app/guards/** : Implémente les gardes de routes qui contrôlent l'accès aux différentes sections de l'application en fonction des rôles.

### Séparation des Responsabilités

Chaque composant suit une structure standard Angular avec quatre fichiers :
- `*.component.ts` : Logique du composant
- `*.component.html` : Template HTML
- `*.component.css` : Styles spécifiques au composant
- `*.component.spec.ts` : Tests unitaires

Cette organisation permet une séparation claire des responsabilités, facilite la maintenance et améliore la lisibilité du code.

## Fonctionnalités Principales

### 1. Authentification et Gestion des Utilisateurs

- **Inscription** avec validation d'email et de mot de passe
- **Connexion** avec gestion de token JWT
- **Gestion des rôles** (ADMIN, INTERVENANT, UTILISATEUR)
- **Profil utilisateur** et gestion des informations personnelles

### 2. Gestion des Tickets

- **Création de tickets** avec définition du sujet, description, type et niveau d'urgence
- **Consultation des tickets** avec filtrage et recherche
- **Assignation des tickets** aux intervenants
- **Mise à jour du statut des tickets** (EN_ATTENTE, EN_COURS, TRAITE, CLOTURE)
- **Notifications par email** aux créateurs lors de la clôture des tickets

### 3. Administration

- **Tableau de bord** avec statistiques et indicateurs de performance
- **Gestion des utilisateurs** (ajout, modification, suppression)
- **Gestion des groupes et sous-groupes** pour l'organisation des interventions

## Composants Clés

### Authentification

Le système d'authentification utilise JWT (JSON Web Tokens) pour sécuriser les communications avec l'API. Les fonctionnalités incluent :

- Validation d'email avec regex pour accepter tous les formats d'email valides
- Validation de la force du mot de passe
- Gestion des erreurs avec messages personnalisés
- Protection des routes via des gardes d'authentification

### Tickets

Le système de tickets est le cœur de l'application avec :

- Support pour les pièces jointes
- Système de commentaires pour les échanges entre utilisateurs et intervenants
- Système de priorisation basé sur l'urgence
- Organisation par groupes et sous-groupes pour une meilleure répartition

### Communication par Email

Le service d'email permet d'envoyer des notifications aux utilisateurs :

- Notification automatique lors de la clôture d'un ticket
- Format personnalisé incluant les détails du ticket
- Deux approches d'implémentation :
  1. Approche backend où le serveur gère l'envoi complet
  2. Approche frontend où le client compose le message

## Services

### AuthService

Gère l'authentification et les autorisations avec :
- Gestion des tokens JWT
- Vérification des rôles
- Sessions utilisateur
- Rafraîchissement automatique des tokens

### TicketService

Centralise les opérations sur les tickets :
- CRUD complet (Création, Lecture, Mise à jour, Suppression)
- Filtrage et recherche
- Gestion des pièces jointes
- Assignation aux intervenants

### EmailService

Gère les communications par email :
- Envoi de notifications lors des changements de statut
- Format personnalisé des messages
- Communication avec l'API d'emails

## Interfaces Utilisateur

### Tableaux de Bord

Chaque type d'utilisateur dispose d'un tableau de bord adapté :
- **Administrateur** : Vue d'ensemble, statistiques globales, gestion des utilisateurs
- **Intervenant** : Tickets à traiter, en cours et historique
- **Utilisateur** : Création de tickets, suivi des demandes

### Formulaires

Les formulaires sont enrichis avec :
- Validation en temps réel
- Messages d'erreur contextuels
- Indicateurs visuels (couleurs, icônes)
- Aide à la saisie

## Sécurité

La sécurité est assurée à plusieurs niveaux :
- Authentification par token JWT
- Validation des entrées utilisateur
- Protection CSRF
- Gestion des rôles et des permissions
- Interception des requêtes HTTP pour l'ajout des tokens

## Responsive Design

L'application est entièrement responsive :
- Adaptation aux mobiles, tablettes et ordinateurs
- Sidebar rétractable
- Interface simplifiée sur petits écrans
- Optimisation des formulaires

## Gestion des Erreurs

Un système robuste de gestion des erreurs est en place :
- Messages d'erreur contextuels
- Affichage dans l'interface utilisateur
- Journalisation côté client
- Gestion des erreurs HTTP

## Technologies Utilisées

- **Frontend** : Angular, TypeScript, RxJS, Bootstrap, SweetAlert2
- **Backend** : API REST avec JWT
- **Outils** : Angular CLI, npm
- **Design** : CSS personnalisé, animations
