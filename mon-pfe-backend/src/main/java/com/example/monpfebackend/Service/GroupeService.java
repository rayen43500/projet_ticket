package com.example.monpfebackend.Service;

import com.example.monpfebackend.Entity.Groupe;
import com.example.monpfebackend.Entity.Utilisateur;
import com.example.monpfebackend.Repository.GroupeRepository;
import com.example.monpfebackend.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class GroupeService {

    @Autowired
    private GroupeRepository groupeRepository;

    @Autowired
    private UserRepository userRepository;

    // Créer un groupe
    @Transactional
    public Groupe createGroupe(Groupe groupe, List<Long> intervenantIds) {
        // Vérifier que le nom du groupe n'est pas vide
        if (groupe.getNom() == null || groupe.getNom().trim().isEmpty()) {
            throw new IllegalArgumentException("Le nom du groupe ne peut pas être vide");
        }

        // Vérifier si un groupe avec le même nom existe déjà
        if (groupeRepository.existsByNomIgnoreCase(groupe.getNom().trim())) {
            throw new IllegalArgumentException("Un groupe avec ce nom existe déjà");
        }

        // Vérifier que des intervenants sont sélectionnés
        if (intervenantIds == null || intervenantIds.isEmpty()) {
            throw new IllegalArgumentException("Vous devez sélectionner au moins un intervenant");
        }

        // Trouver les intervenants à partir des IDs
        List<Utilisateur> intervenants = userRepository.findAllById(intervenantIds)
                .stream()
                .filter(u -> u.getRole() == Utilisateur.Role.INTERVENANT)
                .collect(Collectors.toList());

        // Vérifier que les intervenants existent
        if (intervenants.isEmpty()) {
            throw new IllegalArgumentException("Aucun intervenant valide n'a été trouvé");
        }

        // Lier les intervenants au groupe
        groupe.setIntervenants(intervenants);

        // Sauvegarder le groupe
        Groupe savedGroupe = groupeRepository.save(groupe);

        // Mettre à jour le groupe pour chaque intervenant
        intervenants.forEach(intervenant -> {
            intervenant.setGroupe(savedGroupe);
            userRepository.save(intervenant);
        });

        return savedGroupe;
    }

    // Modifier un groupe
    public Groupe updateGroupe(Groupe groupe, List<Long> newIntervenantIds) {
        Groupe existingGroupe = groupeRepository.findById(groupe.getId()).orElseThrow();

        // Vérifier que le nom n'est pas vide
        if (groupe.getNom() == null || groupe.getNom().trim().isEmpty()) {
            throw new IllegalArgumentException("Le nom du groupe ne peut pas être vide");
        }

        // Vérifier si un autre groupe avec le même nom existe déjà (à l'exception du groupe actuel)
        String newName = groupe.getNom().trim();
        if (!existingGroupe.getNom().equalsIgnoreCase(newName) && 
            groupeRepository.existsByNomIgnoreCase(newName)) {
            throw new IllegalArgumentException("Un groupe avec ce nom existe déjà");
        }

        // Mettre à jour le nom
        existingGroupe.setNom(newName);

        // Gérer les intervenants
        List<Utilisateur> newIntervenants = userRepository.findAllById(newIntervenantIds)
                .stream()
                .filter(u -> u.getRole() == Utilisateur.Role.INTERVENANT)
                .collect(Collectors.toList());

        // Retirer les anciens liens
        existingGroupe.getIntervenants().forEach(ancien -> {
            if (!newIntervenants.contains(ancien)) {
                ancien.setGroupe(null);
                userRepository.save(ancien);
            }
        });

        // Ajouter les nouveaux liens
        newIntervenants.forEach(nouveau -> {
            if (!existingGroupe.getIntervenants().contains(nouveau)) {
                nouveau.setGroupe(existingGroupe);
                userRepository.save(nouveau);
            }
        });

        return groupeRepository.save(existingGroupe);
    }

    // Afficher la liste de tous les groupes
    public List<Groupe> getAllGroupes() {
        return groupeRepository.findAll();
    }

    //Supprimer un groupe
    public void deleteGroupe(Long id) {
        Groupe groupe = groupeRepository.findById(id).orElseThrow();

        // Nettoyer les relations
        groupe.getIntervenants().forEach(intervenant -> {
            intervenant.setGroupe(null);
            userRepository.save(intervenant);
        });

        groupeRepository.delete(groupe);
    }

    // Récupérer un groupe par son ID
    public Groupe getGroupeById(Long id) {
        return groupeRepository.findById(id).orElseThrow();
    }
}