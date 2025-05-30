# Checklist des tâches - Application de gestion d'interventions

## Administration
- [x] Créer un système de gestion des utilisateurs (ajout, modification, suppression)
- [x] Implémenter les trois types d'utilisateurs (admin, intervenant, utilisateur)
- [x] Développer la gestion des groupes (ajout, modification, suppression)
- [x] Développer la gestion des sous-groupes (ajout, modification, suppression)
- [x] Créer le système de répartition des intervenants dans les groupes

## Espace utilisateur normal
- [x] Implémenter la création de tickets d'intervention
- [x] Ajouter la fonctionnalité pour joindre des pièces aux tickets
- [x] Créer le système d'attribution de degré d'urgence
- [x] Permettre le choix du type d'intervention (incident, demande, assistance...)
- [x] Développer l'affectation de tickets aux groupes/sous-groupes
- [ ] Implémenter le système de notification par email après création de ticket
- [x] Créer le système de suivi de l'état des tickets
- [x] Développer la fonctionnalité d'ajout de commentaires aux tickets
- [x] Implémenter la fonction de recherche de tickets (par sujet, projet, date, état...)

## Espace intervenant
- [x] Développer l'interface de consultation des tickets assignés
- [x] Créer la fonctionnalité de prise en charge des tickets
- [x] Implémenter l'ajout de commentaires et fichiers joints aux tickets
- [x] Développer le système de changement de statut des tickets (en attente, en cours, traité...)
- [ ] Implémenter le système de notification par email après la clôture d'un ticket
- [x] Créer la fonction de recherche avancée de tickets (par sujet, groupe de projet, projet, date, état...)

## Statistiques (optionnel)
- [x] Développer le tableau de bord statistique
- [x] Implémenter le calcul et l'affichage du total des tickets par projet
- [x] Implémenter le calcul et l'affichage du total des tickets par priorité
- [x] Développer les graphiques de pourcentage des tickets par groupe de projet
- [x] Créer les diagrammes de pourcentage des tickets par état pour chaque projet
- [x] Concevoir un système d'analyse des types d'interventions récurrentes/////////////////