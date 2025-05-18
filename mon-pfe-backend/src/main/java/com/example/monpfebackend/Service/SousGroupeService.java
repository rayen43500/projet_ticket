package com.example.monpfebackend.Service;

import com.example.monpfebackend.Entity.Groupe;
import com.example.monpfebackend.Entity.SousGroupe;
import com.example.monpfebackend.Repository.GroupeRepository;
import com.example.monpfebackend.Repository.SousGroupeRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SousGroupeService {

    @Autowired
    private SousGroupeRepository sousGroupeRepository;

    @Autowired
    private GroupeRepository groupeRepository;

    /**
     * Récupérer tous les sous-groupes
     */
    public List<SousGroupe> getAllSousGroupes() {
        return sousGroupeRepository.findAll();
    }

    /**
     * Récupérer les sous-groupes par groupe
     */
    public List<SousGroupe> getSousGroupesByGroupeId(Long groupeId) {
        return sousGroupeRepository.findByGroupeId(groupeId);
    }

    /**
     * Récupérer un sous-groupe par son ID
     */
    public SousGroupe getSousGroupeById(Long id) {
        return sousGroupeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sous-groupe non trouvé avec l'ID : " + id));
    }

    /**
     * Créer un nouveau sous-groupe
     */
    public SousGroupe createSousGroupe(SousGroupe sousGroupe) {
        // Validation du nom du sous-groupe
        if (sousGroupe.getNom() == null || sousGroupe.getNom().trim().isEmpty()) {
            throw new IllegalArgumentException("Le nom du sous-groupe est obligatoire");
        }

        // Validation du groupe parent
        if (sousGroupe.getGroupe() == null || sousGroupe.getGroupe().getId() == null) {
            throw new IllegalArgumentException("Le groupe parent est obligatoire");
        }

        // Vérification que le groupe parent existe
        Groupe groupe = groupeRepository.findById(sousGroupe.getGroupe().getId())
                .orElseThrow(() -> new EntityNotFoundException("Groupe parent non trouvé"));

        // Associer le sous-groupe au groupe
        sousGroupe.setGroupe(groupe);

        return sousGroupeRepository.save(sousGroupe);
    }

    /**
     * Mettre à jour un sous-groupe
     */
    public SousGroupe updateSousGroupe(SousGroupe sousGroupe) {
        // Vérifier que le sous-groupe existe
        SousGroupe existingSousGroupe = sousGroupeRepository.findById(sousGroupe.getId())
                .orElseThrow(() -> new EntityNotFoundException("Sous-groupe non trouvé"));

        // Validation du nom du sous-groupe
        if (sousGroupe.getNom() == null || sousGroupe.getNom().trim().isEmpty()) {
            throw new IllegalArgumentException("Le nom du sous-groupe est obligatoire");
        }

        // Validation du groupe parent
        if (sousGroupe.getGroupe() == null || sousGroupe.getGroupe().getId() == null) {
            throw new IllegalArgumentException("Le groupe parent est obligatoire");
        }

        // Vérification que le groupe parent existe
        Groupe groupe = groupeRepository.findById(sousGroupe.getGroupe().getId())
                .orElseThrow(() -> new EntityNotFoundException("Groupe parent non trouvé"));

        // Mise à jour des propriétés
        existingSousGroupe.setNom(sousGroupe.getNom());
        existingSousGroupe.setGroupe(groupe);

        return sousGroupeRepository.save(existingSousGroupe);
    }

    /**
     * Supprimer un sous-groupe
     */
    public void deleteSousGroupe(Long id) {
        // Vérifier que le sous-groupe existe
        if (!sousGroupeRepository.existsById(id)) {
            throw new EntityNotFoundException("Sous-groupe non trouvé");
        }
        
        sousGroupeRepository.deleteById(id);
    }
}
