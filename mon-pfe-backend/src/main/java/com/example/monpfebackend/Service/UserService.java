package com.example.monpfebackend.Service;

import com.example.monpfebackend.Entity.Groupe;
import com.example.monpfebackend.Entity.Utilisateur;
import com.example.monpfebackend.Repository.GroupeRepository;
import com.example.monpfebackend.Repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private GroupeRepository groupeRepository;

    /**
     * Récupérer les utilisateurs par rôle
     */
    public List<Utilisateur> getUsersByRole(Utilisateur.Role role) {
        return userRepository.findByRole(role);
    }
    
    /**
     * Récupérer tous les utilisateurs
     */
    public List<Utilisateur> getAllUsers() {
        return userRepository.findAll();
    }
    
    /**
     * Récupérer un utilisateur par son ID
     */
    public Utilisateur getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé avec l'ID : " + id));
    }

    /**
     * Ajouter un nouvel utilisateur
     */
    public Utilisateur addUser(Utilisateur utilisateur) {
        // Validation des données
        if (utilisateur.getNom() == null || utilisateur.getNom().trim().isEmpty()) {
            throw new IllegalArgumentException("Le nom est obligatoire");
        }
        
        if (utilisateur.getEmail() == null || utilisateur.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("L'email est obligatoire");
        }
        
        if (utilisateur.getPassword() == null || utilisateur.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Le mot de passe est obligatoire");
        }
        
        // Vérifier si l'email existe déjà
        Utilisateur existingUser = userRepository.findByEmail(utilisateur.getEmail());
        if (existingUser != null) {
            throw new IllegalArgumentException("Un utilisateur avec cet email existe déjà");
        }
        
        // Gérer l'association avec un groupe si l'utilisateur est un INTERVENANT
        if (utilisateur.getRole() == Utilisateur.Role.INTERVENANT && utilisateur.getGroupe() != null) {
            Groupe groupe = groupeRepository.findById(utilisateur.getGroupe().getId())
                .orElseThrow(() -> new EntityNotFoundException("Groupe non trouvé"));
            utilisateur.setGroupe(groupe);
        }
        
        return userRepository.save(utilisateur);
    }

    /**
     * Modifier un utilisateur existant
     */
    public Utilisateur updateUser(Utilisateur utilisateur) {
        // Vérifier si l'utilisateur existe
        Utilisateur existingUser = userRepository.findById(utilisateur.getId())
            .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé"));
        
        // Validation des données
        if (utilisateur.getNom() == null || utilisateur.getNom().trim().isEmpty()) {
            throw new IllegalArgumentException("Le nom est obligatoire");
        }
        
        if (utilisateur.getEmail() == null || utilisateur.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("L'email est obligatoire");
        }
        
        // Vérifier si l'email n'est pas déjà utilisé par un autre utilisateur
        Utilisateur userWithSameEmail = userRepository.findByEmail(utilisateur.getEmail());
        if (userWithSameEmail != null && !userWithSameEmail.getId().equals(utilisateur.getId())) {
            throw new IllegalArgumentException("Un autre utilisateur avec cet email existe déjà");
        }
        
        // Mettre à jour les informations de base
        existingUser.setNom(utilisateur.getNom());
        existingUser.setEmail(utilisateur.getEmail());
        existingUser.setRole(utilisateur.getRole());
        
        // Mettre à jour le mot de passe si fourni
        if (utilisateur.getPassword() != null && !utilisateur.getPassword().trim().isEmpty()) {
            existingUser.setPassword(utilisateur.getPassword());
        }
        
        // Gérer l'association avec un groupe si l'utilisateur est un INTERVENANT
        if (utilisateur.getRole() == Utilisateur.Role.INTERVENANT) {
            if (utilisateur.getGroupe() != null) {
                Groupe groupe = groupeRepository.findById(utilisateur.getGroupe().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Groupe non trouvé"));
                existingUser.setGroupe(groupe);
            } else {
                existingUser.setGroupe(null);
            }
        } else {
            // Si ce n'est pas un intervenant, supprimer toute association avec un groupe
            existingUser.setGroupe(null);
        }
        
        return userRepository.save(existingUser);
    }

    /**
     * Supprimer un utilisateur par ID
     */
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new EntityNotFoundException("Utilisateur non trouvé");
        }
        userRepository.deleteById(id);
    }
    
    /**
     * Assigner un utilisateur à un groupe
     */
    public Utilisateur assignUserToGroup(Long userId, Long groupeId) {
        Utilisateur utilisateur = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé"));
            
        // Vérifier que c'est un intervenant
        if (utilisateur.getRole() != Utilisateur.Role.INTERVENANT) {
            throw new IllegalArgumentException("Seuls les intervenants peuvent être assignés à un groupe");
        }
        
        Groupe groupe = groupeRepository.findById(groupeId)
            .orElseThrow(() -> new EntityNotFoundException("Groupe non trouvé"));
            
        utilisateur.setGroupe(groupe);
        return userRepository.save(utilisateur);
    }
    
    /**
     * Retirer un utilisateur d'un groupe
     */
    public Utilisateur removeUserFromGroup(Long userId) {
        Utilisateur utilisateur = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé"));
            
        utilisateur.setGroupe(null);
        return userRepository.save(utilisateur);
    }
}
