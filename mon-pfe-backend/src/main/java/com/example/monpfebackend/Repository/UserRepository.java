package com.example.monpfebackend.Repository;

import com.example.monpfebackend.Entity.Groupe;
import com.example.monpfebackend.Entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<Utilisateur, Long> {

    // Trouver un utilisateur par son email
    Utilisateur findByEmail(String email);

    // Trouver un utilisateur par son ID
    Optional<Utilisateur> findById(Long id);

    // Trouver un utilisateur par son Rôle
    List<Utilisateur> findByRole(Utilisateur.Role role);
    
    // Trouver les utilisateurs par groupe et rôle
    List<Utilisateur> findByGroupeAndRole(Groupe groupe, Utilisateur.Role role);
    
    // Trouver les emails de toutes les personnes impliquées dans un ticket
    @Query("SELECT DISTINCT u.email FROM Utilisateur u WHERE " +
           "u.id = (SELECT t.createur.id FROM Ticket t WHERE t.id = :ticketId) OR " +
           "u.id = (SELECT t.intervenant.id FROM Ticket t WHERE t.id = :ticketId) OR " +
           "u.id IN (SELECT c.auteur.id FROM Commentaire c WHERE c.ticket.id = :ticketId)")
    List<String> findEmailsOfPeopleInvolvedInTicket(@Param("ticketId") Long ticketId);
} 