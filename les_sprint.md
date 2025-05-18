# Backlog et Sprints du Projet de Système de Gestion des Interventions

## Description du Projet
Ce projet consiste en un système de gestion des interventions pour l'Entreprise Tunisienne d'Activités Pétrolières (ETAP), permettant aux utilisateurs de soumettre des tickets d'intervention, de les suivre et de les résoudre. Le système comprend trois types d'utilisateurs (Administrateur, Intervenant, Utilisateur standard), la gestion des groupes et sous-groupes, ainsi qu'un suivi complet des tickets avec commentaires et pièces jointes.

## Backlog du Produit

### Authentification et Gestion des Utilisateurs
- US-1.1: En tant qu'utilisateur, je souhaite m'inscrire à travers un formulaire pour créer un compte sur la plateforme avec mon nom, email et mot de passe.
- US-2.1: En tant qu'utilisateur, je souhaite m'authentifier à travers un login et un mot de passe afin d'accéder à mon espace personnel.
- US-3.1: En tant qu'utilisateur, je souhaite que ma session soit personnalisée selon mon rôle (Admin, Intervenant, Utilisateur) pour accéder uniquement aux fonctionnalités qui me concernent.

### Gestion des Comptes, Rôles, Groupes et Sous-groupes
- US-4.1: En tant qu'administrateur, je souhaite créer, modifier et supprimer des comptes utilisateurs avec leurs informations personnelles.
- US-4.2: En tant qu'administrateur, je souhaite gérer les rôles des utilisateurs (Admin, Intervenant, Utilisateur) et leurs permissions.
- US-4.3: En tant qu'administrateur, je souhaite consulter la liste des utilisateurs avec leurs informations et rôles.
- US-5.1: En tant qu'administrateur, je souhaite créer, modifier et supprimer des groupes d'intervention.
- US-5.2: En tant qu'administrateur, je souhaite affecter les intervenants aux groupes selon leur domaine d'expertise.
- US-5.3: En tant qu'administrateur, je souhaite consulter la liste des groupes et leurs intervenants.
- US-6.1: En tant qu'administrateur, je souhaite créer, modifier et supprimer des sous-groupes pour une meilleure organisation.
- US-6.2: En tant qu'administrateur, je souhaite affecter les sous-groupes aux groupes principaux.
- US-6.3: En tant qu'administrateur, je souhaite consulter la liste des sous-groupes et leur hiérarchie.
- US-7.1: En tant qu'administrateur, je souhaite rechercher les tickets par mot-clé, groupe, statut, type et date.
- US-8.1: En tant qu'administrateur, je souhaite rechercher les utilisateurs par nom, email ou rôle.
- US-9.1: En tant qu'administrateur, je souhaite visualiser des statistiques sur les tickets (nombre, statut, délai de traitement).

### Gestion des Tickets (Utilisateur normal)
- US-10.1: En tant qu'utilisateur normal, je souhaite créer un ticket d'intervention avec sujet, description, type (INCIDENT, DEMANDE, ASSISTANCE), urgence (FAIBLE, MOYENNE, HAUTE), groupe et sous-groupe.
- US-11.1: En tant qu'utilisateur normal, je souhaite suivre l'état de mes tickets (EN_ATTENTE, EN_COURS, TRAITE, CLOTURE).
- US-11.2: En tant qu'utilisateur normal, je souhaite ajouter des commentaires aux tickets pour fournir des informations complémentaires.
- US-11.3: En tant qu'utilisateur normal, je souhaite joindre des fichiers dans les tickets pour enrichir les informations.
- US-12.1: En tant qu'utilisateur normal, je souhaite rechercher mes tickets par mot-clé, groupe, statut, type et date.
- US-13.1: En tant qu'utilisateur normal, je souhaite recevoir une notification par email lorsque mon ticket est clôturé.

### Gestion des Tickets (Intervenant)
- US-14.1: En tant qu'intervenant, je souhaite consulter les tickets assignés à mon groupe et les prendre en charge.
- US-14.2: En tant qu'intervenant, je souhaite mettre à jour l'état des tickets (EN_ATTENTE, EN_COURS, TRAITE, CLOTURE).
- US-14.3: En tant qu'intervenant, je souhaite ajouter des commentaires aux tickets pour communiquer avec l'utilisateur.
- US-14.4: En tant qu'intervenant, je souhaite joindre des fichiers dans les tickets (documents, captures d'écran, etc.).
- US-15.1: En tant qu'intervenant, je souhaite rechercher les tickets assignés par mot-clé, groupe, statut, type et date.
- US-16.1: En tant qu'intervenant, je souhaite recevoir une notification par email dès qu'un ticket est créé dans mon groupe.

## Plan des Sprints

### Sprint 1: Authentification et Personnalisation
**Durée:** 2 semaines
**User Stories:**
- US-1.1: Inscription des utilisateurs
- US-2.1: Authentification des utilisateurs
- US-3.1: Personnalisation des sessions selon les rôles

**Objectifs:**
- Mettre en place l'architecture Spring Boot et Angular
- Implémenter le système d'inscription et d'authentification avec JWT
- Développer la personnalisation des sessions selon les rôles
- Créer les interfaces utilisateur de base (page d'accueil, login, inscription)

### Sprint 2: Gestion des Comptes, Rôles, Groupes et Sous-groupes
**Durée:** 2 semaines
**User Stories:**
- US-4.1 à US-4.3: Gestion des comptes et rôles
- US-5.1 à US-5.3: Gestion des groupes
- US-6.1 à US-6.3: Gestion des sous-groupes
- US-7.1 à US-9.1: Recherche et statistiques

**Objectifs:**
- Développer les fonctionnalités d'administration des utilisateurs
- Implémenter la gestion des groupes et sous-groupes
- Créer les interfaces d'administration
- Développer les fonctionnalités de recherche et statistiques

### Sprint 3: Gestion des Tickets (Utilisateur normal)
**Durée:** 2 semaines
**User Stories:**
- US-10.1: Création de tickets
- US-11.1 à US-11.3: Suivi et interaction sur les tickets
- US-12.1: Recherche de tickets
- US-13.1: Notifications

**Objectifs:**
- Développer le formulaire de création de tickets
- Implémenter l'affichage et le suivi des tickets
- Créer les fonctionnalités de commentaires et pièces jointes
- Développer le système de recherche de tickets
- Mettre en place les notifications par email

### Sprint 4: Gestion des Tickets (Intervenant)
**Durée:** 2 semaines
**User Stories:**
- US-14.1 à US-14.4: Gestion des tickets par les intervenants
- US-15.1: Recherche avancée
- US-16.1: Notifications automatiques

**Objectifs:**
- Développer l'interface de gestion des tickets pour les intervenants
- Implémenter les fonctionnalités de mise à jour du statut des tickets
- Créer le système de recherche avancée pour les intervenants
- Mettre en place les notifications automatiques
- Finaliser et optimiser l'application
- Effectuer les tests d'intégration et corriger les bugs
